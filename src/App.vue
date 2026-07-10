<script setup lang="ts">
import { RouterView } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import LiveStartTopNotice from './components/LiveStartTopNotice.vue'

/** 子路由切换时保持布局壳层，避免侧栏/Tab 滚动位置丢失 */
function routerViewKey(route: RouteLocationNormalizedLoaded) {
  if (route.name === 'workspace-editor') {
    return `workspace-editor-${String(route.params.versionId)}`
  }
  if (route.path.startsWith('/pc')) return 'pc-admin-layout'
  if (route.path.startsWith('/mobile')) return 'mobile-app-layout'
  return route.path
}
</script>

<template>
  <RouterView v-slot="{ Component, route: currentRoute }">
    <component :is="Component" :key="routerViewKey(currentRoute)" />
  </RouterView>
  <LiveStartTopNotice />
</template>
