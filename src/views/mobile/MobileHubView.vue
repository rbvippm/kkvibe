<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div
    class="flex min-h-svh flex-col bg-[var(--bg)] text-[var(--text)] antialiased"
  >
    <header class="border-b border-[var(--border)] px-4 py-5 sm:px-6">
      <RouterLink
        to="/"
        class="mb-3 inline-flex items-center text-sm text-[var(--accent)] transition hover:opacity-80"
      >
        ← 返回首页
      </RouterLink>
      <p class="text-xs font-medium uppercase tracking-widest text-amber-600/90">一级路由 · /mobile</p>
      <h1 class="mt-1 text-xl font-semibold text-[var(--text-h)] sm:text-2xl">移动端</h1>
      <p class="mt-1 text-sm opacity-75">以下为二级路由入口</p>
    </header>

    <main class="flex flex-1 flex-col gap-3 px-4 py-6 sm:mx-auto sm:max-w-md sm:px-6">
      <RouterLink
        to="/mobile/live"
        class="group rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-5 shadow-[var(--shadow)] transition hover:border-amber-500/35 active:scale-[0.99]"
      >
        <span class="text-2xl">📻</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">直播</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/live</p>
        <p class="mt-2 text-sm opacity-80">语音房、麦位、听众与连麦演示。</p>
      </RouterLink>

      <RouterLink
        to="/mobile/agent"
        class="group rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-5 shadow-[var(--shadow)] transition hover:border-[var(--accent-border)] active:scale-[0.99]"
      >
        <span class="text-2xl">🤝</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">代理</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/agent</p>
        <p class="mt-2 text-sm opacity-80">邀请码、分润与团队（模拟数据）。</p>
      </RouterLink>

      <RouterLink
        to="/mobile/mic"
        class="group rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-5 shadow-[var(--shadow)] transition hover:border-sky-500/35 active:scale-[0.99]"
      >
        <span class="text-2xl">🎙</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">麦控状态</h2>
        <p class="mt-1 text-xs opacity-75">/mobile/mic</p>
        <p class="mt-2 text-sm opacity-80">麦位关闭、全体禁麦、被禁麦等态。</p>
      </RouterLink>
    </main>

    <footer class="safe-pb px-4 pb-6 text-center text-xs opacity-50">移动端原型</footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}
</style>
