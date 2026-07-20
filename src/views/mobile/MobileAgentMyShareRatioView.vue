<script setup lang="ts">
/**
 * 页面目录入口：占成比例在 Figma 1433:25289 中为概况页居中弹框。
 * 独立路由进入时自动回概况并带上打开弹框标记。
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ name: 'mobile-agent', query: { tab: 'overview', shareRatio: '1' } })
})
</script>

<template>
  <div class="mh5-agent-my-share-page mh5-agent-my-share-page--redirect" aria-busy="true">
    <p class="mh5-agent-my-share-page__loading">正在打开占成比例…</p>
  </div>
</template>
