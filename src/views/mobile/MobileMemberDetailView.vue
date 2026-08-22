<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_CREDIT_CURRENCY_TABS,
  formatCreditCurrencyUnit,
  getAgentDetailCurrencyOptions,
  type AgentCreditCurrency,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  agentAppCreditCurrency,
  agentAppCurrency,
  isAgentCreditCurrency,
  setAgentAppCreditCurrency,
  setAgentAppCurrencyByUser,
  fallbackAgentCashCurrency,
} from '../../constants/agentAppCurrency'
import {
  MEMBER_GAME_SUB_TABS,
  findMemberDetail,
  formatMemberCashWalletGroups,
  formatMemberCreditLimitView,
  getMemberDetailTabs,
  type MemberDetailTab,
  type MemberGameSubTab,
} from '../../constants/memberDetail'
import {
  MEMBER_GAME_PROFIT_FORMULA,
  MEMBER_PROFIT_CATEGORY_TABS,
  MEMBER_PROFIT_FORMULA,
  MEMBER_PROFIT_VENDORS,
  getMemberProfitCostSection,
  getMemberProfitDetail,
  getMemberProfitDialogDetail,
  getMemberProfitFormula,
  getMemberProfitGameSection,
  getMemberProfitSummaryRows,
  getMemberTotalProfit,
  memberProfitDialogTitle,
  memberRebateGameNetProfitFormula,
  profitTotalClass,
  profitValueClass,
  type MemberProfitCategoryKey,
  type MemberProfitDialogKind,
  type MemberProfitVendorKey,
} from '../../constants/memberDetailProfit'
import { agentMyProfitToneClass } from '../../constants/agentMyProfit'
import {
  AGENT_REPORT_FILTER_ASSETS,
  REPORT_CATEGORY_TABS,
  REPORT_VENDOR_PILLS,
  getMemberDetailReportDetail,
  reportCategoryTitle,
  reportDetailValueClass,
  reportNetProfitClass,
  MONTH_RANGE_PRESETS,
  monthPresetRange,
  type MonthRangePreset,
  type ReportCategoryKey,
  type ReportVendorKey,
} from '../../constants/agentReport'
import {
  MH5_DATE_RANGE_TODAY,
  creditSettleRangeScale,
  formatDateRangeText,
} from '../../constants/mh5DateRange'
import Mh5CurrencyIcon from '../../components/mobile/Mh5CurrencyIcon.vue'
import Mh5CurrencyPickerSheet from '../../components/mobile/Mh5CurrencyPickerSheet.vue'
import Mh5DateRangeSheet from '../../components/mobile/Mh5DateRangeSheet.vue'
import Mh5AgentReportFilter from '../../components/mobile/Mh5AgentReportFilter.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  MEMBER_DETAIL_CREDIT_CURRENCY_SPEC,
  MEMBER_DETAIL_GAME_STATS_SPEC,
} from '../../constants/memberDetailSpec'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const { isRebateAgent } = useAgentIdentity()

function resolveMemberDetailTab(raw: unknown): MemberDetailTab | null {
  const key = String(raw ?? '')
  if (key === 'manage' || key === 'credit' || key === 'profit' || key === 'game' || key === 'login') {
    return key
  }
  return null
}

const activeTab = ref<MemberDetailTab>(resolveMemberDetailTab(route.query.tab) ?? 'manage')
const gameSubTab = ref<MemberGameSubTab>('records')
const currencyPickerOpen = ref(false)
const creditCurrencyMenuOpen = ref(false)
const currency = agentAppCurrency
const creditCurrency = agentAppCreditCurrency
const profitCategory = ref<MemberProfitCategoryKey>('overall')
const profitVendor = ref<MemberProfitVendorKey>('all')
/** 返佣 · 游戏统计：对齐返佣代理游戏数据品类 */
const reportCategory = ref<ReportCategoryKey>('all')
const reportVendor = ref<ReportVendorKey>('all')
const gameProfitFormulaTipOpen = ref(false)
const profitFormulaTipOpen = ref(false)
/**
 * 会员盈亏展示：默认分区新样式；
 * 已在「会员盈亏」Tab 时快速连点两次 → 切回经典汇总卡（再连点回到新样式）
 */
const profitLayoutMode = ref<'classic' | 'sections'>('sections')
const lastProfitTabTapAt = ref(0)
const PROFIT_TAB_DOUBLE_TAP_MS = 400
/** 会员盈亏分区模式：游戏净输赢默认收起、其他奖励默认展开 */
const profitGameDetailsExpanded = ref(false)
const profitCostDetailsExpanded = ref(true)
/** 会员盈亏分区模式 · 明细弹框 */
const profitDialogKind = ref<MemberProfitDialogKind | null>(null)
const profitDialogFormulaTipOpen = ref(false)

const member = computed(() => findMemberDetail(String(route.query.id ?? '')))
const isCredited = computed(() => Boolean(member.value?.isCredited))
const detailTabs = computed(() =>
  getMemberDetailTabs(isCredited.value, isRebateAgent.value),
)
const currencyOptions = computed(() => getAgentDetailCurrencyOptions(isCredited.value))
const cashWalletGroups = computed(() => formatMemberCashWalletGroups(member.value?.wallets))
const profitVendorOptions = computed(() => MEMBER_PROFIT_VENDORS[profitCategory.value])
const profitDetail = computed(() => getMemberProfitDetail(profitCategory.value, profitVendor.value))
const profitSummaryRows = computed(() => getMemberProfitSummaryRows(currency.value))
const memberTotalProfit = computed(() => getMemberTotalProfit(currency.value))
const useProfitSections = computed(() => profitLayoutMode.value === 'sections')
const profitGameSection = computed(() => getMemberProfitGameSection(currency.value))
const profitCostSection = computed(() => getMemberProfitCostSection(currency.value))
const profitFormula = computed(() => getMemberProfitFormula(currency.value))
const profitDialogTitle = computed(() =>
  profitDialogKind.value
    ? memberProfitDialogTitle(profitDialogKind.value, currency.value)
    : '',
)
const profitDialogRows = computed(() =>
  profitDialogKind.value
    ? getMemberProfitDialogDetail(profitDialogKind.value, currency.value)
    : [],
)
const profitDialogFormulaText = computed(
  () => profitDialogRows.value.find((row) => row.formulaTip)?.formulaTip ?? '',
)

watch(currency, () => {
  profitGameDetailsExpanded.value = false
  profitCostDetailsExpanded.value = true
  profitFormulaTipOpen.value = false
  closeProfitDialog()
})

const rebateGameSectionTitle = computed(() =>
  reportCategoryTitle(reportCategory.value, reportVendor.value),
)
const rebateGameFormula = computed(() => memberRebateGameNetProfitFormula())
const rebateGameDetail = computed(() => {
  const detail = getMemberDetailReportDetail(
    reportCategory.value,
    reportVendor.value,
  )
  return {
    ...detail,
    rows: detail.rows.filter((row) => row.key !== 'rebate' && row.key !== 'commission'),
  }
})

watch(isCredited, (credited) => {
  if (!credited) {
    if (activeTab.value === 'credit') activeTab.value = 'manage'
    if (isAgentCreditCurrency(currency.value)) fallbackAgentCashCurrency()
  }
})

watch(
  isRebateAgent,
  (rebate) => {
    if (rebate && activeTab.value === 'profit') activeTab.value = 'manage'
  },
  { immediate: true },
)

watch(
  () => route.query.tab,
  (tab) => {
    const next = resolveMemberDetailTab(tab)
    if (next && detailTabs.value.some((item) => item.key === next)) {
      activeTab.value = next
    }
  },
)

const summaryItems = computed(() => {
  if (!member.value) return []
  const s = member.value.summary
  const cur = currency.value
  if (cur === '信用额度-CNY') {
    return [
      { label: '总投注单数', value: String(s.totalBets + 2), positive: false },
      { label: '有效投注额', value: '¥3,200', positive: false },
      { label: '累计输赢', value: '+1,100', positive: true },
    ]
  }
  if (cur === '信用额度-USD') {
    return [
      { label: '总投注单数', value: String(Math.max(1, s.totalBets - 1)), positive: false },
      { label: '有效投注额', value: '¥980', positive: false },
      { label: '累计输赢', value: '-120', positive: false },
    ]
  }
  if (cur === 'USDT') {
    return [
      { label: '总投注单数', value: String(s.totalBets), positive: false },
      { label: '有效投注额', value: '¥1,500', positive: false },
      { label: '累计输赢', value: '+420', positive: true },
    ]
  }
  if (cur === 'KKV') {
    return [
      { label: '总投注单数', value: String(s.totalBets + 1), positive: false },
      { label: '有效投注额', value: '¥2,400', positive: false },
      { label: '累计输赢', value: '+680', positive: true },
    ]
  }
  return [
    { label: '总投注单数', value: String(s.totalBets), positive: false },
    { label: '有效投注额', value: s.validBetAmount, positive: false },
    { label: '累计输赢', value: s.cumulativeWinLose, positive: s.winLosePositive },
  ]
})

const settleStart = ref(MH5_DATE_RANGE_TODAY)
const settleEnd = ref(MH5_DATE_RANGE_TODAY)
const settleDateOpen = ref(false)
const settleDateText = computed(() => formatDateRangeText(settleStart.value, settleEnd.value))

const todayRange = monthPresetRange('today')
const filterPreset = ref<MonthRangePreset | null>('today')
const filterStart = ref(todayRange.start)
const filterEnd = ref(todayRange.end)
const filterDateOpen = ref(false)
const filterDateText = computed(() => formatDateRangeText(filterStart.value, filterEnd.value))
const creditCurrencyUnitLabel = computed(() => formatCreditCurrencyUnit(creditCurrency.value))

const creditLimitView = computed(() => {
  if (!member.value) return null
  return formatMemberCreditLimitView(
    member.value.creditLimits[creditCurrency.value],
    creditCurrency.value,
    creditSettleRangeScale(settleStart.value, settleEnd.value),
  )
})

watch(activeTab, () => {
  creditCurrencyMenuOpen.value = false
})

function selectProfitCategory(key: MemberProfitCategoryKey) {
  profitCategory.value = key
  /** 切一级品类时，二级默认「全部」 */
  profitVendor.value = MEMBER_PROFIT_VENDORS[key][0]?.key ?? 'all'
}

function selectReportCategory(key: ReportCategoryKey) {
  reportCategory.value = key
  reportVendor.value = 'all'
}

/** Tab 点击：会员盈亏连点两次切换分区新样式 / 经典汇总 */
function onDetailTabClick(key: MemberDetailTab) {
  if (key === 'profit') {
    const now = Date.now()
    if (
      activeTab.value === 'profit' &&
      now - lastProfitTabTapAt.value < PROFIT_TAB_DOUBLE_TAP_MS
    ) {
      profitLayoutMode.value = profitLayoutMode.value === 'classic' ? 'sections' : 'classic'
      profitFormulaTipOpen.value = false
      closeProfitDialog()
      lastProfitTabTapAt.value = 0
      return
    }
    lastProfitTabTapAt.value = now
  } else {
    lastProfitTabTapAt.value = 0
  }
  activeTab.value = key
}

function toggleProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = false
  profitFormulaTipOpen.value = !profitFormulaTipOpen.value
}

function closeProfitFormulaTip() {
  profitFormulaTipOpen.value = false
}

function toggleProfitGameDetails() {
  profitGameDetailsExpanded.value = !profitGameDetailsExpanded.value
}

function toggleProfitCostDetails() {
  profitCostDetailsExpanded.value = !profitCostDetailsExpanded.value
}

function openProfitDialog(kind: MemberProfitDialogKind) {
  profitDialogFormulaTipOpen.value = false
  profitDialogKind.value = kind
}

function closeProfitDialog() {
  profitDialogKind.value = null
  profitDialogFormulaTipOpen.value = false
}

function toggleProfitDialogFormulaTip() {
  profitDialogFormulaTipOpen.value = !profitDialogFormulaTipOpen.value
}

function closeProfitDialogFormulaTip() {
  profitDialogFormulaTipOpen.value = false
}

function toggleGameProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = !gameProfitFormulaTipOpen.value
}

function closeGameProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = false
}

function goCredit() {
  router.push({
    name: 'mobile-xcoin-credit-member',
    query: {
      targetId: member.value?.id,
      targetName: member.value?.nickname,
      currency: creditCurrency.value,
    },
  })
}

function goCreditStatement() {
  if (!member.value) return
  router.push({
    name: 'mobile-xcoin-records',
    query: {
      currency: creditCurrency.value,
      from: 'member-detail',
      keyword: member.value.nickname,
      lane: 'downstream',
    },
  })
}

function confirmSettleDate(start: string, end: string) {
  settleStart.value = start
  settleEnd.value = end
  settleDateOpen.value = false
}

function pickFilterPreset(key: string) {
  if (!MONTH_RANGE_PRESETS.some((item) => item.key === key)) return
  const preset = key as MonthRangePreset
  const range = monthPresetRange(preset)
  filterPreset.value = preset
  filterStart.value = range.start
  filterEnd.value = range.end
}

function confirmFilterDate(start: string, end: string) {
  filterStart.value = start
  filterEnd.value = end
  filterPreset.value = null
  filterDateOpen.value = false
}

function pickCurrency(value: string) {
  setAgentAppCurrencyByUser(value as AgentWalletCurrency)
  currencyPickerOpen.value = false
}

function pickCreditCurrency(value: AgentCreditCurrency) {
  setAgentAppCreditCurrency(value)
  creditCurrencyMenuOpen.value = false
}

function toggleCreditCurrencyMenu() {
  creditCurrencyMenuOpen.value = !creditCurrencyMenuOpen.value
}
</script>

<template>
  <div class="mh5-member-detail-page" @click="creditCurrencyMenuOpen = false">
    <header class="mh5-member-detail-hero">
      <div class="mh5-member-detail-nav">
        <button type="button" class="mh5-member-detail-nav__back" :aria-label="$t('返回')" @click="router.back()">
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
        <h1 class="mh5-member-detail-nav__title">{{ $t('会员详情') }}</h1>
        <div class="mh5-member-detail-nav__actions">
          <Mh5SpecAnnot
            v-if="!isRebateAgent"
            :spec="MEMBER_DETAIL_CREDIT_CURRENCY_SPEC"
            placement="bottom"
          />
        </div>
      </div>

      <section v-if="member" class="mh5-member-detail-card">
        <div class="mh5-member-detail-card__top">
          <div class="mh5-member-detail-card__avatar">{{ member.avatarEmoji }}</div>
          <div class="mh5-member-detail-card__info">
            <div class="mh5-member-detail-card__name-row">
              <h2 class="mh5-member-detail-card__name">{{ member.nickname }}</h2>
              <span class="mh5-member-detail-card__tag">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M6 1l1.2 3.6H11L8.4 7.2l1.2 3.6L6 9.6 2.4 10.8 3.6 7.2 1 4.6h3.8L6 1Z" fill="currentColor" />
                </svg>
                {{ member.memberTag }}
              </span>
            </div>
            <p class="mh5-member-detail-card__login">最近登陆 {{ member.lastLogin }}</p>
          </div>
        </div>
        <div class="mh5-member-detail-card__divider" aria-hidden="true" />
        <div class="mh5-member-detail-card__meta">
          <div class="mh5-member-detail-meta">
            <p class="mh5-member-detail-meta__label">{{ $t('会员账号') }}</p>
            <p class="mh5-member-detail-meta__value">{{ member.memberAccount }}</p>
          </div>
          <div class="mh5-member-detail-meta">
            <p class="mh5-member-detail-meta__label">{{ $t('上级代理') }}</p>
            <p class="mh5-member-detail-meta__value">{{ member.superiorAgent }}</p>
          </div>
        </div>
      </section>
    </header>

    <main v-if="member" class="mh5-member-detail-body">
      <div class="mh5-member-detail-tabs" role="tablist" :aria-label="$t('会员详情分类')">
        <button
          v-for="tab in detailTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-member-detail-tab"
          :class="{ 'mh5-member-detail-tab--active': activeTab === tab.key }"
          :aria-selected="activeTab === tab.key"
          @click="onDetailTabClick(tab.key)"
        >
          {{ $t(tab.label) }}
        </button>
      </div>

      <template v-if="activeTab === 'manage'">
        <section
          v-for="group in cashWalletGroups"
          :key="group.currency"
          class="mh5-member-detail-panel"
        >
          <div class="mh5-member-detail-panel__head">
            <h3 class="mh5-member-detail-panel__title">
              <Mh5CurrencyIcon :code="group.currency" :size="20" />
              <span>{{ $t(group.title) }}</span>
            </h3>
          </div>
          <div
            v-for="item in group.rows"
            :key="`${group.currency}-${item.label}`"
            class="mh5-member-detail-panel__row"
          >
            <span class="mh5-member-detail-panel__label">{{ $t(item.label) }}</span>
            <span class="mh5-member-detail-panel__value">{{ item.value }}</span>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'credit'">
        <section
          v-if="creditLimitView"
          class="mh5-agent-detail-wallet mh5-agent-detail-xcoin mh5-agent-detail-credit-manage"
        >
          <div class="mh5-agent-detail-credit-manage__head">
            <div class="mh5-agent-detail-credit-manage__title-wrap">
              <h3 class="mh5-agent-detail-wallet__title">额度管理</h3>
              <div class="mh5-agent-detail-credit-manage__ccy-wrap">
                <button
                  type="button"
                  class="mh5-currency-switch__btn mh5-agent-detail-credit-manage__ccy"
                  aria-label="选择信用额度币种"
                  :aria-expanded="creditCurrencyMenuOpen"
                  @click.stop="toggleCreditCurrencyMenu"
                >
                  <span class="mh5-currency-switch__main">
                    <Mh5CurrencyIcon :code="creditCurrency" :size="18" />
                    <span>{{ creditCurrencyUnitLabel }}</span>
                  </span>
                  <span
                    class="mh5-currency-switch__chevron"
                    :class="{ 'mh5-agent-detail-credit-manage__ccy-chevron--open': creditCurrencyMenuOpen }"
                    aria-hidden="true"
                  >
                    <img :src="AGENT_REPORT_FILTER_ASSETS.dropdown" alt="" width="8" height="5" />
                  </span>
                </button>
                <div
                  v-if="creditCurrencyMenuOpen"
                  class="mh5-agent-detail-credit-manage__ccy-menu"
                  role="listbox"
                  aria-label="信用额度币种"
                  @click.stop
                >
                  <button
                    v-for="tab in AGENT_CREDIT_CURRENCY_TABS"
                    :key="tab.key"
                    type="button"
                    role="option"
                    class="mh5-agent-detail-credit-manage__ccy-option"
                    :class="{
                      'mh5-agent-detail-credit-manage__ccy-option--active': creditCurrency === tab.key,
                    }"
                    :aria-selected="creditCurrency === tab.key"
                    @click="pickCreditCurrency(tab.key)"
                  >
                    <Mh5CurrencyIcon :code="tab.key" :size="18" />
                    <span>{{ tab.label }}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="mh5-agent-detail-credit-manage__action mh5-agent-detail-credit-manage__action--primary"
              @click="goCredit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              给他上下分
            </button>
          </div>
          <div class="mh5-agent-detail-credit-manage__available">
            <p class="mh5-agent-detail-credit-manage__available-label">可用额度</p>
            <p class="mh5-agent-detail-credit-manage__available-value">
              {{ creditLimitView.availableValue }}
            </p>
          </div>
          <div class="mh5-agent-detail-credit-manage__quota">
            <div class="mh5-agent-detail-credit-manage__quota-row">
              <span>总授信额度</span>
              <span>{{ creditLimitView.quotaValue }}</span>
            </div>
            <div class="mh5-agent-detail-credit-manage__progress">
              <div
                class="mh5-agent-detail-credit-manage__track"
                role="progressbar"
                :aria-valuenow="creditLimitView.usedPercent"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`可用额度占比 ${creditLimitView.usedPercentText}`"
              >
                <span
                  class="mh5-agent-detail-credit-manage__fill"
                  :style="{ width: `${creditLimitView.usedPercent}%` }"
                />
              </div>
              <span class="mh5-agent-detail-credit-manage__percent">
                {{ creditLimitView.usedPercentText }}
              </span>
            </div>
          </div>
        </section>

        <section
          v-if="creditLimitView"
          class="mh5-agent-detail-wallet mh5-agent-detail-xcoin mh5-agent-detail-credit-settle"
        >
          <div class="mh5-agent-detail-credit-settle__head">
            <h3 class="mh5-agent-detail-wallet__title">对账结算</h3>
            <button
              type="button"
              class="mh5-agent-report-filter__date mh5-agent-report-filter__date--action mh5-agent-detail-credit-settle__date"
              aria-label="选择日期"
              :aria-expanded="settleDateOpen"
              @click="settleDateOpen = true"
            >
              <span>{{ settleDateText }}</span>
              <span class="mh5-agent-report-filter__calendar" aria-hidden="true">
                <img :src="AGENT_REPORT_FILTER_ASSETS.calendar" alt="" width="16" height="16" />
              </span>
            </button>
          </div>
          <div
            class="mh5-agent-detail-credit-settle__receivable"
            :class="{
              'mh5-agent-detail-credit-settle__receivable--negative': !creditLimitView.receivablePositive,
            }"
          >
            <p class="mh5-agent-detail-credit-settle__receivable-label">我方应收会员</p>
            <p class="mh5-agent-detail-credit-settle__receivable-value">
              {{ creditLimitView.receivableValue }}
            </p>
          </div>
          <div class="mh5-agent-detail-credit-settle__timeline">
            <div
              v-for="item in creditLimitView.settleFlowRows"
              :key="item.label"
              class="mh5-agent-detail-credit-settle__row"
            >
              <span>{{ item.label }}</span>
              <span>{{ item.value }}</span>
            </div>
            <div class="mh5-agent-detail-credit-settle__divider" />
            <div
              v-for="item in creditLimitView.settleResultRows"
              :key="item.label"
              class="mh5-agent-detail-credit-settle__row"
            >
              <span>{{ item.label }}</span>
              <span
                :class="{
                  'mh5-agent-detail-wallet__value--positive': item.positive,
                  'mh5-agent-detail-wallet__value--negative': item.positive === false,
                }"
              >
                {{ item.value }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="mh5-agent-detail-credit-settle__statement"
            @click="goCreditStatement"
          >
            查看流水对账单
          </button>
        </section>
      </template>

      <!-- 占成会员盈亏：默认分区新样式；连点 Tab 切经典汇总 -->
      <template v-else-if="activeTab === 'profit'">
        <Mh5AgentReportFilter
          :date-text="filterDateText"
          :currency="currency"
          :active-preset="filterPreset"
          :presets="MONTH_RANGE_PRESETS"
          @open-date="filterDateOpen = true"
          @open-currency="currencyPickerOpen = true"
          @pick-preset="pickFilterPreset"
        />
        <section
          v-if="!useProfitSections"
          class="mh5-member-detail-profit"
          @click="closeProfitFormulaTip"
        >
          <section class="mh5-agent-detail-wallet mh5-agent-detail-profit-summary">
            <div class="mh5-agent-detail-wallet__row mh5-agent-detail-profit-summary__total">
              <span class="mh5-agent-detail-profit-summary__label-wrap">
                <span class="mh5-agent-detail-wallet__label">会员盈亏</span>
                <button
                  type="button"
                  class="mh5-agent-detail-profit-summary__tip-btn"
                  aria-label="查看会员盈亏计算公式"
                  :aria-expanded="profitFormulaTipOpen"
                  @click.stop="toggleProfitFormulaTip"
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
                <span
                  v-if="profitFormulaTipOpen"
                  class="mh5-agent-detail-profit-summary__tip-bubble"
                  role="tooltip"
                >
                  {{ MEMBER_PROFIT_FORMULA }}
                </span>
              </span>
              <span
                class="mh5-agent-detail-wallet__value"
                :class="{
                  'mh5-agent-detail-wallet__value--positive': memberTotalProfit.tone === 'positive',
                  'mh5-agent-detail-wallet__value--negative': memberTotalProfit.tone === 'negative',
                }"
              >
                {{ memberTotalProfit.value }}
              </span>
            </div>
            <div
              v-for="row in profitSummaryRows"
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
        </section>

        <section
          v-else
          class="mh5-member-detail-profit mh5-agent-my-profit-main mh5-agent-my-profit-main--rebate"
        >
          <section
            class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
            aria-label="游戏净输赢金额"
          >
            <div class="mh5-agent-my-profit-table__head">
              <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                {{ profitGameSection.nameHeader }}
              </span>
              <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
                {{ profitGameSection.amountHeader }}
              </span>
            </div>
            <div
              class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
            >
              <button
                type="button"
                class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron mh5-agent-my-profit-table__expand-trigger"
                :aria-expanded="profitGameDetailsExpanded"
                aria-label="展开或收起游戏净输赢细项"
                @click="toggleProfitGameDetails"
              >
                <span>{{ profitGameSection.total.label }}</span>
                <span
                  class="mh5-agent-my-profit-table__chevron"
                  :class="{ 'mh5-agent-my-profit-table__chevron--open': profitGameDetailsExpanded }"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              <span
                class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
                :class="agentMyProfitToneClass(profitGameSection.total.tone)"
              >
                {{ profitGameSection.total.value }}
              </span>
            </div>
            <Transition name="mh5-agent-my-profit-expand">
              <div v-if="profitGameDetailsExpanded" class="mh5-agent-my-profit-table__details">
                <button
                  v-for="(row, index) in profitGameSection.rows"
                  :key="row.key"
                  type="button"
                  class="mh5-agent-my-profit-table__row"
                  :class="{ 'mh5-agent-my-profit-table__row--alt': index % 2 === 1 }"
                  @click="openProfitDialog(row.key)"
                >
                  <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                    {{ row.label }}
                  </span>
                  <span
                    class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount mh5-agent-my-profit-table__link"
                    :class="agentMyProfitToneClass(row.tone)"
                  >
                    {{ row.value }}
                  </span>
                </button>
              </div>
            </Transition>
          </section>

          <section
            class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
            aria-label="其他奖励金额"
          >
            <div class="mh5-agent-my-profit-table__head">
              <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                {{ profitCostSection.nameHeader }}
              </span>
              <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
                {{ profitCostSection.amountHeader }}
              </span>
            </div>
            <div
              class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
            >
              <button
                type="button"
                class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron mh5-agent-my-profit-table__expand-trigger"
                :aria-expanded="profitCostDetailsExpanded"
                aria-label="展开或收起其他奖励细项"
                @click="toggleProfitCostDetails"
              >
                <span>{{ profitCostSection.total.label }}</span>
                <span
                  class="mh5-agent-my-profit-table__chevron"
                  :class="{ 'mh5-agent-my-profit-table__chevron--open': profitCostDetailsExpanded }"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              <span
                class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
                :class="agentMyProfitToneClass(profitCostSection.total.tone)"
              >
                {{ profitCostSection.total.value }}
              </span>
            </div>
            <Transition name="mh5-agent-my-profit-expand">
              <div v-if="profitCostDetailsExpanded" class="mh5-agent-my-profit-table__details">
                <div
                  v-for="(row, index) in profitCostSection.rows"
                  :key="row.key"
                  class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--static"
                  :class="{ 'mh5-agent-my-profit-table__row--alt': index % 2 === 1 }"
                >
                  <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                    {{ row.label }}
                  </span>
                  <span
                    class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
                    :class="agentMyProfitToneClass(row.tone)"
                  >
                    {{ row.value }}
                  </span>
                </div>
              </div>
            </Transition>
          </section>

          <section
            class="mh5-agent-my-profit-formula-card mh5-agent-my-profit-formula-card--extra"
            aria-label="游戏净输赢加其他奖励等于会员盈亏"
          >
            <div
              class="mh5-agent-commission-formula mh5-agent-my-profit-formula mh5-agent-my-profit-formula--extra"
            >
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">游戏净输赢</p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="agentMyProfitToneClass(profitFormula.gameTone)"
                >
                  {{ profitFormula.gameAmountText }}
                </p>
              </div>
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">+</span>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">{{ profitFormula.costLabel }}</p>
                <p
                  class="mh5-agent-commission-cell__value"
                  :class="agentMyProfitToneClass(profitFormula.costTone)"
                >
                  {{ profitFormula.costAmountText }}
                </p>
              </div>
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">=</span>
              <button
                type="button"
                class="mh5-agent-commission-cell mh5-agent-my-profit-formula__result"
                aria-label="查看会员盈亏明细"
                @click="openProfitDialog('total')"
              >
                <p class="mh5-agent-commission-cell__label">{{ profitFormula.totalLabel }}</p>
                <p
                  class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__result-value"
                  :class="agentMyProfitToneClass(profitFormula.totalTone)"
                >
                  {{ profitFormula.totalAmountText }}
                </p>
              </button>
            </div>
          </section>
        </section>
      </template>

      <template v-else-if="activeTab === 'game'">
        <div class="mh5-member-detail-subtabs">
          <template v-for="sub in MEMBER_GAME_SUB_TABS" :key="sub.key">
            <button
              type="button"
              class="mh5-member-detail-subtab"
              :class="{ 'mh5-member-detail-subtab--active': gameSubTab === sub.key }"
              @click="gameSubTab = sub.key"
            >
              {{ sub.label }}
            </button>
            <span
              v-if="sub.key === 'stats' && isRebateAgent"
              class="mh5-member-detail-subtab-annot"
            >
              <Mh5SpecAnnot :spec="MEMBER_DETAIL_GAME_STATS_SPEC" placement="bottom" />
            </span>
          </template>
        </div>

        <section
          v-if="gameSubTab === 'stats'"
          class="mh5-member-detail-profit"
          @click="closeGameProfitFormulaTip"
        >
          <Mh5AgentReportFilter
            :date-text="filterDateText"
            :currency="currency"
            :active-preset="filterPreset"
            :presets="MONTH_RANGE_PRESETS"
            @open-date="filterDateOpen = true"
            @open-currency="currencyPickerOpen = true"
            @pick-preset="pickFilterPreset"
          />
          <!-- 返佣：对齐返佣代理游戏数据 / 我的报表结构 -->
          <template v-if="isRebateAgent">
            <div class="mh5-agent-report-categories">
              <div class="mh5-agent-report-cat-tabs" role="tablist" aria-label="游戏数据品类">
                <button
                  v-for="tab in REPORT_CATEGORY_TABS"
                  :key="tab.key"
                  type="button"
                  role="tab"
                  class="mh5-agent-report-cat-tab"
                  :class="{ 'mh5-agent-report-cat-tab--active': reportCategory === tab.key }"
                  :aria-selected="reportCategory === tab.key"
                  @click="selectReportCategory(tab.key)"
                >
                  {{ tab.label }}
                </button>
              </div>
              <div
                v-if="reportCategory !== 'all'"
                class="mh5-agent-report-vendors"
                role="tablist"
                aria-label="游戏数据场馆"
              >
                <button
                  v-for="pill in REPORT_VENDOR_PILLS"
                  :key="pill.key"
                  type="button"
                  role="tab"
                  class="mh5-agent-report-vendor"
                  :class="{ 'mh5-agent-report-vendor--active': reportVendor === pill.key }"
                  :aria-selected="reportVendor === pill.key"
                  @click="reportVendor = pill.key"
                >
                  {{ pill.label }}
                </button>
              </div>
            </div>

            <section class="mh5-agent-report-detail">
              <div class="mh5-agent-report-detail__head">
                <span class="mh5-agent-report-detail__title">{{ rebateGameSectionTitle }}</span>
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
                      {{ rebateGameFormula }}
                    </span>
                  </span>
                  <em :class="reportNetProfitClass(rebateGameDetail.netProfitTone)">
                    {{ rebateGameDetail.netProfit }}
                  </em>
                </span>
              </div>
              <div
                v-for="row in rebateGameDetail.rows"
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
          </template>

          <!-- 占成：原品类结构 -->
          <template v-else>
            <div class="mh5-agent-report-categories">
              <div class="mh5-agent-report-cat-tabs" role="tablist" aria-label="游戏数据品类">
                <button
                  v-for="tab in MEMBER_PROFIT_CATEGORY_TABS"
                  :key="tab.key"
                  type="button"
                  role="tab"
                  class="mh5-agent-report-cat-tab"
                  :class="{ 'mh5-agent-report-cat-tab--active': profitCategory === tab.key }"
                  :aria-selected="profitCategory === tab.key"
                  @click="selectProfitCategory(tab.key)"
                >
                  {{ tab.label }}
                </button>
              </div>
              <div
                v-if="profitVendorOptions.length"
                class="mh5-agent-report-vendors"
                role="tablist"
                aria-label="游戏数据场馆"
              >
                <button
                  v-for="pill in profitVendorOptions"
                  :key="pill.key"
                  type="button"
                  role="tab"
                  class="mh5-agent-report-vendor"
                  :class="{ 'mh5-agent-report-vendor--active': profitVendor === pill.key }"
                  :aria-selected="profitVendor === pill.key"
                  @click="profitVendor = pill.key"
                >
                  {{ pill.label }}
                </button>
              </div>
            </div>

            <section class="mh5-agent-report-detail">
              <div class="mh5-agent-report-detail__head">
                <span class="mh5-agent-report-detail__title">{{ profitDetail.title }}</span>
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
                      {{ MEMBER_GAME_PROFIT_FORMULA }}
                    </span>
                  </span>
                  <em :class="profitTotalClass(profitDetail.totalProfitTone)">
                    {{ profitDetail.totalProfit }}
                  </em>
                </span>
              </div>
              <div
                v-for="row in profitDetail.rows"
                :key="row.label"
                class="mh5-agent-report-detail__row"
              >
                <span class="mh5-agent-report-detail__row-label">{{ row.label }}</span>
                <span
                  class="mh5-agent-report-detail__row-value"
                  :class="profitValueClass(row.tone)"
                >
                  {{ row.value }}
                </span>
              </div>
            </section>
          </template>
        </section>

        <section v-else class="mh5-member-detail-summary">
          <div
            v-for="(item, idx) in summaryItems"
            :key="item.label"
            class="mh5-member-detail-summary__col"
            :class="{ 'mh5-member-detail-summary__col--border': idx > 0 }"
          >
            <p class="mh5-member-detail-summary__label">{{ item.label }}</p>
            <p
              class="mh5-member-detail-summary__value"
              :class="{ 'mh5-member-detail-summary__value--positive': item.positive }"
            >
              {{ item.value }}
            </p>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'login'">
        <section class="mh5-member-detail-panel">
          <div class="mh5-member-detail-panel__head mh5-member-detail-panel__head--plain">
            <h3 class="mh5-member-detail-panel__title">登录日志</h3>
          </div>
          <div class="mh5-member-detail-panel__row">
            <span class="mh5-member-detail-panel__label">注册时间</span>
            <span class="mh5-member-detail-panel__value">{{ member.loginLog.registeredAt }}</span>
          </div>
          <div class="mh5-member-detail-panel__row">
            <span class="mh5-member-detail-panel__label">最后登录时间</span>
            <span class="mh5-member-detail-panel__value">{{ member.loginLog.lastLoginAt }}</span>
          </div>
        </section>
      </template>
    </main>

    <main v-else class="mh5-member-detail-body">
      <p class="mh5-member-detail-empty">未找到该会员信息</p>
    </main>

    <Transition name="mh5-agent-my-profit-dialog">
      <div
        v-if="profitDialogKind"
        class="mh5-agent-my-profit-dialog-mask"
        @click.self="closeProfitDialog"
      >
        <div
          class="mh5-agent-my-profit-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="profitDialogTitle"
          @click="closeProfitDialogFormulaTip"
        >
          <h2 class="mh5-agent-my-profit-dialog__title">{{ profitDialogTitle }}</h2>
          <div class="mh5-agent-my-profit-dialog__table">
            <div class="mh5-agent-my-profit-dialog__head">
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--label">
                盈亏细项
              </span>
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--value">
                金额
              </span>
            </div>
            <div
              v-for="row in profitDialogRows"
              :key="row.label"
              class="mh5-agent-my-profit-dialog__row"
              :class="{ 'mh5-agent-my-profit-dialog__row--emphasize': row.emphasize }"
            >
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--label">
                <span class="mh5-agent-my-profit-dialog__label-wrap">
                  <span>{{ row.label }}</span>
                  <button
                    v-if="row.formulaTip"
                    type="button"
                    class="mh5-agent-my-profit-dialog__tip-btn"
                    :aria-label="`查看${row.label}计算公式`"
                    :aria-expanded="profitDialogFormulaTipOpen"
                    @click.stop="toggleProfitDialogFormulaTip"
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
                </span>
              </span>
              <span
                class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--value"
                :class="agentMyProfitToneClass(row.tone)"
              >
                {{ row.amountText }}
              </span>
            </div>
          </div>
          <div
            v-if="profitDialogFormulaTipOpen && profitDialogFormulaText"
            class="mh5-agent-my-profit-dialog__tip-panel"
            role="tooltip"
            @click.stop
          >
            {{ profitDialogFormulaText }}
          </div>
          <button type="button" class="mh5-agent-my-profit-dialog__btn" @click="closeProfitDialog">
            我知道了
          </button>
        </div>
      </div>
    </Transition>

    <Mh5CurrencyPickerSheet
      :open="currencyPickerOpen"
      :currency="currency"
      :options="currencyOptions"
      @close="currencyPickerOpen = false"
      @pick="pickCurrency"
    />

    <Mh5DateRangeSheet
      :open="settleDateOpen"
      :start="settleStart"
      :end="settleEnd"
      @close="settleDateOpen = false"
      @confirm="confirmSettleDate"
    />

    <Mh5DateRangeSheet
      :open="filterDateOpen"
      :start="filterStart"
      :end="filterEnd"
      @close="filterDateOpen = false"
      @confirm="confirmFilterDate"
    />
  </div>
</template>
