<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5AgentSettlementCard from '../../components/mobile/Mh5AgentSettlementCard.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { useAgentSettlement } from '../../composables/useAgentSettlement'
import {
  SETTLEMENT_MONTH_OPTIONS,
  formatSettlementAmount,
  settlementNetClass,
  type AgentSummaryWithNet,
  type SettlementMonth,
} from '../../constants/agentSettlement'
import { settlementMonthLabel, settlementT } from '../../constants/agentSettlementI18n'
import '../../styles/mobile-app-shell.css'

const router = useRouter()

const selectedMonth = ref<SettlementMonth>('')
const selectedAgentId = ref('')
const agentPickerOpen = ref(false)
const monthPickerOpen = ref(false)

const { agents, totalNetAmount } = useAgentSettlement()

const filteredAgents = computed(() => {
  if (!selectedAgentId.value) return agents.value
  return agents.value.filter((a) => a.agentId === selectedAgentId.value)
})

const agentOptions = computed(() => [
  { value: '', label: settlementT('agentAll') },
  ...agents.value.map((a) => ({ value: a.agentId, label: a.agentName })),
])

const monthLabel = computed(() => settlementMonthLabel(selectedMonth.value))

const agentLabel = computed(
  () => agentOptions.value.find((o) => o.value === selectedAgentId.value)?.label ?? settlementT('agentAll'),
)

function onViewDetail(agent: AgentSummaryWithNet) {
  router.push({
    name: 'mobile-agent-settlement-detail',
    query: {
      agentId: agent.agentId,
      ...(selectedMonth.value ? { month: selectedMonth.value } : {}),
    },
  })
}

function pickMonth(value: SettlementMonth) {
  selectedMonth.value = value
  monthPickerOpen.value = false
}

function pickAgent(value: string) {
  selectedAgentId.value = value
  agentPickerOpen.value = false
}
</script>

<template>
  <div class="mh5-settlement-page">
    <Mh5SubPageHeader :title="settlementT('pageTitle')" />

    <div class="mh5-settlement-sticky">
      <div class="mh5-settlement-filters">
        <button type="button" class="mh5-settlement-filter" @click="monthPickerOpen = true">
          {{ monthLabel }}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="mh5-settlement-filter" @click="agentPickerOpen = true">
          {{ agentLabel }}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <section class="mh5-settlement-hero">
        <p class="mh5-settlement-hero__label">{{ settlementT('totalNet') }}</p>
        <p class="mh5-settlement-hero__value" :class="settlementNetClass(totalNetAmount)">
          {{ formatSettlementAmount(totalNetAmount, true) }}
        </p>
        <p class="mh5-settlement-hero__hint">{{ settlementT('netHint') }}</p>
      </section>
    </div>

    <main class="mh5-settlement-main">
      <p v-if="!filteredAgents.length" class="mh5-settlement-empty">
        <span class="mh5-settlement-empty__icon" aria-hidden="true">📭</span>
        {{ settlementT('emptyAgents') }}
      </p>

      <Mh5AgentSettlementCard
        v-for="agent in filteredAgents"
        :key="agent.agentId"
        :agent="agent"
        @view-detail="onViewDetail"
      />
    </main>

    <Transition name="mh5-settlement-sheet">
      <div v-if="monthPickerOpen" class="mh5-settlement-sheet-mask" @click.self="monthPickerOpen = false">
        <div class="mh5-settlement-sheet">
          <h2 class="mh5-settlement-sheet__title">{{ settlementT('pickMonth') }}</h2>
          <button
            v-for="opt in SETTLEMENT_MONTH_OPTIONS"
            :key="opt.value || 'all'"
            type="button"
            class="mh5-settlement-sheet__option"
            :class="{ 'mh5-settlement-sheet__option--active': selectedMonth === opt.value }"
            @click="pickMonth(opt.value)"
          >
            {{ settlementMonthLabel(opt.value) }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-settlement-sheet">
      <div v-if="agentPickerOpen" class="mh5-settlement-sheet-mask" @click.self="agentPickerOpen = false">
        <div class="mh5-settlement-sheet">
          <h2 class="mh5-settlement-sheet__title">{{ settlementT('pickAgent') }}</h2>
          <button
            v-for="opt in agentOptions"
            :key="opt.value || 'all'"
            type="button"
            class="mh5-settlement-sheet__option"
            :class="{ 'mh5-settlement-sheet__option--active': selectedAgentId === opt.value }"
            @click="pickAgent(opt.value)"
          >
            {{ $t(opt.label) }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
