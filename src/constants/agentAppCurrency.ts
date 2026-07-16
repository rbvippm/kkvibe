import { ref, watch } from 'vue'
import {
  isAgentCreditCurrency,
  type AgentCreditCurrency,
  type AgentWalletCurrency,
} from './agentDetail'
import type { AgentOverviewCurrency } from './agentOverview'

/** 代理端全局币种（首页 / 详情 / 报表等共用） */
export const agentAppCurrency = ref<AgentWalletCurrency>('KKC')

/** 最近一次选择的信用额度币种（顶栏为现金时，信用 Tab 仍用此口径） */
export const agentAppCreditCurrency = ref<AgentCreditCurrency>('信用额度-CNY')

watch(
  agentAppCurrency,
  (value) => {
    if (isAgentCreditCurrency(value)) {
      agentAppCreditCurrency.value = value
    }
  },
  { immediate: true },
)

export function setAgentAppCurrency(currency: AgentWalletCurrency) {
  agentAppCurrency.value = currency
}

export function setAgentAppCreditCurrency(currency: AgentCreditCurrency) {
  agentAppCreditCurrency.value = currency
  agentAppCurrency.value = currency
}

export function walletCurrencyToOverview(currency: AgentWalletCurrency): AgentOverviewCurrency {
  if (currency === 'USDT') return 'USDT-TRON'
  return currency as AgentOverviewCurrency
}

export function overviewCurrencyToWallet(currency: AgentOverviewCurrency): AgentWalletCurrency {
  if (currency === 'USDT-TRON') return 'USDT'
  return currency as AgentWalletCurrency
}

export { isAgentCreditCurrency }
