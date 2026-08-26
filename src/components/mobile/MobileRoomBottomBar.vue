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
  }>(),
  {
    inputLabel: '说点什么',
    inputWithEmoji: false,
    inputDisabled: false,
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
    <button type="button" class="mh5-room-bar__btn" :aria-label="$t('分享')" @click="emit('share')">
      <img
        class="mh5-room-bar__share-icon"
        :src="LIVE_STREAM_ASSETS.share"
        alt=""
        width="22"
        height="22"
      />
    </button>
  </div>
</template>
