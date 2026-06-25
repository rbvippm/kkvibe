<script setup lang="ts">
import { ref } from 'vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

const games = ref([
  { id: 'g1', name: '百家乐', icon: '🃏' },
  { id: 'g2', name: '龙虎斗', icon: '🐉' },
  { id: 'g3', name: '轮盘', icon: '🎡' },
  { id: 'g4', name: '骰宝', icon: '🎲' },
  { id: 'g5', name: '捕鱼', icon: '🐟' },
  { id: 'g6', name: '电子游艺', icon: '🎰' },
  { id: 'g7', name: '体育竞技', icon: '⚽' },
  { id: 'g8', name: '彩票', icon: '🎫' },
  { id: 'g9', name: '更多', icon: '➕' },
])

const toast = ref('')

function onGameClick(name: string) {
  toast.value = `${name} 即将开放（演示）`
  setTimeout(() => {
    toast.value = ''
  }, 2000)
}
</script>

<template>
  <div class="mh5-games-page">
    <Mh5SubPageHeader title="游戏中心" />

    <p class="mh5-games-subtitle">热门游戏，即刻开玩</p>

    <div class="mh5-games-grid">
      <button
        v-for="game in games"
        :key="game.id"
        type="button"
        class="mh5-game-card"
        @click="onGameClick(game.name)"
      >
        <span class="mh5-game-card__icon">{{ game.icon }}</span>
        <span class="mh5-game-card__name">{{ game.name }}</span>
      </button>
    </div>

    <Transition name="mh5-toast">
      <p
        v-if="toast"
        class="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#333]/90 px-4 py-2 text-sm text-white"
      >
        {{ toast }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.mh5-toast-enter-active,
.mh5-toast-leave-active {
  transition: opacity 0.2s;
}

.mh5-toast-enter-from,
.mh5-toast-leave-to {
  opacity: 0;
}
</style>
