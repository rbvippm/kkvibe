/** 会员退水比例 · Mock */

import { ref } from 'vue'
import {
  AGENT_PROFIT_RATIO_TYPE_LABEL,
  AGENT_PROFIT_RATIO_TYPE_TABS,
  parseAgentProfitRatioType,
  type AgentProfitRatioType,
} from './agentProfitRatio'
import { DEFAULT_MEMBER_CREDIT_PRODUCTS, type MemberCreditProduct } from './memberCredit'
import { teamCreditMembers, teamDirectMembers } from './agentTeam'

export type MemberRebateProduct = MemberCreditProduct
export type MemberRebateRatioType = AgentProfitRatioType

export { AGENT_PROFIT_RATIO_TYPE_TABS as MEMBER_REBATE_RATIO_TYPE_TABS }
export { AGENT_PROFIT_RATIO_TYPE_LABEL as MEMBER_REBATE_RATIO_TYPE_LABEL }
export { parseAgentProfitRatioType as parseMemberRebateRatioType }

export const DEFAULT_MEMBER_REBATE_PRODUCTS: MemberRebateProduct[] =
  DEFAULT_MEMBER_CREDIT_PRODUCTS.map((item) => ({ ...item, rebate: 0 }))

/** 信用退水默认 Mock（数值略区分于现金便于演示） */
export const DEFAULT_MEMBER_CREDIT_REBATE_PRODUCTS: MemberRebateProduct[] =
  DEFAULT_MEMBER_CREDIT_PRODUCTS.map((item) => ({
    ...item,
    rebate: item.key === 'live' ? 0.1 : 0,
  }))

export const MEMBER_REBATE_PRODUCT_ICONS: Record<string, string> = {
  qutou: '趣',
  marble: '珠',
  scratch: '刮',
  lottery: '彩',
  live: '真',
  sports: '体',
  chess: '棋',
  fishing: '鱼',
  esports: '竞',
  slots: '虎',
  cockfight: '鸡',
}

/** 现金退水 · 原型共享状态 */
export const memberRebateProducts = ref<MemberRebateProduct[]>(
  DEFAULT_MEMBER_REBATE_PRODUCTS.map((item) => ({ ...item })),
)

/** 信用退水 · 原型共享状态（授信成功后可覆盖） */
export const memberCreditRebateProducts = ref<MemberRebateProduct[]>(
  DEFAULT_MEMBER_CREDIT_REBATE_PRODUCTS.map((item) => ({ ...item })),
)

export const memberRebateUpdatedAt = ref('2026-06-18 00:18:58')
export const memberCreditRebateUpdatedAt = ref('2026-06-18 00:18:58')

export function cloneMemberRebateProducts(products: MemberRebateProduct[]) {
  return products.map((item) => ({ ...item }))
}

export function getMemberRebateProducts(type: MemberRebateRatioType) {
  return type === 'credit' ? memberCreditRebateProducts : memberRebateProducts
}

export function getMemberRebateUpdatedAt(type: MemberRebateRatioType) {
  return type === 'credit' ? memberCreditRebateUpdatedAt : memberRebateUpdatedAt
}

export function getMemberRebateProductIcon(key: string) {
  return MEMBER_REBATE_PRODUCT_ICONS[key] ?? key.slice(0, 1).toUpperCase()
}

export function formatMemberRebatePercent(value: number) {
  const fixed = Number(value.toFixed(1))
  return `${fixed}%`
}

export function formatMemberRebateUpdatedAt(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function saveMemberRebateProducts(type: MemberRebateRatioType, products: MemberRebateProduct[]) {
  const next = cloneMemberRebateProducts(products)
  const now = formatMemberRebateUpdatedAt()
  if (type === 'credit') {
    memberCreditRebateProducts.value = next
    memberCreditRebateUpdatedAt.value = now
    return
  }
  memberRebateProducts.value = next
  memberRebateUpdatedAt.value = now
}

/** 会员授信成功：写入信用退水 */
export function syncCreditRebateFromMemberCredit(products: MemberCreditProduct[]) {
  memberCreditRebateProducts.value = products.map((item) => ({
    key: item.key,
    name: item.name,
    rebate: item.rebate,
    maxRebate: item.maxRebate,
  }))
  memberCreditRebateUpdatedAt.value = formatMemberRebateUpdatedAt()
}

/**
 * 目标会员是否已开通信用
 * 与团队筛选 Tab 无关：信用会员列表 / kind=credit_member / credited 任一成立即展示现金/信用分段
 */
export function isMemberCreditEnabled(
  targetId?: string,
  kindHint?: string,
  creditedHint?: string | boolean,
) {
  if (creditedHint === true || creditedHint === '1' || creditedHint === 'true') return true
  if (kindHint === 'credit_member') return true
  if (!targetId) return false
  return teamCreditMembers.value.some((item) => item.id === targetId)
}

export function resolveMemberKindHint(targetId?: string, kindHint?: string) {
  if (kindHint === 'credit_member' || kindHint === 'member') return kindHint
  if (!targetId) return 'member'
  if (teamCreditMembers.value.some((item) => item.id === targetId)) return 'credit_member'
  if (teamDirectMembers.value.some((item) => item.id === targetId)) return 'member'
  return 'member'
}
