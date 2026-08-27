<script setup lang="ts">
import { RouterLink } from 'vue-router'
import '../../styles/pc-admin-layout.css'
</script>

<template>
  <div class="pc-dashboard">
    <h1 class="pc-dashboard__title">主播工作台</h1>
    <p class="pc-dashboard__desc">从左侧菜单进入「直播助手」，对齐移动端直播中心开播。</p>
    <div class="pc-dashboard__grid">
      <RouterLink to="/pc-anchor/live-assistant" class="pc-dashboard__card">
        <span class="pc-dashboard__card-icon">📺</span>
        <h2 class="pc-dashboard__card-title">直播助手</h2>
        <p class="pc-dashboard__card-desc">开播设置、预告、画面与游戏，以及在线列表。</p>
      </RouterLink>
    </div>
  </div>
</template>
