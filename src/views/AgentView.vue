<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_OVERVIEW_CURRENCY_BALANCES,
  type AgentOverviewCurrency,
  type ProfitRankTab,
} from '../constants/agentOverview'
import AgentOverviewPage from '../components/mobile/AgentOverviewPage.vue'
import AgentTeamPage from '../components/mobile/AgentTeamPage.vue'
import AgentReportPage from '../components/mobile/AgentReportPage.vue'
import AgentMePage from '../components/mobile/AgentMePage.vue'
import MobileBetOrderQueryView from './mobile/MobileBetOrderQueryView.vue'
import AgentBottomNav from '../components/mobile/AgentBottomNav.vue'
import '../styles/mobile-app-shell.css'

type BottomTab = 'overview' | 'team' | 'bet-order' | 'report' | 'me'
type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

const activeTab = ref<BottomTab>('overview')
const preset = ref<RangePreset>('today')
const route = useRoute()
const router = useRouter()

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'overview' || tab === 'team' || tab === 'bet-order' || tab === 'report' || tab === 'me') {
      activeTab.value = tab
    }
  },
  { immediate: true },
)

const user = ref({
  nickname: 'fafa888888',
  avatarEmoji: '🧔🏻‍♂️',
})

const account = ref({
  balance: '236,188,666.00',
  profit: '-3,000,000,000',
})

const currency = ref<AgentOverviewCurrency>('KKC')

const balance = computed(() => AGENT_OVERVIEW_CURRENCY_BALANCES[currency.value])
const profitRankTab = ref<ProfitRankTab>('member_win')

const dateRangeText = computed(() => {
  const base = '2025-08-06'
  if (preset.value === 'today') return `${base}至${base}`
  if (preset.value === 'yesterday') return `2025-08-05至2025-08-05`
  if (preset.value === 'thisWeek') return `2025-08-04至2025-08-10`
  return `2025-07-28至2025-08-03`
})

function pickProfitRankTab(tab: ProfitRankTab) {
  profitRankTab.value = tab
}

function pickCurrency(value: AgentOverviewCurrency) {
  currency.value = value
}

const showTeamSection = computed(() => activeTab.value === 'team')
const showOverviewSection = computed(() => activeTab.value === 'overview')
const showReportSection = computed(() => activeTab.value === 'report')
const showBetOrderSection = computed(() => activeTab.value === 'bet-order')
const showMeSection = computed(() => activeTab.value === 'me')

function pickPreset(v: RangePreset) {
  preset.value = v
}

function agentQueryForTab(tab: BottomTab): Record<string, string> {
  const query: Record<string, string> = {}
  const from = route.query.from
  if (typeof from === 'string' && from) query.from = from
  if (tab !== 'overview') query.tab = tab
  return query
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
    :class="
      showTeamSection
        ? 'agent-team-root'
        : showOverviewSection
          ? 'agent-root'
          : showReportSection || showBetOrderSection
            ? 'agent-report-root'
            : showMeSection
              ? 'agent-me-root'
              : 'agent-root bg-[#121212] text-white'
    "
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
      :balance="balance"
      :profit="account.profit"
      :currency="currency"
      :date-range-text="dateRangeText"
      :preset="preset"
      :profit-rank-tab="profitRankTab"
      @back="handleAgentBack"
      @pick-preset="pickPreset"
      @pick-profit-rank-tab="pickProfitRankTab"
      @pick-currency="pickCurrency"
    />

    <!-- 注单查询 -->
    <MobileBetOrderQueryView
      v-else-if="showBetOrderSection"
      embedded
      class="relative z-10 flex h-full min-h-0 w-full flex-col"
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
