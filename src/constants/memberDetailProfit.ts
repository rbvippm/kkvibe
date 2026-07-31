import {
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS,
  profitTotalClass,
  profitValueClass,
  type AgentProfitCategoryKey,
  type AgentProfitDetail,
  type AgentProfitDetailRow,
  type AgentProfitSection,
  type AgentProfitSectionRow,
  type AgentProfitSummaryRow,
  type AgentProfitVendorKey,
  type ProfitValueTone,
} from './agentDetailProfit'

export type MemberProfitCategoryKey = AgentProfitCategoryKey
export type MemberProfitVendorKey = AgentProfitVendorKey
export type MemberProfitSummaryRow = AgentProfitSummaryRow
export type MemberProfitSection = AgentProfitSection
export type MemberProfitSectionRow = AgentProfitSectionRow

export {
  AGENT_PROFIT_CATEGORY_TABS as MEMBER_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS as MEMBER_PROFIT_VENDORS,
  profitTotalClass,
  profitValueClass,
}

/** 经典汇总卡 · 会员盈亏公式 tip */
export const MEMBER_PROFIT_FORMULA =
  '会员盈亏 = 【游戏输赢】 + 【会员退水】 + 【VIP退水】 + 【VIP晋级礼金】 + 【VIP额外奖金】 + 【活动金】'

/** 分区新结构 · 总盈亏公式（隐藏预览模式） */
export const MEMBER_PROFIT_SECTION_FORMULA = '总盈亏 = 游戏净输赢 - 其他成本'

/** 会员 · 游戏净输赢细项 tip */
export const MEMBER_PROFIT_GAME_NET_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【-会员退水】 + 【-VIP退水】 + 【-代理赚水】'

/** 场馆明细标题与公式左侧统一为「游戏净输赢」（不含成本三项；占成含场馆费） */
export const MEMBER_GAME_PROFIT_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【-会员退水】 + 【-VIP退水】 + 【-代理赚水】 + 【-场馆费】'

/** 返佣查看会员游戏统计：无会员退水（返佣不给会员设退水） */
export const MEMBER_REBATE_GAME_NET_PROFIT_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【-VIP退水】 + 【-场馆费】'

export function memberRebateGameNetProfitFormula() {
  return MEMBER_REBATE_GAME_NET_PROFIT_FORMULA
}

type MemberProfitSummaryMock = {
  gameProfit: number
  memberRebate: number
  vipRebate: number
  /** 代理赚水（公式中取负） */
  rebateEarn: number
  vipBonus: number
  vipExtraBonus: number
  activityGold: number
  /** 充提手续费（公式中取负） */
  depositWithdrawFee: number
}

const PROFIT_SUMMARY_BY_CURRENCY: Record<string, MemberProfitSummaryMock> = {
  KKC: {
    gameProfit: 12350,
    memberRebate: 1280,
    vipRebate: 150,
    rebateEarn: 860,
    vipBonus: 320,
    vipExtraBonus: 100,
    activityGold: 180,
    depositWithdrawFee: 60,
  },
  USDT: {
    gameProfit: 3200,
    memberRebate: 210,
    vipRebate: 35,
    rebateEarn: 180,
    vipBonus: 80,
    vipExtraBonus: 25,
    activityGold: 50,
    depositWithdrawFee: 18,
  },
  KKV: {
    gameProfit: 8600,
    memberRebate: 520,
    vipRebate: 80,
    rebateEarn: 420,
    vipBonus: 210,
    vipExtraBonus: 65,
    activityGold: 120,
    depositWithdrawFee: 42,
  },
  '信用额度-CNY': {
    gameProfit: 1550,
    memberRebate: 128,
    vipRebate: 18,
    rebateEarn: 90,
    vipBonus: 60,
    vipExtraBonus: 20,
    activityGold: 40,
    depositWithdrawFee: 16,
  },
  '信用额度-USD': {
    gameProfit: 620,
    memberRebate: 48,
    vipRebate: 8,
    rebateEarn: 36,
    vipBonus: 22,
    vipExtraBonus: 8,
    activityGold: 15,
    depositWithdrawFee: 8,
  },
}

const EMPTY_SUMMARY_MOCK: MemberProfitSummaryMock = {
  gameProfit: 0,
  memberRebate: 0,
  vipRebate: 0,
  rebateEarn: 0,
  vipBonus: 0,
  vipExtraBonus: 0,
  activityGold: 0,
  depositWithdrawFee: 0,
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

/** 游戏净输赢合计：游戏输赢 − 会员退水 − VIP退水 − 代理赚水 */
export function getMemberGameNetTotal(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  return (
    stats.gameProfit - stats.memberRebate - stats.vipRebate - stats.rebateEarn
  )
}

/** 其他成本合计（绝对值，正数） */
export function getMemberOtherCostAbs(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  return (
    stats.vipBonus +
    stats.vipExtraBonus +
    stats.activityGold +
    stats.depositWithdrawFee
  )
}

/** 经典汇总卡 · 会员盈亏总值（六项累加口径） */
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

/** 分区新结构 · 总盈亏 = 游戏净输赢 − 其他成本 */
export function getMemberSectionTotalProfit(currency: string) {
  const total = getMemberGameNetTotal(currency) - getMemberOtherCostAbs(currency)
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

function sumSectionRows(rows: MemberProfitSectionRow[], totalKey: string): MemberProfitSectionRow {
  const sum = rows.reduce((acc, row) => {
    const n = Number(row.value.replace(/,/g, '').replace(/^\+/, '')) || 0
    return acc + n
  }, 0)
  return {
    key: totalKey,
    label: '合计',
    value: formatProfitAmount(sum),
    tone: profitTone(sum),
  }
}

/** 占成 · 游戏净输赢分区（对齐代理盈亏） */
export function getMemberProfitGameSection(currency: string): MemberProfitSection {
  const stats = getMemberProfitSummaryMock(currency)
  const rows: MemberProfitSectionRow[] = [
    {
      key: 'win',
      label: '游戏输赢',
      value: formatProfitAmount(stats.gameProfit),
      tone: profitTone(stats.gameProfit),
    },
    {
      key: 'member_rebate',
      label: '会员退水',
      value: formatProfitAmount(-stats.memberRebate),
      tone: profitTone(-stats.memberRebate),
    },
    {
      key: 'vip_rebate',
      label: 'VIP退水',
      value: formatProfitAmount(-stats.vipRebate),
      tone: profitTone(-stats.vipRebate),
    },
    {
      key: 'rebate_earn',
      label: '代理赚水',
      value: formatProfitAmount(-stats.rebateEarn),
      tone: profitTone(-stats.rebateEarn),
    },
  ]
  return {
    nameHeader: '游戏净输赢',
    amountHeader: '金额',
    rows,
    total: sumSectionRows(rows, 'game_sum'),
  }
}

/** 占成 · 其他成本分区（对齐代理盈亏，含充提手续费；无实占文案） */
export function getMemberProfitCostSection(currency: string): MemberProfitSection {
  const stats = getMemberProfitSummaryMock(currency)
  const rows: MemberProfitSectionRow[] = [
    {
      key: 'vip_bonus',
      label: 'VIP晋级礼金',
      value: formatProfitAmount(-stats.vipBonus),
      tone: profitTone(-stats.vipBonus),
    },
    {
      key: 'vip_extra',
      label: 'VIP额外奖金',
      value: formatProfitAmount(-stats.vipExtraBonus),
      tone: profitTone(-stats.vipExtraBonus),
    },
    {
      key: 'activity',
      label: '活动金',
      value: formatProfitAmount(-stats.activityGold),
      tone: profitTone(-stats.activityGold),
    },
    {
      key: 'deposit_withdraw_fee',
      label: '充提手续费',
      value: formatProfitAmount(-stats.depositWithdrawFee),
      tone: profitTone(-stats.depositWithdrawFee),
    },
  ]
  return {
    nameHeader: '其他成本',
    amountHeader: '金额',
    rows,
    total: sumSectionRows(rows, 'cost_sum'),
  }
}

/** 占成公式卡：游戏净输赢 − 其他成本 = 总盈亏 */
export function getMemberProfitFormula(currency: string) {
  const game = getMemberProfitGameSection(currency).total
  const costAbs = getMemberOtherCostAbs(currency)
  const total = getMemberSectionTotalProfit(currency)
  return {
    gameAmountText: game.value,
    gameTone: game.tone,
    costAmountText: Math.abs(costAbs).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    totalAmountText: total.value,
    totalTone: total.tone,
  }
}

export type MemberProfitDialogDetailRow = {
  label: string
  amountText: string
  tone: ProfitValueTone
  emphasize?: boolean
  formulaTip?: string
}

export type MemberProfitDialogKind = 'game' | 'total'

/** 会员盈亏 · 点击合计 / 总盈亏查看细项与公式 */
export function getMemberProfitDialogDetail(
  kind: MemberProfitDialogKind,
  currency: string,
): MemberProfitDialogDetailRow[] {
  const game = getMemberProfitGameSection(currency)
  const cost = getMemberProfitCostSection(currency)
  const mapRow = (row: MemberProfitSectionRow): MemberProfitDialogDetailRow => ({
    label: row.label,
    amountText: row.value,
    tone: row.tone,
  })

  if (kind === 'game') {
    return [
      ...game.rows.map(mapRow),
      {
        label: '游戏净输赢',
        amountText: game.total.value,
        tone: game.total.tone,
        emphasize: true,
        formulaTip: MEMBER_PROFIT_GAME_NET_FORMULA,
      },
    ]
  }

  const total = getMemberSectionTotalProfit(currency)
  return [
    ...game.rows.map(mapRow),
    ...cost.rows.map(mapRow),
    {
      label: '总盈亏',
      amountText: total.value,
      tone: total.tone,
      emphasize: true,
      formulaTip: MEMBER_PROFIT_SECTION_FORMULA,
    },
  ]
}

export function memberProfitDialogTitle(kind: MemberProfitDialogKind) {
  return kind === 'game' ? '游戏净输赢明细' : '总盈亏明细'
}

/** 经典汇总卡 · 六项构成 */
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
  title: 'IM体育（实占）',
  /** 游戏净输赢 = 输赢 − 会员退水 − VIP退水 − 代理赚水 − 场馆费 = 320 */
  totalProfit: '+320.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '1000.00', tone: 'neutral' },
    { label: '输赢', value: '+500.00', tone: 'positive' },
    { label: '会员退水', value: '-100.00', tone: 'negative' },
    { label: 'VIP退水', value: '-50.00', tone: 'negative' },
    { label: '代理赚水', value: '-10.00', tone: 'negative' },
    { label: '场馆费', value: '-20.00', tone: 'negative' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '会员退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '代理赚水', value: '0.00', tone: 'neutral' },
  { label: '场馆费', value: '0.00', tone: 'neutral' },
]

/** 各品类合计：游戏净输赢 = 12350 − 1280 − 150 − 860 − 80 = 9980 */
const OVERALL_GAME_DETAIL: AgentProfitDetail = {
  title: '全部（实占）',
  totalProfit: '+9,980.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '86,420.00', tone: 'neutral' },
    { label: '输赢', value: '+12,350.00', tone: 'positive' },
    { label: '会员退水', value: '-1,280.00', tone: 'negative' },
    { label: 'VIP退水', value: '-150.00', tone: 'negative' },
    { label: '代理赚水', value: '-860.00', tone: 'negative' },
    { label: '场馆费', value: '-80.00', tone: 'negative' },
  ],
}

/** 品类下二级「全部」合计（原型 Mock） */
function getMemberCategoryVendorAllDetail(category: MemberProfitCategoryKey): AgentProfitDetail {
  const catLabel =
    AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'

  if (category === 'sports') {
    /** 游戏净输赢 = 9860 − 980 − 120 − 340 − 40 = 8380 */
    return {
      title: `${catLabel}（实占）`,
      totalProfit: '+8,380.00',
      totalProfitTone: 'positive',
      rows: [
        { label: '下注有效金额', value: '42,800.00', tone: 'neutral' },
        { label: '输赢', value: '+9,860.00', tone: 'positive' },
        { label: '会员退水', value: '-980.00', tone: 'negative' },
        { label: 'VIP退水', value: '-120.00', tone: 'negative' },
        { label: '代理赚水', value: '-340.00', tone: 'negative' },
        { label: '场馆费', value: '-40.00', tone: 'negative' },
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
    title: `${vendorLabel}（实占）`,
    totalProfit: '+0.00',
    totalProfitTone: 'positive',
    rows: EMPTY_DETAIL_ROWS,
  }
}
