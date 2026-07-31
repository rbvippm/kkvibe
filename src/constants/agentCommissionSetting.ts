/** 推广返利 · 返佣金设置 · Mock（单层返佣：仅当月佣金档位） */

export type CommissionCurrency = 'KKC' | 'KKV' | 'USDT'

export type MonthlyCommissionTier = {
  id: string
  /** 当月团队游戏输赢门槛（含） */
  monthlyProfit: number
  /** 最低活跃会员要求 */
  minActiveMembers: number
  /** 代理佣金（%） */
  commissionPct: number
}

export type CurrencyCommissionConfig = {
  currency: CommissionCurrency
  monthlyTiers: MonthlyCommissionTier[]
}

export const COMMISSION_CURRENCY_OPTIONS: { value: CommissionCurrency; label: string }[] = [
  { value: 'KKC', label: 'KKC' },
  { value: 'KKV', label: 'KKV' },
  { value: 'USDT', label: 'USDT' },
]

function cloneConfig(cfg: CurrencyCommissionConfig): CurrencyCommissionConfig {
  return {
    currency: cfg.currency,
    monthlyTiers: cfg.monthlyTiers.map((t) => ({ ...t })),
  }
}

/** 按币种的默认 Mock 配置 */
export const MOCK_COMMISSION_BY_CURRENCY: Record<CommissionCurrency, CurrencyCommissionConfig> = {
  KKC: {
    currency: 'KKC',
    monthlyTiers: [
      { id: 'kkc-m-1', monthlyProfit: 10000, minActiveMembers: 5, commissionPct: 5 },
      { id: 'kkc-m-2', monthlyProfit: 50000, minActiveMembers: 20, commissionPct: 8 },
      { id: 'kkc-m-3', monthlyProfit: 100000, minActiveMembers: 50, commissionPct: 12 },
    ],
  },
  KKV: {
    currency: 'KKV',
    monthlyTiers: [
      { id: 'kkv-m-1', monthlyProfit: 1000, minActiveMembers: 3, commissionPct: 4 },
    ],
  },
  USDT: {
    currency: 'USDT',
    monthlyTiers: [],
  },
}

export function getDefaultCommissionConfigs(): Record<CommissionCurrency, CurrencyCommissionConfig> {
  return {
    KKC: cloneConfig(MOCK_COMMISSION_BY_CURRENCY.KKC),
    KKV: cloneConfig(MOCK_COMMISSION_BY_CURRENCY.KKV),
    USDT: cloneConfig(MOCK_COMMISSION_BY_CURRENCY.USDT),
  }
}

export function formatPct(value: number) {
  return `${value.toFixed(2)}%`
}

export function formatProfit(value: number) {
  return value.toLocaleString('zh-CN')
}

export function createEmptyMonthlyTier(): MonthlyCommissionTier {
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    monthlyProfit: 0,
    minActiveMembers: 0,
    commissionPct: 0,
  }
}
