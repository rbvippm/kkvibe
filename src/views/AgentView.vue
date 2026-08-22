<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_OVERVIEW_CURRENCY_BALANCES,
  type AgentOverviewCurrency,
  type ProfitRankTab,
} from '../constants/agentOverview'
import {
  agentAppCurrency,
  isAgentCreditCurrency,
  overviewCurrencyToWallet,
  setAgentAppCurrencyByUser,
  fallbackAgentCashCurrency,
  walletCurrencyToOverview,
} from '../constants/agentAppCurrency'
import AgentOverviewPage from '../components/mobile/AgentOverviewPage.vue'
import AgentTeamPage from '../components/mobile/AgentTeamPage.vue'
import AgentReportPage from '../components/mobile/AgentReportPage.vue'
import AgentMePage from '../components/mobile/AgentMePage.vue'
import MobileBetOrderQueryView from './mobile/MobileBetOrderQueryView.vue'
import AgentBottomNav from '../components/mobile/AgentBottomNav.vue'
import { useAgentIdentity } from '../composables/useAgentIdentity'
import { useBetOrderSearchSeed } from '../composables/useBetOrderSearchSeed'
import { agentReportPageTab } from '../constants/agentReportTab'
import '../styles/mobile-app-shell.css'

type BottomTab = 'overview' | 'team' | 'bet-order' | 'report' | 'me'
type RangePreset = 'today' | 'yesterday' | 'thisMonth' | 'lastMonth'

const activeTab = ref<BottomTab>('overview')
const preset = ref<RangePreset | null>('today')
const customDateRange = ref<{ start: string; end: string } | null>(null)
const route = useRoute()
const router = useRouter()
const { agentType, isRebateAgent, agentTypeLabel, withAgentQuery } = useAgentIdentity()
const { betOrderSearchSeed, setBetOrderSearchSeed } = useBetOrderSearchSeed()

watch(
  isRebateAgent,
  (rebate) => {
    /** 返佣无信用额度：若当前为信用币种则回退语言默认现金币种 */
    if (rebate && isAgentCreditCurrency(agentAppCurrency.value)) {
      fallbackAgentCashCurrency()
    }
  },
  { immediate: true },
)

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'overview' || tab === 'team' || tab === 'bet-order' || tab === 'report' || tab === 'me') {
      activeTab.value = tab
      return
    }
    if (!tab) activeTab.value = 'overview'
  },
  { immediate: true },
)

/** 团队快捷入口：把 keyword 同步到代理中心级 seed，供注单页填入搜索框 */
watch(
  () => route.query.keyword,
  (raw) => {
    if (typeof raw === 'string' && raw.trim()) {
      setBetOrderSearchSeed(raw.trim())
    }
  },
  { immediate: true },
)

function clearBetOrderKeywordQuery() {
  if (typeof route.query.keyword !== 'string' || !route.query.keyword) return
  const nextQuery: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (key === 'keyword' || typeof value !== 'string' || !value) continue
    nextQuery[key] = value
  }
  router.replace({ name: 'mobile-agent', query: withAgentQuery(nextQuery) })
}

/** 离开注单 Tab 后再清空 seed，避免 Strict 双挂载时第二次拿到空关键词 */
watch(activeTab, (tab, prev) => {
  if (prev === 'bet-order' && tab !== 'bet-order') {
    setBetOrderSearchSeed('')
  }
})

const user = computed(() =>
  isRebateAgent.value
    ? { nickname: 'rebate888', avatarEmoji: '🦊' }
    : { nickname: 'fafa888888', avatarEmoji: '🧔‍♂️' },
)

const account = ref({
  balance: '236,188,666.00',
  profit: '-3,000,000,000',
})

const currency = computed(() => walletCurrencyToOverview(agentAppCurrency.value))

const balance = computed(() => AGENT_OVERVIEW_CURRENCY_BALANCES[currency.value])
const profitRankTab = ref<ProfitRankTab>('member_win')

watch(isRebateAgent, (rebate) => {
  /** 返佣无代理盈利 TOP：若当前落在该 Tab 则回退会员盈利 */
  if (rebate && profitRankTab.value === 'agent_win') {
    profitRankTab.value = 'member_win'
  }
})

const dateRangeText = computed(() => {
  if (customDateRange.value) {
    return `${customDateRange.value.start}至${customDateRange.value.end}`
  }
  const today = '2025-08-06'
  if (preset.value === 'yesterday') return '2025-08-05至2025-08-05'
  if (preset.value === 'thisMonth') return `2025-08-01至${today}`
  if (preset.value === 'lastMonth') return '2025-07-01至2025-07-31'
  return `${today}至${today}`
})

function pickProfitRankTab(tab: ProfitRankTab) {
  profitRankTab.value = tab
}

function pickCurrency(value: AgentOverviewCurrency) {
  setAgentAppCurrencyByUser(overviewCurrencyToWallet(value))
}

const showTeamSection = computed(() => activeTab.value === 'team')
const showOverviewSection = computed(() => activeTab.value === 'overview')
const showReportSection = computed(() => activeTab.value === 'report')
const showBetOrderSection = computed(() => activeTab.value === 'bet-order')
const showMeSection = computed(() => activeTab.value === 'me')
const openShareRatio = computed(() => String(route.query.shareRatio || '') === '1')

function clearShareRatioQuery() {
  if (!openShareRatio.value) return
  const query = { ...route.query }
  delete query.shareRatio
  router.replace({ name: 'mobile-agent', query: withAgentQuery(query as Record<string, string>) })
}

function pickPreset(v: RangePreset) {
  customDateRange.value = null
  preset.value = v
}

function pickDateRange(start: string, end: string) {
  customDateRange.value = { start, end }
  preset.value = null
}

function agentQueryForTab(tab: BottomTab): Record<string, string> {
  const query: Record<string, string> = {}
  const from = route.query.from
  if (typeof from === 'string' && from) query.from = from
  if (tab !== 'overview') query.tab = tab
  if (tab === 'report') query.reportTab = agentReportPageTab.value
  return withAgentQuery(query)
}

function handleAgentBack() {
  const from = route.query.from
  if (from === 'mine') {
    router.push({ name: 'mobile-mine' })
    return
  }
  router.push({ name: 'home' })
}

function switchTab(tab: BottomTab) {
  activeTab.value = tab
  router.replace({ name: 'mobile-agent', query: agentQueryForTab(tab) })
}
</script>

<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col antialiased"
    :class="[
      showTeamSection
        ? 'agent-team-root'
        : showOverviewSection
          ? 'agent-root'
          : showReportSection || showBetOrderSection
            ? 'agent-report-root'
            : showMeSection
              ? 'agent-me-root'
              : 'agent-root bg-[#121212] text-white',
      isRebateAgent ? 'agent-identity--rebate' : 'agent-identity--share',
    ]"
    :data-agent-type="agentType"
  >
    <!-- 团队管理：Figma 1433:19431 -->
    <AgentTeamPage
      v-if="showTeamSection"
      class="relative z-10 flex h-full min-h-0 w-full flex-col"
    />

    <!-- 概况：Figma 1:1 DOM -->
    <AgentOverviewPage
      v-else-if="showOverviewSection"
      class="relative z-10 flex h-full min-h-0 w-full flex-col"
      :nickname="user.nickname"
      :avatar-emoji="user.avatarEmoji"
      :identity-label="agentTypeLabel"
      :agent-type="agentType"
      :balance="balance"
      :profit="account.profit"
      :currency="currency"
      :date-range-text="dateRangeText"
      :preset="preset"
      :profit-rank-tab="profitRankTab"
      :open-share-ratio="openShareRatio"
      @back="handleAgentBack"
      @pick-preset="pickPreset"
      @pick-date-range="pickDateRange"
      @pick-profit-rank-tab="pickProfitRankTab"
      @pick-currency="pickCurrency"
      @share-ratio-closed="clearShareRatioQuery"
    />

    <!-- 注单查询 -->
    <MobileBetOrderQueryView
      v-else-if="showBetOrderSection"
      embedded
      class="relative z-10 flex h-full min-h-0 w-full flex-col"
      :seed-keyword="betOrderSearchSeed"
      @seed-applied="clearBetOrderKeywordQuery"
    />

    <!-- 我的报表 -->
    <AgentReportPage
      v-else-if="showReportSection"
      class="relative z-10 flex h-full min-h-0 w-full flex-col"
    />

    <!-- 我的 -->
    <AgentMePage
      v-else-if="showMeSection"
      class="relative z-10 flex h-full min-h-0 w-full flex-col"
    />

    <!-- 底栏：Figma NvgBar -->
    <AgentBottomNav class="absolute bottom-0 left-0 right-0 z-20" :active-tab="activeTab" @switch="switchTab" />
  </div>
</template>

<style scoped>
.agent-root {
  --bronze: #d4a373;
  --cream: #fdfcf0;
  --danger: #ff4d4f;
}
</style>
