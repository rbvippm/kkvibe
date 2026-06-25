<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_DETAIL_TABS,
  findAgentDetail,
  type AgentDetailTab,
} from '../../constants/agentDetail'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const activeTab = ref<AgentDetailTab>('wallet')
const currency = ref('KKC')

const agent = computed(() => findAgentDetail(String(route.query.id ?? 'self')))

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

const xcoinStatItems = computed(() => {
  if (!agent.value) return []
  const { creditUpTotal, creditDownTotal } = agent.value.xcoinStats
  const net = creditUpTotal - creditDownTotal
  const format = (n: number) => n.toLocaleString('zh-CN')
  return [
    { label: '上分总额', value: format(creditUpTotal), positive: false },
    { label: '下分总额', value: format(creditDownTotal), positive: false },
    {
      label: '上下分净额',
      value: `${net >= 0 ? '+' : ''}${format(net)}`,
      positive: net >= 0,
    },
  ]
})

function goCredit() {
  router.push({ name: 'mobile-xcoin-credit-member' })
}
</script>

<template>
  <div class="mh5-agent-detail-page">
    <Mh5SubPageHeader title="代理详情">
      <template #right>
        <button type="button" class="mh5-agent-detail-currency" aria-label="切换币种">
          <span>{{ currency }}</span>
          <span class="mh5-agent-detail-currency__chevron">▾</span>
        </button>
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

      <div class="mh5-agent-detail-tabs">
        <button
          v-for="tab in AGENT_DETAIL_TABS"
          :key="tab.key"
          type="button"
          class="mh5-agent-detail-tab"
          :class="{ 'mh5-agent-detail-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="activeTab === 'wallet'">
        <section class="mh5-agent-detail-wallet">
          <div class="mh5-agent-detail-wallet__head">
            <h3 class="mh5-agent-detail-wallet__title">现金钱包</h3>
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
            v-for="wallet in agent.wallets"
            :key="wallet.currency"
            class="mh5-agent-detail-wallet__row"
          >
            <span class="mh5-agent-detail-wallet__label">{{ wallet.currency }} 余额</span>
            <span class="mh5-agent-detail-wallet__value">{{ wallet.balance }}</span>
          </div>
        </section>

        <section class="mh5-agent-detail-wallet mh5-agent-detail-xcoin">
          <div class="mh5-agent-detail-wallet__head">
            <h3 class="mh5-agent-detail-wallet__title">x币统计</h3>
          </div>
          <div
            v-for="item in xcoinStatItems"
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

      <section v-else-if="activeTab === 'profit'" class="mh5-agent-detail-placeholder">
        <p>代理盈亏数据加载中…</p>
        <span>按时间段汇总直属团队盈亏（原型占位）</span>
      </section>

      <section v-else class="mh5-agent-detail-placeholder">
        <p>暂无登录日志</p>
        <span>最近 30 天登录 IP 与设备记录（原型占位）</span>
      </section>
    </main>

    <main v-else class="mh5-agent-detail-main">
      <p class="mh5-agent-detail-empty">未找到该代理信息</p>
    </main>
  </div>
</template>
