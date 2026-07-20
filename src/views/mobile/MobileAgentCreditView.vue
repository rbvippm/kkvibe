<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  AGENT_CREATE_ACCOUNT_STEPS,
  AGENT_CREDIT_STEPS,
  DEFAULT_AGENT_CREDIT_MAX_COST,
  DEFAULT_AGENT_CREDIT_PRODUCTS,
  formatCreditPercent,
  isValidCostPercent,
  isValidRebatePercent,
  isValidSharePercent,
  normalizeCostPercent,
  normalizeRebatePercent,
  type AgentCreditProduct,
} from '../../constants/agentCredit'
import { AGENT_CREATE_ACCOUNT_SPEC, AGENT_CREDIT_SPEC } from '../../constants/agentCreditSpec'
import { syncCreditProfitRatioFromCredit } from '../../constants/agentProfitRatio'
import { createTeamAgentAccount, promoteToCreditAgent } from '../../constants/agentTeam'
import '../../styles/mobile-app-shell.css'

type CreditStep = 1 | 2
type EditField = 'share' | 'rebate' | 'cost'

const route = useRoute()
const router = useRouter()

const isCreateMode = computed(
  () =>
    route.name === 'mobile-agent-create-account' ||
    route.meta.agentCreditMode === 'create' ||
    route.query.mode === 'create',
)

const step = ref<CreditStep>(1)
const sharePercent = ref(0)
const rebatePercent = ref(0)
const costPercent = ref(0)
const maxCost = DEFAULT_AGENT_CREDIT_MAX_COST
const products = ref<AgentCreditProduct[]>(
  DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item })),
)
const createdNickname = ref('')

const editVisible = ref(false)
const editField = ref<EditField>('share')
const editProductKey = ref('')
const editDraft = ref('')
const editError = ref('')

const targetNickname = computed(
  () => createdNickname.value || String(route.query.targetName || ''),
)

const pageSteps = computed(() =>
  isCreateMode.value ? AGENT_CREATE_ACCOUNT_STEPS : AGENT_CREDIT_STEPS,
)

const pageSpec = computed(() =>
  isCreateMode.value ? AGENT_CREATE_ACCOUNT_SPEC : AGENT_CREDIT_SPEC,
)

const pageTitle = computed(() => {
  if (isCreateMode.value) {
    return step.value === 2 ? '创建成功' : '创建代理账户'
  }
  return step.value === 2 ? '授信成功' : '代理授信'
})

const successTitle = computed(() =>
  isCreateMode.value ? '代理账户创建成功' : '代理授信成功',
)

const successDescPrefix = computed(() => (isCreateMode.value ? '已创建下级代理' : '已为'))

const successDescSuffix = computed(() => (isCreateMode.value ? '' : '完成授信'))

const primaryActionLabel = computed(() => (isCreateMode.value ? '继续创建' : '继续授信'))

const editingProduct = computed(() =>
  products.value.find((item) => item.key === editProductKey.value),
)

const editMax = computed(() => {
  if (editField.value === 'cost') return maxCost
  if (!editingProduct.value) return 0
  return editField.value === 'share' ? editingProduct.value.maxShare : editingProduct.value.maxRebate
})

const editTitle = computed(() => {
  if (editField.value === 'cost') return '编辑成本'
  if (!editingProduct.value) return '编辑比例'
  const label = editField.value === 'share' ? '占成' : '退水'
  return `编辑${editingProduct.value.name}${label}`
})

const editPercentKind = computed(() =>
  editField.value === 'share' || editField.value === 'cost' ? 'share' : 'rebate',
)

const editInputMode = computed(() =>
  editField.value === 'share' || editField.value === 'cost' ? 'numeric' : 'decimal',
)

watch(sharePercent, (value) => {
  const next = Math.round(Math.min(100, Math.max(0, value)))
  products.value.forEach((row) => {
    row.share = Math.min(next, row.maxShare)
  })
  costPercent.value = Math.min(next, maxCost)
})

watch(rebatePercent, (value) => {
  const next = normalizeRebatePercent(Math.min(100, Math.max(0, value)))
  products.value.forEach((row) => {
    row.rebate = Math.min(next, row.maxRebate)
  })
})

function stepStatus(index: number) {
  if (step.value === 2) return 'done'
  return index === 0 ? 'active' : 'pending'
}

function goPrevious() {
  if (step.value === 2) {
    step.value = 1
    return
  }
  router.back()
}

function confirmCredit() {
  if (isCreateMode.value) {
    const created = createTeamAgentAccount()
    createdNickname.value = created.nickname
  } else {
    const targetId = String(route.query.targetId || '')
    const targetName = String(route.query.targetName || '')
    if (targetId) {
      promoteToCreditAgent(targetId, targetName)
    }
  }
  syncCreditProfitRatioFromCredit(products.value, costPercent.value)
  step.value = 2
}

function backToAgentCenter() {
  router.push({ name: 'mobile-agent' })
}

function continueCredit() {
  step.value = 1
  sharePercent.value = 0
  rebatePercent.value = 0
  costPercent.value = 0
  createdNickname.value = ''
  products.value = DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item }))
}

function validateEditDraft(showEmptyError = false): number | null {
  const draft = editDraft.value.trim()
  if (!draft) {
    editError.value = showEmptyError ? '请输入有效比例' : ''
    return null
  }

  const next = Number(draft)
  if (Number.isNaN(next) || next < 0) {
    editError.value = '请输入有效比例'
    return null
  }

  if (editField.value === 'share') {
    if (!isValidSharePercent(next)) {
      editError.value = '占成须为整数'
      return null
    }
  } else if (editField.value === 'cost') {
    if (!isValidCostPercent(next)) {
      editError.value = '成本须为整数'
      return null
    }
  } else if (!isValidRebatePercent(next)) {
    editError.value = '退水最多支持两位小数'
    return null
  }

  const max = editMax.value
  if (next > max) {
    editError.value = `不能超过最高 ${formatCreditPercent(max, editPercentKind.value)}`
    return null
  }

  editError.value = ''
  return next
}

function onEditDraftInput(event: Event) {
  const target = event.target as HTMLInputElement
  const raw = target.value

  if (editField.value === 'share' || editField.value === 'cost') {
    const next = raw.replace(/[^\d]/g, '')
    editDraft.value = next
    if (target.value !== next) target.value = next
  } else {
    let next = raw.replace(/[^\d.]/g, '')
    const firstDot = next.indexOf('.')
    if (firstDot !== -1) {
      next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '')
      const [intPart, fracPart = ''] = next.split('.')
      next = `${intPart}.${fracPart.slice(0, 2)}`
    }
    editDraft.value = next
    if (target.value !== next) target.value = next
  }

  validateEditDraft(false)
}

function openEdit(product: AgentCreditProduct, field: 'share' | 'rebate') {
  editProductKey.value = product.key
  editField.value = field
  editDraft.value =
    field === 'share' ? String(Math.round(product.share)) : String(Number(product.rebate.toFixed(2)))
  editError.value = ''
  editVisible.value = true
}

function openCostEdit() {
  editProductKey.value = ''
  editField.value = 'cost'
  editDraft.value = String(Math.round(costPercent.value))
  editError.value = ''
  editVisible.value = true
}

function closeEdit() {
  editVisible.value = false
  editProductKey.value = ''
  editDraft.value = ''
  editError.value = ''
}

function saveEdit() {
  const next = validateEditDraft(true)
  if (next === null) return

  if (editField.value === 'cost') {
    costPercent.value = normalizeCostPercent(next)
    closeEdit()
    return
  }

  const product = editingProduct.value
  if (!product) return

  if (editField.value === 'share') {
    product.share = next
  } else {
    product.rebate = normalizeRebatePercent(next)
  }
  closeEdit()
}
</script>

<template>
  <div class="mh5-agent-credit-page">
    <Mh5SubPageHeader :title="pageTitle" :on-back="goPrevious">
      <template #right>
        <Mh5SpecAnnot :spec="pageSpec" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-agent-credit-steps" :aria-label="isCreateMode ? '创建进度' : '授信进度'">
      <template v-for="(item, index) in pageSteps" :key="item.key">
        <div
          class="mh5-agent-credit-step"
          :class="{
            'mh5-agent-credit-step--active': stepStatus(index) === 'active',
            'mh5-agent-credit-step--done': stepStatus(index) === 'done',
          }"
        >
          <span class="mh5-agent-credit-step__dot" aria-hidden="true">
            <svg
              v-if="stepStatus(index) !== 'pending'"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.8"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="mh5-agent-credit-step__label">{{ item.label }}</span>
        </div>
        <span
          v-if="index < pageSteps.length - 1"
          class="mh5-agent-credit-steps__line"
          :class="{ 'mh5-agent-credit-steps__line--done': step === 2 }"
          aria-hidden="true"
        />
      </template>
    </div>

    <main v-if="step === 1" class="mh5-agent-credit-main">
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
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${sharePercent}%` }">
              {{ Math.round(sharePercent) }}%
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
              step="0.01"
              aria-label="退水比例"
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${rebatePercent}%` }">
              {{ Number(rebatePercent.toFixed(2)) }}%
            </span>
          </div>
        </div>
      </section>

      <section class="mh5-agent-credit-cost-card">
        <div class="mh5-agent-credit-cost-card__left">
          <span class="mh5-agent-credit-cost-card__label">成本</span>
          <span class="mh5-agent-credit-cost-card__tip">含活动金和VIP晋级礼金</span>
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

      <section class="mh5-agent-credit-table-wrap">
        <table class="mh5-agent-credit-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>占成</th>
              <th>退水</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in products" :key="row.key">
              <td class="mh5-agent-credit-table__product">{{ row.name }}</td>
              <td>
                <div class="mh5-agent-credit-table__cell">
                  <button
                    type="button"
                    class="mh5-agent-credit-table__value-btn"
                    @click="openEdit(row, 'share')"
                  >
                    <span>{{ formatCreditPercent(row.share, 'share') }}</span>
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
                  <span class="mh5-agent-credit-table__limit">最高{{ formatCreditPercent(row.maxShare, 'share') }}</span>
                </div>
              </td>
              <td>
                <div class="mh5-agent-credit-table__cell">
                  <button
                    type="button"
                    class="mh5-agent-credit-table__value-btn"
                    @click="openEdit(row, 'rebate')"
                  >
                    <span>{{ formatCreditPercent(row.rebate, 'rebate') }}</span>
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
                  <span class="mh5-agent-credit-table__limit">最高{{ formatCreditPercent(row.maxRebate, 'rebate') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <main v-else class="mh5-agent-credit-success">
      <div class="mh5-agent-credit-success__hero">
        <div class="mh5-member-credit-success__icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 12.5 10 16.5 18 8.5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="mh5-agent-credit-success__title">{{ successTitle }}</h2>
        <p class="mh5-member-credit-success__member">
          {{ successDescPrefix }}
          <strong>{{ targetNickname || '新代理' }}</strong>
          {{ successDescSuffix }}
        </p>
      </div>
    </main>

    <footer class="mh5-agent-credit-footer safe-pb">
      <template v-if="step === 1">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary" @click="confirmCredit">
          创建
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost"
          @click="backToAgentCenter"
        >
          返回代理中心
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="continueCredit"
        >
          {{ primaryActionLabel }}
        </button>
      </template>
    </footer>

    <Teleport to="body">
      <div v-if="editVisible" class="mh5-agent-credit-edit-mask" @click.self="closeEdit">
        <div class="mh5-agent-credit-edit-panel" role="dialog" aria-modal="true" :aria-label="editTitle">
          <h3 class="mh5-agent-credit-edit-panel__title">{{ editTitle }}</h3>
          <p class="mh5-agent-credit-edit-panel__hint">
            最高 {{ formatCreditPercent(editMax, editPercentKind) }}
          </p>
          <div
            class="mh5-agent-credit-edit-panel__field"
            :class="{ 'mh5-agent-credit-edit-panel__field--error': !!editError }"
          >
            <input
              :value="editDraft"
              type="text"
              class="mh5-agent-credit-edit-panel__input"
              :inputmode="editInputMode"
              :placeholder="editField === 'rebate' ? '最多两位小数' : '请输入整数'"
              :aria-invalid="!!editError"
              @input="onEditDraftInput"
            />
            <span>%</span>
          </div>
          <p v-if="editError" class="mh5-agent-credit-edit-panel__error">{{ editError }}</p>
          <div class="mh5-agent-credit-edit-panel__actions">
            <button type="button" class="mh5-agent-credit-edit-panel__btn" @click="closeEdit">取消</button>
            <button
              type="button"
              class="mh5-agent-credit-edit-panel__btn mh5-agent-credit-edit-panel__btn--primary"
              @click="saveEdit"
            >
              保存
            </button>
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
