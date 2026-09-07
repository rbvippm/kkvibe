<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5VipSportsDesk from '../../components/mobile/Mh5VipSportsDesk.vue'
import {
  VIP_CLUB_ASSETS,
  getVipClubLotteryGame,
  getVipClubVendor,
} from '../../constants/vipClub'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const kind = computed(() => String(route.params.kind || ''))
const id = computed(() => String(route.params.id || ''))

const lotteryGame = computed(() =>
  kind.value === 'lottery' ? getVipClubLotteryGame(id.value) : null,
)
const vendor = computed(() =>
  kind.value === 'live' || kind.value === 'slot' ? getVipClubVendor(kind.value, id.value) : null,
)

const pageTitle = computed(() => {
  if (kind.value === 'sports') return '金刚体育'
  if (lotteryGame.value) return lotteryGame.value.title
  if (vendor.value) return vendor.value.title
  return '进入游戏'
})

const missing = computed(() => {
  if (kind.value === 'sports') return false
  if (kind.value === 'lottery') return !lotteryGame.value
  if (kind.value === 'live' || kind.value === 'slot') return !vendor.value
  return true
})

function goToVipClub() {
  router.push({ name: 'mobile-vip-club' })
}
</script>

<template>
  <div
    class="mh5-vip-club-play-page mh5-route-view"
    :class="{ 'mh5-vip-club-play-page--sports': kind === 'sports' }"
  >
    <Mh5VipSportsDesk v-if="kind === 'sports'" @back="goToVipClub" />

    <template v-else>
      <main v-if="!missing" class="mh5-vip-club-play-body">
        <p class="mh5-vip-club-play-kicker">{{ pageTitle }}</p>
        <p class="mh5-vip-club-play-hint">游戏加载中（原型占位）</p>
      </main>
      <main v-else class="mh5-vip-club-play-body">
        <p class="mh5-vip-club-play-hint">未找到该游戏</p>
      </main>
    </template>

    <button
      type="button"
      class="mh5-vip-club-collapse"
      aria-label="返回贵宾会"
      @click="goToVipClub"
    >
      <img :src="VIP_CLUB_ASSETS.collapseTab" alt="" width="90" height="17" />
    </button>
  </div>
</template>
