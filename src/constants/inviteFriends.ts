/** 移动端 · 邀请好友 / 邀请好友记录 · Mock */

export type InviteCurrency = 'KKC' | 'KKV' | 'USDT'

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
 * 邀请人活动币种：由后台「绑定手机号区号 ↔ 币种」配置决定，一人仅一种。
 * 原型默认跟随「我的」偏好法币映射。
 */
export const INVITER_BOUND_CURRENCY: InviteCurrency = resolveDefaultInviteCurrency()

/** VIP 0～9 对应日返利上限（按币种量级） */
export const VIP_DAILY_REBATE_CAP: Record<InviteCurrency, number[]> = {
  KKC: [6880000, 6880000, 6880000, 6880000, 6880000, 6880000, 9888000, 12888000, 16888000, 58880000],
  KKV: [6880000, 6880000, 6880000, 6880000, 6880000, 6880000, 9888000, 12888000, 16888000, 58880000],
  USDT: [344, 344, 344, 344, 344, 344, 494, 644, 844, 2944],
}

export type InviteRebateStatus = 'success' | 'not_qualified' | 'daily_capped'

export type InviteRebateType = 'first' | 'repeat' | 'history_threshold' | 'daily_cap'

export type InviteRebateRecord = {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** YYYY-MM-DD HH:mm:ss · 充值时间 */
  occurredAt: string
  /** 充值币种 */
  currency: InviteCurrency
  /** 充值金额 */
  deposit: number
  /** 充值汇率 */
  exchangeRate: number
  /** 实际充值（计入活动核算的金额） */
  activityAmount: number
  /** 实际到账返利（未达标/当日上限为 0） */
  rebate: number
  /** 返利比例，如 0.01 = 1% */
  rate: number
  rebateType: InviteRebateType
  status: InviteRebateStatus
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
  totals: Record<InviteCurrency, { deposit: number; rebate: number }>
  /** 今日已获得返利（按币种，用于上限进度） */
  todayRebate: Record<InviteCurrency, number>
  records: InviteRebateRecord[]
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

/** 实际充值 / 汇总展示法币：KKC→CNY，KKV→VND，USDT→VND（原型 Mock） */
export function inviteFiatLabel(currency: InviteCurrency) {
  if (currency === 'KKC') return 'CNY'
  return 'VND'
}

/** 汇总条展示用法币名（当前 Mock：VND） */
export const INVITER_BOUND_FIAT_LABEL = inviteFiatLabel(INVITER_BOUND_CURRENCY)

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

export function formatRebateRate(rate: number) {
  const pct = rate * 100
  return `${Number.isInteger(pct) ? pct : pct.toFixed(2)}%`
}

export function formatExchangeRate(rate: number) {
  return rate.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

export function rebateTypeLabel(type: InviteRebateType) {
  if (type === 'first') return '首充'
  if (type === 'history_threshold') return '达标历史门槛'
  if (type === 'daily_cap') return '当日上限'
  return '复充'
}

/**
 * 展示类型：
 * - 触达当日 VIP 返利上限 →「当日上限」
 * - 同币种时间最早一笔 →「首充」
 * - 达标历史门槛保留；其余为「复充」
 */
export function resolveRebateTypeForDisplay(
  member: InviteFriendMember,
  record: InviteRebateRecord,
): InviteRebateType {
  if (record.status === 'daily_capped' || record.rebateType === 'daily_cap') return 'daily_cap'
  const sameCurrency = member.records.filter((item) => item.currency === record.currency)
  if (!sameCurrency.length) return record.rebateType
  const earliest = sameCurrency.reduce((min, item) =>
    item.occurredAt < min.occurredAt ? item : min,
  )
  if (record.id === earliest.id) return 'first'
  if (record.rebateType === 'history_threshold') return 'history_threshold'
  return 'repeat'
}

export function rebateStatusLabel(status: InviteRebateStatus) {
  if (status === 'not_qualified') return '未达标'
  if (status === 'daily_capped') return '当日上限'
  return '已到账'
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
  keyword: string
  timePreset: InviteTimePreset
  customStart: string
  customEnd: string
  vipLevel: '' | number
}

export function createDefaultInviteFilter(): InviteRecordsFilter {
  return syncInviteFilterDates({
    keyword: '',
    timePreset: 'month',
    customStart: '',
    customEnd: '',
    vipLevel: '',
  })
}

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

export function getInviteMemberSearchHaystack(member: InviteFriendMember) {
  return [member.nickname, member.diamondId, member.id].filter(Boolean).join(' ')
}

/** 按注册时间 + 关键词 + VIP 过滤 */
export function filterInviteMembers(rows: InviteFriendMember[], filter: InviteRecordsFilter) {
  const keyword = filter.keyword.trim().toLowerCase()
  const { start, end } = getInviteDateRange(filter)

  return rows.filter((row) => {
    const registeredAt = parseDateTime(row.registeredAt)
    if (registeredAt < start || registeredAt > end) return false
    if (filter.vipLevel !== '' && row.vipLevel !== filter.vipLevel) return false
    if (!keyword) return true
    return getInviteMemberSearchHaystack(row).toLowerCase().includes(keyword)
  })
}

export type InviteMembersSummary = {
  currency: InviteCurrency
  inviteCount: number
  eligibleCount: number
  deposit: number
  rebate: number
}

/** 按邀请人绑定币种汇总当前筛选结果 */
export function summarizeInviteMembers(
  rows: InviteFriendMember[],
  currency: InviteCurrency = INVITER_BOUND_CURRENCY,
): InviteMembersSummary {
  const qualified = rows.filter((m) => m.meetsCondition)
  return {
    currency,
    inviteCount: rows.length,
    eligibleCount: qualified.length,
    deposit: qualified.reduce((sum, m) => sum + m.totals[currency].deposit, 0),
    rebate: qualified.reduce((sum, m) => sum + m.totals[currency].rebate, 0),
  }
}

function rec(
  partial: Omit<InviteRebateRecord, 'exchangeRate' | 'activityAmount'> &
    Partial<Pick<InviteRebateRecord, 'exchangeRate' | 'activityAmount'>>,
): InviteRebateRecord {
  // USDT → VND 原型汇率；KKC/KKV 默认 1
  const exchangeRate = partial.exchangeRate ?? (partial.currency === 'USDT' ? 25400 : 1)
  return {
    ...partial,
    exchangeRate,
    // 实际充值 = 充值金额 × 汇率；未达标记 0
    activityAmount:
      partial.activityAmount ??
      (partial.status === 'not_qualified' ? 0 : partial.deposit * exchangeRate),
  }
}

export const MOCK_INVITE_FRIENDS: InviteFriendMember[] = [
  {
    id: 'm1',
    nickname: '小幸运',
    diamondId: '88291001',
    registeredAt: atTime(today, '14:22:08'),
    vipLevel: 3,
    meetsCondition: true,
    totals: {
      KKC: { deposit: 0, rebate: 0 },
      KKV: { deposit: 2580000, rebate: 21600 },
      USDT: { deposit: 0, rebate: 0 },
    },
    todayRebate: { KKC: 0, KKV: 10000, USDT: 0 },
    records: [
      // KKV / VND 首充：时间最早一笔（昨日）
      rec({
        id: 'd4',
        date: shiftDate(-1),
        occurredAt: atTime(shiftDate(-1), '20:18:40'),
        currency: 'KKV',
        deposit: 880000,
        rebate: 6600,
        rate: 0.01,
        rebateType: 'first',
        status: 'success',
      }),
      rec({
        id: 'd1',
        date: today,
        occurredAt: atTime(today, '10:12:08'),
        currency: 'KKV',
        deposit: 500000,
        rebate: 5000,
        rate: 0.01,
        rebateType: 'repeat',
        status: 'success',
      }),
      rec({
        id: 'd2',
        date: today,
        occurredAt: atTime(today, '14:22:08'),
        currency: 'KKV',
        deposit: 200000,
        rebate: 0,
        rate: 0.01,
        rebateType: 'repeat',
        status: 'not_qualified',
      }),
      rec({
        id: 'd2b',
        date: today,
        occurredAt: atTime(today, '16:05:33'),
        currency: 'KKV',
        deposit: 300000,
        rebate: 3000,
        rate: 0.01,
        rebateType: 'history_threshold',
        status: 'success',
      }),
      rec({
        id: 'd2c',
        date: today,
        occurredAt: atTime(today, '19:40:11'),
        currency: 'KKV',
        deposit: 800000,
        rebate: 0,
        rate: 0.01,
        rebateType: 'daily_cap',
        status: 'daily_capped',
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
      KKC: { deposit: 0, rebate: 0 },
      KKV: { deposit: 980000, rebate: 9800 },
      USDT: { deposit: 0, rebate: 0 },
    },
    todayRebate: { KKC: 0, KKV: 9800, USDT: 0 },
    records: [
      rec({
        id: 'd6',
        date: today,
        occurredAt: atTime(today, '09:18:22'),
        currency: 'KKV',
        deposit: 980000,
        rebate: 9800,
        rate: 0.01,
        rebateType: 'first',
        status: 'success',
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
      KKC: { deposit: 0, rebate: 0 },
      KKV: { deposit: 12680000, rebate: 88600 },
      USDT: { deposit: 0, rebate: 0 },
    },
    todayRebate: { KKC: 0, KKV: 12000, USDT: 0 },
    records: [
      rec({
        id: 'd8',
        date: today,
        occurredAt: atTime(today, '12:33:18'),
        currency: 'KKV',
        deposit: 1200000,
        rebate: 12000,
        rate: 0.01,
        rebateType: 'repeat',
        status: 'success',
      }),
      // KKV 首充在更早日期
      rec({
        id: 'd10',
        date: shiftDate(-3),
        occurredAt: atTime(shiftDate(-3), '21:18:40'),
        currency: 'KKV',
        deposit: 3000000,
        rebate: 30000,
        rate: 0.01,
        rebateType: 'first',
        status: 'success',
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
      KKC: { deposit: 0, rebate: 0 },
      KKV: { deposit: 120000, rebate: 0 },
      USDT: { deposit: 0, rebate: 0 },
    },
    todayRebate: { KKC: 0, KKV: 0, USDT: 0 },
    records: [],
  },
  {
    id: 'm5',
    nickname: 'mige88',
    diamondId: '88291318',
    registeredAt: atTime(shiftDate(-5), '16:48:22'),
    vipLevel: 5,
    meetsCondition: true,
    totals: {
      KKC: { deposit: 0, rebate: 0 },
      KKV: { deposit: 1680000, rebate: 14800 },
      USDT: { deposit: 0, rebate: 0 },
    },
    todayRebate: { KKC: 0, KKV: 0, USDT: 0 },
    records: [
      rec({
        id: 'd11',
        date: shiftDate(-5),
        occurredAt: atTime(shiftDate(-5), '17:02:11'),
        currency: 'KKV',
        deposit: 680000,
        rebate: 6800,
        rate: 0.01,
        rebateType: 'first',
        status: 'success',
      }),
    ],
  },
]

export function findInviteMember(id: string) {
  return MOCK_INVITE_FRIENDS.find((m) => m.id === id)
}

export function filterMemberRecords(
  member: InviteFriendMember,
  startDate: string,
  endDate: string,
  currency: InviteCurrency,
) {
  const start = startDate || endDate
  const end = endDate || startDate
  return member.records
    .filter((d) => {
      if (d.currency !== currency) return false
      if (start && d.date < start) return false
      if (end && d.date > end) return false
      return true
    })
    // 充值时间倒序：最新在上
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : 0))
    .map((d) => ({
      ...d,
      rebateType: resolveRebateTypeForDisplay(member, d),
    }))
}

export function sumRebateRecords(records: InviteRebateRecord[]) {
  return records.reduce(
    (acc, item) => {
      acc.deposit += item.deposit
      acc.rebate += item.rebate
      return acc
    },
    { deposit: 0, rebate: 0 },
  )
}

export function isFilterTodayOnly(startDate: string, endDate: string) {
  const today = todayDateStr()
  return startDate === today && endDate === today
}
