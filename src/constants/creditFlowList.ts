/** 财务管理 · 信用流水列表（全平台用户信用钱包流水）· Mock */

import {
  findUserCreditWallet,
  MOCK_USER_CREDIT_FLOWS,
  USER_CREDIT_TX_TYPES,
  type UserCreditCurrency,
  type UserCreditTxType,
  type UserFundFlowType,
} from './userDetail'

export { USER_CREDIT_TX_TYPES }

export type CreditFlowListRow = {
  id: string
  flowNo: string
  userNickname: string
  userId: string
  agentName: string
  /** 上级代理金刚号 */
  agentId: string
  currency: UserCreditCurrency
  walletId: string
  walletName: string
  flowType: UserFundFlowType
  txType: UserCreditTxType
  summary: string
  operatorNickname: string
  operatorUserId: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  createdAtBackend: string
  createdAtClient: string
}

/** 用户详情默认用户，与用户详情「信用资金明细」同一批流水 */
const DETAIL_USER = { userNickname: '小红呀呀呀呀呀', userId: '7831562076704421988' }

const DETAIL_USER_ROWS: CreditFlowListRow[] = MOCK_USER_CREDIT_FLOWS.map((row) => {
  const wallet = findUserCreditWallet(row.walletKey)
  return {
    id: row.id,
    flowNo: row.flowNo,
    ...DETAIL_USER,
    agentName: wallet?.agentName ?? '-',
    agentId: wallet?.agentKingkongId ?? '-',
    currency: wallet?.currency ?? 'CNY',
    walletId: wallet?.walletId ?? '-',
    walletName: wallet?.walletName ?? '-',
    flowType: row.flowType,
    txType: row.txType,
    summary: row.summary,
    operatorNickname: row.operatorNickname,
    operatorUserId: row.operatorUserId,
    amount: row.amount,
    balanceBefore: row.balanceBefore,
    balanceAfter: row.balanceAfter,
    createdAtBackend: row.createdAtBackend,
    createdAtClient: row.createdAtClient,
  }
})

const VIP888 = {
  userNickname: 'VIP888',
  userId: '7831562076704421995',
  agentName: 'EZ',
  agentId: '66880001',
  currency: 'CNY' as const,
  walletId: '880010101',
  walletName: 'VIP888主钱包',
}

const LI0428 = {
  userNickname: 'li0428',
  userId: '7831562076704421996',
  agentName: '代理 A',
  agentId: '66880002',
  currency: 'USD' as const,
  walletId: '880020105',
  walletName: 'li0428',
}

const DUCK = {
  userNickname: '骄傲的鸭子',
  userId: '7831562076704421997',
  agentName: '代理 B',
  agentId: '66880003',
  currency: 'CNY' as const,
  walletId: '880030108',
  walletName: '鸭子的钱包',
}

const OTHER_USER_ROWS: CreditFlowListRow[] = [
  {
    id: 'pf1',
    flowNo: '389910297457141001',
    ...VIP888,
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: 'EZ',
    operatorUserId: '9054246760393162583',
    amount: 20000,
    balanceBefore: 0,
    balanceAfter: 20000,
    createdAtBackend: '2026-07-09 14:20:00',
    createdAtClient: '2026-07-09 14:20:00',
  },
  {
    id: 'pf2',
    flowNo: '389910297457141002',
    ...VIP888,
    flowType: 'expense',
    txType: '投注',
    summary: '投注【皇者体育】',
    operatorNickname: 'VIP888',
    operatorUserId: '7831562076704421995',
    amount: -3000,
    balanceBefore: 20000,
    balanceAfter: 17000,
    createdAtBackend: '2026-07-13 20:01:33',
    createdAtClient: '2026-07-13 20:01:34',
  },
  {
    id: 'pf3',
    flowNo: '389910297457141003',
    ...VIP888,
    flowType: 'income',
    txType: '结算',
    summary: '结算【皇者体育】',
    operatorNickname: '系统',
    operatorUserId: '10001',
    amount: 4500,
    balanceBefore: 17000,
    balanceAfter: 21500,
    createdAtBackend: '2026-07-13 22:47:05',
    createdAtClient: '2026-07-13 22:47:05',
  },
  {
    id: 'pf4',
    flowNo: '389910297457141004',
    ...LI0428,
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: '代理 A',
    operatorUserId: '9054246760393162002',
    amount: 500,
    balanceBefore: 0,
    balanceAfter: 500,
    createdAtBackend: '2026-07-12 11:00:00',
    createdAtClient: '2026-07-12 11:00:00',
  },
  {
    id: 'pf5',
    flowNo: '389910297457141005',
    ...LI0428,
    flowType: 'expense',
    txType: '转账',
    summary: '转账【联盟彩票】转出',
    operatorNickname: 'li0428',
    operatorUserId: '7831562076704421996',
    amount: -200,
    balanceBefore: 500,
    balanceAfter: 300,
    createdAtBackend: '2026-07-14 19:12:40',
    createdAtClient: '2026-07-14 19:12:41',
  },
  {
    id: 'pf6',
    flowNo: '389910297457141006',
    ...LI0428,
    flowType: 'income',
    txType: '系统',
    summary: '系统-信用用户退水',
    operatorNickname: '系统',
    operatorUserId: '10001',
    amount: 12.5,
    balanceBefore: 300,
    balanceAfter: 312.5,
    createdAtBackend: '2026-07-15 00:05:00',
    createdAtClient: '2026-07-15 00:05:00',
  },
  {
    id: 'pf7',
    flowNo: '389910297457141007',
    ...DUCK,
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: '代理 B',
    operatorUserId: '9054246760393162001',
    amount: 3000,
    balanceBefore: 0,
    balanceAfter: 3000,
    createdAtBackend: '2026-07-11 16:30:10',
    createdAtClient: '2026-07-11 16:30:10',
  },
  {
    id: 'pf8',
    flowNo: '389910297457141008',
    ...DUCK,
    flowType: 'expense',
    txType: '上下分',
    summary: '上下分-下分',
    operatorNickname: '代理 B',
    operatorUserId: '9054246760393162001',
    amount: -1000,
    balanceBefore: 3000,
    balanceAfter: 2000,
    createdAtBackend: '2026-07-15 09:45:00',
    createdAtClient: '2026-07-15 09:45:00',
  },
]

export const MOCK_CREDIT_FLOW_LIST: CreditFlowListRow[] = [...DETAIL_USER_ROWS, ...OTHER_USER_ROWS].sort(
  (a, b) => b.createdAtBackend.localeCompare(a.createdAtBackend),
)

export function creditFlowWalletLabel(row: Pick<CreditFlowListRow, 'currency' | 'walletName'>) {
  return `信用额度-${row.currency}-${row.walletName}`
}
