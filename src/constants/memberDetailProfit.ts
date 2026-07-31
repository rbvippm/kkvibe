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
  type ProfitValueTone,
} from './agentDetailProfit'

export type MemberProfitCategoryKey = AgentProfitCategoryKey
export type MemberProfitVendorKey = AgentProfitVendorKey
export type MemberProfitSummaryRow = AgentProfitSummaryRow

export {
  AGENT_PROFIT_CATEGORY_TABS as MEMBER_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS as MEMBER_PROFIT_VENDORS,
  profitTotalClass,
  profitValueClass,
}

/** 会员盈亏 = 【游戏输赢】 + 【会员退水】 + 【VIP退水】 + 【VIP晋级礼金】 + 【VIP额外奖金】 + 【活动金】 */
export const MEMBER_PROFIT_FORMULA =
  '会员盈亏 = 【游戏输赢】 + 【会员退水】 + 【VIP退水】 + 【VIP晋级礼金】 + 【VIP额外奖金】 + 【活动金】'

/** 场馆明细标题与公式左侧统一为「游戏净输赢」（不含成本三项；占成） */
export const MEMBER_GAME_PROFIT_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【-会员退水】 + 【-VIP退水】 + 【-代理赚水】'

/** 返佣查看会员游戏统计：无会员退水（返佣不给会员设退水） */
export const MEMBER_REBATE_GAME_NET_PROFIT_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【-VIP退水】'

/** 一级代理看直属会员：另含代理赚水 */
export const MEMBER_REBATE_GAME_NET_PROFIT_FORMULA_WITH_EARN =
  '游戏净输赢 = 【游戏输赢】 + 【-VIP退水】 + 【-代理赚水】'

export function memberRebateGameNetProfitFormula(includeEarnWater: boolean) {
  return includeEarnWater
    ? MEMBER_REBATE_GAME_NET_PROFIT_FORMULA_WITH_EARN
    : MEMBER_REBATE_GAME_NET_PROFIT_FORMULA
}

type MemberProfitSummaryMock = {
  gameProfit: number
  memberRebate: number
  /** VIP退水（按公式直接累加） */
  vipRebate: number
  vipBonus: number
  /** VIP 额外奖金（按公式直接累加） */
  vipExtraBonus: number
  /** 活动金（按公式直接累加） */
  activityGold: number
}

const PROFIT_SUMMARY_BY_CURRENCY: Record<string, MemberProfitSummaryMock> = {
  KKC: {
    gameProfit: 12350,
    memberRebate: 1280,
    vipRebate: 150,
    vipBonus: 320,
    vipExtraBonus: 100,
    activityGold: 180,
  },
  USDT: {
    gameProfit: 3200,
    memberRebate: 210,
    vipRebate: 35,
    vipBonus: 80,
    vipExtraBonus: 25,
    activityGold: 50,
  },
  KKV: {
    gameProfit: 8600,
    memberRebate: 520,
    vipRebate: 80,
    vipBonus: 210,
    vipExtraBonus: 65,
    activityGold: 120,
  },
  '信用额度-CNY': {
    gameProfit: 1550,
    memberRebate: 128,
    vipRebate: 18,
    vipBonus: 60,
    vipExtraBonus: 20,
    activityGold: 40,
  },
  '信用额度-USD': {
    gameProfit: 620,
    memberRebate: 48,
    vipRebate: 8,
    vipBonus: 22,
    vipExtraBonus: 8,
    activityGold: 15,
  },
}

const EMPTY_SUMMARY_MOCK: MemberProfitSummaryMock = {
  gameProfit: 0,
  memberRebate: 0,
  vipRebate: 0,
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

function getMemberProfitSummaryMock(currency: string) {
  return PROFIT_SUMMARY_BY_CURRENCY[currency] ?? EMPTY_SUMMARY_MOCK
}

/** 会员盈亏总值（按公式计算，随顶栏币种切换） */
export function getMemberTotalProfit(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  const total =
    stats.gameProfit +
    stats.memberRebate +
    stats.vipRebate +
    stats.vipBonus +
    stats.vipExtraBonus +
    stats.activityGold
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 会员盈亏构成项（与公式六项一致） */
export function getMemberProfitSummaryRows(currency: string): MemberProfitSummaryRow[] {
  const stats = getMemberProfitSummaryMock(currency)

  return [
    {
      label: '游戏输赢',
      value: formatProfitAmount(stats.gameProfit),
      tone: profitTone(stats.gameProfit),
    },
    {
      label: '会员退水',
      value: formatProfitAmount(stats.memberRebate),
      tone: profitTone(stats.memberRebate),
    },
    {
      label: 'VIP退水',
      value: formatProfitAmount(stats.vipRebate),
      tone: profitTone(stats.vipRebate),
    },
    {
      label: 'VIP晋级礼金',
      value: formatProfitAmount(stats.vipBonus),
      tone: profitTone(stats.vipBonus),
    },
    {
      label: 'VIP额外奖金',
      value: formatProfitAmount(stats.vipExtraBonus),
      tone: profitTone(stats.vipExtraBonus),
    },
    {
      label: '活动金',
      value: formatProfitAmount(stats.activityGold),
      tone: profitTone(stats.activityGold),
    },
  ]
}

const IM_SPORTS_DETAIL: AgentProfitDetail = {
  title: 'IM体育',
  /** 游戏净输赢 = 输赢 − 会员退水 − VIP退水 − 代理赚水 */
  totalProfit: '+340.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '1000.00', tone: 'neutral' },
    { label: '输赢', value: '+500.00', tone: 'positive' },
    { label: '会员退水', value: '-100.00', tone: 'negative' },
    { label: 'VIP退水', value: '-50.00', tone: 'negative' },
    { label: '代理赚水', value: '-10.00', tone: 'negative' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '会员退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '代理赚水', value: '0.00', tone: 'neutral' },
]

/** 各品类合计：游戏净输赢 = 12350 − 1280 − 150 − 860 = 10060 */
const OVERALL_GAME_DETAIL: AgentProfitDetail = {
  title: '全部',
  totalProfit: '+10,060.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '86,420.00', tone: 'neutral' },
    { label: '输赢', value: '+12,350.00', tone: 'positive' },
    { label: '会员退水', value: '-1,280.00', tone: 'negative' },
    { label: 'VIP退水', value: '-150.00', tone: 'negative' },
    { label: '代理赚水', value: '-860.00', tone: 'negative' },
  ],
}

/** 品类下二级「全部」合计（原型 Mock） */
function getMemberCategoryVendorAllDetail(category: MemberProfitCategoryKey): AgentProfitDetail {
  const catLabel =
    AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'

  if (category === 'sports') {
    /** 游戏净输赢 = 9860 − 980 − 120 − 340 = 8420 */
    return {
      title: catLabel,
      totalProfit: '+8,420.00',
      totalProfitTone: 'positive',
      rows: [
        { label: '下注有效金额', value: '42,800.00', tone: 'neutral' },
        { label: '输赢', value: '+9,860.00', tone: 'positive' },
        { label: '会员退水', value: '-980.00', tone: 'negative' },
        { label: 'VIP退水', value: '-120.00', tone: 'negative' },
        { label: '代理赚水', value: '-340.00', tone: 'negative' },
      ],
    }
  }

  return {
    title: catLabel,
    totalProfit: '+0.00',
    totalProfitTone: 'positive',
    rows: EMPTY_DETAIL_ROWS,
  }
}

export function getMemberProfitDetail(
  category: MemberProfitCategoryKey,
  vendor: MemberProfitVendorKey,
): AgentProfitDetail {
  if (category === 'overall') {
    return OVERALL_GAME_DETAIL
  }

  if (vendor === 'all') {
    return getMemberCategoryVendorAllDetail(category)
  }

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
