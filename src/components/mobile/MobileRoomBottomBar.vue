<script setup lang="ts">
import { LIVE_STREAM_ASSETS } from '../../constants/mobileLiveStream'
import { VOICE_ROOM_ASSETS } from '../../constants/mobileVoiceRoom'

withDefaults(
  defineProps<{
    /** 输入框占位文案 */
    inputLabel?: string
    /** 表情是否内嵌在输入框右侧（直播间） */
    inputWithEmoji?: boolean
    /** 预告态：禁止发言 */
    inputDisabled?: boolean
    /** 视频直播间：最右入口用分享图标 */
    shareIcon?: boolean
  }>(),
  {
    inputLabel: '说点什么',
    inputWithEmoji: false,
    inputDisabled: false,
    shareIcon: false,
  },
)

const emit = defineEmits<{
  game: []
  gift: []
  share: []
}>()
</script>

<template>
  <div class="mh5-room-bar">
    <button
      type="button"
      class="mh5-room-bar__input"
      :class="{
        'mh5-room-bar__input--emoji': inputWithEmoji,
        'mh5-room-bar__input--disabled': inputDisabled,
      }"
      :disabled="inputDisabled"
      :aria-disabled="inputDisabled"
      :aria-label="inputLabel"
    >
      <span>{{ inputLabel }}</span>
      <img
        v-if="inputWithEmoji"
        :src="LIVE_STREAM_ASSETS.emoji"
        alt=""
        width="24"
        height="24"
      />
    </button>

    <slot name="before" />

    <button type="button" class="mh5-room-bar__btn" :aria-label="$t('游戏')" @click="emit('game')">
      <img :src="VOICE_ROOM_ASSETS.gameBar" alt="" width="20" height="20" />
    </button>
    <button type="button" class="mh5-room-bar__btn" :aria-label="$t('礼物')" @click="emit('gift')">
      <img :src="LIVE_STREAM_ASSETS.giftIcon" alt="" width="20" height="20" />
    </button>
    <button
      type="button"
      class="mh5-room-bar__btn"
      :aria-label="$t(shareIcon ? '分享' : '更多')"
      @click="emit('share')"
    >
      <svg
        v-if="shareIcon"
        class="mh5-room-bar__share"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14.2 6.2 19 10.4 14.2 14.6"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.2 10.4H10.4c-3.1 0-5.2 1.9-5.2 5.1v2.2"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        />
      </svg>
      <img v-else :src="LIVE_STREAM_ASSETS.more" alt="" width="22" height="22" />
    </button>
  </div>
</template>
