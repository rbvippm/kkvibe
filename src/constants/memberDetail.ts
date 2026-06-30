import { filterTeamList, type TeamListItem } from './agentTeam'

export type MemberDetailTab = 'manage' | 'flow' | 'login'

export type MemberFlowSubTab = 'instant' | 'records' | 'profit'

export const MEMBER_DETAIL_TABS: { key: MemberDetailTab; label: string }[] = [
  { key: 'manage', label: '会员钱包' },
  { key: 'flow', label: '账户流水' },
  { key: 'login', label: '登录日志' },
]

export const MEMBER_FLOW_SUB_TABS: { key: MemberFlowSubTab; label: string }[] = [
  { key: 'instant', label: '即时注单' },
  { key: 'records', label: '注单记录' },
  { key: 'profit', label: '盈亏数据' },
]

export type MemberWalletRow = {
  currency: string
  balance: string
}

export type MemberDetailProfile = {
  id: string
  nickname: string
  avatarEmoji: string
  lastLogin: string
  memberTag: string
  memberAccount: string
  superiorAgent: string
  wallets: MemberWalletRow[]
  creditLimit: {
    creditBalance: number
    creditUpTotal: number
    creditDownTotal: number
  }
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
  { currency: 'KKC', balance: '1,000' },
  { currency: 'USDT', balance: '1,000' },
  { currency: 'KKV', balance: '1,000' },
]

const MOCK_DEFAULT_MEMBER: MemberDetailProfile = {
  id: 'default',
  nickname: 'fafa1231236789',
  avatarEmoji: '🧔🏻‍♂️',
  lastLogin: '2026-05-18',
  memberTag: '直属会员',
  memberAccount: 'fafa8888888',
  superiorAgent: 'PP231233',
  wallets: DEFAULT_WALLETS,
  creditLimit: {
    creditBalance: 866,
    creditUpTotal: 12800,
    creditDownTotal: 9600,
  },
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
    wallets: DEFAULT_WALLETS,
    creditLimit: {
      creditBalance: (item.subordinateCount + 1) * 120,
      creditUpTotal: (item.subordinateCount + 1) * 820,
      creditDownTotal: (item.subordinateCount + 1) * 640,
    },
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

  if (found.id === 'm1') return { ...MOCK_DEFAULT_MEMBER, id: found.id }

  return mockDetailFromTeam(found)
}

export function isMemberTeamItem(item: TeamListItem) {
  return item.kind === 'member' || item.kind === 'credit_member'
}
