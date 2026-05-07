<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  back: []
}>()

type SubAgent = {
  id: string
  nickname: string
  level: '一级' | '二级'
  monthGmv: string
  status: '活跃' | '沉默' | '待激活'
}

const inviteCode = ref('KK-VIBE-8F2A')
const copied = ref(false)

const stats = ref({
  monthEstimate: '¥ 12,860.00',
  settled: '¥ 8,420.00',
  pending: '¥ 4,440.00',
  activeSubs: 18,
})

const subAgents = ref<SubAgent[]>([
  { id: 'a1', nickname: '小北_渠道', level: '一级', monthGmv: '¥ 42,300', status: '活跃' },
  { id: 'a2', nickname: '阿鹿推广', level: '一级', monthGmv: '¥ 18,900', status: '活跃' },
  { id: 'a3', nickname: '匿名代理 09', level: '二级', monthGmv: '¥ 3,200', status: '沉默' },
  { id: 'a4', nickname: '城市合伙人·南', level: '一级', monthGmv: '¥ 0', status: '待激活' },
  { id: 'a5', nickname: 'Echo 工作室', level: '二级', monthGmv: '¥ 6,750', status: '活跃' },
])

function statusClass(s: SubAgent['status']) {
  if (s === '活跃') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
  if (s === '沉默') return 'border-[var(--border)] bg-[var(--code-bg)]/60 text-[var(--text)] opacity-80'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-700'
}

async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh flex-col bg-[var(--bg)] text-[var(--text)] antialiased">
    <header
      class="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-6"
    >
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--social-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]"
          @click="emit('back')"
        >
          ← 返回
        </button>
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">代理中心</p>
          <h1 class="truncate text-lg font-semibold text-[var(--text-h)] sm:text-xl">分润与团队</h1>
        </div>
      </div>
    </header>

    <main class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5 sm:px-6">
      <!-- 邀请码 -->
      <section
        class="rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-4 transition hover:border-[var(--accent-border)]/60"
      >
        <p class="text-xs font-medium text-[var(--text-h)]">我的邀请码</p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <code
            class="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm tracking-wide text-[var(--text-h)]"
          >
            {{ inviteCode }}
          </code>
          <button
            type="button"
            class="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:opacity-90"
            @click="copyInvite"
          >
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        <p class="mt-2 text-xs opacity-70">新用户通过邀请码注册后，自动绑定为你的下级（演示数据）。</p>
      </section>

      <!-- 数据概览 -->
      <section>
        <h2 class="mb-3 text-sm font-medium text-[var(--text-h)]">本月概览</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="(item, key) in [
              { label: '预估分润', value: stats.monthEstimate },
              { label: '已结算', value: stats.settled },
              { label: '待结算', value: stats.pending },
              { label: '活跃下级', value: String(stats.activeSubs) + ' 人' },
            ]"
            :key="key"
            class="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)]/35 p-3"
          >
            <p class="text-[11px] opacity-70">{{ item.label }}</p>
            <p class="mt-1 text-sm font-semibold tabular-nums text-[var(--text-h)] sm:text-base">
              {{ item.value }}
            </p>
          </div>
        </div>
      </section>

      <!-- 下级列表 -->
      <section class="min-h-0 flex-1 pb-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-medium text-[var(--text-h)]">团队列表</h2>
          <span class="text-xs opacity-60">共 {{ subAgents.length }} 人</span>
        </div>
        <ul class="flex flex-col gap-2">
          <li
            v-for="row in subAgents"
            :key="row.id"
            class="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--social-bg)] px-3 py-3 transition hover:border-[var(--accent-border)]/50"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-sm font-semibold text-[var(--text-h)]"
              >
                {{ row.nickname.slice(0, 1) }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-[var(--text-h)]">{{ row.nickname }}</p>
                <p class="text-xs opacity-70">{{ row.level }} · 本月流水 {{ row.monthGmv }}</p>
              </div>
            </div>
            <span
              class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium"
              :class="statusClass(row.status)"
            >
              {{ row.status }}
            </span>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
