<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5BillingRecordRow from '../../components/mobile/Mh5BillingRecordRow.vue'
import Mh5BillingGroupHead from '../../components/mobile/Mh5BillingGroupHead.vue'
import {
  BILLING_HOT_KEYWORDS,
  BILLING_SEARCH_PLACEHOLDER,
  BILLING_VIP_HOT_KEYWORDS,
  billingCurrencyFromCreditCode,
  clearRecentBillingSearches,
  filterBillingRecords,
  groupBillingByMonth,
  isVipClubBillingRecord,
  MOCK_BILLING_RECORDS,
  readRecentBillingSearches,
  saveRecentBillingSearch,
} from '../../constants/billingList'
import { isVipClubMineFrom, withMineHallFrom } from '../../constants/mineHall'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const isVipClubBilling = computed(() => isVipClubMineFrom(route.query.from))
const { selectedWallet, recordsSelectAll, recordsCurrencyFilter } = useVipCreditAccounts()

const keyword = ref(String(route.query.q || ''))
const recentSearches = ref<string[]>(readRecentBillingSearches())
const inputRef = ref<HTMLInputElement | null>(null)
const hotKeywords = computed(() =>
  isVipClubBilling.value ? BILLING_VIP_HOT_KEYWORDS : BILLING_HOT_KEYWORDS,
)

const trimmedKeyword = computed(() => keyword.value.trim())
const hasKeyword = computed(() => trimmedKeyword.value.length > 0)

const searchResults = computed(() => {
  if (!hasKeyword.value) return []
  let rows = filterBillingRecords(MOCK_BILLING_RECORDS, { keyword: trimmedKeyword.value })
  if (isVipClubBilling.value) {
    rows = rows.filter((row) => isVipClubBillingRecord(row))
    if (!recordsSelectAll.value) {
      const currency = billingCurrencyFromCreditCode(selectedWallet.value?.currency ?? 'cny')
      rows = rows.filter((row) => row.currency === currency)
    } else if (recordsCurrencyFilter.value) {
      const currency = billingCurrencyFromCreditCode(recordsCurrencyFilter.value)
      rows = rows.filter((row) => row.currency === currency)
    }
  }
  return rows
})

const groupedResults = computed(() => groupBillingByMonth(searchResults.value))

watch(
  () => route.query.q,
  (value) => {
    keyword.value = String(value || '')
  },
)

onMounted(async () => {
  await nextTick()
  inputRef.value?.focus()
})

function hallQuery(extra: Record<string, string> = {}) {
  return withMineHallFrom(route.query.from, extra)
}

function clearKeyword() {
  keyword.value = ''
  router.replace({ name: 'mobile-billing-search', query: hallQuery() })
  inputRef.value?.focus()
}

function applyKeyword(value: string) {
  const next = value.trim()
  keyword.value = next
  if (next) {
    saveRecentBillingSearch(next)
    recentSearches.value = readRecentBillingSearches()
  }
  router.replace({
    name: 'mobile-billing-search',
    query: hallQuery(next ? { q: next } : {}),
  })
}

function clearHistory() {
  clearRecentBillingSearches()
  recentSearches.value = []
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="mh5-billing-page mh5-billing-search-page" :class="{ 'mh5-vip-records': isVipClubBilling }">
    <header class="mh5-billing-search-bar-header">
      <button type="button" class="mh5-billing-search-bar-header__back" :aria-label="$t('返回')" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div class="mh5-billing-search-input">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
          <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <input
          ref="inputRef"
          v-model="keyword"
          type="search"
          enterkeyhint="search"
          class="mh5-billing-search-input__field"
          :placeholder="BILLING_SEARCH_PLACEHOLDER"
          @keyup.enter="applyKeyword(keyword)"
        />
        <button
          v-if="hasKeyword"
          type="button"
          class="mh5-billing-search-input__clear"
          :aria-label="$t('清除')"
          @click="clearKeyword"
        >
          ×
        </button>
      </div>

      <button type="button" class="mh5-billing-search-bar-header__action" @click="applyKeyword(keyword)">{{ $t('搜索') }}</button>
    </header>

    <main class="mh5-billing-main">
      <template v-if="!hasKeyword">
        <section v-if="recentSearches.length" class="mh5-billing-search-panel">
          <div class="mh5-billing-search-panel__head">
            <h2 class="mh5-billing-search-panel__title">{{ $t('最近搜索') }}</h2>
            <button type="button" class="mh5-billing-search-panel__clear" @click="clearHistory">{{ $t('清空') }}</button>
          </div>
          <div class="mh5-billing-search-chips">
            <button
              v-for="item in recentSearches"
              :key="`recent-${item}`"
              type="button"
              class="mh5-billing-search-chip"
              @click="applyKeyword(item)"
            >
              {{ item }}
            </button>
          </div>
        </section>

        <section class="mh5-billing-search-panel">
          <h2 class="mh5-billing-search-panel__title">{{ $t('常用搜索') }}</h2>
          <div class="mh5-billing-search-chips">
            <button
              v-for="item in hotKeywords"
              :key="`hot-${item}`"
              type="button"
              class="mh5-billing-search-chip mh5-billing-search-chip--hot"
              @click="applyKeyword(item)"
            >
              {{ item }}
            </button>
          </div>
        </section>
      </template>

      <template v-else>
        <p v-if="!searchResults.length" class="mh5-billing-empty">
          未找到与「{{ trimmedKeyword }}」相关的账单
        </p>

        <p v-else class="mh5-billing-search-result-tip">
          共 {{ searchResults.length }} 条结果
        </p>

        <section v-for="[month, rows] in groupedResults" :key="month" class="mh5-billing-group">
          <Mh5BillingGroupHead :month="month" :rows="rows" />
          <Mh5BillingRecordRow
            v-for="row in rows"
            :key="row.id"
            :row="row"
            :highlight="trimmedKeyword"
          />
        </section>
      </template>
    </main>
  </div>
</template>
