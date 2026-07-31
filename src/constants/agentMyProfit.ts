/** 代理中心 · 我的盈亏（Figma 1433:17568；返佣身份另套公式） */

import { AGENT_GAME_PROFIT_FORMULA, AGENT_PROFIT_FORMULA } from './agentDetailProfit'
import type { AgentIdentityType } from './agentIdentity'

export { AGENT_GAME_PROFIT_FORMULA, AGENT_PROFIT_FORMULA }

/** 返佣 · 游戏净输赢（一级代理：含代理赚水） */
export const REBATE_GAME_NET_PROFIT_FORMULA =
  '游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】 + 【-代理赚水】'

/** 返佣 · 游戏净输赢（非一级：无代理赚水） */
export const REBATE_GAME_NET_PROFIT_FORMULA_NO_EARN =
  '游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】'

/** 按代理层级返回返佣游戏净输赢公式 tip */
export function rebateGameNetProfitFormula(isLevel1Agent: boolean) {
  return isLevel1Agent ? REBATE_GAME_NET_PROFIT_FORMULA : REBATE_GAME_NET_PROFIT_FORMULA_NO_EARN
}

/** 返佣 · 总佣金（与顶部 tip 一致） */
export const REBATE_AGENT_PROFIT_FORMULA =
  '总佣金 = 当月佣金 + 额外佣金 + 负佣金累计'

/** 总佣金公式 tip：仅一行；负佣金仅本月预计佣金计入 */
export function rebateTotalCommissionFormulaTip(
  _monthCommission: number,
  _l2Commission: number,
  _l3Commission: number,
  _negativeAccum: number,
  includeNegative = true,
) {
  return includeNegative
    ? '总佣金 = 当月佣金 + 额外佣金 + 负佣金累计'
    : '总佣金 = 当月佣金 + 额外佣金'
}

/** 返佣 · 直属佣金（原一级） */
export const REBATE_L1_PROFIT_FORMULA =
  '直属佣金 = （【直属输赢】 + 【-直属VIP退水】 + 【-代理赚水】 + 【-直属VIP晋级礼金】 + 【-直属VIP额外奖金】 + 【-直属活动金】） × 平台佣金比例'

/** 返佣 · 下一级佣金（原二级；与三级公式结构相同） */
export const REBATE_L2_PROFIT_FORMULA =
  '下一级佣金 = （【直属输赢】 + 【-直属VIP退水】 + 【-直属VIP晋级礼金】 + 【-直属VIP额外奖金】 + 【-直属活动金】） × 平台佣金比例 × 额外佣金比例'

/** 返佣 · 下二级佣金（原三级） */
export const REBATE_L3_PROFIT_FORMULA =
  '下二级佣金 = （【直属输赢】 + 【-直属VIP退水】 + 【-直属VIP晋级礼金】 + 【-直属VIP额外奖金】 + 【-直属活动金】） × 平台佣金比例 × 额外佣金比例'

/** @deprecated 请用 REBATE_L2_PROFIT_FORMULA / REBATE_L3_PROFIT_FORMULA */
export const REBATE_L2_L3_PROFIT_FORMULA = REBATE_L2_PROFIT_FORMULA

export type AgentMyProfitTone = 'neutral' | 'positive' | 'negative'

export type AgentMyProfitProductRow = {
  key: string
  name: string
  amountText: string
  tone: AgentMyProfitTone
}

export type AgentMyProfitDetailRow = {
  label: string
  /** 副文案提示（可选） */
  labelHint?: string
  amountText: string
  tone: AgentMyProfitTone
  emphasize?: boolean
  /** 公式 tip 文案；有值时展示感叹号入口 */
  formulaTip?: string
}

export type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

/** 返佣「我的佣金」· 月份筛选快捷项（佣金按月发放，不可按日） */
export type RebateMonthPreset = 'thisMonth' | 'lastMonth' | 'may' | 'april'

export type ProfitDatePreset = RangePreset | RebateMonthPreset

export const AGENT_MY_PROFIT_ASSETS = {
  backIcon: '/images/agent-my-profit/icon-back.svg',
  calendarIcon: '/images/agent-my-profit/icon-calendar.png',
  decoCoin: '/images/agent-my-profit/deco-coin.png',
} as const

export const AGENT_MY_PROFIT_PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastWeek', label: '上周' },
]

/** 返佣默认：本月 / 上月 / 五月 / 四月 */
export const AGENT_MY_PROFIT_REBATE_MONTH_PRESETS: { key: RebateMonthPreset; label: string }[] = [
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
  { key: 'may', label: '五月' },
  { key: 'april', label: '四月' },
]

/** 顶部总盈亏（即代理盈亏；公式见 AGENT_PROFIT_FORMULA） */
export const AGENT_MY_PROFIT_TOTAL = {
  label: '总盈亏',
  valueText: '+ 123,019.99',
  tone: 'positive' as const,
}

/** 产品 / 成本盈亏列表（对齐设计稿斑马纹与正负色；捕鱼后接成本类型） */
export const AGENT_MY_PROFIT_PRODUCT_ROWS: AgentMyProfitProductRow[] = [
  { key: 'scratch', name: '刮刮乐', amountText: '+123,567.88', tone: 'positive' },
  { key: 'marble', name: '弹珠', amountText: '-23,567.88', tone: 'negative' },
  { key: 'chess', name: '棋牌', amountText: '+123,567.88', tone: 'positive' },
  { key: 'lottery', name: '彩票', amountText: '-23,567.88', tone: 'negative' },
  { key: 'qutou', name: '趣投', amountText: '+123,567.88', tone: 'positive' },
  { key: 'sports', name: '体育', amountText: '-23,567.88', tone: 'negative' },
  { key: 'live', name: '真人', amountText: '+123,567.88', tone: 'positive' },
  { key: 'slots', name: '老虎机', amountText: '-23,567.88', tone: 'negative' },
  { key: 'fishing', name: '捕鱼', amountText: '+123,567.88', tone: 'positive' },
  { key: 'vip_bonus', name: 'VIP晋级礼金', amountText: '-23,567.88', tone: 'negative' },
  { key: 'vip_extra', name: 'VIP额外奖金', amountText: '-12,345.67', tone: 'negative' },
  { key: 'activity', name: '活动金', amountText: '-123,567.88', tone: 'negative' },
]

export const AGENT_MY_PROFIT_SUMMARY_ROW: AgentMyProfitProductRow = {
  key: 'total',
  name: '总计',
  amountText: '+123,567.88',
  tone: 'positive',
}

export const AGENT_MY_PROFIT_FOOTNOTE =
  '数据每十分钟更新一次\n最多可查询近 6 个月的数据'

/** 游戏占成项盈亏明细（口径对齐场馆净输赢：含代理赚水，不含成本项） */
export const AGENT_MY_PROFIT_DETAIL_ROWS: AgentMyProfitDetailRow[] = [
  {
    label: '下注有效金额',
    amountText: '10000',
    tone: 'neutral',
  },
  { label: '输赢', amountText: '+500.00', tone: 'positive' },
  { label: '退水', amountText: '-100.00', tone: 'negative' },
  { label: 'VIP退水', amountText: '-50.00', tone: 'negative' },
  { label: '代理赚水', amountText: '-10.00', tone: 'negative' },
  {
    label: '游戏净输赢',
    amountText: '+340.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: AGENT_GAME_PROFIT_FORMULA,
  },
]

/**
 * 总计盈亏明细：对齐代理盈亏七项
 * 代理盈亏 = 实占游戏输赢 − 实占退水 − 实占VIP退水 − 代理赚水 − 实占VIP晋级礼金 − 实占VIP额外奖金 − 实占活动金
 */
export const AGENT_MY_PROFIT_TOTAL_DETAIL_ROWS: AgentMyProfitDetailRow[] = [
  { label: '输赢', amountText: '+500.00', tone: 'positive' },
  { label: '退水', amountText: '-100.00', tone: 'negative' },
  { label: 'VIP退水', amountText: '-50.00', tone: 'negative' },
  { label: '代理赚水', amountText: '-10.00', tone: 'negative' },
  { label: 'VIP晋级礼金', amountText: '-20.00', tone: 'negative' },
  { label: 'VIP额外奖金', amountText: '-15.00', tone: 'negative' },
  { label: '活动金', amountText: '-30.00', tone: 'negative' },
  {
    label: '代理盈亏',
    amountText: '+275.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: AGENT_PROFIT_FORMULA,
  },
]

/** 成本占成项暂无明细弹框 */
const AGENT_MY_PROFIT_NO_DETAIL_KEYS = new Set([
  'vip_bonus',
  'vip_extra',
  'activity',
  'game_sum',
  'cost_sum',
])

/** ---------- 返佣代理 · Mock（口径对齐返佣公式） ---------- */

export type RebateProfitLevel = 'l1' | 'l2' | 'l3'

/** 列表缩放：一级游戏合计 / 成本合计（对齐账单 totalPnl、-totalCost） */
export type RebateSectionScale = {
  gameTotal: number
  /** 负数，如 -120.5 */
  costTotal: number
}

/** 默认对齐 2026-07 账单：游戏 2500、成本 -120.5、净输赢 2379.5、×5%=118.98 */
export const REBATE_DEFAULT_SECTION_SCALE: RebateSectionScale = {
  gameTotal: 2500,
  costTotal: -120.5,
}

/** 顶部总佣金（示意；页面主路径由一级/二三级/负佣金动态汇总） */
export const AGENT_MY_PROFIT_REBATE_TOTAL = {
  label: '总佣金',
  valueText: '137.96',
  tone: 'positive' as const,
}

/** 顶栏 Tab：直属 / 下一级 / 下二级佣金（小计随公式动态算，此处为默认月示意） */
export const AGENT_MY_PROFIT_REBATE_LEVEL_TABS: {
  key: RebateProfitLevel
  label: string
  subtotalText: string
  tone: AgentMyProfitTone
}[] = [
  { key: 'l1', label: '直属佣金', subtotalText: '+118.98', tone: 'positive' },
  { key: 'l2', label: '下一级佣金', subtotalText: '+59.49', tone: 'positive' },
  { key: 'l3', label: '下二级佣金', subtotalText: '+59.49', tone: 'positive' },
]

/**
 * 按代理层级截取可见 Tab：
 * 一级 → 直属 / 下一级 / 下二级；二级 → 直属 / 下一级；三级 → 仅直属
 */
export function agentMyProfitRebateLevelTabs(agentLevel: 1 | 2 | 3 = 1) {
  const maxCount = agentLevel === 1 ? 3 : agentLevel === 2 ? 2 : 1
  return AGENT_MY_PROFIT_REBATE_LEVEL_TABS.slice(0, maxCount)
}

/** 返佣 · 游戏项（净输赢） */
const REBATE_GAME_BASE: { key: string; name: string }[] = [
  { key: 'scratch', name: '刮刮乐' },
  { key: 'marble', name: '弹珠' },
  { key: 'chess', name: '棋牌' },
  { key: 'lottery', name: '彩票' },
  { key: 'qutou', name: '趣投' },
  { key: 'sports', name: '体育' },
  { key: 'live', name: '真人' },
  { key: 'slots', name: '老虎机' },
  { key: 'fishing', name: '捕鱼' },
]

/** 返佣 · 成本项 */
const REBATE_COST_BASE: { key: string; name: string }[] = [
  { key: 'vip_bonus', name: 'VIP晋级礼金' },
  { key: 'vip_extra', name: 'VIP额外奖金' },
  { key: 'activity', name: '活动金' },
]

type RebateAmountCell = { amountText: string; tone: AgentMyProfitTone }

/** 一级游戏分布（合计 2500，与默认账单 totalPnl 一致） */
const REBATE_L1_GAME_NUMS = [950, -133, 622, -112, 489, -154, 438, -121, 521]

/** 一级成本分布（合计 -120.5，与默认账单 -totalCost 一致） */
const REBATE_L1_COST_NUMS = [-45, -25.5, -50]

function parseProfitAmountText(text: string) {
  return Number(text.replace(/,/g, '').replace(/^\+/, '')) || 0
}

function formatProfitAmountText(value: number): RebateAmountCell {
  const abs = Math.abs(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (value > 0) return { amountText: `+${abs}`, tone: 'positive' }
  if (value < 0) return { amountText: `-${abs}`, tone: 'negative' }
  return { amountText: '0.00', tone: 'neutral' }
}

/** 按目标合计等比缩放，末项吃掉圆角误差 */
function scaleAmountList(amounts: number[], targetSum: number): number[] {
  const sum = amounts.reduce((acc, n) => acc + n, 0)
  if (!sum) return amounts.map(() => 0)
  const scaled = amounts.map((n) => Number(((n * targetSum) / sum).toFixed(2)))
  const drift = Number((targetSum - scaled.reduce((acc, n) => acc + n, 0)).toFixed(2))
  scaled[scaled.length - 1] = Number((scaled[scaled.length - 1] + drift).toFixed(2))
  return scaled
}

/**
 * 各级列表合计：直属 / 下一级 / 下二级共用同一游戏与成本合计；
 * 下一级、下二级在公式中再乘「额外佣金比例」，不再用半量列表近似。
 */
function levelScaleTarget(
  _level: RebateProfitLevel,
  scale: RebateSectionScale,
): RebateSectionScale {
  return scale
}

/** 下一级 / 下二级 · 额外佣金比例（与明细 Mock 一致） */
export const REBATE_EXTRA_COMMISSION_RATE = '50%'

export function parseCommissionRatePercent(rate: string) {
  const n = Number.parseFloat(rate.replace('%', ''))
  return Number.isFinite(n) ? n / 100 : 0
}

function mapRebateRowsFromNums(
  base: { key: string; name: string }[],
  nums: number[],
): AgentMyProfitProductRow[] {
  return base.map((item, index) => {
    const cell = formatProfitAmountText(nums[index] ?? 0)
    return {
      key: item.key,
      name: item.name,
      amountText: cell.amountText,
      tone: cell.tone,
    }
  })
}

function sumRebateRows(
  rows: AgentMyProfitProductRow[],
  totalKey: string,
): AgentMyProfitProductRow {
  const sum = rows.reduce((acc, row) => acc + parseProfitAmountText(row.amountText), 0)
  const cell = formatProfitAmountText(sum)
  return {
    key: totalKey,
    name: '合计',
    amountText: cell.amountText,
    tone: cell.tone,
  }
}

export type RebateProfitSection = {
  nameHeader: string
  amountHeader: string
  rows: AgentMyProfitProductRow[]
  total: AgentMyProfitProductRow
}

/** 当前 Tab · 游戏项（净输赢）+ 合计 */
export function agentMyProfitRebateGameSection(
  level: RebateProfitLevel,
  scale: RebateSectionScale = REBATE_DEFAULT_SECTION_SCALE,
): RebateProfitSection {
  const target = levelScaleTarget(level, scale)
  const nums = scaleAmountList(REBATE_L1_GAME_NUMS, target.gameTotal)
  const rows = mapRebateRowsFromNums(REBATE_GAME_BASE, nums)
  return {
    nameHeader: '游戏净输赢',
    amountHeader: '金额',
    rows,
    total: sumRebateRows(rows, 'game_sum'),
  }
}

/** 当前 Tab · 成本项（成本）+ 合计 */
export function agentMyProfitRebateCostSection(
  level: RebateProfitLevel,
  scale: RebateSectionScale = REBATE_DEFAULT_SECTION_SCALE,
): RebateProfitSection {
  const target = levelScaleTarget(level, scale)
  const nums = scaleAmountList(REBATE_L1_COST_NUMS, target.costTotal)
  const rows = mapRebateRowsFromNums(REBATE_COST_BASE, nums)
  return {
    nameHeader: '其他成本',
    amountHeader: '金额',
    rows,
    total: sumRebateRows(rows, 'cost_sum'),
  }
}

/** @deprecated 请用 agentMyProfitRebateGameSection */
export function agentMyProfitRebateGameRows(level: RebateProfitLevel): AgentMyProfitProductRow[] {
  return agentMyProfitRebateGameSection(level).rows
}

/** 当前 Tab 本级小计（可点开看级次公式） */
export function agentMyProfitRebateLevelSummary(
  level: RebateProfitLevel,
  commissionRate = '5.00%',
  scale: RebateSectionScale = REBATE_DEFAULT_SECTION_SCALE,
): AgentMyProfitProductRow {
  return agentMyProfitRebateLevelFormula(level, commissionRate, scale).levelRow
}

/**
 * 本级输出：
 * - 直属：净输赢 × 佣金比例 = 佣金
 * - 下一级 / 下二级：净输赢 × 佣金比例 × 额外佣金比例 = 本级佣金
 */
export function agentMyProfitRebateLevelFormula(
  level: RebateProfitLevel,
  commissionRate = '5.00%',
  scale: RebateSectionScale = REBATE_DEFAULT_SECTION_SCALE,
  extraCommissionRate = REBATE_EXTRA_COMMISSION_RATE,
) {
  const game = agentMyProfitRebateGameSection(level, scale)
  const cost = agentMyProfitRebateCostSection(level, scale)
  const netWin =
    parseProfitAmountText(game.total.amountText) + parseProfitAmountText(cost.total.amountText)
  const rateNum = parseCommissionRatePercent(commissionRate)
  const applyExtra = level === 'l2' || level === 'l3'
  const extraRateNum = applyExtra ? parseCommissionRatePercent(extraCommissionRate) : 1
  const monthCommission = Number(
    (Math.max(netWin, 0) * rateNum * extraRateNum).toFixed(2),
  )
  const monthCell = formatProfitAmountText(monthCommission)
  return {
    netWin,
    commissionRate,
    extraCommissionRate: applyExtra ? extraCommissionRate : null,
    monthCommission,
    levelRow: {
      key: `level_${level}`,
      name: '本级佣金',
      amountText: monthCell.amountText,
      tone: monthCell.tone,
    } satisfies AgentMyProfitProductRow,
  }
}

/** 当月佣金 = 直属；额外佣金 = 下一级 + 下二级 */
export function agentMyProfitRebateExtraCommission(
  commissionRate = '5.00%',
  scale: RebateSectionScale = REBATE_DEFAULT_SECTION_SCALE,
) {
  const l2 = agentMyProfitRebateLevelFormula('l2', commissionRate, scale).monthCommission
  const l3 = agentMyProfitRebateLevelFormula('l3', commissionRate, scale).monthCommission
  return Number((l2 + l3).toFixed(2))
}

/** 总佣金 = 当月佣金(直属) + 额外佣金(下一级+下二级) + 负佣金累计（正数不加 + 号） */
export function agentMyProfitRebateSummaryRow(
  monthCommission = 118.98,
  extraCommission = 118.98,
  negativeAccum = -100,
): AgentMyProfitProductRow {
  const total = Number((monthCommission + extraCommission + negativeAccum).toFixed(2))
  const abs = Math.abs(total).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const tone: AgentMyProfitTone =
    total > 0 ? 'positive' : total < 0 ? 'negative' : 'neutral'
  return {
    key: 'total',
    name: '总佣金',
    amountText: total < 0 ? `-${abs}` : abs,
    tone,
  }
}

/** @deprecated 请用 agentMyProfitRebateSummaryRow */
export const AGENT_MY_PROFIT_REBATE_SUMMARY_ROW: AgentMyProfitProductRow =
  agentMyProfitRebateSummaryRow()

export const AGENT_MY_PROFIT_REBATE_FOOTNOTE = '本月数据每十分钟更新一次'

/** 佣金项（游戏）明细：下注有效金额（展示项，不参与净输赢） / 输赢 / VIP退水 / 代理赚水 / 游戏净输赢 */
export const AGENT_MY_PROFIT_REBATE_GAME_DETAIL: AgentMyProfitDetailRow[] = [
  { label: '下注有效金额', amountText: '18,650.00', tone: 'neutral' },
  { label: '输赢', amountText: '+2,723.30', tone: 'positive' },
  { label: 'VIP退水', amountText: '-186.50', tone: 'negative' },
  { label: '代理赚水', amountText: '-36.80', tone: 'negative' },
  {
    label: '游戏净输赢',
    amountText: '+2,500.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: REBATE_GAME_NET_PROFIT_FORMULA,
  },
]

/** 直属佣金明细（含代理赚水；末行对齐公式当月佣金） */
export const AGENT_MY_PROFIT_REBATE_L1_DETAIL: AgentMyProfitDetailRow[] = [
  { label: '输赢', amountText: '+2,723.30', tone: 'positive' },
  { label: 'VIP退水', amountText: '-186.50', tone: 'negative' },
  { label: '代理赚水', amountText: '-36.80', tone: 'negative' },
  { label: 'VIP晋级礼金', amountText: '-45.00', tone: 'negative' },
  { label: 'VIP额外奖金', amountText: '-25.50', tone: 'negative' },
  { label: '活动金', amountText: '-50.00', tone: 'negative' },
  { label: '平台佣金比例', amountText: '5%', tone: 'neutral' },
  {
    label: '直属佣金',
    amountText: '+118.98',
    tone: 'positive',
    emphasize: true,
    formulaTip: REBATE_L1_PROFIT_FORMULA,
  },
]

/** 下一级 / 下二级佣金共用细项（不含代理赚水，含额外佣金比例） */
function buildRebateL2L3Detail(
  resultLabel: '下一级佣金' | '下二级佣金',
  formulaTip: string,
  resultAmountText = '+59.49',
): AgentMyProfitDetailRow[] {
  return [
    { label: '输赢', amountText: '+2,723.30', tone: 'positive' },
    { label: 'VIP退水', amountText: '-186.50', tone: 'negative' },
    { label: 'VIP晋级礼金', amountText: '-45.00', tone: 'negative' },
    { label: 'VIP额外奖金', amountText: '-25.50', tone: 'negative' },
    { label: '活动金', amountText: '-50.00', tone: 'negative' },
    { label: '平台佣金比例', amountText: '5%', tone: 'neutral' },
    { label: '额外佣金比例', amountText: '50%', tone: 'neutral' },
    {
      label: resultLabel,
      amountText: resultAmountText,
      tone: 'positive',
      emphasize: true,
      formulaTip,
    },
  ]
}

/** 下一级佣金明细 */
export const AGENT_MY_PROFIT_REBATE_L2_DETAIL = buildRebateL2L3Detail(
  '下一级佣金',
  REBATE_L2_PROFIT_FORMULA,
)

/** 下二级佣金明细 */
export const AGENT_MY_PROFIT_REBATE_L3_DETAIL = buildRebateL2L3Detail(
  '下二级佣金',
  REBATE_L3_PROFIT_FORMULA,
)

/** @deprecated 请用 AGENT_MY_PROFIT_REBATE_L2_DETAIL / L3 */
export const AGENT_MY_PROFIT_REBATE_L2_L3_DETAIL = AGENT_MY_PROFIT_REBATE_L2_DETAIL

export const AGENT_MY_PROFIT_REBATE_TOTAL_DETAIL: AgentMyProfitDetailRow[] = [
  {
    label: '直属佣金',
    amountText: '+118.98',
    tone: 'positive',
  },
  { label: '下一级佣金', amountText: '+59.49', tone: 'positive' },
  { label: '下二级佣金', amountText: '+59.49', tone: 'positive' },
  { label: '负佣金累计', amountText: '-100.00', tone: 'negative' },
  {
    label: '总佣金',
    amountText: '+137.96',
    tone: 'positive',
    emphasize: true,
    formulaTip: REBATE_AGENT_PROFIT_FORMULA,
  },
]

export type RebateDetailContext = {
  l1Commission: number
  l2Commission: number
  l3Commission: number
  monthCommission: number
  extraCommission: number
  negativeAccum: number
  /** 仅本月预计佣金计入 / 展示负佣金累计 */
  includeNegativeAccum: boolean
  gameTotal: number
}

function patchDetailResult(
  rows: AgentMyProfitDetailRow[],
  resultLabel: string,
  amount: number,
): AgentMyProfitDetailRow[] {
  const cell = formatProfitAmountText(amount)
  return rows.map((row) =>
    row.label === resultLabel
      ? { ...row, amountText: cell.amountText, tone: cell.tone }
      : row,
  )
}

/** 按当前月份公式重写明细末行 / 合计，保证与列表一致 */
export function agentMyProfitRebateDetailRowsWithContext(
  rowKey: string,
  ctx: RebateDetailContext,
): AgentMyProfitDetailRow[] {
  if (rowKey === 'total') {
    const neg = ctx.includeNegativeAccum ? ctx.negativeAccum : 0
    const total = Number(
      (ctx.l1Commission + ctx.l2Commission + ctx.l3Commission + neg).toFixed(2),
    )
    const totalCell = formatProfitAmountText(total)
    const l1Cell = formatProfitAmountText(ctx.l1Commission)
    const l2Cell = formatProfitAmountText(ctx.l2Commission)
    const l3Cell = formatProfitAmountText(ctx.l3Commission)
    const rows: AgentMyProfitDetailRow[] = [
      {
        label: '直属佣金',
        amountText: l1Cell.amountText,
        tone: l1Cell.tone,
      },
      {
        label: '下一级佣金',
        amountText: l2Cell.amountText,
        tone: l2Cell.tone,
      },
      {
        label: '下二级佣金',
        amountText: l3Cell.amountText,
        tone: l3Cell.tone,
      },
    ]
    if (ctx.includeNegativeAccum) {
      const negCell = formatProfitAmountText(ctx.negativeAccum)
      rows.push({
        label: '负佣金累计',
        amountText: negCell.amountText,
        tone: negCell.tone,
      })
    }
    rows.push({
      label: '总佣金',
      amountText: totalCell.amountText,
      tone: totalCell.tone,
      emphasize: true,
      formulaTip: rebateTotalCommissionFormulaTip(
        ctx.l1Commission,
        ctx.l2Commission,
        ctx.l3Commission,
        ctx.negativeAccum,
        ctx.includeNegativeAccum,
      ),
    })
    return rows
  }
  if (rowKey === 'level_l1') {
    return patchDetailResult(AGENT_MY_PROFIT_REBATE_L1_DETAIL, '直属佣金', ctx.l1Commission)
  }
  if (rowKey === 'level_l2') {
    return patchDetailResult(AGENT_MY_PROFIT_REBATE_L2_DETAIL, '下一级佣金', ctx.l2Commission)
  }
  if (rowKey === 'level_l3') {
    return patchDetailResult(AGENT_MY_PROFIT_REBATE_L3_DETAIL, '下二级佣金', ctx.l3Commission)
  }
  const gameCell = formatProfitAmountText(ctx.gameTotal)
  return AGENT_MY_PROFIT_REBATE_GAME_DETAIL.map((row) =>
    row.label === '游戏净输赢'
      ? { ...row, amountText: gameCell.amountText, tone: gameCell.tone }
      : row,
  )
}

export function agentMyProfitHasDetail(
  rowKey: string,
  _identity: AgentIdentityType = 'share',
): boolean {
  return !AGENT_MY_PROFIT_NO_DETAIL_KEYS.has(rowKey)
}

/**
 * 按身份 / 返佣级次返回明细
 * - 占成：游戏净输赢 / 总计七项
 * - 返佣：佣金项（游戏）走游戏净输赢细项（含展示项下注有效金额）；本级小计按 Tab 级次公式；合计为三级汇总
 * - 传入 rebateContext 时，末行金额与当前月份列表自洽
 */
export function agentMyProfitDetailRows(
  rowKey: string,
  identity: AgentIdentityType = 'share',
  _rebateLevel: RebateProfitLevel = 'l1',
  rebateContext?: RebateDetailContext,
): AgentMyProfitDetailRow[] {
  if (identity === 'rebate') {
    if (rebateContext) return agentMyProfitRebateDetailRowsWithContext(rowKey, rebateContext)
    if (rowKey === 'total') return AGENT_MY_PROFIT_REBATE_TOTAL_DETAIL
    if (rowKey === 'level_l1') return AGENT_MY_PROFIT_REBATE_L1_DETAIL
    if (rowKey === 'level_l2') return AGENT_MY_PROFIT_REBATE_L2_DETAIL
    if (rowKey === 'level_l3') return AGENT_MY_PROFIT_REBATE_L3_DETAIL
    return AGENT_MY_PROFIT_REBATE_GAME_DETAIL
  }
  if (rowKey === 'total') return AGENT_MY_PROFIT_TOTAL_DETAIL_ROWS
  return AGENT_MY_PROFIT_DETAIL_ROWS
}

export function agentMyProfitTableNameHeader(identity: AgentIdentityType) {
  return identity === 'rebate' ? '佣金项' : '占成项'
}

export function agentMyProfitDialogLabelHeader(identity: AgentIdentityType) {
  return identity === 'rebate' ? '佣金细项' : '实占细项'
}

export function agentMyProfitPageTitle(identity: AgentIdentityType) {
  return identity === 'rebate' ? '我的佣金' : '我的盈亏'
}

export function agentMyProfitAmountHeader(identity: AgentIdentityType) {
  return identity === 'rebate' ? '佣金' : '盈亏'
}

export function agentMyProfitDateRangeText(preset: ProfitDatePreset): string {
  /** 返佣按月发放：展示结算月，不展示日区间 */
  if (preset === 'thisMonth') return '2026年7月'
  if (preset === 'lastMonth') return '2026年6月'
  if (preset === 'may') return '2026年5月'
  if (preset === 'april') return '2026年4月'

  const base = '2025-08-06'
  if (preset === 'today') return `${base}至${base}`
  if (preset === 'yesterday') return '2025-08-05至2025-08-05'
  if (preset === 'thisWeek') return '2025-08-04至2025-08-10'
  return '2025-07-28至2025-08-03'
}

export function agentMyProfitDateFilterLabel(identity: AgentIdentityType) {
  return identity === 'rebate' ? '月份筛选' : '数据时间段'
}

export function agentMyProfitDefaultPreset(identity: AgentIdentityType): ProfitDatePreset {
  return identity === 'rebate' ? 'thisMonth' : 'today'
}

export function agentMyProfitPresets(identity: AgentIdentityType) {
  return identity === 'rebate' ? AGENT_MY_PROFIT_REBATE_MONTH_PRESETS : AGENT_MY_PROFIT_PRESETS
}

/** 返佣月份快捷项 → 结算月 YYYY-MM（对齐佣金报表 Mock） */
export function agentMyProfitRebateMonthKey(preset: ProfitDatePreset): string {
  if (preset === 'thisMonth') return '2026-07'
  if (preset === 'lastMonth') return '2026-06'
  if (preset === 'may') return '2026-05'
  if (preset === 'april') return '2026-04'
  return '2026-07'
}

/** 结算月 YYYY-MM → 快捷项（无匹配则 null，仍可选中该月） */
export function agentMyProfitRebatePresetFromMonthKey(
  month: string,
): ProfitDatePreset | null {
  if (month === '2026-07') return 'thisMonth'
  if (month === '2026-06') return 'lastMonth'
  if (month === '2026-05') return 'may'
  if (month === '2026-04') return 'april'
  return null
}

export function agentMyProfitToneClass(tone: AgentMyProfitTone) {
  if (tone === 'positive') return 'mh5-agent-my-profit__amount--positive'
  if (tone === 'negative') return 'mh5-agent-my-profit__amount--negative'
  return ''
}
