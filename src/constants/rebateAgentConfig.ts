/** 推广返利 · 返佣代理配置 · Mock */

export type RebateAgentLevel = 1 | 2 | 3

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
  /** 赚取退水配置文案 */
  earnRebate: string
  disabled: boolean
}

/** 可被搜索并新增为返佣代理的用户候选 */
export type RebateAgentCandidate = {
  username: string
  userId: string
  kingKongId: string
}

export const REBATE_AGENT_LEVEL_OPTIONS = [
  { value: 1 as RebateAgentLevel, label: '1级代理' },
  { value: 2 as RebateAgentLevel, label: '2级代理' },
  { value: 3 as RebateAgentLevel, label: '3级代理' },
] as const

export const REBATE_EARN_OPTIONS = [
  { value: '其他', label: '其他' },
  { value: '赚取所有退水', label: '赚取所有退水' },
  { value: '水全退到底', label: '水全退到底' },
  { value: '赚取0.1%退水', label: '赚取0.1%退水' },
  { value: '赚取0.2%退水', label: '赚取0.2%退水' },
  { value: '赚取0.3%退水', label: '赚取0.3%退水' },
  { value: '赚取0.4%退水', label: '赚取0.4%退水' },
  { value: '赚取0.5%退水', label: '赚取0.5%退水' },
] as const

export function rebateAgentLevelLabel(level: RebateAgentLevel) {
  if (level === 1) return '1级代理'
  if (level === 2) return '2级代理'
  return '3级代理'
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
    earnRebate: '赚取所有退水',
    disabled: false,
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
    earnRebate: '赚取0.3%退水',
    disabled: false,
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
    earnRebate: '水全退到底',
    disabled: false,
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
    earnRebate: '赚取0.2%退水',
    disabled: false,
  },
  {
    id: 'ra-5',
    username: '小雨代理',
    userId: '880088001001',
    kingKongId: 'mid_xiaoyu88aa',
    agentLevel: 2,
    superiorAgent: 'trap s02',
    superiorAgentId: '59617',
    backendAccount: 'xiaoyu88',
    backendPassword: 'xy88pass',
    earnRebate: '赚取0.1%退水',
    disabled: false,
  },
  {
    id: 'ra-6',
    username: '阿凯返佣',
    userId: '880010010088',
    kingKongId: 'mid_akai_rb001',
    agentLevel: 2,
    superiorAgent: '哈哈',
    superiorAgentId: '5352005406534464230',
    backendAccount: 'akai_rb01',
    backendPassword: 'akai_rbpw',
    earnRebate: '赚取0.4%退水',
    disabled: true,
  },
  {
    id: 'ra-7',
    username: '小北三级',
    userId: '880020020099',
    kingKongId: 'mid_xiaobei3',
    agentLevel: 3,
    superiorAgent: '小雨代理',
    superiorAgentId: '880088001001',
    backendAccount: 'xiaobei3',
    backendPassword: 'xb3pass01',
    earnRebate: '赚取0.1%退水',
    disabled: false,
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
