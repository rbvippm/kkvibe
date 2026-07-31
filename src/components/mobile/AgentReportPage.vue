<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import {
  AGENT_WALLET_CURRENCY_OPTIONS,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  agentAppCurrency,
  isAgentCreditCurrency,
  setAgentAppCurrency,
} from '../../constants/agentAppCurrency'
import { AGENT_GAME_PROFIT_FORMULA } from '../../constants/agentDetailProfit'
import { rebateGameNetProfitFormula } from '../../constants/agentMyProfit'
import {
  REPORT_CATEGORY_TABS,
  REPORT_RANGE_PRESETS,
  REPORT_VENDOR_PILLS,
  getRebateReportDetail,
  getReportDetail,
  getReportSummaryCards,
  reportCategoryTitle,
  reportDateRangeText,
  reportDetailValueClass,
  reportNetProfitClass,
  type ReportCategoryKey,
  type ReportRangePreset,
  type ReportVendorKey,
} from '../../constants/agentReport'
import { AGENT_REPORT_GAME_STATS_SPEC } from '../../constants/agentReportSpec'
import { AGENT_MY_PROFIT_SPEC } from '../../constants/agentMyProfitSpec'
import MobileAgentMyProfitView from '../../views/mobile/MobileAgentMyProfitView.vue'
import '../../styles/mobile-app-shell.css'

export type AgentReportPageTab = 'finance' | 'game'

const route = useRoute()
const router = useRouter()
const { isRebateAgent, withAgentQuery } = useAgentIdentity()

function parseReportTab(raw: unknown): AgentReportPageTab {
  return raw === 'game' ? 'game' : 'finance'
}

const pageTab = ref<AgentReportPageTab>(parseReportTab(route.query.reportTab))

watch(
  () => route.query.reportTab,
  (tab) => {
    pageTab.value = parseReportTab(tab)
  },
)

const pageTabs = computed(() => [
  { key: 'finance' as const, label: isRebateAgent.value ? '佣金' : '盈亏' },
  { key: 'game' as const, label: '游戏' },
])

const financeAnnotSpec = AGENT_MY_PROFIT_SPEC
const gameAnnotSpec = AGENT_REPORT_GAME_STATS_SPEC

const preset = ref<ReportRangePreset>('today')
const category = ref<ReportCategoryKey>('all')
const vendor = ref<ReportVendorKey>('all')
const currencyPickerOpen = ref(false)
const gameProfitFormulaTipOpen = ref(false)
const currency = agentAppCurrency

const dateRangeText = computed(() => reportDateRangeText(preset.value))
/** 占成对齐代理详情：标题带「（实占）」；返佣不加 */
const sectionTitle = computed(() => {
  const base = reportCategoryTitle(category.value, vendor.value)
  return isRebateAgent.value ? base : `${base}（实占）`
})
const summaryCards = computed(() => getReportSummaryCards(isAgentCreditCurrency(currency.value)))
const gameProfitFormula = computed(() =>
  isRebateAgent.value
    ? rebateGameNetProfitFormula()
    : AGENT_GAME_PROFIT_FORMULA,
)
const reportDetail = computed(() =>
  isRebateAgent.value
    ? getRebateReportDetail(category.value, vendor.value)
    : getReportDetail(category.value, vendor.value, true),
)

function pickPageTab(tab: AgentReportPageTab) {
  pageTab.value = tab
  closeGameProfitFormulaTip()
  const query: Record<string, string> = { tab: 'report', reportTab: tab }
  const from = route.query.from
  if (typeof from === 'string' && from) query.from = from
  router.replace({ name: 'mobile-agent', query: withAgentQuery(query) })
}

function pickPreset(v: ReportRangePreset) {
  preset.value = v
}

function pickCategory(key: ReportCategoryKey) {
  category.value = key
  /** 切一级品类时，二级默认「全部」 */
  vendor.value = 'all'
}

function pickCurrency(value: AgentWalletCurrency) {
  setAgentAppCurrency(value)
  currencyPickerOpen.value = false
}

function toggleGameProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = !gameProfitFormulaTipOpen.value
}

function closeGameProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = false
}
</script>

<template>
  <div class="mh5-agent-report-page">
    <header class="mh5-agent-report-header mh5-agent-report-header--with-tabs">
      <div class="mh5-agent-report-page-tabs" role="tablist" aria-label="报表类型">
        <button
          v-for="tab in pageTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-agent-report-page-tab"
          :class="{ 'mh5-agent-report-page-tab--active': pageTab === tab.key }"
          :aria-selected="pageTab === tab.key"
          @click="pickPageTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="mh5-agent-report-header__actions">
        <Mh5SpecAnnot
          v-if="pageTab === 'finance'"
          :spec="financeAnnotSpec"
          placement="bottom"
        />
        <Mh5SpecAnnot
          v-else-if="isRebateAgent"
          :spec="gameAnnotSpec"
          placement="bottom"
        />
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

    <MobileAgentMyProfitView
      v-if="pageTab === 'finance'"
      embedded
      class="mh5-agent-report-finance"
    />

    <main
      v-else
      class="mh5-agent-report-main"
      @click="closeGameProfitFormulaTip"
    >
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
            @click="pickCategory(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div v-if="category !== 'all'" class="mh5-agent-report-vendors">
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
            <span class="mh5-agent-report-detail__profit-label-wrap">
              <button
                type="button"
                class="mh5-agent-detail-profit-summary__tip-btn mh5-agent-report-detail__tip-btn"
                aria-label="查看游戏净输赢计算公式"
                :aria-expanded="gameProfitFormulaTipOpen"
                @click.stop="toggleGameProfitFormulaTip"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
                  <path
                    d="M8 4.6v5.2M8 11.6h.01"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
              <span>游戏净输赢</span>
              <span
                v-if="gameProfitFormulaTipOpen"
                class="mh5-agent-detail-profit-summary__tip-bubble mh5-agent-report-detail__tip-bubble"
                role="tooltip"
              >
                {{ gameProfitFormula }}
              </span>
            </span>
            <em :class="reportNetProfitClass(reportDetail.netProfitTone)">
              {{ reportDetail.netProfit }}
            </em>
          </span>
        </div>
        <div
          v-for="row in reportDetail.rows"
          :key="row.key"
          class="mh5-agent-report-detail__row"
        >
          <span class="mh5-agent-report-detail__row-label">{{ row.label }}</span>
          <span
            class="mh5-agent-report-detail__row-value"
            :class="reportDetailValueClass(row.tone)"
          >
            {{ row.value }}
          </span>
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
