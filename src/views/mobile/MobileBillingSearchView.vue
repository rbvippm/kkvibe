<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5BillingRecordRow from '../../components/mobile/Mh5BillingRecordRow.vue'
import Mh5BillingGroupHead from '../../components/mobile/Mh5BillingGroupHead.vue'
import {
  BILLING_HOT_KEYWORDS,
  BILLING_SEARCH_PLACEHOLDER,
  clearRecentBillingSearches,
  filterBillingRecords,
  groupBillingByMonth,
  MOCK_BILLING_RECORDS,
  readRecentBillingSearches,
  saveRecentBillingSearch,
} from '../../constants/billingList'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const keyword = ref(String(route.query.q || ''))
const recentSearches = ref<string[]>(readRecentBillingSearches())
const inputRef = ref<HTMLInputElement | null>(null)

const trimmedKeyword = computed(() => keyword.value.trim())
const hasKeyword = computed(() => trimmedKeyword.value.length > 0)

const searchResults = computed(() => {
  if (!hasKeyword.value) return []
  return filterBillingRecords(MOCK_BILLING_RECORDS, { keyword: trimmedKeyword.value })
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

function clearKeyword() {
  keyword.value = ''
  router.replace({ name: 'mobile-billing-search' })
  inputRef.value?.focus()
}

function applyKeyword(value: string) {
  const next = value.trim()
  keyword.value = next
  if (next) {
    saveRecentBillingSearch(next)
    recentSearches.value = readRecentBillingSearches()
  }
  router.replace({ name: 'mobile-billing-search', query: next ? { q: next } : {} })
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
  <div class="mh5-billing-page mh5-billing-search-page">
    <header class="mh5-billing-search-bar-header">
      <button type="button" class="mh5-billing-search-bar-header__back" aria-label="返回" @click="goBack">
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
          aria-label="清除"
          @click="clearKeyword"
        >
          ×
        </button>
      </div>

      <button type="button" class="mh5-billing-search-bar-header__action" @click="applyKeyword(keyword)">
        搜索
      </button>
    </header>

    <main class="mh5-billing-main">
      <template v-if="!hasKeyword">
        <section v-if="recentSearches.length" class="mh5-billing-search-panel">
          <div class="mh5-billing-search-panel__head">
            <h2 class="mh5-billing-search-panel__title">最近搜索</h2>
            <button type="button" class="mh5-billing-search-panel__clear" @click="clearHistory">清空</button>
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
          <h2 class="mh5-billing-search-panel__title">常用搜索</h2>
          <div class="mh5-billing-search-chips">
            <button
              v-for="item in BILLING_HOT_KEYWORDS"
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
