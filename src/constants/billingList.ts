/** 账单列表 · 类型与币种 */

export type BillingType =
  | 'system_payment'
  | 'system_deduct'
  | 'recharge'
  | 'withdraw'
  | 'transfer'
  | 'exchange'
  | 'xcoin_credit_up'
  | 'xcoin_credit_down'

export type BillingRecord = {
  id: string
  month: string
  type: BillingType
  typeLabel: string
  createdAt: string
  amount: number
  currency: string
}

export type BillingDetailLayout = 'xcoin_transfer' | 'default'

export type BillingDetailField = {
  label: string
  value: string
  copyable?: boolean
}

export type BillingDetail = {
  id: string
  layout?: BillingDetailLayout
  typeLabel: string
  amount: number
  /** 展示用币种符号，如 X */
  currencySymbol: string
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

export const BILLING_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'system_payment', label: '系统-打款' },
  { value: 'system_deduct', label: '系统-扣款' },
  { value: 'recharge', label: '充值' },
  { value: 'withdraw', label: '提现' },
  { value: 'transfer', label: '转账' },
  { value: 'exchange', label: '兑换' },
  { value: 'xcoin_credit_up', label: '上下分-上分' },
  { value: 'xcoin_credit_down', label: '上下分-下分' },
] as const

export const BILLING_CURRENCY_OPTIONS = [
  { value: '', label: '全部币种' },
  { value: 'X币', label: 'X币' },
  { value: 'KKC', label: 'KKC' },
  { value: 'USDT-TRON', label: 'USDT-TRON' },
  { value: 'ETH', label: 'ETH' },
  { value: '活动金', label: '活动金' },
] as const

export const MOCK_BILLING_RECORDS: BillingRecord[] = [
  {
    id: 'b12',
    month: '2025-05',
    type: 'xcoin_credit_up',
    typeLabel: '上下分-上分',
    createdAt: '2025-05-08 12:12:35',
    amount: 20,
    currency: 'X币',
  },
  {
    id: 'b1',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b2',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b3',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b4',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b5',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b6',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b7',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b8',
    month: '2026-05',
    type: 'system_payment',
    typeLabel: '系统-打款',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b9',
    month: '2026-04',
    type: 'recharge',
    typeLabel: '充值',
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
    type: 'exchange',
    typeLabel: '兑换',
    createdAt: '2026-04-05 20:15:44',
    amount: -88,
    currency: '活动金',
  },
]

/** 账单详情 · 上下分-上分 */
export const MOCK_BILLING_DETAILS: Record<string, BillingDetail> = {
  b12: {
    id: 'b12',
    layout: 'xcoin_transfer',
    typeLabel: '上下分-上分',
    amount: 20,
    currencySymbol: 'X',
    superiorAgent: 'bckce26ji',
    timeDisplay: '2025.05.08 12:12:35',
    orderNo: 'asdad123812xc57343453',
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
  return {
    id: row.id,
    layout: 'default',
    typeLabel: row.typeLabel,
    amount: row.amount,
    currencySymbol: getBillingCurrencySymbol(row.currency),
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

export const BILLING_HOT_KEYWORDS = ['bckce26ji', '上下分-上分', '系统-打款', '充值', '6.88']

const RECENT_SEARCH_STORAGE_KEY = 'mh5-billing-recent-searches'

export function formatBillingAmount(amount: number) {
  const sign = amount > 0 ? '+ ' : amount < 0 ? '- ' : ''
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

export function getBillingCurrencySymbol(currency: string) {
  if (currency === 'X币') return 'X'
  return currency
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
    if (options.type && row.type !== options.type) return false
    if (options.currency && row.currency !== options.currency) return false
    if (!keyword) return true
    return matchBillingKeyword(row, keyword)
  })
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
    if (!raw) return ['bckce26ji', '上下分-上分', '充值']
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, 8) : ['bckce26ji', '上下分-上分', '充值']
  } catch {
    return ['bckce26ji', '上下分-上分', '充值']
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
