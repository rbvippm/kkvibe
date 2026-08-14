<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_CREDIT_CURRENCY_TABS,
  formatCashWalletGroups,
  formatCreditLimitRows,
  getAgentDetailCurrencyOptions,
  getAgentDetailTabs,
  getAgentDisplayName,
  findAgentDetail,
  type AgentCreditCurrency,
  type AgentDetailTab,
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
  AGENT_COMMISSION_FORMULA,
  AGENT_GAME_PROFIT_FORMULA,
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_FORMULA,
  AGENT_PROFIT_VENDORS,
  agentProfitDialogTitle,
  getAgentCommissionSummaryRows,
  getAgentProfitCostSection,
  getAgentProfitDetail,
  getAgentProfitDialogDetail,
  getAgentProfitFlowRows,
  getAgentProfitFormula,
  getAgentProfitGameSection,
  getAgentProfitSummaryRows,
  getAgentTotalCommission,
  getAgentTotalProfit,
  profitTotalClass,
  profitValueClass,
  type AgentProfitCategoryKey,
  type AgentProfitDialogKind,
  type AgentProfitVendorKey,
} from '../../constants/agentDetailProfit'
import {
  agentMyProfitToneClass,
  rebateGameNetProfitFormula,
} from '../../constants/agentMyProfit'
import {
  REPORT_CATEGORY_TABS,
  REPORT_VENDOR_PILLS,
  getAgentDetailReportDetail,
  reportCategoryTitle,
  reportDetailValueClass,
  reportNetProfitClass,
  type ReportCategoryKey,
  type ReportVendorKey,
} from '../../constants/agentReport'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  AGENT_DETAIL_CREDIT_CURRENCY_SPEC,
  AGENT_DETAIL_GAME_DATA_SPEC,
} from '../../constants/agentDetailSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const { isRebateAgent } = useAgentIdentity()

const activeTab = ref<AgentDetailTab>('wallet')
const currencyPickerOpen = ref(false)
const profitFormulaTipOpen = ref(false)
const gameProfitFormulaTipOpen = ref(false)
/**
 * 代理盈亏展示：默认分区新样式；
 * 已在「代理盈亏」Tab 时快速连点两次 → 切回经典汇总卡（再连点回到新样式）
 */
const profitLayoutMode = ref<'classic' | 'sections'>('sections')
const lastProfitTabTapAt = ref(0)
const PROFIT_TAB_DOUBLE_TAP_MS = 400
const profitGameDetailsExpanded = ref(false)
const profitCostDetailsExpanded = ref(true)
const profitDialogKind = ref<AgentProfitDialogKind | null>(null)
const profitDialogFormulaTipOpen = ref(false)
const currency = agentAppCurrency
const creditCurrency = agentAppCreditCurrency

const profitCategory = ref<AgentProfitCategoryKey>('overall')
const profitVendor = ref<AgentProfitVendorKey>('all')
/** 返佣游戏数据：对齐「我的报表」品类结构 */
const reportCategory = ref<ReportCategoryKey>('all')
const reportVendor = ref<ReportVendorKey>('all')

const agent = computed(() => findAgentDetail(String(route.query.id ?? 'self')))
const isCredited = computed(() => Boolean(agent.value?.isCredited))
const detailTabs = computed(() =>
  getAgentDetailTabs(isCredited.value, isRebateAgent.value),
)
const currencyOptions = computed(() => getAgentDetailCurrencyOptions(isCredited.value))
const profitTabLabel = computed(() => (isRebateAgent.value ? '代理佣金' : '代理盈亏'))
const profitTabFormula = computed(() =>
  isRebateAgent.value ? AGENT_COMMISSION_FORMULA : AGENT_PROFIT_FORMULA,
)
const useProfitSections = computed(
  () => !isRebateAgent.value && profitLayoutMode.value === 'sections',
)

watch(isCredited, (credited) => {
  if (!credited) {
    if (activeTab.value === 'credit') activeTab.value = 'wallet'
    if (isAgentCreditCurrency(currency.value)) fallbackAgentCashCurrency()
  }
})

watch(
  isRebateAgent,
  (rebate) => {
    if (rebate && activeTab.value === 'profit') activeTab.value = 'wallet'
    if (rebate) profitLayoutMode.value = 'sections'
  },
  { immediate: true },
)

const profitVendorOptions = computed(() => AGENT_PROFIT_VENDORS[profitCategory.value])
const profitDetail = computed(() => getAgentProfitDetail(profitCategory.value, profitVendor.value))
const profitSummaryRows = computed(() =>
  isRebateAgent.value
    ? getAgentCommissionSummaryRows(currency.value)
    : getAgentProfitSummaryRows(currency.value),
)
const agentTotalProfit = computed(() =>
  isRebateAgent.value
    ? getAgentTotalCommission(currency.value)
    : getAgentTotalProfit(currency.value),
)
const profitFlowRows = computed(() => getAgentProfitFlowRows(currency.value))
const profitGameSection = computed(() => getAgentProfitGameSection(currency.value))
const profitCostSection = computed(() => getAgentProfitCostSection(currency.value))
const profitFormula = computed(() => getAgentProfitFormula(currency.value))
const profitDialogTitle = computed(() =>
  profitDialogKind.value
    ? agentProfitDialogTitle(profitDialogKind.value, currency.value)
    : '',
)
const profitDialogRows = computed(() =>
  profitDialogKind.value
    ? getAgentProfitDialogDetail(profitDialogKind.value, currency.value)
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
const rebateGameFormula = computed(() => rebateGameNetProfitFormula())
const rebateGameDetail = computed(() => {
  const detail = getAgentDetailReportDetail(
    reportCategory.value,
    reportVendor.value,
  )
  return {
    ...detail,
    rows: detail.rows.filter((row) => row.key !== 'rebate' && row.key !== 'commission'),
  }
})

function selectProfitCategory(key: AgentProfitCategoryKey) {
  profitCategory.value = key
  /** 切一级品类时，二级默认「全部」 */
  profitVendor.value = AGENT_PROFIT_VENDORS[key][0]?.key ?? 'all'
}

function selectReportCategory(key: ReportCategoryKey) {
  reportCategory.value = key
  reportVendor.value = 'all'
}

/** Tab 点击：代理盈亏连点两次切换分区新样式 / 经典汇总（仅占成） */
function onDetailTabClick(key: AgentDetailTab) {
  if (key === 'profit' && !isRebateAgent.value) {
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

function toggleProfitGameDetails() {
  profitGameDetailsExpanded.value = !profitGameDetailsExpanded.value
}

function toggleProfitCostDetails() {
  profitCostDetailsExpanded.value = !profitCostDetailsExpanded.value
}

function openProfitDialog(kind: AgentProfitDialogKind) {
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

const statItems = computed(() => {
  if (!agent.value) return []
  const s = agent.value.stats
  return [
    { value: s.agents, label: '代理' },
    { value: s.directAgents, label: '直属代理' },
    { value: s.members, label: '会员' },
    { value: s.directMembers, label: '直属会员' },
  ]
})

const creditLimitTitle = '信用额度'

const cashWalletGroups = computed(() => formatCashWalletGroups(agent.value?.wallets))

const creditLimitItems = computed(() => {
  if (!agent.value) return []
  return formatCreditLimitRows(agent.value.creditLimits[creditCurrency.value])
})

function goCredit() {
  if (!agent.value) return
  router.push({
    name: 'mobile-xcoin-credit-agent',
    query: {
      targetId: agent.value.id,
      targetName: getAgentDisplayName(agent.value),
      currency: creditCurrency.value,
    },
  })
}

function pickCurrency(value: AgentWalletCurrency) {
  setAgentAppCurrencyByUser(value)
  currencyPickerOpen.value = false
}

function pickCreditCurrency(value: AgentCreditCurrency) {
  setAgentAppCreditCurrency(value)
}

function toggleProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = false
  profitFormulaTipOpen.value = !profitFormulaTipOpen.value
}

function toggleGameProfitFormulaTip() {
  profitFormulaTipOpen.value = false
  gameProfitFormulaTipOpen.value = !gameProfitFormulaTipOpen.value
}

function closeProfitFormulaTips() {
  profitFormulaTipOpen.value = false
  gameProfitFormulaTipOpen.value = false
}
</script>

<template>
  <div class="mh5-agent-detail-page">
    <Mh5SubPageHeader :title="$t('代理详情')">
      <template #right>
        <div class="mh5-agent-detail-header-actions">
          <Mh5SpecAnnot
            v-if="!isRebateAgent"
            :spec="AGENT_DETAIL_CREDIT_CURRENCY_SPEC"
            placement="bottom"
          />
          <button
            type="button"
            class="mh5-agent-detail-currency"
            :aria-label="$t('切换币种')"
            @click="currencyPickerOpen = true"
          >
            <span>{{ currency }}</span>
            <span class="mh5-agent-detail-currency__chevron">▾</span>
          </button>
        </div>
      </template>
    </Mh5SubPageHeader>

    <main v-if="agent" class="mh5-agent-detail-main">
      <section class="mh5-agent-detail-profile">
        <div class="mh5-agent-detail-profile__top">
          <div class="mh5-agent-detail-profile__avatar">{{ agent.avatarEmoji }}</div>
          <div class="mh5-agent-detail-profile__info">
            <div class="mh5-agent-detail-profile__name-row">
              <h2 class="mh5-agent-detail-profile__name">{{ agent.nickname }}</h2>
              <span class="mh5-agent-detail-profile__badge">{{ agent.levelBadge }}</span>
            </div>
            <p class="mh5-agent-detail-profile__login">最近登陆 {{ agent.lastLogin }}</p>
          </div>
        </div>
        <div class="mh5-agent-detail-profile__stats">
          <div v-for="item in statItems" :key="item.label" class="mh5-agent-detail-stat">
            <p class="mh5-agent-detail-stat__value">{{ item.value }}</p>
            <p class="mh5-agent-detail-stat__label">{{ item.label }}</p>
          </div>
        </div>
      </section>

      <div class="mh5-agent-detail-tabs-row">
        <div class="mh5-agent-detail-tabs" role="tablist" aria-label="代理详情分类">
          <template v-for="tab in detailTabs" :key="tab.key">
            <button
              type="button"
              role="tab"
              class="mh5-agent-detail-tab"
              :class="{ 'mh5-agent-detail-tab--active': activeTab === tab.key }"
              :aria-selected="activeTab === tab.key"
              @click="onDetailTabClick(tab.key)"
            >
              {{ tab.label }}
            </button>
            <span
              v-if="tab.key === 'game' && isRebateAgent"
              class="mh5-agent-detail-tab-annot"
            >
              <Mh5SpecAnnot :spec="AGENT_DETAIL_GAME_DATA_SPEC" placement="bottom" />
            </span>
          </template>
        </div>
      </div>

      <template v-if="activeTab === 'wallet'">
        <section
          v-for="group in cashWalletGroups"
          :key="group.currency"
          class="mh5-agent-detail-wallet mh5-agent-detail-xcoin"
        >
          <div class="mh5-agent-detail-wallet__head">
            <h3 class="mh5-agent-detail-wallet__title">{{ group.title }}</h3>
          </div>
          <div
            v-for="item in group.rows"
            :key="`${group.currency}-${item.label}`"
            class="mh5-agent-detail-wallet__row"
          >
            <span class="mh5-agent-detail-wallet__label">{{ item.label }}</span>
            <span class="mh5-agent-detail-wallet__value">{{ item.value }}</span>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'credit'">
        <nav
          class="mh5-agent-profit-ratio-seg mh5-agent-detail-credit-seg"
          role="tablist"
          aria-label="信用额度币种"
        >
          <button
            v-for="tab in AGENT_CREDIT_CURRENCY_TABS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-agent-profit-ratio-seg__item"
            :class="{ 'mh5-agent-profit-ratio-seg__item--active': creditCurrency === tab.key }"
            :aria-selected="creditCurrency === tab.key"
            @click="pickCreditCurrency(tab.key)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <section class="mh5-agent-detail-wallet mh5-agent-detail-xcoin">
          <div class="mh5-agent-detail-wallet__head">
            <h3 class="mh5-agent-detail-wallet__title">{{ creditLimitTitle }}</h3>
            <button type="button" class="mh5-agent-detail-wallet__action" @click="goCredit">
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
          <div
            v-for="item in creditLimitItems"
            :key="item.label"
            class="mh5-agent-detail-wallet__row"
          >
            <span class="mh5-agent-detail-wallet__label">{{ item.label }}</span>
            <span
              class="mh5-agent-detail-wallet__value"
              :class="{ 'mh5-agent-detail-wallet__value--positive': item.positive }"
            >
              {{ item.value }}
            </span>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'profit'">
        <section
          v-if="!useProfitSections"
          class="mh5-agent-detail-profit"
          @click="closeProfitFormulaTips"
        >
          <section
            class="mh5-agent-report-summary mh5-agent-detail-profit-team-flow"
            aria-label="团队充提总额"
          >
            <div
              v-for="row in profitFlowRows"
              :key="row.label"
              class="mh5-agent-report-summary-card"
            >
              <p class="mh5-agent-report-summary-card__label">{{ row.label }}</p>
              <p class="mh5-agent-report-summary-card__value">{{ row.value }}</p>
            </div>
          </section>
          <section class="mh5-agent-detail-wallet mh5-agent-detail-profit-summary">
            <div class="mh5-agent-detail-wallet__row mh5-agent-detail-profit-summary__total">
              <span class="mh5-agent-detail-profit-summary__label-wrap">
                <span class="mh5-agent-detail-wallet__label">{{ profitTabLabel }}</span>
                <button
                  type="button"
                  class="mh5-agent-detail-profit-summary__tip-btn"
                  :aria-label="`查看${profitTabLabel}计算公式`"
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
                  {{ profitTabFormula }}
                </span>
              </span>
              <span
                class="mh5-agent-detail-wallet__value"
                :class="{
                  'mh5-agent-detail-wallet__value--positive': agentTotalProfit.tone === 'positive',
                  'mh5-agent-detail-wallet__value--negative': agentTotalProfit.tone === 'negative',
                }"
              >
                {{ agentTotalProfit.value }}
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
          class="mh5-agent-detail-profit mh5-agent-my-profit-main mh5-agent-my-profit-main--rebate"
        >
          <section
            class="mh5-agent-report-summary mh5-agent-detail-profit-team-flow"
            aria-label="团队充提总额"
          >
            <div
              v-for="row in profitFlowRows"
              :key="row.label"
              class="mh5-agent-report-summary-card"
            >
              <p class="mh5-agent-report-summary-card__label">{{ row.label }}</p>
              <p class="mh5-agent-report-summary-card__value">{{ row.value }}</p>
            </div>
          </section>
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
            aria-label="其他成本金额"
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
                aria-label="展开或收起其他成本细项"
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
            aria-label="游戏净输赢减去其他成本等于总盈亏"
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
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">−</span>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">其他成本</p>
                <p class="mh5-agent-commission-cell__value mh5-agent-my-profit__amount--negative">
                  {{ profitFormula.costAmountText }}
                </p>
              </div>
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">=</span>
              <button
                type="button"
                class="mh5-agent-commission-cell mh5-agent-my-profit-formula__result"
                aria-label="查看总盈亏明细"
                @click="openProfitDialog('total')"
              >
                <p class="mh5-agent-commission-cell__label">总盈亏</p>
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

      <section
        v-else-if="activeTab === 'game'"
        class="mh5-agent-detail-profit"
        @click="closeProfitFormulaTips"
      >
        <!-- 返佣：结构对齐「我的报表」游戏明细 -->
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
            <div v-if="reportCategory !== 'all'" class="mh5-agent-report-vendors">
              <button
                v-for="pill in REPORT_VENDOR_PILLS"
                :key="pill.key"
                type="button"
                class="mh5-agent-report-vendor"
                :class="{ 'mh5-agent-report-vendor--active': reportVendor === pill.key }"
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

        <!-- 占成：原品类 / 场馆结构 -->
        <template v-else>
          <div class="mh5-agent-report-categories">
            <div class="mh5-agent-report-cat-tabs" role="tablist" aria-label="游戏数据品类">
              <button
                v-for="tab in AGENT_PROFIT_CATEGORY_TABS"
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
            <div v-if="profitVendorOptions.length" class="mh5-agent-report-vendors">
              <button
                v-for="pill in profitVendorOptions"
                :key="pill.key"
                type="button"
                class="mh5-agent-report-vendor"
                :class="{ 'mh5-agent-report-vendor--active': profitVendor === pill.key }"
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
                    {{ AGENT_GAME_PROFIT_FORMULA }}
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

      <section v-else class="mh5-agent-detail-placeholder">
        <p>暂无登录日志</p>
        <span>最近 30 天登录 IP 与设备记录（原型占位）</span>
      </section>
    </main>

    <main v-else class="mh5-agent-detail-main">
      <p class="mh5-agent-detail-empty">未找到该代理信息</p>
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
                实占细项
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

    <Transition name="mh5-agent-detail-sheet">
      <div
        v-if="currencyPickerOpen"
        class="mh5-xcoin-sheet-mask"
        @click.self="currencyPickerOpen = false"
      >
        <div class="mh5-xcoin-sheet">
          <h2 class="mh5-xcoin-sheet__title">选择币种</h2>
          <button
            v-for="opt in currencyOptions"
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
  </div>
</template>

<style scoped>
.mh5-agent-detail-sheet-enter-active,
.mh5-agent-detail-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-agent-detail-sheet-enter-active .mh5-xcoin-sheet,
.mh5-agent-detail-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-agent-detail-sheet-enter-from,
.mh5-agent-detail-sheet-leave-to {
  opacity: 0;
}

.mh5-agent-detail-sheet-enter-from .mh5-xcoin-sheet,
.mh5-agent-detail-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
