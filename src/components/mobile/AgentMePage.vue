<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  AGENT_ME_ASSETS,
  AGENT_ME_MENU_ITEMS,
  MOCK_AGENT_ME_PROFILE,
  MOCK_AGENT_ME_PROFIT_ROWS,
  MOCK_AGENT_ME_UPDATED_AT,
  type AgentMeMenuItem,
} from '../../constants/agentMe'
import { AGENT_ME_REBATE_SPEC } from '../../constants/agentMeSpec'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'

const router = useRouter()
const { isRebateAgent, isCreditLedger, withAgentQuery } = useAgentIdentity()
const profile = MOCK_AGENT_ME_PROFILE

/** 返佣：模块名「我的佣金」；占成：「我的盈亏」 */
const profitSectionTitle = computed(() => (isRebateAgent.value ? '我的佣金' : '我的盈亏'))
const profitColumnTitle = computed(() => (isRebateAgent.value ? '总佣金' : '总盈亏'))

const CREDIT_PROFIT_ROW_KEYS = new Set(['credit-cny', 'credit-usd'])

/** 现金 / 返佣只看现金三币种；信用代理只看信用额度两币种 */
const profitRows = computed(() =>
  MOCK_AGENT_ME_PROFIT_ROWS.filter(
    (row) => CREDIT_PROFIT_ROW_KEYS.has(row.key) === isCreditLedger.value,
  ),
)

const CREDIT_MENU_KEYS = new Set(['credit-agent', 'credit-member', 'credit-record'])
const SHARE_MENU_KEYS = new Set(['member-default-rebate'])

/** 返佣：无会员默认退水与信用入口；现金代理：无信用入口；现金 / 信用占成代理均有会员默认退水 */
const menuItems = computed(() =>
  AGENT_ME_MENU_ITEMS.filter((item) => {
    if (CREDIT_MENU_KEYS.has(item.key)) return isCreditLedger.value
    if (SHARE_MENU_KEYS.has(item.key)) return !isRebateAgent.value
    return true
  }),
)

function openMenu(item: AgentMeMenuItem) {
  if (!item.routeName) return
  router.push({ name: item.routeName, query: withAgentQuery() })
}
</script>

<template>
  <div class="agent-me-page">
    <header class="agent-me-header">
      <h1 class="agent-me-header__title">
        {{ $t('我的') }}
        <Mh5SpecAnnot
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
            <span v-if="!isRebateAgent" class="agent-me-profile__level" :aria-label="$t('等级')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.47L12 17.77l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2z"
                  fill="#f5a623"
                />
              </svg>
              <span>{{ profile.level }}</span>
            </span>
            <span class="agent-me-profile__stats">
              <img
                v-if="isRebateAgent"
                class="agent-me-profile__stats-icon"
                :src="AGENT_ME_ASSETS.member"
                alt=""
                width="10"
                height="10"
              />
              <template v-if="isRebateAgent">
                会({{ profile.memberCount }}人)
              </template>
              <template v-else>
                {{ profile.agentLevelLabel }}({{ profile.agentCount }}人) | 会({{ profile.memberCount }}人)
              </template>
            </span>
          </div>
        </div>
      </section>

      <section class="agent-me-profit">
        <div class="agent-me-profit__head">
          <h2 class="agent-me-profit__title">{{ $t(profitSectionTitle) }}</h2>
          <p class="agent-me-profit__column">{{ $t(profitColumnTitle) }}</p>
        </div>
        <div class="agent-me-profit__rows">
          <div
            v-for="row in profitRows"
            :key="row.key"
            class="agent-me-profit__row"
          >
            <span class="agent-me-profit__row-main">
              <Mh5CurrencyIcon :code="row.currency" :size="20" />
              <span>{{ $t(row.label) }}</span>
            </span>
            <span class="agent-me-profit__row-value">{{ row.value }}</span>
          </div>
        </div>
        <div class="agent-me-profit__footer">
          <span>{{ $t('更新时间') }}</span>
          <span>{{ MOCK_AGENT_ME_UPDATED_AT }}</span>
        </div>
      </section>

      <nav class="agent-me-menu" aria-label="更多功能">
        <button
          v-for="item in menuItems"
          :key="item.key"
          type="button"
          class="agent-me-menu-item"
          @click="openMenu(item)"
        >
          <span class="agent-me-menu-item__icon" aria-hidden="true">
            <img
              v-if="item.icon === 'promo'"
              :src="AGENT_ME_ASSETS.megaphone"
              alt=""
              width="20"
              height="20"
            />
            <svg v-else-if="item.icon === 'member-rebate'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17V7M12 17V11M17 17V5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <path d="M5 17h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <svg v-else-if="item.icon === 'credit-record'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <svg v-else-if="item.icon === 'credit-settle'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 7h11l-3-3M17 17H6l3 3"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <img
            class="agent-me-menu-item__arrow"
            :src="AGENT_ME_ASSETS.arrow"
            alt=""
            width="8"
            height="14"
            aria-hidden="true"
          />
        </button>
      </nav>
    </main>
  </div>
</template>
