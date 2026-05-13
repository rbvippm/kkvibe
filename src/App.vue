<script setup lang="ts">
import { ref } from 'vue'
import AgentView from './views/AgentView.vue'
import LiveRoomView from './views/LiveRoomView.vue'
import MicControlStatesView from './views/MicControlStatesView.vue'
import VoiceRoomRewardAdminView from './views/VoiceRoomRewardAdminView.vue'

type HomeLine = 'home' | 'live' | 'agent' | 'micDemo' | 'rewardAdmin'

const line = ref<HomeLine>('home')

function goLive() {
  line.value = 'live'
}

function goAgent() {
  line.value = 'agent'
}

function goMicDemo() {
  line.value = 'micDemo'
}

function goRewardAdmin() {
  line.value = 'rewardAdmin'
}

function goHome() {
  line.value = 'home'
}
</script>

<template>
  <LiveRoomView v-if="line === 'live'" @back="goHome" />
  <AgentView v-else-if="line === 'agent'" @back="goHome" />
  <MicControlStatesView v-else-if="line === 'micDemo'" @back="goHome" />
  <VoiceRoomRewardAdminView v-else-if="line === 'rewardAdmin'" @back="goHome" />
  <div
    v-else
    class="flex min-h-svh flex-col bg-[var(--bg)] text-[var(--text)] antialiased"
  >
    <header class="border-b border-[var(--border)] px-4 py-6 text-center sm:px-6 sm:py-10">
      <p class="text-xs font-medium uppercase tracking-widest text-[var(--accent)]">KK Vibe</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-h)] sm:text-3xl">
        选择业务线
      </h1>
      <p class="mx-auto mt-2 max-w-sm text-sm opacity-75">
        含直播、代理、麦控与语聊打赏后台演示入口。
      </p>
    </header>

    <main class="flex flex-1 flex-col justify-center gap-4 px-4 py-8 sm:mx-auto sm:max-w-md sm:px-6">
      <button
        type="button"
        class="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-6 text-left shadow-[var(--shadow)] transition duration-300 hover:border-amber-500/40 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.25)] active:scale-[0.99]"
        @click="goLive"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-600/20 blur-2xl transition group-hover:opacity-100"
        />
        <span class="text-3xl">📻</span>
        <h2 class="mt-3 text-lg font-semibold text-[var(--text-h)]">直播</h2>
        <p class="mt-1 text-sm opacity-80">
          语音房、麦位、听众与连麦相关能力（当前演示页）。
        </p>
        <span
          class="mt-4 inline-flex items-center text-sm font-medium text-amber-600 transition group-hover:translate-x-0.5"
        >
          进入直播
          <span class="ml-1">→</span>
        </span>
      </button>

      <button
        type="button"
        class="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-6 text-left shadow-[var(--shadow)] transition duration-300 hover:border-[var(--accent-border)] hover:shadow-[0_20px_50px_-12px_rgba(99,102,241,0.2)] active:scale-[0.99]"
        @click="goAgent"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/25 to-violet-600/20 blur-2xl transition group-hover:opacity-100"
        />
        <span class="text-3xl">🤝</span>
        <h2 class="mt-3 text-lg font-semibold text-[var(--text-h)]">代理</h2>
        <p class="mt-1 text-sm opacity-80">
          邀请码、分润概览与下级团队（模拟数据）。
        </p>
        <span
          class="mt-4 inline-flex items-center text-sm font-medium text-[var(--accent)] transition group-hover:translate-x-0.5"
        >
          进入代理中心
          <span class="ml-1">→</span>
        </span>
      </button>

      <button
        type="button"
        class="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-6 text-left shadow-[var(--shadow)] transition duration-300 hover:border-sky-500/35 hover:shadow-[0_20px_50px_-12px_rgba(56,189,248,0.18)] active:scale-[0.99]"
        @click="goMicDemo"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-sky-400/20 to-cyan-600/15 blur-2xl transition group-hover:opacity-100"
        />
        <span class="text-3xl">🎙</span>
        <h2 class="mt-3 text-lg font-semibold text-[var(--text-h)]">麦控状态</h2>
        <p class="mt-1 text-sm opacity-80">
          麦位关闭、全体禁麦、被禁麦三种表现形式（观众/管理/本人视角）。
        </p>
        <span
          class="mt-4 inline-flex items-center text-sm font-medium text-sky-600 transition group-hover:translate-x-0.5"
        >
          进入演示页
          <span class="ml-1">→</span>
        </span>
      </button>

      <button
        type="button"
        class="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-6 text-left shadow-[var(--shadow)] transition duration-300 hover:border-emerald-500/35 hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] active:scale-[0.99]"
        @click="goRewardAdmin"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-600/15 blur-2xl transition group-hover:opacity-100"
        />
        <span class="text-3xl">🎁</span>
        <h2 class="mt-3 text-lg font-semibold text-[var(--text-h)]">语聊打赏后台</h2>
        <p class="mt-1 text-sm opacity-80">
          打赏列表与结算列表，Tab 切换，筛选与表格布局对齐管理端习惯。
        </p>
        <span
          class="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 transition group-hover:translate-x-0.5"
        >
          进入后台
          <span class="ml-1">→</span>
        </span>
      </button>
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
