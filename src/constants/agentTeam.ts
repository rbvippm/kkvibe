/** 代理中心 · 团队管理 Mock（树结构对齐 Figma 1433:19431） */

import { ref } from 'vue'

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
  /** 代理备注（优先于昵称展示/带入注单查询） */
  remark?: string
  /** 金刚号 */
  kingkongId?: string
  /** 下级代理人数（展示「代(n人)」） */
  subordinateCount: number
  /** 下级会员人数（展示「会(n人)」） */
  memberCount?: number
  vipLevel?: number
  online?: boolean
  expanded?: boolean
  children?: TeamListItem[]
}

/** 带入注单查询：备注 → 昵称 → 金刚号（与注单会员展示口径一致） */
export function formatTeamMemberBetSearchKeyword(item: TeamListItem): string {
  const remark = item.remark?.trim()
  if (remark) return remark
  const nickname = item.nickname?.trim()
  if (nickname) return nickname
  const kingkongId = item.kingkongId?.trim()
  if (kingkongId) return kingkongId
  return item.id
}

export type TeamTreeRow =
  | {
      type: 'node'
      item: TeamListItem
      depth: number
      hasChildren: boolean
      /** 是否为本层最后一个可见节点（用于树连线） */
      isLast: boolean
      /** 祖先层是否为各自末节点 */
      ancestorLastFlags: boolean[]
    }
  | {
      type: 'more'
      parentId: string
      depth: number
      remaining: number
      isLast: boolean
      ancestorLastFlags: boolean[]
    }

export const TEAM_FILTER_TABS: { key: TeamFilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'direct_agent', label: '直属代理' },
  { key: 'direct_member', label: '直属会员' },
  { key: 'credit_agent', label: '信用代理' },
  { key: 'credit_member', label: '信用会员' },
]

/** 每层默认展示条数，超出显示「查看更多」（2 即可演示，Mock 更精简） */
export const TEAM_TREE_DEFAULT_VISIBLE = 2

export const MOCK_TEAM_SELF: TeamListItem = {
  id: 'self',
  nickname: 'gg12345678',
  kind: 'me',
  avatarEmoji: '🧕',
  subordinateCount: 2,
  memberCount: 3,
  vipLevel: 2,
  online: true,
  expanded: true,
}

/** 直属会员 */
export const MOCK_TEAM_MEMBERS: TeamListItem[] = [
  {
    id: 'm1',
    nickname: 'oo12300939',
    kind: 'member',
    avatarEmoji: '👨🏻',
    kingkongId: '12300939',
    subordinateCount: 0,
    online: true,
  },
]

/** 信用代理 */
export const MOCK_CREDIT_AGENTS: TeamListItem[] = [
  {
    id: 'ca1',
    nickname: '小红来了EZ1',
    kind: 'credit_agent',
    avatarEmoji: '🧔🏻‍♂️',
    subordinateCount: 3,
    memberCount: 8,
    vipLevel: 2,
    online: true,
  },
]

/** 信用会员 */
export const MOCK_CREDIT_MEMBERS: TeamListItem[] = [
  {
    id: 'cm1',
    nickname: 'wa_da_da888',
    kind: 'credit_member',
    avatarEmoji: '👩🏻',
    subordinateCount: 0,
  },
]

/**
 * 直属代理树（最小可演示）：
 * - 一层嵌套：展开 / 下级代理 / 会员灰标
 * - 同级 ≥3：触发「查看更多」
 * - 保留 mid_eyv4menuoax、授信相关账号
 */
export const MOCK_DIRECT_AGENTS: TeamListItem[] = [
  {
    id: 'a1',
    nickname: 'jj12300932',
    kind: 'agent',
    avatarEmoji: '👨🏻',
    subordinateCount: 1,
    memberCount: 2,
    vipLevel: 2,
    online: true,
    children: [
      {
        id: 'a1-1',
        nickname: 'pp12300932',
        kind: 'agent',
        avatarEmoji: '👨🏻',
        subordinateCount: 0,
        memberCount: 1,
        vipLevel: 1,
        online: true,
      },
      {
        id: 'a1-m1',
        nickname: 'oo12300932',
        kind: 'member',
        avatarEmoji: '👩🏻',
        subordinateCount: 0,
        online: true,
      },
      {
        id: 'a1-m2',
        nickname: 'yy12300932',
        kind: 'member',
        avatarEmoji: '👩🏻',
        subordinateCount: 0,
      },
    ],
  },
  {
    id: 'a2',
    nickname: 'mid_eyv4menuoax',
    kind: 'agent',
    avatarEmoji: '👨🏻',
    subordinateCount: 1,
    memberCount: 2,
    vipLevel: 1,
    online: true,
  },
  {
    id: 'a3',
    nickname: 'dd12300939',
    kind: 'agent',
    avatarEmoji: '👨🏻',
    subordinateCount: 0,
    memberCount: 1,
    vipLevel: 1,
  },
]

/** 直属会员 · 原型共享状态（邀请同意后会追加） */
export const teamDirectMembers = ref<TeamListItem[]>(
  MOCK_TEAM_MEMBERS.map((item) => ({ ...item, kind: 'member' as const })),
)

export const teamDirectAgents = ref<TeamListItem[]>(
  MOCK_DIRECT_AGENTS.map((item) => structuredClone(item)),
)

export const teamCreditAgents = ref<TeamListItem[]>(MOCK_CREDIT_AGENTS.map((item) => ({ ...item })))

export const teamCreditMembers = ref<TeamListItem[]>(MOCK_CREDIT_MEMBERS.map((item) => ({ ...item })))

export function addTeamDirectMember(member: TeamListItem) {
  if (teamDirectMembers.value.some((item) => item.id === member.id)) return
  teamDirectMembers.value.unshift({ ...member, kind: 'member' })
}

/** 更新团队节点备注（本人树 / 直属 / 信用列表） */
export function updateTeamMemberRemark(id: string, remark: string) {
  const next = remark.trim()
  const lists = [
    teamDirectMembers,
    teamDirectAgents,
    teamCreditAgents,
    teamCreditMembers,
  ] as const
  for (const list of lists) {
    const target = list.value.find((item) => item.id === id)
    if (target) {
      target.remark = next || undefined
      return
    }
    const walk = (nodes: TeamListItem[]): boolean => {
      for (const node of nodes) {
        if (node.id === id) {
          node.remark = next || undefined
          return true
        }
        if (node.children?.length && walk(node.children)) return true
      }
      return false
    }
    if (walk(list.value)) return
  }
}

/**
 * 创建代理账户：写入团队列表 Mock
 * - 占成：信用代理（走收益比例后创建）
 * - 返佣：直属代理（无授信）
 */
export function createTeamAgentAccount(
  nickname?: string,
  options?: { asCredit?: boolean },
) {
  const suffix = String(Date.now()).slice(-4)
  const id = `create_agent_${suffix}`
  const name = nickname?.trim() || `新代理_${suffix}`
  const asCredit = options?.asCredit !== false
  const item: TeamListItem = {
    id,
    nickname: name,
    kind: asCredit ? 'credit_agent' : 'agent',
    avatarEmoji: '👨🏻',
    subordinateCount: 0,
    memberCount: 0,
    vipLevel: 1,
    online: true,
  }
  if (asCredit) {
    teamCreditAgents.value.unshift(item)
  } else {
    teamDirectAgents.value.unshift(item)
  }
  return item
}

/** 代理授信成功：直属代理迁入信用代理 */
export function promoteToCreditAgent(targetId: string, targetName?: string) {
  const fromDirect = findAndRemoveAgent(teamDirectAgents.value, targetId)
  if (teamCreditAgents.value.some((item) => item.id === targetId)) return

  if (fromDirect) {
    teamCreditAgents.value.unshift({ ...fromDirect, kind: 'credit_agent', children: undefined })
    return
  }

  teamCreditAgents.value.unshift({
    id: targetId,
    nickname: targetName || targetId,
    kind: 'credit_agent',
    avatarEmoji: '👨🏻',
    subordinateCount: 0,
    memberCount: 0,
    vipLevel: 1,
    online: true,
  })
}

function findAndRemoveAgent(list: TeamListItem[], targetId: string): TeamListItem | undefined {
  const index = list.findIndex((item) => item.id === targetId)
  if (index >= 0) {
    const [found] = list.splice(index, 1)
    return found
  }
  for (const item of list) {
    if (!item.children?.length) continue
    const found = findAndRemoveAgent(item.children, targetId)
    if (found) return found
  }
  return undefined
}

/** 会员授信成功：直属会员迁入信用会员；其他会员直接写入信用会员 */
export function promoteToCreditMember(input: {
  id: string
  nickname: string
  avatarEmoji?: string
  vipLevel?: number
  online?: boolean
}) {
  const fromDirect = teamDirectMembers.value.find((item) => item.id === input.id)
  teamDirectMembers.value = teamDirectMembers.value.filter((item) => item.id !== input.id)

  if (teamCreditMembers.value.some((item) => item.id === input.id)) return

  if (fromDirect) {
    teamCreditMembers.value.unshift({ ...fromDirect, kind: 'credit_member' })
    return
  }

  teamCreditMembers.value.unshift({
    id: input.id,
    nickname: input.nickname,
    kind: 'credit_member',
    avatarEmoji: input.avatarEmoji || '👤',
    subordinateCount: 0,
    vipLevel: input.vipLevel,
    online: input.online,
  })
}

export type BuildTeamTreeOptions = {
  /** 是否包含信用代理 / 信用会员；返佣代理为 false */
  includeCredit?: boolean
  /** 是否仅展示本人直属一层；返佣代理为 true */
  singleLayer?: boolean
  /** 返佣：扁平直属会员列表，不展示「我」节点、无树形缩进 */
  flatDirectMembers?: boolean
}

function stripCreditTeamNodes(items: TeamListItem[]): TeamListItem[] {
  return items
    .filter((item) => !isCreditTeamKind(item.kind))
    .map((item) => ({
      ...item,
      children: item.children?.length ? stripCreditTeamNodes(item.children) : item.children,
    }))
}

function buildTeamTree(tab: TeamFilterTab, options: BuildTeamTreeOptions = {}): TeamListItem {
  const includeCredit = options.includeCredit !== false
  const singleLayer = options.singleLayer === true
  const members = teamDirectMembers.value
  const agents = teamDirectAgents.value
  const creditAgents = includeCredit ? teamCreditAgents.value : []
  const creditMembers = includeCredit ? teamCreditMembers.value : []

  // 直属/信用分类：只展示「我」的直属一级，不展开下级的下级
  if (tab === 'direct_agent') {
    return {
      ...MOCK_TEAM_SELF,
      children: agents.map((item) => ({ ...item, children: undefined })),
    }
  }
  if (tab === 'direct_member') {
    return {
      ...MOCK_TEAM_SELF,
      children: members.map((item) => ({ ...item, children: undefined })),
    }
  }
  if (tab === 'credit_agent') {
    return {
      ...MOCK_TEAM_SELF,
      children: creditAgents.map((item) => ({ ...item, children: undefined })),
    }
  }
  if (tab === 'credit_member') {
    return {
      ...MOCK_TEAM_SELF,
      children: creditMembers.map((item) => ({ ...item, children: undefined })),
    }
  }

  const children = [
    ...agents.map((item) => ({ ...item })),
    ...members.map((item) => ({ ...item })),
    ...creditAgents.map((item) => ({ ...item })),
    ...creditMembers.map((item) => ({ ...item })),
  ]

  return {
    ...MOCK_TEAM_SELF,
    children: (includeCredit ? children : stripCreditTeamNodes(children)).map((item) =>
      singleLayer ? { ...item, children: undefined } : item,
    ),
  }
}

/** 收集树中所有可展开节点 id，以及各层「全部可见」条数（用于默认全部展开） */
export function collectTeamFullExpandState(
  tab: TeamFilterTab,
  options: BuildTeamTreeOptions = {},
): {
  expandedIds: Set<string>
  moreVisibleCount: Record<string, number>
} {
  const root = buildTeamTree(tab, options)
  const expandedIds = new Set<string>()
  const moreVisibleCount: Record<string, number> = {}

  function walk(node: TeamListItem) {
    const children = node.children ?? []
    if (!children.length) return
    expandedIds.add(node.id)
    moreVisibleCount[node.id] = children.length
    children.forEach(walk)
  }

  walk(root)
  return { expandedIds, moreVisibleCount }
}

/**
 * 按展开状态拍平树；每层超出默认条数插入「查看更多」
 * @param moreVisibleCount parentId → 已展开可见条数
 */
export function getTeamTreeRows(
  tab: TeamFilterTab,
  expandedIds: Set<string>,
  moreVisibleCount: Record<string, number> = {},
  options: BuildTeamTreeOptions = {},
): TeamTreeRow[] {
  /** 返佣：仅扁平直属会员，不渲染本人层级 */
  if (options.flatDirectMembers) {
    const members = teamDirectMembers.value.map((item) => ({ ...item, children: undefined }))
    const flatParentId = MOCK_TEAM_SELF.id
    const limit = moreVisibleCount[flatParentId] ?? TEAM_TREE_DEFAULT_VISIBLE
    const visible = members.slice(0, limit)
    const remaining = Math.max(0, members.length - visible.length)
    const rows: TeamTreeRow[] = visible.map((item, index) => ({
      type: 'node' as const,
      item,
      depth: 0,
      hasChildren: false,
      isLast: index === visible.length - 1 && remaining === 0,
      ancestorLastFlags: [] as boolean[],
    }))
    if (remaining > 0) {
      rows.push({
        type: 'more',
        parentId: flatParentId,
        depth: 0,
        remaining,
        isLast: true,
        ancestorLastFlags: [],
      })
    }
    return rows
  }

  const root = buildTeamTree(tab, options)
  const rows: TeamTreeRow[] = []

  function walk(node: TeamListItem, depth: number, ancestorLastFlags: boolean[], isLast: boolean) {
    const children = node.children ?? []
    const hasChildren = children.length > 0
    rows.push({
      type: 'node',
      item: node,
      depth,
      hasChildren,
      isLast,
      ancestorLastFlags,
    })

    if (!hasChildren || !expandedIds.has(node.id)) return

    const limit = moreVisibleCount[node.id] ?? TEAM_TREE_DEFAULT_VISIBLE
    const visible = children.slice(0, limit)
    const remaining = Math.max(0, children.length - visible.length)
    const childFlags = [...ancestorLastFlags, isLast]

    visible.forEach((child, index) => {
      const childIsLast = index === visible.length - 1 && remaining === 0
      walk(child, depth + 1, childFlags, childIsLast)
    })

    if (remaining > 0) {
      rows.push({
        type: 'more',
        parentId: node.id,
        depth: depth + 1,
        remaining,
        isLast: true,
        ancestorLastFlags: childFlags,
      })
    }
  }

  walk(root, 0, [], true)
  return rows
}

export function filterTeamList(tab: TeamFilterTab): TeamListItem[] {
  const members = teamDirectMembers.value

  if (tab === 'all') {
    return [
      MOCK_TEAM_SELF,
      ...teamDirectAgents.value,
      ...members,
      ...teamCreditAgents.value,
      ...teamCreditMembers.value,
    ]
  }
  if (tab === 'direct_agent') {
    return [MOCK_TEAM_SELF, ...teamDirectAgents.value]
  }
  if (tab === 'direct_member') {
    return [MOCK_TEAM_SELF, ...members]
  }
  if (tab === 'credit_agent') {
    return [MOCK_TEAM_SELF, ...teamCreditAgents.value]
  }
  return [MOCK_TEAM_SELF, ...teamCreditMembers.value]
}

export function isCreditTeamKind(kind: TeamMemberKind) {
  return kind === 'credit_agent' || kind === 'credit_member'
}

export function memberKindLabel(kind: TeamMemberKind) {
  if (kind === 'credit_member' || kind === 'member') return '会员'
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

export function teamStatsLabel(item: TeamListItem) {
  const agentPart = `代(${item.subordinateCount}人)`
  const memberPart = `会(${item.memberCount ?? 0}人)`
  return `${agentPart}｜${memberPart}`
}

/** 过滤后排除当前用户，供列表子级展示 */
export function getTeamChildren(tab: TeamFilterTab): TeamListItem[] {
  return filterTeamList(tab).filter((item) => item.id !== MOCK_TEAM_SELF.id)
}

export type CreateAccountOption = 'agent' | 'member' | 'member_credit' | 'invite_existing'

export const CREATE_ACCOUNT_OPTIONS: { key: CreateAccountOption; label: string }[] = [
  { key: 'agent', label: '创建代理账户' },
  { key: 'member', label: '创建会员账户' },
  { key: 'member_credit', label: '会员账户授信' },
  { key: 'invite_existing', label: '邀请现有会员为下级' },
]

export const DEFAULT_CREATE_ACCOUNT_OPTION: CreateAccountOption = 'agent'

/** 默认展开：非「全部」Tab 仅展开「我」一层；「全部」Tab 走 collectTeamFullExpandState */
export const TEAM_TREE_DEFAULT_EXPANDED = ['self'] as const

/** 是否展示「会员授信」入口（已是信用会员则不展示） */
export function canShowMemberCreditAction(kind: TeamMemberKind) {
  return kind === 'member'
}

/** 是否展示「代理授信」入口（已是信用代理则不展示） */
export function canShowAgentCreditAction(kind: TeamMemberKind) {
  return kind === 'agent'
}
