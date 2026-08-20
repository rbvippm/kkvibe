/** 账单列表 · 类型与币种（对齐银行账单设计） */

export type BillingType =
  | 'receive'
  | 'withdraw'
  | 'transfer'
  | 'redpacket'
  | 'purchase'
  | 'bonus'
  | 'consume'
  | 'xcoin_credit_up'
  | 'xcoin_credit_down'
  | 'system_payment'
  | 'system_deduct'
  | 'system_rebate'
  | 'recharge'
  | 'exchange'

export type BillingCurrencyKind = 'crypto' | 'fiat' | 'credit'

export type BillingRecord = {
  id: string
  month: string
  type: BillingType
  typeLabel: string
  createdAt: string
  amount: number
  currency: string
}

export type BillingDetailLayout = 'xcoin_transfer' | 'system_payment' | 'default'

export type BillingDetailField = {
  label: string
  value: string
  copyable?: boolean
  /** 金额行等强调色 */
  emphasis?: boolean
}

export type BillingDetail = {
  id: string
  layout?: BillingDetailLayout
  typeLabel: string
  /** 详情顶栏标题；缺省用 typeLabel */
  heroTitle?: string
  amount: number
  /** 图标用币种符号，如 ¥ */
  currencySymbol: string
  /** 金额下方币种代码，如 CNY；缺省时回退到 currencySymbol */
  currencyCode?: string
  /** 系统打款 · 打款原因 */
  paymentReason?: string
  superiorAgent?: string
  timeDisplay?: string
  orderNo?: string
  billNo?: string
  status?: 'success' | 'pending' | 'failed'
  statusLabel?: string
  createdAt?: string
  completedAt?: string
  fields?: BillingDetailField[]
}

export type BillingTypeOption = {
  value: string
  label: string
}

export type BillingCurrencyOption = {
  value: string
  label: string
  symbol: string
  color: string
  kind: BillingCurrencyKind | 'all'
  /** 信用额度提示 */
  tip?: string
}

/**
 * 类型筛选：
 * - 现金侧：收款 / 提现 / 转账 / 红包 / 购买 / 奖金 / 消费 / 系统
 * - 信用币交易类型：转账【游戏名】/ 消费【游戏名】/ 奖金【游戏名】/ 上下分 / 系统【信用会员退水】
 * - 上下分流水：上分=收入(+)；下分=支出(-)
 */
export const BILLING_TYPE_OPTIONS: BillingTypeOption[] = [
  { value: '', label: '全部' },
  { value: 'receive', label: '收款' },
  { value: 'withdraw', label: '提现' },
  { value: 'transfer', label: '转账' },
  { value: 'redpacket', label: '红包' },
  { value: 'purchase', label: '购买' },
  { value: 'bonus', label: '奖金' },
  { value: 'consume', label: '消费' },
  { value: 'xcoin', label: '上下分' },
  { value: 'system', label: '系统' },
]

/** 贵宾厅账单：转账 / 消费 / 奖金（游戏账变）+ 上下分 / 系统 */
export const BILLING_VIP_TYPE_OPTIONS: BillingTypeOption[] = [
  { value: '', label: '全部' },
  { value: 'transfer', label: '转账' },
  { value: 'consume', label: '消费' },
  { value: 'bonus', label: '奖金' },
  { value: 'xcoin', label: '上下分' },
  { value: 'system', label: '系统' },
]

export const BILLING_CURRENCY_TABS: { key: 'all' | BillingCurrencyKind; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'crypto', label: '虚拟币' },
  { key: 'fiat', label: '法币' },
  { key: 'credit', label: '信用额度' },
]

export const BILLING_CURRENCY_OPTIONS: BillingCurrencyOption[] = [
  { value: '', label: '全部', symbol: '全', color: '#9ca3af', kind: 'all' },
  { value: 'KKC', label: 'KKC', symbol: 'K', color: '#ff7a2b', kind: 'fiat' },
  { value: 'KKV', label: 'KKV', symbol: 'V', color: '#ec4899', kind: 'fiat' },
  { value: 'USDT-TRON', label: 'USDT-TRON', symbol: '₮', color: '#26a17b', kind: 'crypto' },
  { value: 'USDT-SOL', label: 'USDT-SOL', symbol: '₮', color: '#26a17b', kind: 'crypto' },
  { value: 'ETH', label: 'ETH', symbol: 'Ξ', color: '#627eea', kind: 'crypto' },
  { value: 'BTC', label: 'BTC', symbol: '₿', color: '#f7931a', kind: 'crypto' },
  { value: 'BNB', label: 'BNB', symbol: 'B', color: '#f3ba2f', kind: 'crypto' },
  { value: 'SOL', label: 'SOL', symbol: 'S', color: '#111827', kind: 'crypto' },
  { value: 'TRX', label: 'TRX', symbol: 'T', color: '#ef0027', kind: 'crypto' },
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

export const MOCK_BILLING_RECORDS: BillingRecord[] = [
  {
    id: 'b16',
    month: '2026-05',
    type: 'system_rebate',
    typeLabel: '系统【信用会员退水】',
    createdAt: '2026-05-28 10:20:18',
    amount: 36.5,
    currency: 'CNY',
  },
  {
    id: 'b17',
    month: '2026-05',
    type: 'system_rebate',
    typeLabel: '系统【信用会员退水】',
    createdAt: '2026-05-27 16:08:42',
    amount: 12.8,
    currency: 'USD',
  },
  {
    id: 'b18',
    month: '2026-05',
    type: 'transfer',
    typeLabel: '转账【皇者体育】',
    createdAt: '2026-05-25 14:33:09',
    amount: -50,
    currency: 'CNY',
  },
  {
    id: 'b19',
    month: '2026-05',
    type: 'consume',
    typeLabel: '消费【电子游艺】',
    createdAt: '2026-05-24 19:05:21',
    amount: -28.6,
    currency: 'CNY',
  },
  {
    id: 'b20',
    month: '2026-05',
    type: 'bonus',
    typeLabel: '奖金【真人视讯】',
    createdAt: '2026-05-23 21:40:55',
    amount: 88,
    currency: 'CNY',
  },
  {
    id: 'b12',
    month: '2025-06',
    type: 'xcoin_credit_up',
    typeLabel: '上下分-上分',
    createdAt: '2025-06-22 12:12:35',
    amount: 20,
    currency: 'CNY',
  },
  {
    id: 'b13',
    month: '2025-06',
    type: 'xcoin_credit_down',
    typeLabel: '上下分-下分',
    createdAt: '2025-06-22 11:08:12',
    amount: -15,
    currency: 'CNY',
  },
  {
    id: 'b14',
    month: '2025-06',
    type: 'xcoin_credit_up',
    typeLabel: '上下分-上分',
    createdAt: '2025-06-18 09:22:01',
    amount: 50,
    currency: 'CNY',
  },
  {
    id: 'b21',
    month: '2025-06',
    type: 'xcoin_credit_up',
    typeLabel: '上下分-上分',
    createdAt: '2025-06-21 16:40:11',
    amount: 80,
    currency: 'USD',
  },
  {
    id: 'b22',
    month: '2025-06',
    type: 'xcoin_credit_down',
    typeLabel: '上下分-下分',
    createdAt: '2025-06-21 17:02:44',
    amount: -25,
    currency: 'USD',
  },
  {
    id: 'b1',
    month: '2026-05',
    type: 'receive',
    typeLabel: '收款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b2',
    month: '2026-05',
    type: 'receive',
    typeLabel: '收款',
    createdAt: '2026-05-26 22:01:08',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b3',
    month: '2026-05',
    type: 'bonus',
    typeLabel: '奖金',
    createdAt: '2026-05-20 18:33:40',
    amount: 128,
    currency: 'KKC',
  },
  {
    id: 'b9',
    month: '2026-04',
    type: 'receive',
    typeLabel: '收款',
    createdAt: '2026-04-18 14:22:05',
    amount: 500,
    currency: 'KKC',
  },
  {
    id: 'b10',
    month: '2026-04',
    type: 'withdraw',
    typeLabel: '提现',
    createdAt: '2026-04-12 09:08:33',
    amount: -120.5,
    currency: 'USDT-TRON',
  },
  {
    id: 'b11',
    month: '2026-04',
    type: 'transfer',
    typeLabel: '转账',
    createdAt: '2026-04-05 20:15:44',
    amount: -88,
    currency: 'KKV',
  },
  {
    id: 'b15',
    month: '2026-04',
    type: 'redpacket',
    typeLabel: '红包',
    createdAt: '2026-04-03 12:00:00',
    amount: 8.88,
    currency: 'KKC',
  },
]

/** 账单详情 · 上下分 / 系统打款 */
export const MOCK_BILLING_DETAILS: Record<string, BillingDetail> = {
  b12: {
    id: 'b12',
    layout: 'xcoin_transfer',
    typeLabel: '上下分-上分',
    amount: 20,
    currencySymbol: '¥',
    currencyCode: 'CNY',
    superiorAgent: 'bckce26ji',
    timeDisplay: '2025.06.22 12:12:35',
    orderNo: 'asdad123812xc57343453',
  },
  b16: {
    id: 'b16',
    layout: 'system_payment',
    typeLabel: '系统【信用会员退水】',
    heroTitle: '系统打款',
    amount: 36.5,
    currencySymbol: '¥',
    currencyCode: 'CNY',
    paymentReason: '信用会员退水',
    timeDisplay: '2026.05.28 10:20:18',
    billNo: '288823297146609664',
    orderNo: '288823297146609664',
  },
  b17: {
    id: 'b17',
    layout: 'system_payment',
    typeLabel: '系统【信用会员退水】',
    heroTitle: '系统打款',
    amount: 12.8,
    currencySymbol: '$',
    currencyCode: 'USD',
    paymentReason: '信用会员退水',
    timeDisplay: '2026.05.27 16:08:42',
    billNo: '288823297146609665',
    orderNo: '288823297146609665',
  },
}

export function getBillingRecord(id: string) {
  return MOCK_BILLING_RECORDS.find((row) => row.id === id)
}

export function getBillingDetail(id: string) {
  const detail = MOCK_BILLING_DETAILS[id]
  if (detail) return detail
  const row = getBillingRecord(id)
  if (!row) return undefined
  return buildFallbackBillingDetail(row)
}

function buildFallbackBillingDetail(row: BillingRecord): BillingDetail {
  const isSystem =
    row.type === 'system_payment' ||
    row.type === 'system_deduct' ||
    row.type === 'system_rebate' ||
    row.typeLabel.startsWith('系统')

  if (isSystem) {
    const reasonMatch = row.typeLabel.match(/【([^】]+)】/)
    return {
      id: row.id,
      layout: 'system_payment',
      typeLabel: row.typeLabel,
      heroTitle: '系统打款',
      amount: row.amount,
      currencySymbol: getBillingCurrencySymbol(row.currency),
      currencyCode: getBillingAmountUnit(row.currency),
      paymentReason: reasonMatch?.[1] || '系统账变',
      timeDisplay: formatBillingDetailTime(row.createdAt),
      billNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
      orderNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
      createdAt: row.createdAt,
    }
  }

  return {
    id: row.id,
    layout: 'default',
    typeLabel: row.typeLabel,
    amount: row.amount,
    currencySymbol: getBillingCurrencySymbol(row.currency),
    currencyCode: getBillingAmountUnit(row.currency),
    timeDisplay: formatBillingDetailTime(row.createdAt),
    orderNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
    billNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
    createdAt: row.createdAt,
    fields: [
      { label: '账变类型', value: row.typeLabel },
      { label: '币种', value: row.currency },
    ],
  }
}

export const BILLING_SEARCH_PLACEHOLDER = '搜索账单记录'

export const BILLING_HOT_KEYWORDS = ['信用会员退水', '上下分-上分', '收款', '转账【皇者体育】', '6.88']

export const BILLING_VIP_HOT_KEYWORDS = [
  '信用会员退水',
  '上下分-上分',
  '转账【皇者体育】',
  '消费【电子游艺】',
  '奖金【真人视讯】',
]

const RECENT_SEARCH_STORAGE_KEY = 'mh5-billing-recent-searches'

export function formatBillingAmount(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${Math.abs(amount).toFixed(2)}`
}

export function formatBillingHeroAmount(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${Math.abs(amount).toFixed(2)}`
}

export function formatBillingDetailTime(createdAt: string) {
  const [datePart, timePart = ''] = createdAt.split(' ')
  const [y, m, d] = datePart.split('-')
  return `${y}.${m}.${d} ${timePart}`
}

/** 列表时间：06-22 12:12:35 */
export function formatBillingListTime(createdAt: string) {
  const [datePart, timePart = ''] = createdAt.split(' ')
  const [, m, d] = datePart.split('-')
  return `${m}-${d} ${timePart}`
}

/**
 * 列表仅展示一级类型，隐藏二级说明：
 * - 系统【信用会员退水】→ 系统
 * - 转账【皇者体育】→ 转账
 * - 上下分-上分 / 上下分-下分 → 上下分
 */
export function formatBillingListTypeLabel(typeLabel: string) {
  const withoutBracket = typeLabel.replace(/【[^】]*】/g, '').trim()
  if (withoutBracket.startsWith('上下分')) return '上下分'
  return withoutBracket || typeLabel
}

/** 分组标题：2025年6月 */
export function formatBillingMonthLabel(month: string) {
  const [y, m] = month.split('-')
  return `${y}年${Number(m)}月`
}

export function getBillingCurrencySymbol(currency: string) {
  const found = BILLING_CURRENCY_OPTIONS.find((item) => item.value === currency)
  if (found) return found.symbol
  return currency
}

/** 列表金额下方单位：展示币种代码 */
export function getBillingAmountUnit(currency: string) {
  return currency
}

export function matchBillingTypeFilter(row: BillingRecord, type?: string) {
  if (!type) return true
  if (type === 'xcoin') return row.type === 'xcoin_credit_up' || row.type === 'xcoin_credit_down'
  if (type === 'system') {
    return (
      row.type === 'system_payment' ||
      row.type === 'system_deduct' ||
      row.type === 'system_rebate' ||
      row.typeLabel.startsWith('系统')
    )
  }
  return row.type === type
}

/** 贵宾厅账单：信用额度游戏账变 + 上下分 + 系统，不含现金收款/提现等 */
export function isVipClubBillingRecord(row: BillingRecord) {
  if (row.currency !== 'CNY' && row.currency !== 'USD') return false
  return (
    row.type === 'transfer' ||
    row.type === 'consume' ||
    row.type === 'bonus' ||
    matchBillingTypeFilter(row, 'xcoin') ||
    matchBillingTypeFilter(row, 'system')
  )
}

/** 贵宾厅信用账户币种 → 账单 CNY / USD */
export function billingCurrencyFromCreditCode(code: string): 'CNY' | 'USD' {
  return code === 'usd' ? 'USD' : 'CNY'
}

/** 上下分：上分=收入，下分=支出 */
export function isBillingCreditUp(row: BillingRecord) {
  return row.type === 'xcoin_credit_up'
}

export function isBillingCreditDown(row: BillingRecord) {
  return row.type === 'xcoin_credit_down'
}

/** 聚合列表 + 详情字段，供任意关键词模糊搜索 */
export function buildBillingSearchHaystack(row: BillingRecord) {
  const detail = getBillingDetail(row.id)
  const parts: Array<string | number | undefined> = [
    row.id,
    row.type,
    row.typeLabel,
    row.currency,
    row.month,
    row.createdAt,
    formatBillingDetailTime(row.createdAt),
    formatBillingListTime(row.createdAt),
    formatBillingAmount(row.amount),
    formatBillingHeroAmount(row.amount),
    row.amount,
    Math.abs(row.amount),
    getBillingCurrencySymbol(row.currency),
  ]

  if (detail) {
    parts.push(
      detail.typeLabel,
      detail.currencySymbol,
      detail.superiorAgent,
      detail.timeDisplay,
      detail.orderNo,
      detail.billNo,
      detail.statusLabel,
      detail.createdAt,
      detail.completedAt,
    )
    for (const field of detail.fields ?? []) {
      parts.push(field.label, field.value)
    }
  }

  return parts
    .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
    .join(' ')
    .toLowerCase()
}

export function matchBillingKeyword(row: BillingRecord, keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return true
  const haystack = buildBillingSearchHaystack(row)
  return haystack.includes(q)
}

export function filterBillingRecords(
  records: BillingRecord[],
  options: { keyword?: string; type?: string; currency?: string },
) {
  const keyword = options.keyword?.trim() ?? ''
  return records.filter((row) => {
    if (!matchBillingTypeFilter(row, options.type)) return false
    if (options.currency && row.currency !== options.currency) return false
    if (!keyword) return true
    return matchBillingKeyword(row, keyword)
  })
}

export function filterBillingCurrencyOptions(
  options: BillingCurrencyOption[],
  tab: 'all' | BillingCurrencyKind,
) {
  if (tab === 'all') return options
  return options.filter((item) => item.kind === tab || item.kind === 'all')
}

export function groupBillingByMonth(records: BillingRecord[]) {
  const map = new Map<string, BillingRecord[]>()
  for (const row of records) {
    const list = map.get(row.month) ?? []
    list.push(row)
    map.set(row.month, list)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export function summarizeBillingMonth(records: BillingRecord[]) {
  let income = 0
  let expense = 0
  for (const row of records) {
    if (row.amount > 0) income += row.amount
    else if (row.amount < 0) expense += Math.abs(row.amount)
  }
  return { income, expense }
}

export function formatBillingSummaryAmount(amount: number) {
  return amount.toFixed(2)
}

export function readRecentBillingSearches(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_SEARCH_STORAGE_KEY)
    if (!raw) return ['信用会员退水', '上下分-上分', '收款']
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, 8) : ['信用会员退水', '上下分-上分', '收款']
  } catch {
    return ['信用会员退水', '上下分-上分', '收款']
  }
}

export function saveRecentBillingSearch(keyword: string) {
  const q = keyword.trim()
  if (!q) return
  const next = [q, ...readRecentBillingSearches().filter((item) => item !== q)].slice(0, 8)
  sessionStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next))
}

export function clearRecentBillingSearches() {
  sessionStorage.removeItem(RECENT_SEARCH_STORAGE_KEY)
}
