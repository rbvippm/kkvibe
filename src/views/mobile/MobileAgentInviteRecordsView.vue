<script setup lang="ts">
import { computed } from 'vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import {
  AGENT_INVITE_STATUS_LABEL,
  agentSentInvites,
  agentInviteStatusClass,
  inviteRecordDisplayNickname,
} from '../../constants/agentInvitation'
import { AGENT_TEAM_INVITE_RECORDS_SPEC } from '../../constants/agentTeamSpec'
import '../../styles/mobile-app-shell.css'

const pendingCount = computed(
  () => agentSentInvites.value.filter((item) => item.status === 'pending').length,
)
</script>

<template>
  <div class="agent-invite-records-page">
    <Mh5SubPageHeader title="我的邀请记录">
      <template #right>
        <Mh5SpecAnnot :spec="AGENT_TEAM_INVITE_RECORDS_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="agent-invite-records-page__main">
      <section class="agent-invite-records-page__summary">
        <div>
          <p class="agent-invite-records-page__eyebrow">待确认邀请</p>
          <h2>{{ pendingCount }} 条</h2>
        </div>
        <p>邀请 72 小时内有效，对方同意后将自动建立上下级关系。</p>
      </section>

      <section v-if="agentSentInvites.length" class="agent-invite-records-page__list" aria-label="邀请记录列表">
        <article v-for="record in agentSentInvites" :key="record.id" class="agent-invite-record agent-invite-record--page">
          <div class="agent-invite-record__head">
            <div class="agent-invite-record__main">
              <p class="agent-invite-record__meta">昵称：{{ inviteRecordDisplayNickname(record) }}</p>
              <p class="agent-invite-record__meta">金刚号：{{ record.memberAccount }}</p>
              <p class="agent-invite-record__time">{{ record.invitedAt }}</p>
            </div>
            <div class="agent-invite-record__aside">
              <span class="agent-invite-status" :class="agentInviteStatusClass(record.status)">
                {{ AGENT_INVITE_STATUS_LABEL[record.status] }}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section v-else class="agent-invite-records-page__empty">
        <p>暂无邀请记录</p>
        <span>发起邀请后，记录会显示在这里</span>
      </section>
    </main>
  </div>
</template>
