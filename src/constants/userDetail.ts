/** 用户管理 · 用户详情（列表进入）· Mock */

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
  'CNY',
  'USD',
] as const

/** 用户资产详情 · 信用额度账户币种 */
export const USER_CREDIT_LIMIT_CURRENCIES = [
  '代理-信用额度-CNY',
  '代理-信用额度-USD',
  '会员-信用额度-CNY',
  '会员-信用额度-USD',
] as const

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
  '上下分',
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
    id: 'f4',
    flowNo: '177937036726459lv5z0',
    exchangeOrderNo: '0',
    initiatorNickname: 'EZ1',
    initiatorUserId: '9054246760393162583',
    receiverNickname: '-',
    receiverUserId: '',
    flowType: 'expense',
    txType: '上下分',
    currency: 'CNY',
    amount: -50,
    fee: 0,
    merchantFee: 0,
    platformFee: 0,
    balanceBefore: 168,
    balanceAfter: 118,
    createdAtBackend: '2026-05-21 13:32:47',
    createdAtClient: '2026-05-21 21:32:47',
    miniProgram: '-',
    developer: '-',
  },
  {
    id: 'f5',
    flowNo: '289910297457139720',
    exchangeOrderNo: '0',
    initiatorNickname: 'VIP888',
    initiatorUserId: '7831562076704421995',
    receiverNickname: '-',
    receiverUserId: '',
    flowType: 'income',
    txType: '上下分',
    currency: 'USD',
    amount: 200,
    fee: 0,
    merchantFee: 0,
    platformFee: 0,
    balanceBefore: 800,
    balanceAfter: 1000,
    createdAtBackend: '2026-07-14 11:08:33',
    createdAtClient: '2026-07-14 11:08:33',
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
