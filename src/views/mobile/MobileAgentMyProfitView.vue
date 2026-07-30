<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_MY_PROFIT_ASSETS,
  AGENT_MY_PROFIT_FOOTNOTE,
  AGENT_MY_PROFIT_PRODUCT_ROWS,
  AGENT_MY_PROFIT_REBATE_FOOTNOTE,
  AGENT_MY_PROFIT_REBATE_LEVEL_TABS,
  AGENT_MY_PROFIT_SUMMARY_ROW,
  AGENT_MY_PROFIT_TOTAL,
  REBATE_DEFAULT_SECTION_SCALE,
  REBATE_EXTRA_COMMISSION_RATE,
  agentMyProfitAmountHeader,
  agentMyProfitDateFilterLabel,
  agentMyProfitDateRangeText,
  agentMyProfitDefaultPreset,
  agentMyProfitDetailRows,
  agentMyProfitDialogLabelHeader,
  agentMyProfitHasDetail,
  agentMyProfitPageTitle,
  agentMyProfitPresets,
  agentMyProfitRebateCostSection,
  agentMyProfitRebateGameSection,
  agentMyProfitRebateExtraCommission,
  agentMyProfitRebateLevelFormula,
  agentMyProfitRebateMonthKey,
  agentMyProfitRebateSummaryRow,
  agentMyProfitTableNameHeader,
  agentMyProfitToneClass,
  type AgentMyProfitProductRow,
  type ProfitDatePreset,
  type RebateProfitLevel,
  type RebateSectionScale,
} from '../../constants/agentMyProfit'
import {
  COMMISSION_NEGATIVE_TIP,
  COMMISSION_STATUS_META,
  COMMISSION_TOTAL_TIP,
  commissionHeroTitle,
  commissionTone,
  findCommissionBill,
  formatCommissionAmount,
} from '../../constants/agentCommissionReport'
import { agentAppCurrency } from '../../constants/agentAppCurrency'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const { agentType, isRebateAgent, withAgentQuery } = useAgentIdentity()

const preset = ref<ProfitDatePreset>(agentMyProfitDefaultPreset(agentType.value))
const rebateLevel = ref<RebateProfitLevel>('l1')
const detailProduct = ref<AgentMyProfitProductRow | null>(null)
const detailFormulaTipOpen = ref(false)
const totalTipOpen = ref(false)
const netWinTipOpen = ref(false)
const negativeTipOpen = ref(false)
/** 游戏净输赢 / 其他成本：合计下展开细项 */
const gameDetailsExpanded = ref(false)
const costDetailsExpanded = ref(false)

const dateFilterLabel = computed(() => agentMyProfitDateFilterLabel(agentType.value))
const datePresets = computed(() => agentMyProfitPresets(agentType.value))
const dateRangeText = computed(() => agentMyProfitDateRangeText(preset.value))
const currency = agentAppCurrency
const rebateMonthKey = computed(() => agentMyProfitRebateMonthKey(preset.value))
const rebateCommissionBill = computed(() => findCommissionBill(rebateMonthKey.value))
const rebateHeroTitle = computed(() => commissionHeroTitle(rebateMonthKey.value))
/** 负佣金累计仅本月「预计佣金」展示与计入总佣金 */
const showRebateNegativeAccum = computed(() => rebateHeroTitle.value === '预计佣金')
const rebateNegativeAccum = computed(() => rebateCommissionBill.value?.negativeAccum ?? 0)
const rebateNegativeForTotal = computed(() =>
  showRebateNegativeAccum.value ? rebateNegativeAccum.value : 0,
)
const rebateSectionScale = computed<RebateSectionScale>(() => {
  const bill = rebateCommissionBill.value
  if (!bill) return REBATE_DEFAULT_SECTION_SCALE
  return {
    gameTotal: bill.totalPnl,
    costTotal: -Math.abs(bill.totalCost),
  }
})
const rebateCommissionRate = computed(() => rebateCommissionBill.value?.commissionRate ?? '5.00%')
const totalBlock = computed(() => AGENT_MY_PROFIT_TOTAL)

watch(preset, () => {
  totalTipOpen.value = false
  netWinTipOpen.value = false
  negativeTipOpen.value = false
  gameDetailsExpanded.value = false
  costDetailsExpanded.value = false
})

watch(rebateLevel, () => {
  netWinTipOpen.value = false
  negativeTipOpen.value = false
  gameDetailsExpanded.value = false
  costDetailsExpanded.value = false
})
const productRows = computed(() => AGENT_MY_PROFIT_PRODUCT_ROWS)
const rebateGameSection = computed(() =>
  agentMyProfitRebateGameSection(rebateLevel.value, rebateSectionScale.value),
)
const rebateCostSection = computed(() =>
  agentMyProfitRebateCostSection(rebateLevel.value, rebateSectionScale.value),
)
const rebateLevelFormula = computed(() =>
  agentMyProfitRebateLevelFormula(
    rebateLevel.value,
    rebateCommissionRate.value,
    rebateSectionScale.value,
  ),
)
const levelSummaryRow = computed(() => rebateLevelFormula.value.levelRow)
/** 公式卡结果列统一为「佣金」 */
const rebateFormulaResultLabel = '佣金'
const rebateL1Formula = computed(() =>
  agentMyProfitRebateLevelFormula('l1', rebateCommissionRate.value, rebateSectionScale.value),
)
const rebateL2Formula = computed(() =>
  agentMyProfitRebateLevelFormula('l2', rebateCommissionRate.value, rebateSectionScale.value),
)
const rebateL3Formula = computed(() =>
  agentMyProfitRebateLevelFormula('l3', rebateCommissionRate.value, rebateSectionScale.value),
)
/** 当月佣金 = 直属佣金 */
const rebateMonthCommission = computed(() => rebateL1Formula.value.monthCommission)
/** 额外佣金 = 下一级 + 下二级 */
const rebateExtraCommission = computed(() =>
  agentMyProfitRebateExtraCommission(rebateCommissionRate.value, rebateSectionScale.value),
)
const showExtraCommissionRate = computed(
  () => rebateLevel.value === 'l2' || rebateLevel.value === 'l3',
)
/** 总佣金 = 当月 + 额外（+ 本月预计时的负佣金累计） */
const rebateTotalCommission = computed(() =>
  Number(
    (
      rebateMonthCommission.value +
      rebateExtraCommission.value +
      rebateNegativeForTotal.value
    ).toFixed(2),
  ),
)
const rebateHeroAmount = computed(() => formatCommissionAmount(rebateTotalCommission.value))
const summaryRow = computed(() => {
  if (!isRebateAgent.value) return AGENT_MY_PROFIT_SUMMARY_ROW
  return agentMyProfitRebateSummaryRow(
    rebateMonthCommission.value,
    rebateExtraCommission.value,
    rebateNegativeForTotal.value,
  )
})
const rebateDetailContext = computed(() => ({
  l1Commission: rebateL1Formula.value.monthCommission,
  l2Commission: rebateL2Formula.value.monthCommission,
  l3Commission: rebateL3Formula.value.monthCommission,
  monthCommission: rebateMonthCommission.value,
  extraCommission: rebateExtraCommission.value,
  negativeAccum: rebateNegativeAccum.value,
  includeNegativeAccum: showRebateNegativeAccum.value,
  gameTotal: rebateSectionScale.value.gameTotal,
}))
const rebateTotalTip = computed(() =>
  showRebateNegativeAccum.value
    ? COMMISSION_TOTAL_TIP
    : '总佣金 = 当月佣金 + 额外佣金\n当月佣金 = 直属佣金\n额外佣金 = 下一级佣金 + 下二级佣金',
)
const footnoteLines = computed(() =>
  (isRebateAgent.value ? AGENT_MY_PROFIT_REBATE_FOOTNOTE : AGENT_MY_PROFIT_FOOTNOTE).split('\n'),
)
const pageTitle = computed(() => agentMyProfitPageTitle(agentType.value))
const tableNameHeader = computed(() => agentMyProfitTableNameHeader(agentType.value))
const amountHeader = computed(() => agentMyProfitAmountHeader(agentType.value))
const dialogLabelHeader = computed(() => agentMyProfitDialogLabelHeader(agentType.value))
const tableAriaLabel = computed(() =>
  isRebateAgent.value ? '游戏净输赢与其他成本' : '占成项盈亏',
)

const detailTitle = computed(() => {
  if (!detailProduct.value) return isRebateAgent.value ? '佣金明细' : '盈亏明细'
  if (detailProduct.value.key === 'total') {
    return isRebateAgent.value ? '总佣金明细' : '总计盈亏明细'
  }
  if (detailProduct.value.key.startsWith('level_')) {
    const tab = AGENT_MY_PROFIT_REBATE_LEVEL_TABS.find((item) => `level_${item.key}` === detailProduct.value?.key)
    return tab ? `${tab.label}明细` : '本级佣金明细'
  }
  return `${detailProduct.value.name}明细`
})
const detailRows = computed(() =>
  detailProduct.value
    ? agentMyProfitDetailRows(
        detailProduct.value.key,
        agentType.value,
        rebateLevel.value,
        isRebateAgent.value ? rebateDetailContext.value : undefined,
      )
    : [],
)
const detailFormulaText = computed(
  () => detailRows.value.find((row) => row.formulaTip)?.formulaTip ?? '',
)

function closeDetail() {
  detailFormulaTipOpen.value = false
  detailProduct.value = null
}

function toggleDetailFormulaTip() {
  detailFormulaTipOpen.value = !detailFormulaTipOpen.value
}

function closeDetailFormulaTip() {
  detailFormulaTipOpen.value = false
}

function toggleTotalTip() {
  totalTipOpen.value = !totalTipOpen.value
}

function closeTotalTip() {
  totalTipOpen.value = false
}

function toggleNetWinTip() {
  netWinTipOpen.value = !netWinTipOpen.value
}

function closeNetWinTip() {
  netWinTipOpen.value = false
}

function toggleNegativeTip() {
  negativeTipOpen.value = !negativeTipOpen.value
}

function closeNegativeTip() {
  negativeTipOpen.value = false
}

function closeHeroTips() {
  closeTotalTip()
  closeNegativeTip()
}

function onTotalTipClick() {
  closeNegativeTip()
  toggleTotalTip()
}

function onNegativeTipClick() {
  closeTotalTip()
  toggleNegativeTip()
}

function openTotalDetail() {
  closeHeroTips()
  openDetail(summaryRow.value)
}

function pickPreset(key: ProfitDatePreset) {
  preset.value = key
  closeTotalTip()
  closeNetWinTip()
}

function statusClass(status: keyof typeof COMMISSION_STATUS_META) {
  return `mh5-agent-commission-status--${COMMISSION_STATUS_META[status].tone}`
}

function commissionToneClass(value: number) {
  const tone = commissionTone(value)
  if (tone === 'positive') return 'mh5-agent-commission-v--pos'
  if (tone === 'negative') return 'mh5-agent-commission-v--neg'
  return ''
}

/** 明确回到代理概况，避免 history.back 异常或 Teleport 遮罩残留导致首页空白 */
function goBack() {
  closeDetail()
  closeTotalTip()
  closeNetWinTip()
  closeNegativeTip()
  const from = typeof route.query.from === 'string' ? route.query.from : undefined
  router.push({
    name: 'mobile-agent',
    query: withAgentQuery(from ? { from } : {}),
  })
}

function openDetail(row: AgentMyProfitProductRow) {
  if (!agentMyProfitHasDetail(row.key, agentType.value)) return
  closeDetailFormulaTip()
  detailProduct.value = row
}

function switchRebateLevel(level: RebateProfitLevel) {
  rebateLevel.value = level
  closeDetail()
  closeNetWinTip()
}

function toggleGameDetails() {
  gameDetailsExpanded.value = !gameDetailsExpanded.value
}

function toggleCostDetails() {
  costDetailsExpanded.value = !costDetailsExpanded.value
}

onBeforeUnmount(() => {
  closeDetail()
  closeDetailFormulaTip()
  closeTotalTip()
  closeNetWinTip()
  closeNegativeTip()
})
</script>

<template>
  <!-- Figma 1433:17568 · 代理中心-首页-我的盈亏；返佣身份展示为「我的佣金」 -->
  <div
    class="mh5-agent-my-profit-page"
    :data-name="isRebateAgent ? '代理中心-首页-我的佣金' : '代理中心-首页-我的盈亏'"
    :data-agent-type="agentType"
    @click="closeHeroTips"
  >
    <div class="mh5-agent-my-profit-hero">
      <header class="mh5-agent-my-profit-nav">
        <button type="button" class="mh5-agent-my-profit-nav__back" aria-label="返回" @click="goBack">
          <img :src="AGENT_MY_PROFIT_ASSETS.backIcon" alt="" width="24" height="24" />
        </button>
        <h1 class="mh5-agent-my-profit-nav__title">{{ pageTitle }}</h1>
        <div class="mh5-agent-my-profit-nav__right" aria-hidden="true" />
      </header>

      <!-- 返佣：对齐佣金详情卡（预计/发放 + 状态 + 总佣金币种 tip + 金额） -->
      <section
        v-if="isRebateAgent && rebateCommissionBill"
        class="mh5-agent-my-profit-total mh5-agent-my-profit-total--commission"
        :aria-label="rebateHeroTitle"
        @click.stop
      >
        <div class="mh5-agent-commission-hero__head">
          <span class="mh5-agent-commission-hero__title">{{ rebateHeroTitle }}</span>
          <span
            class="mh5-agent-commission-status"
            :class="statusClass(rebateCommissionBill.status)"
          >
            {{ COMMISSION_STATUS_META[rebateCommissionBill.status].label }}
          </span>
        </div>
        <div
          class="mh5-agent-commission-hero__body mh5-agent-my-profit-hero-metrics"
          :class="{ 'mh5-agent-my-profit-hero-metrics--with-neg': showRebateNegativeAccum }"
        >
          <div class="mh5-agent-my-profit-hero-metric">
            <p class="mh5-agent-commission-hero__unit">
              <span class="mh5-agent-commission-tip-wrap mh5-agent-commission-tip-wrap--center">
                总佣金({{ currency }})
                <button
                  type="button"
                  class="mh5-agent-commission-q"
                  aria-label="查看总佣金说明"
                  :aria-expanded="totalTipOpen"
                  @click.stop="onTotalTipClick"
                >
                  ?
                </button>
                <span
                  v-if="totalTipOpen"
                  class="mh5-agent-commission-tip-bubble"
                  :class="
                    showRebateNegativeAccum
                      ? 'mh5-agent-commission-tip-bubble--start'
                      : 'mh5-agent-commission-tip-bubble--center'
                  "
                  role="tooltip"
                >
                  {{ rebateTotalTip }}
                </span>
              </span>
            </p>
            <button
              type="button"
              class="mh5-agent-commission-hero__amount mh5-agent-my-profit-hero-amount-btn"
              aria-label="查看总佣金明细"
              @click="openTotalDetail"
            >
              <span>{{ rebateHeroAmount }}</span>
              <span class="mh5-agent-my-profit-hero-amount-btn__arrow" aria-hidden="true">›</span>
            </button>
          </div>
          <div
            v-if="showRebateNegativeAccum"
            class="mh5-agent-my-profit-hero-metric mh5-agent-my-profit-hero-metric--neg"
          >
            <p class="mh5-agent-commission-hero__unit">
              <span class="mh5-agent-commission-tip-wrap">
                负佣金累计
                <button
                  type="button"
                  class="mh5-agent-commission-q"
                  aria-label="查看负佣金累计说明"
                  :aria-expanded="negativeTipOpen"
                  @click.stop="onNegativeTipClick"
                >
                  ?
                </button>
                <span
                  v-if="negativeTipOpen"
                  class="mh5-agent-commission-tip-bubble mh5-agent-commission-tip-bubble--end"
                  role="tooltip"
                >
                  {{ COMMISSION_NEGATIVE_TIP }}
                </span>
              </span>
            </p>
            <p
              class="mh5-agent-commission-hero__amount mh5-agent-my-profit-hero-metric__neg-amount"
              :class="commissionToneClass(rebateNegativeAccum)"
            >
              {{
                formatCommissionAmount(rebateNegativeAccum, {
                  signed: rebateNegativeAccum < 0,
                })
              }}
            </p>
          </div>
        </div>
      </section>

      <section v-else class="mh5-agent-my-profit-total" :aria-label="totalBlock.label">
        <img
          class="mh5-agent-my-profit-total__deco"
          :src="AGENT_MY_PROFIT_ASSETS.decoCoin"
          alt=""
          aria-hidden="true"
        />
        <p class="mh5-agent-my-profit-total__label">{{ totalBlock.label }}</p>
        <p
          class="mh5-agent-my-profit-total__value"
          :class="agentMyProfitToneClass(totalBlock.tone)"
        >
          {{ totalBlock.valueText }}
        </p>
      </section>

      <div class="mh5-agent-my-profit-date">
        <div class="mh5-agent-my-profit-date__row">
          <p class="mh5-agent-my-profit-date__label">{{ dateFilterLabel }}</p>
          <div class="mh5-agent-my-profit-date__picker">
            <div class="mh5-agent-my-profit-date__range">
              <p>{{ dateRangeText }}</p>
            </div>
            <span class="mh5-agent-my-profit-date__icon" aria-hidden="true">
              <img :src="AGENT_MY_PROFIT_ASSETS.calendarIcon" alt="" width="34" height="34" />
            </span>
          </div>
        </div>
        <div class="mh5-agent-my-profit-date__presets" role="tablist" aria-label="快捷时间">
          <button
            v-for="item in datePresets"
            :key="item.key"
            type="button"
            role="tab"
            class="mh5-agent-my-profit-date__preset"
            :class="{ 'mh5-agent-my-profit-date__preset--active': preset === item.key }"
            :aria-selected="preset === item.key"
            @click="pickPreset(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <main class="mh5-agent-my-profit-main" :class="{ 'mh5-agent-my-profit-main--rebate': isRebateAgent }">
      <!-- 返佣：级次 Tab + 明细表 + 公式 + 汇总 -->
      <template v-if="isRebateAgent">
        <div
          class="mh5-agent-my-profit-level-tabs"
          role="tablist"
          aria-label="代理佣金级次"
        >
          <button
            v-for="tab in AGENT_MY_PROFIT_REBATE_LEVEL_TABS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-agent-my-profit-level-tab"
            :class="{ 'mh5-agent-my-profit-level-tab--active': rebateLevel === tab.key }"
            :aria-selected="rebateLevel === tab.key"
            @click="switchRebateLevel(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <section
          class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
          aria-label="游戏净输赢金额"
        >
          <div class="mh5-agent-my-profit-table__head">
            <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
              {{ rebateGameSection.nameHeader }}
            </span>
            <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
              {{ rebateGameSection.amountHeader }}
            </span>
          </div>
          <button
            type="button"
            class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
            :aria-expanded="gameDetailsExpanded"
            aria-label="展开或收起游戏净输赢细项"
            @click="toggleGameDetails"
          >
            <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron">
              <span>{{ rebateGameSection.total.name }}</span>
              <span
                class="mh5-agent-my-profit-table__chevron"
                :class="{ 'mh5-agent-my-profit-table__chevron--open': gameDetailsExpanded }"
                aria-hidden="true"
              >
                ▾
              </span>
            </span>
            <span
              class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
              :class="agentMyProfitToneClass(rebateGameSection.total.tone)"
            >
              {{ rebateGameSection.total.amountText }}
            </span>
          </button>
          <Transition name="mh5-agent-my-profit-expand">
            <div v-if="gameDetailsExpanded" class="mh5-agent-my-profit-table__details">
              <component
                :is="agentMyProfitHasDetail(row.key, agentType) ? 'button' : 'div'"
                v-for="(row, index) in rebateGameSection.rows"
                :key="`${rebateLevel}-${row.key}`"
                :type="agentMyProfitHasDetail(row.key, agentType) ? 'button' : undefined"
                class="mh5-agent-my-profit-table__row"
                :class="{
                  'mh5-agent-my-profit-table__row--alt': index % 2 === 1,
                  'mh5-agent-my-profit-table__row--static': !agentMyProfitHasDetail(row.key, agentType),
                }"
                @click="openDetail(row)"
              >
                <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                  {{ row.name }}
                </span>
                <span
                  class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
                  :class="[
                    agentMyProfitToneClass(row.tone),
                    { 'mh5-agent-my-profit-table__link': agentMyProfitHasDetail(row.key, agentType) },
                  ]"
                >
                  {{ row.amountText }}
                </span>
              </component>
            </div>
          </Transition>
        </section>

        <section
          class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
          aria-label="其他成本金额"
        >
          <div class="mh5-agent-my-profit-table__head">
            <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
              {{ rebateCostSection.nameHeader }}
            </span>
            <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
              {{ rebateCostSection.amountHeader }}
            </span>
          </div>
          <button
            type="button"
            class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
            :aria-expanded="costDetailsExpanded"
            aria-label="展开或收起其他成本细项"
            @click="toggleCostDetails"
          >
            <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron">
              <span>{{ rebateCostSection.total.name }}</span>
              <span
                class="mh5-agent-my-profit-table__chevron"
                :class="{ 'mh5-agent-my-profit-table__chevron--open': costDetailsExpanded }"
                aria-hidden="true"
              >
                ▾
              </span>
            </span>
            <span
              class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
              :class="agentMyProfitToneClass(rebateCostSection.total.tone)"
            >
              {{ rebateCostSection.total.amountText }}
            </span>
          </button>
          <Transition name="mh5-agent-my-profit-expand">
            <div v-if="costDetailsExpanded" class="mh5-agent-my-profit-table__details">
              <component
                :is="agentMyProfitHasDetail(row.key, agentType) ? 'button' : 'div'"
                v-for="(row, index) in rebateCostSection.rows"
                :key="`${rebateLevel}-${row.key}`"
                :type="agentMyProfitHasDetail(row.key, agentType) ? 'button' : undefined"
                class="mh5-agent-my-profit-table__row"
                :class="{
                  'mh5-agent-my-profit-table__row--alt': index % 2 === 1,
                  'mh5-agent-my-profit-table__row--static': !agentMyProfitHasDetail(row.key, agentType),
                }"
                @click="openDetail(row)"
              >
                <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                  {{ row.name }}
                </span>
                <span
                  class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
                  :class="[
                    agentMyProfitToneClass(row.tone),
                    { 'mh5-agent-my-profit-table__link': agentMyProfitHasDetail(row.key, agentType) },
                  ]"
                >
                  {{ row.amountText }}
                </span>
              </component>
            </div>
          </Transition>
        </section>

        <!-- 直属：净输赢×佣金比例；下一级/下二级：再×额外佣金比例 -->
        <section
          class="mh5-agent-my-profit-formula-card"
          :class="{ 'mh5-agent-my-profit-formula-card--extra': showExtraCommissionRate }"
          :aria-label="
            showExtraCommissionRate
              ? '净输赢乘以佣金比例再乘以额外佣金比例等于本级佣金'
              : '净输赢乘以佣金比例等于佣金'
          "
          @click.stop
        >
          <div
            class="mh5-agent-commission-formula mh5-agent-my-profit-formula"
            :class="{ 'mh5-agent-my-profit-formula--extra': showExtraCommissionRate }"
          >
            <div class="mh5-agent-commission-cell">
              <p class="mh5-agent-commission-cell__label">
                <span class="mh5-agent-commission-tip-wrap">
                  净输赢
                  <button
                    type="button"
                    class="mh5-agent-commission-q"
                    aria-label="查看净输赢说明"
                    :aria-expanded="netWinTipOpen"
                    @click.stop="toggleNetWinTip"
                  >
                    ?
                  </button>
                  <span
                    v-if="netWinTipOpen"
                    class="mh5-agent-commission-tip-bubble"
                    role="tooltip"
                  >
                    净输赢 = 游戏净输赢 - 其他成本
                  </span>
                </span>
              </p>
              <p
                class="mh5-agent-commission-cell__value"
                :class="commissionToneClass(rebateLevelFormula.netWin)"
              >
                {{ formatCommissionAmount(rebateLevelFormula.netWin) }}
              </p>
            </div>
            <span class="mh5-agent-commission-formula__op" aria-hidden="true">×</span>
            <div class="mh5-agent-commission-cell">
              <p class="mh5-agent-commission-cell__label">佣金比例</p>
              <p class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__rate">
                {{ rebateLevelFormula.commissionRate }}
              </p>
            </div>
            <template v-if="showExtraCommissionRate">
              <span class="mh5-agent-commission-formula__op" aria-hidden="true">×</span>
              <div class="mh5-agent-commission-cell">
                <p class="mh5-agent-commission-cell__label">额外比例</p>
                <p class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__rate">
                  {{ rebateLevelFormula.extraCommissionRate ?? REBATE_EXTRA_COMMISSION_RATE }}
                </p>
              </div>
            </template>
            <span class="mh5-agent-commission-formula__op" aria-hidden="true">=</span>
            <button
              type="button"
              class="mh5-agent-commission-cell mh5-agent-my-profit-formula__result"
              :aria-label="`查看${rebateFormulaResultLabel}明细`"
              @click="openDetail(levelSummaryRow)"
            >
              <p class="mh5-agent-commission-cell__label">{{ rebateFormulaResultLabel }}</p>
              <p
                class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__result-value"
                :class="commissionToneClass(rebateLevelFormula.monthCommission)"
              >
                {{ formatCommissionAmount(rebateLevelFormula.monthCommission) }}
              </p>
            </button>
          </div>
        </section>
      </template>

      <section v-else class="mh5-agent-my-profit-table" :aria-label="tableAriaLabel">
        <div class="mh5-agent-my-profit-table__head">
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
            {{ tableNameHeader }}
          </span>
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
            {{ amountHeader }}
          </span>
        </div>
        <component
          :is="agentMyProfitHasDetail(row.key, agentType) ? 'button' : 'div'"
          v-for="(row, index) in productRows"
          :key="row.key"
          :type="agentMyProfitHasDetail(row.key, agentType) ? 'button' : undefined"
          class="mh5-agent-my-profit-table__row"
          :class="{
            'mh5-agent-my-profit-table__row--alt': index % 2 === 1,
            'mh5-agent-my-profit-table__row--static': !agentMyProfitHasDetail(row.key, agentType),
          }"
          @click="openDetail(row)"
        >
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
            {{ row.name }}
          </span>
          <span
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
            :class="[
              agentMyProfitToneClass(row.tone),
              { 'mh5-agent-my-profit-table__link': agentMyProfitHasDetail(row.key, agentType) },
            ]"
          >
            {{ row.amountText }}
          </span>
        </component>
      </section>

      <button
        v-if="!isRebateAgent"
        type="button"
        class="mh5-agent-my-profit-summary"
        :aria-label="`查看${summaryRow.name}明细`"
        @click="openDetail(summaryRow)"
      >
        <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
          {{ summaryRow.name }}
        </span>
        <span
          class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount mh5-agent-my-profit-table__link"
          :class="agentMyProfitToneClass(summaryRow.tone)"
        >
          {{ summaryRow.amountText }}
        </span>
      </button>

      <p class="mh5-agent-my-profit-footnote">
        <span v-for="(line, i) in footnoteLines" :key="i">
          {{ line }}<br v-if="i < footnoteLines.length - 1" />
        </span>
      </p>
    </main>

    <Transition name="mh5-agent-my-profit-dialog">
      <div
        v-if="detailProduct"
        class="mh5-agent-my-profit-dialog-mask"
        @click.self="closeDetail"
      >
        <div
          class="mh5-agent-my-profit-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="detailTitle"
          @click="closeDetailFormulaTip"
        >
          <h2 class="mh5-agent-my-profit-dialog__title">{{ detailTitle }}</h2>
          <div class="mh5-agent-my-profit-dialog__table">
            <div class="mh5-agent-my-profit-dialog__head">
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--label">
                {{ dialogLabelHeader }}
              </span>
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--value">
                金额
              </span>
            </div>
            <div
              v-for="row in detailRows"
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
                    :aria-expanded="detailFormulaTipOpen"
                    @click.stop="toggleDetailFormulaTip"
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
                <small v-if="row.labelHint">{{ row.labelHint }}</small>
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
            v-if="detailFormulaTipOpen && detailFormulaText"
            class="mh5-agent-my-profit-dialog__tip-panel"
            role="tooltip"
            @click.stop
          >
            {{ detailFormulaText }}
          </div>
          <button type="button" class="mh5-agent-my-profit-dialog__btn" @click="closeDetail">
            我知道了
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
