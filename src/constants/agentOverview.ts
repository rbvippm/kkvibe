/** 代理中心 · 概况页 Mock（对齐 Figma 1433:25041） */

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

export const AGENT_OVERVIEW_CURRENCIES = ['KKC', 'KKV', 'USDT'] as const

/** Figma 行分组：3 + 3 + 3 + 1 */
export const DIRECT_STAT_ROW_SIZES = [3, 3, 3, 1] as const

/** Figma 行分组：3 + 3 + 3 + 3 + 2 */
export const SUB_AGENT_STAT_ROW_SIZES = [3, 3, 3, 3, 2] as const

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

/** 我的直属 · 10 项 */
export const MOCK_DIRECT_STATS: AgentOverviewStat[] = [
  { key: 'new', label: '新增会员', value: '126' },
  { key: 'active', label: '活跃人数', value: '126' },
  { key: 'recharge', label: '充值总额', value: '126' },
  { key: 'withdraw', label: '取款总额', value: '0.00' },
  { key: 'validBet', label: '有效投注', value: '0.00' },
  { key: 'rebate', label: '投注退水', value: '0.00' },
  { key: 'promo', label: '优惠活动', value: '0.00' },
  { key: 'fee', label: '充值手续费', value: '0.00' },
  { key: 'winLose', label: '游戏输赢', value: '0.00' },
  { key: 'netLose', label: '净输赢', value: '0.00' },
]

/** 下级代理 · 14 项 */
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
  { key: 'turnover', label: '投注流水', value: '0.00' },
  { key: 'fee', label: '充提手续费', value: '0.00' },
  { key: 'winLose', label: '游戏输赢', value: '0.00' },
  { key: 'netLose', label: '净输赢', value: '0.00' },
]

export const PROFIT_RANK_TABS: { key: ProfitRankTab; label: string }[] = [
  { key: 'member_win', label: '会员盈利TOP10' },
  { key: 'member_lose', label: '会员亏损TOP10' },
  { key: 'agent_win', label: '代理盈利TOP10' },
]

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
