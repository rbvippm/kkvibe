<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatAgentCurrencyLabel } from '../../constants/agentCurrencyIcons'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'
import Mh5CurrencyPickerSheet from './Mh5CurrencyPickerSheet.vue'
import Mh5DateRangeSheet from './Mh5DateRangeSheet.vue'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import {
  getAgentDetailCurrencyOptions,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  agentAppCurrency,
  isAgentCreditCurrency,
  setAgentAppCurrencyByUser,
} from '../../constants/agentAppCurrency'
import { AGENT_GAME_PROFIT_FORMULA } from '../../constants/agentDetailProfit'
import { rebateGameNetProfitFormula } from '../../constants/agentMyProfit'
import {
  AGENT_REPORT_FILTER_ASSETS,
  REPORT_CATEGORY_TABS,
  REPORT_RANGE_PRESETS,
  REPORT_VENDOR_PILLS,
  getRebateReportDetail,
  getReportDetail,
  getReportSummaryCards,
  reportCategoryTitle,
  reportPresetRange,
  reportDetailValueClass,
  reportNetProfitClass,
  type ReportCategoryKey,
  type ReportRangePreset,
  type ReportVendorKey,
} from '../../constants/agentReport'
import { formatDateRangeText } from '../../constants/mh5DateRange'
import { AGENT_REPORT_GAME_STATS_SPEC } from '../../constants/agentReportSpec'
import { AGENT_MY_PROFIT_SPEC } from '../../constants/agentMyProfitSpec'
import {
  resolveAgentReportPageTab,
  setAgentReportPageTab,
  type AgentReportPageTab,
} from '../../constants/agentReportTab'
import MobileAgentMyProfitView from '../../views/mobile/MobileAgentMyProfitView.vue'
import '../../styles/mobile-app-shell.css'

export type { AgentReportPageTab }

const route = useRoute()
const router = useRouter()
const { isRebateAgent, withAgentQuery } = useAgentIdentity()

const pageTab = ref<AgentReportPageTab>(resolveAgentReportPageTab(route.query.reportTab))

watch(
  () => route.query.reportTab,
  (tab) => {
    pageTab.value = resolveAgentReportPageTab(tab)
  },
)

const pageTabs = computed(() => [
  { key: 'finance' as const, label: isRebateAgent.value ? '佣金' : '盈亏' },
  { key: 'game' as const, label: '游戏' },
])

const financeAnnotSpec = AGENT_MY_PROFIT_SPEC
const gameAnnotSpec = AGENT_REPORT_GAME_STATS_SPEC

const preset = ref<ReportRangePreset | null>('today')
const todayRange = reportPresetRange('today')
const filterStart = ref(todayRange.start)
const filterEnd = ref(todayRange.end)
const filterDateOpen = ref(false)
const category = ref<ReportCategoryKey>('all')
const vendor = ref<ReportVendorKey>('all')
const currencyPickerOpen = ref(false)
const gameProfitFormulaTipOpen = ref(false)
const currency = agentAppCurrency
const currencyOptions = computed(() => getAgentDetailCurrencyOptions(!isRebateAgent.value))

const dateRangeText = computed(() => formatDateRangeText(filterStart.value, filterEnd.value))
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
  setAgentReportPageTab(tab)
  pageTab.value = tab
  closeGameProfitFormulaTip()
  const query: Record<string, string> = { tab: 'report', reportTab: tab }
  const from = route.query.from
  if (typeof from === 'string' && from) query.from = from
  router.replace({ name: 'mobile-agent', query: withAgentQuery(query) })
}

function pickPreset(v: ReportRangePreset) {
  const range = reportPresetRange(v)
  preset.value = v
  filterStart.value = range.start
  filterEnd.value = range.end
}

function confirmFilterDate(start: string, end: string) {
  filterStart.value = start
  filterEnd.value = end
  preset.value = null
  filterDateOpen.value = false
}

function pickCategory(key: ReportCategoryKey) {
  category.value = key
  /** 切一级品类时，二级默认「全部」 */
  vendor.value = 'all'
}

function pickCurrency(value: string) {
  setAgentAppCurrencyByUser(value as AgentWalletCurrency)
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
      <div class="mh5-agent-report-page-tabs" role="tablist" :aria-label="$t('报表类型')">
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
          {{ $t(tab.label) }}
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
      </div>
    </header>

    <MobileAgentMyProfitView
      v-if="pageTab === 'finance'"
      embedded
      class="mh5-agent-report-finance"
      @open-currency="currencyPickerOpen = true"
    />

    <main
      v-else
      class="mh5-agent-report-main"
      @click="closeGameProfitFormulaTip"
    >
      <section class="mh5-agent-report-filter" :aria-label="$t('筛选')">
        <div class="mh5-agent-report-filter__row">
          <button
            type="button"
            class="mh5-agent-report-filter__date mh5-agent-report-filter__date--action"
            :aria-label="$t('选择日期')"
            :aria-expanded="filterDateOpen"
            @click="filterDateOpen = true"
          >
            <span>{{ dateRangeText }}</span>
            <span class="mh5-agent-report-filter__calendar" aria-hidden="true">
              <img :src="AGENT_REPORT_FILTER_ASSETS.calendar" alt="" width="16" height="16" />
            </span>
          </button>
          <button
            type="button"
            class="mh5-agent-report-filter__currency"
            :aria-label="$t('切换币种')"
            @click="currencyPickerOpen = true"
          >
            <span class="mh5-agent-report-filter__currency-main">
              <Mh5CurrencyIcon :code="currency" :size="20" />
              <span>{{ $t(formatAgentCurrencyLabel(currency)) }}</span>
            </span>
            <span class="mh5-agent-report-filter__chevron" aria-hidden="true">
              <img :src="AGENT_REPORT_FILTER_ASSETS.dropdown" alt="" width="8" height="5" />
            </span>
          </button>
        </div>
        <div class="mh5-agent-report-filter__presets" role="tablist" :aria-label="$t('快捷时间')">
          <button
            v-for="item in REPORT_RANGE_PRESETS"
            :key="item.key"
            type="button"
            role="tab"
            class="mh5-agent-report-filter__preset"
            :class="{ 'mh5-agent-report-filter__preset--active': preset === item.key }"
            :aria-selected="preset === item.key"
            @click="pickPreset(item.key)"
          >
            {{ $t(item.label) }}
          </button>
        </div>
      </section>

      <section class="mh5-agent-report-summary">
        <div
          v-for="card in summaryCards"
          :key="card.key"
          class="mh5-agent-report-summary-card"
        >
          <p class="mh5-agent-report-summary-card__label">{{ $t(card.label) }}</p>
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
            {{ $t(tab.label) }}
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
            {{ $t(pill.label) }}
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
                :aria-label="$t('查看游戏净输赢计算公式')"
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
              <span>{{ $t('游戏净输赢') }}</span>
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
          <span class="mh5-agent-report-detail__row-label">{{ $t(row.label) }}</span>
          <span
            class="mh5-agent-report-detail__row-value"
            :class="reportDetailValueClass(row.tone)"
          >
            {{ row.value }}
          </span>
        </div>
      </section>
    </main>

    <Mh5DateRangeSheet
      :open="filterDateOpen"
      :start="filterStart"
      :end="filterEnd"
      @close="filterDateOpen = false"
      @confirm="confirmFilterDate"
    />

    <Mh5CurrencyPickerSheet
      :open="currencyPickerOpen"
      :currency="currency"
      :options="currencyOptions"
      @close="currencyPickerOpen = false"
      @pick="pickCurrency"
    />
  </div>
</template>
