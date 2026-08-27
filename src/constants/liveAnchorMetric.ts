/** 直播管理 · 主播列表 · 展示指标 Mock */

import { ref } from 'vue'

export type AnchorMetricSource = 'global' | 'custom'
export type MetricPreset = 'low' | 'mid' | 'high' | 'custom'
export type AnchorLiveStatus = 'live' | 'offline'
export type AnchorBanStatus = 'normal' | 'banned'

export type MetricRange = {
  min: number
  max: number
}

export type PeopleRule = {
  enter: MetricRange
  leave: MetricRange
}

export type AppointmentRule = {
  book: MetricRange
  cancel: MetricRange
}

export type LikeRule = {
  tap: MetricRange
}

export type HeatRule = {
  peopleWeight: number
  danmakuWeight: number
  giftWeight: number
  likeWeight: number
}

export type AnchorMetricConfig = {
  preset: MetricPreset
  peopleBase: number
  appointmentBase: number
  heatBase: number
  likeBase: number
  people: PeopleRule
  appointment: AppointmentRule
  like: LikeRule
  heat: HeatRule
}

export type LiveAnchorRow = {
  id: string
  nickname: string
  roomId: string
  sessionId: number
  giftSharePercent: number
  fans: number
  tag: string
  liveStatus: AnchorLiveStatus
  banStatus: AnchorBanStatus
  source: AnchorMetricSource
  custom: AnchorMetricConfig | null
}

export type HeatPreviewInput = {
  people: number
  danmaku: number
  gift: number
  like: number
}

export const ANCHOR_METRIC_SOURCE_OPTIONS = [
  { value: 'global' as const, label: '跟随全局' },
  { value: 'custom' as const, label: '自定义' },
]

export const ANCHOR_LIVE_STATUS_OPTIONS = [
  { value: 'live' as const, label: '直播中' },
  { value: 'offline' as const, label: '未直播' },
]

export const ANCHOR_BAN_STATUS_OPTIONS = [
  { value: 'normal' as const, label: '未封禁' },
  { value: 'banned' as const, label: '已封禁' },
]

export const METRIC_PRESET_OPTIONS = [
  { value: 'low' as const, label: '低' },
  { value: 'mid' as const, label: '中' },
  { value: 'high' as const, label: '高' },
  { value: 'custom' as const, label: '自定义' },
]

export const DEFAULT_HEAT_PREVIEW: HeatPreviewInput = {
  people: 128,
  danmaku: 56,
  gift: 320,
  like: 80,
}

export function createRange(min: number, max: number): MetricRange {
  return { min, max }
}

export function createDefaultMetricConfig(): AnchorMetricConfig {
  return {
    preset: 'custom',
    peopleBase: 100,
    appointmentBase: 20,
    heatBase: 500,
    likeBase: 50,
    people: {
      enter: createRange(3, 8),
      leave: createRange(2, 6),
    },
    appointment: {
      book: createRange(2, 5),
      cancel: createRange(1, 4),
    },
    like: {
      tap: createRange(1, 3),
    },
    heat: {
      peopleWeight: 2,
      danmakuWeight: 1.5,
      giftWeight: 0.8,
      likeWeight: 0.3,
    },
  }
}

/** 系统档：低约几十人、中约几百人、高约几千人，避免一眼假。 */
export const METRIC_PRESETS: Record<Exclude<MetricPreset, 'custom'>, AnchorMetricConfig> = {
  low: {
    preset: 'low',
    peopleBase: 38,
    appointmentBase: 7,
    heatBase: 160,
    likeBase: 12,
    people: {
      enter: createRange(1, 3),
      leave: createRange(1, 2),
    },
    appointment: {
      book: createRange(1, 2),
      cancel: createRange(1, 1),
    },
    like: { tap: createRange(1, 1) },
    heat: {
      peopleWeight: 1.1,
      danmakuWeight: 0.7,
      giftWeight: 0.35,
      likeWeight: 0.12,
    },
  },
  mid: {
    preset: 'mid',
    peopleBase: 260,
    appointmentBase: 46,
    heatBase: 980,
    likeBase: 72,
    people: {
      enter: createRange(4, 9),
      leave: createRange(3, 7),
    },
    appointment: {
      book: createRange(2, 5),
      cancel: createRange(1, 3),
    },
    like: { tap: createRange(1, 3) },
    heat: {
      peopleWeight: 1.8,
      danmakuWeight: 1.2,
      giftWeight: 0.7,
      likeWeight: 0.25,
    },
  },
  high: {
    preset: 'high',
    peopleBase: 2800,
    appointmentBase: 420,
    heatBase: 8600,
    likeBase: 760,
    people: {
      enter: createRange(16, 42),
      leave: createRange(12, 32),
    },
    appointment: {
      book: createRange(6, 16),
      cancel: createRange(4, 12),
    },
    like: { tap: createRange(2, 6) },
    heat: {
      peopleWeight: 2.8,
      danmakuWeight: 1.8,
      giftWeight: 1,
      likeWeight: 0.4,
    },
  },
}

export const HEAT_PREVIEW_BY_PRESET: Record<MetricPreset, HeatPreviewInput> = {
  low: { people: 46, danmaku: 18, gift: 80, like: 16 },
  mid: { people: 280, danmaku: 64, gift: 420, like: 88 },
  high: { people: 2680, danmaku: 380, gift: 6200, like: 720 },
  custom: DEFAULT_HEAT_PREVIEW,
}

export function metricPresetLabel(preset: MetricPreset) {
  return METRIC_PRESET_OPTIONS.find((item) => item.value === preset)?.label ?? '自定义'
}

export function cloneRange(range: MetricRange): MetricRange {
  return { min: range.min, max: range.max }
}

export function cloneMetricConfig(config: AnchorMetricConfig): AnchorMetricConfig {
  return {
    preset: config.preset ?? 'custom',
    peopleBase: config.peopleBase,
    appointmentBase: config.appointmentBase,
    heatBase: config.heatBase,
    likeBase: config.likeBase,
    people: {
      enter: cloneRange(config.people.enter),
      leave: cloneRange(config.people.leave),
    },
    appointment: {
      book: cloneRange(config.appointment.book),
      cancel: cloneRange(config.appointment.cancel),
    },
    like: {
      tap: cloneRange(config.like.tap),
    },
    heat: { ...config.heat },
  }
}

export function anchorMetricSourceLabel(source: AnchorMetricSource) {
  return source === 'custom' ? '自定义' : '跟随全局'
}

export function anchorLiveStatusLabel(status: AnchorLiveStatus) {
  return ANCHOR_LIVE_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? '未直播'
}

export function anchorBanStatusLabel(status: AnchorBanStatus) {
  return ANCHOR_BAN_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? '未封禁'
}

export function formatGiftShare(percent: number) {
  if (Number.isInteger(percent)) return `${percent}%`
  return `${percent.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`
}

export function formatAnchorTag(tag: string) {
  return tag.trim() ? tag : '-'
}

export function effectiveMetricConfig(
  row: LiveAnchorRow,
  globalConfig: AnchorMetricConfig,
): AnchorMetricConfig {
  if (row.source === 'custom' && row.custom) return cloneMetricConfig(row.custom)
  return cloneMetricConfig(globalConfig)
}

export function previewHeat(config: AnchorMetricConfig, sample: HeatPreviewInput) {
  const heat =
    Number(config.heatBase) +
    Number(sample.people) * Number(config.heat.peopleWeight) +
    Number(sample.danmaku) * Number(config.heat.danmakuWeight) +
    Number(sample.gift) * Number(config.heat.giftWeight) +
    Number(sample.like) * Number(config.heat.likeWeight)
  return Math.max(0, Math.round(heat * 100) / 100)
}

export function formatRange(range: MetricRange) {
  return `${range.min} ~ ${range.max}`
}

export const liveAnchorGlobalConfig = ref<AnchorMetricConfig>(createDefaultMetricConfig())

export const liveAnchorStore = ref<LiveAnchorRow[]>([
  {
    id: '10086001',
    nickname: '小夜不困',
    roomId: '200482544305901568',
    sessionId: 1662,
    giftSharePercent: 1.23,
    fans: 3,
    tag: '主播标签中文',
    liveStatus: 'live',
    banStatus: 'normal',
    source: 'custom',
    custom: {
      preset: 'custom',
      peopleBase: 280,
      appointmentBase: 60,
      heatBase: 1200,
      likeBase: 180,
      people: {
        enter: createRange(5, 12),
        leave: createRange(3, 8),
      },
      appointment: {
        book: createRange(3, 7),
        cancel: createRange(2, 5),
      },
      like: {
        tap: createRange(2, 5),
      },
      heat: {
        peopleWeight: 2.4,
        danmakuWeight: 1.8,
        giftWeight: 1,
        likeWeight: 0.4,
      },
    },
  },
  {
    id: '10086012',
    nickname: '星河主播',
    roomId: '200482544305901601',
    sessionId: 1537,
    giftSharePercent: 10,
    fans: 2,
    tag: '',
    liveStatus: 'live',
    banStatus: 'normal',
    source: 'global',
    custom: null,
  },
  {
    id: '10086028',
    nickname: '阿凯开播',
    roomId: '200482544305901612',
    sessionId: 0,
    giftSharePercent: 1,
    fans: 1,
    tag: '',
    liveStatus: 'offline',
    banStatus: 'normal',
    source: 'custom',
    custom: {
      preset: 'custom',
      peopleBase: 60,
      appointmentBase: 8,
      heatBase: 220,
      likeBase: 12,
      people: {
        enter: createRange(1, 3),
        leave: createRange(1, 2),
      },
      appointment: {
        book: createRange(1, 2),
        cancel: createRange(1, 1),
      },
      like: {
        tap: createRange(1, 1),
      },
      heat: {
        peopleWeight: 1.2,
        danmakuWeight: 1,
        giftWeight: 0.5,
        likeWeight: 0.2,
      },
    },
  },
  {
    id: '10086035',
    nickname: '晚风陪聊',
    roomId: '200482544305901628',
    sessionId: 0,
    giftSharePercent: 10,
    fans: 0,
    tag: '',
    liveStatus: 'offline',
    banStatus: 'banned',
    source: 'global',
    custom: null,
  },
  {
    id: '10086047',
    nickname: '好运来了',
    roomId: '200482544305901640',
    sessionId: 1595,
    giftSharePercent: 1,
    fans: 2,
    tag: '颜值',
    liveStatus: 'live',
    banStatus: 'normal',
    source: 'global',
    custom: null,
  },
  {
    id: '10086059',
    nickname: '清酒微醺',
    roomId: '200482544305901655',
    sessionId: 0,
    giftSharePercent: 20,
    fans: 0,
    tag: '',
    liveStatus: 'offline',
    banStatus: 'normal',
    source: 'custom',
    custom: {
      preset: 'custom',
      peopleBase: 160,
      appointmentBase: 36,
      heatBase: 860,
      likeBase: 90,
      people: {
        enter: createRange(4, 9),
        leave: createRange(2, 7),
      },
      appointment: {
        book: createRange(2, 6),
        cancel: createRange(1, 3),
      },
      like: {
        tap: createRange(1, 4),
      },
      heat: {
        peopleWeight: 1.8,
        danmakuWeight: 1.2,
        giftWeight: 0.9,
        likeWeight: 0.35,
      },
    },
  },
])
