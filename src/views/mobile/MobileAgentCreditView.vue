<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  AGENT_CREDIT_STEPS,
  buildAgentCreditCopyText,
  DEFAULT_AGENT_CREDIT_PRODUCTS,
  formatCreditPercent,
  MOCK_AGENT_CREDIT_SUCCESS,
  type AgentCreditProduct,
} from '../../constants/agentCredit'
import '../../styles/mobile-app-shell.css'

type CreditStep = 1 | 2
type EditField = 'share' | 'rebate'

const route = useRoute()
const router = useRouter()

const step = ref<CreditStep>(1)
const sharePercent = ref(30)
const rebatePercent = ref(30)
const products = ref<AgentCreditProduct[]>(
  DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item })),
)

const editVisible = ref(false)
const editField = ref<EditField>('share')
const editProductKey = ref('')
const editDraft = ref('')

const targetNickname = computed(() => String(route.query.targetName || '代理账号'))

const pageTitle = computed(() => (step.value === 2 ? '授信成功' : '代理授信'))

const successInfo = MOCK_AGENT_CREDIT_SUCCESS

const copyHint = ref('')

const editingProduct = computed(() =>
  products.value.find((item) => item.key === editProductKey.value),
)

const editMax = computed(() => {
  if (!editingProduct.value) return 0.1
  return editField.value === 'share' ? editingProduct.value.maxShare : editingProduct.value.maxRebate
})

const editTitle = computed(() => {
  if (!editingProduct.value) return '编辑比例'
  const label = editField.value === 'share' ? '占成' : '退水'
  return `编辑${editingProduct.value.name}${label}`
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
  step.value = 2
}

function backToAgentCenter() {
  router.push({ name: 'mobile-agent' })
}

function continueCredit() {
  step.value = 1
  sharePercent.value = 30
  rebatePercent.value = 30
  products.value = DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item }))
}

async function copySuccessInfo() {
  const text = buildAgentCreditCopyText(successInfo, targetNickname.value)
  try {
    await navigator.clipboard.writeText(text)
    copyHint.value = '已复制到剪贴板'
  } catch {
    copyHint.value = '复制失败，请手动复制'
  }
  window.setTimeout(() => {
    copyHint.value = ''
  }, 1800)
}

function openEdit(product: AgentCreditProduct, field: EditField) {
  editProductKey.value = product.key
  editField.value = field
  editDraft.value = String(field === 'share' ? product.share : product.rebate)
  editVisible.value = true
}

function closeEdit() {
  editVisible.value = false
  editProductKey.value = ''
  editDraft.value = ''
}

function saveEdit() {
  const product = editingProduct.value
  if (!product) return

  const next = Number(editDraft.value)
  if (Number.isNaN(next) || next < 0) {
    window.alert('请输入有效比例')
    return
  }

  const max = editMax.value
  if (next > max) {
    window.alert(`不能超过最高 ${formatCreditPercent(max)}`)
    return
  }

  if (editField.value === 'share') {
    product.share = next
  } else {
    product.rebate = next
  }
  closeEdit()
}
</script>

<template>
  <div class="mh5-agent-credit-page">
    <Mh5SubPageHeader :title="pageTitle" />

    <div class="mh5-agent-credit-steps" aria-label="授信进度">
      <template v-for="(item, index) in AGENT_CREDIT_STEPS" :key="item.key">
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
          v-if="index < AGENT_CREDIT_STEPS.length - 1"
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
            />
            <span class="mh5-agent-credit-slider__thumb" :style="{ left: `${rebatePercent}%` }">
              {{ rebatePercent }}%
            </span>
          </div>
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
                    <span>{{ formatCreditPercent(row.share) }}</span>
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
                  <span class="mh5-agent-credit-table__limit">最高{{ formatCreditPercent(row.maxShare) }}</span>
                </div>
              </td>
              <td>
                <div class="mh5-agent-credit-table__cell">
                  <button
                    type="button"
                    class="mh5-agent-credit-table__value-btn"
                    @click="openEdit(row, 'rebate')"
                  >
                    <span>{{ formatCreditPercent(row.rebate) }}</span>
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
                  <span class="mh5-agent-credit-table__limit">最高{{ formatCreditPercent(row.maxRebate) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <main v-else class="mh5-agent-credit-success">
      <div class="mh5-agent-credit-success__hero">
        <div class="mh5-agent-credit-success__icon" aria-hidden="true">
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
        <h2 class="mh5-agent-credit-success__title">代理授信成功</h2>
      </div>

      <section class="mh5-agent-credit-info-card">
        <div class="mh5-agent-credit-info-card__row">
          <span class="mh5-agent-credit-info-card__label">后台地址</span>
          <p class="mh5-agent-credit-info-card__value">{{ successInfo.adminUrl }}</p>
        </div>
        <div class="mh5-agent-credit-info-card__row">
          <span class="mh5-agent-credit-info-card__label">账号</span>
          <p class="mh5-agent-credit-info-card__value">{{ successInfo.adminAccount }}</p>
        </div>
        <div class="mh5-agent-credit-info-card__row">
          <span class="mh5-agent-credit-info-card__label">密码</span>
          <p class="mh5-agent-credit-info-card__value">{{ successInfo.adminPassword }}</p>
        </div>
      </section>

      <button type="button" class="mh5-agent-credit-copy-btn" @click="copySuccessInfo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M6 16V6a2 2 0 0 1 2-2h10"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        复制信息
      </button>
      <p v-if="copyHint" class="mh5-agent-credit-copy-hint">{{ copyHint }}</p>
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
          继续授信
        </button>
      </template>
    </footer>

    <Teleport to="body">
      <div v-if="editVisible" class="mh5-agent-credit-edit-mask" @click.self="closeEdit">
        <div class="mh5-agent-credit-edit-panel" role="dialog" aria-modal="true" :aria-label="editTitle">
          <h3 class="mh5-agent-credit-edit-panel__title">{{ editTitle }}</h3>
          <p class="mh5-agent-credit-edit-panel__hint">最高 {{ formatCreditPercent(editMax) }}</p>
          <div class="mh5-agent-credit-edit-panel__field">
            <input
              v-model="editDraft"
              type="number"
              min="0"
              :max="editMax"
              step="0.1"
              class="mh5-agent-credit-edit-panel__input"
              inputmode="decimal"
            />
            <span>%</span>
          </div>
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
