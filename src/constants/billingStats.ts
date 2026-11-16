/** 账单统计 · Mock 与筛选项 */

import { BET_ORDER_GAME_NAME_OPTIONS, getBetOrderCategoryLabel } from './betOrderQuery'

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

/** 游戏筛选按场馆维度，按分类分组展示；场馆与注单查询的游戏名称同一套 */
const BILLING_STATS_VENUE_CATEGORY_ORDER = ['sports', 'live', 'slots', 'lottery', 'chess'] as const

export const BILLING_STATS_VENUE_GROUPS = BILLING_STATS_VENUE_CATEGORY_ORDER.map((category) => ({
  category,
  label: getBetOrderCategoryLabel(category),
  venues: BET_ORDER_GAME_NAME_OPTIONS[category],
}))

export function getBillingStatsVenueLabel(value: string) {
  if (!value) return '所有游戏'
  for (const group of BILLING_STATS_VENUE_GROUPS) {
    const venue = group.venues.find((item) => item.value === value)
    if (venue) return venue.label
  }
  return '所有游戏'
}

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

export type BillingStatsBundle = {
  summary: BillingStatsSummary
  expenseRank: BillingStatsRankItem[]
  incomeRank: BillingStatsRankItem[]
}

/** 排行榜：游戏账变按场馆（id 为场馆值）列示，其余为充值 / 奖金 / 上下分等账单类型；汇总由排行榜累加 */
const BILLING_STATS_RANK_DEMO: Record<string, Omit<BillingStatsBundle, 'summary'>> = {
  KKC: { expenseRank: [], incomeRank: [] },
  KKV: {
    expenseRank: [
      { id: 'hz-sports', name: '皇者-体育', amount: 680.5, count: 3 },
      { id: 'ag', name: 'AG - 真人', amount: 408, count: 2 },
      { id: 'pg', name: 'PG - 电子', amount: 200, count: 1 },
    ],
    incomeRank: [
      { id: 'bonus', name: '奖金', amount: 1280, count: 2 },
      { id: 'recharge', name: '充值', amount: 880, count: 1 },
      { id: 'hz-sports', name: '皇者-体育', amount: 520, count: 2 },
      { id: 'redpacket', name: '红包', amount: 400, count: 1 },
    ],
  },
  'USDT-TRON': {
    expenseRank: [{ id: 'withdraw', name: '提现', amount: 120.5, count: 1 }],
    incomeRank: [{ id: 'recharge', name: '充值', amount: 500, count: 2 }],
  },
  CNY: {
    expenseRank: [
      { id: 'hz-sports', name: '皇者-体育', amount: 50, count: 1 },
      { id: 'hz-slots', name: '皇者-电子', amount: 28.6, count: 1 },
      { id: 'xcoin_down', name: '上下分-下分', amount: 15, count: 1 },
    ],
    incomeRank: [
      { id: 'hz-live', name: '皇者-真人', amount: 88, count: 1 },
      { id: 'xcoin_up', name: '上下分-上分', amount: 70, count: 2 },
    ],
  },
  USD: {
    expenseRank: [
      { id: 'saba', name: 'SABA - 体育', amount: 36, count: 2 },
      { id: 'xcoin_down', name: '上下分-下分', amount: 25, count: 1 },
    ],
    incomeRank: [
      { id: 'xcoin_up', name: '上下分-上分', amount: 80, count: 1 },
      { id: 'saba', name: 'SABA - 体育', amount: 45, count: 1 },
    ],
  },
}

export function summarizeBillingStatsRank(
  expenseRank: BillingStatsRankItem[],
  incomeRank: BillingStatsRankItem[],
): BillingStatsSummary {
  const sum = (list: BillingStatsRankItem[], key: 'amount' | 'count') =>
    list.reduce((acc, item) => acc + item[key], 0)
  const expense = sum(expenseRank, 'amount')
  const income = sum(incomeRank, 'amount')
  return {
    expense,
    expenseCount: sum(expenseRank, 'count'),
    income,
    incomeCount: sum(incomeRank, 'count'),
    net: income - expense,
  }
}

/** 选中某一场馆：汇总与排行榜只保留该场馆的支出 / 收入 */
export function filterBillingStatsByVenue(bundle: BillingStatsBundle, venue: string): BillingStatsBundle {
  if (!venue) return bundle
  const expenseRank = bundle.expenseRank.filter((item) => item.id === venue)
  const incomeRank = bundle.incomeRank.filter((item) => item.id === venue)
  return { summary: summarizeBillingStatsRank(expenseRank, incomeRank), expenseRank, incomeRank }
}

function rankBundle(currency: string): BillingStatsBundle {
  const ranks = BILLING_STATS_RANK_DEMO[currency] ?? { expenseRank: [], incomeRank: [] }
  return { ...ranks, summary: summarizeBillingStatsRank(ranks.expenseRank, ranks.incomeRank) }
}

function mergeBillingStatsBundles(left: BillingStatsBundle, right: BillingStatsBundle): BillingStatsBundle {
  const mergeRank = (a: BillingStatsRankItem[], b: BillingStatsRankItem[]) => {
    const map = new Map<string, BillingStatsRankItem>()
    for (const item of [...a, ...b]) {
      const prev = map.get(item.id)
      if (prev) {
        map.set(item.id, { ...prev, amount: prev.amount + item.amount, count: prev.count + item.count })
      } else {
        map.set(item.id, { ...item })
      }
    }
    return [...map.values()].sort((x, y) => y.amount - x.amount)
  }
  return {
    summary: {
      expense: left.summary.expense + right.summary.expense,
      expenseCount: left.summary.expenseCount + right.summary.expenseCount,
      income: left.summary.income + right.summary.income,
      incomeCount: left.summary.incomeCount + right.summary.incomeCount,
      net: left.summary.net + right.summary.net,
    },
    expenseRank: mergeRank(left.expenseRank, right.expenseRank),
    incomeRank: mergeRank(left.incomeRank, right.incomeRank),
  }
}

export function getBillingStatsBundle(currency: string): BillingStatsBundle {
  if (!currency || currency === 'ALL') return mergeBillingStatsBundles(rankBundle('CNY'), rankBundle('USD'))
  return rankBundle(currency)
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
