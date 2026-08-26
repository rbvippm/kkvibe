<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileRoomBottomBar from '../../components/mobile/MobileRoomBottomBar.vue'
import MobileRoomGameCenter from '../../components/mobile/MobileRoomGameCenter.vue'
import MobileRoomShareSheet from '../../components/mobile/MobileRoomShareSheet.vue'
import Mh5LiveOnlineViewers from '../../components/mobile/Mh5LiveOnlineViewers.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  formatLivePreviewClock,
  formatLivePreviewStartAt,
  getDiscoverLiveCardById,
  isLivePreviewExpired,
  isLivePreviewLate,
  liveListRouteName,
  livePreviewRemainMs,
} from '../../constants/mobileDiscover'
import {
  LIVE_STREAM_ASSETS,
  buildLiveStreamRoom,
  type LiveShareActionKey,
} from '../../constants/mobileLiveStream'

const PREVIEW_SYSTEM_MSG = '主播尚未开播，开播后即可互动'

const route = useRoute()
const router = useRouter()
const nowMs = ref(Date.now())
const followed = ref(false)
const showShareSheet = ref(false)
const showGameCenter = ref(false)
const muted = ref(false)

let tick: number | undefined
let leaving = false

const card = computed(() => getDiscoverLiveCardById(String(route.query.id || '')))

const room = computed(() => {
  if (!card.value) return null
  return buildLiveStreamRoom({
    id: card.value.id,
    hostName: card.value.hostName,
    stage: card.value.cover,
    heat: card.value.heat,
    likeText: '预告中',
    roomTitle: card.value.roomTitle,
    videoRatio: '16:9',
    orientation: 'portrait',
    gifts: [],
    messages: [{ id: 'preview-sys', type: 'system', text: PREVIEW_SYSTEM_MSG }],
  })
})

const isLate = computed(() => {
  if (!card.value) return false
  return isLivePreviewLate(card.value, nowMs.value)
})

const countdown = computed(() => {
  if (!card.value) return '00:00:00'
  return formatLivePreviewClock(livePreviewRemainMs(card.value, nowMs.value))
})

const startLabel = computed(() => {
  if (!card.value?.startAt) return ''
  return formatLivePreviewStartAt(card.value.startAt)
})

const shareLink = computed(() => {
  if (!room.value) return ''
  return `https://kkvibe.app/live/${room.value.id}?host=${encodeURIComponent(room.value.hostName)}`
})

function goBack() {
  router.replace({ name: liveListRouteName(String(route.query.from || '')) })
}

function leaveIfExpired() {
  if (leaving) return
  if (!card.value || isLivePreviewExpired(card.value, nowMs.value)) {
    leaving = true
    goBack()
  }
}

onMounted(() => {
  leaveIfExpired()
  tick = window.setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (tick) window.clearInterval(tick)
})

watch(nowMs, () => {
  leaveIfExpired()
})

function toggleFollow() {
  followed.value = !followed.value
}

function openShareSheet() {
  showShareSheet.value = true
}

function closeShareSheet() {
  showShareSheet.value = false
}

async function shareToFriend(name: string) {
  closeShareSheet()
  await mh5Alert({
    title: `已分享给「${name}」`,
    message: '原型演示：会话消息已发送',
    showCancel: false,
  })
}

async function handleShareAction(key: LiveShareActionKey) {
  if (key === 'copy') {
    try {
      await navigator.clipboard.writeText(shareLink.value)
      closeShareSheet()
      await mh5Alert({
        title: '链接已复制',
        message: shareLink.value,
        showCancel: false,
      })
    } catch {
      closeShareSheet()
      await mh5Alert({
        title: '复制失败',
        message: '请手动长按复制链接',
        showCancel: false,
      })
    }
    return
  }

  if (key === 'mute') {
    muted.value = !muted.value
  }
}

async function handleForwarded(names: string[]) {
  await mh5Alert({
    title: '转发成功',
    message: `已转发至：${names.join('、')}`,
    showCancel: false,
  })
}
</script>

<template>
  <div v-if="card && room" class="mh5-livestream-page mh5-livestream-page--preview mh5-route-view">
    <div class="mh5-livestream-page__stage-frame mh5-livestream-page__stage-frame--16-9">
      <img class="mh5-livestream-page__stage mh5-live-preview-stage__img" :src="room.stage" :alt="room.hostName" />
      <div class="mh5-live-preview-stage">
        <h1 class="mh5-live-preview-title">{{ card.roomTitle }}</h1>
        <p class="mh5-live-preview-time">{{ startLabel }}</p>
        <template v-if="isLate">
          <p class="mh5-live-preview-late" aria-live="polite">{{ $t('主播迟到了～正在赶来') }}</p>
        </template>
        <template v-else>
          <p class="mh5-live-preview-label">{{ $t('距离开播还有') }}</p>
          <div class="mh5-live-preview-count" aria-live="polite">{{ countdown }}</div>
        </template>
      </div>
    </div>

    <MobileRoomGameCenter v-model:open="showGameCenter" />

    <header class="mh5-livestream-header">
      <div class="mh5-livestream-header__row">
        <div class="mh5-livestream-host">
          <img class="mh5-livestream-host__avatar" :src="room.avatar" alt="" />
          <div class="mh5-livestream-host__meta">
            <p class="mh5-livestream-host__name">{{ room.hostName }}</p>
            <p class="mh5-livestream-host__likes">{{ room.likeText }}</p>
          </div>
          <button
            type="button"
            class="mh5-livestream-host__follow"
            :class="{ 'mh5-livestream-host__follow--on': followed }"
            @click="toggleFollow"
          >
            {{ followed ? '已关注' : '关注' }}
          </button>
        </div>

        <div class="mh5-livestream-header__right">
          <Mh5LiveOnlineViewers :room-id="room.id" />
          <button type="button" class="mh5-livestream-close" :aria-label="$t('关闭')" @click="goBack">
            <img :src="LIVE_STREAM_ASSETS.close" alt="" width="24" height="24" />
          </button>
        </div>
      </div>

      <div class="mh5-livestream-heat-row">
        <div class="mh5-livestream-heat">
          <img :src="LIVE_STREAM_ASSETS.fire" alt="" width="24" height="24" />
          <span>{{ room.heat }}</span>
        </div>
      </div>
    </header>

    <div class="mh5-livestream-footer">
      <div class="mh5-livestream-side">
        <div class="mh5-livestream-chat">
          <div class="mh5-livestream-bubble mh5-livestream-bubble--system">
            {{ $t('主播尚未开播，开播后即可互动') }}
          </div>
        </div>
      </div>

      <MobileRoomBottomBar
        :input-label="$t('开播后即可发言')"
        input-with-emoji
        input-disabled
        @game="showGameCenter = true"
        @share="openShareSheet"
      />
    </div>

    <MobileRoomShareSheet
      v-model:open="showShareSheet"
      :muted="muted"
      @action="handleShareAction"
      @share-friend="shareToFriend"
      @forwarded="handleForwarded"
    />
  </div>
</template>
