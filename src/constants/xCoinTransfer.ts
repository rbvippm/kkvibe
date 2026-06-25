/** X币上下分 · 类型与来源枚举 */

export type TransferDirection = 'credit_up' | 'credit_down'

/** 记录来源类型（筛选与展示） */
export type TransferSourceType =
  | 'platform'
  | 'direct_superior'
  | 'non_direct_agent'
  | 'self'

export type TransferTargetType = 'direct_member' | 'direct_agent' | 'self' | 'platform'

export type AgentRelation = 'direct_superior' | 'non_direct' | 'direct_subordinate'

export type XCoinTransferRecord = {
  id: string
  direction: TransferDirection
  sourceType: TransferSourceType
  sourceAgentId?: string
  sourceAgentName?: string
  sourceAgentRelation?: AgentRelation
  targetType: TransferTargetType
  targetAgentId?: string
  targetName?: string
  amount: number
  createdAt: string
  /** 列表副标题，如「上分-小红来了EZ1」 */
  summary: string
  /** 关系标签，如「代理小红来了EZ1 → 我」 */
  relationLabel: string
}

export type XCoinSelectableTarget = {
  id: string
  nickname: string
  /** 金刚号（对外展示号） */
  kingkongId: string
  /** 用户 ID */
  userId: string
  accountId: string
  relation: 'direct_member' | 'direct_agent' | 'non_direct_agent' | 'non_direct_member'
  availableCredit: number
  totalCreditLine: number
}

export type AgentCreditSummary = {
  agentId: string
  agentName: string
  relation: AgentRelation
  creditUpTotal: number
  creditDownTotal: number
  netAmount: number
}

export const TRANSFER_DIRECTION_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'credit_up', label: '上分' },
  { value: 'credit_down', label: '下分' },
] as const

/** 改版后：来源拆分为直属上级 / 非直属代理 */
export const TRANSFER_SOURCE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'platform', label: '平台' },
  { value: 'direct_superior', label: '直属上级代理' },
  { value: 'non_direct_agent', label: '非直属代理' },
  { value: 'self', label: '我' },
] as const

export const TRANSFER_TARGET_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'direct_member', label: '直属会员' },
  { value: 'direct_agent', label: '直属代理' },
  { value: 'self', label: '我' },
] as const

export const RELATION_LABEL: Record<AgentRelation, string> = {
  direct_superior: '直属上级',
  non_direct: '非直属',
  direct_subordinate: '直属下级',
}

export const MOCK_XCOIN_BALANCE = 518.22

export const MOCK_TRANSFER_RECORDS: XCoinTransferRecord[] = [
  {
    id: 'r1',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_agent',
    targetAgentId: 'a_ez1',
    targetName: '小红来了EZ1',
    amount: -10,
    createdAt: '2026-05-25 21:04:02',
    summary: '下分-小红来了EZ1',
    relationLabel: '我 → 直属代理',
  },
  {
    id: 'r2',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    amount: 200,
    createdAt: '2026-05-24 18:30:11',
    summary: '上分-平台授信',
    relationLabel: '平台 → 我',
  },
  {
    id: 'r3',
    direction: 'credit_up',
    sourceType: 'direct_superior',
    sourceAgentId: 'a_super',
    sourceAgentName: 'mid_eyv4menuoax',
    sourceAgentRelation: 'direct_superior',
    targetType: 'self',
    amount: 150,
    createdAt: '2026-05-23 14:22:08',
    summary: '上分-mid_eyv4menuoax',
    relationLabel: '直属上级 mid_eyv4menuoax → 我',
  },
  {
    id: 'r4',
    direction: 'credit_up',
    sourceType: 'non_direct_agent',
    sourceAgentId: 'a_nd_01',
    sourceAgentName: '华南合伙人·李',
    sourceAgentRelation: 'non_direct',
    targetType: 'self',
    amount: 80,
    createdAt: '2026-05-22 09:15:44',
    summary: '上分-华南合伙人·李',
    relationLabel: '非直属代理 华南合伙人·李 → 我',
  },
  {
    id: 'r5',
    direction: 'credit_up',
    sourceType: 'non_direct_agent',
    sourceAgentId: 'a_nd_02',
    sourceAgentName: '城市渠道王哥',
    sourceAgentRelation: 'non_direct',
    targetType: 'self',
    amount: 50,
    createdAt: '2026-05-21 16:40:33',
    summary: '上分-城市渠道王哥',
    relationLabel: '非直属代理 城市渠道王哥 → 我',
  },
  {
    id: 'r6',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_member',
    targetName: 'openapi31axy8',
    amount: -30,
    createdAt: '2026-05-20 11:08:19',
    summary: '下分-openapi31axy8',
    relationLabel: '我 → 直属会员',
  },
]

export const MOCK_SELECTABLE_MEMBERS: XCoinSelectableTarget[] = [
  {
    id: 'm1',
    nickname: 'openapi31axy8',
    kingkongId: '66880031',
    userId: '10031001',
    accountId: 'mid_openapi31',
    relation: 'direct_member',
    availableCredit: 0,
    totalCreditLine: 0,
  },
  {
    id: 'm2',
    nickname: 'mid_eyv4menuoax',
    kingkongId: '88661202',
    userId: '10032002',
    accountId: 'mid_eyv4menuoax',
    relation: 'direct_member',
    availableCredit: 68.99,
    totalCreditLine: 254,
  },
  {
    id: 'm3',
    nickname: '小红来了EZ1',
    kingkongId: '88661234',
    userId: '10033003',
    accountId: 'mid_ez1',
    relation: 'non_direct_member',
    availableCredit: 12.5,
    totalCreditLine: 100,
  },
]

export const MOCK_SELECTABLE_AGENTS: XCoinSelectableTarget[] = [
  {
    id: 'a1',
    nickname: 'mid_eyv4menuoax',
    kingkongId: '88661202',
    userId: '20032002',
    accountId: 'mid_eyv4menuoax',
    relation: 'direct_agent',
    availableCredit: 0,
    totalCreditLine: 0,
  },
  {
    id: 'a2',
    nickname: '小红来了EZ1',
    kingkongId: '88661234',
    userId: '20033003',
    accountId: 'mid_ez1',
    relation: 'direct_agent',
    availableCredit: 413,
    totalCreditLine: 866,
  },
  {
    id: 'a3',
    nickname: '华南合伙人·李',
    kingkongId: '77550018',
    userId: '20034004',
    accountId: 'mid_hn_li',
    relation: 'non_direct_agent',
    availableCredit: 120,
    totalCreditLine: 500,
  },
]

export const MOCK_AGENT_CREDIT_SUMMARY: AgentCreditSummary[] = [
  {
    agentId: 'a_super',
    agentName: 'mid_eyv4menuoax',
    relation: 'direct_superior',
    creditUpTotal: 150,
    creditDownTotal: 0,
    netAmount: 150,
  },
  {
    agentId: 'a_nd_01',
    agentName: '华南合伙人·李',
    relation: 'non_direct',
    creditUpTotal: 80,
    creditDownTotal: 0,
    netAmount: 80,
  },
  {
    agentId: 'a_nd_02',
    agentName: '城市渠道王哥',
    relation: 'non_direct',
    creditUpTotal: 50,
    creditDownTotal: 0,
    netAmount: 50,
  },
]

export function relationTagText(relation: XCoinSelectableTarget['relation']) {
  if (relation === 'direct_member') return '直属会员'
  if (relation === 'direct_agent') return '直属代理'
  if (relation === 'non_direct_member') return '非直属会员'
  return '非直属代理'
}

export function relationTagClass(relation: XCoinSelectableTarget['relation'] | AgentRelation) {
  if (relation === 'direct_member' || relation === 'direct_agent' || relation === 'direct_superior' || relation === 'direct_subordinate') {
    return 'mh5-xcoin-tag mh5-xcoin-tag--direct'
  }
  return 'mh5-xcoin-tag mh5-xcoin-tag--indirect'
}

/** 直属会员（快捷选择） */
export const MOCK_DIRECT_MEMBERS = MOCK_SELECTABLE_MEMBERS.filter(
  (m) => m.relation === 'direct_member',
)

/** 其他会员（非直属） */
export const MOCK_OTHER_MEMBERS = MOCK_SELECTABLE_MEMBERS.filter(
  (m) => m.relation === 'non_direct_member',
)

function matchMemberQuery(m: XCoinSelectableTarget, q: string) {
  return (
    m.accountId.toLowerCase() === q ||
    m.nickname.toLowerCase() === q ||
    m.kingkongId.toLowerCase() === q ||
    m.userId.toLowerCase() === q ||
    m.accountId.toLowerCase().includes(q) ||
    m.nickname.toLowerCase().includes(q) ||
    m.kingkongId.includes(q) ||
    m.userId.toLowerCase().includes(q)
  )
}

/** 按账号 / 账号ID 查询会员（演示：精确或包含匹配） */
export function findMemberByAccountQuery(query: string): XCoinSelectableTarget | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  return MOCK_SELECTABLE_MEMBERS.find((m) => matchMemberQuery(m, q)) ?? null
}

/** 查询其他会员（非直属） */
export function findOtherMemberByAccountQuery(query: string): XCoinSelectableTarget | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  return MOCK_OTHER_MEMBERS.find((m) => matchMemberQuery(m, q)) ?? null
}
