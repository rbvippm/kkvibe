/** 我的 · 开播设置（视频 / 语音 / 手机画面）+ 直播预告 */

import { reactive, watch } from 'vue'

export type GoLiveTab = 'video' | 'voice' | 'screen'

export type GoLiveRatio = 'original' | '16:9' | '4:3'

export type GoLiveGameGroup = 'cash' | 'live'

export type GoLiveBeautyStyle = '女士' | '男士'

export type GoLiveContrast = '低' | '正常' | '高'

export const GO_LIVE_TABS: { key: GoLiveTab; label: string }[] = [
  { key: 'video', label: '视频' },
  { key: 'voice', label: '语音' },
  { key: 'screen', label: '手机画面' },
]

export const GO_LIVE_DEFAULT_TITLE = {
  video: '小红来了正在直播',
  voice: '小红来了正在语聊',
  screen: '小红来了正在直播',
} as const

export const GO_LIVE_TITLE_MAX = 20

export const GO_LIVE_CATEGORIES = [
  '娱乐 1',
  '综艺 1',
  '电影 1',
  '足球 1',
  '篮球 1',
  '乡村 1',
  '草原 1',
  '沙漠 1',
  '的撒旦',
  '的讲解',
  'feature (简)',
  '体育竞赛',
  '游戏互动',
] as const

export const GO_LIVE_DEFAULT_CATEGORY = '体育竞赛'

export const GO_LIVE_RATIOS: {
  key: GoLiveRatio
  label: string
  hint: string
}[] = [
  { key: 'original', label: '原始', hint: '原始纵向展示，观众不可切换横屏观看' },
  { key: '16:9', label: '16:9', hint: '16:9 展示，观众可切换横屏观看' },
  { key: '4:3', label: '4:3', hint: '4:3 展示，观众可切换横屏观看' },
]

export const GO_LIVE_GAME_GROUPS: { key: GoLiveGameGroup; label: string }[] = [
  { key: 'cash', label: '体育' },
  { key: 'live', label: '真人' },
]

export const GO_LIVE_GAMES: {
  id: string
  group: GoLiveGameGroup
  name: string
  icon: string
}[] = [
  { id: 'k3', group: 'cash', name: '一份快三', icon: '/images/vip-club/lottery/card-k3.png' },
  { id: 'burst', group: 'cash', name: '区块链爆点半屏', icon: '/images/vip-club/kk-logo.png' },
  { id: 'aviator', group: 'cash', name: '飞行员', icon: '/images/lobby/game-pk-1.svg' },
  { id: 'scratch', group: 'cash', name: '刮刮乐半屏', icon: '/images/vip-club/kk-logo.png' },
  { id: 'baccarat', group: 'live', name: '真人百家乐', icon: '/images/vip-club/vendors/pp.svg' },
  { id: 'dragon', group: 'live', name: '真人龙虎', icon: '/images/vip-club/vendors/pg-logo.png' },
  { id: 'roulette', group: 'live', name: '真人轮盘', icon: '/images/vip-club/vendors/pa-logo.png' },
  { id: 'sicbo', group: 'live', name: '真人骰宝', icon: '/images/vip-club/official-badge.png' },
]

export const GO_LIVE_BACKGROUNDS = [
  { id: 'star', name: '星钻派对厅', image: '/images/voice-room/bg.png' },
  { id: 'royal', name: '皇家会所', image: '/images/vip-club/hall/singapore-hero.png' },
  { id: 'yacht', name: '至尊游艇会', image: '/images/vip-club/lottery/cover-hawaii.png' },
  { id: 'studio', name: '超级主播间', image: '/images/live-stream/stage.png' },
] as const

export const GO_LIVE_DEFAULT_COVER = '/images/vip-club/lottery/cover-desert.png'

export const GO_LIVE_SCREEN_HINT = '开始直播后，观众会实时看到你手机上的画面'

export function goLiveTitleForTab(tab: GoLiveTab) {
  return GO_LIVE_DEFAULT_TITLE[tab]
}

export function filterGoLiveGames(group: GoLiveGameGroup) {
  return GO_LIVE_GAMES.filter((item) => item.group === group)
}

export function goLiveRatioHint(key: GoLiveRatio) {
  return GO_LIVE_RATIOS.find((item) => item.key === key)?.hint ?? ''
}

export type GoLiveScheduleStatus = 'pending' | 'live' | 'finished' | 'expired' | 'cancelled'

export type GoLiveSchedule = {
  id: string
  title: string
  cover: string
  category: string
  mode: GoLiveTab
  startAt: number
  subscriberCount: number
  status: GoLiveScheduleStatus
}

export const GO_LIVE_SCHEDULE_MAX = 5
export const GO_LIVE_SCHEDULE_MIN_LEAD_MIN = 15
export const GO_LIVE_SCHEDULE_MAX_DAYS = 7
export const GO_LIVE_SCHEDULE_GAP_MIN = 60
export const GO_LIVE_SCHEDULE_OVERTIME_MIN = 120
export const GO_LIVE_SCHEDULE_LIMIT_HINT = '已有 5 场有效预告，请开播或删除后再建'

export const GO_LIVE_MODE_LABELS: Record<GoLiveTab, string> = {
  video: '视频直播',
  voice: '语音直播',
  screen: '手机画面',
}

export const GO_LIVE_SCHEDULE_HOURS = Array.from({ length: 24 }, (_, index) => index)
export const GO_LIVE_SCHEDULE_MINUTES = [0, 15, 30, 45]

const MIN_LEAD_MS = GO_LIVE_SCHEDULE_MIN_LEAD_MIN * 60_000
const MAX_LEAD_MS = GO_LIVE_SCHEDULE_MAX_DAYS * 24 * 60 * 60 * 1000
const GAP_MS = GO_LIVE_SCHEDULE_GAP_MIN * 60_000
const OVERTIME_MS = GO_LIVE_SCHEDULE_OVERTIME_MIN * 60_000

function atHour(daysFromToday: number, hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  date.setHours(hour, minute, 0, 0)
  return date.getTime()
}

function newScheduleId() {
  const date = new Date()
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const serial = String(Math.floor(Math.random() * 90_000) + 10_000)
  return `sch_${stamp}_${serial}`
}

export const GO_LIVE_HOST_NAME = '小红'

export const goLiveScheduleStore = reactive<{ items: GoLiveSchedule[]; reservedIds: string[] }>({
  items: [
    {
      id: 'sch_20260827_88392',
      title: '欧冠巅峰夜！皇马VS曼城实时解说',
      cover: GO_LIVE_DEFAULT_COVER,
      category: '体育竞赛',
      mode: 'video',
      startAt: atHour(0, 20, 0),
      subscriberCount: 158,
      status: 'pending',
    },
    {
      id: 'sch_20260828_11021',
      title: '周末水友赛连麦交流会',
      cover: '/images/live-stream/stage.png',
      category: '游戏互动',
      mode: 'voice',
      startAt: atHour(1, 19, 30),
      subscriberCount: 42,
      status: 'pending',
    },
  ],
  reservedIds: [],
})

const GO_LIVE_STORE_KEY = 'mh5-go-live-schedule-store-v1'

function applyGoLiveStoreSnapshot(data: { items?: GoLiveSchedule[]; reservedIds?: string[] }) {
  if (Array.isArray(data.items)) {
    goLiveScheduleStore.items.splice(0, goLiveScheduleStore.items.length, ...data.items)
  }
  if (Array.isArray(data.reservedIds)) {
    goLiveScheduleStore.reservedIds.splice(0, goLiveScheduleStore.reservedIds.length, ...data.reservedIds)
  }
}

function persistGoLiveScheduleStore() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      GO_LIVE_STORE_KEY,
      JSON.stringify({
        items: goLiveScheduleStore.items,
        reservedIds: goLiveScheduleStore.reservedIds,
      }),
    )
  } catch {
    /* ignore quota */
  }
}

function hydrateGoLiveScheduleStore() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(GO_LIVE_STORE_KEY)
    if (!raw) return
    applyGoLiveStoreSnapshot(JSON.parse(raw) as { items?: GoLiveSchedule[]; reservedIds?: string[] })
  } catch {
    /* ignore broken cache */
  }
}

hydrateGoLiveScheduleStore()
watch(goLiveScheduleStore, persistGoLiveScheduleStore, { deep: true })

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== GO_LIVE_STORE_KEY || !event.newValue) return
    try {
      applyGoLiveStoreSnapshot(JSON.parse(event.newValue) as { items?: GoLiveSchedule[]; reservedIds?: string[] })
    } catch {
      /* ignore */
    }
  })
}

export function expireOverdueGoLiveSchedules(now = Date.now()) {
  const expired: GoLiveSchedule[] = []
  for (const item of goLiveScheduleStore.items) {
    if (item.status !== 'pending') continue
    if (now >= item.startAt + OVERTIME_MS) {
      item.status = 'expired'
      expired.push(item)
    }
  }
  return expired
}

export function listActiveGoLiveSchedules(now = Date.now()) {
  return goLiveScheduleStore.items
    .filter((item) => item.status === 'pending' && now < item.startAt + OVERTIME_MS)
    .slice()
    .sort((a, b) => a.startAt - b.startAt)
}

export function nearestPendingGoLiveSchedule(now = Date.now()) {
  return listActiveGoLiveSchedules(now)[0] ?? null
}

export function findGoLiveSchedule(id: string) {
  return goLiveScheduleStore.items.find((item) => item.id === id) ?? null
}

export function isGoLiveScheduleReserved(id: string) {
  return goLiveScheduleStore.reservedIds.includes(id)
}

export function toggleGoLiveScheduleReserve(id: string): 'reserved' | 'cancelled' | 'missing' {
  const item = findGoLiveSchedule(id)
  if (!item || item.status !== 'pending') return 'missing'
  const index = goLiveScheduleStore.reservedIds.indexOf(id)
  if (index >= 0) {
    goLiveScheduleStore.reservedIds.splice(index, 1)
    item.subscriberCount = Math.max(0, item.subscriberCount - 1)
    return 'cancelled'
  }
  goLiveScheduleStore.reservedIds.push(id)
  item.subscriberCount += 1
  return 'reserved'
}

export function validateGoLiveScheduleTime(startAt: number, excludeId?: string | null, now = Date.now()) {
  if (startAt < now + MIN_LEAD_MS) return '预计开播时间须至少晚于现在 15 分钟'
  if (startAt > now + MAX_LEAD_MS) return '最多可预约 7 天内的时间'
  const clash = listActiveGoLiveSchedules(now).find((item) => {
    if (excludeId && item.id === excludeId) return false
    return Math.abs(item.startAt - startAt) < GAP_MS
  })
  if (clash) return '两场预告须间隔至少 1 小时'
  return ''
}

export function createGoLiveSchedule(input: {
  title: string
  cover: string
  category: string
  mode: GoLiveTab
  startAt: number
}) {
  if (listActiveGoLiveSchedules().length >= GO_LIVE_SCHEDULE_MAX) {
    return { error: GO_LIVE_SCHEDULE_LIMIT_HINT, item: null as GoLiveSchedule | null }
  }
  const error = validateGoLiveScheduleTime(input.startAt)
  if (error) return { error, item: null as GoLiveSchedule | null }
  const item: GoLiveSchedule = {
    id: newScheduleId(),
    title: input.title.trim() || goLiveTitleForTab(input.mode),
    cover: input.cover,
    category: input.category,
    mode: input.mode,
    startAt: input.startAt,
    subscriberCount: 0,
    status: 'pending',
  }
  goLiveScheduleStore.items.push(item)
  return { error: '', item }
}

export function fulfillGoLiveSchedule(id: string) {
  const item = findGoLiveSchedule(id)
  if (item && item.status === 'pending') item.status = 'live'
}

export function cancelGoLiveSchedule(id: string) {
  const item = findGoLiveSchedule(id)
  if (item && item.status === 'pending') item.status = 'cancelled'
}

export function isGoLiveScheduleOvertime(item: GoLiveSchedule, now = Date.now()) {
  return item.status === 'pending' && now >= item.startAt && now < item.startAt + OVERTIME_MS
}

export function formatGoLiveScheduleTime(ts: number, now = Date.now()) {
  const date = new Date(ts)
  const today = new Date(now)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  if (sameDay) return date.getHours() >= 18 ? `今晚 ${hh}:${mm}` : `今天 ${hh}:${mm}`
  if (isTomorrow) return `明天 ${hh}:${mm}`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hh}:${mm}`
}

export function formatGoLiveOvertime(ts: number, now = Date.now()) {
  if (now < ts) return ''
  const mins = Math.max(1, Math.floor((now - ts) / 60_000))
  return `已超时 ${mins} 分钟`
}

export function goLiveScheduleDayOptions(now = Date.now()) {
  const base = new Date(now)
  base.setHours(0, 0, 0, 0)
  return Array.from({ length: GO_LIVE_SCHEDULE_MAX_DAYS + 1 }, (_, offset) => {
    const date = new Date(base)
    date.setDate(date.getDate() + offset)
    let label = `${date.getMonth() + 1}月${date.getDate()}日`
    if (offset === 0) label = '今天'
    else if (offset === 1) label = '明天'
    else if (offset === 2) label = '后天'
    return { offset, label, date }
  })
}

export function combineGoLiveScheduleTime(dayOffset: number, hour: number, minute: number, now = Date.now()) {
  const date = new Date(now)
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date.getTime()
}

export function splitGoLiveScheduleTime(ts: number, now = Date.now()) {
  const date = new Date(ts)
  const base = new Date(now)
  base.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const offset = Math.round((target.getTime() - base.getTime()) / 86_400_000)
  const rawMinute = date.getMinutes()
  const snapped = GO_LIVE_SCHEDULE_MINUTES.includes(rawMinute)
    ? rawMinute
    : GO_LIVE_SCHEDULE_MINUTES.reduce((best, item) =>
        Math.abs(item - rawMinute) < Math.abs(best - rawMinute) ? item : best,
      )
  return {
    offset: Math.min(Math.max(offset, 0), GO_LIVE_SCHEDULE_MAX_DAYS),
    hour: date.getHours(),
    minute: snapped,
  }
}

export function suggestGoLiveScheduleTime(now = Date.now()) {
  const rounded = new Date(now + MIN_LEAD_MS)
  const next = Math.ceil(rounded.getMinutes() / 15) * 15
  if (next >= 60) {
    rounded.setHours(rounded.getHours() + 1)
    rounded.setMinutes(0, 0, 0)
  } else {
    rounded.setMinutes(next, 0, 0)
  }
  return rounded.getTime()
}
