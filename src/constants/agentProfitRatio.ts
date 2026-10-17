/** 代理收益比例 · Mock */

import { ref } from 'vue'
import {
  DEFAULT_AGENT_CREDIT_MAX_COST,
  DEFAULT_AGENT_CREDIT_PRODUCTS,
  normalizeCostPercent,
} from './agentCredit'
import { teamCreditAgents, teamDirectAgents } from './agentTeam'

export { DEFAULT_AGENT_CREDIT_MAX_COST as AGENT_PROFIT_RATIO_MAX_COST }

/** 大类下的具体产品：只挂退水 */
export type AgentProfitRatioChild = {
  key: string
  name: string
  rebate: number
  maxRebate: number
}

/** 游戏大类：占成在大类上，退水在下属产品上 */
export type AgentProfitRatioCategory = {
  key: string
  name: string
  share: number
  maxShare: number
  products: AgentProfitRatioChild[]
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

type AgentProfitChildSeed = {
  key: string
  name: string
  rebate: number
  maxRebate: number
}

/** 趣投与 Fun Game 共用同一套小类 */
const AGENT_PROFIT_CHILD_SEEDS: Record<string, AgentProfitChildSeed[]> = {
  fun: [
    { key: 'crash', name: '爆点', rebate: 0.22, maxRebate: 0.3 },
    { key: 'mini', name: '小游戏', rebate: 0.12, maxRebate: 0.15 },
    { key: 'rocket', name: '火箭', rebate: 0.18, maxRebate: 0.22 },
  ],
  scratch: [
    { key: 'ggl', name: 'GGL刮乐', rebate: 0.18, maxRebate: 0.25 },
    { key: 'lucky', name: '幸运刮刮乐', rebate: 0.1, maxRebate: 0.16 },
  ],
  social: [
    { key: 'friend', name: '好友房', rebate: 0, maxRebate: 0 },
    { key: 'match', name: '匹配局', rebate: 0, maxRebate: 0 },
  ],
  chess: [
    { key: 'im', name: 'IM棋牌', rebate: 0.24, maxRebate: 0.3 },
    { key: 'cdn', name: 'CDN棋牌', rebate: 0.16, maxRebate: 0.21 },
    { key: 'niuniu', name: '牛牛大战', rebate: 0.1, maxRebate: 0.16 },
  ],
  esports: [
    { key: 'im', name: 'IM电竞', rebate: 0.22, maxRebate: 0.29 },
    { key: 'tf', name: '雷火电竞', rebate: 0.15, maxRebate: 0.2 },
  ],
  fishing: [
    { key: 'master', name: '捕鱼达人', rebate: 0.2, maxRebate: 0.26 },
    { key: 'im', name: 'IM捕鱼', rebate: 0.12, maxRebate: 0.15 },
  ],
  slots: [
    { key: 'pp', name: 'PP老虎机', rebate: 0.18, maxRebate: 0.23 },
    { key: 'pg', name: 'PG老虎机', rebate: 0.12, maxRebate: 0.18 },
  ],
  sports: [
    { key: 'im', name: 'IM体育', rebate: 0.18, maxRebate: 0.24 },
    { key: 'saba', name: 'SABA体育', rebate: 0.15, maxRebate: 0.19 },
  ],
  live: [
    { key: 'im', name: 'IM真人', rebate: 0.2, maxRebate: 0.27 },
    { key: 'pa', name: 'PA真人', rebate: 0.12, maxRebate: 0.17 },
  ],
  lottery: [
    { key: 'saba', name: 'SABA彩票', rebate: 0.25, maxRebate: 0.3 },
    { key: 'kuai3', name: '一分快三', rebate: 0.16, maxRebate: 0.2 },
  ],
  marble: [
    { key: 'im', name: 'IM弹珠', rebate: 0.2, maxRebate: 0.28 },
    { key: 'magic', name: '魔幻弹珠', rebate: 0.15, maxRebate: 0.18 },
  ],
  cockfight: [
    { key: 'royal', name: '皇家斗鸡', rebate: 0.2, maxRebate: 0.3 },
    { key: 'thai', name: '泰国斗鸡', rebate: 0.1, maxRebate: 0.15 },
  ],
}

const AGENT_PROFIT_CASH_CATEGORIES: Array<Omit<AgentProfitRatioCategory, 'products'>> = [
  { key: 'fun', name: 'Fun Game', share: 1, maxShare: 1 },
  { key: 'scratch', name: 'Scratch card', share: 1, maxShare: 1 },
  { key: 'social', name: 'Social - P2P', share: 0, maxShare: 0 },
  { key: 'chess', name: '棋牌', share: 1, maxShare: 1 },
  { key: 'esports', name: '电竞', share: 1, maxShare: 1 },
  { key: 'fishing', name: '捕鱼', share: 1, maxShare: 1 },
  { key: 'slots', name: '老虎机', share: 1, maxShare: 1 },
  { key: 'sports', name: '体育', share: 1, maxShare: 1 },
  { key: 'live', name: '真人', share: 1, maxShare: 1 },
  { key: 'lottery', name: '彩票', share: 1, maxShare: 1 },
  { key: 'marble', name: '弹珠', share: 1, maxShare: 1 },
]

function childSeedKey(categoryKey: string) {
  return categoryKey === 'qutou' ? 'fun' : categoryKey
}

function createChildren(categoryKey: string): AgentProfitRatioChild[] {
  return (AGENT_PROFIT_CHILD_SEEDS[childSeedKey(categoryKey)] ?? []).map((item) => ({ ...item }))
}

export function createAgentProfitRatioCategories(): AgentProfitRatioCategory[] {
  return AGENT_PROFIT_CASH_CATEGORIES.map((category) => ({
    ...category,
    products: createChildren(category.key),
  }))
}

/** 信用收益比例默认：清单同授信页；真人占成 1%、其下产品退水 0.1%，其余为 0 */
export function createAgentCreditProfitRatioCategories(): AgentProfitRatioCategory[] {
  return DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({
    key: item.key,
    name: item.name,
    share: item.key === 'live' ? 1 : 0,
    maxShare: item.maxShare,
    products: createChildren(item.key).map((product) => ({
      ...product,
      rebate: item.key === 'live' ? Math.min(0.1, product.maxRebate) : 0,
    })),
  }))
}

/** 新增 / 授信 / 邀请：占成与退水从 0 起填，上限沿用信用大类 */
export function createBlankAgentShareRebateCategories(): AgentProfitRatioCategory[] {
  return createAgentCreditProfitRatioCategories().map((category) => ({
    ...category,
    share: 0,
    products: category.products.map((product) => ({ ...product, rebate: 0 })),
  }))
}

/** 现金收益比例 · 原型共享状态 */
export const agentProfitRatioCategories = ref<AgentProfitRatioCategory[]>(createAgentProfitRatioCategories())

/** 信用收益比例 · 原型共享状态（授信成功后可覆盖） */
export const agentCreditProfitRatioCategories = ref<AgentProfitRatioCategory[]>(
  createAgentCreditProfitRatioCategories(),
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

export function cloneAgentProfitRatioCategories(categories: AgentProfitRatioCategory[]) {
  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({ ...product })),
  }))
}

export function getAgentProfitRatioCategories(type: AgentProfitRatioType) {
  return type === 'credit' ? agentCreditProfitRatioCategories : agentProfitRatioCategories
}

export function saveAgentProfitRatioCategories(
  type: AgentProfitRatioType,
  categories: AgentProfitRatioCategory[],
) {
  const next = cloneAgentProfitRatioCategories(categories)
  if (type === 'credit') {
    agentCreditProfitRatioCategories.value = next
    return
  }
  agentProfitRatioCategories.value = next
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

/** 授信或占成创建成功：把当前大类占成和小类退水写入信用收益比例 */
export function syncCreditProfitRatioFromCredit(categories: AgentProfitRatioCategory[], cost = 0) {
  agentCreditProfitRatioCategories.value = cloneAgentProfitRatioCategories(categories)
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
