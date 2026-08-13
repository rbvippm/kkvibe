/** 我的 · 资产明细 Mock（对齐设计截图 + 全部钱包分类） */

export type AssetDetailMainTab = 'overview' | 'balance' | 'bank'
export type AssetDetailGroupMode = 'currency' | 'account'
export type AssetDetailKindFilter = 'all' | 'crypto' | 'fiat' | 'credit'
export type AssetDetailFiatId = 'cny' | 'vnd' | 'usd'

export type AssetDetailItem = {
  id: string
  name: string
  symbol: string
  color: string
  kind: 'fiat' | 'crypto' | 'credit'
  available: number
  frozen: number
}

export const ASSET_DETAIL_MAIN_TABS: { key: AssetDetailMainTab; label: string }[] = [
  { key: 'overview', label: '总览' },
  { key: 'balance', label: '余额' },
  { key: 'bank', label: '银行' },
]

export const ASSET_DETAIL_GROUP_MODES: { key: AssetDetailGroupMode; label: string }[] = [
  { key: 'currency', label: '按币种' },
  { key: 'account', label: '按账户' },
]

export const ASSET_DETAIL_KIND_FILTERS: { key: AssetDetailKindFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'crypto', label: '虚拟币' },
  { key: 'fiat', label: '法币' },
  { key: 'credit', label: '信用额度' },
]

export const ASSET_DETAIL_FIAT_OPTIONS: {
  id: AssetDetailFiatId
  name: string
  symbol: string
  color: string
}[] = [
  { id: 'cny', name: 'CNY', symbol: '¥', color: '#ff7a2b' },
  { id: 'vnd', name: 'VND', symbol: '₫', color: '#ef4444' },
  { id: 'usd', name: 'USD', symbol: '$', color: '#26a17b' },
]

/** 对齐全部钱包：法币 KKC/KKV，虚拟币链上币种，信用额度仅 CNY/USD */
export const ASSET_DETAIL_ITEMS: AssetDetailItem[] = [
  {
    id: 'kkc',
    name: 'KKC',
    symbol: 'K',
    color: '#ff7a2b',
    kind: 'fiat',
    available: 21474769.77,
    frozen: 0,
  },
  {
    id: 'kkv',
    name: 'KKV',
    symbol: 'V',
    color: '#ec4899',
    kind: 'fiat',
    available: 0,
    frozen: 0,
  },
  {
    id: 'usdt',
    name: 'USDT',
    symbol: '₮',
    color: '#26a17b',
    kind: 'crypto',
    available: 9857.35,
    frozen: 0,
  },
  {
    id: 'eth',
    name: 'ETH',
    symbol: 'Ξ',
    color: '#627eea',
    kind: 'crypto',
    available: 0,
    frozen: 0,
  },
  {
    id: 'btc',
    name: 'BTC',
    symbol: '₿',
    color: '#f7931a',
    kind: 'crypto',
    available: 0,
    frozen: 0,
  },
  {
    id: 'trx',
    name: 'TRX',
    symbol: 'T',
    color: '#ef0027',
    kind: 'crypto',
    available: 0,
    frozen: 0,
  },
  {
    id: 'sol',
    name: 'SOL',
    symbol: 'S',
    color: '#111827',
    kind: 'crypto',
    available: 0,
    frozen: 0,
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'B',
    color: '#f3ba2f',
    kind: 'crypto',
    available: 0,
    frozen: 0,
  },
  {
    id: 'credit-cny',
    name: 'CNY',
    symbol: '¥',
    color: '#ff7a2b',
    kind: 'credit',
    available: 50000,
    frozen: 0,
  },
  {
    id: 'credit-usd',
    name: 'USD',
    symbol: '$',
    color: '#3b82f6',
    kind: 'credit',
    available: 1280.5,
    frozen: 0,
  },
]

export function formatAssetAmount(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function filterAssetDetailItems(
  items: AssetDetailItem[],
  kind: AssetDetailKindFilter,
) {
  if (kind === 'all') return items
  return items.filter((item) => item.kind === kind)
}

export function sumAssetAvailable(items: AssetDetailItem[]) {
  return items.reduce((sum, item) => sum + item.available, 0)
}
