/** 代理中心 · 概况页 Mock（对齐 Figma 1433:25041） */

import { sortByLocaleCashOrder } from '../i18n'

export type AgentOverviewStat = {
  key: string
  label: string
  value: string
}

export type ProfitRankTab = 'member_win' | 'member_lose' | 'agent_win'

export type ProfitRankRow = {
  rank: number
  accountId: string
  nickname: string
  profit: string
}

export const AGENT_OVERVIEW_CURRENCIES = [
  'KKC',
  'KKV',
  'USDT-TRON',
  '信用额度-CNY',
  '信用额度-USD',
] as const

export type AgentOverviewCurrency = (typeof AGENT_OVERVIEW_CURRENCIES)[number]

export type AgentOverviewCurrencyOption = {
  value: AgentOverviewCurrency
  label: string
  /** 左侧图标文案 */
  symbol?: string
  color?: string
}

export const AGENT_OVERVIEW_CURRENCY_OPTIONS: AgentOverviewCurrencyOption[] = [
  { value: 'KKC', label: 'KKC', symbol: 'Z', color: '#22c55e' },
  { value: 'KKV', label: 'KKV', symbol: 'Z', color: '#ec4899' },
  { value: 'USDT-TRON', label: 'USDT-TRON', symbol: '₮', color: '#26a17b' },
  { value: '信用额度-CNY', label: '信用额度-CNY', symbol: '¥', color: '#ff7a2b' },
  { value: '信用额度-USD', label: '信用额度-USD', symbol: '$', color: '#0ea5e9' },
]

/** 返佣代理无信用额度，币种列表仅现金三项 */
export function getAgentOverviewCurrencyOptions(
  identity: 'share' | 'rebate' = 'share',
): AgentOverviewCurrencyOption[] {
  const list =
    identity === 'rebate'
      ? AGENT_OVERVIEW_CURRENCY_OPTIONS.filter((opt) => !opt.value.startsWith('信用额度'))
      : [...AGENT_OVERVIEW_CURRENCY_OPTIONS]
  return sortByLocaleCashOrder(list, (opt) => opt.value)
}

export const AGENT_OVERVIEW_CURRENCY_BALANCES: Record<AgentOverviewCurrency, string> = {
  KKC: '236,188,666.00',
  KKV: '12,880.50',
  'USDT-TRON': '8,652.30',
  '信用额度-CNY': '518.22',
  '信用额度-USD': '86.50',
}

/** 三列从左到右、从上到下顺序铺满，不留空格 */
export const DIRECT_STAT_ROW_SIZES = [3, 3, 3, 3, 2] as const

/** 行分组：3 + 3 + 3 + 3 + 3 + 3（VIP晋级礼金右侧为 VIP额外奖金） */
export const SUB_AGENT_STAT_ROW_SIZES = [3, 3, 3, 3, 3, 3] as const

export function chunkOverviewStats(
  stats: AgentOverviewStat[],
  rowSizes: readonly number[],
): AgentOverviewStat[][] {
  const rows: AgentOverviewStat[][] = []
  let cursor = 0
  for (const size of rowSizes) {
    rows.push(stats.slice(cursor, cursor + size))
    cursor += size
  }
  return rows
}

/** 按列数从左到右、从上到下顺序分行（返佣「我的直属」用） */
export function chunkOverviewStatsByColumns(
  stats: AgentOverviewStat[],
  columns = 3,
): AgentOverviewStat[][] {
  if (columns <= 0) return [stats]
  const rows: AgentOverviewStat[][] = []
  for (let i = 0; i < stats.length; i += columns) {
    rows.push(stats.slice(i, i + columns))
  }
  return rows
}

/** 我的直属 · 12 项（占成含投注退水；概况不展示游戏净输赢 / 净输赢） */
export const MOCK_DIRECT_STATS: AgentOverviewStat[] = [
  { key: 'new', label: '新增会员', value: '126' },
  { key: 'active', label: '活跃人数', value: '126' },
  { key: 'recharge', label: '充值总额', value: '126' },
  { key: 'withdraw', label: '取款总额', value: '0.00' },
  { key: 'validBet', label: '有效投注', value: '0.00' },
  { key: 'rebate', label: '投注退水', value: '0.00' },
  { key: 'promo', label: '优惠活动', value: '0.00' },
  { key: 'vipRebate', label: 'VIP退水', value: '0.00' },
  { key: 'vipUpgradeBonus', label: 'VIP晋级礼金', value: '0.00' },
  { key: 'vipExtraBonus', label: 'VIP额外奖金', value: '0.00' },
  { key: 'fee', label: '充提手续费', value: '0.00' },
  { key: 'winLose', label: '游戏输赢', value: '0.00' },
]

/** 返佣代理无「投注退水」指标 */
export function getDirectStats(identity: 'share' | 'rebate' = 'share'): AgentOverviewStat[] {
  if (identity === 'rebate') {
    return MOCK_DIRECT_STATS.filter((item) => item.key !== 'rebate')
  }
  return MOCK_DIRECT_STATS
}

/** 占成 / 返佣均按三列顺序铺满，避免中间空一格 */
export function getDirectStatRows(identity: 'share' | 'rebate' = 'share') {
  return chunkOverviewStatsByColumns(getDirectStats(identity), 3)
}

/** 下级代理 · 16 项（占成；概况不展示游戏净输赢 / 净输赢） */
export const MOCK_SUB_AGENT_STATS: AgentOverviewStat[] = [
  { key: 'newMember', label: '新增会员', value: '126' },
  { key: 'newAgent', label: '新增代理', value: '126' },
  { key: 'active', label: '活跃人数', value: '126' },
  { key: 'teamAgent', label: '团队代理', value: '0.00' },
  { key: 'teamMember', label: '团队会员', value: '0.00' },
  { key: 'bet', label: '投注（10人）', value: '0.00' },
  { key: 'firstDeposit', label: '首存（10人）', value: '0.00' },
  { key: 'recharge', label: '充值（10人）', value: '0.00' },
  { key: 'withdraw', label: '提款（10人）', value: '0.00' },
  { key: 'promo', label: '优惠活动', value: '0.00' },
  { key: 'betRebate', label: '投注退水', value: '0.00' },
  { key: 'vipRebate', label: 'VIP退水', value: '0.00' },
  { key: 'vipUpgradeBonus', label: 'VIP晋级礼金', value: '0.00' },
  { key: 'vipExtraBonus', label: 'VIP额外奖金', value: '0.00' },
  { key: 'fee', label: '充提手续费', value: '0.00' },
  { key: 'winLose', label: '游戏输赢', value: '0.00' },
]

export const PROFIT_RANK_TABS: { key: ProfitRankTab; label: string }[] = [
  { key: 'member_win', label: '会员盈利TOP10' },
  { key: 'member_lose', label: '会员亏损TOP10' },
  { key: 'agent_win', label: '代理盈利TOP10' },
]

/** 返佣仅会员盈利/亏损 TOP；占成另含代理盈利 TOP */
export function getProfitRankTabs(identity: 'share' | 'rebate' = 'share') {
  if (identity === 'rebate') {
    return PROFIT_RANK_TABS.filter((tab) => tab.key !== 'agent_win')
  }
  return PROFIT_RANK_TABS
}

const FIGMA_MEMBER_WIN_ROWS: Omit<ProfitRankRow, 'rank'>[] = [
  { accountId: 'asda****', nickname: 'KingKong001', profit: '123,456,789' },
  { accountId: 'asda****', nickname: '棋牌大王', profit: '123,456,789' },
  { accountId: 'asda****', nickname: '天下非我莫属...', profit: '123,456,789' },
  { accountId: 'asda****', nickname: 'KingKong0012...', profit: '123,456,789' },
  { accountId: 'asda****', nickname: '棋牌大王01', profit: '123,456,789' },
  { accountId: 'asda****', nickname: 'KingKong005', profit: '123,456,789' },
  { accountId: 'asda****', nickname: '棋牌大王01', profit: '123,456,789' },
  { accountId: 'asda****', nickname: 'KingKong008', profit: '123,456,789' },
  { accountId: 'asda****', nickname: '龙虎斗高手', profit: '123,456,789' },
  { accountId: 'asda****', nickname: '幸运星88', profit: '123,456,789' },
]

function withRank(rows: Omit<ProfitRankRow, 'rank'>[]): ProfitRankRow[] {
  return rows.map((row, index) => ({ rank: index + 1, ...row }))
}

function buildLoseRows(): ProfitRankRow[] {
  return withRank(
    FIGMA_MEMBER_WIN_ROWS.map((row) => ({
      ...row,
      profit: `-${row.profit.replace(/,/g, '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    })),
  )
}

export const MOCK_PROFIT_RANKINGS: Record<ProfitRankTab, ProfitRankRow[]> = {
  member_win: withRank(FIGMA_MEMBER_WIN_ROWS),
  member_lose: buildLoseRows(),
  agent_win: withRank(
    FIGMA_MEMBER_WIN_ROWS.map((row, index) => ({
      accountId: `agent${index + 1}***`,
      nickname: `代理${row.nickname}`,
      profit: row.profit,
    })),
  ),
}
