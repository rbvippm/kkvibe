/** PC 信用额度记录 · Mock 数据与类型 */

import {
  hasCreditAgentCredentials,
  MOCK_SHARE_AGENT_ROWS,
} from './pcShareAgent'

export type CreditInitiatorType = 'admin' | 'agent' | 'system'
export type CreditTargetType = 'member' | 'agent'
export type CreditTransferMode = 'up' | 'down' | 'agent_rebate'
export type CreditTransferModeBasic = 'up' | 'down'
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
  transferMode: CreditTransferModeBasic
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
  { value: 'agent_rebate', label: '代理退水' },
] as const

/** 代理退水固定备注 */
export const AGENT_REBATE_REMARK = '系统代理退水'

export const CREDIT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' },
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
  if (mode === 'agent_rebate') return '代理退水'
  return mode === 'up' ? '上分' : '下分'
}

/** 代理退水：系统发起、对象为代理、备注固定、无关联记录 */
export function isAgentRebateRow(row: Pick<CreditLimitTransferRow, 'transferMode'>) {
  return row.transferMode === 'agent_rebate'
}

export function hasRelatedRecord(row: CreditLimitTransferRow) {
  return !isAgentRebateRow(row) && Boolean(row.relatedFlowNo)
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
  {
    id: '6',
    flowNo: '1780523344556677dd04',
    username: 'rlzm2qi3',
    userId: '22210001',
    amount: 88.5,
    initiatorType: 'system',
    transferMode: 'agent_rebate',
    targetType: 'agent',
    initiatorName: 'System',
    initiatorId: '0',
    occurredAt: '2026-07-10 11:20:00',
    status: 'success',
    remark: AGENT_REBATE_REMARK,
    relatedFlowNo: '',
  },
  {
    id: '7',
    flowNo: '1780524455667788ee05',
    username: 'hwdlz5ro',
    userId: '222187',
    amount: 36,
    initiatorType: 'system',
    transferMode: 'agent_rebate',
    targetType: 'agent',
    initiatorName: 'System',
    initiatorId: '0',
    occurredAt: '2026-07-12 18:05:41',
    status: 'success',
    remark: AGENT_REBATE_REMARK,
    relatedFlowNo: '',
  },
]

function parseCreditBalance(raw: string): number {
  const [left = '', right = ''] = raw.split('/')
  const current = Number(left)
  if (!Number.isNaN(current)) return current
  const fallback = Number(right)
  return Number.isNaN(fallback) ? 0 : fallback
}

/**
 * 上下分可选对象：占成代理配置中已授信的一级代理
 *（agentLevel=1 且具备信用账密）
 */
export function listCreditLevel1Agents(): CreditTopAgentRow[] {
  return MOCK_SHARE_AGENT_ROWS.filter(
    (row) =>
      row.agentLevel === 1 && row.isCreditAgent && hasCreditAgentCredentials(row) && !row.disabled,
  ).map((row) => ({
    id: String(row.id),
    username: row.username,
    userId: row.userId,
    kingKongId: row.kingKongId,
    cashAccount: row.cashAgentAccount,
    cashPassword: row.cashAgentPassword,
    creditAccount: row.creditAgentAccount,
    creditPassword: row.creditAgentPassword,
    creditBalance: parseCreditBalance(row.xCoinBalance),
  }))
}

/** 关联记录：原始记录 + 对侧关联记录（代理退水无关联记录） */
export function buildRelatedRecords(row: CreditLimitTransferRow): {
  original: CreditRelatedRecord
  related: CreditRelatedRecord
} | null {
  if (!hasRelatedRecord(row)) return null

  const mode: CreditTransferModeBasic = row.transferMode === 'down' ? 'down' : 'up'

  const original: CreditRelatedRecord = {
    flowNo: row.flowNo,
    username: row.username,
    userId: row.userId,
    amount: row.amount,
    initiatorType: row.initiatorType,
    transferMode: mode,
    targetType: row.targetType,
    initiatorName: row.initiatorName,
  }

  const related: CreditRelatedRecord = {
    flowNo: row.relatedFlowNo || row.flowNo,
    username: row.initiatorType === 'agent' ? row.initiatorName : '平台账户',
    userId: row.initiatorType === 'agent' ? row.initiatorId : '0',
    amount: -row.amount,
    initiatorType: row.initiatorType === 'agent' ? 'platform' : 'system',
    transferMode: mode === 'up' ? 'down' : 'up',
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
