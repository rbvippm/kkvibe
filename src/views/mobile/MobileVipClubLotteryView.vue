<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  VIP_CLUB_ASSETS,
  VIP_CLUB_LOTTERY_ASSETS,
  VIP_CLUB_LOTTERY_GAMES,
  type VipClubLotteryGame,
} from '../../constants/vipClub'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const toast = ref('')
let toastTimer = 0

function goBack() {
  router.push({ name: 'mobile-vip-club' })
}

function showToast(message: string) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1600)
}

function openGame(game: VipClubLotteryGame) {
  if (game.comingSoon) {
    showToast('敬请期待')
    return
  }
  router.push({ name: 'mobile-vip-club-play', params: { kind: 'lottery', id: game.id } })
}
</script>

<template>
  <div class="mh5-vip-lottery-page mh5-route-view">
    <header class="mh5-vip-lottery-header">
      <button type="button" class="mh5-vip-lottery-header__brand" aria-label="返回尊享专区" @click="goBack">
        <img :src="VIP_CLUB_LOTTERY_ASSETS.logo" alt="彩票联盟" width="107" height="30" />
      </button>
      <div class="mh5-vip-lottery-header__wallet">
        <img :src="VIP_CLUB_LOTTERY_ASSETS.usdt" alt="" width="24" height="24" />
        <span>50000.0</span>
      </div>
    </header>

    <main class="mh5-vip-lottery-main">
      <section class="mh5-vip-lottery-banner" aria-label="活动 Banner">
        <img :src="VIP_CLUB_LOTTERY_ASSETS.banner" alt="皇者彩票 Banner" width="357" height="140" />
      </section>

      <section class="mh5-vip-lottery-marquee" aria-label="中奖公告">
        <img :src="VIP_CLUB_LOTTERY_ASSETS.marquee" alt="恭喜会员获得大奖" width="349" height="17" />
      </section>

      <section class="mh5-vip-lottery-list" aria-label="子游戏">
        <header class="mh5-vip-lottery-cat">
          <img :src="VIP_CLUB_LOTTERY_ASSETS.unionIcon" alt="" width="18" height="19" />
          <span>联盟彩</span>
        </header>
        <div class="mh5-vip-lottery-grid">
          <button
            v-for="game in VIP_CLUB_LOTTERY_GAMES"
            :key="game.id"
            type="button"
            class="mh5-vip-lottery-tile"
            :class="{ 'is-soon': game.comingSoon }"
            :aria-label="game.comingSoon ? '敬请期待' : `进入${game.title}`"
            @click="openGame(game)"
          >
            <img :src="game.cover" :alt="game.title" width="171" height="112" />
          </button>
        </div>
        <p class="mh5-vip-lottery-more">- 更多彩种，敬请期待 -</p>
      </section>
    </main>

    <button
      type="button"
      class="mh5-vip-club-collapse"
      aria-label="返回贵宾会"
      @click="goBack"
    >
      <img :src="VIP_CLUB_ASSETS.collapseTab" alt="" width="90" height="17" />
    </button>

    <Transition name="mh5-toast">
      <p v-if="toast" class="mh5-wallet-transfer-toast">{{ toast }}</p>
    </Transition>
  </div>
</template>
