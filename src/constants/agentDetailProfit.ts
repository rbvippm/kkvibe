export type AgentProfitCategoryKey = 'sports' | 'live' | 'chess' | 'marble' | 'scratch' | 'lottery'

export type AgentProfitVendorKey = 'im' | 'jingang' | 'saba' | 'cdn'

export type ProfitValueTone = 'neutral' | 'positive' | 'negative'

export type AgentProfitSummaryRow = {
  label: string
  value: string
}

/** 按顶栏币种切换盈亏汇总口径 */
export function getAgentProfitSummaryRows(currency: string): AgentProfitSummaryRow[] {
  if (currency === '信用额度-CNY') {
    return [
      { label: '上分总额', value: '1,550' },
      { label: '下分总额', value: '1,030' },
    ]
  }
  if (currency === '信用额度-USD') {
    return [
      { label: '上分总额', value: '620' },
      { label: '下分总额', value: '410' },
    ]
  }

  const cashMock: Record<string, { deposit: string; withdraw: string }> = {
    KKC: { deposit: '12,800', withdraw: '6,400' },
    USDT: { deposit: '3,200', withdraw: '1,150' },
    KKV: { deposit: '8,600', withdraw: '4,200' },
  }
  const stats = cashMock[currency] ?? { deposit: '0', withdraw: '0' }

  return [
    { label: '充值总金额', value: stats.deposit },
    { label: '提款总金额', value: stats.withdraw },
  ]
}

/** @deprecated 请使用 getAgentProfitSummaryRows */
export const AGENT_PROFIT_SUMMARY_ROWS: AgentProfitSummaryRow[] = getAgentProfitSummaryRows('KKC')

export type AgentProfitDetailRow = {
  label: string
  value: string
  tone: ProfitValueTone
}

export type AgentProfitDetail = {
  title: string
  totalProfit: string
  totalProfitTone: ProfitValueTone
  rows: AgentProfitDetailRow[]
}

export const AGENT_PROFIT_CATEGORY_TABS: { key: AgentProfitCategoryKey; label: string }[] = [
  { key: 'sports', label: '体育' },
  { key: 'live', label: '真人' },
  { key: 'chess', label: '棋牌' },
  { key: 'marble', label: '弹珠' },
  { key: 'scratch', label: '刮刮乐' },
  { key: 'lottery', label: '彩票' },
]

export const AGENT_PROFIT_VENDORS: Record<
  AgentProfitCategoryKey,
  { key: AgentProfitVendorKey; label: string }[]
> = {
  sports: [
    { key: 'im', label: 'IM体育' },
    { key: 'jingang', label: '金刚体育' },
    { key: 'saba', label: 'SABA体育' },
    { key: 'cdn', label: 'CDN体育' },
  ],
  live: [
    { key: 'im', label: 'IM真人' },
    { key: 'jingang', label: '金刚真人' },
  ],
  chess: [
    { key: 'im', label: 'IM棋牌' },
    { key: 'cdn', label: 'CDN棋牌' },
  ],
  marble: [{ key: 'im', label: 'IM弹珠' }],
  scratch: [{ key: 'jingang', label: '金刚刮刮乐' }],
  lottery: [
    { key: 'saba', label: 'SABA彩票' },
    { key: 'cdn', label: 'CDN彩票' },
  ],
}

const IM_SPORTS_DETAIL: AgentProfitDetail = {
  title: 'IM体育（实占）',
  totalProfit: '+15,000',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额（不参与计算）', value: '1000.00', tone: 'neutral' },
    { label: '输赢', value: '+500.00', tone: 'positive' },
    { label: '退水', value: '-100.00', tone: 'negative' },
    { label: 'VIP退水', value: '-50.00', tone: 'negative' },
    { label: '赚水', value: '+10.00', tone: 'positive' },
    { label: 'VIP晋级礼金', value: '-20.00', tone: 'negative' },
    { label: '活动金', value: '-30.00', tone: 'negative' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额（不参与计算）', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '赚水', value: '0.00', tone: 'neutral' },
  { label: 'VIP晋级礼金', value: '0.00', tone: 'neutral' },
  { label: '活动金', value: '0.00', tone: 'neutral' },
]

export function getAgentProfitDetail(
  category: AgentProfitCategoryKey,
  vendor: AgentProfitVendorKey,
): AgentProfitDetail {
  if (category === 'sports' && vendor === 'im') {
    return IM_SPORTS_DETAIL
  }

  const vendorLabel =
    AGENT_PROFIT_VENDORS[category].find((item) => item.key === vendor)?.label ?? '明细'

  return {
    title: `${vendorLabel}（实占）`,
    totalProfit: '+0.00',
    totalProfitTone: 'positive',
    rows: EMPTY_DETAIL_ROWS,
  }
}

export function profitValueClass(tone: ProfitValueTone) {
  if (tone === 'positive') return 'mh5-agent-report-detail__row-value--positive'
  if (tone === 'negative') return 'mh5-agent-report-detail__row-value--negative'
  return ''
}

export function profitTotalClass(tone: ProfitValueTone) {
  if (tone === 'negative') return 'mh5-agent-report-detail__profit-total--negative'
  return 'mh5-agent-report-detail__profit-total--positive'
}
