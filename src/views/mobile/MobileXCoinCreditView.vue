<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5XCoinMemberPicker from '../../components/mobile/Mh5XCoinMemberPicker.vue'
import {
  MOCK_SELECTABLE_AGENTS,
  MOCK_SELECTABLE_MEMBERS,
  MOCK_XCOIN_BALANCE,
  type TransferDirection,
  type XCoinSelectableTarget,
} from '../../constants/xCoinTransfer'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const mode = computed(() => (route.meta.xcoinMode as 'member' | 'agent') ?? 'member')
const isMember = computed(() => mode.value === 'member')

const direction = ref<TransferDirection>('credit_up')
const amount = ref('')
const selectedTarget = ref<XCoinSelectableTarget | null>(null)

const pageTitle = computed(() => {
  if (!isMember.value) return '给代理上分'
  return direction.value === 'credit_up' ? '给会员上分' : '给会员下分'
})
const selectLabel = computed(() =>
  selectedTarget.value ? selectedTarget.value.nickname : '选择代理',
)
const confirmText = computed(() => {
  if (!isMember.value) return '确认上分'
  return direction.value === 'credit_up' ? '确认上分' : '确认下分'
})

function goRecords() {
  router.push({ name: 'mobile-xcoin-records' })
}

function goSelectAgent() {
  router.push({
    name: 'mobile-xcoin-select-agent',
    query: selectedTarget.value ? { selected: selectedTarget.value.id } : {},
  })
}

function goSelectMember() {
  const query: Record<string, string> = {}
  if (selectedTarget.value) {
    query.selected = selectedTarget.value.id
    if (selectedTarget.value.relation === 'non_direct_member') query.tab = 'other'
  }
  router.push({ name: 'mobile-xcoin-select-member', query })
}

function confirmCredit() {
  if (!selectedTarget.value) return
  if (!amount.value || Number(amount.value) <= 0) return
  router.push({ name: 'mobile-xcoin-records' })
}

function switchDirection(next: TransferDirection) {
  direction.value = next
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
      availableCredit: 0,
      totalCreditLine: 0,
    }
}
</script>

<template>
  <div class="mh5-xcoin-page">
    <Mh5SubPageHeader :title="pageTitle">
      <template #right>
        <button type="button" class="mh5-sub-header__icon" aria-label="上下分记录" @click="goRecords">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
            <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-sub-tabs">
      <button
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': direction === 'credit_up' }"
        @click="switchDirection('credit_up')"
      >
        X币上分
      </button>
      <button
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': direction === 'credit_down' }"
        @click="switchDirection('credit_down')"
      >
        X币下分
      </button>
    </div>

    <main class="mh5-xcoin-credit">
      <section class="mh5-xcoin-wallet-card">
        <p class="mh5-xcoin-wallet-card__label">从 我的 X 币钱包</p>
        <input
          v-model="amount"
          type="number"
          inputmode="decimal"
          class="mh5-xcoin-wallet-card__amount"
          placeholder="0.00"
        />
        <p class="mh5-xcoin-wallet-card__balance">可用 {{ MOCK_XCOIN_BALANCE.toFixed(2) }} X币</p>
      </section>

      <div class="mh5-xcoin-arrow" aria-hidden="true">↓</div>

      <section class="mh5-xcoin-wallet-card">
        <p class="mh5-xcoin-wallet-card__label">到 下级的 X 币钱包</p>

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
          <p class="mh5-xcoin-wallet-card__hint">
            支持选择非直属代理上分，记录将标注来源代理与关系
          </p>
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
