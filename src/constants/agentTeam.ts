/** 代理中心 · 团队管理 Mock */

export type TeamFilterTab = 'all' | 'direct_agent' | 'direct_member' | 'xcoin_member'

export type TeamMemberKind = 'me' | 'agent' | 'member' | 'xcoin_member'

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
  { key: 'xcoin_member', label: 'x币会员' },
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

export const MOCK_XCOIN_TEAM_MEMBERS: TeamListItem[] = [
  {
    id: 'x1',
    nickname: 'openapi31axy8',
    kind: 'xcoin_member',
    subordinateCount: 0,
  },
  {
    id: 'x2',
    nickname: '小红来了EZ1',
    kind: 'xcoin_member',
    subordinateCount: 3,
  },
  {
    id: 'x3',
    nickname: 'mid_eyv4menuoax',
    kind: 'xcoin_member',
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
  const members =
    tab === 'xcoin_member'
      ? MOCK_XCOIN_TEAM_MEMBERS
      : MOCK_TEAM_MEMBERS.map((m) => ({ ...m, kind: 'member' as const }))

  if (tab === 'all') {
    return [MOCK_TEAM_SELF, ...MOCK_DIRECT_AGENTS, ...members.slice(0, 4), ...MOCK_XCOIN_TEAM_MEMBERS.slice(0, 2)]
  }
  if (tab === 'direct_agent') {
    return [MOCK_TEAM_SELF, ...MOCK_DIRECT_AGENTS]
  }
  if (tab === 'direct_member') {
    return [MOCK_TEAM_SELF, ...members]
  }
  return [MOCK_TEAM_SELF, ...MOCK_XCOIN_TEAM_MEMBERS]
}

export function memberKindLabel(kind: TeamMemberKind) {
  if (kind === 'xcoin_member' || kind === 'member') return 'x币'
  return ''
}

export function showMemberBadge(kind: TeamMemberKind) {
  return kind === 'member' || kind === 'xcoin_member'
}

export function showAgentSubordinateTag(item: TeamListItem) {
  return item.kind === 'me' || item.kind === 'agent' || item.subordinateCount > 0
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
