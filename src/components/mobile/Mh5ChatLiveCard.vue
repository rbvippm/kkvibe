<script setup lang="ts">
import { computed } from 'vue'
import type { LiveShareCard } from '../../constants/liveShareChat'
import { buildLiveStreamRoom, LIVE_STREAM_ASSETS } from '../../constants/mobileLiveStream'

const props = defineProps<{
  card: LiveShareCard
}>()

const linkedRoom = computed(() => buildLiveStreamRoom({ id: props.card.query?.id || 'ls-demo' }))

const hostName = computed(() => {
  const name = props.card.hostName
  if (name && name !== '主播昵称') return name
  return linkedRoom.value.hostName
})

const liveTitle = computed(() => {
  const title = props.card.title
  if (title && title !== props.card.hostName && title !== '主播昵称') return title
  return linkedRoom.value.roomTitle || '直播标题'
})

const emit = defineEmits<{
  enter: []
  reserve: []
  follow: []
}>()
</script>

<template>
  <article class="mh5-chat-live-card" :aria-label="liveTitle">
    <div class="mh5-chat-live-card__cover">
      <img class="mh5-chat-live-card__img" :src="card.cover" alt="" />
      <div class="mh5-chat-live-card__badges">
        <span
          class="mh5-chat-live-card__badge"
          :class="
            card.status === 'live' ? 'is-live' : card.status === 'preview' ? 'is-preview' : 'is-ended'
          "
        >
          <svg v-if="card.status === 'live'" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1" y="7" width="2.2" height="4" rx="0.4" fill="#fff" />
            <rect x="4.9" y="4.2" width="2.2" height="6.8" rx="0.4" fill="#fff" />
            <rect x="8.8" y="1.2" width="2.2" height="9.8" rx="0.4" fill="#fff" />
          </svg>
          <template v-else-if="card.status === 'preview'">{{ $t('预告') }}</template>
          <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.4 1.6v8.8" stroke="#fff" stroke-width="1.3" stroke-linecap="round" />
            <path d="M3.1 2.1h6.1L7.4 4.5l1.8 2.3H3.1V2.1z" fill="#fff" />
          </svg>
        </span>
      </div>
      <span class="mh5-chat-live-card__status">
        {{ card.status === 'live' ? $t('直播中') : card.status === 'preview' ? $t('直播预告') : $t('直播结束') }}
      </span>
      <span class="mh5-chat-live-card__foot">
        <template v-if="card.status === 'live'">
          <img :src="LIVE_STREAM_ASSETS.fire" alt="" width="14" height="14" />
          {{ card.heat }}
        </template>
        <template v-else-if="card.status === 'preview'">{{ card.scheduleText }}</template>
        <template v-else>{{ card.likeText }}</template>
      </span>
    </div>
    <div class="mh5-chat-live-card__row">
      <img class="mh5-chat-live-card__avatar" :src="card.hostAvatar" alt="" />
      <div class="mh5-chat-live-card__copy">
        <p class="mh5-chat-live-card__host">{{ hostName }}</p>
        <p class="mh5-chat-live-card__title">{{ liveTitle }}</p>
      </div>
      <button
        v-if="card.status === 'live'"
        type="button"
        class="mh5-chat-live-card__action"
        @click="emit('enter')"
      >
        {{ $t('进入') }}
      </button>
      <button
        v-else-if="card.status === 'preview'"
        type="button"
        class="mh5-chat-live-card__action"
        :class="{ 'is-on': card.reserved }"
        @click="emit('reserve')"
      >
        {{ card.reserved ? $t('已预约') : $t('预约') }}
      </button>
      <button
        v-else
        type="button"
        class="mh5-chat-live-card__action"
        :class="{ 'is-on': card.followed }"
        @click="emit('follow')"
      >
        {{ card.followed ? $t('已关注') : $t('关注') }}
      </button>
    </div>
  </article>
</template>
