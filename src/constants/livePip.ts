/** 直播小窗：设置项、比例与首次提示文案 */

export type LivePipLeaveReason = 'exit' | 'navigate'

export type LivePipSettings = {
  /** 离开直播间（返回上一页或跳转其他页）自动开应用内小窗 */
  inAppAuto: boolean
  /** 切出 App 自动开应用外（系统画中画）小窗 */
  externalAuto: boolean
}

export type LivePipHintKind = 'external-return' | 'in-app-close'

export type LivePipRoomKind = 'live' | 'voice'

export type LivePipSession = {
  roomId: string
  hostName: string
  stage: string
  kind: LivePipRoomKind
  /** 规范化后的宽:高，如 16:9、4:3、9:16、1:1，后续可拓展任意比例 */
  ratio: string
  muted: boolean
  /** 语聊房：当前用户是否在麦上 */
  onMic: boolean
  /** 语聊房：麦克风是否开启 */
  micOn: boolean
  from: string
  query: Record<string, string>
}

export const LIVE_PIP_ASSETS = {
  mic: '/images/live-pip/icon-mic.svg',
  leaveMic: '/images/live-pip/icon-leave-mic.svg',
} as const

export const LIVE_PIP_VOICE_SIZE = 128

export const LIVE_PIP_SETTINGS_KEY = 'kkvibe.live-pip.settings'
export const LIVE_PIP_HINTS_KEY = 'kkvibe.live-pip.hints'

export const DEFAULT_LIVE_PIP_SETTINGS: LivePipSettings = {
  inAppAuto: true,
  externalAuto: true,
}

export const LIVE_PIP_SETTING_ITEMS: {
  key: keyof LivePipSettings
  title: string
  desc: string
}[] = [
  {
    key: 'inAppAuto',
    title: '离开直播间开小窗',
    desc: '返回上一页或进入其他页面时，用应用内小窗继续看',
  },
  {
    key: 'externalAuto',
    title: '切出应用开小窗',
    desc: '离开 App 后用系统画中画继续播，需先在系统设置开启「自动开启画中画」',
  },
]

export const LIVE_PIP_HINT_COPY: Record<LivePipHintKind, string> = {
  'external-return': '如果不喜欢应用外小窗播放，可以在「我的 - 设置」中关闭哦',
  'in-app-close': '如果不喜欢应用内小窗播放，可以在「我的 - 设置」中关闭哦',
}

const RATIO_RE = /^(\d+(?:\.\d+)?)\s*[:/xX]\s*(\d+(?:\.\d+)?)$/

/** 开播「原始」按竖屏 9:16 出小窗；其余按直播间实际比例，支持后续任意 宽:高 */
export function normalizeLivePipRatio(raw: string | undefined | null): string {
  const value = (raw || '').trim()
  if (!value || value === 'original') return '9:16'
  const matched = value.match(RATIO_RE)
  if (!matched) return '9:16'
  return `${trimRatioNum(matched[1])}:${trimRatioNum(matched[2])}`
}

function trimRatioNum(value: string) {
  const n = Number(value)
  return Number.isInteger(n) ? String(n) : String(n)
}

export function livePipAspectParts(ratio: string): { w: number; h: number } {
  const [w, h] = normalizeLivePipRatio(ratio).split(':').map(Number)
  if (!w || !h) return { w: 9, h: 16 }
  return { w, h }
}

/** 按比例适配小窗尺寸，竖屏限高、横屏限宽 */
export function livePipBoxSize(
  ratio: string,
  maxWidth = 176,
  maxHeight = 248,
): { width: number; height: number } {
  const { w, h } = livePipAspectParts(ratio)
  const aspect = w / h
  let width = maxWidth
  let height = width / aspect
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }
  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}

export function readLivePipSettings(): LivePipSettings {
  try {
    const raw = localStorage.getItem(LIVE_PIP_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_LIVE_PIP_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<LivePipSettings> & {
      exitAuto?: boolean
      navigateAuto?: boolean
    }
    return {
      inAppAuto: parsed.inAppAuto ?? Boolean((parsed.exitAuto ?? true) && (parsed.navigateAuto ?? true)),
      externalAuto: parsed.externalAuto ?? true,
    }
  } catch {
    return { ...DEFAULT_LIVE_PIP_SETTINGS }
  }
}

export function writeLivePipSettings(next: LivePipSettings) {
  localStorage.setItem(LIVE_PIP_SETTINGS_KEY, JSON.stringify(next))
}

const emptyLivePipHints = (): Record<LivePipHintKind, boolean> => ({
  'external-return': false,
  'in-app-close': false,
})

/** 本趟页面会话内记住，整页刷新后清空，方便反复演示关闭提示 */
let livePipHints = emptyLivePipHints()

try {
  localStorage.removeItem(LIVE_PIP_HINTS_KEY)
} catch {
  /* 旧本机记录清不掉也不挡演示 */
}

export function readLivePipHints(): Record<LivePipHintKind, boolean> {
  return { ...livePipHints }
}

export function buildLivePipSession(input: {
  roomId: string
  hostName: string
  stage: string
  kind?: LivePipRoomKind
  videoRatio?: string | null
  muted?: boolean
  onMic?: boolean
  micOn?: boolean
  from?: string
  query?: Record<string, string>
}): LivePipSession {
  const kind = input.kind || 'live'
  const query = { ...(input.query || {}) }
  return {
    roomId: input.roomId,
    hostName: input.hostName,
    stage: input.stage,
    kind,
    ratio: kind === 'voice' ? '1:1' : normalizeLivePipRatio(input.videoRatio),
    muted: Boolean(input.muted),
    onMic: Boolean(input.onMic),
    micOn: input.micOn !== false,
    from: input.from || '',
    query,
  }
}

export function markLivePipHintShown(kind: LivePipHintKind) {
  livePipHints = { ...livePipHints, [kind]: true }
}

export const LIVE_PIP_PAD_X = 12
export const LIVE_PIP_SAFE_Y = 12
export const LIVE_PIP_TABBAR_H = 56
export const LIVE_PIP_COLLAPSE_W = 32
export const LIVE_PIP_COLLAPSE_H = 68
/** 超出安全边再拖出这么多，松手收起 */
export const LIVE_PIP_COLLAPSE_PULL = 28
export const LIVE_PIP_DRAG_CLICK_SLOP = 6

export type LivePipPoint = { x: number; y: number }
export type LivePipCollapseSide = 'left' | 'right'

export function livePipBounds(
  shell: { w: number; h: number },
  box: { width: number; height: number },
  hasTabbar: boolean,
) {
  const minX = LIVE_PIP_PAD_X
  const minY = LIVE_PIP_SAFE_Y
  const maxX = Math.max(minX, shell.w - LIVE_PIP_PAD_X - box.width)
  const maxY = Math.max(minY, shell.h - LIVE_PIP_SAFE_Y - (hasTabbar ? LIVE_PIP_TABBAR_H : 0) - box.height)
  return { minX, minY, maxX, maxY }
}

/** 默认靠右、在可拖范围内上下居中 */
export function livePipDefaultPoint(
  shell: { w: number; h: number },
  box: { width: number; height: number },
  hasTabbar: boolean,
): LivePipPoint {
  const b = livePipBounds(shell, box, hasTabbar)
  return {
    x: b.maxX,
    y: Math.round((b.minY + b.maxY) / 2),
  }
}

export function livePipClampPoint(
  point: LivePipPoint,
  shell: { w: number; h: number },
  box: { width: number; height: number },
  hasTabbar: boolean,
): LivePipPoint {
  const b = livePipBounds(shell, box, hasTabbar)
  return {
    x: Math.min(b.maxX, Math.max(b.minX, point.x)),
    y: Math.min(b.maxY, Math.max(b.minY, point.y)),
  }
}

export function livePipCollapseSide(
  x: number,
  shell: { w: number; h: number },
  box: { width: number; height: number },
  hasTabbar: boolean,
): LivePipCollapseSide | null {
  const b = livePipBounds(shell, box, hasTabbar)
  if (x <= b.minX - LIVE_PIP_COLLAPSE_PULL) return 'left'
  if (x >= b.maxX + LIVE_PIP_COLLAPSE_PULL) return 'right'
  return null
}
