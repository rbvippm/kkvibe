<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import MobileRoomBottomBar from '../../components/mobile/MobileRoomBottomBar.vue'
import MobileRoomGameCenter from '../../components/mobile/MobileRoomGameCenter.vue'
import MobileRoomShareSheet from '../../components/mobile/MobileRoomShareSheet.vue'
import Mh5LiveOnlineViewers from '../../components/mobile/Mh5LiveOnlineViewers.vue'
import Mh5LiveMoreEntry from '../../components/mobile/Mh5LiveMoreEntry.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { LIVE_ROOM_METRICS_SPEC } from '../../constants/liveRoomMetricsSpec'
import { sendLiveRoomToChats, type LiveShareTarget } from '../../constants/liveShareChat'
import { useLivePip } from '../../composables/useLivePip'
import { buildLivePipSession } from '../../constants/livePip'
import { liveListRouteName } from '../../constants/mobileDiscover'
import { LIVE_SHARE_SPEC } from '../../constants/liveShareSpec'
import {
  LIVE_STREAM_ASSETS,
  LIVE_STREAM_QUALITY_LABEL,
  LIVE_STREAM_QUALITY_OPTIONS,
  buildLiveStreamRoom,
  type LiveShareActionKey,
  type LiveStreamOrientation,
  type LiveStreamQuality,
  type LiveStreamVideoRatio,
} from '../../constants/mobileLiveStream'

const route = useRoute()
const router = useRouter()
const pip = useLivePip()

const followed = ref(false)
const danmakuOn = ref(true)
const muted = ref(false)
const cleared = ref(false)
const quality = ref<LiveStreamQuality>('hd')
const showQualityMenu = ref(false)
const showQualitySheet = ref(false)
const showShareSheet = ref(false)
const showGameCenter = ref(false)
const shareToast = ref('')
let shareToastTimer: ReturnType<typeof setTimeout> | null = null

const room = computed(() => {
  const id = String(route.query.id || 'ls-demo')
  const host = route.query.host ? String(route.query.host) : undefined
  const cover = route.query.cover ? String(route.query.cover) : undefined
  const heat = route.query.heat ? String(route.query.heat) : undefined
  const title = route.query.title ? String(route.query.title) : undefined
  const orientationQuery = route.query.orientation
  const orientation =
    orientationQuery === 'landscape' || orientationQuery === 'portrait'
      ? (orientationQuery as LiveStreamOrientation)
      : undefined

  return buildLiveStreamRoom({
    id,
    ...(host ? { hostName: host } : {}),
    ...(cover ? { stage: cover } : {}),
    ...(heat ? { heat } : {}),
    ...(title ? { roomTitle: title } : {}),
    ...(orientation ? { orientation } : {}),
  })
})

const orientation = ref<LiveStreamOrientation>(room.value.orientation)
const videoRatio = ref<LiveStreamVideoRatio>(room.value.videoRatio)

watch(
  () => room.value,
  (next) => {
    orientation.value = next.orientation
    videoRatio.value = next.videoRatio
    quality.value = next.quality || 'hd'
    followed.value = next.followed
    cleared.value = false
  },
  { immediate: true },
)

const isLandscape = computed(() => orientation.value === 'landscape')
/** 16:9 可切横屏；旋转入口仅展示在视频区右下角 */
const canSwitchLandscape = computed(() => videoRatio.value === '16:9')
const stageFrameClass = computed(() => {
  if (videoRatio.value === '16:9') return 'mh5-livestream-page__stage-frame--16-9'
  if (videoRatio.value === '4:3') return 'mh5-livestream-page__stage-frame--4-3'
  return 'mh5-livestream-page__stage-frame--original'
})
const visibleMessages = computed(() => {
  if (cleared.value) return []
  if (!danmakuOn.value) return room.value.messages.filter((m) => m.type === 'system')
  return room.value.messages
})
const visibleGifts = computed(() => (cleared.value ? [] : room.value.gifts))

function currentPipSession() {
  const from = String(route.query.from || '')
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && value) query[key] = value
  }
  return buildLivePipSession({
    roomId: room.value.id,
    hostName: room.value.hostName,
    stage: room.value.stage,
    videoRatio: videoRatio.value,
    muted: muted.value,
    from,
    query,
  })
}

function leaveLiveRoom() {
  pip.armLeave('exit')
  // 关闭房间：replace 回社区直播列表，避免 history 残留导致列表再「返回」又进房
  void router.replace({ name: liveListRouteName(String(route.query.from || '')) })
}

function goBack() {
  leaveLiveRoom()
}

onBeforeRouteLeave((to) => {
  if (to.name === 'mobile-live-stream') return
  if (pip.state.leaveArmed) return
  pip.openIfAllowed(pip.takePendingReason(), currentPipSession())
})

onMounted(() => {
  pip.resetLeaveArmed()
  pip.hideIfWatchingLive()
})

function toggleFollow() {
  followed.value = !followed.value
}

function toggleOrientation() {
  if (!canSwitchLandscape.value) return
  orientation.value = orientation.value === 'landscape' ? 'portrait' : 'landscape'
  showQualityMenu.value = false
}

function pickQuality(next: LiveStreamQuality) {
  quality.value = next
  showQualityMenu.value = false
  showQualitySheet.value = false
}

function exitClear() {
  cleared.value = false
}

function openShareSheet() {
  showShareSheet.value = true
  showQualityMenu.value = false
}

function closeShareSheet() {
  showShareSheet.value = false
}

function showSharedToast() {
  shareToast.value = '已分享'
  if (shareToastTimer) clearTimeout(shareToastTimer)
  shareToastTimer = setTimeout(() => {
    shareToast.value = ''
  }, 1600)
}

function currentLiveQuery() {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && value) query[key] = value
  }
  if (!query.id) query.id = room.value.id
  return query
}

function deliverLiveShare(targets: LiveShareTarget[]) {
  if (!targets.length) return
  sendLiveRoomToChats(targets, {
    hostName: room.value.hostName,
    hostAvatar: room.value.avatar,
    title: room.value.roomTitle || '直播标题',
    cover: room.value.stage,
    heat: room.value.heat,
    scheduleText: '9-12 22:00',
    likeText: room.value.likeText,
    query: currentLiveQuery(),
  })
  closeShareSheet()
  showSharedToast()
}

function shareToFriend(target: LiveShareTarget) {
  deliverLiveShare([target])
}

function handleShareAction(key: LiveShareActionKey) {
  if (key === 'quality') {
    closeShareSheet()
    showQualitySheet.value = true
    return
  }

  if (key === 'clear') {
    cleared.value = true
    showGameCenter.value = false
    closeShareSheet()
    return
  }

  if (key === 'mute') {
    muted.value = !muted.value
  }
}

function handleForwarded(targets: LiveShareTarget[]) {
  deliverLiveShare(targets)
}
</script>

<template>
  <div
    class="mh5-livestream-page mh5-route-view"
    :class="{
      'mh5-livestream-page--landscape': isLandscape,
      'mh5-livestream-page--muted': muted,
      'mh5-livestream-page--cleared': cleared,
    }"
  >
    <div class="mh5-livestream-page__stage-frame" :class="stageFrameClass">
      <img class="mh5-livestream-page__stage" :src="room.stage" :alt="room.hostName" />
      <button
        v-if="canSwitchLandscape"
        type="button"
        class="mh5-livestream-page__rotate-hint"
        :aria-label="isLandscape ? '切回竖屏' : '切换横屏'"
        @click="toggleOrientation"
      >
        <span class="mh5-livestream-page__rotate-hint-icon" aria-hidden="true" />
      </button>
    </div>
    <div v-if="muted && !cleared" class="mh5-livestream-mute-tip" aria-live="polite">{{ $t('已禁音') }}</div>

    <MobileRoomGameCenter v-show="!cleared" v-model:open="showGameCenter" />

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
          <Mh5SpecAnnot v-if="!cleared" :spec="LIVE_ROOM_METRICS_SPEC" placement="bottom" />
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
        <Mh5LiveMoreEntry v-if="!cleared" />
      </div>
    </header>

    <button
      v-if="cleared"
      type="button"
      class="mh5-livestream-clear-exit"
      :aria-label="$t('离开清屏')"
      @click="exitClear"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.2" y="5" width="11.2" height="14" rx="2.2" stroke="currentColor" stroke-width="1.6" />
        <path
          d="M20.2 12H11.4M11.4 12l2.5-2.5M11.4 12l2.5 2.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div v-show="!cleared" class="mh5-livestream-footer">
      <div class="mh5-livestream-side">
        <div
          v-for="gift in visibleGifts"
          :key="gift.id"
          class="mh5-livestream-gift-toast"
        >
          <img class="mh5-livestream-gift-toast__avatar" :src="gift.avatar" alt="" />
          <div class="mh5-livestream-gift-toast__text">
            <p class="mh5-livestream-gift-toast__user">{{ gift.user }}</p>
            <p class="mh5-livestream-gift-toast__action">{{ gift.action }}</p>
          </div>
          <img class="mh5-livestream-gift-toast__thumb" :src="LIVE_STREAM_ASSETS.giftThumb" alt="" />
          <span class="mh5-livestream-gift-toast__count">{{ gift.count }}</span>
        </div>

        <div v-show="visibleMessages.length" class="mh5-livestream-chat">
          <template v-for="msg in visibleMessages" :key="msg.id">
            <div v-if="msg.type === 'system'" class="mh5-livestream-bubble mh5-livestream-bubble--system">
              {{ msg.text }}
            </div>
            <div v-else-if="msg.type === 'enter'" class="mh5-livestream-bubble">
              <span class="mh5-livestream-bubble__user">{{ msg.user }}</span>
              <span class="mh5-livestream-bubble__text">{{ $t('进入直播间') }}</span>
              <span v-if="msg.text" class="mh5-livestream-bubble__text">{{ msg.text }}</span>
            </div>
            <div v-else-if="msg.type === 'gift'" class="mh5-livestream-bubble">
              <span class="mh5-livestream-bubble__user">{{ msg.user }}:</span>
              <span class="mh5-livestream-bubble__gift">{{ $t('送') }}</span>
              <img class="mh5-livestream-bubble__gift-icon" :src="LIVE_STREAM_ASSETS.giftThumb" alt="" />
              <span class="mh5-livestream-bubble__gift">{{ msg.gift }}</span>
            </div>
            <div v-else class="mh5-livestream-bubble">
              <span class="mh5-livestream-bubble__user">{{ msg.user }}:</span>
              <span class="mh5-livestream-bubble__text">{{ msg.text }}</span>
            </div>
          </template>
        </div>
      </div>

      <MobileRoomBottomBar
        input-label="来个走心的弹幕"
        input-with-emoji
        share-icon
        @game="showGameCenter = true"
        @share="openShareSheet"
      >
        <template #before>
          <template v-if="isLandscape">
            <button
              type="button"
              class="mh5-livestream-bar__chip"
              :class="{ 'mh5-livestream-bar__chip--off': !danmakuOn }"
              @click="danmakuOn = !danmakuOn"
            >
              {{ danmakuOn ? '弹幕开' : '弹幕关' }}
            </button>
            <div class="mh5-livestream-quality">
              <button
                type="button"
                class="mh5-livestream-bar__chip"
                @click="showQualityMenu = !showQualityMenu"
              >
                {{ LIVE_STREAM_QUALITY_LABEL[quality] }}
              </button>
              <div v-if="showQualityMenu" class="mh5-livestream-quality__menu">
                <button
                  v-for="item in LIVE_STREAM_QUALITY_OPTIONS"
                  :key="item.key"
                  type="button"
                  class="mh5-livestream-quality__item"
                  :class="{ 'mh5-livestream-quality__item--on': quality === item.key }"
                  @click="pickQuality(item.key)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </template>
        </template>
      </MobileRoomBottomBar>
    </div>

    <MobileRoomShareSheet
      v-model:open="showShareSheet"
      room-tools
      :muted="muted"
      :quality="quality"
      @action="handleShareAction"
      @share-friend="shareToFriend"
      @forwarded="handleForwarded"
    />

    <Transition name="mh5-live-share">
      <div v-if="showQualitySheet" class="mh5-live-share-mask" @click.self="showQualitySheet = false">
        <section class="mh5-live-share" role="dialog" aria-modal="true" :aria-label="$t('清晰度')" @click.stop>
          <header class="mh5-live-share__head">
            <div class="mh5-live-share__title-row">
              <h2 class="mh5-live-share__title">{{ $t('清晰度') }}</h2>
              <Mh5SpecAnnot :spec="LIVE_SHARE_SPEC" placement="top" />
            </div>
            <button
              type="button"
              class="mh5-live-share__close"
              :aria-label="$t('关闭')"
              @click="showQualitySheet = false"
            >
              <img :src="LIVE_STREAM_ASSETS.shareSheet.close" alt="" width="24" height="24" />
            </button>
          </header>
          <div class="mh5-live-share__options" role="radiogroup" :aria-label="$t('清晰度')">
            <button
              v-for="item in LIVE_STREAM_QUALITY_OPTIONS"
              :key="item.key"
              type="button"
              class="mh5-live-share__option"
              :class="{ 'is-on': quality === item.key }"
              role="radio"
              :aria-checked="quality === item.key"
              @click="pickQuality(item.key)"
            >
              <span>{{ item.label }}</span>
              <span v-if="quality === item.key" class="mh5-live-share__option-mark" aria-hidden="true">✓</span>
            </button>
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="mh5-toast">
      <p v-if="shareToast" class="mh5-livestream-toast">{{ shareToast }}</p>
    </Transition>
  </div>
</template>
