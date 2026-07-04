<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  DEFAULT_AGENT_CREDIT_PRODUCTS,
  formatCreditPercent,
  type AgentCreditProduct,
} from '../../constants/agentCredit'
import {
  AGENT_INVITE_MEMBER_STEPS,
  createAgentMemberInvite,
  validateInviteMember,
  type AgentInviteValidationResult,
} from '../../constants/agentInvitation'
import { AGENT_TEAM_INVITE_EXISTING_SPEC } from '../../constants/agentTeamSpec'
import '../../styles/mobile-app-shell.css'

type InviteStep = 1 | 2 | 3
type EditField = 'share' | 'rebate'

const router = useRouter()

const step = ref<InviteStep>(1)
const memberInput = ref('')
const validation = ref<AgentInviteValidationResult | null>(null)
const tip = ref('')

const sharePercent = ref(30)
const rebatePercent = ref(30)
const products = ref<AgentCreditProduct[]>(
  DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item })),
)

const editVisible = ref(false)
const editField = ref<EditField>('share')
const editProductKey = ref('')
const editDraft = ref('')

const pageTitle = computed(() => (step.value === 3 ? '邀请成功' : '邀请现有会员为下级'))

const invitedMember = computed(() => (validation.value?.ok ? validation.value.member : null))

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
  const current = step.value - 1
  if (index < current) return 'done'
  if (index === current) return 'active'
  return 'pending'
}

function isStepLineDone(index: number) {
  return step.value > index + 1
}

function verifyMember() {
  validation.value = validateInviteMember(memberInput.value)
  tip.value = validation.value.ok ? '会员符合邀请条件，请确认是否发送邀请' : validation.value.message
}

function goPrevious() {
  if (step.value === 3) {
    step.value = 2
    return
  }
  if (step.value === 2) {
    step.value = 1
    return
  }
  router.back()
}

function goNextStep() {
  if (!validation.value?.ok) {
    verifyMember()
    return
  }
  step.value = 2
}

function confirmInvite() {
  if (!validation.value?.ok) return
  createAgentMemberInvite(validation.value.member)
  step.value = 3
}

function goInviteRecords() {
  router.push({ name: 'mobile-agent-invite-records' })
}

function resetProfitRatio() {
  sharePercent.value = 30
  rebatePercent.value = 30
  products.value = DEFAULT_AGENT_CREDIT_PRODUCTS.map((item) => ({ ...item }))
}

function continueInvite() {
  step.value = 1
  memberInput.value = ''
  validation.value = null
  tip.value = ''
  resetProfitRatio()
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
    <Mh5SubPageHeader :title="pageTitle">
      <template v-if="step === 1" #right>
        <Mh5SpecAnnot :spec="AGENT_TEAM_INVITE_EXISTING_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-agent-credit-steps" aria-label="邀请进度">
      <template v-for="(item, index) in AGENT_INVITE_MEMBER_STEPS" :key="item.key">
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
          v-if="index < AGENT_INVITE_MEMBER_STEPS.length - 1"
          class="mh5-agent-credit-steps__line"
          :class="{ 'mh5-agent-credit-steps__line--done': isStepLineDone(index) }"
          aria-hidden="true"
        />
      </template>
    </div>

    <main v-if="step === 1" class="mh5-agent-credit-main">
      <section class="agent-invite-page-card">
        <label class="agent-invite-form__label" for="invite-member-id">金刚号</label>
        <div class="agent-invite-form__search">
          <input
            id="invite-member-id"
            v-model="memberInput"
            type="text"
            class="agent-invite-form__input"
            placeholder="请输入对方金刚号"
          />
          <button type="button" class="agent-invite-form__verify" @click="verifyMember">搜索/验证</button>
        </div>
        <p
          v-if="tip"
          class="agent-invite-form__tip"
          :class="{ 'agent-invite-form__tip--error': validation && !validation.ok }"
        >
          {{ tip }}
        </p>
      </section>

      <section v-if="validation?.ok" class="agent-invite-member-card">
        <div class="agent-invite-member-card__avatar">{{ validation.member.avatar }}</div>
        <div class="agent-invite-member-card__main">
          <p class="agent-invite-member-card__label">待邀请会员</p>
          <p class="agent-invite-member-card__account">昵称：{{ validation.member.nickname }}</p>
          <p class="agent-invite-member-card__account">金刚号：{{ validation.member.account }}</p>
          <p class="agent-invite-member-card__desc">当前无上级代理，且不是代理身份</p>
        </div>
      </section>

      <section class="agent-invite-rule-card">
        <strong>风控规则</strong>
        <span>24 小时内同代理仅可邀请 1 次；同一会员最多保留 10 条待处理邀请；邀请 72 小时内有效。</span>
      </section>
    </main>

    <main v-else-if="step === 2" class="mh5-agent-credit-main">
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
        <h2 class="mh5-agent-credit-success__title">邀请已发送</h2>
        <p class="agent-invite-success__sub">等待对方确认，有效期 72 小时</p>
      </div>

      <section v-if="invitedMember" class="mh5-agent-credit-info-card">
        <div class="mh5-agent-credit-info-card__row">
          <span class="mh5-agent-credit-info-card__label">被邀请人昵称</span>
          <p class="mh5-agent-credit-info-card__value">{{ invitedMember.nickname }}</p>
        </div>
        <div class="mh5-agent-credit-info-card__row">
          <span class="mh5-agent-credit-info-card__label">金刚号</span>
          <p class="mh5-agent-credit-info-card__value">{{ invitedMember.account }}</p>
        </div>
        <div class="mh5-agent-credit-info-card__row">
          <span class="mh5-agent-credit-info-card__label">当前状态</span>
          <p class="mh5-agent-credit-info-card__value">待确认</p>
        </div>
      </section>
    </main>

    <footer class="mh5-agent-credit-footer safe-pb">
      <template v-if="step === 1">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          :disabled="!validation?.ok"
          @click="goNextStep"
        >
          下一步
        </button>
      </template>
      <template v-else-if="step === 2">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="confirmInvite"
        >
          确认邀请
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost"
          @click="goInviteRecords"
        >
          查看邀请记录
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="continueInvite"
        >
          继续邀请
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
