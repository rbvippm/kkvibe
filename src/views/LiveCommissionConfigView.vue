<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'pc' })
}

type TabKey = 'anchor' | 'voicePlatform' | 'specificUser'

const activeTab = ref<TabKey>('anchor')

const saving = ref(false)
const saveHint = ref('')

/** 主播维度：按主播配置礼物分成（主播所得比例 %） */
type AnchorRow = {
  id: string
  hostId: string
  nickname: string
  giftSharePercent: number
  /** 语聊房场景下是否沿用同一套比例 */
  applyToVoiceRoom: boolean
  enabled: boolean
}

const anchorRows = ref<AnchorRow[]>([
  {
    id: 'a1',
    hostId: '3180664521199420601',
    nickname: 'UI',
    giftSharePercent: 55,
    applyToVoiceRoom: true,
    enabled: true,
  },
  {
    id: 'a2',
    hostId: '3180664521199420602',
    nickname: '小旋风_直播',
    giftSharePercent: 50,
    applyToVoiceRoom: false,
    enabled: true,
  },
  {
    id: 'a3',
    hostId: '3180664521199420603',
    nickname: '南岸听风',
    giftSharePercent: 48,
    applyToVoiceRoom: true,
    enabled: false,
  },
])

/** 语聊房 · 平台用户（非签约主播等）默认礼物分成 */
const voicePlatformDefault = ref({
  /** 收礼用户（麦上/房主）所得 % */
  receiverPercent: 45,
  /** 平台 % */
  platformPercent: 35,
  /** 公会/渠道等预留 %（演示） */
  channelPercent: 20,
  remark: '未命中「主播单独配置」且非「特定用户」时走本默认。',
})

/** 特定用户：按用户 ID 覆盖分成（常用于大客户、内部测试号） */
type SpecificUserRow = {
  id: string
  userId: string
  nickname: string
  giftSharePercent: number
  /** 仅直播 / 仅语聊 / 全部 */
  scope: 'live' | 'voice' | 'all'
  priority: number
  enabled: boolean
}

const specificUserRows = ref<SpecificUserRow[]>([
  {
    id: 's1',
    userId: '3180664521199420999',
    nickname: '渠道大客户_A',
    giftSharePercent: 60,
    scope: 'all',
    priority: 100,
    enabled: true,
  },
  {
    id: 's2',
    userId: '3180664521199420888',
    nickname: '内部测试号',
    giftSharePercent: 90,
    scope: 'voice',
    priority: 200,
    enabled: true,
  },
])

const newAnchor = ref({ hostId: '', nickname: '', giftSharePercent: 50, applyToVoiceRoom: true })
const newSpecific = ref({ userId: '', nickname: '', giftSharePercent: 50, scope: 'all' as const, priority: 50 })

const voiceSum = computed(() => {
  const a = voicePlatformDefault.value.receiverPercent
  const b = voicePlatformDefault.value.platformPercent
  const c = voicePlatformDefault.value.channelPercent
  return a + b + c
})

function normalizeVoicePlatform() {
  const v = voicePlatformDefault.value
  const sum = v.receiverPercent + v.platformPercent + v.channelPercent
  if (sum === 100) return
  if (sum <= 0) return
  const k = 100 / sum
  v.receiverPercent = Math.round(v.receiverPercent * k * 10) / 10
  v.platformPercent = Math.round(v.platformPercent * k * 10) / 10
  v.channelPercent = Math.round((100 - v.receiverPercent - v.platformPercent) * 10) / 10
}

function addAnchor() {
  if (!newAnchor.value.hostId.trim()) return
  anchorRows.value.push({
    id: `a_${Date.now()}`,
    hostId: newAnchor.value.hostId.trim(),
    nickname: newAnchor.value.nickname.trim() || '未命名主播',
    giftSharePercent: Math.min(100, Math.max(0, newAnchor.value.giftSharePercent)),
    applyToVoiceRoom: newAnchor.value.applyToVoiceRoom,
    enabled: true,
  })
  newAnchor.value = { hostId: '', nickname: '', giftSharePercent: 50, applyToVoiceRoom: true }
}

function removeAnchor(id: string) {
  anchorRows.value = anchorRows.value.filter((r) => r.id !== id)
}

function addSpecificUser() {
  if (!newSpecific.value.userId.trim()) return
  const maxP = specificUserRows.value.reduce((m, r) => Math.max(m, r.priority), 0)
  specificUserRows.value.push({
    id: `s_${Date.now()}`,
    userId: newSpecific.value.userId.trim(),
    nickname: newSpecific.value.nickname.trim() || '未命名用户',
    giftSharePercent: Math.min(100, Math.max(0, newSpecific.value.giftSharePercent)),
    scope: newSpecific.value.scope,
    priority: maxP + 10,
    enabled: true,
  })
  newSpecific.value = { userId: '', nickname: '', giftSharePercent: 50, scope: 'all', priority: 50 }
}

function removeSpecific(id: string) {
  specificUserRows.value = specificUserRows.value.filter((r) => r.id !== id)
}

async function handleSave() {
  saving.value = true
  saveHint.value = ''
  await new Promise((r) => setTimeout(r, 500))
  saving.value = false
  saveHint.value = '已保存（演示环境，未调用接口）'
  setTimeout(() => {
    saveHint.value = ''
  }, 3200)
}
</script>

<template>
  <div class="admin-page min-h-svh bg-[#eceff4] text-[#1f2937] antialiased">
    <header class="sticky top-0 z-10 border-b border-black/6 bg-white px-4 py-3 shadow-sm">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#374151] transition hover:bg-[#f9fafb]"
          @click="goBack()"
        >
          ← 返回
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="text-base font-semibold text-[#111827]">直播 · 佣金配置</h1>
          <p class="text-xs text-[#6b7280]">
            礼物分成：支持按主播、语聊房平台用户默认、特定用户三层配置；命中优先级见下方说明。
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#374151] disabled:opacity-60"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? '保存中…' : '保存配置' }}
        </button>
      </div>
      <p v-if="saveHint" class="mx-auto max-w-5xl px-4 pb-2 text-xs text-emerald-700">{{ saveHint }}</p>
    </header>

    <main class="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div
        class="rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950"
      >
        <span class="font-semibold">优先级（建议）</span>
        ：同一笔礼物结算时，
        <span class="font-medium">特定用户配置</span>
        ＞
        <span class="font-medium">主播维度配置</span>
        ＞
        <span class="font-medium">语聊房平台用户默认</span>
        ；直播场次内若未配置主播或特定用户，则走直播侧全局默认（可与语聊默认拆分，此处原型合并展示逻辑说明）。
      </div>

      <!-- Tabs -->
      <div class="inline-flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5">
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm font-medium transition"
          :class="
            activeTab === 'anchor'
              ? 'bg-[#111827] text-white shadow-sm'
              : 'text-[#6b7280] hover:bg-[#f3f4f6]'
          "
          @click="activeTab = 'anchor'"
        >
          主播礼物分成
        </button>
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm font-medium transition"
          :class="
            activeTab === 'voicePlatform'
              ? 'bg-[#111827] text-white shadow-sm'
              : 'text-[#6b7280] hover:bg-[#f3f4f6]'
          "
          @click="activeTab = 'voicePlatform'"
        >
          语聊房平台用户
        </button>
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm font-medium transition"
          :class="
            activeTab === 'specificUser'
              ? 'bg-[#111827] text-white shadow-sm'
              : 'text-[#6b7280] hover:bg-[#f3f4f6]'
          "
          @click="activeTab = 'specificUser'"
        >
          特定用户
        </button>
      </div>

      <!-- 主播 -->
      <section v-show="activeTab === 'anchor'" class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div class="border-b border-black/6 bg-[#f9fafb] px-4 py-3">
          <h2 class="text-sm font-semibold text-[#111827]">针对主播 · 礼物分成</h2>
          <p class="mt-1 text-xs text-[#6b7280]">
            按主播 ID 配置「礼物流水」中归属主播的分成比例（%）。可勾选是否同步用于语聊房内该主播身份场景。
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-black/6 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
              <tr>
                <th class="px-4 py-3">主播 ID</th>
                <th class="px-4 py-3">昵称</th>
                <th class="px-4 py-3">礼物分成（主播 %）</th>
                <th class="px-4 py-3">语聊房沿用</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody class="divide-y divide-black/6">
              <tr v-for="row in anchorRows" :key="row.id" class="hover:bg-[#fafafa]">
                <td class="px-4 py-3 font-mono text-xs text-[#374151]">{{ row.hostId }}</td>
                <td class="px-4 py-3">{{ row.nickname }}</td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="row.giftSharePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    class="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-sm tabular-nums"
                  />
                  <span class="ml-1 text-xs text-[#9ca3af]">%</span>
                </td>
                <td class="px-4 py-3">
                  <input v-model="row.applyToVoiceRoom" type="checkbox" class="rounded border-[#d1d5db]" />
                </td>
                <td class="px-4 py-3">
                  <label class="inline-flex cursor-pointer items-center gap-2 text-xs">
                    <input v-model="row.enabled" type="checkbox" class="rounded border-[#d1d5db]" />
                    {{ row.enabled ? '启用' : '停用' }}
                  </label>
                </td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="text-xs text-rose-600 hover:underline"
                    @click="removeAnchor(row.id)"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex flex-col gap-3 border-t border-black/6 bg-[#f9fafb] px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label class="text-xs font-medium text-[#374151]">主播 ID</label>
            <input
              v-model="newAnchor.hostId"
              type="text"
              class="mt-1 block w-full min-w-[200px] rounded-lg border border-black/10 bg-white px-3 py-2 text-sm sm:w-56"
              placeholder="输入主播用户 ID"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">昵称（选填）</label>
            <input
              v-model="newAnchor.nickname"
              type="text"
              class="mt-1 block w-full min-w-[140px] rounded-lg border border-black/10 bg-white px-3 py-2 text-sm sm:w-40"
              placeholder="展示用"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">分成 %</label>
            <input
              v-model.number="newAnchor.giftSharePercent"
              type="number"
              min="0"
              max="100"
              class="mt-1 block w-24 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <label class="flex items-center gap-2 text-xs text-[#6b7280] sm:pb-2">
            <input v-model="newAnchor.applyToVoiceRoom" type="checkbox" class="rounded border-[#d1d5db]" />
            语聊房沿用
          </label>
          <button
            type="button"
            class="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white sm:mb-0"
            @click="addAnchor"
          >
            添加主播
          </button>
        </div>
      </section>

      <!-- 语聊房平台用户 -->
      <section
        v-show="activeTab === 'voicePlatform'"
        class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
      >
        <div class="border-b border-black/6 bg-[#f9fafb] px-4 py-3">
          <h2 class="text-sm font-semibold text-[#111827]">语聊房 · 平台用户默认礼物分成</h2>
          <p class="mt-1 text-xs text-[#6b7280]">
            面向「平台普通用户 / 未单独签约」在语聊房内收礼时的默认拆账；三项比例之和应为 100%。
          </p>
        </div>
        <div class="grid gap-6 px-4 py-6 sm:grid-cols-3">
          <div>
            <label class="text-xs font-medium text-[#374151]">收礼用户所得 %</label>
            <input
              v-model.number="voicePlatformDefault.receiverPercent"
              type="number"
              min="0"
              max="100"
              step="0.5"
              class="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">平台 %</label>
            <input
              v-model.number="voicePlatformDefault.platformPercent"
              type="number"
              min="0"
              max="100"
              step="0.5"
              class="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">公会/渠道预留 %</label>
            <input
              v-model.number="voicePlatformDefault.channelPercent"
              type="number"
              min="0"
              max="100"
              step="0.5"
              class="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm tabular-nums"
            />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 border-t border-black/6 px-4 py-4">
          <p
            class="text-sm font-medium tabular-nums"
            :class="voiceSum === 100 ? 'text-emerald-700' : 'text-rose-600'"
          >
            当前合计：{{ voiceSum }}% {{ voiceSum === 100 ? '（正确）' : '（需调整为 100%）' }}
          </p>
          <button
            type="button"
            class="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
            @click="normalizeVoicePlatform"
          >
            按比例归一化到 100%
          </button>
        </div>
        <div class="border-t border-black/6 bg-[#f9fafb] px-4 py-3">
          <label class="text-xs font-medium text-[#374151]">备注</label>
          <textarea
            v-model="voicePlatformDefault.remark"
            rows="2"
            class="mt-1 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </div>
      </section>

      <!-- 特定用户 -->
      <section
        v-show="activeTab === 'specificUser'"
        class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
      >
        <div class="border-b border-black/6 bg-[#f9fafb] px-4 py-3">
          <h2 class="text-sm font-semibold text-[#111827]">特定用户 · 礼物分成</h2>
          <p class="mt-1 text-xs text-[#6b7280]">
            按用户 ID 单独约定分成比例；可限定仅直播、仅语聊或全局。数字越大优先级越高（同用户多条时取最高优先级）。
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="border-b border-black/6 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
              <tr>
                <th class="px-4 py-3">用户 ID</th>
                <th class="px-4 py-3">昵称</th>
                <th class="px-4 py-3">礼物分成（该用户 %）</th>
                <th class="px-4 py-3">生效范围</th>
                <th class="px-4 py-3">优先级</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody class="divide-y divide-black/6">
              <tr
                v-for="row in specificUserRows.slice().sort((a, b) => b.priority - a.priority)"
                :key="row.id"
                class="hover:bg-[#fafafa]"
              >
                <td class="px-4 py-3 font-mono text-xs text-[#374151]">{{ row.userId }}</td>
                <td class="px-4 py-3">{{ row.nickname }}</td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="row.giftSharePercent"
                    type="number"
                    min="0"
                    max="100"
                    class="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-sm tabular-nums"
                  />
                  <span class="ml-1 text-xs text-[#9ca3af]">%</span>
                </td>
                <td class="px-4 py-3">
                  <select
                    v-model="row.scope"
                    class="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs"
                  >
                    <option value="all">直播+语聊</option>
                    <option value="live">仅直播</option>
                    <option value="voice">仅语聊房</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="row.priority"
                    type="number"
                    min="0"
                    class="w-20 rounded-lg border border-black/10 px-2 py-1.5 text-sm tabular-nums"
                  />
                </td>
                <td class="px-4 py-3">
                  <label class="inline-flex cursor-pointer items-center gap-2 text-xs">
                    <input v-model="row.enabled" type="checkbox" class="rounded border-[#d1d5db]" />
                    {{ row.enabled ? '启用' : '停用' }}
                  </label>
                </td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="text-xs text-rose-600 hover:underline"
                    @click="removeSpecific(row.id)"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          class="flex flex-col gap-3 border-t border-black/6 bg-[#f9fafb] px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div>
            <label class="text-xs font-medium text-[#374151]">用户 ID</label>
            <input
              v-model="newSpecific.userId"
              type="text"
              class="mt-1 block w-full min-w-[200px] rounded-lg border border-black/10 bg-white px-3 py-2 text-sm sm:w-56"
              placeholder="平台用户 ID"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">昵称（选填）</label>
            <input
              v-model="newSpecific.nickname"
              type="text"
              class="mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm sm:w-40"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">分成 %</label>
            <input
              v-model.number="newSpecific.giftSharePercent"
              type="number"
              min="0"
              max="100"
              class="mt-1 w-24 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-[#374151]">范围</label>
            <select
              v-model="newSpecific.scope"
              class="mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm sm:w-36"
            >
              <option value="all">直播+语聊</option>
              <option value="live">仅直播</option>
              <option value="voice">仅语聊房</option>
            </select>
          </div>
          <button
            type="button"
            class="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white"
            @click="addSpecificUser"
          >
            添加特定用户
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
