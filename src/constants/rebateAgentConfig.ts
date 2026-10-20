/** 推广返利 · 返佣代理配置 · Mock（单层：仅一级返佣代理；底部配置彩票退水） */

import {
  applyCategoryRebate,
  cloneShareAgentRebateCategories,
  type PcShareAgentRebateCategory,
} from './pcShareAgent'

export type RebateAgentLevel = 1

export type RebateAgentRow = {
  id: string
  username: string
  userId: string
  kingKongId: string
  agentLevel: RebateAgentLevel
  superiorAgent: string
  superiorAgentId: string
  backendAccount: string
  backendPassword: string
  disabled: boolean
  /** 彩票退水，规则与占成代理退水一致 */
  lotteryRebate: PcShareAgentRebateCategory
}

/** 彩票退水：复用占成代理「彩票」大类（滑块 0～100，产品上限 SABA彩票 / 一分快三） */
export function createRebateAgentLotteryRebate(percent = 0): PcShareAgentRebateCategory {
  const category = cloneShareAgentRebateCategories().find((item) => item.key === 'lottery')
  const lottery: PcShareAgentRebateCategory = category ?? {
    key: 'lottery',
    name: '彩票',
    rebate: 0,
    products: [],
  }
  const nextPercent = Math.min(100, Math.max(0, Math.round(percent)))
  lottery.rebate = nextPercent
  applyCategoryRebate(lottery)
  return lottery
}

export function cloneRebateAgentLotteryRebate(
  category: PcShareAgentRebateCategory,
): PcShareAgentRebateCategory {
  return {
    ...category,
    products: category.products.map((product) => ({ ...product })),
  }
}

/** 可被搜索并新增为返佣代理的用户候选 */
export type RebateAgentCandidate = {
  username: string
  userId: string
  kingKongId: string
}

export const REBATE_AGENT_LEVEL_OPTIONS = [
  { value: 1 as RebateAgentLevel, label: '1级代理' },
] as const

export function rebateAgentLevelLabel(level: RebateAgentLevel) {
  return level === 1 ? '1级代理' : '1级代理'
}

export const MOCK_REBATE_AGENT_ROWS: RebateAgentRow[] = [
  {
    id: 'ra-1',
    username: '哈哈',
    userId: '5352005406534464230',
    kingKongId: 'mid_fs72ge86brp',
    agentLevel: 1,
    superiorAgent: '-',
    superiorAgentId: '0',
    backendAccount: 'wlqjblfm',
    backendPassword: 'eskvsl7oi',
    disabled: false,
    lotteryRebate: createRebateAgentLotteryRebate(50),
  },
  {
    id: 'ra-2',
    username: 'stgkk6000',
    userId: '600012340001',
    kingKongId: 'mid_stgkk6000aa',
    agentLevel: 1,
    superiorAgent: '-',
    superiorAgentId: '0',
    backendAccount: 'stgkk6000',
    backendPassword: 'stgkk6000',
    disabled: false,
    lotteryRebate: createRebateAgentLotteryRebate(0),
  },
  {
    id: 'ra-3',
    username: 'mid_l7ds8y',
    userId: '596170000001',
    kingKongId: 'mid_l7ds8y9k2m',
    agentLevel: 1,
    superiorAgent: '-',
    superiorAgentId: '0',
    backendAccount: 'l7ds8yad',
    backendPassword: 'l7ds8ypw',
    disabled: false,
    lotteryRebate: createRebateAgentLotteryRebate(20),
  },
  {
    id: 'ra-4',
    username: 'trap s02',
    userId: '59617',
    kingKongId: 'mid_trap_s02xx',
    agentLevel: 1,
    superiorAgent: '-',
    superiorAgentId: '0',
    backendAccount: 'traps02ac',
    backendPassword: 'traps02pw',
    disabled: false,
    lotteryRebate: createRebateAgentLotteryRebate(0),
  },
]

/** 新增弹框可搜索的用户候选（未全部成为返佣代理） */
export const MOCK_REBATE_AGENT_CANDIDATES: RebateAgentCandidate[] = [
  {
    username: '新用户小白',
    userId: '990011223344',
    kingKongId: 'mid_newbie001',
  },
  {
    username: '棋手阿杰',
    userId: '880019990001',
    kingKongId: 'mid_qishou88',
  },
  {
    username: 'stgkk7001',
    userId: '700100000001',
    kingKongId: 'mid_stgkk7001',
  },
  {
    username: '哈哈',
    userId: '5352005406534464230',
    kingKongId: 'mid_fs72ge86brp',
  },
]

export function searchRebateAgentCandidates(userId: string) {
  const kw = userId.trim()
  if (!kw) return []
  return MOCK_REBATE_AGENT_CANDIDATES.filter((c) => c.userId.includes(kw))
}

export function genRebateAgentBackendAccount(userId: string) {
  const tail = userId.slice(-6) || '000000'
  return `rb${tail}`
}

export function genRebateAgentBackendPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 9; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}
