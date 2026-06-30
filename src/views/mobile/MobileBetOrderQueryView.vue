<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  getBetOrderGameNameOptions,
  BET_ORDER_CATEGORY_OPTIONS,
  BET_ORDER_CURRENCY_OPTIONS,
  BET_ORDER_PAGE_SIZE,
  BET_ORDER_STATUS_LABEL,
  BET_ORDER_STATUS_OPTIONS,
  BET_ORDER_WINLOSE_OPTIONS,
  BET_TIME_PRESETS,
  MOCK_BET_ORDER_RECORDS,
  betOrderStatusClass,
  betWinLoseClass,
  filterBetOrders,
  formatBetWinLose,
  formatBetOrderCurrency,
  formatMoney,
  summarizeBetOrders,
  validateBetOrderDateRange,
  getBetOrderCategoryLabel,
  type BetOrderFilter,
  type BetOrderRecord,
  type BetTimePreset,
} from '../../constants/betOrderQuery'
import '../../styles/mobile-app-shell.css'

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  { embedded: false },
)

function createDefaultFilter(): BetOrderFilter {
  return {
    keyword: '',
    timePreset: 'today',
    customStart: '',
    customEnd: '',
    status: '',
    category: '',
    gameName: '',
    gameCurrency: 'KKC',
    winLose: '',
  }
}

const searchInput = ref('')
const appliedFilter = ref<BetOrderFilter>(createDefaultFilter())
const filterDraft = ref<BetOrderFilter>(createDefaultFilter())
const filterOpen = ref(false)
const filterError = ref('')
const page = ref(1)
const loadingMore = ref(false)

const detailRow = ref<BetOrderRecord | null>(null)
const foldTraceOpen = ref(false)
const copyTip = ref('')

const filteredRecords = computed(() =>
  filterBetOrders(MOCK_BET_ORDER_RECORDS, appliedFilter.value).sort((a, b) =>
    b.betAt.localeCompare(a.betAt),
  ),
)

const summary = computed(() => summarizeBetOrders(filteredRecords.value))

const visibleRecords = computed(() => filteredRecords.value.slice(0, page.value * BET_ORDER_PAGE_SIZE))

const hasMore = computed(() => visibleRecords.value.length < filteredRecords.value.length)

const draftGameNameOptions = computed(() => getBetOrderGameNameOptions(filterDraft.value.category))

const gameNameChipsRef = ref<HTMLElement | null>(null)
const gameNameExpanded = ref(false)
const gameNameOverflow = ref(false)
const gameNameCollapsedHeight = ref(0)

function measureGameNameChipsOverflow() {
  gameNameExpanded.value = false
  nextTick(() => {
    const el = gameNameChipsRef.value
    if (!el || !filterDraft.value.category) {
      gameNameOverflow.value = false
      gameNameCollapsedHeight.value = 0
      return
    }
    const chips = [...el.querySelectorAll<HTMLElement>('.mh5-xcoin-chip:not(.mh5-xcoin-chip--more)')]
    if (!chips.length) {
      gameNameOverflow.value = false
      gameNameCollapsedHeight.value = 0
      return
    }
    const rowTops = [...new Set(chips.map((chip) => chip.offsetTop))].sort((a, b) => a - b)
    gameNameOverflow.value = rowTops.length > 2
    gameNameCollapsedHeight.value = rowTops.length > 2 ? rowTops[2] : 0
  })
}

watch(draftGameNameOptions, measureGameNameChipsOverflow)
watch(
  () => filterDraft.value.category,
  () => {
    gameNameExpanded.value = false
    measureGameNameChipsOverflow()
  },
)
watch(filterOpen, (open) => {
  if (open) measureGameNameChipsOverflow()
})

watch(
  appliedFilter,
  () => {
    page.value = 1
  },
  { deep: true },
)

function runSearch() {
  appliedFilter.value = { ...appliedFilter.value, keyword: searchInput.value.trim() }
}

function selectTimePreset(preset: BetTimePreset) {
  appliedFilter.value = {
    ...appliedFilter.value,
    timePreset: preset,
    customStart: '',
    customEnd: '',
  }
}

function openFilter() {
  filterDraft.value = { ...appliedFilter.value, keyword: searchInput.value.trim() }
  filterError.value = ''
  filterOpen.value = true
}

function resetFilter() {
  filterDraft.value = createDefaultFilter()
  filterError.value = ''
  gameNameExpanded.value = false
  gameNameOverflow.value = false
  gameNameCollapsedHeight.value = 0
}

function applyFilter() {
  const next = { ...filterDraft.value, keyword: filterDraft.value.keyword.trim() }
  if (next.customStart && next.customEnd) {
    next.timePreset = 'custom'
  }
  if (!next.category) {
    next.gameName = ''
  }
  const err = validateBetOrderDateRange(next)
  if (err) {
    filterError.value = err
    return
  }
  appliedFilter.value = next
  searchInput.value = next.keyword
  filterOpen.value = false
  filterError.value = ''
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  await new Promise((r) => setTimeout(r, 350))
  page.value += 1
  loadingMore.value = false
}

function openDetail(row: BetOrderRecord) {
  detailRow.value = row
  foldTraceOpen.value = false
}

function closeDetail() {
  detailRow.value = null
  foldTraceOpen.value = false
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copyTip.value = `已复制${label}`
  } catch {
    copyTip.value = '复制失败，请手动长按复制'
  }
  window.setTimeout(() => {
    copyTip.value = ''
  }, 1600)
}

function selectCategory(category: string) {
  filterDraft.value.category = category
  filterDraft.value.gameName = ''
  gameNameExpanded.value = false
  measureGameNameChipsOverflow()
}

function toggleGameNameExpanded() {
  gameNameExpanded.value = !gameNameExpanded.value
}
</script>

<template>
  <div class="mh5-bet-order-page" :class="{ 'mh5-bet-order-page--embedded': embedded }">
    <header v-if="embedded" class="mh5-agent-report-header">
      <h1 class="mh5-agent-report-header__title">注单查询</h1>
      <button type="button" class="mh5-bet-order-embedded-filter" @click="openFilter">筛选</button>
    </header>
    <Mh5SubPageHeader v-else title="注单查询">
      <template #right>
        <button type="button" class="mh5-sub-header__action" @click="openFilter">筛选</button>
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
          placeholder="下级会员账号 / 注单号"
          enterkeyhint="search"
        />
        <button type="submit" class="mh5-bet-order-search__btn">搜索</button>
      </form>

      <div class="mh5-bet-order-tabs" role="tablist" aria-label="时间快捷切换">
        <button
          v-for="tab in BET_TIME_PRESETS"
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

    <div class="mh5-bet-order-summary">
      <div class="mh5-bet-order-summary__item">
        <span class="mh5-bet-order-summary__label">总单数</span>
        <strong>{{ summary.count }}</strong>
      </div>
      <div class="mh5-bet-order-summary__item">
        <span class="mh5-bet-order-summary__label">总下注</span>
        <strong>{{ formatMoney(summary.betAmount) }}</strong>
      </div>
      <div class="mh5-bet-order-summary__item">
        <span class="mh5-bet-order-summary__label">总有效投注</span>
        <strong>{{ formatMoney(summary.validBet) }}</strong>
      </div>
      <div class="mh5-bet-order-summary__item">
        <span class="mh5-bet-order-summary__label">总输赢</span>
        <strong
          :class="{
            'mh5-bet-order__amount--win': summary.winLose > 0,
            'mh5-bet-order__amount--lose': summary.winLose < 0,
          }"
        >
          {{ summary.winLose > 0 ? `+${formatMoney(summary.winLose)}` : formatMoney(summary.winLose) }}
        </strong>
      </div>
    </div>

    <main class="mh5-bet-order-main">
      <div v-if="!filteredRecords.length" class="mh5-bet-order-empty">
        <span class="mh5-bet-order-empty__icon" aria-hidden="true">📭</span>
        <p class="mh5-bet-order-empty__title">暂无注单数据</p>
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
            <strong>{{ row.memberAccount }}</strong>
            <span class="mh5-bet-order-card__currency">{{ formatBetOrderCurrency(row.currency) }}</span>
          </div>
          <span class="mh5-bet-order-card__status" :class="betOrderStatusClass(row.status)">
            {{ BET_ORDER_STATUS_LABEL[row.status] }}
          </span>
        </div>

        <div class="mh5-bet-order-card__body">
          <div class="mh5-bet-order-card__game-row">
            <span class="mh5-bet-order-card__category">{{ getBetOrderCategoryLabel(row.gameCategory) }}</span>
            <span class="mh5-bet-order-card__game-name">{{ row.productName }}</span>
          </div>
          <p class="mh5-bet-order-card__bet-content">{{ row.betContent }}</p>
        </div>
        <time class="mh5-bet-order-card__time">{{ row.betAt }}</time>

        <div class="mh5-bet-order-card__foot">
          <span class="mh5-bet-order-card__bet">下注 {{ formatMoney(row.betAmount) }}</span>
          <span class="mh5-bet-order-card__result" :class="betWinLoseClass(row)">
            {{ formatBetWinLose(row) }}
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

    <!-- 高级筛选 -->
    <Transition name="mh5-sheet">
      <div v-if="filterOpen" class="mh5-xcoin-sheet-mask" @click.self="filterOpen = false">
        <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
          <h2 class="mh5-xcoin-sheet__title">高级筛选</h2>
          <p v-if="filterError" class="mh5-bet-order-sheet__error">{{ filterError }}</p>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">时间区间</h3>
            <div class="mh5-bet-order-date-row">
              <input v-model="filterDraft.customStart" type="date" class="mh5-xcoin-filter-input" />
              <span>至</span>
              <input v-model="filterDraft.customEnd" type="date" class="mh5-xcoin-filter-input" />
            </div>
            <p class="mh5-xcoin-filter-hint">选择自定义日期后将覆盖顶部快捷 Tab，最长 30 天</p>
          </section>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">游戏币种</h3>
            <div class="mh5-xcoin-filter-chips">
              <button
                v-for="opt in BET_ORDER_CURRENCY_OPTIONS"
                :key="`currency-${opt.value || 'all'}`"
                type="button"
                class="mh5-xcoin-chip"
                :class="{ 'mh5-xcoin-chip--active': filterDraft.gameCurrency === opt.value }"
                @click="filterDraft.gameCurrency = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">订单状态</h3>
            <div class="mh5-xcoin-filter-chips">
              <button
                v-for="opt in BET_ORDER_STATUS_OPTIONS"
                :key="`status-${opt.value || 'all'}`"
                type="button"
                class="mh5-xcoin-chip"
                :class="{ 'mh5-xcoin-chip--active': filterDraft.status === opt.value }"
                @click="
                  filterDraft.status = opt.value;
                  filterDraft.timePreset = filterDraft.customStart ? 'custom' : filterDraft.timePreset
                "
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">游戏分类</h3>
            <div class="mh5-xcoin-filter-chips">
              <button
                v-for="opt in BET_ORDER_CATEGORY_OPTIONS"
                :key="`category-${opt.value || 'all'}`"
                type="button"
                class="mh5-xcoin-chip"
                :class="{ 'mh5-xcoin-chip--active': filterDraft.category === opt.value }"
                @click="selectCategory(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <section v-if="filterDraft.category" class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">游戏名称</h3>
            <div
              class="mh5-filter-chips-collapsible"
              :class="{ 'mh5-filter-chips-collapsible--collapsed': gameNameOverflow && !gameNameExpanded }"
            >
              <div
                ref="gameNameChipsRef"
                class="mh5-xcoin-filter-chips mh5-filter-chips-collapsible__chips"
                :style="
                  gameNameOverflow && !gameNameExpanded
                    ? { maxHeight: `${gameNameCollapsedHeight}px` }
                    : undefined
                "
              >
                <button
                  v-for="opt in draftGameNameOptions"
                  :key="`game-${filterDraft.category}-${opt.value || 'all'}`"
                  type="button"
                  class="mh5-xcoin-chip"
                  :class="{ 'mh5-xcoin-chip--active': filterDraft.gameName === opt.value }"
                  @click="filterDraft.gameName = opt.value"
                >
                  {{ opt.label }}
                </button>
                <button
                  v-if="gameNameOverflow && gameNameExpanded"
                  type="button"
                  class="mh5-xcoin-chip mh5-xcoin-chip--more"
                  @click="toggleGameNameExpanded"
                >
                  收起
                </button>
              </div>
              <button
                v-if="gameNameOverflow && !gameNameExpanded"
                type="button"
                class="mh5-xcoin-chip mh5-xcoin-chip--more mh5-xcoin-chip--more-floating"
                @click="toggleGameNameExpanded"
              >
                展开
              </button>
            </div>
            <p class="mh5-xcoin-filter-hint">根据上方游戏分类联动展示可选游戏名称</p>
          </section>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">输赢状态</h3>
            <div class="mh5-xcoin-filter-chips">
              <button
                v-for="opt in BET_ORDER_WINLOSE_OPTIONS"
                :key="`wl-${opt.value || 'all'}`"
                type="button"
                class="mh5-xcoin-chip"
                :class="{ 'mh5-xcoin-chip--active': filterDraft.winLose === opt.value }"
                @click="filterDraft.winLose = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <div class="mh5-xcoin-sheet__footer">
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

    <!-- 注单详情 -->
    <Transition name="mh5-sheet">
      <div v-if="detailRow" class="mh5-xcoin-sheet-mask" @click.self="closeDetail">
        <div class="mh5-xcoin-sheet mh5-bet-order-detail-sheet">
          <div class="mh5-bet-order-detail-sheet__handle" aria-hidden="true" />

          <section class="mh5-bet-order-detail-hero">
            <p class="mh5-bet-order-detail-hero__amount" :class="betWinLoseClass(detailRow)">
              {{ formatBetWinLose(detailRow) }}
              <span>{{ formatBetOrderCurrency(detailRow.currency) }}</span>
            </p>
            <span class="mh5-bet-order-card__status" :class="betOrderStatusClass(detailRow.status)">
              {{ BET_ORDER_STATUS_LABEL[detailRow.status] }}
            </span>
          </section>

          <section class="mh5-bet-order-detail-block">
            <h3 class="mh5-bet-order-detail-block__title">投注明细</h3>
            <div class="mh5-bet-order-detail-row">
              <span>会员账号</span>
              <span class="mh5-bet-order-detail-row__value">
                {{ detailRow.memberAccount }}
                <button type="button" class="mh5-bet-order-copy" @click.stop="copyText(detailRow.memberAccount, '账号')">
                  复制
                </button>
              </span>
            </div>
            <div class="mh5-bet-order-detail-row"><span>产品名称</span><span>{{ detailRow.productName }}</span></div>
            <div class="mh5-bet-order-detail-row"><span>期数/场次</span><span>{{ detailRow.periodNo }}</span></div>
            <div class="mh5-bet-order-detail-row mh5-bet-order-detail-row--stack">
              <span>投注内容</span>
              <span>{{ detailRow.betContent }}</span>
            </div>
          </section>

          <section class="mh5-bet-order-detail-block">
            <h3 class="mh5-bet-order-detail-block__title">资金明细</h3>
            <div class="mh5-bet-order-detail-row"><span>下注金额</span><span>{{ formatMoney(detailRow.betAmount) }}</span></div>
            <div class="mh5-bet-order-detail-row"><span>实扣金额</span><span>{{ formatMoney(detailRow.actualDeduct) }}</span></div>
            <div class="mh5-bet-order-detail-row">
              <span>有效投注</span>
              <strong>{{ formatMoney(detailRow.validBet) }}</strong>
            </div>
          </section>

          <section class="mh5-bet-order-detail-block">
            <h3 class="mh5-bet-order-detail-block__title">订单信息</h3>
            <div class="mh5-bet-order-detail-row">
              <span>游戏订单号</span>
              <span class="mh5-bet-order-detail-row__value">
                {{ detailRow.gameOrderNo }}
                <button type="button" class="mh5-bet-order-copy" @click.stop="copyText(detailRow.gameOrderNo, '订单号')">
                  复制
                </button>
              </span>
            </div>
            <div class="mh5-bet-order-detail-row"><span>投注时间</span><span>{{ detailRow.betAt }}</span></div>
            <div class="mh5-bet-order-detail-row">
              <span>结算时间</span>
              <span>{{ detailRow.platformSettledAt || '—' }}</span>
            </div>

            <button type="button" class="mh5-bet-order-fold" @click.stop="foldTraceOpen = !foldTraceOpen">
              {{ foldTraceOpen ? '收起追溯信息' : '展开追溯信息（交易编号等）' }}
            </button>
            <div v-if="foldTraceOpen" class="mh5-bet-order-fold__body">
              <div class="mh5-bet-order-detail-row">
                <span>交易编号</span>
                <span class="mh5-bet-order-detail-row__mono">{{ detailRow.transactionId }}</span>
              </div>
              <div class="mh5-bet-order-detail-row">
                <span>第三方游戏编号</span>
                <span>{{ detailRow.thirdPartyGameId }}</span>
              </div>
            </div>
          </section>

          <button type="button" class="mh5-bet-order-detail-close" @click="closeDetail">关闭</button>
        </div>
      </div>
    </Transition>
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
