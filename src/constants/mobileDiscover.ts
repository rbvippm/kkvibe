/** 会话 · 发现页（社区-直播）Mock · Figma 515:63521 */

export type DiscoverMainTab = 'feed' | 'live' | 'short' | 'movie'
export type DiscoverLiveFilter = 'all' | 'talent' | 'game' | 'emotion' | 'chat'

export type DiscoverCategoryKey = 'game' | 'talent' | 'emotion' | 'tag'

export type DiscoverLiveCard = {
  id: string
  hostName: string
  roomTitle: string
  heat: string
  category: DiscoverCategoryKey
  categoryLabel: string
  tag: string
  cover: string
  /** 是否展示语聊房角标 */
  voiceRoom?: boolean
  /** 开播为 16:9/4:3（进房后由房间 videoRatio 决定，不再展示横屏角标） */
  landscape?: boolean
  filterKeys: DiscoverLiveFilter[]
}

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
  { key: 'live', label: '直播' },
  { key: 'short', label: '短视频' },
  { key: 'movie', label: '电影' },
]

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
    filterKeys: ['all', 'emotion'],
  },
]

export function filterDiscoverLiveCards(filter: DiscoverLiveFilter): DiscoverLiveCard[] {
  if (filter === 'all') return MOCK_DISCOVER_LIVE_CARDS
  return MOCK_DISCOVER_LIVE_CARDS.filter((card) => card.filterKeys.includes(filter))
}
