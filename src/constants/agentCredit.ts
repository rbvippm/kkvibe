/** 代理授信 · 产品收益比例 Mock */

export type AgentCreditProduct = {
  key: string
  name: string
  share: number
  rebate: number
  maxShare: number
  maxRebate: number
}

export const AGENT_CREDIT_STEPS = [
  { key: 'ratio', label: '收益比例' },
  { key: 'success', label: '授信成功' },
] as const

export const DEFAULT_AGENT_CREDIT_PRODUCTS: AgentCreditProduct[] = [
  { key: 'qutou', name: '趣投', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'marble', name: '弹珠', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'scratch', name: '刮刮乐', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'lottery', name: '彩票', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'live', name: '真人', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'sports', name: '体育', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'chess', name: '棋牌', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'fishing', name: '捕鱼', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'esports', name: '电竞', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'slots', name: '老虎机', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
  { key: 'cockfight', name: '斗鸡', share: 0, rebate: 0, maxShare: 1, maxRebate: 0.1 },
]

/** 占成：整数百分比；退水：最多两位小数 */
export function formatCreditPercent(value: number, kind: 'share' | 'rebate' = 'rebate') {
  if (kind === 'share') return `${Math.round(value)}%`
  return `${Number(value.toFixed(2))}%`
}

export function isValidSharePercent(value: number) {
  return Number.isFinite(value) && value >= 0 && Number.isInteger(value)
}

export function isValidRebatePercent(value: number) {
  if (!Number.isFinite(value) || value < 0) return false
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8
}

export function normalizeRebatePercent(value: number) {
  return Number(value.toFixed(2))
}
