<script setup lang="ts">
import { toRef } from 'vue'
import { useLiveOnlinePresence } from '../../composables/useLiveOnlinePresence'

const props = defineProps<{
  roomId: string
}>()

const { avatars, label } = useLiveOnlinePresence(toRef(props, 'roomId'))
</script>

<template>
  <div class="mh5-livestream-viewers" :aria-label="`${$t('在线')} ${label}`">
    <div class="mh5-livestream-viewers__avatars">
      <img
        v-for="(src, index) in avatars"
        :key="`${src}-${index}`"
        class="mh5-livestream-viewers__avatar"
        :src="src"
        alt=""
      />
    </div>
    <span class="mh5-livestream-viewers__count">{{ label }}</span>
  </div>
</template>
