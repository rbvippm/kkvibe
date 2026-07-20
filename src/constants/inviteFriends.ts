/** 移动端 · 邀请好友 / 邀请好友记录 · Mock */

import {
  inviteRebateEligibleLabel,
  inviteRebateSettleStatusLabel,
  type InviteRebateEligibleStatus,
  type InviteRebateSettleStatus,
} from './inviteRebateOps'

export type InviteCurrency = 'KKC' | 'KKV' | 'USDT'

export type InviteDailyEligibleStatus = InviteRebateEligibleStatus
export type InviteDailySettleStatus = InviteRebateSettleStatus

export { inviteRebateEligibleLabel, inviteRebateSettleStatusLabel }

export const INVITE_CURRENCY_OPTIONS: { value: InviteCurrency; label: string }[] = [
  { value: 'KKC', label: 'KKC' },
  { value: 'KKV', label: 'KKV' },
  { value: 'USDT', label: 'USDT' },
]

/**
 * 与「我的」页偏好计价法币对齐的 Mock（原型默认）。
 * CNY → KKC，VND → KKV，USD → USDT
 */
export type MemberPreferredFiatId = 'cny' | 'vnd' | 'usd'

export const MEMBER_PREFERRED_FIAT_ID: MemberPreferredFiatId = 'vnd'

export const MEMBER_FIAT_WALLET_BALANCES: Record<'KKC' | 'KKV', number> = {
  KKC: 236188.66,
  KKV: 12880.5,
}

export function resolveDefaultInviteCurrency(
  preferredFiatId: MemberPreferredFiatId = MEMBER_PREFERRED_FIAT_ID,
): InviteCurrency {
  if (preferredFiatId === 'vnd') return 'KKV'
  if (preferredFiatId === 'usd') return 'USDT'
  if (preferredFiatId === 'cny') return 'KKC'
  return MEMBER_FIAT_WALLET_BALANCES.KKC >= MEMBER_FIAT_WALLET_BALANCES.KKV ? 'KKC' : 'KKV'
}

/**
 * 邀请人活动币种：与后台活动中心按币种配置对齐；原型一人仅展示一种。
 * 原型默认跟随「我的」偏好法币映射。
 */
export const INVITER_BOUND_CURRENCY: InviteCurrency = resolveDefaultInviteCurrency()

/** VIP 0～9 对应日返利上限（按币种量级） */
export const VIP_DAILY_REBATE_CAP: Record<InviteCurrency, number[]> = {
  KKC: [6880000, 6880000, 6880000, 6880000, 6880000, 6880000, 9888000, 12888000, 16888000, 58880000],
  KKV: [6880000, 6880000, 6880000, 6880000, 6880000, 6880000, 9888000, 12888000, 16888000, 58880000],
  USDT: [344, 344, 344, 344, 344, 344, 494, 644, 844, 2944],
}

/** 被邀请人每日返利明细（业务日维度，对齐 PC「被邀请人每日明细」） */
export type InviteDailyRebateRow = {
  id: string
  /** 业务日 YYYY-MM-DD */
  bizDate: string
  currency: InviteCurrency
  /** 业务日 23:59:59 VIP 快照 */
  vipSnapshot: number
  inviterHistoryDeposit: number
  inviterDailyDeposit: number
  inviteeHistoryDeposit: number
  inviteeDailyDeposit: number
  meetsThreshold: boolean
  eligibleStatus: InviteDailyEligibleStatus
  /** 应发返利 */
  rebateAmount: number
  /** 实发返利（触达上限后可小于应发） */
  settledAmount: number
  status: InviteDailySettleStatus
  /** 计划派发时间（隔日 GMT+8 12:00） */
  settleAt: string
  remark: string
}

export type InviteFriendMember = {
  id: string
  nickname: string
  diamondId: string
  registeredAt: string
  vipLevel: number
  /**
   * 是否满足邀请返利条件。
   * false 为「不满足条件」：展示标签但不进入明细、不展示返利金额。
   */
  meetsCondition: boolean
  totals: Record<
    InviteCurrency,
    { deposit: number; withdraw: number; bet: number; rebate: number }
  >
  /** 今日已获得实发返利（按币种，对照 VIP 日上限） */
  todayRebate: Record<InviteCurrency, number>
  dailyRows: InviteDailyRebateRow[]
}

export const INVITE_PROFILE = {
  username: 'mid_48pod2d51s4',
  slogan: '邀请您来畅玩',
  inviteCode: '891117',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=invite&backgroundColor=ffdfbf',
}

export function todayDateStr(base = new Date()) {
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 邀请活动里 USDT 视为虚拟币；KKC / KKV 按法币口径 */
export function isInviteCryptoCurrency(currency: InviteCurrency) {
  return currency === 'USDT'
}

/** 活动币种即展示币种，不做法币换算 */
export function inviteFiatLabel(currency: InviteCurrency) {
  return currency
}

/** @deprecated 与活动币种一致，保留兼容 */
export const INVITER_BOUND_FIAT_LABEL = INVITER_BOUND_CURRENCY

/**
 * 向下截断小数（不四舍五入），千分位展示。
 * - fixedDigits：固定小数位（列表 / 法币）
 * - maxDigits > minDigits：虚拟币最多 max、最少 min，尾零舍去；超出 max 的位数截断
 */
function formatTruncatedInviteMoney(
  value: number,
  minDigits: number,
  maxDigits: number,
): string {
  if (!Number.isFinite(value)) {
    return `0.${'0'.repeat(minDigits)}`
  }

  const negative = value < 0
  const abs = Math.abs(value)
  const raw = abs.toString()
  const factor = 10 ** maxDigits

  let scaled: number
  if (raw.includes('e') || raw.includes('E')) {
    scaled = Math.floor(abs * factor + 1e-9)
  } else {
    const [intRaw, fracRaw = ''] = raw.split('.')
    const frac = (fracRaw + '0'.repeat(maxDigits)).slice(0, maxDigits)
    scaled = Number(intRaw) * factor + Number(frac || '0')
  }

  const whole = Math.floor(scaled / factor)
  let frac = String(scaled % factor).padStart(maxDigits, '0')
  if (maxDigits > minDigits) {
    while (frac.length > minDigits && frac.endsWith('0')) {
      frac = frac.slice(0, -1)
    }
  }
  const body = `${whole.toLocaleString('zh-CN')}.${frac}`
  return negative ? `-${body}` : body
}

/** 列表 / 汇总：千分位 + 固定两位小数（向下截断） */
export function formatInviteAmount(value: number, _currency?: InviteCurrency) {
  return formatTruncatedInviteMoney(value, 2, 2)
}

/**
 * 详情金额：
 * - 法币（KKC / KKV）：千分位 + 固定 2 位
 * - 虚拟币（USDT）：最多 6 位、最少 2 位，尾零舍去，第 7 位截断
 */
export function formatInviteDetailAmount(value: number, currency: InviteCurrency) {
  if (isInviteCryptoCurrency(currency)) {
    return formatTruncatedInviteMoney(value, 2, 6)
  }
  return formatTruncatedInviteMoney(value, 2, 2)
}

export function vipDailyCap(vipLevel: number, currency: InviteCurrency) {
  const caps = VIP_DAILY_REBATE_CAP[currency]
  const idx = Math.min(Math.max(vipLevel, 0), caps.length - 1)
  return caps[idx]
}

const today = todayDateStr()

function shiftDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return todayDateStr(d)
}

function atTime(date: string, time: string) {
  return `${date} ${time}`
}

export const INVITE_PAGE_SIZE = 20
export const INVITE_MAX_RANGE_DAYS = 90

export type InviteTimePreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export type InviteQuickTimePreset = Exclude<InviteTimePreset, 'custom'>

export const INVITE_TIME_PRESETS: { key: InviteQuickTimePreset; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

export const INVITE_VIP_OPTIONS: { value: '' | number; label: string }[] = [
  { value: '', label: '全部' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: i as number, label: `VIP${i}` })),
]

export type InviteRecordsFilter = {
  timePreset: InviteTimePreset
  customStart: string
  customEnd: string
  vipLevel: '' | number
  /** 活动币种，默认 KKC（无「全部」） */
  currency: InviteCurrency
}

export function createDefaultInviteFilter(): InviteRecordsFilter {
  return syncInviteFilterDates({
    timePreset: 'month',
    customStart: '',
    customEnd: '',
    vipLevel: '',
    currency: 'KKC',
  })
}

/** 筛选弹层币种选项（无全部，默认 KKC） */
export const INVITE_FILTER_CURRENCY_OPTIONS = INVITE_CURRENCY_OPTIONS

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function parseDateTime(value: string) {
  return new Date(value.replace(/-/g, '/'))
}

export function getInviteDateRange(
  filter: Pick<InviteRecordsFilter, 'timePreset' | 'customStart' | 'customEnd'>,
) {
  const now = new Date()
  const today = startOfDay(now)

  if (filter.timePreset === 'today') {
    return { start: today, end: endOfDay(now) }
  }
  if (filter.timePreset === 'yesterday') {
    const y = new Date(today)
    y.setDate(y.getDate() - 1)
    return { start: y, end: endOfDay(y) }
  }
  if (filter.timePreset === 'week') {
    const start = new Date(today)
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
    return { start, end: endOfDay(now) }
  }
  if (filter.timePreset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start, end: endOfDay(now) }
  }

  const start = filter.customStart ? startOfDay(new Date(filter.customStart)) : today
  const end = filter.customEnd ? endOfDay(new Date(filter.customEnd)) : endOfDay(now)
  return { start, end }
}

/** 将当前 timePreset / 自定义区间解析为输入框用的 YYYY-MM-DD */
export function syncInviteFilterDates(filter: InviteRecordsFilter): InviteRecordsFilter {
  const { start, end } = getInviteDateRange(filter)
  return {
    ...filter,
    customStart: todayDateStr(start),
    customEnd: todayDateStr(end),
  }
}

/** 若起止日期恰好等于某快捷 Tab 区间，则回写对应 preset，实现与顶部 Tab 联动 */
export function resolveInviteTimePresetFromRange(startStr: string, endStr: string): InviteTimePreset {
  const presets: Exclude<InviteTimePreset, 'custom'>[] = ['today', 'yesterday', 'week', 'month']
  for (const preset of presets) {
    const range = getInviteDateRange({ timePreset: preset, customStart: '', customEnd: '' })
    if (todayDateStr(range.start) === startStr && todayDateStr(range.end) === endStr) {
      return preset
    }
  }
  return 'custom'
}

export function validateInviteDateRange(
  filter: Pick<InviteRecordsFilter, 'timePreset' | 'customStart' | 'customEnd'>,
) {
  if (!filter.customStart || !filter.customEnd) {
    if (filter.timePreset === 'custom') return '请选择自定义起止日期'
    return null
  }
  const start = startOfDay(new Date(filter.customStart))
  const end = endOfDay(new Date(filter.customEnd))
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '请选择有效的起止日期'
  if (start > end) return '开始日期不能晚于结束日期'
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > INVITE_MAX_RANGE_DAYS) {
    return `移动端仅支持查询近 ${INVITE_MAX_RANGE_DAYS} 天数据，更多数据请前往 PC 端导出`
  }
  return null
}

/** 被邀请人在该币种是否有充值/提款/投注/返利数据 */
export function memberHasCurrencyActivity(member: InviteFriendMember, currency: InviteCurrency) {
  const totals = member.totals[currency]
  return (
    totals.deposit > 0 ||
    totals.withdraw > 0 ||
    totals.bet > 0 ||
    totals.rebate > 0 ||
    member.dailyRows.some((r) => r.currency === currency)
  )
}

/** 按注册时间 + VIP + 币种过滤；统计 Banner 可忽略币种以分币种独立汇总 */
export function filterInviteMembers(
  rows: InviteFriendMember[],
  filter: InviteRecordsFilter,
  options?: { ignoreCurrency?: boolean },
) {
  const { start, end } = getInviteDateRange(filter)

  return rows.filter((row) => {
    const registeredAt = parseDateTime(row.registeredAt)
    if (registeredAt < start || registeredAt > end) return false
    if (filter.vipLevel !== '' && row.vipLevel !== filter.vipLevel) return false
    if (!options?.ignoreCurrency && !memberHasCurrencyActivity(row, filter.currency)) return false
    return true
  })
}

export type InviteMembersSummary = {
  currency: InviteCurrency
  inviteCount: number
  eligibleCount: number
  deposit: number
  withdraw: number
  bet: number
  rebate: number
}

/** 单币种汇总（该币种原生金额，不换算）；有代理身份时充值/提款/投注按全部被邀请人汇总 */
export function summarizeInviteMembers(
  rows: InviteFriendMember[],
  currency: InviteCurrency = INVITER_BOUND_CURRENCY,
  options?: { depositScope?: 'qualified' | 'all' },
): InviteMembersSummary {
  const inCurrency = rows.filter((m) => memberHasCurrencyActivity(m, currency))
  const qualified = inCurrency.filter((m) => m.meetsCondition)
  const moneyRows = options?.depositScope === 'all' ? inCurrency : qualified
  return {
    currency,
    inviteCount: inCurrency.length,
    eligibleCount: qualified.length,
    deposit: moneyRows.reduce((sum, m) => sum + m.totals[currency].deposit, 0),
    withdraw: moneyRows.reduce((sum, m) => sum + m.totals[currency].withdraw, 0),
    bet: moneyRows.reduce((sum, m) => sum + m.totals[currency].bet, 0),
    rebate: qualified.reduce((sum, m) => sum + m.totals[currency].rebate, 0),
  }
}

/** 固定输出 KKC / KKV / USDT 三组独立统计（原生金额，不互相换算） */
export function summarizeInviteMembersByCurrency(
  rows: InviteFriendMember[],
  options?: { depositScope?: 'qualified' | 'all'; currencies?: InviteCurrency[] },
): InviteMembersSummary[] {
  const currencies = options?.currencies ?? INVITE_CURRENCY_OPTIONS.map((item) => item.value)
  return currencies.map((currency) =>
    summarizeInviteMembers(rows, currency, { depositScope: options?.depositScope }),
  )
}

/** 列表金额展示币种：与当前筛选币种一致 */
export function resolveMemberDisplayCurrency(
  _member: InviteFriendMember,
  filterCurrency: InviteCurrency,
): InviteCurrency {
  return filterCurrency
}

/** 业务日次日 GMT+8 12:00 计划派发 */
function dailySettleAt(bizDate: string) {
  const [y, m, day] = bizDate.split('-').map(Number)
  const next = new Date(y, m - 1, day + 1)
  return `${todayDateStr(next)} 12:00:00`
}

function dayRow(
  partial: Omit<InviteDailyRebateRow, 'settleAt'> & Partial<Pick<InviteDailyRebateRow, 'settleAt'>>,
): InviteDailyRebateRow {
  return {
    ...partial,
    settleAt: partial.settleAt ?? dailySettleAt(partial.bizDate),
  }
}

export const MOCK_INVITE_FRIENDS: InviteFriendMember[] = [
  {
    id: 'm1',
    nickname: '小幸运',
    diamondId: '88291001',
    registeredAt: atTime(shiftDate(-2), '14:22:08'),
    vipLevel: 3,
    meetsCondition: true,
    totals: {
      KKC: { deposit: 12800, withdraw: 4200, bet: 28600, rebate: 128 },
      KKV: { deposit: 2580000, withdraw: 860000, bet: 6120000, rebate: 86000 },
      USDT: { deposit: 86, withdraw: 24, bet: 210, rebate: 0.86 },
    },
    todayRebate: { KKC: 50, KKV: 10000, USDT: 0.2 },
    dailyRows: [
      dayRow({
        id: 'm1-kkv-1',
        bizDate: shiftDate(-1),
        currency: 'KKV',
        vipSnapshot: 3,
        inviterHistoryDeposit: 2580000,
        inviterDailyDeposit: 180000,
        inviteeHistoryDeposit: 2580000,
        inviteeDailyDeposit: 220000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 21600,
        settledAmount: 21600,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm1-kkv-2',
        bizDate: shiftDate(-2),
        currency: 'KKV',
        vipSnapshot: 3,
        inviterHistoryDeposit: 2400000,
        inviterDailyDeposit: 160000,
        inviteeHistoryDeposit: 2360000,
        inviteeDailyDeposit: 180000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 19800,
        settledAmount: 19800,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm1-kkv-3',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterHistoryDeposit: 2240000,
        inviterDailyDeposit: 90000,
        inviteeHistoryDeposit: 2180000,
        inviteeDailyDeposit: 45000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '被邀请人当日日存未达每日最低存款',
      }),
      dayRow({
        id: 'm1-kkv-4',
        bizDate: shiftDate(-4),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterHistoryDeposit: 2150000,
        inviterDailyDeposit: 150000,
        inviteeHistoryDeposit: 2135000,
        inviteeDailyDeposit: 160000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 17200,
        settledAmount: 17200,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm1-kkv-5',
        bizDate: shiftDate(-5),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterHistoryDeposit: 2000000,
        inviterDailyDeposit: 140000,
        inviteeHistoryDeposit: 1975000,
        inviteeDailyDeposit: 155000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 16800,
        settledAmount: 12000,
        status: 'capped',
        remark: '触达 VIP 日返利上限，已截断',
      }),
      dayRow({
        id: 'm1-kkv-6',
        bizDate: shiftDate(-6),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterHistoryDeposit: 1860000,
        inviterDailyDeposit: 130000,
        inviteeHistoryDeposit: 1820000,
        inviteeDailyDeposit: 142000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 15400,
        settledAmount: 15400,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm1-kkv-7',
        bizDate: shiftDate(-7),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterHistoryDeposit: 1730000,
        inviterDailyDeposit: 80000,
        inviteeHistoryDeposit: 1678000,
        inviteeDailyDeposit: 20000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '邀请人当日日存未达每日最低存款',
      }),
      dayRow({
        id: 'm1-kkc-1',
        bizDate: shiftDate(-2),
        currency: 'KKC',
        vipSnapshot: 3,
        inviterHistoryDeposit: 42000,
        inviterDailyDeposit: 3600,
        inviteeHistoryDeposit: 12800,
        inviteeDailyDeposit: 4800,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 128,
        settledAmount: 128,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm1-usdt-1',
        bizDate: shiftDate(-2),
        currency: 'USDT',
        vipSnapshot: 3,
        inviterHistoryDeposit: 200,
        inviterDailyDeposit: 25,
        inviteeHistoryDeposit: 86,
        inviteeDailyDeposit: 40,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 0.86,
        settledAmount: 0.86,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
    ],
  },
  {
    id: 'm2',
    nickname: '阿凯',
    diamondId: '88291088',
    registeredAt: atTime(shiftDate(-1), '09:05:33'),
    vipLevel: 1,
    meetsCondition: true,
    totals: {
      KKC: { deposit: 18600, withdraw: 5600, bet: 39800, rebate: 188 },
      KKV: { deposit: 1680000, withdraw: 520000, bet: 3960000, rebate: 21800 },
      USDT: { deposit: 120, withdraw: 36, bet: 280, rebate: 1.2 },
    },
    todayRebate: { KKC: 42, KKV: 8600, USDT: 0 },
    dailyRows: [
      dayRow({
        id: 'm2-kkv-1',
        bizDate: shiftDate(-1),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterHistoryDeposit: 2580000,
        inviterDailyDeposit: 180000,
        inviteeHistoryDeposit: 980000,
        inviteeDailyDeposit: 150000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 9800,
        settledAmount: 9800,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm2-kkv-2',
        bizDate: today,
        currency: 'KKV',
        vipSnapshot: 1,
        inviterHistoryDeposit: 2760000,
        inviterDailyDeposit: 160000,
        inviteeHistoryDeposit: 1100000,
        inviteeDailyDeposit: 120000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 8600,
        settledAmount: 8600,
        status: 'pending',
        remark: '待隔日 GMT+8 12:00 派发',
      }),
      dayRow({
        id: 'm2-kkv-3',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterHistoryDeposit: 2400000,
        inviterDailyDeposit: 90000,
        inviteeHistoryDeposit: 830000,
        inviteeDailyDeposit: 28000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '被邀请人当日日存未达每日最低存款',
      }),
      dayRow({
        id: 'm2-kkv-4',
        bizDate: shiftDate(-4),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterHistoryDeposit: 2310000,
        inviterDailyDeposit: 140000,
        inviteeHistoryDeposit: 802000,
        inviteeDailyDeposit: 220000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 16800,
        settledAmount: 12000,
        status: 'capped',
        remark: '触达 VIP 日返利上限，已截断',
      }),
      dayRow({
        id: 'm2-kkc-1',
        bizDate: shiftDate(-1),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterHistoryDeposit: 38000,
        inviterDailyDeposit: 2800,
        inviteeHistoryDeposit: 5600,
        inviteeDailyDeposit: 2200,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 56,
        settledAmount: 56,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm2-kkc-2',
        bizDate: today,
        currency: 'KKC',
        vipSnapshot: 1,
        inviterHistoryDeposit: 42000,
        inviterDailyDeposit: 3200,
        inviteeHistoryDeposit: 8600,
        inviteeDailyDeposit: 3000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 42,
        settledAmount: 42,
        status: 'pending',
        remark: '待隔日 GMT+8 12:00 派发',
      }),
      dayRow({
        id: 'm2-kkc-3',
        bizDate: shiftDate(-3),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterHistoryDeposit: 34800,
        inviterDailyDeposit: 1800,
        inviteeHistoryDeposit: 3400,
        inviteeDailyDeposit: 80,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '被邀请人当日日存未达每日最低存款',
      }),
      dayRow({
        id: 'm2-kkc-4',
        bizDate: shiftDate(-4),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterHistoryDeposit: 33000,
        inviterDailyDeposit: 2600,
        inviteeHistoryDeposit: 13200,
        inviteeDailyDeposit: 7600,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 220,
        settledAmount: 132,
        status: 'capped',
        remark: '触达 VIP 日返利上限，已截断',
      }),
      dayRow({
        id: 'm2-kkc-5',
        bizDate: shiftDate(-6),
        currency: 'KKC',
        vipSnapshot: 0,
        inviterHistoryDeposit: 28000,
        inviterDailyDeposit: 2000,
        inviteeHistoryDeposit: 2200,
        inviteeDailyDeposit: 900,
        meetsThreshold: false,
        eligibleStatus: 'cancelled',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'cancelled',
        remark: '邀请人已成为代理，取消返利资格',
      }),
      dayRow({
        id: 'm2-usdt-1',
        bizDate: shiftDate(-1),
        currency: 'USDT',
        vipSnapshot: 1,
        inviterHistoryDeposit: 80,
        inviterDailyDeposit: 5,
        inviteeHistoryDeposit: 120,
        inviteeDailyDeposit: 40,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 1.2,
        settledAmount: 1.2,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm2-usdt-2',
        bizDate: shiftDate(-2),
        currency: 'USDT',
        vipSnapshot: 1,
        inviterHistoryDeposit: 70,
        inviterDailyDeposit: 3,
        inviteeHistoryDeposit: 80,
        inviteeDailyDeposit: 2,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '被邀请人当日日存未达每日最低存款',
      }),
      dayRow({
        id: 'm2-usdt-3',
        bizDate: today,
        currency: 'USDT',
        vipSnapshot: 1,
        inviterHistoryDeposit: 95,
        inviterDailyDeposit: 8,
        inviteeHistoryDeposit: 150,
        inviteeDailyDeposit: 30,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 0.9,
        settledAmount: 0.9,
        status: 'pending',
        remark: '待隔日 GMT+8 12:00 派发',
      }),
    ],
  },
  {
    id: 'm3',
    nickname: '星辰大海',
    diamondId: '88291166',
    registeredAt: atTime(shiftDate(-12), '21:18:40'),
    vipLevel: 8,
    meetsCondition: true,
    totals: {
      KKC: { deposit: 56000, withdraw: 18800, bet: 126000, rebate: 420 },
      KKV: { deposit: 12680000, withdraw: 4200000, bet: 28600000, rebate: 42000 },
      USDT: { deposit: 260, withdraw: 80, bet: 620, rebate: 2.6 },
    },
    todayRebate: { KKC: 0, KKV: 12000, USDT: 0.5 },
    dailyRows: [
      dayRow({
        id: 'm3-kkv-1',
        bizDate: shiftDate(-1),
        currency: 'KKV',
        vipSnapshot: 8,
        inviterHistoryDeposit: 5200000,
        inviterDailyDeposit: 300000,
        inviteeHistoryDeposit: 12680000,
        inviteeDailyDeposit: 1200000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 12000,
        settledAmount: 12000,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm3-kkv-2',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 8,
        inviterHistoryDeposit: 4900000,
        inviterDailyDeposit: 280000,
        inviteeHistoryDeposit: 11480000,
        inviteeDailyDeposit: 3000000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 30000,
        settledAmount: 30000,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm3-kkc-1',
        bizDate: shiftDate(-4),
        currency: 'KKC',
        vipSnapshot: 8,
        inviterHistoryDeposit: 98000,
        inviterDailyDeposit: 12000,
        inviteeHistoryDeposit: 56000,
        inviteeDailyDeposit: 56000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 420,
        settledAmount: 420,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm3-usdt-1',
        bizDate: shiftDate(-3),
        currency: 'USDT',
        vipSnapshot: 8,
        inviterHistoryDeposit: 500,
        inviterDailyDeposit: 40,
        inviteeHistoryDeposit: 260,
        inviteeDailyDeposit: 80,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 2.6,
        settledAmount: 2.6,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
    ],
  },
  {
    id: 'm4',
    nickname: '新手小白',
    diamondId: '88291200',
    registeredAt: atTime(shiftDate(-3), '11:20:00'),
    vipLevel: 0,
    meetsCondition: false,
    totals: {
      KKC: { deposit: 80, withdraw: 0, bet: 120, rebate: 0 },
      KKV: { deposit: 120000, withdraw: 20000, bet: 180000, rebate: 0 },
      USDT: { deposit: 5, withdraw: 0, bet: 8, rebate: 0 },
    },
    todayRebate: { KKC: 0, KKV: 0, USDT: 0 },
    dailyRows: [
      dayRow({
        id: 'm4-kkv-1',
        bizDate: shiftDate(-1),
        currency: 'KKV',
        vipSnapshot: 0,
        inviterHistoryDeposit: 2580000,
        inviterDailyDeposit: 180000,
        inviteeHistoryDeposit: 80000,
        inviteeDailyDeposit: 20000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '被邀请人历史累计存款未达标',
      }),
      dayRow({
        id: 'm4-kkc-1',
        bizDate: shiftDate(-2),
        currency: 'KKC',
        vipSnapshot: 0,
        inviterHistoryDeposit: 1200,
        inviterDailyDeposit: 800,
        inviteeHistoryDeposit: 80,
        inviteeDailyDeposit: 80,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'not_qualified',
        remark: '邀请人历史累计存款未达标',
      }),
    ],
  },
  {
    id: 'm5',
    nickname: 'mige88',
    diamondId: '88291318',
    registeredAt: atTime(shiftDate(-5), '16:48:22'),
    vipLevel: 5,
    meetsCondition: true,
    totals: {
      KKC: { deposit: 0, withdraw: 0, bet: 0, rebate: 0 },
      KKV: { deposit: 1680000, withdraw: 480000, bet: 3920000, rebate: 14800 },
      USDT: { deposit: 80, withdraw: 20, bet: 160, rebate: 0.8 },
    },
    todayRebate: { KKC: 0, KKV: 0, USDT: 0 },
    dailyRows: [
      dayRow({
        id: 'm5-kkv-1',
        bizDate: shiftDate(-5),
        currency: 'KKV',
        vipSnapshot: 5,
        inviterHistoryDeposit: 3200000,
        inviterDailyDeposit: 200000,
        inviteeHistoryDeposit: 1680000,
        inviteeDailyDeposit: 680000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 14800,
        settledAmount: 14800,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
      dayRow({
        id: 'm5-kkv-2',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 5,
        inviterHistoryDeposit: 3000000,
        inviterDailyDeposit: 180000,
        inviteeHistoryDeposit: 1500000,
        inviteeDailyDeposit: 200000,
        meetsThreshold: false,
        eligibleStatus: 'cancelled',
        rebateAmount: 0,
        settledAmount: 0,
        status: 'cancelled',
        remark: '被邀请人已成为代理，取消返利资格',
      }),
      dayRow({
        id: 'm5-usdt-1',
        bizDate: shiftDate(-2),
        currency: 'USDT',
        vipSnapshot: 5,
        inviterHistoryDeposit: 200,
        inviterDailyDeposit: 20,
        inviteeHistoryDeposit: 80,
        inviteeDailyDeposit: 80,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 0.8,
        settledAmount: 0.8,
        status: 'settled',
        remark: '双方日存与历史累计均达标',
      }),
    ],
  },
]

export function findInviteMember(id: string) {
  return MOCK_INVITE_FRIENDS.find((m) => m.id === id)
}

/** 按业务日 + 币种过滤每日明细，业务日倒序 */
export function filterMemberDailyRows(
  member: InviteFriendMember,
  startDate: string,
  endDate: string,
  currency: InviteCurrency,
) {
  const start = startDate || endDate
  const end = endDate || startDate
  return member.dailyRows
    .filter((d) => {
      if (d.currency !== currency) return false
      if (start && d.bizDate < start) return false
      if (end && d.bizDate > end) return false
      return true
    })
    .sort((a, b) => (a.bizDate < b.bizDate ? 1 : a.bizDate > b.bizDate ? -1 : 0))
}

export function sumDailySettled(rows: InviteDailyRebateRow[]) {
  return rows.reduce((sum, item) => sum + item.settledAmount, 0)
}

export function isFilterTodayOnly(startDate: string, endDate: string) {
  const today = todayDateStr()
  return startDate === today && endDate === today
}
