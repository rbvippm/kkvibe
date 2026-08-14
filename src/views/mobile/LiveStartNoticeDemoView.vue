<script setup lang="ts">
import { ref } from 'vue'
import '../../styles/mobile-h5.css'
import '../../styles/mobile-app-shell.css'
import {
  useLiveStartNotice,
  type TopNoticePayload,
} from '../../composables/useLiveStartNotice'

const { embedded = false } = defineProps<{ embedded?: boolean }>()
const { push, dismissAll, queue } = useLiveStartNotice()

const autoDismissMs = ref(6000)
const lastAction = ref('等待操作…')

const mockLiveNotices: TopNoticePayload[] = [
  {
    id: 'n1',
    kind: 'live_start',
    hostId: '3180664521199420602',
    hostName: '小旋风_直播',
    hostAvatar: '旋',
    roomId: 'live_8829103',
    roomTitle: '深夜聊天局 · 进来唠两句',
  },
  {
    id: 'n2',
    kind: 'live_start',
    hostId: '3180664521199420603',
    hostName: '南岸听风',
    hostAvatar: '南',
    roomId: 'live_8829104',
    roomTitle: '下班放松电台',
  },
]

const mockVoiceMicNotices: TopNoticePayload[] = [
  {
    id: 'v1',
    kind: 'voice_mic_on',
    hostId: '3180664521199420888',
    hostName: '大神阿凯',
    hostAvatar: '凯',
    roomId: 'voice_7721001',
    roomTitle: '周末开黑语聊房',
    micIndex: 3,
  },
  {
    id: 'v2',
    kind: 'voice_mic_on',
    hostId: '3180664521199420777',
    hostName: '房管小陈',
    hostAvatar: '陈',
    roomId: 'voice_7721002',
    roomTitle: '深夜情感电台',
    micIndex: 1,
  },
]

const feedItems = [
  { id: 'f1', title: '推荐直播', desc: '8 人在线 · 语聊房', tag: '热门' },
  { id: 'f2', title: '好友动态', desc: '小旋风 刚刚发布了动态', tag: '' },
  { id: 'f3', title: '活动专区', desc: '开播有礼 · 限时加成', tag: '活动' },
  { id: 'f4', title: '我的关注', desc: '3 位主播正在直播', tag: '直播' },
]

let liveMockIndex = 0
let voiceMockIndex = 0

function log(msg: string) {
  lastAction.value = msg
}

function triggerLiveStart() {
  const payload = mockLiveNotices[liveMockIndex % mockLiveNotices.length]
  liveMockIndex += 1
  push({ ...payload, id: `${payload.id}_${Date.now()}` }, { durationMs: autoDismissMs.value })
  log(`开播通知：${payload.hostName}`)
}

function triggerVoiceMicOn() {
  const payload = mockVoiceMicNotices[voiceMockIndex % mockVoiceMicNotices.length]
  voiceMockIndex += 1
  push({ ...payload, id: `${payload.id}_${Date.now()}` }, { durationMs: autoDismissMs.value })
  log(`上麦通知：${payload.hostName} · ${payload.micIndex} 号麦`)
}

function triggerBurst() {
  const batch: TopNoticePayload[] = [
    { ...mockLiveNotices[0], id: `burst_${Date.now()}_0` },
    { ...mockVoiceMicNotices[0], id: `burst_${Date.now()}_1` },
  ]
  batch.forEach((item) => push(item, { durationMs: autoDismissMs.value }))
  log(`混合推送 ${batch.length} 条（开播 + 上麦，队列依次展示）`)
}

function clearAll() {
  dismissAll()
  log('已关闭浮层并清空队列')
}
</script>

<template>
  <div
    class="mh5-page"
    :class="{ 'mh5-embedded-page mh5-embedded-light': embedded }"
  >
    <header v-if="!embedded" class="mh5-header">
      <p class="mh5-eyebrow mh5-eyebrow--rose">{{ $t('全局组件样板') }}</p>
      <h1 class="mh5-title">{{ $t('应用内通知 · 顶部浮窗') }}</h1>
      <p class="mh5-desc">{{ $t('支持开播、语聊房上麦两类推送；浮层全局挂载，本页为演示控制台。') }}</p>
    </header>
    <header v-else class="mh5-embedded-head">
      <h1 class="mh5-embedded-head__title">{{ $t('开播通知演示') }}</h1>
      <p class="mh5-embedded-head__desc">{{ $t('顶部浮窗 · 开播与上麦推送') }}</p>
    </header>

    <main class="mh5-main" :class="{ '!px-3 !py-3': embedded }">
      <section class="mh5-card">
        <h2 class="mh5-section-title">{{ $t('触发演示') }}</h2>
        <p class="mt-1 text-xs opacity-75">{{ $t('两类通知共用队列；关闭后若仍有下一条会自动顶上。') }}</p>
        <div class="mh5-btn-row">
          <button type="button" class="mh5-btn mh5-btn--primary" @click="triggerLiveStart()">{{ $t('主播开播了') }}</button>
          <button type="button" class="mh5-btn mh5-btn--sky" @click="triggerVoiceMicOn()">{{ $t('大神语聊房上麦') }}</button>
          <button type="button" class="mh5-btn mh5-btn--outline" @click="triggerBurst()">{{ $t('混合推送 2 条') }}</button>
          <button type="button" class="mh5-btn mh5-btn--ghost-danger" @click="clearAll()">{{ $t('全部关闭') }}</button>
        </div>
        <div class="mt-4">
          <label class="text-xs font-medium text-[var(--text-h)]">
            自动关闭时长（秒）：{{ autoDismissMs / 1000 }}
          </label>
          <input
            v-model.number="autoDismissMs"
            type="range"
            min="3000"
            max="12000"
            step="1000"
            class="mt-2 w-full accent-rose-500"
          />
        </div>
        <p
          class="mt-3 rounded-lg px-3 py-2 text-xs"
          :class="embedded ? 'bg-[#f5f6f8] text-[#666]' : 'bg-black/5 dark:bg-white/5'"
        >
          <span class="font-medium" :class="embedded ? 'text-[#1a1a1a]' : 'text-[var(--text-h)]'">{{ $t('状态：') }}</span>{{ lastAction }}
          <span v-if="queue.length" class="ml-2 text-rose-600">（队列 {{ queue.length }} 条）</span>
        </p>
      </section>

      <section class="mh5-card mh5-card--dashed">
        <h2 class="text-xs font-semibold uppercase tracking-wide opacity-60">{{ $t('模拟 App 首页内容层') }}</h2>
        <ul class="mt-3 space-y-2">
          <li v-for="item in feedItems" :key="item.id" class="mh5-feed-item">
            <div>
              <p class="text-sm font-medium text-[var(--text-h)]">{{ $t(item.title) }}</p>
              <p class="text-xs opacity-70">{{ item.desc }}</p>
            </div>
            <span v-if="item.tag" class="mh5-tag">{{ item.tag }}</span>
          </li>
        </ul>
        <p class="mt-3 text-center text-[11px] opacity-50">{{ $t('在真实 App 中，浮窗会覆盖在此类页面之上') }}</p>
      </section>

      <section class="mh5-hint-bar">
        <span class="font-semibold">{{ $t('接入提示：') }}</span>{{ $t('在') }}<code :class="embedded ? '' : 'rounded bg-black/5 px-1 dark:bg-white/10'">App.vue</code>{{ $t('挂载') }}<code :class="embedded ? '' : 'rounded bg-black/5 px-1 dark:bg-white/10'">LiveStartTopNotice</code>{{ $t('，业务侧收到开播事件后调用') }}<code :class="embedded ? '' : 'rounded bg-black/5 px-1 dark:bg-white/10'">push({ kind: 'live_start' | 'voice_mic_on', ... })</code>。
      </section>
    </main>

    <footer v-if="!embedded" class="mh5-footer">{{ $t('/mobile/live · 通知') }}</footer>
  </div>
</template>
