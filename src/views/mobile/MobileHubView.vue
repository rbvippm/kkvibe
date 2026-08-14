<script setup lang="ts">
import { RouterLink } from 'vue-router'
import '../../styles/mobile-h5.css'
</script>

<template>
  <div class="mh5-page">
    <header class="mh5-header sm:px-6">
      <RouterLink to="/" class="mh5-back mb-3 inline-flex">{{ $t('← 返回首页') }}</RouterLink>
      <p class="mh5-eyebrow mh5-eyebrow--amber">{{ $t('一级路由 · /mobile') }}</p>
      <h1 class="mh5-title sm:text-2xl">{{ $t('移动端') }}</h1>
      <p class="mh5-desc">{{ $t('以下为二级路由入口') }}</p>
    </header>

    <main class="mh5-main sm:mx-auto sm:max-w-md sm:px-6">
      <RouterLink
        to="/mobile/live"
        class="mh5-hub-link group hover:border-amber-500/35"
      >
        <span class="text-2xl">📻</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">{{ $t('直播') }}</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/live</p>
        <p class="mt-2 text-sm opacity-80">{{ $t('语音房、麦位、听众与连麦演示。') }}</p>
      </RouterLink>

      <RouterLink
        to="/mobile/agent"
        class="mh5-hub-link group hover:border-[var(--accent-border)]"
      >
        <span class="text-2xl">🤝</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">{{ $t('代理') }}</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/agent</p>
        <p class="mt-2 text-sm opacity-80">{{ $t('邀请码、分润与团队（模拟数据）。') }}</p>
      </RouterLink>

      <RouterLink
        to="/mobile/mic"
        class="mh5-hub-link group hover:border-sky-500/35"
      >
        <span class="text-2xl">🎙</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">{{ $t('麦控状态') }}</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/mic</p>
        <p class="mt-2 text-sm opacity-80">{{ $t('麦位关闭、全体禁麦、被禁麦等态。') }}</p>
      </RouterLink>

      <RouterLink
        to="/mobile/app-join-mic"
        class="mh5-hub-link group hover:border-orange-500/40"
      >
        <span class="text-2xl">📲</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">{{ $t('APP 专享上麦') }}</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/app-join-mic</p>
        <p class="mt-2 text-sm opacity-80">{{ $t('已装 App 则唤起；未装则跳转超级签下载页（与直播 7、8 麦一致）。') }}</p>
      </RouterLink>

      <RouterLink
        to="/mobile/live-start-notice"
        class="mh5-hub-link group hover:border-rose-500/40"
      >
        <span class="text-2xl">🔔</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">{{ $t('开播通知') }}</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/live-start-notice</p>
        <p class="mt-2 text-sm opacity-80">{{ $t('全局顶部浮窗：主播开播、大神语聊房上麦。规范见 docs/H5移动端设计规范.md。') }}</p>
      </RouterLink>
    </main>

    <footer class="mh5-footer">{{ $t('移动端原型') }}</footer>
  </div>
</template>
