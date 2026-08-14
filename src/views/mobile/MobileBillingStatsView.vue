<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BILLING_STATS_CURRENCY_OPTIONS,
  BILLING_STATS_CURRENCY_TABS,
  BILLING_STATS_GAME_OPTIONS,
  BILLING_STATS_RANGE_OPTIONS,
  filterBillingStatsCurrencyOptions,
  formatBillingStatsAmount,
  formatBillingStatsCount,
  getBillingStatsBundle,
  getBillingStatsRange,
  type BillingStatsCurrencyKind,
  type BillingStatsRangeKey,
  type BillingStatsRankMode,
} from '../../constants/billingStats'
import '../../styles/mobile-app-shell.css'

type SheetKind = 'currency' | 'game' | null

const router = useRouter()

const rangeKey = ref<BillingStatsRangeKey>('today')
const currency = ref('KKC')
const currencyTab = ref<'all' | BillingStatsCurrencyKind>('all')
const game = ref('')
const rankMode = ref<BillingStatsRankMode>('expense')
const sheetOpen = ref<SheetKind>(null)

const rangeMeta = computed(() => getBillingStatsRange(rangeKey.value))
const dateLabel = computed(() => rangeMeta.value.label)

const currencyLabel = computed(
  () => BILLING_STATS_CURRENCY_OPTIONS.find((item) => item.value === currency.value)?.label ?? currency.value,
)

const currencySheetOptions = computed(() =>
  filterBillingStatsCurrencyOptions(BILLING_STATS_CURRENCY_OPTIONS, currencyTab.value),
)

const gameLabel = computed(
  () => BILLING_STATS_GAME_OPTIONS.find((item) => item.value === game.value)?.label ?? '所有游戏',
)

const bundle = computed(() => getBillingStatsBundle(currency.value))

const summary = computed(() => {
  const base = bundle.value.summary
  if (game.value && game.value !== 'sport' && game.value !== '') {
    return { expense: 0, expenseCount: 0, income: 0, incomeCount: 0, net: 0 }
  }
  return base
})

const rankList = computed(() => {
  const list = rankMode.value === 'expense' ? bundle.value.expenseRank : bundle.value.incomeRank
  if (!game.value) return list
  return list.filter((item) => item.id === game.value)
})

function pickRange(key: BillingStatsRangeKey) {
  rangeKey.value = key
}

function openSheet(kind: SheetKind) {
  if (kind === 'currency') currencyTab.value = 'all'
  sheetOpen.value = kind
}

function closeSheet() {
  sheetOpen.value = null
}

function selectCurrency(value: string) {
  currency.value = value
  closeSheet()
}

function selectGame(value: string) {
  game.value = value
  closeSheet()
}

function goList() {
  router.push({ name: 'mobile-billing-list' })
}
</script>

<template>
  <div class="mh5-billing-stats-page">
    <header class="mh5-billing-stats-header">
      <button type="button" class="mh5-billing-stats-header__back" :aria-label="$t('返回')" @click="router.back()">
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
      <h1 class="mh5-billing-stats-header__title">{{ $t('账单') }}</h1>
      <button type="button" class="mh5-billing-stats-header__list" :aria-label="$t('账单列表')" @click="goList">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="4" width="11" height="14" rx="1.5" stroke="currentColor" stroke-width="1.6" />
          <path d="M8 8h5M8 11h5M8 14h3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="17.5" cy="17.5" r="3.2" fill="#fff" stroke="var(--mh5-app-orange)" stroke-width="1.5" />
          <path
            d="M17.5 16v1.5l1 0.6"
            stroke="var(--mh5-app-orange)"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </header>

    <main class="mh5-billing-stats-main">
      <div class="mh5-billing-stats-ranges" role="tablist" :aria-label="$t('统计周期')">
        <button
          v-for="item in BILLING_STATS_RANGE_OPTIONS"
          :key="item.key"
          type="button"
          role="tab"
          class="mh5-billing-stats-range"
          :class="{ 'mh5-billing-stats-range--active': rangeKey === item.key }"
          :aria-selected="rangeKey === item.key"
          @click="pickRange(item.key)"
        >
          {{ $t(item.label) }}
        </button>
      </div>

      <div class="mh5-billing-stats-filters">
        <button type="button" class="mh5-billing-stats-filter" @click="pickRange(rangeKey)">
          <span>{{ dateLabel }}</span>
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="mh5-billing-stats-filter" @click="openSheet('currency')">
          <span>{{ currencyLabel }}</span>
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="mh5-billing-stats-filter" @click="openSheet('game')">
          <span>{{ gameLabel }}</span>
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <section class="mh5-billing-stats-card">
        <div class="mh5-billing-stats-card__grid">
          <div class="mh5-billing-stats-card__col">
            <p class="mh5-billing-stats-card__label">{{ $t('支出') }}</p>
            <p class="mh5-billing-stats-card__amount mh5-billing-stats-card__amount--expense">
              {{ formatBillingStatsAmount(summary.expense, 'expense') }}
            </p>
            <p class="mh5-billing-stats-card__count">{{ formatBillingStatsCount(summary.expenseCount) }}</p>
          </div>
          <div class="mh5-billing-stats-card__col">
            <p class="mh5-billing-stats-card__label">{{ $t('收入') }}</p>
            <p class="mh5-billing-stats-card__amount mh5-billing-stats-card__amount--income">
              {{ formatBillingStatsAmount(summary.income, 'income') }}
            </p>
            <p class="mh5-billing-stats-card__count">{{ formatBillingStatsCount(summary.incomeCount) }}</p>
          </div>
        </div>
        <div class="mh5-billing-stats-card__total">
          <span>{{ $t('收支合计') }}</span>
          <strong>{{ formatBillingStatsAmount(summary.net, 'net') }}</strong>
        </div>
      </section>

      <section class="mh5-billing-stats-rank">
        <div class="mh5-billing-stats-rank__head">
          <h2 class="mh5-billing-stats-rank__title">{{ $t('排行榜') }}</h2>
          <div class="mh5-billing-stats-rank__toggle" role="tablist" :aria-label="$t('排行榜类型')">
            <button
              type="button"
              role="tab"
              class="mh5-billing-stats-rank__tab mh5-billing-stats-rank__tab--expense"
              :class="{ 'mh5-billing-stats-rank__tab--active': rankMode === 'expense' }"
              :aria-selected="rankMode === 'expense'"
              @click="rankMode = 'expense'"
            >{{ $t('支出') }}</button>
            <button
              type="button"
              role="tab"
              class="mh5-billing-stats-rank__tab mh5-billing-stats-rank__tab--income"
              :class="{ 'mh5-billing-stats-rank__tab--active': rankMode === 'income' }"
              :aria-selected="rankMode === 'income'"
              @click="rankMode = 'income'"
            >{{ $t('收入') }}</button>
          </div>
        </div>

        <div v-if="rankList.length" class="mh5-billing-stats-rank__list">
          <article v-for="(item, index) in rankList" :key="item.id" class="mh5-billing-stats-rank__row">
            <span
              class="mh5-billing-stats-rank__index"
              :class="{
                'mh5-billing-stats-rank__index--1': index === 0,
                'mh5-billing-stats-rank__index--2': index === 1,
                'mh5-billing-stats-rank__index--3': index === 2,
              }"
            >
              {{ index + 1 }}
            </span>
            <div class="mh5-billing-stats-rank__meta">
              <span class="mh5-billing-stats-rank__name">{{ $t(item.name) }}</span>
              <span class="mh5-billing-stats-rank__sub">{{ formatBillingStatsCount(item.count) }}</span>
            </div>
            <span
              class="mh5-billing-stats-rank__amount"
              :class="
                rankMode === 'expense'
                  ? 'mh5-billing-stats-rank__amount--expense'
                  : 'mh5-billing-stats-rank__amount--income'
              "
            >
              {{ formatBillingStatsAmount(item.amount, rankMode) }}
            </span>
          </article>
        </div>

        <div v-else class="mh5-billing-stats-empty">
          <div class="mh5-billing-stats-empty__art" aria-hidden="true">
            <svg width="120" height="96" viewBox="0 0 120 96" fill="none">
              <rect x="28" y="22" width="42" height="52" rx="4" fill="#ffb070" opacity="0.9" />
              <rect x="34" y="30" width="22" height="3" rx="1.5" fill="#fff" opacity="0.7" />
              <rect x="34" y="38" width="18" height="3" rx="1.5" fill="#fff" opacity="0.55" />
              <rect x="34" y="46" width="26" height="3" rx="1.5" fill="#fff" opacity="0.45" />
              <rect
                x="48"
                y="16"
                width="42"
                height="52"
                rx="4"
                fill="none"
                stroke="#ff8a3d"
                stroke-width="2"
                stroke-dasharray="3 3"
              />
              <circle cx="78" cy="58" r="16" stroke="#ff8a3d" stroke-width="2.2" fill="#fff7f0" />
              <circle cx="78" cy="58" r="8" stroke="#ff8a3d" stroke-width="2" />
              <path d="M89 69l8 8" stroke="#ff8a3d" stroke-width="2.4" stroke-linecap="round" />
              <circle cx="30" cy="70" r="2" fill="#ffb070" />
              <circle cx="96" cy="28" r="2" fill="#ffb070" />
              <path d="M22 40c8-10 18-8 22-2" stroke="#ffb070" stroke-width="1.5" stroke-dasharray="2 3" />
            </svg>
          </div>
          <p class="mh5-billing-stats-empty__text">{{ $t('暂无数据') }}</p>
        </div>
      </section>
    </main>

    <Teleport to="body">
      <Transition name="mh5-billing-sheet">
        <div v-if="sheetOpen === 'currency'" class="mh5-agent-overlay-mask" @click.self="closeSheet">
          <div
            class="mh5-wallet-sheet agent-currency-sheet mh5-billing-pick-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-stats-currency-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="billing-stats-currency-title" class="mh5-wallet-sheet__title">{{ $t('选择币种') }}</h2>
              <button type="button" class="mh5-wallet-sheet__close" :aria-label="$t('关闭')" @click="closeSheet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <div class="mh5-wallet-sheet__filters" role="tablist" :aria-label="$t('币种分类')">
              <button
                v-for="tab in BILLING_STATS_CURRENCY_TABS"
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
                :key="opt.value"
                type="button"
                class="agent-currency-sheet__item"
                :class="{
                  'agent-currency-sheet__item--active': currency === opt.value,
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
                  v-if="currency === opt.value"
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
        <div v-if="sheetOpen === 'game'" class="mh5-agent-overlay-mask" @click.self="closeSheet">
          <div
            class="mh5-wallet-sheet agent-currency-sheet mh5-billing-pick-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-stats-game-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="billing-stats-game-title" class="mh5-wallet-sheet__title">{{ $t('选择游戏') }}</h2>
              <button type="button" class="mh5-wallet-sheet__close" :aria-label="$t('关闭')" @click="closeSheet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div class="mh5-wallet-sheet__list agent-currency-sheet__list">
              <button
                v-for="opt in BILLING_STATS_GAME_OPTIONS"
                :key="opt.value || 'all'"
                type="button"
                class="agent-currency-sheet__item"
                :class="{ 'agent-currency-sheet__item--active': game === opt.value }"
                @click="selectGame(opt.value)"
              >
                <span class="agent-currency-sheet__name">{{ $t(opt.label) }}</span>
                <span
                  v-if="game === opt.value"
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
  </div>
</template>

<style scoped>
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
