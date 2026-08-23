/** 会员授信 · 产品退水 Mock */

import {
  emptySelectableCredits,
  findOtherMemberByAccountQuery,
  MOCK_DIRECT_MEMBERS,
  type XCoinSelectableTarget,
} from './xCoinTransfer'
import { teamCreditAgents, teamDirectMembers } from './agentTeam'

export type MemberCreditProduct = {
  key: string
  name: string
  rebate: number
  maxRebate: number
}

/** 其他会员授信 · 金刚号查询结果 */
export type MemberCreditKingkongLookupResult =
  | {
      ok: true
      tip: string
      member: XCoinSelectableTarget
    }
  | {
      ok: false
      message: string
    }

/** 原型：命中即视为已是信用代理的金刚号 */
const MOCK_CREDIT_AGENT_KINGKONGS = new Set(['88661234', 'xy888888', 'credit8888'])

/** 原型：命中即视为自己的直属会员（额外关键字；另含 MOCK_DIRECT_MEMBERS） */
const MOCK_DIRECT_MEMBER_KINGKONGS = new Set(['direct8888', 'zs888888'])

const MOCK_MEMBER_NICKNAMES: Record<string, string> = {
  '66880031': 'openapi31axy8',
  '88661202': 'mid_eyv4menuoax',
  ming88888: '明哥888',
  lin11121: '小林棋王',
}

function isAlreadyCreditAgent(normalized: string) {
  if (MOCK_CREDIT_AGENT_KINGKONGS.has(normalized)) return true
  /** agent*：以 agent 开头即视为信用代理（如 agent8、agent888） */
  if (normalized.startsWith('agent')) return true
  if (normalized.includes('creditagent') || normalized.startsWith('xy_credit')) return true
  return teamCreditAgents.value.some(
    (item) => item.id.toLowerCase() === normalized || item.nickname.trim().toLowerCase() === normalized,
  )
}

function isOwnDirectMember(normalized: string) {
  if (MOCK_DIRECT_MEMBER_KINGKONGS.has(normalized)) return true
  /** direct*：以 direct 开头即视为自己的直属会员 */
  if (normalized.startsWith('direct')) return true
  if (
    MOCK_DIRECT_MEMBERS.some(
      (item) =>
        item.kingkongId.toLowerCase() === normalized ||
        item.nickname.toLowerCase() === normalized ||
        item.accountId.toLowerCase() === normalized ||
        item.userId.toLowerCase() === normalized,
    )
  ) {
    return true
  }
  return teamDirectMembers.value.some(
    (item) =>
      item.id.toLowerCase() === normalized ||
      item.nickname.trim().toLowerCase() === normalized ||
      item.kingkongId?.trim().toLowerCase() === normalized,
  )
}

function isKingkongMissing(normalized: string) {
  if (normalized.length < 4) return true
  if (normalized.includes('none') || normalized.includes('missing') || normalized === '404') return true
  return false
}

function isChannelMismatch(normalized: string) {
  return normalized.includes('channel')
}

function buildLookupMember(raw: string, normalized: string): XCoinSelectableTarget {
  const found = findOtherMemberByAccountQuery(raw)
  if (found) return found

  const nickname = MOCK_MEMBER_NICKNAMES[normalized] ?? `会员_${raw.slice(-4)}`
  return {
    id: `mc_${normalized}`,
    nickname,
    kingkongId: raw,
    userId: `1${normalized.replace(/\D/g, '').padStart(7, '0').slice(0, 7) || '0000001'}`,
    accountId: `mid_${normalized}`,
    relation: 'non_direct_member',
    credits: emptySelectableCredits(),
  }
}

/**
 * 其他会员授信 · 按金刚号查询校验
 * 1. 金刚号必须存在
 * 2. 渠道须与当前代理一致
 * 3. 已是自己的直属会员不可再授信
 */
export function lookupMemberCreditByKingkong(input: string): MemberCreditKingkongLookupResult {
  const raw = input.trim()
  const normalized = raw.toLowerCase()

  if (!normalized) {
    return { ok: false, message: '请输入对方金刚号' }
  }

  if (isKingkongMissing(normalized)) {
    return { ok: false, message: '金刚号不存在' }
  }

  if (isChannelMismatch(normalized)) {
    return { ok: false, message: '渠道不一致，请联系客服处理' }
  }

  if (isOwnDirectMember(normalized)) {
    return { ok: false, message: '该账号已是你的直属会员，请从团队管理发起授信' }
  }

  if (isAlreadyCreditAgent(normalized)) {
    return { ok: false, message: '该账号已是信用代理' }
  }

  return {
    ok: true,
    tip: '会员符合授信条件，请确认后设置退水',
    member: buildLookupMember(raw, normalized),
  }
}

export const DEFAULT_MEMBER_CREDIT_PRODUCTS: MemberCreditProduct[] = [
  { key: 'qutou', name: '趣投', rebate: 0, maxRebate: 0.1 },
  { key: 'marble', name: '弹珠', rebate: 0, maxRebate: 0.1 },
  { key: 'scratch', name: '刮刮乐', rebate: 0, maxRebate: 0.1 },
  { key: 'lottery', name: '彩票', rebate: 0, maxRebate: 0.1 },
  { key: 'live', name: '真人', rebate: 0, maxRebate: 0.1 },
  { key: 'sports', name: '体育', rebate: 0, maxRebate: 0.1 },
  { key: 'chess', name: '棋牌', rebate: 0, maxRebate: 0.1 },
  { key: 'fishing', name: '捕鱼', rebate: 0, maxRebate: 0.1 },
  { key: 'esports', name: '电竞', rebate: 0, maxRebate: 0.1 },
  { key: 'slots', name: '老虎机', rebate: 0, maxRebate: 0.1 },
  { key: 'cockfight', name: '斗鸡', rebate: 0, maxRebate: 0.1 },
]

export function formatMemberCreditPercent(value: number) {
  return `${value}%`
}

export const OTHER_MEMBER_CREDIT_STEPS = [
  { key: 'search', label: '查询会员' },
  { key: 'rebate', label: '设置退水' },
  { key: 'credit_up', label: '给他上分' },
] as const
