<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5LiveMoreEntry from '../../components/mobile/Mh5LiveMoreEntry.vue'
import Mh5LiveOnlineViewers from '../../components/mobile/Mh5LiveOnlineViewers.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import MobileRoomBottomBar from '../../components/mobile/MobileRoomBottomBar.vue'
import MobileRoomGameCenter from '../../components/mobile/MobileRoomGameCenter.vue'
import MobileRoomShareSheet from '../../components/mobile/MobileRoomShareSheet.vue'
import { LIVE_ROOM_METRICS_SPEC } from '../../constants/liveRoomMetricsSpec'
import { mh5Alert } from '../../composables/useMh5Confirm'
import { liveListRouteName } from '../../constants/mobileDiscover'
import { type LiveShareActionKey } from '../../constants/mobileLiveStream'
import {
  MOCK_VOICE_GIFTS,
  MOCK_VOICE_MESSAGES,
  MOCK_VOICE_MIC_SEATS,
  VOICE_ROOM_ASSETS,
} from '../../constants/mobileVoiceRoom'

const route = useRoute()
const router = useRouter()
const followed = ref(false)
const muted = ref(false)
const showGameCenter = ref(false)
const showShareSheet = ref(false)

const hostName = computed(() => String(route.query.host || '晚风吉他'))
const roomId = computed(() => String(route.query.id || 'voice-demo'))
const shareLink = computed(
  () => `https://kkvibe.app/voice/${encodeURIComponent(hostName.value)}`,
)

function goBack() {
  // 关闭房间：replace 回社区直播列表，避免 history 残留导致列表再「返回」又进房
  router.replace({ name: liveListRouteName(String(route.query.from || '')) })
}

function toggleFollow() {
  followed.value = !followed.value
}

function openShareSheet() {
  showShareSheet.value = true
}

async function shareToFriend(name: string) {
  showShareSheet.value = false
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
      showShareSheet.value = false
      await mh5Alert({
        title: '链接已复制',
        message: shareLink.value,
        showCancel: false,
      })
    } catch {
      showShareSheet.value = false
      await mh5Alert({
        title: '复制失败',
        message: '请手动长按复制链接',
        showCancel: false,
      })
    }
    return
  }

  if (key === 'clear') {
    showShareSheet.value = false
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
  <div class="mh5-voice-room mh5-route-view" :class="{ 'mh5-voice-room--muted': muted }">
    <img class="mh5-voice-room__bg" :src="VOICE_ROOM_ASSETS.bg" alt="" />
    <div class="mh5-voice-room__shade" aria-hidden="true" />

    <header class="mh5-voice-room__header">
      <div class="mh5-voice-room__header-main">
        <div class="mh5-voice-room__host">
          <img class="mh5-voice-room__host-avatar" :src="VOICE_ROOM_ASSETS.avatars[1]" alt="" />
          <div class="mh5-voice-room__host-meta">
            <p class="mh5-voice-room__host-name">{{ hostName }}</p>
            <p class="mh5-voice-room__host-likes">{{ $t('2.4万本场点赞') }}</p>
          </div>
          <button
            type="button"
            class="mh5-voice-room__follow"
            :class="{ 'mh5-voice-room__follow--on': followed }"
            @click="toggleFollow"
          >
            {{ followed ? '已关注' : '关注' }}
          </button>
        </div>

        <div class="mh5-voice-room__header-right">
          <Mh5SpecAnnot :spec="LIVE_ROOM_METRICS_SPEC" placement="bottom" />
          <Mh5LiveOnlineViewers :room-id="roomId" />
          <button type="button" class="mh5-voice-room__close" :aria-label="$t('关闭')" @click="goBack">
            <img :src="VOICE_ROOM_ASSETS.close" alt="" width="24" height="24" />
          </button>
        </div>
      </div>
      <div class="mh5-livestream-heat-row">
        <Mh5LiveMoreEntry />
      </div>
    </header>

    <section class="mh5-voice-room__mics" :aria-label="$t('麦位')">
      <div
        v-for="seat in MOCK_VOICE_MIC_SEATS"
        :key="seat.id"
        class="mh5-voice-seat"
        :class="`mh5-voice-seat--${seat.kind}`"
      >
        <template v-if="seat.kind === 'user'">
          <div
            class="mh5-voice-seat__avatar-wrap"
            :class="{ 'mh5-voice-seat__avatar-wrap--speak': seat.mic === 'speaking' }"
          >
            <img class="mh5-voice-seat__avatar" :src="seat.avatar" :alt="seat.name" />
            <span
              v-if="seat.mic !== 'mute'"
              class="mh5-voice-seat__mic"
              :class="{ 'mh5-voice-seat__mic--wave': seat.mic === 'speaking' }"
            >
              <img
                :src="seat.mic === 'speaking' ? VOICE_ROOM_ASSETS.wave : VOICE_ROOM_ASSETS.mic"
                alt=""
              />
            </span>
            <span v-else class="mh5-voice-seat__mic mh5-voice-seat__mic--mute">
              <img :src="VOICE_ROOM_ASSETS.mute" alt="" />
            </span>
          </div>
          <div class="mh5-voice-seat__name-row">
            <span
              v-if="seat.badge"
              class="mh5-voice-seat__badge"
              :class="`mh5-voice-seat__badge--${seat.badge}`"
            >
              {{ seat.badge === 'host' ? '主' : seat.badge === 'admin' ? '管' : '神' }}
            </span>
            <p class="mh5-voice-seat__name">{{ $t(seat.name) }}</p>
          </div>
        </template>

        <template v-else-if="seat.kind === 'empty'">
          <div class="mh5-voice-seat__empty">
            <img :src="VOICE_ROOM_ASSETS.plus" alt="" width="20" height="20" />
          </div>
          <p class="mh5-voice-seat__empty-text">加入{{ seat.micIndex }}麦</p>
        </template>

        <template v-else>
          <div class="mh5-voice-seat__empty">
            <img :src="VOICE_ROOM_ASSETS.lock" alt="" width="20" height="20" />
          </div>
          <p class="mh5-voice-seat__empty-text">麦位关闭</p>
        </template>
      </div>
    </section>

    <MobileRoomGameCenter v-model:open="showGameCenter" />

    <div class="mh5-voice-room__footer">
      <div class="mh5-voice-room__side">
        <div v-for="gift in MOCK_VOICE_GIFTS" :key="gift.id" class="mh5-voice-gift">
          <img class="mh5-voice-gift__avatar" :src="gift.avatar" alt="" />
          <div class="mh5-voice-gift__text">
            <p class="mh5-voice-gift__user">{{ gift.user }}</p>
            <p class="mh5-voice-gift__action">{{ gift.action }}</p>
          </div>
          <img class="mh5-voice-gift__thumb" :src="VOICE_ROOM_ASSETS.giftThumb" alt="" />
          <span class="mh5-voice-gift__count">{{ gift.count }}</span>
        </div>

        <div class="mh5-voice-chat">
          <template v-for="msg in MOCK_VOICE_MESSAGES" :key="msg.id">
            <div v-if="msg.type === 'win'" class="mh5-voice-bubble">
              <span class="mh5-voice-bubble__tag mh5-voice-bubble__tag--win">中奖</span>
              <span class="mh5-voice-bubble__user">{{ msg.user }}</span>
              <span class="mh5-voice-bubble__text">获得 {{ msg.amount }}</span>
            </div>
            <div v-else-if="msg.type === 'system'" class="mh5-voice-bubble">
              <span class="mh5-voice-bubble__tag mh5-voice-bubble__tag--sys">系统</span>
              <span class="mh5-voice-bubble__text">{{ msg.text }}</span>
              <button v-if="msg.action" type="button" class="mh5-voice-bubble__cta">{{ msg.action }}</button>
            </div>
            <div v-else-if="msg.type === 'gift'" class="mh5-voice-bubble">
              <span class="mh5-voice-bubble__user">{{ msg.user }}:</span>
              <span class="mh5-voice-bubble__gift">送 {{ msg.gift }}</span>
            </div>
            <div v-else class="mh5-voice-bubble">
              <span v-if="msg.tag" class="mh5-voice-bubble__tag mh5-voice-bubble__tag--vip">{{ msg.tag }}</span>
              <span class="mh5-voice-bubble__user">{{ msg.user }}:</span>
              <span class="mh5-voice-bubble__text">{{ msg.text }}</span>
            </div>
          </template>
        </div>
      </div>

      <MobileRoomBottomBar
        input-label="说点什么"
        @game="showGameCenter = true"
        @share="openShareSheet"
      >
        <template #before>
          <button type="button" class="mh5-room-bar__btn" aria-label="表情">
            <img :src="VOICE_ROOM_ASSETS.emoji" alt="" width="24" height="24" />
          </button>
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
