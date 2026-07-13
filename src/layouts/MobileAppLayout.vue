<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Mh5ConfirmDialog from '../components/mobile/Mh5ConfirmDialog.vue'
import { useWorkspaceInlinePreview } from '../composables/workspacePreviewContext'
import '../styles/mobile-app-shell.css'

const route = useRoute()
const { isWorkspacePreview } = useWorkspaceInlinePreview()

watch(
  () => route.fullPath,
  () => {
    document.querySelectorAll('body > .agent-team-create-sheet-mask').forEach((el) => el.remove())
  },
)

const tabs = [
  {
    name: 'mobile-home',
    path: '/mobile/home',
    label: '大厅',
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
    badge: 3,
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
  () =>
    Boolean(route.meta.hideTabBar) ||
    route.path.startsWith('/mobile/agent') ||
    isWorkspacePreview.value,
)

function isActive(tab: (typeof tabs)[number]) {
  return tab.match(route.path)
}
</script>

<template>
  <div class="mh5-viewport-canvas">
    <div class="mh5-app-shell">
      <div class="mh5-app-body" :class="{ 'mh5-app-body--immersive': hideTabBar }">
        <slot v-if="$slots.default" />
        <RouterView v-else v-slot="{ Component }">
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
        <span class="mh5-app-tabbar__icon-wrap">
          <!-- 大厅 -->
          <svg
            v-if="tab.label === '大厅'"
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
            <path
              d="M12 2.5l6.5 3.75v7.5L12 17.5 5.5 13.75v-7.5L12 2.5z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <circle cx="9.5" cy="11" r="0.8" fill="currentColor" />
            <circle cx="14.5" cy="11" r="0.8" fill="currentColor" />
            <path
              d="M9.5 14c.8.8 1.8 1.2 2.5 1.2s1.7-.4 2.5-1.2"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
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
              v-if="isActive(tab)"
              d="M12 2.5l6.5 3.75v7.5L12 17.5 5.5 13.75v-7.5L12 2.5z"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              v-else
              d="M12 2.5l6.5 3.75v7.5L12 17.5 5.5 13.75v-7.5L12 2.5z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <circle
              v-if="isActive(tab)"
              cx="9.5"
              cy="11"
              r="1"
              fill="#fff"
            />
            <circle
              v-if="isActive(tab)"
              cx="14.5"
              cy="11"
              r="1"
              fill="#fff"
            />
            <template v-else>
              <circle cx="9.5" cy="11" r="0.8" fill="currentColor" />
              <circle cx="14.5" cy="11" r="0.8" fill="currentColor" />
            </template>
          </svg>
          <span v-if="tab.badge" class="mh5-app-tabbar__badge">{{ tab.badge }}</span>
        </span>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>
    </div>
    <Mh5ConfirmDialog />
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
