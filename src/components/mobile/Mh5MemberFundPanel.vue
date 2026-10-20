<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'
import Mh5DateRangeSheet from './Mh5DateRangeSheet.vue'
import {
  MEMBER_FUND_CURRENCY_OPTIONS,
  MEMBER_FUND_TYPE_OPTIONS,
  MOCK_MEMBER_FUND_RECORDS,
  filterMemberFundRecords,
  getMemberFundFiatDetail,
  getMemberFundUsdtDetail,
  groupMemberFundByMonth,
  memberFundTypeLabel,
  summarizeMemberFundByCurrency,
  type MemberFundCurrency,
  type MemberFundRecord,
  type MemberFundType,
} from '../../constants/memberDetail'
import {
  formatBillingAmount,
  formatBillingListTime,
  formatBillingMonthLabel,
  formatBillingPlainAmount,
} from '../../constants/billingList'
import {
  DATE_RANGE_SHEET_PRESETS,
  MH5_DATE_RANGE_TODAY,
  matchDateRangeSheetPreset,
} from '../../constants/mh5DateRange'

const filterType = ref<MemberFundType | ''>('')
const filterCurrency = ref<MemberFundCurrency | ''>('')
const filterStart = ref(MH5_DATE_RANGE_TODAY)
const filterEnd = ref(MH5_DATE_RANGE_TODAY)
const dateOpen = ref(false)
const picker = ref<'type' | 'currency' | null>(null)
const detailRecord = ref<MemberFundRecord | null>(null)
const copiedKey = ref<string | null>(null)

const fiatDetail = computed(() =>
  detailRecord.value ? getMemberFundFiatDetail(detailRecord.value) : null,
)
const usdtDetail = computed(() =>
  detailRecord.value ? getMemberFundUsdtDetail(detailRecord.value) : null,
)

const filteredRecords = computed(() =>
  filterMemberFundRecords(MOCK_MEMBER_FUND_RECORDS, {
    type: filterType.value,
    currency: filterCurrency.value,
    start: filterStart.value,
    end: filterEnd.value,
  }),
)

const groupedRecords = computed(() => groupMemberFundByMonth(filteredRecords.value))

/** 币种充提统计整块先不展示，计算保留，后续再打开。 */
const showFundSummary = false

const summaryCards = computed(() =>
  summarizeMemberFundByCurrency(filteredRecords.value, filterCurrency.value),
)
const summaryCarouselRef = ref<HTMLElement | null>(null)
const summarySlideIndex = ref(0)

function formatFundTotal(amount: number) {
  return formatBillingPlainAmount(amount)
}

function formatFundDiff(amount: number) {
  const plain = formatBillingPlainAmount(amount)
  if (amount > 0) return `+${plain}`
  if (amount < 0) return `-${plain}`
  return plain
}

function onSummaryCarouselScroll() {
  const el = summaryCarouselRef.value
  if (!el || !el.clientWidth) return
  summarySlideIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}

function resetSummaryCarousel() {
  summarySlideIndex.value = 0
  nextTick(() => summaryCarouselRef.value?.scrollTo({ left: 0 }))
}

watch(
  () => [filterType.value, filterCurrency.value, filterStart.value, filterEnd.value] as const,
  resetSummaryCarousel,
)

const timeLabel = computed(() => {
  const preset = matchDateRangeSheetPreset(filterStart.value, filterEnd.value, MH5_DATE_RANGE_TODAY)
  if (!preset) return '自定义'
  return DATE_RANGE_SHEET_PRESETS.find((item) => item.key === preset)?.label ?? '自定义'
})

const typeLabel = computed(() => (filterType.value ? memberFundTypeLabel(filterType.value) : '充提'))

const currencyLabel = computed(() => filterCurrency.value || '币种')

const timeDirty = computed(() => timeLabel.value !== '今天')
const typeDirty = computed(() => Boolean(filterType.value))
const currencyDirty = computed(() => Boolean(filterCurrency.value))

const pickerTitle = computed(() => (picker.value === 'type' ? '选择类型' : '选择币种'))

function openTime() {
  picker.value = null
  dateOpen.value = true
}

function confirmDate(start: string, end: string) {
  filterStart.value = start
  filterEnd.value = end
  dateOpen.value = false
}

function selectType(value: MemberFundType | '') {
  filterType.value = value
  picker.value = null
}

function selectCurrency(value: MemberFundCurrency | '') {
  filterCurrency.value = value
  picker.value = null
}

function closeDetail() {
  detailRecord.value = null
  copiedKey.value = null
}

function copyText(key: string, value: string) {
  navigator.clipboard?.writeText(value).catch(() => {})
  copiedKey.value = key
  window.setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = null
  }, 1500)
}
</script>

<template>
  <div class="mh5-member-fund">
    <div class="mh5-bet-order-toolbar mh5-bet-order-toolbar--member mh5-member-fund__toolbar">
      <div class="mh5-bet-order-toolbar__row">
        <div class="mh5-bet-order-toolbar__picks">
          <button
            type="button"
            class="mh5-bet-order-toolbar__pick"
            :class="{ 'mh5-bet-order-toolbar__pick--active': timeDirty }"
            @click="openTime"
          >
            <span class="mh5-bet-order-toolbar__pick-text">{{ timeLabel }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-bet-order-toolbar__pick"
            :class="{ 'mh5-bet-order-toolbar__pick--active': typeDirty }"
            @click="picker = picker === 'type' ? null : 'type'"
          >
            <span class="mh5-bet-order-toolbar__pick-text">{{ typeLabel }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-bet-order-toolbar__pick"
            :class="{ 'mh5-bet-order-toolbar__pick--active': currencyDirty }"
            @click="picker = picker === 'currency' ? null : 'currency'"
          >
            <span class="mh5-bet-order-toolbar__pick-text">{{ currencyLabel }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showFundSummary && summaryCards.length"
      class="mh5-bet-order-summary-carousel mh5-bet-order-summary-carousel--scroll"
      :class="{ 'mh5-bet-order-summary-carousel--single': summaryCards.length < 2 }"
    >
      <div
        ref="summaryCarouselRef"
        class="mh5-bet-order-summary-carousel__track"
        @scroll.passive="onSummaryCarouselScroll"
      >
        <section
          v-for="card in summaryCards"
          :key="card.currency"
          class="mh5-bet-order-summary mh5-bet-order-summary--slide"
        >
          <span class="mh5-bet-order-summary__currency">{{ card.currency }}</span>
          <div class="mh5-bet-order-summary__metrics mh5-member-fund__summary-metrics">
            <div class="mh5-bet-order-summary__item">
              <span class="mh5-bet-order-summary__label">充值额</span>
              <strong>{{ formatFundTotal(card.recharge) }}</strong>
            </div>
            <div class="mh5-bet-order-summary__item">
              <span class="mh5-bet-order-summary__label">提款额</span>
              <strong>{{ formatFundTotal(card.withdraw) }}</strong>
            </div>
            <div class="mh5-bet-order-summary__item">
              <span class="mh5-bet-order-summary__label">充提差</span>
              <strong
                :class="{
                  'mh5-member-fund__summary-diff--plus': card.diff > 0,
                  'mh5-member-fund__summary-diff--minus': card.diff < 0,
                }"
              >
                {{ formatFundDiff(card.diff) }}
              </strong>
            </div>
          </div>
        </section>
      </div>
      <div v-if="summaryCards.length > 1" class="mh5-bet-order-summary-carousel__dots" aria-hidden="true">
        <span
          v-for="(card, idx) in summaryCards"
          :key="`dot-${card.currency}`"
          class="mh5-bet-order-summary-carousel__dot"
          :class="{ 'mh5-bet-order-summary-carousel__dot--active': summarySlideIndex === idx }"
        />
      </div>
    </div>

    <div class="mh5-billing-main mh5-member-fund__list">
      <p v-if="!groupedRecords.length" class="mh5-billing-empty">暂无充提记录</p>
      <section v-for="[month, rows] in groupedRecords" :key="month" class="mh5-billing-group">
        <div class="mh5-billing-group__head">
          <span class="mh5-billing-group__month">{{ formatBillingMonthLabel(month) }}</span>
        </div>
        <div
          v-for="row in rows"
          :key="row.id"
          class="mh5-billing-item mh5-member-fund__item"
        >
          <span
            class="mh5-member-fund__icon"
            :class="row.type === 'recharge' ? 'mh5-member-fund__icon--in' : 'mh5-member-fund__icon--out'"
            aria-hidden="true"
          >
            <svg v-if="row.type === 'recharge'" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3.5v11" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
              <path d="M4.5 10.2 9 14.5l4.5-4.3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 14.5v-11" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
              <path d="M4.5 7.8 9 3.5l4.5 4.3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="mh5-billing-item__body">
            <span class="mh5-billing-item__title mh5-member-fund__title">{{ memberFundTypeLabel(row.type) }}</span>
            <span class="mh5-billing-item__time mh5-member-fund__time">{{ formatBillingListTime(row.createdAt) }}</span>
          </span>
          <span class="mh5-billing-item__amount-wrap">
            <span
              class="mh5-billing-item__amount"
              :class="row.amount >= 0 ? 'mh5-billing-item__amount--plus' : 'mh5-billing-item__amount--minus'"
            >
              <Mh5CurrencyIcon :code="row.currency" :size="16" />
              <span>{{ formatBillingAmount(row.amount) }}</span>
            </span>
            <span class="mh5-billing-item__currency">{{ row.currency }}</span>
          </span>
        </div>
      </section>
    </div>

    <Mh5DateRangeSheet
      unlimited
      :open="dateOpen"
      :start="filterStart"
      :end="filterEnd"
      :today="MH5_DATE_RANGE_TODAY"
      @close="dateOpen = false"
      @confirm="confirmDate"
    />

    <Teleport to=".mh5-member-detail-page">
      <Transition name="mh5-member-fund-sheet">
        <div v-if="picker" class="mh5-member-fund-mask" @click.self="picker = null">
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet" role="dialog" aria-modal="true" :aria-label="pickerTitle">
            <h2 class="mh5-xcoin-sheet__title">{{ pickerTitle }}</h2>
            <template v-if="picker === 'type'">
              <button
                type="button"
                class="mh5-xcoin-sheet__option"
                :class="{ 'mh5-xcoin-sheet__option--active': !filterType }"
                @click="selectType('')"
              >
                全部
              </button>
              <button
                v-for="opt in MEMBER_FUND_TYPE_OPTIONS"
                :key="opt.value"
                type="button"
                class="mh5-xcoin-sheet__option"
                :class="{ 'mh5-xcoin-sheet__option--active': filterType === opt.value }"
                @click="selectType(opt.value)"
              >
                {{ opt.label }}
              </button>
            </template>
            <template v-else>
              <button
                v-for="opt in MEMBER_FUND_CURRENCY_OPTIONS"
                :key="opt.value || 'all'"
                type="button"
                class="mh5-xcoin-sheet__option mh5-xcoin-sheet__option--currency"
                :class="{ 'mh5-xcoin-sheet__option--active': filterCurrency === opt.value }"
                @click="selectCurrency(opt.value)"
              >
                <Mh5CurrencyIcon v-if="opt.value" :code="opt.value" :size="20" />
                {{ opt.value ? opt.label : '全部币种' }}
              </button>
            </template>
          </div>
        </div>
      </Transition>

      <div
        v-if="detailRecord"
        class="mh5-member-fund-detail"
        :class="{
          'mh5-member-fund-detail--fiat': fiatDetail,
          'mh5-member-fund-detail--chain': usdtDetail,
        }"
      >
        <header class="mh5-member-fund-detail__nav">
          <button type="button" class="mh5-member-fund-detail__back" aria-label="返回" @click="closeDetail">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <h2 class="mh5-member-fund-detail__title">{{ memberFundTypeLabel(detailRecord.type) }}</h2>
        </header>
        <div v-if="fiatDetail" class="mh5-member-fund-detail__body">
          <div class="mh5-member-fund-detail__hero">
            <span class="mh5-member-fund-detail__check" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M7 14.5 12 19.5 21 9.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <p class="mh5-member-fund-detail__status">交易完成</p>
            <p class="mh5-member-fund-detail__hero-amount">{{ fiatDetail.heroAmount }}</p>
          </div>
          <section class="mh5-billing-detail-card">
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">总额</span>
              <span class="mh5-billing-detail-row__value mh5-billing-detail-row__value--accent">{{ fiatDetail.totalText }}</span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">单价</span>
              <span class="mh5-billing-detail-row__value">{{ fiatDetail.unitPriceText }}</span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">数量</span>
              <span class="mh5-billing-detail-row__value">{{ fiatDetail.quantityText }}</span>
            </div>
          </section>
          <section class="mh5-billing-detail-card">
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">交易方式</span>
              <span class="mh5-billing-detail-row__value">{{ fiatDetail.method }}</span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">账单号</span>
              <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
                <span class="mh5-billing-detail-row__order">{{ fiatDetail.billNo }}</span>
                <button
                  type="button"
                  class="mh5-billing-detail-copy-icon"
                  :aria-label="copiedKey === 'bill' ? '已复制' : '复制账单号'"
                  @click="copyText('bill', fiatDetail.billNo)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                    <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">创建时间</span>
              <span class="mh5-billing-detail-row__value">{{ fiatDetail.createdAt }}</span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">付款时间</span>
              <span class="mh5-billing-detail-row__value">{{ fiatDetail.paidAt }}</span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">完成时间</span>
              <span class="mh5-billing-detail-row__value">{{ fiatDetail.completedAt }}</span>
            </div>
          </section>
          <p v-if="copiedKey === 'bill'" class="mh5-member-fund-detail__toast" role="status">已复制</p>
        </div>
        <div v-else-if="usdtDetail" class="mh5-member-fund-detail__body mh5-member-fund-chain">
          <div class="mh5-member-fund-chain__hero">
            <span class="mh5-member-fund-detail__check mh5-member-fund-detail__check--chain" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <path d="M7 14.5 12 19.5 21 9.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <p class="mh5-member-fund-chain__status">成功</p>
            <p class="mh5-member-fund-chain__time">{{ usdtDetail.time }}</p>
          </div>

          <p class="mh5-member-fund-chain__section">概要</p>
          <section class="mh5-member-fund-chain__card">
            <div class="mh5-member-fund-chain__party">
              <span class="mh5-member-fund-chain__avatar mh5-member-fund-chain__avatar--from" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="2.4" fill="#fff" />
                  <path d="M3.2 13.2c.8-2.2 2.5-3.3 4.8-3.3s4 1.1 4.8 3.3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" />
                </svg>
              </span>
              <span class="mh5-member-fund-chain__addr">{{ usdtDetail.fromShort }}</span>
            </div>
            <p class="mh5-member-fund-chain__send">
              <span>{{ usdtDetail.actionLabel }}</span>
              <strong>{{ usdtDetail.quantityText }}</strong>
            </p>
            <div class="mh5-member-fund-chain__to">
              <span class="mh5-member-fund-chain__to-label">到</span>
              <span class="mh5-member-fund-chain__pill">
                <span class="mh5-member-fund-chain__avatar mh5-member-fund-chain__avatar--to" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5.5" r="2.4" fill="#fff" />
                    <path d="M3.2 13.2c.8-2.2 2.5-3.3 4.8-3.3s4 1.1 4.8 3.3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" />
                  </svg>
                </span>
                <span>{{ usdtDetail.toShort }}</span>
              </span>
            </div>
          </section>

          <p class="mh5-member-fund-chain__section">币种转移</p>
          <section class="mh5-member-fund-chain__card">
            <div class="mh5-member-fund-chain__move">
              <span class="mh5-member-fund-chain__addr">{{ usdtDetail.fromShort }}</span>
              <span class="mh5-member-fund-chain__coin">
                <Mh5CurrencyIcon code="USDT" :size="18" />
                <span>USDT</span>
                <em class="mh5-member-fund-chain__amt mh5-member-fund-chain__amt--out">{{ usdtDetail.fromAmount }}</em>
              </span>
            </div>
            <div class="mh5-member-fund-chain__move">
              <span class="mh5-member-fund-chain__addr">{{ usdtDetail.toShort }}</span>
              <span class="mh5-member-fund-chain__coin">
                <Mh5CurrencyIcon code="USDT" :size="18" />
                <span>USDT</span>
                <em class="mh5-member-fund-chain__amt mh5-member-fund-chain__amt--in">{{ usdtDetail.toAmount }}</em>
              </span>
            </div>
          </section>

          <p class="mh5-member-fund-chain__section">交易详情</p>
          <section class="mh5-billing-detail-card mh5-member-fund-chain__detail">
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">网络</span>
              <span class="mh5-billing-detail-row__value mh5-member-fund-chain__network">
                <span class="mh5-member-fund-chain__tron" aria-hidden="true">T</span>
                {{ usdtDetail.network }}
              </span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">发起人</span>
              <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
                <span class="mh5-billing-detail-row__order">{{ usdtDetail.fromAddress }}</span>
                <button
                  type="button"
                  class="mh5-billing-detail-copy-icon"
                  :aria-label="copiedKey === 'from' ? '已复制' : '复制发起人'"
                  @click="copyText('from', usdtDetail.fromAddress)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                    <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">到</span>
              <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
                <span class="mh5-billing-detail-row__order">{{ usdtDetail.toAddress }}</span>
                <button
                  type="button"
                  class="mh5-billing-detail-copy-icon"
                  :aria-label="copiedKey === 'to' ? '已复制' : '复制收款地址'"
                  @click="copyText('to', usdtDetail.toAddress)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                    <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">矿工费</span>
              <span class="mh5-billing-detail-row__value">{{ usdtDetail.feeText }}</span>
            </div>
            <div class="mh5-billing-detail-row">
              <span class="mh5-billing-detail-row__label">交易号</span>
              <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
                <span class="mh5-billing-detail-row__order mh5-member-fund-chain__hash">{{ usdtDetail.txHash }}</span>
                <button
                  type="button"
                  class="mh5-billing-detail-copy-icon"
                  :aria-label="copiedKey === 'tx' ? '已复制' : '复制交易号'"
                  @click="copyText('tx', usdtDetail.txHash)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                    <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
          <p v-if="copiedKey && copiedKey !== 'bill'" class="mh5-member-fund-detail__toast" role="status">已复制</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
