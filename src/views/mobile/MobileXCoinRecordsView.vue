<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  MOCK_TRANSFER_RECORDS,
  TRANSFER_DOWNSTREAM_ROLE_PILLS,
  TRANSFER_LANE_TABS,
  TRANSFER_RECORD_PAGE_SIZE,
  TRANSFER_SUMMARY_METRICS,
  TRANSFER_TIME_PRESETS,
  XCOIN_CREDIT_CURRENCY_TABS,
  filterTransferRecords,
  getTransferSceneOptionsByLane,
  transferSceneLane,
  formatTransferAmount,
  formatTransferBalance,
  parseTransferLane,
  parseXCoinCreditCurrency,
  summarizeTransferLaneByCurrency,
  transferAmountClass,
  transferCardFlow,
  transferRecordOrderNo,
  transferRelatedOrderNo,
  transferSceneLabel,
  transferSceneStatusClass,
  validateTransferRecordDateRange,
  type TransferLane,
  type TransferRecordFilter,
  type TransferRoleFilter,
  type TransferTimePreset,
  type XCoinTransferRecord,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5CurrencyIcon from '../../components/mobile/Mh5CurrencyIcon.vue'
import { XCOIN_CREDIT_CURRENCY_SPEC, XCOIN_RECORDS_LANE_SPEC } from '../../constants/xCoinCreditSpec'
import '../../styles/mobile-app-shell.css'

function createDefaultFilter(currency?: string, lane: TransferLane = 'all'): TransferRecordFilter {
  return {
    keyword: '',
    timePreset: 'today',
    customStart: '',
    customEnd: '',
    recordType: '',
    scene: '',
    lane,
    initiator: '',
    role: '',
    currency: currency ? parseXCoinCreditCurrency(currency) : '',
  }
}

const route = useRoute()

function filterFromRoute(): TransferRecordFilter {
  const keyword = String(route.query.keyword || '').trim()
  const fromDetail = route.query.from === 'agent-detail' || route.query.from === 'member-detail'
  const lane = keyword || fromDetail
    ? 'downstream'
    : parseTransferLane(route.query.lane)
  return {
    ...createDefaultFilter(String(route.query.currency || ''), lane),
    keyword,
  }
}

const searchInput = ref(String(route.query.keyword || '').trim())
const appliedFilter = ref<TransferRecordFilter>(filterFromRoute())
const filterDraft = ref<TransferRecordFilter>({ ...appliedFilter.value })

watch(
  () => [route.query.keyword, route.query.currency, route.query.lane, route.query.from] as const,
  () => {
    const next = filterFromRoute()
    searchInput.value = next.keyword
    appliedFilter.value = next
    filterDraft.value = { ...next }
  },
)
const filterOpen = ref(false)
const filterError = ref('')
const toolbarPicker = ref<'time' | 'lane' | 'currency' | null>(null)
const summaryHintOpen = ref(false)
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
  filterTransferRecords(
    MOCK_TRANSFER_RECORDS,
    { ...appliedFilter.value, currency: '' },
    { ignoreCurrency: true },
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const currencySummaries = computed(() => summarizeTransferLaneByCurrency(summaryRecords.value))

const visibleRecords = computed(() =>
  filteredRecords.value.slice(0, page.value * TRANSFER_RECORD_PAGE_SIZE),
)

const visibleCards = computed(() =>
  visibleRecords.value.map((row) => ({ row, flow: transferCardFlow(row) })),
)

const hasMore = computed(() => visibleRecords.value.length < filteredRecords.value.length)

const detailRelatedOrderNo = computed(() =>
  detailRow.value ? transferRelatedOrderNo(detailRow.value) : null,
)

const detailFlow = computed(() => (detailRow.value ? transferCardFlow(detailRow.value) : null))

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

const toolbarTimeLabel = computed(() => {
  if (appliedFilter.value.timePreset === 'custom') return '时间区间'
  return TRANSFER_TIME_PRESETS.find((tab) => tab.key === appliedFilter.value.timePreset)?.label ?? '今天'
})

const toolbarLaneLabel = computed(() => {
  if (appliedFilter.value.lane === 'all') return '类型'
  return TRANSFER_LANE_TABS.find((tab) => tab.key === appliedFilter.value.lane)?.label ?? '类型'
})

const toolbarCurrencyLabel = computed(() => {
  if (appliedFilter.value.currency === '信用额度-CNY') return 'CNY'
  if (appliedFilter.value.currency === '信用额度-USD') return 'USD'
  return '币种'
})

const isToolbarTimeDirty = computed(() => appliedFilter.value.timePreset !== 'today')
const isToolbarLaneDirty = computed(() => appliedFilter.value.lane !== 'all')
const isToolbarCurrencyDirty = computed(() => Boolean(appliedFilter.value.currency))

const toolbarPickerTitle = computed(() => {
  if (toolbarPicker.value === 'time') return '选择日期'
  if (toolbarPicker.value === 'lane') return '选择类型'
  if (toolbarPicker.value === 'currency') return '选择币种'
  return ''
})

const copyTip = ref('')
let copyTipTimer = 0

onUnmounted(() => {
  window.clearTimeout(copyTipTimer)
  filterOpen.value = false
  toolbarPicker.value = null
  summaryHintOpen.value = false
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
  toolbarPicker.value = null
}

function sceneFitsLane(scene: TransferRecordFilter['scene'], lane: TransferLane) {
  if (!scene || lane === 'all') return true
  return transferSceneLane(scene) === lane
}

function pickLane(lane: TransferLane) {
  appliedFilter.value = {
    ...appliedFilter.value,
    lane,
    scene: sceneFitsLane(appliedFilter.value.scene, lane) ? appliedFilter.value.scene : '',
    role: lane === 'downstream' ? appliedFilter.value.role : '',
  }
  toolbarPicker.value = null
}

function pickCurrency(currency: TransferRecordFilter['currency']) {
  appliedFilter.value = { ...appliedFilter.value, currency }
  toolbarPicker.value = null
}

function pickDownstreamRole(role: TransferRoleFilter) {
  appliedFilter.value = { ...appliedFilter.value, role }
}

function openFilter() {
  filterDraft.value = { ...appliedFilter.value }
  filterError.value = ''
  filterOpen.value = true
}

const draftSceneOptions = computed(() => getTransferSceneOptionsByLane(filterDraft.value.lane))

function pickDraftLane(lane: TransferLane) {
  filterDraft.value = {
    ...filterDraft.value,
    lane,
    scene: sceneFitsLane(filterDraft.value.scene, lane) ? filterDraft.value.scene : '',
    role: lane === 'downstream' ? filterDraft.value.role : '',
  }
}

function resetFilter() {
  filterDraft.value = {
    ...createDefaultFilter(String(route.query.currency || '')),
    keyword: searchInput.value.trim(),
  }
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

async function copyOrderNo(row: XCoinTransferRecord) {
  try {
    await navigator.clipboard.writeText(transferRecordOrderNo(row))
    copyTip.value = '已复制单号'
  } catch {
    copyTip.value = '复制失败，请手动长按复制'
  }
  window.clearTimeout(copyTipTimer)
  copyTipTimer = window.setTimeout(() => {
    copyTip.value = ''
  }, 1600)
}

function formatSummaryNumber(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function summaryToneClass(value: number) {
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
          <Mh5SpecAnnot :spec="XCOIN_RECORDS_LANE_SPEC" placement="bottom" />
          <Mh5SpecAnnot :spec="XCOIN_CREDIT_CURRENCY_SPEC" placement="bottom" />
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

      <div class="mh5-bet-order-toolbar__row">
        <div class="mh5-bet-order-toolbar__picks">
          <button
            type="button"
            class="mh5-bet-order-toolbar__pick"
            :class="{ 'mh5-bet-order-toolbar__pick--active': isToolbarTimeDirty }"
            @click="toolbarPicker = 'time'"
          >
            <span class="mh5-bet-order-toolbar__pick-text">{{ toolbarTimeLabel }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-bet-order-toolbar__pick"
            :class="{ 'mh5-bet-order-toolbar__pick--active': isToolbarLaneDirty }"
            @click="toolbarPicker = 'lane'"
          >
            <span class="mh5-bet-order-toolbar__pick-text">{{ toolbarLaneLabel }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-bet-order-toolbar__pick"
            :class="{ 'mh5-bet-order-toolbar__pick--active': isToolbarCurrencyDirty }"
            @click="toolbarPicker = 'currency'"
          >
            <span class="mh5-bet-order-toolbar__pick-text">{{ toolbarCurrencyLabel }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <button type="button" class="mh5-bet-order-toolbar__filter" aria-label="筛选" @click="openFilter">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5.5h16l-5.8 7.2V19l-4.4 2v-8.3L4 5.5z"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        v-if="appliedFilter.lane === 'downstream'"
        class="mh5-xcoin-records-roles"
        role="tablist"
        aria-label="下级对象"
      >
        <button
          v-for="pill in TRANSFER_DOWNSTREAM_ROLE_PILLS"
          :key="`role-${pill.key || 'all'}`"
          type="button"
          role="tab"
          class="mh5-agent-report-vendor"
          :class="{ 'mh5-agent-report-vendor--active': appliedFilter.role === pill.key }"
          :aria-selected="appliedFilter.role === pill.key"
          @click="pickDownstreamRole(pill.key)"
        >
          {{ pill.label }}
        </button>
      </div>
    </div>

    <main class="mh5-bet-order-main">
      <div class="mh5-bet-order-summary-carousel mh5-bet-order-summary-carousel--scroll">
        <button
          type="button"
          class="mh5-xcoin-records-summary__help"
          aria-label="汇总说明"
          @click.stop="summaryHintOpen = true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
            <path
              d="M8 4.6v5.2M8 11.6h.01"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
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
              <div
                v-for="metric in TRANSFER_SUMMARY_METRICS"
                :key="metric.key"
                class="mh5-bet-order-summary__item"
              >
                <span class="mh5-bet-order-summary__label">{{ metric.label }}</span>
                <strong :class="summaryToneClass(slide[metric.key])">
                  {{ formatSummaryNumber(slide[metric.key]) }}
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
        <p class="mh5-bet-order-empty__desc">尝试切换类型或放宽筛选条件</p>
      </div>

      <button
        v-for="{ row, flow } in visibleCards"
        :key="row.id"
        type="button"
        class="mh5-bet-order-card"
        @click="openDetail(row)"
      >
        <div class="mh5-bet-order-card__head">
          <span class="mh5-bet-order-card__status mh5-xcoin-records-scene">
            [{{ transferSceneLabel(row) }}]
          </span>
          <span class="mh5-xcoin-records-amount">
            <Mh5CurrencyIcon :code="row.creditCurrency" :size="18" />
            <span class="mh5-bet-order-card__result" :class="transferAmountClass(row)">
              {{ formatTransferAmount(row) }}
            </span>
          </span>
        </div>

        <div class="mh5-xcoin-records-flow">
          <p class="mh5-xcoin-records-flow__row">
            <span class="mh5-xcoin-records-flow__label">发起人</span>
            <span class="mh5-xcoin-records-flow__value">{{ flow.fromName }}</span>
          </p>
          <p class="mh5-xcoin-records-flow__row">
            <span class="mh5-xcoin-records-flow__label">对象</span>
            <span class="mh5-xcoin-records-flow__value">{{ flow.toName }}</span>
            <span v-if="flow.toRole" class="mh5-xcoin-records-role">[{{ flow.toRole }}]</span>
          </p>
        </div>
        <div class="mh5-xcoin-records-meta">
          <time class="mh5-bet-order-card__time">{{ row.createdAt }}</time>
          <span class="mh5-xcoin-records-orderno">
            <span class="mh5-xcoin-records-orderno__no" :title="transferRecordOrderNo(row)">
              <span class="mh5-xcoin-records-orderno__head">{{ transferRecordOrderNo(row).slice(0, -6) }}</span>
              <span class="mh5-xcoin-records-orderno__tail">{{ transferRecordOrderNo(row).slice(-6) }}</span>
            </span>
            <span
              class="mh5-xcoin-records-copy"
              role="button"
              aria-label="复制单号"
              @click.stop="copyOrderNo(row)"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
              </svg>
            </span>
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

    <p v-if="copyTip" class="mh5-bet-order-copy-tip">{{ copyTip }}</p>

    <Teleport to="body">
      <Transition name="mh5-sheet">
        <div
          v-if="toolbarPicker"
          class="mh5-agent-overlay-mask"
          @click.self="toolbarPicker = null"
        >
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
            <h2 class="mh5-xcoin-sheet__title">{{ toolbarPickerTitle }}</h2>
            <template v-if="toolbarPicker === 'time'">
              <button
                v-for="tab in TRANSFER_TIME_PRESETS"
                :key="tab.key"
                type="button"
                class="mh5-xcoin-sheet__option"
                :class="{ 'mh5-xcoin-sheet__option--active': appliedFilter.timePreset === tab.key }"
                @click="selectTimePreset(tab.key)"
              >
                {{ tab.label }}
              </button>
            </template>
            <template v-else-if="toolbarPicker === 'lane'">
              <button
                v-for="tab in TRANSFER_LANE_TABS"
                :key="tab.key"
                type="button"
                class="mh5-xcoin-sheet__option"
                :class="{ 'mh5-xcoin-sheet__option--active': appliedFilter.lane === tab.key }"
                @click="pickLane(tab.key)"
              >
                {{ tab.label }}
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="mh5-xcoin-sheet__option"
                :class="{ 'mh5-xcoin-sheet__option--active': appliedFilter.currency === '' }"
                @click="pickCurrency('')"
              >
                全部币种
              </button>
              <button
                v-for="tab in XCOIN_CREDIT_CURRENCY_TABS"
                :key="tab.key"
                type="button"
                class="mh5-xcoin-sheet__option"
                :class="{ 'mh5-xcoin-sheet__option--active': appliedFilter.currency === tab.key }"
                @click="pickCurrency(tab.key)"
              >
                {{ tab.label }}
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Transition name="mh5-agent-my-profit-dialog">
      <div
        v-if="summaryHintOpen"
        class="mh5-agent-my-profit-dialog-mask"
        @click.self="summaryHintOpen = false"
      >
        <div
          class="mh5-agent-my-profit-dialog mh5-xcoin-records-hint-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="汇总说明"
        >
          <h2 class="mh5-agent-my-profit-dialog__title">汇总说明</h2>
          <ul class="mh5-xcoin-records-hint-dialog__list">
            <li
              v-for="metric in TRANSFER_SUMMARY_METRICS"
              :key="metric.key"
              class="mh5-xcoin-records-hint-dialog__item"
            >
              <p class="mh5-xcoin-records-hint-dialog__name">{{ metric.label }}</p>
              <p class="mh5-xcoin-records-hint-dialog__formula">{{ metric.hint }}</p>
            </li>
          </ul>
          <button
            type="button"
            class="mh5-agent-my-profit-dialog__btn"
            @click="summaryHintOpen = false"
          >
            知道了
          </button>
        </div>
      </div>
    </Transition>

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
                    v-for="tab in TRANSFER_LANE_TABS"
                    :key="`lane-${tab.key}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.lane === tab.key }"
                    @click="pickDraftLane(tab.key)"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">场景</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in draftSceneOptions"
                    :key="`scene-${opt.value || 'all'}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.scene === opt.value }"
                    @click="filterDraft.scene = opt.value"
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
                :class="transferSceneStatusClass(detailRow)"
              >
                {{ transferSceneLabel(detailRow) }}
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
                <strong>{{ detailFlow?.fromName }}</strong>
              </div>
              <div class="mh5-bet-order-detail-row">
                <span>对象</span>
                <strong>
                  {{ detailFlow?.toName }}
                  <template v-if="detailFlow?.toRole">（{{ detailFlow.toRole }}）</template>
                </strong>
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
              <div class="mh5-bet-order-detail-row">
                <span>变动后结余</span>
                <strong>{{ formatTransferBalance(detailRow) }}</strong>
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
