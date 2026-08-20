<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  formatBillingAmount,
  formatBillingListTime,
  formatBillingListTypeLabel,
  getBillingAmountUnit,
  getBillingCurrencySymbol,
  type BillingRecord,
} from '../../constants/billingList'
import { withMineHallFrom } from '../../constants/mineHall'

defineProps<{
  row: BillingRecord
  highlight?: string
}>()

const route = useRoute()
const router = useRouter()

function highlightText(text: string, keyword?: string) {
  const q = keyword?.trim()
  if (!q) return [{ text, match: false }]
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q.toLowerCase())
  if (idx < 0) return [{ text, match: false }]
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((part) => part.text)
}

function openDetail(row: BillingRecord) {
  router.push({
    name: 'mobile-billing-detail',
    params: { id: row.id },
    query: withMineHallFrom(route.query.from),
  })
}
</script>

<template>
  <article class="mh5-billing-item" role="button" tabindex="0" @click="openDetail(row)" @keydown.enter="openDetail(row)">
    <div class="mh5-billing-item__icon" aria-hidden="true">
      <span class="mh5-billing-item__icon-badge">{{ getBillingCurrencySymbol(row.currency) }}</span>
    </div>
    <div class="mh5-billing-item__body">
      <div class="mh5-billing-item__title">
        <template
          v-for="(part, index) in highlightText(formatBillingListTypeLabel(row.typeLabel), highlight)"
          :key="`${row.id}-t-${index}`"
        >
          <mark v-if="part.match" class="mh5-billing-item__mark">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </div>
      <div class="mh5-billing-item__time">{{ formatBillingListTime(row.createdAt) }}</div>
    </div>
    <div class="mh5-billing-item__amount-wrap">
      <div
        class="mh5-billing-item__amount"
        :class="row.amount >= 0 ? 'mh5-billing-item__amount--plus' : 'mh5-billing-item__amount--minus'"
      >
        {{ formatBillingAmount(row.amount) }}
      </div>
      <div class="mh5-billing-item__currency">{{ getBillingAmountUnit(row.currency) }}</div>
    </div>
  </article>
</template>
