<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5BillingRecordRow from '../../components/mobile/Mh5BillingRecordRow.vue'
import Mh5BillingGroupHead from '../../components/mobile/Mh5BillingGroupHead.vue'
import {
  BILLING_CURRENCY_OPTIONS,
  BILLING_SEARCH_PLACEHOLDER,
  BILLING_TYPE_OPTIONS,
  filterBillingRecords,
  groupBillingByMonth,
  MOCK_BILLING_RECORDS,
} from '../../constants/billingList'
import '../../styles/mobile-app-shell.css'

type FilterKind = 'type' | 'currency' | null

const router = useRouter()

const filterType = ref('')
const filterCurrency = ref('')
const filterOpen = ref<FilterKind>(null)

const filteredRecords = computed(() =>
  filterBillingRecords(MOCK_BILLING_RECORDS, {
    type: filterType.value || undefined,
    currency: filterCurrency.value || undefined,
  }),
)

const groupedRecords = computed(() => groupBillingByMonth(filteredRecords.value))

const typeLabel = computed(
  () => BILLING_TYPE_OPTIONS.find((o) => o.value === filterType.value)?.label ?? '全部类型',
)
const currencyLabel = computed(
  () => BILLING_CURRENCY_OPTIONS.find((o) => o.value === filterCurrency.value)?.label ?? '全部币种',
)

const activeFilterOptions = computed(() => {
  if (filterOpen.value === 'type') return BILLING_TYPE_OPTIONS
  if (filterOpen.value === 'currency') return BILLING_CURRENCY_OPTIONS
  return []
})

function openFilter(kind: FilterKind) {
  filterOpen.value = kind
}

function closeFilter() {
  filterOpen.value = null
}

function selectFilter(value: string) {
  if (filterOpen.value === 'type') filterType.value = value
  if (filterOpen.value === 'currency') filterCurrency.value = value
  closeFilter()
}

function goSearch() {
  router.push({ name: 'mobile-billing-search' })
}
</script>

<template>
  <div class="mh5-billing-page">
    <header class="mh5-billing-search-header">
      <button type="button" class="mh5-billing-search-header__back" aria-label="返回" @click="router.back()">
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

      <button type="button" class="mh5-billing-search-trigger" @click="goSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
          <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span class="mh5-billing-search-trigger__text">{{ BILLING_SEARCH_PLACEHOLDER }}</span>
      </button>

      <button type="button" class="mh5-billing-search-header__stats" aria-label="账单统计">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="11.5" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M14 8.5v7.5l4.5 2.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14 2.5 A11.5 11.5 0 0 1 25.5 14"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"
          />
          <text x="14" y="16.5" text-anchor="middle" fill="currentColor" font-size="9" font-weight="700">$</text>
        </svg>
      </button>
    </header>

    <div class="mh5-billing-filters">
      <button type="button" class="mh5-billing-filter" @click="openFilter('type')">
        {{ typeLabel }}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
          <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="mh5-billing-filter" @click="openFilter('currency')">
        {{ currencyLabel }}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
          <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <main class="mh5-billing-main">
      <p v-if="!groupedRecords.length" class="mh5-billing-empty">暂无账单记录</p>

      <section v-for="[month, rows] in groupedRecords" :key="month" class="mh5-billing-group">
        <Mh5BillingGroupHead :month="month" :rows="rows" :selected-currency="filterCurrency" />
        <Mh5BillingRecordRow v-for="row in rows" :key="row.id" :row="row" />
      </section>
    </main>

    <Transition name="mh5-billing-sheet">
      <div v-if="filterOpen" class="mh5-billing-sheet-mask" @click.self="closeFilter">
        <div class="mh5-billing-sheet">
          <h2 class="mh5-billing-sheet__title">
            {{ filterOpen === 'type' ? '选择类型' : '选择币种' }}
          </h2>
          <button
            v-for="opt in activeFilterOptions"
            :key="opt.value || 'all'"
            type="button"
            class="mh5-billing-sheet__option"
            :class="{
              'mh5-billing-sheet__option--active':
                (filterOpen === 'type' && filterType === opt.value) ||
                (filterOpen === 'currency' && filterCurrency === opt.value),
            }"
            @click="selectFilter(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mh5-billing-sheet-enter-active,
.mh5-billing-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-billing-sheet-enter-active .mh5-billing-sheet,
.mh5-billing-sheet-leave-active .mh5-billing-sheet {
  transition: transform 0.25s ease;
}

.mh5-billing-sheet-enter-from,
.mh5-billing-sheet-leave-to {
  opacity: 0;
}

.mh5-billing-sheet-enter-from .mh5-billing-sheet,
.mh5-billing-sheet-leave-to .mh5-billing-sheet {
  transform: translateY(100%);
}
</style>
