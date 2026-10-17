<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5AgentCreateIdentityField from '../../components/mobile/Mh5AgentCreateIdentityField.vue'
import Mh5MemberRebateEditor from '../../components/mobile/Mh5MemberRebateEditor.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import {
  AGENT_CREATE_MEMBER_DEFAULTS,
  AGENT_CREATE_MEMBER_KINGKONG_URL,
  AGENT_CREATE_MEMBER_REBATE_STEPS,
  AGENT_CREATE_MEMBER_SHARE_STEPS,
} from '../../constants/agentCreateMember'
import {
  AGENT_CREATE_PASSWORD_HINT,
  formatCreateIdentityAccount,
  validateCreateIdentity,
  validateCreatePassword,
  type AgentCreateIdentityMethod,
} from '../../constants/agentCreateIdentity'
import { AGENT_CREATE_MEMBER_SPEC } from '../../constants/agentCreateMemberSpec'
import { addTeamDirectMember } from '../../constants/agentTeam'
import {
  createBlankMemberRebateCategories,
  saveMemberRebateCategories,
  type MemberRebateCategory,
} from '../../constants/memberRebateRatio'
import '../../styles/mobile-app-shell.css'

type CreateMemberStep = 'account' | 'rebate' | 'success'

const router = useRouter()
const { isShareAgent, withAgentQuery } = useAgentIdentity()

const steps = computed(() =>
  isShareAgent.value ? AGENT_CREATE_MEMBER_SHARE_STEPS : AGENT_CREATE_MEMBER_REBATE_STEPS,
)

const step = ref<CreateMemberStep>('account')
const loginMethod = ref<AgentCreateIdentityMethod>('account')
const loginAccount = ref('')
const loginPhone = ref('')
const loginEmail = ref('')
const dialCode = ref<string>(AGENT_CREATE_MEMBER_DEFAULTS.dialCode)
const password = ref(AGENT_CREATE_MEMBER_DEFAULTS.password)
const confirmPassword = ref(AGENT_CREATE_MEMBER_DEFAULTS.confirmPassword)
const remark = ref(AGENT_CREATE_MEMBER_DEFAULTS.remark)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const createdAccountDisplay = ref('')
const createdPassword = ref('')
const rebateCategories = ref<MemberRebateCategory[]>(createBlankMemberRebateCategories())
const rebateEditor = ref<{ firstError: () => string } | null>(null)

const isAccountStep = computed(() => step.value === 'account')
const isRebateStep = computed(() => step.value === 'rebate')
const isSuccessStep = computed(() => step.value === 'success')
const pageTitle = computed(() => (isSuccessStep.value ? '创建成功' : '创建会员账户'))

function currentLoginAccount() {
  return formatCreateIdentityAccount({
    method: loginMethod.value,
    account: loginAccount.value,
    phone: loginPhone.value,
    email: loginEmail.value,
    dialCode: dialCode.value,
  })
}

function stepIndex() {
  return steps.value.findIndex((item) => item.key === step.value)
}

function stepStatus(index: number): 'active' | 'done' | 'pending' {
  const current = stepIndex()
  if (index < current) return 'done'
  if (index === current) return 'active'
  return 'pending'
}

function isStepLineDone(index: number) {
  return stepIndex() > index
}

function goBack() {
  if (step.value === 'success') {
    step.value = isShareAgent.value ? 'rebate' : 'account'
    return
  }
  if (step.value === 'rebate') {
    step.value = 'account'
    return
  }
  router.back()
}

function resetForm() {
  loginMethod.value = 'account'
  loginAccount.value = ''
  loginPhone.value = ''
  loginEmail.value = ''
  dialCode.value = AGENT_CREATE_MEMBER_DEFAULTS.dialCode
  password.value = ''
  confirmPassword.value = ''
  remark.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  createdAccountDisplay.value = ''
  createdPassword.value = ''
  rebateCategories.value = createBlankMemberRebateCategories()
}

async function validateAccount() {
  const identityError = validateCreateIdentity({
    method: loginMethod.value,
    account: loginAccount.value,
    phone: loginPhone.value,
    email: loginEmail.value,
  })
  if (identityError) {
    await mh5Alert(identityError)
    return false
  }
  const passwordError = validateCreatePassword(password.value)
  if (passwordError) {
    await mh5Alert(passwordError)
    return false
  }
  if (!confirmPassword.value) {
    await mh5Alert('请填写确认密码')
    return false
  }
  if (password.value !== confirmPassword.value) {
    await mh5Alert('两次密码不一致')
    return false
  }
  return true
}

function finishCreate() {
  const display = currentLoginAccount()
  createdAccountDisplay.value = display
  createdPassword.value = password.value

  const suffix = String(Date.now()).slice(-4)
  addTeamDirectMember({
    id: `create_member_${suffix}`,
    nickname: display,
    kind: 'member',
    avatarEmoji: '👩🏻',
    subordinateCount: 0,
    online: true,
  })

  step.value = 'success'
}

async function submitAccount() {
  if (!(await validateAccount())) return
  if (isShareAgent.value) {
    step.value = 'rebate'
    return
  }
  finishCreate()
}

async function submitRebate() {
  const message = rebateEditor.value?.firstError() ?? ''
  if (message) {
    await mh5Alert(message)
    return
  }
  saveMemberRebateCategories('cash', rebateCategories.value)
  finishCreate()
}

async function copyInfo() {
  const text = [
    `金刚地址：${AGENT_CREATE_MEMBER_KINGKONG_URL}`,
    `账号：${createdAccountDisplay.value}`,
    `密码：${createdPassword.value}`,
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    await mh5Alert('已复制')
  } catch {
    await mh5Alert('复制失败，请手动复制')
  }
}

function backToAgentCenter() {
  router.push({ name: 'mobile-agent', query: withAgentQuery() })
}

function continueCreate() {
  resetForm()
  step.value = 'account'
}
</script>

<template>
  <div class="mh5-agent-credit-page mh5-agent-create-member-page">
    <Mh5SubPageHeader :title="pageTitle" :on-back="goBack">
      <template #right>
        <Mh5SpecAnnot :spec="AGENT_CREATE_MEMBER_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-agent-credit-steps" aria-label="创建进度">
      <template v-for="(item, index) in steps" :key="item.key">
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
          v-if="index < steps.length - 1"
          class="mh5-agent-credit-steps__line"
          :class="{ 'mh5-agent-credit-steps__line--done': isStepLineDone(index) }"
          aria-hidden="true"
        />
      </template>
    </div>

    <main v-if="isAccountStep" class="mh5-agent-credit-main mh5-agent-create-account">
      <Mh5AgentCreateIdentityField
        v-model:method="loginMethod"
        v-model:account="loginAccount"
        v-model:phone="loginPhone"
        v-model:email="loginEmail"
        v-model:dial-code="dialCode"
      />

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
        <p class="mh5-agent-create-identity__hint">{{ AGENT_CREATE_PASSWORD_HINT }}</p>
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

    <main v-else-if="isRebateStep" class="mh5-agent-credit-main">
      <Mh5MemberRebateEditor ref="rebateEditor" :categories="rebateCategories" />
    </main>

    <main v-else class="mh5-agent-create-member-success">
      <div class="mh5-agent-create-member-success__hero">
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
        <h2 class="mh5-agent-create-member-success__title">创建会员成功</h2>
      </div>

      <div class="mh5-agent-create-member-success__card">
        <div class="mh5-agent-create-member-success__row">
          <p class="mh5-agent-create-member-success__label">金刚地址</p>
          <p class="mh5-agent-create-member-success__value">{{ AGENT_CREATE_MEMBER_KINGKONG_URL }}</p>
        </div>
        <div class="mh5-agent-create-member-success__row">
          <p class="mh5-agent-create-member-success__label">账号</p>
          <p class="mh5-agent-create-member-success__value">{{ createdAccountDisplay }}</p>
        </div>
        <div class="mh5-agent-create-member-success__row">
          <p class="mh5-agent-create-member-success__label">密码</p>
          <p class="mh5-agent-create-member-success__value">{{ createdPassword }}</p>
        </div>
      </div>

      <button type="button" class="mh5-agent-create-member-success__copy" @click="copyInfo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        复制信息
      </button>
    </main>

    <footer
      class="mh5-agent-credit-footer safe-pb"
      :class="{ 'mh5-agent-credit-footer--single': isAccountStep }"
    >
      <template v-if="isAccountStep">
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="submitAccount"
        >
          {{ isShareAgent ? '下一步' : '创建' }}
        </button>
      </template>
      <template v-else-if="isRebateStep">
        <button type="button" class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--ghost" @click="goBack">
          上一步
        </button>
        <button
          type="button"
          class="mh5-agent-credit-footer__btn mh5-agent-credit-footer__btn--primary"
          @click="submitRebate"
        >
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
          @click="continueCreate"
        >
          继续创建
        </button>
      </template>
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
