import {
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS,
  profitTotalClass,
  profitValueClass,
  type AgentProfitCategoryKey,
  type AgentProfitDetail,
  type AgentProfitDetailRow,
  type AgentProfitSummaryRow,
  type AgentProfitVendorKey,
} from './agentDetailProfit'

export type MemberProfitCategoryKey = AgentProfitCategoryKey
export type MemberProfitVendorKey = AgentProfitVendorKey

export {
  AGENT_PROFIT_CATEGORY_TABS as MEMBER_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS as MEMBER_PROFIT_VENDORS,
  profitTotalClass,
  profitValueClass,
}

/** 会员总盈亏（顶栏币种口径，不展示币种符号） */
export function getMemberTotalProfit(_currency: string): string {
  return '0'
}

/** 现金：充值/提款；信用额度：上分/下分（不展示币种符号） */
export function getMemberProfitSummaryRows(currency: string): AgentProfitSummaryRow[] {
  if (currency.startsWith('信用额度')) {
    return [
      { label: '上分总金额', value: '0' },
      { label: '下分总金额', value: '0' },
    ]
  }
  return [
    { label: '充值总金额', value: '0' },
    { label: '提款总金额', value: '0' },
  ]
}

const IM_SPORTS_DETAIL: AgentProfitDetail = {
  title: 'IM体育',
  totalProfit: '+15,000',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '1000.00', tone: 'neutral' },
    { label: '会员游戏输赢', value: '+500.00', tone: 'positive' },
    { label: '会员退水', value: '-100.00', tone: 'negative' },
    { label: 'VIP退水', value: '-50.00', tone: 'negative' },
    { label: '活动金', value: '-30.00', tone: 'negative' },
    { label: 'VIP晋级礼金', value: '-20.00', tone: 'negative' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额', value: '0.00', tone: 'neutral' },
  { label: '会员游戏输赢', value: '0.00', tone: 'neutral' },
  { label: '会员退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '活动金', value: '0.00', tone: 'neutral' },
  { label: 'VIP晋级礼金', value: '0.00', tone: 'neutral' },
]

export function getMemberProfitDetail(
  category: MemberProfitCategoryKey,
  vendor: MemberProfitVendorKey,
): AgentProfitDetail {
  if (category === 'sports' && vendor === 'im') {
    return IM_SPORTS_DETAIL
  }

  const vendorLabel =
    AGENT_PROFIT_VENDORS[category].find((item) => item.key === vendor)?.label ?? '明细'

  return {
    title: vendorLabel,
    totalProfit: '+0.00',
    totalProfitTone: 'positive',
    rows: EMPTY_DETAIL_ROWS,
  }
}
