/** PC 信用额度上下分记录 · Mock 数据与类型 */

export type CreditInitiatorType = 'admin' | 'agent' | 'system'
export type CreditTargetType = 'member' | 'agent'
export type CreditTransferMode = 'up' | 'down'
export type CreditTransferStatus = 'success' | 'failed'

export type CreditLimitTransferRow = {
  id: string
  flowNo: string
  username: string
  userId: string
  amount: number
  initiatorType: CreditInitiatorType
  transferMode: CreditTransferMode
  targetType: CreditTargetType
  initiatorName: string
  initiatorId: string
  occurredAt: string
  status: CreditTransferStatus
  remark: string
  /** 关联流水号（用于关联记录弹框） */
  relatedFlowNo: string
}

export type CreditRelatedRecord = {
  flowNo: string
  username: string
  userId: string
  amount: number
  initiatorType: CreditInitiatorType | 'platform'
  transferMode: CreditTransferMode
  targetType: CreditTargetType
  initiatorName: string
}

export type CreditTopAgentRow = {
  id: string
  username: string
  userId: string
  kingKongId: string
  cashAccount: string
  cashPassword: string
  creditAccount: string
  creditPassword: string
  creditBalance: number
}

export const CREDIT_INITIATOR_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'admin', label: '后台' },
  { value: 'agent', label: '代理' },
  { value: 'system', label: '系统' },
] as const

export const CREDIT_TARGET_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'member', label: '会员' },
  { value: 'agent', label: '代理' },
] as const

export const CREDIT_TRANSFER_MODE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'up', label: '上分' },
  { value: 'down', label: '下分' },
] as const

export const CREDIT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' },
] as const

export const CREDIT_REBATE_EARN_OPTIONS = [
  { value: '', label: '请选择赚取退水' },
  { value: 'yes', label: '是' },
  { value: 'no', label: '否' },
] as const

export const CREDIT_TRANSFER_MODE_FORM_OPTIONS = [
  { value: '', label: '请选择' },
  { value: 'up', label: '上分' },
  { value: 'down', label: '下分' },
] as const

export function initiatorTypeLabel(type: CreditInitiatorType | 'platform') {
  if (type === 'admin') return '后台'
  if (type === 'agent') return '代理'
  if (type === 'platform') return '平台'
  return '系统'
}

export function targetTypeLabel(type: CreditTargetType) {
  return type === 'member' ? '会员' : '代理'
}

export function transferModeLabel(mode: CreditTransferMode) {
  return mode === 'up' ? '上分' : '下分'
}

export function statusLabel(status: CreditTransferStatus) {
  return status === 'success' ? '成功' : '失败'
}

export const MOCK_CREDIT_LIMIT_TRANSFER_ROWS: CreditLimitTransferRow[] = [
  {
    id: '1',
    flowNo: '1780494348910ji94081',
    username: '测试',
    userId: '4635208113430024628',
    amount: 0.2,
    initiatorType: 'agent',
    transferMode: 'down',
    targetType: 'member',
    initiatorName: 'hwdlz5ro',
    initiatorId: '222187',
    occurredAt: '2026-05-29 13:25:46',
    status: 'success',
    remark: '-',
    relatedFlowNo: '1780494348910ji94081',
  },
  {
    id: '2',
    flowNo: '1780494348910ji94082',
    username: 'X币',
    userId: '2537586229811479813',
    amount: -0.2,
    initiatorType: 'agent',
    transferMode: 'up',
    targetType: 'member',
    initiatorName: 'hwdlz5ro',
    initiatorId: '222187',
    occurredAt: '2026-05-29 13:25:46',
    status: 'success',
    remark: '-',
    relatedFlowNo: '1780494348910ji94081',
  },
  {
    id: '3',
    flowNo: '1780501122334455aa01',
    username: '棋王阿杰',
    userId: '3180664521199420636',
    amount: 200,
    initiatorType: 'system',
    transferMode: 'up',
    targetType: 'agent',
    initiatorName: 'System',
    initiatorId: '0',
    occurredAt: '2026-06-01 10:12:08',
    status: 'success',
    remark: '系统补分',
    relatedFlowNo: '1780501122334455aa01',
  },
  {
    id: '4',
    flowNo: '1780509988776655bb02',
    username: '明哥888',
    userId: '3180664521199420701',
    amount: -50,
    initiatorType: 'admin',
    transferMode: 'down',
    targetType: 'agent',
    initiatorName: 'ops_admin',
    initiatorId: '10086',
    occurredAt: '2026-06-08 16:40:22',
    status: 'success',
    remark: '风控扣减',
    relatedFlowNo: '1780509988776655bb02',
  },
  {
    id: '5',
    flowNo: '1780512233445566cc03',
    username: '小林棋王',
    userId: '3180664521199420888',
    amount: 1000,
    initiatorType: 'agent',
    transferMode: 'up',
    targetType: 'member',
    initiatorName: 'rlzm2qi3',
    initiatorId: '334455',
    occurredAt: '2026-07-02 09:18:33',
    status: 'failed',
    remark: '余额不足',
    relatedFlowNo: '1780512233445566cc03',
  },
]

export const MOCK_CREDIT_TOP_AGENTS: CreditTopAgentRow[] = [
  {
    id: 'ta-1',
    username: 'rlzm2qi3',
    userId: '22210001',
    kingKongId: 'KK90001',
    cashAccount: 'cash_rlzm',
    cashPassword: '******',
    creditAccount: 'credit_rlzm',
    creditPassword: '******',
    creditBalance: 12880.5,
  },
  {
    id: 'ta-2',
    username: 'hwdlz5ro',
    userId: '222187',
    kingKongId: 'KK90087',
    cashAccount: 'cash_hwdl',
    cashPassword: '******',
    creditAccount: 'credit_hwdl',
    creditPassword: '******',
    creditBalance: 560.2,
  },
]

/** 关联记录：原始记录 + 对侧关联记录 */
export function buildRelatedRecords(row: CreditLimitTransferRow): {
  original: CreditRelatedRecord
  related: CreditRelatedRecord
} {
  const original: CreditRelatedRecord = {
    flowNo: row.flowNo,
    username: row.username,
    userId: row.userId,
    amount: row.amount,
    initiatorType: row.initiatorType,
    transferMode: row.transferMode,
    targetType: row.targetType,
    initiatorName: row.initiatorName,
  }

  const related: CreditRelatedRecord = {
    flowNo: row.relatedFlowNo || row.flowNo,
    username: row.initiatorType === 'agent' ? row.initiatorName : '平台账户',
    userId: row.initiatorType === 'agent' ? row.initiatorId : '0',
    amount: -row.amount,
    initiatorType: row.initiatorType === 'agent' ? 'platform' : 'system',
    transferMode: row.transferMode === 'up' ? 'down' : 'up',
    targetType: 'agent',
    initiatorName: 'System',
  }

  return { original, related }
}

export function formatCreditAmount(value: number) {
  const abs = Math.abs(value).toFixed(2)
  return value >= 0 ? `+${abs}` : `-${abs}`
}

export function formatCreditBalance(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
