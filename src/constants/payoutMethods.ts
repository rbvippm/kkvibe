/** 我的 · 收款方式（先选货币：加密走链上地址，法币走银行/支付宝/微信/钱包） */

import { ref } from 'vue'
import { WALLET_FIAT_WITHDRAW_WALLETS, WALLET_TRANSFER_CURRENCIES, findTransferCurrency, networksOf } from './walletTransfer'

export type PayoutFiatKind = 'bank' | 'alipay' | 'wechat' | 'wallet'
export type PayoutListTab = 'all' | PayoutFiatKind
export type PayoutAddKind = 'crypto' | PayoutFiatKind

export type PayoutCryptoAddress = {
  id: string
  currencyId: string
  networkId: string
  address: string
  name: string
}

export type PayoutFiatMethod = {
  id: string
  kind: PayoutFiatKind
  title: string
  account: string
  holder: string
  icon: string
  color: string
  walletId?: string
  nickname?: string
  branch?: string
  hasQr?: boolean
}

export const PAYOUT_FIAT_TABS: { key: PayoutListTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'bank', label: '银行' },
  { key: 'alipay', label: '支付宝' },
  { key: 'wechat', label: '微信' },
  { key: 'wallet', label: '钱包' },
]

export const PAYOUT_ADD_TYPES: { key: PayoutFiatKind; label: string; icon: string; color: string }[] = [
  { key: 'bank', label: '银行', icon: '卡', color: '#2563eb' },
  { key: 'alipay', label: '支付宝', icon: '支', color: '#1677ff' },
  { key: 'wechat', label: '微信', icon: '微', color: '#07c160' },
  { key: 'wallet', label: '钱包', icon: '钱', color: '#ff8c00' },
]

export const PAYOUT_BANK_OPTIONS: { name: string; icon: string; color: string }[] = [
  { name: '安阳银行', icon: '卡', color: '#2563eb' },
  { name: '工商银行', icon: '工', color: '#c41e3a' },
  { name: '农业银行', icon: '农', color: '#009944' },
  { name: '建设银行', icon: '建', color: '#003da5' },
  { name: '中国银行', icon: '中', color: '#c8102e' },
]

/** 法币「钱包」类型，不含支付宝 / 微信 */
export const PAYOUT_WALLET_TYPES = [
  { id: 'wallet', name: '钱包', icon: '钱', color: '#ff8c00' },
  ...WALLET_FIAT_WITHDRAW_WALLETS.filter((item) => item.id !== 'alipay' && item.id !== 'wechat'),
]

export const PAYOUT_QR_HINT =
  '请勿上传截图的收款码，请在二维码收款界面，点击保存收款码，上传图片'

export const PAYOUT_CRYPTO_ADDRESSES: PayoutCryptoAddress[] = [
  {
    id: 'usdt-trc',
    currencyId: 'usdt',
    networkId: 'trc20',
    address: 'TCg7KwSqrkwoqsRJFBVwW7XXo47ouPk16b',
    name: 'TRON收款',
  },
]

export const PAYOUT_FIAT_METHODS: PayoutFiatMethod[] = [
  {
    id: 'bank-anyang',
    kind: 'bank',
    title: '安阳银行',
    account: '123456679',
    holder: '王大毛',
    icon: '卡',
    color: '#2563eb',
  },
  {
    id: 'alipay-1',
    kind: 'alipay',
    title: '支付宝',
    account: '13800000998',
    holder: '王大毛',
    icon: '支',
    color: '#1677ff',
    hasQr: true,
  },
  {
    id: 'wechat-1',
    kind: 'wechat',
    title: '微信',
    account: '13800000888',
    holder: '王大毛',
    icon: '微',
    color: '#07c160',
    hasQr: true,
  },
  {
    id: 'wallet-988-1',
    kind: 'wallet',
    title: '988钱包',
    account: '98810008679',
    holder: '王大毛',
    icon: '9',
    color: '#6366f1',
    walletId: 'wallet-988',
  },
]

export function payoutNetworkShort(networkId: string, label: string) {
  if (networkId === 'trc20') return 'TRON'
  if (networkId === 'sol') return 'SOL'
  if (networkId === 'erc20') return 'ETH'
  if (networkId === 'bep20') return 'BSC'
  if (networkId === 'btc') return 'BTC'
  return label
}

export function payoutNetworkLabel(currencyId: string, networkId: string) {
  const net = networksOf(currencyId).find((item) => item.id === networkId)
  return net ? payoutNetworkShort(net.id, net.label) : networkId
}

export function payoutMaskAccount(value: string) {
  const text = value.replace(/\s/g, '')
  if (!text) return ''
  const tail = text.slice(-4)
  return `*****${tail}`
}

export function payoutCurrencyName(id: string) {
  return findTransferCurrency(id).name
}

export function payoutWalletTypeMeta(id: string) {
  return PAYOUT_WALLET_TYPES.find((item) => item.id === id)
}

export function payoutBankMeta(name: string) {
  return PAYOUT_BANK_OPTIONS.find((item) => item.name === name)
}

export function payoutAddTitle(kind: PayoutAddKind) {
  if (kind === 'crypto') return '添加钱包'
  if (kind === 'bank') return '添加银行卡'
  if (kind === 'alipay') return '添加支付宝'
  if (kind === 'wechat') return '添加微信支付'
  return '添加钱包'
}

export function payoutAddHint(kind: PayoutAddKind) {
  if (kind === 'crypto') return '请添加本人的钱包地址'
  if (kind === 'bank') return '请添加本人银行卡账户'
  if (kind === 'alipay') return '请添加本人的支付宝账户'
  if (kind === 'wechat') return '请添加本人的微信账户'
  return '请添加本人的钱包地址'
}

export function parsePayoutCurrencyId(raw: unknown) {
  const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0] ?? '') : ''
  return WALLET_TRANSFER_CURRENCIES.some((item) => item.id === id) ? id : 'kkc'
}

export function parsePayoutListTab(raw: unknown): PayoutListTab {
  const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0] ?? '') : ''
  if (id === 'bank' || id === 'alipay' || id === 'wechat' || id === 'wallet') return id
  return 'all'
}

/** 提现页电子钱包 / 银行卡 → 收款方式分类 */
export function payoutListTabFromWithdraw(withdrawKind: string, walletId?: string): PayoutListTab | undefined {
  if (withdrawKind === 'bank') return 'bank'
  if (withdrawKind !== 'ewallet') return undefined
  if (walletId === 'alipay') return 'alipay'
  if (walletId === 'wechat') return 'wechat'
  return 'wallet'
}

export function payoutMethodsRoute(
  currencyId?: string,
  options: { pick?: boolean; tab?: PayoutListTab } = {},
) {
  const query: Record<string, string> = {}
  if (currencyId) query.ccy = currencyId
  if (options.pick) query.pick = '1'
  if (options.tab && options.tab !== 'all') query.type = options.tab
  return {
    name: 'mobile-payout-methods' as const,
    query,
  }
}

export type WithdrawPayoutPick = {
  id: string
  currencyId: string
  channel: 'crypto' | 'fiat'
  display: string
  address?: string
  networkId?: string
  fiatKind?: PayoutFiatKind
  walletId?: string
}

/** 从地址本选中的到账账户，提现页读取后回显 */
export const withdrawPayoutPick = ref<WithdrawPayoutPick | null>(null)
export const withdrawPayoutPickPending = ref(false)

export function buildCryptoPayoutPick(item: PayoutCryptoAddress): WithdrawPayoutPick {
  return {
    id: item.id,
    currencyId: item.currencyId,
    channel: 'crypto',
    display: item.address,
    address: item.address,
    networkId: item.networkId,
  }
}

export function buildFiatPayoutPick(item: PayoutFiatMethod, currencyId: string): WithdrawPayoutPick {
  return {
    id: item.id,
    currencyId,
    channel: 'fiat',
    display: `${item.title} ${payoutMaskAccount(item.account)}`.trim(),
    fiatKind: item.kind,
    walletId: item.walletId,
  }
}
