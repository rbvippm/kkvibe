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
  inviterBizDayDeposit: number
  inviterRechargeDayDeposit: number
  inviteeBizDayDeposit: number
  inviteeRechargeDayDeposit: number
  meetsThreshold: boolean
  eligibleStatus: InviteDailyEligibleStatus
  /** 预估返利 */
  rebateAmount: number
  /** 已领返利（未领为 0） */
  claimedAmount: number
  status: InviteDailySettleStatus
  /** 领取开放：业务日 T+1 的 GMT+7 12:00 */
  claimOpenAt: string
  /** 过期时刻 */
  expireAt: string
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
   * false 为「不可计奖」：不进入明细、不展示返利金额。
   * 统计 Banner「可计奖」即对本字段为 true 的被邀请人计数。
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

/**
 * 卡片「VIP当日上限」展示口径：
 * - 触达上限：当日可用上限即实发（已被截断），用实发回显，避免配置表大额与 Mock 小额不一致；
 * - 其它状态：按 VIP 快照查配置表上限。
 */
export function resolveInviteVipDayCapDisplay(row: InviteDailyRebateRow) {
  if (row.status === 'claimed' && row.claimedAmount < row.rebateAmount) return row.claimedAmount
  return vipDailyCap(row.vipSnapshot, row.currency)
}

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

/** 返利按业务日查询：不含「今天」（业务日通常尚未完整结算） */
export const INVITE_REBATE_TIME_PRESETS: {
  key: Exclude<InviteQuickTimePreset, 'today'>
  label: string
}[] = [
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

/** 列表历史筛选项（无全部）；明细页请用 INVITE_DETAIL_CURRENCY_OPTIONS */
export const INVITE_FILTER_CURRENCY_OPTIONS = INVITE_CURRENCY_OPTIONS

/** 返利明细币种筛选：含「全部」 */
export type InviteDetailCurrencyFilter = '' | InviteCurrency

export const INVITE_DETAIL_CURRENCY_OPTIONS: {
  value: InviteDetailCurrencyFilter
  label: string
}[] = [{ value: '', label: '全部' }, ...INVITE_CURRENCY_OPTIONS]

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

/** 按注册时间 + VIP 过滤；币种筛选已下沉到返利明细，列表不再按币种过滤 */
export function filterInviteMembers(
  rows: InviteFriendMember[],
  filter: InviteRecordsFilter,
  _options?: { ignoreCurrency?: boolean },
) {
  const { start, end } = getInviteDateRange(filter)

  return rows.filter((row) => {
    const registeredAt = parseDateTime(row.registeredAt)
    if (registeredAt < start || registeredAt > end) return false
    if (filter.vipLevel !== '' && row.vipLevel !== filter.vipLevel) return false
    return true
  })
}

/** 列表金额按 KKC / KKV / USDT 分行展示（原生金额，不换算） */
export function listMemberCurrencyAmounts(
  member: InviteFriendMember,
  field: 'deposit' | 'withdraw' | 'bet' | 'rebate',
): { currency: InviteCurrency; text: string; value: number }[] {
  return INVITE_CURRENCY_OPTIONS.map((opt) => {
    const value = member.totals[opt.value][field]
    return {
      currency: opt.value,
      value,
      text: formatInviteAmount(value, opt.value),
    }
  })
}

/** 进入返利明细默认币种：优先有返利/业务日数据的币种 */
export function resolveDetailEntryCurrency(member: InviteFriendMember): InviteCurrency {
  for (const opt of INVITE_CURRENCY_OPTIONS) {
    if (
      member.totals[opt.value].rebate > 0 ||
      member.dailyRows.some((row) => row.currency === opt.value)
    ) {
      return opt.value
    }
  }
  return resolveDefaultInviteCurrency()
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

/** @deprecated 列表已取消币种筛选；进入明细请用 resolveDetailEntryCurrency */
export function resolveMemberDisplayCurrency(
  member: InviteFriendMember,
  _filterCurrency?: InviteCurrency,
): InviteCurrency {
  return resolveDetailEntryCurrency(member)
}

/** 领取开放：业务日 T+1 的 GMT+7 12:00 */
function dailyClaimOpenAt(bizDate: string) {
  const [y, m, day] = bizDate.split('-').map(Number)
  const open = new Date(y, m - 1, day + 1)
  return `${todayDateStr(open)} 12:00:00`
}

/** 过期：startOfDay(T+1)+(X===0?1:X) 天，默认 X=1 → T+2 00:00 */
function dailyExpireAt(bizDate: string, claimValidityDays = 1) {
  const [y, m, day] = bizDate.split('-').map(Number)
  const x = claimValidityDays === 0 ? 1 : claimValidityDays
  const exp = new Date(y, m - 1, day + 1 + x)
  return `${todayDateStr(exp)} 00:00:00`
}

function dayRow(
  partial: Omit<InviteDailyRebateRow, 'claimOpenAt' | 'expireAt' | 'claimedAmount'> &
    Partial<Pick<InviteDailyRebateRow, 'claimOpenAt' | 'expireAt' | 'claimedAmount'>>,
): InviteDailyRebateRow {
  const claimedAmount =
    partial.status === 'claimed' ? (partial.claimedAmount ?? partial.rebateAmount) : 0
  return {
    ...partial,
    claimedAmount,
    claimOpenAt: partial.claimOpenAt ?? dailyClaimOpenAt(partial.bizDate),
    expireAt: partial.expireAt ?? dailyExpireAt(partial.bizDate),
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
        inviterBizDayDeposit: 2580000,
        inviterRechargeDayDeposit: 180000,
        inviteeBizDayDeposit: 2580000,
        inviteeRechargeDayDeposit: 220000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 21600,
        claimedAmount: 21600,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm1-kkv-2',
        bizDate: shiftDate(-2),
        currency: 'KKV',
        vipSnapshot: 3,
        inviterBizDayDeposit: 2400000,
        inviterRechargeDayDeposit: 160000,
        inviteeBizDayDeposit: 2360000,
        inviteeRechargeDayDeposit: 180000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 19800,
        claimedAmount: 19800,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm1-kkv-3',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterBizDayDeposit: 2240000,
        inviterRechargeDayDeposit: 90000,
        inviteeBizDayDeposit: 800,
        inviteeRechargeDayDeposit: 45000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'locked',
        remark: '好友当日存款未达触发门槛，暂不可领取',
      }),
      dayRow({
        id: 'm1-kkv-4',
        bizDate: shiftDate(-4),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterBizDayDeposit: 2150000,
        inviterRechargeDayDeposit: 150000,
        inviteeBizDayDeposit: 2135000,
        inviteeRechargeDayDeposit: 160000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 17200,
        claimedAmount: 17200,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm1-kkv-5',
        bizDate: shiftDate(-5),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterBizDayDeposit: 2000000,
        inviterRechargeDayDeposit: 140000,
        inviteeBizDayDeposit: 1975000,
        inviteeRechargeDayDeposit: 155000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 16800,
        claimedAmount: 12000,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm1-kkv-6',
        bizDate: shiftDate(-6),
        currency: 'KKV',
        vipSnapshot: 2,
        inviterBizDayDeposit: 1860000,
        inviterRechargeDayDeposit: 130000,
        inviteeBizDayDeposit: 1820000,
        inviteeRechargeDayDeposit: 142000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 15400,
        claimedAmount: 0,
        status: 'expired',
        remark: '已超过领取有效期，奖金已失效',
      }),
      dayRow({
        id: 'm1-kkv-7',
        bizDate: shiftDate(-7),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterBizDayDeposit: 1730000,
        inviterRechargeDayDeposit: 80000,
        inviteeBizDayDeposit: 1678000,
        inviteeRechargeDayDeposit: 150000,
        meetsThreshold: true,
        eligibleStatus: 'ineligible',
        rebateAmount: 16780,
        claimedAmount: 0,
        status: 'locked',
        remark: '请先绑定手机号后再解锁领取',
      }),
      dayRow({
        id: 'm1-kkc-1',
        bizDate: shiftDate(-2),
        currency: 'KKC',
        vipSnapshot: 3,
        inviterBizDayDeposit: 42000,
        inviterRechargeDayDeposit: 3600,
        inviteeBizDayDeposit: 12800,
        inviteeRechargeDayDeposit: 4800,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 128,
        claimedAmount: 128,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm1-usdt-1',
        bizDate: shiftDate(-2),
        currency: 'USDT',
        vipSnapshot: 3,
        inviterBizDayDeposit: 200,
        inviterRechargeDayDeposit: 25,
        inviteeBizDayDeposit: 86,
        inviteeRechargeDayDeposit: 40,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 0.86,
        claimedAmount: 0.86,
        status: 'claimed',
        remark: '',
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
        inviterBizDayDeposit: 2580000,
        inviterRechargeDayDeposit: 180000,
        inviteeBizDayDeposit: 980000,
        inviteeRechargeDayDeposit: 150000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 9800,
        claimedAmount: 9800,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm2-kkv-2',
        bizDate: shiftDate(-2),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterBizDayDeposit: 2760000,
        inviterRechargeDayDeposit: 160000,
        inviteeBizDayDeposit: 1100000,
        inviteeRechargeDayDeposit: 120000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 8600,
        claimedAmount: 8600,
        status: 'claimable',
        remark: '',
      }),
      dayRow({
        id: 'm2-kkv-3',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterBizDayDeposit: 2400000,
        inviterRechargeDayDeposit: 90000,
        inviteeBizDayDeposit: 830000,
        inviteeRechargeDayDeposit: 28000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'locked',
        remark: '好友次日存款未达解锁门槛，暂不可领取',
      }),
      dayRow({
        id: 'm2-kkv-4',
        bizDate: shiftDate(-4),
        currency: 'KKV',
        vipSnapshot: 1,
        inviterBizDayDeposit: 2310000,
        inviterRechargeDayDeposit: 140000,
        inviteeBizDayDeposit: 802000,
        inviteeRechargeDayDeposit: 220000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 16800,
        claimedAmount: 12000,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm2-kkc-1',
        bizDate: shiftDate(-1),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterBizDayDeposit: 38000,
        inviterRechargeDayDeposit: 2800,
        inviteeBizDayDeposit: 5600,
        inviteeRechargeDayDeposit: 2200,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 56,
        claimedAmount: 56,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm2-kkc-2',
        bizDate: shiftDate(-2),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterBizDayDeposit: 42000,
        inviterRechargeDayDeposit: 3200,
        inviteeBizDayDeposit: 8600,
        inviteeRechargeDayDeposit: 3000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 42,
        claimedAmount: 42,
        status: 'claimable',
        remark: '',
      }),
      dayRow({
        id: 'm2-kkc-3',
        bizDate: shiftDate(-3),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterBizDayDeposit: 34800,
        inviterRechargeDayDeposit: 1800,
        inviteeBizDayDeposit: 3400,
        inviteeRechargeDayDeposit: 80,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'locked',
        remark: '好友次日存款未达解锁门槛，暂不可领取',
      }),
      dayRow({
        id: 'm2-kkc-4',
        bizDate: shiftDate(-4),
        currency: 'KKC',
        vipSnapshot: 1,
        inviterBizDayDeposit: 33000,
        inviterRechargeDayDeposit: 2600,
        inviteeBizDayDeposit: 13200,
        inviteeRechargeDayDeposit: 7600,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 220,
        claimedAmount: 132,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm2-kkc-5',
        bizDate: shiftDate(-6),
        currency: 'KKC',
        vipSnapshot: 0,
        inviterBizDayDeposit: 28000,
        inviterRechargeDayDeposit: 2000,
        inviteeBizDayDeposit: 2200,
        inviteeRechargeDayDeposit: 900,
        meetsThreshold: false,
        eligibleStatus: 'cancelled',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'cancelled',
        remark: '您已成为代理，返利资格已取消',
      }),
      dayRow({
        id: 'm2-usdt-1',
        bizDate: shiftDate(-1),
        currency: 'USDT',
        vipSnapshot: 1,
        inviterBizDayDeposit: 80,
        inviterRechargeDayDeposit: 5,
        inviteeBizDayDeposit: 120,
        inviteeRechargeDayDeposit: 40,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 1.2,
        claimedAmount: 1.2,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm2-usdt-2',
        bizDate: shiftDate(-2),
        currency: 'USDT',
        vipSnapshot: 1,
        inviterBizDayDeposit: 70,
        inviterRechargeDayDeposit: 3,
        inviteeBizDayDeposit: 80,
        inviteeRechargeDayDeposit: 2,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'locked',
        remark: '好友次日存款未达解锁门槛，暂不可领取',
      }),
      dayRow({
        id: 'm2-usdt-3',
        bizDate: shiftDate(-1),
        currency: 'USDT',
        vipSnapshot: 1,
        inviterBizDayDeposit: 95,
        inviterRechargeDayDeposit: 8,
        inviteeBizDayDeposit: 150,
        inviteeRechargeDayDeposit: 30,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 0.9,
        claimedAmount: 0.9,
        status: 'claimable',
        remark: '',
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
        inviterBizDayDeposit: 5200000,
        inviterRechargeDayDeposit: 300000,
        inviteeBizDayDeposit: 12680000,
        inviteeRechargeDayDeposit: 1200000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 12000,
        claimedAmount: 12000,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm3-kkv-2',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 8,
        inviterBizDayDeposit: 4900000,
        inviterRechargeDayDeposit: 280000,
        inviteeBizDayDeposit: 11480000,
        inviteeRechargeDayDeposit: 3000000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 30000,
        claimedAmount: 30000,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm3-kkc-1',
        bizDate: shiftDate(-4),
        currency: 'KKC',
        vipSnapshot: 8,
        inviterBizDayDeposit: 98000,
        inviterRechargeDayDeposit: 12000,
        inviteeBizDayDeposit: 56000,
        inviteeRechargeDayDeposit: 56000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 420,
        claimedAmount: 420,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm3-usdt-1',
        bizDate: shiftDate(-3),
        currency: 'USDT',
        vipSnapshot: 8,
        inviterBizDayDeposit: 500,
        inviterRechargeDayDeposit: 40,
        inviteeBizDayDeposit: 260,
        inviteeRechargeDayDeposit: 80,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 2.6,
        claimedAmount: 2.6,
        status: 'claimed',
        remark: '',
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
        inviterBizDayDeposit: 2580000,
        inviterRechargeDayDeposit: 180000,
        inviteeBizDayDeposit: 80000,
        inviteeRechargeDayDeposit: 20000,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'locked',
        remark: '好友次日存款未达解锁门槛，暂不可领取',
      }),
      dayRow({
        id: 'm4-kkc-1',
        bizDate: shiftDate(-2),
        currency: 'KKC',
        vipSnapshot: 0,
        inviterBizDayDeposit: 1200,
        inviterRechargeDayDeposit: 800,
        inviteeBizDayDeposit: 80,
        inviteeRechargeDayDeposit: 80,
        meetsThreshold: false,
        eligibleStatus: 'ineligible',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'locked',
        remark: '您的次日存款未达解锁门槛，暂不可领取',
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
        inviterBizDayDeposit: 3200000,
        inviterRechargeDayDeposit: 200000,
        inviteeBizDayDeposit: 1680000,
        inviteeRechargeDayDeposit: 680000,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 14800,
        claimedAmount: 14800,
        status: 'claimed',
        remark: '',
      }),
      dayRow({
        id: 'm5-kkv-2',
        bizDate: shiftDate(-3),
        currency: 'KKV',
        vipSnapshot: 5,
        inviterBizDayDeposit: 3000000,
        inviterRechargeDayDeposit: 180000,
        inviteeBizDayDeposit: 1500000,
        inviteeRechargeDayDeposit: 200000,
        meetsThreshold: false,
        eligibleStatus: 'cancelled',
        rebateAmount: 0,
        claimedAmount: 0,
        status: 'cancelled',
        remark: '该好友已成为代理，返利资格已取消',
      }),
      dayRow({
        id: 'm5-usdt-1',
        bizDate: shiftDate(-2),
        currency: 'USDT',
        vipSnapshot: 5,
        inviterBizDayDeposit: 200,
        inviterRechargeDayDeposit: 20,
        inviteeBizDayDeposit: 80,
        inviteeRechargeDayDeposit: 80,
        meetsThreshold: true,
        eligibleStatus: 'eligible',
        rebateAmount: 0.8,
        claimedAmount: 0.8,
        status: 'claimed',
        remark: '',
      }),
    ],
  },
]

export function findInviteMember(id: string) {
  return MOCK_INVITE_FRIENDS.find((m) => m.id === id)
}

/** 邀请返利总览行：全部被邀请人的每日返利（附昵称） */
export type InviteRebateOverviewRow = InviteDailyRebateRow & {
  memberId: string
  nickname: string
  diamondId: string
}

/** 汇总所有满足条件的被邀请人每日返利，业务日倒序 */
export function listAllInviteRebateRows(): InviteRebateOverviewRow[] {
  return MOCK_INVITE_FRIENDS.filter((m) => m.meetsCondition)
    .flatMap((m) =>
      m.dailyRows.map((row) => ({
        ...row,
        memberId: m.id,
        nickname: m.nickname,
        diamondId: m.diamondId,
      })),
    )
    .sort((a, b) => {
      if (a.bizDate !== b.bizDate) return a.bizDate < b.bizDate ? 1 : -1
      if (a.nickname !== b.nickname) return a.nickname.localeCompare(b.nickname, 'zh-CN')
      return a.currency.localeCompare(b.currency)
    })
}

/** 可领取返利笔数（用于「我的 → 邀请好友」角标） */
export function countClaimableInviteRebates() {
  return listAllInviteRebateRows().filter((row) => row.status === 'claimable').length
}

/** 按业务日 + 币种过滤每日明细；币种为空表示全部，业务日倒序 */
export function filterMemberDailyRows(
  member: InviteFriendMember,
  startDate: string,
  endDate: string,
  currency: InviteDetailCurrencyFilter = '',
) {
  const start = startDate || endDate
  const end = endDate || startDate
  return member.dailyRows
    .filter((d) => {
      if (currency && d.currency !== currency) return false
      if (start && d.bizDate < start) return false
      if (end && d.bizDate > end) return false
      return true
    })
    .sort((a, b) => {
      if (a.bizDate !== b.bizDate) return a.bizDate < b.bizDate ? 1 : -1
      return a.currency.localeCompare(b.currency)
    })
}

export function sumDailySettled(rows: InviteDailyRebateRow[]) {
  return rows.reduce((sum, item) => sum + item.claimedAmount, 0)
}

export function isFilterTodayOnly(startDate: string, endDate: string) {
  const today = todayDateStr()
  return startDate === today && endDate === today
}
