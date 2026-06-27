/** X币上下分 · 类型与来源枚举 */

export type TransferDirection = 'credit_up' | 'credit_down'

export type TransferRecordType = TransferDirection | 'daily_rebate'

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
  recordType: TransferRecordType
  direction: TransferDirection
  sourceType: TransferSourceType
  sourceAgentId?: string
  sourceAgentName?: string
  sourceAgentRelation?: AgentRelation
  targetType: TransferTargetType
  targetAgentId?: string
  targetMemberId?: string
  targetName?: string
  /** 上级代理（展示/筛选） */
  superiorAgentId?: string
  superiorAgentName?: string
  /** 关联会员（展示/筛选） */
  memberId?: string
  memberName?: string
  amount: number
  createdAt: string
  /** 业务单号 */
  orderNo?: string
  /** 列表副标题，如「收入-小红来了EZ1」 */
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

export const TRANSFER_RECORD_TYPE_OPTIONS = [
  { value: '', label: '类型' },
  { value: 'credit_up', label: '上分' },
  { value: 'credit_down', label: '下分' },
  { value: 'daily_rebate', label: '退水' },
] as const

export const TRANSFER_ROLE_FILTER_OPTIONS = [
  { value: '', label: '对象' },
  { value: 'agent', label: '代理' },
  { value: 'member', label: '会员' },
] as const

export type TransferRoleFilter = '' | 'agent' | 'member'

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
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_agent',
    targetAgentId: 'a_ez1',
    targetName: '小红来了EZ1',
    superiorAgentName: '我',
    memberName: '小红来了EZ1',
    amount: -10,
    createdAt: '2026-05-25 21:04:02',
    summary: '支出-小红来了EZ1',
    relationLabel: '我 → 直属代理',
  },
  {
    id: 'r2',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 200,
    createdAt: '2026-05-24 18:30:11',
    summary: '收入-平台授信',
    relationLabel: '平台 → 我',
  },
  {
    id: 'r3',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'direct_superior',
    sourceAgentId: 'a_super',
    sourceAgentName: 'mid_eyv4menuoax',
    sourceAgentRelation: 'direct_superior',
    targetType: 'self',
    superiorAgentId: 'a_super',
    superiorAgentName: 'mid_eyv4menuoax',
    memberName: '我',
    amount: 150,
    createdAt: '2026-05-23 14:22:08',
    summary: '收入-mid_eyv4menuoax',
    relationLabel: '直属上级 mid_eyv4menuoax → 我',
  },
  {
    id: 'r4',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'non_direct_agent',
    sourceAgentId: 'a_nd_01',
    sourceAgentName: '华南合伙人·李',
    sourceAgentRelation: 'non_direct',
    targetType: 'self',
    superiorAgentId: 'a_nd_01',
    superiorAgentName: '华南合伙人·李',
    memberName: '我',
    amount: 80,
    createdAt: '2026-05-22 09:15:44',
    summary: '收入-华南合伙人·李',
    relationLabel: '非直属代理 华南合伙人·李 → 我',
  },
  {
    id: 'r5',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'non_direct_agent',
    sourceAgentId: 'a_nd_02',
    sourceAgentName: '城市渠道王哥',
    sourceAgentRelation: 'non_direct',
    targetType: 'self',
    superiorAgentId: 'a_nd_02',
    superiorAgentName: '城市渠道王哥',
    memberName: '我',
    amount: 50,
    createdAt: '2026-05-21 16:40:33',
    summary: '收入-城市渠道王哥',
    relationLabel: '非直属代理 城市渠道王哥 → 我',
  },
  {
    id: 'r6',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_member',
    targetMemberId: 'm1',
    targetName: 'openapi31axy8',
    superiorAgentName: '我',
    memberId: 'm1',
    memberName: 'openapi31axy8',
    amount: -30,
    createdAt: '2026-05-20 11:08:19',
    summary: '支出-openapi31axy8',
    relationLabel: '我 → 直属会员',
  },
  {
    id: 'r7',
    recordType: 'daily_rebate',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'direct_member',
    targetMemberId: 'm1',
    targetName: 'openapi31axy8',
    superiorAgentId: 'a_super',
    superiorAgentName: 'mid_eyv4menuoax',
    memberId: 'm1',
    memberName: 'openapi31axy8',
    amount: 8.6,
    createdAt: '2026-05-25 00:05:12',
    summary: '退水-openapi31axy8',
    relationLabel: 'mid_eyv4menuoax → openapi31axy8',
  },
  {
    id: 'r8',
    recordType: 'daily_rebate',
    direction: 'credit_up',
    sourceType: 'self',
    targetType: 'direct_member',
    targetMemberId: 'm2',
    targetName: 'mid_eyv4menuoax',
    superiorAgentName: '我',
    memberId: 'm2',
    memberName: 'mid_eyv4menuoax',
    amount: 15.2,
    createdAt: '2026-05-25 00:05:18',
    summary: '退水-mid_eyv4menuoax',
    relationLabel: '我 → mid_eyv4menuoax',
  },
  {
    id: 'r9',
    recordType: 'daily_rebate',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'direct_member',
    targetMemberId: 'm3',
    targetName: '小红来了EZ1',
    superiorAgentId: 'a_nd_01',
    superiorAgentName: '华南合伙人·李',
    memberId: 'm3',
    memberName: '小红来了EZ1',
    amount: 6.3,
    createdAt: '2026-05-24 00:05:09',
    summary: '退水-小红来了EZ1',
    relationLabel: '华南合伙人·李 → 小红来了EZ1',
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

export function recordTypeLabel(type: TransferRecordType) {
  if (type === 'credit_up') return '上分'
  if (type === 'credit_down') return '下分'
  return '退水'
}

/** 卡片类型角标（简短） */
export function recordTypeBadgeLabel(type: TransferRecordType) {
  if (type === 'credit_up') return '上分'
  if (type === 'credit_down') return '下分'
  return '退水'
}

export function recordTypeBadgeClass(type: TransferRecordType) {
  if (type === 'credit_up') return 'mh5-xcoin-record__type--up'
  if (type === 'credit_down') return 'mh5-xcoin-record__type--down'
  return 'mh5-xcoin-record__type--rebate'
}

export type RecordFlowDisplay = {
  initiator: string
  target: string
}

/** 信用额度记录 · 业务单号 */
export function transferRecordOrderNo(row: Pick<XCoinTransferRecord, 'id' | 'createdAt' | 'orderNo'>) {
  if (row.orderNo) return row.orderNo
  const ts = row.createdAt.replace(/[-:\s]/g, '')
  const seq = row.id.replace(/\D/g, '').padStart(3, '0')
  return `XC${ts}${seq}`
}

/** 账单卡片：发起人 → 对象 */
export function recordFlowDisplay(row: XCoinTransferRecord): RecordFlowDisplay {
  if (row.recordType === 'daily_rebate') {
    return {
      initiator: '平台',
      target: row.memberName || row.targetName || '—',
    }
  }

  if (row.sourceType === 'platform' && row.targetType === 'self') {
    return { initiator: '平台', target: '我' }
  }
  if (row.sourceType === 'direct_superior' && row.targetType === 'self') {
    return {
      initiator: row.sourceAgentName || row.superiorAgentName || '直属上级',
      target: '我',
    }
  }
  if (row.sourceType === 'non_direct_agent' && row.targetType === 'self') {
    return {
      initiator: row.sourceAgentName || row.superiorAgentName || '非直属代理',
      target: '我',
    }
  }
  if (row.sourceType === 'self' && row.targetType === 'direct_agent') {
    return {
      initiator: '我',
      target: row.targetName || row.memberName || '—',
    }
  }
  if (row.sourceType === 'self' && row.targetType === 'direct_member') {
    return {
      initiator: '我',
      target: row.targetName || row.memberName || '—',
    }
  }

  const parts = row.relationLabel.split('→').map((s) => s.trim())
  if (parts.length === 2) {
    return { initiator: parts[0], target: parts[1] }
  }
  return { initiator: '—', target: '—' }
}

export function matchTransferRecordPerson(row: XCoinTransferRecord, keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return true
  const fields = [
    row.superiorAgentName,
    row.memberName,
    row.targetName,
    row.sourceAgentName,
  ].filter(Boolean) as string[]
  return fields.some((name) => name.toLowerCase().includes(q))
}

/** 代理 / 会员维度筛选 */
export function matchTransferRecordRole(row: XCoinTransferRecord, role: TransferRoleFilter) {
  if (!role) return true
  if (role === 'agent') {
    return (
      row.targetType === 'direct_agent' ||
      row.sourceType === 'direct_superior' ||
      row.sourceType === 'non_direct_agent'
    )
  }
  return row.targetType === 'direct_member' || row.recordType === 'daily_rebate'
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
