/** 代理收益比例 · Mock */

import { ref } from 'vue'

export type AgentProfitRatioProduct = {
  key: string
  name: string
  share: number
  rebate: number
  maxShare: number
  maxRebate: number
}

export type AgentProfitRelation = 'direct' | 'indirect'

export const AGENT_PROFIT_RELATION_LABEL: Record<AgentProfitRelation, string> = {
  direct: '直属',
  indirect: '间属',
}

export const DEFAULT_AGENT_PROFIT_RATIO_PRODUCTS: AgentProfitRatioProduct[] = [
  { key: 'fun', name: 'Fun Game', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'scratch', name: 'Scratch card', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'social', name: 'Social - P2P', share: 0, rebate: 0, maxShare: 0, maxRebate: 0 },
  { key: 'chess', name: '棋牌', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'esports', name: '电竞', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'fishing', name: '捕鱼', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'slots', name: '老虎机', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'sports', name: '体育', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'live', name: '真人', share: 1, rebate: 99, maxShare: 1, maxRebate: 99 },
  { key: 'lottery', name: '彩票', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
  { key: 'marble', name: '弹珠', share: 1, rebate: 0, maxShare: 1, maxRebate: 0 },
]

/** 代理收益比例 · 原型共享状态 */
export const agentProfitRatioProducts = ref<AgentProfitRatioProduct[]>(
  DEFAULT_AGENT_PROFIT_RATIO_PRODUCTS.map((item) => ({ ...item })),
)

export const AGENT_PROFIT_RATIO_PRODUCT_ICONS: Record<string, string> = {
  fun: 'F',
  scratch: 'S',
  social: 'S',
  chess: '棋',
  esports: '竞',
  fishing: '鱼',
  slots: '虎',
  sports: '体',
  live: '真',
  lottery: '彩',
  marble: '珠',
}

export function cloneAgentProfitRatioProducts(products: AgentProfitRatioProduct[]) {
  return products.map((item) => ({ ...item }))
}

export function getAgentProfitRatioProductIcon(key: string) {
  return AGENT_PROFIT_RATIO_PRODUCT_ICONS[key] ?? key.slice(0, 1).toUpperCase()
}

export function formatProfitRatioPercent(value: number) {
  return `${value}%`
}

export function getAgentProfitRelationLabel(relation?: string) {
  if (relation === 'indirect') return AGENT_PROFIT_RELATION_LABEL.indirect
  return AGENT_PROFIT_RELATION_LABEL.direct
}
