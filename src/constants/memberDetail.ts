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
  { key: 'login', label: '登录日志' },
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
  lastLogin: '2026-05-18',
  memberTag: '直属会员',
  memberAccount: 'fafa8888888',
  superiorAgent: 'PP231233',
  isCredited: false,
  wallets: DEFAULT_WALLETS,
  creditLimits: buildMemberCreditLimits(8),
  loginLog: {
    registeredAt: '2026-05-18 21:51:58',
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
    lastLogin: '2026-04-12',
    memberTag: isCreditMember ? '信用会员' : '直属会员',
    memberAccount: item.nickname,
    superiorAgent: 'PP231233',
    isCredited: isCreditMember,
    wallets: DEFAULT_WALLETS,
    creditLimits: buildMemberCreditLimits(item.subordinateCount + 1),
    loginLog: {
      registeredAt: '2026-05-18 21:51:58',
      lastLoginAt: '2026-05-18 21:51:58',
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
