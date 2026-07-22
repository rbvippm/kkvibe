<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  DEFAULT_AGENT_CREDIT_MAX_COST,
  formatCreditPercent,
} from '../../constants/agentCredit'
import {
  AGENT_PROFIT_RATIO_TYPE_TABS,
  formatProfitRatioPercent,
  getAgentProfitCost,
  getAgentProfitRelationLabel,
  getAgentProfitRatioProducts,
  isAgentCreditEnabled,
  parseAgentProfitRatioType,
  resolveAgentKindHint,
  type AgentProfitRatioType,
} from '../../constants/agentProfitRatio'
import { AGENT_PROFIT_RATIO_SPEC } from '../../constants/agentProfitRatioSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const targetId = computed(() => String(route.query.targetId || ''))
const targetNickname = computed(() => String(route.query.targetName || 'Tom Cat%'))
const relationLabel = computed(() => getAgentProfitRelationLabel(String(route.query.relation || 'direct')))
const kindHint = computed(() =>
  resolveAgentKindHint(targetId.value, String(route.query.kind || '')),
)
const creditedHint = computed(() => String(route.query.credited || ''))

/** 任意团队筛选入口（含「全部」）：只要授信过就展示 Tab */
const showCreditTabs = computed(() =>
  isAgentCreditEnabled(targetId.value, kindHint.value, creditedHint.value),
)

const ratioType = ref<AgentProfitRatioType>(
  showCreditTabs.value ? parseAgentProfitRatioType(String(route.query.ratioType || 'cash')) : 'cash',
)

watch(showCreditTabs, (enabled) => {
  if (!enabled) ratioType.value = 'cash'
})

const displayProducts = computed(() => getAgentProfitRatioProducts(ratioType.value).value)
const displayCost = computed(() => getAgentProfitCost(ratioType.value).value)
const maxCost = DEFAULT_AGENT_CREDIT_MAX_COST

function goEdit() {
  router.push({
    name: 'mobile-agent-profit-ratio-edit',
    query: {
      targetId: route.query.targetId,
      targetName: route.query.targetName,
      relation: route.query.relation,
      kind: kindHint.value,
      credited: showCreditTabs.value ? '1' : '0',
      ratioType: ratioType.value,
    },
  })
}
</script>

<template>
  <div class="mh5-agent-profit-ratio-page">
    <Mh5SubPageHeader title="代理收益比例">
      <template #right>
        <Mh5SpecAnnot :spec="AGENT_PROFIT_RATIO_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-agent-profit-ratio-main">
      <section class="mh5-agent-profit-ratio-profile">
        <div class="mh5-agent-profit-ratio-profile__left">
          <div class="mh5-agent-profit-ratio-profile__avatar" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="mh5-agent-profit-ratio-profile__meta">
            <h2>{{ targetNickname }}</h2>
            <span class="mh5-agent-profit-ratio-profile__tag">{{ relationLabel }}</span>
          </div>
        </div>
        <button type="button" class="mh5-agent-profit-ratio-profile__edit" @click="goEdit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          修改
        </button>
      </section>

      <nav
        v-if="showCreditTabs"
        class="mh5-agent-profit-ratio-seg"
        role="tablist"
        aria-label="收益类型"
      >
        <button
          v-for="tab in AGENT_PROFIT_RATIO_TYPE_TABS"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-agent-profit-ratio-seg__item"
          :class="{ 'mh5-agent-profit-ratio-seg__item--active': ratioType === tab.key }"
          :aria-selected="ratioType === tab.key"
          @click="ratioType = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="mh5-agent-credit-cost-card mh5-agent-profit-ratio-cost">
        <div class="mh5-agent-credit-cost-card__left">
          <span class="mh5-agent-credit-cost-card__label">其他成本</span>
        </div>
        <div class="mh5-agent-credit-table__cell">
          <span class="mh5-agent-profit-ratio-table__value">
            {{ formatCreditPercent(displayCost, 'share') }}
          </span>
          <span class="mh5-agent-credit-table__limit">
            最高{{ formatCreditPercent(maxCost, 'share') }}
          </span>
        </div>
      </section>

      <section class="mh5-agent-profit-ratio-table-wrap">
        <table class="mh5-agent-profit-ratio-table">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">占成</th>
              <th scope="col">退水</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in displayProducts" :key="`${ratioType}-${row.key}`">
              <td class="mh5-agent-profit-ratio-table__product">{{ row.name }}</td>
              <td>
                <span class="mh5-agent-profit-ratio-table__value">
                  {{ formatProfitRatioPercent(row.share) }}
                </span>
              </td>
              <td>
                <span class="mh5-agent-profit-ratio-table__value">
                  {{ formatProfitRatioPercent(row.rebate) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>
