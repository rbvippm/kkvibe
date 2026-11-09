<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PcReconcileDataSection from '../../components/pc/PcReconcileDataSection.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  PLATFORM_HOLDINGS,
  formatReconcileValue,
  parseReconcileLedger,
  PLATFORM_DATA_STATS,
  PLATFORM_SUMMARY_FIELDS,
  RECONCILE_AMOUNT_COLUMNS,
  RECONCILE_CURRENCIES,
  RECONCILE_LEDGER_TABS,
  reconcileRowsOf,
  sumReconcileRows,
  type ReconcileLedger,
} from '../../constants/billingReconcile'
import {
  PLATFORM_RECONCILE_CURRENCY_SPEC,
  PLATFORM_RECONCILE_FILTER_SPEC,
  PLATFORM_RECONCILE_SPEC_ANNOT_NO as ANNOT_NO,
  PLATFORM_RECONCILE_STATS_SPEC,
  PLATFORM_RECONCILE_SUMMARY_SPEC,
  PLATFORM_RECONCILE_TABS_SPEC,
} from '../../constants/platformReconcileSpec'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import '../../styles/pc-wireframe.css'

const route = useRoute()
const router = useRouter()

const ledger = computed<ReconcileLedger>(() => parseReconcileLedger(route.query.tab))

/** 两个 Tab 的币种各自记住 */
const currencyByLedger = reactive<Record<ReconcileLedger, string>>({
  cash: RECONCILE_CURRENCIES.cash[0]!,
  credit: RECONCILE_CURRENCIES.credit[0]!,
})

const currency = computed({
  get: () => currencyByLedger[ledger.value],
  set: (value: string) => {
    currencyByLedger[ledger.value] = value
  },
})

const summary = computed(() => sumReconcileRows(reconcileRowsOf(ledger.value, currency.value)))

function switchTab(tab: ReconcileLedger) {
  if (tab === ledger.value) return
  void router.replace({ query: { ...route.query, tab } })
}
</script>

<template>
  <div class="pc-wireframe-page platform-reconcile">
    <WfPagePathMenu />

    <div class="wf-top">
      <div class="wf-tabs">
        <div v-for="tab in RECONCILE_LEDGER_TABS" :key="tab.value" class="wf-tab-item">
          <button
            type="button"
            class="wf-tab"
            :class="{ 'wf-tab--active': ledger === tab.value }"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </button>
          <WfSpecAnnot
            v-if="tab.value === 'credit'"
            :no="ANNOT_NO.tabs"
            title="现金 / 信用 Tab"
            :items="[...PLATFORM_RECONCILE_TABS_SPEC]"
          />
        </div>
      </div>
    </div>

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          币种：
          <WfSpecAnnot :no="ANNOT_NO.currency" title="币种切换" :items="[...PLATFORM_RECONCILE_CURRENCY_SPEC]" />
        </label>
        <select v-model="currency" class="wf-input wf-input--select">
          <option v-for="c in RECONCILE_CURRENCIES[ledger]" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <h3 class="platform-reconcile__title wf-label--with-spec">
        平台对账
        <WfSpecAnnot :no="ANNOT_NO.summary" title="平台对账（全量汇总）" :items="[...PLATFORM_RECONCILE_SUMMARY_SPEC]" />
      </h3>
      <div class="wf-detail-panel__grid platform-reconcile__grid">
        <div v-for="field in PLATFORM_SUMMARY_FIELDS[ledger]" :key="field.key" class="wf-detail-panel__cell">
          <span class="wf-detail-panel__label">{{ field.label }}</span>
          <span class="wf-detail-panel__value" :class="field.key === 'profit' ? signedNumberClass(summary.profit) : ''">
            {{ formatReconcileValue(field.key, summary[field.key]) }}
            <small v-if="ledger === 'credit' && field.key === 'rebate'" class="platform-reconcile__sub">
              信用会员退水 {{ formatReconcileValue('memberRebate', summary.memberRebate) }} · 信用代理退水
              {{ formatReconcileValue('agentRebate', summary.agentRebate) }}
            </small>
          </span>
        </div>
        <div v-for="item in PLATFORM_HOLDINGS[ledger]" :key="item.label" class="wf-detail-panel__cell">
          <span class="wf-detail-panel__label">{{ item.label }}</span>
          <span class="wf-detail-panel__value">{{ item.value }}</span>
        </div>
      </div>
    </section>

    <section class="wf-block">
      <h3 class="platform-reconcile__title">平台对账数据</h3>
      <PcReconcileDataSection
        :ledger="ledger"
        :currency="currency"
        :stat-fields="PLATFORM_DATA_STATS[ledger]"
        :columns="RECONCILE_AMOUNT_COLUMNS[ledger]"
        show-index
        :filter-annot="{ no: ANNOT_NO.dataFilters, title: '按条件统计（筛选）', items: [...PLATFORM_RECONCILE_FILTER_SPEC] }"
        :table-annot="{ no: ANNOT_NO.dataStats, title: '区间统计与用户明细', items: [...PLATFORM_RECONCILE_STATS_SPEC] }"
      />
    </section>
  </div>
</template>

<style scoped>
.platform-reconcile__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--pc-text);
}

.platform-reconcile__grid {
  border-top: 1px solid var(--pc-border-light);
}

.platform-reconcile__grid .wf-detail-panel__cell {
  grid-template-columns: minmax(0, 42%) minmax(0, 1fr);
}

.platform-reconcile__sub {
  display: block;
  margin-top: 2px;
  color: var(--pc-text-secondary);
  font-size: 12px;
}
</style>
