<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMiniAppGame } from '../../composables/useMiniAppGame'
import { VIP_CLUB_ASSETS, resolveVipClubPlayGame } from '../../constants/vipClub'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const miniGame = useMiniAppGame()
const missing = ref(false)

onMounted(() => {
  const game = resolveVipClubPlayGame(String(route.params.kind || ''), String(route.params.id || ''))
  if (game) {
    miniGame.open(game.name, game.kind)
    void router.replace({ name: 'mobile-vip-club' })
    return
  }
  missing.value = true
})

function goToVipClub() {
  void router.replace({ name: 'mobile-vip-club' })
}
</script>

<template>
  <div class="mh5-vip-club-play-page mh5-route-view">
    <template v-if="missing">
      <main class="mh5-vip-club-play-body">
        <p class="mh5-vip-club-play-hint">未找到该游戏</p>
      </main>
      <button
        type="button"
        class="mh5-vip-club-collapse"
        aria-label="返回贵宾会"
        @click="goToVipClub"
      >
        <img :src="VIP_CLUB_ASSETS.collapseTab" alt="" width="90" height="17" />
      </button>
    </template>
  </div>
</template>
