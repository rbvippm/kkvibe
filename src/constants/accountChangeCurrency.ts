/** 账变模块 · 币种类型（筛选项 / 发起账变 / 列表展示） */
export const ACCOUNT_CHANGE_CURRENCIES = [
  { value: 'usdt_tron', label: 'USDT(TRON)' },
  { value: 'usdt_sol', label: 'USDT(SOL)' },
  { value: 'kkc', label: 'KKC' },
  { value: 'kkv', label: 'KKV' },
  { value: 'eth', label: 'ETH' },
  { value: 'btc', label: 'BTC' },
  { value: 'trx', label: 'TRX' },
  { value: 'sol', label: 'SOL' },
  { value: 'activity_usdt_tron', label: '活动金-USDT-TRON' },
  { value: 'activity_kkc', label: '活动金-KKC' },
  { value: 'activity_kkv', label: '活动金-KKV' },
] as const

export type AccountChangeCurrencyValue = (typeof ACCOUNT_CHANGE_CURRENCIES)[number]['value']

/** 表单下拉（含「请选择」占位） */
export const ACCOUNT_CHANGE_CURRENCY_OPTIONS = [
  { value: '', label: '请选择' },
  ...ACCOUNT_CHANGE_CURRENCIES,
]

export function accountChangeCurrencyLabel(value: string) {
  return ACCOUNT_CHANGE_CURRENCIES.find((item) => item.value === value)?.label ?? value
}

/** 按场景拆分的「币种类型」需求说明（用于 wf-spec-annot） */
export const ACCOUNT_CHANGE_CURRENCY_SPEC = {
  filter: [
    '筛选项对应列表「币种类型」列，不选表示查询全部。',
    '可选：USDT(TRON)、USDT(SOL)、KKC、KKV、ETH、BTC、TRX、SOL，及活动金-USDT-TRON、活动金-KKC、活动金-KKV。',
    '仅支持虚拟货币与活动金币种，不含法币。',
  ],
  table: [
    '展示每笔账变的币种，与筛选、发起时选项一致。',
    '仅支持虚拟货币与活动金账变，不含法币。',
  ],
  form: [
    '发起账变时必选，提交后写入列表「币种类型」列。',
    '可选币种与筛选项一致，含虚拟货币与活动金币种。',
  ],
} as const

export type AccountChangeCurrencySpecContext = keyof typeof ACCOUNT_CHANGE_CURRENCY_SPEC
