/** 代理授信 · 产品收益比例 Mock */

export type AgentCreditProduct = {
  key: string
  name: string
  share: number
  rebate: number
  maxShare: number
  maxRebate: number
}

export const AGENT_CREDIT_STEPS = [
  { key: 'ratio', label: '收益比例' },
  { key: 'success', label: '授信成功' },
] as const

export const DEFAULT_AGENT_CREDIT_PRODUCTS: AgentCreditProduct[] = [
  { key: 'qutou', name: '趣投', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'marble', name: '弹珠', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'scratch', name: '刮刮乐', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'lottery', name: '彩票', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'live', name: '真人', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'sports', name: '体育', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'chess', name: '棋牌', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'fishing', name: '捕鱼', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'esports', name: '电竞', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'slots', name: '老虎机', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
  { key: 'cockfight', name: '斗鸡', share: 0.1, rebate: 0.1, maxShare: 0.1, maxRebate: 0.1 },
]

export function formatCreditPercent(value: number) {
  return `${value}%`
}

export type AgentCreditSuccessInfo = {
  adminUrl: string
  adminAccount: string
  adminPassword: string
}

export const MOCK_AGENT_CREDIT_SUCCESS: AgentCreditSuccessInfo = {
  adminUrl: 'https://xxxxxxxxxxxxxxxx.com/zh',
  adminAccount: 'ajslkdjkl12',
  adminPassword: 'asdhkadh',
}

export function buildAgentCreditCopyText(info: AgentCreditSuccessInfo, agentName: string) {
  return [
    `代理：${agentName}`,
    `后台地址：${info.adminUrl}`,
    `账号：${info.adminAccount}`,
    `密码：${info.adminPassword}`,
  ].join('\n')
}
