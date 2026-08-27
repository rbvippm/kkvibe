/** 会话 · 发现页（动态 / 短视频）Mock · Figma 515:63521 */

import { reactive } from 'vue'
import {
  GO_LIVE_HOST_NAME,
  GO_LIVE_SCHEDULE_OVERTIME_MIN,
  findGoLiveSchedule,
  goLiveScheduleStore,
  isGoLiveScheduleReserved,
  toggleGoLiveScheduleReserve,
  type GoLiveSchedule,
} from './goLive'

export type DiscoverMainTab = 'feed' | 'short' | 'movie'
export type DiscoverLiveFilter = 'all' | 'talent' | 'game' | 'emotion' | 'chat'

export type DiscoverCategoryKey = 'game' | 'talent' | 'emotion' | 'tag'

export type DiscoverLiveStatus = 'live' | 'preview'

/** 开播大类：视频 / 语聊房 / 投屏，对应开播页视频、语音、手机画面 */
export type DiscoverLiveMode = 'video' | 'voice' | 'screen'

export const DISCOVER_LIVE_MODE_LABEL: Record<DiscoverLiveMode, string> = {
  video: '视频直播',
  voice: '语聊房',
  screen: '投屏直播',
}

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
  /** 预告预约人数（主播场次以开播页数据为准） */
  subscriberCount?: number
  /** 开播大类；缺省时语聊房卡视为 voice，其余为 video */
  liveMode?: DiscoverLiveMode
  /** 是否展示语聊房角标 */
  voiceRoom?: boolean
  /** 开播为 16:9/4:3（进房后由房间 videoRatio 决定，不再展示横屏角标） */
  landscape?: boolean
  filterKeys: DiscoverLiveFilter[]
}

export function discoverLiveMode(card: DiscoverLiveCard): DiscoverLiveMode {
  if (card.liveMode) return card.liveMode
  if (card.voiceRoom) return 'voice'
  return 'video'
}

export function discoverLiveModeLabel(card: DiscoverLiveCard): string {
  return DISCOVER_LIVE_MODE_LABEL[discoverLiveMode(card)]
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
    liveMode: 'voice',
    voiceRoom: true,
    status: 'preview',
    startAt: PREVIEW_ANCHOR_MS + 2 * 60 * 60 * 1000 + 15 * 60 * 1000 + 3 * 1000,
    subscriberCount: 36,
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
    liveMode: 'video',
    status: 'preview',
    startAt: PREVIEW_ANCHOR_MS - 2 * 60 * 1000,
    subscriberCount: 18,
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
    liveMode: 'screen',
    status: 'preview',
    startAt: PREVIEW_ANCHOR_MS + 18 * 60 * 1000,
    subscriberCount: 24,
    filterKeys: ['all', 'emotion'],
  },
]

const HOST_SCHEDULE_OVERTIME_MS = GO_LIVE_SCHEDULE_OVERTIME_MIN * 60_000

const discoverPreviewReserveStore = reactive<{ ids: string[]; extra: Record<string, number> }>({
  ids: [],
  extra: {},
})

function scheduleCategoryMeta(category: string): Pick<
  DiscoverLiveCard,
  'category' | 'categoryLabel' | 'tag' | 'filterKeys'
> {
  if (category.includes('游戏')) {
    return { category: 'game', categoryLabel: '游戏', tag: category, filterKeys: ['all', 'game', 'chat'] }
  }
  if (category.includes('体育')) {
    return { category: 'tag', categoryLabel: '分类标签', tag: category, filterKeys: ['all', 'game'] }
  }
  return { category: 'talent', categoryLabel: '才艺', tag: category, filterKeys: ['all', 'talent'] }
}

export function mapGoLiveScheduleToDiscoverCard(item: GoLiveSchedule): DiscoverLiveCard {
  const live = item.status === 'live'
  return {
    id: item.id,
    hostName: GO_LIVE_HOST_NAME,
    roomTitle: item.title,
    heat: String(item.subscriberCount),
    cover: item.cover,
    ...scheduleCategoryMeta(item.category),
    status: live ? 'live' : 'preview',
    startAt: item.startAt,
    subscriberCount: item.subscriberCount,
    liveMode: item.mode,
    voiceRoom: item.mode === 'voice',
  }
}

function visibleHostScheduleCards(now: number): DiscoverLiveCard[] {
  return goLiveScheduleStore.items
    .filter((item) => {
      if (item.status === 'live') return true
      return item.status === 'pending' && now < item.startAt + HOST_SCHEDULE_OVERTIME_MS
    })
    .slice()
    .sort((a, b) => a.startAt - b.startAt)
    .map(mapGoLiveScheduleToDiscoverCard)
}

export function allDiscoverLiveCards(now = Date.now()): DiscoverLiveCard[] {
  const hostCards = visibleHostScheduleCards(now)
  const hostIds = new Set(hostCards.map((card) => card.id))
  return [...hostCards, ...MOCK_DISCOVER_LIVE_CARDS.filter((card) => !hostIds.has(card.id))]
}

export function isLivePreviewCard(card: DiscoverLiveCard): boolean {
  return card.status === 'preview' && typeof card.startAt === 'number'
}

export function isLivePreviewExpired(card: DiscoverLiveCard, now = Date.now()): boolean {
  const schedule = findGoLiveSchedule(card.id)
  if (schedule) {
    if (schedule.status === 'cancelled' || schedule.status === 'expired' || schedule.status === 'finished') {
      return true
    }
    if (schedule.status === 'live') return false
    return now >= schedule.startAt + HOST_SCHEDULE_OVERTIME_MS
  }
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
  const schedule = findGoLiveSchedule(id)
  if (schedule) {
    if (schedule.status === 'cancelled' || schedule.status === 'expired' || schedule.status === 'finished') {
      return undefined
    }
    return mapGoLiveScheduleToDiscoverCard(schedule)
  }
  return MOCK_DISCOVER_LIVE_CARDS.find((card) => card.id === id)
}

export function previewSubscriberCount(card: DiscoverLiveCard): number {
  const schedule = findGoLiveSchedule(card.id)
  if (schedule) return schedule.subscriberCount
  return Math.max(0, (card.subscriberCount ?? 0) + (discoverPreviewReserveStore.extra[card.id] ?? 0))
}

export function isDiscoverPreviewReserved(id: string): boolean {
  if (findGoLiveSchedule(id)) return isGoLiveScheduleReserved(id)
  return discoverPreviewReserveStore.ids.includes(id)
}

export function toggleDiscoverPreviewReserve(id: string): 'reserved' | 'cancelled' | 'missing' {
  if (findGoLiveSchedule(id)) return toggleGoLiveScheduleReserve(id)
  const card = MOCK_DISCOVER_LIVE_CARDS.find((item) => item.id === id)
  if (!card || card.status !== 'preview') return 'missing'
  const index = discoverPreviewReserveStore.ids.indexOf(id)
  if (index >= 0) {
    discoverPreviewReserveStore.ids.splice(index, 1)
    discoverPreviewReserveStore.extra[id] = (discoverPreviewReserveStore.extra[id] ?? 0) - 1
    return 'cancelled'
  }
  discoverPreviewReserveStore.ids.push(id)
  discoverPreviewReserveStore.extra[id] = (discoverPreviewReserveStore.extra[id] ?? 0) + 1
  return 'reserved'
}

export function filterDiscoverLiveCards(
  filter: DiscoverLiveFilter,
  now = Date.now(),
): DiscoverLiveCard[] {
  const source = allDiscoverLiveCards(now)
  const scoped = filter === 'all' ? source : source.filter((card) => card.filterKeys.includes(filter))
  return scoped.filter((card) => !isLivePreviewExpired(card, now))
}
