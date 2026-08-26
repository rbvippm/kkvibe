/** 会话 · 发现页（动态 / 短视频）Mock · Figma 515:63521 */

export type DiscoverMainTab = 'feed' | 'short' | 'movie'
export type DiscoverLiveFilter = 'all' | 'talent' | 'game' | 'emotion' | 'chat'

export type DiscoverCategoryKey = 'game' | 'talent' | 'emotion' | 'tag'

export type DiscoverLiveStatus = 'live' | 'preview'

export type DiscoverLiveCard = {
  id: string
  hostName: string
  roomTitle: string
  heat: string
  category: DiscoverCategoryKey
  categoryLabel: string
  tag: string
  cover: string
  /** 直播中 / 预告；缺省视为直播中 */
  status?: DiscoverLiveStatus
  /** 预告开播时间（毫秒时间戳） */
  startAt?: number
  /** 是否展示语聊房角标 */
  voiceRoom?: boolean
  /** 开播为 16:9/4:3（进房后由房间 videoRatio 决定，不再展示横屏角标） */
  landscape?: boolean
  filterKeys: DiscoverLiveFilter[]
}

/** 预告开播后主播迟到超过此时长，从直播列表移除 */
export const LIVE_PREVIEW_LATE_LIMIT_MS = 15 * 60 * 1000

const PREVIEW_ANCHOR_MS = Date.now()

export const DISCOVER_ASSETS = {
  cover: '/images/discover/cover.png',
  covers: [
    '/images/discover/cover-1.jpg',
    '/images/discover/cover-2.jpg',
    '/images/discover/cover-3.jpg',
    '/images/discover/cover-4.jpg',
    '/images/discover/cover-5.jpg',
    '/images/discover/cover-6.jpg',
  ] as const,
  bannerBg: '/images/discover/banner-bg.jpg',
  bannerPerson: '/images/discover/banner-person.png',
  micDeco: '/images/discover/mic-deco.png',
  fire: '/images/discover/icon-fire.svg',
  game: '/images/discover/icon-game.svg',
  talent: '/images/discover/icon-talent.svg',
  love: '/images/discover/icon-love.svg',
  tag: '/images/discover/icon-tag.svg',
  mic: '/images/discover/icon-mic.svg',
  voiceBadge: '/images/discover/badge-voice.svg',
  layer: '/images/discover/icon-layer.svg',
  menu: '/images/discover/icon-menu.svg',
  search: '/images/discover/icon-search.svg',
} as const

export const DISCOVER_MAIN_TABS: { key: DiscoverMainTab; label: string }[] = [
  { key: 'feed', label: '动态' },
  { key: 'short', label: '短视频' },
  { key: 'movie', label: '电影' },
]

/** 直播列表已迁到社区末位 Tab；房间返回按来源回社区 */
export function liveListRouteName(from?: string) {
  try {
    sessionStorage.setItem('mh5-community-main-tab', 'live')
  } catch {
    /* ignore */
  }
  if (from === 'vip-club-community') return 'mobile-vip-club-community'
  return 'mobile-community'
}

export const DISCOVER_LIVE_FILTERS: { key: DiscoverLiveFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'talent', label: '才艺' },
  { key: 'game', label: '游戏' },
  { key: 'emotion', label: '情感' },
  { key: 'chat', label: '聊天' },
]

export const DISCOVER_CATEGORY_ICON: Record<DiscoverCategoryKey, string> = {
  game: DISCOVER_ASSETS.game,
  talent: DISCOVER_ASSETS.talent,
  emotion: DISCOVER_ASSETS.love,
  tag: DISCOVER_ASSETS.tag,
}

export const MOCK_DISCOVER_LIVE_CARDS: DiscoverLiveCard[] = [
  {
    id: 'ls-land-game',
    hostName: '小鹿开黑',
    roomTitle: '今晚连麦冲分局，缺一等你',
    heat: '1.2W',
    category: 'game',
    categoryLabel: '游戏',
    tag: '彩票丨香港六合彩',
    cover: DISCOVER_ASSETS.covers[0],
    landscape: true,
    filterKeys: ['all', 'game'],
  },
  {
    id: 'd2',
    hostName: '晚风吉他',
    roomTitle: '民谣点歌房 · 想听哪首告诉我',
    heat: '8.6K',
    category: 'talent',
    categoryLabel: '才艺',
    tag: '直播一姐',
    cover: DISCOVER_ASSETS.covers[1],
    voiceRoom: true,
    status: 'preview',
    startAt: PREVIEW_ANCHOR_MS + 2 * 60 * 60 * 1000 + 15 * 60 * 1000 + 3 * 1000,
    filterKeys: ['all', 'talent', 'chat'],
  },
  {
    id: 'ls-land-esport',
    hostName: '阿哲解说',
    roomTitle: '新服首发攻略，边看边玩',
    heat: '3.4W',
    category: 'tag',
    categoryLabel: '分类标签',
    tag: '游戏分类丨游戏名称',
    cover: DISCOVER_ASSETS.covers[2],
    landscape: true,
    filterKeys: ['all', 'game'],
  },
  {
    id: 'd4',
    hostName: '知心南南',
    roomTitle: '深夜树洞 · 有事慢慢聊',
    heat: '5.1K',
    category: 'emotion',
    categoryLabel: '情感',
    tag: '知心姐姐',
    cover: DISCOVER_ASSETS.covers[3],
    status: 'preview',
    startAt: PREVIEW_ANCHOR_MS - 2 * 60 * 1000,
    filterKeys: ['all', 'emotion', 'chat'],
  },
  {
    id: 'ls-land-outdoor',
    hostName: '芒果开播',
    roomTitle: '休闲小游戏上分，轻松局',
    heat: '9.8K',
    category: 'tag',
    categoryLabel: '分类标签',
    tag: '游戏分类丨游戏名称',
    cover: DISCOVER_ASSETS.covers[4],
    landscape: true,
    filterKeys: ['all', 'game'],
  },
  {
    id: 'ls-land-music',
    hostName: '暖心可可',
    roomTitle: '情绪电台 · 陪你熬过这夜',
    heat: '2.0W',
    category: 'emotion',
    categoryLabel: '情感',
    tag: '知心姐姐',
    cover: DISCOVER_ASSETS.covers[5],
    landscape: true,
    status: 'preview',
    startAt: PREVIEW_ANCHOR_MS + 18 * 60 * 1000,
    filterKeys: ['all', 'emotion'],
  },
]

export function isLivePreviewCard(card: DiscoverLiveCard): boolean {
  return card.status === 'preview' && typeof card.startAt === 'number'
}

export function isLivePreviewExpired(card: DiscoverLiveCard, now = Date.now()): boolean {
  if (!isLivePreviewCard(card) || card.startAt == null) return false
  return now >= card.startAt + LIVE_PREVIEW_LATE_LIMIT_MS
}

export function isLivePreviewLate(card: DiscoverLiveCard, now = Date.now()): boolean {
  if (!isLivePreviewCard(card) || card.startAt == null) return false
  return now >= card.startAt && !isLivePreviewExpired(card, now)
}

export function livePreviewRemainMs(card: DiscoverLiveCard, now = Date.now()): number {
  if (!isLivePreviewCard(card) || card.startAt == null) return 0
  return Math.max(0, card.startAt - now)
}

export function formatLivePreviewClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatLivePreviewStartAt(ts: number): string {
  const date = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function getDiscoverLiveCardById(id: string): DiscoverLiveCard | undefined {
  return MOCK_DISCOVER_LIVE_CARDS.find((card) => card.id === id)
}

export function filterDiscoverLiveCards(
  filter: DiscoverLiveFilter,
  now = Date.now(),
): DiscoverLiveCard[] {
  const source =
    filter === 'all'
      ? MOCK_DISCOVER_LIVE_CARDS
      : MOCK_DISCOVER_LIVE_CARDS.filter((card) => card.filterKeys.includes(filter))
  return source.filter((card) => !isLivePreviewExpired(card, now))
}
