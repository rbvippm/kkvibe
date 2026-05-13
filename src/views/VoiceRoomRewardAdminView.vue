<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'pc' })
}

type TabKey = 'reward' | 'settlement'

const activeTab = ref<TabKey>('reward')

/** 打赏发生场景 */
type RewardSource = 'live' | 'voice'

/** 打赏列表 · 筛选 */
const rewardFilter = ref({
  giverId: '',
  hostId: '',
  liveSessionId: '',
  /** 空字符串表示全部；live=直播间；voice=语聊房 */
  source: '' as '' | RewardSource,
  startTime: '',
  endTime: '',
})

/** 结算列表 · 筛选 */
const settlementFilter = ref({
  serialNo: '',
  hostId: '',
  startTime: '',
  endTime: '',
  payStatus: '',
  amountMin: '',
  amountMax: '',
})

type RewardRow = {
  id: number
  /** 礼物来源：直播间 / 语聊房 */
  source: RewardSource
  /** 直播场次 ID（单场直播/语聊房实例） */
  liveSessionId: string
  giverName: string
  giverId: string
  hostName: string
  hostId: string
  rewardTime: string
  giftName: string
  giftCount: number
}

type SettlementRow = {
  id: number
  serialNo: string
  hostName: string
  hostId: string
  amount: string
  action: string
  /** 到账时间（用于时间筛选演示） */
  arrivedAt: string
  paymentStatus: 'paid' | 'pending' | 'failed'
}

const rewardSourceOptions = [
  { value: '' as const, label: '全部' },
  { value: 'live' as const, label: '直播间' },
  { value: 'voice' as const, label: '语聊房' },
]

function rewardSourceLabel(s: RewardSource) {
  return s === 'live' ? '直播间' : '语聊房'
}

function rewardSourceBadgeClass(s: RewardSource) {
  return s === 'live'
    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
    : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
}

const rewardSource = ref<RewardRow[]>([
  {
    id: 1,
    source: 'voice',
    liveSessionId: 'sess_v_20260112_k7m2',
    giverName: 'UI-5',
    giverId: '3180664521199420635',
    hostName: 'UI',
    hostId: '3180664521199420634',
    rewardTime: '2026-01-12 14:32:08',
    giftName: '小星星',
    giftCount: 1,
  },
  {
    id: 2,
    source: 'live',
    liveSessionId: 'sess_live_20260112_88a2',
    giverName: 'feature',
    giverId: '3180664521199420636',
    hostName: '进度',
    hostId: '3180664521199420637',
    rewardTime: '2026-01-12 15:01:22',
    giftName: '小汽车',
    giftCount: 1,
  },
  {
    id: 3,
    source: 'voice',
    liveSessionId: 'sess_v_20260112_k7m2',
    giverName: 'Vicky03',
    giverId: '3180664521199420638',
    hostName: 'Vicky02',
    hostId: '3180664521199420639',
    rewardTime: '2026-01-12 16:18:55',
    giftName: '2--简体',
    giftCount: 1,
  },
  {
    id: 4,
    source: 'live',
    liveSessionId: 'sess_live_20260113_01bx',
    giverName: '小猫电台',
    giverId: '3180664521199420640',
    hostName: '南岸',
    hostId: '3180664521199420641',
    rewardTime: '2026-01-13 09:20:11',
    giftName: '小心心',
    giftCount: 15,
  },
])

const settlementSource = ref<SettlementRow[]>([
  {
    id: 1,
    serialNo: 'ld_v0z8aNypKtkol',
    hostName: 'UI',
    hostId: '3180664521199420634',
    amount: '0.02',
    action: '-',
    arrivedAt: '2026-01-10 10:00:00',
    paymentStatus: 'paid',
  },
  {
    id: 2,
    serialNo: 'ld_mK2pQn8xRtYol',
    hostName: 'Kate',
    hostId: '3180664521199420642',
    amount: '5.83',
    action: '-',
    arrivedAt: '2026-01-11 14:20:00',
    paymentStatus: 'pending',
  },
  {
    id: 3,
    serialNo: 'ld_jW9nLk3vPqRst',
    hostName: 'Vicky02',
    hostId: '3180664521199420639',
    amount: '12.00',
    action: '-',
    arrivedAt: '2026-01-12 09:15:00',
    paymentStatus: 'paid',
  },
])

const payStatusOptions = [
  { value: '', label: '请选择' },
  { value: 'paid', label: '已打款' },
  { value: 'pending', label: '待打款' },
  { value: 'failed', label: '打款失败' },
]

function matchReward(row: RewardRow) {
  const f = rewardFilter.value
  if (f.source && row.source !== f.source) return false
  if (f.liveSessionId && !row.liveSessionId.includes(f.liveSessionId.trim())) return false
  if (f.giverId && !row.giverId.includes(f.giverId.trim())) return false
  if (f.hostId && !row.hostId.includes(f.hostId.trim())) return false
  const rowT = new Date(row.rewardTime.replace(' ', 'T')).getTime()
  if (f.startTime && rowT < new Date(f.startTime).getTime()) return false
  if (f.endTime && rowT > new Date(f.endTime).getTime()) return false
  return true
}

function matchSettlement(row: SettlementRow) {
  const f = settlementFilter.value
  if (f.serialNo && !row.serialNo.includes(f.serialNo.trim())) return false
  if (f.hostId && !row.hostId.includes(f.hostId.trim())) return false
  const rowT = new Date(row.arrivedAt.replace(' ', 'T')).getTime()
  if (f.startTime && rowT < new Date(f.startTime).getTime()) return false
  if (f.endTime && rowT > new Date(f.endTime).getTime()) return false
  if (f.payStatus && row.paymentStatus !== f.payStatus) return false
  const amt = parseFloat(row.amount)
  if (f.amountMin !== '' && !Number.isNaN(parseFloat(f.amountMin)) && amt < parseFloat(f.amountMin)) return false
  if (f.amountMax !== '' && !Number.isNaN(parseFloat(f.amountMax)) && amt > parseFloat(f.amountMax)) return false
  return true
}

const rewardRows = computed(() => rewardSource.value.filter(matchReward))

const settlementRows = computed(() => settlementSource.value.filter(matchSettlement))

function clearRewardFilter() {
  rewardFilter.value = {
    giverId: '',
    hostId: '',
    liveSessionId: '',
    source: '',
    startTime: '',
    endTime: '',
  }
}

function clearSettlementFilter() {
  settlementFilter.value = {
    serialNo: '',
    hostId: '',
    startTime: '',
    endTime: '',
    payStatus: '',
    amountMin: '',
    amountMax: '',
  }
}
</script>

<template>
  <div class="admin-page min-h-svh bg-[#eceff4] text-[#1f2937] antialiased">
    <header class="sticky top-0 z-10 border-b border-black/6 bg-white px-4 py-3 shadow-sm">
      <div class="mx-auto flex max-w-6xl items-center gap-3">
        <button
          type="button"
          class="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#374151] transition hover:bg-[#f9fafb]"
          @click="goBack()"
        >
          ← 返回
        </button>
        <div>
          <h1 class="text-base font-semibold text-[#111827]">语聊房 · 打赏与结算</h1>
          <p class="text-xs text-[#6b7280]">打赏列表支持按礼物来源区分「直播间 / 语聊房」；结算流水为原型数据。</p>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <!-- Tab -->
      <div class="inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5">
        <button
          type="button"
          class="rounded-md px-5 py-2 text-sm font-medium transition"
          :class="
            activeTab === 'reward'
              ? 'bg-[#2563eb] text-white shadow-sm'
              : 'text-[#374151] hover:bg-[#f3f4f6]'
          "
          @click="activeTab = 'reward'"
        >
          打赏列表
        </button>
        <button
          type="button"
          class="rounded-md px-5 py-2 text-sm font-medium transition"
          :class="
            activeTab === 'settlement'
              ? 'bg-[#2563eb] text-white shadow-sm'
              : 'text-[#374151] hover:bg-[#f3f4f6]'
          "
          @click="activeTab = 'settlement'"
        >
          结算列表
        </button>
      </div>

      <!-- 打赏列表 -->
      <div
        v-show="activeTab === 'reward'"
        class="mt-5 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
      >
        <div class="flex flex-wrap items-end gap-4 border-b border-black/6 p-4">
          <label class="flex min-w-[200px] flex-1 flex-col gap-1.5 text-xs font-medium text-[#4b5563]">
            打赏人ID
            <input
              v-model="rewardFilter.giverId"
              type="text"
              placeholder="请输入打赏人ID"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </label>
          <label class="flex min-w-[200px] flex-1 flex-col gap-1.5 text-xs font-medium text-[#4b5563]">
            主播ID
            <input
              v-model="rewardFilter.hostId"
              type="text"
              placeholder="请输入主播ID"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </label>
          <label class="flex min-w-[200px] flex-1 flex-col gap-1.5 text-xs font-medium text-[#4b5563]">
            直播场次ID
            <input
              v-model="rewardFilter.liveSessionId"
              type="text"
              placeholder="请输入直播场次ID"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </label>
          <label
            class="flex min-w-[140px] flex-col gap-1.5 text-xs font-medium text-[#4b5563]"
            for="gift-source-filter"
          >
            礼物来源
            <select
              id="gift-source-filter"
              v-model="rewardFilter.source"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
              aria-label="礼物来源"
            >
              <option v-for="opt in rewardSourceOptions" :key="opt.value === '' ? 'all' : opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>
          <div class="flex min-w-[280px] flex-[2] flex-col gap-1.5">
            <span class="text-xs font-medium text-[#4b5563]">打赏时间</span>
            <div class="flex flex-wrap items-center gap-2">
              <input
                v-model="rewardFilter.startTime"
                type="datetime-local"
                class="min-w-0 flex-1 rounded-md border border-[#d1d5db] px-2 py-2 text-xs outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] sm:text-sm"
              />
              <span class="shrink-0 text-sm text-[#6b7280]">至</span>
              <input
                v-model="rewardFilter.endTime"
                type="datetime-local"
                class="min-w-0 flex-1 rounded-md border border-[#d1d5db] px-2 py-2 text-xs outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] sm:text-sm"
              />
            </div>
          </div>
          <div class="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d4ed8]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" stroke-linecap="round" />
              </svg>
              搜索
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-sm font-medium text-[#dc2626] transition hover:bg-[#fee2e2]"
              @click="clearRewardFilter"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke-linecap="round" />
              </svg>
              清除
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1120px] border-collapse text-sm">
            <thead>
              <tr class="bg-[#f3f4f6] text-left text-xs font-semibold text-[#4b5563]">
                <th class="border-b border-black/6 px-4 py-3 text-center">编号</th>
                <th class="border-b border-black/6 px-4 py-3">礼物来源</th>
                <th class="border-b border-black/6 px-4 py-3">直播场次ID</th>
                <th class="border-b border-black/6 px-4 py-3">打赏人</th>
                <th class="border-b border-black/6 px-4 py-3">打赏人ID</th>
                <th class="border-b border-black/6 px-4 py-3">主播</th>
                <th class="border-b border-black/6 px-4 py-3">主播ID</th>
                <th class="border-b border-black/6 px-4 py-3">打赏时间</th>
                <th class="border-b border-black/6 px-4 py-3">打赏礼物</th>
                <th class="border-b border-black/6 px-4 py-3">打赏数量</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rewardRows"
                :key="row.id"
                class="border-b border-black/[0.06] transition hover:bg-[#fafafa]"
              >
                <td class="px-4 py-3 text-center tabular-nums text-[#6b7280]">{{ row.id }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-md px-2 py-0.5 text-xs font-semibold"
                    :class="rewardSourceBadgeClass(row.source)"
                  >
                    {{ rewardSourceLabel(row.source) }}
                  </span>
                </td>
                <td class="max-w-[200px] px-4 py-3 font-mono text-xs text-[#374151]">
                  <span class="break-all">{{ row.liveSessionId }}</span>
                </td>
                <td class="px-4 py-3 font-medium text-[#111827]">{{ row.giverName }}</td>
                <td class="px-4 py-3 font-mono text-xs text-[#374151]">{{ row.giverId }}</td>
                <td class="px-4 py-3 font-medium text-[#111827]">{{ row.hostName }}</td>
                <td class="px-4 py-3 font-mono text-xs text-[#374151]">{{ row.hostId }}</td>
                <td class="px-4 py-3 tabular-nums text-[#374151]">{{ row.rewardTime }}</td>
                <td class="px-4 py-3 text-[#374151]">{{ row.giftName }}</td>
                <td class="px-4 py-3 tabular-nums text-[#374151]">{{ row.giftCount }}</td>
              </tr>
              <tr v-if="rewardRows.length === 0">
                <td colspan="10" class="px-4 py-12 text-center text-sm text-[#9ca3af]">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 结算列表 -->
      <div
        v-show="activeTab === 'settlement'"
        class="mt-5 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
      >
        <div class="flex flex-wrap items-end gap-4 border-b border-black/6 p-4">
          <label class="flex min-w-[180px] flex-1 flex-col gap-1.5 text-xs font-medium text-[#4b5563]">
            流水号
            <input
              v-model="settlementFilter.serialNo"
              type="text"
              placeholder="请输入流水号"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </label>
          <label class="flex min-w-[180px] flex-1 flex-col gap-1.5 text-xs font-medium text-[#4b5563]">
            主播ID
            <input
              v-model="settlementFilter.hostId"
              type="text"
              placeholder="请输入主播ID"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </label>
          <div class="flex min-w-[280px] flex-[2] flex-col gap-1.5">
            <span class="text-xs font-medium text-[#4b5563]">到账时间</span>
            <div class="flex flex-wrap items-center gap-2">
              <input
                v-model="settlementFilter.startTime"
                type="datetime-local"
                class="min-w-0 flex-1 rounded-md border border-[#d1d5db] px-2 py-2 text-xs outline-none focus:border-[#2563eb] sm:text-sm"
              />
              <span class="shrink-0 text-sm text-[#6b7280]">至</span>
              <input
                v-model="settlementFilter.endTime"
                type="datetime-local"
                class="min-w-0 flex-1 rounded-md border border-[#d1d5db] px-2 py-2 text-xs outline-none focus:border-[#2563eb] sm:text-sm"
              />
            </div>
          </div>
          <label class="flex min-w-[140px] flex-col gap-1.5 text-xs font-medium text-[#4b5563]">
            打款状态
            <select
              v-model="settlementFilter.payStatus"
              class="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            >
              <option v-for="opt in payStatusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>
          <div class="flex min-w-[220px] flex-col gap-1.5">
            <span class="text-xs font-medium text-[#4b5563]">结算金额</span>
            <div class="flex items-center gap-2">
              <input
                v-model="settlementFilter.amountMin"
                type="text"
                placeholder="请输入金额"
                class="min-w-0 flex-1 rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
              />
              <span class="text-[#9ca3af]">-</span>
              <input
                v-model="settlementFilter.amountMax"
                type="text"
                placeholder="请输入金额"
                class="min-w-0 flex-1 rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
              />
            </div>
          </div>
          <div class="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d4ed8]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" stroke-linecap="round" />
              </svg>
              搜索
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-sm font-medium text-[#dc2626] transition hover:bg-[#fee2e2]"
              @click="clearSettlementFilter"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke-linecap="round" />
              </svg>
              清除
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr class="bg-[#f3f4f6] text-left text-xs font-semibold text-[#4b5563]">
                <th class="border-b border-black/6 px-4 py-3 text-center">编号</th>
                <th class="border-b border-black/6 px-4 py-3">流水号</th>
                <th class="border-b border-black/6 px-4 py-3">主播</th>
                <th class="border-b border-black/6 px-4 py-3">主播ID</th>
                <th class="border-b border-black/6 px-4 py-3">结算金额</th>
                <th class="border-b border-black/6 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in settlementRows"
                :key="row.id"
                class="border-b border-black/[0.06] transition hover:bg-[#fafafa]"
              >
                <td class="px-4 py-3 text-center tabular-nums text-[#6b7280]">{{ row.id }}</td>
                <td class="px-4 py-3 font-mono text-xs text-[#374151]">{{ row.serialNo }}</td>
                <td class="px-4 py-3 font-medium text-[#111827]">{{ row.hostName }}</td>
                <td class="px-4 py-3 font-mono text-xs text-[#374151]">{{ row.hostId }}</td>
                <td class="px-4 py-3 tabular-nums font-medium text-[#111827]">{{ row.amount }}</td>
                <td class="px-4 py-3 text-[#9ca3af]">{{ row.action }}</td>
              </tr>
              <tr v-if="settlementRows.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-sm text-[#9ca3af]">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}
</style>
