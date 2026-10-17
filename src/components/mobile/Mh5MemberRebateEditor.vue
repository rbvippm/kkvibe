<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  applyMemberRebateCategoryPercent,
  formatMemberRebateNumber,
  getMemberRebateProductIcon,
  type MemberRebateCategory,
  type MemberRebateProduct,
} from '../../constants/memberRebateRatio'

const props = defineProps<{
  categories: MemberRebateCategory[]
}>()

const productDraft = ref<Record<string, string>>({})
const productError = ref<Record<string, string>>({})

function productKey(categoryKey: string, productKeyValue: string) {
  return `${categoryKey}:${productKeyValue}`
}

function fillProductDrafts(category?: MemberRebateCategory) {
  const source = category ? [category] : props.categories
  const next = { ...productDraft.value }
  source.forEach((item) => {
    item.products.forEach((product) => {
      next[productKey(item.key, product.key)] = formatMemberRebateNumber(product.rebate)
    })
  })
  productDraft.value = next
}

fillProductDrafts()

watch(
  () => props.categories,
  () => {
    productDraft.value = {}
    productError.value = {}
    fillProductDrafts()
  },
)

function parseRebateInput(raw: string) {
  const text = raw.trim()
  if (!text) return { ok: false as const, message: '请输入退水' }
  if (!/^\d+(\.\d{0,2})?$/.test(text)) return { ok: false as const, message: '最多两位小数' }
  const value = Number(text)
  if (!Number.isFinite(value) || value < 0) return { ok: false as const, message: '请输入退水' }
  return { ok: true as const, value }
}

function onCategorySlide(category: MemberRebateCategory, raw: string) {
  const value = Math.min(100, Math.max(0, Math.round(Number(raw) || 0)))
  category.percent = value
  applyMemberRebateCategoryPercent(category)
  category.products.forEach((product) => {
    productError.value[productKey(category.key, product.key)] = ''
  })
  fillProductDrafts(category)
}

function onProductInput(category: MemberRebateCategory, product: MemberRebateProduct, raw: string) {
  const key = productKey(category.key, product.key)
  productDraft.value[key] = raw
  const parsed = parseRebateInput(raw)
  if (!parsed.ok) {
    productError.value[key] = parsed.message
    return
  }
  if (parsed.value > product.maxRebate) {
    productError.value[key] = `最高 ${formatMemberRebateNumber(product.maxRebate)}%`
    return
  }
  productError.value[key] = ''
  product.rebate = parsed.value
}

function firstError() {
  for (const category of props.categories) {
    for (const product of category.products) {
      const message = productError.value[productKey(category.key, product.key)]
      if (message) return `${product.name}：${message}`
    }
  }
  return ''
}

defineExpose({ firstError })
</script>

<template>
  <section
    v-for="category in categories"
    :key="category.key"
    class="mh5-member-rebate-edit-product"
  >
    <div class="mh5-member-rebate-edit-product__panel">
      <div class="mh5-member-rebate-edit-product__head">
        <span class="mh5-member-rebate-edit-product__icon" aria-hidden="true">
          {{ getMemberRebateProductIcon(category.key) }}
        </span>
        <h3>{{ category.name }}</h3>
        <div class="mh5-agent-credit-slider">
          <div class="mh5-agent-credit-slider__track">
            <div class="mh5-agent-credit-slider__fill" :style="{ width: `${category.percent}%` }" />
            <input
              class="mh5-agent-credit-slider__input"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="category.percent"
              :aria-label="`${category.name}比例`"
              @input="onCategorySlide(category, ($event.target as HTMLInputElement).value)"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${category.percent}%` }">
              {{ category.percent }}%
            </span>
          </div>
        </div>
      </div>
      <div
        v-for="product in category.products"
        :key="product.key"
        class="mh5-member-rebate-edit-product__child"
      >
        <div class="mh5-member-rebate-edit-product__row">
          <span>{{ product.name }}</span>
          <div class="mh5-member-rebate-edit-product__field">
            <label class="mh5-member-rebate-edit-product__input-wrap">
              <input
                :value="productDraft[`${category.key}:${product.key}`]"
                type="text"
                inputmode="decimal"
                :aria-label="`${product.name}退水`"
                @input="onProductInput(category, product, ($event.target as HTMLInputElement).value)"
              />
              <em>%</em>
            </label>
            <p class="mh5-member-rebate-edit-product__max">
              最高{{ formatMemberRebateNumber(product.maxRebate) }}%
            </p>
          </div>
        </div>
        <p
          v-if="productError[`${category.key}:${product.key}`]"
          class="mh5-member-rebate-edit-product__error"
        >
          {{ productError[`${category.key}:${product.key}`] }}
        </p>
      </div>
    </div>
  </section>
</template>
