<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5DateRangeSheet from '../../components/mobile/Mh5DateRangeSheet.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  AGENT_SETTLE_CREDIT_OPTIONS,
  AGENT_SETTLE_TODAY,
  MOCK_AGENT_SETTLE_AGENTS,
  agentSettleWallets,
  filterAgentSettleList,
  formatSettleMoney,
  formatSettleNumber,
  settleStatusTagText,
  settleWalletIcon,
  settleWalletStatus,
  summarizeAgentSettle,
  type AgentSettleCurrencyFilter,
} from '../../constants/agentSettle'
import { AGENT_SETTLE_LIST_SPEC } from '../../constants/agentSettleSpec'
import {
  DATE_RANGE_SHEET_PRESETS,
  dateRangeSheetPresetRange,
  matchDateRangeSheetPreset,
} from '../../constants/mh5DateRange'
import { withMineHallFrom } from '../../constants/mineHall'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const defaultRange = dateRangeSheetPresetRange('thisMonth', AGENT_SETTLE_TODAY)
const rangeStart = ref(String(route.query.start || defaultRange.start))
const rangeEnd = ref(String(route.query.end || defaultRange.end))
const dateOpen = ref(false)
const currency = ref<AgentSettleCurrencyFilter>(
  route.query.currency === 'USD' || route.query.currency === 'CNY'
    ? route.query.currency
    : '',
)
const agentId = ref('')
const pickerOpen = ref<'currency' | 'agent' | null>(null)

const filteredAgents = computed(() =>
  filterAgentSettleList(MOCK_AGENT_SETTLE_AGENTS, currency.value, agentId.value),
)

const summary = computed(() => summarizeAgentSettle(filteredAgents.value, currency.value))
const isSingleCurrency = computed(() => Boolean(currency.value))
const summaryCurrencies = computed(() => (currency.value ? [currency.value] : (['CNY', 'USD'] as const)))

const currencyLabel = computed(() => (currency.value ? currency.value : '信用额度'))

const agentOptions = computed(() => [
  { value: '', label: '全部代理' },
  ...MOCK_AGENT_SETTLE_AGENTS.map((item) => ({ value: item.id, label: item.name })),
])

const agentLabel = computed(
  () => agentOptions.value.find((item) => item.value === agentId.value)?.label ?? '全部代理',
)

const dateLabel = computed(() => {
  const preset = matchDateRangeSheetPreset(rangeStart.value, rangeEnd.value, AGENT_SETTLE_TODAY)
  if (!preset) return '自定义'
  return DATE_RANGE_SHEET_PRESETS.find((item) => item.key === preset)?.label ?? '自定义'
})

function hallQuery(extra: Record<string, string> = {}) {
  return withMineHallFrom(route.query.from, extra)
}

function confirmDate(start: string, end: string) {
  rangeStart.value = start
  rangeEnd.value = end
  dateOpen.value = false
}

function pickCurrency(value: AgentSettleCurrencyFilter) {
  currency.value = value
  pickerOpen.value = null
}

function pickAgent(value: string) {
  agentId.value = value
  pickerOpen.value = null
}

function openDetail(id: string) {
  router.push({
    name: 'mobile-agent-settle-detail',
    query: hallQuery({
      agentId: id,
      start: rangeStart.value,
      end: rangeEnd.value,
      ...(currency.value ? { currency: currency.value } : {}),
    }),
  })
}
</script>

<template>
  <div class="mh5-route-view mh5-agent-settle-page mh5-vip-records">
    <Mh5SubPageHeader title="代理交收">
      <template #right>
        <Mh5SpecAnnot :spec="AGENT_SETTLE_LIST_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-agent-settle-sticky">
      <div class="mh5-billing-filters mh5-agent-settle-filters">
        <button type="button" class="mh5-billing-filter" @click="pickerOpen = 'currency'">
          {{ currencyLabel }}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="mh5-billing-filter" @click="pickerOpen = 'agent'">
          {{ agentLabel }}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
        <button
          type="button"
          class="mh5-billing-filter"
          :aria-expanded="dateOpen"
          @click="dateOpen = true"
        >
          {{ dateLabel }}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <section class="mh5-agent-settle-summary" aria-label="交收汇总">
        <div class="mh5-agent-settle-summary__cols">
          <div class="mh5-agent-settle-summary__col">
            <p class="mh5-agent-settle-summary__title">待支付代理（总应付）</p>
            <p
              v-for="code in summaryCurrencies"
              :key="`pay-${code}`"
              class="mh5-agent-settle-summary__line"
              :class="{ 'mh5-agent-settle-summary__line--lg': isSingleCurrency }"
            >
              <span v-if="!isSingleCurrency">{{ code }}</span>
              <strong class="mh5-agent-settle-tag--pay">{{ formatSettleMoney(summary.pay[code], code) }}</strong>
            </p>
          </div>
          <div class="mh5-agent-settle-summary__col">
            <p class="mh5-agent-settle-summary__title">待收取代理（总应收）</p>
            <p
              v-for="code in summaryCurrencies"
              :key="`receive-${code}`"
              class="mh5-agent-settle-summary__line"
              :class="{ 'mh5-agent-settle-summary__line--lg': isSingleCurrency }"
            >
              <span v-if="!isSingleCurrency">{{ code }}</span>
              <strong class="mh5-agent-settle-tag--receive">{{ formatSettleMoney(summary.receive[code], code) }}</strong>
            </p>
          </div>
        </div>
        <div class="mh5-agent-settle-summary__foot">
          <p>
            本期总上分
            <template v-for="(code, index) in summaryCurrencies" :key="`up-${code}`">
              <span v-if="index > 0"> | </span>
              {{ formatSettleMoney(summary.creditUp[code], code) }}
            </template>
          </p>
          <p>
            本期总下分
            <template v-for="(code, index) in summaryCurrencies" :key="`down-${code}`">
              <span v-if="index > 0"> | </span>
              {{ formatSettleMoney(summary.creditDown[code], code) }}
            </template>
          </p>
        </div>
      </section>
    </div>

    <main class="mh5-agent-settle-main">
      <p v-if="!filteredAgents.length" class="mh5-settlement-empty">
        <span class="mh5-settlement-empty__icon" aria-hidden="true">📭</span>
        暂无代理交收数据
      </p>

      <button
        v-for="agent in filteredAgents"
        :key="agent.id"
        type="button"
        class="mh5-agent-settle-card"
        @click="openDetail(agent.id)"
      >
        <header class="mh5-agent-settle-card__head">
          <span class="mh5-settlement-card__avatar" aria-hidden="true">{{ agent.name.slice(0, 1) }}</span>
          <span class="mh5-agent-settle-card__name">{{ agent.name }}</span>
          <span class="mh5-agent-settle-card__arrow" aria-hidden="true">›</span>
        </header>
        <div
          v-for="wallet in agentSettleWallets(agent, currency)"
          :key="wallet.currency"
          class="mh5-agent-settle-wallet"
        >
          <div class="mh5-agent-settle-wallet__head">
            <img
              class="mh5-agent-settle-wallet__icon"
              :src="settleWalletIcon(wallet.currency)"
              alt=""
              width="28"
              height="28"
            />
            <p class="mh5-agent-settle-wallet__title">{{ wallet.remark }}</p>
          </div>
          <div class="mh5-agent-settle-wallet__row">
            <span>上分 {{ formatSettleNumber(wallet.creditUp) }}</span>
            <span>下分 {{ formatSettleNumber(wallet.creditDown) }}</span>
            <span
              class="mh5-agent-settle-chip"
              :class="`mh5-agent-settle-chip--${settleWalletStatus(wallet)}`"
            >
              {{ settleStatusTagText(wallet) }}
            </span>
          </div>
        </div>
      </button>
    </main>

    <Mh5DateRangeSheet
      tone="vip"
      :open="dateOpen"
      :start="rangeStart"
      :end="rangeEnd"
      :today="AGENT_SETTLE_TODAY"
      @close="dateOpen = false"
      @confirm="confirmDate"
    />

    <Teleport to="body">
      <Transition name="mh5-wallet-sheet">
        <div v-if="pickerOpen === 'currency'" class="mh5-agent-overlay-mask" @click.self="pickerOpen = null">
          <div
            class="mh5-wallet-sheet agent-currency-sheet mh5-wallet-sheet--vip-gold mh5-billing-pick-sheet mh5-agent-settle-credit-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mh5-agent-settle-credit-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="mh5-agent-settle-credit-title" class="mh5-wallet-sheet__title">信用额度</h2>
              <button type="button" class="mh5-wallet-sheet__close" aria-label="关闭" @click="pickerOpen = null">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div class="mh5-wallet-sheet__list agent-currency-sheet__list">
              <button
                v-for="opt in AGENT_SETTLE_CREDIT_OPTIONS"
                :key="opt.value || 'all'"
                type="button"
                class="agent-currency-sheet__item"
                :class="{ 'agent-currency-sheet__item--active': currency === opt.value }"
                @click="pickCurrency(opt.value)"
              >
                <img class="agent-currency-sheet__icon agent-currency-sheet__icon--asset" :src="opt.icon" alt="" width="36" height="36" />
                <span class="agent-currency-sheet__name">{{ opt.label }}</span>
                <span
                  v-if="currency === opt.value"
                  class="agent-currency-sheet__check agent-currency-sheet__check--active"
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2l2.4 2.4 4.6-5"
                      stroke="#fff"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="mh5-settlement-sheet">
        <div v-if="pickerOpen === 'agent'" class="mh5-agent-overlay-mask" @click.self="pickerOpen = null">
          <div
            class="mh5-agent-overlay-sheet mh5-agent-settle-sheet mh5-agent-overlay-sheet--vip-gold"
            role="dialog"
            aria-modal="true"
            aria-label="选择代理"
          >
            <h2 class="mh5-settlement-sheet__title">选择代理</h2>
            <button
              v-for="opt in agentOptions"
              :key="opt.value || 'all'"
              type="button"
              class="mh5-settlement-sheet__option"
              :class="{ 'mh5-settlement-sheet__option--active': agentId === opt.value }"
              @click="pickAgent(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
