<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import {
  AGENT_CREATE_MEMBER_DEFAULTS,
  AGENT_CREATE_MEMBER_DIAL_CODES,
  AGENT_CREATE_MEMBER_KINGKONG_URL,
  AGENT_CREATE_MEMBER_REBATE_STEPS,
} from '../../constants/agentCreateMember'
import { AGENT_CREATE_MEMBER_SPEC } from '../../constants/agentCreateMemberSpec'
import { addTeamDirectMember } from '../../constants/agentTeam'
import '../../styles/mobile-app-shell.css'

type CreateMemberStep = 1 | 2

const router = useRouter()
const { withAgentQuery } = useAgentIdentity()

const step = ref<CreateMemberStep>(1)
const dialCode = ref<string>(AGENT_CREATE_MEMBER_DEFAULTS.dialCode)
const memberAccount = ref(AGENT_CREATE_MEMBER_DEFAULTS.memberAccount)
const password = ref(AGENT_CREATE_MEMBER_DEFAULTS.password)
const confirmPassword = ref(AGENT_CREATE_MEMBER_DEFAULTS.confirmPassword)
const remark = ref(AGENT_CREATE_MEMBER_DEFAULTS.remark)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const dialPickerOpen = ref(false)

const createdAccountDisplay = ref('')
const createdPassword = ref('')

const isAccountStep = computed(() => step.value === 1)
const isSuccessStep = computed(() => step.value === 2)
const pageTitle = computed(() => (isSuccessStep.value ? '创建成功' : '创建会员账户'))

const fullAccount = computed(() => {
  const account = memberAccount.value.trim()
  if (!account) return ''
  return `${dialCode.value} ${account}`
})

function stepStatus(index: number): 'active' | 'done' | 'pending' {
  if (step.value > index + 1) return 'done'
  if (step.value === index + 1) return 'active'
  return 'pending'
}

function isStepLineDone(index: number) {
  return step.value > index + 1
}

function goBack() {
  if (step.value === 2) {
    step.value = 1
    return
  }
  router.back()
}

function pickDialCode(code: string) {
  dialCode.value = code
  dialPickerOpen.value = false
}

function resetForm() {
  dialCode.value = AGENT_CREATE_MEMBER_DEFAULTS.dialCode
  memberAccount.value = ''
  password.value = ''
  confirmPassword.value = ''
  remark.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  dialPickerOpen.value = false
  createdAccountDisplay.value = ''
  createdPassword.value = ''
}

async function submitCreate() {
  if (!memberAccount.value.trim()) {
    await mh5Alert('请填写会员账号')
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

  const display = fullAccount.value
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

  step.value = 2
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
  step.value = 1
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
      <template v-for="(item, index) in AGENT_CREATE_MEMBER_REBATE_STEPS" :key="item.key">
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
          v-if="index < AGENT_CREATE_MEMBER_REBATE_STEPS.length - 1"
          class="mh5-agent-credit-steps__line"
          :class="{ 'mh5-agent-credit-steps__line--done': isStepLineDone(index) }"
          aria-hidden="true"
        />
      </template>
    </div>

    <main v-if="isAccountStep" class="mh5-agent-credit-main mh5-agent-create-account">
      <div class="mh5-agent-create-field">
        <span class="mh5-agent-create-field__label">会员账号</span>
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
            v-model="memberAccount"
            class="mh5-agent-create-field__input mh5-agent-create-field__input--combo"
            type="text"
            inputmode="tel"
            placeholder="请输入会员账号"
            autocomplete="username"
          />
        </div>
        <div v-if="dialPickerOpen" class="mh5-agent-create-dial-list" role="listbox" aria-label="区号">
          <button
            v-for="code in AGENT_CREATE_MEMBER_DIAL_CODES"
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
          @click="submitCreate"
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
