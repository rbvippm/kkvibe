<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_MY_PROFIT_ASSETS,
  AGENT_MY_PROFIT_FOOTNOTE,
  AGENT_MY_PROFIT_REBATE_FOOTNOTE,
  AGENT_NET_PNL_FORMULA,
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
  agentMyProfitShareEarnSection,
  agentMyProfitShareFormula,
  agentMyProfitShareGameSection,
  agentMyProfitShareTotalBlock,
  agentMyProfitToneClass,
  type AgentMyProfitProductRow,
  type ProfitDatePreset,
  type RebateSectionScale,
} from '../../constants/agentMyProfit'
import {
  COMMISSION_NEGATIVE_TIP,
  COMMISSION_STATUS_META,
  MOCK_AGENT_JOIN_DATE,
  commissionHeroTitle,
  commissionTone,
  findCommissionBill,
  formatCommissionAmount,
  formatCommissionMonthLabel,
  getCommissionMonthOptions,
  getDefaultCommissionMonth,
  isCommissionMonthBeforeJoin,
  shouldShowCommissionNegativeAccum,
} from '../../constants/agentCommissionReport'
import { agentAppCurrency } from '../../constants/agentAppCurrency'
import { formatAgentCurrencyLabel } from '../../constants/agentCurrencyIcons'
import { AGENT_REPORT_FILTER_ASSETS } from '../../constants/agentReport'
import { AGENT_MY_PROFIT_SPEC } from '../../constants/agentMyProfitSpec'
import { MH5_DATE_RANGE_TODAY, formatDateRangeText, parseYmd } from '../../constants/mh5DateRange'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import Mh5CurrencyIcon from '../../components/mobile/Mh5CurrencyIcon.vue'
import Mh5DateRangeSheet from '../../components/mobile/Mh5DateRangeSheet.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import '../../styles/mobile-app-shell.css'

const props = withDefaults(
  defineProps<{
    /** 嵌入「我的报表」时隐藏独立顶栏，并由报表页承载导航 */
    embedded?: boolean
  }>(),
  { embedded: false },
)

const emit = defineEmits<{
  'open-currency': []
}>()

const route = useRoute()
const router = useRouter()
const { agentType, isRebateAgent, withAgentQuery } = useAgentIdentity()

const preset = ref<ProfitDatePreset>(agentMyProfitDefaultPreset(agentType.value))
/** 返佣结算月（月份选择与快捷 Tab 共用）；默认本月 */
const rebateMonth = ref(
  isRebateAgent.value
    ? agentMyProfitRebateMonthKey('thisMonth')
    : getDefaultCommissionMonth(),
)
const detailProduct = ref<AgentMyProfitProductRow | null>(null)
const detailFormulaTipOpen = ref(false)
const netWinTipOpen = ref(false)
const netPnlFormulaTipOpen = ref(false)
const negativeTipOpen = ref(false)
const monthSheetOpen = ref(false)
const shareDateOpen = ref(false)
const shareCustomRange = ref<{ start: string; end: string } | null>(null)
/** 游戏净输赢 / 其他成本 / 代理赚水：合计下展开细项 */
const gameDetailsExpanded = ref(false)
/** 其他成本细项默认展开 */
const costDetailsExpanded = ref(true)
/** 代理赚水细项默认收起 */
const earnDetailsExpanded = ref(false)

/** 返佣进入页 / 切身份：强制默认「本月」并同步结算月 */
function syncRebateDefaultThisMonth() {
  if (!isRebateAgent.value) return
  preset.value = 'thisMonth'
  rebateMonth.value = agentMyProfitRebateMonthKey('thisMonth')
}

onMounted(() => {
  syncRebateDefaultThisMonth()
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

watch(isRebateAgent, (rebate) => {
  if (rebate) {
    syncRebateDefaultThisMonth()
    return
  }
  preset.value = agentMyProfitDefaultPreset('share')
})

const dateFilterLabel = computed(() => agentMyProfitDateFilterLabel(agentType.value))
const datePresets = computed(() => agentMyProfitPresets(agentType.value))
const rebateMonthOptions = computed(() => getCommissionMonthOptions())
const dateRangeText = computed(() => {
  if (isRebateAgent.value) return formatCommissionMonthLabel(rebateMonth.value)
  if (shareCustomRange.value) {
    return formatDateRangeText(shareCustomRange.value.start, shareCustomRange.value.end)
  }
  return agentMyProfitDateRangeText(preset.value)
})

const shareDateToday = computed(() => {
  const todayText = agentMyProfitDateRangeText('today')
  const end = todayText.split('至')[1] ?? ''
  return parseYmd(end) ? end : MH5_DATE_RANGE_TODAY
})

const shareDateStart = computed(() => {
  if (shareCustomRange.value) return shareCustomRange.value.start
  return dateRangeText.value.split('至')[0] || shareDateToday.value
})

const shareDateEnd = computed(() => {
  if (shareCustomRange.value) return shareCustomRange.value.end
  return dateRangeText.value.split('至')[1] || shareDateToday.value
})

const currency = agentAppCurrency
const rebateMonthKey = computed(() => rebateMonth.value)
const isRebateNotJoined = computed(
  () => isRebateAgent.value && isCommissionMonthBeforeJoin(rebateMonthKey.value),
)
const rebateCommissionBill = computed(() =>
  isRebateNotJoined.value ? null : findCommissionBill(rebateMonthKey.value),
)
const rebateHeroTitle = computed(() => commissionHeroTitle(rebateMonthKey.value))
/** 已入驻月份均展示负盈利累计（待派发 / 历史月）；未入驻不展示 */
const showRebateNegativeAccum = computed(
  () => !isRebateNotJoined.value && shouldShowCommissionNegativeAccum(rebateMonthKey.value),
)
const rebateNegativeAccum = computed(() => rebateCommissionBill.value?.negativeAccum ?? 0)
const rebateSectionScale = computed<RebateSectionScale>(() => {
  const bill = rebateCommissionBill.value
  if (!bill) return REBATE_DEFAULT_SECTION_SCALE
  return {
    gameTotal: bill.totalPnl,
    costTotal: Math.abs(bill.totalCost),
  }
})
const rebateCommissionRate = computed(() => rebateCommissionBill.value?.commissionRate ?? '5.00%')
/** 占成顶部总盈亏 = 实占净输赢 + 代理赚水（与明细同源；随日期快捷变化） */
const totalBlock = computed(() => agentMyProfitShareTotalBlock(preset.value))

watch(preset, () => {
  netWinTipOpen.value = false
  netPnlFormulaTipOpen.value = false
  negativeTipOpen.value = false
  gameDetailsExpanded.value = false
  costDetailsExpanded.value = true
  earnDetailsExpanded.value = false
  detailProduct.value = null
  detailFormulaTipOpen.value = false
})

/** 游戏净输赢 / 其他成本：占成与返佣共用分区结构 */
const gameSection = computed(() =>
  isRebateAgent.value
    ? agentMyProfitRebateGameSection('l1', rebateSectionScale.value)
    : agentMyProfitShareGameSection(preset.value),
)
const costSection = computed(() =>
  isRebateAgent.value
    ? agentMyProfitRebateCostSection('l1', rebateSectionScale.value)
    : agentMyProfitShareCostSection(preset.value),
)
const shareEarnSection = computed(() => agentMyProfitShareEarnSection(preset.value))
const rebateLevelFormula = computed(() =>
  agentMyProfitRebateLevelFormula(
    'l1',
    rebateCommissionRate.value,
    rebateSectionScale.value,
    rebateNegativeAccum.value,
  ),
)
const levelSummaryRow = computed(() => rebateLevelFormula.value.levelRow)
/** 公式卡结果列统一为「佣金」 */
const rebateFormulaResultLabel = '佣金'
const rebateL1Formula = computed(() => rebateLevelFormula.value)
/** 当月佣金 = （净输赢 - 负盈利累计）× 佣金比例 */
const rebateMonthCommission = computed(() => rebateL1Formula.value.monthCommission)
/** 总佣金 = 佣金（负盈利累计已在佣金公式中冲减） */
const rebateTotalCommission = computed(() => rebateMonthCommission.value)
const rebateHeroAmount = computed(() => formatCommissionAmount(rebateTotalCommission.value))
/** 占成公式：游戏净输赢 − 其他成本 = 实占净输赢；实占净输赢 + 代理赚水 = 总盈亏 */
const shareFormula = computed(() => agentMyProfitShareFormula(preset.value))
const rebateDetailContext = computed(() => ({
  l1Commission: rebateL1Formula.value.monthCommission,
  monthCommission: rebateMonthCommission.value,
  negativeAccum: rebateNegativeAccum.value,
  includeNegativeAccum: true,
  gameTotal: rebateSectionScale.value.gameTotal,
}))
const footnoteLines = computed(() =>
  (isRebateAgent.value ? AGENT_MY_PROFIT_REBATE_FOOTNOTE : AGENT_MY_PROFIT_FOOTNOTE).split('\n'),
)
const pageTitle = computed(() => agentMyProfitPageTitle(agentType.value))
const dialogLabelHeader = computed(() =>
  agentMyProfitDialogLabelHeader(agentType.value, detailProduct.value?.key),
)

const detailTitle = computed(() => {
  if (!detailProduct.value) return isRebateAgent.value ? '佣金明细' : '盈亏明细'
  if (detailProduct.value.key === 'total') {
    return isRebateAgent.value ? '总佣金明细' : '总盈亏明细'
  }
  if (detailProduct.value.key === 'net_pnl') {
    return '实占净输赢明细'
  }
  if (detailProduct.value.key === 'rebate_earn') {
    return '代理赚水明细'
  }
  if (detailProduct.value.key.startsWith('earn_')) {
    return `${detailProduct.value.name}赚水`
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
        preset.value,
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
  closeNetPnlFormulaTip()
}

function toggleNetPnlFormulaTip() {
  netWinTipOpen.value = false
  negativeTipOpen.value = false
  netPnlFormulaTipOpen.value = !netPnlFormulaTipOpen.value
}

function closeNetPnlFormulaTip() {
  netPnlFormulaTipOpen.value = false
}

function onNegativeTipClick() {
  toggleNegativeTip()
}

function pickPreset(key: ProfitDatePreset) {
  shareCustomRange.value = null
  preset.value = key
  if (isRebateAgent.value) {
    rebateMonth.value = agentMyProfitRebateMonthKey(key)
  }
  closeNetWinTip()
  closeNetPnlFormulaTip()
  closeNegativeTip()
}

function isPresetActive(key: ProfitDatePreset) {
  if (!isRebateAgent.value) {
    return !shareCustomRange.value && preset.value === key
  }
  return agentMyProfitRebateMonthKey(key) === rebateMonth.value
}

function openShareDateSheet() {
  if (isRebateAgent.value) return
  closeHeroTips()
  shareDateOpen.value = true
}

function confirmShareDate(start: string, end: string) {
  shareCustomRange.value = { start, end }
  shareDateOpen.value = false
  closeNetWinTip()
  closeNetPnlFormulaTip()
  closeNegativeTip()
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
  closeNetPnlFormulaTip()
  detailProduct.value = row
}

function toggleGameDetails() {
  gameDetailsExpanded.value = !gameDetailsExpanded.value
}

function toggleCostDetails() {
  costDetailsExpanded.value = !costDetailsExpanded.value
}

function toggleEarnDetails() {
  earnDetailsExpanded.value = !earnDetailsExpanded.value
}

onBeforeUnmount(() => {
  closeDetail()
  closeDetailFormulaTip()
  closeNetWinTip()
  closeNetPnlFormulaTip()
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
    <section v-if="embedded" class="mh5-agent-report-filter" :aria-label="$t('筛选')">
      <div class="mh5-agent-report-filter__row">
        <button
          v-if="isRebateAgent"
          type="button"
          class="mh5-agent-report-filter__date mh5-agent-report-filter__date--action"
          :aria-label="$t('选择月份')"
          :aria-expanded="monthSheetOpen"
          @click="openMonthSheet"
        >
          <span>{{ dateRangeText }}</span>
          <span class="mh5-agent-report-filter__calendar" aria-hidden="true">
            <img :src="AGENT_REPORT_FILTER_ASSETS.calendar" alt="" width="16" height="16" />
          </span>
        </button>
        <button
          v-else
          type="button"
          class="mh5-agent-report-filter__date mh5-agent-report-filter__date--action"
          :aria-label="$t('选择日期')"
          :aria-expanded="shareDateOpen"
          @click="openShareDateSheet"
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
          @click="emit('open-currency')"
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
          v-for="item in datePresets"
          :key="item.key"
          type="button"
          role="tab"
          class="mh5-agent-report-filter__preset"
          :class="{ 'mh5-agent-report-filter__preset--active': isPresetActive(item.key) }"
          :aria-selected="isPresetActive(item.key)"
          @click="pickPreset(item.key)"
        >
          {{ $t(item.label) }}
        </button>
      </div>
    </section>

    <div class="mh5-agent-my-profit-hero">
      <header v-if="!embedded" class="mh5-agent-my-profit-nav">
        <button type="button" class="mh5-agent-my-profit-nav__back" :aria-label="$t('返回')" @click="goBack">
          <img :src="AGENT_MY_PROFIT_ASSETS.backIcon" alt="" width="24" height="24" />
        </button>
        <h1 class="mh5-agent-my-profit-nav__title">{{ pageTitle }}</h1>
        <div class="mh5-agent-my-profit-nav__right">
          <Mh5SpecAnnot :spec="AGENT_MY_PROFIT_SPEC" placement="bottom" />
        </div>
      </header>

      <!-- 返佣：对齐佣金详情卡（预计/发放 + 状态 + 总佣金币种 tip + 金额）；未入驻走空态卡 -->
      <section
        v-if="isRebateAgent && (rebateCommissionBill || isRebateNotJoined)"
        class="mh5-agent-my-profit-total mh5-agent-my-profit-total--commission"
        :class="{ 'mh5-agent-my-profit-total--not-joined': isRebateNotJoined }"
        :aria-label="isRebateNotJoined ? $t('未入驻') : rebateHeroTitle"
        @click.stop
      >
        <div v-if="isRebateNotJoined" class="mh5-agent-my-profit-total__inner">
          <img
            class="mh5-agent-my-profit-total__pattern"
            :src="AGENT_MY_PROFIT_ASSETS.cardPattern"
            alt=""
            aria-hidden="true"
          />
          <div class="mh5-agent-commission-hero__not-joined">
            <div class="mh5-agent-my-profit-hero-metric">
              <p class="mh5-agent-commission-hero__unit">总佣金({{ currency }})</p>
              <p class="mh5-agent-commission-hero__amount mh5-agent-commission-hero__amount--empty">--</p>
            </div>
            <span class="mh5-agent-commission-status mh5-agent-commission-status--not-joined">
              {{ $t('未入驻') }}
            </span>
          </div>
        </div>
        <template v-else-if="rebateCommissionBill">
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
              <span class="mh5-agent-commission-tip-wrap">{{ $t('负盈利累计') }}<button
                  type="button"
                  class="mh5-agent-commission-q"
                  :aria-label="$t('查看负盈利累计说明')"
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
        </template>
      </section>

      <section
        v-else
        class="mh5-agent-my-profit-total mh5-agent-detail-profit-hero"
        :aria-label="totalBlock.label"
      >
        <img
          class="mh5-agent-my-profit-total__deco"
          :src="AGENT_MY_PROFIT_ASSETS.decoCoin"
          alt=""
          aria-hidden="true"
        />
        <p class="mh5-agent-my-profit-total__label">{{ $t(totalBlock.label) }}</p>
        <p
          class="mh5-agent-my-profit-total__value"
          :class="agentMyProfitToneClass(totalBlock.tone)"
        >
          {{ totalBlock.valueText }}
        </p>
        <div
          class="mh5-agent-commission-formula mh5-agent-my-profit-formula mh5-agent-my-profit-formula--extra mh5-agent-detail-profit-hero__formula"
          :aria-label="$t('实占净输赢加上代理赚水等于总盈亏')"
        >
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">
              <span class="mh5-agent-detail-profit-summary__label-wrap mh5-agent-detail-profit-hero__net-tip">
                <button
                  type="button"
                  class="mh5-agent-detail-profit-summary__tip-btn mh5-agent-report-detail__tip-btn"
                  :aria-label="$t('查看实占净输赢计算公式')"
                  :aria-expanded="netPnlFormulaTipOpen"
                  @click.stop="toggleNetPnlFormulaTip"
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
                <span>{{ $t('实占净输赢') }}</span>
                <span
                  v-if="netPnlFormulaTipOpen"
                  class="mh5-agent-detail-profit-summary__tip-bubble mh5-agent-report-detail__tip-bubble"
                  role="tooltip"
                  @click.stop
                >
                  {{ AGENT_NET_PNL_FORMULA }}
                </span>
              </span>
            </p>
            <button
              type="button"
              class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__result-value mh5-agent-detail-profit-hero__net-amount"
              :class="agentMyProfitToneClass(shareFormula.netPnl.tone)"
              :aria-label="$t('查看实占净输赢明细')"
              @click="openDetail(shareFormula.netPnl)"
            >
              {{ shareFormula.netPnl.amountText }}
            </button>
          </div>
          <span class="mh5-agent-commission-formula__op" aria-hidden="true">+</span>
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">{{ $t('代理赚水') }}</p>
            <button
              type="button"
              class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__result-value mh5-agent-detail-profit-hero__net-amount"
              :class="agentMyProfitToneClass(shareFormula.earnTone)"
              :aria-label="$t('查看代理赚水明细')"
              @click="openDetail(shareEarnSection.total)"
            >
              {{ shareFormula.earnAmountText }}
            </button>
          </div>
          <span class="mh5-agent-commission-formula__op" aria-hidden="true">=</span>
          <button
            type="button"
            class="mh5-agent-commission-cell mh5-agent-my-profit-formula__result"
            :aria-label="`查看${shareFormula.total.name}明细`"
            @click="openDetail(shareFormula.total)"
          >
            <p class="mh5-agent-commission-cell__label">{{ $t(shareFormula.total.name) }}</p>
            <p
              class="mh5-agent-commission-cell__value mh5-agent-my-profit-formula__result-value"
              :class="agentMyProfitToneClass(shareFormula.total.tone)"
            >
              {{ shareFormula.total.amountText }}
            </p>
          </button>
        </div>
      </section>

      <div
        v-if="isRebateNotJoined"
        class="mh5-agent-my-profit-join-notice"
        role="status"
      >
        <img
          class="mh5-agent-my-profit-join-notice__icon"
          :src="AGENT_MY_PROFIT_ASSETS.notJoinedAlert"
          alt=""
          width="24"
          height="24"
        />
        <p class="mh5-agent-my-profit-join-notice__text">
          {{ $t('您于{date} 成为代理，此前周期暂无业务数据', { date: MOCK_AGENT_JOIN_DATE }) }}
        </p>
      </div>

      <div v-if="!embedded" class="mh5-agent-my-profit-date">
        <div class="mh5-agent-my-profit-date__row">
          <p class="mh5-agent-my-profit-date__label">{{ dateFilterLabel }}</p>
          <button
            v-if="isRebateAgent"
            type="button"
            class="mh5-agent-my-profit-date__picker mh5-agent-my-profit-date__picker--action"
            :aria-label="$t('选择月份')"
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
          <button
            v-else
            type="button"
            class="mh5-agent-my-profit-date__picker mh5-agent-my-profit-date__picker--action"
            :aria-label="$t('选择日期')"
            :aria-expanded="shareDateOpen"
            @click="openShareDateSheet"
          >
            <div class="mh5-agent-my-profit-date__range">
              <p>{{ dateRangeText }}</p>
            </div>
            <span class="mh5-agent-my-profit-date__icon" aria-hidden="true">
              <img :src="AGENT_MY_PROFIT_ASSETS.calendarIcon" alt="" width="34" height="34" />
            </span>
          </button>
        </div>
        <div class="mh5-agent-my-profit-date__presets" role="tablist" :aria-label="$t('快捷时间')">
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
            {{ $t(item.label) }}
          </button>
        </div>
      </div>
    </div>

    <main class="mh5-agent-my-profit-main mh5-agent-my-profit-main--rebate">
      <div v-if="isRebateNotJoined" class="mh5-agent-my-profit-empty" aria-live="polite">
        <img
          class="mh5-agent-my-profit-empty__art"
          :src="AGENT_MY_PROFIT_ASSETS.emptyNoData"
          alt=""
          width="240"
          height="240"
        />
        <p class="mh5-agent-my-profit-empty__text">{{ $t('暂无数据') }}</p>
      </div>

      <template v-else>
      <!-- 占成 / 返佣共用：游戏净输赢 + 其他成本（可展开）；占成另有代理赚水 -->
      <section
        class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
        :aria-label="$t('游戏净输赢金额')"
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
            :aria-label="$t('展开或收起游戏净输赢细项')"
            @click="toggleGameDetails"
          >
            <span>{{ $t(gameSection.total.name) }}</span>
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
                {{ $t(row.name) }}
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
        :aria-label="$t('其他成本金额')"
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
            :aria-label="$t('展开或收起其他成本细项')"
            @click="toggleCostDetails"
          >
            <span>{{ $t(costSection.total.name) }}</span>
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
                {{ $t(row.name) }}
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
        v-if="!isRebateAgent"
        class="mh5-agent-my-profit-table mh5-agent-my-profit-table--section"
        :aria-label="$t('代理赚水金额')"
      >
        <div class="mh5-agent-my-profit-table__head">
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
            {{ shareEarnSection.nameHeader }}
          </span>
          <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount">
            {{ shareEarnSection.amountHeader }}
          </span>
        </div>
        <div
          class="mh5-agent-my-profit-table__row mh5-agent-my-profit-table__row--total mh5-agent-my-profit-table__row--expand"
        >
          <button
            type="button"
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name mh5-agent-my-profit-table__name-with-chevron mh5-agent-my-profit-table__expand-trigger"
            :aria-expanded="earnDetailsExpanded"
            :aria-label="$t('展开或收起代理赚水细项')"
            @click="toggleEarnDetails"
          >
            <span>{{ $t(shareEarnSection.total.name) }}</span>
            <span
              class="mh5-agent-my-profit-table__chevron"
              :class="{ 'mh5-agent-my-profit-table__chevron--open': earnDetailsExpanded }"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
          <span
            class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount"
            :class="agentMyProfitToneClass(shareEarnSection.total.tone)"
          >
            {{ shareEarnSection.total.amountText }}
          </span>
        </div>
        <Transition name="mh5-agent-my-profit-expand">
          <div v-if="earnDetailsExpanded" class="mh5-agent-my-profit-table__details">
            <button
              v-for="(row, index) in shareEarnSection.rows"
              :key="row.key"
              type="button"
              class="mh5-agent-my-profit-table__row"
              :class="{ 'mh5-agent-my-profit-table__row--alt': index % 2 === 1 }"
              :aria-label="`查看${row.name}赚水`"
              @click="openDetail(row)"
            >
              <span class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--name">
                {{ $t(row.name) }}
              </span>
              <span
                class="mh5-agent-my-profit-table__cell mh5-agent-my-profit-table__cell--amount mh5-agent-my-profit-table__link"
                :class="agentMyProfitToneClass(row.tone)"
              >
                {{ row.amountText }}
              </span>
            </button>
          </div>
        </Transition>
      </section>

      <!-- 返佣：(净输赢 − 负盈利累计) × 佣金比例 = 佣金 -->
      <section
        v-if="isRebateAgent"
        class="mh5-agent-my-profit-formula-card mh5-agent-my-profit-formula-card--extra"
        :aria-label="$t('净输赢减去负盈利累计再乘佣金比例等于佣金')"
        @click.stop
      >
        <div
          class="mh5-agent-commission-formula mh5-agent-my-profit-formula mh5-agent-my-profit-formula--extra"
        >
          <span
            class="mh5-agent-commission-formula__op mh5-agent-my-profit-formula__paren"
            aria-hidden="true"
          >(</span>
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">
              <span class="mh5-agent-commission-tip-wrap">{{ $t('净输赢') }}<button
                  type="button"
                  class="mh5-agent-commission-q"
                  :aria-label="$t('查看净输赢说明')"
                  :aria-expanded="netWinTipOpen"
                  @click.stop="toggleNetWinTip"
                >
                  ?
                </button>
                <span
                  v-if="netWinTipOpen"
                  class="mh5-agent-commission-tip-bubble"
                  role="tooltip"
                >{{ $t('净输赢 = 游戏净输赢 - 其他成本') }}</span>
              </span>
            </p>
            <p
              class="mh5-agent-commission-cell__value"
              :class="commissionToneClass(rebateLevelFormula.netWin)"
            >
              {{ formatCommissionAmount(rebateLevelFormula.netWin) }}
            </p>
          </div>
          <span class="mh5-agent-commission-formula__op" aria-hidden="true">−</span>
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">{{ $t('负盈利累计') }}</p>
            <p
              class="mh5-agent-commission-cell__value"
              :class="commissionToneClass(rebateNegativeAccum === 0 ? 0 : -1)"
            >
              {{
                formatCommissionAmount(Math.abs(rebateNegativeAccum), {
                  signed: false,
                })
              }}
            </p>
          </div>
          <span
            class="mh5-agent-commission-formula__op mh5-agent-my-profit-formula__paren"
            aria-hidden="true"
          >)</span>
          <span class="mh5-agent-commission-formula__op" aria-hidden="true">×</span>
          <div class="mh5-agent-commission-cell">
            <p class="mh5-agent-commission-cell__label">{{ $t('佣金比例') }}</p>
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

      <p class="mh5-agent-my-profit-footnote">
        <span v-for="(line, i) in footnoteLines" :key="i">
          {{ line }}<br v-if="i < footnoteLines.length - 1" />
        </span>
      </p>
      </template>
    </main>

    <Teleport to=".mh5-app-shell" defer>
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
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--value">{{ $t('金额') }}</span>
            </div>
            <div
              v-for="row in detailRows"
              :key="row.label"
              class="mh5-agent-my-profit-dialog__row"
              :class="{ 'mh5-agent-my-profit-dialog__row--emphasize': row.emphasize }"
            >
              <span class="mh5-agent-my-profit-dialog__cell mh5-agent-my-profit-dialog__cell--label">
                <span class="mh5-agent-my-profit-dialog__label-wrap">
                  <span>{{ $t(row.label) }}</span>
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
          <button type="button" class="mh5-agent-my-profit-dialog__btn" @click="closeDetail">{{ $t('我知道了') }}</button>
        </div>
      </div>
      </Transition>
    </Teleport>

    <Mh5DateRangeSheet
      :open="shareDateOpen"
      :start="shareDateStart"
      :end="shareDateEnd"
      :today="shareDateToday"
      @close="shareDateOpen = false"
      @confirm="confirmShareDate"
    />

    <Teleport to="body">
      <Transition name="mh5-agent-my-profit-sheet">
        <div
          v-if="monthSheetOpen"
          class="mh5-agent-overlay-mask"
          @click.self="closeMonthSheet"
        >
          <div class="mh5-xcoin-sheet mh5-agent-overlay-sheet" role="dialog" aria-modal="true" :aria-label="$t('选择月份')">
            <h2 class="mh5-xcoin-sheet__title">{{ $t('选择月份') }}</h2>
            <button
              v-for="opt in rebateMonthOptions"
              :key="opt.key"
              type="button"
              class="mh5-xcoin-sheet__option"
              :class="{ 'mh5-xcoin-sheet__option--active': rebateMonth === opt.key }"
              @click="pickRebateMonth(opt.key)"
            >
              {{ $t(opt.label) }}
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
