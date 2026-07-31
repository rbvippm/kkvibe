<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_MY_PROFIT_ASSETS,
  AGENT_MY_PROFIT_FOOTNOTE,
  AGENT_MY_PROFIT_REBATE_FOOTNOTE,
  AGENT_MY_PROFIT_TOTAL,
  REBATE_DEFAULT_SECTION_SCALE,
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
  agentMyProfitRebateLevelFormula,
  agentMyProfitRebateMonthKey,
  agentMyProfitRebatePresetFromMonthKey,
  agentMyProfitShareCostSection,
  agentMyProfitShareFormula,
  agentMyProfitShareGameSection,
  agentMyProfitToneClass,
  type AgentMyProfitProductRow,
  type ProfitDatePreset,
  type RebateSectionScale,
} from '../../constants/agentMyProfit'
import {
  COMMISSION_NEGATIVE_TIP,
  COMMISSION_STATUS_META,
  commissionHeroTitle,
  commissionTone,
  findCommissionBill,
  formatCommissionAmount,
  formatCommissionMonthLabel,
  getCommissionMonthOptions,
  getDefaultCommissionMonth,
} from '../../constants/agentCommissionReport'
import { agentAppCurrency } from '../../constants/agentAppCurrency'
import { AGENT_MY_PROFIT_SPEC } from '../../constants/agentMyProfitSpec'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import '../../styles/mobile-app-shell.css'

const props = withDefaults(
  defineProps<{
    /** 嵌入「我的报表」时隐藏独立顶栏，并由报表页承载导航 */
    embedded?: boolean
  }>(),
  { embedded: false },
)

const route = useRoute()
const router = useRouter()
const { agentType, isRebateAgent, withAgentQuery } = useAgentIdentity()

onMounted(() => {
  if (props.embedded) return
  /** 独立路由收敛到「我的报表 · 佣金/盈亏」 */
  router.replace({
    name: 'mobile-agent',
    query: withAgentQuery({
      ...(typeof route.query.from === 'string' && route.query.from
        ? { from: route.query.from }
        : {}),
      tab: 'report',
      reportTab: 'finance',
    }),
  })
})

const preset = ref<ProfitDatePreset>(agentMyProfitDefaultPreset(agentType.value))
/** 返佣结算月（月份选择与快捷 Tab 共用） */
const rebateMonth = ref(getDefaultCommissionMonth())
const detailProduct = ref<AgentMyProfitProductRow | null>(null)
const detailFormulaTipOpen = ref(false)
const netWinTipOpen = ref(false)
const negativeTipOpen = ref(false)
const monthSheetOpen = ref(false)
/** 游戏净输赢 / 其他成本：合计下展开细项 */
const gameDetailsExpanded = ref(false)
/** 其他成本细项默认展开 */
const costDetailsExpanded = ref(true)

const dateFilterLabel = computed(() => agentMyProfitDateFilterLabel(agentType.value))
const datePresets = computed(() => agentMyProfitPresets(agentType.value))
const rebateMonthOptions = computed(() => getCommissionMonthOptions())
const dateRangeText = computed(() =>
  isRebateAgent.value
    ? formatCommissionMonthLabel(rebateMonth.value)
    : agentMyProfitDateRangeText(preset.value),
)

const currency = agentAppCurrency
const rebateMonthKey = computed(() => rebateMonth.value)
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
  netWinTipOpen.value = false
  negativeTipOpen.value = false
  gameDetailsExpanded.value = false
  costDetailsExpanded.value = true
})

/** 游戏净输赢 / 其他成本：占成与返佣共用分区结构 */
const gameSection = computed(() =>
  isRebateAgent.value
    ? agentMyProfitRebateGameSection('l1', rebateSectionScale.value)
    : agentMyProfitShareGameSection(),
)
const costSection = computed(() =>
  isRebateAgent.value
    ? agentMyProfitRebateCostSection('l1', rebateSectionScale.value)
    : agentMyProfitShareCostSection(),
)
const rebateLevelFormula = computed(() =>
  agentMyProfitRebateLevelFormula(
    'l1',
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
/** 当月佣金 = 佣金 */
const rebateMonthCommission = computed(() => rebateL1Formula.value.monthCommission)
/** 总佣金 = 当月佣金 - 本月预计时的负佣金累计（若有）。 */
const rebateTotalCommission = computed(() =>
  Number(
    (rebateMonthCommission.value + rebateNegativeForTotal.value).toFixed(2),
  ),
)
const rebateHeroAmount = computed(() => formatCommissionAmount(rebateTotalCommission.value))
/** 占成公式：游戏净输赢 − 其他成本 = 总盈亏 */
const shareFormula = computed(() => agentMyProfitShareFormula())
const rebateDetailContext = computed(() => ({
  l1Commission: rebateL1Formula.value.monthCommission,
  monthCommission: rebateMonthCommission.value,
  negativeAccum: rebateNegativeAccum.value,
  includeNegativeAccum: showRebateNegativeAccum.value,
  gameTotal: rebateSectionScale.value.gameTotal,
}))
const footnoteLines = computed(() =>
  (isRebateAgent.value ? AGENT_MY_PROFIT_REBATE_FOOTNOTE : AGENT_MY_PROFIT_FOOTNOTE).split('\n'),
)
const pageTitle = computed(() => agentMyProfitPageTitle(agentType.value))
const dialogLabelHeader = computed(() => agentMyProfitDialogLabelHeader(agentType.value))

const detailTitle = computed(() => {
  if (!detailProduct.value) return isRebateAgent.value ? '佣金明细' : '盈亏明细'
  if (detailProduct.value.key === 'total') {
    return isRebateAgent.value ? '总佣金明细' : '总盈亏明细'
  }
  if (detailProduct.value.key.startsWith('level_')) {
    return '佣金明细'
  }
  return `${detailProduct.value.name}明细`
})
const detailRows = computed(() =>
  detailProduct.value
    ? agentMyProfitDetailRows(
        detailProduct.value.key,
        agentType.value,
        'l1',
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
  closeNegativeTip()
}

function onNegativeTipClick() {
  toggleNegativeTip()
}

function pickPreset(key: ProfitDatePreset) {
  preset.value = key
  if (isRebateAgent.value) {
    rebateMonth.value = agentMyProfitRebateMonthKey(key)
  }
  closeNetWinTip()
  closeNegativeTip()
}

function isPresetActive(key: ProfitDatePreset) {
  if (!isRebateAgent.value) return preset.value === key
  return agentMyProfitRebateMonthKey(key) === rebateMonth.value
}

function openMonthSheet() {
  if (!isRebateAgent.value) return
  closeHeroTips()
  monthSheetOpen.value = true
}

function closeMonthSheet() {
  monthSheetOpen.value = false
}

function pickRebateMonth(month: string) {
  rebateMonth.value = month
  const matched = agentMyProfitRebatePresetFromMonthKey(month)
  if (matched) preset.value = matched
  closeMonthSheet()
  closeNetWinTip()
  closeNegativeTip()
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
  closeMonthSheet()
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

function toggleGameDetails() {
  gameDetailsExpanded.value = !gameDetailsExpanded.value
}

function toggleCostDetails() {
  costDetailsExpanded.value = !costDetailsExpanded.value
}

onBeforeUnmount(() => {
  closeDetail()
  closeDetailFormulaTip()
  closeNetWinTip()
  closeNegativeTip()
})
</script>

<template>
  <!-- Figma 1433:17568 · 代理中心-首页-我的盈亏；返佣身份展示为「我的佣金」 -->
  <div
    class="mh5-agent-my-profit-page"
    :class="{ 'mh5-agent-my-profit-page--embedded': embedded }"
    :data-name="isRebateAgent ? '代理中心-首页-我的佣金' : '代理中心-首页-我的盈亏'"
    :data-agent-type="agentType"
    @click="closeHeroTips"
  >
    <div class="mh5-agent-my-profit-hero">
      <header v-if="!embedded" class="mh5-agent-my-profit-nav">
        <button type="button" class="mh5-agent-my-profit-nav__back" aria-label="返回" @click="goBack">
          <img :src="AGENT_MY_PROFIT_ASSETS.backIcon" alt="" width="24" height="24" />
        </button>
        <h1 class="mh5-agent-my-profit-nav__title">{{ pageTitle }}</h1>
        <div class="mh5-agent-my-profit-nav__right">
          <Mh5SpecAnnot :spec="AGENT_MY_PROFIT_SPEC" placement="bottom" />
        </div>
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
            <p class="mh5-agent-commission-hero__unit">总佣金({{ currency }})</p>
            <p class="mh5-agent-commission-hero__amount">
              {{ rebateHeroAmount }}
            </p>
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
          <button
            v-if="isRebateAgent"
            type="button"
            class="mh5-agent-my-profit-date__picker mh5-agent-my-profit-date__picker--action"
            aria-label="选择月份"
            :aria-expanded="monthSheetOpen"
            @click="openMonthSheet"
          >
            <div class="mh5-agent-my-profit-date__range">
              <p>{{ dateRangeText }}</p>
            </div>
            <span class="mh5-agent-my-profit-date__icon" aria-hidden="true">
              <img :src="AGENT_MY_PROFIT_ASSETS.calendarIcon" alt="" width="34" height="34" />
            </span>
          </button>
          <div v-else class="mh5-agent-my-profit-date__picker">
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
            :class="{ 'mh5-agent-my-profit-date__preset--active': isPresetActive(item.key) }"
            :aria-selected="isPresetActive(item.key)"
            @click="pickPreset(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <main class="mh5-agent-my-profit-main mh5-agent-my-profit-main--rebate">
      <!-- 占成 / 返佣共用：游戏净输赢 + 其他成本（可展开） -->
      <section
        class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
        aria-label="游戏净输赢金额"
      >
        <div class="mh5-agent-my-profit-table__head">
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
            {{ gameSection.nameHeader }}
          </span>
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
            {{ gameSection.amountHeader }}
          </span>
        </div>
        <div
          class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
        >
          <button
            type="button"
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron mh5-agent-my-profit-table__expand-trigger"
            :aria-expanded="gameDetailsExpanded"
            aria-label="展开或收起游戏净输赢细项"
            @click="toggleGameDetails"
          >
            <span>{{ gameSection.total.name }}</span>
            <span
              class="mh5-agent-my-profit-table__chevron"
              :class="{ 'mh5-agent-my-profit-table__chevron--open': gameDetailsExpanded }"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
          <span
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
            :class="agentMyProfitToneClass(gameSection.total.tone)"
          >
            {{ gameSection.total.amountText }}
          </span>
        </div>
        <Transition name="mh5-agent-my-profit-expand">
          <div v-if="gameDetailsExpanded" class="mh5-agent-my-profit-table__details">
            <component
              :is="agentMyProfitHasDetail(row.key, agentType) ? 'button' : 'div'"
              v-for="(row, index) in gameSection.rows"
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
          </div>
        </Transition>
      </section>

      <section
        class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
        aria-label="其他成本金额"
      >
        <div class="mh5-agent-my-profit-table__head">
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
            {{ costSection.nameHeader }}
          </span>
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
            {{ costSection.amountHeader }}
          </span>
        </div>
        <div
          class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
        >
          <button
            type="button"
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron mh5-agent-my-profit-table__expand-trigger"
            :aria-expanded="costDetailsExpanded"
            aria-label="展开或收起其他成本细项"
            @click="toggleCostDetails"
          >
            <span>{{ costSection.total.name }}</span>
            <span
              class="mh5-agent-my-profit-table__chevron"
              :class="{ 'mh5-agent-my-profit-table__chevron--open': costDetailsExpanded }"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
          <span
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
            :class="agentMyProfitToneClass(costSection.total.tone)"
          >
            {{ costSection.total.amountText }}
          </span>
        </div>
        <Transition name="mh5-agent-my-profit-expand">
          <div v-if="costDetailsExpanded" class="mh5-agent-my-profit-table__details">
            <component
              :is="agentMyProfitHasDetail(row.key, agentType) ? 'button' : 'div'"
              v-for="(row, index) in costSection.rows"
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
          </div>
        </Transition>
      </section>

      <!-- 返佣：净输赢 × 佣金比例 = 佣金 -->
      <section
        v-if="isRebateAgent"
        class="mh5-agent-my-profit-formula-card"
        aria-label="净输赢乘以佣金比例等于佣金"
        @click.stop
      >
        <div class="mh5-agent-commission-formula mh5-agent-my-profit-formula">
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

      <!-- 占成：游戏净输赢 − 其他成本 = 总盈亏 -->
      <section
        v-else
        class="mh5-agent-my-profit-formula-card mh5-agent-my-profit-formula-card--extra"
        aria-label="游戏净输赢减去其他成本等于总盈亏"
        @click.stop
      >
        <div class="mh5-agent-commission-formula mh5-agent-my-profit-formula mh5-agent-my-profit-formula--extra">
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">游戏净输赢</p>
            <p
              class="mh5-agent-commission-cell__value"
              :class="agentMyProfitToneClass(shareFormula.gameTone)"
            >
              {{ shareFormula.gameAmountText }}
            </p>
          </div>
          <span class="mh5-agent-commission-formula__op" aria-hidden="true">−</span>
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">其他成本</p>
            <p class="mh5-agent-commission-cell__value mh5-agent-my-profit__amount--negative">
              {{ shareFormula.costAmountText }}
            </p>
          </div>
          <span class="mh5-agent-commission-formula__op" aria-hidden="true">=</span>
          <button
            type="button"
            class="mh5-agent-commission-cell mh5-agent-my-profit-formula__result"
            :aria-label="`查看${shareFormula.total.name}明细`"
            @click="openDetail(shareFormula.total)"
          >
            <p class="mh5-agent-commission-cell__label">{{ shareFormula.total.name }}</p>
            <p
              class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__result-value"
              :class="agentMyProfitToneClass(shareFormula.total.tone)"
            >
              {{ shareFormula.total.amountText }}
            </p>
          </button>
        </div>
      </section>

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

    <Teleport to="body">
      <Transition name="mh5-agent-my-profit-sheet">
        <div
          v-if="monthSheetOpen"
          class="mh5-agent-overlay-mask"
          @click.self="closeMonthSheet"
        >
          <div class="mh5-xcoin-sheet mh5-agent-overlay-sheet" role="dialog" aria-modal="true" aria-label="选择月份">
            <h2 class="mh5-xcoin-sheet__title">选择月份</h2>
            <button
              v-for="opt in rebateMonthOptions"
              :key="opt.key"
              type="button"
              class="mh5-xcoin-sheet__option"
              :class="{ 'mh5-xcoin-sheet__option--active': rebateMonth === opt.key }"
              @click="pickRebateMonth(opt.key)"
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
.mh5-agent-my-profit-sheet-enter-active,
.mh5-agent-my-profit-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-agent-my-profit-sheet-enter-active .mh5-xcoin-sheet,
.mh5-agent-my-profit-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-agent-my-profit-sheet-enter-from,
.mh5-agent-my-profit-sheet-leave-to {
  opacity: 0;
}

.mh5-agent-my-profit-sheet-enter-from .mh5-xcoin-sheet,
.mh5-agent-my-profit-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
