<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MOCK_AGENT_CREDIT_SUMMARY,
  RELATION_LABEL,
  relationTagClass,
} from '../constants/xCoinTransfer'
import {
  TEAM_FILTER_TABS,
  MOCK_TEAM_SELF,
  agentSubordinateLabel,
  getTeamChildren,
  memberKindLabel,
  showAgentSubordinateTag,
  showMemberBadge,
  type TeamFilterTab,
  type TeamListItem,
} from '../constants/agentTeam'
import '../styles/mobile-app-shell.css'

type BottomTab = 'overview' | 'team' | 'report' | 'me'
type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

const activeTab = ref<BottomTab>('overview')
const preset = ref<RangePreset>('today')
const route = useRoute()
const router = useRouter()

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'overview' || tab === 'team' || tab === 'report' || tab === 'me') {
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

const dateRangeText = computed(() => {
  const base = '2025-08-06'
  if (preset.value === 'today') return `${base}至${base}`
  if (preset.value === 'yesterday') return `2025-08-05至2025-08-05`
  if (preset.value === 'thisWeek') return `2025-08-04至2025-08-10`
  return `2025-07-28至2025-08-03`
})

/** 与截图一致的 10 项指标（含「投注退水」文案） */
const directStats = ref([
  { key: 'new', label: '新增会员', value: '126' },
  { key: 'active', label: '活跃人数', value: '126' },
  { key: 'recharge', label: '充值总额', value: '126' },
  { key: 'withdraw', label: '取款总额', value: '0.00' },
  { key: 'validBet', label: '有效投注', value: '0.00' },
  { key: 'rebate', label: '投注退水', value: '0.00' },
  { key: 'promo', label: '优惠活动', value: '0.00' },
  { key: 'fee', label: '充值手续费', value: '0.00' },
  { key: 'winLose', label: '游戏输赢', value: '0.00' },
  { key: 'netLose', label: '净输赢', value: '0.00' },
])

const showTeamSection = computed(() => activeTab.value === 'team')
const showOverviewSection = computed(() => activeTab.value === 'overview')
const showReportSection = computed(() => activeTab.value === 'report')
const showMeSection = computed(() => activeTab.value === 'me')

const teamFilterTab = ref<TeamFilterTab>('all')
const teamSelfExpanded = ref(true)

const teamChildRows = computed(() => getTeamChildren(teamFilterTab.value))

function goTeamDetailByNickname(item: TeamListItem) {
  // x币类型 → 会员详情；V1/V2 代理等 → 代理详情
  if (showMemberBadge(item.kind)) {
    router.push({ name: 'mobile-member-detail', query: { id: item.id } })
    return
  }
  router.push({ name: 'mobile-agent-detail', query: { id: item.id } })
}

function toggleTeamExpand() {
  teamSelfExpanded.value = !teamSelfExpanded.value
}

function teamRowBadge(item: TeamListItem) {
  return memberKindLabel(item.kind)
}

function pickPreset(v: RangePreset) {
  preset.value = v
}

function goXCoinCreditMember() {
  router.push({ name: 'mobile-xcoin-credit-member' })
}

function goXCoinCreditAgent() {
  router.push({ name: 'mobile-xcoin-credit-agent' })
}

function goXCoinRecords() {
  router.push({ name: 'mobile-xcoin-records' })
}

function goXCoinReport() {
  router.push({ name: 'mobile-xcoin-report' })
}

function switchTab(tab: BottomTab) {
  if (tab === 'report') {
    router.push({ name: 'mobile-agent-report' })
    return
  }
  activeTab.value = tab
  router.replace({ name: 'mobile-agent', query: tab === 'overview' ? {} : { tab } })
}

const xCoinCreditTotal = computed(() =>
  MOCK_AGENT_CREDIT_SUMMARY.reduce((sum, row) => sum + row.creditUpTotal, 0),
)
</script>

<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col antialiased"
    :class="showTeamSection ? 'agent-team-root' : 'agent-root bg-[#121212] text-white'"
  >
    <!-- 细颗粒噪点（概况模式） -->
    <div
      v-if="!showTeamSection"
      class="agent-grain pointer-events-none absolute inset-0 opacity-[0.14]"
      aria-hidden="true"
    />

    <!-- 团队管理：全屏浅色页 -->
    <template v-if="showTeamSection">
      <header class="agent-team-header">
        <button
          type="button"
          class="agent-team-header__back"
          aria-label="返回"
          @click="router.back()"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h1 class="agent-team-header__title">团队管理</h1>
        <div class="agent-team-header__actions">
          <button type="button" class="agent-team-header__icon-btn" aria-label="添加成员">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <button type="button" class="agent-team-header__icon-btn" aria-label="搜索">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
              <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div class="agent-team-toolbar">
        <div class="agent-team-toolbar__tabs">
          <button
            v-for="tab in TEAM_FILTER_TABS"
            :key="tab.key"
            type="button"
            class="agent-team-filter-pill"
            :class="{ 'agent-team-filter-pill--active': teamFilterTab === tab.key }"
            @click="teamFilterTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <main class="agent-team-list">
        <!-- 当前用户行 -->
        <div class="agent-team-row">
          <div class="agent-team-row__avatar">
            {{ MOCK_TEAM_SELF.avatarEmoji }}
          </div>
          <div class="agent-team-row__main">
            <button
              type="button"
              class="agent-team-row__name agent-team-row__name--link"
              @click="goTeamDetailByNickname(MOCK_TEAM_SELF)"
            >
              {{ MOCK_TEAM_SELF.nickname }}
            </button>
            <div class="agent-team-row__tags">
              <span class="agent-team-tag agent-team-tag--me">我</span>
              <span v-if="MOCK_TEAM_SELF.vipLevel" class="agent-team-tag agent-team-tag--vip">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M6 1l1.2 3.6H11L8.4 7.2l1.2 3.6L6 9.6 2.4 10.8 3.6 7.2 1 4.6h3.8L6 1Z" fill="currentColor" />
                </svg>
                V{{ MOCK_TEAM_SELF.vipLevel }}
              </span>
              <span
                v-if="showAgentSubordinateTag(MOCK_TEAM_SELF)"
                class="agent-team-tag agent-team-tag--agent"
              >
                {{ agentSubordinateLabel(MOCK_TEAM_SELF.subordinateCount) }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="agent-team-row__expand"
            :class="{ 'agent-team-row__expand--open': teamSelfExpanded }"
            aria-label="展开下级"
            @click.stop="toggleTeamExpand"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- 下级成员行 -->
        <template v-if="teamSelfExpanded">
          <div
            v-for="row in teamChildRows"
            :key="row.id"
            class="agent-team-row agent-team-row--child"
          >
            <div class="agent-team-row__avatar agent-team-row__avatar--placeholder" aria-hidden="true" />
            <div class="agent-team-row__main">
              <button
                type="button"
                class="agent-team-row__name agent-team-row__name--link"
                @click="goTeamDetailByNickname(row)"
              >
                {{ row.nickname }}
              </button>
              <div class="agent-team-row__tags">
                <span
                  v-if="showMemberBadge(row.kind)"
                  class="agent-team-tag agent-team-tag--xcoin"
                >
                  {{ teamRowBadge(row) }}
                </span>
                <span v-if="row.vipLevel" class="agent-team-tag agent-team-tag--vip">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1l1.2 3.6H11L8.4 7.2l1.2 3.6L6 9.6 2.4 10.8 3.6 7.2 1 4.6h3.8L6 1Z" fill="currentColor" />
                  </svg>
                  V{{ row.vipLevel }}
                </span>
                <span
                  v-if="showAgentSubordinateTag(row)"
                  class="agent-team-tag agent-team-tag--agent"
                >
                  {{ agentSubordinateLabel(row.subordinateCount) }}
                </span>
              </div>
            </div>
            <button type="button" class="agent-team-row__menu" aria-label="更多操作" @click.stop>···</button>
          </div>
        </template>
      </main>
    </template>

    <!-- 概况 / 报表 / 我的：深色代理中心 -->
    <div v-else class="relative z-10 mx-auto flex h-full min-h-0 w-full flex-col">
      <!-- 顶栏：左返回 / 居中标题 -->
      <header class="relative flex h-11 items-center px-3 pt-1">
        <button
          type="button"
          class="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[#D4A373]"
          aria-label="返回"
          @click="router.back()"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h1 class="w-full text-center text-[15px] font-semibold tracking-wide text-[#D4A373]">
          代理中心
        </h1>
      </header>

      <main class="flex flex-1 flex-col overflow-y-auto px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-1 min-h-0">
        <!-- 账号卡 -->
        <section
          class="rounded-[14px] border border-[#D4A373]/35 bg-gradient-to-b from-[#1a1816] to-[#141210] p-3.5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.95)]"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f3e7d6] via-[#e9c46a] to-[#c99852] text-[26px] shadow-inner"
            >
              {{ user.avatarEmoji }}
            </div>
            <div class="min-w-0 flex-1 pt-0.5">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-[15px] font-semibold text-white">
                  {{ user.nickname }}
                </p>
                <button
                  type="button"
                  class="shrink-0 rounded-full bg-gradient-to-b from-[#f6e7c8] to-[#e9c46a] px-3.5 py-1.5 text-[12px] font-semibold text-[#2a1f0f] shadow-[0_8px_18px_-10px_rgba(233,196,106,0.85)] transition active:scale-[0.98]"
                >
                  取款
                </button>
              </div>
              <div class="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  class="flex h-8 shrink-0 items-center gap-1 rounded-md border border-white/10 bg-[#1f1f1f] px-2 text-[12px] font-semibold text-white/85"
                >
                  <span class="text-white/55">X</span>
                  <span class="text-[10px] text-white/45">▾</span>
                </button>
                <p class="min-w-0 flex-1 truncate text-right text-[20px] font-bold tabular-nums tracking-tight text-white">
                  {{ account.balance }}
                </p>
                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1f1f1f] text-[#D4A373] transition hover:bg-white/5"
                  aria-label="刷新"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M21 12a9 9 0 1 1-2.64-6.36"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 盈亏 / 占成：左右分栏 -->
          <div class="mt-3.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="flex items-center justify-between gap-1 rounded-[10px] bg-[#f0d9c8]/95 px-2.5 py-2.5 text-left transition hover:opacity-95"
            >
              <span class="text-[11px] font-semibold text-[#5c4a42]">我的盈亏</span>
              <span class="flex min-w-0 items-center gap-0.5">
                <span class="truncate text-[12px] font-bold tabular-nums text-[#FF4D4F]">
                  {{ account.profit }}
                </span>
                <span class="shrink-0 text-[12px] font-semibold text-[#8a7268]">›</span>
              </span>
            </button>
            <button
              type="button"
              class="flex items-center justify-between gap-1 rounded-[10px] bg-[#e8c9b4]/90 px-2.5 py-2.5 text-left transition hover:opacity-95"
            >
              <span class="text-[11px] font-semibold text-[#5c4a42]">占成比例</span>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#c9a892]/80 bg-white/35 text-[10px] font-bold text-[#6b554a]"
              >
                i
              </span>
            </button>
          </div>
        </section>

        <!-- 数据时间段 -->
        <section class="mt-4">
          <p class="text-[12px] font-medium text-[#D4A373]/90">数据时间段</p>
          <div class="mt-2 flex items-stretch gap-2">
            <div
              class="flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border border-[#D4A373]/55 bg-[#1a1a1a] px-2 text-center text-[12px] font-semibold text-[#f6eadc]"
            >
              {{ dateRangeText }}
            </div>
            <button
              type="button"
              class="relative flex w-11 shrink-0 items-center justify-center rounded-[12px] border border-[#D4A373]/45 bg-[#1a1a1a] text-[#D4A373]"
              aria-label="选择日期"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
                <path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M4 10h16" stroke="currentColor" stroke-width="1.6" />
                <circle cx="16.5" cy="14.5" r="2.2" fill="#ff7a45" />
              </svg>
            </button>
          </div>

          <div class="mt-2.5 grid grid-cols-4 gap-2">
            <button
              v-for="(label, key) in [
                ['today', '今日'],
                ['yesterday', '昨日'],
                ['thisWeek', '本周'],
                ['lastWeek', '上周'],
              ] as const"
              :key="key"
              type="button"
              class="rounded-[10px] py-2 text-[12px] font-semibold transition"
              :class="
                preset === label[0]
                  ? 'bg-[#2a2a2a] text-[#E9C46A]'
                  : 'bg-[#1f1f1f] text-[#D4A373]/75 hover:text-[#E9C46A]'
              "
              @click="pickPreset(label[0])"
            >
              {{ label[1] }}
            </button>
          </div>
        </section>

        <!-- 浅色面板：我的直属 + 九宫格（截图主体） -->
        <section
          v-if="showOverviewSection"
          class="agent-sheet mt-4 flex-1 -translate-y-2 rounded-t-[22px] bg-[#FDFCF0] px-3 pb-5 pt-4 text-[#2a2420] shadow-[0_-10px_40px_-18px_rgba(0,0,0,0.55)]"
        >
          <h2 class="text-center text-[15px] font-semibold text-[#3a2f28]">我的直属</h2>
          <div class="mt-3 grid grid-cols-3 gap-[10px]">
            <div
              v-for="(m, idx) in directStats"
              :key="m.key"
              class="agent-stat-card overflow-hidden rounded-[12px] border border-[#e8ddd4] bg-white"
              :class="idx === directStats.length - 1 ? 'col-span-1' : ''"
            >
              <div class="agent-stat-head px-2 py-1.5 text-center text-[11px] font-semibold text-[#8a6a55]">
                {{ m.label }}
              </div>
              <div class="agent-stat-body relative px-2 pb-2.5 pt-1 text-center">
                <p class="relative text-[17px] font-bold tabular-nums text-[#1f1f1f]">
                  {{ m.value }}
                </p>
              </div>
            </div>
          </div>
          <div class="mh5-xcoin-entry-grid mt-4">
            <button type="button" class="mh5-xcoin-entry" @click="goXCoinCreditMember">给会员上分</button>
            <button type="button" class="mh5-xcoin-entry" @click="goXCoinCreditAgent">给代理上分</button>
            <button type="button" class="mh5-xcoin-entry" @click="goXCoinReport">X币报表</button>
            <button type="button" class="mh5-xcoin-entry" @click="goXCoinRecords">上下分记录</button>
          </div>
        </section>

        <!-- 其它 Tab：报表 / 我的 -->
        <section v-else-if="showReportSection" class="mt-4 rounded-t-[22px] bg-[#FDFCF0] p-4 text-[#2a2420]">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-semibold">我的报表</p>
            <span class="rounded-full bg-[#fff5eb] px-2.5 py-1 text-xs font-semibold text-[#c2410c]">X 币</span>
          </div>
          <p class="mt-1 text-xs text-black/45">{{ dateRangeText }}</p>

          <div class="mt-3 rounded-[12px] border border-[#e8ddd4] bg-white p-3">
            <p class="text-xs text-black/45">本期收到代理上分合计</p>
            <p class="mt-1 text-2xl font-bold tabular-nums text-[#ff7a2b]">+{{ xCoinCreditTotal.toFixed(2) }} X币</p>
          </div>

          <div class="mh5-xcoin-report-block !bg-white !border !border-[#e8ddd4]">
            <h3 class="mh5-xcoin-report-block__title">代理上分明细（按来源）</h3>
            <div v-for="row in MOCK_AGENT_CREDIT_SUMMARY" :key="row.agentId" class="mh5-xcoin-report-row">
              <div>
                <p class="mh5-xcoin-report-row__name">{{ row.agentName }}</p>
                <span :class="relationTagClass(row.relation)" class="mt-1">{{ RELATION_LABEL[row.relation] }}</span>
              </div>
              <div class="text-right">
                <p class="mh5-xcoin-report-row__amount">+{{ row.creditUpTotal.toFixed(2) }}</p>
                <p class="text-[11px] text-black/45">上分 {{ row.creditUpTotal.toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <button type="button" class="mt-3 w-full text-center text-sm font-semibold text-[#ff7a2b]" @click="goXCoinReport">
            打开 X币报表（完整页） →
          </button>
          <button type="button" class="mt-2 w-full text-center text-sm font-semibold text-[#ff7a2b]/80" @click="goXCoinRecords">
            查看全部上下分记录 →
          </button>
        </section>

        <section v-else-if="showMeSection" class="mt-4 rounded-t-[22px] bg-[#FDFCF0] p-4 text-[#2a2420]">
          <p class="text-sm font-semibold">我的</p>
          <p class="mt-2 text-sm text-black/50">原型占位：账号与设置入口。</p>
        </section>
      </main>
    </div>

    <!-- 底栏：白底 + 四图标 -->
    <nav
      class="safe-pb absolute bottom-0 left-0 right-0 z-20 w-full border-t border-black/6 bg-white"
    >
        <div class="grid grid-cols-4 px-1 pt-2">
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'overview' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="switchTab('overview')"
          >
            <span class="flex h-6 w-6 items-center justify-center">
              <svg v-if="activeTab === 'overview'" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z"
                  fill="#e07a2b"
                  opacity="0.18"
                />
                <path
                  d="M12 12 12 6a6 6 0 1 1-6 6"
                  stroke="#e07a2b"
                  stroke-width="2"
                  stroke-linecap="round"
                  fill="none"
                />
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z"
                  stroke="#bdbdbd"
                  stroke-width="1.8"
                />
                <path d="M12 12 12 7a5 5 0 1 1-5 5" stroke="#bdbdbd" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            概况
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'team' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="switchTab('team')"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4.5 20a4.5 4.5 0 0 1 9 0M11 20a4.5 4.5 0 0 1 8.5-1"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            团队管理
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'report' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="switchTab('report')"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 18V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M8 15V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M12 17v-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M16 13V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M20 16V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            我的报表
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'me' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="switchTab('me')"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 13.2a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 13.2Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M5.5 20.3c.9-3.1 3.6-5.1 6.5-5.1s5.6 2 6.5 5.1"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            我的
          </button>
        </div>
      </nav>
  </div>
</template>

<style scoped>
.agent-root {
  --bronze: #d4a373;
  --cream: #fdfcf0;
  --danger: #ff4d4f;
}

.agent-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

.agent-sheet {
  min-height: 52vh;
}

/* 指标卡：浅底 + 斜线纹理（接近截图几何暗纹） */
.agent-stat-head {
  background: linear-gradient(180deg, rgba(255, 228, 210, 0.95), rgba(255, 214, 188, 0.92));
  border-bottom: 1px solid rgba(232, 221, 212, 0.95);
}

.agent-stat-body {
  background-color: #fff;
  background-image: repeating-linear-gradient(
    125deg,
    rgba(180, 160, 140, 0.045) 0px,
    rgba(180, 160, 140, 0.045) 1px,
    transparent 1px,
    transparent 9px
  );
}

.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
