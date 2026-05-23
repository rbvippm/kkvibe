<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import '../styles/mobile-app-shell.css'

const route = useRoute()

const tabs = [
  {
    name: 'mobile-live',
    path: '/mobile/live',
    label: '直播',
    match: (path: string) => path.startsWith('/mobile/live'),
  },
  { name: 'mobile-agent', path: '/mobile/agent', label: '代理', match: (path: string) => path.startsWith('/mobile/agent') },
  { name: 'mobile-games', path: '/mobile/games', label: '游戏', match: (path: string) => path.startsWith('/mobile/games') },
  { name: 'mobile-mine', path: '/mobile/mine', label: '我的', match: (path: string) => path.startsWith('/mobile/mine') },
]

const hideTabBar = computed(() => Boolean(route.meta.hideTabBar))

function isActive(tab: (typeof tabs)[number]) {
  return tab.match(route.path)
}
</script>

<template>
  <div class="mh5-app-shell">
    <div class="mh5-app-body" :class="{ 'mh5-app-body--immersive': hideTabBar }">
      <RouterView v-slot="{ Component }">
        <Transition name="mh5-tab" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>

    <nav v-if="!hideTabBar" class="mh5-app-tabbar" aria-label="底部导航">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.path"
        class="mh5-app-tabbar__item"
        :class="{ 'mh5-app-tabbar__item--active': isActive(tab) }"
      >
        <!-- 直播 -->
        <svg
          v-if="tab.label === '直播'"
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path d="M17 9l4-2v10l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        </svg>
        <!-- 代理 -->
        <svg
          v-else-if="tab.label === '代理'"
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
          <circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="1.8" />
          <path d="M4 19c0-2.8 2.2-5 5-5M15 19c0-2.2 1.8-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <!-- 游戏 -->
        <svg
          v-else-if="tab.label === '游戏'"
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect x="4" y="8" width="16" height="10" rx="3" stroke="currentColor" stroke-width="1.8" />
          <path d="M9 12v4M7 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="16" cy="12" r="1" fill="currentColor" />
          <circle cx="18" cy="14" r="1" fill="currentColor" />
        </svg>
        <!-- 我的 -->
        <svg
          v-else
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3L4 7v6c0 4.4 3.6 8.5 8 9.5 4.4-1 8-5.1 8-9.5V7l-8-4z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="1.8" />
          <path d="M8.5 15.5c.8-1.2 2-2 3.5-2s2.7.8 3.5 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.mh5-tab-enter-active,
.mh5-tab-leave-active {
  transition: opacity 0.12s ease;
}

.mh5-tab-enter-from,
.mh5-tab-leave-to {
  opacity: 0;
}
</style>
