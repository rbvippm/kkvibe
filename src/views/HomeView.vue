<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import '../styles/home-entry.css'

onMounted(() => {
  document.documentElement.classList.add('theme-home-light')
})

onUnmounted(() => {
  document.documentElement.classList.remove('theme-home-light')
})
</script>

<template>
  <div class="home-entry">
    <header class="home-entry__header">
      <span class="home-entry__brand">K</span>
      <h1 class="home-entry__title">KK Vibe 原型</h1>
      <p class="home-entry__desc">移动端与 PC 管理后台分入口演示，便于评审与联调。</p>
    </header>

    <main class="home-entry__main">
      <RouterLink to="/mobile/home" class="home-entry__card home-entry__card--mobile">
        <div class="home-entry__card-top">
          <span class="home-entry__card-icon home-entry__card-icon--mobile">📱</span>
          <div class="home-entry__card-body">
            <h2 class="home-entry__card-title">移动端 H5</h2>
            <p class="home-entry__card-text">
              首页、社区、会话、我的；语聊直播与代理中心等能力演示。
            </p>
            <div class="home-entry__card-tags">
              <span class="home-entry__tag home-entry__tag--mobile">首页</span>
              <span class="home-entry__tag home-entry__tag--mobile">社区</span>
              <span class="home-entry__tag home-entry__tag--mobile">会话</span>
              <span class="home-entry__tag home-entry__tag--mobile">我的</span>
            </div>
          </div>
        </div>
        <span class="home-entry__card-action home-entry__card-action--mobile">
          进入移动端
          <span class="ml-1">→</span>
        </span>
      </RouterLink>

      <RouterLink to="/pc" class="home-entry__card home-entry__card--pc">
        <div class="home-entry__card-top">
          <span class="home-entry__card-icon home-entry__card-icon--pc">🖥</span>
          <div class="home-entry__card-body">
            <h2 class="home-entry__card-title">PC 管理后台</h2>
            <p class="home-entry__card-text">
              侧栏菜单、面包屑与多标签导航；语聊打赏、佣金配置等模块。
            </p>
            <div class="home-entry__card-tags">
              <span class="home-entry__tag home-entry__tag--pc">语聊管理</span>
              <span class="home-entry__tag home-entry__tag--pc">直播管理</span>
              <span class="home-entry__tag home-entry__tag--pc">线框规范</span>
            </div>
          </div>
        </div>
        <span class="home-entry__card-action home-entry__card-action--pc">
          进入 PC 后台
          <span class="ml-1">→</span>
        </span>
      </RouterLink>
    </main>

    <footer class="home-entry__footer">原型环境 · 数据均为演示</footer>
  </div>
</template>
