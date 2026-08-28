<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { useAssistantVoiceRoom } from '../../composables/useAssistantVoiceRoom'
import { ASSISTANT_MODAL_TITLES, useLiveAnchorAssistant } from '../../composables/useLiveAnchorAssistant'
import { useLiveDanmakuMute } from '../../composables/useLiveDanmakuMute'
import { showPcToast } from '../../composables/usePcToast'
import {
  ASSISTANT_CHAT_EMOJIS,
  ASSISTANT_CHAT_FILTERS,
  ASSISTANT_GIFT_CURRENCY,
  ASSISTANT_TOOLBOX,
  assistantAvatarOf,
  assistantGiftIconOf,
  assistantChatFilterKey,
  formatAssistantGiftAmount,
  assistantChatKindLabel,
  assistantChatRoleLabel,
  assistantChatRoleOf,
  formatAssistantChatLine,
  isAssistantChatMuteDisabled,
  GO_LIVE_GUIDE_LEAD,
  GO_LIVE_GUIDE_STEPS,
  GO_LIVE_GUIDE_TIPS,
  LIVE_CATEGORIES,
  type AssistantChatFilterKey,
  type AssistantChatMsg,
  type RankUser,
} from '../../constants/liveAnchorAssistant'
import '../../styles/pc-wireframe.css'
import '../../styles/live-anchor-assistant.css'

const a = useLiveAnchorAssistant()
const voice = useAssistantVoiceRoom()
const { muteUser, isUserMuted, blockUser, unblockUser, isUserBlocked } = useLiveDanmakuMute()
const shellEl = ref<HTMLElement | null>(null)
const onlineListEl = ref<HTMLElement | null>(null)

function goOnlinePage(next: number) {
  a.setOnlinePage(next)
  void nextTick(() => {
    onlineListEl.value?.scrollTo({ top: 0 })
  })
}

watch(shellEl, (el) => a.bindToolboxShell(el), { flush: 'post' })

type MuteTarget = {
  userId: string
  username: string
  content: string
  role?: AssistantChatMsg['role']
  from?: 'chat' | 'list'
}

const actionMenuVisible = ref(false)
const actionMenuPos = ref({ x: 0, y: 0 })
const activeTarget = ref<MuteTarget | null>(null)
const muteModalVisible = ref(false)
const muteTarget = ref<MuteTarget | null>(null)
const muteReason = ref('')
const muteReasonHint = ref('')
const blockModalVisible = ref(false)
const blockTarget = ref<MuteTarget | null>(null)
const emojiOpen = ref(false)
const chatFilterOpen = ref(false)
const chatFilterPanelUp = ref(false)
const chatFilters = reactive<Record<AssistantChatFilterKey, boolean>>({
  enter: true,
  gift: true,
  chat: true,
  interact: true,
})
const visibleChats = computed(() =>
  a.chatMessages.value.filter((msg) => chatFilters[assistantChatFilterKey(msg.kind)]),
)
const chatListEl = ref<HTMLElement | null>(null)
const chatPinnedToBottom = ref(true)
const chatUnseen = ref(0)
const CHAT_BOTTOM_GAP = 28
const CHAT_INCOMING_DEMO: Omit<AssistantChatMsg, 'id'>[] = [
  { nickname: '夜色观星', userId: 'u10086', kind: 'chat', text: '主播再讲一遍规则' },
  { nickname: '三1放', userId: 'u10089', kind: 'like' },
  { nickname: '艾米粒', userId: 'u10090', kind: 'liveGift', giftName: '小心心', giftCount: 1 },
]
let chatIncomingArmed = false
let chatIncomingTimers: number[] = []
let skipNextDocumentClose = false

const showChatJump = computed(() => !chatPinnedToBottom.value)
const chatUnseenLabel = computed(() => {
  if (chatUnseen.value <= 0) return ''
  return chatUnseen.value > 99 ? '99+' : String(chatUnseen.value)
})

function isChatNearBottom() {
  const el = chatListEl.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight <= CHAT_BOTTOM_GAP
}

function scrollChatToBottom() {
  const el = chatListEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function clearChatIncomingDemo() {
  chatIncomingTimers.forEach((id) => window.clearTimeout(id))
  chatIncomingTimers = []
  chatIncomingArmed = false
}

function armChatIncomingDemo() {
  if (chatIncomingArmed) return
  chatIncomingArmed = true
  ;[800, 2000, 3600].forEach((ms, index) => {
    const sample = CHAT_INCOMING_DEMO[index]
    if (!sample) return
    chatIncomingTimers.push(
      window.setTimeout(() => {
        if (chatPinnedToBottom.value) return
        a.chatMessages.value = [
          ...a.chatMessages.value,
          { ...sample, id: `c-in-${Date.now()}-${index}` },
        ]
      }, ms),
    )
  })
}

function pinChatToLatest() {
  chatPinnedToBottom.value = true
  chatUnseen.value = 0
  clearChatIncomingDemo()
  void nextTick(() => {
    scrollChatToBottom()
  })
}

function onChatScroll() {
  if (isChatNearBottom()) {
    chatPinnedToBottom.value = true
    chatUnseen.value = 0
    clearChatIncomingDemo()
    return
  }
  chatPinnedToBottom.value = false
  armChatIncomingDemo()
}

function jumpChatToBottom() {
  pinChatToLatest()
}

function sendChatFromComposer() {
  if (!a.chatDraft.value.trim()) return
  a.sendChat()
  pinChatToLatest()
}

watch(
  () => visibleChats.value.length,
  (count, prev) => {
    const delta = count - (prev ?? 0)
    if (delta <= 0) return
    if (chatPinnedToBottom.value) {
      void nextTick(() => scrollChatToBottom())
      return
    }
    chatUnseen.value += delta
  },
)

const activeRoleLabel = computed(() => {
  const target = activeTarget.value
  if (!target) return null
  return assistantChatRoleLabel(assistantChatRoleOf({ userId: target.userId, role: target.role }))
})
const activeMuteDisabled = computed(
  () =>
    !activeTarget.value ||
    isAssistantChatMuteDisabled(activeTarget.value.userId, activeTarget.value.role) ||
    isUserMuted(activeTarget.value.userId),
)
const activeBlockDisabled = computed(
  () => !activeTarget.value || isAssistantChatMuteDisabled(activeTarget.value.userId, activeTarget.value.role),
)
const activeBlocked = computed(() => !!activeTarget.value && isUserBlocked(activeTarget.value.userId))

function placeActionMenu(event: MouseEvent) {
  const menuW = 248
  const menuH = 176
  actionMenuPos.value = {
    x: Math.min(Math.max(12, event.clientX), window.innerWidth - menuW),
    y: Math.min(Math.max(12, event.clientY), window.innerHeight - menuH),
  }
}

function openUserMenu(event: MouseEvent, userId: string, username: string, msg: AssistantChatMsg) {
  if (!userId) return
  event.preventDefault()
  event.stopPropagation()
  skipNextDocumentClose = true
  activeTarget.value = {
    userId,
    username,
    content: formatAssistantChatLine(msg),
    role: userId === msg.userId ? assistantChatRoleOf(msg) : 'user',
    from: 'chat',
  }
  placeActionMenu(event)
  actionMenuVisible.value = true
  requestAnimationFrame(() => {
    skipNextDocumentClose = false
  })
}

function openAudienceMenu(event: MouseEvent, user: RankUser) {
  if (!user.id) return
  event.preventDefault()
  event.stopPropagation()
  skipNextDocumentClose = true
  activeTarget.value = {
    userId: user.id,
    username: user.nickname,
    content: '在线列表',
    role: 'user',
    from: 'list',
  }
  placeActionMenu(event)
  actionMenuVisible.value = true
  requestAnimationFrame(() => {
    skipNextDocumentClose = false
  })
}

function closeActionMenu() {
  actionMenuVisible.value = false
  activeTarget.value = null
}

function onDocumentClick() {
  if (skipNextDocumentClose) return
  if (actionMenuVisible.value) closeActionMenu()
  emojiOpen.value = false
  chatFilterOpen.value = false
}

function toggleEmojiPanel(event: MouseEvent) {
  event.stopPropagation()
  chatFilterOpen.value = false
  emojiOpen.value = !emojiOpen.value
}

function toggleChatFilterPanel(event: MouseEvent) {
  event.stopPropagation()
  emojiOpen.value = false
  const next = !chatFilterOpen.value
  if (next) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    chatFilterPanelUp.value = rect.bottom + 220 > window.innerHeight
  }
  chatFilterOpen.value = next
}

function pickEmoji(emoji: string) {
  a.insertChatEmoji(emoji)
}

function openMuteModal() {
  const target = activeTarget.value
  if (!target || isAssistantChatMuteDisabled(target.userId, target.role)) return
  muteTarget.value = target
  muteReason.value = ''
  muteReasonHint.value = ''
  closeActionMenu()
  muteModalVisible.value = true
}

function closeMuteModal() {
  muteModalVisible.value = false
  muteTarget.value = null
  muteReason.value = ''
  muteReasonHint.value = ''
}

function openBlockModal() {
  const target = activeTarget.value
  if (!target || isAssistantChatMuteDisabled(target.userId, target.role)) return
  if (isUserBlocked(target.userId)) {
    unblockUser(target.userId)
    showPcToast(`已取消拉黑 ${target.username}`)
    closeActionMenu()
    return
  }
  blockTarget.value = target
  closeActionMenu()
  blockModalVisible.value = true
}

function closeBlockModal() {
  blockModalVisible.value = false
  blockTarget.value = null
}

function confirmBlock() {
  const target = blockTarget.value
  if (!target) return
  blockUser(target.userId)
  showPcToast(`已拉黑用户 ${target.username}`)
  closeBlockModal()
}

function confirmMute() {
  const target = muteTarget.value
  if (!target) return
  if (!muteReason.value.trim()) {
    muteReasonHint.value = '请输入禁言原因'
    return
  }
  muteUser({
    userId: target.userId,
    username: target.username,
    muteSource: '主播',
    muteType: '房间禁言',
    reason: muteReason.value.trim(),
    danmakuContent: target.content,
    danmakuSentAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
  showPcToast(`已房间禁言用户 ${target.username}`)
  closeMuteModal()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  void nextTick(() => scrollChatToBottom())
})

onUnmounted(() => {
  a.bindToolboxShell(null)
  document.removeEventListener('click', onDocumentClick)
  clearChatIncomingDemo()
})

function pickSchedulePart(part: 'day' | 'hour' | 'minute', value: number) {
  if (part === 'day') a.timeDay.value = value
  else if (part === 'hour') a.timeHour.value = value
  else a.timeMinute.value = value
  a.formError.value = ''
}

function onScheduleHourChange(event: Event) {
  pickSchedulePart('hour', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <div class="pc-wireframe-page lal-page">
    <WfPagePathMenu />
    <p v-if="a.actionHint.value" class="lal-hint">{{ a.actionHint.value }}</p>

    <div
      ref="shellEl"
      class="lal-shell"
      :class="{ 'is-box-collapsed': a.toolboxCollapsed.value }"
    >
      <aside class="lal-left" :class="{ 'is-collapsed': a.toolboxCollapsed.value }">
        <div class="lal-box__head">
          <strong>功能盒子</strong>
          <button
            type="button"
            class="lal-box__fold"
            :title="a.toolboxCollapsed.value ? '展开功能盒子' : '收起功能盒子'"
            :aria-label="a.toolboxCollapsed.value ? '展开功能盒子' : '收起功能盒子'"
            :aria-expanded="!a.toolboxCollapsed.value"
            @click="a.toggleToolbox"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path fill="currentColor" d="M2 4h8v1.3H2V4Zm0 3.35h8v1.3H2v-1.3Zm0 3.35h8V12H2v-1.3Z" />
              <path
                fill="currentColor"
                :d="a.toolboxCollapsed.value ? 'M11 5.2 15 8l-4 2.8V5.2Z' : 'M15 5.2 11 8l4 2.8V5.2Z'"
              />
            </svg>
          </button>
        </div>
        <div class="lal-box__nav">
          <button
            v-for="item in ASSISTANT_TOOLBOX"
            :key="item.key"
            type="button"
            class="lal-box__tile"
            :class="{
              'is-on': a.modal.value === 'gameCenter',
              'is-talk': item.key === 'games' && a.commentingGameId.value,
            }"
            :title="item.label"
            @click="a.openGameCenter"
          >
            <span class="lal-box__glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <rect x="3" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
                <rect x="13" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
                <rect x="3" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
                <path d="M14.5 16.5h5M17 14v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
            <em>{{ item.label }}</em>
          </button>
        </div>
      </aside>

      <section class="lal-center">
        <div class="lal-head">
          <div class="lal-head__main">
            <h2 class="lal-title">{{ a.roomTitle.value }}</h2>
            <button type="button" class="lal-edit" @click="a.openModal('basic')">编辑</button>
            <span class="lal-tag">{{ a.categoryTag.value }}</span>
          </div>
          <button type="button" class="wf-btn wf-btn--default" @click="a.openScheduleSheet">
            预告 {{ a.activeSchedules.value.length }}
          </button>
        </div>
        <div class="lal-stats" :class="{ 'is-live': a.live.value }">
          <span class="lal-stats__item lal-stats__item--online">
            <em>
              <svg class="lal-stats__ico" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6.2 7.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Zm5.1.3a1.9 1.9 0 1 0-1.5-3.4 3.1 3.1 0 0 1 .2 3.4ZM2.2 13c0-2 2-3.2 4-3.2s4 1.2 4 3.2v.6H2.2V13Zm8.2.6V13c0-.7-.2-1.3-.6-1.8 1.5.2 3 .9 3 2.2v.2h-2.4Z"
                />
              </svg>
              在线人数
            </em>
            <b>{{ a.formatAssistantMetric(a.online.value) }}</b>
          </span>
          <span class="lal-stats__item lal-stats__item--like">
            <em>
              <svg class="lal-stats__ico" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6.1 14.2H3.4A1.4 1.4 0 0 1 2 12.8V8.3A1.4 1.4 0 0 1 3.4 6.9h1.2l2.2-3.5A1.6 1.6 0 0 1 8.2 2.6c.9.2 1.3 1.1 1.1 1.9l-.3 1.5h1.6c1.6 0 2.8 1.4 2.5 2.9l-.6 3.2c-.3 1.3-1.4 2.1-2.7 2.1H6.1Zm-2.7-1.4h1.3V8.3H3.4v4.5Zm2.7 0h3.7c.6 0 1-.4 1.1-.9l.6-3.2c.1-.6-.4-1.1-1-1.1H8.2l.5-2.4c0-.2-.1-.4-.3-.4l-2.3 3.7V12.8Z"
                />
              </svg>
              本场点赞
            </em>
            <b>{{ a.formatAssistantMetric(a.sessionLikes.value) }}</b>
          </span>
          <span class="lal-stats__item lal-stats__item--heat">
            <em>
              <svg class="lal-stats__ico" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8.2 1.6c.2 1.6-.1 3-1 4.1-.5.6-.7 1.2-.6 1.8.1.7.6 1.3 1.3 1.6-.5-.1-.8-.6-.8-1.1 0-.4.2-.8.5-1.2C9.2 5.3 10 3.8 10 2.2c1.4 1.3 2.6 3.3 2.6 5.4 0 2.5-1.9 4.6-4.6 4.6S3.4 10.1 3.4 7.6c0-1.7 1-3.3 2.2-4.4-.2 1.1 0 2.2.7 3.1.2-.9.7-1.7 1.4-2.4.2-.2.4-.5.5-2.3Z"
                />
              </svg>
              热度值
            </em>
            <b>{{ a.formatAssistantMetric(a.sessionHeat.value) }}</b>
          </span>
          <span class="lal-stats__item lal-stats__item--time">
            <em>
              <svg class="lal-stats__ico" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 1.5A6.5 6.5 0 1 0 14.5 8 6.51 6.51 0 0 0 8 1.5Zm0 11.6A5.1 5.1 0 1 1 13.1 8 5.1 5.1 0 0 1 8 13.1Zm.6-8.4H7.2v3.7l2.9 1.7.7-1.2-2.2-1.3V4.7Z"
                />
              </svg>
              直播时长
            </em>
            <b>{{ a.durationText.value }}</b>
          </span>
        </div>
        <button v-if="a.linkedSchedule.value" type="button" class="lal-linkbar" @click="a.openScheduleSheet">
          <span>
            已关联：{{ a.linkBarTime.value }}（{{ a.linkedSchedule.value.subscriberCount }}人已预约）
          </span>
          <span>切换/管理 ›</span>
        </button>
        <div
          class="lal-preview"
          :class="{ 'lal-preview--cover': !a.live.value && a.linkedSchedule.value, 'is-live': a.live.value }"
          :style="a.previewFrameStyle.value"
        >
          <div class="lal-preview__stage">
            <div class="lal-preview__frame" :class="{ 'is-voice': a.liveMode.value === 'voice' }">
              <template v-if="a.liveMode.value === 'voice'">
                <div
                  class="lal-voice__bg"
                  :style="{ backgroundImage: `url(${a.selectedBackground.value.image})` }"
                  aria-hidden="true"
                />
                <div class="lal-voice__shade" aria-hidden="true" />
                <div class="lal-voice__mics" aria-label="麦位">
                  <button
                    v-for="seat in voice.seats.value"
                    :key="seat.id"
                    type="button"
                    class="lal-voice-seat"
                    :class="[
                      `lal-voice-seat--${seat.kind}`,
                      { 'is-host': seat.kind === 'user' && seat.badge === 'host' },
                    ]"
                    :title="seat.kind === 'user' && seat.badge === 'host' ? '主播固定 1 号麦' : `${seat.index} 号麦`"
                    @click="voice.openSeat(seat)"
                  >
                    <template v-if="seat.kind === 'user'">
                      <span
                        class="lal-voice-seat__avatar-wrap"
                        :class="{ 'is-speak': seat.mic === 'speaking' }"
                      >
                        <img class="lal-voice-seat__avatar" :src="seat.avatar" :alt="seat.name" />
                        <em
                          v-if="seat.badge === 'host' || seat.badge === 'admin'"
                          class="lal-voice-seat__role"
                          :class="`lal-voice-seat__role--${seat.badge}`"
                        >
                          {{ seat.badge === 'host' ? '主' : '管' }}
                        </em>
                        <em v-if="seat.badge === 'god'" class="lal-voice-seat__god">神</em>
                        <span
                          class="lal-voice-seat__mic"
                          :class="{
                            'is-mute': seat.mic === 'mute',
                            'is-wave': seat.mic === 'speaking',
                          }"
                        >
                          <img
                            :src="
                              seat.mic === 'speaking'
                                ? voice.VOICE_ROOM_ASSETS.wave
                                : seat.mic === 'mute'
                                  ? voice.VOICE_ROOM_ASSETS.mute
                                  : voice.VOICE_ROOM_ASSETS.mic
                            "
                            alt=""
                          />
                        </span>
                      </span>
                      <span class="lal-voice-seat__name">{{ seat.name }}</span>
                    </template>
                    <template v-else>
                      <span class="lal-voice-seat__hole">
                        <img
                          class="lal-voice-seat__hole-ico"
                          :src="seat.kind === 'locked' ? voice.VOICE_ROOM_ASSETS.lock : voice.VOICE_ROOM_ASSETS.chair"
                          alt=""
                        />
                        <span v-if="seat.seatMuted" class="lal-voice-seat__mic is-mute">
                          <img :src="voice.VOICE_ROOM_ASSETS.mute" alt="" />
                        </span>
                      </span>
                      <span class="lal-voice-seat__name is-empty">
                        {{ seat.kind === 'locked' ? '麦位关闭' : '麦位空闲' }}
                      </span>
                    </template>
                  </button>
                </div>
                <p v-if="voice.allMuted.value" class="lal-voice__mute-banner">全部禁麦中</p>
              </template>
              <template v-else>
                <img
                  v-if="!a.live.value && a.linkedSchedule.value"
                  class="lal-preview__cover"
                  :src="a.cover.value"
                  alt=""
                />
                <div class="lal-preview__state" :class="{ 'is-signal': a.isStreamSignal.value }">
                  <div v-if="a.isStreamSignal.value" class="lal-signal">
                    <div class="lal-ripple" aria-hidden="true">
                      <span class="lal-ripple__line" />
                      <span class="lal-ripple__wave" />
                      <span class="lal-ripple__wave lal-ripple__wave--delay" />
                      <span class="lal-ripple__core" />
                    </div>
                    <strong>{{ a.previewStateLabel.value }}</strong>
                    <p v-if="a.streamPhase.value === 'connecting'" class="lal-preview__hint">正在拉取视频流</p>
                    <p v-else class="lal-preview__hint">画面中断，正在尝试恢复</p>
                  </div>
                  <template v-else>
                    <div class="lal-preview__icon" aria-hidden="true">
                      {{ a.liveMode.value === 'screen' ? '📱' : '📺' }}
                    </div>
                    <strong>{{ a.previewStateLabel.value }}</strong>
                    <em v-if="a.linkedSchedule.value && !a.live.value">已回填</em>
                    <p v-else-if="a.liveMode.value === 'screen' && !a.live.value" class="lal-preview__hint">{{ a.GO_LIVE_SCREEN_HINT }}</p>
                  </template>
                </div>
              </template>
            </div>
          </div>
          <div class="lal-preview__hud">
            <strong>{{ a.liveModeLabel.value }}</strong>
            <span>{{ a.previewHudDetail.value }}</span>
          </div>
          <div class="lal-preview__dock">
            <div class="lal-preview__dock-left">
              <button
                type="button"
                class="lal-icon-btn"
                :class="{ 'is-on': a.muted.value }"
                :title="a.muted.value ? '取消静音' : '静音'"
                :aria-label="a.muted.value ? '取消静音' : '静音'"
                @click="a.muted.value = !a.muted.value"
              >
                <svg v-if="a.muted.value" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5A.5.5 0 0 1 2 9.5v-3A.5.5 0 0 1 2.5 6Zm8.1-.9.7.7-1.5 1.5 1.5 1.5-.7.7-1.5-1.5-1.5 1.5-.7-.7 1.5-1.5-1.5-1.5.7-.7 1.5 1.5 1.5-1.5Z" />
                </svg>
                <svg v-else viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5A.5.5 0 0 1 2 9.5v-3A.5.5 0 0 1 2.5 6Zm7.6-1.2a3.6 3.6 0 0 1 0 6.4l-.7-1.1a2.3 2.3 0 0 0 0-4.2l.7-1.1Zm1.8-1.6a5.6 5.6 0 0 1 0 9.6l-.8-1.1a4.3 4.3 0 0 0 0-7.4l.8-1.1Z" />
                </svg>
              </button>
              <label class="lal-vol">
                <input v-model.number="a.volume.value" type="range" min="0" max="100" :aria-label="`音量 ${a.volume.value}`" />
                <span>{{ a.volume.value }}</span>
              </label>
            </div>
            <div class="lal-preview__dock-right">
              <button
                type="button"
                class="lal-icon-btn"
                title="分享"
                aria-label="分享"
                @click="a.openModal('share')"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M10.2 3.6a1.6 1.6 0 1 1 1.7 1.55L7.4 7.3a1.6 1.6 0 0 1 0 1.4l4.5 2.15a1.6 1.6 0 1 1-.55 1.15L6.9 9.85a1.6 1.6 0 1 1 0-3.7l4.45-2.15a1.6 1.6 0 0 1-.15-.4Z" />
                </svg>
              </button>
              <button
                type="button"
                class="lal-icon-btn"
                title="刷新画面"
                aria-label="刷新画面"
                @click="a.refreshPreview"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M13.2 8A5.2 5.2 0 1 1 8 2.8V1.2L11 3.4 8 5.6V4a4 4 0 1 0 4 4h1.2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="lal-bar">
          <button type="button" class="lal-guide" @click="a.openModal('guide')">开播说明</button>
          <div class="lal-bar__actions">
            <button type="button" class="wf-btn wf-btn--add" @click="a.openSettings">开播设置</button>
            <button
              v-if="!a.live.value"
              type="button"
              class="wf-btn wf-btn--primary"
              :disabled="a.pushChecking.value"
              @click="a.tryStartLive"
            >
              {{ a.pushChecking.value ? '检测推流中' : a.ctaLabel.value }}
            </button>
            <button
              v-else
              type="button"
              class="wf-btn wf-btn--danger"
              @click="a.tryStopLive"
            >
              结束直播
            </button>
          </div>
        </div>
      </section>

      <aside class="lal-right">
        <div class="lal-pane">
          <div class="lal-right__top">
            <strong>在线列表</strong>
            <span class="lal-right__gift-sum">
              礼物总额：{{ formatAssistantGiftAmount(a.giftTotal.value) }} {{ ASSISTANT_GIFT_CURRENCY }}
            </span>
          </div>
          <div class="lal-search">
            <input v-model="a.listKeyword.value" placeholder="搜索昵称或金刚号" />
            <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          </div>
          <div ref="onlineListEl" class="lal-list">
            <div v-if="!a.onlineUsers.value.length" class="lal-empty">
              {{ a.listKeyword.value.trim() ? '未找到匹配观众' : '暂无在线用户' }}
            </div>
            <div
              v-for="(user, index) in a.pagedOnlineUsers.value"
              :key="user.id"
              class="lal-user"
              :class="{
                'is-top': a.onlineListRank(index) <= 3,
                'is-muted': isUserMuted(user.id),
                'is-blocked': isUserBlocked(user.id),
              }"
            >
              <span class="lal-user__rank" :class="`lal-user__rank--${a.onlineListRank(index)}`">{{
                a.onlineListRank(index)
              }}</span>
              <button
                type="button"
                class="lal-user__avatar"
                :title="`查看 ${user.nickname} 的头像`"
                @click="openAudienceMenu($event, user)"
              >
                <img :src="user.avatar" :alt="`${user.nickname}的头像`" />
              </button>
              <span class="lal-user__meta">
                <button type="button" class="lal-user__name" @click="openAudienceMenu($event, user)">
                  {{ user.nickname }}
                </button>
                <em class="lal-user__kingkong">{{ user.kingkongId }}</em>
                <em v-if="isUserMuted(user.id)" class="lal-user__status">已禁言</em>
                <em v-if="isUserBlocked(user.id)" class="lal-user__status">已拉黑</em>
              </span>
              <span class="lal-user__gift">
                <b>{{ formatAssistantGiftAmount(user.giftAmount) }}</b>
                <em>{{ ASSISTANT_GIFT_CURRENCY }}</em>
              </span>
            </div>
          </div>
          <nav v-if="a.onlinePageCount.value > 1" class="lal-list-pager" aria-label="在线列表分页">
            <span class="lal-list-pager__total">共 {{ a.onlineUsers.value.length }} 人</span>
            <div class="lal-list-pager__nav">
              <button
                type="button"
                class="lal-list-pager__btn"
                aria-label="上一页"
                title="上一页"
                :disabled="a.listPage.value <= 1"
                @click="goOnlinePage(a.listPage.value - 1)"
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.6"
                    d="M10 3.2 5.2 8 10 12.8"
                  />
                </svg>
              </button>
              <span class="lal-list-pager__info">
                <b>{{ a.listPage.value }}</b>
                <i>/</i>
                {{ a.onlinePageCount.value }}
              </span>
              <button
                type="button"
                class="lal-list-pager__btn"
                aria-label="下一页"
                title="下一页"
                :disabled="a.listPage.value >= a.onlinePageCount.value"
                @click="goOnlinePage(a.listPage.value + 1)"
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.6"
                    d="M6 3.2 10.8 8 6 12.8"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </div>
        <div class="lal-pane lal-pane--chat">
          <div class="lal-right__top">
            <strong>聊天弹幕</strong>
            <div class="lal-chat-filter">
              <button
                type="button"
                class="lal-chat-filter__btn"
                :class="{ 'is-on': chatFilterOpen }"
                :aria-expanded="chatFilterOpen"
                aria-label="弹幕设置"
                title="弹幕设置"
                @click="toggleChatFilterPanel"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M6.45 1.4h3.1l.38 1.52c.42.14.81.36 1.16.63l1.5-.48 1.55 2.68-1.22.9c.08.35.13.71.13 1.05s-.05.7-.13 1.05l1.22.9-1.55 2.68-1.5-.48a4.7 4.7 0 0 1-1.16.63l-.38 1.52h-3.1l-.38-1.52a4.7 4.7 0 0 1-1.16-.63l-1.5.48L1.86 10.25l1.22-.9A4.5 4.5 0 0 1 2.95 8c0-.34.05-.7.13-1.05l-1.22-.9 1.55-2.68 1.5.48c.35-.27.74-.49 1.16-.63l.38-1.52ZM8 6.15A1.85 1.85 0 1 0 8 9.85 1.85 1.85 0 0 0 8 6.15Z"
                  />
                </svg>
              </button>
            </div>
            <div
              v-if="chatFilterOpen"
              class="lal-chat-filter__panel"
              :class="{ 'is-up': chatFilterPanelUp }"
              role="group"
              aria-label="弹幕设置"
              @click.stop
            >
              <label v-for="item in ASSISTANT_CHAT_FILTERS" :key="item.key" class="lal-chat-filter__row">
                <span>
                  {{ item.label }}
                  <em v-if="item.hint">{{ item.hint }}</em>
                </span>
                <span class="lal-switch">
                  <input v-model="chatFilters[item.key]" type="checkbox" />
                  <i />
                </span>
              </label>
            </div>
          </div>
          <div class="lal-chat-wrap">
          <div ref="chatListEl" class="lal-chat" @scroll.passive="onChatScroll">
            <div v-if="!visibleChats.length" class="lal-empty">
              {{ a.chatMessages.value.length ? '当前筛选下暂无弹幕' : '暂无弹幕' }}
            </div>
            <p
              v-for="msg in visibleChats"
              :key="msg.id"
              class="lal-chat__row"
              :class="{
                [`lal-chat__row--${msg.kind}`]: true,
                [`lal-chat__row--${assistantChatRoleOf(msg)}`]: true,
                'is-muted': isUserMuted(msg.userId) || (msg.targetUserId && isUserMuted(msg.targetUserId)),
              }"
            >
              <button
                type="button"
                class="lal-chat__avatar"
                :title="`查看 ${msg.nickname} 的头像`"
                @click="openUserMenu($event, msg.userId, msg.nickname, msg)"
              >
                <img :src="assistantAvatarOf(msg.userId)" :alt="`${msg.nickname}的头像`" />
              </button>
              <span class="lal-chat__body">
                <em v-if="assistantChatKindLabel(msg.kind)" class="lal-chat__kind" :class="`lal-chat__kind--${msg.kind}`">
                  {{ assistantChatKindLabel(msg.kind) }}
                </em>
                <template v-if="msg.kind === 'voiceGift'">
                  <button
                    type="button"
                    class="lal-chat__name"
                    :class="`lal-chat__name--${assistantChatRoleOf(msg)}`"
                    @click="openUserMenu($event, msg.userId, msg.nickname, msg)"
                  >
                    {{ msg.nickname }}
                  </button>
                  <em v-if="assistantChatRoleLabel(assistantChatRoleOf(msg))" class="lal-chat__role" :class="`lal-chat__role--${assistantChatRoleOf(msg)}`">
                    {{ assistantChatRoleLabel(assistantChatRoleOf(msg)) }}
                  </em>
                  <i class="lal-chat__act">送给</i>
                  <button
                    v-if="msg.targetUserId"
                    type="button"
                    class="lal-chat__avatar lal-chat__avatar--inline"
                    :title="`查看 ${msg.target} 的头像`"
                    @click="openUserMenu($event, msg.targetUserId, msg.target ?? '', msg)"
                  >
                    <img :src="assistantAvatarOf(msg.targetUserId)" :alt="`${msg.target}的头像`" />
                  </button>
                  <button
                    v-if="msg.targetUserId"
                    type="button"
                    class="lal-chat__name"
                    @click="openUserMenu($event, msg.targetUserId, msg.target ?? '', msg)"
                  >
                    {{ msg.target }}
                  </button>
                  <template v-else>{{ msg.target }}</template>
                  <img class="lal-chat__gift" :src="assistantGiftIconOf(msg.giftName)" :alt="msg.giftName ?? '礼物'" />
                  <i class="lal-chat__act">{{ msg.giftName }} x{{ msg.giftCount }}</i>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="lal-chat__name"
                    :class="`lal-chat__name--${assistantChatRoleOf(msg)}`"
                    @click="openUserMenu($event, msg.userId, msg.nickname, msg)"
                  >
                    {{ msg.nickname }}
                  </button>
                  <em v-if="assistantChatRoleLabel(assistantChatRoleOf(msg))" class="lal-chat__role" :class="`lal-chat__role--${assistantChatRoleOf(msg)}`">
                    {{ assistantChatRoleLabel(assistantChatRoleOf(msg)) }}
                  </em>
                  ：
                  <i v-if="msg.kind === 'enter'" class="lal-chat__act">进入直播间</i>
                  <i v-else-if="msg.kind === 'follow'" class="lal-chat__act">关注了您～</i>
                  <i v-else-if="msg.kind === 'like'" class="lal-chat__act">已为您点赞～</i>
                  <template v-else-if="msg.kind === 'liveGift'">
                    <i class="lal-chat__act">送出</i>
                    <img class="lal-chat__gift" :src="assistantGiftIconOf(msg.giftName)" :alt="msg.giftName ?? '礼物'" />
                    <i class="lal-chat__act">{{ msg.giftName }} x{{ msg.giftCount }}</i>
                  </template>
                  <template v-else>{{ msg.text }}</template>
                </template>
                <em v-if="isUserMuted(msg.userId)" class="lal-chat__muted">已禁言</em>
              </span>
            </p>
          </div>
          <Transition name="lal-chat-jump">
            <button
              v-if="showChatJump"
              type="button"
              class="lal-chat-jump"
              :aria-label="chatUnseenLabel ? `${chatUnseenLabel}条新消息，回到底部` : '回到底部'"
              title="回到底部"
              @click="jumpChatToBottom"
            >
              <span v-if="chatUnseenLabel" class="lal-chat-jump__badge">{{ chatUnseenLabel }}</span>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.5 6.5 8 11l4.5-4.5"
                />
              </svg>
            </button>
          </Transition>
          </div>
          <form class="lal-chat__composer" @submit.prevent="sendChatFromComposer()">
            <input v-model="a.chatDraft.value" maxlength="80" placeholder="说点什么" />
            <div class="lal-chat__emoji-wrap">
              <button
                type="button"
                class="lal-chat__emoji"
                :class="{ 'is-on': emojiOpen }"
                title="表情"
                aria-label="表情"
                :aria-expanded="emojiOpen"
                @click="toggleEmojiPanel"
              >
                ☺
              </button>
              <div v-if="emojiOpen" class="lal-emoji" role="listbox" aria-label="表情" @click.stop>
                <button
                  v-for="item in ASSISTANT_CHAT_EMOJIS"
                  :key="item"
                  type="button"
                  class="lal-emoji__item"
                  :aria-label="`插入${item}`"
                  @click="pickEmoji(item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>
            <button type="submit" class="wf-btn wf-btn--primary">发送</button>
          </form>
        </div>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="a.modal.value" class="wf-modal-mask" @click.self="a.closeModal">
        <div
          class="wf-modal"
          :class="{
            'wf-modal--scroll': !['startConfirm', 'stopConfirm', 'deleteSchedule', 'share', 'ratio', 'pushCheckFail'].includes(a.modal.value),
            'wf-modal--narrow': ['share', 'startConfirm', 'stopConfirm', 'deleteSchedule', 'ratio', 'pushCheckFail'].includes(a.modal.value),
            'lal-modal--confirm': ['startConfirm', 'stopConfirm', 'deleteSchedule', 'pushCheckFail'].includes(a.modal.value),
            'lal-modal--games': a.modal.value === 'gameCenter',
            'lal-modal--guide': a.modal.value === 'guide',
            'lal-modal--time': a.modal.value === 'scheduleTime',
            'lal-modal--schedule': a.modal.value === 'previewNotice',
          }"
          role="dialog"
          aria-modal="true"
        >
          <header class="wf-modal__header">
            <h3 class="wf-modal__title">{{ a.modal.value ? ASSISTANT_MODAL_TITLES[a.modal.value] : '' }}</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="a.closeModal">×</button>
          </header>
          <div class="wf-modal__body">
            <p v-if="a.formError.value" class="wf-modal__error">{{ a.formError.value }}</p>

            <template v-if="a.modal.value === 'guide'">
              <div class="lal-guide-box">
                <p class="lal-guide-box__lead">{{ GO_LIVE_GUIDE_LEAD }}</p>
                <ol class="lal-guide-steps">
                  <li v-for="(step, index) in GO_LIVE_GUIDE_STEPS" :key="step.title">
                    <span class="lal-guide-steps__no" aria-hidden="true">{{ index + 1 }}</span>
                    <div>
                      <strong>第 {{ index + 1 }} 步 · {{ step.title }}</strong>
                      <p>{{ step.desc }}</p>
                    </div>
                  </li>
                </ol>
                <div class="lal-guide-tips">
                  <strong>直播预告说明</strong>
                  <ul>
                    <li v-for="tip in GO_LIVE_GUIDE_TIPS" :key="tip">{{ tip }}</li>
                  </ul>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'basic'">
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required" for="lal-basic-title">标题</label>
                <div>
                  <textarea
                    id="lal-basic-title"
                    v-model="a.roomTitle.value"
                    class="wf-input wf-input--full lal-basic-title"
                    rows="3"
                    maxlength="200"
                    placeholder="请输入直播标题"
                  />
                  <p class="wf-form-row__hint lal-basic-count">{{ a.roomTitle.value.length }}/200</p>
                </div>
              </div>
              <div class="wf-form-row">
                <span class="wf-form-row__label">封面</span>
                <div>
                  <div class="lal-cover">
                    <button type="button" class="lal-cover__img" @click="a.changeCover">
                      <img v-if="a.cover.value" :src="a.cover.value" alt="" />
                      <span v-else>封面</span>
                    </button>
                    <button type="button" class="wf-btn wf-btn--default" @click="a.changeCover">更换封面</button>
                  </div>
                  <p class="wf-form-row__hint">为保证封面观看质量，请选择清晰图片</p>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'previewNotice'">
              <p class="wf-form-row__hint lal-sch-lead">
                有效预告 {{ a.activeSchedules.value.length }}/5，与移动端直播中心共用场次。新建后请点「发布」，未发布不会同步到直播中心。封面默认沿用基本信息，点缩略图可为本场单独更换。
              </p>
              <div
                v-if="!a.activeSchedules.value.length && !a.hasUnpublishedDraft.value"
                class="lal-sch-empty"
              >
                <strong>暂无有效预告</strong>
                <p>可新建一场，选好时间后点发布，或先不使用预告直接开播</p>
              </div>
              <div v-if="a.hasUnpublishedDraft.value" class="lal-sch lal-sch--draft">
                <div class="lal-sch__main">
                  <button
                    type="button"
                    class="lal-sch__cover"
                    title="更换本场封面"
                    @click="a.changeCover"
                  >
                    <img :src="a.cover.value" alt="" />
                    <span>更换</span>
                  </button>
                  <div v-if="a.editingId.value !== 'draft'" class="lal-sch__meta">
                    <strong>{{ a.roomTitle.value }}</strong>
                    <p>{{ a.formatGoLiveScheduleTime(a.draftTime.value ?? 0, a.nowMs.value) }} · 未发布</p>
                    <p class="wf-form-row__hint">{{ a.unpublishedMeta.value }}</p>
                  </div>
                  <div v-else class="lal-sch__edit">
                    <label class="lal-sch__field">
                      <span>标题</span>
                      <input
                        v-model="a.editTitle.value"
                        class="wf-input wf-input--full"
                        maxlength="200"
                        placeholder="请输入直播标题"
                      />
                    </label>
                    <label class="lal-sch__field">
                      <span>分类</span>
                      <select v-model="a.editCategory.value" class="wf-select wf-select--full">
                        <option v-for="cat in a.GO_LIVE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                      </select>
                    </label>
                    <div class="lal-sch__field">
                      <span>预计开播 {{ a.pickingTimeLabel.value }}</span>
                      <div class="lal-time-sheet__chips" role="radiogroup" aria-label="日期">
                        <button
                          v-for="day in a.dayOptions.value"
                          :key="`draft-d-${day.offset}`"
                          type="button"
                          class="lal-time-sheet__chip"
                          :class="{ 'is-on': a.timeDay.value === day.offset }"
                          @click="pickSchedulePart('day', day.offset)"
                        >
                          {{ day.label }}
                        </button>
                      </div>
                      <div class="lal-time-sheet__clock">
                        <label class="lal-time-sheet__hour">
                          <span>时</span>
                          <select class="wf-select" :value="a.timeHour.value" aria-label="时" @change="onScheduleHourChange">
                            <option v-for="hour in a.GO_LIVE_SCHEDULE_HOURS" :key="`draft-h-${hour}`" :value="hour">
                              {{ String(hour).padStart(2, '0') }}
                            </option>
                          </select>
                        </label>
                        <div class="lal-time-sheet__mins" role="radiogroup" aria-label="分">
                          <button
                            v-for="minute in a.GO_LIVE_SCHEDULE_MINUTES"
                            :key="`draft-m-${minute}`"
                            type="button"
                            class="lal-time-sheet__chip"
                            :class="{ 'is-on': a.timeMinute.value === minute }"
                            @click="pickSchedulePart('minute', minute)"
                          >
                            {{ String(minute).padStart(2, '0') }} 分
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span v-if="a.editingId.value !== 'draft'" class="lal-badge lal-badge--draft">待发布</span>
                </div>
                <div class="lal-sch__ops">
                  <template v-if="a.editingId.value === 'draft'">
                    <button type="button" class="wf-btn wf-btn--default" @click="a.cancelScheduleEdit">取消</button>
                    <button type="button" class="wf-btn wf-btn--primary" @click="a.saveScheduleEdit">保存</button>
                  </template>
                  <template v-else>
                    <button type="button" class="wf-btn wf-btn--default" @click="a.startScheduleEdit('draft')">编辑</button>
                    <button type="button" class="wf-btn wf-btn--danger" @click="a.discardUnpublishedDraft">删除</button>
                    <button type="button" class="wf-btn wf-btn--primary" @click="a.publishSchedule">发布</button>
                  </template>
                </div>
              </div>
              <div
                v-for="item in a.activeSchedules.value"
                :key="item.id"
                class="lal-sch"
                :class="{ 'lal-sch--on': a.linkedId.value === item.id }"
              >
                <div class="lal-sch__main">
                  <button
                    type="button"
                    class="lal-sch__cover"
                    title="更换本场封面"
                    @click="a.changeScheduleCover(item)"
                  >
                    <img :src="a.scheduleCoverOf(item)" alt="" />
                    <span>更换</span>
                  </button>
                  <div v-if="a.editingId.value !== item.id" class="lal-sch__meta">
                    <strong>{{ item.title }}</strong>
                    <p>{{ a.formatGoLiveScheduleTime(item.startAt, a.nowMs.value) }} · {{ item.subscriberCount }}人已预约</p>
                    <p class="wf-form-row__hint">{{ a.scheduleMeta(item) }}</p>
                  </div>
                  <div v-else class="lal-sch__edit">
                    <label class="lal-sch__field">
                      <span>标题</span>
                      <input
                        v-model="a.editTitle.value"
                        class="wf-input wf-input--full"
                        maxlength="200"
                        placeholder="请输入直播标题"
                      />
                    </label>
                    <label class="lal-sch__field">
                      <span>分类</span>
                      <select v-model="a.editCategory.value" class="wf-select wf-select--full">
                        <option v-for="cat in a.GO_LIVE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                      </select>
                    </label>
                    <div class="lal-sch__field">
                      <span>预计开播 {{ a.pickingTimeLabel.value }}</span>
                      <div class="lal-time-sheet__chips" role="radiogroup" aria-label="日期">
                        <button
                          v-for="day in a.dayOptions.value"
                          :key="`${item.id}-d-${day.offset}`"
                          type="button"
                          class="lal-time-sheet__chip"
                          :class="{ 'is-on': a.timeDay.value === day.offset }"
                          @click="pickSchedulePart('day', day.offset)"
                        >
                          {{ day.label }}
                        </button>
                      </div>
                      <div class="lal-time-sheet__clock">
                        <label class="lal-time-sheet__hour">
                          <span>时</span>
                          <select class="wf-select" :value="a.timeHour.value" aria-label="时" @change="onScheduleHourChange">
                            <option v-for="hour in a.GO_LIVE_SCHEDULE_HOURS" :key="`${item.id}-h-${hour}`" :value="hour">
                              {{ String(hour).padStart(2, '0') }}
                            </option>
                          </select>
                        </label>
                        <div class="lal-time-sheet__mins" role="radiogroup" aria-label="分">
                          <button
                            v-for="minute in a.GO_LIVE_SCHEDULE_MINUTES"
                            :key="`${item.id}-m-${minute}`"
                            type="button"
                            class="lal-time-sheet__chip"
                            :class="{ 'is-on': a.timeMinute.value === minute }"
                            @click="pickSchedulePart('minute', minute)"
                          >
                            {{ String(minute).padStart(2, '0') }} 分
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    v-if="a.editingId.value !== item.id && a.scheduleBadgeMap.value[item.id]"
                    class="lal-badge"
                    :class="`lal-badge--${a.scheduleBadgeMap.value[item.id]?.tone}`"
                  >
                    {{ a.scheduleBadgeMap.value[item.id]?.text }}
                  </span>
                </div>
                <div class="lal-sch__ops">
                  <template v-if="a.editingId.value === item.id">
                    <button type="button" class="wf-btn wf-btn--default" @click="a.cancelScheduleEdit">取消</button>
                    <button type="button" class="wf-btn wf-btn--primary" @click="a.saveScheduleEdit">保存</button>
                  </template>
                  <template v-else>
                    <button type="button" class="wf-btn wf-btn--default" @click="a.startScheduleEdit(item)">编辑</button>
                    <button type="button" class="wf-btn wf-btn--danger" @click="a.askDeleteSchedule(item)">删除</button>
                    <span v-if="a.linkedId.value === item.id" class="lal-sch__cur">当前关联</span>
                    <button v-else type="button" class="wf-btn wf-btn--add" @click="a.switchToSchedule(item)">切换以此开播</button>
                  </template>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'liveType'">
              <div class="lal-type">
                <section class="lal-type__sec">
                  <h4 class="lal-type__title">开播类型</h4>
                  <div class="lal-seg" role="radiogroup" aria-label="开播类型">
                    <button
                      v-for="item in a.GO_LIVE_TABS"
                      :key="item.key"
                      type="button"
                      class="lal-seg__btn"
                      :class="{ 'is-on': a.liveMode.value === item.key }"
                      @click="a.switchLiveMode(item.key)"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                  <p class="lal-type__echo">画面左上角将回显 {{ a.currentTypeLabel.value }} · {{ a.liveModeLabel.value }}</p>
                </section>

                <section class="lal-type__sec">
                  <h4 class="lal-type__title">直播信息</h4>
                  <div class="wf-form-row">
                    <label class="wf-form-row__label" for="lal-live-category">直播分类</label>
                    <select id="lal-live-category" v-model="a.liveCategory.value" class="wf-select wf-select--full">
                      <option v-for="item in LIVE_CATEGORIES" :key="item" :value="item">{{ item }}</option>
                    </select>
                  </div>
                  <div class="wf-form-row lal-type__game-row">
                    <span class="wf-form-row__label">开播游戏选择</span>
                    <div class="lal-type__game">
                      <span class="lal-type__game-main">
                        <img
                          v-if="a.selectedGoLiveGame.value"
                          class="lal-type__game-icon"
                          :src="a.selectedGoLiveGame.value.icon"
                          alt=""
                        />
                        <span class="lal-type__game-name" :class="{ 'is-empty': !a.selectedGoLiveGame.value }">
                          {{ a.selectedGoLiveGame.value?.name ?? '未选择' }}
                        </span>
                      </span>
                      <button type="button" class="wf-btn wf-btn--default" @click="a.openGoLiveGamePicker">选择</button>
                    </div>
                  </div>
                  <div v-if="a.liveMode.value === 'voice'" class="wf-form-row lal-type__game-row">
                    <span class="wf-form-row__label">房间背景设置</span>
                    <div class="lal-type__game">
                      <span class="lal-type__game-main">
                        <img
                          class="lal-type__bg-thumb"
                          :src="a.selectedBackground.value.image"
                          :alt="a.selectedBackground.value.name"
                        />
                        <span class="lal-type__game-name">{{ a.selectedBackground.value.name }}</span>
                      </span>
                      <button type="button" class="wf-btn wf-btn--default" @click="a.openBackground">选择</button>
                    </div>
                  </div>
                </section>

                <section class="lal-type__sec">
                  <h4 class="lal-type__title">播放格式</h4>
                  <p v-if="a.liveMode.value === 'voice'" class="lal-type__note">
                    语音开播无需推流分辨率，保存后可直接创建房间。
                  </p>
                  <template v-else>
                    <div class="wf-form-row">
                      <span class="wf-form-row__label">画面方向</span>
                      <div class="lal-seg lal-seg--2" role="radiogroup" aria-label="画面方向">
                        <button
                          type="button"
                          class="lal-seg__btn"
                          :class="{ 'is-on': a.orientation.value === 'portrait' }"
                          @click="a.setOrientation('portrait')"
                        >
                          竖屏
                        </button>
                        <button
                          type="button"
                          class="lal-seg__btn"
                          :class="{ 'is-on': a.orientation.value === 'landscape' }"
                          @click="a.setOrientation('landscape')"
                        >
                          横屏
                        </button>
                      </div>
                    </div>
                    <div class="wf-form-row">
                      <label class="wf-form-row__label" for="lal-resolution">分辨率</label>
                      <div>
                        <select
                          id="lal-resolution"
                          v-model.number="a.resolutionIndex.value"
                          class="wf-select wf-select--full"
                        >
                          <option v-for="(item, index) in a.resolutionOptions.value" :key="`${item.label}-${index}`" :value="index">
                            {{ item.label }}
                          </option>
                        </select>
                        <div class="lal-res">
                          <label>
                            W
                            <input
                              v-if="a.currentRes.value.label === '自定义'"
                              v-model.number="a.customW.value"
                              class="wf-input"
                              type="number"
                              min="1"
                            />
                            <input v-else class="wf-input" :value="a.currentRes.value.w" disabled />
                          </label>
                          <label>
                            H
                            <input
                              v-if="a.currentRes.value.label === '自定义'"
                              v-model.number="a.customH.value"
                              class="wf-input"
                              type="number"
                              min="1"
                            />
                            <input v-else class="wf-input" :value="a.currentRes.value.h" disabled />
                          </label>
                        </div>
                        <p class="wf-form-row__hint">
                          此处为直播画面意图。请将 OBS 输出分辨率设为与上方相同的方向和宽高，效果最好，避免拉伸或黑边。
                        </p>
                      </div>
                    </div>
                  </template>
                </section>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'pushUrl'">
              <div class="lal-push">
                <p class="lal-push__lead">请将以下信息填入 OBS「推流」设置，确认推流成功后再点开始直播。</p>
                <p class="wf-form-row__hint">未结束直播前将沿用同一组地址，请勿重复申请，以免占用多余线路。</p>
                <div class="lal-copy-row">
                  <span class="lal-copy-row__label">服务器</span>
                  <span class="lal-copy-row__value">{{ (a.pushStream.value ?? a.PUSH_STREAM).server }}</span>
                  <button
                    type="button"
                    class="wf-btn wf-btn--add"
                    @click="a.copyText((a.pushStream.value ?? a.PUSH_STREAM).server, '服务器')"
                  >
                    复制
                  </button>
                </div>
                <div class="lal-copy-row">
                  <span class="lal-copy-row__label">推流密钥</span>
                  <span class="lal-copy-row__value">{{ (a.pushStream.value ?? a.PUSH_STREAM).key }}</span>
                  <button
                    type="button"
                    class="wf-btn wf-btn--add"
                    @click="a.copyText((a.pushStream.value ?? a.PUSH_STREAM).key, '推流密钥')"
                  >
                    复制
                  </button>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'share'">
              <p>{{ a.SHARE_LINK }}</p>
            </template>

            <template v-else-if="a.modal.value === 'startConfirm'">
              <div class="lal-confirm">
                <p class="lal-confirm__lead">{{ a.startConfirmLead.value }}</p>
                <p class="lal-confirm__hint">{{ a.startConfirmHint.value }}</p>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'stopConfirm'">
              <div class="lal-confirm">
                <p class="lal-confirm__lead">确认结束本场直播？</p>
                <p class="lal-confirm__hint">结束后预览恢复「暂未直播」。</p>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'pushCheckFail'">
              <div class="lal-confirm">
                <p class="lal-confirm__lead">请检查推流是否成功</p>
                <p class="lal-confirm__hint">服务端暂未检测到推流信号，此时开播前台会出现黑屏。请确认 OBS 已开始推流后再试。</p>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'scheduleTime'">
              <div class="lal-time-sheet">
                <div class="lal-time-sheet__summary">
                  <span>已选时间</span>
                  <strong>{{ a.pickingTimeLabel.value }}</strong>
                </div>
                <p class="lal-time-sheet__hint">
                  须晚于现在至少 15 分钟、不超过 7 天，两场间隔至少 1 小时。
                  确定后保存本场时间、分类和封面，需再点「发布」才会同步到直播中心。
                </p>
                <section class="lal-time-sheet__sec">
                  <p class="lal-time-sheet__label">封面</p>
                  <div class="lal-cover">
                    <button type="button" class="lal-cover__img" title="更换本场封面" @click="a.changeCover">
                      <img v-if="a.cover.value" :src="a.cover.value" alt="" />
                      <span v-else>封面</span>
                    </button>
                    <div>
                      <button type="button" class="wf-btn wf-btn--default" @click="a.changeCover">更换封面</button>
                      <p class="wf-form-row__hint">默认沿用基本信息封面，可为本场单独更换</p>
                    </div>
                  </div>
                </section>
                <section class="lal-time-sheet__sec">
                  <p class="lal-time-sheet__label">分类</p>
                  <select v-model="a.kkCategory.value" class="wf-select wf-select--full" aria-label="直播分类">
                    <option v-for="cat in a.GO_LIVE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </section>
                <section class="lal-time-sheet__sec">
                  <p class="lal-time-sheet__label">日期</p>
                  <div class="lal-time-sheet__chips" role="radiogroup" aria-label="日期">
                    <button
                      v-for="item in a.dayOptions.value"
                      :key="item.offset"
                      type="button"
                      class="lal-time-sheet__chip"
                      :class="{ 'is-on': a.timeDay.value === item.offset }"
                      :aria-pressed="a.timeDay.value === item.offset"
                      @click="pickSchedulePart('day', item.offset)"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </section>
                <section class="lal-time-sheet__sec">
                  <p class="lal-time-sheet__label">时间</p>
                  <div class="lal-time-sheet__clock">
                    <label class="lal-time-sheet__hour">
                      <span>时</span>
                      <select
                        class="wf-select"
                        :value="a.timeHour.value"
                        aria-label="时"
                        @change="onScheduleHourChange"
                      >
                        <option v-for="item in a.GO_LIVE_SCHEDULE_HOURS" :key="`h-${item}`" :value="item">
                          {{ String(item).padStart(2, '0') }}
                        </option>
                      </select>
                    </label>
                    <div class="lal-time-sheet__mins" role="radiogroup" aria-label="分">
                      <button
                        v-for="item in a.GO_LIVE_SCHEDULE_MINUTES"
                        :key="`m-${item}`"
                        type="button"
                        class="lal-time-sheet__chip"
                        :class="{ 'is-on': a.timeMinute.value === item }"
                        :aria-pressed="a.timeMinute.value === item"
                        @click="pickSchedulePart('minute', item)"
                      >
                        {{ String(item).padStart(2, '0') }} 分
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'beauty'">
              <div class="lal-beauty__head">
                <strong>{{ a.beautyOn.value ? '已开启' : '已关闭' }}</strong>
                <button type="button" class="wf-btn wf-btn--default" @click="a.resetBeauty">重置</button>
              </div>
              <label class="lal-beauty__switch">
                <input v-model="a.beautyOn.value" type="checkbox" />
                美颜开关
              </label>
              <p>当前：{{ a.beautySliderLabel.value }}</p>
              <input
                type="range"
                min="0"
                max="100"
                :value="a.beautySliderValue.value"
                @input="a.onBeautySlider"
              />
              <div class="lal-beauty__row">
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'level' }" @click="a.pickBeautyItem('level')">
                  美颜级别 {{ a.beautyLevel.value }}
                </button>
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'style' }" @click="a.pickBeautyItem('style')">
                  风格 {{ a.beautyStyle.value }}
                </button>
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'white' }" @click="a.pickBeautyItem('white')">
                  美白 {{ a.beautyWhite.value }}
                </button>
                <button type="button" :class="{ 'is-on': a.beautyItem.value === 'contrast' }" @click="a.pickBeautyItem('contrast')">
                  对比度 {{ a.beautyContrast.value }}
                </button>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'background'">
              <div class="lal-bg-list">
                <button
                  v-for="item in a.GO_LIVE_BACKGROUNDS"
                  :key="item.id"
                  type="button"
                  class="lal-bg"
                  :class="{ 'is-on': a.backgroundDraftId.value === item.id }"
                  @click="a.pickBackground(item.id)"
                >
                  <span class="lal-bg__frame">
                    <img :src="item.image" alt="" />
                  </span>
                  <span class="lal-bg__name">{{ item.name }}</span>
                </button>
              </div>
              <button type="button" class="wf-btn wf-btn--default lal-bg-album" @click="a.toast('打开相册（原型）')">
                相册
              </button>
            </template>

            <template v-else-if="a.modal.value === 'ratio'">
              <div class="lal-orient">
                <button
                  v-for="item in a.GO_LIVE_RATIOS"
                  :key="item.key"
                  type="button"
                  :class="{ 'is-on': a.ratio.value === item.key }"
                  @click="a.ratio.value = item.key"
                >
                  {{ item.label }}
                </button>
              </div>
              <div class="lal-ratio-preview" :class="`lal-ratio-preview--${a.ratio.value === '16:9' ? 'wide' : a.ratio.value === '4:3' ? 'box' : 'tall'}`">
                手机画面
              </div>
              <p class="wf-muted">{{ a.ratioHint.value }}</p>
            </template>

            <template v-else-if="a.modal.value === 'gameCenter'">
              <div class="lal-gc-modal">
                <div class="lal-tabs" role="tablist" aria-label="游戏分类">
                  <button
                    v-for="tab in a.VOICE_GAME_TABS"
                    :key="tab.key"
                    type="button"
                    role="tab"
                    :class="{ 'is-on': a.gameTab.value === tab.key }"
                    :aria-selected="a.gameTab.value === tab.key"
                    @click="a.gameTab.value = tab.key"
                  >
                    {{ tab.label }}
                  </button>
                </div>
                <div class="lal-gc__list">
                  <div v-if="!a.centerGames.value.length" class="lal-empty">该分类暂无游戏</div>
                  <div
                    v-for="game in a.centerGames.value"
                    :key="game.id"
                    class="lal-gc__row"
                    :class="{
                      'is-on': a.gameCenterMode.value === 'pick' && a.goLiveGameId.value === game.id,
                    }"
                  >
                    <img class="lal-gc__icon" :src="game.icon" alt="" />
                    <div class="lal-gc__meta">
                      <b>{{ game.name }}</b>
                      <span class="lal-gc__tags">
                        <em v-if="game.live" class="lal-gc__tag lal-gc__tag--live">直播中</em>
                        <em
                          v-if="a.gameCenterMode.value === 'comment' && a.commentingGameId.value === game.id"
                          class="lal-gc__tag lal-gc__tag--talk"
                        >
                          讲解中
                        </em>
                        <em
                          v-if="a.gameCenterMode.value === 'pick' && a.goLiveGameId.value === game.id"
                          class="lal-gc__tag lal-gc__tag--talk"
                        >
                          已选
                        </em>
                      </span>
                    </div>
                    <button
                      v-if="a.gameCenterMode.value === 'pick'"
                      type="button"
                      class="wf-btn"
                      :class="a.goLiveGameId.value === game.id ? 'wf-btn--default' : 'wf-btn--primary'"
                      @click="a.pickGoLiveGame(game.id, game.name)"
                    >
                      选择
                    </button>
                    <button
                      v-else
                      type="button"
                      class="wf-btn"
                      :class="a.commentingGameId.value === game.id ? 'wf-btn--default' : 'wf-btn--primary'"
                      @click="a.toggleCommentGame(game.id, game.name)"
                    >
                      {{ a.commentingGameId.value === game.id ? '取消' : '讲解' }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'mountGame'">
              <div class="lal-orient">
                <button
                  v-for="group in a.GO_LIVE_GAME_GROUPS"
                  :key="group.key"
                  type="button"
                  :class="{ 'is-on': a.gameGroup.value === group.key }"
                  @click="a.gameGroup.value = group.key"
                >
                  {{ group.label }}
                </button>
              </div>
              <div class="lal-game-grid">
                <button
                  v-for="game in a.mountGames.value"
                  :key="game.id"
                  type="button"
                  class="lal-mount"
                  :class="{ 'is-on': a.selectedGameId.value === game.id }"
                  @click="a.pickMountGame(game.id, game.name)"
                >
                  <img :src="game.icon" alt="" />
                  <span>{{ game.name }}</span>
                </button>
              </div>
            </template>

            <template v-else-if="a.modal.value === 'deleteSchedule'">
              <p>删除后已预约粉丝将收到取消通知，该场次不可恢复。</p>
              <p v-if="a.deleteTarget.value">场次：{{ a.deleteTarget.value.title }}</p>
            </template>
          </div>
          <footer class="wf-modal__footer">
            <button
              v-if="!['guide', 'share', 'pushUrl', 'deleteSchedule', 'previewNotice', 'gameCenter'].includes(a.modal.value)"
              type="button"
              class="wf-btn wf-btn--default"
              @click="a.closeModal"
            >
              取消
            </button>
            <button v-if="a.modal.value === 'guide'" type="button" class="wf-btn wf-btn--primary" @click="a.closeModal">
              关闭
            </button>
            <button v-if="a.modal.value === 'basic'" type="button" class="wf-btn wf-btn--primary" @click="a.saveBasic">
              确定
            </button>
            <button v-if="a.modal.value === 'liveType'" type="button" class="wf-btn wf-btn--primary" @click="a.saveLiveType">
              确定
            </button>
            <template v-if="a.modal.value === 'pushUrl'">
              <button type="button" class="wf-btn wf-btn--primary" @click="a.confirmPush">已确认推流</button>
            </template>
            <button v-if="a.modal.value === 'share'" type="button" class="wf-btn wf-btn--primary" @click="a.copyText(a.SHARE_LINK, '链接')">
              复制链接
            </button>
            <button v-if="a.modal.value === 'startConfirm'" type="button" class="wf-btn wf-btn--primary" @click="a.startLive">
              立即开播
            </button>
            <button v-if="a.modal.value === 'stopConfirm'" type="button" class="wf-btn wf-btn--danger" @click="a.stopLive">
              结束直播
            </button>
            <template v-if="a.modal.value === 'pushCheckFail'">
              <button type="button" class="wf-btn wf-btn--default" @click="a.openPushUrl">去检查推流</button>
              <button
                type="button"
                class="wf-btn wf-btn--primary"
                :disabled="a.pushChecking.value"
                @click="a.retryPushCheck"
              >
                {{ a.pushChecking.value ? '检测中' : '重新检测' }}
              </button>
            </template>
            <template v-if="a.modal.value === 'previewNotice'">
              <button type="button" class="wf-btn wf-btn--default" @click="a.closeModal">关闭</button>
              <button type="button" class="wf-btn wf-btn--default" @click="a.goFreeLive">不使用预告，直接开播</button>
              <button
                type="button"
                class="wf-btn wf-btn--add"
                :class="{ 'is-disabled': !a.canCreateSchedule.value && !a.hasUnpublishedDraft.value }"
                @click="a.startCreateSchedule"
              >
                新建一场直播预告
              </button>
            </template>
            <template v-if="a.modal.value === 'scheduleTime'">
              <button type="button" class="wf-btn wf-btn--danger" @click="a.clearTime">清除时间</button>
              <button type="button" class="wf-btn wf-btn--primary" @click="a.confirmTime">确定</button>
            </template>
            <button v-if="a.modal.value === 'beauty'" type="button" class="wf-btn wf-btn--primary" @click="a.saveBeauty">
              确定
            </button>
            <button v-if="a.modal.value === 'background'" type="button" class="wf-btn wf-btn--primary" @click="a.saveBackground">
              确定
            </button>
            <button v-if="a.modal.value === 'ratio'" type="button" class="wf-btn wf-btn--primary" @click="a.saveRatio">
              确定
            </button>
            <button v-if="a.modal.value === 'gameCenter'" type="button" class="wf-btn wf-btn--default" @click="a.closeModal">
              关闭
            </button>
            <template v-if="a.modal.value === 'deleteSchedule'">
              <button type="button" class="wf-btn wf-btn--default" @click="a.cancelDeleteSchedule">再想想</button>
              <button type="button" class="wf-btn wf-btn--danger" @click="a.confirmDeleteSchedule">删除</button>
            </template>
          </footer>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="actionMenuVisible && activeTarget"
        class="live-danmaku-action-menu"
        :style="{ left: `${actionMenuPos.x}px`, top: `${actionMenuPos.y}px` }"
        role="menu"
        @click.stop
      >
        <p class="live-danmaku-action-menu__title">
          <img
            class="live-danmaku-action-menu__avatar"
            :src="assistantAvatarOf(activeTarget.userId)"
            :alt="`${activeTarget.username}的头像`"
          />
          <span>
            {{ activeTarget.username }}
            <span v-if="activeRoleLabel" class="live-danmaku-action-menu__tag">{{ activeRoleLabel }}</span>
          </span>
        </p>
        <button
          type="button"
          class="live-danmaku-action-menu__item"
          :disabled="activeMuteDisabled"
          role="menuitem"
          @click="openMuteModal"
        >
          {{ activeTarget && isUserMuted(activeTarget.userId) ? '已禁言' : '禁言' }}
        </button>
        <button
          type="button"
          class="live-danmaku-action-menu__item is-danger"
          :disabled="activeBlockDisabled"
          role="menuitem"
          @click="openBlockModal"
        >
          {{ activeBlocked ? '取消拉黑' : '拉黑' }}
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="muteModalVisible && muteTarget"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeMuteModal"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="lal-mute-title" aria-modal="true">
          <header class="wf-modal__header">
            <h3 id="lal-mute-title" class="wf-modal__title">禁言用户</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeMuteModal">×</button>
          </header>
          <div class="wf-modal__body">
            <p class="live-mute-modal__user">
              用户：<strong>{{ muteTarget.username }}</strong>（{{ muteTarget.userId }}）
            </p>
            <p v-if="muteTarget.from !== 'list'" class="live-mute-modal__danmaku">触发弹幕：{{ muteTarget.content }}</p>
            <div class="wf-form-row live-mute-modal__reason-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="lal-mute-reason">禁言原因</label>
              <input
                id="lal-mute-reason"
                v-model="muteReason"
                type="text"
                class="wf-input wf-input--full"
                placeholder="请输入禁言原因"
                maxlength="50"
                @keydown.enter.prevent="confirmMute"
              />
            </div>
            <p v-if="muteReasonHint" class="wf-modal__hint">{{ muteReasonHint }}</p>
          </div>
          <footer class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeMuteModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmMute">确定禁言</button>
          </footer>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="blockModalVisible && blockTarget"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeBlockModal"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="lal-block-title" aria-modal="true">
          <header class="wf-modal__header">
            <h3 id="lal-block-title" class="wf-modal__title">拉黑用户</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeBlockModal">×</button>
          </header>
          <div class="wf-modal__body">
            <p class="live-mute-modal__user">
              确认拉黑 <strong>{{ blockTarget.username }}</strong>（{{ blockTarget.userId }}）？
            </p>
            <p class="wf-muted">拉黑后该用户无法再进入本直播间，可在列表中取消拉黑。</p>
          </div>
          <footer class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeBlockModal">取消</button>
            <button type="button" class="wf-btn wf-btn--danger" @click="confirmBlock">确定拉黑</button>
          </footer>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="voice.sheetOpen.value && voice.selectedSeat.value"
        class="wf-modal-mask"
        role="presentation"
        @click.self="voice.closeSeatSheet"
      >
        <div class="wf-modal lal-voice-sheet" role="dialog" aria-labelledby="lal-voice-sheet-title" aria-modal="true">
          <header class="wf-modal__header">
            <h3 id="lal-voice-sheet-title" class="wf-modal__title">麦位设置</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="voice.closeSeatSheet">×</button>
          </header>
          <div class="wf-modal__body">
            <div v-if="voice.selectedUser.value" class="lal-voice-sheet__user">
              <img :src="voice.selectedUser.value.avatar" :alt="voice.selectedUser.value.name" />
              <strong>{{ voice.selectedUser.value.name }}</strong>
              <div class="lal-voice-sheet__user-ops">
                <button
                  type="button"
                  class="wf-btn"
                  :class="voice.selectedUser.value.followed ? 'wf-btn--default' : 'wf-btn--primary'"
                  @click="voice.toggleFollow"
                >
                  {{ voice.selectedUser.value.followed ? '已关注' : '关注' }}
                </button>
              </div>
            </div>
            <p v-else-if="voice.selectedSeat.value" class="lal-voice-sheet__seat">
              {{ voice.selectedSeat.value.index }} 号麦 ·
              {{ voice.selectedSeat.value.kind === 'locked' ? '麦位关闭' : '麦位空闲' }}
            </p>
            <div class="lal-voice-sheet__actions">
              <button
                v-if="voice.selectedUser.value"
                type="button"
                class="wf-btn"
                :class="voice.selectedUser.value.badge === 'admin' ? 'wf-btn--danger' : 'wf-btn--add'"
                @click="voice.toggleAdmin"
              >
                {{ voice.selectedUser.value.badge === 'admin' ? '取消房管' : '设为房管' }}
              </button>
              <button
                v-if="voice.selectedUser.value"
                type="button"
                class="wf-btn wf-btn--danger"
                @click="voice.kickOffMic"
              >
                踢下麦
              </button>
              <button
                v-if="voice.selectedUser.value"
                type="button"
                class="wf-btn"
                :class="voice.selectedUser.value.mic === 'mute' ? 'wf-btn--primary' : 'wf-btn--danger'"
                @click="voice.toggleSeatMute"
              >
                {{ voice.selectedUser.value.mic === 'mute' ? '开麦' : '禁麦' }}
              </button>
              <button type="button" class="wf-btn wf-btn--danger" @click="voice.muteAllGuests">全麦禁麦</button>
              <button type="button" class="wf-btn wf-btn--primary" @click="voice.unmuteAllGuests">全麦解除</button>
              <button
                v-if="voice.selectedSeat.value.kind !== 'locked'"
                type="button"
                class="wf-btn wf-btn--danger"
                @click="voice.closeMicSeat"
              >
                关闭麦位
              </button>
              <button
                v-else
                type="button"
                class="wf-btn wf-btn--add"
                @click="voice.openMicSeat"
              >
                打开麦位
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
