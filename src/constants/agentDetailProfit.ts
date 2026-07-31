export type AgentProfitCategoryKey =
  | 'overall'
  | 'sports'
  | 'live'
  | 'chess'
  | 'marble'
  | 'scratch'
  | 'lottery'

export type AgentProfitVendorKey = 'all' | 'im' | 'jingang' | 'saba' | 'cdn'

export type ProfitValueTone = 'neutral' | 'positive' | 'negative'

export type AgentProfitSummaryRow = {
  label: string
  value: string
  tone?: ProfitValueTone
}

/** 代理盈亏 = 【实占游戏输赢】 + 【-实占退水】 + 【-实占VIP退水】 + 【-代理赚水】 + 【-实占VIP晋级礼金】 + 【-实占VIP额外奖金】 + 【-实占活动金】 */
export const AGENT_PROFIT_FORMULA =
  '代理盈亏 = 【实占游戏输赢】 + 【-实占退水】 + 【-实占VIP退水】 + 【-代理赚水】 + 【-实占VIP晋级礼金】 + 【-实占VIP额外奖金】 + 【-实占活动金】'

/** 返佣 · 代理佣金（不含退水、代理赚水） */
export const AGENT_COMMISSION_FORMULA =
  '代理佣金 = 【输赢】 + 【-VIP退水】 + 【-VIP晋级礼金】 + 【-VIP额外奖金】 + 【-活动金】'

type AgentProfitSummaryMock = {
  /** 实占游戏输赢（按公式直接累加） */
  actualWin: number
  /** 实占退水（公式中取负） */
  actualRebate: number
  /** 实占 VIP 退水（公式中取负） */
  actualVipRebate: number
  /** 代理赚水（公式中取负） */
  rebateEarn: number
  /** 实占 VIP 晋级礼金（公式中取负） */
  vipBonus: number
  /** 实占 VIP 额外奖金（公式中取负） */
  vipExtraBonus: number
  /** 实占活动金（公式中取负） */
  activityGold: number
}

const PROFIT_SUMMARY_BY_CURRENCY: Record<string, AgentProfitSummaryMock> = {
  KKC: {
    actualWin: 14890,
    actualRebate: 1280,
    actualVipRebate: 150,
    rebateEarn: 860,
    vipBonus: 320,
    vipExtraBonus: 100,
    activityGold: 180,
  },
  USDT: {
    actualWin: 3740,
    actualRebate: 280,
    actualVipRebate: 50,
    rebateEarn: 210,
    vipBonus: 80,
    vipExtraBonus: 25,
    activityGold: 50,
  },
  KKV: {
    actualWin: 9996,
    actualRebate: 780,
    actualVipRebate: 96,
    rebateEarn: 520,
    vipBonus: 210,
    vipExtraBonus: 65,
    activityGold: 120,
  },
  '信用额度-CNY': {
    actualWin: 1848,
    actualRebate: 135,
    actualVipRebate: 35,
    rebateEarn: 128,
    vipBonus: 60,
    vipExtraBonus: 20,
    activityGold: 40,
  },
  '信用额度-USD': {
    actualWin: 750,
    actualRebate: 118,
    actualVipRebate: 12,
    rebateEarn: 48,
    vipBonus: 22,
    vipExtraBonus: 8,
    activityGold: 15,
  },
}

const EMPTY_SUMMARY_MOCK: AgentProfitSummaryMock = {
  actualWin: 0,
  actualRebate: 0,
  actualVipRebate: 0,
  rebateEarn: 0,
  vipBonus: 0,
  vipExtraBonus: 0,
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
  const total =
    stats.actualWin -
    stats.actualRebate -
    stats.actualVipRebate -
    stats.rebateEarn -
    stats.vipBonus -
    stats.vipExtraBonus -
    stats.activityGold
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 返佣 · 代理佣金总值（输赢 − VIP退水 − VIP晋级礼金 − VIP额外奖金 − 活动金） */
export function getAgentTotalCommission(currency: string) {
  const stats = getAgentProfitSummaryMock(currency)
  const total =
    stats.actualWin -
    stats.actualVipRebate -
    stats.vipBonus -
    stats.vipExtraBonus -
    stats.activityGold
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 场馆明细标题与公式左侧统一为「游戏净输赢」 */
export const AGENT_GAME_PROFIT_FORMULA =
  '游戏净输赢 = 【实占游戏输赢】 + 【-实占退水】 + 【-实占VIP退水】 + 【-代理赚水】'

/** 按顶栏币种切换盈亏汇总口径（七项构成 + 代理盈亏总值另取） */
export function getAgentProfitSummaryRows(currency: string): AgentProfitSummaryRow[] {
  const stats = getAgentProfitSummaryMock(currency)

  return [
    {
      label: '输赢',
      value: formatProfitAmount(stats.actualWin),
      tone: profitTone(stats.actualWin),
    },
    {
      label: '退水',
      value: formatProfitAmount(-stats.actualRebate),
      tone: profitTone(-stats.actualRebate),
    },
    {
      label: 'VIP退水',
      value: formatProfitAmount(-stats.actualVipRebate),
      tone: profitTone(-stats.actualVipRebate),
    },
    {
      label: '代理赚水',
      value: formatProfitAmount(-stats.rebateEarn),
      tone: profitTone(-stats.rebateEarn),
    },
    {
      label: 'VIP晋级礼金',
      value: formatProfitAmount(-stats.vipBonus),
      tone: profitTone(-stats.vipBonus),
    },
    {
      label: 'VIP额外奖金',
      value: formatProfitAmount(-stats.vipExtraBonus),
      tone: profitTone(-stats.vipExtraBonus),
    },
    {
      label: '活动金',
      value: formatProfitAmount(-stats.activityGold),
      tone: profitTone(-stats.activityGold),
    },
  ]
}

/** 返佣 · 代理佣金细项：输赢 / VIP退水 / VIP晋级礼金 / VIP额外奖金 / 活动金 */
export function getAgentCommissionSummaryRows(currency: string): AgentProfitSummaryRow[] {
  const stats = getAgentProfitSummaryMock(currency)
  return [
    {
      label: '输赢',
      value: formatProfitAmount(stats.actualWin),
      tone: profitTone(stats.actualWin),
    },
    {
      label: 'VIP退水',
      value: formatProfitAmount(-stats.actualVipRebate),
      tone: profitTone(-stats.actualVipRebate),
    },
    {
      label: 'VIP晋级礼金',
      value: formatProfitAmount(-stats.vipBonus),
      tone: profitTone(-stats.vipBonus),
    },
    {
      label: 'VIP额外奖金',
      value: formatProfitAmount(-stats.vipExtraBonus),
      tone: profitTone(-stats.vipExtraBonus),
    },
    {
      label: '活动金',
      value: formatProfitAmount(-stats.activityGold),
      tone: profitTone(-stats.activityGold),
    },
  ]
}

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

const VENDOR_ALL = { key: 'all' as const, label: '全部' }

export const AGENT_PROFIT_VENDORS: Record<
  AgentProfitCategoryKey,
  { key: AgentProfitVendorKey; label: string }[]
> = {
  overall: [],
  sports: [
    VENDOR_ALL,
    { key: 'im', label: 'IM体育' },
    { key: 'jingang', label: '金刚体育' },
    { key: 'saba', label: 'SABA体育' },
    { key: 'cdn', label: 'CDN体育' },
  ],
  live: [
    VENDOR_ALL,
    { key: 'im', label: 'IM真人' },
    { key: 'jingang', label: '金刚真人' },
  ],
  chess: [
    VENDOR_ALL,
    { key: 'im', label: 'IM棋牌' },
    { key: 'cdn', label: 'CDN棋牌' },
  ],
  marble: [VENDOR_ALL, { key: 'im', label: 'IM弹珠' }],
  scratch: [VENDOR_ALL, { key: 'jingang', label: '金刚刮刮乐' }],
  lottery: [
    VENDOR_ALL,
    { key: 'saba', label: 'SABA彩票' },
    { key: 'cdn', label: 'CDN彩票' },
  ],
}

const IM_SPORTS_DETAIL: AgentProfitDetail = {
  title: 'IM体育（实占）',
  /** 游戏净输赢 = 输赢 − 退水 − VIP退水 − 代理赚水 */
  totalProfit: '+340.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '1000.00', tone: 'neutral' },
    { label: '输赢', value: '+500.00', tone: 'positive' },
    { label: '退水', value: '-100.00', tone: 'negative' },
    { label: 'VIP退水', value: '-50.00', tone: 'negative' },
    { label: '代理赚水', value: '-10.00', tone: 'negative' },
  ],
}

/** 各品类合计（原型 Mock） */
const OVERALL_GAME_DETAIL: AgentProfitDetail = {
  title: '全部（实占）',
  /** 游戏净输赢 = 输赢 − 退水 − VIP退水 − 代理赚水 */
  totalProfit: '+10,060.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '86,420.00', tone: 'neutral' },
    { label: '输赢', value: '+12,350.00', tone: 'positive' },
    { label: '退水', value: '-1,280.00', tone: 'negative' },
    { label: 'VIP退水', value: '-150.00', tone: 'negative' },
    { label: '代理赚水', value: '-860.00', tone: 'negative' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '代理赚水', value: '0.00', tone: 'neutral' },
]

/** 品类下二级「全部」合计（原型 Mock） */
function getCategoryVendorAllDetail(category: AgentProfitCategoryKey): AgentProfitDetail {
  const catLabel =
    AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'

  if (category === 'sports') {
    return {
      title: `${catLabel}（实占）`,
      totalProfit: '+8,420.00',
      totalProfitTone: 'positive',
      rows: [
        { label: '下注有效金额', value: '42,800.00', tone: 'neutral' },
        { label: '输赢', value: '+9,860.00', tone: 'positive' },
        { label: '退水', value: '-980.00', tone: 'negative' },
        { label: 'VIP退水', value: '-120.00', tone: 'negative' },
        { label: '代理赚水', value: '-340.00', tone: 'negative' },
      ],
    }
  }

  return {
    title: `${catLabel}（实占）`,
    totalProfit: '+0.00',
    totalProfitTone: 'positive',
    rows: EMPTY_DETAIL_ROWS,
  }
}

export function getAgentProfitDetail(
  category: AgentProfitCategoryKey,
  vendor: AgentProfitVendorKey,
): AgentProfitDetail {
  if (category === 'overall') {
    return OVERALL_GAME_DETAIL
  }

  if (vendor === 'all') {
    return getCategoryVendorAllDetail(category)
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
