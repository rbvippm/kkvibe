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
      <p class="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
        一级路由 · /pc
      </p>
      <h1 class="mt-1 text-xl font-semibold text-[var(--text-h)] sm:text-2xl">PC 后台</h1>
      <p class="mt-1 text-sm opacity-75">以下为二级路由入口</p>
    </header>

    <main class="flex flex-1 flex-col gap-3 px-4 py-6 sm:mx-auto sm:max-w-lg sm:px-6">
      <RouterLink
        to="/pc/reward"
        class="group rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-5 shadow-[var(--shadow)] transition hover:border-emerald-500/35 active:scale-[0.99]"
      >
        <span class="text-2xl">🎁</span>
        <h2 class="mt-2 text-base font-semibold text-[var(--text-h)]">语聊打赏后台</h2>
        <p class="mt-1 text-xs opacity-75">/pc/reward</p>
        <p class="mt-2 text-sm opacity-80">打赏列表与结算列表，筛选与表格布局。</p>
      </RouterLink>
    </main>

    <footer class="safe-pb px-4 pb-6 text-center text-xs opacity-50">管理端原型</footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}
</style>
