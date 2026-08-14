<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MicControlStatesView from '../MicControlStatesView.vue'
import VoiceRoomAppJoinMicView from '../VoiceRoomAppJoinMicView.vue'
import LiveStartNoticeDemoView from './LiveStartNoticeDemoView.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

type LiveSubTab = 'lobby' | 'mic' | 'join' | 'notice'

const router = useRouter()
const activeSubTab = ref<LiveSubTab>('lobby')

const subTabs: { key: LiveSubTab; label: string }[] = [
  { key: 'lobby', label: '语聊大厅' },
  { key: 'mic', label: '麦控' },
  { key: 'join', label: 'App上麦' },
  { key: 'notice', label: '通知' },
]

type LobbyRoom = {
  id: string
  title: string
  subtitle?: string
  memberCount: number
  avatars: string[]
}

const lobbyRooms = ref<LobbyRoom[]>([
  { id: 'r1', title: '南宁商学会', subtitle: '共叙未来', memberCount: 9, avatars: ['林', '周', '黄'] },
  { id: 'r2', title: '南宁商学会', subtitle: '共叙未来', memberCount: 3, avatars: ['陈', '李'] },
  { id: 'r3', title: '南宁商学会', subtitle: '共叙未来', memberCount: 6, avatars: ['王', '赵', '吴'] },
  { id: 'r4', title: '深夜聊天局', subtitle: '进来唠两句', memberCount: 12, avatars: ['旋', '南', 'E'] },
  { id: 'r5', title: '周末开黑语聊', subtitle: '大神带飞', memberCount: 8, avatars: ['凯', '鹿', '北'] },
  { id: 'r6', title: '下班放松电台', subtitle: '治愈系', memberCount: 5, avatars: ['风', '椰'] },
])

function enterRoom(room: LobbyRoom) {
  router.push({ name: 'mobile-live-room', query: { from: room.id } })
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <Mh5SubPageHeader :title="$t('语聊直播')" />
    <div class="mh5-sub-tabs" role="tablist" :aria-label="$t('直播二级导航')">
      <button
        v-for="tab in subTabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': activeSubTab === tab.key }"
        :aria-selected="activeSubTab === tab.key"
        @click="activeSubTab = tab.key"
      >
        {{ $t(tab.label) }}
      </button>
      <button type="button" class="mh5-sub-tabs__menu" :aria-label="$t('更多')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
          <rect x="2" y="4" width="14" height="1.5" rx="0.5" />
          <rect x="2" y="8.25" width="14" height="1.5" rx="0.5" />
          <rect x="2" y="12.5" width="14" height="1.5" rx="0.5" />
        </svg>
      </button>
    </div>

    <div class="mh5-sub-content">
      <!-- 语聊大厅 -->
      <template v-if="activeSubTab === 'lobby'">
        <div class="mh5-lobby-grid">
          <article v-for="room in lobbyRooms" :key="room.id" class="mh5-lobby-card">
            <div class="mh5-lobby-card__bg" aria-hidden="true" />
            <h3 class="mh5-lobby-card__title">{{ $t(room.title) }}</h3>
            <p v-if="room.subtitle" class="mh5-lobby-card__subtitle">{{ room.subtitle }}</p>
            <div class="mh5-lobby-card__footer">
              <div class="mh5-lobby-card__avatars">
                <span
                  v-for="(av, i) in room.avatars.slice(0, 3)"
                  :key="i"
                  class="mh5-lobby-card__avatar"
                >
                  {{ av }}
                </span>
                <span class="mh5-lobby-card__count">{{ room.memberCount }}</span>
              </div>
              <button type="button" class="mh5-lobby-card__join" @click="enterRoom(room)">{{ $t('加入') }}</button>
            </div>
          </article>
        </div>
        <p class="mh5-lobby-end">{{ $t('没有更多数据了') }}</p>
      </template>

      <!-- 麦控演示 -->
      <MicControlStatesView v-else-if="activeSubTab === 'mic'" embedded />

      <!-- App 上麦 -->
      <VoiceRoomAppJoinMicView v-else-if="activeSubTab === 'join'" embedded />

      <!-- 开播通知 -->
      <LiveStartNoticeDemoView v-else embedded />
    </div>
  </div>
</template>
