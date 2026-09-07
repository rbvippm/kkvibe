<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { liveListRouteName } from '../../constants/mobileDiscover'
import { useLivePip } from '../../composables/useLivePip'

const route = useRoute()
const router = useRouter()
const pip = useLivePip()

function goLiveList() {
  pip.armLeave('navigate')
  router.replace({ name: liveListRouteName(String(route.query.from || '')) })
}
</script>

<template>
  <button type="button" class="mh5-livestream-more" @click="goLiveList">
    {{ $t('更多直播') }}<span class="mh5-livestream-more__arrow" aria-hidden="true">›</span>
  </button>
</template>
