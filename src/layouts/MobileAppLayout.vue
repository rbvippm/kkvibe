<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Mh5ConfirmDialog from '../components/mobile/Mh5ConfirmDialog.vue'
import { useWorkspaceInlinePreview } from '../composables/workspacePreviewContext'
import '../styles/mobile-app-shell.css'

const route = useRoute()
const { isWorkspacePreview } = useWorkspaceInlinePreview()

/**
 * 仅清理团队「创建账户」残留遮罩（历史问题）。
 * 禁止在路由切换时强删 Vue Teleport 节点，否则 out-in 过渡会卡死导致白屏。
 */
watch(
  () => route.fullPath,
  () => {
    document.querySelectorAll('body > .agent-team-create-sheet-mask').forEach((el) => el.remove())
  },
)

type AppTab = {
  key: 'home' | 'community' | 'chat' | 'mine'
  name: string
  path: string
  label: string
  badge?: number
  match: (path: string) => boolean
}

const outerTabs: AppTab[] = [
  {
    key: 'home',
    name: 'mobile-home',
    path: '/mobile/home',
    label: '大厅',
    match: (path: string) => path === '/mobile/home' || path === '/mobile',
  },
  {
    key: 'community',
    name: 'mobile-community',
    path: '/mobile/community',
    label: '社区',
    match: (path: string) => path.startsWith('/mobile/community'),
  },
  {
    key: 'chat',
    name: 'mobile-chat',
    path: '/mobile/chat',
    label: '会话',
    badge: 3,
    match: (path: string) => path.startsWith('/mobile/chat'),
  },
  {
    key: 'mine',
    name: 'mobile-mine',
    path: '/mobile/mine',
    label: '我的',
    match: (path: string) => path.startsWith('/mobile/mine'),
  },
]

const vipTabs: AppTab[] = [
  {
    key: 'home',
    name: 'mobile-vip-club',
    path: '/mobile/vip-club',
    label: '大厅',
    match: (path: string) => path === '/mobile/vip-club' || path.startsWith('/mobile/vip-club/hall'),
  },
  {
    key: 'community',
    name: 'mobile-vip-club-community',
    path: '/mobile/vip-club/community',
    label: '社区',
    match: (path: string) => path.startsWith('/mobile/vip-club/community'),
  },
  {
    key: 'chat',
    name: 'mobile-vip-club-chat',
    path: '/mobile/vip-club/chat',
    label: '会话',
    badge: 3,
    match: (path: string) => path.startsWith('/mobile/vip-club/chat'),
  },
  {
    key: 'mine',
    name: 'mobile-vip-club-mine',
    path: '/mobile/vip-club/mine',
    label: '我的',
    match: (path: string) => path.startsWith('/mobile/vip-club/mine'),
  },
]

const hideTabBar = computed(
  () =>
    Boolean(route.meta.hideTabBar) ||
    route.path.startsWith('/mobile/agent') ||
    isWorkspacePreview.value,
)

const isVipClub = computed(() => route.path.startsWith('/mobile/vip-club'))
const tabs = computed(() => (isVipClub.value ? vipTabs : outerTabs))

function isActive(tab: AppTab) {
  return tab.match(route.path)
}
</script>

<template>
  <div class="mh5-viewport-canvas">
    <div class="mh5-app-shell" :class="{ 'mh5-app-shell--vip-club': isVipClub }">
      <div class="mh5-app-body" :class="{ 'mh5-app-body--immersive': hideTabBar }">
        <slot v-if="$slots.default" />
        <!-- 不用 mode=out-in：离开动画未完成时会卡死 RouterView，表现为返回后白屏 -->
        <RouterView v-else v-slot="{ Component, route: viewRoute }">
          <component
            :is="Component"
            v-if="Component"
            :key="viewRoute.fullPath"
            class="mh5-route-view"
          />
        </RouterView>
      </div>

      <nav v-if="!hideTabBar" class="mh5-app-tabbar" :aria-label="$t('底部导航')">
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
            v-if="tab.key === 'home'"
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
            v-else-if="tab.key === 'community'"
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
            v-else-if="tab.key === 'chat'"
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
        <span>{{ $t(tab.label) }}</span>
      </RouterLink>
    </nav>
    </div>
    <Mh5ConfirmDialog />
  </div>
</template>
