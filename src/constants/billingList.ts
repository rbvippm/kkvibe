/** 账单列表 · 类型与币种（对齐银行账单设计） */

import { addDaysYmd, MH5_DATE_RANGE_TODAY } from './mh5DateRange'

export type BillingType =
  | 'receive'
  | 'withdraw'
  | 'transfer'
  | 'redpacket'
  | 'purchase'
  | 'bonus'
  | 'consume'
  | 'profit'
  | 'bet'
  | 'sell'
  | 'finance'
  | 'loan'
  | 'allocate'
  | 'fx'
  | 'intl_transfer'
  | 'cash_delivery'
  | 'activity'
  | 'xcoin_credit_up'
  | 'xcoin_credit_down'
  | 'system_payment'
  | 'system_deduct'
  | 'system_rebate'
  | 'recharge'
  | 'exchange'

export type BillingCurrencyKind = 'crypto' | 'fiat' | 'credit'

/** 列表、详情、快捷筛选共用的账单类型图标 */
export type BillingIconKind =
  | 'receive'
  | 'withdraw'
  | 'transfer'
  | 'redpacket'
  | 'purchase'
  | 'bonus'
  | 'consume'
  | 'xcoin'
  | 'system'

export function billingIconKindFromFilter(value: string): BillingIconKind {
  if (value === 'xcoin') return 'xcoin'
  if (value === 'system') return 'system'
  if (
    value === 'receive' ||
    value === 'withdraw' ||
    value === 'transfer' ||
    value === 'redpacket' ||
    value === 'purchase' ||
    value === 'bonus' ||
    value === 'consume'
  ) {
    return value
  }
  return 'receive'
}

export function billingIconKindFromType(type: BillingType): BillingIconKind {
  if (type === 'xcoin_credit_up' || type === 'xcoin_credit_down') return 'xcoin'
  if (type === 'system_payment' || type === 'system_deduct' || type === 'system_rebate') return 'system'
  if (type === 'recharge' || type === 'receive' || type === 'loan') return 'receive'
  if (type === 'profit' || type === 'finance' || type === 'activity' || type === 'bonus') return 'bonus'
  if (type === 'bet' || type === 'consume') return 'consume'
  if (type === 'sell' || type === 'withdraw' || type === 'cash_delivery') return 'withdraw'
  if (
    type === 'exchange' ||
    type === 'allocate' ||
    type === 'fx' ||
    type === 'intl_transfer' ||
    type === 'transfer'
  ) {
    return 'transfer'
  }
  if (type === 'redpacket' || type === 'purchase') return type
  return 'receive'
}

export function billingIconKindFromLabel(typeLabel: string, layout?: BillingDetailLayout): BillingIconKind {
  if (layout === 'system_payment' || typeLabel.startsWith('系统')) return 'system'
  if (layout === 'xcoin_transfer' || typeLabel.startsWith('上下分')) return 'xcoin'
  if (typeLabel.startsWith('国际转账') || typeLabel.startsWith('划转') || typeLabel.startsWith('换汇') || typeLabel.startsWith('兑换')) {
    return 'transfer'
  }
  if (typeLabel.startsWith('转账')) return 'transfer'
  if (typeLabel.startsWith('消费') || typeLabel.startsWith('投注')) return 'consume'
  if (typeLabel.startsWith('奖金') || typeLabel.startsWith('盈利') || typeLabel.startsWith('理财') || typeLabel.startsWith('活动金')) {
    return 'bonus'
  }
  if (typeLabel.startsWith('收款') || typeLabel.startsWith('充值') || typeLabel.startsWith('借贷')) return 'receive'
  if (typeLabel.startsWith('提现') || typeLabel.startsWith('出售') || typeLabel.startsWith('全球送现')) return 'withdraw'
  if (typeLabel.startsWith('红包')) return 'redpacket'
  if (typeLabel.startsWith('购买')) return 'purchase'
  return 'receive'
}

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
 * - 旗舰厅按线上类型表补齐，系统 / 充值 / 提现 / 转账 / 兑换 / 红包靠前
 * - 收款与购买并入充值；提现与出售并入提现
 * - 信用币交易类型：转账【游戏名】/ 消费【游戏名】/ 奖金【游戏名】/ 上下分 / 系统【退水备注】
 * - 上下分流水：上分=收入(+)；下分=支出(-)
 */
export const BILLING_TYPE_OPTIONS: BillingTypeOption[] = [
  { value: '', label: '全部' },
  { value: 'system', label: '系统' },
  { value: 'recharge', label: '充值' },
  { value: 'withdraw', label: '提现' },
  { value: 'transfer', label: '转账' },
  { value: 'exchange', label: '兑换' },
  { value: 'redpacket', label: '红包' },
  { value: 'profit', label: '盈利' },
  { value: 'bet', label: '投注' },
  { value: 'finance', label: '理财' },
  { value: 'loan', label: '借贷' },
  { value: 'allocate', label: '划转' },
  { value: 'fx', label: '换汇' },
  { value: 'intl_transfer', label: '国际转账' },
  { value: 'cash_delivery', label: '全球送现' },
  { value: 'xcoin', label: '上下分' },
  { value: 'activity', label: '活动金' },
  { value: 'bonus', label: '奖金' },
  { value: 'consume', label: '消费' },
]

/** 贵宾厅账单：转账 / 消费 / 奖金（游戏账变）+ 上下分 / 系统 */
export const BILLING_VIP_TYPE_OPTIONS: BillingTypeOption[] = [
  { value: '', label: '全部' },
  { value: 'system', label: '系统' },
  { value: 'transfer', label: '转账' },
  { value: 'consume', label: '消费' },
  { value: 'bonus', label: '奖金' },
  { value: 'xcoin', label: '上下分' },
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
    month: '2026-06',
    type: 'system_rebate',
    typeLabel: '系统【信用用户退水】',
    createdAt: '2026-06-24 10:20:18',
    amount: 36.5,
    currency: 'CNY',
  },
  {
    id: 'b17',
    month: '2026-06',
    type: 'system_rebate',
    typeLabel: '系统【现金 VIP 退水】',
    createdAt: '2026-06-23 16:08:42',
    amount: 12.8,
    currency: 'USD',
  },
  {
    id: 'b21',
    month: '2026-05',
    type: 'system_rebate',
    typeLabel: '系统【信用代理退水】',
    createdAt: '2026-05-26 09:16:04',
    amount: 8.6,
    currency: 'CNY',
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
    type: 'recharge',
    typeLabel: '充值【链上充值】',
    createdAt: '2026-05-26 23:11:12',
    amount: 6.88,
    currency: 'KKC',
  },
  {
    id: 'b2',
    month: '2026-05',
    type: 'recharge',
    typeLabel: '充值【链上充值】',
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
    type: 'recharge',
    typeLabel: '充值【链上充值】',
    createdAt: '2026-04-18 14:22:05',
    amount: 500,
    currency: 'KKC',
  },
  {
    id: 'b10',
    month: '2026-04',
    type: 'withdraw',
    typeLabel: '提现【链上提现】',
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
  {
    id: 'b34',
    month: '2026-05',
    type: 'recharge',
    typeLabel: '充值【三方渠道买币】',
    createdAt: '2026-05-19 15:26:18',
    amount: 200,
    currency: 'KKC',
  },
  {
    id: 'b23',
    month: '2026-05',
    type: 'profit',
    typeLabel: '盈利',
    createdAt: '2026-05-18 11:20:06',
    amount: 66,
    currency: 'KKC',
  },
  {
    id: 'b24',
    month: '2026-05',
    type: 'bet',
    typeLabel: '投注',
    createdAt: '2026-05-17 21:08:41',
    amount: -32,
    currency: 'KKC',
  },
  {
    id: 'b25',
    month: '2026-05',
    type: 'withdraw',
    typeLabel: '提现【出售】',
    createdAt: '2026-05-16 15:42:09',
    amount: 200,
    currency: 'USDT-TRON',
  },
  {
    id: 'b26',
    month: '2026-05',
    type: 'exchange',
    typeLabel: '兑换',
    createdAt: '2026-05-15 10:05:33',
    amount: -50,
    currency: 'KKC',
  },
  {
    id: 'b27',
    month: '2026-05',
    type: 'finance',
    typeLabel: '理财',
    createdAt: '2026-05-14 09:30:22',
    amount: 18.6,
    currency: 'KKC',
  },
  {
    id: 'b28',
    month: '2026-05',
    type: 'loan',
    typeLabel: '借贷',
    createdAt: '2026-05-13 16:18:57',
    amount: 1000,
    currency: 'KKC',
  },
  {
    id: 'b29',
    month: '2026-05',
    type: 'allocate',
    typeLabel: '划转',
    createdAt: '2026-05-12 13:44:11',
    amount: -30,
    currency: 'KKV',
  },
  {
    id: 'b30',
    month: '2026-05',
    type: 'fx',
    typeLabel: '换汇',
    createdAt: '2026-05-11 19:22:40',
    amount: -80,
    currency: 'USDT-TRON',
  },
  {
    id: 'b31',
    month: '2026-05',
    type: 'intl_transfer',
    typeLabel: '国际转账',
    createdAt: '2026-05-10 08:16:05',
    amount: -260,
    currency: 'USDT-TRON',
  },
  {
    id: 'b32',
    month: '2026-05',
    type: 'cash_delivery',
    typeLabel: '全球送现',
    createdAt: '2026-05-09 17:55:28',
    amount: -500,
    currency: 'KKC',
  },
  {
    id: 'b33',
    month: '2026-05',
    type: 'activity',
    typeLabel: '活动金',
    createdAt: '2026-05-08 12:06:14',
    amount: 28,
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
    typeLabel: '系统【信用用户退水】',
    heroTitle: '系统打款',
    amount: 36.5,
    currencySymbol: '¥',
    currencyCode: 'CNY',
    paymentReason: '信用用户退水',
    timeDisplay: '2026.06.24 10:20:18',
    billNo: '288823297146609664',
    orderNo: '288823297146609664',
  },
  b17: {
    id: 'b17',
    layout: 'system_payment',
    typeLabel: '系统【现金 VIP 退水】',
    heroTitle: '系统打款',
    amount: 12.8,
    currencySymbol: '$',
    currencyCode: 'USD',
    paymentReason: '现金 VIP 退水',
    timeDisplay: '2026.06.23 16:08:42',
    billNo: '288823297146609665',
    orderNo: '288823297146609665',
  },
  b21: {
    id: 'b21',
    layout: 'system_payment',
    typeLabel: '系统【信用代理退水】',
    heroTitle: '系统打款',
    amount: 8.6,
    currencySymbol: '¥',
    currencyCode: 'CNY',
    paymentReason: '信用代理退水',
    timeDisplay: '2026.05.26 09:16:04',
    billNo: '288823297146609666',
    orderNo: '288823297146609666',
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

  const rechargeWay = row.typeLabel.match(/^充值【([^】]+)】/)
  if (row.type === 'recharge' || rechargeWay) {
    return {
      id: row.id,
      layout: 'default',
      typeLabel: '充值',
      heroTitle: '充值',
      amount: row.amount,
      currencySymbol: getBillingCurrencySymbol(row.currency),
      currencyCode: getBillingAmountUnit(row.currency),
      timeDisplay: formatBillingDetailTime(row.createdAt),
      orderNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
      billNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
      createdAt: row.createdAt,
      fields: [
        { label: '充值方式', value: rechargeWay?.[1] || '链上充值' },
        { label: '币种', value: row.currency },
      ],
    }
  }

  const withdrawWay = row.typeLabel.match(/^提现【([^】]+)】/)
  const isSell = row.type === 'sell' || row.typeLabel.startsWith('出售')
  if (row.type === 'withdraw' || isSell || withdrawWay) {
    return {
      id: row.id,
      layout: 'default',
      typeLabel: '提现',
      heroTitle: '提现',
      amount: row.amount,
      currencySymbol: getBillingCurrencySymbol(row.currency),
      currencyCode: getBillingAmountUnit(row.currency),
      timeDisplay: formatBillingDetailTime(row.createdAt),
      orderNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
      billNo: `BL${row.createdAt.replace(/[-:\s]/g, '')}${row.id.toUpperCase()}`,
      createdAt: row.createdAt,
      fields: [
        { label: '提现方式', value: withdrawWay?.[1] || (isSell ? '出售' : '链上提现') },
        { label: '币种', value: row.currency },
      ],
    }
  }

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

export const BILLING_HOT_KEYWORDS = ['信用用户退水', '上下分-上分', '充值', '转账【皇者体育】', '6.88']

export const BILLING_VIP_HOT_KEYWORDS = [
  '信用用户退水',
  '上下分-上分',
  '转账【皇者体育】',
  '消费【电子游艺】',
  '奖金【真人视讯】',
]

const RECENT_SEARCH_STORAGE_KEY = 'mh5-billing-recent-searches'

/**
 * 账单金额按原精度展示，不统一收成两位。
 * 彩票可到三位小数；其余不足两位补 0，第三位为 0 时仍显示两位。
 */
export function formatBillingPlainAmount(amount: number) {
  const abs = Math.abs(amount)
  if (!Number.isFinite(abs)) return '0.00'
  const fixed = abs.toFixed(3)
  return fixed.endsWith('0') ? fixed.slice(0, -1) : fixed
}

export function formatBillingAmount(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${formatBillingPlainAmount(amount)}`
}

export function formatBillingHeroAmount(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${formatBillingPlainAmount(amount)}`
}

/** 详情时间：2026-05-08 10:20:18 */
export function formatBillingDetailTime(createdAt: string) {
  const [datePart, timePart = ''] = createdAt.trim().split(/\s+/)
  const [y, m, d] = datePart.replace(/\./g, '-').split('-')
  if (!y || !m || !d) return createdAt
  const hms = timePart.length >= 8 ? timePart.slice(0, 8) : timePart
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}${hms ? ` ${hms}` : ''}`
}

/** 列表时间：今天 14:16；昨天 01:01；更早为 10-10 14:10 */
export function formatBillingListTime(createdAt: string, today = MH5_DATE_RANGE_TODAY) {
  const [datePart, timePart = ''] = createdAt.split(' ')
  const [, m, d] = datePart.split('-')
  const hm = timePart.slice(0, 5)
  if (datePart === today) return `今天 ${hm}`
  if (datePart === addDaysYmd(today, -1)) return `昨天 ${hm}`
  return `${m}-${d} ${hm}`
}

/**
 * 列表类型：
 * - 系统【信用用户退水】→ 系统-信用用户退水（详情打款原因放到列表）
 * - 转账【皇者体育】→ 转账
 * - 上下分-上分 / 上下分-下分 → 上下分
 * - 提现【链上提现】/ 提现【出售】/ 出售 → 提现
 */
export function formatBillingListTypeLabel(typeLabel: string) {
  const systemReason = typeLabel.match(/^系统【([^】]+)】/)
  if (systemReason) return `系统-${systemReason[1]}`
  const withoutBracket = typeLabel.replace(/【[^】]*】/g, '').trim()
  if (withoutBracket.startsWith('上下分')) return '上下分'
  if (withoutBracket === '出售' || withoutBracket.startsWith('出售')) return '提现'
  return withoutBracket || typeLabel
}

/** 分组标题：2026-05 */
export function formatBillingMonthLabel(month: string) {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `${y}-${m.padStart(2, '0')}`
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
  if (type === 'recharge') {
    return row.type === 'recharge' || row.type === 'receive' || row.typeLabel.startsWith('充值')
  }
  if (type === 'withdraw') {
    return (
      row.type === 'withdraw' ||
      row.type === 'sell' ||
      row.typeLabel.startsWith('提现') ||
      row.typeLabel.startsWith('出售')
    )
  }
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
  options: { keyword?: string; type?: string; currency?: string; start?: string; end?: string },
) {
  const keyword = options.keyword?.trim() ?? ''
  return records.filter((row) => {
    if (!matchBillingTypeFilter(row, options.type)) return false
    if (options.currency && row.currency !== options.currency) return false
    if (options.start && options.end) {
      const day = row.createdAt.slice(0, 10)
      if (day < options.start || day > options.end) return false
    }
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
  return formatBillingPlainAmount(amount)
}

export function readRecentBillingSearches(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_SEARCH_STORAGE_KEY)
    if (!raw) return ['信用用户退水', '上下分-上分', '充值']
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, 8) : ['信用用户退水', '上下分-上分', '充值']
  } catch {
    return ['信用用户退水', '上下分-上分', '充值']
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
