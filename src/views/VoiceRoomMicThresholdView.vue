<script setup lang="ts">
import { computed, ref } from 'vue'

/** 条件一：仅可开关「是否启用」，规则文案固定 */
const priorityMicEnabled = ref(true)

type Fiat = 'CNY' | 'VND' | 'USD'
type AssetToken = 'KKC' | 'KKV' | 'USDT'

const currencyRows = ref<
  {
    fiat: Fiat
    assetLabel: string
    token: AssetToken
    /** 该币种维度下的最低充值门槛（演示数值） */
    minRecharge: string
  }[]
>([
  { fiat: 'CNY', assetLabel: '人民币', token: 'KKC', minRecharge: '500' },
  { fiat: 'VND', assetLabel: '越南盾', token: 'KKV', minRecharge: '2000000' },
  { fiat: 'USD', assetLabel: '美元', token: 'USDT', minRecharge: '50' },
])

/** 用户从未在任何币种维度充值过时，改用总资产门槛（与法币展示口径一致，演示为 CNY） */
const totalAssetThresholdCny = ref('1000')

const saving = ref(false)
const saveHint = ref('')

async function handleSave() {
  saving.value = true
  saveHint.value = ''
  await new Promise((r) => setTimeout(r, 450))
  saving.value = false
  saveHint.value = '已保存（演示环境，未调用接口）'
  setTimeout(() => {
    saveHint.value = ''
  }, 3200)
}

const ruleSummary = computed(() => {
  const lines = currencyRows.value.map(
    (r) => `${r.fiat} 维度对应链上资产 ${r.token}，充值门槛 ${r.minRecharge}（单位与前台展示一致）`,
  )
  return [
    '校验时按「币种 / 对应资产」分别判断是否达到充值门槛。',
    '若用户在各币种下仍有未达标项，系统取其中门槛最低的一条作为当前待完成条件（便于引导充值）。',
    '若用户从未产生过任何币种维度的充值记录，则不再走分币种充值逻辑，统一按「总资产」规则判断是否达到上麦门槛。',
    `当前配置的总资产门槛（折算展示）：≥ ${totalAssetThresholdCny.value} CNY 等值。`,
    '',
    '已配置分币种门槛：',
    ...lines,
  ].join('\n')
})
</script>

<template>
  <div class="admin-page min-h-svh bg-[#eceff4] text-[#1f2937] antialiased">
    <header class="sticky top-0 z-10 border-b border-black/6 bg-white px-4 py-3 shadow-sm">
      <div class="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
        <div class="min-w-0 flex-1">
          <h1 class="text-base font-semibold text-[#111827]">语音房 · 上麦门槛设置</h1>
          <p class="text-xs text-[#6b7280]">
            条件一：胜率榜单优先上麦（仅开关）。条件二：分币种充值门槛 + 无充值时总资产规则。
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
      <p
        v-if="saveHint"
        class="mx-auto max-w-4xl px-4 pb-2 text-xs text-emerald-700 transition-opacity"
      >
        {{ saveHint }}
      </p>
    </header>

    <main class="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <!-- 条件一 -->
      <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div class="border-b border-black/6 bg-[#f9fafb] px-4 py-3">
          <h2 class="text-sm font-semibold text-[#111827]">条件一 · 胜率榜单优先上麦</h2>
          <p class="mt-1 text-xs leading-relaxed text-[#6b7280]">
            同时满足「该游戏历史胜率排名前 10」与「近 7 天胜率排名前 10」的用户，自动获得优先上麦资格。本规则无额外参数，后台仅维护是否启用。
          </p>
        </div>
        <div class="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <label
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-1 transition hover:border-black/8"
          >
            <input
              v-model="priorityMicEnabled"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#111827] focus:ring-2 focus:ring-[#111827]/20"
            />
            <span>
              <span class="block text-sm font-medium text-[#111827]">启用该规则</span>
              <span class="mt-0.5 block text-xs text-[#6b7280]">
                关闭后，不再根据双榜单自动授予优先上麦资格（仅影响条件一）。
              </span>
            </span>
          </label>
          <div
            class="shrink-0 rounded-lg border px-3 py-2 text-xs transition-colors"
            :class="
              priorityMicEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-black/10 bg-[#f3f4f6] text-[#6b7280]'
            "
          >
            当前状态：{{ priorityMicEnabled ? '已启用' : '已关闭' }}
          </div>
        </div>
      </section>

      <!-- 条件二 -->
      <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div class="border-b border-black/6 bg-[#f9fafb] px-4 py-3">
          <h2 class="text-sm font-semibold text-[#111827]">条件二 · 分币种充值门槛</h2>
          <p class="mt-1 text-xs leading-relaxed text-[#6b7280]">
            法币与链上 / 平台资产对应关系：
            <span class="font-medium text-[#374151]">CNY → KKC</span>，
            <span class="font-medium text-[#374151]">VND → KKV</span>，
            <span class="font-medium text-[#374151]">USD → USDT</span>。
            校验时对各币种分别判断充值是否达标；在用户仍有未满足项时，取其中
            <span class="font-medium text-[#111827]">门槛最低</span>
            的一条作为当前待完成条件。若用户
            <span class="font-medium text-[#111827]">从未在任何币种下有过充值记录</span>，
            则改为按
            <span class="font-medium text-[#111827]">总资产</span>
            规则判定。
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-left text-sm">
            <thead class="border-b border-black/6 bg-white text-xs font-medium uppercase tracking-wide text-[#6b7280]">
              <tr>
                <th class="px-4 py-3">法币币种</th>
                <th class="px-4 py-3">对应资产</th>
                <th class="px-4 py-3">最低充值门槛</th>
                <th class="px-4 py-3 text-[#9ca3af]">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-black/6">
              <tr v-for="row in currencyRows" :key="row.fiat" class="bg-white transition hover:bg-[#fafafa]">
                <td class="px-4 py-3 font-medium text-[#111827]">{{ row.fiat }}</td>
                <td class="px-4 py-3 text-[#374151]">
                  <span class="font-mono text-xs">{{ row.token }}</span>
                  <span class="ml-2 text-xs text-[#9ca3af]">（{{ row.assetLabel }}）</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex max-w-[200px] items-center gap-2">
                    <input
                      v-model="row.minRecharge"
                      type="text"
                      inputmode="decimal"
                      class="w-full rounded-lg border border-black/10 px-3 py-2 text-sm tabular-nums outline-none transition focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/15"
                      :aria-label="`${row.fiat} 最低充值门槛`"
                    />
                  </div>
                </td>
                <td class="px-4 py-3 text-xs text-[#9ca3af]">达到即视为该币种维度达标</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-black/6 bg-[#f9fafb] px-4 py-4">
          <label class="block text-xs font-medium text-[#374151]">无充值记录时 · 总资产门槛（CNY 等值展示）</label>
          <div class="mt-2 flex max-w-xs flex-col gap-2 sm:flex-row sm:items-center">
            <input
              v-model="totalAssetThresholdCny"
              type="text"
              inputmode="decimal"
              class="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/15"
              placeholder="例如 1000"
            />
            <span class="shrink-0 text-xs text-[#6b7280]">单位：CNY 等值</span>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-[#6b7280]">
            当用户在所有法币维度均无充值流水时，系统不再拆分 KKC / KKV / USDT 充值条件，统一按账户总资产是否达到上述门槛判断上麦资格（演示原型，实际折算口径以后端为准）。
          </p>
        </div>
      </section>

      <!-- 判定说明（只读） -->
      <section class="rounded-xl border border-dashed border-black/15 bg-white/80 px-4 py-4">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">判定逻辑摘要（只读）</h3>
        <pre
          class="mt-2 whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-[#4b5563]"
        >{{ ruleSummary }}</pre>
      </section>
    </main>
  </div>
</template>
