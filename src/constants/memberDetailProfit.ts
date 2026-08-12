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

/**
 * 会员盈亏 tip / 明细末行公式（退水对会员为正）
 * 会员盈亏 = 游戏输赢 + 会员退水 + VIP退水 + VIP晋级礼金 + VIP额外奖金 + 活动金
 */
export const MEMBER_PROFIT_FORMULA =
  '会员盈亏 = 游戏输赢 + 会员退水 + VIP退水 + VIP晋级礼金 + VIP额外奖金 + 活动金'

/** 分区结构公式（游戏净输赢含正退水，与六项 tip 数值自洽） */
export const MEMBER_PROFIT_SECTION_FORMULA = '会员盈亏 = 游戏净输赢 + 其他奖励'

/**
 * 会员 · 游戏净输赢公式（占成；退水对会员为正）
 * 游戏净输赢 = 【游戏输赢】 + 【会员退水】 + 【VIP退水】
 */
export const MEMBER_PROFIT_GAME_NET_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【会员退水】 + 【VIP退水】'

/** 场馆明细标题与公式左侧统一为「游戏净输赢」（与上式一致） */
export const MEMBER_GAME_PROFIT_FORMULA = MEMBER_PROFIT_GAME_NET_FORMULA

/** 返佣查看会员游戏统计：无会员退水；VIP 退水对会员为正；不含场馆费 */
export const MEMBER_REBATE_GAME_NET_PROFIT_FORMULA =
  '游戏净输赢 = 【游戏输赢】 + 【VIP退水】'

export function memberRebateGameNetProfitFormula() {
  return MEMBER_REBATE_GAME_NET_PROFIT_FORMULA
}

type MemberProfitSummaryMock = {
  gameProfit: number
  memberRebate: number
  vipRebate: number
  vipBonus: number
  vipExtraBonus: number
  activityGold: number
  /** 充提手续费（游戏统计等场景用；不计入会员盈亏分区） */
  depositWithdrawFee: number
}

const PROFIT_SUMMARY_BY_CURRENCY: Record<string, MemberProfitSummaryMock> = {
  KKC: {
    gameProfit: 12350,
    memberRebate: 1280,
    vipRebate: 150,
    vipBonus: 320,
    vipExtraBonus: 100,
    activityGold: 180,
    depositWithdrawFee: 60,
  },
  USDT: {
    gameProfit: 3200,
    memberRebate: 210,
    vipRebate: 35,
    vipBonus: 80,
    vipExtraBonus: 25,
    activityGold: 50,
    depositWithdrawFee: 18,
  },
  KKV: {
    gameProfit: 8600,
    memberRebate: 520,
    vipRebate: 80,
    vipBonus: 210,
    vipExtraBonus: 65,
    activityGold: 120,
    depositWithdrawFee: 42,
  },
  '信用额度-CNY': {
    gameProfit: 1550,
    memberRebate: 128,
    vipRebate: 18,
    vipBonus: 60,
    vipExtraBonus: 20,
    activityGold: 40,
    depositWithdrawFee: 16,
  },
  '信用额度-USD': {
    gameProfit: 620,
    memberRebate: 48,
    vipRebate: 8,
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

function parseProfitAmountText(text: string) {
  return Number(text.replace(/,/g, '').replace(/^\+/, '')) || 0
}

function scaleAmountList(values: number[], targetSum: number): number[] {
  const sum = values.reduce((acc, n) => acc + n, 0)
  if (!sum) return values.map(() => 0)
  const scaled = values.map((n) => Number(((n * targetSum) / sum).toFixed(2)))
  const drift = Number((targetSum - scaled.reduce((acc, n) => acc + n, 0)).toFixed(2))
  scaled[scaled.length - 1] = Number((scaled[scaled.length - 1] + drift).toFixed(2))
  return scaled
}

function getMemberProfitSummaryMock(currency: string) {
  return PROFIT_SUMMARY_BY_CURRENCY[currency] ?? EMPTY_SUMMARY_MOCK
}

/** 游戏净输赢合计：游戏输赢 + 会员退水 + VIP退水（退水对会员为正） */
export function getMemberGameNetTotal(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  return stats.gameProfit + stats.memberRebate + stats.vipRebate
}

/** 其他奖励合计（VIP晋级礼金 + VIP额外奖金 + 活动金） */
export function getMemberOtherRewardTotal(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  return stats.vipBonus + stats.vipExtraBonus + stats.activityGold
}

/** @deprecated 请用 getMemberOtherRewardTotal */
export function getMemberOtherCostAbs(currency: string) {
  return getMemberOtherRewardTotal(currency)
}

/** 六项正数合计（与 MEMBER_PROFIT_FORMULA 一致） */
export function getMemberSixTermTotal(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  return (
    stats.gameProfit +
    stats.memberRebate +
    stats.vipRebate +
    stats.vipBonus +
    stats.vipExtraBonus +
    stats.activityGold
  )
}

/** 经典汇总卡 · 会员盈亏总值（六项正数） */
export function getMemberTotalProfit(currency: string) {
  const total = getMemberSixTermTotal(currency)
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 分区 · 会员盈亏 = 游戏净输赢 + 其他奖励（与六项正数自洽） */
export function getMemberSectionTotalProfit(currency: string) {
  return getMemberTotalProfit(currency)
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

/** 与代理盈亏 /「我的报表-盈亏」一致的游戏大类权重（合计缩放至会员游戏净输赢） */
const MEMBER_GAME_CATEGORY_BASE: { key: string; label: string; weight: number }[] = [
  { key: 'scratch', label: '刮刮乐', weight: 123567.88 },
  { key: 'marble', label: '弹珠', weight: -23567.88 },
  { key: 'chess', label: '棋牌', weight: 123567.88 },
  { key: 'lottery', label: '彩票', weight: -23567.88 },
  { key: 'qutou', label: '趣投', weight: 123567.88 },
  { key: 'sports', label: '体育', weight: -23567.88 },
  { key: 'live', label: '真人', weight: 123567.88 },
  { key: 'slots', label: '老虎机', weight: -23567.88 },
  { key: 'fishing', label: '捕鱼', weight: 123567.88 },
]

function scaleWeightsToTarget(weights: number[], targetSum: number): number[] {
  const sum = weights.reduce((acc, n) => acc + n, 0)
  if (!sum) return weights.map(() => 0)
  const scaled = weights.map((n) => Number(((n * targetSum) / sum).toFixed(2)))
  const drift = Number((targetSum - scaled.reduce((acc, n) => acc + n, 0)).toFixed(2))
  scaled[scaled.length - 1] = Number((scaled[scaled.length - 1] + drift).toFixed(2))
  return scaled
}

/** 游戏净输赢公式构成项（三项；退水为正） */
function getMemberProfitGameFormulaRows(currency: string): MemberProfitSectionRow[] {
  const stats = getMemberProfitSummaryMock(currency)
  return [
    {
      key: 'win',
      label: '游戏输赢',
      value: formatProfitAmount(stats.gameProfit),
      tone: profitTone(stats.gameProfit),
    },
    {
      key: 'member_rebate',
      label: '会员退水',
      value: formatProfitAmount(stats.memberRebate),
      tone: profitTone(stats.memberRebate),
    },
    {
      key: 'vip_rebate',
      label: 'VIP退水',
      value: formatProfitAmount(stats.vipRebate),
      tone: profitTone(stats.vipRebate),
    },
  ]
}

/**
 * 占成 · 游戏净输赢分区（结构对齐代理盈亏：展开为游戏大类）
 * 大类金额等比缩放至当前币种会员游戏净输赢合计；金额列无「实占」
 */
export function getMemberProfitGameSection(currency: string): MemberProfitSection {
  const target = getMemberGameNetTotal(currency)
  const scaled = scaleWeightsToTarget(
    MEMBER_GAME_CATEGORY_BASE.map((item) => item.weight),
    target,
  )
  const rows: MemberProfitSectionRow[] = MEMBER_GAME_CATEGORY_BASE.map((item, index) => {
    const value = scaled[index] ?? 0
    return {
      key: item.key,
      label: item.label,
      value: formatProfitAmount(value),
      tone: profitTone(value),
    }
  })
  return {
    nameHeader: '游戏净输赢',
    amountHeader: '金额',
    rows,
    total: sumSectionRows(rows, 'game_sum'),
  }
}

/** 占成 · 其他奖励分区（VIP晋级礼金 / VIP额外奖金 / 活动金；无实占文案） */
export function getMemberProfitCostSection(currency: string): MemberProfitSection {
  const stats = getMemberProfitSummaryMock(currency)
  const rows: MemberProfitSectionRow[] = [
    {
      key: 'vip_bonus',
      label: 'VIP晋级礼金',
      value: formatProfitAmount(stats.vipBonus),
      tone: profitTone(stats.vipBonus),
    },
    {
      key: 'vip_extra',
      label: 'VIP额外奖金',
      value: formatProfitAmount(stats.vipExtraBonus),
      tone: profitTone(stats.vipExtraBonus),
    },
    {
      key: 'activity',
      label: '活动金',
      value: formatProfitAmount(stats.activityGold),
      tone: profitTone(stats.activityGold),
    },
  ]
  return {
    nameHeader: '其他奖励',
    amountHeader: '金额',
    rows,
    total: sumSectionRows(rows, 'reward_sum'),
  }
}

/** 占成公式卡：游戏净输赢 + 其他奖励 = 会员盈亏 */
export function getMemberProfitFormula(currency: string) {
  const game = getMemberProfitGameSection(currency).total
  const reward = getMemberProfitCostSection(currency).total
  const total = getMemberSectionTotalProfit(currency)
  return {
    gameAmountText: game.value,
    gameTone: game.tone,
    /** 加数展示带符号金额 */
    costAmountText: reward.value,
    costTone: reward.tone,
    costLabel: '其他奖励',
    operator: '+' as const,
    totalAmountText: total.value,
    totalTone: total.tone,
    totalLabel: '会员盈亏',
  }
}

export type MemberProfitDialogDetailRow = {
  label: string
  amountText: string
  tone: ProfitValueTone
  emphasize?: boolean
  formulaTip?: string
}

/** total = 会员盈亏明细；其余为游戏大类 key */
export type MemberProfitDialogKind = 'total' | string

/** 大类明细基准（对齐报表结构；会员三项口径，退水为正；无代理赚水/场馆费） */
const MEMBER_CATEGORY_DETAIL_BASE: MemberProfitDialogDetailRow[] = [
  { label: '下注有效金额', amountText: '10,000.00', tone: 'neutral' },
  { label: '输赢', amountText: '+500.00', tone: 'positive' },
  { label: '会员退水', amountText: '+100.00', tone: 'positive' },
  { label: 'VIP退水', amountText: '+50.00', tone: 'positive' },
  {
    label: '游戏净输赢',
    amountText: '+650.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: MEMBER_PROFIT_GAME_NET_FORMULA,
  },
]

function getMemberCategoryDetailRows(
  categoryKey: string,
  currency: string,
): MemberProfitDialogDetailRow[] {
  const section = getMemberProfitGameSection(currency)
  const product = section.rows.find((row) => row.key === categoryKey)
  const targetNet = product ? parseProfitAmountText(product.value) : 650
  const base = MEMBER_CATEGORY_DETAIL_BASE.filter((row) => row.label !== '下注有效金额' && !row.emphasize)
  const scaled = scaleAmountList(
    base.map((row) => parseProfitAmountText(row.amountText)),
    targetNet,
  )
  const betScale = Math.max(Math.abs(targetNet) / 650, 0.2)
  const betValue = Number((10000 * betScale).toFixed(2))
  return [
    {
      label: '下注有效金额',
      amountText: betValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tone: 'neutral',
    },
    ...base.map((row, index) => ({
      ...row,
      amountText: formatProfitAmount(scaled[index] ?? 0),
      tone: profitTone(scaled[index] ?? 0),
    })),
    {
      label: '游戏净输赢',
      amountText: formatProfitAmount(targetNet),
      tone: profitTone(targetNet),
      emphasize: true,
      formulaTip: MEMBER_PROFIT_GAME_NET_FORMULA,
    },
  ]
}

/** 会员盈亏 · 点大类看明细；点会员盈亏看构成 */
export function getMemberProfitDialogDetail(
  kind: MemberProfitDialogKind,
  currency: string,
): MemberProfitDialogDetailRow[] {
  const cost = getMemberProfitCostSection(currency)
  const mapRow = (row: MemberProfitSectionRow): MemberProfitDialogDetailRow => ({
    label: row.label,
    amountText: row.value,
    tone: row.tone,
  })

  if (kind === 'total') {
    const total = getMemberTotalProfit(currency)
    const formulaRows = getMemberProfitGameFormulaRows(currency)
    return [
      ...formulaRows.map(mapRow),
      ...cost.rows.map(mapRow),
      {
        label: '会员盈亏',
        amountText: total.value,
        tone: total.tone,
        emphasize: true,
        formulaTip: MEMBER_PROFIT_FORMULA,
      },
    ]
  }

  return getMemberCategoryDetailRows(kind, currency)
}

export function memberProfitDialogTitle(kind: MemberProfitDialogKind, currency = 'KKC') {
  if (kind === 'total') return '会员盈亏明细'
  const row = getMemberProfitGameSection(currency).rows.find((item) => item.key === kind)
  return `${row?.label ?? '游戏'}明细`
}

/** 经典汇总卡 · 构成项（退水为正） */
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
  /** 游戏净输赢 = 输赢 + 会员退水 + VIP退水 = 650 */
  totalProfit: '+650.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '1000.00', tone: 'neutral' },
    { label: '输赢', value: '+500.00', tone: 'positive' },
    { label: '会员退水', value: '+100.00', tone: 'positive' },
    { label: 'VIP退水', value: '+50.00', tone: 'positive' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '会员退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
]

/** 各品类合计：游戏净输赢 = 12350 + 1280 + 150 = 13780（退水为正；标题不加「实占」） */
const OVERALL_GAME_DETAIL: AgentProfitDetail = {
  title: '全部',
  totalProfit: '+13,780.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '86,420.00', tone: 'neutral' },
    { label: '输赢', value: '+12,350.00', tone: 'positive' },
    { label: '会员退水', value: '+1,280.00', tone: 'positive' },
    { label: 'VIP退水', value: '+150.00', tone: 'positive' },
  ],
}

/** 品类下二级「全部」合计（原型 Mock） */
function getMemberCategoryVendorAllDetail(category: MemberProfitCategoryKey): AgentProfitDetail {
  const catLabel =
    AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'

  if (category === 'sports') {
    /** 游戏净输赢 = 9860 + 980 + 120 = 10960 */
    return {
      title: catLabel,
      totalProfit: '+10,960.00',
      totalProfitTone: 'positive',
      rows: [
        { label: '下注有效金额', value: '42,800.00', tone: 'neutral' },
        { label: '输赢', value: '+9,860.00', tone: 'positive' },
        { label: '会员退水', value: '+980.00', tone: 'positive' },
        { label: 'VIP退水', value: '+120.00', tone: 'positive' },
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
