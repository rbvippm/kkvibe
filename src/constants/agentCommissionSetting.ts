/** 推广返利 · 返佣金设置 · Mock（单层返佣：仅当月佣金档位） */

export type CommissionCurrency = 'KKC' | 'KKV' | 'USDT'

export type MonthlyCommissionTier = {
  id: string
  /** 当月总盈利门槛（含）：当月代理团队净输赢 */
  monthlyProfit: number
  /** 最低活跃人数（充值与有效投注均达阈值才计入） */
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

/** 当月总盈利列感叹号说明（与佣金公式分子一致） */
export const MONTHLY_TOTAL_PROFIT_TIP =
  '即当月代理团队净输赢，公式为 = 【输赢】 + 【-VIP退水】 + 【-场馆费】 + 【-VIP晋级礼金】 + 【-VIP额外奖金】 + 【-活动金】 + 【-充提手续费】'

/** 最低活跃人数列感叹号说明 */
export const MIN_ACTIVE_MEMBERS_TIP =
  '会员同时满足「充值金额达到阈值」且「有效投注金额达到阈值」，计为 1 名活跃人数。本列为档位要求的最低活跃人数。'

export function createEmptyMonthlyTier(): MonthlyCommissionTier {
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    monthlyProfit: 0,
    minActiveMembers: 0,
    commissionPct: 0,
  }
}
