<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_DETAIL_TABS,
  AGENT_WALLET_CURRENCY_OPTIONS,
  findAgentDetail,
  type AgentDetailTab,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_SUMMARY_ROWS,
  AGENT_PROFIT_VENDORS,
  getAgentProfitDetail,
  profitTotalClass,
  profitValueClass,
  type AgentProfitCategoryKey,
  type AgentProfitVendorKey,
} from '../../constants/agentDetailProfit'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const activeTab = ref<AgentDetailTab>('wallet')
const currencyPickerOpen = ref(false)

const AGENT_DETAIL_CURRENCIES = AGENT_WALLET_CURRENCY_OPTIONS

const currency = ref<AgentWalletCurrency>('KKC')

const profitCategory = ref<AgentProfitCategoryKey>('sports')
const profitVendor = ref<AgentProfitVendorKey>('im')

const agent = computed(() => findAgentDetail(String(route.query.id ?? 'self')))

const profitVendorOptions = computed(() => AGENT_PROFIT_VENDORS[profitCategory.value])

const profitDetail = computed(() => getAgentProfitDetail(profitCategory.value, profitVendor.value))

function selectProfitCategory(key: AgentProfitCategoryKey) {
  profitCategory.value = key
  profitVendor.value = AGENT_PROFIT_VENDORS[key][0]?.key ?? 'im'
}

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

const creditLimitItems = computed(() => {
  if (!agent.value) return []
  const { creditBalance, creditUpTotal, creditDownTotal, shareRatio } = agent.value.creditLimit
  const format = (n: number) => n.toLocaleString('zh-CN')
  const net = creditUpTotal - creditDownTotal
  const actualNet = Math.round((net * shareRatio) / 100)
  return [
    { label: '信用余额', value: format(creditBalance), positive: false },
    { label: '上分总额', value: format(creditUpTotal), positive: false },
    { label: '下分总额', value: format(creditDownTotal), positive: false },
    {
      label: '上下分净额',
      value: `${net >= 0 ? '+' : ''}${format(net)}`,
      positive: net >= 0,
    },
    { label: '占成比例', value: `${shareRatio}%`, positive: false },
    {
      label: '实占上下分净额',
      value: `${actualNet >= 0 ? '+' : ''}${format(actualNet)}`,
      positive: actualNet >= 0,
    },
  ]
})

function goCredit() {
  router.push({ name: 'mobile-xcoin-credit-member' })
}

function pickCurrency(value: AgentWalletCurrency) {
  currency.value = value
  currencyPickerOpen.value = false
}
</script>

<template>
  <div class="mh5-agent-detail-page">
    <Mh5SubPageHeader title="代理详情">
      <template #right>
        <button
          type="button"
          class="mh5-agent-detail-currency"
          aria-label="切换币种"
          @click="currencyPickerOpen = true"
        >
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
            <h3 class="mh5-agent-detail-wallet__title">信用额度</h3>
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
            v-for="item in creditLimitItems"
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

      <section v-else-if="activeTab === 'profit'" class="mh5-agent-detail-profit">
        <section class="mh5-agent-detail-wallet mh5-agent-detail-profit-summary">
          <div
            v-for="row in AGENT_PROFIT_SUMMARY_ROWS"
            :key="row.label"
            class="mh5-agent-detail-wallet__row"
          >
            <span class="mh5-agent-detail-wallet__label">{{ row.label }}</span>
            <span class="mh5-agent-detail-wallet__value">{{ row.value }}</span>
          </div>
        </section>

        <div class="mh5-agent-report-categories">
          <div class="mh5-agent-report-cat-tabs">
            <button
              v-for="tab in AGENT_PROFIT_CATEGORY_TABS"
              :key="tab.key"
              type="button"
              class="mh5-agent-report-cat-tab"
              :class="{ 'mh5-agent-report-cat-tab--active': profitCategory === tab.key }"
              @click="selectProfitCategory(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="mh5-agent-report-vendors">
            <button
              v-for="pill in profitVendorOptions"
              :key="pill.key"
              type="button"
              class="mh5-agent-report-vendor"
              :class="{ 'mh5-agent-report-vendor--active': profitVendor === pill.key }"
              @click="profitVendor = pill.key"
            >
              {{ pill.label }}
            </button>
          </div>
        </div>

        <section class="mh5-agent-report-detail">
          <div class="mh5-agent-report-detail__head">
            <span class="mh5-agent-report-detail__title">{{ profitDetail.title }}</span>
            <span class="mh5-agent-report-detail__profit">
              总盈亏
              <em :class="profitTotalClass(profitDetail.totalProfitTone)">
                {{ profitDetail.totalProfit }}
              </em>
            </span>
          </div>
          <div
            v-for="row in profitDetail.rows"
            :key="row.label"
            class="mh5-agent-report-detail__row"
          >
            <span class="mh5-agent-report-detail__row-label">{{ row.label }}</span>
            <span
              class="mh5-agent-report-detail__row-value"
              :class="profitValueClass(row.tone)"
            >
              {{ row.value }}
            </span>
          </div>
        </section>
      </section>

      <section v-else class="mh5-agent-detail-placeholder">
        <p>暂无登录日志</p>
        <span>最近 30 天登录 IP 与设备记录（原型占位）</span>
      </section>
    </main>

    <main v-else class="mh5-agent-detail-main">
      <p class="mh5-agent-detail-empty">未找到该代理信息</p>
    </main>

    <Transition name="mh5-agent-detail-sheet">
      <div
        v-if="currencyPickerOpen"
        class="mh5-xcoin-sheet-mask"
        @click.self="currencyPickerOpen = false"
      >
        <div class="mh5-xcoin-sheet">
          <h2 class="mh5-xcoin-sheet__title">选择币种</h2>
          <button
            v-for="opt in AGENT_DETAIL_CURRENCIES"
            :key="opt"
            type="button"
            class="mh5-xcoin-sheet__option"
            :class="{ 'mh5-xcoin-sheet__option--active': currency === opt }"
            @click="pickCurrency(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mh5-agent-detail-sheet-enter-active,
.mh5-agent-detail-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-agent-detail-sheet-enter-active .mh5-xcoin-sheet,
.mh5-agent-detail-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-agent-detail-sheet-enter-from,
.mh5-agent-detail-sheet-leave-to {
  opacity: 0;
}

.mh5-agent-detail-sheet-enter-from .mh5-xcoin-sheet,
.mh5-agent-detail-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
