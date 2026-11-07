import type { AgentCreditCurrency } from './agentDetail'
import { getCreditAgentProfitBook, type CreditAgentProfitBook } from './agentCreditSettle'
import {
  AGENT_CREDIT_GAME_PROFIT_FORMULA,
  AGENT_CREDIT_NET_PNL_DETAIL_FORMULA,
  AGENT_CREDIT_PROFIT_FORMULA,
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS,
  agentProfitCurrencyUnit,
  buildRebateEarnGameDetailRows,
  getEnabledP2pRebateGames,
  joinProfitSumFormula,
  parseEarnCategoryKey,
  rebateEarnSumFormula,
  type AgentProfitCategoryKey,
  type AgentProfitDetail,
  type AgentProfitDialogDetailRow,
  type AgentProfitDialogKind,
  type AgentProfitSection,
  type AgentProfitSectionRow,
  type AgentProfitSummaryRow,
  type AgentProfitVendorKey,
  type ProfitValueTone,
} from './agentDetailProfit'
import { MEMBER_CREDIT_GAME_SHARES } from './memberDetailProfit'

/**
 * 信用代理中心 · 代理详情「代理盈亏」「游戏数据」与「信用额度 · 对账结算」同源，公式沿用原信用口径：
 * 总盈亏 = 游戏净输赢 + P2P返利 + 代理赚水；游戏净输赢 = 实占游戏输赢 − 实占退水 − 场馆费。
 * 取数：实占游戏输赢 = 交收链路本级占成毛利，代理赚水 = 交收「赚水」，总盈亏 = 交收「实占净盈亏」；
 * 交收不含实占退水（退水逐级赚差价已体现在赚水里）、场馆费，两项恒为 0；P2P返利计入总盈亏，原型 Mock 为 0。
 * 游戏大类拆分沿用会员盈亏 / 游戏统计的同一组占比，保证代理、会员两边按大类也能对上。
 */
type AgentRef = { id: string; name: string }

type CategoryBook = {
  key: AgentProfitCategoryKey
  label: string
  validBet: number
  win: number
  earn: number
}

/** 交收口径下恒为 0 的扣减项与加项 */
const ACTUAL_REBATE = 0
const VENUE_FEE = 0
const P2P_REBATE = 0

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function formatAmount(value: number) {
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (value > 0) return `+${abs}`
  if (value < 0) return `-${abs}`
  return '0.00'
}

function formatPlain(value: number) {
  return Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function toneOf(value: number): ProfitValueTone {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

/** 成本项展示正数、粉色表示支出，与原代理盈亏一致 */
function costCell(value: number): { value: string; tone: ProfitValueTone } {
  return { value: formatPlain(value), tone: Math.abs(value) > 0 ? 'negative' : 'neutral' }
}

/** 按占比拆分并把舍入差额补到最后一项，保证合计不漂移 */
function splitByShares(total: number, shares: number[]) {
  const parts = shares.map((share) => round2(total * share))
  const drift = round2(total - parts.reduce((acc, n) => acc + n, 0))
  if (parts.length) parts[parts.length - 1] = round2(parts[parts.length - 1] + drift)
  return parts
}

function bookOf(agent: AgentRef, currency: string): CreditAgentProfitBook {
  return getCreditAgentProfitBook(agent, currency as AgentCreditCurrency)
}

function gameNet(win: number) {
  return round2(win - ACTUAL_REBATE - VENUE_FEE)
}

function categoryBooks(book: CreditAgentProfitBook): CategoryBook[] {
  const betShares = MEMBER_CREDIT_GAME_SHARES.map((item) => item.bet)
  const winShares = MEMBER_CREDIT_GAME_SHARES.map((item) => item.win)
  const bets = splitByShares(book.validBet, betShares)
  const wins = splitByShares(book.shareProfit, winShares)
  const earns = splitByShares(book.rebateNet, betShares)
  return MEMBER_CREDIT_GAME_SHARES.map((item, index) => ({
    key: item.key,
    label: item.label,
    validBet: bets[index] ?? 0,
    win: wins[index] ?? 0,
    earn: earns[index] ?? 0,
  }))
}

function sectionRow(key: string, label: string, value: number): AgentProfitSectionRow {
  return { key, label, value: formatAmount(value), tone: toneOf(value) }
}

export function getAgentCreditProfitFlowRows(agent: AgentRef, currency: string): AgentProfitSummaryRow[] {
  const book = bookOf(agent, currency)
  return [
    { label: '团队上分总额', value: formatPlain(book.creditUp), tone: 'neutral' },
    { label: '团队下分总额', value: formatPlain(book.creditDown), tone: 'neutral' },
  ]
}

/** 置顶：总盈亏 = 实占净输赢 + P2P返利 + 代理赚水 */
export function getAgentCreditProfitHero(agent: AgentRef, currency: string) {
  const book = bookOf(agent, currency)
  const net = gameNet(book.shareProfit)
  const totalAbs = formatPlain(book.net)
  return {
    label: '总盈亏',
    currencyUnit: agentProfitCurrencyUnit(currency),
    amountText: book.net > 0 ? `+ ${totalAbs}` : book.net < 0 ? `- ${totalAbs}` : '0.00',
    tone: toneOf(book.net),
    netAmountText: formatAmount(net),
    netTone: toneOf(net),
    p2pAmountText: formatAmount(P2P_REBATE),
    p2pTone: toneOf(P2P_REBATE),
    earnAmountText: formatAmount(book.rebateNet),
    earnTone: toneOf(book.rebateNet),
  }
}

export function getAgentCreditTotalProfit(agent: AgentRef, currency: string) {
  const { net } = bookOf(agent, currency)
  return { value: formatAmount(net), tone: toneOf(net) }
}

/** 经典汇总卡构成项（原信用口径：输赢 / 退水 / 场馆费 / P2P返利 / 代理赚水） */
export function getAgentCreditProfitSummaryRows(agent: AgentRef, currency: string): AgentProfitSummaryRow[] {
  const book = bookOf(agent, currency)
  return [
    { label: '输赢', value: formatAmount(book.shareProfit), tone: toneOf(book.shareProfit) },
    { label: '退水', ...costCell(ACTUAL_REBATE) },
    { label: '场馆费', ...costCell(VENUE_FEE) },
    { label: 'P2P返利', value: formatAmount(P2P_REBATE), tone: toneOf(P2P_REBATE) },
    { label: '代理赚水', value: formatAmount(book.rebateNet), tone: toneOf(book.rebateNet) },
  ]
}

export function getAgentCreditProfitGameSection(agent: AgentRef, currency: string): AgentProfitSection {
  const book = bookOf(agent, currency)
  return {
    nameHeader: '游戏净输赢',
    amountHeader: '金额（实占）',
    rows: categoryBooks(book).map((item) => sectionRow(item.key, item.label, gameNet(item.win))),
    total: sectionRow('game_sum', '合计', gameNet(book.shareProfit)),
  }
}

export function getAgentCreditProfitP2pSection(): AgentProfitSection {
  return {
    nameHeader: 'P2P返利',
    amountHeader: '金额（实占）',
    rows: getEnabledP2pRebateGames().map((item) => sectionRow(item.key, item.name, 0)),
    total: sectionRow('p2p_sum', '合计', P2P_REBATE),
  }
}

export function getAgentCreditProfitEarnSection(agent: AgentRef, currency: string): AgentProfitSection {
  const book = bookOf(agent, currency)
  return {
    nameHeader: '代理赚水',
    amountHeader: '金额（利润）',
    rows: categoryBooks(book).map((item) => sectionRow(`earn_${item.key}`, item.label, item.earn)),
    total: sectionRow('rebate_earn', '合计', book.rebateNet),
  }
}

export function getAgentCreditProfitDialogDetail(
  agent: AgentRef,
  kind: AgentProfitDialogKind,
  currency: string,
): AgentProfitDialogDetailRow[] {
  const book = bookOf(agent, currency)
  const categories = categoryBooks(book)
  const row = (label: string, value: number, extra: Partial<AgentProfitDialogDetailRow> = {}) => ({
    label,
    amountText: formatAmount(value),
    tone: toneOf(value),
    ...extra,
  })
  const costRow = (label: string, value: number): AgentProfitDialogDetailRow => {
    const cell = costCell(value)
    return { label, amountText: cell.value, tone: cell.tone }
  }

  if (kind === 'total') {
    return [
      row('游戏净输赢', gameNet(book.shareProfit)),
      row('P2P返利', P2P_REBATE),
      row('代理赚水', book.rebateNet),
      row('总盈亏', book.net, { emphasize: true, formulaTip: AGENT_CREDIT_PROFIT_FORMULA }),
    ]
  }
  if (kind === 'net_pnl') {
    return [
      row('输赢', book.shareProfit),
      costRow('退水', ACTUAL_REBATE),
      costRow('场馆费', VENUE_FEE),
      row('实占净输赢', gameNet(book.shareProfit), {
        emphasize: true,
        formulaTip: AGENT_CREDIT_NET_PNL_DETAIL_FORMULA,
      }),
    ]
  }
  if (kind === 'p2p_rebate') {
    const section = getAgentCreditProfitP2pSection()
    return [
      ...section.rows.map((item) => ({ label: item.label, amountText: item.value, tone: item.tone })),
      row('P2P返利', P2P_REBATE, {
        emphasize: true,
        formulaTip: joinProfitSumFormula('P2P返利', section.rows.map((item) => item.label)),
      }),
    ]
  }
  if (kind === 'rebate_earn') {
    return [
      ...categories.map((item) => row(item.label, item.earn)),
      row('代理赚水', book.rebateNet, {
        emphasize: true,
        formulaTip: rebateEarnSumFormula(categories.map((item) => item.label)),
      }),
    ]
  }
  const earnCategory = parseEarnCategoryKey(kind)
  if (earnCategory) {
    const hit = categories.find((item) => item.key === earnCategory)
    return buildRebateEarnGameDetailRows(earnCategory, hit?.label ?? '合计', Math.abs(hit?.earn ?? 0))
  }
  const hit = categories.find((item) => item.key === kind)
  const win = hit?.win ?? 0
  return [
    { label: '下注有效金额', amountText: formatPlain(hit?.validBet ?? 0), tone: 'neutral' },
    row('输赢', win),
    costRow('退水', ACTUAL_REBATE),
    costRow('场馆费', VENUE_FEE),
    row('游戏净输赢', gameNet(win), { emphasize: true, formulaTip: AGENT_CREDIT_GAME_PROFIT_FORMULA }),
  ]
}

/** 场馆按固定权重分摊该大类数据（原型 Mock） */
const VENDOR_WEIGHTS = [0.4, 0.3, 0.2, 0.1]

/** 游戏数据：全部 / 大类 / 场馆，均由同一份大类账本拆出 */
export function getAgentCreditProfitDetail(
  agent: AgentRef,
  category: AgentProfitCategoryKey,
  vendor: AgentProfitVendorKey,
  currency: string,
): AgentProfitDetail {
  const book = bookOf(agent, currency)
  const categories = categoryBooks(book)
  const build = (title: string, validBet: number, win: number): AgentProfitDetail => {
    const net = gameNet(win)
    return {
      title,
      totalProfit: formatAmount(net),
      totalProfitTone: toneOf(net),
      rows: [
        { label: '下注有效金额', value: formatPlain(validBet), tone: 'neutral' },
        { label: '输赢', value: formatAmount(win), tone: toneOf(win) },
        { label: '退水', ...costCell(ACTUAL_REBATE) },
        { label: '场馆费', ...costCell(VENUE_FEE) },
      ],
    }
  }

  if (category === 'overall') return build('全部（实占）', book.validBet, book.shareProfit)

  const catLabel = AGENT_PROFIT_CATEGORY_TABS.find((item) => item.key === category)?.label ?? '明细'
  const hit = categories.find((item) => item.key === category)
  const validBet = hit?.validBet ?? 0
  const win = hit?.win ?? 0
  if (vendor === 'all') return build(`${catLabel}（实占）`, validBet, win)

  const vendors = AGENT_PROFIT_VENDORS[category].filter((item) => item.key !== 'all')
  const index = Math.max(0, vendors.findIndex((item) => item.key === vendor))
  const weights = VENDOR_WEIGHTS.slice(0, vendors.length)
  const weightSum = weights.reduce((acc, n) => acc + n, 0) || 1
  const shares = weights.map((n) => n / weightSum)
  const label = vendors[index]?.label ?? '明细'
  return build(
    `${label}（实占）`,
    splitByShares(validBet, shares)[index] ?? 0,
    splitByShares(win, shares)[index] ?? 0,
  )
}
