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

/** 剩余提现流水记录 · 游戏币种筛选项 */
export const USER_GAME_CURRENCY_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  ...USER_CRYPTO_CURRENCIES.map((currency) => ({ value: currency, label: currency })),
]
