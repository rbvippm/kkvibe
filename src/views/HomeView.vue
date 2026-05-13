<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div
    class="flex min-h-svh flex-col bg-[var(--bg)] text-[var(--text)] antialiased"
  >
    <header class="border-b border-[var(--border)] px-4 py-6 text-center sm:px-6 sm:py-10">
      <p class="text-xs font-medium uppercase tracking-widest text-[var(--accent)]">KK Vibe</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-h)] sm:text-3xl">
        选择端类型
      </h1>
      <p class="mx-auto mt-2 max-w-sm text-sm opacity-75">
        移动端原型与 PC 管理后台分开入口，便于演示与评审。
      </p>
    </header>

    <main class="flex flex-1 flex-col justify-center gap-4 px-4 py-8 sm:mx-auto sm:max-w-md sm:px-6">
      <RouterLink
        to="/mobile"
        class="group relative block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-6 text-left shadow-[var(--shadow)] transition duration-300 hover:border-amber-500/40 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.25)] active:scale-[0.99]"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-600/20 blur-2xl transition group-hover:opacity-100"
        />
        <span class="text-3xl">📱</span>
        <h2 class="mt-3 text-lg font-semibold text-[var(--text-h)]">移动端</h2>
        <p class="mt-1 text-sm opacity-80">
          直播、代理、麦控状态等 C 端能力演示（二级路由：直播 / 代理 / 麦控）。
        </p>
        <span
          class="mt-4 inline-flex items-center text-sm font-medium text-amber-600 transition group-hover:translate-x-0.5"
        >
          进入移动端
          <span class="ml-1">→</span>
        </span>
      </RouterLink>

      <RouterLink
        to="/pc"
        class="group relative block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-6 text-left shadow-[var(--shadow)] transition duration-300 hover:border-slate-500/35 hover:shadow-[0_20px_50px_-12px_rgba(100,116,139,0.2)] active:scale-[0.99]"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-slate-400/25 to-slate-600/20 blur-2xl transition group-hover:opacity-100"
        />
        <span class="text-3xl">🖥</span>
        <h2 class="mt-3 text-lg font-semibold text-[var(--text-h)]">PC 后台</h2>
        <p class="mt-1 text-sm opacity-80">
          语聊打赏、结算等管理端布局（二级路由：语聊打赏后台）。
        </p>
        <span
          class="mt-4 inline-flex items-center text-sm font-medium text-slate-600 transition group-hover:translate-x-0.5 dark:text-slate-300"
        >
          进入 PC 后台
          <span class="ml-1">→</span>
        </span>
      </RouterLink>
    </main>

    <footer class="safe-pb shrink-0 px-4 pb-6 text-center text-xs opacity-50">
      原型环境 · 数据均为演示
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}
</style>
