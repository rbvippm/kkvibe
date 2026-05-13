<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'mobile' })
}

/** 麦位角色：主播 / 房管 / 普通（无角标） */
type MicRole = 'anchor' | 'admin' | 'none'

type MicSeat =
  | {
      id: string
      empty: false
      name: string
      /** 头像占位：首字或 emoji */
      avatar: string
      /** 发言中：外圈蓝光动画 */
      speaking: boolean
      /** 语音开启：白麦；关闭：红麦+斜杠 */
      voiceOn: boolean
      role: MicRole
    }
  | {
      id: string
      empty: true
      /** 1–8 麦序号，用于「加入N麦」 */
      micIndex: number
    }

const roomTitle = ref('直接上高速')
const heatText = ref('热度: 10k')
const viewerCount = ref('1.2w')

const viewerAvatars = ref(['K', '猫', '南', 'E', '7'])

const floatGame1 = ref(true)
const floatGame2 = ref(true)

const selfMicOn = ref(true)

/** 8 麦位：含主播、房管、发言中/闭麦等演示态 */
const seats = ref<MicSeat[]>([
  {
    id: 's1',
    empty: false,
    name: '小旋风',
    avatar: '旋',
    speaking: true,
    voiceOn: true,
    role: 'anchor',
  },
  {
    id: 's2',
    empty: false,
    name: '房管小陈',
    avatar: '陈',
    speaking: false,
    voiceOn: true,
    role: 'admin',
  },
  {
    id: 's3',
    empty: false,
    name: '南岸听风',
    avatar: '南',
    speaking: false,
    voiceOn: false,
    role: 'none',
  },
  {
    id: 's4',
    empty: false,
    name: '椰子不加糖',
    avatar: '椰',
    speaking: false,
    voiceOn: true,
    role: 'none',
  },
  {
    id: 's5',
    empty: false,
    name: 'Echo电台',
    avatar: 'E',
    speaking: false,
    voiceOn: true,
    role: 'none',
  },
  {
    id: 's6',
    empty: false,
    name: '匿名用户',
    avatar: '匿',
    speaking: false,
    voiceOn: true,
    role: 'none',
  },
  { id: 's7', empty: true, micIndex: 7 },
  { id: 's8', empty: true, micIndex: 8 },
])

type ChatLine =
  | { type: 'enter'; text: string; user: string; level?: string }
  | { type: 'system'; text: string }
  | { type: 'chat'; user: string; text: string }
  | { type: 'gift'; user: string; gift: string; count: number }

const chatLines = ref<ChatLine[]>([
  { type: 'enter', user: 'KINYU', level: 'Lv.12', text: '进入直播间 热烈欢迎!' },
  {
    type: 'system',
    text: '欢迎来到语音直播间，请文明发言，禁止低俗、引流与违规内容。',
  },
  { type: 'chat', user: '南岸听风', text: '晚上好各位～' },
  { type: 'chat', user: '小猫电台', text: '主播声音好听' },
  { type: 'gift', user: 'J***', gift: '小心心', count: 15 },
  { type: 'chat', user: 'Echo', text: '求连麦' },
])

const statusTime = ref('')
function tickTime() {
  const d = new Date()
  statusTime.value = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
tickTime()
const timeTimer = setInterval(tickTime, 30_000)

/** 轮换「发言中」演示 */
function cycleSpeakingDemo() {
  const occupied = seats.value
    .map((s, i) => ({ s, i }))
    .filter((x): x is { s: Extract<MicSeat, { empty: false }>; i: number } => !x.s.empty)
  if (occupied.length === 0) return
  const speakingIdx = occupied.findIndex((x) => x.s.speaking)
  const next = (speakingIdx + 1) % occupied.length
  seats.value = seats.value.map((seat, i) => {
    if (seat.empty) return seat
    const oi = occupied.findIndex((x) => x.i === i)
    if (oi === -1) return seat
    return { ...seat, speaking: oi === next }
  })
}

const demoTimer = setInterval(cycleSpeakingDemo, 3200)

onUnmounted(() => {
  clearInterval(timeTimer)
  clearInterval(demoTimer)
})

function roleBadgeClass(role: MicRole) {
  if (role === 'admin') return 'bg-[#5b9bd5] text-white'
  return ''
}

function roleBadgeText(role: MicRole) {
  if (role === 'admin') return '管'
  return ''
}

const onlineHint = computed(() => `${viewerCount.value} 在看`)
</script>

<template>
  <div
    class="live-room relative mx-auto flex min-h-svh max-w-[430px] flex-col bg-[#1e2a5e] text-white antialiased"
  >
    <!-- 状态栏 -->
    <div
      class="flex shrink-0 items-center justify-between px-4 pb-1 pt-[max(8px,env(safe-area-inset-top))] text-[12px] text-white/90"
    >
      <span class="tabular-nums font-medium">{{ statusTime }}</span>
      <div class="flex items-center gap-1.5">
        <span class="text-[11px] opacity-90">●●●●</span>
        <svg class="h-3.5 w-4 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C15.34 2.34 8.66 2.34 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.67 10.34 8.33 10.34 5 13z"
          />
        </svg>
        <span class="tabular-nums">100%</span>
      </div>
    </div>

    <!-- 顶栏：房间信息 -->
    <header class="flex shrink-0 items-center gap-2 px-3 pb-2 pt-1">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white/70"
      >
        直
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-[15px] font-bold leading-tight">
          {{ roomTitle }}
        </p>
        <p class="mt-0.5 text-[11px] text-white/55">
          {{ heatText }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-full bg-gradient-to-b from-[#ff9f4a] to-[#ff7a2b] px-3.5 py-1 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(255,122,43,0.35)] transition active:scale-[0.98]"
      >
        关注
      </button>
      <div class="flex shrink-0 items-center gap-1.5 pl-1">
        <div class="flex -space-x-2">
          <span
            v-for="(a, i) in viewerAvatars"
            :key="i"
            class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1e2a5e] bg-gradient-to-br from-indigo-400/80 to-purple-600/80 text-[10px] font-bold"
          >
            {{ a }}
          </span>
        </div>
        <span class="text-[12px] font-semibold tabular-nums text-white/95">{{ viewerCount }}</span>
        <button
          type="button"
          class="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
          aria-label="关闭"
          @click="goBack()"
        >
          <span class="text-lg leading-none">×</span>
        </button>
      </div>
    </header>

    <!-- 麦位 4×2 -->
    <section class="shrink-0 px-3 pt-1">
      <div class="grid grid-cols-4 gap-x-2 gap-y-3">
        <div
          v-for="seat in seats"
          :key="seat.id"
          class="flex flex-col items-center"
        >
          <template v-if="!seat.empty">
            <div
              class="relative aspect-square w-full max-w-[76px] rounded-xl transition-[box-shadow]"
              :class="
                seat.speaking
                  ? 'live-speaking-ring shadow-[0_0_0_2px_rgba(91,198,255,0.95),0_0_18px_rgba(91,198,255,0.55)]'
                  : 'ring-1 ring-white/12'
              "
            >
              <div
                class="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#3d4d8a] to-[#252f5c] text-xl font-bold text-white/90"
              >
                {{ seat.avatar }}
              </div>
              <!-- 麦状态角标：语音开/关 -->
              <div
                class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/20"
                :title="seat.voiceOn ? '语音开启' : '语音关闭'"
              >
                <template v-if="seat.voiceOn">
                  <svg class="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                      stroke="currentColor"
                      stroke-width="1.6"
                    />
                    <path d="M8 11v1a4 4 0 0 0 8 0v-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M12 18v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </template>
                <template v-else>
                  <svg class="h-3.5 w-3.5 text-[#ff4d4f]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
                      stroke="currentColor"
                      stroke-width="1.6"
                    />
                    <path d="M8 11v1a4 4 0 0 0 8 0v-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M5 5l14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </template>
              </div>
              <!-- 发言中角标 -->
              <div
                v-if="seat.speaking"
                class="absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#5bc6ff]/95 px-1.5 py-0.5 text-[9px] font-bold text-[#0a1a2e] shadow-sm"
              >
                发言中
              </div>
            </div>
            <div class="mt-1.5 flex max-w-[76px] items-center justify-center gap-1 px-0.5">
              <!-- 主播：图标角标（替代「主」字） -->
              <span
                v-if="seat.role === 'anchor'"
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e879a9] text-white shadow-sm"
                title="主播"
              >
                <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                  <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M8.5 12.5a3.5 3.5 0 0 1 7 0" />
                  <path d="M6 9.5a6 6 0 0 1 12 0" />
                  <path d="M3.5 6.5a8.5 8.5 0 0 1 17 0" />
                </svg>
              </span>
              <!-- 房管：「管」字角标 -->
              <span
                v-else-if="seat.role === 'admin'"
                class="flex h-4 min-w-[15px] shrink-0 items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none"
                :class="roleBadgeClass(seat.role)"
                title="房管"
              >
                {{ roleBadgeText(seat.role) }}
              </span>
              <span class="truncate text-center text-[10px] font-medium text-white/90">{{ seat.name }}</span>
            </div>
          </template>
          <template v-else>
            <button
              type="button"
              class="flex aspect-square w-full max-w-[76px] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#151d40]/90 text-white/75 transition hover:border-white/35 hover:bg-[#1a2450]"
            >
              <span class="text-2xl font-light leading-none">+</span>
            </button>
            <p class="mt-1.5 text-center text-[10px] text-white/65">加入{{ seat.micIndex }}麦</p>
          </template>
        </div>
      </div>
    </section>

    <!-- 公屏 + 右侧悬浮 -->
    <div class="relative mt-2 min-h-0 flex-1 px-3 pb-[calc(3.25rem+env(safe-area-inset-bottom))]">
      <!-- 悬浮游戏位 -->
      <div class="pointer-events-none absolute right-0 top-0 z-10 flex w-[72px] flex-col gap-2 pr-1 pt-1">
        <div v-if="floatGame1" class="pointer-events-auto relative">
          <button
            type="button"
            class="absolute right-0.5 top-0.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 text-[11px] text-white/90"
            aria-label="关闭"
            @click="floatGame1 = false"
          >
            ×
          </button>
          <div
            class="overflow-hidden rounded-lg border border-white/15 bg-gradient-to-b from-[#2a3570] to-[#1a2248] shadow-lg"
          >
            <div class="h-14 w-full bg-gradient-to-br from-amber-500/30 to-red-600/20" />
            <p class="bg-[#ff7a2b] py-0.5 text-center text-[9px] font-semibold text-white">世界大战</p>
          </div>
        </div>
        <div v-if="floatGame2" class="pointer-events-auto relative mt-20">
          <button
            type="button"
            class="absolute right-0.5 top-0.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 text-[11px] text-white/90"
            aria-label="关闭"
            @click="floatGame2 = false"
          >
            ×
          </button>
          <div
            class="overflow-hidden rounded-lg border border-white/15 bg-gradient-to-b from-[#2a3570] to-[#1a2248] shadow-lg"
          >
            <div class="h-14 w-full bg-gradient-to-br from-emerald-500/25 to-cyan-600/20" />
            <p class="bg-[#ff7a2b] py-0.5 text-center text-[9px] font-semibold text-white">游戏中心</p>
          </div>
        </div>
      </div>

      <div
        class="scrollbar-thin max-h-[42vh] space-y-2 overflow-y-auto pr-[76px] text-[12px] leading-snug"
      >
        <template v-for="(line, idx) in chatLines" :key="idx">
          <div
            v-if="line.type === 'enter'"
            class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full bg-gradient-to-r from-[#d946a6]/35 to-[#7c6bff]/35 px-2.5 py-1.5 ring-1 ring-white/10"
          >
            <span class="h-5 w-5 shrink-0 rounded-full bg-white/20 text-center text-[10px] leading-5">👤</span>
            <span v-if="line.level" class="rounded bg-[#ff9f4a]/90 px-1 text-[10px] font-bold text-[#1a1a1a]">
              {{ line.level }}
            </span>
            <span class="font-semibold text-[#ffe08a]">{{ line.user }}</span>
            <span class="text-white/90">{{ line.text }}</span>
          </div>
          <div
            v-else-if="line.type === 'system'"
            class="rounded-xl bg-white/10 px-3 py-2 text-white/80 ring-1 ring-white/10"
          >
            {{ line.text }}
          </div>
          <p v-else-if="line.type === 'chat'" class="break-words">
            <span class="font-semibold text-[#ffe08a]">{{ line.user }}:</span>
            <span class="text-white/95">{{ line.text }}</span>
          </p>
          <p v-else class="break-words">
            <span class="font-semibold text-[#ffe08a]">{{ line.user }}:</span>
            <span class="text-white/95">送</span>
            <span class="mx-0.5 inline-block text-red-400">♥</span>
            <span class="text-[#ffe08a]">{{ line.gift }}</span>
            <span class="text-white/95"> ×{{ line.count }}</span>
          </p>
        </template>
      </div>
      <p class="mt-1 text-center text-[10px] text-white/35">{{ onlineHint }}</p>
    </div>

    <!-- 底栏 -->
    <footer
      class="safe-pb fixed bottom-0 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 items-center gap-2 border-t border-white/10 bg-[#151d40]/95 px-3 py-2 backdrop-blur-sm"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#0f142e]/90 px-3 py-2 ring-1 ring-white/10">
        <input
          type="text"
          readonly
          class="min-w-0 flex-1 bg-transparent text-[13px] text-white/90 outline-none placeholder:text-white/35"
          placeholder="说点什么..."
        />
        <button type="button" class="shrink-0 text-lg text-white/70" aria-label="表情">
          🙂
        </button>
      </div>
      <button
        type="button"
        class="flex shrink-0 flex-col items-center gap-0.5 text-[10px] text-white/80"
        @click="selfMicOn = !selfMicOn"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <svg v-if="selfMicOn" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path d="M8 11v1a4 4 0 0 0 8 0v-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <svg v-else class="h-4 w-4 text-[#ff4d4f]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <span class="flex items-center gap-0.5 whitespace-nowrap">
          下麦
          <span class="text-[8px]">▼</span>
        </span>
      </button>
      <button type="button" class="shrink-0 text-2xl leading-none" aria-label="游戏">
        🎮
      </button>
      <button type="button" class="shrink-0 text-2xl leading-none" aria-label="礼物">
        🎁
      </button>
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white/70"
        aria-label="更多"
      >
        ···
      </button>
    </footer>
  </div>
</template>

<style scoped>
.live-speaking-ring {
  animation: speakPulse 1.6s ease-in-out infinite;
}

@keyframes speakPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 2px rgba(91, 198, 255, 0.95),
      0 0 14px rgba(91, 198, 255, 0.45);
  }
  50% {
    box-shadow:
      0 0 0 2px rgba(91, 198, 255, 1),
      0 0 22px rgba(91, 198, 255, 0.75);
  }
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.safe-pb {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>
