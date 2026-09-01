<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { formatAgentCurrencyLabel } from '../../constants/agentCurrencyIcons'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'
import Mh5CurrencyPickerSheet from './Mh5CurrencyPickerSheet.vue'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import {
  getAgentCashCurrencyOptions,
  isAgentCreditCurrency,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  agentAppCurrency,
  setAgentAppCurrencyByUser,
  fallbackAgentCashCurrency,
} from '../../constants/agentAppCurrency'
import {
  COMMISSION_NEGATIVE_TIP,
  COMMISSION_NET_WIN_TIP,
  COMMISSION_STATUS_META,
  COMMISSION_TOTAL_TIP,
  MOCK_COMMISSION_MONTH_BILLS,
  commissionHeroTitle,
  commissionTone,
  filterCommissionListBills,
  findCommissionBill,
  formatCommissionAmount,
  formatCommissionMonthLabel,
  getCommissionListMonthOptions,
  getCommissionListUpdatedAt,
  getCommissionMonthAmount,
  getCommissionNetWin,
  getCommissionTotal,
  getCommissionTotalCostTip,
  getDefaultCommissionMonth,
  sumPaidCommissionTotal,
  type CommissionMonthBill,
} from '../../constants/agentCommissionReport'
import { AGENT_COMMISSION_REPORT_SPEC } from '../../constants/agentCommissionReportSpec'
import '../../styles/mobile-app-shell.css'

type ViewMode = 'list' | 'detail'
type TipKey = 'cost' | 'negative' | 'netWin' | 'total' | null
type SheetKind = 'month' | 'currency' | null

const viewMode = ref<ViewMode>('list')
const listMonthFilter = ref<string | 'all'>('all')
const selectedMonth = ref(getDefaultCommissionMonth())
const sheetKind = ref<SheetKind>(null)
const tipKey = ref<TipKey>(null)
const currency = agentAppCurrency

const listMonthOptions = computed(() => getCommissionListMonthOptions())
const listMonthShort = computed(() => {
  const hit = listMonthOptions.value.find((item) => item.key === listMonthFilter.value)
  return hit?.short ?? '全部'
})
const filteredListBills = computed(() =>
  filterCommissionListBills(MOCK_COMMISSION_MONTH_BILLS, listMonthFilter.value),
)
const paidTotal = computed(() => sumPaidCommissionTotal(filteredListBills.value))
const listUpdatedAt = computed(() => getCommissionListUpdatedAt(listMonthFilter.value))
const currentBill = computed(() => findCommissionBill(selectedMonth.value))
const heroTitle = computed(() => commissionHeroTitle(selectedMonth.value))
const totalCostTip = computed(() => getCommissionTotalCostTip())

watch(selectedMonth, () => {
  tipKey.value = null
})

/** 返佣无信用额度币种，若当前为信用口径则回落到语言默认现金币种 */
function ensureCashCurrency() {
  if (isAgentCreditCurrency(currency.value)) {
    fallbackAgentCashCurrency()
  }
}

onMounted(ensureCashCurrency)
watch(currency, ensureCashCurrency)

function openSheet(kind: Exclude<SheetKind, null>) {
  tipKey.value = null
  sheetKind.value = kind
}

function closeSheet() {
  sheetKind.value = null
}

function pickListMonth(month: string | 'all') {
  listMonthFilter.value = month
  closeSheet()
}

function pickCurrency(value: string) {
  setAgentAppCurrencyByUser(value as AgentWalletCurrency)
  closeSheet()
}

function openDetail(bill: CommissionMonthBill) {
  selectedMonth.value = bill.month
  tipKey.value = null
  viewMode.value = 'detail'
}

function backToList() {
  tipKey.value = null
  viewMode.value = 'list'
}

function toggleTip(key: Exclude<TipKey, null>) {
  tipKey.value = tipKey.value === key ? null : key
}

function closeTip() {
  tipKey.value = null
}

function toneClass(value: number) {
  const tone = commissionTone(value)
  if (tone === 'positive') return 'mh5-agent-commission-v--pos'
  if (tone === 'negative') return 'mh5-agent-commission-v--neg'
  return ''
}

function statusClass(status: keyof typeof COMMISSION_STATUS_META) {
  return `mh5-agent-commission-status--${COMMISSION_STATUS_META[status].tone}`
}

function statusBadgeClass(status: keyof typeof COMMISSION_STATUS_META) {
  return `mh5-agent-commission-badge--${COMMISSION_STATUS_META[status].tone}`
}
</script>

<template>
  <div class="mh5-agent-report-page mh5-agent-commission-page">
    <!-- 列表 -->
    <template v-if="viewMode === 'list'">
      <header class="mh5-agent-report-header">
        <h1 class="mh5-agent-report-header__title">{{ $t('我的报表') }}</h1>
        <div class="mh5-agent-report-header__actions">
          <Mh5SpecAnnot :spec="AGENT_COMMISSION_REPORT_SPEC" placement="bottom" />
        </div>
      </header>

      <main class="mh5-agent-report-main mh5-agent-commission-main">
        <section class="mh5-agent-commission-list-filters">
          <button
            type="button"
            class="mh5-agent-commission-list-select"
            @click="openSheet('month')"
          >
            <span>{{ listMonthShort }}</span>
            <svg
              class="mh5-agent-commission-list-select__icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-agent-commission-list-select"
            @click="openSheet('currency')"
          >
            <span class="mh5-agent-commission-list-select__main">
              <Mh5CurrencyIcon :code="currency" :size="20" />
              <span>{{ $t(formatAgentCurrencyLabel(currency)) }}</span>
            </span>
            <svg
              class="mh5-agent-commission-list-select__icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </section>

        <section class="mh5-agent-commission-list-summary">
          <p class="mh5-agent-commission-list-summary__label">{{ $t('累计发放总佣金') }}</p>
          <p class="mh5-agent-commission-list-summary__value">
            {{ formatCommissionAmount(paidTotal) }}
            <em>{{ currency }}</em>
          </p>
          <p class="mh5-agent-commission-list-summary__time">{{ listUpdatedAt }}</p>
        </section>

        <section v-if="filteredListBills.length" class="mh5-agent-commission-list">
          <button
            v-for="bill in filteredListBills"
            :key="bill.month"
            type="button"
            class="mh5-agent-commission-list-card"
            @click="openDetail(bill)"
          >
            <div class="mh5-agent-commission-list-card__head">
              <span class="mh5-agent-commission-list-card__month">
                {{ formatCommissionMonthLabel(bill.month) }}
              </span>
              <span
                class="mh5-agent-commission-badge"
                :class="statusBadgeClass(bill.status)"
              >
                {{ COMMISSION_STATUS_META[bill.status].label }}
              </span>
            </div>
            <p class="mh5-agent-commission-list-card__total-label">
              {{
                bill.status === 'pending'
                  ? '预计佣金'
                  : `总佣金 (${currency})`
              }}
            </p>
            <p class="mh5-agent-commission-list-card__total">
              {{ formatCommissionAmount(getCommissionTotal(bill)) }}
            </p>
            <div class="mh5-agent-commission-list-card__meta">
              <span>活跃人数 {{ bill.activeUsers }}</span>
              <span>{{ $t('游戏输赢') }}<em :class="toneClass(bill.totalPnl)">
                  {{ formatCommissionAmount(bill.totalPnl) }}
                </em>
              </span>
            </div>
          </button>
        </section>

        <section v-else class="mh5-agent-commission-empty" aria-live="polite">
          <div class="mh5-agent-commission-empty__icon" aria-hidden="true" />
          <p class="mh5-agent-commission-empty__title">{{ $t('暂无佣金记录') }}</p>
          <p class="mh5-agent-commission-empty__desc">{{ $t('继续加油哦') }}</p>
        </section>
      </main>
    </template>

    <!-- 详情 -->
    <template v-else>
      <header class="mh5-agent-report-header">
        <button
          type="button"
          class="mh5-agent-commission-back"
          aria-label="返回列表"
          @click="backToList"
        >
          ‹
        </button>
        <h1 class="mh5-agent-report-header__title">佣金详情</h1>
        <div class="mh5-agent-report-header__actions">
          <Mh5SpecAnnot :spec="AGENT_COMMISSION_REPORT_SPEC" placement="bottom" />
        </div>
      </header>

      <main class="mh5-agent-report-main mh5-agent-commission-main" @click="closeTip">
        <template v-if="currentBill">
          <section class="mh5-agent-commission-card mh5-agent-commission-hero">
            <div class="mh5-agent-commission-hero__head">
              <span class="mh5-agent-commission-hero__title">{{ heroTitle }}</span>
              <span
                class="mh5-agent-commission-status"
                :class="statusClass(currentBill.status)"
              >
                {{ COMMISSION_STATUS_META[currentBill.status].label }}
              </span>
            </div>
            <div class="mh5-agent-commission-hero__body">
              <p class="mh5-agent-commission-hero__unit">
                <span class="mh5-agent-commission-tip-wrap mh5-agent-commission-tip-wrap--center">
                  总佣金({{ currency }})
                  <button
                    type="button"
                    class="mh5-agent-commission-q"
                    aria-label="查看总佣金说明"
                    :aria-expanded="tipKey === 'total'"
                    @click.stop="toggleTip('total')"
                  >
                    ?
                  </button>
                  <span
                    v-if="tipKey === 'total'"
                    class="mh5-agent-commission-tip-bubble mh5-agent-commission-tip-bubble--center"
                    role="tooltip"
                  >
                    {{ COMMISSION_TOTAL_TIP }}
                  </span>
                </span>
              </p>
              <p class="mh5-agent-commission-hero__amount">
                {{ formatCommissionAmount(getCommissionTotal(currentBill)) }}
              </p>
            </div>
          </section>

          <section class="mh5-agent-commission-card">
            <h2 class="mh5-agent-commission-card__title">当月达到</h2>
            <div class="mh5-agent-commission-cols mh5-agent-commission-cols--3">
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">活跃人数</p>
                <p class="mh5-agent-commission-cell__value">{{ currentBill.activeUsers }}</p>
              </div>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">游戏输赢</p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="toneClass(currentBill.totalPnl)"
                >
                  {{ formatCommissionAmount(currentBill.totalPnl, { signed: true }) }}
                </p>
              </div>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">佣金比例</p>
                <p class="mh5-agent-commission-cell__value">{{ currentBill.commissionRate }}</p>
              </div>
            </div>
          </section>

          <section class="mh5-agent-commission-card">
            <h2 class="mh5-agent-commission-card__title">成本与扣除</h2>
            <div class="mh5-agent-commission-cols mh5-agent-commission-cols--3">
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">场馆费(月)</p>
                <p class="mh5-agent-commission-cell__value">
                  {{ formatCommissionAmount(currentBill.venueFee) }}
                </p>
              </div>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">
                  <span class="mh5-agent-commission-tip-wrap">
                    总成本
                    <button
                      type="button"
                      class="mh5-agent-commission-q"
                      aria-label="查看总成本说明"
                      :aria-expanded="tipKey === 'cost'"
                      @click.stop="toggleTip('cost')"
                    >
                      ?
                    </button>
                    <span
                      v-if="tipKey === 'cost'"
                      class="mh5-agent-commission-tip-bubble"
                      role="tooltip"
                    >
                      {{ totalCostTip }}
                    </span>
                  </span>
                </p>
                <p class="mh5-agent-commission-cell__value">
                  {{ formatCommissionAmount(currentBill.totalCost) }}
                </p>
              </div>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">
                  <span class="mh5-agent-commission-tip-wrap">
                    负盈利累计
                    <button
                      type="button"
                      class="mh5-agent-commission-q"
                      aria-label="查看负盈利累计说明"
                      :aria-expanded="tipKey === 'negative'"
                      @click.stop="toggleTip('negative')"
                    >
                      ?
                    </button>
                    <span
                      v-if="tipKey === 'negative'"
                      class="mh5-agent-commission-tip-bubble mh5-agent-commission-tip-bubble--end"
                      role="tooltip"
                    >
                      {{ COMMISSION_NEGATIVE_TIP }}
                    </span>
                  </span>
                </p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="toneClass(currentBill.negativeAccum)"
                >
                  {{
                    formatCommissionAmount(currentBill.negativeAccum, {
                      signed: currentBill.negativeAccum < 0,
                    })
                  }}
                </p>
              </div>
            </div>
          </section>

          <section class="mh5-agent-commission-card">
            <h2 class="mh5-agent-commission-card__title">佣金计算</h2>
            <div class="mh5-agent-commission-formula" aria-label="净输赢减去负盈利累计再乘佣金比例等于佣金">
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">
                  <span class="mh5-agent-commission-tip-wrap">
                    净输赢
                    <button
                      type="button"
                      class="mh5-agent-commission-q"
                      aria-label="查看净输赢说明"
                      :aria-expanded="tipKey === 'netWin'"
                      @click.stop="toggleTip('netWin')"
                    >
                      ?
                    </button>
                    <span
                      v-if="tipKey === 'netWin'"
                      class="mh5-agent-commission-tip-bubble"
                      role="tooltip"
                    >
                      {{ COMMISSION_NET_WIN_TIP }}
                    </span>
                  </span>
                </p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="toneClass(getCommissionNetWin(currentBill))"
                >
                  {{ formatCommissionAmount(getCommissionNetWin(currentBill)) }}
                </p>
              </div>
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">−</span>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">负盈利累计</p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="toneClass(currentBill.negativeAccum === 0 ? 0 : -1)"
                >
                  {{ formatCommissionAmount(Math.abs(currentBill.negativeAccum)) }}
                </p>
              </div>
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">×</span>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">佣金比例</p>
                <p class="mh5-agent-commission-cell__value">{{ currentBill.commissionRate }}</p>
              </div>
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">=</span>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">佣金</p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="toneClass(getCommissionMonthAmount(currentBill))"
                >
                  {{ formatCommissionAmount(getCommissionMonthAmount(currentBill)) }}
                </p>
              </div>
            </div>
          </section>
        </template>

        <section v-else class="mh5-agent-commission-empty" aria-live="polite">
          <div class="mh5-agent-commission-empty__icon" aria-hidden="true" />
          <p class="mh5-agent-commission-empty__title">暂无佣金记录</p>
          <p class="mh5-agent-commission-empty__desc">继续加油哦</p>
        </section>
      </main>
    </template>

    <Mh5CurrencyPickerSheet
      :open="sheetKind === 'currency'"
      :currency="currency"
      :options="getAgentCashCurrencyOptions()"
      @close="closeSheet"
      @pick="pickCurrency"
    />

    <Teleport to="body">
      <Transition name="mh5-agent-commission-sheet">
        <div
          v-if="sheetKind === 'month'"
          class="mh5-agent-overlay-mask"
          @click.self="closeSheet"
        >
          <div class="mh5-xcoin-sheet mh5-agent-overlay-sheet">
            <h2 class="mh5-xcoin-sheet__title">选择月份</h2>
            <button
              v-for="opt in listMonthOptions"
              :key="opt.key"
              type="button"
              class="mh5-xcoin-sheet__option"
              :class="{ 'mh5-xcoin-sheet__option--active': listMonthFilter === opt.key }"
              @click="pickListMonth(opt.key)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mh5-agent-commission-sheet-enter-active,
.mh5-agent-commission-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-agent-commission-sheet-enter-active .mh5-xcoin-sheet,
.mh5-agent-commission-sheet-enter-active .mh5-agent-overlay-sheet,
.mh5-agent-commission-sheet-leave-active .mh5-xcoin-sheet,
.mh5-agent-commission-sheet-leave-active .mh5-agent-overlay-sheet {
  transition: transform 0.25s ease;
}

.mh5-agent-commission-sheet-enter-from,
.mh5-agent-commission-sheet-leave-to {
  opacity: 0;
}

.mh5-agent-commission-sheet-enter-from .mh5-xcoin-sheet,
.mh5-agent-commission-sheet-enter-from .mh5-agent-overlay-sheet,
.mh5-agent-commission-sheet-leave-to .mh5-xcoin-sheet,
.mh5-agent-commission-sheet-leave-to .mh5-agent-overlay-sheet {
  transform: translateY(100%);
}
</style>
