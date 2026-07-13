<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_CREDIT_CURRENCY_TABS,
  formatCreditLimitRows,
  getAgentDetailCurrencyOptions,
  getAgentDetailTabs,
  getAgentDisplayName,
  findAgentDetail,
  isAgentCreditCurrency,
  type AgentCreditCurrency,
  type AgentDetailTab,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  AGENT_PROFIT_CATEGORY_TABS,
  AGENT_PROFIT_VENDORS,
  getAgentProfitDetail,
  getAgentProfitSummaryRows,
  profitTotalClass,
  profitValueClass,
  type AgentProfitCategoryKey,
  type AgentProfitVendorKey,
} from '../../constants/agentDetailProfit'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { AGENT_DETAIL_CREDIT_CURRENCY_SPEC } from '../../constants/agentDetailSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const activeTab = ref<AgentDetailTab>('wallet')
const currencyPickerOpen = ref(false)
const currency = ref<AgentWalletCurrency>('KKC')
const creditCurrency = ref<AgentCreditCurrency>('信用额度-kkc')

const profitCategory = ref<AgentProfitCategoryKey>('sports')
const profitVendor = ref<AgentProfitVendorKey>('im')

const agent = computed(() => findAgentDetail(String(route.query.id ?? 'self')))
const isCredited = computed(() => Boolean(agent.value?.isCredited))
const detailTabs = computed(() => getAgentDetailTabs(isCredited.value))
const currencyOptions = computed(() => getAgentDetailCurrencyOptions(isCredited.value))

watch(isCredited, (credited) => {
  if (!credited) {
    if (activeTab.value === 'credit') activeTab.value = 'wallet'
    if (isAgentCreditCurrency(currency.value)) currency.value = 'KKC'
  }
})

const profitVendorOptions = computed(() => AGENT_PROFIT_VENDORS[profitCategory.value])
const profitDetail = computed(() => getAgentProfitDetail(profitCategory.value, profitVendor.value))
const profitSummaryRows = computed(() => getAgentProfitSummaryRows(currency.value))

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

const creditLimitTitle = '信用额度'

const creditLimitItems = computed(() => {
  if (!agent.value) return []
  return formatCreditLimitRows(agent.value.creditLimits[creditCurrency.value])
})

function goCredit() {
  if (!agent.value) return
  router.push({
    name: 'mobile-xcoin-credit-agent',
    query: {
      targetId: agent.value.id,
      targetName: getAgentDisplayName(agent.value),
      currency: creditCurrency.value,
    },
  })
}

function pickCurrency(value: AgentWalletCurrency) {
  currency.value = value
  if (isAgentCreditCurrency(value)) {
    creditCurrency.value = value
  }
  currencyPickerOpen.value = false
}
</script>

<template>
  <div class="mh5-agent-detail-page">
    <Mh5SubPageHeader title="代理详情">
      <template #right>
        <div class="mh5-agent-detail-header-actions">
          <Mh5SpecAnnot :spec="AGENT_DETAIL_CREDIT_CURRENCY_SPEC" placement="bottom" />
          <button
            type="button"
            class="mh5-agent-detail-currency"
            aria-label="切换币种"
            @click="currencyPickerOpen = true"
          >
            <span>{{ currency }}</span>
            <span class="mh5-agent-detail-currency__chevron">▾</span>
          </button>
        </div>
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

      <div class="mh5-agent-detail-tabs" role="tablist" aria-label="代理详情分类">
        <button
          v-for="tab in detailTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-agent-detail-tab"
          :class="{ 'mh5-agent-detail-tab--active': activeTab === tab.key }"
          :aria-selected="activeTab === tab.key"
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
      </template>

      <template v-else-if="activeTab === 'credit'">
        <nav
          class="mh5-agent-profit-ratio-seg mh5-agent-detail-credit-seg"
          role="tablist"
          aria-label="信用额度币种"
        >
          <button
            v-for="tab in AGENT_CREDIT_CURRENCY_TABS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-agent-profit-ratio-seg__item"
            :class="{ 'mh5-agent-profit-ratio-seg__item--active': creditCurrency === tab.key }"
            :aria-selected="creditCurrency === tab.key"
            @click="creditCurrency = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>

        <section class="mh5-agent-detail-wallet mh5-agent-detail-xcoin">
          <div class="mh5-agent-detail-wallet__head">
            <h3 class="mh5-agent-detail-wallet__title">{{ creditLimitTitle }}</h3>
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
            v-for="row in profitSummaryRows"
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
            v-for="opt in currencyOptions"
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
