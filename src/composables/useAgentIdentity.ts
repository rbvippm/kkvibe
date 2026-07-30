import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  AGENT_IDENTITY_LABEL,
  getStoredAgentIdentity,
  parseAgentIdentity,
  type AgentIdentityType,
} from '../constants/agentIdentity'

/** 读取当前代理身份（优先路由 query.agentType，否则 session） */
export function useAgentIdentity() {
  const route = useRoute()

  const agentType = computed<AgentIdentityType>(() => {
    const fromQuery = route.query.agentType
    if (fromQuery === 'share' || fromQuery === 'rebate') return fromQuery
    return getStoredAgentIdentity()
  })

  const isRebateAgent = computed(() => agentType.value === 'rebate')
  const isShareAgent = computed(() => agentType.value === 'share')
  const agentTypeLabel = computed(() => AGENT_IDENTITY_LABEL[agentType.value])

  function withAgentQuery(
    query: Record<string, string | number | undefined | null> = {},
  ): Record<string, string> {
    const next: Record<string, string> = { agentType: agentType.value }
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      next[key] = String(value)
    }
    return next
  }

  return {
    agentType,
    isRebateAgent,
    isShareAgent,
    agentTypeLabel,
    withAgentQuery,
    parseAgentIdentity,
  }
}
