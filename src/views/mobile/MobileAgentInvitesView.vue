<script setup lang="ts">
import { computed, ref } from 'vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { mh5Confirm } from '../../composables/useMh5Confirm'
import {
  AGENT_INVITE_STATUS_LABEL,
  acceptMemberAgentInvite,
  memberAgentInvites,
  agentInviteStatusClass,
  type MemberAgentInvite,
} from '../../constants/agentInvitation'
import { MEMBER_AGENT_INVITES_SPEC } from '../../constants/agentTeamSpec'
import '../../styles/mobile-app-shell.css'

const successAgentName = ref('')

const pendingCount = computed(() => memberAgentInvites.value.filter((item) => item.status === 'pending').length)

async function rejectInvite(invite: MemberAgentInvite) {
  if (invite.status !== 'pending') return
  const confirmed = await mh5Confirm({
    title: '是否拒绝该代理的邀请？',
    message: invite.agentName,
  })
  if (!confirmed) return
  memberAgentInvites.value = memberAgentInvites.value.map((item) =>
    item.id === invite.id ? { ...item, status: 'rejected' } : item,
  )
}

async function acceptInvite(invite: MemberAgentInvite) {
  if (invite.status !== 'pending') return
  const confirmed = await mh5Confirm({
    title: '同意后您将成为该代理的下级',
    message: '确认操作？',
  })
  if (!confirmed) return

  acceptMemberAgentInvite(invite.id)
  successAgentName.value = invite.agentName
}
</script>

<template>
  <div class="agent-invite-page">
    <Mh5SubPageHeader :title="$t('代理邀请')">
      <template #right>
        <Mh5SpecAnnot :spec="MEMBER_AGENT_INVITES_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="agent-invite-page__main">
      <section class="agent-invite-page__summary">
        <div>
          <p class="agent-invite-page__eyebrow">待处理邀请</p>
          <h2>{{ pendingCount }} 条</h2>
        </div>
        <p>邀请 72 小时内有效，同意后将自动失效其他待处理邀请。</p>
      </section>

      <section class="agent-invite-page__list" aria-label="代理邀请列表">
        <article
          v-for="invite in memberAgentInvites"
          :key="invite.id"
          class="agent-invite-card"
          :class="{
            'agent-invite-card--muted': invite.status === 'invalid' || invite.status === 'expired',
          }"
        >
          <div class="agent-invite-card__head">
            <div class="agent-invite-card__avatar">{{ invite.agentAvatar }}</div>
            <div class="agent-invite-card__body">
              <h3>{{ invite.agentName }}</h3>
              <p>金刚号：{{ invite.agentAccountId }}</p>
            </div>
            <span class="agent-invite-status" :class="agentInviteStatusClass(invite.status)">
              {{ AGENT_INVITE_STATUS_LABEL[invite.status] }}
            </span>
          </div>

          <div class="agent-invite-card__meta">
            <span v-if="invite.status === 'pending'">剩余 {{ invite.remainHours }} 小时</span>
            <span v-else-if="invite.status === 'invalid'">因已同意其他代理邀请而失效</span>
            <span v-else>{{ AGENT_INVITE_STATUS_LABEL[invite.status] }}</span>
            <span class="agent-invite-card__time">{{ invite.invitedAt }}</span>
          </div>

          <div v-if="invite.status === 'pending'" class="agent-invite-card__actions">
            <button type="button" class="agent-invite-card__btn agent-invite-card__btn--ghost" @click="rejectInvite(invite)">
              拒绝
            </button>
            <button type="button" class="agent-invite-card__btn agent-invite-card__btn--primary" @click="acceptInvite(invite)">
              同意
            </button>
          </div>
        </article>
      </section>
    </main>

    <Transition name="agent-invite-success">
      <div v-if="successAgentName" class="agent-invite-success-mask" @click.self="successAgentName = ''">
        <div class="agent-invite-success" role="dialog" aria-modal="true" aria-labelledby="agent-invite-success-title">
          <div class="agent-invite-success__icon" aria-hidden="true">✓</div>
          <h2 id="agent-invite-success-title">加入成功</h2>
          <p>您已成功加入「{{ successAgentName }}」团队，代理中心相关功能已解锁。</p>
          <button type="button" @click="successAgentName = ''">我知道了</button>
        </div>
      </div>
    </Transition>
  </div>
</template>
