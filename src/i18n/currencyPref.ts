import { computed, ref } from 'vue'
import { appLocale, type AppLocale } from './locale'

export type CashCurrencyCode = 'KKC' | 'KKV' | 'USDT'
export type LobbyCashId = 'kkc' | 'kkv' | 'usdt'
export type PreferredFiatId = 'cny' | 'vnd' | 'usd'

const STORAGE_LOBBY = 'kkvibe.pref.lobbyCurrency'
const STORAGE_FIAT = 'kkvibe.pref.preferredFiat'
const STORAGE_AGENT = 'kkvibe.pref.agentCurrency'
const STORAGE_TRANSFER = 'kkvibe.pref.walletTransferCurrency'

function readStorage(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

/** 用户手动选过的值；null 表示跟随语言默认 */
export const userLobbyCurrency = ref<string | null>(readStorage(STORAGE_LOBBY))
export const userPreferredFiat = ref<PreferredFiatId | null>(parseFiat(readStorage(STORAGE_FIAT)))
export const userAgentCurrency = ref<string | null>(readStorage(STORAGE_AGENT))
export const userWalletTransferCurrency = ref<string | null>(readStorage(STORAGE_TRANSFER))

function parseFiat(value: string | null): PreferredFiatId | null {
  if (value === 'cny' || value === 'vnd' || value === 'usd') return value
  return null
}

export function cashOrderForLocale(locale: AppLocale = appLocale.value): CashCurrencyCode[] {
  if (locale === 'vi') return ['KKV', 'USDT', 'KKC']
  if (locale === 'th' || locale === 'en') return ['USDT', 'KKC', 'KKV']
  return ['KKC', 'USDT', 'KKV']
}

export function fiatOrderForLocale(locale: AppLocale = appLocale.value): PreferredFiatId[] {
  if (locale === 'vi') return ['vnd', 'cny', 'usd']
  if (locale === 'th' || locale === 'en') return ['usd', 'cny', 'vnd']
  return ['cny', 'vnd', 'usd']
}

export function defaultCashCurrency(locale: AppLocale = appLocale.value): CashCurrencyCode {
  return cashOrderForLocale(locale)[0]
}

export function defaultLobbyCashId(locale: AppLocale = appLocale.value): LobbyCashId {
  return defaultCashCurrency(locale).toLowerCase() as LobbyCashId
}

export function defaultPreferredFiat(locale: AppLocale = appLocale.value): PreferredFiatId {
  return fiatOrderForLocale(locale)[0]
}

export function normalizeCashToken(value: string): CashCurrencyCode | null {
  const upper = value.toUpperCase()
  if (upper === 'KKC') return 'KKC'
  if (upper === 'KKV') return 'KKV'
  if (upper.includes('USDT')) return 'USDT'
  return null
}

export function sortByLocaleCashOrder<T>(items: readonly T[], getValue: (item: T) => string): T[] {
  const order = cashOrderForLocale()
  const indexed = items.map((item, index) => ({ item, index }))
  indexed.sort((a, b) => {
    const cashA = normalizeCashToken(getValue(a.item))
    const cashB = normalizeCashToken(getValue(b.item))
    const rankA = cashA ? order.indexOf(cashA) : 100 + a.index
    const rankB = cashB ? order.indexOf(cashB) : 100 + b.index
    if (rankA !== rankB) return rankA - rankB
    return a.index - b.index
  })
  return indexed.map((entry) => entry.item)
}

export const orderedLobbyCashIds = computed(() =>
  cashOrderForLocale().map((code) => code.toLowerCase() as LobbyCashId),
)

export const effectiveLobbyCurrency = computed(
  () => userLobbyCurrency.value || defaultLobbyCashId(),
)

export const effectivePreferredFiat = computed(
  () => userPreferredFiat.value || defaultPreferredFiat(),
)

export const effectiveAgentCurrency = computed(
  () => userAgentCurrency.value || defaultCashCurrency(),
)

export const effectiveWalletTransferCurrency = computed(
  () => userWalletTransferCurrency.value || defaultLobbyCashId(),
)

export function pickLobbyCurrency(id: string) {
  userLobbyCurrency.value = id
  writeStorage(STORAGE_LOBBY, id)
}

export function pickPreferredFiat(id: PreferredFiatId) {
  userPreferredFiat.value = id
  writeStorage(STORAGE_FIAT, id)
}

export function pickAgentCurrency(id: string) {
  userAgentCurrency.value = id
  writeStorage(STORAGE_AGENT, id)
}

export function pickWalletTransferCurrency(id: string) {
  userWalletTransferCurrency.value = id
  writeStorage(STORAGE_TRANSFER, id)
}
