<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { APP_JOIN_MIC } from '../config/appJoinMic'
import { openJoinMicAppOrDownload } from '../utils/joinMicAppBridge'
import '../styles/mobile-app-shell.css'

const { embedded = false } = defineProps<{ embedded?: boolean }>()

const demoRoomId = 'demo_voice_room_001'
const lastTip = ref('')

function tryJoin(seat: number) {
  lastTip.value = `已尝试唤起 App（${seat} 麦）… 若未安装将跳转安装页。`
  openJoinMicAppOrDownload(demoRoomId, seat)
}
</script>

<template>
  <div
    class="flex flex-col antialiased"
    :class="
      embedded
        ? 'mh5-embedded-page mh5-embedded-light bg-[#f5f6f8]'
        : 'min-h-svh bg-[var(--bg)] text-[var(--text)]'
    "
  >
    <header v-if="!embedded" class="border-b border-[var(--border)] px-4 py-4">
      <h1 class="text-lg font-semibold text-[var(--text-h)]">APP 专享上麦（唤起 / 超级签）</h1>
      <p class="mt-1 text-xs leading-relaxed opacity-75">
        点击空麦「加入 N 麦」→ 优先通过 URL Scheme 打开已安装 App；若仍停留在浏览器，则跳转超级签安装页。
      </p>
    </header>
    <header v-else class="mh5-embedded-head">
      <h1 class="mh5-embedded-head__title">APP 专享上麦</h1>
      <p class="mh5-embedded-head__desc">7、8 麦唤起 App 或跳转超级签安装页</p>
    </header>

    <main class="flex flex-1 flex-col gap-4 px-4 py-5">
      <section class="rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-4 shadow-[var(--shadow)]">
        <h2 class="text-sm font-semibold text-[var(--text-h)]">当前配置（改 `src/config/appJoinMic.ts`）</h2>
        <dl class="mt-3 space-y-2 text-xs">
          <div class="flex justify-between gap-2">
            <dt class="opacity-60">Scheme</dt>
            <dd class="font-mono text-right text-[var(--text-h)]">{{ APP_JOIN_MIC.scheme }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="opacity-60">示例 Deep Link</dt>
            <dd class="max-w-[58%] break-all font-mono text-right text-[var(--text-h)]">
              {{ APP_JOIN_MIC.scheme }}{{ APP_JOIN_MIC.buildPath(demoRoomId, 7) }}
            </dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="opacity-60">超级签落地页</dt>
            <dd class="max-w-[58%] break-all text-right text-[var(--accent)]">
              {{ APP_JOIN_MIC.downloadPageUrl }}
            </dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="opacity-60">探测等待</dt>
            <dd class="text-right">{{ APP_JOIN_MIC.appOpenProbeMs }} ms</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-4 shadow-[var(--shadow)]">
        <h2 class="text-sm font-semibold text-[var(--text-h)]">本页快速试连</h2>
        <p class="mt-1 text-xs opacity-70">与直播演示页 7、8 麦行为一致。</p>
        <div class="mt-4 flex gap-3">
          <button
            type="button"
            :class="
              embedded
                ? 'mh5-embedded-action-btn'
                : 'flex-1 rounded-xl border border-amber-500/40 bg-amber-500/15 py-3 text-sm font-semibold text-amber-800 transition active:scale-[0.99]'
            "
            @click="tryJoin(7)"
          >
            加入 7 麦（APP 专享）
          </button>
          <button
            type="button"
            :class="
              embedded
                ? 'mh5-embedded-action-btn'
                : 'flex-1 rounded-xl border border-amber-500/40 bg-amber-500/15 py-3 text-sm font-semibold text-amber-800 transition active:scale-[0.99]'
            "
            @click="tryJoin(8)"
          >
            加入 8 麦（APP 专享）
          </button>
        </div>
        <p v-if="lastTip" class="mt-3 text-xs text-[var(--accent)] transition-opacity">{{ lastTip }}</p>
      </section>

      <RouterLink
        v-if="!embedded"
        to="/mobile/live/room"
        class="block rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--social-bg)]"
      >
        去语聊房看 7、8 麦 UI →
      </RouterLink>
    </main>
  </div>
</template>
