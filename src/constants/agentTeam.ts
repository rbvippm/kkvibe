/** 代理中心 · 团队管理 Mock */

export type TeamFilterTab =
  | 'all'
  | 'direct_agent'
  | 'direct_member'
  | 'credit_agent'
  | 'credit_member'

export type TeamMemberKind = 'me' | 'agent' | 'member' | 'credit_agent' | 'credit_member'

export type TeamListItem = {
  id: string
  nickname: string
  kind: TeamMemberKind
  avatarEmoji?: string
  subordinateCount: number
  vipLevel?: number
  expanded?: boolean
}

export const TEAM_FILTER_TABS: { key: TeamFilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'direct_agent', label: '直属代理' },
  { key: 'direct_member', label: '直属会员' },
  { key: 'credit_agent', label: '信用代理' },
  { key: 'credit_member', label: '信用会员' },
]

export const MOCK_TEAM_SELF: TeamListItem = {
  id: 'self',
  nickname: 'gg12345678',
  kind: 'me',
  avatarEmoji: '🧕',
  subordinateCount: 18,
  vipLevel: 2,
  expanded: true,
}

export const MOCK_TEAM_MEMBERS: TeamListItem[] = [
  {
    id: 'm1',
    nickname: 'oo12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm2',
    nickname: 'yy12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm3',
    nickname: 'pp12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm4',
    nickname: 'kk12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm5',
    nickname: 'll12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm6',
    nickname: 'mm12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm7',
    nickname: 'nn12300939',
    kind: 'member',
    subordinateCount: 18,
  },
  {
    id: 'm8',
    nickname: 'qq12300939',
    kind: 'member',
    subordinateCount: 18,
  },
]

export const MOCK_CREDIT_AGENTS: TeamListItem[] = [
  {
    id: 'ca1',
    nickname: '小红来了EZ1',
    kind: 'credit_agent',
    subordinateCount: 3,
    vipLevel: 2,
  },
  {
    id: 'ca2',
    nickname: 'mid_eyv4menuoax',
    kind: 'credit_agent',
    subordinateCount: 0,
    vipLevel: 1,
  },
]

export const MOCK_CREDIT_MEMBERS: TeamListItem[] = [
  {
    id: 'cm1',
    nickname: 'openapi31axy8',
    kind: 'credit_member',
    subordinateCount: 0,
  },
  {
    id: 'cm2',
    nickname: 'wa_da_da888',
    kind: 'credit_member',
    subordinateCount: 0,
  },
  {
    id: 'cm3',
    nickname: 'langxing888',
    kind: 'credit_member',
    subordinateCount: 0,
  },
]

export const MOCK_DIRECT_AGENTS: TeamListItem[] = [
  {
    id: 'a1',
    nickname: 'mid_eyv4menuoax',
    kind: 'agent',
    subordinateCount: 12,
    vipLevel: 1,
  },
  {
    id: 'a2',
    nickname: '小红来了EZ1',
    kind: 'agent',
    subordinateCount: 8,
    vipLevel: 2,
  },
]

export function filterTeamList(tab: TeamFilterTab): TeamListItem[] {
  const members = MOCK_TEAM_MEMBERS.map((m) => ({ ...m, kind: 'member' as const }))

  if (tab === 'all') {
    return [
      MOCK_TEAM_SELF,
      ...MOCK_DIRECT_AGENTS,
      ...members.slice(0, 4),
      ...MOCK_CREDIT_AGENTS.slice(0, 1),
      ...MOCK_CREDIT_MEMBERS.slice(0, 2),
    ]
  }
  if (tab === 'direct_agent') {
    return [MOCK_TEAM_SELF, ...MOCK_DIRECT_AGENTS]
  }
  if (tab === 'direct_member') {
    return [MOCK_TEAM_SELF, ...members]
  }
  if (tab === 'credit_agent') {
    return [MOCK_TEAM_SELF, ...MOCK_CREDIT_AGENTS]
  }
  return [MOCK_TEAM_SELF, ...MOCK_CREDIT_MEMBERS]
}

export function memberKindLabel(kind: TeamMemberKind) {
  if (kind === 'credit_member' || kind === 'member') return '信用'
  return ''
}

export function showMemberBadge(kind: TeamMemberKind) {
  return kind === 'member' || kind === 'credit_member'
}

export function showAgentSubordinateTag(item: TeamListItem) {
  return (
    item.kind === 'me' ||
    item.kind === 'agent' ||
    item.kind === 'credit_agent' ||
    item.subordinateCount > 0
  )
}

export function agentSubordinateLabel(count: number) {
  return `代(${count}人)`
}

/** 过滤后排除当前用户，供列表子级展示 */
export function getTeamChildren(tab: TeamFilterTab): TeamListItem[] {
  return filterTeamList(tab).filter((item) => item.id !== MOCK_TEAM_SELF.id)
}

export type CreateAccountOption = 'agent' | 'member' | 'member_credit'

export const CREATE_ACCOUNT_OPTIONS: { key: CreateAccountOption; label: string }[] = [
  { key: 'agent', label: '创建代理账户' },
  { key: 'member', label: '创建会员账户' },
  { key: 'member_credit', label: '会员账户授信' },
]

export const DEFAULT_CREATE_ACCOUNT_OPTION: CreateAccountOption = 'agent'
