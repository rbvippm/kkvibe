<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'mobile' })
}

type SubAgent = {
  id: string
  nickname: string
  level: '一级' | '二级'
  monthGmv: string
  status: '活跃' | '沉默' | '待激活'
}

type BottomTab = 'overview' | 'team' | 'report' | 'me'
type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

const activeTab = ref<BottomTab>('overview')
const preset = ref<RangePreset>('today')

const user = ref({
  nickname: 'fafa888888',
  avatarEmoji: '🧔🏻‍♂️',
})

const inviteCode = ref('KK-VIBE-8F2A')
const copied = ref(false)

const account = ref({
  balance: '236,188,666.00',
  profit: '-3,000,000,000',
})

const subAgents = ref<SubAgent[]>([
  { id: 'a1', nickname: '小北_渠道', level: '一级', monthGmv: '¥ 42,300', status: '活跃' },
  { id: 'a2', nickname: '阿鹿推广', level: '一级', monthGmv: '¥ 18,900', status: '活跃' },
  { id: 'a3', nickname: '匿名代理 09', level: '二级', monthGmv: '¥ 3,200', status: '沉默' },
  { id: 'a4', nickname: '城市合伙人·南', level: '一级', monthGmv: '¥ 0', status: '待激活' },
  { id: 'a5', nickname: 'Echo 工作室', level: '二级', monthGmv: '¥ 6,750', status: '活跃' },
])

function statusClass(s: SubAgent['status']) {
  if (s === '活跃') return 'border-emerald-500/35 bg-emerald-500/12 text-emerald-200'
  if (s === '沉默') return 'border-white/15 bg-white/6 text-white/70'
  return 'border-amber-400/35 bg-amber-500/12 text-amber-200'
}

const dateRangeText = computed(() => {
  const base = '2025-08-06'
  if (preset.value === 'today') return `${base}至${base}`
  if (preset.value === 'yesterday') return `2025-08-05至2025-08-05`
  if (preset.value === 'thisWeek') return `2025-08-04至2025-08-10`
  return `2025-07-28至2025-08-03`
})

/** 与截图一致的 10 项指标（含「投注退水」文案） */
const directStats = ref([
  { key: 'new', label: '新增会员', value: '126' },
  { key: 'active', label: '活跃人数', value: '126' },
  { key: 'recharge', label: '充值总额', value: '126' },
  { key: 'withdraw', label: '取款总额', value: '0.00' },
  { key: 'validBet', label: '有效投注', value: '0.00' },
  { key: 'rebate', label: '投注退水', value: '0.00' },
  { key: 'promo', label: '优惠活动', value: '0.00' },
  { key: 'fee', label: '充值手续费', value: '0.00' },
  { key: 'winLose', label: '游戏输赢', value: '0.00' },
  { key: 'netLose', label: '净输赢', value: '0.00' },
])

const showTeamSection = computed(() => activeTab.value === 'team')
const showOverviewSection = computed(() => activeTab.value === 'overview')
const showReportSection = computed(() => activeTab.value === 'report')
const showMeSection = computed(() => activeTab.value === 'me')

function pickPreset(v: RangePreset) {
  preset.value = v
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
  <div class="agent-root relative min-h-svh bg-[#121212] text-white antialiased">
    <!-- 细颗粒噪点（接近截图质感） -->
    <div class="agent-grain pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden="true" />

    <div class="relative z-10 mx-auto flex min-h-svh max-w-[420px] flex-col">
      <!-- 顶栏：左返回 / 居中标题 -->
      <header class="relative flex h-11 items-center px-3 pt-1">
        <button
          type="button"
          class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#D4A373] transition hover:opacity-80"
          aria-label="返回"
          @click="goBack()"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 6.5L8 12l6.5 5.5"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="w-full text-center text-[15px] font-semibold tracking-wide text-[#D4A373]">
          代理中心
        </h1>
      </header>

      <main class="flex flex-1 flex-col px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-1">
        <!-- 账号卡 -->
        <section
          class="rounded-[14px] border border-[#D4A373]/35 bg-gradient-to-b from-[#1a1816] to-[#141210] p-3.5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.95)]"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f3e7d6] via-[#e9c46a] to-[#c99852] text-[26px] shadow-inner"
            >
              {{ user.avatarEmoji }}
            </div>
            <div class="min-w-0 flex-1 pt-0.5">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-[15px] font-semibold text-white">
                  {{ user.nickname }}
                </p>
                <button
                  type="button"
                  class="shrink-0 rounded-full bg-gradient-to-b from-[#f6e7c8] to-[#e9c46a] px-3.5 py-1.5 text-[12px] font-semibold text-[#2a1f0f] shadow-[0_8px_18px_-10px_rgba(233,196,106,0.85)] transition active:scale-[0.98]"
                >
                  取款
                </button>
              </div>
              <div class="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  class="flex h-8 shrink-0 items-center gap-1 rounded-md border border-white/10 bg-[#1f1f1f] px-2 text-[12px] font-semibold text-white/85"
                >
                  <span class="text-white/55">X</span>
                  <span class="text-[10px] text-white/45">▾</span>
                </button>
                <p class="min-w-0 flex-1 truncate text-right text-[20px] font-bold tabular-nums tracking-tight text-white">
                  {{ account.balance }}
                </p>
                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1f1f1f] text-[#D4A373] transition hover:bg-white/5"
                  aria-label="刷新"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M21 12a9 9 0 1 1-2.64-6.36"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 盈亏 / 占成：左右分栏 -->
          <div class="mt-3.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="flex items-center justify-between gap-1 rounded-[10px] bg-[#f0d9c8]/95 px-2.5 py-2.5 text-left transition hover:opacity-95"
            >
              <span class="text-[11px] font-semibold text-[#5c4a42]">我的盈亏</span>
              <span class="flex min-w-0 items-center gap-0.5">
                <span class="truncate text-[12px] font-bold tabular-nums text-[#FF4D4F]">
                  {{ account.profit }}
                </span>
                <span class="shrink-0 text-[12px] font-semibold text-[#8a7268]">›</span>
              </span>
            </button>
            <button
              type="button"
              class="flex items-center justify-between gap-1 rounded-[10px] bg-[#e8c9b4]/90 px-2.5 py-2.5 text-left transition hover:opacity-95"
            >
              <span class="text-[11px] font-semibold text-[#5c4a42]">占成比例</span>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#c9a892]/80 bg-white/35 text-[10px] font-bold text-[#6b554a]"
              >
                i
              </span>
            </button>
          </div>
        </section>

        <!-- 数据时间段 -->
        <section class="mt-4">
          <p class="text-[12px] font-medium text-[#D4A373]/90">数据时间段</p>
          <div class="mt-2 flex items-stretch gap-2">
            <div
              class="flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border border-[#D4A373]/55 bg-[#1a1a1a] px-2 text-center text-[12px] font-semibold text-[#f6eadc]"
            >
              {{ dateRangeText }}
            </div>
            <button
              type="button"
              class="relative flex w-11 shrink-0 items-center justify-center rounded-[12px] border border-[#D4A373]/45 bg-[#1a1a1a] text-[#D4A373]"
              aria-label="选择日期"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
                <path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M4 10h16" stroke="currentColor" stroke-width="1.6" />
                <circle cx="16.5" cy="14.5" r="2.2" fill="#ff7a45" />
              </svg>
            </button>
          </div>

          <div class="mt-2.5 grid grid-cols-4 gap-2">
            <button
              v-for="(label, key) in [
                ['today', '今日'],
                ['yesterday', '昨日'],
                ['thisWeek', '本周'],
                ['lastWeek', '上周'],
              ] as const"
              :key="key"
              type="button"
              class="rounded-[10px] py-2 text-[12px] font-semibold transition"
              :class="
                preset === label[0]
                  ? 'bg-[#2a2a2a] text-[#E9C46A]'
                  : 'bg-[#1f1f1f] text-[#D4A373]/75 hover:text-[#E9C46A]'
              "
              @click="pickPreset(label[0])"
            >
              {{ label[1] }}
            </button>
          </div>
        </section>

        <!-- 浅色面板：我的直属 + 九宫格（截图主体） -->
        <section
          v-if="showOverviewSection"
          class="agent-sheet mt-4 flex-1 -translate-y-2 rounded-t-[22px] bg-[#FDFCF0] px-3 pb-5 pt-4 text-[#2a2420] shadow-[0_-10px_40px_-18px_rgba(0,0,0,0.55)]"
        >
          <h2 class="text-center text-[15px] font-semibold text-[#3a2f28]">我的直属</h2>
          <div class="mt-3 grid grid-cols-3 gap-[10px]">
            <div
              v-for="(m, idx) in directStats"
              :key="m.key"
              class="agent-stat-card overflow-hidden rounded-[12px] border border-[#e8ddd4] bg-white"
              :class="idx === directStats.length - 1 ? 'col-span-1' : ''"
            >
              <div class="agent-stat-head px-2 py-1.5 text-center text-[11px] font-semibold text-[#8a6a55]">
                {{ m.label }}
              </div>
              <div class="agent-stat-body relative px-2 pb-2.5 pt-1 text-center">
                <p class="relative text-[17px] font-bold tabular-nums text-[#1f1f1f]">
                  {{ m.value }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 其它 Tab：非截图页，保持同背景下的次级面板 -->
        <section v-else-if="showTeamSection" class="mt-4 space-y-3 rounded-t-[22px] bg-[#FDFCF0] p-3 text-[#2a2420]">
          <div class="rounded-[12px] border border-[#e8ddd4] bg-white p-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold">我的邀请码</p>
              <button
                type="button"
                class="rounded-full bg-[#2a2420] px-3 py-1.5 text-xs font-semibold text-[#FDFCF0]"
                @click="copyInvite"
              >
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>
            <p class="mt-2 font-mono text-sm tracking-widest">{{ inviteCode }}</p>
          </div>
          <div class="rounded-[12px] border border-[#e8ddd4] bg-white p-3">
            <div class="flex items-center justify-between text-sm font-semibold">
              <span>团队列表</span>
              <span class="text-xs font-medium text-black/45">共 {{ subAgents.length }} 人</span>
            </div>
            <ul class="mt-2 space-y-2">
              <li
                v-for="row in subAgents"
                :key="row.id"
                class="flex items-center justify-between gap-2 rounded-[10px] border border-[#efe4dc] bg-[#FDFCF0] px-2.5 py-2"
              >
                <div class="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#efe4dc] text-xs font-bold"
                  >
                    {{ row.nickname.slice(0, 1) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">{{ row.nickname }}</p>
                    <p class="text-[11px] text-black/45">{{ row.level }} · {{ row.monthGmv }}</p>
                  </div>
                </div>
                <span class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section v-else-if="showReportSection" class="mt-4 rounded-t-[22px] bg-[#FDFCF0] p-4 text-[#2a2420]">
          <p class="text-sm font-semibold">我的报表</p>
          <p class="mt-2 text-sm text-black/50">原型占位：图表与明细可接接口后替换。</p>
        </section>

        <section v-else-if="showMeSection" class="mt-4 rounded-t-[22px] bg-[#FDFCF0] p-4 text-[#2a2420]">
          <p class="text-sm font-semibold">我的</p>
          <p class="mt-2 text-sm text-black/50">原型占位：账号与设置入口。</p>
        </section>
      </main>

      <!-- 底栏：白底 + 四图标（概况为饼图高亮） -->
      <nav
        class="safe-pb fixed bottom-0 left-1/2 z-20 w-full max-w-[420px] -translate-x-1/2 border-t border-black/6 bg-white"
      >
        <div class="grid grid-cols-4 px-1 pt-2">
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'overview' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="activeTab = 'overview'"
          >
            <span class="flex h-6 w-6 items-center justify-center">
              <svg v-if="activeTab === 'overview'" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z"
                  fill="#e07a2b"
                  opacity="0.18"
                />
                <path
                  d="M12 12 12 6a6 6 0 1 1-6 6"
                  stroke="#e07a2b"
                  stroke-width="2"
                  stroke-linecap="round"
                  fill="none"
                />
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z"
                  stroke="#bdbdbd"
                  stroke-width="1.8"
                />
                <path d="M12 12 12 7a5 5 0 1 1-5 5" stroke="#bdbdbd" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            概况
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'team' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="activeTab = 'team'"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4.5 20a4.5 4.5 0 0 1 9 0M11 20a4.5 4.5 0 0 1 8.5-1"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            团队管理
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'report' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="activeTab = 'report'"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 18V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M8 15V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M12 17v-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M16 13V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M20 16V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            我的报表
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 pb-2 text-[11px] font-medium transition"
            :class="activeTab === 'me' ? 'text-[#e07a2b]' : 'text-[#9a9a9a]'"
            @click="activeTab = 'me'"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 13.2a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 13.2Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M5.5 20.3c.9-3.1 3.6-5.1 6.5-5.1s5.6 2 6.5 5.1"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            我的
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.agent-root {
  --bronze: #d4a373;
  --cream: #fdfcf0;
  --danger: #ff4d4f;
}

.agent-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

.agent-sheet {
  min-height: 52vh;
}

/* 指标卡：浅底 + 斜线纹理（接近截图几何暗纹） */
.agent-stat-head {
  background: linear-gradient(180deg, rgba(255, 228, 210, 0.95), rgba(255, 214, 188, 0.92));
  border-bottom: 1px solid rgba(232, 221, 212, 0.95);
}

.agent-stat-body {
  background-color: #fff;
  background-image: repeating-linear-gradient(
    125deg,
    rgba(180, 160, 140, 0.045) 0px,
    rgba(180, 160, 140, 0.045) 1px,
    transparent 1px,
    transparent 9px
  );
}

.safe-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
