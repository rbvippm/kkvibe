<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AgentOverviewStatMask from './AgentOverviewStatMask.vue'
import AgentMyShareRatioDialog from './AgentMyShareRatioDialog.vue'
import {
  getDirectStats,
  MOCK_PROFIT_RANKINGS,
  MOCK_SUB_AGENT_STATS,
  getProfitRankTabs,
  type AgentOverviewCurrency,
  type ProfitRankTab,
} from '../../constants/agentOverview'
import { getAgentDetailCurrencyOptions, type AgentWalletCurrency } from '../../constants/agentDetail'
import {
  overviewCurrencyToWallet,
  walletCurrencyToOverview,
} from '../../constants/agentAppCurrency'
import { formatAgentCurrencyLabel } from '../../constants/agentCurrencyIcons'
import { AGENT_OVERVIEW_ASSETS } from '../../constants/agentOverviewAssets'
import { AGENT_OVERVIEW_CURRENCY_SHEET_SPEC } from '../../constants/agentOverviewSpec'
import {
  getRebateRatioDisplayText,
  type AgentIdentityType,
} from '../../constants/agentIdentity'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'
import Mh5CurrencyPickerSheet from './Mh5CurrencyPickerSheet.vue'
import Mh5DateRangeSheet from './Mh5DateRangeSheet.vue'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import { MH5_DATE_RANGE_TODAY, parseYmd } from '../../constants/mh5DateRange'
import {
  findCommissionBill,
  formatCommissionAmount,
  getCommissionTotal,
  getDefaultCommissionMonth,
  MOCK_COMMISSION_MONTH_BILLS,
} from '../../constants/agentCommissionReport'
import { useAgentIdentity } from '../../composables/useAgentIdentity'

const router = useRouter()
const { withAgentQuery } = useAgentIdentity()

const props = withDefaults(
  defineProps<{
    nickname: string
    avatarEmoji: string
    identityLabel?: string
    agentType?: AgentIdentityType
    balance: string
    profit: string
    currency: AgentOverviewCurrency
    dateRangeText: string
    preset: 'today' | 'yesterday' | 'thisMonth' | 'lastMonth' | null
    profitRankTab: ProfitRankTab
    /** 进入概况时是否自动打开占成/返佣比例弹框 */
    openShareRatio?: boolean
  }>(),
  {
    identityLabel: '占成代理',
    agentType: 'share',
  },
)

const isRebate = computed(() => props.agentType === 'rebate')
const ratioTabLabel = computed(() => (isRebate.value ? '返佣比例' : '占成比例'))
const profitTabLabel = computed(() => (isRebate.value ? '预计佣金' : '我的盈亏'))
const currencyOptions = computed(() => getAgentDetailCurrencyOptions(!isRebate.value))
const walletCurrency = computed(() => overviewCurrencyToWallet(props.currency))
const currencyLabel = computed(() => formatAgentCurrencyLabel(walletCurrency.value))

const currentCommissionBill = computed(
  () =>
    findCommissionBill(getDefaultCommissionMonth()) ??
    MOCK_COMMISSION_MONTH_BILLS.find((item) => item.status === 'pending') ??
    MOCK_COMMISSION_MONTH_BILLS[0],
)

/** 返佣：取本月预计总佣金（与「我的佣金」页同口径） */
const profitTabValue = computed(() => {
  if (!isRebate.value) return props.profit
  return formatCommissionAmount(getCommissionTotal(currentCommissionBill.value), { signed: true })
})

/** 返佣：账号卡外露当前适用比例；点感叹号看全部档位 */
const rebateRatioText = computed(() =>
  getRebateRatioDisplayText(props.currency, currentCommissionBill.value?.commissionRate),
)

/** + 绿 / - 红 */
const profitTabValueToneClass = computed(() => {
  const text = profitTabValue.value.trim()
  if (text.startsWith('-')) return 'agent-home__profit-tab-value--neg'
  if (text.startsWith('+')) return 'agent-home__profit-tab-value--pos'
  return ''
})

const emit = defineEmits<{
  back: []
  pickPreset: [preset: 'today' | 'yesterday' | 'thisMonth' | 'lastMonth']
  pickDateRange: [start: string, end: string]
  pickProfitRankTab: [tab: ProfitRankTab]
  pickCurrency: [currency: AgentOverviewCurrency]
  shareRatioClosed: []
}>()

const currencyPickerOpen = ref(false)
const shareRatioOpen = ref(Boolean(props.openShareRatio))
const dateSheetOpen = ref(false)
const dateSheetStart = ref(MH5_DATE_RANGE_TODAY)
const dateSheetEnd = ref(MH5_DATE_RANGE_TODAY)

function parseOverviewDateRange(text: string) {
  const [start = '', end = ''] = text.split('至')
  return {
    start: parseYmd(start) ? start : MH5_DATE_RANGE_TODAY,
    end: parseYmd(end) ? end : MH5_DATE_RANGE_TODAY,
  }
}

function openDateSheet() {
  const range = parseOverviewDateRange(props.dateRangeText)
  dateSheetStart.value = range.start
  dateSheetEnd.value = range.end
  dateSheetOpen.value = true
}

function confirmOverviewDate(start: string, end: string) {
  dateSheetStart.value = start
  dateSheetEnd.value = end
  dateSheetOpen.value = false
  emit('pickDateRange', start, end)
}

watch(
  () => props.openShareRatio,
  (open) => {
    if (open) shareRatioOpen.value = true
  },
)

const presetOptions = [
  ['today', '今日'],
  ['yesterday', '昨天'],
  ['thisMonth', '本月'],
  ['lastMonth', '上月'],
] as const

const directStats = computed(() => getDirectStats(props.agentType))
const profitRankTabs = computed(() => getProfitRankTabs(props.agentType))
const profitRankRows = computed(() => {
  const tabs = profitRankTabs.value
  const key = tabs.some((tab) => tab.key === props.profitRankTab)
    ? props.profitRankTab
    : (tabs[0]?.key ?? 'member_win')
  return MOCK_PROFIT_RANKINGS[key]
})

watch(isRebate, (rebate) => {
  if (rebate && props.profitRankTab === 'agent_win') {
    emit('pickProfitRankTab', 'member_win')
  }
})

function goMyProfit() {
  /** 概况预计佣金 / 我的盈亏 → 我的报表 · 佣金/盈亏 Tab */
  router.push({
    name: 'mobile-agent',
    query: withAgentQuery({ tab: 'report', reportTab: 'finance' }),
  })
}

function openShareRatioDialog() {
  shareRatioOpen.value = true
}

function closeShareRatioDialog() {
  shareRatioOpen.value = false
  emit('shareRatioClosed')
}

function pickCurrency(value: AgentOverviewCurrency) {
  emit('pickCurrency', value)
  currencyPickerOpen.value = false
}

function pickWalletCurrency(value: string) {
  pickCurrency(walletCurrencyToOverview(value as AgentWalletCurrency))
}
</script>

<template>
  <div class="agent-home" data-name="代理中心-首页-文字颜色调整">
    <!-- 深色顶区：固定高度，不参与滚动 -->
    <div class="agent-home__hero">
      <div class="agent-home__hero-glow" aria-hidden="true" />

      <header class="agent-home__header" data-name="header">
        <div class="agent-home__nav-bar" data-name="nav_bar">
          <div class="agent-home__nav-left" data-name="left">
            <button
              type="button"
              class="agent-home__nav-back"
              data-name="icon_backpage"
              :aria-label="$t('返回')"
              @click="emit('back')"
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                <path
                  d="M9 1L1 9l8 8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
          <div class="agent-home__nav-title" data-name="title">
            <p>{{ $t('代理中心') }}</p>
          </div>
          <div class="agent-home__nav-right" data-name="right">
            <span
              class="agent-home__identity-badge"
              :class="isRebate ? 'agent-home__identity-badge--rebate' : 'agent-home__identity-badge--share'"
            >
              {{ identityLabel }}
            </span>
          </div>
        </div>
      </header>

      <div class="agent-home__card" data-name="卡片">
        <div class="agent-home__card-mask" aria-hidden="true" />
        <div class="agent-home__card-stripe agent-home__card-stripe--1" aria-hidden="true" />
        <div class="agent-home__card-stripe agent-home__card-stripe--2" aria-hidden="true" />
        <div class="agent-home__card-stripe agent-home__card-stripe--3" aria-hidden="true" />
        <img class="agent-home__card-deco-bottom" :src="AGENT_OVERVIEW_ASSETS.cardDeco" alt="" aria-hidden="true" />
        <div class="agent-home__card-body">
          <div class="agent-home__card-profile">
            <div class="agent-home__avatar" data-name="头像">
              <span class="agent-home__avatar-emoji">{{ avatarEmoji }}</span>
            </div>
            <div class="agent-home__profile-main">
              <div class="agent-home__profile-top">
                <div class="agent-home__profile-name" data-name="名字">
                  <p>{{ nickname }}</p>
                  <span
                    class="agent-home__identity-pill"
                    :class="isRebate ? 'agent-home__identity-pill--rebate' : 'agent-home__identity-pill--share'"
                  >
                    {{ identityLabel }}
                  </span>
                </div>
              </div>
              <div class="agent-home__profile-balance">
                <button
                  type="button"
                  class="agent-home__currency-pill"
                  :aria-label="$t('选择币种')"
                  @click="currencyPickerOpen = true"
                >
                  <Mh5CurrencyIcon :code="walletCurrency" :size="16" />
                  <p>{{ $t(currencyLabel) }}</p>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                  </svg>
                </button>
                <p class="agent-home__balance-value">{{ balance }}</p>
                <button type="button" class="agent-home__refresh-btn" data-name="ic:twotone-refresh" :aria-label="$t('刷新')">
                  <img :src="AGENT_OVERVIEW_ASSETS.refreshIcon" alt="" width="20" height="20" />
                </button>
              </div>
            </div>
          </div>

          <div class="agent-home__profit-tabs">
            <button
              type="button"
              class="agent-home__profit-tab agent-home__profit-tab--active"
              data-name="agent_tab/active"
              :aria-label="`查看${profitTabLabel}`"
              @click="goMyProfit"
            >
              <span class="agent-home__profit-tab-label">{{ profitTabLabel }}</span>
              <span class="agent-home__profit-tab-value" :class="profitTabValueToneClass">
                {{ profitTabValue }}
              </span>
              <span class="agent-home__profit-tab-arrow" aria-hidden="true">›</span>
            </button>
            <!-- 返佣：比例直接外露，仅感叹号打开档位详情 -->
            <div
              v-if="isRebate"
              class="agent-home__profit-tab agent-home__profit-tab--ratio"
              data-name="agent_tab_/inactive"
              role="group"
              :aria-label="`${ratioTabLabel} ${rebateRatioText}`"
            >
              <span class="agent-home__profit-tab-label">{{ ratioTabLabel }}</span>
              <span class="agent-home__profit-tab-value">{{ rebateRatioText }}</span>
              <button
                type="button"
                class="agent-home__profit-tab-info"
                :aria-label="$t('查看返佣比例详情')"
                @click="openShareRatioDialog"
              >
                <img :src="AGENT_OVERVIEW_ASSETS.ratioInfoIcon" alt="" width="16" height="16" />
              </button>
            </div>
            <button
              v-else
              type="button"
              class="agent-home__profit-tab agent-home__profit-tab--ratio"
              data-name="agent_tab_/inactive"
              :aria-label="`查看${ratioTabLabel}`"
              @click="openShareRatioDialog"
            >
              <span class="agent-home__profit-tab-label">{{ ratioTabLabel }}</span>
              <span class="agent-home__profit-tab-info" aria-hidden="true">
                <img :src="AGENT_OVERVIEW_ASSETS.ratioInfoIcon" alt="" width="16" height="16" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="agent-home__date-block">
        <div class="agent-home__date-row">
          <p class="agent-home__date-label">{{ $t('数据时间段') }}</p>
          <div class="agent-home__date-picker">
            <button
              type="button"
              class="agent-home__date-range"
              :aria-label="$t('选择日期')"
              :aria-expanded="dateSheetOpen"
              @click="openDateSheet"
            >
              <p>{{ dateRangeText }}</p>
            </button>
            <button
              type="button"
              class="agent-home__date-icon"
              :aria-label="$t('选择日期')"
              :aria-expanded="dateSheetOpen"
              @click="openDateSheet"
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <rect x="6" y="8" width="22" height="20" rx="3" stroke="#fecda6" stroke-width="1.4" />
                <path d="M11 5v5M23 5v5" stroke="#fecda6" stroke-width="1.4" stroke-linecap="round" />
                <path d="M6 14h22" stroke="#fecda6" stroke-width="1.4" />
                <circle cx="24" cy="22" r="3" fill="#ff9f4d" />
              </svg>
            </button>
          </div>
        </div>
        <div class="agent-home__preset-row">
          <button
            v-for="[key, label] in presetOptions"
            :key="key"
            type="button"
            class="agent-home__preset-btn"
            :class="{ 'agent-home__preset-btn--active': preset === key }"
            @click="emit('pickPreset', key)"
          >
            <p>{{ label }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- 浅色内容区：独立滚动 -->
    <div class="agent-home__main">
      <div class="agent-home__section">
        <div class="agent-home__panel">
          <p class="agent-home__panel-title">{{ $t('我的直属') }}</p>
          <div class="agent-home__stat-rows">
            <AgentOverviewStatMask
              v-for="item in directStats"
              :key="item.key"
              :label="item.label"
              :value="item.value"
            />
          </div>
        </div>
      </div>

      <div v-if="!isRebate" class="agent-home__section agent-home__section--sub">
        <div class="agent-home__panel">
          <p class="agent-home__panel-title">{{ $t('下级代理') }}</p>
          <div class="agent-home__stat-rows">
            <AgentOverviewStatMask
              v-for="item in MOCK_SUB_AGENT_STATS"
              :key="item.key"
              :label="item.label"
              :value="item.value"
              deep
            />
          </div>
        </div>
      </div>

      <div class="agent-home__section agent-home__section--rank">
        <div class="agent-home__rank-panel">
          <p class="agent-home__panel-title">{{ $t('用户盈亏排行') }}</p>

          <div class="agent-home__rank-tabs" data-name="tab" role="tablist" :aria-label="$t('盈亏排行类型')">
            <button
              v-for="tab in profitRankTabs"
              :key="tab.key"
              type="button"
              role="tab"
              class="agent-home__rank-tab"
              :class="{ 'agent-home__rank-tab--active': profitRankTab === tab.key }"
              :aria-selected="profitRankTab === tab.key"
              @click="emit('pickProfitRankTab', tab.key)"
            >
              <p>{{ $t(tab.label) }}</p>
            </button>
          </div>

          <div class="agent-home__rank-table-scroll">
            <div class="agent-home__rank-table">
              <div class="agent-home__rank-table-head">
                <div class="agent-home__rank-cell agent-home__rank-cell--rank"><p>{{ $t('排名') }}</p></div>
                <div class="agent-home__rank-cell agent-home__rank-cell--id"><p>{{ $t('金刚号') }}</p></div>
                <div class="agent-home__rank-cell agent-home__rank-cell--name"><p>{{ $t('昵称') }}</p></div>
                <div class="agent-home__rank-cell agent-home__rank-cell--profit"><p>{{ $t('盈利') }}</p></div>
              </div>
              <div
                v-for="row in profitRankRows"
                :key="`${profitRankTab}-${row.rank}`"
                class="agent-home__rank-table-row"
              >
                <div class="agent-home__rank-cell agent-home__rank-cell--rank"><p>{{ row.rank }}</p></div>
                <div class="agent-home__rank-cell agent-home__rank-cell--id"><p>{{ row.accountId }}</p></div>
                <div class="agent-home__rank-cell agent-home__rank-cell--name"><p>{{ row.nickname }}</p></div>
                <div
                  class="agent-home__rank-cell agent-home__rank-cell--profit"
                  :class="{ 'agent-home__rank-cell--loss': row.profit.startsWith('-') }"
                >
                  <p>{{ row.profit }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AgentMyShareRatioDialog
      :open="shareRatioOpen"
      :mode="agentType"
      :currency="currency"
      @close="closeShareRatioDialog"
    />

    <Mh5DateRangeSheet
      :open="dateSheetOpen"
      :start="dateSheetStart"
      :end="dateSheetEnd"
      @close="dateSheetOpen = false"
      @confirm="confirmOverviewDate"
    />

    <Mh5CurrencyPickerSheet
      :open="currencyPickerOpen"
      :currency="walletCurrency"
      :options="currencyOptions"
      @close="currencyPickerOpen = false"
      @pick="pickWalletCurrency"
    >
      <template #title-extra>
        <Mh5SpecAnnot :spec="AGENT_OVERVIEW_CURRENCY_SHEET_SPEC" placement="bottom" />
      </template>
    </Mh5CurrencyPickerSheet>
  </div>
</template>
