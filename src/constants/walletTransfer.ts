/** 我的 · 充值 / 提现 / 兑换（单路由三 Tab） */

import {
  WALLET_CATALOG,
  getWalletFrequentIds,
  type WalletCatalogItem,
} from './walletCatalog'

export type WalletTransferTab = 'deposit' | 'withdraw' | 'exchange'
export type WalletAssetKind = 'crypto' | 'fiat'
export type WalletTransferCurrency = WalletCatalogItem & { kind: 'crypto' | 'fiat' }

export type WalletNetwork = {
  id: string
  label: string
  address: string
}

export type WalletFiatCategory = 'hot' | 'ewallet' | 'online' | 'bank'

export type WalletFiatMethod = {
  id: string
  name: string
  eta: string
  icon?: string
  color?: string
  min?: number
  max?: number
  promo?: string
  categories?: WalletFiatCategory[]
  disabled?: boolean
}

export const WALLET_TRANSFER_TABS: { key: WalletTransferTab; label: string }[] = [
  { key: 'deposit', label: '充值' },
  { key: 'withdraw', label: '提现' },
  { key: 'exchange', label: '兑换' },
]

/** 充值快捷币种，与全部钱包「常用」及大厅非信用额度币种同序（跟随语言） */
export function getWalletQuickCurrencyIds() {
  return getWalletFrequentIds()
}

export const WALLET_TRANSFER_CURRENCIES: WalletTransferCurrency[] = WALLET_CATALOG.filter(
  (item): item is WalletTransferCurrency => item.kind !== 'credit',
)

export const WALLET_NETWORKS_BY_CURRENCY: Record<string, WalletNetwork[]> = {
  usdt: [
    { id: 'trc20', label: 'Tron (TRC20)', address: 'TCg7KwSqrkwoqsRJFBVwW7XXo47ouPk16b' },
    { id: 'sol', label: 'Solana (SOL)', address: '7nYqYx8kP3mQ2sR4tU6vW8xZ1aB3cD5eF9gH2jK4' },
    { id: 'erc20', label: 'Ethereum (ERC20)', address: '0x8c2A91d4E6bF70a3C1d9e8F4A2B6C7D0E5F1A3B8' },
  ],
  eth: [{ id: 'erc20', label: 'Ethereum (ERC20)', address: '0x8c2A91d4E6bF70a3C1d9e8F4A2B6C7D0E5F1A3B8' }],
  btc: [{ id: 'btc', label: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }],
  trx: [{ id: 'trc20', label: 'Tron (TRC20)', address: 'TCg7KwSqrkwoqsRJFBVwW7XXo47ouPk16b' }],
  sol: [{ id: 'sol', label: 'Solana', address: '7nYqYx8kP3mQ2sR4tU6vW8xZ1aB3cD5eF9gH2jK4' }],
  bnb: [{ id: 'bep20', label: 'BNB Smart Chain (BEP20)', address: '0x4d1B90c2E3F8a7C6b5E9D0A1F2C3B4A5D6E7F809' }],
}

export const WALLET_FIAT_DEPOSIT_TABS: { key: WalletFiatCategory; label: string }[] = [
  { key: 'hot', label: '热门' },
  { key: 'ewallet', label: '电子钱包' },
  { key: 'online', label: '在线充值' },
  { key: 'bank', label: '银行卡' },
]

export const WALLET_FIAT_DEPOSIT_METHODS: WalletFiatMethod[] = [
  {
    id: 'alipay',
    name: '支付宝',
    eta: '1 分钟',
    icon: '支',
    color: '#1677ff',
    min: 100,
    max: 50000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet', 'online'],
  },
  {
    id: 'wechat',
    name: '微信支付',
    eta: '1 分钟',
    icon: '微',
    color: '#07c160',
    min: 100,
    max: 20000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet', 'online'],
  },
  {
    id: 'wallet-808',
    name: '808钱包',
    eta: '2 分钟',
    icon: '8',
    color: '#0ea5e9',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet'],
  },
  {
    id: 'wallet-go',
    name: 'GO钱包',
    eta: '2 分钟',
    icon: 'G',
    color: '#22c55e',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet'],
  },
  {
    id: 'wallet-234pay',
    name: '234钱包代付',
    eta: '3 分钟',
    icon: '2',
    color: '#f97316',
    min: 100,
    max: 50000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet'],
  },
  {
    id: 'bank',
    name: '银行卡',
    eta: '3 分钟',
    icon: '银',
    color: '#2563eb',
    min: 100,
    max: 50000,
    promo: '赠送1%',
    categories: ['hot', 'bank'],
  },
  {
    id: 'wallet-ok',
    name: 'OK钱包',
    eta: '2 分钟',
    icon: 'O',
    color: '#111827',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet'],
  },
  {
    id: 'wallet-jd',
    name: 'JD钱包',
    eta: '2 分钟',
    icon: '京',
    color: '#e11d48',
    min: 100,
    max: 20000,
    promo: '赠送2%',
    categories: ['hot', 'ewallet'],
  },
  {
    id: 'wallet-bo',
    name: '波币钱包',
    eta: '2 分钟',
    icon: '波',
    color: '#7c3aed',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['ewallet'],
  },
  {
    id: 'wallet-kbean',
    name: 'K豆代付',
    eta: '3 分钟',
    icon: 'K',
    color: '#eab308',
    min: 100,
    max: 20000,
    promo: '赠送1%',
    categories: ['ewallet'],
  },
  {
    id: 'wallet-to',
    name: 'TO钱包',
    eta: '2 分钟',
    icon: 'T',
    color: '#14b8a6',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['ewallet'],
  },
  {
    id: 'wallet-234',
    name: '234钱包',
    eta: '2 分钟',
    icon: '2',
    color: '#fb7185',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['ewallet'],
  },
  {
    id: 'wallet-988',
    name: '988钱包',
    eta: '2 分钟',
    icon: '9',
    color: '#6366f1',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['ewallet'],
  },
  {
    id: 'wallet-jiayun',
    name: '佳运钱包',
    eta: '3 分钟',
    icon: '佳',
    color: '#0f766e',
    min: 100,
    max: 20000,
    promo: '赠送1%',
    categories: ['ewallet'],
  },
  {
    id: 'vietqr',
    name: 'Viet QR',
    eta: '1 分钟',
    icon: 'V',
    color: '#e11d48',
    min: 100,
    max: 30000,
    promo: '赠送2%',
    categories: ['ewallet'],
  },
  {
    id: 'momo',
    name: 'Momo',
    eta: '2 分钟',
    icon: 'M',
    color: '#d82d8b',
    min: 100,
    max: 20000,
    promo: '维护中',
    categories: ['ewallet'],
    disabled: true,
  },
  {
    id: 'bank-union',
    name: '银联快捷',
    eta: '3 分钟',
    icon: '联',
    color: '#1d4ed8',
    min: 200,
    max: 50000,
    promo: '赠送1%',
    categories: ['bank'],
  },
  {
    id: 'bank-wire',
    name: '网银转账',
    eta: '10 分钟',
    icon: '转',
    color: '#334155',
    min: 500,
    max: 100000,
    promo: '大额优先',
    categories: ['bank'],
  },
]

export function fiatDepositMethodsByCategory(category: WalletFiatCategory) {
  return WALLET_FIAT_DEPOSIT_METHODS.filter((item) => item.categories?.includes(category))
}

export type WalletFiatWithdrawKind = 'ewallet' | 'bank'

export const WALLET_FIAT_WITHDRAW_TABS: { key: WalletFiatWithdrawKind; label: string }[] = [
  { key: 'ewallet', label: '电子钱包' },
  { key: 'bank', label: '银行卡' },
]

export type WalletFiatWithdrawWallet = {
  id: string
  name: string
  icon: string
  color: string
}

export const WALLET_FIAT_WITHDRAW_WALLETS: WalletFiatWithdrawWallet[] = [
  { id: 'wallet-988', name: '988钱包', icon: '9', color: '#6366f1' },
  { id: 'wallet-gobao', name: '购宝钱包', icon: '购', color: '#f59e0b' },
  { id: 'wallet-98', name: '98钱包', icon: '9', color: '#0ea5e9' },
  { id: 'wallet-ab', name: 'AB钱包', icon: 'A', color: '#2563eb' },
  { id: 'wallet-jd', name: 'JD钱包', icon: '京', color: '#e11d48' },
  { id: 'wallet-kbean', name: 'K豆钱包', icon: 'K', color: '#eab308' },
  { id: 'wallet-ok', name: 'OK钱包', icon: 'O', color: '#111827' },
  { id: 'wallet-go', name: 'GO钱包', icon: 'G', color: '#22c55e' },
  { id: 'alipay', name: '支付宝', icon: '支', color: '#1677ff' },
  { id: 'wechat', name: '微信支付', icon: '微', color: '#07c160' },
  { id: 'wallet-808', name: '808钱包', icon: '8', color: '#0ea5e9' },
  { id: 'wallet-to', name: 'TO钱包', icon: 'T', color: '#14b8a6' },
]

export const WALLET_FIAT_WITHDRAW_WALLET_PREVIEW = 8
/** 充值支付方式宫格：四列两排后收起 */
export const WALLET_FIAT_DEPOSIT_PREVIEW = 8

export type WalletBoundCard = {
  id: string
  name: string
  number: string
  color: string
}

export const WALLET_FIAT_WITHDRAW_CARDS: WalletBoundCard[] = [
  { id: 'anyang', name: '安阳银行', number: '123456679', color: '#2563eb' },
  { id: 'icbc', name: '工商银行', number: '622208******8890', color: '#c41e3a' },
  { id: 'abc', name: '农业银行', number: '622848******1024', color: '#009944' },
]

export const WALLET_FIAT_WITHDRAW_EWALLET_MIN = 100
export const WALLET_FIAT_WITHDRAW_EWALLET_MAX = 200000
export const WALLET_FIAT_WITHDRAW_DAILY_LIMIT = 1_000_000
export const WALLET_FIAT_WITHDRAW_FEE = 0
export const WALLET_FIAT_WITHDRAW_REF = '1231421'

export const WALLET_FIAT_DEPOSIT_MIN = 50
export const WALLET_FIAT_DEPOSIT_MAX = 5000
/** 法币充值页底运营提示，空字符串则不展示 */
export const WALLET_FIAT_DEPOSIT_NOTICE =
  '请使用与实名认证一致的本人账户充值，到账时间以通道实际处理为准。如长时间未到账，请联系在线客服并提供支付凭证。'

/** 法币充值金额旁汇率：KKC 兑 CNY，KKV 兑 VND */
export const WALLET_FIAT_DEPOSIT_QUOTE: Record<string, { quote: string; rate: string }> = {
  kkc: { quote: 'CNY', rate: '1' },
  kkv: { quote: 'VND', rate: '1' },
}

export function fiatDepositQuoteText(currencyId: string, currencyName: string) {
  const mapped = WALLET_FIAT_DEPOSIT_QUOTE[currencyId] ?? { quote: 'CNY', rate: '1' }
  return `1${currencyName.toUpperCase()} = ${mapped.rate}${mapped.quote}`
}

export const WALLET_FIAT_PRESETS: Record<string, number[]> = {
  kkc: [200, 500, 2000],
  kkv: [200, 500, 2000],
}

export const WALLET_EXCHANGE_FEE = 0
export const WALLET_EXCHANGE_ETA = '30 秒'
/** 1 USDT ≈ 7.20 KKC */
export const WALLET_EXCHANGE_RATE_USDT_KKC = 7.2

export function parseWalletTransferTab(raw: unknown): WalletTransferTab {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === 'withdraw' || value === 'exchange' || value === 'deposit') return value
  if (value === 'trade' || value === 'convert') return 'exchange'
  if (value === 'recharge') return 'deposit'
  return 'deposit'
}

export function walletTransferRoute(tab: WalletTransferTab) {
  return { name: 'mobile-wallet-transfer' as const, query: { tab } }
}

export function findTransferCurrency(id: string): WalletTransferCurrency {
  return WALLET_TRANSFER_CURRENCIES.find((item) => item.id === id) ?? WALLET_TRANSFER_CURRENCIES[0]
}

export function networksOf(currencyId: string) {
  return WALLET_NETWORKS_BY_CURRENCY[currencyId] ?? []
}

export function formatTransferAmount(value: number, maxDigits = 6) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  })
}

export function maskAddress(address: string) {
  if (address.length <= 16) return address
  return `${address.slice(0, 6)}…${address.slice(-6)}`
}

/** 充值地址分段着色：首 / 中 / 尾各 4 位高亮，便于核对 */
export function splitAddressHighlights(address: string, mark = 4) {
  if (!address) return [] as { text: string; accent: boolean }[]
  const n = address.length
  if (n <= mark * 2) return [{ text: address, accent: true }]
  const headEnd = mark
  const tailStart = n - mark
  const midStart = Math.floor((n - mark) / 2)
  const midEnd = midStart + mark
  if (midStart < headEnd || midEnd > tailStart) {
    return [
      { text: address.slice(0, headEnd), accent: true },
      { text: address.slice(headEnd, tailStart), accent: false },
      { text: address.slice(tailStart), accent: true },
    ]
  }
  return [
    { text: address.slice(0, headEnd), accent: true },
    { text: address.slice(headEnd, midStart), accent: false },
    { text: address.slice(midStart, midEnd), accent: true },
    { text: address.slice(midEnd, tailStart), accent: false },
    { text: address.slice(tailStart), accent: true },
  ]
}

export function exchangeQuote(fromId: string, toId: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (fromId === toId) return amount
  const usdtToKkc = WALLET_EXCHANGE_RATE_USDT_KKC
  const rateFromUsdt: Record<string, number> = {
    usdt: 1,
    kkc: usdtToKkc,
    kkv: usdtToKkc / 2,
    eth: 3500,
    btc: 90000,
    trx: 0.12,
    sol: 160,
    bnb: 600,
  }
  const from = rateFromUsdt[fromId] ?? 1
  const to = rateFromUsdt[toId] ?? 1
  return (amount * from) / to
}

export function exchangeRateText(fromId: string, toId: string) {
  const from = findTransferCurrency(fromId)
  const to = findTransferCurrency(toId)
  const quote = exchangeQuote(fromId, toId, 1)
  return `1 ${from.name} ≈ ${formatTransferAmount(quote, 4)} ${to.name}`
}
