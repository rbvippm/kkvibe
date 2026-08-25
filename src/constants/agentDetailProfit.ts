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

/** 经典汇总卡 · 总盈亏公式 tip */
export const AGENT_PROFIT_FORMULA = '总盈亏 = 实占净输赢 + 代理赚水'

/** 分区 · 实占净输赢简写（总盈亏卡气泡） */
export const AGENT_NET_PNL_FORMULA = '实占净输赢 = 游戏净输赢 - 其他成本'

/**
 * 实占净输赢明细 · 沿用原总盈亏展开式，去掉代理赚水后改名
 * 原：总盈亏 = 实占游戏输赢 - 实占退水 - 实占VIP退水 - 代理赚水 - 场馆费 - 实占VIP晋级礼金 - 实占VIP额外奖金 - 实占活动金 - 实占充提手续费
 */
export const AGENT_NET_PNL_DETAIL_FORMULA =
  '实占净输赢 = 实占游戏输赢 - 实占退水 - 实占VIP退水 - 场馆费 - 实占VIP晋级礼金 - 实占VIP额外奖金 - 实占活动金 - 实占充提手续费'

/** 分区新结构 · 总盈亏公式 */
export const AGENT_PROFIT_SECTION_FORMULA = '总盈亏 = 实占净输赢 + 代理赚水'

/** 代理赚水明细 tip（按游戏大类求和，与明细行顺序一致） */
export const AGENT_REBATE_EARN_FORMULA =
  '代理赚水 = 刮刮乐 + 弹珠 + 棋牌 + 彩票 + 趣投 + 体育 + 真人 + 老虎机 + 捕鱼'

/** @deprecated 请用 AGENT_GAME_PROFIT_FORMULA（含场馆费；不含代理赚水） */
export const AGENT_PROFIT_GAME_FORMULA =
  '游戏净输赢 = 实占游戏输赢 - 实占退水 - 实占VIP退水 - 场馆费'

/** 返佣 · 代理佣金（不含退水、代理赚水；含场馆费） */
export const AGENT_COMMISSION_FORMULA =
  '代理佣金 = 输赢 - VIP退水 - 场馆费 - VIP晋级礼金 - VIP额外奖金 - 活动金 - 充提手续费'

/** 代理侧成本项：服务端给正数，列表展示绝对值，结算时减去（代理赚水改为总盈亏加项，不在此列） */
export const AGENT_COST_ITEM_LABELS = new Set([
  '退水',
  'VIP退水',
  '场馆费',
  'VIP晋级礼金',
  'VIP额外奖金',
  '活动金',
  '充提手续费',
])

type AgentProfitSummaryMock = {
  /** 实占游戏输赢（可正可负，按公式直接累加） */
  actualWin: number
  /** 实占退水（服务端正数，结算时减去） */
  actualRebate: number
  /** 实占 VIP 退水（服务端正数，结算时减去） */
  actualVipRebate: number
  /** 代理赚水（服务端正数；不计入游戏净输赢，总盈亏时加上） */
  rebateEarn: number
  /** 场馆费（服务端正数，结算时减去） */
  venueFee: number
  /** 实占 VIP 晋级礼金（服务端正数，结算时减去） */
  vipBonus: number
  /** 实占 VIP 额外奖金（服务端正数，结算时减去） */
  vipExtraBonus: number
  /** 实占活动金（服务端正数，结算时减去） */
  activityGold: number
  /** 充提手续费（服务端正数，结算时减去；返佣佣金口径） */
  depositWithdrawFee: number
}

const PROFIT_SUMMARY_BY_CURRENCY: Record<string, AgentProfitSummaryMock> = {
  KKC: {
    actualWin: 14890,
    actualRebate: 1280,
    actualVipRebate: 150,
    rebateEarn: 860,
    venueFee: 80,
    vipBonus: 320,
    vipExtraBonus: 100,
    activityGold: 180,
    depositWithdrawFee: 60,
  },
  USDT: {
    actualWin: 3740,
    actualRebate: 280,
    actualVipRebate: 50,
    rebateEarn: 210,
    venueFee: 22,
    vipBonus: 80,
    vipExtraBonus: 25,
    activityGold: 50,
    depositWithdrawFee: 18,
  },
  KKV: {
    actualWin: 9996,
    actualRebate: 780,
    actualVipRebate: 96,
    rebateEarn: 520,
    venueFee: 55,
    vipBonus: 210,
    vipExtraBonus: 65,
    activityGold: 120,
    depositWithdrawFee: 42,
  },
  '信用额度-CNY': {
    actualWin: 1848,
    actualRebate: 135,
    actualVipRebate: 35,
    rebateEarn: 128,
    venueFee: 18,
    vipBonus: 60,
    vipExtraBonus: 20,
    activityGold: 40,
    depositWithdrawFee: 16,
  },
  '信用额度-USD': {
    actualWin: 750,
    actualRebate: 118,
    actualVipRebate: 12,
    rebateEarn: 48,
    venueFee: 8,
    vipBonus: 22,
    vipExtraBonus: 8,
    activityGold: 15,
    depositWithdrawFee: 8,
  },
}

const EMPTY_SUMMARY_MOCK: AgentProfitSummaryMock = {
  actualWin: 0,
  actualRebate: 0,
  actualVipRebate: 0,
  rebateEarn: 0,
  venueFee: 0,
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

/** 成本项展示服务端正数（无正负号），粉色表示支出 */
function formatCostAmount(value: number): { value: string; tone: ProfitValueTone } {
  const abs = Math.abs(value)
  const text = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return { value: text, tone: abs > 0 ? 'negative' : 'neutral' }
}

function isAgentCostItem(label: string) {
  return AGENT_COST_ITEM_LABELS.has(label)
}

function formatItemAmount(label: string, contribution: number): { value: string; tone: ProfitValueTone } {
  if (isAgentCostItem(label)) return formatCostAmount(contribution)
  return { value: formatProfitAmount(contribution), tone: profitTone(contribution) }
}

function getAgentProfitSummaryMock(currency: string) {
  return PROFIT_SUMMARY_BY_CURRENCY[currency] ?? EMPTY_SUMMARY_MOCK
}

/** 游戏净输赢合计（实占）：输赢 − 退水 − VIP退水 − 场馆费（不含代理赚水） */
export function getAgentGameNetTotal(currency: string) {
  const stats = getAgentProfitSummaryMock(currency)
  return stats.actualWin - stats.actualRebate - stats.actualVipRebate - stats.venueFee
}

/** 代理赚水（正数，总盈亏加项） */
export function getAgentRebateEarn(currency: string) {
  return getAgentProfitSummaryMock(currency).rebateEarn
}

/** 其他成本合计（绝对值，正数） */
export function getAgentOtherCostAbs(currency: string) {
  const stats = getAgentProfitSummaryMock(currency)
  return (
    stats.vipBonus +
    stats.vipExtraBonus +
    stats.activityGold +
    stats.depositWithdrawFee
  )
}

/** 实占净输赢 = 游戏净输赢 − 其他成本（原「总盈亏」/「净盈亏」口径，游戏净输赢已不含代理赚水） */
export function getAgentNetPnlAmount(currency: string) {
  return getAgentGameNetTotal(currency) - getAgentOtherCostAbs(currency)
}

/** @deprecated 请用 getAgentNetPnlAmount；现为实占净输赢 */
export function getAgentActualProfitAmount(currency: string) {
  return getAgentNetPnlAmount(currency)
}

/** 总盈亏 = 实占净输赢 + 代理赚水 */
export function getAgentGrandTotalAmount(currency: string) {
  return getAgentNetPnlAmount(currency) + getAgentRebateEarn(currency)
}

/** 经典汇总卡 /「我的」总盈亏（实占净输赢 + 代理赚水） */
export function getAgentTotalProfit(currency: string) {
  const total = getAgentGrandTotalAmount(currency)
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

export function getAgentSectionNetPnl(currency: string) {
  const total = getAgentNetPnlAmount(currency)
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

export function getAgentSectionTotalProfit(currency: string) {
  return getAgentTotalProfit(currency)
}

/** 返佣 · 代理佣金总值（输赢 − VIP退水 − 场馆费 − VIP晋级礼金 − VIP额外奖金 − 活动金 − 充提手续费） */
export function getAgentTotalCommission(currency: string) {
  const stats = getAgentProfitSummaryMock(currency)
  const total =
    stats.actualWin -
    stats.actualVipRebate -
    stats.venueFee -
    stats.vipBonus -
    stats.vipExtraBonus -
    stats.activityGold -
    stats.depositWithdrawFee
  return {
    value: formatProfitAmount(total),
    tone: profitTone(total),
  }
}

/** 场馆明细标题与公式左侧统一为「游戏净输赢」（占成：含场馆费，不含代理赚水） */
export const AGENT_GAME_PROFIT_FORMULA =
  '游戏净输赢 = 实占游戏输赢 - 实占退水 - 实占VIP退水 - 场馆费'

export type AgentProfitSectionRow = {
  key: string
  label: string
  value: string
  tone: ProfitValueTone
}

export type AgentProfitSection = {
  nameHeader: string
  amountHeader: string
  rows: AgentProfitSectionRow[]
  total: AgentProfitSectionRow
}

function sumSectionRows(rows: AgentProfitSectionRow[], totalKey: string): AgentProfitSectionRow {
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

/** 与「我的报表-盈亏」一致的游戏大类权重（合计缩放至当前币种游戏净输赢） */
const SHARE_GAME_CATEGORY_BASE: { key: string; label: string; weight: number }[] = [
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

/** 游戏净输赢公式构成项（明细弹框用；列表展开为游戏大类） */
function getAgentProfitGameFormulaRows(currency: string): AgentProfitSectionRow[] {
  const stats = getAgentProfitSummaryMock(currency)
  return [
    {
      key: 'win',
      label: '输赢',
      value: formatProfitAmount(stats.actualWin),
      tone: profitTone(stats.actualWin),
    },
    {
      key: 'rebate',
      label: '退水',
      ...formatCostAmount(stats.actualRebate),
    },
    {
      key: 'vip_rebate',
      label: 'VIP退水',
      ...formatCostAmount(stats.actualVipRebate),
    },
    {
      key: 'venue_fee',
      label: '场馆费',
      ...formatCostAmount(stats.venueFee),
    },
  ]
}

/**
 * 占成 · 游戏净输赢分区（对齐「我的报表-盈亏」：展开为游戏大类）
 * 大类金额等比缩放至当前币种游戏净输赢合计
 */
export function getAgentProfitGameSection(currency: string): AgentProfitSection {
  const target = getAgentGameNetTotal(currency)
  const scaled = scaleWeightsToTarget(
    SHARE_GAME_CATEGORY_BASE.map((item) => item.weight),
    target,
  )
  const rows: AgentProfitSectionRow[] = SHARE_GAME_CATEGORY_BASE.map((item, index) => {
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
    amountHeader: '金额（实占）',
    rows,
    total: sumSectionRows(rows, 'game_sum'),
  }
}

/** 占成 · 其他成本分区（对齐「我的盈亏」，含充提手续费） */
export function getAgentProfitCostSection(currency: string): AgentProfitSection {
  const stats = getAgentProfitSummaryMock(currency)
  const rows: AgentProfitSectionRow[] = [
    {
      key: 'vip_bonus',
      label: 'VIP晋级礼金',
      ...formatCostAmount(stats.vipBonus),
    },
    {
      key: 'vip_extra',
      label: 'VIP额外奖金',
      ...formatCostAmount(stats.vipExtraBonus),
    },
    {
      key: 'activity',
      label: '活动金',
      ...formatCostAmount(stats.activityGold),
    },
    {
      key: 'deposit_withdraw_fee',
      label: '充提手续费',
      ...formatCostAmount(stats.depositWithdrawFee),
    },
  ]
  const costAbs = getAgentOtherCostAbs(currency)
  const costCell = formatCostAmount(costAbs)
  return {
    nameHeader: '其他成本',
    amountHeader: '金额（实占）',
    rows,
    total: {
      key: 'cost_sum',
      label: '合计',
      value: costCell.value,
      tone: costCell.tone,
    },
  }
}

/** 看板币种短名：信用额度-CNY → CNY */
export function agentProfitCurrencyUnit(currency: string) {
  if (currency.startsWith('信用额度-')) return currency.slice('信用额度-'.length)
  if (currency === 'USDT-TRON') return 'USDT'
  return currency
}

/** 占成置顶：总盈亏金额 + 实占净输赢 + 代理赚水 */
export function getAgentProfitHero(currency: string) {
  const total = getAgentGrandTotalAmount(currency)
  const net = getAgentNetPnlAmount(currency)
  const earn = getAgentRebateEarn(currency)
  const totalAbs = Math.abs(total).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const amountText =
    total > 0 ? `+ ${totalAbs}` : total < 0 ? `- ${totalAbs}` : '0.00'
  return {
    label: '总盈亏',
    currencyUnit: agentProfitCurrencyUnit(currency),
    amountText,
    tone: profitTone(total),
    netAmountText: formatProfitAmount(net),
    netTone: profitTone(net),
    earnAmountText: formatProfitAmount(earn),
    earnTone: profitTone(earn),
  }
}

/** 占成公式卡：游戏净输赢 − 其他成本 = 实占净输赢；实占净输赢 + 代理赚水 = 总盈亏 */
export function getAgentProfitFormula(currency: string) {
  const game = getAgentProfitGameSection(currency).total
  const costAbs = getAgentOtherCostAbs(currency)
  const net = getAgentSectionNetPnl(currency)
  const earn = getAgentRebateEarn(currency)
  const earnCell = formatProfitAmount(earn)
  const total = getAgentSectionTotalProfit(currency)
  return {
    gameAmountText: game.value,
    gameTone: game.tone,
    costAmountText: Math.abs(costAbs).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    netAmountText: net.value,
    netTone: net.tone,
    earnAmountText: earnCell,
    earnTone: profitTone(earn),
    totalAmountText: total.value,
    totalTone: total.tone,
  }
}

/** 占成 · 代理赚水分区（补齐明细；合计只读，点总盈亏卡内代理赚水金额打开赚水明细） */
export function getAgentProfitEarnSection(currency: string): AgentProfitSection {
  const earn = getAgentRebateEarn(currency)
  return {
    nameHeader: '代理赚水',
    amountHeader: '金额（利润）',
    rows: [],
    total: {
      key: 'rebate_earn',
      label: '合计',
      value: formatProfitAmount(earn),
      tone: profitTone(earn),
    },
  }
}

/** 明细弹框行（对齐「我的盈亏」：末行可带公式 tip） */
export type AgentProfitDialogDetailRow = {
  label: string
  amountText: string
  tone: ProfitValueTone
  emphasize?: boolean
  formulaTip?: string
}

/** total = 总盈亏明细；net_pnl = 实占净输赢明细；其余为游戏大类 key */
export type AgentProfitDialogKind = 'total' | string

function parseProfitAmountText(text: string) {
  return Number(text.replace(/,/g, '').replace(/^\+/, '')) || 0
}

/**
 * 将游戏净输赢拆成「输赢 − 成本项」。
 * 成本项始终为正数；输赢 = 净输赢 + 成本合计，保证公式在净输赢为负时仍成立。
 */
export function scaleAgentGameNetParts(
  parts: { label: string; amountText: string }[],
  targetNet: number,
): Record<string, number> {
  let winWeight = 0
  const costWeights: Record<string, number> = {}
  for (const part of parts) {
    const n = Math.abs(parseProfitAmountText(part.amountText))
    if (isAgentCostItem(part.label)) costWeights[part.label] = n
    else if (part.label === '输赢') winWeight = n
  }
  const costWeightSum = Object.values(costWeights).reduce((acc, n) => acc + n, 0)
  const baseNet = winWeight - costWeightSum
  const absScale = baseNet ? Math.abs(targetNet) / Math.abs(baseNet) : 0
  const result: Record<string, number> = {}
  let costTotal = 0
  for (const [label, weight] of Object.entries(costWeights)) {
    const value = Number((weight * absScale).toFixed(2))
    result[label] = value
    costTotal += value
  }
  result['输赢'] = Number((targetNet + costTotal).toFixed(2))
  return result
}

/** 大类明细基准（对齐「我的报表-盈亏」场馆口径） */
const AGENT_CATEGORY_DETAIL_BASE: AgentProfitDialogDetailRow[] = [
  { label: '下注有效金额', amountText: '10,000.00', tone: 'neutral' },
  { label: '输赢', amountText: '+500.00', tone: 'positive' },
  { label: '退水', amountText: '100.00', tone: 'negative' },
  { label: 'VIP退水', amountText: '50.00', tone: 'negative' },
  { label: '场馆费', amountText: '20.00', tone: 'negative' },
  {
    label: '游戏净输赢',
    amountText: '+330.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: AGENT_GAME_PROFIT_FORMULA,
  },
]

function getAgentCategoryDetailRows(
  categoryKey: string,
  currency: string,
): AgentProfitDialogDetailRow[] {
  const section = getAgentProfitGameSection(currency)
  const product = section.rows.find((row) => row.key === categoryKey)
  const targetNet = product ? parseProfitAmountText(product.value) : 330
  const base = AGENT_CATEGORY_DETAIL_BASE.filter((row) => row.label !== '下注有效金额' && !row.emphasize)
  const amounts = scaleAgentGameNetParts(base, targetNet)
  const betScale = Math.max(Math.abs(targetNet) / 330, 0.2)
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
      const cell = formatItemAmount(row.label, amounts[row.label] ?? 0)
      return {
        ...row,
        amountText: cell.value,
        tone: cell.tone,
      }
    }),
    {
      label: '游戏净输赢',
      amountText: formatProfitAmount(targetNet),
      tone: profitTone(targetNet),
      emphasize: true,
      formulaTip: AGENT_GAME_PROFIT_FORMULA,
    },
  ]
}

/** 代理盈亏 · 点大类看明细；点总盈亏卡内实占净输赢 / 代理赚水 / 总盈亏看构成（分区合计金额不可点） */
export function getAgentProfitDialogDetail(
  kind: AgentProfitDialogKind,
  currency: string,
): AgentProfitDialogDetailRow[] {
  const cost = getAgentProfitCostSection(currency)
  const mapRow = (row: AgentProfitSectionRow): AgentProfitDialogDetailRow => ({
    label: row.label,
    amountText: row.value,
    tone: row.tone,
  })

  if (kind === 'rebate_earn') {
    const earn = getAgentRebateEarn(currency)
    const scaled = scaleWeightsToTarget(
      SHARE_GAME_CATEGORY_BASE.map((item) => Math.abs(item.weight)),
      Math.abs(earn),
    )
    return [
      ...SHARE_GAME_CATEGORY_BASE.map((item, index) => {
        const value = Math.abs(scaled[index] ?? 0)
        return {
          label: item.label,
          amountText: formatProfitAmount(value),
          tone: profitTone(value),
        }
      }),
      {
        label: '代理赚水',
        amountText: formatProfitAmount(earn),
        tone: profitTone(earn),
        emphasize: true,
        formulaTip: AGENT_REBATE_EARN_FORMULA,
      },
    ]
  }

  if (kind === 'net_pnl') {
    const net = getAgentSectionNetPnl(currency)
    const formulaRows = getAgentProfitGameFormulaRows(currency)
    return [
      ...formulaRows.map(mapRow),
      ...cost.rows.map(mapRow),
      {
        label: '实占净输赢',
        amountText: net.value,
        tone: net.tone,
        emphasize: true,
        formulaTip: AGENT_NET_PNL_DETAIL_FORMULA,
      },
    ]
  }

  if (kind === 'total') {
    const net = getAgentSectionNetPnl(currency)
    const earn = getAgentRebateEarn(currency)
    const total = getAgentSectionTotalProfit(currency)
    return [
      {
        label: '实占净输赢',
        amountText: net.value,
        tone: net.tone,
      },
      {
        label: '代理赚水',
        amountText: formatProfitAmount(earn),
        tone: profitTone(earn),
      },
      {
        label: '总盈亏',
        amountText: total.value,
        tone: total.tone,
        emphasize: true,
        formulaTip: AGENT_PROFIT_SECTION_FORMULA,
      },
    ]
  }

  return getAgentCategoryDetailRows(kind, currency)
}

export function agentProfitDialogTitle(kind: AgentProfitDialogKind, currency = 'KKC') {
  if (kind === 'total') return '总盈亏明细'
  if (kind === 'net_pnl') return '实占净输赢明细'
  if (kind === 'rebate_earn') return '代理赚水明细'
  const row = getAgentProfitGameSection(currency).rows.find((item) => item.key === kind)
  return `${row?.label ?? '游戏'}明细`
}

/**
 * 代理盈亏上方汇总卡：团队充值总额 / 团队提款总额（不参与盈亏公式）
 * 样式与数值口径对齐「我的报表」现金汇总卡
 */
export function getAgentProfitFlowRows(_currency: string): AgentProfitSummaryRow[] {
  return [
    { label: '团队充值总额', value: '12,800.00', tone: 'neutral' },
    { label: '团队提款总额', value: '6,420.00', tone: 'neutral' },
  ]
}

/** 经典汇总卡 · 构成项（游戏成本不含代理赚水；代理赚水为总盈亏加项） */
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
      ...formatCostAmount(stats.actualRebate),
    },
    {
      label: 'VIP退水',
      ...formatCostAmount(stats.actualVipRebate),
    },
    {
      label: '场馆费',
      ...formatCostAmount(stats.venueFee),
    },
    {
      label: 'VIP晋级礼金',
      ...formatCostAmount(stats.vipBonus),
    },
    {
      label: 'VIP额外奖金',
      ...formatCostAmount(stats.vipExtraBonus),
    },
    {
      label: '活动金',
      ...formatCostAmount(stats.activityGold),
    },
    {
      label: '充提手续费',
      ...formatCostAmount(stats.depositWithdrawFee),
    },
    {
      label: '代理赚水',
      value: formatProfitAmount(stats.rebateEarn),
      tone: profitTone(stats.rebateEarn),
    },
  ]
}

/** 返佣 · 代理佣金细项：输赢 / VIP退水 / 场馆费 / VIP晋级礼金 / VIP额外奖金 / 活动金 / 充提手续费 */
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
      ...formatCostAmount(stats.actualVipRebate),
    },
    {
      label: '场馆费',
      ...formatCostAmount(stats.venueFee),
    },
    {
      label: 'VIP晋级礼金',
      ...formatCostAmount(stats.vipBonus),
    },
    {
      label: 'VIP额外奖金',
      ...formatCostAmount(stats.vipExtraBonus),
    },
    {
      label: '活动金',
      ...formatCostAmount(stats.activityGold),
    },
    {
      label: '充提手续费',
      ...formatCostAmount(stats.depositWithdrawFee),
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
  /** 游戏净输赢 = 输赢 − 退水 − VIP退水 − 场馆费 = 330 */
  totalProfit: '+330.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '1000.00', tone: 'neutral' },
    { label: '输赢', value: '+500.00', tone: 'positive' },
    { label: '退水', value: '100.00', tone: 'negative' },
    { label: 'VIP退水', value: '50.00', tone: 'negative' },
    { label: '场馆费', value: '20.00', tone: 'negative' },
  ],
}

/** 各品类合计（原型 Mock） */
const OVERALL_GAME_DETAIL: AgentProfitDetail = {
  title: '全部（实占）',
  /** 游戏净输赢 = 输赢 − 退水 − VIP退水 − 场馆费 = 10840 */
  totalProfit: '+10,840.00',
  totalProfitTone: 'positive',
  rows: [
    { label: '下注有效金额', value: '86,420.00', tone: 'neutral' },
    { label: '输赢', value: '+12,350.00', tone: 'positive' },
    { label: '退水', value: '1,280.00', tone: 'negative' },
    { label: 'VIP退水', value: '150.00', tone: 'negative' },
    { label: '场馆费', value: '80.00', tone: 'negative' },
  ],
}

const EMPTY_DETAIL_ROWS: AgentProfitDetailRow[] = [
  { label: '下注有效金额', value: '0.00', tone: 'neutral' },
  { label: '输赢', value: '0.00', tone: 'neutral' },
  { label: '退水', value: '0.00', tone: 'neutral' },
  { label: 'VIP退水', value: '0.00', tone: 'neutral' },
  { label: '场馆费', value: '0.00', tone: 'neutral' },
]

/** 品类下二级「全部」合计（原型 Mock） */
function getCategoryVendorAllDetail(category: AgentProfitCategoryKey): AgentProfitDetail {
  const catLabel =
    AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'

  if (category === 'sports') {
    /** 游戏净输赢 = 9860 − 980 − 120 − 40 = 8720 */
    return {
      title: `${catLabel}（实占）`,
      totalProfit: '+8,720.00',
      totalProfitTone: 'positive',
      rows: [
        { label: '下注有效金额', value: '42,800.00', tone: 'neutral' },
        { label: '输赢', value: '+9,860.00', tone: 'positive' },
        { label: '退水', value: '980.00', tone: 'negative' },
        { label: 'VIP退水', value: '120.00', tone: 'negative' },
        { label: '场馆费', value: '40.00', tone: 'negative' },
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
