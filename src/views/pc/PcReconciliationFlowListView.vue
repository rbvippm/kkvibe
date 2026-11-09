<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PcCashFlowPanel from '../../components/pc/PcCashFlowPanel.vue'
import PcCreditFlowPanel from '../../components/pc/PcCreditFlowPanel.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import {
  RECONCILIATION_FLOW_LIST_SPEC_ANNOT_NO as ANNOT_NO,
  RECONCILIATION_FLOW_LIST_TABS_SPEC,
} from '../../constants/reconciliationFlowListSpec'
import '../../styles/pc-wireframe.css'

type LedgerTab = 'cash' | 'credit'

const LEDGER_TABS: { value: LedgerTab; label: string }[] = [
  { value: 'cash', label: '现金' },
  { value: 'credit', label: '信用' },
]

const route = useRoute()
const router = useRouter()

const activeTab = computed<LedgerTab>(() => (route.query.tab === 'credit' ? 'credit' : 'cash'))

function switchTab(tab: LedgerTab) {
  if (tab === activeTab.value) return
  void router.replace({ query: { ...route.query, tab } })
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <div class="wf-top">
      <div class="wf-tabs">
        <div v-for="tab in LEDGER_TABS" :key="tab.value" class="wf-tab-item">
          <button
            type="button"
            class="wf-tab"
            :class="{ 'wf-tab--active': activeTab === tab.value }"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </button>
          <WfSpecAnnot
            v-if="tab.value === 'credit'"
            :no="ANNOT_NO.tabs"
            title="现金 / 信用 Tab 切换"
            :items="[...RECONCILIATION_FLOW_LIST_TABS_SPEC]"
          />
        </div>
      </div>
    </div>

    <PcCashFlowPanel
      v-show="activeTab === 'cash'"
      :annot-no="{ filters: ANNOT_NO.cashFilters, table: ANNOT_NO.cashTable }"
    />
    <PcCreditFlowPanel
      v-show="activeTab === 'credit'"
      :annot-no="{ filters: ANNOT_NO.creditFilters, table: ANNOT_NO.creditTable }"
    />
  </div>
</template>
