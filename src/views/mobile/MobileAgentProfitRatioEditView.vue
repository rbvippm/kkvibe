<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  DEFAULT_AGENT_CREDIT_MAX_COST,
  formatCreditPercent,
  isValidCostPercent,
  normalizeCostPercent,
} from '../../constants/agentCredit'
import {
  AGENT_PROFIT_RATIO_TYPE_LABEL,
  cloneAgentProfitRatioProducts,
  getAgentProfitCost,
  getAgentProfitRatioProductIcon,
  getAgentProfitRatioProducts,
  parseAgentProfitRatioType,
  saveAgentProfitCost,
  saveAgentProfitRatioProducts,
  type AgentProfitRatioProduct,
} from '../../constants/agentProfitRatio'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const ratioType = computed(() => parseAgentProfitRatioType(String(route.query.ratioType || 'cash')))
const ratioTypeLabel = computed(() => AGENT_PROFIT_RATIO_TYPE_LABEL[ratioType.value])

const sharePercent = ref(0)
const rebatePercent = ref(0)
const costPercent = ref(getAgentProfitCost(ratioType.value).value)
const maxCost = DEFAULT_AGENT_CREDIT_MAX_COST
const products = ref<AgentProfitRatioProduct[]>(
  cloneAgentProfitRatioProducts(getAgentProfitRatioProducts(ratioType.value).value),
)

const costEditVisible = ref(false)
const costDraft = ref('')
const costError = ref('')

const targetNickname = computed(() => String(route.query.targetName || 'Tom Cat%'))
const pageTitle = computed(() => `设置${ratioTypeLabel.value}比例`)

watch(sharePercent, (value) => {
  const next = Math.round(Math.min(100, Math.max(0, value)))
  products.value.forEach((product) => {
    product.share = clampProductValue(product, 'share', next)
  })
  costPercent.value = Math.min(next, maxCost)
})

watch(rebatePercent, (value) => {
  const next = Math.min(100, Math.max(0, value))
  products.value.forEach((product) => {
    product.rebate = clampProductValue(product, 'rebate', next)
  })
})

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

function validateCostDraft(showEmptyError = false): number | null {
  const draft = costDraft.value.trim()
  if (!draft) {
    costError.value = showEmptyError ? '请输入有效比例' : ''
    return null
  }

  const next = Number(draft)
  if (Number.isNaN(next) || next < 0) {
    costError.value = '请输入有效比例'
    return null
  }

  if (!isValidCostPercent(next)) {
    costError.value = '其他成本须为整数'
    return null
  }

  if (next > maxCost) {
    costError.value = `不能超过最高 ${formatCreditPercent(maxCost, 'share')}`
    return null
  }

  costError.value = ''
  return normalizeCostPercent(next)
}

function onCostDraftInput(event: Event) {
  const target = event.target as HTMLInputElement
  const next = target.value.replace(/[^\d]/g, '')
  costDraft.value = next
  if (target.value !== next) target.value = next
  validateCostDraft(false)
}

function openCostEdit() {
  costDraft.value = String(Math.round(costPercent.value))
  costError.value = ''
  costEditVisible.value = true
}

function closeCostEdit() {
  costEditVisible.value = false
  costDraft.value = ''
  costError.value = ''
}

function saveCostEdit() {
  const next = validateCostDraft(true)
  if (next === null) return
  costPercent.value = next
  closeCostEdit()
}

async function saveRatios() {
  saveAgentProfitRatioProducts(ratioType.value, products.value)
  saveAgentProfitCost(ratioType.value, costPercent.value)
  await mh5Alert(`${ratioTypeLabel.value}收益比例已保存`)
  router.back()
}
</script>

<template>
  <div class="mh5-agent-profit-ratio-edit-page">
    <Mh5SubPageHeader :title="pageTitle" />

    <main class="mh5-agent-profit-ratio-edit-main">
      <p class="mh5-agent-profit-ratio-edit-account">
        代理账号：{{ targetNickname }}
        <span class="mh5-agent-profit-ratio-edit-account__type">{{ ratioTypeLabel }}收益</span>
      </p>

      <section class="mh5-agent-credit-slider-card">
        <span class="mh5-agent-credit-slider-card__label">{{ $t('占成') }}</span>
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
              :aria-label="$t('占成比例')"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${sharePercent}%` }">
              {{ sharePercent }}%
            </span>
          </div>
        </div>
      </section>

      <section class="mh5-agent-credit-slider-card">
        <span class="mh5-agent-credit-slider-card__label">{{ $t('退水') }}</span>
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
              :aria-label="$t('退水比例')"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${rebatePercent}%` }">
              {{ rebatePercent }}%
            </span>
          </div>
        </div>
      </section>

      <section class="mh5-agent-credit-cost-card">
        <div class="mh5-agent-credit-cost-card__left">
          <span class="mh5-agent-credit-cost-card__label">{{ $t('其他成本') }}</span>
        </div>
        <div class="mh5-agent-credit-table__cell">
          <button
            type="button"
            class="mh5-agent-credit-table__value-btn"
            @click="openCostEdit"
          >
            <span>{{ formatCreditPercent(costPercent, 'share') }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
              <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
          <span class="mh5-agent-credit-table__limit">
            最高{{ formatCreditPercent(maxCost, 'share') }}
          </span>
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
          <h3>{{ $t(product.name) }}</h3>
        </div>

        <div class="mh5-agent-profit-ratio-edit-product__panel">
          <div class="mh5-agent-profit-ratio-edit-product__row">
            <span>{{ $t('占成') }}</span>
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
            <span>{{ $t('退水') }}</span>
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
      <button type="button" class="mh5-agent-profit-ratio-edit-footer__btn" @click="saveRatios">{{ $t('保存') }}</button>
    </footer>

    <Teleport to="body">
      <div v-if="costEditVisible" class="mh5-agent-credit-edit-mask" @click.self="closeCostEdit">
        <div class="mh5-agent-credit-edit-panel" role="dialog" aria-modal="true" :aria-label="$t('编辑其他成本')">
          <h3 class="mh5-agent-credit-edit-panel__title">{{ $t('编辑其他成本') }}</h3>
          <p class="mh5-agent-credit-edit-panel__hint">
            最高 {{ formatCreditPercent(maxCost, 'share') }}
          </p>
          <div
            class="mh5-agent-credit-edit-panel__field"
            :class="{ 'mh5-agent-credit-edit-panel__field--error': !!costError }"
          >
            <input
              :value="costDraft"
              type="text"
              class="mh5-agent-credit-edit-panel__input"
              inputmode="numeric"
              :placeholder="$t('请输入整数')"
              :aria-invalid="!!costError"
              @input="onCostDraftInput"
            />
            <span>%</span>
          </div>
          <p v-if="costError" class="mh5-agent-credit-edit-panel__error">{{ costError }}</p>
          <div class="mh5-agent-credit-edit-panel__actions">
            <button type="button" class="mh5-agent-credit-edit-panel__btn" @click="closeCostEdit">{{ $t('取消') }}</button>
            <button
              type="button"
              class="mh5-agent-credit-edit-panel__btn mh5-agent-credit-edit-panel__btn--primary"
              @click="saveCostEdit"
            >{{ $t('保存') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
