/** 直播管理 · 直播列表 Mock */

import { DISCOVER_ASSETS } from './mobileDiscover'

export type LiveBroadcastMode = 'video' | 'voice' | 'screen'
export type LiveBroadcastStatus = 'live' | 'preview'
export type LiveBroadcastViewMode = 'list' | 'card'

export type LiveBroadcastMetricPair = {
  base: number
  actual: number
}

export type LiveBroadcastMetrics = {
  people: LiveBroadcastMetricPair
  appointment: LiveBroadcastMetricPair
  heat: LiveBroadcastMetricPair
  like: LiveBroadcastMetricPair
}

export type LiveBroadcastRow = {
  roomId: string
  mode: LiveBroadcastMode
  hostName: string
  hostId: string
  gameModule: string
  gameName: string
  category: string
  status: LiveBroadcastStatus
  metrics: LiveBroadcastMetrics
  cover: string
}

export const LIVE_BROADCAST_METRIC_COLUMNS = [
  { key: 'people', label: '人数' },
  { key: 'appointment', label: '预约' },
  { key: 'heat', label: '热度' },
  { key: 'like', label: '点赞' },
] as const

function metricPair(base: number, actual: number): LiveBroadcastMetricPair {
  return { base, actual }
}

function metrics(
  people: readonly [number, number],
  appointment: readonly [number, number],
  heat: readonly [number, number],
  like: readonly [number, number],
): LiveBroadcastMetrics {
  return {
    people: metricPair(people[0], people[1]),
    appointment: metricPair(appointment[0], appointment[1]),
    heat: metricPair(heat[0], heat[1]),
    like: metricPair(like[0], like[1]),
  }
}

export const LIVE_BROADCAST_MODE_OPTIONS: { value: LiveBroadcastMode; label: string }[] = [
  { value: 'video', label: '视频直播' },
  { value: 'voice', label: '语聊房' },
  { value: 'screen', label: '投屏直播' },
]

export const LIVE_BROADCAST_CATEGORY_OPTIONS = ['才艺', '游戏', '情感', '聊天'] as const

export const LIVE_BROADCAST_STATUS_OPTIONS: { value: LiveBroadcastStatus; label: string }[] = [
  { value: 'live', label: '正在直播' },
  { value: 'preview', label: '直播预告' },
]

export const LIVE_BROADCAST_PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export const LIVE_BROADCAST_MODE_LABEL: Record<LiveBroadcastMode, string> = {
  video: '视频直播',
  voice: '语聊房',
  screen: '投屏直播',
}

export const LIVE_BROADCAST_STATUS_LABEL: Record<LiveBroadcastStatus, string> = {
  live: '正在直播',
  preview: '直播预告',
}

const covers = DISCOVER_ASSETS.covers

export const LIVE_BROADCAST_ROWS: LiveBroadcastRow[] = [
  {
    roomId: '200482544305901568',
    mode: 'video',
    hostName: '小夜不困',
    hostId: '10086001',
    gameModule: 'STG-真人',
    gameName: 'AG真人·KK',
    category: '游戏',
    status: 'live',
    metrics: metrics([280, 346], [60, 78], [1200, 12860], [180, 412]),
    cover: covers[0],
  },
  {
    roomId: '200482544305901601',
    mode: 'video',
    hostName: '星河主播',
    hostId: '10086012',
    gameModule: 'STG-老虎机',
    gameName: 'BBIN老虎机',
    category: '游戏',
    status: 'live',
    metrics: metrics([100, 168], [20, 31], [500, 8640], [50, 96]),
    cover: covers[1],
  },
  {
    roomId: '200482544305901640',
    mode: 'screen',
    hostName: '好运来了',
    hostId: '10086047',
    gameModule: 'STG-现金游戏',
    gameName: '区块链星舰',
    category: '游戏',
    status: 'live',
    metrics: metrics([100, 214], [20, 44], [500, 15220], [50, 188]),
    cover: covers[2],
  },
  {
    roomId: '200482544305901671',
    mode: 'voice',
    hostName: '晚风吉他',
    hostId: '10086071',
    gameModule: '',
    gameName: '',
    category: '才艺',
    status: 'live',
    metrics: metrics([80, 126], [16, 22], [400, 5320], [36, 70]),
    cover: covers[3],
  },
  {
    roomId: '200482544305901688',
    mode: 'video',
    hostName: '小鹿开黑',
    hostId: '10086088',
    gameModule: 'STG-现金游戏',
    gameName: 'Pilot',
    category: '游戏',
    status: 'live',
    metrics: metrics([120, 286], [24, 51], [600, 20340], [60, 240]),
    cover: covers[4],
  },
  {
    roomId: '200482544305901702',
    mode: 'video',
    hostName: '阿哲解说',
    hostId: '10086102',
    gameModule: '旧平台游戏',
    gameName: '刮刮乐半屏',
    category: '游戏',
    status: 'preview',
    metrics: metrics([90, 154], [18, 29], [450, 9760], [42, 88]),
    cover: covers[5],
  },
  {
    roomId: '200482544305901715',
    mode: 'video',
    hostName: '知心南南',
    hostId: '10086115',
    gameModule: '',
    gameName: '',
    category: '情感',
    status: 'preview',
    metrics: metrics([70, 98], [14, 19], [360, 4180], [28, 46]),
    cover: covers[0],
  },
  {
    roomId: '200482544305901728',
    mode: 'screen',
    hostName: '暖心可可',
    hostId: '10086128',
    gameModule: '',
    gameName: '',
    category: '情感',
    status: 'preview',
    metrics: metrics([85, 132], [17, 26], [420, 6890], [34, 62]),
    cover: covers[1],
  },
  {
    roomId: '200482544305901741',
    mode: 'voice',
    hostName: '清酒微醺',
    hostId: '10086059',
    gameModule: '',
    gameName: '',
    category: '聊天',
    status: 'preview',
    metrics: metrics([160, 188], [36, 41], [860, 2750], [90, 104]),
    cover: covers[2],
  },
  {
    roomId: '200482544305901754',
    mode: 'video',
    hostName: '芒果开播',
    hostId: '10086154',
    gameModule: 'STG-真人',
    gameName: 'AG(PA)真人 转账',
    category: '聊天',
    status: 'live',
    metrics: metrics([110, 176], [22, 35], [520, 11320], [48, 102]),
    cover: covers[3],
  },
  {
    roomId: '200482544305901767',
    mode: 'voice',
    hostName: '小红来了',
    hostId: '10086167',
    gameModule: '',
    gameName: '',
    category: '才艺',
    status: 'preview',
    metrics: metrics([76, 112], [15, 21], [380, 3940], [32, 54]),
    cover: covers[4],
  },
  {
    roomId: '200482544305901780',
    mode: 'video',
    hostName: '夜猫电音',
    hostId: '10086180',
    gameModule: 'STG-老虎机',
    gameName: 'BBIN老虎机',
    category: '才艺',
    status: 'live',
    metrics: metrics([88, 140], [18, 27], [440, 7460], [40, 72]),
    cover: covers[5],
  },
  {
    roomId: '200482544305901793',
    mode: 'screen',
    hostName: '阿凯开播',
    hostId: '10086028',
    gameModule: 'STG-现金游戏',
    gameName: '趣投',
    category: '游戏',
    status: 'live',
    metrics: metrics([60, 94], [8, 15], [220, 5610], [12, 38]),
    cover: covers[0],
  },
  {
    roomId: '200482544305901806',
    mode: 'voice',
    hostName: '晚风陪聊',
    hostId: '10086035',
    gameModule: '',
    gameName: '',
    category: '情感',
    status: 'preview',
    metrics: metrics([100, 118], [20, 24], [500, 2180], [50, 61]),
    cover: covers[1],
  },
]

export function liveBroadcastModeLabel(mode: LiveBroadcastMode) {
  return LIVE_BROADCAST_MODE_LABEL[mode]
}

export function liveBroadcastStatusLabel(status: LiveBroadcastStatus) {
  return LIVE_BROADCAST_STATUS_LABEL[status]
}

export function formatLiveBroadcastGame(row: LiveBroadcastRow) {
  if (!row.gameModule && !row.gameName) return '—'
  return `${row.gameModule} / ${row.gameName}`
}

export function formatLiveBroadcastMetric(value: number) {
  return value.toLocaleString('zh-CN')
}

export function liveBroadcastMetricTotal(pair: LiveBroadcastMetricPair) {
  return pair.base + pair.actual
}
