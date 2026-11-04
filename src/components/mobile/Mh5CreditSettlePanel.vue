<script setup lang="ts">
import type { CreditSettlePanel, CreditSettleRow } from '../../constants/agentCreditSettle'

defineProps<{
  panel: CreditSettlePanel
}>()

const emit = defineEmits<{
  link: [link: NonNullable<CreditSettleRow['link']>]
}>()

function valueClass(row: CreditSettleRow) {
  if (row.tone === 'positive') return 'mh5-agent-detail-wallet__value--positive'
  if (row.tone === 'negative') return 'mh5-agent-detail-wallet__value--negative'
  return 'mh5-agent-detail-credit-settle__value--neutral'
}

function onRowClick(row: CreditSettleRow) {
  if (row.link) emit('link', row.link)
}
</script>

<template>
  <div
    class="mh5-agent-detail-credit-settle__receivable"
    :class="{ 'mh5-agent-detail-credit-settle__receivable--negative': !panel.heroPositive }"
  >
    <p class="mh5-agent-detail-credit-settle__receivable-label">{{ panel.heroLabel }}</p>
    <p class="mh5-agent-detail-credit-settle__receivable-value">{{ panel.heroValue }}</p>
    <p class="mh5-agent-detail-credit-settle__receivable-formula">{{ panel.heroFormula }}</p>
  </div>

  <div
    v-for="section in panel.sections"
    :key="section.title"
    class="mh5-credit-settle-section"
  >
    <div class="mh5-credit-settle-section__head">
      <span class="mh5-credit-settle-section__title">{{ section.title }}</span>
      <span v-if="section.hint" class="mh5-credit-settle-section__hint">{{ section.hint }}</span>
    </div>
    <div class="mh5-agent-detail-credit-settle__timeline">
      <component
        :is="row.link ? 'button' : 'div'"
        v-for="row in section.rows"
        :key="row.label"
        :type="row.link ? 'button' : undefined"
        class="mh5-agent-detail-credit-settle__row mh5-credit-settle-row"
        :class="{
          'mh5-credit-settle-row--total': row.total,
          'mh5-credit-settle-row--link': row.link,
        }"
        @click="onRowClick(row)"
      >
        <span class="mh5-credit-settle-row__label">
          {{ row.label }}
          <small v-if="row.hint" class="mh5-credit-settle-row__hint">{{ row.hint }}</small>
        </span>
        <span :class="valueClass(row)">
          {{ row.value }}<i v-if="row.link" class="mh5-credit-settle-row__arrow" aria-hidden="true">›</i>
        </span>
      </component>
    </div>
  </div>
</template>
