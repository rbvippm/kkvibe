/** 会员退水比例 · Mock */

import { ref } from 'vue'
import {
  AGENT_PROFIT_RATIO_TYPE_LABEL,
  AGENT_PROFIT_RATIO_TYPE_TABS,
  parseAgentProfitRatioType,
  type AgentProfitRatioType,
} from './agentProfitRatio'
import { teamCreditMembers, teamDirectMembers } from './agentTeam'

export type MemberRebateRatioType = AgentProfitRatioType

/** 大类下的具体产品退水 */
export type MemberRebateProduct = {
  key: string
  name: string
  /** 该产品当前退水 */
  rebate: number
  /** 该产品退水上限 */
  maxRebate: number
}

/** 大类只保留百分比，用来批量填写产品，本身不存具体退水值 */
export type MemberRebateCategory = {
  key: string
  name: string
  percent: number
  /** 上级该大类退水上限 */
  parentMaxRebate: number
  products: MemberRebateProduct[]
}

export { AGENT_PROFIT_RATIO_TYPE_TABS as MEMBER_REBATE_RATIO_TYPE_TABS }
export { AGENT_PROFIT_RATIO_TYPE_LABEL as MEMBER_REBATE_RATIO_TYPE_LABEL }
export { parseAgentProfitRatioType as parseMemberRebateRatioType }

const MEMBER_REBATE_CATEGORY_SEED: MemberRebateCategory[] = [
  {
    key: 'qutou',
    name: '趣投',
    percent: 0,
    parentMaxRebate: 0.3,
    products: [
      { key: 'crash', name: '爆点', rebate: 0.22, maxRebate: 0.3 },
      { key: 'mini', name: '小游戏', rebate: 0.12, maxRebate: 0.15 },
      { key: 'rocket', name: '火箭', rebate: 0.18, maxRebate: 0.22 },
    ],
  },
  {
    key: 'marble',
    name: '弹珠',
    percent: 0,
    parentMaxRebate: 0.28,
    products: [
      { key: 'im', name: 'IM弹珠', rebate: 0.2, maxRebate: 0.28 },
      { key: 'magic', name: '魔幻弹珠', rebate: 0.15, maxRebate: 0.18 },
    ],
  },
  {
    key: 'scratch',
    name: '刮刮乐',
    percent: 0,
    parentMaxRebate: 0.25,
    products: [
      { key: 'ggl', name: 'GGL刮乐', rebate: 0.18, maxRebate: 0.25 },
      { key: 'lucky', name: '幸运刮刮乐', rebate: 0.1, maxRebate: 0.16 },
    ],
  },
  {
    key: 'lottery',
    name: '彩票',
    percent: 0,
    parentMaxRebate: 0.3,
    products: [
      { key: 'saba', name: 'SABA彩票', rebate: 0.25, maxRebate: 0.3 },
      { key: 'kuai3', name: '一分快三', rebate: 0.16, maxRebate: 0.2 },
    ],
  },
  {
    key: 'live',
    name: '真人',
    percent: 0,
    parentMaxRebate: 0.27,
    products: [
      { key: 'im', name: 'IM真人', rebate: 0.2, maxRebate: 0.27 },
      { key: 'pa', name: 'PA真人', rebate: 0.12, maxRebate: 0.17 },
    ],
  },
  {
    key: 'sports',
    name: '体育',
    percent: 0,
    parentMaxRebate: 0.24,
    products: [
      { key: 'im', name: 'IM体育', rebate: 0.18, maxRebate: 0.24 },
      { key: 'saba', name: 'SABA体育', rebate: 0.15, maxRebate: 0.19 },
    ],
  },
  {
    key: 'chess',
    name: '棋牌',
    percent: 0,
    parentMaxRebate: 0.3,
    products: [
      { key: 'im', name: 'IM棋牌', rebate: 0.24, maxRebate: 0.3 },
      { key: 'cdn', name: 'CDN棋牌', rebate: 0.16, maxRebate: 0.21 },
      { key: 'niuniu', name: '牛牛大战', rebate: 0.1, maxRebate: 0.16 },
    ],
  },
  {
    key: 'fishing',
    name: '捕鱼',
    percent: 0,
    parentMaxRebate: 0.26,
    products: [
      { key: 'master', name: '捕鱼达人', rebate: 0.2, maxRebate: 0.26 },
      { key: 'im', name: 'IM捕鱼', rebate: 0.12, maxRebate: 0.15 },
    ],
  },
  {
    key: 'esports',
    name: '电竞',
    percent: 0,
    parentMaxRebate: 0.29,
    products: [
      { key: 'im', name: 'IM电竞', rebate: 0.22, maxRebate: 0.29 },
      { key: 'tf', name: '雷火电竞', rebate: 0.15, maxRebate: 0.2 },
    ],
  },
  {
    key: 'slots',
    name: '老虎机',
    percent: 0,
    parentMaxRebate: 0.23,
    products: [
      { key: 'pp', name: 'PP老虎机', rebate: 0.18, maxRebate: 0.23 },
      { key: 'pg', name: 'PG老虎机', rebate: 0.12, maxRebate: 0.18 },
    ],
  },
  {
    key: 'cockfight',
    name: '斗鸡',
    percent: 0,
    parentMaxRebate: 0.3,
    products: [
      { key: 'royal', name: '皇家斗鸡', rebate: 0.2, maxRebate: 0.3 },
      { key: 'thai', name: '泰国斗鸡', rebate: 0.1, maxRebate: 0.15 },
    ],
  },
]

function cloneMemberRebateCategories(categories: MemberRebateCategory[]) {
  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({ ...product })),
  }))
}

/** 大类可填上限：上级该大类退水，与本类产品上限里最高的那个，取较小值 */
export function memberRebateCategoryCeiling(category: MemberRebateCategory) {
  const productCeil = category.products.reduce((max, item) => Math.max(max, item.maxRebate), 0)
  if (!category.products.length) return category.parentMaxRebate
  return Math.min(category.parentMaxRebate, productCeil)
}

/** 大类百分比写入后，其下产品全部改成这个退水；超过产品自己上限时只取到上限 */
export function applyMemberRebateCategoryPercent(category: MemberRebateCategory) {
  category.products.forEach((product) => {
    product.rebate = Math.min(category.percent, product.maxRebate)
  })
}

export function createMemberRebateCategories() {
  return cloneMemberRebateCategories(MEMBER_REBATE_CATEGORY_SEED)
}

/** 新开会员 / 授信：大类滑块和产品退水都从 0 开始，上限沿用同一套产品 */
export function createBlankMemberRebateCategories() {
  return createMemberRebateCategories().map((category) => ({
    ...category,
    percent: 0,
    products: category.products.map((product) => ({ ...product, rebate: 0 })),
  }))
}

/** 信用退水默认：在现金具体值上，真人各产品再高 0.02，便于区分两套 */
export function createMemberCreditRebateCategories() {
  const categories = createMemberRebateCategories()
  const live = categories.find((item) => item.key === 'live')
  live?.products.forEach((product) => {
    product.rebate = Math.min(Number((product.rebate + 0.02).toFixed(2)), product.maxRebate)
  })
  return categories
}

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
export const memberRebateCategories = ref<MemberRebateCategory[]>(createMemberRebateCategories())

/** 邀请链接入会时带出的默认现金退水 */
export const memberDefaultRebateCategories = ref<MemberRebateCategory[]>(createMemberRebateCategories())
export const memberDefaultRebateUpdatedAt = ref('2026-06-18 00:18:58')

/** 信用退水 · 原型共享状态（授信成功后可覆盖） */
export const memberCreditRebateCategories = ref<MemberRebateCategory[]>(createMemberCreditRebateCategories())

export const memberRebateUpdatedAt = ref('2026-06-18 00:18:58')
export const memberCreditRebateUpdatedAt = ref('2026-06-18 00:18:58')

export function getMemberRebateCategories(type: MemberRebateRatioType) {
  return type === 'credit' ? memberCreditRebateCategories : memberRebateCategories
}

export function getMemberRebateUpdatedAt(type: MemberRebateRatioType) {
  return type === 'credit' ? memberCreditRebateUpdatedAt : memberRebateUpdatedAt
}

export function getMemberRebateProductIcon(key: string) {
  return MEMBER_REBATE_PRODUCT_ICONS[key] ?? key.slice(0, 1).toUpperCase()
}

export function formatMemberRebateNumber(value: number) {
  return String(Number(value.toFixed(2)))
}

export function formatMemberRebatePercent(value: number) {
  return `${formatMemberRebateNumber(value)}%`
}

export function formatMemberRebateUpdatedAt(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function saveMemberDefaultRebateCategories(categories: MemberRebateCategory[]) {
  memberDefaultRebateCategories.value = cloneMemberRebateCategories(categories)
  memberDefaultRebateUpdatedAt.value = formatMemberRebateUpdatedAt()
}

/** 邀请链接加入的会员：现金退水直接复制当前默认配置 */
export function createInviteLinkMemberRebateCategories() {
  return cloneMemberRebateCategories(memberDefaultRebateCategories.value)
}

export function saveMemberRebateCategories(type: MemberRebateRatioType, categories: MemberRebateCategory[]) {
  const next = cloneMemberRebateCategories(categories)
  const now = formatMemberRebateUpdatedAt()
  if (type === 'credit') {
    memberCreditRebateCategories.value = next
    memberCreditRebateUpdatedAt.value = now
    return
  }
  memberRebateCategories.value = next
  memberRebateUpdatedAt.value = now
}

/** 会员授信成功：把本次按大类和产品填写的退水写入信用退水 */
export function syncCreditRebateFromMemberCredit(categories: MemberRebateCategory[]) {
  memberCreditRebateCategories.value = cloneMemberRebateCategories(categories)
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
