import { computed, ref } from 'vue'
import {
  CHAT_GAME_DOCK,
  CHAT_GAME_PIP,
  CHAT_GAME_PIP_SIZE_ORDER,
  type ChatGamePipSize,
} from '../constants/mobileChatGroupGame'
import type { LobbyGamePlay } from '../constants/mobileLobby'

export type MiniAppGameKind = LobbyGamePlay['kind']
export type MiniAppGameMode = 'full' | 'dock' | 'pip'

type StageDrag = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  dx: number
  dy: number
  moved: boolean
}

type StagePinch = {
  startDist: number
  lastScale: number
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

const gameName = ref('')
const gameKind = ref<MiniAppGameKind>('sports')
const mode = ref<MiniAppGameMode>('full')
const showMenu = ref(false)
const toast = ref('')
const homeDismiss = ref<{ t: number; roomH: number } | null>(null)
const pipPos = ref<{ x: number; y: number } | null>(null)
const pipSize = ref<ChatGamePipSize>('small')
const pipSpringing = ref(false)
const stageDrag = ref<StageDrag | null>(null)
const stagePinch = ref<StagePinch | null>(null)
const stageShift = ref<{ x: number; y: number; scale: number; radius: number } | null>(null)
const stagePointers = new Map<number, { x: number; y: number }>()
let pinchConsumed = false
let homeDismissRaf = 0
let toastTimer = 0
let pipSpringTimer = 0

const blocking = computed(
  () => Boolean(gameName.value) && mode.value === 'full' && !homeDismiss.value,
)
const dockOpen = computed(() => mode.value === 'dock' || Boolean(homeDismiss.value))
const dockSlotH = computed(() => {
  const dismiss = homeDismiss.value
  if (mode.value === 'dock') return CHAT_GAME_DOCK.slot
  if (!dismiss) return 0
  return Math.round(CHAT_GAME_DOCK.slot * easeInOutCubic(dismiss.t))
})

function shellBox() {
  const shell = document.getElementById('mh5-app-shell')
  return { w: shell?.clientWidth || 375, h: shell?.clientHeight || 812 }
}

function pipBox(size: ChatGamePipSize = pipSize.value) {
  const { w, h } = shellBox()
  const aspect = CHAT_GAME_PIP.width / CHAT_GAME_PIP.height
  const targetDiag = Math.hypot(w, h) * CHAT_GAME_PIP.ratios[size]
  const height = targetDiag / Math.sqrt(aspect * aspect + 1)
  return {
    width: Math.round(height * aspect),
    height: Math.round(height),
  }
}

function clampPipPos(x: number, y: number, size: ChatGamePipSize = pipSize.value) {
  const { w, h } = shellBox()
  const box = pipBox(size)
  return {
    x: Math.min(Math.max(CHAT_GAME_PIP.margin, w - box.width - CHAT_GAME_PIP.margin), Math.max(CHAT_GAME_PIP.margin, x)),
    y: Math.min(Math.max(56, h - box.height - CHAT_GAME_PIP.margin), Math.max(56, y)),
  }
}

function defaultPipPos(size: ChatGamePipSize = pipSize.value) {
  const { w } = shellBox()
  const box = pipBox(size)
  return clampPipPos(w - CHAT_GAME_PIP.defaultRight - box.width, CHAT_GAME_PIP.defaultTop, size)
}

function ensurePipPos() {
  pipPos.value = clampPipPos(pipPos.value?.x ?? defaultPipPos().x, pipPos.value?.y ?? defaultPipPos().y)
  return pipPos.value
}

function resetStageMotion() {
  stageDrag.value = null
  stagePinch.value = null
  stageShift.value = null
  stagePointers.clear()
  pinchConsumed = false
}

function triggerPipSpring() {
  pipSpringing.value = true
  window.clearTimeout(pipSpringTimer)
  pipSpringTimer = window.setTimeout(() => {
    pipSpringing.value = false
  }, CHAT_GAME_PIP.springMs)
}

function adjacentPipSize(size: ChatGamePipSize, step: -1 | 1): ChatGamePipSize {
  const index = CHAT_GAME_PIP_SIZE_ORDER.indexOf(size)
  return CHAT_GAME_PIP_SIZE_ORDER[Math.min(CHAT_GAME_PIP_SIZE_ORDER.length - 1, Math.max(0, index + step))]
}

function pruneStagePointers(keep = 2) {
  if (stagePointers.size <= keep) return
  const extra = [...stagePointers.keys()].slice(0, stagePointers.size - keep)
  extra.forEach((id) => stagePointers.delete(id))
}

function pointerDistance() {
  pruneStagePointers()
  const pts = [...stagePointers.values()]
  if (pts.length < 2) return 0
  return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
}

function dockPipToStart(size: ChatGamePipSize = pipSize.value) {
  pipPos.value = defaultPipPos(size)
  triggerPipSpring()
}

function applyPipSize(next: ChatGamePipSize, dock = false) {
  if (next === pipSize.value) {
    if (dock) dockPipToStart(next)
    return
  }
  const current = pipBox()
  const pos = pipPos.value ?? defaultPipPos()
  pipSize.value = next
  if (dock) {
    dockPipToStart(next)
    return
  }
  const nextBox = pipBox(next)
  pipPos.value = clampPipPos(pos.x + current.width / 2 - nextBox.width / 2, pos.y + current.height / 2 - nextBox.height / 2, next)
  triggerPipSpring()
}

function snapPipByScale(scale: number) {
  if (!Number.isFinite(scale) || scale <= 0) return
  const step = CHAT_GAME_PIP.pinchStep
  if (scale >= step) applyPipSize(adjacentPipSize(pipSize.value, 1))
  else if (scale <= 1 / step) applyPipSize(adjacentPipSize(pipSize.value, -1))
}

function captureStagePointers(el: EventTarget | null) {
  const node = el as HTMLElement | null
  if (!node?.setPointerCapture) return
  stagePointers.forEach((_, id) => {
    try {
      node.setPointerCapture(id)
    } catch {
      /* 非受信指针可能拿不到 capture */
    }
  })
}

function beginStagePinch(el?: EventTarget | null) {
  const dist = pointerDistance()
  if (dist < 8) return
  stageDrag.value = null
  stageShift.value = null
  pinchConsumed = true
  stagePinch.value = { startDist: dist, lastScale: 1 }
  captureStagePointers(el ?? null)
}

function finishStagePinch() {
  const pinch = stagePinch.value
  stagePinch.value = null
  if (!pinch) {
    dockPipToStart()
    return
  }
  snapPipByScale(pinch.lastScale)
  dockPipToStart()
}

const stageStyle = computed(() => {
  const dismiss = homeDismiss.value
  if (dismiss && mode.value === 'full') {
    const t = easeInOutCubic(dismiss.t)
    const endH = CHAT_GAME_DOCK.height
    const h = dismiss.roomH * (1 - t) + endH * t
    const inset = CHAT_GAME_DOCK.inset * t
    return {
      top: `${dismiss.roomH - h}px`,
      height: `${h}px`,
      left: `${inset}px`,
      right: `${inset}px`,
      width: 'auto',
      borderRadius: `${16 * t}px ${16 * t}px 0 0`,
    }
  }
  const shift = stageShift.value
  if (mode.value === 'full') {
    if (!shift) return undefined
    return {
      transform: `translate(${shift.x}px, ${shift.y}px) scale(${shift.scale})`,
      borderRadius: `${shift.radius}px`,
    }
  }
  if (mode.value !== 'pip') return undefined
  const box = pipBox()
  const pos = pipPos.value ?? defaultPipPos()
  const drag = stageDrag.value
  return {
    left: `${pos.x + (drag ? drag.dx : 0)}px`,
    top: `${pos.y + (drag ? drag.dy : 0)}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    aspectRatio: `${CHAT_GAME_PIP.width} / ${CHAT_GAME_PIP.height}`,
  }
})

function showToast(message: string) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1600)
}

function stopHomeDismiss() {
  if (homeDismissRaf) {
    cancelAnimationFrame(homeDismissRaf)
    homeDismissRaf = 0
  }
  homeDismiss.value = null
}

function open(name: string, kind: MiniAppGameKind = 'sports') {
  stopHomeDismiss()
  resetStageMotion()
  gameName.value = name
  gameKind.value = kind
  mode.value = 'full'
  showMenu.value = false
}

function close() {
  stopHomeDismiss()
  resetStageMotion()
  gameName.value = ''
  mode.value = 'full'
  showMenu.value = false
  toast.value = ''
  pipPos.value = null
  pipSize.value = 'small'
  pipSpringing.value = false
  window.clearTimeout(pipSpringTimer)
}

function dismissToHome(roomH: number) {
  if (!gameName.value || mode.value !== 'full' || homeDismiss.value) return
  showMenu.value = false
  resetStageMotion()
  homeDismiss.value = { t: 0, roomH }
  const duration = CHAT_GAME_PIP.homeDismissMs
  const t0 = performance.now()
  const tick = (now: number) => {
    const raw = Math.min(1, (now - t0) / duration)
    homeDismiss.value = { t: raw, roomH }
    if (raw < 1) {
      homeDismissRaf = requestAnimationFrame(tick)
      return
    }
    homeDismissRaf = 0
    homeDismiss.value = null
    mode.value = 'dock'
    showMenu.value = false
  }
  homeDismissRaf = requestAnimationFrame(tick)
}

function expandFromDock() {
  if (!gameName.value) return
  stopHomeDismiss()
  resetStageMotion()
  mode.value = 'full'
  showMenu.value = false
}

function collapseToPip() {
  if (!gameName.value || homeDismiss.value) return
  showMenu.value = false
  resetStageMotion()
  pipSize.value = 'small'
  pipSpringing.value = false
  window.clearTimeout(pipSpringTimer)
  pipPos.value = defaultPipPos('small')
  mode.value = 'pip'
}

function expandFromPip() {
  if (!gameName.value) return
  stopHomeDismiss()
  showMenu.value = false
  resetStageMotion()
  mode.value = 'full'
}

function isStageControl(target: EventTarget | null) {
  return Boolean(
    (target as HTMLElement | null)?.closest?.(
      '.mh5-vip-sports-header__drop, .mh5-chat-game-menu, .mh5-chat-game-full__msg, .mh5-chat-game-stage__close, .mh5-vip-sports-page',
    ),
  )
}

function onStagePointerDown(ev: PointerEvent) {
  if (ev.button !== 0) return
  if (isStageControl(ev.target)) return
  if (mode.value !== 'full' && mode.value !== 'pip') return
  if (!stagePinch.value && !stageDrag.value) {
    stagePointers.clear()
    pinchConsumed = false
  }
  stagePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
  pruneStagePointers()
  if (mode.value === 'pip' && stagePointers.size >= 2) {
    beginStagePinch(ev.currentTarget)
    ev.preventDefault()
    return
  }
  if (pinchConsumed) return
  const pos = ensurePipPos()
  stageDrag.value = {
    pointerId: ev.pointerId,
    startX: ev.clientX,
    startY: ev.clientY,
    originX: pos.x,
    originY: pos.y,
    dx: 0,
    dy: 0,
    moved: false,
  }
  stageShift.value = null
  try {
    ;(ev.currentTarget as HTMLElement | null)?.setPointerCapture?.(ev.pointerId)
  } catch {
    /* 预览合成事件或非受信指针可能拿不到 capture */
  }
}

function onStagePointerMove(ev: PointerEvent) {
  if (stagePointers.has(ev.pointerId)) {
    stagePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
  }
  if (mode.value === 'pip' && !stagePinch.value && stagePointers.size >= 2) {
    beginStagePinch(ev.currentTarget)
  }
  const pinch = stagePinch.value
  if (pinch && stagePointers.size >= 2) {
    const dist = pointerDistance()
    const scale = dist / pinch.startDist
    pinch.lastScale = scale
    if (scale >= CHAT_GAME_PIP.pinchStep || scale <= 1 / CHAT_GAME_PIP.pinchStep) {
      snapPipByScale(scale)
      pinch.startDist = dist
      pinch.lastScale = 1
    }
    ev.preventDefault()
    return
  }
  const drag = stageDrag.value
  if (!drag || drag.pointerId !== ev.pointerId) return
  const dx = ev.clientX - drag.startX
  const dy = ev.clientY - drag.startY
  drag.dx = dx
  drag.dy = dy
  drag.moved = drag.moved || Math.abs(dx) > CHAT_GAME_PIP.clickSlop || Math.abs(dy) > CHAT_GAME_PIP.clickSlop
  if (mode.value === 'full') {
    const pull = Math.max(0, dy)
    const p = Math.min(1, pull / 260)
    stageShift.value = {
      x: dx * 0.06,
      y: pull * 0.38,
      scale: 1 - p * 0.14,
      radius: 8 + p * 16,
    }
    return
  }
  stageShift.value = null
}

function onStagePointerUp(ev: PointerEvent) {
  stagePointers.delete(ev.pointerId)
  if (stagePinch.value) {
    if (stagePointers.size < 2) finishStagePinch()
    if (stagePointers.size === 0) pinchConsumed = false
    ev.preventDefault()
    return
  }
  if (pinchConsumed) {
    if (stagePointers.size === 0) pinchConsumed = false
    stageDrag.value = null
    return
  }
  const drag = stageDrag.value
  if (!drag || drag.pointerId !== ev.pointerId) return
  const { dx, dy, moved, originX, originY } = drag
  stageDrag.value = null
  stageShift.value = null
  try {
    ;(ev.currentTarget as HTMLElement | null)?.releasePointerCapture?.(ev.pointerId)
  } catch {
    /* already released */
  }
  if (mode.value === 'full') {
    if (dy >= CHAT_GAME_PIP.collapseDy) collapseToPip()
    return
  }
  if (mode.value !== 'pip') return
  if (!moved) {
    expandFromPip()
    return
  }
  if (dy <= CHAT_GAME_PIP.expandDy && Math.abs(dx) < 90) {
    expandFromPip()
    return
  }
  pipPos.value = clampPipPos(originX + dx, originY + dy)
}

function onStageWheel(ev: WheelEvent) {
  if (mode.value !== 'pip') return
  if (!ev.ctrlKey && !ev.metaKey) return
  ev.preventDefault()
  ev.stopPropagation()
  snapPipByScale(ev.deltaY < 0 ? CHAT_GAME_PIP.pinchStep : 1 / CHAT_GAME_PIP.pinchStep)
  dockPipToStart()
}

/** 离开当前页时直接落到全局底条，避免收起动画被路由卸载打断 */
function openDock(name: string, kind: MiniAppGameKind = 'sports') {
  stopHomeDismiss()
  resetStageMotion()
  gameName.value = name
  gameKind.value = kind
  mode.value = 'dock'
  showMenu.value = false
}

export function useMiniAppGame() {
  return {
    gameName,
    gameKind,
    mode,
    showMenu,
    toast,
    homeDismiss,
    blocking,
    dockOpen,
    dockSlotH,
    stageStyle,
    stageDrag,
    stagePinch,
    pipSize,
    pipSpringing,
    showToast,
    open,
    openDock,
    close,
    dismissToHome,
    expandFromDock,
    collapseToPip,
    expandFromPip,
    onStagePointerDown,
    onStagePointerMove,
    onStagePointerUp,
    onStageWheel,
  }
}
