import { filterTeamList, type TeamListItem } from './agentTeam'

export type MemberDetailTab = 'manage' | 'flow'

export type MemberFlowSubTab = 'instant' | 'records' | 'profit' | 'xcoin'

export const MEMBER_DETAIL_TABS: { key: MemberDetailTab; label: string }[] = [
  { key: 'manage', label: '会员管理' },
  { key: 'flow', label: '账户流水' },
]

export const MEMBER_FLOW_SUB_TABS: { key: MemberFlowSubTab; label: string }[] = [
  { key: 'instant', label: '即时注单' },
  { key: 'records', label: '注单记录' },
  { key: 'profit', label: '盈亏数据' },
  { key: 'xcoin', label: 'x币统计' },
]

export type MemberDetailProfile = {
  id: string
  nickname: string
  avatarEmoji: string
  lastLogin: string
  memberTag: string
  memberAccount: string
  superiorAgent: string
  summary: {
    totalBets: number
    validBetAmount: string
    cumulativeWinLose: string
    winLosePositive: boolean
  }
  xcoinStats: {
    creditUpTotal: number
    creditDownTotal: number
  }
}

const MOCK_DEFAULT_MEMBER: MemberDetailProfile = {
  id: 'default',
  nickname: 'fafa1231236789',
  avatarEmoji: '🧔🏻‍♂️',
  lastLogin: '2026-05-18',
  memberTag: '直属会员',
  memberAccount: 'fafa8888888',
  superiorAgent: 'PP231233',
  summary: {
    totalBets: 5,
    validBetAmount: '¥6000',
    cumulativeWinLose: '+8000',
    winLosePositive: true,
  },
  xcoinStats: {
    creditUpTotal: 12800,
    creditDownTotal: 9600,
  },
}

function mockDetailFromTeam(item: TeamListItem): MemberDetailProfile {
  const isXcoin = item.kind === 'xcoin_member'
  return {
    id: item.id,
    nickname: item.nickname,
    avatarEmoji: item.avatarEmoji ?? '👤',
    lastLogin: '2026-04-12',
    memberTag: isXcoin ? 'x币会员' : '直属会员',
    memberAccount: item.nickname,
    superiorAgent: 'PP231233',
    summary: {
      totalBets: 3 + (item.subordinateCount % 5),
      validBetAmount: `¥${(item.subordinateCount + 1) * 500}`,
      cumulativeWinLose: item.subordinateCount % 2 === 0 ? '+1200' : '-350',
      winLosePositive: item.subordinateCount % 2 === 0,
    },
    xcoinStats: {
      creditUpTotal: (item.subordinateCount + 1) * 820,
      creditDownTotal: (item.subordinateCount + 1) * 640,
    },
  }
}

export function findMemberDetail(id: string): MemberDetailProfile | null {
  if (!id) return MOCK_DEFAULT_MEMBER

  const found = filterTeamList('all').find((item) => item.id === id)
  if (!found) return MOCK_DEFAULT_MEMBER
  if (found.kind !== 'member' && found.kind !== 'xcoin_member') return null

  if (found.id === 'm1') return { ...MOCK_DEFAULT_MEMBER, id: found.id }

  return mockDetailFromTeam(found)
}

export function isMemberTeamItem(item: TeamListItem) {
  return item.kind === 'member' || item.kind === 'xcoin_member'
}
