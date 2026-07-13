/** 账单统计 · Mock 与筛选项 */

export type BillingStatsRangeKey =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'

export type BillingStatsRankMode = 'expense' | 'income'

export type BillingStatsRankItem = {
  id: string
  name: string
  amount: number
  count: number
}

export const BILLING_STATS_RANGE_OPTIONS: { key: BillingStatsRangeKey; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastWeek', label: '上周' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
]

export type BillingStatsCurrencyKind = 'crypto' | 'fiat' | 'credit'

export type BillingStatsCurrencyOption = {
  value: string
  label: string
  symbol: string
  color: string
  kind: BillingStatsCurrencyKind
  tip?: string
}

export const BILLING_STATS_CURRENCY_TABS: { key: 'all' | BillingStatsCurrencyKind; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'crypto', label: '虚拟币' },
  { key: 'fiat', label: '法币' },
  { key: 'credit', label: '信用额度' },
]

export const BILLING_STATS_CURRENCY_OPTIONS: BillingStatsCurrencyOption[] = [
  { value: 'KKC', label: 'KKC', symbol: 'K', color: '#ff7a2b', kind: 'fiat' },
  { value: 'KKV', label: 'KKV', symbol: 'V', color: '#ec4899', kind: 'fiat' },
  { value: 'USDT-TRON', label: 'USDT-TRON', symbol: '₮', color: '#26a17b', kind: 'crypto' },
  {
    value: 'CNY',
    label: 'CNY',
    symbol: '¥',
    color: '#ff7a2b',
    kind: 'credit',
    tip: '仅限特定游戏使用',
  },
  {
    value: 'USD',
    label: 'USD',
    symbol: '$',
    color: '#3b82f6',
    kind: 'credit',
    tip: '仅限特定游戏使用',
  },
]

export function filterBillingStatsCurrencyOptions(
  options: BillingStatsCurrencyOption[],
  tab: 'all' | BillingStatsCurrencyKind,
) {
  if (tab === 'all') return options
  return options.filter((item) => item.kind === tab)
}

export const BILLING_STATS_GAME_OPTIONS = [
  { value: '', label: '所有游戏' },
  { value: 'sport', label: '体育' },
  { value: 'live', label: '真人' },
  { value: 'slot', label: '电子' },
  { value: 'lottery', label: '彩票' },
  { value: 'chess', label: '棋牌' },
] as const

/** 原型基准日：与系统演示日期对齐 */
export const BILLING_STATS_BASE_DATE = '2026-07-13'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatYmd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfWeek(d: Date) {
  const day = d.getDay() || 7
  const next = new Date(d)
  next.setDate(d.getDate() - day + 1)
  return next
}

function endOfWeek(d: Date) {
  const start = startOfWeek(d)
  const next = new Date(start)
  next.setDate(start.getDate() + 6)
  return next
}

export function getBillingStatsRange(key: BillingStatsRangeKey, baseDate = BILLING_STATS_BASE_DATE) {
  const base = parseYmd(baseDate)
  if (key === 'today') {
    const ymd = formatYmd(base)
    return { start: ymd, end: ymd, label: ymd }
  }
  if (key === 'yesterday') {
    const d = new Date(base)
    d.setDate(base.getDate() - 1)
    const ymd = formatYmd(d)
    return { start: ymd, end: ymd, label: ymd }
  }
  if (key === 'thisWeek') {
    const start = startOfWeek(base)
    const end = endOfWeek(base)
    return { start: formatYmd(start), end: formatYmd(end), label: formatYmd(base) }
  }
  if (key === 'lastWeek') {
    const ref = new Date(base)
    ref.setDate(base.getDate() - 7)
    const start = startOfWeek(ref)
    const end = endOfWeek(ref)
    return { start: formatYmd(start), end: formatYmd(end), label: formatYmd(end) }
  }
  if (key === 'thisMonth') {
    const start = new Date(base.getFullYear(), base.getMonth(), 1)
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
    return { start: formatYmd(start), end: formatYmd(end), label: formatYmd(base) }
  }
  const start = new Date(base.getFullYear(), base.getMonth() - 1, 1)
  const end = new Date(base.getFullYear(), base.getMonth(), 0)
  return { start: formatYmd(start), end: formatYmd(end), label: formatYmd(end) }
}

export type BillingStatsSummary = {
  expense: number
  expenseCount: number
  income: number
  incomeCount: number
  net: number
}

/** 默认空态（对齐截图）；切换币种/周期后可展示演示数据 */
export const BILLING_STATS_DEMO_BY_CURRENCY: Record<
  string,
  { summary: BillingStatsSummary; expenseRank: BillingStatsRankItem[]; incomeRank: BillingStatsRankItem[] }
> = {
  KKC: {
    summary: { expense: 0, expenseCount: 0, income: 0, incomeCount: 0, net: 0 },
    expenseRank: [],
    incomeRank: [],
  },
  KKV: {
    summary: { expense: 1288.5, expenseCount: 6, income: 2560, incomeCount: 4, net: 1271.5 },
    expenseRank: [
      { id: 'sport', name: '体育', amount: 680.5, count: 3 },
      { id: 'live', name: '真人', amount: 408, count: 2 },
      { id: 'slot', name: '电子', amount: 200, count: 1 },
    ],
    incomeRank: [
      { id: 'bonus', name: '奖金', amount: 1280, count: 2 },
      { id: 'receive', name: '收款', amount: 880, count: 1 },
      { id: 'redpacket', name: '红包', amount: 400, count: 1 },
    ],
  },
  'USDT-TRON': {
    summary: { expense: 120.5, expenseCount: 1, income: 500, incomeCount: 2, net: 379.5 },
    expenseRank: [{ id: 'withdraw', name: '提现', amount: 120.5, count: 1 }],
    incomeRank: [
      { id: 'recharge', name: '充值', amount: 300, count: 1 },
      { id: 'receive', name: '收款', amount: 200, count: 1 },
    ],
  },
  CNY: {
    summary: { expense: 15, expenseCount: 1, income: 70, incomeCount: 2, net: 55 },
    expenseRank: [{ id: 'xcoin_down', name: '上下分-下分', amount: 15, count: 1 }],
    incomeRank: [
      { id: 'xcoin_up', name: '上下分-上分', amount: 70, count: 2 },
    ],
  },
}

export function getBillingStatsBundle(currency: string) {
  return (
    BILLING_STATS_DEMO_BY_CURRENCY[currency] ?? {
      summary: { expense: 0, expenseCount: 0, income: 0, incomeCount: 0, net: 0 },
      expenseRank: [],
      incomeRank: [],
    }
  )
}

export function formatBillingStatsAmount(amount: number, signed: 'expense' | 'income' | 'net') {
  const abs = Math.abs(amount).toFixed(2)
  if (signed === 'expense') return `-${abs}`
  if (signed === 'income') return `+${abs}`
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${Math.abs(amount).toFixed(2)}`
}

export function formatBillingStatsCount(count: number) {
  return `${count}笔`
}
