<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CHAT_ROOM_MENU_ACTIONS,
  CHAT_ROOM_PLUS_ACTIONS,
  CHAT_ROOM_REACTIONS,
  attachChatUnreadHistory,
  formatUnreadJumpLabel,
  getChatRoomDemo,
  layoutForMediaCount,
  type ChatMediaItem,
  type ChatRoomMessage,
} from '../../constants/mobileChatRoom'
import {
  getConversationUnreadByRoomId,
  syncConversationAfterFileSend,
  syncConversationAfterMediaSend,
} from '../../constants/mobileChat'
import {
  chatFileKindTone,
  fileReceiveMeta,
  fileSendFailMeta,
  fileUploadProgressText,
  isChatFileOversize,
  type ChatFileSendPayload,
} from '../../constants/mobileChatFileSend'
import { CHAT_FILE_SEND_SPEC } from '../../constants/mobileChatFileSendSpec'
import { CHAT_UNREAD_JUMP_SPEC } from '../../constants/mobileChatUnreadSpec'
import type { ChatMediaSendPayload } from '../../constants/mobileChatGallery'
import { CHAT_MEDIA_PICKER_SPEC } from '../../constants/mobileChatMediaPickerSpec'
import { TG_H5_ROOM_ID } from '../../constants/mobileChatTelegramH5'
import { CHAT_TG_H5_MEDIA_SPEC } from '../../constants/mobileChatTelegramH5Spec'
import { CHAT_ROOM_ASSETS } from '../../constants/mobileChatRoomAssets'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import MobileChatFileSendFlow from './MobileChatFileSendFlow.vue'
import MobileChatMediaPicker from './MobileChatMediaPicker.vue'
import MobileChatTelegramH5MediaFlow from './MobileChatTelegramH5MediaFlow.vue'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const room = computed(() => getChatRoomDemo(String(route.params.id || '')))
/** 「h5图文入口」走 Telegram Web 系统相册/相机流程 */
const isTgH5Room = computed(() => room.value.id === TG_H5_ROOM_ID)
const messages = ref<ChatRoomMessage[]>([])
const toast = ref('')
const draft = ref('')
const plusOpen = ref(false)
const mediaPickerOpen = ref(false)
const mediaPickerStartAt = ref<'gallery' | 'camera'>('gallery')
const tgH5Open = ref(false)
const tgH5StartAt = ref<'attach' | 'system' | 'picker' | 'camera'>('attach')
const fileSendOpen = ref(false)
const activeMsgId = ref<string | null>(null)
const resendMsgId = ref<string | null>(null)
const toastTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const uploadTimers = new Map<string, number>()
const downloadTimers = new Map<string, number>()
const mainEl = ref<HTMLElement | null>(null)
const showJumpBottom = ref(false)
const newMsgCount = ref(0)
const incomingDemoArmed = ref(false)
const incomingTimers: number[] = []
const firstUnreadId = ref<string | null>(null)
const historyUnreadCount = ref(0)
const showUnreadJump = ref(false)
const unreadJumpConsumed = ref(false)
const showNewMsgDivider = ref(false)
const dividerFlashing = ref(false)
const dividerFlashArmed = ref(false)
const newMsgFlashTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const unreadArriveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const unreadArriveAbort = ref<AbortController | null>(null)
const canSend = computed(() => draft.value.trim().length > 0)
const UPLOAD_RING_R = 28
const UPLOAD_RING = 2 * Math.PI * UPLOAD_RING_R
const FILE_XFER_RING_R = 14
const FILE_XFER_RING = 2 * Math.PI * FILE_XFER_RING_R
const JUMP_BOTTOM_GAP = 80
const JUMP_BADGE_MAX = 999
const INCOMING_DEMO_TEXTS = ['刚看到了', '这几张不错', '晚上再聊'] as const
const jumpBadgeText = computed(() => {
  const count = newMsgCount.value
  if (count <= 0) return ''
  return count > JUMP_BADGE_MAX ? `${JUMP_BADGE_MAX}+` : String(count)
})
const unreadJumpLabel = computed(() => formatUnreadJumpLabel(historyUnreadCount.value))
const overlayOpen = computed(
  () =>
    plusOpen.value ||
    mediaPickerOpen.value ||
    tgH5Open.value ||
    fileSendOpen.value ||
    Boolean(activeMsgId.value) ||
    Boolean(resendMsgId.value),
)

function clearIncomingDemo() {
  incomingTimers.forEach((id) => window.clearTimeout(id))
  incomingTimers.length = 0
}

function resetJumpState() {
  showJumpBottom.value = false
  newMsgCount.value = 0
  incomingDemoArmed.value = false
  clearIncomingDemo()
}

function clearNewMsgFlash() {
  if (newMsgFlashTimer.value) {
    clearTimeout(newMsgFlashTimer.value)
    newMsgFlashTimer.value = null
  }
  if (unreadArriveTimer.value) {
    clearTimeout(unreadArriveTimer.value)
    unreadArriveTimer.value = null
  }
  unreadArriveAbort.value?.abort()
  unreadArriveAbort.value = null
  showNewMsgDivider.value = false
  dividerFlashing.value = false
  dividerFlashArmed.value = false
}

function unreadAnchorOffset(behavior: ScrollBehavior) {
  const main = mainEl.value
  const anchor = unreadAnchorNode()
  if (!main || !anchor) return
  const pad = Number.parseFloat(getComputedStyle(main).paddingTop) || 0
  const top =
    anchor.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - pad
  main.scrollTo({ top: Math.max(0, top), behavior })
}

function unreadAnchorNode() {
  return mainEl.value?.querySelector<HTMLElement>('.mh5-chat-room-unread-anchor') ?? null
}

function isFirstUnreadAboveView() {
  const main = mainEl.value
  const anchor = unreadAnchorNode()
  if (!main || !anchor) return false
  return anchor.getBoundingClientRect().top < main.getBoundingClientRect().top + 8
}

function pushIncomingDemo(index: number) {
  if (!showJumpBottom.value) return
  const text = INCOMING_DEMO_TEXTS[index]
  if (!text) return
  const isGroup = room.value.kind === 'group'
  const src = CHAT_ROOM_ASSETS.media[index % CHAT_ROOM_ASSETS.media.length]
  messages.value = [
    ...messages.value,
    {
      id: `incoming-${Date.now()}-${index}`,
      direction: 'received',
      senderName: isGroup ? '刘世豪5122' : undefined,
      avatar: isGroup ? CHAT_ROOM_ASSETS.avatar : undefined,
      time: nowTimeLabel(),
      layout: '1-square',
      media: [{ src }],
      text,
    },
  ]
  newMsgCount.value += 1
}

function armIncomingDemo() {
  if (incomingDemoArmed.value) return
  incomingDemoArmed.value = true
  ;[700, 1800, 3000].forEach((ms, index) => {
    incomingTimers.push(window.setTimeout(() => pushIncomingDemo(index), ms))
  })
}

function updateJumpBottom() {
  const el = mainEl.value
  if (!el) {
    resetJumpState()
    return
  }
  const gap = el.scrollHeight - el.scrollTop - el.clientHeight
  if (gap > JUMP_BOTTOM_GAP) {
    showJumpBottom.value = true
    if (!showNewMsgDivider.value) armIncomingDemo()
    return
  }
  resetJumpState()
}

async function waitMainEl() {
  await nextTick()
  if (mainEl.value) return mainEl.value
  await nextTick()
  return mainEl.value
}

async function scrollToBottom() {
  const el = await waitMainEl()
  if (el) el.scrollTop = el.scrollHeight
  resetJumpState()
}

function revealUnreadJump(unread: number, unreadId: string | null) {
  const el = mainEl.value
  if (el) el.scrollTop = el.scrollHeight
  showUnreadJump.value =
    !unreadJumpConsumed.value && unread > 0 && Boolean(unreadId) && isFirstUnreadAboveView()
}

function startNewMsgFlash() {
  if (dividerFlashArmed.value || !showNewMsgDivider.value) return
  dividerFlashArmed.value = true
  unreadAnchorOffset('auto')
  if (newMsgFlashTimer.value) clearTimeout(newMsgFlashTimer.value)
  newMsgFlashTimer.value = setTimeout(() => {
    dividerFlashing.value = true
    newMsgFlashTimer.value = setTimeout(() => {
      showNewMsgDivider.value = false
      dividerFlashing.value = false
      newMsgFlashTimer.value = null
    }, 2000)
  }, 320)
}

function bindUnreadArrive() {
  unreadArriveAbort.value?.abort()
  const ac = new AbortController()
  unreadArriveAbort.value = ac
  const onArrive = () => {
    if (unreadArriveTimer.value) {
      clearTimeout(unreadArriveTimer.value)
      unreadArriveTimer.value = null
    }
    startNewMsgFlash()
  }
  mainEl.value?.addEventListener('scrollend', onArrive, { signal: ac.signal })
  unreadArriveTimer.value = setTimeout(onArrive, 900)
}

async function jumpToFirstUnread() {
  if (!firstUnreadId.value || unreadJumpConsumed.value) return
  unreadJumpConsumed.value = true
  showUnreadJump.value = false
  if (newMsgFlashTimer.value) {
    clearTimeout(newMsgFlashTimer.value)
    newMsgFlashTimer.value = null
  }
  dividerFlashing.value = false
  showNewMsgDivider.value = true
  await nextTick()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      unreadAnchorOffset('smooth')
      bindUnreadArrive()
    })
  })
}

function jumpToBottom() {
  const el = mainEl.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  resetJumpState()
}

watch(
  () => room.value.id,
  async () => {
    const unread = getConversationUnreadByRoomId(room.value.id)
    const packed = attachChatUnreadHistory(
      room.value.messages.map((msg) => ({
        ...msg,
        media: msg.media.map((item) => ({ ...item })),
      })),
      room.value.kind,
      unread,
    )
    messages.value = packed.messages
    firstUnreadId.value = packed.firstUnreadId
    historyUnreadCount.value = unread
    showUnreadJump.value = false
    unreadJumpConsumed.value = false
    clearNewMsgFlash()
    activeMsgId.value = null
    resendMsgId.value = null
    clearAllUploads()
    plusOpen.value = false
    mediaPickerOpen.value = false
    mediaPickerStartAt.value = 'gallery'
    tgH5Open.value = false
    resetJumpState()
    await scrollToBottom()
    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealUnreadJump(unread, packed.firstUnreadId)
      })
    })
  },
  { immediate: true },
)

const activeMsg = computed(() => messages.value.find((m) => m.id === activeMsgId.value) ?? null)
const resendMsg = computed(() => messages.value.find((m) => m.id === resendMsgId.value) ?? null)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace({ name: 'mobile-chat' })
}

function showToast(text: string) {
  toast.value = text
  if (toastTimer.value) clearTimeout(toastTimer.value)
  toastTimer.value = setTimeout(() => {
    toast.value = ''
  }, 1600)
}

function patchMessage(id: string, patch: Partial<ChatRoomMessage>) {
  messages.value = messages.value.map((msg) => (msg.id === id ? { ...msg, ...patch } : msg))
}

function stopUpload(id: string) {
  const timer = uploadTimers.get(id)
  if (timer) window.clearTimeout(timer)
  uploadTimers.delete(id)
}

function clearAllUploads() {
  uploadTimers.forEach((timer) => window.clearTimeout(timer))
  uploadTimers.clear()
  downloadTimers.forEach((timer) => window.clearTimeout(timer))
  downloadTimers.clear()
}

function stopDownload(id: string) {
  const timer = downloadTimers.get(id)
  if (timer) window.clearTimeout(timer)
  downloadTimers.delete(id)
}

function startDownload(msg: ChatRoomMessage) {
  if (msg.file) {
    if (isChatFileOversize(msg.file) || msg.downloadStatus === 'blocked') {
      showToast('文件超过 2 GB，无法下载')
      return
    }
  } else if (!msg.media.length) {
    return
  }
  stopDownload(msg.id)
  patchMessage(msg.id, { downloadStatus: 'downloading', downloadProgress: 8 })
  const tick = () => {
    const current = messages.value.find((item) => item.id === msg.id)
    if (!current || current.downloadStatus !== 'downloading') return
    const next = Math.min(100, (current.downloadProgress ?? 0) + 9)
    if (next >= 100) {
      patchMessage(msg.id, { downloadStatus: 'done', downloadProgress: 100 })
      stopDownload(msg.id)
      if (msg.file) showToast('下载完成')
      return
    }
    patchMessage(msg.id, { downloadProgress: next })
    downloadTimers.set(msg.id, window.setTimeout(tick, 180))
  }
  downloadTimers.set(msg.id, window.setTimeout(tick, 180))
}

function cancelDownload(msg: ChatRoomMessage) {
  stopDownload(msg.id)
  patchMessage(msg.id, { downloadStatus: 'failed', downloadProgress: 0 })
}

function startUpload(id: string) {
  stopUpload(id)
  const tick = () => {
    const msg = messages.value.find((item) => item.id === id)
    if (!msg || msg.sendStatus !== 'sending') return
    const next = Math.min(100, (msg.uploadProgress ?? 0) + 7)
    if (next >= 100) {
      patchMessage(id, { sendStatus: 'sent', uploadProgress: 100, read: true })
      stopUpload(id)
      return
    }
    patchMessage(id, { uploadProgress: next })
    uploadTimers.set(id, window.setTimeout(tick, 160))
  }
  uploadTimers.set(id, window.setTimeout(tick, 160))
}

function cancelUpload(msg: ChatRoomMessage) {
  stopUpload(msg.id)
  patchMessage(msg.id, { sendStatus: 'failed', read: false })
}

function openResend(msg: ChatRoomMessage) {
  closeMenu()
  plusOpen.value = false
  resendMsgId.value = msg.id
}

function closeResend() {
  resendMsgId.value = null
}

function confirmResend() {
  const msg = resendMsg.value
  closeResend()
  if (!msg) return
  patchMessage(msg.id, { sendStatus: 'sending', uploadProgress: 8, read: false, time: nowTimeLabel() })
  startUpload(msg.id)
  showToast('正在重新发送（原型）')
}

function uploadDashoffset(progress = 0) {
  return UPLOAD_RING * (1 - Math.min(100, Math.max(0, progress)) / 100)
}

function uploadPercent(progress = 0) {
  return `${Math.round(Math.min(100, Math.max(0, progress)))}%`
}

function mediaXferProgress(msg: ChatRoomMessage) {
  return isDownloading(msg) ? msg.downloadProgress : msg.uploadProgress
}

function fileXferDashoffset(progress = 0) {
  return FILE_XFER_RING * (1 - Math.min(100, Math.max(0, progress)) / 100)
}

function isSending(msg: ChatRoomMessage) {
  return msg.direction === 'sent' && msg.sendStatus === 'sending'
}

function isFailed(msg: ChatRoomMessage) {
  return msg.direction === 'sent' && msg.sendStatus === 'failed'
}

function isDownloading(msg: ChatRoomMessage) {
  return msg.direction === 'received' && msg.downloadStatus === 'downloading'
}

function isDownloadPending(msg: ChatRoomMessage) {
  return msg.direction === 'received' && msg.downloadStatus === 'pending'
}

function isDownloadFailed(msg: ChatRoomMessage) {
  return msg.direction === 'received' && msg.downloadStatus === 'failed'
}

function isDownloadBlocked(msg: ChatRoomMessage) {
  return Boolean(
    msg.file &&
      msg.direction === 'received' &&
      (msg.downloadStatus === 'blocked' || isChatFileOversize(msg.file)),
  )
}

function onFileBubbleClick(msg: ChatRoomMessage) {
  if (isSending(msg) || isDownloading(msg)) return
  if (isFailed(msg)) {
    openResend(msg)
    return
  }
  if (msg.file && msg.direction === 'received') {
    if (isDownloadBlocked(msg)) {
      showToast('文件超过 2 GB，无法下载')
      return
    }
    if (isDownloadPending(msg) || isDownloadFailed(msg)) {
      startDownload(msg)
      return
    }
    showToast('已打开文件预览（原型）')
    return
  }
  openMenu(msg)
}

function onBubbleClick(msg: ChatRoomMessage) {
  if (msg.file) {
    onFileBubbleClick(msg)
    return
  }
  if (isSending(msg) || isDownloading(msg)) return
  if (isFailed(msg)) {
    openResend(msg)
    return
  }
  if (isDownloadFailed(msg) || isDownloadPending(msg)) {
    startDownload(msg)
    return
  }
  openMenu(msg)
}

function openMenu(msg: ChatRoomMessage) {
  if (isSending(msg) || isDownloading(msg)) return
  plusOpen.value = false
  activeMsgId.value = msg.id
}

function closeMenu() {
  activeMsgId.value = null
}

function togglePlusPanel() {
  closeMenu()
  if (tgH5Open.value) tgH5Open.value = false
  plusOpen.value = !plusOpen.value
}

function onPlusAction(key: string, label: string) {
  if (key === 'photo' || key === 'camera') {
    plusOpen.value = false
    if (isTgH5Room.value) {
      // H5：点照片/相机后出系统来源（相册 / 拍照 / 选择文件）
      tgH5StartAt.value = key === 'camera' ? 'camera' : 'system'
      tgH5Open.value = true
      return
    }
    // App：照片 → 相册选图；相机 → WhatsApp 全屏相机
    mediaPickerStartAt.value = key === 'camera' ? 'camera' : 'gallery'
    mediaPickerOpen.value = true
    return
  }
  if (key === 'file') {
    plusOpen.value = false
    fileSendOpen.value = true
    return
  }
  showToast(`已选择「${label}」（原型演示）`)
}

function onH5FilePickGallery() {
  fileSendOpen.value = false
  tgH5StartAt.value = 'picker'
  tgH5Open.value = true
}

function onMenuAction(key: string, label: string) {
  closeMenu()
  if (key === 'copy') showToast('已复制')
  else if (key === 'delete') showToast('已删除（原型演示）')
  else showToast(`已选择「${label}」（原型演示）`)
}

function onReact(emoji: string) {
  closeMenu()
  showToast(`已添加表情 ${emoji}`)
}

function mediaClass(layout: ChatRoomMessage['layout'], index: number, total: number) {
  return [
    'mh5-chat-room-media__cell',
    `mh5-chat-room-media__cell--${layout}`,
    index === 0 ? 'mh5-chat-room-media__cell--first' : '',
    total === 1 ? 'mh5-chat-room-media__cell--solo' : '',
  ]
}

function showPlus(msg: ChatRoomMessage, index: number) {
  return msg.layout === '5-plus' && index === msg.media.length - 1 && (msg.extraCount ?? 0) > 0
}

function isVideo(item: ChatMediaItem) {
  return Boolean(item.isVideo)
}

function nowTimeLabel() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function sendDraft() {
  if (!canSend.value) return
  plusOpen.value = false
  showToast('消息已发送（原型演示）')
  draft.value = ''
}

function onDraftFocus() {
  plusOpen.value = false
}

function onMediaSend(payload: ChatMediaSendPayload) {
  const count = payload.items.length
  const visible = payload.items.slice(0, 4)
  const extraCount = count > 4 ? count - 4 : undefined

  messages.value = [
    ...messages.value,
    {
      id: `local-media-${Date.now()}`,
      direction: 'sent',
      time: nowTimeLabel(),
      read: false,
      layout: layoutForMediaCount(count),
      media: visible.map((item) => ({
        src: item.src,
        isVideo: item.type === 'video',
        duration: item.duration,
      })),
      extraCount,
      text: payload.caption || undefined,
      sendStatus: 'sending',
      uploadProgress: 8,
    },
  ]
  startUpload(messages.value[messages.value.length - 1]!.id)

  mediaPickerOpen.value = false
  tgH5Open.value = false
  plusOpen.value = false

  syncConversationAfterMediaSend(
    room.value.id,
    payload.items.map((item) => ({ type: item.type })),
    payload.caption,
  )
  void scrollToBottom()
}

function onFileSend(payload: ChatFileSendPayload) {
  const files = payload.files.filter((file) => !isChatFileOversize(file))
  if (!files.length) {
    showToast('文件超过 2 GB，无法发送')
    return
  }
  const caption = (payload.caption ?? '').trim() || draft.value.trim()
  const stamp = Date.now()
  files.forEach((file, index) => {
    messages.value = [
      ...messages.value,
      {
        id: `local-file-${stamp}-${index}`,
        direction: 'sent',
        time: nowTimeLabel(),
        read: false,
        layout: '1-square',
        media: [],
        text: caption || undefined,
        sendStatus: 'sending',
        uploadProgress: 8,
        file,
      },
    ]
    startUpload(messages.value[messages.value.length - 1]!.id)
  })

  fileSendOpen.value = false
  tgH5Open.value = false
  plusOpen.value = false
  if (caption) draft.value = ''

  const last = files[files.length - 1]
  if (last) syncConversationAfterFileSend(room.value.id, last.name, caption)
  void scrollToBottom()
}

function fileMetaText(msg: ChatRoomMessage) {
  if (!msg.file) return ''
  if (isSending(msg)) return fileUploadProgressText(msg.uploadProgress ?? 0, msg.file.sizeLabel)
  if (isFailed(msg)) return fileSendFailMeta(msg.file)
  if (msg.direction === 'received') {
    return fileReceiveMeta(msg.file, msg.downloadStatus, msg.downloadProgress ?? 0)
  }
  return fileReceiveMeta(msg.file, 'done')
}

onBeforeUnmount(() => {
  if (toastTimer.value) clearTimeout(toastTimer.value)
  clearAllUploads()
  clearIncomingDemo()
  clearNewMsgFlash()
})
</script>

<template>
  <div class="mh5-chat-room mh5-route-view" :class="{ 'mh5-chat-room--tg-h5': isTgH5Room }">
    <header class="mh5-chat-room-header">
      <button type="button" class="mh5-chat-room-header__back" :aria-label="$t('返回')" @click="goBack">
        <img :src="CHAT_ROOM_ASSETS.back" alt="" width="24" height="24" />
      </button>
      <div class="mh5-chat-room-header__title">
        <img class="mh5-chat-room-header__avatar" :src="room.avatar" :alt="room.title" width="32" height="32" />
        <h1>
          {{ $t(room.title) }}
          <Mh5SpecAnnot
            v-if="isTgH5Room"
            :spec="CHAT_TG_H5_MEDIA_SPEC"
            placement="bottom"
          />
        </h1>
        <Mh5SpecAnnot :spec="CHAT_UNREAD_JUMP_SPEC" placement="bottom" />
      </div>
      <div class="mh5-chat-room-header__actions">
        <template v-if="room.kind === 'direct'">
          <button type="button" class="mh5-chat-room-header__icon" :aria-label="$t('视频通话')" @click="showToast('视频通话（原型演示）')">
            <img :src="CHAT_ROOM_ASSETS.videoCall" alt="" width="26" height="26" />
          </button>
          <button type="button" class="mh5-chat-room-header__icon" :aria-label="$t('语音通话')" @click="showToast('语音通话（原型演示）')">
            <img :src="CHAT_ROOM_ASSETS.phone" alt="" width="26" height="26" />
          </button>
        </template>
        <button v-else type="button" class="mh5-chat-room-header__icon" aria-label="更多" @click="showToast('更多设置（原型演示）')">
          <img :src="CHAT_ROOM_ASSETS.more" alt="" width="24" height="24" />
        </button>
      </div>
    </header>

    <main ref="mainEl" class="mh5-chat-room-main" @scroll.passive="updateJumpBottom">
      <div class="mh5-chat-room-hint mh5-chat-room-hint--lock">
        <img :src="CHAT_ROOM_ASSETS.lock" alt="" width="16" height="16" />
        <span>此会话所发送信息都已经进行端到端加密</span>
      </div>
      <div class="mh5-chat-room-hint mh5-chat-room-hint--date">昨天 21:08</div>

      <template v-for="msg in messages" :key="msg.id">
      <div
        v-if="msg.id === firstUnreadId"
        class="mh5-chat-room-unread-anchor"
      >
        <div
          v-if="showNewMsgDivider"
          class="mh5-chat-room-new-divider"
          :class="{ 'mh5-chat-room-new-divider--flash': dividerFlashing }"
          role="status"
        >
          <span>以下为新消息</span>
        </div>
      </div>
      <div
        v-if="msg.id === 'm1'"
        class="mh5-chat-room-hint mh5-chat-room-hint--date"
      >
        今天 14:40
      </div>
      <article
        :data-msg-id="msg.id"
        class="mh5-chat-room-msg"
        :class="[
          `mh5-chat-room-msg--${msg.direction}`,
          { 'mh5-chat-room-msg--active': activeMsgId === msg.id },
        ]"
      >
        <p v-if="msg.caption" class="mh5-chat-room-caption">{{ msg.caption }}</p>
        <div class="mh5-chat-room-msg__row">
          <img
            v-if="msg.direction === 'received' && room.kind === 'group'"
            class="mh5-chat-room-msg__avatar"
            :src="msg.avatar || CHAT_ROOM_ASSETS.avatar"
            alt=""
            width="28"
            height="28"
          />
          <button
            v-if="isFailed(msg)"
            type="button"
            class="mh5-chat-room-msg__fail"
            aria-label="发送失败，点击重发"
            @click.stop="openResend(msg)"
          >
            !
          </button>
          <button
            type="button"
            class="mh5-chat-room-bubble"
            :class="`mh5-chat-room-bubble--${msg.direction}`"
            @click="onBubbleClick(msg)"
          >
            <p
              v-if="msg.direction === 'received' && room.kind === 'group' && msg.senderName"
              class="mh5-chat-room-bubble__name"
            >
              {{ msg.senderName }}
            </p>
            <div
              v-if="msg.file"
              class="mh5-chat-room-file"
              :class="{
                'mh5-chat-room-file--uploading': isSending(msg) || isDownloading(msg),
                'mh5-chat-room-file--failed': isFailed(msg) || isDownloadFailed(msg),
                'mh5-chat-room-file--blocked': isDownloadBlocked(msg),
              }"
            >
              <div class="mh5-chat-room-file__card">
                <span
                  class="mh5-chat-room-file__badge"
                  :style="{ background: chatFileKindTone(msg.file.kind) }"
                >
                  {{ msg.file.ext }}
                </span>
                <div class="mh5-chat-room-file__body">
                  <p class="mh5-chat-room-file__name">{{ msg.file.name }}</p>
                  <p class="mh5-chat-room-file__meta">{{ fileMetaText(msg) }}</p>
                </div>
                <button
                  v-if="isSending(msg)"
                  type="button"
                  class="mh5-chat-room-file__stop"
                  aria-label="取消上传"
                  @click.stop="cancelUpload(msg)"
                >
                  <span />
                </button>
                <button
                  v-else-if="isDownloading(msg)"
                  type="button"
                  class="mh5-chat-room-file__stop mh5-chat-room-file__stop--ring"
                  aria-label="取消下载"
                  @click.stop="cancelDownload(msg)"
                >
                  <svg class="mh5-chat-room-file__ring" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" class="mh5-chat-room-file__ring-disk" />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      class="mh5-chat-room-file__ring-bar"
                      :stroke-dasharray="FILE_XFER_RING"
                      :stroke-dashoffset="fileXferDashoffset(msg.downloadProgress)"
                    />
                  </svg>
                  <span />
                </button>
                <button
                  v-else-if="isDownloadPending(msg)"
                  type="button"
                  class="mh5-chat-room-file__xfer"
                  aria-label="下载文件"
                  @click.stop="startDownload(msg)"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3v7.2M5.2 7.6 8 10.4l2.8-2.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M4 13h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </button>
                <button
                  v-else-if="isDownloadFailed(msg)"
                  type="button"
                  class="mh5-chat-room-file__xfer mh5-chat-room-file__xfer--retry"
                  aria-label="重新下载"
                  @click.stop="startDownload(msg)"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M12.4 8A4.4 4.4 0 1 1 10.6 4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M10 3.2h2.6V5.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
              <p v-if="msg.text" class="mh5-chat-room-file__caption">{{ msg.text }}</p>
            </div>
            <div
              v-if="msg.media.length"
              class="mh5-chat-room-media"
              :class="[
                `mh5-chat-room-media--${msg.layout}`,
                {
                  'mh5-chat-room-media--uploading': isSending(msg) || isDownloading(msg),
                  'mh5-chat-room-media--failed': isFailed(msg) || isDownloadFailed(msg),
                },
              ]"
            >
              <div
                v-for="(item, index) in msg.media"
                :key="`${msg.id}-${index}`"
                :class="mediaClass(msg.layout, index, msg.media.length)"
              >
                <img class="mh5-chat-room-media__img" :src="item.src" alt="" />
                <div v-if="isVideo(item)" class="mh5-chat-room-media__video">
                  <img class="mh5-chat-room-media__play" :src="CHAT_ROOM_ASSETS.play" alt="" width="30" height="30" />
                  <span v-if="item.duration" class="mh5-chat-room-media__duration">{{ item.duration }}</span>
                </div>
                <div
                  v-if="showPlus(msg, index) && !isDownloadFailed(msg) && !isDownloading(msg)"
                  class="mh5-chat-room-media__plus"
                >
                  +{{ msg.extraCount }}
                </div>
              </div>
              <div v-if="isSending(msg) || isDownloading(msg)" class="mh5-chat-room-media__upload">
                <button
                  type="button"
                  class="mh5-chat-room-media__upload-btn"
                  :aria-label="isDownloading(msg) ? '取消下载' : '取消上传'"
                  @click.stop="isDownloading(msg) ? cancelDownload(msg) : cancelUpload(msg)"
                >
                  <svg class="mh5-chat-room-media__upload-ring" viewBox="0 0 72 72" aria-hidden="true">
                    <circle cx="36" cy="36" r="34" class="mh5-chat-room-media__upload-disk" />
                    <circle
                      cx="36"
                      cy="36"
                      :r="UPLOAD_RING_R"
                      class="mh5-chat-room-media__upload-bar"
                      :stroke-dasharray="UPLOAD_RING"
                      :stroke-dashoffset="uploadDashoffset(mediaXferProgress(msg))"
                    />
                  </svg>
                  <span class="mh5-chat-room-media__upload-pct">{{ uploadPercent(mediaXferProgress(msg)) }}</span>
                </button>
              </div>
              <div v-else-if="isDownloadFailed(msg)" class="mh5-chat-room-media__download">
                <button
                  type="button"
                  class="mh5-chat-room-media__download-btn"
                  :aria-label="$t('重新下载')"
                  @click.stop="startDownload(msg)"
                >
                  <span class="mh5-chat-room-media__download-icon">
                    <svg width="28" height="28" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M12.4 8A4.4 4.4 0 1 1 10.6 4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                      <path d="M10 3.2h2.6V5.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="mh5-chat-room-media__download-label">{{ $t('下载失败') }}</span>
                </button>
              </div>
              <div class="mh5-chat-room-media__meta">
                <span>{{ msg.time }}</span>
                <svg
                  v-if="isSending(msg) || isFailed(msg)"
                  class="mh5-chat-room-media__clock"
                  viewBox="0 0 14 14"
                  aria-label="发送中"
                >
                  <circle cx="7" cy="7" r="5.4" fill="none" stroke="currentColor" stroke-width="1.3" />
                  <path d="M7 4.2v3.1l2 1.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                </svg>
                <img
                  v-else-if="msg.direction === 'sent' && msg.read"
                  :src="CHAT_ROOM_ASSETS.read"
                  alt="已读"
                  width="14"
                  height="14"
                />
              </div>
            </div>
            <p v-if="msg.text && !msg.file" class="mh5-chat-room-bubble__text">{{ msg.text }}</p>
            <div v-if="!msg.media.length" class="mh5-chat-room-bubble__time">
              <span>{{ msg.time }}</span>
              <svg
                v-if="msg.file && (isSending(msg) || isFailed(msg))"
                class="mh5-chat-room-media__clock"
                viewBox="0 0 14 14"
                aria-label="发送中"
              >
                <circle cx="7" cy="7" r="5.4" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M7 4.2v3.1l2 1.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
              </svg>
              <img
                v-else-if="msg.file && msg.direction === 'sent' && msg.read"
                :src="CHAT_ROOM_ASSETS.read"
                alt="已读"
                width="14"
                height="14"
              />
            </div>
          </button>
        </div>
      </article>
      </template>

      <p v-if="!messages.length" class="mh5-chat-room-empty">暂无消息</p>
    </main>

    <footer class="mh5-chat-room-composer">
      <div class="mh5-chat-room-input">
        <button
          type="button"
          class="mh5-chat-room-input__icon"
          :aria-label="plusOpen ? '收起面板' : '添加'"
          :aria-expanded="plusOpen"
          @click="togglePlusPanel"
        >
          <img
            :src="plusOpen ? CHAT_ROOM_ASSETS.keyboard : CHAT_ROOM_ASSETS.add"
            alt=""
            :width="plusOpen ? 26 : 24"
            :height="plusOpen ? 26 : 24"
          />
        </button>

        <div class="mh5-chat-room-input__field">
          <input
            v-model="draft"
            class="mh5-chat-room-input__control"
            type="text"
            placeholder="发消息"
            enterkeyhint="send"
            @focus="onDraftFocus"
            @keydown.enter.prevent="sendDraft"
          />
          <button type="button" class="mh5-chat-room-input__emoji" aria-label="表情" @click="showToast('表情面板（原型演示）')">
            <img :src="CHAT_ROOM_ASSETS.emoji" alt="" width="24" height="24" />
          </button>
        </div>

        <div class="mh5-chat-room-input__actions">
          <button type="button" class="mh5-chat-room-input__ai" aria-label="AI 助手" @click="showToast('AI 助手（原型演示）')">
            <img :src="CHAT_ROOM_ASSETS.ai" alt="" width="28" height="28" />
          </button>
          <button
            v-if="canSend"
            type="button"
            class="mh5-chat-room-input__send"
            aria-label="发送"
            @click="sendDraft"
          >
            发送
          </button>
          <button
            v-else
            type="button"
            class="mh5-chat-room-input__icon mh5-chat-room-input__icon--mic"
            aria-label="语音"
            @click="showToast('按住说话（原型演示）')"
          >
            <img :src="CHAT_ROOM_ASSETS.mic" alt="" width="21" height="24" />
          </button>
        </div>
      </div>

      <Transition name="mh5-chat-room-plus">
        <div v-if="plusOpen" class="mh5-chat-room-plus" role="menu" aria-label="更多功能">
          <div class="mh5-chat-room-plus__grid">
            <div
              v-for="action in CHAT_ROOM_PLUS_ACTIONS"
              :key="action.key"
              class="mh5-chat-room-plus__cell"
            >
              <button
                type="button"
                class="mh5-chat-room-plus__item"
                role="menuitem"
                @click="onPlusAction(action.key, action.label)"
              >
                <span class="mh5-chat-room-plus__icon">
                  <img :src="action.icon" alt="" width="32" height="32" />
                </span>
                <span class="mh5-chat-room-plus__label">{{ action.label }}</span>
              </button>
              <Mh5SpecAnnot
                v-if="action.key === 'photo'"
                class="mh5-chat-room-plus__annot"
                :spec="isTgH5Room ? CHAT_TG_H5_MEDIA_SPEC : CHAT_MEDIA_PICKER_SPEC"
                placement="top"
              />
              <Mh5SpecAnnot
                v-else-if="action.key === 'file'"
                class="mh5-chat-room-plus__annot"
                :spec="CHAT_FILE_SEND_SPEC"
                placement="top"
              />
            </div>
          </div>
        </div>
      </Transition>
    </footer>

    <Transition name="mh5-chat-room-unread">
      <div
        v-if="showUnreadJump && unreadJumpLabel && !overlayOpen"
        class="mh5-chat-room-unread-wrap"
      >
        <button
          type="button"
          class="mh5-chat-room-unread"
          :aria-label="unreadJumpLabel"
          @click.stop="jumpToFirstUnread"
        >
          <svg class="mh5-chat-room-unread__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M7 13.4 12 8.4 17 13.4"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 17.8 12 12.8 17 17.8"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ unreadJumpLabel }}</span>
        </button>
      </div>
    </Transition>

    <Transition name="mh5-chat-room-jump">
      <button
        v-if="showJumpBottom && !overlayOpen"
        type="button"
        class="mh5-chat-room-jump"
        :class="{ 'mh5-chat-room-jump--new': Boolean(jumpBadgeText) }"
        :aria-label="jumpBadgeText || '回到底部'"
        @click="jumpToBottom"
      >
        <span v-if="jumpBadgeText" class="mh5-chat-room-jump__badge">
          {{ jumpBadgeText }}
        </span>
        <svg class="mh5-chat-room-jump__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M7 9.2 12 14.2 17 9.2"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </Transition>

    <Transition name="mh5-chat-room-overlay">
      <div v-if="activeMsg" class="mh5-chat-room-overlay" @click="closeMenu">
        <div class="mh5-chat-room-react" @click.stop>
          <button
            v-for="emoji in CHAT_ROOM_REACTIONS"
            :key="emoji"
            type="button"
            class="mh5-chat-room-react__item"
            @click="onReact(emoji)"
          >
            {{ emoji }}
          </button>
          <button type="button" class="mh5-chat-room-react__more" aria-label="更多表情" @click="onReact('＋')">
            <img :src="CHAT_ROOM_ASSETS.plusWhite" alt="" width="20" height="20" />
          </button>
        </div>

        <div
          class="mh5-chat-room-menu"
          :class="activeMsg.direction === 'sent' ? 'mh5-chat-room-menu--right' : 'mh5-chat-room-menu--left'"
          @click.stop
        >
          <button
            v-for="action in CHAT_ROOM_MENU_ACTIONS"
            :key="action.key"
            type="button"
            class="mh5-chat-room-menu__item"
            :class="{ 'mh5-chat-room-menu__item--danger': action.danger }"
            @click="onMenuAction(action.key, action.label)"
          >
            <span>{{ action.label }}</span>
            <img :src="action.icon" alt="" width="20" height="20" />
          </button>
        </div>
      </div>
    </Transition>

    <MobileChatMediaPicker
      v-if="!isTgH5Room"
      :open="mediaPickerOpen"
      :start-at="mediaPickerStartAt"
      :recipient-name="room.title"
      @close="mediaPickerOpen = false"
      @send="onMediaSend"
    />

    <MobileChatTelegramH5MediaFlow
      v-if="isTgH5Room"
      :open="tgH5Open"
      :start-at="tgH5StartAt"
      @close="tgH5Open = false"
      @send="onMediaSend"
      @send-files="onFileSend"
    />

    <MobileChatFileSendFlow
      :open="fileSendOpen"
      :recipient-name="room.title"
      :draft="draft"
      :use-h5-photo-picker="isTgH5Room"
      @close="fileSendOpen = false"
      @send="onFileSend"
      @pick-gallery="onH5FilePickGallery"
      @toast="showToast"
    />

    <Transition name="mh5-chat-room-resend">
      <div v-if="resendMsg" class="mh5-chat-room-resend" @click="closeResend">
        <div class="mh5-chat-room-resend__sheet" role="dialog" aria-label="重新发送" @click.stop>
          <span class="mh5-chat-room-resend__handle" aria-hidden="true" />
          <p class="mh5-chat-room-resend__hint">
            {{ resendMsg.file ? $t('文件尚未送出') : $t('消息尚未送出') }}
          </p>
          <p class="mh5-chat-room-resend__desc">
            {{ resendMsg.file ? $t('发送失败，是否重新发送该文件？') : $t('发送失败，是否重新发送？') }}
          </p>
          <div class="mh5-chat-room-resend__actions">
            <button type="button" class="mh5-chat-room-resend__action" @click="confirmResend">
              重新发送
            </button>
            <button type="button" class="mh5-chat-room-resend__cancel" @click="closeResend">取消</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-chat-room-toast">
      <div v-if="toast" class="mh5-chat-room-toast">{{ toast }}</div>
    </Transition>
  </div>
</template>
