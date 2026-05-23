import { ref } from 'vue'

export type TopNoticeKind = 'live_start' | 'voice_mic_on'

/** 应用内顶部通知 payload（对接推送 / WebSocket 时映射） */
export type TopNoticePayload = {
  id: string
  kind: TopNoticeKind
  hostId: string
  hostName: string
  /** 头像占位：单字或 emoji */
  hostAvatar: string
  roomId: string
  roomTitle: string
  /** 仅 voice_mic_on：麦位序号（展示用） */
  micIndex?: number
}

/** @deprecated 使用 TopNoticePayload */
export type LiveStartNoticePayload = TopNoticePayload

const visible = ref(false)
const current = ref<TopNoticePayload | null>(null)
const queue = ref<TopNoticePayload[]>([])
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null

const defaultDurationMs = 6000

function clearAutoDismiss() {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer)
    autoDismissTimer = null
  }
}

function showNext() {
  if (queue.value.length === 0) {
    visible.value = false
    current.value = null
    return
  }
  current.value = queue.value.shift() ?? null
  visible.value = !!current.value
}

function dismissNotice() {
  clearAutoDismiss()
  showNext()
  if (current.value) {
    scheduleAutoDismiss(defaultDurationMs)
  }
}

function scheduleAutoDismiss(durationMs: number) {
  clearAutoDismiss()
  if (durationMs <= 0) return
  autoDismissTimer = setTimeout(() => dismissNotice(), durationMs)
}

function pushNotice(payload: TopNoticePayload, options?: { durationMs?: number }) {
  const durationMs = options?.durationMs ?? defaultDurationMs
  if (!visible.value && !current.value) {
    current.value = payload
    visible.value = true
    scheduleAutoDismiss(durationMs)
    return
  }
  queue.value.push(payload)
  if (!visible.value) {
    showNext()
    scheduleAutoDismiss(durationMs)
  }
}

function dismissAllNotices() {
  clearAutoDismiss()
  queue.value = []
  visible.value = false
  current.value = null
}

function enterRoomFromNotice() {
  // 原型：仅关闭浮层；正式环境按 kind 跳转直播/语音房
  dismissNotice()
}

/** 应用内全局顶部通知（单例状态） */
export function useLiveStartNotice() {
  return {
    visible,
    current,
    queue,
    push: pushNotice,
    dismiss: dismissNotice,
    dismissAll: dismissAllNotices,
    enterRoom: enterRoomFromNotice,
  }
}
