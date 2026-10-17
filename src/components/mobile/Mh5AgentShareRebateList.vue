<script setup lang="ts">
import {
  formatProfitRatioPercent,
  getAgentProfitRatioProductIcon,
  type AgentProfitRatioCategory,
  type AgentProfitRatioChild,
} from '../../constants/agentProfitRatio'

defineProps<{
  categories: AgentProfitRatioCategory[]
}>()

function updateCategoryShare(category: AgentProfitRatioCategory, raw: string) {
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) {
    category.share = 0
    return
  }
  category.share = Math.min(Math.round(value), category.maxShare)
}

function updateProductRebate(product: AgentProfitRatioChild, raw: string) {
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) {
    product.rebate = 0
    return
  }
  product.rebate = Math.min(Number(value.toFixed(2)), product.maxRebate)
}
</script>

<template>
  <section
    v-for="category in categories"
    :key="category.key"
    class="mh5-agent-profit-ratio-edit-product"
  >
    <div class="mh5-agent-profit-ratio-edit-product__panel">
      <div class="mh5-agent-profit-ratio-edit-product__head">
        <span class="mh5-agent-profit-ratio-edit-product__icon" aria-hidden="true">
          {{ getAgentProfitRatioProductIcon(category.key) }}
        </span>
        <h3>{{ category.name }}</h3>
        <div class="mh5-agent-profit-ratio-edit-product__field">
          <div class="mh5-agent-profit-ratio-edit-product__value">
            <em class="mh5-agent-profit-ratio-list__kind mh5-agent-profit-ratio-list__kind--share">占成</em>
            <label class="mh5-agent-profit-ratio-edit-product__input-wrap">
              <input
                :value="category.share"
                type="text"
                inputmode="numeric"
                :aria-label="`${category.name}占成`"
                @input="updateCategoryShare(category, ($event.target as HTMLInputElement).value)"
              />
              <em>%</em>
            </label>
          </div>
          <p class="mh5-agent-profit-ratio-edit-product__max">
            最高{{ formatProfitRatioPercent(category.maxShare) }}
          </p>
        </div>
      </div>
      <div
        v-for="product in category.products"
        :key="`${category.key}-${product.key}`"
        class="mh5-agent-profit-ratio-edit-product__row mh5-agent-profit-ratio-edit-product__row--child"
      >
        <span>{{ product.name }}</span>
        <div class="mh5-agent-profit-ratio-edit-product__field">
          <div class="mh5-agent-profit-ratio-edit-product__value">
            <em class="mh5-agent-profit-ratio-list__kind mh5-agent-profit-ratio-list__kind--rebate">退水</em>
            <label class="mh5-agent-profit-ratio-edit-product__input-wrap">
              <input
                :value="product.rebate"
                type="text"
                inputmode="decimal"
                :aria-label="`${product.name}退水`"
                @input="updateProductRebate(product, ($event.target as HTMLInputElement).value)"
              />
              <em>%</em>
            </label>
          </div>
          <p class="mh5-agent-profit-ratio-edit-product__max">
            最高{{ formatProfitRatioPercent(product.maxRebate) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
