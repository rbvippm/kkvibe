import { ref, watch, type Ref } from 'vue'
import { findOtherMemberByAccountQuery, type XCoinSelectableTarget } from '../constants/xCoinTransfer'

export function useOtherMemberQuery(selectedId: Ref<string>) {
  const accountQuery = ref('')
  const queryLoading = ref(false)
  const queryError = ref('')
  const queryResult = ref<XCoinSelectableTarget | null>(null)

  async function lookupAccount() {
    const q = accountQuery.value.trim()
    queryError.value = ''
    queryResult.value = null

    if (!q) {
      queryError.value = '请输入会员账号或账号ID'
      return
    }

    queryLoading.value = true
    await new Promise((r) => setTimeout(r, 320))
    queryLoading.value = false

    const found = findOtherMemberByAccountQuery(q)
    if (!found) {
      queryError.value = '未找到该会员，请核对账号后重试'
      return
    }

    queryResult.value = found
  }

  watch(accountQuery, () => {
    queryError.value = ''
    queryResult.value = null
    selectedId.value = ''
  })

  return {
    accountQuery,
    queryLoading,
    queryError,
    queryResult,
    lookupAccount,
  }
}
