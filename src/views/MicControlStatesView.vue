<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'mobile' })
}

const sceneTabs = [
  { id: 1 as const, label: '麦位关闭' },
  { id: 2 as const, label: '全体禁麦' },
  { id: 3 as const, label: '被禁麦' },
]

const eightSlots = [1, 2, 3, 4, 5, 6, 7, 8]

/** 1 麦位关闭 2 全体禁麦 3 被禁麦 */
const activeScene = ref<1 | 2 | 3>(1)
</script>

<template>
  <div class="flex min-h-svh flex-col bg-[#0f1428] text-white antialiased">
    <header
      class="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#0f1428]/95 px-4 py-3 backdrop-blur"
    >
      <button
        type="button"
        class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/10"
        @click="goBack()"
      >
        ← 返回
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-base font-semibold">麦控状态演示</h1>
        <p class="truncate text-xs text-white/50">观众 / 管理 / 本人 · 三种表现形式</p>
      </div>
    </header>

    <!-- 场景切换 -->
    <div class="flex shrink-0 gap-2 border-b border-white/10 px-3 py-3">
      <button
        v-for="tab in sceneTabs"
        :key="tab.id"
        type="button"
        class="flex-1 rounded-xl py-2.5 text-center text-xs font-semibold transition"
        :class="
          activeScene === tab.id
            ? 'bg-[#5b9bd5] text-white shadow-lg shadow-[#5b9bd5]/25'
            : 'bg-white/6 text-white/65 hover:bg-white/10'
        "
        @click="activeScene = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <main class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5 pb-10">
      <!-- ========== 场景一：麦位被关闭（观众 & 管理同一套 UI） ========== -->
      <section v-show="activeScene === 1" class="space-y-3">
        <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[13px] leading-snug text-amber-100/95">
          <span class="font-semibold text-amber-200">说明 · 观众 &amp; 管理</span>
          麦位由房主关闭时，所有人看到相同提示；上麦入口不可用，与身份（观众/房管）无关。
        </div>

        <div
          class="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e2a5e] shadow-xl"
        >
          <div class="border-b border-white/10 px-3 py-2 text-center text-xs font-medium text-white/70">
            房间预览（麦位关闭）
          </div>
          <div class="px-3 py-3">
            <div
              class="mb-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-[12px] text-white/85"
            >
              <span class="text-lg">🔒</span>
              <div>
                <p class="font-semibold text-white">麦位已关闭</p>
                <p class="mt-0.5 text-[11px] text-white/55">房主已关闭麦位，暂不可申请上麦</p>
              </div>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="n in eightSlots"
                :key="n"
                class="flex flex-col items-center opacity-55"
              >
                <div
                  class="flex aspect-square w-full max-w-[68px] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#151d40]/80"
                >
                  <span class="text-lg text-white/35">🔒</span>
                </div>
                <p class="mt-1 text-center text-[9px] text-white/40">麦位关闭</p>
              </div>
            </div>
            <p class="mt-3 text-center text-[10px] text-white/35">管理员视角与观众一致，无单独「开麦」入口</p>
          </div>
          <div class="border-t border-white/10 bg-[#151d40]/80 px-3 py-2.5">
            <div class="flex items-center gap-2 rounded-full bg-[#0f142e] px-3 py-2 opacity-50">
              <span class="text-xs text-white/45">说点什么…</span>
              <span class="ml-auto text-[10px] text-white/35">上麦已关闭</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ========== 场景二：全体禁麦（区分上麦 / 未上麦） ========== -->
      <section v-show="activeScene === 2" class="space-y-3">
        <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[13px] leading-snug text-rose-50/95">
          <span class="font-semibold text-rose-200">说明 · 观众 &amp; 管理</span>
          全体禁麦时：已在麦上者显示「闭麦」态；未上麦者不在麦位网格中，底部/听众区单独提示「未上麦 · 受全体禁麦约束」。
        </div>

        <div
          class="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e2a5e] shadow-xl"
        >
          <div
            class="flex items-center gap-2 border-b border-white/10 bg-rose-950/40 px-3 py-2 text-[12px] text-rose-100/95"
          >
            <span class="text-base">🎙</span>
            <div>
              <p class="font-semibold">全体禁麦中</p>
              <p class="text-[11px] text-rose-200/80">仅房主 / 指定角色可发言（演示）</p>
            </div>
          </div>

          <div class="px-3 py-3">
            <p class="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/45">上麦用户</p>
            <div class="grid grid-cols-4 gap-2">
              <div class="flex flex-col items-center">
                <div class="relative aspect-square w-full max-w-[68px] rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] ring-1 ring-white/15">
                  <span class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90">房</span>
                  <div
                    class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 ring-1 ring-rose-500/50"
                    title="全体禁麦 · 语音关闭"
                  >
                    <svg class="h-3 w-3 text-rose-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                        stroke="currentColor"
                        stroke-width="1.6"
                      />
                      <path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>
                <p class="mt-1 truncate text-[10px] text-white/75">房主</p>
              </div>
              <div class="flex flex-col items-center">
                <div class="relative aspect-square w-full max-w-[68px] rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] ring-1 ring-rose-400/35">
                  <span class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90">A</span>
                  <div class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65">
                    <svg class="h-3 w-3 text-rose-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                        stroke="currentColor"
                        stroke-width="1.6"
                      />
                      <path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>
                <p class="mt-1 truncate text-[10px] text-white/75">麦上·用户A</p>
              </div>
              <div class="flex flex-col items-center">
                <div class="relative aspect-square w-full max-w-[68px] rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] ring-1 ring-rose-400/35">
                  <span class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90">B</span>
                  <div class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65">
                    <svg class="h-3 w-3 text-rose-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                        stroke="currentColor"
                        stroke-width="1.6"
                      />
                      <path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>
                <p class="mt-1 truncate text-[10px] text-white/75">麦上·用户B</p>
              </div>
              <div class="flex flex-col items-center opacity-40">
                <div
                  class="flex aspect-square w-full max-w-[68px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#151d40]/60"
                >
                  <span class="text-lg">+</span>
                </div>
                <p class="mt-1 text-[9px] text-white/45">空麦</p>
              </div>
            </div>

            <p class="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-white/45">未上麦用户（听众 / 含管理员自己未上麦时）</p>
            <div class="space-y-2 rounded-xl border border-white/10 bg-black/20 p-2.5">
              <div class="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-2">
                <div class="flex items-center gap-2">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/40 text-xs font-bold">听</span>
                  <div>
                    <p class="text-[12px] font-medium text-white/90">听众小陈</p>
                    <p class="text-[10px] text-white/45">未上麦</p>
                  </div>
                </div>
                <span class="shrink-0 rounded-full bg-rose-500/25 px-2 py-0.5 text-[10px] font-semibold text-rose-200 ring-1 ring-rose-400/30">
                  全体禁麦
                </span>
              </div>
              <div class="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-2">
                <div class="flex items-center gap-2">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/35 text-xs font-bold">管</span>
                  <div>
                    <p class="text-[12px] font-medium text-white/90">管理员（未上麦）</p>
                    <p class="text-[10px] text-white/45">未上麦 · 与观众同一约束</p>
                  </div>
                </div>
                <span class="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/55 ring-1 ring-white/15">
                  不可语音
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========== 场景三：被禁麦（区分本人上麦 / 本人未上麦） ========== -->
      <section v-show="activeScene === 3" class="space-y-4">
        <div class="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-[13px] leading-snug text-violet-50/95">
          <span class="font-semibold text-violet-200">说明 · 仅你被禁麦</span>
          与全体禁麦不同：他人可能仍可发言。需区分「我已在麦」与「我未上麦」两种布局与文案。
        </div>

        <div>
          <p class="mb-2 text-xs font-semibold text-white/55">表现形式 A · 我已在麦上</p>
          <div
            class="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e2a5e] shadow-xl"
          >
            <div class="px-3 py-3">
              <div class="grid grid-cols-4 gap-2">
                <div class="flex flex-col items-center">
                  <div class="relative aspect-square w-full max-w-[68px] rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] ring-2 ring-rose-500/70">
                    <span class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90">我</span>
                    <div
                      class="absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white shadow"
                    >
                      你被禁麦
                    </div>
                    <div class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65">
                      <svg class="h-3 w-3 text-rose-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                          stroke="currentColor"
                          stroke-width="1.6"
                        />
                        <path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 truncate text-[10px] text-rose-200/90">本人（禁麦）</p>
                </div>
                <div class="flex flex-col items-center">
                  <div class="relative aspect-square w-full max-w-[68px] rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] ring-1 ring-white/15">
                    <span class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90">他</span>
                    <div class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/20">
                      <svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                          stroke="currentColor"
                          stroke-width="1.6"
                        />
                      </svg>
                    </div>
                  </div>
                  <p class="mt-1 truncate text-[10px] text-white/75">其他用户</p>
                </div>
              </div>
              <p class="mt-2 text-center text-[10px] text-white/45">麦位仍保留，仅你的麦克风被单独关闭</p>
            </div>
            <div class="border-t border-white/10 bg-[#151d40]/80 px-3 py-2.5">
              <p class="text-center text-[11px] text-rose-200/90">下麦旁显示「你被禁麦」· 开麦按钮不可用</p>
            </div>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs font-semibold text-white/55">表现形式 B · 我未上麦</p>
          <div
            class="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e2a5e] shadow-xl"
          >
            <div class="border-b border-white/10 px-3 py-2">
              <p class="text-[11px] text-white/55">麦位区 · 无「我」的头像</p>
            </div>
            <div class="px-3 py-3">
              <div class="grid grid-cols-4 gap-2 opacity-90">
                <div v-for="c in ['1', '2', '3', '4']" :key="c" class="flex flex-col items-center">
                  <div class="aspect-square w-full max-w-[68px] rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] ring-1 ring-white/15">
                    <span class="flex h-full w-full items-center justify-center text-lg font-bold text-white/80">{{ c }}</span>
                  </div>
                  <p class="mt-1 text-[9px] text-white/45">麦上用户</p>
                </div>
              </div>
              <div class="mt-3 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3 py-3">
                <div class="flex items-start gap-2">
                  <span class="text-lg">⚠️</span>
                  <div>
                    <p class="text-[13px] font-semibold text-rose-100">你已被禁麦（未上麦）</p>
                    <p class="mt-1 text-[11px] leading-relaxed text-rose-200/75">
                      当前不可申请上麦；若上麦后将自动保持闭麦，直至房主解除。
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                <span class="text-[11px] text-white/55">其他未上麦听众</span>
                <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-200 ring-1 ring-emerald-400/25">
                  未单独禁麦 · 可正常听
                </span>
              </div>
            </div>
            <div class="border-t border-white/10 bg-[#151d40]/80 px-3 py-2.5">
              <div class="flex items-center gap-2 rounded-full bg-[#0f142e] px-3 py-2 opacity-60">
                <span class="text-xs text-white/45">说点什么…</span>
                <span class="ml-auto text-[10px] text-rose-300/90">语音/上麦不可用</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
