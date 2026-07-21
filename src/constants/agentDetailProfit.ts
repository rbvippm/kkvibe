export type AgentProfitCategoryKey =
  | 'overall'
  | 'sports'
  | 'live'
  | 'chess'
  | 'marble'
  | 'scratch'
  | 'lottery'

export type AgentProfitVendorKey = 'im' | 'jingang' | 'saba' | 'cdn'

export type ProfitValueTone = 'neutral' | 'positive' | 'negative'

export type AgentProfitSummaryRow = {
  label: string
  value: string
  tone?: ProfitValueTone
}

/** 总盈亏 = 游戏盈亏 + 赚水 + 【-实占VIP晋级礼金】 + 【-实占活动金】 */
export const AGENT_PROFIT_FORMULA =
  '总盈亏 = 游戏盈亏 + 赚水 + 【-实占VIP晋级礼金】 + 【-实占活动金】'

type AgentProfitSummaryMock = {
  gameProfit: number
  rebateEarn: number
  /** 实占 VIP 晋级礼金（公式中取负） */
  vipBonus: number
  vipRebate: number
  /** 实占活动金（公式中取负，仅参与代理盈亏计算） */
  activityGold: number
}

const PROFIT_SUMMARY_BY_CURRENCY: Record<string, AgentProfitSummaryMock> = {
  KKC: {
    gameProfit: 12800,
    rebateEarn: 860,
    vipBonus: 320,
    vipRebate: 150,
    activityGold: 180,
  },
  USDT: {
    gameProfit: 3200,
    rebateEarn: 210,
    vipBonus: 80,
    vipRebate: 45,
    activityGold: 50,
  },
  KKV: {
    gameProfit: 8600,
    rebateEarn: 520,
    vipBonus: 210,
    vipRebate: 96,
    activityGold: 120,
  },
  '信用额度-CNY': {
    gameProfit: 1550,
    rebateEarn: 128,
    vipBonus: 60,
    vipRebate: 35,
    activityGold: 40,
  },
  '信用额度-USD': {
    gameProfit: 620,
    rebateEarn: 48,
    vipBonus: 22,
    vipRebate: 12,
    activityGold: 15,
  },
}

const EMPTY_SUMMARY_MOCK: AgentProfitSummaryMock = {
  gameProfit: 0,
  rebateEarn: 0,
  vipBonus: 0,
  vipRebate: 0,
  activityGold: 0,
}

function formatProfitAmount(value: number) {
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (value > 0) return `+${abs}`
  if (value < 0) return `-${abs}`
  return '0.00'
}

function profitTone(value: number): ProfitValueTone {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function getAgentProfitSummaryMock(currency: string) {
  return PROFIT_SUMMARY_BY_CURRENCY[currency] ?? EMPTY_SUMMARY_MOCK
}

/** 代理盈亏总值（按公式计算） */
export function getAgentTotalProfit(currency: string) {
  const stats = getAgentProfitSummaryMock(currency)
  const total = stats.gameProfit + stats.rebateEarn - stats.vipBonus - stats.activityGold
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 报表「实占佣金」= 游戏盈亏 + 【-VIP晋级礼金】 + 【-活动金】 */
export const AGENT_SHARE_INCOME_FORMULA =
  '实占佣金 = 游戏盈亏 + 【-VIP晋级礼金】+ 【-活动金】'

/** 报表实占佣金总值（不含赚水） */
export function getAgentShareIncome(currency: string) {
  const stats = getAgentProfitSummaryMock(currency)
  const total = stats.gameProfit - stats.vipBonus - stats.activityGold
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 报表实占佣金细项：游戏盈亏 / VIP晋级礼金 / 活动金 */
export function getAgentShareIncomeRows(currency: string): AgentProfitSummaryRow[] {
  const stats = getAgentProfitSummaryMock(currency)

  return [
    { label: '游戏盈亏', value: formatProfitAmount(stats.gameProfit), tone: profitTone(stats.gameProfit) },
    {
      label: 'VIP晋级礼金',
      value: formatProfitAmount(-stats.vipBonus),
      tone: profitTone(-stats.vipBonus),
    },
    {
      label: '活动金',
      value: formatProfitAmount(-stats.activityGold),
      tone: profitTone(-stats.activityGold),
    },
  ]
}

/** 按顶栏币种切换盈亏汇总口径（四项构成 + 代理盈亏总值另取） */
export function getAgentProfitSummaryRows(currency: string): AgentProfitSummaryRow[] {
  const stats = getAgentProfitSummaryMock(currency)

  return [
    { label: '游戏盈亏', value: formatProfitAmount(stats.gameProfit), tone: profitTone(stats.gameProfit) },
    { label: '赚水', value: formatProfitAmount(stats.rebateEarn), tone: profitTone(stats.rebateEarn) },
    {
      label: 'VIP晋级礼金',
      value: formatProfitAmount(-stats.vipBonus),
      tone: profitTone(-stats.vipBonus),
    },
    {
      label: 'VIP退水',
      value: formatProfitAmount(-stats.vipRebate),
      tone: profitTone(-stats.vipRebate),
    },
  ]
}

/** @deprecated 请使用 getAgentShareIncomeRows */
export function getAgentProfitFormulaRows(currency: string): AgentProfitSummaryRow[] {
  return getAgentShareIncomeRows(currency)
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
  { key: 'overall', label: '全部' },
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
  overall: [],
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
  ],
}

/** 各品类合计（原型 Mock） */
const OVERALL_GAME_DETAIL: AgentProfitDetail = {
  title: '全部（实占）',
  totalProfit: '+12,800.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额（不参与计算）', value: '86,420.00', tone: 'neutral' },
    { label: '输赢', value: '+12,350.00', tone: 'positive' },
    { label: '退水', value: '-1,280.00', tone: 'negative' },
    { label: 'VIP退水', value: '-150.00', tone: 'negative' },
    { label: '赚水', value: '+860.00', tone: 'positive' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额（不参与计算）', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '赚水', value: '0.00', tone: 'neutral' },
]

export function getAgentProfitDetail(
  category: AgentProfitCategoryKey,
  vendor: AgentProfitVendorKey,
): AgentProfitDetail {
  if (category === 'overall') {
    return OVERALL_GAME_DETAIL
  }

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
