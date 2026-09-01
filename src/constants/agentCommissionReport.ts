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
}

/** 当前登录代理层级 Mock：1 一级 / 2 二级 / 3 三级 */
export type CommissionAgentLevel = 1 | 2 | 3

export const MOCK_COMMISSION_AGENT_LEVEL: CommissionAgentLevel = 1

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

/** 返佣总成本口径（含其他成本中的充提手续费） */
export function getCommissionTotalCostTip() {
  return '总成本 = VIP退水 + VIP晋级礼金 + VIP额外奖金 + 活动金 + 充提手续费'
}

export const COMMISSION_NEGATIVE_TIP =
  '负佣金累计值：若历史仍有待冲抵的累计负佣金；则冲抵完毕后再发放正佣金。'

export const COMMISSION_NET_WIN_TIP = '净输赢 = 游戏输赢 - 总成本'

export const COMMISSION_TOTAL_TIP =
  '总佣金 = 佣金\n佣金 = （净输赢 - 负佣金累计） × 佣金比例'

export function getDefaultCommissionMonth(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** 当前登录代理成为代理的日期（原型 Mock，对齐 Figma 未入驻） */
export const MOCK_AGENT_JOIN_DATE = '2026-07-15'

export function agentJoinMonth(joinDate = MOCK_AGENT_JOIN_DATE) {
  return joinDate.slice(0, 7)
}

/** 所选结算月早于成为代理的月份 → 未入驻 */
export function isCommissionMonthBeforeJoin(month: string, joinDate = MOCK_AGENT_JOIN_DATE) {
  return Boolean(month) && month < agentJoinMonth(joinDate)
}

/** 相对当前月偏移（0=本月，-1=上月）→ YYYY-MM */
export function shiftCommissionMonth(month: string, offset: number) {
  const [ys, ms] = month.split('-')
  const y = Number(ys)
  const m = Number(ms)
  if (!y || !m) return month
  const d = new Date(y, m - 1 + offset, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type CommissionBillTemplate = Omit<CommissionMonthBill, 'month'>

/**
 * 近 12 个月模板（新→旧，相对当前月偏移 0…-11）
 * 本月待派发与历史已派发均展示负佣金累计；佣金 = (净输赢 - 负佣金累计) × 佣金比例
 */
const COMMISSION_BILL_TEMPLATES: CommissionBillTemplate[] = [
  {
    status: 'pending',
    activeUsers: 12,
    totalPnl: 2500,
    totalRebate: 186.5,
    commissionRate: '5.00%',
    venueFee: 80,
    totalCost: 120.5,
    negativeAccum: -100,
    monthCommission: 118.98,
  },
  {
    status: 'paid',
    activeUsers: 12,
    totalPnl: 2500,
    totalRebate: 186.5,
    commissionRate: '5.00%',
    venueFee: 80,
    totalCost: 120.5,
    negativeAccum: -100,
    monthCommission: 118.98,
  },
  {
    status: 'paid',
    activeUsers: 9,
    totalPnl: 1860,
    totalRebate: 142.8,
    commissionRate: '5.00%',
    venueFee: 72,
    totalCost: 108.2,
    negativeAccum: -80,
    monthCommission: 87.59,
  },
  {
    status: 'paid',
    activeUsers: 7,
    totalPnl: 1420,
    totalRebate: 118.4,
    commissionRate: '5.00%',
    venueFee: 65,
    totalCost: 98.4,
    negativeAccum: -60,
    monthCommission: 66.08,
  },
  {
    status: 'none',
    activeUsers: 1,
    totalPnl: -320,
    totalRebate: 28,
    commissionRate: '5.00%',
    venueFee: 40,
    totalCost: 55,
    negativeAccum: -100,
    monthCommission: 0,
  },
  {
    status: 'paid',
    activeUsers: 5,
    totalPnl: 980,
    totalRebate: 86.2,
    commissionRate: '5.00%',
    venueFee: 50,
    totalCost: 76,
    negativeAccum: 0,
    monthCommission: 45.2,
  },
  {
    status: 'paid',
    activeUsers: 8,
    totalPnl: 1680,
    totalRebate: 132.4,
    commissionRate: '5.00%',
    venueFee: 68,
    totalCost: 102.6,
    negativeAccum: -40,
    monthCommission: 78.87,
  },
  {
    status: 'paid',
    activeUsers: 6,
    totalPnl: 1240,
    totalRebate: 98.6,
    commissionRate: '5.00%',
    venueFee: 58,
    totalCost: 88.2,
    negativeAccum: -20,
    monthCommission: 57.59,
  },
  {
    status: 'paid',
    activeUsers: 4,
    totalPnl: 760,
    totalRebate: 64.8,
    commissionRate: '5.00%',
    venueFee: 45,
    totalCost: 62.4,
    negativeAccum: 0,
    monthCommission: 34.88,
  },
  {
    status: 'none',
    activeUsers: 2,
    totalPnl: -180,
    totalRebate: 22,
    commissionRate: '5.00%',
    venueFee: 35,
    totalCost: 48,
    negativeAccum: -50,
    monthCommission: 0,
  },
  {
    status: 'paid',
    activeUsers: 10,
    totalPnl: 2100,
    totalRebate: 168.2,
    commissionRate: '5.00%',
    venueFee: 75,
    totalCost: 112.8,
    negativeAccum: -30,
    monthCommission: 99.36,
  },
  {
    status: 'paid',
    activeUsers: 3,
    totalPnl: 540,
    totalRebate: 48.5,
    commissionRate: '5.00%',
    venueFee: 38,
    totalCost: 52.6,
    negativeAccum: 0,
    monthCommission: 24.37,
  },
]

/** 按系统当前月滚动生成近 12 个月账单（保证本月始终为待派发） */
export function getCommissionMonthBills(date = new Date()): CommissionMonthBill[] {
  const current = getDefaultCommissionMonth(date)
  return COMMISSION_BILL_TEMPLATES.map((tpl, index) => ({
    ...tpl,
    month: shiftCommissionMonth(current, -index),
  }))
}

/**
 * 近 12 个月 Mock（新→旧）；访问时按当前月滚动
 * 注意：为兼容既有 `MOCK_COMMISSION_MONTH_BILLS.find` 写法，此处用 getter 代理数组
 */
export const MOCK_COMMISSION_MONTH_BILLS: CommissionMonthBill[] = new Proxy(
  [] as CommissionMonthBill[],
  {
    get(_target, prop, receiver) {
      const bills = getCommissionMonthBills()
      const value = Reflect.get(bills, prop, receiver)
      return typeof value === 'function' ? value.bind(bills) : value
    },
    ownKeys() {
      return Reflect.ownKeys(getCommissionMonthBills())
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(getCommissionMonthBills(), prop)
    },
    has(_target, prop) {
      return Reflect.has(getCommissionMonthBills(), prop)
    },
  },
)

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
  bills: CommissionMonthBill[] = getCommissionMonthBills(),
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
  bills: CommissionMonthBill[] = getCommissionMonthBills(),
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
  return getCommissionMonthBills().find((bill) => bill.month === month) ?? null
}

/**
 * 待派发月展示「预计佣金」（含负佣金累计）；
 * 已派发 / 无佣金历史月展示「发放佣金」
 */
export function commissionHeroTitle(month: string, date = new Date()) {
  const bill = findCommissionBill(month)
  if (bill?.status === 'pending') return '预计佣金'
  if (month === getDefaultCommissionMonth(date)) return '预计佣金'
  return '发放佣金'
}

/** 已入驻结算月均展示负佣金累计（待派发 / 已派发 / 无佣金） */
export function shouldShowCommissionNegativeAccum(month: string) {
  return Boolean(findCommissionBill(month))
}

function parseCommissionRate(rate: string) {
  const n = Number.parseFloat(rate.replace('%', ''))
  return Number.isFinite(n) ? n / 100 : 0
}

/** 佣金 = max(净输赢 + 负佣金累计, 0) × 佣金比例（负佣金累计为 0 或负数） */
export function getCommissionMonthAmount(bill: CommissionMonthBill) {
  const netWin = getCommissionNetWin(bill)
  const rate = parseCommissionRate(bill.commissionRate)
  return Number((Math.max(netWin + bill.negativeAccum, 0) * rate).toFixed(2))
}

/** 总佣金 = 佣金（已按净输赢冲减负佣金累计，不再二次扣减） */
export function getCommissionTotal(bill: CommissionMonthBill) {
  return getCommissionMonthAmount(bill)
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
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  if (options?.signed) {
    if (value > 0) return `+${abs}`
    if (value < 0) return `-${abs}`
  }
  if (value < 0) return `-${abs}`
  return abs
}

export function commissionTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}
