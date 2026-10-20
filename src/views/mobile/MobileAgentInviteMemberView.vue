<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  DEFAULT_AGENT_CREDIT_MAX_COST,
  formatCreditPercent,
  isValidCostPercent,
  normalizeCostPercent,
} from '../../constants/agentCredit'
import {
  createBlankAgentShareRebateCategories,
  isProductShareCategory,
  type AgentProfitRatioCategory,
} from '../../constants/agentProfitRatio'
import Mh5AgentShareRebateList from '../../components/mobile/Mh5AgentShareRebateList.vue'
import {
  AGENT_INVITE_MEMBER_REBATE_STEPS,
  AGENT_INVITE_MEMBER_STEPS,
  createAgentMemberInvite,
  validateInviteMember,
  type AgentInviteValidationResult,
} from '../../constants/agentInvitation'
import { AGENT_TEAM_INVITE_EXISTING_SPEC } from '../../constants/agentTeamSpec'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import '../../styles/mobile-app-shell.css'

type InviteStep = 1 | 2 | 3
type EditField = 'cost'

const router = useRouter()
const { isRebateAgent, withAgentQuery } = useAgentIdentity()

const step = ref<InviteStep>(1)
const memberInput = ref('')
const validation = ref<AgentInviteValidationResult | null>(null)
const tip = ref('')

const sharePercent = ref(30)
const rebatePercent = ref(30)
const maxCost = DEFAULT_AGENT_CREDIT_MAX_COST
const costPercent = ref(Math.min(30, maxCost))
const categories = ref<AgentProfitRatioCategory[]>(createBlankAgentShareRebateCategories())

const editVisible = ref(false)
const editField = ref<EditField>('cost')
const editProductKey = ref('')
const editDraft = ref('')
const editError = ref('')

/** 返佣跳过收益比例 */
const isRebateInvite = computed(() => isRebateAgent.value)

const pageSteps = computed(() =>
  isRebateInvite.value ? AGENT_INVITE_MEMBER_REBATE_STEPS : AGENT_INVITE_MEMBER_STEPS,
)

const isInviteStep = computed(() => step.value === 1)
const isRatioStep = computed(() => !isRebateInvite.value && step.value === 2)
const isSuccessStep = computed(() =>
  isRebateInvite.value ? step.value === 2 : step.value === 3,
)

const pageTitle = computed(() =>
  isSuccessStep.value ? '邀请成功' : '邀请会员为下级代理',
)

const invitePrimaryLabel = computed(() =>
  isRebateInvite.value ? '确认邀请' : '下一步',
)

const invitedMember = computed(() => (validation.value?.ok ? validation.value.member : null))

const editMax = computed(() => maxCost)
const editTitle = computed(() => '编辑其他成本')
const editPercentKind = computed(() => 'share' as const)
const editInputMode = computed(() => 'numeric' as const)

watch(
  sharePercent,
  (value) => {
    const next = Math.round(Math.min(100, Math.max(0, value)))
    categories.value.forEach((category) => {
      if (isProductShareCategory(category)) {
        category.products.forEach((product) => {
          product.share = Math.min(next, product.maxShare ?? 0)
        })
        return
      }
      category.share = Math.min(next, category.maxShare)
    })
    costPercent.value = Math.min(next, maxCost)
  },
  { immediate: true },
)

watch(
  rebatePercent,
  (value) => {
    const next = Math.min(100, Math.max(0, Number(Number(value).toFixed(2))))
    categories.value.forEach((category) => {
      category.products.forEach((product) => {
        product.rebate = isProductShareCategory(category) ? 0 : Math.min(next, product.maxRebate)
      })
    })
  },
  { immediate: true },
)

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
  if (isRebateInvite.value) {
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
}

function goNextStep() {
  if (!validation.value?.ok) {
    verifyMember()
    return
  }
  if (isRebateInvite.value) {
    confirmInvite()
    return
  }
  step.value = 2
}

function confirmInvite() {
  if (!validation.value?.ok) return
  createAgentMemberInvite(validation.value.member)
  step.value = isRebateInvite.value ? 2 : 3
}

function goInviteRecords() {
  router.push({ name: 'mobile-agent-invite-records', query: withAgentQuery() })
}

function resetProfitRatio() {
  categories.value = createBlankAgentShareRebateCategories()
  sharePercent.value = 30
  rebatePercent.value = 30
  categories.value.forEach((category) => {
    if (isProductShareCategory(category)) {
      category.products.forEach((product) => {
        product.share = Math.min(30, product.maxShare ?? 0)
        product.rebate = 0
      })
      return
    }
    category.share = Math.min(30, category.maxShare)
    category.products.forEach((product) => {
      product.rebate = Math.min(30, product.maxRebate)
    })
  })
  costPercent.value = Math.min(30, maxCost)
}

function continueInvite() {
  step.value = 1
  memberInput.value = ''
  validation.value = null
  tip.value = ''
  resetProfitRatio()
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

  if (!isValidCostPercent(next)) {
    editError.value = '其他成本须为整数'
    return null
  }

  if (next > editMax.value) {
    editError.value = `不能超过最高 ${formatCreditPercent(editMax.value, editPercentKind.value)}`
    return null
  }

  editError.value = ''
  return next
}

function onEditDraftInput(event: Event) {
  const target = event.target as HTMLInputElement
  const raw = target.value

  const next = raw.replace(/[^\d]/g, '')
  editDraft.value = next
  if (target.value !== next) target.value = next

  validateEditDraft(false)
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

  costPercent.value = normalizeCostPercent(next)
  closeEdit()
}
</script>

<template>
  <div class="mh5-agent-credit-page">
    <Mh5SubPageHeader :title="pageTitle">
      <template v-if="isInviteStep" #right>
        <Mh5SpecAnnot :spec="AGENT_TEAM_INVITE_EXISTING_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-agent-credit-steps" aria-label="邀请进度">
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

    <main v-if="isInviteStep" class="mh5-agent-credit-main">
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
          <p class="agent-invite-member-card__desc">当前是直属会员或尚无上级，且不是代理身份</p>
        </div>
      </section>

      <section class="agent-invite-rule-card">
        <p class="agent-invite-rule-card__group">邀请频控</p>
        <ul class="agent-invite-rule-card__list">
          <li>24 小时内同代理仅可邀请同一会员 1 次</li>
          <li>同一会员最多保留 10 条待处理邀请</li>
          <li>邀请发出后 72 小时内有效</li>
        </ul>
        <p class="agent-invite-rule-card__group">邀请对象</p>
        <ul class="agent-invite-rule-card__list">
          <li>对方须为已注册会员，且金刚号真实有效</li>
          <li>对方渠道须与当前代理一致</li>
          <li>对方不能已是代理身份</li>
          <li>对方若已有上级，只能是当前代理的直属会员</li>
        </ul>
      </section>
    </main>

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

      <Mh5AgentShareRebateList :categories="categories" />
    </main>

    <main v-else-if="isSuccessStep" class="mh5-agent-credit-success">
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
      <template v-if="isInviteStep">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goPrevious">
          上一步
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          :disabled="!validation?.ok"
          @click="goNextStep"
        >
          {{ invitePrimaryLabel }}
        </button>
      </template>
      <template v-else-if="isRatioStep">
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
              placeholder="请输入整数"
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
