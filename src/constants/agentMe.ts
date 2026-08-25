import { getAgentTotalProfit } from './agentDetailProfit'

export type AgentMeProfitRow = {
  key: string
  currency: string
  label: string
  value: string
}

export type AgentMeMenuItem = {
  key: string
  title: string
  icon: 'promo' | 'credit-agent' | 'credit-member' | 'credit-record'
  routeName?: string
}

export const MOCK_AGENT_ME_PROFILE = {
  nickname: 'OO1231236789',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent-me&backgroundColor=e8e8e8',
  level: 'V2',
  agentLevelLabel: '晶代',
  agentCount: 18,
  memberCount: 30,
}

/**
 * 各币种汇总行 Mock。
 * 占成：总盈亏口径对齐代理详情「代理盈亏」。
 * 返佣展示为「总佣金」：历史全部已结算汇总，不限月份。
 */
export const AGENT_ME_ASSETS = {
  megaphone: '/images/agent-me/icon-megaphone.svg',
  arrow: '/images/agent-me/icon-arrow-right.svg',
  member: '/images/agent-me/icon-member.svg',
} as const

export const MOCK_AGENT_ME_PROFIT_ROWS: AgentMeProfitRow[] = [
  { key: 'kkc', currency: 'KKC', label: 'KKC', value: getAgentTotalProfit('KKC').value },
  { key: 'kkv', currency: 'KKV', label: 'KKV', value: getAgentTotalProfit('KKV').value },
  { key: 'usdt', currency: 'USDT', label: 'USDT', value: getAgentTotalProfit('USDT').value },
  {
    key: 'credit-cny',
    currency: '信用额度-CNY',
    label: '信用额度-CNY',
    value: getAgentTotalProfit('信用额度-CNY').value,
  },
  {
    key: 'credit-usd',
    currency: '信用额度-USD',
    label: '信用额度-USD',
    value: getAgentTotalProfit('信用额度-USD').value,
  },
]

export const MOCK_AGENT_ME_UPDATED_AT = '2026-06-18 00:18:58'

export const AGENT_ME_MENU_ITEMS: AgentMeMenuItem[] = [
  { key: 'promo', title: '我的推广', icon: 'promo' },
  {
    key: 'credit-agent',
    title: '给代理上下分',
    icon: 'credit-agent',
    routeName: 'mobile-xcoin-credit-agent',
  },
  {
    key: 'credit-member',
    title: '给会员上下分',
    icon: 'credit-member',
    routeName: 'mobile-xcoin-credit-member',
  },
  {
    key: 'credit-record',
    title: '信用额度记录',
    icon: 'credit-record',
    routeName: 'mobile-xcoin-records',
  },
]
