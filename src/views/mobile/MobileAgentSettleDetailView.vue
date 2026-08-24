<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5DateRangeSheet from '../../components/mobile/Mh5DateRangeSheet.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import {
  AGENT_SETTLE_TODAY,
  agentSettleWallets,
  findAgentSettle,
  formatSettleMoney,
  formatSettleSignedMoney,
  settleStatusTagText,
  settleWalletCreditCode,
  settleWalletIcon,
  settleWalletStatus,
  type AgentSettleCurrencyFilter,
  type AgentSettleWallet,
} from '../../constants/agentSettle'
import { AGENT_SETTLE_SPEC } from '../../constants/agentSettleSpec'
import { dateRangeSheetPresetRange } from '../../constants/mh5DateRange'
import { withMineHallFrom } from '../../constants/mineHall'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const { wallets, selectAccount, selectRecordsAll } = useVipCreditAccounts()

const defaultRange = dateRangeSheetPresetRange('thisMonth', AGENT_SETTLE_TODAY)
const rangeStart = ref(String(route.query.start || defaultRange.start))
const rangeEnd = ref(String(route.query.end || defaultRange.end))
const dateOpen = ref(false)
const currency = ref<AgentSettleCurrencyFilter>(
  route.query.currency === 'USD' || route.query.currency === 'CNY'
    ? route.query.currency
    : '',
)

const agent = computed(() => findAgentSettle(String(route.query.agentId || '')))
const visibleWallets = computed(() =>
  agent.value ? agentSettleWallets(agent.value, currency.value) : [],
)
const dateText = computed(() => `${rangeStart.value} 至 ${rangeEnd.value}`)

function hallQuery(extra: Record<string, string> = {}) {
  return withMineHallFrom(route.query.from, extra)
}

function goBack() {
  router.replace({
    name: 'mobile-agent-settle',
    query: hallQuery({
      start: rangeStart.value,
      end: rangeEnd.value,
      ...(currency.value ? { currency: currency.value } : {}),
    }),
  })
}

function confirmDate(start: string, end: string) {
  rangeStart.value = start
  rangeEnd.value = end
  dateOpen.value = false
}

function applyWalletQuery(wallet: AgentSettleWallet) {
  const matched = wallet.creditWalletId
    ? wallets.value.find((item) => item.id === wallet.creditWalletId)
    : wallets.value.find(
        (item) =>
          item.displayName === wallet.remark && item.currency === settleWalletCreditCode(wallet.currency),
      )
  if (matched) {
    selectAccount(matched)
    return
  }
  selectRecordsAll(settleWalletCreditCode(wallet.currency))
}

function goBilling(wallet: AgentSettleWallet) {
  applyWalletQuery(wallet)
  router.push({
    name: 'mobile-billing-list',
    query: hallQuery({
      type: 'xcoin',
      start: rangeStart.value,
      end: rangeEnd.value,
    }),
  })
}

function goBets(wallet: AgentSettleWallet) {
  applyWalletQuery(wallet)
  router.push({
    name: 'mobile-bet-records',
    query: hallQuery({
      start: rangeStart.value,
      end: rangeEnd.value,
    }),
  })
}

function winLoseClass(value: number) {
  if (value === 0) return ''
  return value > 0 ? 'mh5-agent-settle-winlose--win' : 'mh5-agent-settle-winlose--lose'
}
</script>

<template>
  <div class="mh5-route-view mh5-agent-settle-page mh5-vip-records">
    <Mh5SubPageHeader title="代理结算明细" :on-back="goBack">
      <template #right>
        <Mh5SpecAnnot :spec="AGENT_SETTLE_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <template v-if="agent">
      <div class="mh5-agent-settle-detail-head">
        <div class="mh5-agent-settle-detail-agent">
          <span class="mh5-settlement-card__avatar" aria-hidden="true">{{ agent.name.slice(0, 1) }}</span>
          <p class="mh5-agent-settle-detail-agent__name">{{ agent.name }}</p>
        </div>

        <div class="mh5-agent-settle-period">
          <span class="mh5-agent-settle-period__label">对账周期</span>
          <button
            type="button"
            class="mh5-agent-settle-date mh5-agent-settle-date--compact"
            :aria-expanded="dateOpen"
            @click="dateOpen = true"
          >
            <span>{{ dateText }}</span>
            <span aria-hidden="true">∨</span>
          </button>
        </div>
      </div>

      <main class="mh5-agent-settle-main">
        <p v-if="!visibleWallets.length" class="mh5-settlement-empty">
          <span class="mh5-settlement-empty__icon" aria-hidden="true">📭</span>
          暂无该币种结算数据
        </p>

        <section
          v-for="wallet in visibleWallets"
          :key="wallet.currency"
          class="mh5-agent-settle-summary mh5-agent-settle-summary--detail"
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
            <span
              class="mh5-agent-settle-chip"
              :class="`mh5-agent-settle-chip--${settleWalletStatus(wallet)}`"
            >
              {{ settleStatusTagText(wallet) }}
            </span>
          </div>

          <div class="mh5-agent-settle-detail-grid">
            <p>
              累计上分
              <strong>{{ formatSettleMoney(wallet.creditUp, wallet.currency) }}</strong>
            </p>
            <p>
              累计下分
              <strong>{{ formatSettleMoney(wallet.creditDown, wallet.currency) }}</strong>
            </p>
            <p>
              有效投注
              <strong>{{ formatSettleMoney(wallet.validBet, wallet.currency) }}</strong>
            </p>
            <p>
              总输赢
              <strong :class="winLoseClass(wallet.memberWinLose)">
                {{ formatSettleSignedMoney(wallet.memberWinLose, wallet.currency) }}
              </strong>
            </p>
          </div>

          <div class="mh5-agent-settle-detail-links">
            <button type="button" class="mh5-agent-settle-detail-link" @click="goBilling(wallet)">
              <span>上下分明细 {{ wallet.transferCount }}笔</span>
              <span aria-hidden="true">›</span>
            </button>
            <button type="button" class="mh5-agent-settle-detail-link" @click="goBets(wallet)">
              <span>注单记录 {{ wallet.betCount }}笔</span>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </section>
      </main>
    </template>

    <main v-else class="mh5-agent-settle-main">
      <p class="mh5-settlement-empty">
        <span class="mh5-settlement-empty__icon" aria-hidden="true">📭</span>
        未找到该代理
      </p>
      <button type="button" class="mh5-agent-settle-back" @click="goBack">返回列表</button>
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
  </div>
</template>
