<script setup lang="ts">
import { RouterView } from 'vue-router'
import LiveStartTopNotice from './components/LiveStartTopNotice.vue'
</script>

<template>
  <RouterView v-slot="{ Component, route: currentRoute }">
    <component
      :is="Component"
      :key="currentRoute.name === 'workspace-editor' ? currentRoute.params.versionId : currentRoute.path"
    />
  </RouterView>
  <LiveStartTopNotice />
</template>
