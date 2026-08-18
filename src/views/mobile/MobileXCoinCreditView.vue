<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5CurrencyIcon from '../../components/mobile/Mh5CurrencyIcon.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5XCoinMemberPicker from '../../components/mobile/Mh5XCoinMemberPicker.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  AGENT_CREDIT_CURRENCY_TABS,
  formatCreditCurrencyUnit,
  type AgentCreditCurrency,
} from '../../constants/agentDetail'
import { AGENT_REPORT_FILTER_ASSETS } from '../../constants/agentReport'
import {
  MOCK_SELECTABLE_AGENTS,
  MOCK_SELECTABLE_MEMBERS,
  MOCK_XCOIN_BALANCES,
  emptySelectableCredits,
  parseXCoinCreditCurrency,
  type TransferDirection,
  type XCoinCreditCurrency,
  type XCoinSelectableTarget,
} from '../../constants/xCoinTransfer'
import { XCOIN_CREDIT_CURRENCY_SPEC } from '../../constants/xCoinCreditSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const mode = computed(() => (route.meta.xcoinMode as 'member' | 'agent') ?? 'member')
const isMember = computed(() => mode.value === 'member')

const direction = ref<TransferDirection>('credit_up')
const amount = ref('')
const selectedTarget = ref<XCoinSelectableTarget | null>(null)
const creditCurrency = ref<XCoinCreditCurrency>(parseXCoinCreditCurrency(route.query.currency))
const creditCurrencyMenuOpen = ref(false)
const creditCurrencyUnitLabel = computed(() => formatCreditCurrencyUnit(creditCurrency.value))

watch(
  () => route.query.currency,
  (v) => {
    creditCurrency.value = parseXCoinCreditCurrency(v)
  },
)

const availableBalance = computed(() => MOCK_XCOIN_BALANCES[creditCurrency.value])

const pageTitle = computed(() => {
  if (!isMember.value) return '给代理上分'
  return direction.value === 'credit_up' ? '给会员上分' : '给会员下分'
})
const selectLabel = computed(() =>
  selectedTarget.value ? selectedTarget.value.nickname : '选择信用代理',
)
const confirmText = computed(() => {
  if (!isMember.value) return '确认上分'
  return direction.value === 'credit_up' ? '确认上分' : '确认下分'
})
const fromWalletLabel = computed(() => `从 我的 ${creditCurrency.value} 钱包`)
const toWalletLabel = computed(() => `到 下级的 ${creditCurrency.value} 钱包`)

function currencyQuery() {
  return { currency: creditCurrency.value }
}

function goRecords() {
  router.push({ name: 'mobile-xcoin-records', query: currencyQuery() })
}

function goSelectAgent() {
  router.push({
    name: 'mobile-xcoin-select-agent',
    query: {
      ...currencyQuery(),
      ...(selectedTarget.value ? { selected: selectedTarget.value.id } : {}),
    },
  })
}

function goSelectMember() {
  const query: Record<string, string> = { ...currencyQuery() }
  if (selectedTarget.value) {
    query.selected = selectedTarget.value.id
  }
  router.push({ name: 'mobile-xcoin-select-member', query })
}

function confirmCredit() {
  if (!selectedTarget.value) return
  if (!amount.value || Number(amount.value) <= 0) return
  router.push({ name: 'mobile-xcoin-records', query: currencyQuery() })
}

function switchDirection(next: TransferDirection) {
  direction.value = next
}

function pickCreditCurrency(value: AgentCreditCurrency) {
  creditCurrency.value = value
  creditCurrencyMenuOpen.value = false
}

function toggleCreditCurrencyMenu() {
  creditCurrencyMenuOpen.value = !creditCurrencyMenuOpen.value
}

if (route.query.targetId && route.query.targetName) {
  const id = String(route.query.targetId)
  const list = isMember.value ? MOCK_SELECTABLE_MEMBERS : MOCK_SELECTABLE_AGENTS
  selectedTarget.value =
    list.find((item) => item.id === id) ?? {
      id,
      nickname: String(route.query.targetName),
      kingkongId: '—',
      userId: String(route.query.targetName),
      accountId: String(route.query.targetName),
      relation: isMember.value
        ? list.find((item) => item.id === id)?.relation ?? 'non_direct_member'
        : 'direct_agent',
      credits: emptySelectableCredits(),
    }
}
</script>

<template>
  <div class="mh5-xcoin-page" @click="creditCurrencyMenuOpen = false">
    <Mh5SubPageHeader :title="pageTitle">
      <template #right>
        <div class="mh5-xcoin-header-actions">
          <Mh5SpecAnnot :spec="XCOIN_CREDIT_CURRENCY_SPEC" placement="bottom" />
          <button type="button" class="mh5-sub-header__icon" :aria-label="$t('信用额度记录')" @click="goRecords">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-sub-tabs">
      <button
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': direction === 'credit_up' }"
        @click="switchDirection('credit_up')"
      >
        上分
      </button>
      <button
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': direction === 'credit_down' }"
        @click="switchDirection('credit_down')"
      >
        下分
      </button>
    </div>

    <main class="mh5-xcoin-credit">
      <div class="mh5-xcoin-currency-row">
        <span class="mh5-xcoin-currency-row__label">币种</span>
        <div class="mh5-agent-detail-credit-manage__ccy-wrap">
          <button
            type="button"
            class="mh5-currency-switch__btn mh5-agent-detail-credit-manage__ccy"
            aria-label="选择信用额度币种"
            :aria-expanded="creditCurrencyMenuOpen"
            @click.stop="toggleCreditCurrencyMenu"
          >
            <span class="mh5-currency-switch__main">
              <Mh5CurrencyIcon :code="creditCurrency" :size="18" />
              <span>{{ creditCurrencyUnitLabel }}</span>
            </span>
            <span
              class="mh5-currency-switch__chevron"
              :class="{ 'mh5-agent-detail-credit-manage__ccy-chevron--open': creditCurrencyMenuOpen }"
              aria-hidden="true"
            >
              <img :src="AGENT_REPORT_FILTER_ASSETS.dropdown" alt="" width="8" height="5" />
            </span>
          </button>
          <div
            v-if="creditCurrencyMenuOpen"
            class="mh5-agent-detail-credit-manage__ccy-menu mh5-xcoin-currency-row__menu"
            role="listbox"
            aria-label="信用额度币种"
            @click.stop
          >
            <button
              v-for="tab in AGENT_CREDIT_CURRENCY_TABS"
              :key="tab.key"
              type="button"
              role="option"
              class="mh5-agent-detail-credit-manage__ccy-option"
              :class="{
                'mh5-agent-detail-credit-manage__ccy-option--active': creditCurrency === tab.key,
              }"
              :aria-selected="creditCurrency === tab.key"
              @click="pickCreditCurrency(tab.key)"
            >
              <Mh5CurrencyIcon :code="tab.key" :size="18" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <section class="mh5-xcoin-wallet-card">
        <p class="mh5-xcoin-wallet-card__label">{{ fromWalletLabel }}</p>
        <input
          v-model="amount"
          type="number"
          inputmode="decimal"
          class="mh5-xcoin-wallet-card__amount"
          placeholder="0.00"
        />
        <p class="mh5-xcoin-wallet-card__balance">
          可用 {{ availableBalance.toFixed(2) }} {{ creditCurrency }}
        </p>
      </section>

      <div class="mh5-xcoin-arrow" aria-hidden="true">↓</div>

      <section class="mh5-xcoin-wallet-card">
        <p class="mh5-xcoin-wallet-card__label">{{ toWalletLabel }}</p>

        <Mh5XCoinMemberPicker
          v-if="isMember"
          v-model="selectedTarget"
          class="mh5-xcoin-member-picker-wrap"
          @select-member="goSelectMember"
        />

        <template v-else>
          <button type="button" class="mh5-xcoin-select-row" @click="goSelectAgent">
            <span :class="{ 'mh5-xcoin-select-row__placeholder': !selectedTarget }">{{ selectLabel }}</span>
            <span class="mh5-xcoin-select-row__arrow">›</span>
          </button>
        </template>
      </section>

      <button
        type="button"
        class="mh5-xcoin-btn mh5-xcoin-btn--primary mh5-xcoin-btn--block"
        :disabled="!selectedTarget || !amount"
        @click="confirmCredit"
      >
        {{ confirmText }}
      </button>
    </main>
  </div>
</template>
