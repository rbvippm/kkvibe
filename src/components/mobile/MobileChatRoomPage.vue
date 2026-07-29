<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CHAT_ROOM_MENU_ACTIONS,
  CHAT_ROOM_PLUS_ACTIONS,
  CHAT_ROOM_REACTIONS,
  getChatRoomDemo,
  layoutForMediaCount,
  type ChatMediaItem,
  type ChatRoomMessage,
} from '../../constants/mobileChatRoom'
import { syncConversationAfterMediaSend } from '../../constants/mobileChat'
import type { ChatMediaSendPayload } from '../../constants/mobileChatGallery'
import { CHAT_MEDIA_PICKER_SPEC } from '../../constants/mobileChatMediaPickerSpec'
import { CHAT_ROOM_ASSETS } from '../../constants/mobileChatRoomAssets'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import MobileChatMediaPicker from './MobileChatMediaPicker.vue'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const room = computed(() => getChatRoomDemo(String(route.params.id || '')))
const messages = ref<ChatRoomMessage[]>([])
const toast = ref('')
const draft = ref('')
const plusOpen = ref(false)
const mediaPickerOpen = ref(false)
const activeMsgId = ref<string | null>(null)
const toastTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const mainEl = ref<HTMLElement | null>(null)
const canSend = computed(() => draft.value.trim().length > 0)

async function scrollToBottom() {
  await nextTick()
  const el = mainEl.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => room.value.id,
  () => {
    messages.value = room.value.messages.map((msg) => ({
      ...msg,
      media: msg.media.map((item) => ({ ...item })),
    }))
    activeMsgId.value = null
    plusOpen.value = false
    mediaPickerOpen.value = false
  },
  { immediate: true },
)

const activeMsg = computed(() => messages.value.find((m) => m.id === activeMsgId.value) ?? null)

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

function openMenu(msg: ChatRoomMessage) {
  plusOpen.value = false
  activeMsgId.value = msg.id
}

function closeMenu() {
  activeMsgId.value = null
}

function togglePlusPanel() {
  closeMenu()
  plusOpen.value = !plusOpen.value
}

function onPlusAction(key: string, label: string) {
  if (key === 'photo' || key === 'camera') {
    plusOpen.value = false
    mediaPickerOpen.value = true
    return
  }
  showToast(`已选择「${label}」（原型演示）`)
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
      read: true,
      layout: layoutForMediaCount(count),
      media: visible.map((item) => ({
        src: item.src,
        isVideo: item.type === 'video',
        duration: item.duration,
      })),
      extraCount,
      text: payload.caption || undefined,
    },
  ]

  mediaPickerOpen.value = false
  plusOpen.value = false

  syncConversationAfterMediaSend(
    room.value.id,
    payload.items.map((item) => ({ type: item.type })),
    payload.caption,
  )
  void scrollToBottom()
}
</script>

<template>
  <div class="mh5-chat-room mh5-route-view">
    <header class="mh5-chat-room-header">
      <button type="button" class="mh5-chat-room-header__back" aria-label="返回" @click="goBack">
        <img :src="CHAT_ROOM_ASSETS.back" alt="" width="24" height="24" />
      </button>
      <div class="mh5-chat-room-header__title">
        <img class="mh5-chat-room-header__avatar" :src="room.avatar" :alt="room.title" width="32" height="32" />
        <h1>{{ room.title }}</h1>
      </div>
      <div class="mh5-chat-room-header__actions">
        <template v-if="room.kind === 'direct'">
          <button type="button" class="mh5-chat-room-header__icon" aria-label="视频通话" @click="showToast('视频通话（原型演示）')">
            <img :src="CHAT_ROOM_ASSETS.videoCall" alt="" width="26" height="26" />
          </button>
          <button type="button" class="mh5-chat-room-header__icon" aria-label="语音通话" @click="showToast('语音通话（原型演示）')">
            <img :src="CHAT_ROOM_ASSETS.phone" alt="" width="26" height="26" />
          </button>
        </template>
        <button v-else type="button" class="mh5-chat-room-header__icon" aria-label="更多" @click="showToast('更多设置（原型演示）')">
          <img :src="CHAT_ROOM_ASSETS.more" alt="" width="24" height="24" />
        </button>
      </div>
    </header>

    <main ref="mainEl" class="mh5-chat-room-main">
      <div class="mh5-chat-room-hint mh5-chat-room-hint--lock">
        <img :src="CHAT_ROOM_ASSETS.lock" alt="" width="16" height="16" />
        <span>此会话所发送信息都已经进行端到端加密</span>
      </div>
      <div class="mh5-chat-room-hint mh5-chat-room-hint--date">今天 14:40</div>

      <article
        v-for="msg in messages"
        :key="msg.id"
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
            type="button"
            class="mh5-chat-room-bubble"
            :class="`mh5-chat-room-bubble--${msg.direction}`"
            @click="openMenu(msg)"
          >
            <p
              v-if="msg.direction === 'received' && room.kind === 'group' && msg.senderName"
              class="mh5-chat-room-bubble__name"
            >
              {{ msg.senderName }}
            </p>
            <div class="mh5-chat-room-media" :class="`mh5-chat-room-media--${msg.layout}`">
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
                <div v-if="showPlus(msg, index)" class="mh5-chat-room-media__plus">
                  +{{ msg.extraCount }}
                </div>
              </div>
              <div class="mh5-chat-room-media__meta">
                <span>{{ msg.time }}</span>
                <img
                  v-if="msg.direction === 'sent' && msg.read"
                  :src="CHAT_ROOM_ASSETS.read"
                  alt="已读"
                  width="14"
                  height="14"
                />
              </div>
            </div>
            <p v-if="msg.text" class="mh5-chat-room-bubble__text">{{ msg.text }}</p>
          </button>
        </div>
      </article>

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
                :spec="CHAT_MEDIA_PICKER_SPEC"
                placement="top"
              />
            </div>
          </div>
        </div>
      </Transition>
    </footer>

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
      :open="mediaPickerOpen"
      :recipient-name="room.title"
      @close="mediaPickerOpen = false"
      @send="onMediaSend"
    />

    <Transition name="mh5-chat-room-toast">
      <div v-if="toast" class="mh5-chat-room-toast">{{ toast }}</div>
    </Transition>
  </div>
</template>
