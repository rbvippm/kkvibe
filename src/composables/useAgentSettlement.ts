import { computed } from 'vue'
import {
  MOCK_AGENT_SUMMARIES,
  calcSettlementNet,
  type AgentSummaryWithNet,
} from '../constants/agentSettlement'

function withNet(agent: (typeof MOCK_AGENT_SUMMARIES)[number]): AgentSummaryWithNet {
  return {
    ...agent,
    netAmount: calcSettlementNet(agent.totalUp, agent.totalDown),
  }
}

export function useAgentSettlement() {
  const agents = computed<AgentSummaryWithNet[]>(() => MOCK_AGENT_SUMMARIES.map(withNet))

  const totalNetAmount = computed(() => agents.value.reduce((sum, a) => sum + a.netAmount, 0))

  function findAgent(agentId: string) {
    return agents.value.find((a) => a.agentId === agentId)
  }

  return {
    agents,
    totalNetAmount,
    findAgent,
  }
}
