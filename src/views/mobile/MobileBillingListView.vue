<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5BillingRecordRow from '../../components/mobile/Mh5BillingRecordRow.vue'
import Mh5BillingGroupHead from '../../components/mobile/Mh5BillingGroupHead.vue'
import Mh5DateRangeSheet from '../../components/mobile/Mh5DateRangeSheet.vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import {
  BILLING_CURRENCY_OPTIONS,
  BILLING_TYPE_OPTIONS,
  BILLING_VIP_TYPE_OPTIONS,
  billingCurrencyFromCreditCode,
  filterBillingRecords,
  groupBillingByMonth,
  isVipClubBillingRecord,
  MOCK_BILLING_RECORDS,
} from '../../constants/billingList'
import { MH5_DATE_RANGE_TODAY } from '../../constants/mh5DateRange'
import { isVipClubMineFrom, withMineHallFrom } from '../../constants/mineHall'
import type { CreditCurrencyCode } from '../../constants/walletCatalog'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const isVipClubBilling = computed(() => isVipClubMineFrom(route.query.from))
const { selectedWallet, recordsSelectAll, recordsCurrencyFilter, selectRecordsAll } = useVipCreditAccounts()

const filterType = ref(String(route.query.type || '') === 'xcoin' ? 'xcoin' : '')
const filterCurrency = ref('')
const filterStart = ref('')
const filterEnd = ref('')
const advancedOpen = ref(false)
const draftType = ref('')
const draftCurrency = ref('')
const draftStart = ref('')
const draftEnd = ref('')
/** 贵宾厅已选具体账户时，高级筛选未改币种则保持该账户 */
const draftVipCurrency = ref<CreditCurrencyCode | '' | 'keep'>('')

const VIP_CURRENCY_CHIPS: { value: CreditCurrencyCode | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'cny', label: 'CNY' },
  { value: 'usd', label: 'USD' },
]

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
    start: filterStart.value || undefined,
    end: filterEnd.value || undefined,
  })
  return isVipClubBilling.value ? rows.filter(isVipClubBillingRecord) : rows
})

const groupedRecords = computed(() => groupBillingByMonth(filteredRecords.value))

const typeChips = computed(() => typeOptions.value.filter((item) => item.value))

const advancedDirty = computed(() => {
  if (filterStart.value && filterEnd.value) return true
  if (isVipClubBilling.value) return !recordsSelectAll.value || Boolean(recordsCurrencyFilter.value)
  return Boolean(filterCurrency.value)
})

const selectedCurrencyForSummary = computed(() => {
  if (isVipClubBilling.value) return vipBillingCurrency.value
  return filterCurrency.value
})

function hallQuery(extra: Record<string, string> = {}) {
  return withMineHallFrom(route.query.from, extra)
}

function selectType(value: string) {
  filterType.value = filterType.value === value ? '' : value
}

function openAdvanced() {
  draftType.value = filterType.value
  draftCurrency.value = filterCurrency.value
  draftStart.value = filterStart.value || MH5_DATE_RANGE_TODAY
  draftEnd.value = filterEnd.value || MH5_DATE_RANGE_TODAY
  if (!recordsSelectAll.value) draftVipCurrency.value = 'keep'
  else draftVipCurrency.value = recordsCurrencyFilter.value
  advancedOpen.value = true
}

function closeAdvanced() {
  advancedOpen.value = false
}

function onDraftDate(start: string, end: string) {
  draftStart.value = start
  draftEnd.value = end
}

function resetAdvanced() {
  draftType.value = ''
  draftCurrency.value = ''
  draftStart.value = MH5_DATE_RANGE_TODAY
  draftEnd.value = MH5_DATE_RANGE_TODAY
  draftVipCurrency.value = ''
}

function applyAdvanced() {
  filterType.value = draftType.value
  filterStart.value = draftStart.value
  filterEnd.value = draftEnd.value
  if (isVipClubBilling.value) {
    if (draftVipCurrency.value !== 'keep') selectRecordsAll(draftVipCurrency.value)
  } else {
    filterCurrency.value = draftCurrency.value
  }
  advancedOpen.value = false
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
      <h1 class="mh5-billing-header__title">{{ $t('交易历史') }}</h1>
      <div class="mh5-billing-header__actions">
        <button type="button" class="mh5-billing-header__analysis" @click="goStats">
          <span>{{ $t('收支分析') }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4" />
            <path d="M8 8V2.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <path d="M8 8l4.5 2.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <div class="mh5-billing-filters">
      <div class="mh5-billing-type-chips" role="tablist" :aria-label="$t('账单类型')">
        <button
          v-for="opt in typeChips"
          :key="opt.value"
          type="button"
          class="mh5-billing-type-chip"
          :class="{ 'mh5-billing-type-chip--active': filterType === opt.value }"
          role="tab"
          :aria-selected="filterType === opt.value"
          @click="selectType(opt.value)"
        >
          {{ $t(opt.label) }}
        </button>
      </div>
      <button
        type="button"
        class="mh5-billing-advanced"
        :class="{ 'mh5-billing-advanced--active': advancedDirty }"
        @click="openAdvanced"
      >
        {{ $t('筛选') }}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
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
        <div v-if="advancedOpen" class="mh5-agent-overlay-mask" @click.self="closeAdvanced">
          <div
            class="mh5-xcoin-sheet mh5-bet-order-sheet"
            :class="{ 'mh5-bet-order-sheet--vip': isVipClubBilling }"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-advanced-title"
          >
            <h2 id="billing-advanced-title" class="mh5-xcoin-sheet__title">{{ $t('高级筛选') }}</h2>
            <div class="mh5-bet-order-sheet__body">
              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">{{ $t('时间') }}</h3>
                <Mh5DateRangeSheet
                  inline
                  :tone="isVipClubBilling ? 'vip' : 'default'"
                  :start="draftStart"
                  :end="draftEnd"
                  :today="MH5_DATE_RANGE_TODAY"
                  @change="onDraftDate"
                />
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">{{ $t('币种') }}</h3>
                <div v-if="isVipClubBilling" class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in VIP_CURRENCY_CHIPS"
                    :key="opt.value || 'all'"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': draftVipCurrency === opt.value }"
                    @click="draftVipCurrency = opt.value"
                  >
                    {{ $t(opt.label) }}
                  </button>
                </div>
                <div v-else class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in BILLING_CURRENCY_OPTIONS"
                    :key="opt.value || 'all'"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': draftCurrency === opt.value }"
                    @click="draftCurrency = opt.value"
                  >
                    {{ $t(opt.label) }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">{{ $t('类型') }}</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': !draftType }"
                    @click="draftType = ''"
                  >
                    {{ $t('全部') }}
                  </button>
                  <button
                    v-for="opt in typeChips"
                    :key="opt.value"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': draftType === opt.value }"
                    @click="draftType = opt.value"
                  >
                    {{ $t(opt.label) }}
                  </button>
                </div>
              </section>
            </div>
            <div class="mh5-xcoin-sheet__footer mh5-bet-order-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="resetAdvanced">
                {{ $t('重置') }}
              </button>
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--primary" @click="applyAdvanced">
                {{ $t('确定') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mh5-billing-header__actions :deep(.mh5-spec-annot) {
  margin-right: 4px;
}

.mh5-billing-sheet-enter-active,
.mh5-billing-sheet-leave-active .mh5-wallet-sheet,
.mh5-billing-sheet-enter-active .mh5-xcoin-sheet,
.mh5-billing-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-billing-sheet-enter-from,
.mh5-billing-sheet-leave-to {
  opacity: 0;
}

.mh5-billing-sheet-enter-from .mh5-wallet-sheet,
.mh5-billing-sheet-leave-to .mh5-wallet-sheet,
.mh5-billing-sheet-enter-from .mh5-xcoin-sheet,
.mh5-billing-sheet-leave-to .mh5-xcoin-sheet {
  opacity: 0;
}

.mh5-billing-sheet-enter-from .mh5-wallet-sheet,
.mh5-billing-sheet-leave-to .mh5-wallet-sheet,
.mh5-billing-sheet-enter-from .mh5-xcoin-sheet,
.mh5-billing-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
