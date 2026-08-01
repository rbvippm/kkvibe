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
      <p class="home-entry__desc">移动端、代理端与 PC 管理后台分入口演示，便于评审与联调。</p>
    </header>

    <main class="home-entry__main">
      <RouterLink to="/mobile/home" class="home-entry__card home-entry__card--mobile">
        <div class="home-entry__card-top">
          <span class="home-entry__card-icon home-entry__card-icon--mobile">📱</span>
          <div class="home-entry__card-body">
            <h2 class="home-entry__card-title">移动端(APP&H5)</h2>
            <p class="home-entry__card-text">
              首页、社区、会话、我的；语聊直播等 C 端能力演示。
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

      <div class="home-entry__card home-entry__card--agent home-entry__card--split">
        <div class="home-entry__card-top">
          <span class="home-entry__card-icon home-entry__card-icon--agent">🤝</span>
          <div class="home-entry__card-body">
            <div class="home-entry__card-title-row">
              <h2 class="home-entry__card-title">占成代理 H5</h2>
              <RouterLink
                :to="{ name: 'agent-field-definitions' }"
                class="home-entry__card-title-link"
              >
                字段定义
                <span class="ml-1">→</span>
              </RouterLink>
            </div>
            <p class="home-entry__card-text">
              占成代理身份：概况占成比例、团队授信与占成配置等能力演示。
            </p>
            <div class="home-entry__card-tags">
              <span class="home-entry__tag home-entry__tag--agent">占成</span>
              <span class="home-entry__tag home-entry__tag--agent">授信</span>
              <span class="home-entry__tag home-entry__tag--agent">团队</span>
            </div>
          </div>
        </div>
        <RouterLink
          :to="{ name: 'mobile-agent', query: { from: 'home', agentType: 'share' } }"
          class="home-entry__card-action home-entry__card-action--agent"
        >
          进入占成代理
          <span class="ml-1">→</span>
        </RouterLink>
      </div>

      <div class="home-entry__card home-entry__card--agent-rebate home-entry__card--split">
        <div class="home-entry__card-top">
          <span class="home-entry__card-icon home-entry__card-icon--agent-rebate">💸</span>
          <div class="home-entry__card-body">
            <div class="home-entry__card-title-row">
              <h2 class="home-entry__card-title">返佣代理 H5</h2>
              <RouterLink
                :to="{ name: 'agent-rebate-field-definitions' }"
                class="home-entry__card-title-link home-entry__card-title-link--rebate"
              >
                字段定义
                <span class="ml-1">→</span>
              </RouterLink>
            </div>
            <p class="home-entry__card-text">
              返佣代理身份：概况返佣比例、邀请下级配置退水等能力演示（无占成授信）。
            </p>
            <div class="home-entry__card-tags">
              <span class="home-entry__tag home-entry__tag--agent-rebate">返佣</span>
              <span class="home-entry__tag home-entry__tag--agent-rebate">退水</span>
              <span class="home-entry__tag home-entry__tag--agent-rebate">团队</span>
            </div>
          </div>
        </div>
        <RouterLink
          :to="{ name: 'mobile-agent', query: { from: 'home', agentType: 'rebate' } }"
          class="home-entry__card-action home-entry__card-action--agent-rebate"
        >
          进入返佣代理
          <span class="ml-1">→</span>
        </RouterLink>
      </div>

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

      <RouterLink to="/workspace" class="home-entry__card home-entry__card--workspace">
        <div class="home-entry__card-top">
          <span class="home-entry__card-icon home-entry__card-icon--workspace">📋</span>
          <div class="home-entry__card-body">
            <h2 class="home-entry__card-title">版本管理</h2>
            <p class="home-entry__card-text">
              按版本组织文件夹与页面副本。页面库选页内联预览，确认后保留副本；修订记录可增删改并保存本地草稿，支持 Cursor 设计模式选区。
            </p>
            <div class="home-entry__card-tags">
              <span class="home-entry__tag home-entry__tag--workspace">版本树</span>
              <span class="home-entry__tag home-entry__tag--workspace">页面库</span>
              <span class="home-entry__tag home-entry__tag--workspace">保留副本</span>
              <span class="home-entry__tag home-entry__tag--workspace">修订记录</span>
            </div>
          </div>
        </div>
        <span class="home-entry__card-action home-entry__card-action--workspace">
          进入工作台
          <span class="ml-1">→</span>
        </span>
      </RouterLink>
    </main>

    <footer class="home-entry__footer">原型环境 · 数据均为演示</footer>
  </div>
</template>
