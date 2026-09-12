<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileRoomGameCenter from '../../components/mobile/MobileRoomGameCenter.vue'
import Mh5LiveOnlineViewers from '../../components/mobile/Mh5LiveOnlineViewers.vue'
import Mh5LiveMoreEntry from '../../components/mobile/Mh5LiveMoreEntry.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { findGoLiveSchedule } from '../../constants/goLive'
import { LIVE_ROOM_METRICS_SPEC } from '../../constants/liveRoomMetricsSpec'
import {
  formatLivePreviewClock,
  formatLivePreviewStartAt,
  getDiscoverLiveCardById,
  isDiscoverPreviewReserved,
  isLivePreviewCountdownOn,
  isLivePreviewExpired,
  isLivePreviewLate,
  liveListRouteName,
  livePreviewRemainMs,
  previewSubscriberCount,
  toggleDiscoverPreviewReserve,
} from '../../constants/mobileDiscover'
import { LIVE_STREAM_ASSETS, buildLiveStreamRoom } from '../../constants/mobileLiveStream'

const PREVIEW_SYSTEM_MSG = '主播尚未开播，开播后即可互动'

const route = useRoute()
const router = useRouter()
const nowMs = ref(Date.now())
const followed = ref(false)
const showGameCenter = ref(false)
const toast = ref('')
const reservedTick = ref(0)

let tick: number | undefined
let leaving = false

const card = computed(() => getDiscoverLiveCardById(String(route.query.id || '')))

const hostLive = computed(() => {
  if (!card.value) return false
  const schedule = findGoLiveSchedule(card.value.id)
  return schedule?.status === 'live' || card.value.status === 'live'
})

const room = computed(() => {
  if (!card.value) return null
  return buildLiveStreamRoom({
    id: card.value.id,
    hostName: card.value.hostName,
    stage: card.value.cover,
    heat: card.value.heat,
    likeText: hostLive.value ? '直播中' : '预告中',
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

const showCountdown = computed(() => {
  if (!card.value || hostLive.value || isLate.value) return false
  return isLivePreviewCountdownOn(card.value, nowMs.value)
})

const startLabel = computed(() => {
  if (!card.value?.startAt) return ''
  return formatLivePreviewStartAt(card.value.startAt)
})

const reserved = computed(() => {
  reservedTick.value
  return card.value ? isDiscoverPreviewReserved(card.value.id) : false
})

const reserveCount = computed(() => {
  reservedTick.value
  nowMs.value
  return card.value ? previewSubscriberCount(card.value) : 0
})

function showToast(message: string) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1800)
}

function goBack() {
  router.replace({ name: liveListRouteName(String(route.query.from || '')) })
}

function leaveIfExpired() {
  if (leaving || hostLive.value) return
  if (!card.value || isLivePreviewExpired(card.value, nowMs.value)) {
    leaving = true
    showToast('预告已取消')
    goBack()
  }
}

function syncHostScheduleState() {
  if (hostLive.value) return
  leaveIfExpired()
}

function toggleReserve() {
  if (!card.value) return
  const result = toggleDiscoverPreviewReserve(card.value.id)
  reservedTick.value += 1
  if (result === 'reserved') showToast('预约成功')
  else if (result === 'cancelled') showToast('已取消预约')
  else showToast('本场预告已失效')
}

onMounted(() => {
  syncHostScheduleState()
  tick = window.setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (tick) window.clearInterval(tick)
})

watch([nowMs, card], () => {
  syncHostScheduleState()
})

function toggleFollow() {
  followed.value = !followed.value
}
</script>

<template>
  <div v-if="card && room" class="mh5-livestream-page mh5-livestream-page--preview mh5-route-view">
    <div class="mh5-livestream-page__stage-frame mh5-livestream-page__stage-frame--16-9">
      <img class="mh5-livestream-page__stage mh5-live-preview-stage__img" :src="room.stage" :alt="room.hostName" />
      <div class="mh5-live-preview-stage">
        <h1 class="mh5-live-preview-title">{{ card.roomTitle }}</h1>
        <p class="mh5-live-preview-time">{{ startLabel }}</p>
        <template v-if="hostLive">
          <p class="mh5-live-preview-late" aria-live="polite">{{ $t('主播已开播') }}</p>
        </template>
        <template v-else-if="isLate">
          <p class="mh5-live-preview-late" aria-live="polite">{{ $t('主播迟到了～正在赶来') }}</p>
        </template>
        <template v-else-if="showCountdown">
          <p class="mh5-live-preview-label">{{ $t('距离开播还有') }}</p>
          <div class="mh5-live-preview-count" aria-live="polite">{{ countdown }}</div>
        </template>
        <div class="mh5-live-preview-actions">
          <p class="mh5-live-preview-subs">{{ reserveCount }}{{ $t('人已预约') }}</p>
          <button
            v-if="!hostLive"
            type="button"
            class="mh5-live-preview-reserve"
            :class="{ 'is-on': reserved }"
            @click="toggleReserve"
          >
            {{ reserved ? $t('已预约') : $t('预约直播') }}
          </button>
        </div>
      </div>
    </div>

    <MobileRoomGameCenter v-model:open="showGameCenter" :show-last-game="false" />

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
          <Mh5SpecAnnot :spec="LIVE_ROOM_METRICS_SPEC" placement="bottom" />
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
        <Mh5LiveMoreEntry />
      </div>
    </header>

    <div class="mh5-livestream-footer mh5-live-preview-footer">
      <div class="mh5-live-preview-hold" role="status">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.4" />
          <path d="M8 4.6v.2M8 7v4.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span>{{ hostLive ? $t('主播已开播') : $t('主播尚未开播，开播后即可互动') }}</span>
      </div>
    </div>
    <p v-if="toast" class="mh5-golive-toast" role="status">{{ toast }}</p>
  </div>
</template>
