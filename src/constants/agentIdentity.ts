/** 代理端身份：占成 / 返佣（由首页入口注入，影响后续定制） */

export type AgentIdentityType = 'share' | 'rebate'

const STORAGE_KEY = 'kkvibe.agentIdentity'

export const AGENT_IDENTITY_LABEL: Record<AgentIdentityType, string> = {
  share: '占成代理',
  rebate: '返佣代理',
}

export function parseAgentIdentity(raw: unknown): AgentIdentityType {
  if (raw === 'rebate') return 'rebate'
  return 'share'
}

export function getStoredAgentIdentity(): AgentIdentityType {
  try {
    return parseAgentIdentity(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return 'share'
  }
}

export function setStoredAgentIdentity(type: AgentIdentityType) {
  try {
    sessionStorage.setItem(STORAGE_KEY, type)
  } catch {
    /* ignore */
  }
}

/** 返佣代理 · 概况「返佣比例」Mock（直属佣金 / 下级额外佣金） */
export const AGENT_MY_REBATE_RATIO_ROWS = [
  { key: 'platform', name: '直属佣金', shareText: '10%' },
  { key: 'extra_l1', name: '下一级额外佣金', shareText: '5%' },
  { key: 'extra_l2', name: '下二级额外佣金', shareText: '2.5%' },
] as const

export type AgentRebateRatioRow = (typeof AGENT_MY_REBATE_RATIO_ROWS)[number]

/**
 * 按代理层级过滤返佣比例行：
 * 一级 3 行；二级去掉下二级；三级仅直属佣金
 */
export function agentMyRebateRatioRowsByLevel(agentLevel: 1 | 2 | 3 = 1): AgentRebateRatioRow[] {
  if (agentLevel >= 3) {
    return AGENT_MY_REBATE_RATIO_ROWS.filter((row) => row.key === 'platform')
  }
  if (agentLevel === 2) {
    return AGENT_MY_REBATE_RATIO_ROWS.filter((row) => row.key !== 'extra_l2')
  }
  return [...AGENT_MY_REBATE_RATIO_ROWS]
}
