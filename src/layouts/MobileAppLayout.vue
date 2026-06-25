<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import '../styles/mobile-app-shell.css'

const route = useRoute()

const tabs = [
  {
    name: 'mobile-home',
    path: '/mobile/home',
    label: '首页',
    match: (path: string) => path === '/mobile/home' || path === '/mobile',
  },
  {
    name: 'mobile-community',
    path: '/mobile/community',
    label: '社区',
    match: (path: string) => path.startsWith('/mobile/community'),
  },
  {
    name: 'mobile-chat',
    path: '/mobile/chat',
    label: '会话',
    match: (path: string) => path.startsWith('/mobile/chat'),
  },
  {
    name: 'mobile-mine',
    path: '/mobile/mine',
    label: '我的',
    match: (path: string) => path.startsWith('/mobile/mine'),
  },
]

const hideTabBar = computed(
  () => Boolean(route.meta.hideTabBar) || route.path.startsWith('/mobile/agent'),
)

function isActive(tab: (typeof tabs)[number]) {
  return tab.match(route.path)
}
</script>

<template>
  <div class="mh5-viewport-canvas">
    <div class="mh5-app-shell">
      <div class="mh5-app-body" :class="{ 'mh5-app-body--immersive': hideTabBar }">
        <RouterView v-slot="{ Component }">
          <Transition name="mh5-tab" mode="out-in">
            <component :is="Component" class="mh5-route-view" />
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
        <!-- 首页 -->
        <svg
          v-if="tab.label === '首页'"
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 10.5 12 4l8 6.5V19a2 2 0 01-2 2h-4v-6H10v6H6a2 2 0 01-2-2v-8.5Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
        <!-- 社区 -->
        <svg
          v-else-if="tab.label === '社区'"
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
          <circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="1.8" />
          <path d="M4 19c0-2.8 2.2-5 5-5M15 19c0-2.2 1.8-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <!-- 会话 -->
        <svg
          v-else-if="tab.label === '会话'"
          class="mh5-app-tabbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 6.5A3.5 3.5 0 018.5 3h7A3.5 3.5 0 0119 6.5v6A3.5 3.5 0 0115.5 16H10l-4 3.5V16H8.5A3.5 3.5 0 015 12.5v-6Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
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
