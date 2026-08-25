import { sortByLocaleCashOrder } from '../i18n'
import { filterTeamList, MOCK_TEAM_SELF, type TeamListItem } from './agentTeam'

export type AgentDetailTab = 'wallet' | 'credit' | 'profit' | 'game' | 'login'

export const AGENT_DETAIL_TABS: { key: AgentDetailTab; label: string }[] = [
  { key: 'wallet', label: '代理钱包' },
  { key: 'profit', label: '代理盈亏' },
  { key: 'game', label: '游戏数据' },
  { key: 'login', label: '登录日志' },
]

/** 已授信时默认展示「信用额度」总 Tab */
export const AGENT_DETAIL_CREDIT_TAB: { key: AgentDetailTab; label: string } = {
  key: 'credit',
  label: '信用额度',
}

export function getAgentDetailTabs(
  isCredited: boolean,
  isRebate = false,
): { key: AgentDetailTab; label: string }[] {
  /** 返佣代理不展示「代理盈亏 / 代理佣金」Tab */
  const baseTabs = isRebate
    ? AGENT_DETAIL_TABS.filter((tab) => tab.key !== 'profit')
    : AGENT_DETAIL_TABS
  if (!isCredited) return baseTabs
  return [baseTabs[0], AGENT_DETAIL_CREDIT_TAB, ...baseTabs.slice(1)]
}

export const AGENT_DETAIL_CURRENCIES = ['KKC', 'USDT', 'KKV'] as const

export const AGENT_WALLET_CURRENCY_OPTIONS = [
  'KKC',
  'KKV',
  'USDT',
  '信用额度-CNY',
  '信用额度-USD',
] as const

export type AgentWalletCurrency = (typeof AGENT_WALLET_CURRENCY_OPTIONS)[number]

export type AgentCreditCurrency = '信用额度-CNY' | '信用额度-USD'

export type AgentCreditLimitStats = {
  creditBalance: number
  creditUpTotal: number
  creditDownTotal: number
  /** 占成比例 0-100 */
  shareRatio: number
  /** 总授信额度 */
  creditQuotaTotal: number
}

export type AgentCreditSettleRow = {
  label: string
  value: string
  positive?: boolean
}

export type AgentCreditLimitView = {
  availableValue: string
  quotaValue: string
  usedPercent: number
  usedPercentText: string
  receivableValue: string
  receivablePositive: boolean
  settleFlowRows: AgentCreditSettleRow[]
  settleResultRows: AgentCreditSettleRow[]
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
  wallets: AgentCashWalletRow[]
  /** 按信用币种区分的额度统计 */
  creditLimits: Record<AgentCreditCurrency, AgentCreditLimitStats>
}

export type AgentCashWalletRow = {
  currency: string
  balance: string
  /** 充值金额 */
  deposit: string
  /** 提款金额 */
  withdraw: string
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

/** 现金钱包分类展示顺序 */
export const AGENT_CASH_CURRENCY_TABS: { key: (typeof AGENT_CASH_CURRENCY_OPTIONS)[number]; label: string }[] = [
  { key: 'KKC', label: 'KKC' },
  { key: 'USDT', label: 'USDT' },
  { key: 'KKV', label: 'KKV' },
]

export const AGENT_CREDIT_CURRENCY_OPTIONS: readonly AgentCreditCurrency[] = [
  '信用额度-CNY',
  '信用额度-USD',
]

export const AGENT_CREDIT_CURRENCY_TABS: { key: AgentCreditCurrency; label: string }[] = [
  { key: '信用额度-CNY', label: 'CNY' },
  { key: '信用额度-USD', label: 'USD' },
]

/** 额度管理内展示用：只回 CNY / USD，不含「信用额度」前缀 */
export function formatCreditCurrencyUnit(code: string) {
  return AGENT_CREDIT_CURRENCY_TABS.find((tab) => tab.key === code)?.label
    ?? (code.includes('USD') ? 'USD' : 'CNY')
}

export function isAgentCreditCurrency(currency: string): currency is AgentCreditCurrency {
  return currency === '信用额度-CNY' || currency === '信用额度-USD'
}

export function getAgentCashCurrencyOptions(): AgentWalletCurrency[] {
  return sortByLocaleCashOrder([...AGENT_CASH_CURRENCY_OPTIONS], (item) => item)
}

export function getAgentDetailCurrencyOptions(isCredited: boolean): readonly AgentWalletCurrency[] {
  return isCredited
    ? sortByLocaleCashOrder([...AGENT_WALLET_CURRENCY_OPTIONS], (item) => item)
    : getAgentCashCurrencyOptions()
}

function formatCreditAmount(n: number) {
  return n.toLocaleString('zh-CN')
}

function formatSignedCreditAmount(n: number, digits = 0) {
  const abs = Math.abs(n).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  if (n > 0) return `+${abs}`
  if (n < 0) return `-${abs}`
  return digits ? '0.00' : '0'
}

function creditNet(stats: AgentCreditLimitStats) {
  return stats.creditUpTotal - stats.creditDownTotal
}

function creditActualNet(stats: AgentCreditLimitStats) {
  return Math.round((creditNet(stats) * stats.shareRatio) / 100)
}

/** 非「今天 / 本周」区间用略低的上下分规模，额度卡仍展示当前可用 / 总额 */
export function scaleCreditSettleStats(
  stats: AgentCreditLimitStats,
  scale = 1,
): AgentCreditLimitStats {
  if (scale === 1) return stats
  return {
    ...stats,
    creditUpTotal: Math.round(stats.creditUpTotal * scale),
    creditDownTotal: Math.round(stats.creditDownTotal * Math.min(1, scale + 0.04)),
  }
}

export function formatCreditReceivable(amount: number, currency: AgentCreditCurrency) {
  const symbol = currency === '信用额度-USD' ? '$' : '¥'
  const formatted = Math.abs(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`
}

export function formatCreditLimitView(
  stats: AgentCreditLimitStats,
  currency: AgentCreditCurrency,
  rangeScale = 1,
  actualProfit?: number,
): AgentCreditLimitView {
  const settle = scaleCreditSettleStats(stats, rangeScale)
  const quota = Math.max(0, stats.creditQuotaTotal)
  const usedPercent = quota > 0 ? Math.round((stats.creditBalance / quota) * 100) : 0
  const net = creditNet(settle)
  const scaledProfit =
    actualProfit == null ? null : Number((actualProfit * rangeScale).toFixed(2))
  return {
    availableValue: formatCreditAmount(stats.creditBalance),
    quotaValue: formatCreditAmount(quota),
    usedPercent,
    usedPercentText: `~${usedPercent}%`,
    receivableValue: formatCreditReceivable(net, currency),
    receivablePositive: net >= 0,
    settleFlowRows: [
      {
        label: '上分总额:',
        value: formatSignedCreditAmount(settle.creditUpTotal),
        positive: true,
      },
      {
        label: '下分总额:',
        value: formatSignedCreditAmount(-settle.creditDownTotal),
        positive: false,
      },
    ],
    settleResultRows: [
      {
        label: '上下分净额:',
        value: formatSignedCreditAmount(net),
        positive: net >= 0,
      },
      ...(scaledProfit == null
        ? []
        : [
            {
              label: '实占净输赢:',
              value: formatSignedCreditAmount(scaledProfit, 2),
            },
          ]),
    ],
  }
}

export function formatCreditLimitRows(stats: AgentCreditLimitStats) {
  const net = creditNet(stats)
  const actualNet = creditActualNet(stats)
  return [
    { label: '信用余额', value: formatCreditAmount(stats.creditBalance), positive: false },
    { label: '上分总额', value: formatCreditAmount(stats.creditUpTotal), positive: false },
    { label: '下分总额', value: formatCreditAmount(stats.creditDownTotal), positive: false },
    {
      label: '上下分净额',
      value: `${net >= 0 ? '+' : ''}${formatCreditAmount(net)}`,
      positive: net >= 0,
    },
    { label: '占成比例', value: `${stats.shareRatio}%`, positive: false },
    {
      label: '实占上下分净额',
      value: `${actualNet >= 0 ? '+' : ''}${formatCreditAmount(actualNet)}`,
      positive: actualNet >= 0,
    },
  ]
}

/** 现金钱包：单币种的余额 / 充值金额 / 提款金额 */
export function formatCashWalletRows(wallet?: AgentCashWalletRow | null) {
  if (!wallet) {
    return [
      { label: '余额', value: '0' },
      { label: '充值金额', value: '0' },
      { label: '提款金额', value: '0' },
    ]
  }
  return [
    { label: '余额', value: wallet.balance },
    { label: '充值金额', value: wallet.deposit },
    { label: '提款金额', value: wallet.withdraw },
  ]
}

/** 现金钱包：分类卡片顺序跟随语言 */
export function formatCashWalletGroups(wallets?: AgentCashWalletRow[] | null) {
  const list = wallets ?? []
  return sortByLocaleCashOrder([...AGENT_CASH_CURRENCY_TABS], (tab) => tab.key).map((tab) => {
    const wallet = list.find((item) => item.currency === tab.key) ?? null
    return {
      currency: tab.key,
      title: tab.label,
      rows: formatCashWalletRows(wallet),
    }
  })
}

function buildCreditLimits(scale: number, shareRatio: number): Record<AgentCreditCurrency, AgentCreditLimitStats> {
  const s = Math.max(1, scale)
  return {
    '信用额度-CNY': {
      creditBalance: s * 200,
      creditUpTotal: s * 1550,
      creditDownTotal: s * 1030,
      shareRatio,
      creditQuotaTotal: Math.round((5000 * s) / 3),
    },
    '信用额度-USD': {
      creditBalance: s * 80,
      creditUpTotal: s * 620,
      creditDownTotal: s * 410,
      shareRatio,
      creditQuotaTotal: Math.round((2000 * s) / 3),
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
    { currency: 'KKC', balance: '1,000', deposit: '12,800', withdraw: '6,400' },
    { currency: 'USDT', balance: '1,000', deposit: '3,200', withdraw: '1,150' },
    { currency: 'KKV', balance: '1,000', deposit: '8,600', withdraw: '4,200' },
  ],
  creditLimits: {
    '信用额度-CNY': {
      creditBalance: 866,
      creditUpTotal: 58000,
      creditDownTotal: 42000,
      shareRatio: 65,
      creditQuotaTotal: 7200,
    },
    '信用额度-USD': {
      creditBalance: 320,
      creditUpTotal: 12800,
      creditDownTotal: 9600,
      shareRatio: 65,
      creditQuotaTotal: 2700,
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
      {
        currency: 'KKC',
        balance: '500',
        deposit: (800 + (item.subordinateCount || 1) * 120).toLocaleString('zh-CN'),
        withdraw: (300 + (item.subordinateCount || 1) * 60).toLocaleString('zh-CN'),
      },
      {
        currency: 'USDT',
        balance: '320',
        deposit: (200 + (item.subordinateCount || 1) * 40).toLocaleString('zh-CN'),
        withdraw: (80 + (item.subordinateCount || 1) * 20).toLocaleString('zh-CN'),
      },
      {
        currency: 'KKV',
        balance: '180',
        deposit: (400 + (item.subordinateCount || 1) * 80).toLocaleString('zh-CN'),
        withdraw: (150 + (item.subordinateCount || 1) * 30).toLocaleString('zh-CN'),
      },
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
