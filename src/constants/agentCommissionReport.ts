/** 返佣代理 · 佣金报表 Mock（按月账单卡片结构） */

export type CommissionPayoutStatus = 'pending' | 'paid' | 'none'

export type CommissionMonthBill = {
  /** YYYY-MM */
  month: string
  status: CommissionPayoutStatus
  activeUsers: number
  totalPnl: number
  /** 总退水(月) */
  totalRebate: number
  commissionRate: string
  venueFee: number
  totalCost: number
  /** 负佣金累计：仅 0 或负数 */
  negativeAccum: number
  monthCommission: number
  extraCommission: number
  /** 赚水（仅一级代理展示） */
  earnWater: number
}

/** 当前登录代理层级 Mock：1 = 一级代理（展示赚水） */
export const MOCK_COMMISSION_AGENT_LEVEL = 1

export function isCommissionLevel1Agent(level = MOCK_COMMISSION_AGENT_LEVEL) {
  return level === 1
}

export const COMMISSION_STATUS_META: Record<
  CommissionPayoutStatus,
  { label: string; tone: 'pending' | 'paid' | 'none' }
> = {
  pending: { label: '待派发', tone: 'pending' },
  paid: { label: '已派发', tone: 'paid' },
  none: { label: '无佣金', tone: 'none' },
}

/** 非一级：不含赚水；一级：公式末项含赚水 */
export function getCommissionTotalCostTip(isLevel1 = isCommissionLevel1Agent()) {
  return isLevel1
    ? '总成本 = VIP退水 + VIP晋级礼金 + VIP额外奖金 + 活动金 + 赚水'
    : '总成本 = VIP退水 + VIP晋级礼金 + VIP额外奖金 + 活动金'
}

export const COMMISSION_NEGATIVE_TIP =
  '负佣金累计值：若历史仍有待冲抵的累计负佣金；则冲抵完毕后再发放正佣金。'

export const COMMISSION_NET_WIN_TIP = '净输赢 = 游戏输赢 - 总成本'

export const COMMISSION_TOTAL_TIP =
  '总佣金 = 当月佣金 + 额外佣金 + 负佣金累计\n当月佣金 = 直属佣金\n额外佣金 = 下一级佣金 + 下二级佣金'

/** 近半年 Mock（新→旧）；当前月为待派发「预计佣金」，历史月为已派发「发放佣金」 */
/**
 * 口径（与「我的佣金」页一致）：
 * - 净输赢 = totalPnl - totalCost
 * - 当月佣金 = 直属佣金 = max(净输赢, 0) × 佣金比例
 * - 额外佣金 = 下一级佣金 + 下二级佣金
 * - 总佣金 = 当月佣金 + 额外佣金 + 负佣金累计
 */
export const MOCK_COMMISSION_MONTH_BILLS: CommissionMonthBill[] = [
  {
    month: '2026-07',
    status: 'pending',
    activeUsers: 12,
    totalPnl: 2500,
    totalRebate: 186.5,
    commissionRate: '5.00%',
    venueFee: 80,
    totalCost: 120.5,
    negativeAccum: -100,
    monthCommission: 118.98,
    extraCommission: 118.98,
    earnWater: 36.8,
  },
  {
    month: '2026-06',
    status: 'paid',
    activeUsers: 12,
    totalPnl: 2500,
    totalRebate: 186.5,
    commissionRate: '5.00%',
    venueFee: 80,
    totalCost: 120.5,
    negativeAccum: -100,
    monthCommission: 118.98,
    extraCommission: 118.98,
    earnWater: 36.8,
  },
  {
    month: '2026-05',
    status: 'paid',
    activeUsers: 9,
    totalPnl: 1860,
    totalRebate: 142.8,
    commissionRate: '5.00%',
    venueFee: 72,
    totalCost: 108.2,
    negativeAccum: -80,
    monthCommission: 87.59,
    extraCommission: 87.6,
    earnWater: 28.4,
  },
  {
    month: '2026-04',
    status: 'paid',
    activeUsers: 7,
    totalPnl: 1420,
    totalRebate: 118.4,
    commissionRate: '5.00%',
    venueFee: 65,
    totalCost: 98.4,
    negativeAccum: -60,
    monthCommission: 66.08,
    extraCommission: 66.08,
    earnWater: 22.1,
  },
  {
    month: '2026-03',
    status: 'none',
    activeUsers: 1,
    totalPnl: -320,
    totalRebate: 28,
    commissionRate: '5.00%',
    venueFee: 40,
    totalCost: 55,
    negativeAccum: -100,
    monthCommission: 0,
    extraCommission: 0,
    earnWater: 0,
  },
  {
    month: '2026-02',
    status: 'paid',
    activeUsers: 5,
    totalPnl: 980,
    totalRebate: 86.2,
    commissionRate: '5.00%',
    venueFee: 50,
    totalCost: 76,
    negativeAccum: 0,
    monthCommission: 45.2,
    extraCommission: 45.2,
    earnWater: 15.6,
  },
]

export function getDefaultCommissionMonth(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** 展示用：2026-7（月不补零，对齐设计稿） */
export function formatCommissionMonthShort(month: string) {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `${y}-${Number(m)}`
}

export function formatCommissionMonthLabel(month: string) {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `${y}年${Number(m)}月`
}

export function getCommissionMonthOptions(
  bills: CommissionMonthBill[] = MOCK_COMMISSION_MONTH_BILLS,
  date = new Date(),
) {
  const current = getDefaultCommissionMonth(date)
  const map = new Map(bills.map((bill) => [bill.month, formatCommissionMonthLabel(bill.month)]))
  if (!map.has(current)) {
    map.set(current, formatCommissionMonthLabel(current))
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, label]) => ({ key, label, short: formatCommissionMonthShort(key) }))
}

/** 列表页月份筛选项（含全部） */
export function getCommissionListMonthOptions(
  bills: CommissionMonthBill[] = MOCK_COMMISSION_MONTH_BILLS,
  date = new Date(),
) {
  return [
    { key: 'all' as const, label: '全部月份', short: '全部' },
    ...getCommissionMonthOptions(bills, date),
  ]
}

export function filterCommissionListBills(
  bills: CommissionMonthBill[],
  month: string | 'all',
) {
  if (month === 'all') return bills
  return bills.filter((bill) => bill.month === month)
}

/** 累计已派发总佣金 */
export function sumPaidCommissionTotal(bills: CommissionMonthBill[]) {
  return bills
    .filter((bill) => bill.status === 'paid')
    .reduce((sum, bill) => sum + getCommissionTotal(bill), 0)
}

/** 列表更新时间文案 */
export function getCommissionListUpdatedAt(month: string | 'all', date = new Date()) {
  if (month === 'all') {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `更新于 ${y}-${m}-${d}`
  }
  const [y, m] = month.split('-')
  const lastDay = new Date(Number(y), Number(m), 0).getDate()
  return `更新于 ${y}-${m}-${String(lastDay).padStart(2, '0')}`
}

export function findCommissionBill(month: string) {
  return MOCK_COMMISSION_MONTH_BILLS.find((bill) => bill.month === month) ?? null
}

/** 当月展示「预计佣金」，历史月展示「发放佣金」 */
export function commissionHeroTitle(month: string, date = new Date()) {
  return month === getDefaultCommissionMonth(date) ? '预计佣金' : '发放佣金'
}

/** 总佣金 = 当月佣金(直属) + 额外佣金(下一级+下二级) + 负佣金累计 */
export function getCommissionTotal(bill: CommissionMonthBill) {
  return bill.monthCommission + bill.extraCommission + bill.negativeAccum
}

/** 净输赢 = 游戏输赢 - 总成本 */
export function getCommissionNetWin(bill: CommissionMonthBill) {
  return bill.totalPnl - bill.totalCost
}

export function formatCommissionAmount(
  value: number,
  options?: { signed?: boolean; digits?: number },
) {
  const digits = options?.digits ?? 2
  const abs = Math.abs(value).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  if (!options?.signed) return abs
  if (value > 0) return `+${abs}`
  if (value < 0) return `-${abs}`
  return abs
}

export function commissionTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}
