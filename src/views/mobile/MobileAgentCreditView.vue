<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  AGENT_CREATE_ACCOUNT_DEFAULTS,
  AGENT_CREATE_ACCOUNT_REBATE_STEPS,
  AGENT_CREATE_ACCOUNT_STEPS,
  AGENT_CREATE_DIAL_CODES,
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
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import '../../styles/mobile-app-shell.css'

/** 授信：1 收益比例 / 2 成功；占成创建：1 账号 / 2 比例 / 3 完成；返佣创建：1 账号 / 2 完成 */
type CreditStep = 1 | 2 | 3
type EditField = 'share' | 'rebate' | 'cost'

const route = useRoute()
const router = useRouter()
const { isRebateAgent } = useAgentIdentity()

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

const parentAgent = ref(AGENT_CREATE_ACCOUNT_DEFAULTS.parentAgent)
const dialCode = ref<string>(AGENT_CREATE_ACCOUNT_DEFAULTS.dialCode)
const kingkongAccount = ref(AGENT_CREATE_ACCOUNT_DEFAULTS.kingkongAccount)
const password = ref(AGENT_CREATE_ACCOUNT_DEFAULTS.password)
const confirmPassword = ref(AGENT_CREATE_ACCOUNT_DEFAULTS.confirmPassword)
const remark = ref(AGENT_CREATE_ACCOUNT_DEFAULTS.remark)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const dialPickerOpen = ref(false)

const editVisible = ref(false)
const editField = ref<EditField>('share')
const editProductKey = ref('')
const editDraft = ref('')
const editError = ref('')

const targetNickname = computed(
  () => createdNickname.value || String(route.query.targetName || ''),
)

/** 返佣创建无收益比例步 */
const isRebateCreate = computed(() => isCreateMode.value && isRebateAgent.value)

const isAccountStep = computed(() => isCreateMode.value && step.value === 1)
const isRatioStep = computed(() => {
  if (!isCreateMode.value) return step.value === 1
  if (isRebateCreate.value) return false
  return step.value === 2
})
const isSuccessStep = computed(() => {
  if (!isCreateMode.value) return step.value === 2
  if (isRebateCreate.value) return step.value === 2
  return step.value === 3
})

const pageSteps = computed(() => {
  if (!isCreateMode.value) return AGENT_CREDIT_STEPS
  return isRebateCreate.value ? AGENT_CREATE_ACCOUNT_REBATE_STEPS : AGENT_CREATE_ACCOUNT_STEPS
})

const pageSpec = computed(() =>
  isCreateMode.value ? AGENT_CREATE_ACCOUNT_SPEC : AGENT_CREDIT_SPEC,
)

const pageTitle = computed(() => {
  if (isCreateMode.value) {
    return isSuccessStep.value ? '创建成功' : '创建代理账户'
  }
  return step.value === 2 ? '授信成功' : '代理授信'
})

const successTitle = computed(() =>
  isCreateMode.value ? '代理账户创建成功' : '代理授信成功',
)

const successDescPrefix = computed(() => (isCreateMode.value ? '已创建下级代理' : '已为'))

const successDescSuffix = computed(() => (isCreateMode.value ? '' : '完成授信'))

const primaryActionLabel = computed(() => (isCreateMode.value ? '继续创建' : '继续授信'))

const accountPrimaryLabel = computed(() => (isRebateCreate.value ? '创建' : '下一步'))

const editingProduct = computed(() =>
  products.value.find((item) => item.key === editProductKey.value),
)

const editMax = computed(() => {
  if (editField.value === 'cost') return maxCost
  if (!editingProduct.value) return 0
  return editField.value === 'share' ? editingProduct.value.maxShare : editingProduct.value.maxRebate
})

const editTitle = computed(() => {
  if (editField.value === 'cost') return '编辑其他成本'
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

function stepStatus(index: number): 'active' | 'done' | 'pending' {
  const current = step.value
  if (current > index + 1) return 'done'
  if (current === index + 1) return 'active'
  return 'pending'
}

function isStepLineDone(index: number) {
  return step.value > index + 1
}

function goPrevious() {
  if (isCreateMode.value) {
    if (isRebateCreate.value) {
      if (step.value === 2) {
        step.value = 1
        return
      }
      router.back()
      return
    }
    if (step.value === 3) {
      step.value = 2
      return
    }
    if (step.value === 2) {
      step.value = 1
      return
    }
    router.back()
    return
  }
  if (step.value === 2) {
    step.value = 1
    return
  }
  router.back()
}

async function goNextFromAccount() {
  if (!kingkongAccount.value.trim()) {
    await mh5Alert('请填写金刚账号')
    return
  }
  if (!password.value) {
    await mh5Alert('请填写设置密码')
    return
  }
  if (!confirmPassword.value) {
    await mh5Alert('请填写确认密码')
    return
  }
  if (password.value !== confirmPassword.value) {
    await mh5Alert('两次密码不一致')
    return
  }
  if (isRebateCreate.value) {
    submitCreateAccount({ asCredit: false })
    return
  }
  step.value = 2
}

function submitCreateAccount(options?: { asCredit?: boolean }) {
  const created = createTeamAgentAccount(kingkongAccount.value.trim(), options)
  createdNickname.value = created.nickname
  if (options?.asCredit !== false) {
    syncCreditProfitRatioFromCredit(products.value, costPercent.value)
  }
  step.value = isRebateCreate.value ? 2 : 3
}

function confirmCredit() {
  if (isCreateMode.value) {
    submitCreateAccount({ asCredit: true })
    return
  }
  const targetId = String(route.query.targetId || '')
  const targetName = String(route.query.targetName || '')
  if (targetId) {
    promoteToCreditAgent(targetId, targetName)
  }
  syncCreditProfitRatioFromCredit(products.value, costPercent.value)
  step.value = 2
}

function backToAgentCenter() {
  router.push({ name: 'mobile-agent' })
}

function resetAccountForm() {
  parentAgent.value = AGENT_CREATE_ACCOUNT_DEFAULTS.parentAgent
  dialCode.value = AGENT_CREATE_ACCOUNT_DEFAULTS.dialCode
  kingkongAccount.value = ''
  password.value = ''
  confirmPassword.value = ''
  remark.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  dialPickerOpen.value = false
}

function continueCredit() {
  step.value = 1
  sharePercent.value = 0
  rebatePercent.value = 0
  costPercent.value = 0
  createdNickname.value = ''
  products.value = DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item }))
  if (isCreateMode.value) resetAccountForm()
}

function pickDialCode(code: string) {
  dialCode.value = code
  dialPickerOpen.value = false
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
      editError.value = '其他成本须为整数'
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
  const input = event.target as HTMLInputElement
  let value = input.value
  if (editField.value === 'share' || editField.value === 'cost') {
    value = value.replace(/[^\d]/g, '')
  } else {
    value = value.replace(/[^\d.]/g, '')
    const parts = value.split('.')
    if (parts.length > 2) value = `${parts[0]}.${parts.slice(1).join('')}`
    if (parts[1]?.length > 2) value = `${parts[0]}.${parts[1].slice(0, 2)}`
  }
  editDraft.value = value
  input.value = value
  validateEditDraft()
}

function openEdit(row: AgentCreditProduct, field: 'share' | 'rebate') {
  editField.value = field
  editProductKey.value = row.key
  editDraft.value = String(field === 'share' ? row.share : row.rebate)
  editError.value = ''
  editVisible.value = true
}

function openCostEdit() {
  editField.value = 'cost'
  editProductKey.value = ''
  editDraft.value = String(costPercent.value)
  editError.value = ''
  editVisible.value = true
}

function closeEdit() {
  editVisible.value = false
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
          :class="{ 'mh5-agent-credit-steps__line--done': isStepLineDone(index) }"
          aria-hidden="true"
        />
      </template>
    </div>

    <!-- 创建 · 填写账号 -->
    <main v-if="isAccountStep" class="mh5-agent-credit-main mh5-agent-create-account">
      <label class="mh5-agent-create-field">
        <span class="mh5-agent-create-field__label">上级代理</span>
        <input
          class="mh5-agent-create-field__input mh5-agent-create-field__input--readonly"
          type="text"
          :value="parentAgent"
          readonly
          aria-readonly="true"
        />
      </label>

      <div class="mh5-agent-create-field">
        <span class="mh5-agent-create-field__label">金刚账号</span>
        <div class="mh5-agent-create-field__combo">
          <button
            type="button"
            class="mh5-agent-create-field__dial"
            :aria-expanded="dialPickerOpen"
            aria-label="选择区号"
            @click="dialPickerOpen = !dialPickerOpen"
          >
            {{ dialCode }}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M3 4.5 6 7.5 9 4.5"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <input
            v-model="kingkongAccount"
            class="mh5-agent-create-field__input mh5-agent-create-field__input--combo"
            type="text"
            inputmode="tel"
            placeholder="请输入金刚账号"
            autocomplete="username"
          />
        </div>
        <div v-if="dialPickerOpen" class="mh5-agent-create-dial-list" role="listbox" aria-label="区号">
          <button
            v-for="code in AGENT_CREATE_DIAL_CODES"
            :key="code"
            type="button"
            class="mh5-agent-create-dial-list__item"
            :class="{ 'mh5-agent-create-dial-list__item--active': dialCode === code }"
            role="option"
            :aria-selected="dialCode === code"
            @click="pickDialCode(code)"
          >
            {{ code }}
          </button>
        </div>
      </div>

      <label class="mh5-agent-create-field">
        <span class="mh5-agent-create-field__label">设置密码</span>
        <div class="mh5-agent-create-field__password">
          <input
            v-model="password"
            class="mh5-agent-create-field__input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请设置登录密码"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="mh5-agent-create-field__eye"
            :aria-label="showPassword ? '隐藏密码' : '显示密码'"
            @click="showPassword = !showPassword"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="1.6" />
              <path
                v-if="!showPassword"
                d="M4 20 20 4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </label>

      <label class="mh5-agent-create-field">
        <span class="mh5-agent-create-field__label">确认密码</span>
        <div class="mh5-agent-create-field__password">
          <input
            v-model="confirmPassword"
            class="mh5-agent-create-field__input"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="mh5-agent-create-field__eye"
            :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="1.6" />
              <path
                v-if="!showConfirmPassword"
                d="M4 20 20 4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </label>



      <label class="mh5-agent-create-field">
        <span class="mh5-agent-create-field__label">备注</span>
        <textarea
          v-model="remark"
          class="mh5-agent-create-field__textarea"
          rows="4"
          placeholder="选填，如客户备注"
        />
      </label>
    </main>

    <!-- 收益比例 -->
    <main v-else-if="isRatioStep" class="mh5-agent-credit-main">
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
          <span class="mh5-agent-credit-cost-card__label">其他成本</span>
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

    <main v-else-if="isSuccessStep" class="mh5-agent-credit-success">
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

    <footer
      class="mh5-agent-credit-footer safe-pb"
      :class="{ 'mh5-agent-credit-footer--single': isAccountStep }"
    >
      <template v-if="isAccountStep">
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="goNextFromAccount"
        >
          {{ accountPrimaryLabel }}
        </button>
      </template>
      <template v-else-if="isRatioStep">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary" @click="confirmCredit">
          {{ isCreateMode ? '创建' : '授信' }}
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
