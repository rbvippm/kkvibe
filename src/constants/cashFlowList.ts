/** 账单管理 · 对账流水列表 ·「现金」Tab（全平台用户现金钱包流水）· Mock */

import { MOCK_USER_FUND_FLOWS, USER_FUND_CURRENCIES, USER_FUND_TX_TYPES, type UserFundFlowRow } from './userDetail'

export { USER_FUND_CURRENCIES, USER_FUND_TX_TYPES }

export type CashFlowListRow = UserFundFlowRow & {
  /** 流水所属用户（钱包持有人） */
  userNickname: string
  userId: string
}

/** 用户详情默认用户，与用户详情「现金资金明细」同一批流水 */
const DETAIL_USER = { userNickname: '小红呀呀呀呀呀', userId: '7831562076704421988' }

const DETAIL_USER_ROWS: CashFlowListRow[] = MOCK_USER_FUND_FLOWS.map((row) => ({ ...row, ...DETAIL_USER }))

const VIP888 = { userNickname: 'VIP888', userId: '7831562076704421995' }
const LI0428 = { userNickname: 'li0428', userId: '7831562076704421996' }
const DUCK = { userNickname: '骄傲的鸭子', userId: '7831562076704421997' }

const NO_FEE = { fee: 0, merchantFee: 0, platformFee: 0, miniProgram: '-', developer: '-' }

const OTHER_USER_ROWS: CashFlowListRow[] = [
  {
    id: 'cf1',
    flowNo: '289910297457150001',
    exchangeOrderNo: 'TX88991001',
    ...VIP888,
    initiatorNickname: '链上地址 TQ8…k2M',
    initiatorUserId: '-',
    receiverNickname: 'VIP888',
    receiverUserId: VIP888.userId,
    flowType: 'income',
    txType: '收款',
    currency: 'USDT-TRON',
    amount: 500,
    ...NO_FEE,
    balanceBefore: 120.5,
    balanceAfter: 620.5,
    createdAtBackend: '2026-07-14 11:02:36',
    createdAtClient: '2026-07-14 11:02:37',
  },
  {
    id: 'cf2',
    flowNo: '289910297457150002',
    exchangeOrderNo: 'EX20260714001',
    ...VIP888,
    initiatorNickname: 'VIP888',
    initiatorUserId: VIP888.userId,
    receiverNickname: '-',
    receiverUserId: '',
    flowType: 'expense',
    txType: '兑换',
    currency: 'USDT-TRON',
    amount: -200,
    ...NO_FEE,
    fee: 0.4,
    balanceBefore: 620.5,
    balanceAfter: 420.1,
    createdAtBackend: '2026-07-14 11:10:08',
    createdAtClient: '2026-07-14 11:10:08',
  },
  {
    id: 'cf3',
    flowNo: '289910297457150003',
    exchangeOrderNo: 'EX20260714001',
    ...VIP888,
    initiatorNickname: 'VIP888',
    initiatorUserId: VIP888.userId,
    receiverNickname: '-',
    receiverUserId: '',
    flowType: 'income',
    txType: '兑换',
    currency: 'KKC',
    amount: 1450,
    ...NO_FEE,
    balanceBefore: 36,
    balanceAfter: 1486,
    createdAtBackend: '2026-07-14 11:10:08',
    createdAtClient: '2026-07-14 11:10:08',
  },
  {
    id: 'cf4',
    flowNo: '289910297457150004',
    exchangeOrderNo: '0',
    ...LI0428,
    initiatorNickname: 'li0428',
    initiatorUserId: LI0428.userId,
    receiverNickname: '骄傲的鸭子',
    receiverUserId: DUCK.userId,
    flowType: 'expense',
    txType: '红包',
    currency: 'KKC',
    amount: -88,
    ...NO_FEE,
    balanceBefore: 512,
    balanceAfter: 424,
    createdAtBackend: '2026-07-15 09:30:00',
    createdAtClient: '2026-07-15 09:30:01',
  },
  {
    id: 'cf5',
    flowNo: '289910297457150005',
    exchangeOrderNo: '0',
    ...DUCK,
    initiatorNickname: 'li0428',
    initiatorUserId: LI0428.userId,
    receiverNickname: '骄傲的鸭子',
    receiverUserId: DUCK.userId,
    flowType: 'income',
    txType: '红包',
    currency: 'KKC',
    amount: 88,
    ...NO_FEE,
    balanceBefore: 0,
    balanceAfter: 88,
    createdAtBackend: '2026-07-15 09:31:12',
    createdAtClient: '2026-07-15 09:31:12',
  },
  {
    id: 'cf6',
    flowNo: '289910297457150006',
    exchangeOrderNo: '0',
    ...DUCK,
    initiatorNickname: '平台运营',
    initiatorUserId: '10001',
    receiverNickname: '骄傲的鸭子',
    receiverUserId: DUCK.userId,
    flowType: 'income',
    txType: '活动金',
    currency: 'KKV',
    amount: 30,
    ...NO_FEE,
    balanceBefore: 12,
    balanceAfter: 42,
    createdAtBackend: '2026-07-16 18:00:00',
    createdAtClient: '2026-07-16 18:00:02',
  },
  {
    id: 'cf7',
    flowNo: '289910297457150007',
    exchangeOrderNo: 'TX88991007',
    ...LI0428,
    initiatorNickname: 'li0428',
    initiatorUserId: LI0428.userId,
    receiverNickname: '链上地址 TJ5…9xQ',
    receiverUserId: '-',
    flowType: 'expense',
    txType: '转账-链上交易',
    currency: 'USDT-TRON',
    amount: -150,
    ...NO_FEE,
    fee: 1,
    balanceBefore: 300,
    balanceAfter: 149,
    createdAtBackend: '2026-07-16 21:45:19',
    createdAtClient: '2026-07-16 21:45:20',
  },
]

export const MOCK_CASH_FLOW_LIST: CashFlowListRow[] = [...DETAIL_USER_ROWS, ...OTHER_USER_ROWS].sort((a, b) =>
  b.createdAtBackend.localeCompare(a.createdAtBackend),
)
