/** 代理收益比例 · Mock */

import { ref } from 'vue'
import {
  DEFAULT_AGENT_CREDIT_MAX_COST,
  DEFAULT_AGENT_CREDIT_PRODUCTS,
  normalizeCostPercent,
  type AgentCreditProduct,
} from './agentCredit'
import { teamCreditAgents, teamDirectAgents } from './agentTeam'

export { DEFAULT_AGENT_CREDIT_MAX_COST as AGENT_PROFIT_RATIO_MAX_COST }

export type AgentProfitRatioProduct = {
  key: string
  name: string
  share: number
  rebate: number
  maxShare: number
  maxRebate: number
}

export type AgentProfitRelation = 'direct' | 'indirect'

/** 现金 / 信用收益比例 */
export type AgentProfitRatioType = 'cash' | 'credit'

export const AGENT_PROFIT_RATIO_TYPE_TABS: { key: AgentProfitRatioType; label: string }[] = [
  { key: 'cash', label: '现金' },
  { key: 'credit', label: '信用' },
]

export const AGENT_PROFIT_RATIO_TYPE_LABEL: Record<AgentProfitRatioType, string> = {
  cash: '现金',
  credit: '信用',
}

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

/** 信用收益比例默认 Mock（与授信产品表一致，数值略区分于现金便于演示） */
export const DEFAULT_AGENT_CREDIT_PROFIT_RATIO_PRODUCTS: AgentProfitRatioProduct[] =
  DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({
    ...item,
    share: item.key === 'live' ? 1 : 0,
    rebate: item.key === 'live' ? 0.1 : 0,
  }))

/** 现金收益比例 · 原型共享状态 */
export const agentProfitRatioProducts = ref<AgentProfitRatioProduct[]>(
  DEFAULT_AGENT_PROFIT_RATIO_PRODUCTS.map((item) => ({ ...item })),
)

/** 信用收益比例 · 原型共享状态（授信成功后可覆盖） */
export const agentCreditProfitRatioProducts = ref<AgentProfitRatioProduct[]>(
  DEFAULT_AGENT_CREDIT_PROFIT_RATIO_PRODUCTS.map((item) => ({ ...item })),
)

/** 现金 / 信用成本（全局整数比例，与占成滑块联动） */
export const agentCashProfitCost = ref(0)
export const agentCreditProfitCost = ref(0)

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
  qutou: '趣',
  cockfight: '鸡',
}

export function cloneAgentProfitRatioProducts(products: AgentProfitRatioProduct[]) {
  return products.map((item) => ({ ...item }))
}

export function getAgentProfitRatioProducts(type: AgentProfitRatioType) {
  return type === 'credit' ? agentCreditProfitRatioProducts : agentProfitRatioProducts
}

export function saveAgentProfitRatioProducts(
  type: AgentProfitRatioType,
  products: AgentProfitRatioProduct[],
) {
  const next = cloneAgentProfitRatioProducts(products)
  if (type === 'credit') {
    agentCreditProfitRatioProducts.value = next
    return
  }
  agentProfitRatioProducts.value = next
}

export function getAgentProfitCost(type: AgentProfitRatioType) {
  return type === 'credit' ? agentCreditProfitCost : agentCashProfitCost
}

export function saveAgentProfitCost(type: AgentProfitRatioType, cost: number) {
  const next = Math.min(
    normalizeCostPercent(Math.max(0, cost)),
    DEFAULT_AGENT_CREDIT_MAX_COST,
  )
  if (type === 'credit') {
    agentCreditProfitCost.value = next
    return
  }
  agentCashProfitCost.value = next
}

/** 授信成功：把本次信用产品比例与成本写入「信用收益比例」 */
export function syncCreditProfitRatioFromCredit(products: AgentCreditProduct[], cost = 0) {
  agentCreditProfitRatioProducts.value = products.map((item) => ({ ...item }))
  saveAgentProfitCost('credit', cost)
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

export function parseAgentProfitRatioType(raw?: string | null): AgentProfitRatioType {
  return raw === 'credit' ? 'credit' : 'cash'
}

/**
 * 目标代理是否已开通信用（可查看/修改信用收益比例）
 * 与团队管理当前筛选 Tab 无关：只要在信用代理列表，或入口标明 credit_agent / credited，即展示现金/信用 Tab
 */
export function isAgentCreditEnabled(
  targetId?: string,
  kindHint?: string,
  creditedHint?: string | boolean,
) {
  if (creditedHint === true || creditedHint === '1' || creditedHint === 'true') return true
  if (kindHint === 'credit_agent') return true
  if (!targetId) return false
  return teamCreditAgents.value.some((item) => item.id === targetId)
}

export function resolveAgentKindHint(targetId?: string, kindHint?: string) {
  if (kindHint === 'credit_agent' || kindHint === 'agent') return kindHint
  if (!targetId) return 'agent'
  if (teamCreditAgents.value.some((item) => item.id === targetId)) return 'credit_agent'
  if (teamDirectAgents.value.some((item) => item.id === targetId)) return 'agent'
  return 'agent'
}
