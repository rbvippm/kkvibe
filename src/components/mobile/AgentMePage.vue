<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  AGENT_ME_MENU_ITEMS,
  MOCK_AGENT_ME_PROFILE,
  MOCK_AGENT_ME_PROFIT_ROWS,
  MOCK_AGENT_ME_UPDATED_AT,
  type AgentMeMenuItem,
} from '../../constants/agentMe'
import { AGENT_ME_REBATE_SPEC } from '../../constants/agentMeSpec'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'

const router = useRouter()
const { isRebateAgent, withAgentQuery } = useAgentIdentity()
const profile = MOCK_AGENT_ME_PROFILE

const REBATE_PROFIT_LABELS: Record<string, string> = {
  kkc: 'KKC总佣金',
  kkv: 'KKV总佣金',
  usdt: 'USDT总佣金',
}

/** 返佣：模块名「我的佣金」；占成：「我的盈亏」 */
const profitSectionTitle = computed(() => (isRebateAgent.value ? '我的佣金' : '我的盈亏'))

/** 返佣代理无信用额度行，文案为「总佣金」 */
const profitRows = computed(() => {
  if (!isRebateAgent.value) return MOCK_AGENT_ME_PROFIT_ROWS
  return MOCK_AGENT_ME_PROFIT_ROWS.filter(
    (row) => row.key !== 'credit-cny' && row.key !== 'credit-usd',
  ).map((row) => ({
    ...row,
    label: REBATE_PROFIT_LABELS[row.key] ?? row.label,
  }))
})

const CREDIT_MENU_KEYS = new Set(['credit-agent', 'credit-member', 'credit-record'])

/** 返佣代理无上下分 / 信用额度记录入口 */
const menuItems = computed(() =>
  isRebateAgent.value
    ? AGENT_ME_MENU_ITEMS.filter((item) => !CREDIT_MENU_KEYS.has(item.key))
    : AGENT_ME_MENU_ITEMS,
)

function openMenu(item: AgentMeMenuItem) {
  if (!item.routeName) return
  router.push({ name: item.routeName, query: withAgentQuery() })
}
</script>

<template>
  <div class="agent-me-page">
    <header class="agent-me-header">
      <h1 class="agent-me-header__title">{{ $t('我的') }}<Mh5SpecAnnot
          v-if="isRebateAgent"
          :spec="AGENT_ME_REBATE_SPEC"
          placement="bottom"
        />
      </h1>
    </header>

    <main class="agent-me-main">
      <section class="agent-me-profile">
        <img class="agent-me-profile__avatar" :src="profile.avatarUrl" alt="" />
        <div class="agent-me-profile__body">
          <p class="agent-me-profile__nickname">昵称:{{ profile.nickname }}</p>
          <div class="agent-me-profile__badge">
            <span class="agent-me-profile__level" :aria-label="$t('等级')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.47L12 17.77l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2z"
                  fill="#f5a623"
                />
              </svg>
              <span>{{ profile.level }}</span>
            </span>
            <span class="agent-me-profile__stats">
              {{ profile.agentLevelLabel }}({{ profile.agentCount }}人) | 会({{ profile.memberCount }}人)
            </span>
          </div>
        </div>
      </section>

      <section class="agent-me-profit">
        <h2 class="agent-me-profit__title">{{ profitSectionTitle }}</h2>
        <div class="agent-me-profit__rows">
          <div
            v-for="row in profitRows"
            :key="row.key"
            class="agent-me-profit__row"
          >
            <span class="agent-me-profit__row-label">{{ $t(row.label) }}</span>
            <span class="agent-me-profit__row-value">{{ row.value }}</span>
          </div>
        </div>
        <div class="agent-me-profit__footer">
          <span>{{ $t('更新时间') }}</span>
          <span>{{ MOCK_AGENT_ME_UPDATED_AT }}</span>
        </div>
      </section>

      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="agent-me-menu-item"
        @click="openMenu(item)"
      >
        <span class="agent-me-menu-item__icon" aria-hidden="true">
          <svg v-if="item.icon === 'promo'" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 10v5a2 2 0 002 2h1.5l1.2 3 2.8-1.6H18a2 2 0 002-2v-5M4 10l8-5 8 5M9 14h.01M12 14h.01M15 14h.01"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="item.icon === 'credit-record'" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
            <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.6" />
            <circle cx="17" cy="10" r="2.5" stroke="currentColor" stroke-width="1.6" />
            <path
              d="M4 19c0-2.5 2.2-4.5 5-4.5M14 17.5c1.8 0 3.3 1 4 2.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="agent-me-menu-item__title">{{ $t(item.title) }}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" class="agent-me-menu-item__arrow" aria-hidden="true">
          <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </main>
  </div>
</template>
