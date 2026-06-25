/** 代理结算对账 · 数据模型与 Mock */

import { SETTLEMENT_LOCALE, settlementT } from './agentSettlementI18n'

export const TransactionType = {
  UP: 'UP',
  DOWN: 'DOWN',
} as const

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

export interface TransactionRecord {
  txId: string
  agentId: string
  type: TransactionType
  amount: number
  timestamp: number
  currency: string
}

export interface AgentSummary {
  agentId: string
  agentName: string
  avatarUrl?: string
  totalUp: number
  totalDown: number
}

/** 净额 = 下分 − 上分；正数代理欠款，负数需线下支付给代理 */
export function calcSettlementNet(totalUp: number, totalDown: number) {
  return totalDown - totalUp
}

export type AgentSummaryWithNet = AgentSummary & { netAmount: number }

export const SETTLEMENT_MONTH_OPTIONS = [
  { value: '' },
  { value: '2026-06' },
  { value: '2026-05' },
  { value: '2026-04' },
] as const

export type SettlementMonth = (typeof SETTLEMENT_MONTH_OPTIONS)[number]['value']

export const MOCK_AGENT_SUMMARIES: AgentSummary[] = [
  {
    agentId: 'a_ez1',
    agentName: '小红来了EZ1',
    avatarUrl: '',
    totalUp: 12800,
    totalDown: 5200,
  },
  {
    agentId: 'a_star',
    agentName: '星辰代理',
    avatarUrl: '',
    totalUp: 4500,
    totalDown: 6800,
  },
  {
    agentId: 'a_lucky',
    agentName: '好运连连',
    avatarUrl: '',
    totalUp: 3200,
    totalDown: 3100,
  },
  {
    agentId: 'a_wind',
    agentName: '风行天下',
    avatarUrl: '',
    totalUp: 8900,
    totalDown: 2400,
  },
]

export const MOCK_TRANSACTION_RECORDS: TransactionRecord[] = [
  {
    txId: 'TX20260624001',
    agentId: 'a_ez1',
    type: TransactionType.UP,
    amount: 5000,
    timestamp: 1750694400,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260623002',
    agentId: 'a_ez1',
    type: TransactionType.DOWN,
    amount: 2000,
    timestamp: 1750608000,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260622003',
    agentId: 'a_ez1',
    type: TransactionType.UP,
    amount: 3800,
    timestamp: 1750521600,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260621004',
    agentId: 'a_ez1',
    type: TransactionType.DOWN,
    amount: 1200,
    timestamp: 1750435200,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260620005',
    agentId: 'a_ez1',
    type: TransactionType.UP,
    amount: 4000,
    timestamp: 1750348800,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260620006',
    agentId: 'a_ez1',
    type: TransactionType.DOWN,
    amount: 2000,
    timestamp: 1750262400,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260619007',
    agentId: 'a_star',
    type: TransactionType.UP,
    amount: 2500,
    timestamp: 1750176000,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260618008',
    agentId: 'a_star',
    type: TransactionType.DOWN,
    amount: 3800,
    timestamp: 1750089600,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260617009',
    agentId: 'a_star',
    type: TransactionType.UP,
    amount: 2000,
    timestamp: 1750003200,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260616010',
    agentId: 'a_star',
    type: TransactionType.DOWN,
    amount: 3000,
    timestamp: 1749916800,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260615011',
    agentId: 'a_wind',
    type: TransactionType.UP,
    amount: 4500,
    timestamp: 1749830400,
    currency: settlementT('currency'),
  },
  {
    txId: 'TX20260614012',
    agentId: 'a_wind',
    type: TransactionType.DOWN,
    amount: 1200,
    timestamp: 1749744000,
    currency: settlementT('currency'),
  },
]

function formatAmountNumber(value: number, withSign = false) {
  const sign = withSign ? (value > 0 ? '+' : value < 0 ? '-' : '') : ''
  const abs = Math.abs(value).toLocaleString(SETTLEMENT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${abs}`
}

/** 金额展示：数值 + 空格 + 币种（保持系统既定顺序） */
export function formatSettlementAmount(value: number, withSign = false) {
  return `${formatAmountNumber(value, withSign)} ${settlementT('currency')}`
}

/** 流水单项金额（带上分/下分正负号） */
export function formatTxAmount(type: TransactionType, amount: number) {
  const sign = type === TransactionType.UP ? '+' : '-'
  const abs = amount.toLocaleString(SETTLEMENT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${abs} ${settlementT('currency')}`
}

export function formatTxTimestamp(ts: number) {
  const d = new Date(ts * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 净额颜色：正数代理欠款 → 绿；负数需向代理支付 → 红/橙 */
export function settlementNetClass(net: number) {
  if (net > 0) return 'mh5-settlement-amount--owe'
  if (net < 0) return 'mh5-settlement-amount--pay'
  return 'mh5-settlement-amount--zero'
}

export function filterTransactions(
  records: TransactionRecord[],
  agentId: string,
  month?: SettlementMonth,
) {
  return records
    .filter((r) => {
      if (r.agentId !== agentId) return false
      if (!month) return true
      const d = new Date(r.timestamp * 1000)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return key === month
    })
    .sort((a, b) => b.timestamp - a.timestamp)
}
