import { ref, watch } from 'vue'
import {
  isAgentCreditCurrency,
  type AgentCreditCurrency,
  type AgentWalletCurrency,
} from './agentDetail'
import type { AgentOverviewCurrency } from './agentOverview'
import {
  defaultCashCurrency,
  pickAgentCurrency,
  userAgentCurrency,
} from '../i18n'
import { appLocale } from '../i18n/locale'

function initialAgentCurrency(): AgentWalletCurrency {
  const saved = userAgentCurrency.value
  if (saved) return saved as AgentWalletCurrency
  return defaultCashCurrency()
}

/** 代理端全局币种（首页 / 详情 / 报表等共用） */
export const agentAppCurrency = ref<AgentWalletCurrency>(initialAgentCurrency())

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

watch(appLocale, () => {
  if (!userAgentCurrency.value) {
    agentAppCurrency.value = defaultCashCurrency()
  }
})

export function setAgentAppCurrency(currency: AgentWalletCurrency) {
  agentAppCurrency.value = currency
}

/** 用户在币种选择层点选，切语言时保留 */
export function setAgentAppCurrencyByUser(currency: AgentWalletCurrency) {
  agentAppCurrency.value = currency
  pickAgentCurrency(currency)
}

export function fallbackAgentCashCurrency() {
  const saved = userAgentCurrency.value
  if (saved && !isAgentCreditCurrency(saved)) {
    agentAppCurrency.value = saved as AgentWalletCurrency
    return
  }
  agentAppCurrency.value = defaultCashCurrency()
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
