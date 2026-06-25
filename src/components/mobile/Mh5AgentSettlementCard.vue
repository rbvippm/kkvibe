<script setup lang="ts">
import {
  formatSettlementAmount,
  settlementNetClass,
  type AgentSummaryWithNet,
} from '../../constants/agentSettlement'
import { settlementT } from '../../constants/agentSettlementI18n'

defineProps<{
  agent: AgentSummaryWithNet
}>()

const emit = defineEmits<{
  viewDetail: [agent: AgentSummaryWithNet]
}>()
</script>

<template>
  <article class="mh5-settlement-card">
    <header class="mh5-settlement-card__header">
      <span class="mh5-settlement-card__avatar" aria-hidden="true">
        {{ agent.agentName.slice(0, 1) }}
      </span>
      <span class="mh5-settlement-card__name">{{ agent.agentName }}</span>
    </header>

    <div class="mh5-settlement-card__stats">
      <div class="mh5-settlement-card__stat">
        <span class="mh5-settlement-card__label">{{ settlementT('totalUp') }}</span>
        <span class="mh5-settlement-card__value">{{ formatSettlementAmount(agent.totalUp) }}</span>
      </div>
      <div class="mh5-settlement-card__stat">
        <span class="mh5-settlement-card__label">{{ settlementT('totalDown') }}</span>
        <span class="mh5-settlement-card__value">{{ formatSettlementAmount(agent.totalDown) }}</span>
      </div>
    </div>

    <div class="mh5-settlement-card__net-row">
      <span class="mh5-settlement-card__label">{{ settlementT('periodNetShort') }}</span>
      <span class="mh5-settlement-card__net" :class="settlementNetClass(agent.netAmount)">
        {{ formatSettlementAmount(agent.netAmount, true) }}
      </span>
    </div>

    <button
      type="button"
      class="mh5-settlement-card__detail"
      @click="emit('viewDetail', agent)"
    >
      {{ settlementT('viewDetail') }}
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </article>
</template>
