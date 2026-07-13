import { filterTeamList, MOCK_TEAM_SELF, type TeamListItem } from './agentTeam'

export type AgentDetailTab = 'wallet' | 'credit' | 'profit' | 'login'

export const AGENT_DETAIL_TABS: { key: AgentDetailTab; label: string }[] = [
  { key: 'wallet', label: '代理钱包' },
  { key: 'profit', label: '代理盈亏' },
  { key: 'login', label: '登录日志' },
]

/** 已授信时默认展示「信用额度」总 Tab */
export const AGENT_DETAIL_CREDIT_TAB: { key: AgentDetailTab; label: string } = {
  key: 'credit',
  label: '信用额度',
}

export function getAgentDetailTabs(isCredited: boolean): { key: AgentDetailTab; label: string }[] {
  if (!isCredited) return AGENT_DETAIL_TABS
  return [AGENT_DETAIL_TABS[0], AGENT_DETAIL_CREDIT_TAB, AGENT_DETAIL_TABS[1], AGENT_DETAIL_TABS[2]]
}

export const AGENT_DETAIL_CURRENCIES = ['KKC', 'USDT', 'KKV'] as const

export const AGENT_WALLET_CURRENCY_OPTIONS = [
  'KKC',
  'KKV',
  'USDT',
  '信用额度-kkc',
  '信用额度-usdt',
] as const

export type AgentWalletCurrency = (typeof AGENT_WALLET_CURRENCY_OPTIONS)[number]

export type AgentCreditCurrency = '信用额度-kkc' | '信用额度-usdt'

export type AgentCreditLimitStats = {
  creditBalance: number
  creditUpTotal: number
  creditDownTotal: number
  /** 占成比例 0-100 */
  shareRatio: number
}

export type AgentDetailProfile = {
  id: string
  nickname: string
  avatarEmoji: string
  lastLogin: string
  levelBadge: string
  /** 备注（上下分展示名优先） */
  remark?: string
  /** 金刚号（昵称为空时兜底） */
  kingkongId?: string
  /** 是否已开通信用（授信过才展示信用额度） */
  isCredited: boolean
  stats: {
    agents: number
    directAgents: number
    members: number
    directMembers: number
  }
  wallets: { currency: string; balance: string }[]
  /** 按信用币种区分的额度统计 */
  creditLimits: Record<AgentCreditCurrency, AgentCreditLimitStats>
}

/** 展示名：备注 > 昵称 > 金刚号 */
export function getAgentDisplayName(agent: {
  remark?: string
  nickname?: string
  kingkongId?: string
}) {
  const remark = agent.remark?.trim()
  if (remark) return remark
  const nickname = agent.nickname?.trim()
  if (nickname) return nickname
  const kingkongId = agent.kingkongId?.trim()
  if (kingkongId) return kingkongId
  return '代理账号'
}

/** 现金币种（不含信用额度） */
export const AGENT_CASH_CURRENCY_OPTIONS = ['KKC', 'KKV', 'USDT'] as const

export const AGENT_CREDIT_CURRENCY_OPTIONS: readonly AgentCreditCurrency[] = [
  '信用额度-kkc',
  '信用额度-usdt',
]

export const AGENT_CREDIT_CURRENCY_TABS: { key: AgentCreditCurrency; label: string }[] = [
  { key: '信用额度-kkc', label: 'KKC' },
  { key: '信用额度-usdt', label: 'USDT' },
]

export function isAgentCreditCurrency(currency: string): currency is AgentCreditCurrency {
  return currency === '信用额度-kkc' || currency === '信用额度-usdt'
}

export function getAgentDetailCurrencyOptions(isCredited: boolean): readonly AgentWalletCurrency[] {
  return isCredited ? AGENT_WALLET_CURRENCY_OPTIONS : AGENT_CASH_CURRENCY_OPTIONS
}

export function formatCreditLimitRows(stats: AgentCreditLimitStats) {
  const format = (n: number) => n.toLocaleString('zh-CN')
  const net = stats.creditUpTotal - stats.creditDownTotal
  const actualNet = Math.round((net * stats.shareRatio) / 100)
  return [
    { label: '信用余额', value: format(stats.creditBalance), positive: false },
    { label: '上分总额', value: format(stats.creditUpTotal), positive: false },
    { label: '下分总额', value: format(stats.creditDownTotal), positive: false },
    {
      label: '上下分净额',
      value: `${net >= 0 ? '+' : ''}${format(net)}`,
      positive: net >= 0,
    },
    { label: '占成比例', value: `${stats.shareRatio}%`, positive: false },
    {
      label: '实占上下分净额',
      value: `${actualNet >= 0 ? '+' : ''}${format(actualNet)}`,
      positive: actualNet >= 0,
    },
  ]
}

function buildCreditLimits(scale: number, shareRatio: number): Record<AgentCreditCurrency, AgentCreditLimitStats> {
  const s = Math.max(1, scale)
  return {
    '信用额度-kkc': {
      creditBalance: s * 200,
      creditUpTotal: s * 1550,
      creditDownTotal: s * 1030,
      shareRatio,
    },
    '信用额度-usdt': {
      creditBalance: s * 80,
      creditUpTotal: s * 620,
      creditDownTotal: s * 410,
      shareRatio,
    },
  }
}

const MOCK_SELF_DETAIL: AgentDetailProfile = {
  id: 'self',
  nickname: 'OO1231236789',
  avatarEmoji: '🧔🏻‍♂️',
  lastLogin: '刚刚',
  levelBadge: '1级代理/我',
  remark: '我自己',
  kingkongId: 'gg12345678',
  isCredited: true,
  stats: {
    agents: 18,
    directAgents: 16,
    members: 180,
    directMembers: 8,
  },
  wallets: [
    { currency: 'KKC', balance: '1,000' },
    { currency: 'USDT', balance: '1,000' },
    { currency: 'KKV', balance: '1,000' },
  ],
  creditLimits: {
    '信用额度-kkc': {
      creditBalance: 866,
      creditUpTotal: 58000,
      creditDownTotal: 42000,
      shareRatio: 65,
    },
    '信用额度-usdt': {
      creditBalance: 320,
      creditUpTotal: 12800,
      creditDownTotal: 9600,
      shareRatio: 65,
    },
  },
}

function mockDetailFromTeam(item: TeamListItem): AgentDetailProfile {
  const isCreditAgent = item.kind === 'credit_agent'
  const isAgent = item.kind === 'agent' || item.kind === 'me' || isCreditAgent
  const level = item.vipLevel ?? 1
  const shareRatio = Math.min(90, 45 + level * 5)
  return {
    id: item.id,
    nickname: item.nickname,
    avatarEmoji: item.avatarEmoji ?? (isAgent ? '🧔🏻‍♂️' : '👤'),
    lastLogin: '2小时前',
    levelBadge: isAgent ? `${level}级代理` : '直属会员',
    remark: item.id === 'ca1' ? '小红' : undefined,
    kingkongId: `kk_${item.id}`,
    isCredited: isCreditAgent,
    stats: {
      agents: item.subordinateCount,
      directAgents: Math.max(0, item.subordinateCount - 2),
      members: (item.memberCount ?? item.subordinateCount) * 2,
      directMembers: Math.max(0, item.memberCount ?? 0),
    },
    wallets: [
      { currency: 'KKC', balance: '500' },
      { currency: 'USDT', balance: '320' },
      { currency: 'KKV', balance: '180' },
    ],
    creditLimits: buildCreditLimits(item.subordinateCount || 1, shareRatio),
  }
}

export function findAgentDetail(id: string): AgentDetailProfile | null {
  if (!id) return null
  if (id === MOCK_TEAM_SELF.id) return MOCK_SELF_DETAIL

  const found = filterTeamList('all').find((item) => item.id === id)
  if (found) return mockDetailFromTeam(found)

  return null
}
