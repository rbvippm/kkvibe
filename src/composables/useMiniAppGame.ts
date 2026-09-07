import { computed, ref } from 'vue'
import { CHAT_GAME_DOCK, CHAT_GAME_PIP } from '../constants/mobileChatGroupGame'
import type { LobbyGamePlay } from '../constants/mobileLobby'

export type MiniAppGameKind = LobbyGamePlay['kind']
export type MiniAppGameMode = 'full' | 'dock'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

const gameName = ref('')
const gameKind = ref<MiniAppGameKind>('sports')
const mode = ref<MiniAppGameMode>('full')
const showMenu = ref(false)
const toast = ref('')
const homeDismiss = ref<{ t: number; roomH: number } | null>(null)
let homeDismissRaf = 0
let toastTimer = 0

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

const stageStyle = computed(() => {
  const dismiss = homeDismiss.value
  if (!dismiss || mode.value !== 'full') return undefined
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
  gameName.value = name
  gameKind.value = kind
  mode.value = 'full'
  showMenu.value = false
}

function close() {
  stopHomeDismiss()
  gameName.value = ''
  mode.value = 'full'
  showMenu.value = false
  toast.value = ''
}

function dismissToHome(roomH: number) {
  if (!gameName.value || mode.value !== 'full' || homeDismiss.value) return
  showMenu.value = false
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
  mode.value = 'full'
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
    showToast,
    open,
    close,
    dismissToHome,
    expandFromDock,
  }
}
