/** 会员钱包目录：个人中心全部钱包 / 充提兑选币共用 */

import { LOBBY_CURRENCY_OPTIONS } from './mobileLobby'
import { orderedLobbyCashIds } from '../i18n'

export type WalletKind = 'crypto' | 'fiat' | 'credit'
export type WalletFilter = 'frequent' | 'crypto' | 'fiat' | 'credit'

export type WalletCatalogItem = {
  id: string
  name: string
  symbol: string
  color: string
  kind: WalletKind
  balance: number
  /** Mock：折合人民币汇率，用于个人中心总资产 */
  cnyRate: number
  minDeposit: number
  minWithdraw: number
}

export const WALLET_KIND_LABEL: Record<WalletKind, string> = {
  crypto: '加密货币',
  fiat: '法币',
  credit: '信用额度',
}

/** 常用币种顺序跟随语言：简繁 KKC→USDT→KKV，越南语 KKV→USDT→KKC，泰语/英语 USDT→KKC→KKV */
export const WALLET_FREQUENT_IDS = LOBBY_CURRENCY_OPTIONS.filter((item) => !item.isCredit).map(
  (item) => item.id,
)

export function getWalletFrequentIds() {
  return orderedLobbyCashIds.value
}

export const WALLET_FILTER_TABS: { key: WalletFilter; label: string }[] = [
  { key: 'frequent', label: '常用' },
  { key: 'crypto', label: '加密货币' },
  { key: 'fiat', label: '法币' },
  { key: 'credit', label: '信用额度' },
]

export const WALLET_GROUP_ORDER: WalletKind[] = ['crypto', 'fiat', 'credit']

export const WALLET_CATALOG: WalletCatalogItem[] = [
  {
    id: 'usdt',
    name: 'USDT',
    symbol: '₮',
    color: '#26a17b',
    kind: 'crypto',
    balance: 9857.35,
    cnyRate: 7.2,
    minDeposit: 10,
    minWithdraw: 20,
  },
  {
    id: 'eth',
    name: 'ETH',
    symbol: 'Ξ',
    color: '#627eea',
    kind: 'crypto',
    balance: 1.256789,
    cnyRate: 25000,
    minDeposit: 0.01,
    minWithdraw: 0.02,
  },
  {
    id: 'btc',
    name: 'BTC',
    symbol: '₿',
    color: '#f7931a',
    kind: 'crypto',
    balance: 0.08543218,
    cnyRate: 650000,
    minDeposit: 0.0001,
    minWithdraw: 0.001,
  },
  {
    id: 'trx',
    name: 'TRX',
    symbol: 'T',
    color: '#ef0027',
    kind: 'crypto',
    balance: 12580.45,
    cnyRate: 1.2,
    minDeposit: 10,
    minWithdraw: 50,
  },
  {
    id: 'sol',
    name: 'SOL',
    symbol: 'S',
    color: '#111827',
    kind: 'crypto',
    balance: 128.45012,
    cnyRate: 1200,
    minDeposit: 0.1,
    minWithdraw: 0.5,
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'B',
    color: '#f3ba2f',
    kind: 'crypto',
    balance: 12.345678,
    cnyRate: 4500,
    minDeposit: 0.01,
    minWithdraw: 0.05,
  },
  {
    id: 'kkc',
    name: 'KKC',
    symbol: 'K',
    color: '#ff7a2b',
    kind: 'fiat',
    balance: 236188.66,
    cnyRate: 1,
    minDeposit: 100,
    minWithdraw: 200,
  },
  {
    id: 'kkv',
    name: 'KKV',
    symbol: 'V',
    color: '#ec4899',
    kind: 'fiat',
    balance: 12880.5,
    cnyRate: 0.5,
    minDeposit: 100,
    minWithdraw: 200,
  },
  {
    id: 'credit-cny',
    name: 'CNY',
    symbol: '¥',
    color: '#ff7a2b',
    kind: 'credit',
    balance: 50000,
    cnyRate: 1,
    minDeposit: 0,
    minWithdraw: 0,
  },
  {
    id: 'credit-usd',
    name: 'USD',
    symbol: '$',
    color: '#3b82f6',
    kind: 'credit',
    balance: 1280.5,
    cnyRate: 7.2,
    minDeposit: 0,
    minWithdraw: 0,
  },
]

export function walletFilterTabs(showCredit: boolean) {
  return showCredit ? WALLET_FILTER_TABS : WALLET_FILTER_TABS.filter((tab) => tab.key !== 'credit')
}

export function walletsForSheet(showCredit: boolean) {
  return showCredit ? WALLET_CATALOG : WALLET_CATALOG.filter((item) => item.kind !== 'credit')
}

export function frequentWallets(items: WalletCatalogItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]))
  return getWalletFrequentIds().flatMap((id) => {
    const hit = byId.get(id)
    return hit ? [hit] : []
  })
}

export function filterWallets(items: WalletCatalogItem[], filter: WalletFilter) {
  if (filter === 'frequent') return frequentWallets(items)
  return items.filter((item) => item.kind === filter)
}

export function groupWallets(items: WalletCatalogItem[]) {
  return WALLET_GROUP_ORDER.map((kind) => ({
    kind,
    label: WALLET_KIND_LABEL[kind],
    items: items.filter((item) => item.kind === kind),
  })).filter((group) => group.items.length)
}

/** 弹层锚点分组：常用置顶，其后按加密货币 / 法币 / 信用额度完整列出 */
export function sheetWalletGroups(showCredit: boolean) {
  const items = walletsForSheet(showCredit)
  return [
    { kind: 'frequent' as const, label: '常用', items: frequentWallets(items) },
    ...groupWallets(items).map((group) => ({
      kind: group.kind as WalletFilter,
      label: group.label,
      items: group.items,
    })),
  ].filter((group) => group.items.length)
}

export function formatWalletBalance(item: WalletCatalogItem) {
  if (item.kind === 'fiat' || item.kind === 'credit') {
    return item.balance.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  const maxDigits =
    item.id === 'btc' ? 8 : item.id === 'eth' || item.id === 'sol' || item.id === 'bnb' ? 6 : 4
  return item.balance.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  })
}

export function sumWalletsCny(items: WalletCatalogItem[]) {
  return items.reduce((sum, item) => sum + item.balance * item.cnyRate, 0)
}
