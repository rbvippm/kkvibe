import { ref } from 'vue'

export type AgentReportPageTab = 'finance' | 'game'

export function parseAgentReportPageTab(raw: unknown): AgentReportPageTab | null {
  return raw === 'game' || raw === 'finance' ? raw : null
}

/** 我的报表页内 Tab：底栏切走再回来沿用；概况盈亏/佣金入口会强制写入 finance */
export const agentReportPageTab = ref<AgentReportPageTab>('finance')

export function setAgentReportPageTab(tab: AgentReportPageTab) {
  agentReportPageTab.value = tab
}

export function resolveAgentReportPageTab(queryTab: unknown): AgentReportPageTab {
  const fromQuery = parseAgentReportPageTab(queryTab)
  if (fromQuery) {
    agentReportPageTab.value = fromQuery
    return fromQuery
  }
  return agentReportPageTab.value
}
