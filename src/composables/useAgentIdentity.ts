import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { syncAgentAppCurrencyToLedger } from '../constants/agentAppCurrency'
import {
  AGENT_IDENTITY_LABEL,
  getStoredAgentIdentity,
  getStoredAgentLedger,
  parseAgentIdentity,
  parseAgentLedger,
  type AgentCurrencyScope,
  type AgentIdentityType,
  type AgentLedgerType,
} from '../constants/agentIdentity'

/** 读取当前代理身份（优先路由 query.agentType / query.ledger，否则 session） */
export function useAgentIdentity() {
  const route = useRoute()

  const agentType = computed<AgentIdentityType>(() => {
    const fromQuery = route.query.agentType
    if (fromQuery === 'share' || fromQuery === 'rebate') return fromQuery
    return getStoredAgentIdentity()
  })

  const isRebateAgent = computed(() => agentType.value === 'rebate')
  const isShareAgent = computed(() => agentType.value === 'share')

  /** 返佣固定现金；占成按入口区分现金代理中心 / 信用代理中心 */
  const agentLedger = computed<AgentLedgerType>(() => {
    if (isRebateAgent.value) return 'cash'
    return parseAgentLedger(route.query.ledger) ?? getStoredAgentLedger()
  })

  watch(agentLedger, syncAgentAppCurrencyToLedger, { immediate: true })

  const isCreditLedger = computed(() => agentLedger.value === 'credit')
  const currencyScope = computed<AgentCurrencyScope>(() => agentLedger.value)

  const agentTypeLabel = computed(() =>
    isCreditLedger.value ? '信用代理' : AGENT_IDENTITY_LABEL[agentType.value],
  )

  function withAgentQuery(
    query: Record<string, string | number | undefined | null> = {},
  ): Record<string, string> {
    const next: Record<string, string> = { agentType: agentType.value }
    if (isShareAgent.value) next.ledger = agentLedger.value
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
    agentLedger,
    isCreditLedger,
    currencyScope,
    agentTypeLabel,
    withAgentQuery,
    parseAgentIdentity,
  }
}
