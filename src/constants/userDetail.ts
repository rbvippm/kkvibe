/** 用户管理 · 用户详情（列表进入）· Mock */

import { CREDIT_WALLET_CATALOG, groupCreditWalletsByAgent } from './walletCatalog'

export const USER_DETAIL_MODULE_TABS = [
  { key: 'fund', label: '用户资金信息' },
  { key: 'profile', label: '用户信息' },
  { key: 'address', label: '用户地址簿' },
  { key: 'payment', label: '用户支付信息' },
  { key: 'order', label: '用户订单信息' },
  { key: 'c2cAd', label: '用户C2C广告信息' },
  { key: 'c2cRebate', label: '用户C2C广告返利' },
  { key: 'finance', label: '用户理财信息' },
  { key: 'loan', label: '用户借贷信息' },
] as const

export type UserDetailModuleKey = (typeof USER_DETAIL_MODULE_TABS)[number]['key']

export const USER_FUND_CURRENCIES = [
  'USDT-TRON',
  'USDT-SOL',
  'KKC',
  'BNB',
  'BTC',
  'ETH',
  'TRX',
  'SOL',
  'KKV',
] as const

export const USER_FUND_LEDGER_TABS = [
  { key: 'cash', label: '现金资金明细' },
  { key: 'credit', label: '信用资金明细' },
] as const

export type UserFundLedgerTab = (typeof USER_FUND_LEDGER_TABS)[number]['key']

/** 用户资产详情 · 信用额度 · 代理侧（本人作为代理的额度） */
export const USER_AGENT_CREDIT_CURRENCIES = ['代理-信用额度-CNY', '代理-信用额度-USD'] as const

export type UserCreditWalletRow = {
  id: string
  currencyLabel: string
  walletId: string
  walletName: string
  tradable: number
  frozen: number
}

export type UserCreditAgentGroup = {
  agentId: string
  agentName: string
  rows: UserCreditWalletRow[]
}

const USER_CREDIT_WALLET_IDS: Record<string, string> = {
  'credit-ez-cny-1': '880010001',
  'credit-ez-usd-1': '880010002',
  'credit-a-cny-1': '880020001',
  'credit-a-usd-1': '880020002',
  'credit-b-cny-1': '880030001',
  'credit-b-usd-1': '880030002',
}

const USER_CREDIT_WALLET_FROZEN: Record<string, number> = {
  'credit-b-cny-1': 500,
}

export type UserCreditCurrency = 'CNY' | 'USD'

export type UserCreditWalletOption = {
  id: string
  agentId: string
  agentName: string
  agentKingkongId: string
  currency: UserCreditCurrency
  walletId: string
  walletName: string
}

/** 会员侧信用额度：与贵宾厅「信用额度」弹层同源，按上分代理分组 */
export const USER_CREDIT_AGENT_GROUPS: UserCreditAgentGroup[] = groupCreditWalletsByAgent(
  CREDIT_WALLET_CATALOG,
).map((group) => ({
  agentId: group.agentId,
  agentName: group.source,
  rows: group.items.map((wallet) => ({
    id: wallet.id,
    currencyLabel: `信用额度-${wallet.name}`,
    walletId: USER_CREDIT_WALLET_IDS[wallet.id] ?? wallet.id,
    walletName: wallet.displayName,
    tradable: wallet.balance,
    frozen: USER_CREDIT_WALLET_FROZEN[wallet.id] ?? 0,
  })),
}))

const USER_CREDIT_AGENT_KINGKONG_IDS: Record<string, string> = {
  ez: '66880001',
  'agent-a': '66880002',
  'agent-b': '66880003',
}

/** 上级代理下拉：代理名称-金刚号 */
export const USER_CREDIT_AGENT_OPTIONS = USER_CREDIT_AGENT_GROUPS.map((group) => ({
  agentId: group.agentId,
  label: `${group.agentName}-${USER_CREDIT_AGENT_KINGKONG_IDS[group.agentId] ?? '-'}`,
}))

/** 钱包展示：信用额度-币种-钱包名称 */
export function userCreditWalletLabel(wallet: Pick<UserCreditWalletOption, 'currency' | 'walletName'>) {
  return `信用额度-${wallet.currency}-${wallet.walletName}`
}

export const USER_CREDIT_WALLET_OPTIONS: UserCreditWalletOption[] = CREDIT_WALLET_CATALOG.map(
  (wallet) => ({
    id: wallet.id,
    agentId: wallet.agentId,
    agentName: wallet.source,
    agentKingkongId: USER_CREDIT_AGENT_KINGKONG_IDS[wallet.agentId] ?? '-',
    currency: wallet.currency === 'usd' ? 'USD' : 'CNY',
    walletId: USER_CREDIT_WALLET_IDS[wallet.id] ?? wallet.id,
    walletName: wallet.displayName,
  }),
)

export function findUserCreditWallet(id: string) {
  return USER_CREDIT_WALLET_OPTIONS.find((item) => item.id === id)
}

/** 信用资金明细 · 交易类型（与贵宾厅账单一致） */
export const USER_CREDIT_TX_TYPES = ['系统', '转账', '投注', '结算', '上下分'] as const

export type UserCreditTxType = (typeof USER_CREDIT_TX_TYPES)[number]

export type UserCreditFlowRow = {
  id: string
  flowNo: string
  walletKey: string
  flowType: UserFundFlowType
  txType: UserCreditTxType
  /** 交易说明，如「上下分-上分」「投注【皇者体育】」 */
  summary: string
  operatorNickname: string
  operatorUserId: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  createdAtBackend: string
  createdAtClient: string
}

export const MOCK_USER_CREDIT_FLOWS: UserCreditFlowRow[] = [
  {
    id: 'cf1',
    flowNo: '389910297457140001',
    walletKey: 'credit-b-cny-1',
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: '代理 B',
    operatorUserId: '9054246760393162001',
    amount: 1500,
    balanceBefore: 0,
    balanceAfter: 1500,
    createdAtBackend: '2026-07-10 10:02:11',
    createdAtClient: '2026-07-10 10:02:11',
  },
  {
    id: 'cf2',
    flowNo: '389910297457140002',
    walletKey: 'credit-b-cny-1',
    flowType: 'expense',
    txType: '投注',
    summary: '投注【皇者体育】',
    operatorNickname: '小红呀呀呀呀呀',
    operatorUserId: '7831562076704421988',
    amount: -500,
    balanceBefore: 1500,
    balanceAfter: 1000,
    createdAtBackend: '2026-07-12 21:15:40',
    createdAtClient: '2026-07-12 21:15:41',
  },
  {
    id: 'cf3',
    flowNo: '389910297457140003',
    walletKey: 'credit-ez-cny-1',
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: 'EZ',
    operatorUserId: '9054246760393162583',
    amount: 8000,
    balanceBefore: 0,
    balanceAfter: 8000,
    createdAtBackend: '2026-07-11 09:30:00',
    createdAtClient: '2026-07-11 09:30:00',
  },
  {
    id: 'cf4',
    flowNo: '389910297457140004',
    walletKey: 'credit-ez-usd-1',
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: 'EZ',
    operatorUserId: '9054246760393162583',
    amount: 500,
    balanceBefore: 0,
    balanceAfter: 500,
    createdAtBackend: '2026-07-11 09:31:20',
    createdAtClient: '2026-07-11 09:31:20',
  },
  {
    id: 'cf5',
    flowNo: '389910297457140005',
    walletKey: 'credit-ez-usd-1',
    flowType: 'expense',
    txType: '上下分',
    summary: '上下分-下分',
    operatorNickname: 'EZ',
    operatorUserId: '9054246760393162583',
    amount: -300,
    balanceBefore: 500,
    balanceAfter: 200,
    createdAtBackend: '2026-07-13 18:05:09',
    createdAtClient: '2026-07-13 18:05:09',
  },
  {
    id: 'cf6',
    flowNo: '389910297457140006',
    walletKey: 'credit-a-usd-1',
    flowType: 'expense',
    txType: '转账',
    summary: '转账【皇者体育】转出',
    operatorNickname: '小红呀呀呀呀呀',
    operatorUserId: '7831562076704421988',
    amount: -100,
    balanceBefore: 1000,
    balanceAfter: 900,
    createdAtBackend: '2026-07-14 20:40:12',
    createdAtClient: '2026-07-14 20:40:13',
  },
  {
    id: 'cf7',
    flowNo: '389910297457140007',
    walletKey: 'credit-a-usd-1',
    flowType: 'income',
    txType: '结算',
    summary: '结算【皇者体育】',
    operatorNickname: '系统',
    operatorUserId: '10001',
    amount: 100,
    balanceBefore: 900,
    balanceAfter: 1000,
    createdAtBackend: '2026-07-14 22:58:31',
    createdAtClient: '2026-07-14 22:58:31',
  },
  {
    id: 'cf8',
    flowNo: '389910297457140008',
    walletKey: 'credit-a-cny-1',
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: '代理 A',
    operatorUserId: '9054246760393162002',
    amount: 1000,
    balanceBefore: 0,
    balanceAfter: 1000,
    createdAtBackend: '2026-07-15 00:05:00',
    createdAtClient: '2026-07-15 00:05:00',
  },
  {
    id: 'cf9',
    flowNo: '389910297457140009',
    walletKey: 'credit-b-usd-1',
    flowType: 'income',
    txType: '上下分',
    summary: '上下分-上分',
    operatorNickname: '代理 B',
    operatorUserId: '9054246760393162001',
    amount: 1000,
    balanceBefore: 0,
    balanceAfter: 1000,
    createdAtBackend: '2026-07-10 10:03:45',
    createdAtClient: '2026-07-10 10:03:45',
  },
]

export const USER_FUND_TX_TYPES = [
  '收款',
  '转账-链上交易',
  '转账',
  '购买',
  '出售',
  '红包',
  '退款',
  '消费',
  '奖金',
  '系统',
  '兑换',
  '直播',
  '直播收入',
  '直播送礼',
  '换汇',
  '国际转账',
  '全球送现',
  '活动金',
] as const

export const USER_FUND_FLOW_TYPE_OPTIONS = [
  { value: '', label: '请选择' },
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
] as const

export type UserFundFlowType = 'income' | 'expense'

export type UserFundFlowRow = {
  id: string
  flowNo: string
  exchangeOrderNo: string
  initiatorNickname: string
  initiatorUserId: string
  receiverNickname: string
  receiverUserId: string
  flowType: UserFundFlowType
  txType: string
  currency: string
  amount: number
  fee: number
  merchantFee: number
  platformFee: number
  balanceBefore: number
  balanceAfter: number
  createdAtBackend: string
  createdAtClient: string
  miniProgram: string
  developer: string
}

export function flowTypeLabel(value: UserFundFlowType) {
  return value === 'income' ? '收入' : '支出'
}

export function formatFundAmount(value: number) {
  return value.toFixed(6)
}

export const MOCK_USER_FUND_FLOWS: UserFundFlowRow[] = [
  {
    id: 'f1',
    flowNo: '289910297457139712',
    exchangeOrderNo: '0',
    initiatorNickname: '小红呀呀呀呀呀',
    initiatorUserId: '1823923907444081148',
    receiverNickname: '-',
    receiverUserId: '',
    flowType: 'income',
    txType: '直播收入',
    currency: 'KKC',
    amount: 12.6,
    fee: 0,
    merchantFee: 0,
    platformFee: 0,
    balanceBefore: 1188.4,
    balanceAfter: 1201.0,
    createdAtBackend: '2026-07-15 20:12:01',
    createdAtClient: '2026-07-15 20:12:01',
    miniProgram: '-',
    developer: '-',
  },
  {
    id: 'f2',
    flowNo: '289910297457139713',
    exchangeOrderNo: '0',
    initiatorNickname: '小红呀呀呀呀呀',
    initiatorUserId: '1823923907444081148',
    receiverNickname: '主播阿强',
    receiverUserId: '9054246760393162583',
    flowType: 'expense',
    txType: '直播送礼',
    currency: 'KKC',
    amount: -1,
    fee: 0,
    merchantFee: 0,
    platformFee: 0,
    balanceBefore: 1201.0,
    balanceAfter: 1200.0,
    createdAtBackend: '2026-07-15 20:13:18',
    createdAtClient: '2026-07-15 20:13:18',
    miniProgram: '-',
    developer: '-',
  },
  {
    id: 'f3',
    flowNo: '289910297457139714',
    exchangeOrderNo: '0',
    initiatorNickname: '小红呀呀呀呀呀',
    initiatorUserId: '1823923907444081148',
    receiverNickname: '主播阿强',
    receiverUserId: '9054246760393162583',
    flowType: 'expense',
    txType: '直播送礼',
    currency: 'KKC',
    amount: -100,
    fee: 0,
    merchantFee: 0,
    platformFee: 0,
    balanceBefore: 1200.0,
    balanceAfter: 1100.0,
    createdAtBackend: '2026-07-15 20:14:02',
    createdAtClient: '2026-07-15 20:14:02',
    miniProgram: '-',
    developer: '-',
  },
  {
    id: 'f6',
    flowNo: '289910297457139721',
    exchangeOrderNo: 'TX88990011',
    initiatorNickname: 'KK小助手',
    initiatorUserId: '7831562076704421993',
    receiverNickname: '平台热钱包',
    receiverUserId: '10001',
    flowType: 'expense',
    txType: '转账-链上交易',
    currency: 'USDT-TRON',
    amount: -10,
    fee: 0.1,
    merchantFee: 0,
    platformFee: 0,
    balanceBefore: 2157.483647,
    balanceAfter: 2147.383647,
    createdAtBackend: '2026-07-13 09:20:00',
    createdAtClient: '2026-07-13 09:20:01',
    miniProgram: '-',
    developer: '-',
  },
]
