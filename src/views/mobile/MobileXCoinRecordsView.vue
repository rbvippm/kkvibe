<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  MOCK_TRANSFER_RECORDS,
  TRANSFER_INITIATOR_FILTER_OPTIONS,
  TRANSFER_RECORD_PAGE_SIZE,
  TRANSFER_RECORD_TYPE_OPTIONS,
  TRANSFER_ROLE_FILTER_OPTIONS,
  TRANSFER_TIME_PRESETS,
  XCOIN_CREDIT_CURRENCY_TABS,
  filterTransferRecords,
  formatTransferAmount,
  parseXCoinCreditCurrency,
  recordFlowDisplay,
  recordTypeBadgeLabel,
  summarizeTransferRecordsByCurrency,
  transferAmountClass,
  transferRecordOrderNo,
  transferRelatedOrderNo,
  transferRecordTitle,
  transferTypeStatusClass,
  validateTransferRecordDateRange,
  type TransferRecordFilter,
  type TransferTimePreset,
  type XCoinTransferRecord,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { XCOIN_CREDIT_CURRENCY_SPEC } from '../../constants/xCoinCreditSpec'
import '../../styles/mobile-app-shell.css'

function createDefaultFilter(currency?: string): TransferRecordFilter {
  return {
    keyword: '',
    timePreset: 'today',
    customStart: '',
    customEnd: '',
    recordType: '',
    initiator: '',
    role: '',
    currency: currency ? parseXCoinCreditCurrency(currency) : '',
  }
}

const route = useRoute()
const searchInput = ref('')
const appliedFilter = ref<TransferRecordFilter>(createDefaultFilter(String(route.query.currency || '')))
const filterDraft = ref<TransferRecordFilter>({ ...appliedFilter.value })
const filterOpen = ref(false)
const filterError = ref('')
const page = ref(1)
const loadingMore = ref(false)
const detailRow = ref<XCoinTransferRecord | null>(null)

const summaryCarouselRef = ref<HTMLElement | null>(null)
const summarySlideIndex = ref(0)

const filteredRecords = computed(() =>
  filterTransferRecords(MOCK_TRANSFER_RECORDS, appliedFilter.value).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  ),
)

const summaryRecords = computed(() =>
  filterTransferRecords(MOCK_TRANSFER_RECORDS, appliedFilter.value, { ignoreCurrency: true }).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  ),
)

const currencySummaries = computed(() => summarizeTransferRecordsByCurrency(summaryRecords.value))

const visibleRecords = computed(() =>
  filteredRecords.value.slice(0, page.value * TRANSFER_RECORD_PAGE_SIZE),
)

const hasMore = computed(() => visibleRecords.value.length < filteredRecords.value.length)

const detailFlow = computed(() => (detailRow.value ? recordFlowDisplay(detailRow.value) : null))
const detailRelatedOrderNo = computed(() =>
  detailRow.value ? transferRelatedOrderNo(detailRow.value) : null,
)

function onSummaryCarouselScroll() {
  const el = summaryCarouselRef.value
  if (!el || !el.clientWidth) return
  summarySlideIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}

function resetSummaryCarousel() {
  summarySlideIndex.value = 0
  nextTick(() => {
    summaryCarouselRef.value?.scrollTo({ left: 0 })
  })
}

watch(summaryRecords, () => resetSummaryCarousel(), { deep: true })

watch(
  appliedFilter,
  () => {
    page.value = 1
  },
  { deep: true },
)

onUnmounted(() => {
  filterOpen.value = false
  detailRow.value = null
})

function runSearch() {
  appliedFilter.value = { ...appliedFilter.value, keyword: searchInput.value.trim() }
}

function selectTimePreset(preset: Exclude<TransferTimePreset, 'custom'>) {
  appliedFilter.value = {
    ...appliedFilter.value,
    timePreset: preset,
    customStart: '',
    customEnd: '',
  }
}

function openFilter() {
  filterDraft.value = { ...appliedFilter.value }
  filterError.value = ''
  filterOpen.value = true
}

function resetFilter() {
  filterDraft.value = createDefaultFilter(String(route.query.currency || ''))
  filterError.value = ''
}

function applyFilter() {
  const next = { ...filterDraft.value, keyword: searchInput.value.trim() }
  if (next.customStart && next.customEnd) {
    next.timePreset = 'custom'
  }
  const error = validateTransferRecordDateRange(next)
  if (error) {
    filterError.value = error
    return
  }
  appliedFilter.value = next
  filterOpen.value = false
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  window.setTimeout(() => {
    page.value += 1
    loadingMore.value = false
  }, 280)
}

function openDetail(row: XCoinTransferRecord) {
  detailRow.value = row
}

function formatSummaryNet(value: number) {
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

function summaryNetClass(value: number) {
  return {
    'mh5-xcoin-transfer__amount--up': value > 0,
    'mh5-xcoin-transfer__amount--down': value < 0,
  }
}
</script>

<template>
  <div class="mh5-xcoin-page mh5-xcoin-records-page">
    <Mh5SubPageHeader :title="$t('信用额度记录')">
      <template #right>
        <div class="mh5-xcoin-header-actions">
          <Mh5SpecAnnot :spec="XCOIN_CREDIT_CURRENCY_SPEC" placement="bottom" />
          <button type="button" class="mh5-sub-header__action" @click="openFilter">{{ $t('筛选') }}</button>
        </div>
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-bet-order-toolbar">
      <form class="mh5-bet-order-search" @submit.prevent="runSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
          <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <input
          v-model="searchInput"
          type="search"
          class="mh5-bet-order-search__input"
          placeholder="对象关键词 / 单号"
          enterkeyhint="search"
        />
        <button type="submit" class="mh5-bet-order-search__btn">搜索</button>
      </form>

      <div class="mh5-bet-order-tabs" role="tablist" aria-label="时间快捷切换">
        <button
          v-for="tab in TRANSFER_TIME_PRESETS"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-bet-order-tabs__item"
          :class="{ 'mh5-bet-order-tabs__item--active': appliedFilter.timePreset === tab.key }"
          @click="selectTimePreset(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <main class="mh5-bet-order-main">
      <div class="mh5-bet-order-summary-carousel mh5-bet-order-summary-carousel--scroll">
        <div
          ref="summaryCarouselRef"
          class="mh5-bet-order-summary-carousel__track"
          @scroll.passive="onSummaryCarouselScroll"
        >
          <div
            v-for="slide in currencySummaries"
            :key="slide.currency"
            class="mh5-bet-order-summary mh5-bet-order-summary--slide"
          >
            <span class="mh5-bet-order-summary__currency">{{ slide.label }}</span>
            <div class="mh5-bet-order-summary__metrics">
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">总笔数</span>
                <strong>{{ slide.count }}</strong>
              </div>
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">上分合计</span>
                <strong>{{ slide.upTotal.toFixed(2) }}</strong>
              </div>
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">下分合计</span>
                <strong>{{ slide.downTotal.toFixed(2) }}</strong>
              </div>
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">净额</span>
                <strong :class="summaryNetClass(slide.net)">
                  {{ formatSummaryNet(slide.net) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div class="mh5-bet-order-summary-carousel__dots" aria-hidden="true">
          <span
            v-for="(slide, idx) in currencySummaries"
            :key="`dot-${slide.currency}`"
            class="mh5-bet-order-summary-carousel__dot"
            :class="{ 'mh5-bet-order-summary-carousel__dot--active': summarySlideIndex === idx }"
          />
        </div>
      </div>

      <div v-if="!filteredRecords.length" class="mh5-bet-order-empty">
        <span class="mh5-bet-order-empty__icon" aria-hidden="true">📭</span>
        <p class="mh5-bet-order-empty__title">暂无信用额度记录</p>
        <p class="mh5-bet-order-empty__desc">尝试放宽时间范围或更改筛选条件</p>
      </div>

      <button
        v-for="row in visibleRecords"
        :key="row.id"
        type="button"
        class="mh5-bet-order-card"
        @click="openDetail(row)"
      >
        <div class="mh5-bet-order-card__head">
          <div class="mh5-bet-order-card__member">
            <strong>{{ transferRecordTitle(row) }}</strong>
            <span class="mh5-bet-order-card__currency">{{ row.creditCurrency }}</span>
          </div>
          <span class="mh5-bet-order-card__status" :class="transferTypeStatusClass(row.recordType)">
            {{ recordTypeBadgeLabel(row.recordType) }}
          </span>
        </div>

        <div class="mh5-bet-order-card__body">
          <p class="mh5-bet-order-card__bet-content">
            {{ recordFlowDisplay(row).initiator }} → {{ recordFlowDisplay(row).target }}
          </p>
        </div>
        <time class="mh5-bet-order-card__time">{{ row.createdAt }}</time>

        <div class="mh5-bet-order-card__foot">
          <span class="mh5-bet-order-card__bet">单号 {{ transferRecordOrderNo(row) }}</span>
          <span class="mh5-bet-order-card__result" :class="transferAmountClass(row)">
            {{ formatTransferAmount(row) }}
          </span>
        </div>
      </button>

      <div v-if="filteredRecords.length" class="mh5-bet-order-load">
        <p class="mh5-bet-order-load__info">
          已加载 {{ visibleRecords.length }} / {{ filteredRecords.length }} 条
        </p>
        <button
          v-if="hasMore"
          type="button"
          class="mh5-bet-order-load__btn"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
        <p v-else class="mh5-bet-order-load__done">没有更多了</p>
      </div>
    </main>

    <Teleport to="body">
      <Transition name="mh5-sheet">
        <div v-if="filterOpen" class="mh5-agent-overlay-mask" @click.self="filterOpen = false">
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
            <h2 class="mh5-xcoin-sheet__title">高级筛选</h2>
            <p v-if="filterError" class="mh5-bet-order-sheet__error">{{ filterError }}</p>

            <div class="mh5-bet-order-sheet__body">
              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">时间区间</h3>
                <div class="mh5-bet-order-date-row">
                  <input v-model="filterDraft.customStart" type="date" class="mh5-xcoin-filter-input" />
                  <span>至</span>
                  <input v-model="filterDraft.customEnd" type="date" class="mh5-xcoin-filter-input" />
                </div>
                <p class="mh5-xcoin-filter-hint">选择自定义日期后将覆盖顶部快捷 Tab，最长 90 天</p>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">信用币种</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.currency === '' }"
                    @click="filterDraft.currency = ''"
                  >
                    全部
                  </button>
                  <button
                    v-for="tab in XCOIN_CREDIT_CURRENCY_TABS"
                    :key="tab.key"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.currency === tab.key }"
                    @click="filterDraft.currency = tab.key"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">类型</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in TRANSFER_RECORD_TYPE_OPTIONS"
                    :key="`type-${opt.value || 'all'}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.recordType === opt.value }"
                    @click="filterDraft.recordType = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">发起人</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in TRANSFER_INITIATOR_FILTER_OPTIONS"
                    :key="`initiator-${opt.value || 'all'}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.initiator === opt.value }"
                    @click="filterDraft.initiator = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">对象</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in TRANSFER_ROLE_FILTER_OPTIONS"
                    :key="`role-${opt.value || 'all'}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.role === opt.value }"
                    @click="filterDraft.role = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>
            </div>

            <div class="mh5-xcoin-sheet__footer mh5-bet-order-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="resetFilter">
                重置
              </button>
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--primary" @click="applyFilter">
                确定
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="mh5-sheet">
        <div v-if="detailRow" class="mh5-agent-overlay-mask" @click.self="detailRow = null">
          <div class="mh5-xcoin-sheet mh5-bet-order-detail-sheet">
            <div class="mh5-bet-order-detail-sheet__handle" aria-hidden="true" />
            <div class="mh5-bet-order-detail-hero">
              <p class="mh5-bet-order-detail-hero__amount">
                <span :class="transferAmountClass(detailRow)">{{ formatTransferAmount(detailRow) }}</span>
              </p>
              <span
                class="mh5-bet-order-card__status"
                :class="transferTypeStatusClass(detailRow.recordType)"
              >
                {{ recordTypeBadgeLabel(detailRow.recordType) }}
              </span>
            </div>

            <section class="mh5-bet-order-detail-block">
              <h3 class="mh5-bet-order-detail-block__title">流水信息</h3>
              <div class="mh5-bet-order-detail-row">
                <span>信用币种</span>
                <strong>{{ detailRow.creditCurrency }}</strong>
              </div>
              <div class="mh5-bet-order-detail-row">
                <span>发起人</span>
                <strong>{{ detailFlow?.initiator }}</strong>
              </div>
              <div class="mh5-bet-order-detail-row">
                <span>对象</span>
                <strong>{{ detailFlow?.target }}</strong>
              </div>
              <div class="mh5-bet-order-detail-row">
                <span>时间</span>
                <strong>{{ detailRow.createdAt }}</strong>
              </div>
              <div class="mh5-bet-order-detail-row">
                <span>单号</span>
                <strong class="mh5-bet-order-detail-row__mono">{{ transferRecordOrderNo(detailRow) }}</strong>
              </div>
              <div v-if="detailRelatedOrderNo" class="mh5-bet-order-detail-row">
                <span>关联单号</span>
                <strong class="mh5-bet-order-detail-row__mono">{{ detailRelatedOrderNo }}</strong>
              </div>
            </section>

            <button type="button" class="mh5-bet-order-detail-close" @click="detailRow = null">
              关闭
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mh5-sheet-enter-active,
.mh5-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-sheet-enter-active .mh5-xcoin-sheet,
.mh5-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-sheet-enter-from,
.mh5-sheet-leave-to {
  opacity: 0;
}

.mh5-sheet-enter-from .mh5-xcoin-sheet,
.mh5-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
