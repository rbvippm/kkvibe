<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  AGENT_INVITE_MEMBER_STEPS,
  createAgentMemberInvite,
  validateInviteMember,
  type AgentInviteValidationResult,
} from '../../constants/agentInvitation'
import { AGENT_TEAM_INVITE_EXISTING_SPEC } from '../../constants/agentTeamSpec'
import '../../styles/mobile-app-shell.css'

type InviteStep = 1 | 2

const router = useRouter()

const step = ref<InviteStep>(1)
const memberInput = ref('')
const validation = ref<AgentInviteValidationResult | null>(null)
const tip = ref('')

const pageTitle = computed(() => (step.value === 2 ? '邀请成功' : '邀请现有会员为下级'))

const invitedMember = computed(() => (validation.value?.ok ? validation.value.member : null))

function stepStatus(index: number) {
  if (step.value === 2) return 'done'
  return index === 0 ? 'active' : 'pending'
}

function verifyMember() {
  validation.value = validateInviteMember(memberInput.value)
  tip.value = validation.value.ok ? '会员符合邀请条件，请确认是否发送邀请' : validation.value.message
}

function goPrevious() {
  if (step.value === 2) {
    step.value = 1
    return
  }
  router.back()
}

function confirmInvite() {
  if (!validation.value?.ok) {
    verifyMember()
    return
  }

  const member = validation.value.member
  createAgentMemberInvite(member)

  step.value = 2
}

function goInviteRecords() {
  router.push({ name: 'mobile-agent-invite-records' })
}

function continueInvite() {
  step.value = 1
  memberInput.value = ''
  validation.value = null
  tip.value = ''
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
          :class="{ 'mh5-agent-credit-steps__line--done': step === 2 }"
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
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
