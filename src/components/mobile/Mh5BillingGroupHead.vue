<script setup lang="ts">
import { computed } from 'vue'
import {
  formatBillingSummaryAmount,
  summarizeBillingMonth,
  type BillingRecord,
} from '../../constants/billingList'

const props = defineProps<{
  month: string
  rows: BillingRecord[]
  /** 选中具体币种时才展示收支汇总 */
  selectedCurrency?: string
}>()

const summary = computed(() => summarizeBillingMonth(props.rows))
const showSummary = computed(() => Boolean(props.selectedCurrency))
</script>

<template>
  <div class="mh5-billing-group__head">
    <span class="mh5-billing-group__month">{{ month }}</span>
    <div v-if="showSummary" class="mh5-billing-group__summary">
      <span class="mh5-billing-group__summary-item">
        支出 {{ formatBillingSummaryAmount(summary.expense) }}
      </span>
      <span class="mh5-billing-group__summary-item">
        收入 {{ formatBillingSummaryAmount(summary.income) }}
      </span>
    </div>
  </div>
</template>
