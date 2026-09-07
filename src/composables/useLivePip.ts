import { computed, reactive } from 'vue'
import {
  markLivePipHintShown,
  normalizeLivePipRatio,
  readLivePipHints,
  readLivePipSettings,
  writeLivePipSettings,
  type LivePipCollapseSide,
  type LivePipHintKind,
  type LivePipLeaveReason,
  type LivePipPoint,
  type LivePipSession,
  type LivePipSettings,
} from '../constants/livePip'
import { voiceSelfMicState } from '../constants/mobileVoiceRoom'

export type LivePipPlacement = 'hidden' | 'in-app' | 'external' | 'audio'

type LivePipState = {
  placement: LivePipPlacement
  session: LivePipSession | null
  settings: LivePipSettings
  hint: LivePipHintKind | null
  /** 图钉朝下：切出应用开画中画；斜着：切出只留声音 */
  pinned: boolean
  collapsed: boolean
  collapsedSide: LivePipCollapseSide
  pos: LivePipPoint | null
  openedAt: number
  /** 本轮离房已打开小窗，避免 onBeforeRouteLeave 重复触发 */
  leaveArmed: boolean
  pendingReason: LivePipLeaveReason | null
}

const state = reactive<LivePipState>({
  placement: 'hidden',
  session: null,
  settings: readLivePipSettings(),
  hint: null,
  pinned: false,
  collapsed: false,
  collapsedSide: 'right',
  pos: null,
  openedAt: 0,
  leaveArmed: false,
  pendingReason: null,
})

const VISIBILITY_GRACE_MS = 1200
const VISIBILITY_DEBOUNCE_MS = 600

let visibilityBound = false
let visibilityTimer = 0

function leaveAppInternal() {
  if (!state.session) return
  if (state.placement !== 'in-app') return
  if (Date.now() - state.openedAt < VISIBILITY_GRACE_MS) return
  state.collapsed = false
  if (state.pinned && state.settings.externalAuto) {
    state.placement = 'external'
    return
  }
  state.placement = 'audio'
}

function returnToAppInternal() {
  if (!state.session) return
  if (state.placement === 'external') {
    maybeShowHint('external-return')
    state.placement = 'in-app'
    state.openedAt = Date.now()
    return
  }
  if (state.placement === 'audio') {
    state.placement = 'in-app'
    state.openedAt = Date.now()
  }
}

function bindVisibility() {
  if (visibilityBound || typeof document === 'undefined') return
  visibilityBound = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      window.clearTimeout(visibilityTimer)
      visibilityTimer = window.setTimeout(() => {
        if (document.visibilityState === 'hidden') leaveAppInternal()
      }, VISIBILITY_DEBOUNCE_MS)
      return
    }
    window.clearTimeout(visibilityTimer)
    returnToAppInternal()
  })
}

function maybeShowHint(kind: LivePipHintKind) {
  if (readLivePipHints()[kind]) return
  state.hint = kind
}

export function useLivePip() {
  const visible = computed(() => state.placement !== 'hidden' && Boolean(state.session))
  const isExternal = computed(() => state.placement === 'external')

  function persistSettings() {
    writeLivePipSettings({ ...state.settings })
  }

  function setSetting<K extends keyof LivePipSettings>(key: K, value: LivePipSettings[K]) {
    state.settings[key] = value
    persistSettings()
  }

  function replaceSession(session: LivePipSession) {
    state.session = {
      ...session,
      ratio: normalizeLivePipRatio(session.ratio),
    }
  }

  function resetWindowChrome() {
    state.pinned = false
    state.collapsed = false
    state.collapsedSide = 'right'
    state.pos = null
  }

  function openInApp(session: LivePipSession) {
    const sameRoom = state.session?.roomId === session.roomId
    replaceSession(session)
    state.placement = 'in-app'
    state.openedAt = Date.now()
    if (!sameRoom) resetWindowChrome()
    bindVisibility()
  }

  function openIfAllowed(reason: LivePipLeaveReason, session: LivePipSession) {
    const allow = state.settings.inAppAuto
    state.leaveArmed = true
    if (!allow) return false
    openInApp(session)
    return true
  }

  function togglePin() {
    if (!state.session) return false
    state.pinned = !state.pinned
    return state.pinned
  }

  function setPos(point: LivePipPoint | null) {
    state.pos = point
  }

  function collapseTo(side: LivePipCollapseSide) {
    state.collapsed = true
    state.collapsedSide = side
  }

  function expandFromDock() {
    state.collapsed = false
  }

  function hide() {
    state.placement = 'hidden'
    state.session = null
    state.leaveArmed = false
    resetWindowChrome()
  }

  function toggleMute() {
    if (!state.session) return
    state.session.muted = !state.session.muted
  }

  function toggleMicOn() {
    if (!state.session || !state.session.onMic) return
    state.session.micOn = !state.session.micOn
    voiceSelfMicState.micOn = state.session.micOn
  }

  function leaveMic() {
    if (!state.session) return
    state.session.onMic = false
    state.session.micOn = false
    voiceSelfMicState.onMic = false
    voiceSelfMicState.micOn = false
  }

  function closeInApp() {
    maybeShowHint('in-app-close')
    hide()
  }

  function returnFromExternal() {
    maybeShowHint('external-return')
    hide()
  }

  function dismissHint() {
    if (state.hint) markLivePipHintShown(state.hint)
    state.hint = null
  }

  function armLeave(reason: LivePipLeaveReason) {
    state.pendingReason = reason
  }

  function takePendingReason(): LivePipLeaveReason {
    const reason = state.pendingReason ?? 'navigate'
    state.pendingReason = null
    return reason
  }

  function resetLeaveArmed() {
    state.leaveArmed = false
  }

  function consumeLeaveArmed() {
    const armed = state.leaveArmed
    state.leaveArmed = false
    return armed
  }

  function hideIfWatchingLive() {
    if (state.placement === 'in-app' || state.placement === 'audio') hide()
  }

  return {
    state,
    visible,
    isExternal,
    setSetting,
    openIfAllowed,
    openInApp,
    togglePin,
    setPos,
    collapseTo,
    expandFromDock,
    hide,
    toggleMute,
    toggleMicOn,
    leaveMic,
    closeInApp,
    returnFromExternal,
    dismissHint,
    consumeLeaveArmed,
    resetLeaveArmed,
    hideIfWatchingLive,
    armLeave,
    takePendingReason,
  }
}
