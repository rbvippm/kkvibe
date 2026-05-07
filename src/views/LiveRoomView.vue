<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

type SeatUser = {
  id: string
  name: string
  tag?: string
  speaking?: boolean
  muted?: boolean
}

const emit = defineEmits<{
  back: []
}>()

const roomTitle = ref('深夜 FM · 读诗房间')
const roomTopic = ref('今晚主题：城市孤独感与一首晚安曲')

const micOn = ref(true)
const handRaised = ref(false)

const onStage = ref<SeatUser[]>([
  { id: '1', name: '阿晨', tag: '房主', speaking: true, muted: false },
  { id: '2', name: '南岸', tag: '嘉宾', speaking: false, muted: false },
  { id: '3', name: '椰子', tag: '', speaking: false, muted: true },
  { id: '4', name: '麦位空', tag: '空位', speaking: false, muted: true },
])

const listeners = ref<SeatUser[]>([
  { id: 'l1', name: '小猫电台', muted: true },
  { id: 'l2', name: '匿名用户', muted: true },
  { id: 'l3', name: 'Echo', muted: true },
  { id: 'l4', name: '听众 047', muted: true },
  { id: 'l5', name: '听众 048', muted: true },
])

const onlineCount = computed(() => onStage.value.length + listeners.value.length)

function toggleMic() {
  micOn.value = !micOn.value
}

function toggleHand() {
  handRaised.value = !handRaised.value
}

function cycleSpeakingDemo() {
  const idx = onStage.value.findIndex((u) => u.speaking)
  const next = idx === -1 ? 0 : (idx + 1) % onStage.value.length
  onStage.value = onStage.value.map((u, i) => ({
    ...u,
    speaking: i === next,
  }))
}

const demoTimer = setInterval(cycleSpeakingDemo, 3200)
onUnmounted(() => clearInterval(demoTimer))
</script>

<template>
  <div
    class="voice-room flex min-h-svh flex-col bg-[var(--bg)] text-[var(--text)] antialiased"
  >
    <header
      class="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-6"
    >
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <button
          type="button"
          class="mt-0.5 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--social-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-h)] transition hover:border-[var(--accent-border)]"
          @click="emit('back')"
        >
          ← 返回
        </button>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
            直播 · 语音房原型
          </p>
          <h1 class="mt-1 truncate text-lg font-semibold text-[var(--text-h)] sm:text-xl">
            {{ roomTitle }}
          </h1>
          <p class="mt-1 line-clamp-2 text-sm opacity-90">
            {{ roomTopic }}
          </p>
        </div>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-2">
        <span
          class="rounded-full border border-[var(--border)] bg-[var(--social-bg)] px-3 py-1 text-xs tabular-nums text-[var(--text-h)]"
        >
          {{ onlineCount }} 人在线
        </span>
        <button
          type="button"
          class="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
        >
          离开房间
        </button>
      </div>
    </header>

    <main class="flex flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6">
      <section class="shrink-0">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-medium text-[var(--text-h)]">麦上</h2>
          <span class="text-xs opacity-70">点击为演示 · 说话光圈自动轮换</span>
        </div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            v-for="user in onStage"
            :key="user.id"
            type="button"
            class="group flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-4 text-center transition hover:border-[var(--accent-border)] hover:shadow-[var(--shadow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            @click="cycleSpeakingDemo"
          >
            <div class="relative">
              <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 text-lg font-semibold text-amber-950 ring-2 ring-amber-700/40 transition group-hover:ring-amber-500"
                :class="
                  user.speaking
                    ? 'shadow-[0_0_0_4px_rgba(251,191,36,0.45),0_0_26px_rgba(217,119,6,0.55)]'
                    : ''
                "
              >
                {{ user.name.slice(0, 1) }}
              </div>
              <span
                v-if="user.muted"
                class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[10px]"
                aria-label="闭麦"
              >
                🔇
              </span>
              <span
                v-else-if="user.speaking"
                class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[10px]"
                aria-label="发言中"
              >
                🎙
              </span>
            </div>
            <p class="mt-3 w-full truncate text-sm font-medium text-[var(--text-h)]">
              {{ user.name }}
            </p>
            <p v-if="user.tag" class="mt-0.5 text-xs text-[var(--accent)]">
              {{ user.tag }}
            </p>
          </button>
        </div>
      </section>

      <section class="mt-8 flex min-h-0 flex-1 flex-col">
        <h2 class="mb-3 shrink-0 text-sm font-medium text-[var(--text-h)]">
          听众席 · {{ listeners.length }} 人
        </h2>
        <div
          class="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--code-bg)]/40 p-3"
        >
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="u in listeners"
              :key="u.id"
              class="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--text-h)]"
            >
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--social-bg)] text-[11px] font-medium"
              >
                {{ u.name.slice(0, 1) }}
              </span>
              <span class="max-w-[8rem] truncate">{{ u.name }}</span>
              <span v-if="u.muted" class="opacity-50" title="闭麦">🔇</span>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <footer
      class="safe-pb flex shrink-0 items-center justify-center gap-3 border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4 sm:gap-4"
    >
      <button
        type="button"
        class="flex h-12 min-w-[5.5rem] flex-col items-center justify-center rounded-xl border px-3 text-xs font-medium transition sm:h-14 sm:min-w-[6rem] sm:text-sm"
        :class="
          micOn
            ? 'border-[var(--border)] bg-[var(--social-bg)] text-[var(--text-h)] hover:border-[var(--accent-border)]'
            : 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]'
        "
        @click="toggleMic"
      >
        <span class="text-base sm:text-lg">{{ micOn ? '🎙' : '🔇' }}</span>
        <span>{{ micOn ? '麦克风开' : '麦克风关' }}</span>
      </button>

      <button
        type="button"
        class="flex h-12 min-w-[5.5rem] flex-col items-center justify-center rounded-xl border px-3 text-xs font-medium transition sm:h-14 sm:min-w-[6rem] sm:text-sm"
        :class="
          handRaised
            ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border)] bg-[var(--social-bg)] text-[var(--text-h)] hover:border-[var(--accent-border)]'
        "
        @click="toggleHand"
      >
        <span class="text-base sm:text-lg">✋</span>
        <span>{{ handRaised ? '已举手' : '举手' }}</span>
      </button>

      <button
        type="button"
        class="flex h-12 min-w-[5.5rem] flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--social-bg)] px-3 text-xs font-medium text-[var(--text-h)] opacity-80 sm:h-14 sm:min-w-[6rem] sm:text-sm"
        disabled
      >
        <span class="text-base sm:text-lg">💬</span>
        <span>公屏</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.safe-pb {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
