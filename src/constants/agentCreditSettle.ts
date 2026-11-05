import type { AgentCreditCurrency } from './agentDetail'
import { getMemberCreditProfitBook } from './memberDetailProfit'
import { MEMBER_SETTLE_MOCK } from './memberSettleMock'
import { creditViewerId, findTeamItem, teamCreditAgents, teamCreditMembers } from './agentTeam'
import {
  computeCreditSettlement,
  sumSettleAmounts,
  type CreditSettleNodeInput,
  type CreditSettleNodeResult,
  type CreditSettleResult,
} from './creditSettleEngine'

/**
 * 信用代理中心 · 对账结算（Algorithm A）：平台 → 1级代理（我）→ 2级代理 → 会员
 * 占成：平台 30%、1级 40%、2级 30%；直属会员没有 2级，2级那份归 1级（我方 70%）。
 * 四层演示链：平台 30% → 我 40% → 2级 EZ2 20% → 3级 EZ3 10% → 会员 EZ_A；
 * 退水 平台→我 2%、我→EZ2 1.5%、EZ2→EZ3 1.2%、EZ3→会员 1%。
 * 单线收取：2级代理收会员全部，留下自己的实占游戏净输赢，其余交直属上级（我）；我再留下实占游戏净输赢，其余交平台。代理赚水由平台按天发放，不参与交收。
 * 退水总额 2%：平台不赚水（给我 2%），1级赚 0.5%（给 2级 1.5%），2级赚 0.5%（给会员 1%）；
 * 我的直属会员同样拿 1%，2级那份赚水归我。
 */
export const CREDIT_SETTLE_PLATFORM_NODE: CreditSettleNodeInput = {
  id: 'platform',
  name: '平台',
  ptPercent: 30,
  rebatePercent: 2,
}
export const CREDIT_SETTLE_SELF_ID = 'self'
export const CREDIT_SETTLE_SELF_PT = 40
export const CREDIT_SETTLE_SUB_AGENT_PT = 30
export const CREDIT_SETTLE_SELF_TOTAL_PT = CREDIT_SETTLE_SELF_PT + CREDIT_SETTLE_SUB_AGENT_PT
export const CREDIT_SETTLE_SELF_TO_AGENT_REBATE = 1.5
export const CREDIT_SETTLE_SELF_TO_MEMBER_REBATE = 1
export const CREDIT_SETTLE_SUB_AGENT_TO_MEMBER_REBATE = 1

/** 对账周期内下线会员的投注汇总（已结算注单，按下注时快照归属链路） */
export type CreditSettleBook = {
  validBet: number
  memberWinLose: number
  /** 会员退水金额；不传则按直属代理退水率计算 */
  memberRebate?: number
}

export type CreditSettleSubAgentProfile = {
  books: Record<AgentCreditCurrency, CreditSettleBook>
  /** 取会员固定 Mock 的账本不随对账日期缩放，与贵宾厅、会员盈亏保持一致 */
  fixed?: boolean
}

export type CreditSettleMemberProfile = {
  books: Record<AgentCreditCurrency, CreditSettleBook>
}

/** 名下会员都取贵宾厅数据的代理（EZ1 名下只有会员 EZ；EZ2 → EZ3 名下只有会员 EZ_A，同一组账本） */
const VIP_BACKED_SUB_AGENT_IDS = new Set(['ca1', 'ca2', 'ca3'])

/** 四层演示链（EZ2 → EZ3 → EZ_A）单独讲解，不计入一级代理EZ自身的交收 / 盈亏汇总，保留 EZ → EZ1 → 一级代理EZ 的闭环 */
const SELF_SUMMARY_EXCLUDED_AGENT_IDS = new Set(['ca2'])

/** 各级代理占成与「给直属下级的退水率」；未配置的下级代理按 2级默认值 */
const CREDIT_SETTLE_AGENT_CONFIG: Record<string, { ptPercent: number; rebatePercent: number }> = {
  ca2: { ptPercent: 20, rebatePercent: 1.2 },
  ca3: { ptPercent: 10, rebatePercent: CREDIT_SETTLE_SUB_AGENT_TO_MEMBER_REBATE },
}

export function creditAgentShareRatio(id: string) {
  return CREDIT_SETTLE_AGENT_CONFIG[id]?.ptPercent ?? CREDIT_SETTLE_SUB_AGENT_PT
}

/**
 * 代理所在的下注链路（不含平台与我）：从我的直属代理一路到该代理；
 * 该代理还有下级代理时，继续向下延伸到直接挂会员的那一级（原型每条线只有一个会员）
 */
function creditAgentLine(id: string, name: string): { id: string; name: string }[] {
  const hit = findTeamItem(id)
  if (!hit) return [{ id, name }]
  const line = hit.path.filter((node) => node.kind === 'credit_agent')
  let tail = hit.item
  for (;;) {
    const next = tail.children?.find((node) => node.kind === 'credit_agent')
    if (!next) break
    line.push(next)
    tail = next
  }
  return line.map((node) => ({ id: node.id, name: node.nickname }))
}

export function isCreditSubAgentFixed(id: string) {
  return VIP_BACKED_SUB_AGENT_IDS.has(id)
}

function idSeed(id: string) {
  return [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

/** 新开的信用下线按 ID 生成稳定 Mock，保证刷新前后数值一致 */
function fallbackBooks(id: string): Record<AgentCreditCurrency, CreditSettleBook> {
  const seed = idSeed(id)
  const cnyBet = 2000 + (seed % 7) * 600
  const usdBet = 300 + (seed % 5) * 120
  const sign = seed % 3 === 0 ? 1 : -1
  return {
    '信用额度-CNY': { validBet: cnyBet, memberWinLose: sign * Math.round(cnyBet * 0.22) },
    '信用额度-USD': { validBet: usdBet, memberWinLose: -sign * Math.round(usdBet * 0.18) },
  }
}

export function getCreditSubAgentProfile(id: string): CreditSettleSubAgentProfile {
  if (isCreditSubAgentFixed(id)) return { books: getCreditMemberProfile().books, fixed: true }
  return { books: fallbackBooks(id) }
}

/** 直属会员交收数据取自会员详情「会员盈亏」：游戏输赢 = 会员输赢，会员退水按金额直接入账 */
function memberBookFromProfit(currency: AgentCreditCurrency): CreditSettleBook {
  const { gameProfit, memberRebate } = getMemberCreditProfitBook(currency)
  return {
    validBet: MEMBER_SETTLE_MOCK.validBet,
    memberWinLose: gameProfit,
    memberRebate,
  }
}

export function getCreditMemberProfile(): CreditSettleMemberProfile {
  return {
    books: {
      '信用额度-CNY': memberBookFromProfit('信用额度-CNY'),
      '信用额度-USD': memberBookFromProfit('信用额度-USD'),
    },
  }
}

function scaleBook(book: CreditSettleBook, scale: number): CreditSettleBook {
  if (scale === 1) return book
  return {
    validBet: Math.round(book.validBet * scale * 100) / 100,
    memberWinLose: Math.round(book.memberWinLose * scale * 100) / 100,
  }
}

function subAgentChain(book: CreditSettleBook, id: string, name: string) {
  return computeCreditSettlement({
    ...book,
    nodes: [
      CREDIT_SETTLE_PLATFORM_NODE,
      {
        id: CREDIT_SETTLE_SELF_ID,
        name: '我',
        ptPercent: CREDIT_SETTLE_SELF_PT,
        rebatePercent: CREDIT_SETTLE_SELF_TO_AGENT_REBATE,
      },
      ...creditAgentLine(id, name).map((node) => ({
        ...node,
        ptPercent: creditAgentShareRatio(node.id),
        rebatePercent:
          CREDIT_SETTLE_AGENT_CONFIG[node.id]?.rebatePercent ?? CREDIT_SETTLE_SUB_AGENT_TO_MEMBER_REBATE,
      })),
    ],
  })
}

export function settleSubAgentChain(
  id: string,
  name: string,
  currency: AgentCreditCurrency,
  rangeScale = 1,
) {
  const profile = getCreditSubAgentProfile(id)
  const book = profile.fixed ? profile.books[currency] : scaleBook(profile.books[currency], rangeScale)
  return subAgentChain(book, id, name)
}

/** 会员盈亏不随日期缩放，交收同口径，保证两个 Tab 数值一致 */
export function settleDirectMemberChain(currency: AgentCreditCurrency) {
  const book = getCreditMemberProfile().books[currency]
  return computeCreditSettlement({
    ...book,
    nodes: [
      CREDIT_SETTLE_PLATFORM_NODE,
      {
        id: CREDIT_SETTLE_SELF_ID,
        name: '我',
        ptPercent: CREDIT_SETTLE_SELF_TOTAL_PT,
        rebatePercent: CREDIT_SETTLE_SELF_TO_MEMBER_REBATE,
      },
    ],
  })
}

function nodeOf(result: CreditSettleResult, id: string) {
  const node = result.nodes.find((item) => item.id === id)
  if (!node) throw new Error(`结算链路缺少节点 ${id}`)
  return node
}

/* ---------------- 展示层 ---------------- */

/** 原型信用 Mock 未接入 P2P 牌局抽水，与代理盈亏「P2P返利」同为 0 */
const CREDIT_P2P_REBATE_MOCK = 0

export type CreditSettleTone = 'positive' | 'negative' | 'neutral'

export type CreditSettleRow = {
  label: string
  value: string
  tone?: CreditSettleTone
  /** 行下方灰色拆解说明 */
  hint?: string
  /** 合计行加粗 */
  total?: boolean
  /** 可点击行：跳转下线详情 */
  link?: { kind: 'agent' | 'member'; id: string }
}

export type CreditSettleSection = {
  title: string
  /** 标题右侧灰色说明 */
  hint?: string
  rows: CreditSettleRow[]
}

export type CreditSettlePanel = {
  heroLabel: string
  heroValue: string
  /** true = 我方收钱（绿底），false = 我方付钱（粉底） */
  heroPositive: boolean
  heroFormula: string
  sections: CreditSettleSection[]
}

export type CreditTransferStats = {
  creditUpTotal: number
  creditDownTotal: number
}

function currencySymbol(currency: AgentCreditCurrency) {
  return currency === '信用额度-USD' ? '$' : '¥'
}

function plain(n: number) {
  return Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function signed(n: number) {
  if (Math.abs(n) < 0.005) return '0.00'
  return `${n > 0 ? '+' : '-'}${plain(n)}`
}

function money(n: number, currency: AgentCreditCurrency) {
  return `${currencySymbol(currency)}${plain(n)}`
}

function tone(n: number): CreditSettleTone {
  if (Math.abs(n) < 0.005) return 'neutral'
  return n > 0 ? 'positive' : 'negative'
}

/** 上下分仅为额度调拨，单列展示、不进入交收公式 */
export function buildCreditTransferSection(stats: CreditTransferStats): CreditSettleSection {
  const net = stats.creditUpTotal - stats.creditDownTotal
  return {
    title: '上下分',
    hint: '额度调拨，不参与交收',
    rows: [
      { label: '上分总额', value: plain(stats.creditUpTotal) },
      { label: '下分总额', value: plain(stats.creditDownTotal) },
      { label: '上下分净额', value: signed(net), tone: tone(net), total: true },
    ],
  }
}

/**
 * 代理查看下级代理：上级应收下级 = 下级应收下线 − 下级实占游戏净输赢 − 下级实占P2P返利
 * - 直属代理：由我方与其交收（我方应收下级）
 * - 跨层级代理（如 3级 EZ3）：由我的下级代理（其直属上级）交收（下级代理应收下级）
 */
export function buildSubAgentSettlePanel(
  sub: { id: string; name: string },
  currency: AgentCreditCurrency,
  transfer: CreditTransferStats,
  rangeScale = 1,
): CreditSettlePanel {
  const result = settleSubAgentChain(sub.id, sub.name, currency, rangeScale)
  const index = result.nodes.findIndex((item) => item.id === sub.id)
  const child = nodeOf(result, sub.id)
  const parent = result.nodes[index - 1]
  const party = !parent || parent.id === CREDIT_SETTLE_SELF_ID ? '我方' : '下级代理'
  const p2pRebate = CREDIT_P2P_REBATE_MOCK
  const amount = sumSettleAmounts([child.payable, -p2pRebate])
  return {
    heroLabel: amount >= 0 ? `${party}应收下级` : `${party}应付下级`,
    heroValue: money(amount, currency),
    heroPositive: amount >= 0,
    heroFormula: '下级应收下线 − 下级实占游戏净输赢 − 下级实占P2P返利',
    sections: [
      {
        title: '交收依据',
        rows: [
          { label: '团队有效投注', value: plain(result.validBet) },
          {
            label: '团队会员输赢',
            value: signed(result.memberWinLose),
            tone: tone(result.memberWinLose),
          },
          {
            label: '团队会员退水',
            value: signed(result.member.rebate),
            tone: tone(result.member.rebate),
          },
          {
            label: '下级应收下线',
            value: signed(child.receivable),
            tone: tone(child.receivable),
          },
          {
            label: '下级实占游戏净输赢',
            value: signed(child.shareProfit),
            tone: tone(child.shareProfit),
          },
          {
            label: '下级实占P2P返利',
            value: signed(p2pRebate),
            tone: tone(p2pRebate),
          },
          {
            label: amount >= 0 ? `${party}应收下级` : `${party}应付下级`,
            value: plain(amount),
            tone: tone(amount),
            hint: party === '下级代理' && parent ? `由 ${parent.name} 与 ${sub.name} 交收` : undefined,
            total: true,
          },
        ],
      },
      buildCreditTransferSection(transfer),
    ],
  }
}

/**
 * 代理查看会员：口径对齐「会员盈亏」Tab，会员盈亏为正应付、为负应收
 * - 直属会员：由我方与会员交收
 * - 2级代理名下会员（传 superior）：由该 2级代理与会员交收
 * - 查看会员只看与会员的交收，不展示代理本线收益（代理收益到代理详情 / 我的报表 · 交收查看）
 */
export function buildDirectMemberSettlePanel(
  currency: AgentCreditCurrency,
  transfer: CreditTransferStats,
  superior?: { id: string; name: string },
  viewerId: string = CREDIT_SETTLE_SELF_ID,
): CreditSettlePanel {
  const result = superior
    ? subAgentChain(getCreditMemberProfile().books[currency], superior.id, superior.name)
    : settleDirectMemberChain(currency)
  /** 以 2级代理身份查看自己的直属会员：本线即该 2级代理 */
  const viewerIsSuperior = Boolean(superior && superior.id === viewerId)
  const me = nodeOf(result, viewerIsSuperior && superior ? superior.id : CREDIT_SETTLE_SELF_ID)
  const child = superior && !viewerIsSuperior ? nodeOf(result, superior.id) : null
  const amount = child ? child.receivable : me.receivable
  const party = child ? '下级代理' : '我方'
  return {
    heroLabel: amount >= 0 ? `${party}应收会员` : `${party}应付会员`,
    heroValue: money(amount, currency),
    heroPositive: amount >= 0,
    heroFormula: `会员盈亏为正${party}应付，为负${party}应收`,
    sections: [
      {
        title: '交收依据',
        hint: '同会员盈亏',
        rows: [
          { label: '会员有效投注', value: plain(result.validBet) },
          {
            label: '游戏输赢',
            value: signed(result.memberWinLose),
            tone: tone(result.memberWinLose),
          },
          {
            label: '会员退水',
            value: signed(result.member.rebate),
            tone: tone(result.member.rebate),
          },
          {
            label: '会员盈亏',
            value: signed(result.member.net),
            tone: tone(result.member.net),
            total: true,
          },
          {
            label: amount >= 0 ? `${party}应收会员` : `${party}应付会员`,
            value: plain(amount),
            tone: tone(amount),
            hint: superior && child ? `由 ${superior.name} 与会员交收` : undefined,
            total: true,
          },
        ],
      },
      buildCreditTransferSection(transfer),
    ],
  }
}

export type CreditSuperiorSettleLine = {
  id: string
  name: string
  kind: 'agent' | 'member'
  result: CreditSettleResult
  me: CreditSettleNodeResult
}

export type CreditSuperiorSettleSummary = {
  lines: CreditSuperiorSettleLine[]
  receivable: number
  shareProfit: number
  rebateIn: number
  rebateOut: number
  rebateNet: number
  net: number
  /** 我的实占P2P返利：P2P 牌局抽水按 P2P返利占成分给各级，代理留下自己那份，不往上交 */
  p2pRebate: number
  /** 应付上级 = 应收下线合计 − 我的实占游戏净输赢 − 我的实占P2P返利 */
  payable: number
}


function summarizeLines(lines: CreditSuperiorSettleLine[]): CreditSuperiorSettleSummary {
  const sum = (pick: (me: CreditSettleNodeResult) => number) => sumSettleAmounts(lines.map((line) => pick(line.me)))
  return {
    lines,
    receivable: sum((me) => me.receivable),
    shareProfit: sum((me) => me.shareProfit),
    rebateIn: sum((me) => me.rebateIn),
    rebateOut: sum((me) => me.rebateOut),
    rebateNet: sum((me) => me.rebateNet),
    net: sum((me) => me.net),
    p2pRebate: CREDIT_P2P_REBATE_MOCK,
    payable: sumSettleAmounts([sum((me) => me.payable), -CREDIT_P2P_REBATE_MOCK]),
  }
}

/** 代理交收上级：逐条下注链路结算后，汇总「我」节点 */
export function summarizeSuperiorSettle(
  currency: AgentCreditCurrency,
  rangeScale = 1,
  downline: { agents?: { id: string; nickname: string }[]; members?: { id: string; nickname: string }[] } = {},
): CreditSuperiorSettleSummary {
  const agents =
    downline.agents ?? teamCreditAgents.value.filter((item) => !SELF_SUMMARY_EXCLUDED_AGENT_IDS.has(item.id))
  const members = downline.members ?? teamCreditMembers.value
  return summarizeLines([
    ...agents.map((item) => {
      const result = settleSubAgentChain(item.id, item.nickname, currency, rangeScale)
      return { id: item.id, name: item.nickname, kind: 'agent' as const, result, me: nodeOf(result, CREDIT_SETTLE_SELF_ID) }
    }),
    ...members.map((item) => {
      const result = settleDirectMemberChain(currency)
      return { id: item.id, name: item.nickname, kind: 'member' as const, result, me: nodeOf(result, CREDIT_SETTLE_SELF_ID) }
    }),
  ])
}

/** 2级代理（Mock 身份）交收直属上级：名下每个会员一条链路，汇总该 2级代理节点 */
export function summarizeSubAgentSuperiorSettle(
  sub: { id: string; name: string },
  members: { id: string; nickname: string }[],
  currency: AgentCreditCurrency,
): CreditSuperiorSettleSummary {
  const memberBook = getCreditMemberProfile().books[currency]
  return summarizeLines(
    members.map((item) => {
      const book = isCreditSubAgentFixed(sub.id) ? memberBook : fallbackBooks(item.id)[currency]
      const result = subAgentChain(book, sub.id, sub.name)
      return { id: item.id, name: item.nickname, kind: 'member' as const, result, me: nodeOf(result, sub.id) }
    }),
  )
}

/** 代理盈亏 / 游戏数据与对账结算同源：该代理节点在全部下线链路上的汇总 */
export type CreditAgentProfitBook = {
  /** 团队有效投注、团队会员输赢（会员视角，赢为正） */
  validBet: number
  memberWinLose: number
  /** 交收「实占游戏净输赢」= 代理盈亏「实占游戏输赢」 */
  shareProfit: number
  /** 赚水 = 收上级退水 − 付下级退水 = 代理赚水 */
  rebateNet: number
  /** 净盈亏 = 总盈亏 */
  net: number
  creditUp: number
  creditDown: number
}

export function getCreditAgentProfitBook(
  agent: { id: string; name: string },
  currency: AgentCreditCurrency,
): CreditAgentProfitBook {
  let summary: CreditSuperiorSettleSummary
  if (agent.id === CREDIT_SETTLE_SELF_ID) {
    summary = summarizeSuperiorSettle(currency)
  } else if (agent.id === creditViewerId.value) {
    summary = summarizeSubAgentSuperiorSettle(agent, findTeamItem(agent.id)?.item.children ?? [], currency)
  } else {
    const result = settleSubAgentChain(agent.id, agent.name, currency)
    summary = summarizeLines([
      { id: agent.id, name: agent.name, kind: 'agent', result, me: nodeOf(result, agent.id) },
    ])
  }
  const sumResult = (pick: (result: CreditSettleResult) => number) =>
    sumSettleAmounts(summary.lines.map((line) => pick(line.result)))
  const validBet = sumResult((result) => result.validBet)
  /** 贵宾厅会员按钱包累计上下分；新开下线按投注量生成稳定 Mock */
  const isVipBacked = summary.lines.every(
    (line) => line.kind === 'member' || isCreditSubAgentFixed(line.id),
  )
  return {
    validBet,
    memberWinLose: sumResult((result) => result.memberWinLose),
    shareProfit: summary.shareProfit,
    rebateNet: summary.rebateNet,
    net: summary.net,
    creditUp: isVipBacked ? MEMBER_SETTLE_MOCK.creditUp * summary.lines.length : Math.round(validBet * 0.3),
    creditDown: isVipBacked ? MEMBER_SETTLE_MOCK.creditDown * summary.lines.length : Math.round(validBet * 0.1),
  }
}

export function buildSuperiorSettlePanel(
  summary: CreditSuperiorSettleSummary,
  currency: AgentCreditCurrency,
  transfer: CreditTransferStats,
): CreditSettlePanel {
  const amount = summary.payable
  return {
    heroLabel: amount >= 0 ? '我方应付上级' : '我方应收上级',
    heroValue: money(amount, currency),
    heroPositive: amount <= 0,
    heroFormula: '应收下线合计 − 我的实占游戏净输赢 − 我的实占P2P返利',
    sections: [
      {
        title: '交收结果',
        hint: summary.lines.length ? undefined : '所选时间段暂无信用下线注单',
        rows: [
          { label: '应收下线合计', value: signed(summary.receivable), tone: tone(summary.receivable) },
          { label: '我的实占游戏净输赢', value: signed(summary.shareProfit), tone: tone(summary.shareProfit) },
          { label: '我的实占P2P返利', value: signed(summary.p2pRebate), tone: tone(summary.p2pRebate) },
          {
            label: amount >= 0 ? '我方应付上级' : '我方应收上级',
            value: plain(amount),
            tone: amount >= 0 ? 'negative' : 'positive',
            total: true,
          },
        ],
      },
      buildCreditTransferSection(transfer),
    ],
  }
}
