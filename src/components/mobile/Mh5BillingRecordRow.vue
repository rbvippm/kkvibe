<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatBillingAmount, type BillingRecord } from '../../constants/billingList'

defineProps<{
  row: BillingRecord
  highlight?: string
}>()

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
  router.push({ name: 'mobile-billing-detail', params: { id: row.id } })
}
</script>

<template>
  <article class="mh5-billing-item" role="button" tabindex="0" @click="openDetail(row)" @keydown.enter="openDetail(row)">
    <div class="mh5-billing-item__icon" aria-hidden="true">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" class="mh5-billing-item__icon-svg">
        <circle cx="18" cy="18" r="18" fill="currentColor" />
        <path
          d="M12 10.5c2.2-1.2 4.8-1 6.8.5 2.2 1.6 2.8 4.6 1.4 6.9-1.1 1.8-3.2 2.8-5.3 2.5"
          stroke="#fff"
          stroke-width="2.2"
          stroke-linecap="round"
        />
        <path
          d="M24 25.5c-2.2 1.2-4.8 1-6.8-.5-2.2-1.6-2.8-4.6-1.4-6.9 1.1-1.8 3.2-2.8 5.3-2.5"
          stroke="#fff"
          stroke-width="2.2"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="mh5-billing-item__body">
      <div class="mh5-billing-item__title">
        <template v-for="(part, index) in highlightText(row.typeLabel, highlight)" :key="`${row.id}-t-${index}`">
          <mark v-if="part.match" class="mh5-billing-item__mark">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </div>
      <div class="mh5-billing-item__time">{{ row.createdAt }}</div>
    </div>
    <div class="mh5-billing-item__amount-wrap">
      <div
        class="mh5-billing-item__amount"
        :class="row.amount >= 0 ? 'mh5-billing-item__amount--plus' : 'mh5-billing-item__amount--minus'"
      >
        {{ formatBillingAmount(row.amount) }}
      </div>
      <div class="mh5-billing-item__currency">{{ row.currency }}</div>
    </div>
  </article>
</template>
