<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  agentProfitRatioProducts,
  cloneAgentProfitRatioProducts,
  getAgentProfitRatioProductIcon,
  type AgentProfitRatioProduct,
} from '../../constants/agentProfitRatio'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const sharePercent = ref(0)
const rebatePercent = ref(0)
const products = ref<AgentProfitRatioProduct[]>(cloneAgentProfitRatioProducts(agentProfitRatioProducts.value))

const targetNickname = computed(() => String(route.query.targetName || 'Tom Cat%'))

function clampProductValue(product: AgentProfitRatioProduct, field: 'share' | 'rebate', value: number) {
  const max = field === 'share' ? product.maxShare : product.maxRebate
  if (Number.isNaN(value) || value < 0) return 0
  return Math.min(value, max)
}

function updateProductField(product: AgentProfitRatioProduct, field: 'share' | 'rebate', raw: string) {
  const next = clampProductValue(product, field, Number(raw))
  if (field === 'share') {
    product.share = next
  } else {
    product.rebate = next
  }
}

function applyGlobalShare() {
  products.value.forEach((product) => {
    product.share = clampProductValue(product, 'share', sharePercent.value)
  })
}

function applyGlobalRebate() {
  products.value.forEach((product) => {
    product.rebate = clampProductValue(product, 'rebate', rebatePercent.value)
  })
}

function saveRatios() {
  agentProfitRatioProducts.value = cloneAgentProfitRatioProducts(products.value)
  window.alert('收益比例已保存')
  router.back()
}
</script>

<template>
  <div class="mh5-agent-profit-ratio-edit-page">
    <Mh5SubPageHeader title="设置比例" />

    <main class="mh5-agent-profit-ratio-edit-main">
      <p class="mh5-agent-profit-ratio-edit-account">代理账号：{{ targetNickname }}</p>

      <section class="mh5-agent-credit-slider-card">
        <span class="mh5-agent-credit-slider-card__label">占成</span>
        <div class="mh5-agent-credit-slider">
          <div class="mh5-agent-credit-slider__track">
            <div class="mh5-agent-credit-slider__fill" :style="{ width: `${sharePercent}%` }" />
            <input
              v-model.number="sharePercent"
              class="mh5-agent-credit-slider__input"
              type="range"
              min="0"
              max="100"
              step="1"
              aria-label="占成比例"
              @change="applyGlobalShare"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${sharePercent}%` }">
              {{ sharePercent }}%
            </span>
          </div>
        </div>
      </section>

      <section class="mh5-agent-credit-slider-card">
        <span class="mh5-agent-credit-slider-card__label">退水</span>
        <div class="mh5-agent-credit-slider">
          <div class="mh5-agent-credit-slider__track">
            <div class="mh5-agent-credit-slider__fill" :style="{ width: `${rebatePercent}%` }" />
            <input
              v-model.number="rebatePercent"
              class="mh5-agent-credit-slider__input"
              type="range"
              min="0"
              max="100"
              step="1"
              aria-label="退水比例"
              @change="applyGlobalRebate"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${rebatePercent}%` }">
              {{ rebatePercent }}%
            </span>
          </div>
        </div>
      </section>

      <section
        v-for="product in products"
        :key="product.key"
        class="mh5-agent-profit-ratio-edit-product"
      >
        <div class="mh5-agent-profit-ratio-edit-product__head">
          <span class="mh5-agent-profit-ratio-edit-product__icon" aria-hidden="true">
            {{ getAgentProfitRatioProductIcon(product.key) }}
          </span>
          <h3>{{ product.name }}</h3>
        </div>

        <div class="mh5-agent-profit-ratio-edit-product__panel">
          <div class="mh5-agent-profit-ratio-edit-product__row">
            <span>占成</span>
            <label class="mh5-agent-profit-ratio-edit-product__input-wrap">
              <input
                :value="product.share"
                type="number"
                min="0"
                :max="product.maxShare"
                step="0.1"
                inputmode="decimal"
                @input="updateProductField(product, 'share', ($event.target as HTMLInputElement).value)"
              />
              <em>%</em>
            </label>
          </div>
          <div class="mh5-agent-profit-ratio-edit-product__row">
            <span>退水</span>
            <label class="mh5-agent-profit-ratio-edit-product__input-wrap">
              <input
                :value="product.rebate"
                type="number"
                min="0"
                :max="product.maxRebate"
                step="0.1"
                inputmode="decimal"
                @input="updateProductField(product, 'rebate', ($event.target as HTMLInputElement).value)"
              />
              <em>%</em>
            </label>
          </div>
        </div>
      </section>
    </main>

    <footer class="mh5-agent-profit-ratio-edit-footer safe-pb">
      <button type="button" class="mh5-agent-profit-ratio-edit-footer__btn" @click="saveRatios">保存</button>
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
