/** 代理端身份：占成 / 返佣（由首页入口注入，影响后续定制） */

import {
  MOCK_COMMISSION_BY_CURRENCY,
  formatPct,
  type CommissionCurrency,
  type MonthlyCommissionTier,
} from './agentCommissionSetting'

export type AgentIdentityType = 'share' | 'rebate'

const STORAGE_KEY = 'kkvibe.agentIdentity'

export const AGENT_IDENTITY_LABEL: Record<AgentIdentityType, string> = {
  share: '占成代理',
  rebate: '返佣代理',
}

export function parseAgentIdentity(raw: unknown): AgentIdentityType {
  if (raw === 'rebate') return 'rebate'
  return 'share'
}

export function getStoredAgentIdentity(): AgentIdentityType {
  try {
    return parseAgentIdentity(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return 'share'
  }
}

export function setStoredAgentIdentity(type: AgentIdentityType) {
  try {
    sessionStorage.setItem(STORAGE_KEY, type)
  } catch {
    /* ignore */
  }
}

/** 概况币种 → 返佣金设置币种 */
export function overviewCurrencyToCommissionCurrency(currency: string): CommissionCurrency {
  if (currency === 'KKV') return 'KKV'
  if (currency === 'USDT' || currency.startsWith('USDT')) return 'USDT'
  return 'KKC'
}

/** 返佣代理 · 概况外露的当前适用比例（对齐当月佣金档位 / 账单） */
export function getRebateRatioDisplayText(overviewCurrency: string, billRate?: string): string {
  const key = overviewCurrencyToCommissionCurrency(overviewCurrency)
  const tiers = MOCK_COMMISSION_BY_CURRENCY[key].monthlyTiers
  if (tiers.length === 0) return '—'
  if (billRate && key === 'KKC') return billRate
  return formatPct(tiers[0].commissionPct)
}

/** 返佣比例详情：当前币种下全部当月佣金档位（对齐 BI 后台） */
export function getRebateCommissionTiers(overviewCurrency: string): MonthlyCommissionTier[] {
  const key = overviewCurrencyToCommissionCurrency(overviewCurrency)
  return MOCK_COMMISSION_BY_CURRENCY[key].monthlyTiers.map((t) => ({ ...t }))
}

/** 原型：代理当月团队表现（用于判断命中哪一档） */
export type RebateTierProgress = {
  /** 当月团队净输赢 */
  teamGameProfit: number
  /** 当月活跃人数 */
  activeMembers: number
}

export const MOCK_REBATE_TIER_PROGRESS: Record<CommissionCurrency, RebateTierProgress> = {
  /** 命中 KKC 第一档（≥10,000 且活跃≥5），未达第二档 */
  KKC: { teamGameProfit: 12_000, activeMembers: 12 },
  KKV: { teamGameProfit: 1_500, activeMembers: 5 },
  USDT: { teamGameProfit: 0, activeMembers: 0 },
}

/** 是否满足某档门槛（输赢、活跃均 ≥） */
export function isRebateTierMet(tier: MonthlyCommissionTier, progress: RebateTierProgress): boolean {
  return (
    progress.teamGameProfit >= tier.monthlyProfit &&
    progress.activeMembers >= tier.minActiveMembers
  )
}

/**
 * 当前命中档：同时满足门槛的最高档（按团队净输赢门槛排序）。
 * 无命中返回 null。
 */
export function getMatchedRebateTierId(overviewCurrency: string): string | null {
  const key = overviewCurrencyToCommissionCurrency(overviewCurrency)
  const progress = MOCK_REBATE_TIER_PROGRESS[key]
  const tiers = [...MOCK_COMMISSION_BY_CURRENCY[key].monthlyTiers].sort(
    (a, b) => a.monthlyProfit - b.monthlyProfit,
  )
  let matched: MonthlyCommissionTier | null = null
  for (const tier of tiers) {
    if (isRebateTierMet(tier, progress)) matched = tier
  }
  return matched?.id ?? null
}

/** 兼容旧调用；详情已改为档位表 */
export const AGENT_MY_REBATE_RATIO_ROWS = [
  { key: 'platform', name: '平台佣金', shareText: '5.00%' },
] as const

export type AgentRebateRatioRow = (typeof AGENT_MY_REBATE_RATIO_ROWS)[number]

/** 兼容既有调用；返佣单层化后代理层级不影响比例行。 */
export function agentMyRebateRatioRowsByLevel(_agentLevel: 1 | 2 | 3 = 1): AgentRebateRatioRow[] {
  return [...AGENT_MY_REBATE_RATIO_ROWS]
}
