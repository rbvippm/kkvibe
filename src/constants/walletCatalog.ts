/** 会员钱包目录：个人中心全部钱包 / 充提兑选币共用 */

import { LOBBY_CURRENCY_OPTIONS } from './mobileLobby'
import { orderedLobbyCashIds } from '../i18n'

export type WalletKind = 'crypto' | 'fiat' | 'credit'
export type WalletFilter = 'frequent' | 'crypto' | 'fiat' | 'credit'
export type CreditCurrencyCode = 'cny' | 'usd'

/** 贵宾厅信用钱包：同一会员可被多个代理上分，每代理每币种独立钱包 */
export type CreditWalletItem = {
  id: string
  currency: CreditCurrencyCode
  name: string
  symbol: string
  color: string
  balance: number
  cnyRate: number
  /** 上分来源代理 */
  source: string
  agentId: string
  avatarColor: string
  /** 账户编号，如 Account 01 */
  accountCode: string
  /** 可编辑展示名 */
  displayName: string
  /** 黑金币种图标 */
  icon: string
  remark: string
}

export type CreditAgentGroup = {
  agentId: string
  source: string
  avatarColor: string
  items: CreditWalletItem[]
}

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

const CREDIT_CURRENCY_META: Record<
  CreditCurrencyCode,
  Pick<CreditWalletItem, 'name' | 'symbol' | 'color' | 'cnyRate' | 'icon'>
> = {
  cny: { name: 'CNY', symbol: '¥', color: '#ff7a2b', cnyRate: 1, icon: '/images/vip-club/icon-currency.svg' },
  usd: { name: 'USD', symbol: '$', color: '#3b82f6', cnyRate: 7.2, icon: '/images/vip-club/icon-currency-usd.svg' },
}

export const CREDIT_CURRENCY_TABS: { key: CreditCurrencyCode; label: string }[] = [
  { key: 'cny', label: 'CNY' },
  { key: 'usd', label: 'USD' },
]

/** 账单 / 投注记录弹层：未选币种为「全部钱包」，选 CNY / USD 后改为对应信用额度 */
export function creditAllWalletsLabel(currency: CreditCurrencyCode | '') {
  if (currency === 'cny') return '信用额度-CNY'
  if (currency === 'usd') return '信用额度-USD'
  return '全部钱包'
}

export const CREDIT_REMARK_MAX_LEN = 20
export const CREDIT_NAME_MAX_LEN = 12

const AGENT_EZ = { agentId: 'ez', source: 'EZ', avatarColor: '#e11d48' }
const AGENT_A = { agentId: 'agent-a', source: '代理 A', avatarColor: '#f97316' }
const AGENT_B = { agentId: 'agent-b', source: '代理 B', avatarColor: '#dc2626' }

/** 多个代理给同一会员上分：新代理首次上分生成对应钱包 */
export const CREDIT_WALLET_CATALOG: CreditWalletItem[] = [
  {
    id: 'credit-ez-cny-1',
    currency: 'cny',
    ...CREDIT_CURRENCY_META.cny,
    ...AGENT_EZ,
    balance: 8000,
    accountCode: 'Account 01',
    displayName: 'EZ Wallet',
    remark: '',
  },
  {
    id: 'credit-ez-usd-1',
    currency: 'usd',
    ...CREDIT_CURRENCY_META.usd,
    ...AGENT_EZ,
    balance: 200,
    accountCode: 'Account 02',
    displayName: 'Cross',
    remark: '',
  },
  {
    id: 'credit-a-cny-1',
    currency: 'cny',
    ...CREDIT_CURRENCY_META.cny,
    ...AGENT_A,
    balance: 1000,
    accountCode: 'account1',
    displayName: 'account1',
    remark: '',
  },
  {
    id: 'credit-a-usd-1',
    currency: 'usd',
    ...CREDIT_CURRENCY_META.usd,
    ...AGENT_A,
    balance: 1000,
    accountCode: 'account2',
    displayName: '一直赢钱',
    remark: '',
  },
  {
    id: 'credit-b-cny-1',
    currency: 'cny',
    ...CREDIT_CURRENCY_META.cny,
    ...AGENT_B,
    balance: 1000,
    accountCode: 'Account 01',
    displayName: '一直赢钱',
    remark: '贵宾厅常用额度',
  },
  {
    id: 'credit-b-usd-1',
    currency: 'usd',
    ...CREDIT_CURRENCY_META.usd,
    ...AGENT_B,
    balance: 1000,
    accountCode: 'account2',
    displayName: 'account2',
    remark: '',
  },
]

export const DEFAULT_CREDIT_ACCOUNT_ID = 'credit-b-cny-1'

export function cloneCreditWallets() {
  return CREDIT_WALLET_CATALOG.map((item) => ({ ...item }))
}

export function groupCreditWalletsByAgent(items: CreditWalletItem[]): CreditAgentGroup[] {
  const order: string[] = []
  const map = new Map<string, CreditAgentGroup>()
  for (const item of items) {
    let group = map.get(item.agentId)
    if (!group) {
      group = {
        agentId: item.agentId,
        source: item.source,
        avatarColor: item.avatarColor,
        items: [],
      }
      map.set(item.agentId, group)
      order.push(item.agentId)
    }
    group.items.push(item)
  }
  return order.map((id) => map.get(id)!)
}

export function creditWalletsByCurrency(
  currency: CreditCurrencyCode,
  items: CreditWalletItem[] = CREDIT_WALLET_CATALOG,
) {
  return items.filter((item) => item.currency === currency)
}

export function creditWalletToCatalogItem(item: CreditWalletItem): WalletCatalogItem {
  return {
    id: item.id,
    name: item.name,
    symbol: item.symbol,
    color: item.color,
    kind: 'credit',
    balance: item.balance,
    cnyRate: item.cnyRate,
    minDeposit: 0,
    minWithdraw: 0,
  }
}

export function formatCreditWalletBalance(balance: number) {
  return balance.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function walletFilterTabs(showCredit: boolean, creditOnly = false) {
  if (creditOnly) return WALLET_FILTER_TABS.filter((tab) => tab.key === 'credit')
  return showCredit ? WALLET_FILTER_TABS : WALLET_FILTER_TABS.filter((tab) => tab.key !== 'credit')
}

export function walletsForSheet(showCredit: boolean, creditOnly = false) {
  if (creditOnly) return CREDIT_WALLET_CATALOG.map(creditWalletToCatalogItem)
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
export function sheetWalletGroups(showCredit: boolean, creditOnly = false) {
  const items = walletsForSheet(showCredit, creditOnly)
  if (creditOnly) {
    return groupWallets(items).map((group) => ({
      kind: group.kind as WalletFilter,
      label: group.label,
      items: group.items,
    }))
  }
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
