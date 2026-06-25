<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Mh5SettlementRecordRow from '../../components/mobile/Mh5SettlementRecordRow.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useAgentSettlement } from '../../composables/useAgentSettlement'
import {
  MOCK_TRANSACTION_RECORDS,
  SETTLEMENT_MONTH_OPTIONS,
  TransactionType,
  calcSettlementNet,
  filterTransactions,
  formatSettlementAmount,
  settlementNetClass,
  type SettlementMonth,
} from '../../constants/agentSettlement'
import { settlementT } from '../../constants/agentSettlementI18n'
import '../../styles/mobile-app-shell.css'

const route = useRoute()

const agentId = computed(() => String(route.query.agentId ?? ''))
const month = computed<SettlementMonth>(() => {
  const m = String(route.query.month ?? '')
  if (!m) return ''
  return SETTLEMENT_MONTH_OPTIONS.some((o) => o.value === m) ? (m as SettlementMonth) : ''
})

const { findAgent } = useAgentSettlement()

const agent = computed(() => findAgent(agentId.value))

const records = computed(() =>
  filterTransactions(MOCK_TRANSACTION_RECORDS, agentId.value, month.value || undefined),
)

const periodNetAmount = computed(() => {
  if (!records.value.length) return agent.value?.netAmount ?? 0
  const totalUp = records.value
    .filter((r) => r.type === TransactionType.UP)
    .reduce((sum, r) => sum + r.amount, 0)
  const totalDown = records.value
    .filter((r) => r.type === TransactionType.DOWN)
    .reduce((sum, r) => sum + r.amount, 0)
  return calcSettlementNet(totalUp, totalDown)
})

const pageTitle = computed(() => {
  const name = agent.value?.agentName ?? settlementT('agentFallback')
  return `${name} - ${settlementT('detailTitleSuffix')}`
})
</script>

<template>
  <div class="mh5-settlement-page mh5-settlement-detail-page">
    <Mh5SubPageHeader :title="pageTitle" />

    <div v-if="agent" class="mh5-settlement-detail-bar">
      <span class="mh5-settlement-detail-bar__label">{{ settlementT('periodNet') }}</span>
      <span class="mh5-settlement-detail-bar__value" :class="settlementNetClass(periodNetAmount)">
        {{ formatSettlementAmount(periodNetAmount, true) }}
      </span>
    </div>

    <main class="mh5-settlement-detail-main">
      <p v-if="!records.length" class="mh5-settlement-empty">
        <span class="mh5-settlement-empty__icon" aria-hidden="true">📭</span>
        {{ settlementT('emptyRecords') }}
      </p>

      <div v-else class="mh5-settlement-record-list">
        <Mh5SettlementRecordRow
          v-for="record in records"
          :key="record.txId"
          :record="record"
        />
      </div>
    </main>
  </div>
</template>
