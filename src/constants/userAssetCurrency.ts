/** 用户详情 · 虚拟货币资产币种（含活动金，不含法币） */
export const USER_CRYPTO_CURRENCIES = [
  'USDT-TRON',
  'USDT-SOL',
  'KKC',
  'KKV',
  'ETH',
  'BTC',
  'TRX',
  'SOL',
  '活动金-USDT-TRON',
  '活动金-KKC',
  '活动金-KKV',
] as const

export type UserCryptoCurrency = (typeof USER_CRYPTO_CURRENCIES)[number]

export const USER_ACTIVITY_GOLD_CURRENCIES = [
  '活动金-USDT-TRON',
  '活动金-KKC',
  '活动金-KKV',
] as const

/** 主币种与活动金成对共用剩余提现流水（余额各自独立） */
export const USER_TURNOVER_PAIRS = [
  { base: 'USDT-TRON', activity: '活动金-USDT-TRON' },
  { base: 'KKC', activity: '活动金-KKC' },
  { base: 'KKV', activity: '活动金-KKV' },
] as const

export function isUserActivityGoldCurrency(currency: string) {
  return (USER_ACTIVITY_GOLD_CURRENCIES as readonly string[]).includes(currency)
}

export function getTurnoverPairCurrencies(currency: string) {
  const pair = USER_TURNOVER_PAIRS.find((item) => item.base === currency || item.activity === currency)
  return pair ? [pair.base, pair.activity] : [currency]
}

export function isPairedTurnoverCurrency(currency: string) {
  return getTurnoverPairCurrencies(currency).length === 2
}

export function getTurnoverPairDisplayLabel(currency: string) {
  const pair = USER_TURNOVER_PAIRS.find((item) => item.base === currency || item.activity === currency)
  if (!pair) return currency
  return `${pair.base} / ${pair.activity}（共用流水）`
}

/** 提现流水变更记录 · 币种筛选项 */
export const USER_GAME_CURRENCY_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  ...USER_CRYPTO_CURRENCIES.map((currency) => ({ value: currency, label: currency })),
]
