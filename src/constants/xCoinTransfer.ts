/** 信用额度上下分 · 类型与来源枚举 */

/**
 * 信用额度分币种（仅 信用额度-CNY / 信用额度-USD，与现金 KKC / KKV / USDT 区分）
 */
export type XCoinCreditCurrency = '信用额度-CNY' | '信用额度-USD'

export const XCOIN_CREDIT_CURRENCY_TABS: { key: XCoinCreditCurrency; label: string }[] = [
  { key: '信用额度-CNY', label: '信用额度-CNY' },
  { key: '信用额度-USD', label: '信用额度-USD' },
]

export const TRANSFER_CREDIT_CURRENCY_OPTIONS = [
  { value: '', label: '币种' },
  { value: '信用额度-CNY', label: '信用额度-CNY' },
  { value: '信用额度-USD', label: '信用额度-USD' },
] as const

export type TransferCreditCurrencyFilter = '' | XCoinCreditCurrency

/** 从路由 query / 详情信用币种解析默认上下分币种 */
export function parseXCoinCreditCurrency(raw: unknown): XCoinCreditCurrency {
  const v = String(raw || '').trim()
  if (
    v === '信用额度-USD' ||
    v === 'USD' ||
    v === 'USDT' ||
    v === '信用额度-usdt'
  ) {
    return '信用额度-USD'
  }
  // 兼容历史：KKC / CNY / 信用额度-kkc → 信用额度-CNY
  return '信用额度-CNY'
}

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
  /** 信用额度币种 */
  creditCurrency: XCoinCreditCurrency
  /** 业务单号 */
  orderNo?: string
  /** 两步交收关联流水 id（上分↔下分互指） */
  relatedRecordId?: string
  /** 列表副标题，如「收入-小红来了EZ1」 */
  summary: string
  /** 关系标签，如「代理小红来了EZ1 → 我」 */
  relationLabel: string
  /** 变动后我的可用额度 */
  balanceAfter?: number
}

export type XCoinCreditStats = {
  /** 可用额度 */
  availableCredit: number
  /** 上分总额 */
  creditUpTotal: number
  /** 下分总额 */
  creditDownTotal: number
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
  /** 按信用币种区分的额度 */
  credits: Record<XCoinCreditCurrency, XCoinCreditStats>
}

/** 授信总额 = 上分总额 - 下分总额 */
export function getSelectableCreditTotal(stats: XCoinCreditStats) {
  return stats.creditUpTotal - stats.creditDownTotal
}

export function emptySelectableCredits(): Record<XCoinCreditCurrency, XCoinCreditStats> {
  return {
    '信用额度-CNY': { availableCredit: 0, creditUpTotal: 0, creditDownTotal: 0 },
    '信用额度-USD': { availableCredit: 0, creditUpTotal: 0, creditDownTotal: 0 },
  }
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
  { value: '', label: '全部' },
  { value: 'credit_up', label: '上分' },
  { value: 'credit_down', label: '下分' },
  { value: 'daily_rebate', label: '退水' },
] as const

export const TRANSFER_ROLE_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'agent', label: '代理' },
  { value: 'member', label: '会员' },
] as const

export type TransferRoleFilter = '' | 'agent' | 'member'

/** 发起人筛选：我 / 平台 / 上级代理 */
export const TRANSFER_INITIATOR_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'self', label: '我' },
  { value: 'platform', label: '平台' },
  { value: 'superior', label: '上级代理' },
] as const

export type TransferInitiatorFilter = '' | 'self' | 'platform' | 'superior'

export type TransferTimePreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export const TRANSFER_TIME_PRESETS: { key: Exclude<TransferTimePreset, 'custom'>; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

export const TRANSFER_RECORD_PAGE_SIZE = 20
export const TRANSFER_RECORD_MAX_RANGE_DAYS = 90

/** 记录页类型：全部 / 平台 / 上级往来 / 下级分发 */
export type TransferLane = 'all' | 'platform' | 'superior' | 'downstream'

export type TransferScene =
  | 'platform_refund'
  | 'platform_reclaim'
  | 'platform_rebate'
  | 'superior_up'
  | 'superior_down'
  | 'agent_up'
  | 'member_up'
  | 'agent_down'
  | 'member_down'

export type TransferPartyRole = 'member' | 'agent' | 'platform' | 'superior'

export const TRANSFER_LANE_TABS: { key: TransferLane; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'platform', label: '平台' },
  { key: 'superior', label: '上级往来' },
  { key: 'downstream', label: '下级分发' },
]

export const TRANSFER_DOWNSTREAM_ROLE_PILLS: { key: TransferRoleFilter; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'member', label: '会员' },
  { key: 'agent', label: '代理' },
]

export const TRANSFER_SCENE_LABEL: Record<TransferScene, string> = {
  platform_refund: '平台回退',
  platform_reclaim: '平台回收',
  platform_rebate: '平台退水',
  superior_up: '上级上分',
  superior_down: '上级下分',
  agent_up: '给代理上分',
  member_up: '给会员上分',
  agent_down: '给代理下分',
  member_down: '给会员下分',
}

export const TRANSFER_PLATFORM_SCENES: TransferScene[] = [
  'platform_refund',
  'platform_reclaim',
  'platform_rebate',
]

export const TRANSFER_SUPERIOR_SCENES: TransferScene[] = ['superior_up', 'superior_down']

export const TRANSFER_DOWNSTREAM_SCENES: TransferScene[] = [
  'agent_up',
  'member_up',
  'agent_down',
  'member_down',
]

export const TRANSFER_SCENES_BY_LANE: Record<Exclude<TransferLane, 'all'>, TransferScene[]> = {
  platform: TRANSFER_PLATFORM_SCENES,
  superior: TRANSFER_SUPERIOR_SCENES,
  downstream: TRANSFER_DOWNSTREAM_SCENES,
}

export type TransferSummaryMetricKey = 'creditUpTotal' | 'creditDownTotal' | 'creditNet' | 'rebate'

export const TRANSFER_SUMMARY_METRICS: {
  key: TransferSummaryMetricKey
  label: string
  hint: string
}[] = [
  { key: 'creditUpTotal', label: '上分总额', hint: '上级上分 + 平台回退' },
  { key: 'creditDownTotal', label: '下分总额', hint: '上级下分 − 平台回收' },
  { key: 'creditNet', label: '上下分净额', hint: '上分总额 − 下分总额' },
  { key: 'rebate', label: '退水', hint: '平台退水' },
]

export function transferSceneLane(scene: TransferScene): Exclude<TransferLane, 'all'> {
  if (TRANSFER_PLATFORM_SCENES.includes(scene)) return 'platform'
  if (TRANSFER_SUPERIOR_SCENES.includes(scene)) return 'superior'
  return 'downstream'
}

export function getTransferSceneOptionsByLane(
  lane: TransferLane,
): { value: '' | TransferScene; label: string }[] {
  const scenes =
    lane === 'all'
      ? [
          ...TRANSFER_PLATFORM_SCENES,
          ...TRANSFER_SUPERIOR_SCENES,
          ...TRANSFER_DOWNSTREAM_SCENES,
        ]
      : TRANSFER_SCENES_BY_LANE[lane]
  return [
    { value: '', label: '全部' },
    ...scenes.map((value) => ({ value, label: TRANSFER_SCENE_LABEL[value] })),
  ]
}

export const TRANSFER_SCENE_FILTER_OPTIONS = getTransferSceneOptionsByLane('all')

export const TRANSFER_PARTY_ROLE_LABEL: Record<TransferPartyRole, string> = {
  member: '会员',
  agent: '代理',
  platform: '平台',
  superior: '上级',
}

export type TransferRecordFilter = {
  keyword: string
  timePreset: TransferTimePreset
  customStart: string
  customEnd: string
  recordType: '' | TransferRecordType
  /** 场景类型（高级筛选） */
  scene: '' | TransferScene
  /** 一级分栏 */
  lane: TransferLane
  /** 发起人：我 / 平台 / 上级代理 */
  initiator: TransferInitiatorFilter
  /** 对象类型：代理 / 会员 */
  role: TransferRoleFilter
  /** 列表过滤币种；空表示全部；汇总轮播不受此项影响 */
  currency: TransferCreditCurrencyFilter
}

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

/** 当前登录代理（记录中「我」的展示与搜索） */
export const MOCK_TRANSFER_SELF_PROFILE = {
  nickname: 'OO1231236789',
  kingkongId: 'gg12345678',
}

/** 对象/发起人为「我」时：展示「我 + 昵称」，昵称为空则用金刚号 */
export function formatTransferSelfLabel() {
  const { nickname, kingkongId } = MOCK_TRANSFER_SELF_PROFILE
  const name = nickname.trim() || kingkongId.trim()
  if (name) return `我（${name}）`
  return '我'
}

export const MOCK_XCOIN_BALANCE = 518.22

export const MOCK_XCOIN_BALANCES: Record<XCoinCreditCurrency, number> = {
  '信用额度-CNY': 518.22,
  '信用额度-USD': 86.5,
}

export function parseTransferLane(raw: unknown): TransferLane {
  const v = String(raw || '').trim()
  if (v === 'platform' || v === 'superior' || v === 'downstream') return v
  return 'all'
}

export function transferRecordLane(row: XCoinTransferRecord): Exclude<TransferLane, 'all'> {
  return transferSceneLane(transferRecordScene(row))
}

export function transferRecordScene(row: XCoinTransferRecord): TransferScene {
  if (row.recordType === 'daily_rebate') return 'platform_rebate'
  if (row.sourceType === 'self' && row.targetType === 'direct_member') {
    return row.recordType === 'credit_down' ? 'member_down' : 'member_up'
  }
  if (row.sourceType === 'self' && row.targetType === 'direct_agent') {
    return row.recordType === 'credit_down' ? 'agent_down' : 'agent_up'
  }
  if (row.sourceType === 'direct_superior' || row.sourceType === 'non_direct_agent') {
    return row.recordType === 'credit_down' ? 'superior_down' : 'superior_up'
  }
  if (row.recordType === 'credit_down') return 'platform_reclaim'
  return 'platform_refund'
}

export function transferSceneLabel(row: XCoinTransferRecord) {
  return TRANSFER_SCENE_LABEL[transferRecordScene(row)]
}

export function transferRecordPartyRole(row: XCoinTransferRecord): TransferPartyRole {
  const scene = transferRecordScene(row)
  if (scene === 'member_up' || scene === 'member_down') return 'member'
  if (scene === 'agent_up' || scene === 'agent_down') return 'agent'
  if (scene === 'superior_up' || scene === 'superior_down') return 'superior'
  return 'platform'
}

export function transferPartyRoleLabel(row: XCoinTransferRecord) {
  return TRANSFER_PARTY_ROLE_LABEL[transferRecordPartyRole(row)]
}

export function transferRecordCounterpart(row: XCoinTransferRecord) {
  if (transferRecordLane(row) === 'downstream') {
    return row.targetName || row.memberName || '—'
  }
  if (row.sourceType === 'platform' || row.recordType === 'daily_rebate') return '平台'
  return row.sourceAgentName || row.superiorAgentName || '上级'
}

export function transferRecordFlowLine(row: XCoinTransferRecord) {
  if (transferRecordLane(row) === 'downstream') {
    return `我 → ${transferRecordCounterpart(row)}（${transferPartyRoleLabel(row)}）`
  }
  return `${transferRecordCounterpart(row)} → 我`
}

export type TransferCardFlow = {
  fromName: string
  toName: string
  toRole: string | null
}

/** 列表卡片流向：发起人 / 对象 两行；下级对象带身份胶囊 */
export function transferCardFlow(row: XCoinTransferRecord): TransferCardFlow {
  const self = formatTransferSelfLabel()
  if (transferRecordLane(row) === 'downstream') {
    return {
      fromName: self,
      toName: transferRecordCounterpart(row),
      toRole: transferPartyRoleLabel(row),
    }
  }
  return {
    fromName: transferRecordCounterpart(row),
    toName: self,
    toRole: null,
  }
}

/** 我对这笔的额度变动：进账/回收为正，发给下级/平台回收/上级下分为负 */
export function transferMyCreditDelta(row: XCoinTransferRecord) {
  const scene = transferRecordScene(row)
  const abs = Math.abs(row.amount)
  if (
    scene === 'member_up' ||
    scene === 'agent_up' ||
    scene === 'platform_reclaim' ||
    scene === 'superior_down'
  ) {
    return -abs
  }
  return abs
}

/** 配对下游不重复计入我的额度滚计 */
export function transferLedgerDelta(row: XCoinTransferRecord) {
  if (transferRecordLane(row) === 'downstream' && row.relatedRecordId) return 0
  return transferMyCreditDelta(row)
}

export function attachTransferBalances(rows: XCoinTransferRecord[]): XCoinTransferRecord[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const balanceAfter = new Map<string, number>()

  for (const { key } of XCOIN_CREDIT_CURRENCY_TABS) {
    const list = rows
      .filter((row) => row.creditCurrency === key)
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
    const net = list.reduce((sum, row) => sum + transferLedgerDelta(row), 0)
    let cursor = Number((MOCK_XCOIN_BALANCES[key] - net).toFixed(2))
    for (const row of list) {
      cursor = Number((cursor + transferLedgerDelta(row)).toFixed(2))
      balanceAfter.set(row.id, cursor)
    }
    for (const row of list) {
      if (transferRecordLane(row) !== 'downstream' || !row.relatedRecordId) continue
      const related = byId.get(row.relatedRecordId)
      if (!related) continue
      const relatedBal = balanceAfter.get(related.id)
      if (relatedBal != null) balanceAfter.set(row.id, relatedBal)
    }
  }

  return rows.map((row) => ({
    ...row,
    balanceAfter: balanceAfter.get(row.id) ?? row.balanceAfter,
  }))
}

export function formatTransferBalance(row: XCoinTransferRecord) {
  const value = row.balanceAfter
  if (value == null || Number.isNaN(value)) return '—'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function mockTransferAt(daysAgo: number, hour: number, minute: number, second: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, second, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(hour)}:${pad(minute)}:${pad(second)}`
}

const RAW_MOCK_TRANSFER_RECORDS: XCoinTransferRecord[] = [
  // —— 两步交收：我给直属代理下分 10 → 平台同步给我上分 10（额度退回）——
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
    amount: 10,
    createdAt: mockTransferAt(0, 21, 4, 2),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 'r1b',
    summary: '收入-给代理下分',
    relationLabel: '我 → 直属代理',
  },
  {
    id: 'r1b',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 10,
    createdAt: mockTransferAt(0, 21, 4, 3),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 'r1',
    summary: '收入-平台回退上分',
    relationLabel: '平台 → 我',
  },

  // —— 一级代理首次上分：来源为平台 ——
  {
    id: 'r2',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 200,
    createdAt: mockTransferAt(0, 18, 30, 11),
    creditCurrency: '信用额度-CNY',
    summary: '收入-平台首次授信',
    relationLabel: '平台 → 我',
  },

  // —— 二级代理首次上分：来源为直属上级（一级代理）——
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
    createdAt: mockTransferAt(1, 14, 22, 8),
    creditCurrency: '信用额度-USD',
    summary: '收入-上级首次授信',
    relationLabel: '直属上级 mid_eyv4menuoax → 我',
  },

  // —— 两步交收：我给直属会员上分 30 → 平台同步给我下分 30（额度扣减）——
  {
    id: 'r6u',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'self',
    targetType: 'direct_member',
    targetMemberId: 'm1',
    targetName: 'openapi31axy8',
    superiorAgentName: '我',
    memberId: 'm1',
    memberName: 'openapi31axy8',
    amount: -30,
    createdAt: mockTransferAt(0, 11, 8, 19),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 'r6ub',
    summary: '支出-给会员上分',
    relationLabel: '我 → 直属会员',
  },
  {
    id: 'r6ub',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: -30,
    createdAt: mockTransferAt(0, 11, 8, 20),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 'r6u',
    summary: '支出-平台回收',
    relationLabel: '平台 → 我',
  },

  // —— 两步交收：我给直属会员下分 12.5 → 平台同步给我上分 12.5 ——
  {
    id: 'r10',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_member',
    targetMemberId: 'm2',
    targetName: 'mid_eyv4menuoax',
    superiorAgentName: '我',
    memberId: 'm2',
    memberName: 'mid_eyv4menuoax',
    amount: 12.5,
    createdAt: mockTransferAt(2, 15, 20, 8),
    creditCurrency: '信用额度-USD',
    relatedRecordId: 'r10b',
    summary: '收入-给会员下分',
    relationLabel: '我 → 直属会员',
  },
  {
    id: 'r10b',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 12.5,
    createdAt: mockTransferAt(2, 15, 20, 9),
    creditCurrency: '信用额度-USD',
    relatedRecordId: 'r10',
    summary: '收入-平台回退上分',
    relationLabel: '平台 → 我',
  },

  // —— 非直属代理给我上分（非首次，链路中转）——
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
    createdAt: mockTransferAt(1, 9, 15, 44),
    creditCurrency: '信用额度-CNY',
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
    createdAt: mockTransferAt(2, 16, 40, 33),
    creditCurrency: '信用额度-USD',
    summary: '收入-城市渠道王哥',
    relationLabel: '非直属代理 城市渠道王哥 → 我',
  },

  // —— 上级下分 ——
  {
    id: 'r11',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'direct_superior',
    sourceAgentId: 'a_super',
    sourceAgentName: 'mid_eyv4menuoax',
    sourceAgentRelation: 'direct_superior',
    targetType: 'self',
    superiorAgentId: 'a_super',
    superiorAgentName: 'mid_eyv4menuoax',
    memberName: '我',
    amount: -40,
    createdAt: mockTransferAt(0, 16, 12, 6),
    creditCurrency: '信用额度-CNY',
    summary: '支出-上级下分',
    relationLabel: '直属上级 mid_eyv4menuoax → 我',
  },

  // —— 两步交收：我给直属代理上分 25 → 平台同步回收 25 ——
  {
    id: 'r12',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'self',
    targetType: 'direct_agent',
    targetAgentId: 'a_ez1',
    targetName: '小红来了EZ1',
    superiorAgentName: '我',
    memberName: '小红来了EZ1',
    amount: -25,
    createdAt: mockTransferAt(0, 13, 40, 10),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 'r12b',
    summary: '支出-给代理上分',
    relationLabel: '我 → 直属代理',
  },
  {
    id: 'r12b',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: -25,
    createdAt: mockTransferAt(0, 13, 40, 11),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 'r12',
    summary: '支出-平台回收',
    relationLabel: '平台 → 我',
  },

  // —— 退水：对象只能是我，看不到其他人退水 ——
  {
    id: 'r7',
    recordType: 'daily_rebate',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 8.6,
    createdAt: mockTransferAt(0, 0, 5, 12),
    creditCurrency: '信用额度-CNY',
    summary: '退水-我',
    relationLabel: '平台 → 我',
  },
  {
    id: 'r8',
    recordType: 'daily_rebate',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 15.2,
    createdAt: mockTransferAt(0, 0, 5, 18),
    creditCurrency: '信用额度-USD',
    summary: '退水-我',
    relationLabel: '平台 → 我',
  },

  // —— 今天 · 九个场景各一条（下游与平台两步交收成对；金额正负=我的额度）——
  {
    id: 's_refund',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 36,
    createdAt: mockTransferAt(0, 21, 32, 10),
    creditCurrency: '信用额度-CNY',
    summary: '收入-平台回退',
    relationLabel: '平台 → 我',
  },
  {
    id: 's_reclaim',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: -22,
    createdAt: mockTransferAt(0, 21, 33, 10),
    creditCurrency: '信用额度-CNY',
    summary: '支出-平台回收',
    relationLabel: '平台 → 我',
  },
  {
    id: 's_rebate',
    recordType: 'daily_rebate',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 4.2,
    createdAt: mockTransferAt(0, 21, 34, 10),
    creditCurrency: '信用额度-CNY',
    summary: '退水-我',
    relationLabel: '平台 → 我',
  },
  {
    id: 's_superior_up',
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
    amount: 70,
    createdAt: mockTransferAt(0, 21, 35, 10),
    creditCurrency: '信用额度-CNY',
    summary: '收入-上级上分',
    relationLabel: '直属上级 mid_eyv4menuoax → 我',
  },
  {
    id: 's_superior_down',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'direct_superior',
    sourceAgentId: 'a_super',
    sourceAgentName: 'mid_eyv4menuoax',
    sourceAgentRelation: 'direct_superior',
    targetType: 'self',
    superiorAgentId: 'a_super',
    superiorAgentName: 'mid_eyv4menuoax',
    memberName: '我',
    amount: -28,
    createdAt: mockTransferAt(0, 21, 36, 10),
    creditCurrency: '信用额度-CNY',
    summary: '支出-上级下分',
    relationLabel: '直属上级 mid_eyv4menuoax → 我',
  },
  {
    id: 's_agent_up',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'self',
    targetType: 'direct_agent',
    targetAgentId: 'a_ez1',
    targetName: '小红来了EZ1',
    superiorAgentName: '我',
    memberName: '小红来了EZ1',
    amount: -22,
    createdAt: mockTransferAt(0, 21, 37, 10),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_agent_up_b',
    summary: '支出-给代理上分',
    relationLabel: '我 → 直属代理',
  },
  {
    id: 's_agent_up_b',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: -22,
    createdAt: mockTransferAt(0, 21, 37, 11),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_agent_up',
    summary: '支出-平台回收',
    relationLabel: '平台 → 我',
  },
  {
    id: 's_member_up',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'self',
    targetType: 'direct_member',
    targetMemberId: 'm1',
    targetName: 'openapi31axy8',
    superiorAgentName: '我',
    memberId: 'm1',
    memberName: 'openapi31axy8',
    amount: -19,
    createdAt: mockTransferAt(0, 21, 38, 10),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_member_up_b',
    summary: '支出-给会员上分',
    relationLabel: '我 → 直属会员',
  },
  {
    id: 's_member_up_b',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: -19,
    createdAt: mockTransferAt(0, 21, 38, 11),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_member_up',
    summary: '支出-平台回收',
    relationLabel: '平台 → 我',
  },
  {
    id: 's_agent_down',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_agent',
    targetAgentId: 'a_ez1',
    targetName: '小红来了EZ1',
    superiorAgentName: '我',
    memberName: '小红来了EZ1',
    amount: 14,
    createdAt: mockTransferAt(0, 21, 39, 10),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_agent_down_b',
    summary: '收入-给代理下分',
    relationLabel: '我 → 直属代理',
  },
  {
    id: 's_agent_down_b',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 14,
    createdAt: mockTransferAt(0, 21, 39, 11),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_agent_down',
    summary: '收入-平台回退',
    relationLabel: '平台 → 我',
  },
  {
    id: 's_member_down',
    recordType: 'credit_down',
    direction: 'credit_down',
    sourceType: 'self',
    targetType: 'direct_member',
    targetMemberId: 'm2',
    targetName: 'mid_eyv4menuoax',
    superiorAgentName: '我',
    memberId: 'm2',
    memberName: 'mid_eyv4menuoax',
    amount: 9,
    createdAt: mockTransferAt(0, 21, 40, 10),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_member_down_b',
    summary: '收入-给会员下分',
    relationLabel: '我 → 直属会员',
  },
  {
    id: 's_member_down_b',
    recordType: 'credit_up',
    direction: 'credit_up',
    sourceType: 'platform',
    targetType: 'self',
    superiorAgentName: '平台',
    memberName: '我',
    amount: 9,
    createdAt: mockTransferAt(0, 21, 40, 11),
    creditCurrency: '信用额度-CNY',
    relatedRecordId: 's_member_down',
    summary: '收入-平台回退',
    relationLabel: '平台 → 我',
  },
]

export const MOCK_TRANSFER_RECORDS = attachTransferBalances(RAW_MOCK_TRANSFER_RECORDS)

export const MOCK_SELECTABLE_MEMBERS: XCoinSelectableTarget[] = [
  {
    id: 'm1',
    nickname: 'openapi31axy8',
    kingkongId: '66880031',
    userId: '10031001',
    accountId: 'mid_openapi31',
    relation: 'direct_member',
    credits: {
      '信用额度-CNY': { availableCredit: 0, creditUpTotal: 0, creditDownTotal: 0 },
      '信用额度-USD': { availableCredit: 0, creditUpTotal: 20, creditDownTotal: 20 },
    },
  },
  {
    id: 'm2',
    nickname: 'mid_eyv4menuoax',
    kingkongId: '88661202',
    userId: '10032002',
    accountId: 'mid_eyv4menuoax',
    relation: 'direct_member',
    credits: {
      '信用额度-CNY': { availableCredit: 68.99, creditUpTotal: 320, creditDownTotal: 66 },
      '信用额度-USD': { availableCredit: 25.5, creditUpTotal: 80, creditDownTotal: 12.5 },
    },
  },
  {
    id: 'm3',
    nickname: '小红来了EZ1',
    kingkongId: '88661234',
    userId: '10033003',
    accountId: 'mid_ez1',
    relation: 'non_direct_member',
    credits: {
      '信用额度-CNY': { availableCredit: 12.5, creditUpTotal: 150, creditDownTotal: 50 },
      '信用额度-USD': { availableCredit: 8, creditUpTotal: 40, creditDownTotal: 10 },
    },
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
    credits: {
      '信用额度-CNY': { availableCredit: 0, creditUpTotal: 0, creditDownTotal: 0 },
      '信用额度-USD': { availableCredit: 5, creditUpTotal: 30, creditDownTotal: 10 },
    },
  },
  {
    id: 'a2',
    nickname: '小红来了EZ1',
    kingkongId: '88661234',
    userId: '20033003',
    accountId: 'mid_ez1',
    relation: 'direct_agent',
    credits: {
      '信用额度-CNY': { availableCredit: 413, creditUpTotal: 1200, creditDownTotal: 334 },
      '信用额度-USD': { availableCredit: 88, creditUpTotal: 260, creditDownTotal: 40 },
    },
  },
  {
    id: 'a3',
    nickname: '华南合伙人·李',
    kingkongId: '77550018',
    userId: '20034004',
    accountId: 'mid_hn_li',
    relation: 'non_direct_agent',
    credits: {
      '信用额度-CNY': { availableCredit: 120, creditUpTotal: 700, creditDownTotal: 200 },
      '信用额度-USD': { availableCredit: 45, creditUpTotal: 180, creditDownTotal: 60 },
    },
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

/** 两步交收关联单号（上分↔源头下分，下分↔源头上分） */
export function transferRelatedOrderNo(
  row: XCoinTransferRecord,
  all: XCoinTransferRecord[] = MOCK_TRANSFER_RECORDS,
) {
  if (!row.relatedRecordId) return null
  const related = all.find((item) => item.id === row.relatedRecordId)
  return related ? transferRecordOrderNo(related) : null
}

/** 账单卡片：发起人 → 对象；「我」展示为昵称（无则金刚号） */
export function recordFlowDisplay(row: XCoinTransferRecord): RecordFlowDisplay {
  const selfLabel = formatTransferSelfLabel()

  if (row.recordType === 'daily_rebate') {
    return {
      initiator: '平台',
      target: selfLabel,
    }
  }

  if (row.sourceType === 'platform' && row.targetType === 'self') {
    return { initiator: '平台', target: selfLabel }
  }
  if (row.sourceType === 'direct_superior' && row.targetType === 'self') {
    return {
      initiator: row.sourceAgentName || row.superiorAgentName || '直属上级',
      target: selfLabel,
    }
  }
  if (row.sourceType === 'non_direct_agent' && row.targetType === 'self') {
    return {
      initiator: row.sourceAgentName || row.superiorAgentName || '非直属代理',
      target: selfLabel,
    }
  }
  if (row.sourceType === 'self' && row.targetType === 'direct_agent') {
    return {
      initiator: selfLabel,
      target: row.targetName || row.memberName || '—',
    }
  }
  if (row.sourceType === 'self' && row.targetType === 'direct_member') {
    return {
      initiator: selfLabel,
      target: row.targetName || row.memberName || '—',
    }
  }

  const parts = row.relationLabel.split('→').map((s) => s.trim())
  if (parts.length === 2) {
    return {
      initiator: parts[0] === '我' ? selfLabel : parts[0],
      target: parts[1] === '我' ? selfLabel : parts[1],
    }
  }
  return { initiator: '—', target: '—' }
}

export function matchTransferRecordPerson(row: XCoinTransferRecord, keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return true
  const self = MOCK_TRANSFER_SELF_PROFILE
  const involvesSelf =
    row.targetType === 'self' ||
    row.sourceType === 'self' ||
    row.memberName === '我' ||
    row.targetName === '我'
  const fields = [
    row.superiorAgentName,
    row.memberName,
    row.targetName,
    row.sourceAgentName,
    ...(involvesSelf ? [self.nickname, self.kingkongId, formatTransferSelfLabel()] : []),
  ].filter(Boolean) as string[]
  return fields.some((name) => name.toLowerCase().includes(q))
}

/** 下游对象类型：会员 / 代理 */
export function matchTransferRecordRole(row: XCoinTransferRecord, role: TransferRoleFilter) {
  if (!role) return true
  if (role === 'agent') return row.targetType === 'direct_agent'
  return row.targetType === 'direct_member'
}

export function matchTransferRecordInitiator(
  row: XCoinTransferRecord,
  initiator: TransferInitiatorFilter,
) {
  if (!initiator) return true
  if (initiator === 'self') return row.sourceType === 'self'
  if (initiator === 'platform') return row.sourceType === 'platform'
  return row.sourceType === 'direct_superior'
}

export function matchTransferRecordCurrency(
  row: XCoinTransferRecord,
  currency: TransferCreditCurrencyFilter,
) {
  if (!currency) return true
  return row.creditCurrency === currency
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getTransferRecordDateRange(
  filter: Pick<TransferRecordFilter, 'timePreset' | 'customStart' | 'customEnd'>,
) {
  const now = new Date()
  const today = startOfDay(now)

  if (filter.timePreset === 'today') {
    return { start: today, end: endOfDay(now) }
  }
  if (filter.timePreset === 'yesterday') {
    const y = new Date(today)
    y.setDate(y.getDate() - 1)
    return { start: y, end: endOfDay(y) }
  }
  if (filter.timePreset === 'week') {
    const start = new Date(today)
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
    return { start, end: endOfDay(now) }
  }
  if (filter.timePreset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start, end: endOfDay(now) }
  }

  const start = filter.customStart ? startOfDay(new Date(filter.customStart)) : today
  const end = filter.customEnd ? endOfDay(new Date(filter.customEnd)) : endOfDay(now)
  return { start, end }
}

export function validateTransferRecordDateRange(
  filter: Pick<TransferRecordFilter, 'timePreset' | 'customStart' | 'customEnd'>,
) {
  if (filter.timePreset !== 'custom') return null
  if (!filter.customStart || !filter.customEnd) return '请选择自定义起止日期'
  const { start, end } = getTransferRecordDateRange(filter)
  if (start > end) return '开始日期不能晚于结束日期'
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > TRANSFER_RECORD_MAX_RANGE_DAYS) {
    return `移动端仅支持查询近 ${TRANSFER_RECORD_MAX_RANGE_DAYS} 天数据，更多数据请前往 PC 端导出`
  }
  return null
}

function matchTransferRecordTime(
  row: XCoinTransferRecord,
  filter: Pick<TransferRecordFilter, 'timePreset' | 'customStart' | 'customEnd'>,
) {
  const { start, end } = getTransferRecordDateRange(filter)
  const at = new Date(row.createdAt.replace(' ', 'T'))
  return at >= start && at <= end
}

function matchTransferRecordKeyword(row: XCoinTransferRecord, keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return true
  const orderNo = transferRecordOrderNo(row).toLowerCase()
  if (orderNo.includes(q)) return true
  return matchTransferRecordPerson(row, keyword)
}

export function filterTransferRecords(
  rows: XCoinTransferRecord[],
  filter: TransferRecordFilter,
  options?: { ignoreCurrency?: boolean },
) {
  return rows.filter((row) => {
    if (!matchTransferRecordTime(row, filter)) return false
    if (filter.lane && filter.lane !== 'all' && transferRecordLane(row) !== filter.lane) return false
    if (filter.scene && transferRecordScene(row) !== filter.scene) return false
    if (filter.recordType && row.recordType !== filter.recordType) return false
    if (!matchTransferRecordInitiator(row, filter.initiator)) return false
    if (!matchTransferRecordRole(row, filter.role)) return false
    if (!options?.ignoreCurrency && !matchTransferRecordCurrency(row, filter.currency)) return false
    if (!matchTransferRecordKeyword(row, filter.keyword)) return false
    return true
  })
}

export type TransferCurrencySummary = {
  currency: XCoinCreditCurrency
  label: string
  count: number
  upTotal: number
  downTotal: number
  net: number
}

export function summarizeTransferRecordsByCurrency(
  rows: XCoinTransferRecord[],
): TransferCurrencySummary[] {
  return XCOIN_CREDIT_CURRENCY_TABS.map(({ key, label }) => {
    const list = rows.filter((row) => row.creditCurrency === key)
    let upTotal = 0
    let downTotal = 0
    for (const row of list) {
      if (row.recordType === 'credit_down') downTotal += Math.abs(row.amount)
      else upTotal += Math.abs(row.amount)
    }
    return {
      currency: key,
      label,
      count: list.length,
      upTotal,
      downTotal,
      net: upTotal - downTotal,
    }
  })
}

export type TransferLaneCurrencySummary = {
  currency: XCoinCreditCurrency
  label: string
  count: number
  /** 上分总额：上级上分 + 平台回退 */
  creditUpTotal: number
  /** 下分总额：上级下分 − 平台回收 */
  creditDownTotal: number
  /** 上下分净额：上分总额 − 下分总额 */
  creditNet: number
  /** 退水：平台退水 */
  rebate: number
}

export function summarizeTransferLaneByCurrency(
  rows: XCoinTransferRecord[],
): TransferLaneCurrencySummary[] {
  return XCOIN_CREDIT_CURRENCY_TABS.map(({ key, label }) => {
    const list = rows.filter((row) => row.creditCurrency === key)
    let superiorUp = 0
    let superiorDown = 0
    let platformRefund = 0
    let platformReclaim = 0
    let platformRebate = 0
    for (const row of list) {
      const abs = Math.abs(row.amount)
      const scene = transferRecordScene(row)
      if (scene === 'superior_up') superiorUp += abs
      else if (scene === 'superior_down') superiorDown += abs
      else if (scene === 'platform_refund') platformRefund += abs
      else if (scene === 'platform_reclaim') platformReclaim += abs
      else if (scene === 'platform_rebate') platformRebate += abs
    }
    const creditUpTotal = Number((superiorUp + platformRefund).toFixed(2))
    const creditDownTotal = Number((superiorDown - platformReclaim).toFixed(2))
    return {
      currency: key,
      label,
      count: list.length,
      creditUpTotal,
      creditDownTotal,
      creditNet: Number((creditUpTotal - creditDownTotal).toFixed(2)),
      rebate: Number(platformRebate.toFixed(2)),
    }
  })
}

export function formatTransferAmount(row: XCoinTransferRecord) {
  const delta = transferMyCreditDelta(row)
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(2)}`
}

export function transferAmountClass(row: XCoinTransferRecord) {
  if (transferRecordScene(row) === 'platform_rebate') return 'mh5-xcoin-transfer__amount--rebate'
  if (transferMyCreditDelta(row) < 0) return 'mh5-xcoin-transfer__amount--down'
  return 'mh5-xcoin-transfer__amount--up'
}

export function transferTypeStatusClass(type: TransferRecordType) {
  if (type === 'credit_up') return 'mh5-xcoin-transfer__status--up'
  if (type === 'credit_down') return 'mh5-xcoin-transfer__status--down'
  return 'mh5-xcoin-transfer__status--rebate'
}

export function transferSceneStatusClass(row: XCoinTransferRecord) {
  if (transferRecordScene(row) === 'platform_rebate') return 'mh5-xcoin-transfer__status--rebate'
  if (transferMyCreditDelta(row) < 0) return 'mh5-xcoin-transfer__status--down'
  return 'mh5-xcoin-transfer__status--up'
}

export function transferRecordTitle(row: XCoinTransferRecord) {
  const flow = recordFlowDisplay(row)
  const selfLabel = formatTransferSelfLabel()
  // 优先展示对方；若对象是自己则展示自己的昵称/金刚号
  if (flow.target && flow.target !== selfLabel) return flow.target
  if (flow.target === selfLabel) return selfLabel
  if (flow.initiator && flow.initiator !== selfLabel) return flow.initiator
  return flow.target || flow.initiator || '—'
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
