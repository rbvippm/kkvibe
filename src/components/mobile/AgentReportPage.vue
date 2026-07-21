<script setup lang="ts">
import { computed, ref } from 'vue'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import {
  AGENT_WALLET_CURRENCY_OPTIONS,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  agentAppCurrency,
  isAgentCreditCurrency,
  setAgentAppCurrency,
} from '../../constants/agentAppCurrency'
import {
  AGENT_SHARE_INCOME_FORMULA,
  getAgentShareIncome,
  getAgentShareIncomeRows,
} from '../../constants/agentDetailProfit'
import {
  REPORT_CATEGORY_TABS,
  REPORT_DETAIL_ROWS,
  REPORT_RANGE_PRESETS,
  REPORT_VENDOR_PILLS,
  getReportSummaryCards,
  reportCategoryTitle,
  reportDateRangeText,
  type ReportCategoryKey,
  type ReportRangePreset,
  type ReportVendorKey,
} from '../../constants/agentReport'
import { AGENT_REPORT_CURRENCY_SUMMARY_SPEC } from '../../constants/agentReportSpec'
import '../../styles/mobile-app-shell.css'

const preset = ref<ReportRangePreset>('today')
const category = ref<ReportCategoryKey>('all')
const vendor = ref<ReportVendorKey>('all')
const currencyPickerOpen = ref(false)
const profitFormulaTipOpen = ref(false)
const currency = agentAppCurrency

const dateRangeText = computed(() => reportDateRangeText(preset.value))
const sectionTitle = computed(() => reportCategoryTitle(category.value, vendor.value))
const summaryCards = computed(() => getReportSummaryCards(isAgentCreditCurrency(currency.value)))
const agentShareIncome = computed(() => getAgentShareIncome(currency.value))
const agentShareIncomeRows = computed(() => getAgentShareIncomeRows(currency.value))
const totalProfit = computed(() => agentShareIncomeRows.value[0]?.value ?? '+0.00')

function pickPreset(v: ReportRangePreset) {
  preset.value = v
}

function pickCurrency(value: AgentWalletCurrency) {
  setAgentAppCurrency(value)
  currencyPickerOpen.value = false
}

function toggleProfitFormulaTip() {
  profitFormulaTipOpen.value = !profitFormulaTipOpen.value
}

function closeProfitFormulaTip() {
  profitFormulaTipOpen.value = false
}
</script>

<template>
  <div class="mh5-agent-report-page">
    <header class="mh5-agent-report-header">
      <h1 class="mh5-agent-report-header__title">我的报表</h1>
      <div class="mh5-agent-report-header__actions">
        <Mh5SpecAnnot :spec="AGENT_REPORT_CURRENCY_SUMMARY_SPEC" placement="bottom" />
        <button
          type="button"
          class="mh5-agent-detail-currency"
          aria-label="切换币种"
          @click="currencyPickerOpen = true"
        >
          <span>{{ currency }}</span>
          <span class="mh5-agent-detail-currency__chevron">▾</span>
        </button>
      </div>
    </header>

    <main class="mh5-agent-report-main" @click="closeProfitFormulaTip">
      <section class="mh5-agent-report-period">
        <p class="mh5-agent-report-period__label">时间段</p>
        <div class="mh5-agent-report-period__row">
          <div class="mh5-agent-report-period__input">{{ dateRangeText }}</div>
          <button type="button" class="mh5-agent-report-period__calendar" aria-label="选择日期">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </button>
        </div>
        <div class="mh5-agent-report-presets">
          <button
            v-for="item in REPORT_RANGE_PRESETS"
            :key="item.key"
            type="button"
            class="mh5-agent-report-preset"
            :class="{ 'mh5-agent-report-preset--active': preset === item.key }"
            @click="pickPreset(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <section class="mh5-agent-detail-wallet mh5-agent-detail-profit-summary mh5-agent-report-profit">
        <div class="mh5-agent-detail-wallet__row mh5-agent-detail-profit-summary__total">
          <span class="mh5-agent-detail-profit-summary__label-wrap">
            <span class="mh5-agent-detail-wallet__label">实占佣金</span>
            <button
              type="button"
              class="mh5-agent-detail-profit-summary__tip-btn"
              aria-label="查看实占佣金计算公式"
              :aria-expanded="profitFormulaTipOpen"
              @click.stop="toggleProfitFormulaTip"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2" />
                <rect x="7.25" y="4.2" width="1.5" height="5.2" rx="0.75" fill="currentColor" />
                <circle cx="8" cy="11.6" r="1" fill="currentColor" />
              </svg>
            </button>
            <span
              v-if="profitFormulaTipOpen"
              class="mh5-agent-detail-profit-summary__tip-bubble"
              role="tooltip"
            >
              {{ AGENT_SHARE_INCOME_FORMULA }}
            </span>
          </span>
          <span
            class="mh5-agent-detail-wallet__value"
            :class="{
              'mh5-agent-detail-wallet__value--positive': agentShareIncome.tone === 'positive',
              'mh5-agent-detail-wallet__value--negative': agentShareIncome.tone === 'negative',
            }"
          >
            {{ agentShareIncome.value }}
          </span>
        </div>
        <div
          v-for="row in agentShareIncomeRows"
          :key="row.label"
          class="mh5-agent-detail-wallet__row"
        >
          <span class="mh5-agent-detail-wallet__label">{{ row.label }}</span>
          <span
            class="mh5-agent-detail-wallet__value"
            :class="{
              'mh5-agent-detail-wallet__value--positive': row.tone === 'positive',
              'mh5-agent-detail-wallet__value--negative': row.tone === 'negative',
            }"
          >
            {{ row.value }}
          </span>
        </div>
      </section>

      <section class="mh5-agent-report-summary">
        <div
          v-for="card in summaryCards"
          :key="card.key"
          class="mh5-agent-report-summary-card"
        >
          <p class="mh5-agent-report-summary-card__label">{{ card.label }}</p>
          <p class="mh5-agent-report-summary-card__value">{{ card.value }}</p>
        </div>
      </section>

      <div class="mh5-agent-report-categories">
        <div class="mh5-agent-report-cat-tabs">
          <button
            v-for="tab in REPORT_CATEGORY_TABS"
            :key="tab.key"
            type="button"
            class="mh5-agent-report-cat-tab"
            :class="{ 'mh5-agent-report-cat-tab--active': category === tab.key }"
            @click="category = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="mh5-agent-report-vendors">
          <button
            v-for="pill in REPORT_VENDOR_PILLS"
            :key="pill.key"
            type="button"
            class="mh5-agent-report-vendor"
            :class="{ 'mh5-agent-report-vendor--active': vendor === pill.key }"
            @click="vendor = pill.key"
          >
            {{ pill.label }}
          </button>
        </div>
      </div>

      <section class="mh5-agent-report-detail">
        <div class="mh5-agent-report-detail__head">
          <span class="mh5-agent-report-detail__title">{{ sectionTitle }}</span>
          <span class="mh5-agent-report-detail__profit">
            游戏盈亏
            <em>{{ totalProfit }}</em>
          </span>
        </div>
        <div
          v-for="row in REPORT_DETAIL_ROWS"
          :key="row.key"
          class="mh5-agent-report-detail__row"
        >
          <span class="mh5-agent-report-detail__row-label">{{ row.label }}</span>
          <span class="mh5-agent-report-detail__row-value">{{ row.value }}</span>
        </div>
      </section>
    </main>

    <Teleport to="body">
      <Transition name="mh5-agent-report-sheet">
        <div
          v-if="currencyPickerOpen"
          class="mh5-agent-overlay-mask"
          @click.self="currencyPickerOpen = false"
        >
          <div class="mh5-xcoin-sheet mh5-agent-overlay-sheet">
            <h2 class="mh5-xcoin-sheet__title">选择币种</h2>
            <button
              v-for="opt in AGENT_WALLET_CURRENCY_OPTIONS"
              :key="opt"
              type="button"
              class="mh5-xcoin-sheet__option"
              :class="{ 'mh5-xcoin-sheet__option--active': currency === opt }"
              @click="pickCurrency(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mh5-agent-report-sheet-enter-active,
.mh5-agent-report-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-agent-report-sheet-enter-active .mh5-xcoin-sheet,
.mh5-agent-report-sheet-enter-active .mh5-agent-overlay-sheet,
.mh5-agent-report-sheet-leave-active .mh5-xcoin-sheet,
.mh5-agent-report-sheet-leave-active .mh5-agent-overlay-sheet {
  transition: transform 0.25s ease;
}

.mh5-agent-report-sheet-enter-from,
.mh5-agent-report-sheet-leave-to {
  opacity: 0;
}

.mh5-agent-report-sheet-enter-from .mh5-xcoin-sheet,
.mh5-agent-report-sheet-enter-from .mh5-agent-overlay-sheet,
.mh5-agent-report-sheet-leave-to .mh5-xcoin-sheet,
.mh5-agent-report-sheet-leave-to .mh5-agent-overlay-sheet {
  transform: translateY(100%);
}
</style>
