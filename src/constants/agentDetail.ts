import { filterTeamList, MOCK_TEAM_SELF, type TeamListItem } from './agentTeam'

export type AgentDetailTab = 'wallet' | 'profit' | 'login'

export const AGENT_DETAIL_TABS: { key: AgentDetailTab; label: string }[] = [
  { key: 'wallet', label: '代理钱包' },
  { key: 'profit', label: '代理盈亏' },
  { key: 'login', label: '登录日志' },
]

export const AGENT_DETAIL_CURRENCIES = ['KKC', 'USDT', 'KKV'] as const

export const AGENT_WALLET_CURRENCY_OPTIONS = ['KKC', 'KKV', 'USDT', '信用额度'] as const

export type AgentWalletCurrency = (typeof AGENT_WALLET_CURRENCY_OPTIONS)[number]

export type AgentDetailProfile = {
  id: string
  nickname: string
  avatarEmoji: string
  lastLogin: string
  levelBadge: string
  stats: {
    agents: number
    directAgents: number
    members: number
    directMembers: number
  }
  wallets: { currency: string; balance: string }[]
  creditLimit: {
    creditBalance: number
    creditUpTotal: number
    creditDownTotal: number
    /** 占成比例 0-100 */
    shareRatio: number
  }
}

const MOCK_SELF_DETAIL: AgentDetailProfile = {
  id: 'self',
  nickname: 'OO1231236789',
  avatarEmoji: '🧔🏻‍♂️',
  lastLogin: '刚刚',
  levelBadge: '1级代理/我',
  stats: {
    agents: 18,
    directAgents: 16,
    members: 180,
    directMembers: 8,
  },
  wallets: [
    { currency: 'KKC', balance: '1,000' },
    { currency: 'USDT', balance: '1,000' },
    { currency: 'KKV', balance: '1,000' },
  ],
  creditLimit: {
    creditBalance: 866,
    creditUpTotal: 58000,
    creditDownTotal: 42000,
    shareRatio: 65,
  },
}

function mockDetailFromTeam(item: TeamListItem): AgentDetailProfile {
  const isAgent = item.kind === 'agent' || item.kind === 'me'
  const level = item.vipLevel ?? 1
  return {
    id: item.id,
    nickname: item.nickname,
    avatarEmoji: item.avatarEmoji ?? (isAgent ? '🧔🏻‍♂️' : '👤'),
    lastLogin: '2小时前',
    levelBadge: isAgent ? `${level}级代理` : '直属会员',
    stats: {
      agents: item.subordinateCount,
      directAgents: Math.max(0, item.subordinateCount - 2),
      members: item.subordinateCount * 10,
      directMembers: Math.max(0, item.subordinateCount - 10),
    },
    wallets: [
      { currency: 'KKC', balance: '500' },
      { currency: 'USDT', balance: '320' },
      { currency: 'KKV', balance: '180' },
    ],
    creditLimit: {
      creditBalance: item.subordinateCount * 200,
      creditUpTotal: item.subordinateCount * 1550,
      creditDownTotal: item.subordinateCount * 1030,
      shareRatio: Math.min(90, 45 + level * 5),
    },
  }
}

export function findAgentDetail(id: string): AgentDetailProfile | null {
  if (!id) return null
  if (id === MOCK_TEAM_SELF.id) return MOCK_SELF_DETAIL

  const found = filterTeamList('all').find((item) => item.id === id)
  if (found) return mockDetailFromTeam(found)

  return null
}
