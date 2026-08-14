<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileRoomBottomBar from '../../components/mobile/MobileRoomBottomBar.vue'
import MobileRoomGameCenter from '../../components/mobile/MobileRoomGameCenter.vue'
import MobileRoomShareSheet from '../../components/mobile/MobileRoomShareSheet.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  LIVE_STREAM_ASSETS,
  LIVE_STREAM_QUALITY_LABEL,
  buildLiveStreamRoom,
  type LiveShareActionKey,
  type LiveStreamOrientation,
  type LiveStreamQuality,
  type LiveStreamVideoRatio,
} from '../../constants/mobileLiveStream'

const route = useRoute()
const router = useRouter()

const followed = ref(false)
const danmakuOn = ref(true)
const muted = ref(false)
const cleared = ref(false)
const quality = ref<LiveStreamQuality>('hd')
const showQualityMenu = ref(false)
const showShareSheet = ref(false)
const showGameCenter = ref(false)

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

const shareLink = computed(
  () => `https://kkvibe.app/live/${room.value.id}?host=${encodeURIComponent(room.value.hostName)}`,
)

function goBack() {
  // 关闭房间：replace 回列表，避免 history 残留导致列表再「返回」又进房
  router.replace({ name: 'mobile-discover' })
}

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
}

function openShareSheet() {
  showShareSheet.value = true
  showQualityMenu.value = false
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

  if (key === 'clear') {
    cleared.value = true
    danmakuOn.value = false
    closeShareSheet()
    await mh5Alert({
      title: '已清屏',
      message: '礼物飘屏与公屏消息已清空',
      showCancel: false,
    })
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
  <div
    class="mh5-livestream-page mh5-route-view"
    :class="{
      'mh5-livestream-page--landscape': isLandscape,
      'mh5-livestream-page--muted': muted,
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
    <div v-if="muted" class="mh5-livestream-mute-tip" aria-live="polite">{{ $t('已禁音') }}</div>

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
          <div class="mh5-livestream-viewers">
            <div class="mh5-livestream-viewers__avatars">
              <img
                v-for="(av, i) in room.topViewers"
                :key="i"
                class="mh5-livestream-viewers__avatar"
                :src="av"
                alt=""
              />
            </div>
            <span class="mh5-livestream-viewers__count">{{ room.viewerCount }}</span>
          </div>
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
                  v-for="(label, key) in LIVE_STREAM_QUALITY_LABEL"
                  :key="key"
                  type="button"
                  class="mh5-livestream-quality__item"
                  :class="{ 'mh5-livestream-quality__item--on': quality === key }"
                  @click="pickQuality(key as LiveStreamQuality)"
                >
                  {{ label }}
                </button>
              </div>
            </div>
          </template>
        </template>
      </MobileRoomBottomBar>
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
