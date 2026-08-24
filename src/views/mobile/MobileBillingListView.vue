<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5BillingRecordRow from '../../components/mobile/Mh5BillingRecordRow.vue'
import Mh5BillingGroupHead from '../../components/mobile/Mh5BillingGroupHead.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5VipCreditAccountSheet from '../../components/mobile/Mh5VipCreditAccountSheet.vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import {
  BILLING_CURRENCY_OPTIONS,
  BILLING_CURRENCY_TABS,
  BILLING_TYPE_OPTIONS,
  BILLING_VIP_TYPE_OPTIONS,
  billingCurrencyFromCreditCode,
  filterBillingCurrencyOptions,
  filterBillingRecords,
  groupBillingByMonth,
  isVipClubBillingRecord,
  MOCK_BILLING_RECORDS,
  type BillingCurrencyKind,
} from '../../constants/billingList'
import { BILLING_LIST_SPEC } from '../../constants/billingListSpec'
import { isVipClubMineFrom, withMineHallFrom } from '../../constants/mineHall'
import { creditAllWalletsLabel } from '../../constants/walletCatalog'
import '../../styles/mobile-app-shell.css'

type FilterKind = 'type' | 'currency' | null

const route = useRoute()
const router = useRouter()
const isVipClubBilling = computed(() => isVipClubMineFrom(route.query.from))
const { selectedWallet, recordsSelectAll, recordsCurrencyFilter } = useVipCreditAccounts()
const creditSheetOpen = ref(false)

const filterType = ref(String(route.query.type || '') === 'xcoin' ? 'xcoin' : '')
const filterCurrency = ref('')
const filterOpen = ref<FilterKind>(null)
const currencyTab = ref<'all' | BillingCurrencyKind>('all')

const typeOptions = computed(() =>
  isVipClubBilling.value ? BILLING_VIP_TYPE_OPTIONS : BILLING_TYPE_OPTIONS,
)

const vipCurrency = computed(() =>
  billingCurrencyFromCreditCode(selectedWallet.value?.currency ?? 'cny'),
)

const vipBillingCurrency = computed(() => {
  if (!recordsSelectAll.value) return vipCurrency.value
  if (recordsCurrencyFilter.value) return billingCurrencyFromCreditCode(recordsCurrencyFilter.value)
  return ''
})

const filteredRecords = computed(() => {
  const rows = filterBillingRecords(MOCK_BILLING_RECORDS, {
    type: filterType.value || undefined,
    currency: isVipClubBilling.value
      ? vipBillingCurrency.value || undefined
      : filterCurrency.value || undefined,
  })
  return isVipClubBilling.value ? rows.filter(isVipClubBillingRecord) : rows
})

const groupedRecords = computed(() => groupBillingByMonth(filteredRecords.value))

const typeLabel = computed(() => {
  if (!filterType.value) return '全部类型'
  return typeOptions.value.find((o) => o.value === filterType.value)?.label ?? '全部类型'
})

const currencyLabel = computed(() => {
  if (isVipClubBilling.value) {
    if (recordsSelectAll.value) return creditAllWalletsLabel(recordsCurrencyFilter.value)
    return selectedWallet.value?.displayName || '信用额度'
  }
  if (!filterCurrency.value) return '全部币种'
  return BILLING_CURRENCY_OPTIONS.find((o) => o.value === filterCurrency.value)?.label ?? '全部币种'
})

const currencySheetOptions = computed(() =>
  filterBillingCurrencyOptions(BILLING_CURRENCY_OPTIONS, currencyTab.value),
)

const selectedCurrencyForSummary = computed(() => {
  if (isVipClubBilling.value) return vipBillingCurrency.value
  return filterCurrency.value
})

function hallQuery(extra: Record<string, string> = {}) {
  return withMineHallFrom(route.query.from, extra)
}

function openFilter(kind: FilterKind) {
  if (kind === 'currency' && isVipClubBilling.value) {
    creditSheetOpen.value = true
    return
  }
  if (kind === 'currency') currencyTab.value = 'all'
  filterOpen.value = kind
}

function closeFilter() {
  filterOpen.value = null
}

function selectType(value: string) {
  filterType.value = value
  closeFilter()
}

function selectCurrency(value: string) {
  filterCurrency.value = value
  closeFilter()
}

function goSearch() {
  router.push({ name: 'mobile-billing-search', query: hallQuery() })
}

function goStats() {
  router.push({ name: 'mobile-billing-stats', query: hallQuery() })
}
</script>

<template>
  <div class="mh5-billing-page" :class="{ 'mh5-vip-records': isVipClubBilling }">
    <header class="mh5-billing-header">
      <button type="button" class="mh5-billing-header__back" :aria-label="$t('返回')" @click="router.back()">
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
      <h1 class="mh5-billing-header__title">{{ $t('账单记录') }}</h1>
      <div class="mh5-billing-header__actions">
        <Mh5SpecAnnot :spec="BILLING_LIST_SPEC" placement="bottom" />
        <button
          v-if="!isVipClubBilling"
          type="button"
          class="mh5-billing-header__icon"
          :aria-label="$t('搜索账单')"
          @click="goSearch"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
            <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
        <button
          type="button"
          class="mh5-billing-header__icon mh5-billing-header__icon--accent"
          :aria-label="$t('账单统计')"
          @click="goStats"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="11.5" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M14 14L14 7.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="M14 14l5.5 3.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="M14 2.5 A11.5 11.5 0 0 1 24.2 18"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
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
      <p v-if="!groupedRecords.length" class="mh5-billing-empty">{{ $t('暂无账单记录') }}</p>

      <section v-for="[month, rows] in groupedRecords" :key="month" class="mh5-billing-group">
        <Mh5BillingGroupHead :month="month" :rows="rows" :selected-currency="selectedCurrencyForSummary" />
        <Mh5BillingRecordRow v-for="row in rows" :key="row.id" :row="row" />
      </section>
    </main>

    <Teleport to="body">
      <Transition name="mh5-billing-sheet">
        <div v-if="filterOpen === 'type'" class="mh5-agent-overlay-mask" @click.self="closeFilter">
          <div
            class="mh5-wallet-sheet agent-currency-sheet mh5-billing-pick-sheet"
            :class="{ 'mh5-wallet-sheet--vip-gold': isVipClubBilling }"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-type-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="billing-type-title" class="mh5-wallet-sheet__title">{{ $t('选择类型') }}</h2>
              <button type="button" class="mh5-wallet-sheet__close" :aria-label="$t('关闭')" @click="closeFilter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div class="mh5-wallet-sheet__list agent-currency-sheet__list">
              <button
                v-for="opt in typeOptions"
                :key="opt.value || 'all'"
                type="button"
                class="agent-currency-sheet__item"
                :class="{ 'agent-currency-sheet__item--active': filterType === opt.value }"
                @click="selectType(opt.value)"
              >
                <span class="agent-currency-sheet__name">{{ $t(opt.label) }}</span>
                <span
                  v-if="filterType === opt.value"
                  class="agent-currency-sheet__check agent-currency-sheet__check--active"
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2l2.4 2.4 4.6-5"
                      stroke="#fff"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="mh5-billing-sheet">
        <div v-if="filterOpen === 'currency'" class="mh5-agent-overlay-mask" @click.self="closeFilter">
          <div
            class="mh5-wallet-sheet agent-currency-sheet mh5-billing-pick-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-currency-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="billing-currency-title" class="mh5-wallet-sheet__title">{{ $t('选择币种') }}</h2>
              <button type="button" class="mh5-wallet-sheet__close" :aria-label="$t('关闭')" @click="closeFilter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <div class="mh5-wallet-sheet__filters" role="tablist" :aria-label="$t('币种分类')">
              <button
                v-for="tab in BILLING_CURRENCY_TABS"
                :key="tab.key"
                type="button"
                class="mh5-wallet-sheet__filter"
                :class="{ 'mh5-wallet-sheet__filter--active': currencyTab === tab.key }"
                role="tab"
                :aria-selected="currencyTab === tab.key"
                @click="currencyTab = tab.key"
              >
                {{ $t(tab.label) }}
              </button>
            </div>

            <div class="mh5-wallet-sheet__list agent-currency-sheet__list">
              <button
                v-for="opt in currencySheetOptions"
                :key="opt.value || 'all'"
                type="button"
                class="agent-currency-sheet__item"
                :class="{
                  'agent-currency-sheet__item--active': filterCurrency === opt.value,
                  'agent-currency-sheet__item--credit': Boolean(opt.tip),
                }"
                @click="selectCurrency(opt.value)"
              >
                <span
                  class="agent-currency-sheet__icon"
                  :style="{ background: opt.color }"
                  aria-hidden="true"
                >
                  {{ opt.symbol }}
                </span>
                <span class="agent-currency-sheet__meta">
                  <span class="agent-currency-sheet__name">{{ $t(opt.label) }}</span>
                  <span v-if="opt.tip" class="mh5-lobby-currency-tip-inline">{{ opt.tip }}</span>
                </span>
                <span
                  v-if="filterCurrency === opt.value"
                  class="agent-currency-sheet__check agent-currency-sheet__check--active"
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2l2.4 2.4 4.6-5"
                      stroke="#fff"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Mh5VipCreditAccountSheet
      :open="creditSheetOpen"
      hide-balance
      @close="creditSheetOpen = false"
    />
  </div>
</template>

<style scoped>
.mh5-billing-header__actions :deep(.mh5-spec-annot) {
  margin-right: 4px;
}

.mh5-billing-sheet-enter-active,
.mh5-billing-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-billing-sheet-enter-active .mh5-wallet-sheet,
.mh5-billing-sheet-leave-active .mh5-wallet-sheet {
  transition: transform 0.25s ease;
}

.mh5-billing-sheet-enter-from,
.mh5-billing-sheet-leave-to {
  opacity: 0;
}

.mh5-billing-sheet-enter-from .mh5-wallet-sheet,
.mh5-billing-sheet-leave-to .mh5-wallet-sheet {
  transform: translateY(100%);
}
</style>
