import {
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS,
  CREDIT_HIDDEN_PROFIT_LABELS,
  isCreditProfitCurrency,
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
import { MEMBER_SETTLE_MOCK, VIP_MEMBER_EZ } from './memberSettleMock'

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

/** 返佣会员盈亏：无会员退水，仅 VIP 退水 */
export const MEMBER_REBATE_PROFIT_FORMULA =
  '会员盈亏 = 游戏输赢 + VIP退水 + VIP晋级礼金 + VIP额外奖金 + 活动金'

/** 分区结构公式（游戏净输赢含正退水，与构成 tip 数值自洽） */
export const MEMBER_PROFIT_SECTION_FORMULA = '会员盈亏 = 游戏净输赢 + 其他奖励'

/**
 * 会员 · 游戏净输赢公式（占成；退水对会员为正）
 * 游戏净输赢 = 游戏输赢 + 会员退水 + VIP退水
 */
export const MEMBER_PROFIT_GAME_NET_FORMULA =
  '游戏净输赢 = 游戏输赢 + 会员退水 + VIP退水'

/** 场馆明细标题与公式左侧统一为「游戏净输赢」（与上式一致） */
export const MEMBER_GAME_PROFIT_FORMULA = MEMBER_PROFIT_GAME_NET_FORMULA

/** 返佣查看会员游戏统计 / 会员盈亏：无会员退水；VIP 退水对会员为正；不含场馆费 */
export const MEMBER_REBATE_GAME_NET_PROFIT_FORMULA =
  '游戏净输赢 = 游戏输赢 + VIP退水'

export function memberRebateGameNetProfitFormula() {
  return MEMBER_REBATE_GAME_NET_PROFIT_FORMULA
}

export type MemberProfitOptions = {
  /** 占成含会员退水；返佣不含。默认含。 */
  includeMemberRebate?: boolean
}

function withMemberRebate(options?: MemberProfitOptions) {
  return options?.includeMemberRebate !== false
}

/** 信用代理中心：会员无 VIP 奖励与活动金，无其他奖励 */
export const MEMBER_CREDIT_PROFIT_FORMULA = '会员盈亏 = 游戏输赢 + 会员退水'
export const MEMBER_CREDIT_SECTION_FORMULA = '会员盈亏 = 游戏净输赢'
export const MEMBER_CREDIT_GAME_NET_FORMULA = '游戏净输赢 = 游戏输赢 + 会员退水'

export function memberProfitFormulaText(includeMemberRebate = true, currency = '') {
  if (isCreditProfitCurrency(currency)) return MEMBER_CREDIT_PROFIT_FORMULA
  return includeMemberRebate ? MEMBER_PROFIT_FORMULA : MEMBER_REBATE_PROFIT_FORMULA
}

export function memberGameNetFormulaText(includeMemberRebate = true, currency = '') {
  if (isCreditProfitCurrency(currency)) return MEMBER_CREDIT_GAME_NET_FORMULA
  return includeMemberRebate ? MEMBER_PROFIT_GAME_NET_FORMULA : MEMBER_REBATE_GAME_NET_PROFIT_FORMULA
}

function withoutCreditHiddenRows<T extends { label: string }>(currency: string, rows: T[]): T[] {
  if (!isCreditProfitCurrency(currency)) return rows
  return rows.filter((row) => !CREDIT_HIDDEN_PROFIT_LABELS.has(row.label))
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
  /** 信用代理中心：取贵宾厅会员 EZ 的钱包数据；无 VIP 奖励 / 活动金 / 充提，相关字段恒为 0 */
  '信用额度-CNY': {
    gameProfit: VIP_MEMBER_EZ.winLose.CNY,
    memberRebate: MEMBER_SETTLE_MOCK.rebate,
    vipRebate: 0,
    vipBonus: 0,
    vipExtraBonus: 0,
    activityGold: 0,
    depositWithdrawFee: 0,
  },
  '信用额度-USD': {
    gameProfit: VIP_MEMBER_EZ.winLose.USD,
    memberRebate: MEMBER_SETTLE_MOCK.rebate,
    vipRebate: 0,
    vipBonus: 0,
    vipExtraBonus: 0,
    activityGold: 0,
    depositWithdrawFee: 0,
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

/** 会员奖励项：服务端为正数，展示正绿，结算时加到输赢上 */
const MEMBER_REWARD_ITEM_LABELS = new Set(['会员退水', 'VIP退水'])

function formatRewardAmount(value: number): { amountText: string; tone: ProfitValueTone } {
  const abs = Math.abs(value)
  return {
    amountText: formatProfitAmount(abs),
    tone: abs > 0 ? 'positive' : 'neutral',
  }
}

function getMemberProfitSummaryMock(currency: string) {
  return PROFIT_SUMMARY_BY_CURRENCY[currency] ?? EMPTY_SUMMARY_MOCK
}

/** 信用额度会员盈亏的游戏输赢 / 会员退水，供对账结算复用，保证两处数值一致 */
export function getMemberCreditProfitBook(currency: string) {
  const stats = getMemberProfitSummaryMock(currency)
  return { gameProfit: stats.gameProfit, memberRebate: stats.memberRebate }
}

/** 游戏净输赢合计：占成含会员退水；返佣仅游戏输赢 + VIP退水 */
export function getMemberGameNetTotal(currency: string, options?: MemberProfitOptions) {
  const stats = getMemberProfitSummaryMock(currency)
  const rebate = withMemberRebate(options) ? stats.memberRebate : 0
  return stats.gameProfit + rebate + stats.vipRebate
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

/** 会员盈亏合计：占成六项；返佣不含会员退水 */
export function getMemberSixTermTotal(currency: string, options?: MemberProfitOptions) {
  const stats = getMemberProfitSummaryMock(currency)
  const rebate = withMemberRebate(options) ? stats.memberRebate : 0
  return (
    stats.gameProfit +
    rebate +
    stats.vipRebate +
    stats.vipBonus +
    stats.vipExtraBonus +
    stats.activityGold
  )
}

/** 经典汇总卡 · 会员盈亏总值 */
export function getMemberTotalProfit(currency: string, options?: MemberProfitOptions) {
  const total = getMemberSixTermTotal(currency, options)
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 分区 · 会员盈亏 = 游戏净输赢 + 其他奖励 */
export function getMemberSectionTotalProfit(currency: string, options?: MemberProfitOptions) {
  return getMemberTotalProfit(currency, options)
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

export type MemberCreditGameBook = {
  key: AgentProfitCategoryKey
  label: string
  validBet: number
  win: number
  rebate: number
}

/**
 * 信用会员按游戏大类拆分（只落在游戏统计有的六个大类）：
 * 有效投注、退水按投注占比分摊，输赢按权重分摊，合计 = 会员盈亏的游戏输赢 / 会员退水
 */
export const MEMBER_CREDIT_GAME_SHARES: { key: AgentProfitCategoryKey; label: string; bet: number; win: number }[] = [
  { key: 'scratch', label: '刮刮乐', bet: 0.1, win: 0.1 },
  { key: 'marble', label: '弹珠', bet: 0.1, win: 0.14 },
  { key: 'chess', label: '棋牌', bet: 0.15, win: -0.12 },
  { key: 'lottery', label: '彩票', bet: 0.1, win: 0.06 },
  { key: 'sports', label: '体育', bet: 0.3, win: 0.46 },
  { key: 'live', label: '真人', bet: 0.25, win: 0.36 },
]

export function getMemberCreditGameBooks(currency: string): MemberCreditGameBook[] {
  const { gameProfit, memberRebate } = getMemberProfitSummaryMock(currency)
  const round = (n: number) => Math.round(n * 100) / 100
  return MEMBER_CREDIT_GAME_SHARES.map((item) => ({
    key: item.key,
    label: item.label,
    validBet: round(MEMBER_SETTLE_MOCK.validBet * item.bet),
    win: round(gameProfit * item.win),
    rebate: round(memberRebate * item.bet),
  }))
}

function sumCreditGameBooks(books: MemberCreditGameBook[]) {
  return books.reduce(
    (acc, book) => ({
      validBet: acc.validBet + book.validBet,
      win: acc.win + book.win,
      rebate: acc.rebate + book.rebate,
    }),
    { validBet: 0, win: 0, rebate: 0 },
  )
}

/** 信用 · 游戏净输赢公式卡：游戏输赢 + 退水 = 游戏净输赢 */
export function getMemberCreditGameFormula(currency: string) {
  const { gameProfit, memberRebate } = getMemberProfitSummaryMock(currency)
  const net = gameProfit + memberRebate
  return {
    winText: formatProfitAmount(gameProfit),
    winTone: profitTone(gameProfit),
    rebateText: formatProfitAmount(memberRebate),
    rebateTone: profitTone(memberRebate),
    netText: formatProfitAmount(net),
    netTone: profitTone(net),
  }
}

function creditGameDetail(title: string, book: { validBet: number; win: number; rebate: number }): AgentProfitDetail {
  const net = book.win + book.rebate
  return {
    title,
    totalProfit: formatProfitAmount(net),
    totalProfitTone: profitTone(net),
    rows: [
      {
        label: '下注有效金额',
        value: book.validBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        tone: 'neutral',
      },
      { label: '输赢', value: formatProfitAmount(book.win), tone: profitTone(book.win) },
      { label: '会员退水', value: formatProfitAmount(book.rebate), tone: profitTone(book.rebate) },
    ],
  }
}

/** 信用 · 游戏统计：全部 = 会员盈亏合计；大类「全部」= 该大类；场馆只挂在首个场馆上 */
function getMemberCreditProfitDetail(
  category: MemberProfitCategoryKey,
  vendor: MemberProfitVendorKey,
  currency: string,
): AgentProfitDetail {
  const books = getMemberCreditGameBooks(currency)
  if (category === 'overall') return creditGameDetail('全部', sumCreditGameBooks(books))
  const vendors = AGENT_PROFIT_VENDORS[category]
  const vendorLabel = vendors.find((item) => item.key === vendor)?.label ?? '明细'
  const catLabel = AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'
  const book = books.find((item) => item.key === category)
  const empty = { validBet: 0, win: 0, rebate: 0 }
  if (vendor === 'all') return creditGameDetail(catLabel, book ?? empty)
  const firstVendor = vendors.find((item) => item.key !== 'all')?.key
  return creditGameDetail(vendorLabel, vendor === firstVendor && book ? book : empty)
}

/** 信用 · 注单记录汇总：注单数取贵宾厅钱包注单笔数 */
export function getMemberCreditBetSummary(currency: string) {
  const { validBet, win } = sumCreditGameBooks(getMemberCreditGameBooks(currency))
  const symbol = currency === '信用额度-USD' ? '$' : '¥'
  return {
    totalBets: currency === '信用额度-USD' ? 36 : 158,
    validBetText: `${symbol}${validBet.toLocaleString('en-US')}`,
    winText: formatProfitAmount(win).replace(/\.00$/, ''),
    winPositive: win > 0,
  }
}

/** 游戏净输赢公式构成项（退水为正；返佣无会员退水） */
function getMemberProfitGameFormulaRows(
  currency: string,
  options?: MemberProfitOptions,
): MemberProfitSectionRow[] {
  const stats = getMemberProfitSummaryMock(currency)
  const rows: MemberProfitSectionRow[] = [
    {
      key: 'win',
      label: '游戏输赢',
      value: formatProfitAmount(stats.gameProfit),
      tone: profitTone(stats.gameProfit),
    },
  ]
  if (withMemberRebate(options)) {
    rows.push({
      key: 'member_rebate',
      label: '会员退水',
      value: formatProfitAmount(stats.memberRebate),
      tone: profitTone(stats.memberRebate),
    })
  }
  rows.push({
    key: 'vip_rebate',
    label: 'VIP退水',
    value: formatProfitAmount(stats.vipRebate),
    tone: profitTone(stats.vipRebate),
  })
  return withoutCreditHiddenRows(currency, rows)
}

/**
 * 占成 · 游戏净输赢分区（结构对齐代理盈亏：展开为游戏大类）
 * 大类金额等比缩放至当前币种会员游戏净输赢合计；金额列无「实占」
 */
export function getMemberProfitGameSection(
  currency: string,
  options?: MemberProfitOptions,
): MemberProfitSection {
  if (isCreditProfitCurrency(currency)) {
    const rows: MemberProfitSectionRow[] = getMemberCreditGameBooks(currency).map((book) => {
      const net = book.win + book.rebate
      return { key: book.key, label: book.label, value: formatProfitAmount(net), tone: profitTone(net) }
    })
    return { nameHeader: '游戏净输赢', amountHeader: '金额', rows, total: sumSectionRows(rows, 'game_sum') }
  }
  const target = getMemberGameNetTotal(currency, options)
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
  const rows: MemberProfitSectionRow[] = withoutCreditHiddenRows(currency, [
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
  ])
  return {
    nameHeader: '其他奖励',
    amountHeader: '金额',
    rows,
    total: sumSectionRows(rows, 'reward_sum'),
  }
}

/** 占成公式卡：游戏净输赢 + 其他奖励 = 会员盈亏 */
export function getMemberProfitFormula(currency: string, options?: MemberProfitOptions) {
  const game = getMemberProfitGameSection(currency, options).total
  const reward = getMemberProfitCostSection(currency).total
  const total = getMemberSectionTotalProfit(currency, options)
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
  options?: MemberProfitOptions,
): MemberProfitDialogDetailRow[] {
  const includeRebate = withMemberRebate(options)
  if (isCreditProfitCurrency(currency)) {
    const book = getMemberCreditGameBooks(currency).find((item) => item.key === categoryKey)
    if (book) {
      const detail = creditGameDetail(book.label, book)
      return [
        ...detail.rows.map((row) => ({ label: row.label, amountText: row.value, tone: row.tone })),
        {
          label: '游戏净输赢',
          amountText: detail.totalProfit,
          tone: detail.totalProfitTone,
          emphasize: true,
          formulaTip: memberGameNetFormulaText(includeRebate, currency),
        },
      ]
    }
  }
  const section = getMemberProfitGameSection(currency, options)
  const product = section.rows.find((row) => row.key === categoryKey)
  const targetNet = product ? parseProfitAmountText(product.value) : 650
  const base = withoutCreditHiddenRows(
    currency,
    MEMBER_CATEGORY_DETAIL_BASE.filter((row) => {
      if (row.label === '下注有效金额' || row.emphasize) return false
      if (!includeRebate && row.label === '会员退水') return false
      return true
    }),
  )
  const winBase = Math.abs(
    parseProfitAmountText(base.find((row) => row.label === '输赢')?.amountText ?? '0'),
  )
  const memberRebateBase = includeRebate
    ? Math.abs(parseProfitAmountText(base.find((row) => row.label === '会员退水')?.amountText ?? '0'))
    : 0
  const vipRebateBase = Math.abs(
    parseProfitAmountText(base.find((row) => row.label === 'VIP退水')?.amountText ?? '0'),
  )
  const baseNet = winBase + memberRebateBase + vipRebateBase
  const absScale = baseNet ? Math.abs(targetNet) / baseNet : 0
  const memberRebate = Number((memberRebateBase * absScale).toFixed(2))
  const vipRebate = Number((vipRebateBase * absScale).toFixed(2))
  const win = Number((targetNet - memberRebate - vipRebate).toFixed(2))
  const amounts: Record<string, number> = {
    输赢: win,
    ...(includeRebate ? { 会员退水: memberRebate } : {}),
    VIP退水: vipRebate,
  }
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
    ...base.map((row) => {
      const amount = amounts[row.label] ?? 0
      if (MEMBER_REWARD_ITEM_LABELS.has(row.label)) {
        const cell = formatRewardAmount(amount)
        return { ...row, amountText: cell.amountText, tone: cell.tone }
      }
      return {
        ...row,
        amountText: formatProfitAmount(amount),
        tone: profitTone(amount),
      }
    }),
    {
      label: '游戏净输赢',
      amountText: formatProfitAmount(targetNet),
      tone: profitTone(targetNet),
      emphasize: true,
      formulaTip: memberGameNetFormulaText(includeRebate, currency),
    },
  ]
}

/** 会员盈亏 · 点大类看明细；点会员盈亏看构成 */
export function getMemberProfitDialogDetail(
  kind: MemberProfitDialogKind,
  currency: string,
  options?: MemberProfitOptions,
): MemberProfitDialogDetailRow[] {
  const cost = getMemberProfitCostSection(currency)
  const mapRow = (row: MemberProfitSectionRow): MemberProfitDialogDetailRow => ({
    label: row.label,
    amountText: row.value,
    tone: row.tone,
  })

  if (kind === 'total') {
    const total = getMemberTotalProfit(currency, options)
    const formulaRows = getMemberProfitGameFormulaRows(currency, options)
    return [
      ...formulaRows.map(mapRow),
      ...cost.rows.map(mapRow),
      {
        label: '会员盈亏',
        amountText: total.value,
        tone: total.tone,
        emphasize: true,
        formulaTip: memberProfitFormulaText(withMemberRebate(options), currency),
      },
    ]
  }

  return getMemberCategoryDetailRows(kind, currency, options)
}

export function memberProfitDialogTitle(
  kind: MemberProfitDialogKind,
  currency = 'KKC',
  options?: MemberProfitOptions,
) {
  if (kind === 'total') return '会员盈亏明细'
  const row = getMemberProfitGameSection(currency, options).rows.find((item) => item.key === kind)
  return `${row?.label ?? '游戏'}明细`
}

/** 经典汇总卡 · 构成项（退水为正；返佣无会员退水） */
export function getMemberProfitSummaryRows(
  currency: string,
  options?: MemberProfitOptions,
): MemberProfitSummaryRow[] {
  const stats = getMemberProfitSummaryMock(currency)
  const rows: MemberProfitSummaryRow[] = [
    {
      label: '游戏输赢',
      value: formatProfitAmount(stats.gameProfit),
      tone: profitTone(stats.gameProfit),
    },
  ]
  if (withMemberRebate(options)) {
    rows.push({
      label: '会员退水',
      value: formatProfitAmount(stats.memberRebate),
      tone: profitTone(stats.memberRebate),
    })
  }
  rows.push(
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
  )
  return withoutCreditHiddenRows(currency, rows)
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

/** 信用额度看板：去掉 VIP退水 行，游戏净输赢同步扣除该笔奖励 */
export function getMemberProfitDetail(
  category: MemberProfitCategoryKey,
  vendor: MemberProfitVendorKey,
  currency = '',
): AgentProfitDetail {
  if (isCreditProfitCurrency(currency)) return getMemberCreditProfitDetail(category, vendor, currency)
  return getMemberProfitDetailBase(category, vendor)
}

function getMemberProfitDetailBase(
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
