import { filterTeamList, type TeamListItem } from './agentTeam'
import {
  formatCashWalletGroups,
  formatCreditReceivable,
  type AgentCashWalletRow,
  type AgentCreditCurrency,
  type AgentCreditLimitView,
} from './agentDetail'

export type MemberDetailTab = 'manage' | 'credit' | 'profit' | 'game' | 'login'

export type MemberGameSubTab = 'instant' | 'records' | 'stats'

export const MEMBER_DETAIL_TABS: { key: MemberDetailTab; label: string }[] = [
  { key: 'manage', label: '会员钱包' },
  { key: 'profit', label: '会员盈亏' },
  { key: 'game', label: '游戏数据' },
  { key: 'login', label: '充提记录' },
]

/** 已授信时默认展示「信用额度」总 Tab */
export const MEMBER_DETAIL_CREDIT_TAB: { key: MemberDetailTab; label: string } = {
  key: 'credit',
  label: '信用额度',
}

export function getMemberDetailTabs(
  isCredited: boolean,
): { key: MemberDetailTab; label: string }[] {
  if (!isCredited) return MEMBER_DETAIL_TABS
  return [MEMBER_DETAIL_TABS[0], MEMBER_DETAIL_CREDIT_TAB, ...MEMBER_DETAIL_TABS.slice(1)]
}

/** 游戏数据子 Tab */
export const MEMBER_GAME_SUB_TABS: { key: MemberGameSubTab; label: string }[] = [
  { key: 'instant', label: '即时注单' },
  { key: 'records', label: '注单记录' },
  { key: 'stats', label: '游戏统计' },
]

/** @deprecated 请使用 MEMBER_GAME_SUB_TABS */
export type MemberFlowSubTab = MemberGameSubTab
/** @deprecated 请使用 MEMBER_GAME_SUB_TABS */
export const MEMBER_FLOW_SUB_TABS = MEMBER_GAME_SUB_TABS

/** 与代理现金钱包同构：余额 / 充值金额 / 提款金额 */
export type MemberWalletRow = AgentCashWalletRow

export type MemberCreditLimitStats = {
  creditBalance: number
  creditUpTotal: number
  creditDownTotal: number
  /** 总授信额度 */
  creditQuotaTotal: number
}

export type MemberDetailProfile = {
  id: string
  nickname: string
  avatarEmoji: string
  lastLogin: string
  memberTag: string
  memberAccount: string
  superiorAgent: string
  /** 是否已开通信用（授信过才展示信用额度） */
  isCredited: boolean
  wallets: MemberWalletRow[]
  creditLimits: Record<AgentCreditCurrency, MemberCreditLimitStats>
  loginLog: {
    registeredAt: string
    lastLoginAt: string
  }
  summary: {
    totalBets: number
    validBetAmount: string
    cumulativeWinLose: string
    winLosePositive: boolean
  }
}

const DEFAULT_WALLETS: MemberWalletRow[] = [
  { currency: 'KKC', balance: '1,000', deposit: '2,400', withdraw: '800' },
  { currency: 'USDT', balance: '1,000', deposit: '560', withdraw: '220' },
  { currency: 'KKV', balance: '1,000', deposit: '1,280', withdraw: '460' },
]

/** 现金钱包：按 KKC / USDT / KKV 分卡（对齐代理详情） */
export function formatMemberCashWalletGroups(wallets?: MemberWalletRow[] | null) {
  return formatCashWalletGroups(wallets)
}

function buildMemberCreditLimits(scale: number): Record<AgentCreditCurrency, MemberCreditLimitStats> {
  const s = Math.max(1, scale)
  return {
    '信用额度-CNY': {
      creditBalance: s * 120,
      creditUpTotal: s * 820,
      creditDownTotal: s * 640,
      creditQuotaTotal: s * 1000,
    },
    '信用额度-USD': {
      creditBalance: s * 45,
      creditUpTotal: s * 310,
      creditDownTotal: s * 240,
      creditQuotaTotal: s * 375,
    },
  }
}

function formatCreditAmount(n: number) {
  return n.toLocaleString('zh-CN')
}

function scaleMemberSettle(stats: MemberCreditLimitStats, scale: number): MemberCreditLimitStats {
  if (scale === 1) return stats
  return {
    ...stats,
    creditUpTotal: Math.round(stats.creditUpTotal * scale),
    creditDownTotal: Math.round(stats.creditDownTotal * Math.min(1, scale + 0.04)),
  }
}

export function formatMemberCreditLimitView(
  stats: MemberCreditLimitStats,
  currency: AgentCreditCurrency,
  rangeScale = 1,
): AgentCreditLimitView {
  const settle = scaleMemberSettle(stats, rangeScale)
  const quota = Math.max(0, stats.creditQuotaTotal)
  const usedPercent = quota > 0 ? Math.round((stats.creditBalance / quota) * 100) : 0
  const net = settle.creditUpTotal - settle.creditDownTotal
  return {
    availableValue: formatCreditAmount(stats.creditBalance),
    quotaValue: formatCreditAmount(quota),
    usedPercent,
    usedPercentText: `~${usedPercent}%`,
    receivableValue: formatCreditReceivable(net, currency),
    receivablePositive: net >= 0,
    settleFlowRows: [
      { label: '上分总额:', value: formatCreditAmount(settle.creditUpTotal) },
      { label: '下分总额:', value: formatCreditAmount(settle.creditDownTotal) },
    ],
    settleResultRows: [
      {
        label: '上下分净额:',
        value: `${net >= 0 ? '+' : ''}${formatCreditAmount(net)}`,
        positive: net >= 0,
      },
    ],
  }
}

export function formatMemberCreditLimitRows(stats: MemberCreditLimitStats) {
  const net = stats.creditUpTotal - stats.creditDownTotal
  return [
    { label: '信用余额', value: formatCreditAmount(stats.creditBalance), positive: false },
    { label: '上分总额', value: formatCreditAmount(stats.creditUpTotal), positive: false },
    { label: '下分总额', value: formatCreditAmount(stats.creditDownTotal), positive: false },
    {
      label: '上下分净额',
      value: `${net >= 0 ? '+' : ''}${formatCreditAmount(net)}`,
      positive: net >= 0,
    },
  ]
}

const MOCK_DEFAULT_MEMBER: MemberDetailProfile = {
  id: 'default',
  nickname: 'fafa1231236789',
  avatarEmoji: '🧔🏻‍♂️',
  lastLogin: '2026-05-18 21:51:58',
  memberTag: '直属会员',
  memberAccount: 'fafa8888888',
  superiorAgent: 'PP231233',
  isCredited: false,
  wallets: DEFAULT_WALLETS,
  creditLimits: buildMemberCreditLimits(8),
  loginLog: {
    registeredAt: '2026-05-18 13:00:00',
    lastLoginAt: '2026-05-18 21:51:58',
  },
  summary: {
    totalBets: 5,
    validBetAmount: '¥6000',
    cumulativeWinLose: '+8000',
    winLosePositive: true,
  },
}

function mockDetailFromTeam(item: TeamListItem): MemberDetailProfile {
  const isCreditMember = item.kind === 'credit_member'
  return {
    id: item.id,
    nickname: item.nickname,
    avatarEmoji: item.avatarEmoji ?? '👤',
    lastLogin: '2026-04-12 09:30:00',
    memberTag: isCreditMember ? '信用会员' : '直属会员',
    memberAccount: item.nickname,
    superiorAgent: 'PP231233',
    isCredited: isCreditMember,
    wallets: DEFAULT_WALLETS,
    creditLimits: buildMemberCreditLimits(item.subordinateCount + 1),
    loginLog: {
      registeredAt: '2026-05-18 13:00:00',
      lastLoginAt: '2026-04-12 09:30:00',
    },
    summary: {
      totalBets: 3 + (item.subordinateCount % 5),
      validBetAmount: `¥${(item.subordinateCount + 1) * 500}`,
      cumulativeWinLose: item.subordinateCount % 2 === 0 ? '+1200' : '-350',
      winLosePositive: item.subordinateCount % 2 === 0,
    },
  }
}

export function findMemberDetail(id: string): MemberDetailProfile | null {
  if (!id) return MOCK_DEFAULT_MEMBER

  const found = filterTeamList('all').find((item) => item.id === id)
  if (!found) return MOCK_DEFAULT_MEMBER
  if (found.kind !== 'member' && found.kind !== 'credit_member') return null

  if (found.id === 'm1') {
    return { ...MOCK_DEFAULT_MEMBER, id: found.id, nickname: found.nickname, isCredited: false }
  }

  return mockDetailFromTeam(found)
}

export function isMemberTeamItem(item: TeamListItem) {
  return item.kind === 'member' || item.kind === 'credit_member'
}

/** 会员详情 · 充提记录：只保留充值 / 提现，币种只保留 KKC / KKV / USDT */
export type MemberFundType = 'recharge' | 'withdraw'

export type MemberFundCurrency = 'KKC' | 'KKV' | 'USDT'

export type MemberFundRecord = {
  id: string
  type: MemberFundType
  createdAt: string
  /** 充值为正，提现为负 */
  amount: number
  currency: MemberFundCurrency
}

export const MEMBER_FUND_TYPE_OPTIONS: { value: MemberFundType; label: string }[] = [
  { value: 'recharge', label: '充值' },
  { value: 'withdraw', label: '提现' },
]

export const MEMBER_FUND_CURRENCY_OPTIONS: { value: '' | MemberFundCurrency; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'KKC', label: 'KKC' },
  { value: 'KKV', label: 'KKV' },
  { value: 'USDT', label: 'USDT' },
]

export const MOCK_MEMBER_FUND_RECORDS: MemberFundRecord[] = [
  { id: 'mf-1', type: 'recharge', createdAt: '2026-06-24 10:20:18', amount: 200, currency: 'KKC' },
  { id: 'mf-2', type: 'withdraw', createdAt: '2026-06-23 16:08:42', amount: -50, currency: 'USDT' },
  { id: 'mf-3', type: 'recharge', createdAt: '2026-05-26 23:11:08', amount: 6.88, currency: 'KKC' },
  { id: 'mf-4', type: 'recharge', createdAt: '2026-05-26 22:01:33', amount: 6.88, currency: 'KKV' },
  { id: 'mf-5', type: 'withdraw', createdAt: '2026-05-20 18:33:12', amount: -128, currency: 'KKC' },
  { id: 'mf-6', type: 'recharge', createdAt: '2026-05-19 15:30:44', amount: 200, currency: 'USDT' },
  { id: 'mf-7', type: 'withdraw', createdAt: '2026-05-18 11:20:06', amount: -32, currency: 'KKV' },
  { id: 'mf-8', type: 'recharge', createdAt: '2026-05-15 10:05:21', amount: 66, currency: 'KKC' },
]

export function memberFundTypeLabel(type: MemberFundType) {
  return type === 'recharge' ? '充值' : '提现'
}

export function filterMemberFundRecords(
  records: MemberFundRecord[],
  options: { type?: MemberFundType | ''; currency?: MemberFundCurrency | ''; start?: string; end?: string },
) {
  return records
    .filter((row) => {
      if (options.type && row.type !== options.type) return false
      if (options.currency && row.currency !== options.currency) return false
      if (options.start && options.end) {
        const day = row.createdAt.slice(0, 10)
        if (day < options.start || day > options.end) return false
      }
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function groupMemberFundByMonth(records: MemberFundRecord[]) {
  const map = new Map<string, MemberFundRecord[]>()
  for (const row of records) {
    const month = row.createdAt.slice(0, 7)
    const list = map.get(month) ?? []
    list.push(row)
    map.set(month, list)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export const MEMBER_FUND_CURRENCIES: MemberFundCurrency[] = ['KKC', 'KKV', 'USDT']

export type MemberFundCurrencySummary = {
  currency: MemberFundCurrency
  recharge: number
  withdraw: number
  diff: number
}

function roundFundMoney(value: number) {
  return Math.round(value * 100) / 100
}

/** 按筛选后的流水汇总。充值额、提款额都取绝对值，充提差 = 充值额 − 提款额。 */
export function summarizeMemberFundByCurrency(
  records: MemberFundRecord[],
  currency: MemberFundCurrency | '' = '',
): MemberFundCurrencySummary[] {
  const currencies = currency ? [currency] : MEMBER_FUND_CURRENCIES
  return currencies.map((code) => {
    const rows = records.filter((row) => row.currency === code)
    const recharge = roundFundMoney(
      rows.filter((row) => row.type === 'recharge').reduce((sum, row) => sum + row.amount, 0),
    )
    const withdraw = roundFundMoney(
      rows.filter((row) => row.type === 'withdraw').reduce((sum, row) => sum + Math.abs(row.amount), 0),
    )
    return { currency: code, recharge, withdraw, diff: roundFundMoney(recharge - withdraw) }
  })
}

/** KKC / KKV 按人民币 1:1 展示购买详情；USDT 走链上转账详情 */
export const MEMBER_FUND_FIAT_UNIT_PRICE = 1

export type MemberFundFiatDetail = {
  heroAmount: string
  totalText: string
  unitPriceText: string
  quantityText: string
  method: string
  billNo: string
  createdAt: string
  paidAt: string
  completedAt: string
}

function formatFundQuantity(amount: number) {
  const abs = Math.abs(amount)
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(2)
}

function formatFundCny(amount: number) {
  return `¥ ${Math.abs(amount).toFixed(2)}`
}

function formatFundDotTime(createdAt: string) {
  return createdAt.replace(/-/g, '.')
}

function memberFundBillNo(id: string) {
  const digits = id.replace(/\D/g, '').padStart(4, '0')
  return `30931491225193${digits}`.slice(0, 18)
}

export function isMemberFundFiatDetail(record: MemberFundRecord) {
  return record.currency === 'KKC' || record.currency === 'KKV'
}

export type MemberFundUsdtDetail = {
  time: string
  actionLabel: string
  quantityText: string
  fromAddress: string
  toAddress: string
  fromShort: string
  toShort: string
  fromAmount: string
  toAmount: string
  network: string
  feeText: string
  txHash: string
}

const MEMBER_FUND_USDT_FROM = 'TCLgK89AnXbC9rewvhNb9UgXCc2qJJpBXh'
const MEMBER_FUND_USDT_TO = 'TDSz5GnsQDrXP3gh6WFC4atkZim5Y9ygQT'

function shortenChainAddress(address: string) {
  if (address.length <= 26) return address
  return `${address.slice(0, 13)}...${address.slice(-10)}`
}

export function getMemberFundUsdtDetail(record: MemberFundRecord): MemberFundUsdtDetail | null {
  if (record.currency !== 'USDT') return null
  const qty = formatFundQuantity(record.amount)
  const outgoing = record.amount < 0
  const fromAddress = outgoing ? MEMBER_FUND_USDT_FROM : MEMBER_FUND_USDT_TO
  const toAddress = outgoing ? MEMBER_FUND_USDT_TO : MEMBER_FUND_USDT_FROM
  const hashSeed = record.id.replace(/\D/g, '').padStart(2, '0')
  return {
    time: record.createdAt,
    actionLabel: outgoing ? '发送' : '收到',
    quantityText: `${qty} USDT`,
    fromAddress,
    toAddress,
    fromShort: shortenChainAddress(fromAddress),
    toShort: shortenChainAddress(toAddress),
    fromAmount: `-${qty}`,
    toAmount: `+${qty}`,
    network: 'Tron',
    feeText: '0 Trx',
    txHash: `69ee6e589683a29ef158c0d7ef286e49047b8f414786b551dfea16826271f4${hashSeed}`,
  }
}

export function getMemberFundFiatDetail(record: MemberFundRecord): MemberFundFiatDetail | null {
  if (!isMemberFundFiatDetail(record)) return null
  const qty = formatFundQuantity(record.amount)
  const total = Math.abs(record.amount) * MEMBER_FUND_FIAT_UNIT_PRICE
  const sign = record.amount > 0 ? '+' : record.amount < 0 ? '-' : ''
  const time = formatFundDotTime(record.createdAt)
  return {
    heroAmount: `${sign} ${qty} ${record.currency}`,
    totalText: formatFundCny(total),
    unitPriceText: formatFundCny(MEMBER_FUND_FIAT_UNIT_PRICE),
    quantityText: `${qty} ${record.currency}`,
    method: '银联',
    billNo: memberFundBillNo(record.id),
    createdAt: time,
    paidAt: time,
    completedAt: time,
  }
}
