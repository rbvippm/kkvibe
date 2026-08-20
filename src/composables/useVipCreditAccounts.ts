import { computed, ref } from 'vue'
import {
  DEFAULT_CREDIT_ACCOUNT_ID,
  cloneCreditWallets,
  groupCreditWalletsByAgent,
  type CreditCurrencyCode,
  type CreditWalletItem,
} from '../constants/walletCatalog'
import { effectiveVipClubCurrency, pickVipClubCurrency } from '../i18n'

const wallets = ref(cloneCreditWallets())

function resolveInitialAccountId() {
  const preferred = effectiveVipClubCurrency.value
  const def = wallets.value.find((item) => item.id === DEFAULT_CREDIT_ACCOUNT_ID)
  if (def?.currency === preferred) return def.id
  const sameAgent = wallets.value.find(
    (item) => item.agentId === def?.agentId && item.currency === preferred,
  )
  if (sameAgent) return sameAgent.id
  return wallets.value.find((item) => item.currency === preferred)?.id ?? DEFAULT_CREDIT_ACCOUNT_ID
}

const selectedId = ref(resolveInitialAccountId())
/** 账单 / 投注记录专用：选「全部钱包」或「信用额度-CNY / USD」时不改「我的」当前钱包 */
const recordsSelectAll = ref(true)
const recordsCurrencyFilter = ref<CreditCurrencyCode | ''>('')

const selectedWallet = computed(
  () => wallets.value.find((item) => item.id === selectedId.value) ?? wallets.value[0],
)

function selectAccount(item: CreditWalletItem) {
  selectedId.value = item.id
  recordsSelectAll.value = false
  recordsCurrencyFilter.value = ''
  pickVipClubCurrency(item.currency)
}

function selectRecordsAll(currency: CreditCurrencyCode | '' = '') {
  recordsSelectAll.value = true
  recordsCurrencyFilter.value = currency
}

function updateDisplayName(name: string) {
  const target = wallets.value.find((item) => item.id === selectedId.value)
  if (target) target.displayName = name
}

/** 按代理分组重排信用账户，组内账户相对顺序不变 */
function reorderAgentGroups(fromAgentId: string, toAgentId: string) {
  if (fromAgentId === toAgentId) return
  const groups = groupCreditWalletsByAgent(wallets.value)
  const from = groups.findIndex((group) => group.agentId === fromAgentId)
  const to = groups.findIndex((group) => group.agentId === toAgentId)
  if (from < 0 || to < 0) return
  const next = [...groups]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  wallets.value = next.flatMap((group) => group.items)
}

/** 尊享专区顶栏与贵宾厅「我的」共用同一套信用账户 */
export function useVipCreditAccounts() {
  return {
    wallets,
    selectedId,
    selectedWallet,
    recordsSelectAll,
    recordsCurrencyFilter,
    selectAccount,
    selectRecordsAll,
    updateDisplayName,
    reorderAgentGroups,
  }
}
