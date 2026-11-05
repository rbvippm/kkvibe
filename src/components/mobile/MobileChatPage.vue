<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mineHallQuery } from '../../constants/mineHall'
import { VIP_CLUB_CHAT_SPEC } from '../../constants/vipClubSpec'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import {
  CHAT_FILTERS,
  chatConversationsState,
  conversationsForFilter,
  type ChatConversation,
  type ChatFilter,
  type ChatPreviewMediaIcon,
} from '../../constants/mobileChat'
import { CHAT_ASSETS } from '../../constants/mobileChatAssets'
import { chatNewUserMock, toggleChatNewUserMock } from '../../constants/chatPayService'
import { CHAT_PAY_SERVICE_SPEC } from '../../constants/chatPayServiceSpec'

const route = useRoute()
const router = useRouter()
const isVipClub = computed(() => route.path.startsWith('/mobile/vip-club'))
const activeFilter = ref<ChatFilter>('all')

const conversations = computed(() => conversationsForFilter(activeFilter.value))

const totalUnread = computed(() =>
  chatNewUserMock.enabled
    ? chatNewUserMock.conversation.unread
    : chatConversationsState.reduce((sum, c) => sum + c.unread, 0),
)

const isNewUser = computed(() => chatNewUserMock.enabled)
const showGuide = computed(
  () => isNewUser.value && !chatNewUserMock.guideSeen && conversations.value.length > 0,
)

const NEW_USER_EMPTY: Record<ChatFilter, { title: string; desc: string; action?: string }> = {
  all: { title: '还没有其他会话', desc: '去发现感兴趣的群组和社群，或添加好友开始聊天', action: '去发现' },
  direct: { title: '暂无私信', desc: '添加好友后，私信会出现在这里' },
  group: { title: '暂无群组', desc: '加入群组后会出现在这里', action: '去发现' },
  community: { title: '暂无社群', desc: '去发现感兴趣的社群吧', action: '去发现' },
}
const newUserEmpty = computed(() => NEW_USER_EMPTY[activeFilter.value])

/** 隐藏 Mock：5 秒内连点 3 次切换「演示会话 / 新用户首次注册」 */
const MOCK_TAP_WINDOW_MS = 5000
const MOCK_TAP_COUNT = 3
let mockTaps: number[] = []
const mockToast = ref('')
let mockToastTimer: ReturnType<typeof setTimeout> | null = null

function onMockHotzoneTap() {
  const now = Date.now()
  mockTaps = [...mockTaps.filter((t) => now - t <= MOCK_TAP_WINDOW_MS), now]
  if (mockTaps.length < MOCK_TAP_COUNT) return
  mockTaps = []
  const enabled = toggleChatNewUserMock()
  activeFilter.value = 'all'
  mockToast.value = enabled ? '已切换：新用户首次注册' : '已切换：演示会话'
  if (mockToastTimer) clearTimeout(mockToastTimer)
  mockToastTimer = setTimeout(() => {
    mockToast.value = ''
  }, 1600)
}

onBeforeUnmount(() => {
  if (mockToastTimer) clearTimeout(mockToastTimer)
})

function dismissGuide() {
  chatNewUserMock.guideSeen = true
}

function enterFromGuide() {
  dismissGuide()
  openRoom(chatNewUserMock.conversation)
}

function goDiscover() {
  router.push({ name: 'mobile-discover' })
}

function openRoom(item: ChatConversation) {
  router.push({
    name: 'mobile-chat-room',
    params: { id: item.roomId },
    query: mineHallQuery(isVipClub.value),
  })
}

function mediaIconSrc(kind?: ChatPreviewMediaIcon) {
  if (kind === 'video') return CHAT_ASSETS.previewVideo
  if (kind === 'photo') return CHAT_ASSETS.previewPhoto
  if (kind === 'file') return CHAT_ASSETS.previewFile
  return ''
}
</script>

<template>
  <div class="mh5-chat-page">
    <header class="mh5-chat-header">
      <div class="mh5-chat-header__top">
        <button type="button" class="mh5-chat-mock-hotzone" tabindex="-1" aria-hidden="true" @click="onMockHotzoneTap" />
        <div class="mh5-chat-header__brand">
          <img class="mh5-chat-header__logo" :src="CHAT_ASSETS.logo" :alt="$t('金刚 KING KONG')" width="120" height="28" />
          <Mh5SpecAnnot v-if="isVipClub" :spec="VIP_CLUB_CHAT_SPEC" placement="bottom" />
        </div>
        <div class="mh5-chat-header__actions">
          <button type="button" class="mh5-chat-header__icon-btn" :aria-label="$t('发现')" @click="goDiscover">
            <img :src="CHAT_ASSETS.explore" alt="" width="22" height="22" />
          </button>
          <button type="button" class="mh5-chat-header__icon-btn" :aria-label="$t('添加联系人')">
            <img :src="CHAT_ASSETS.addContact" alt="" width="22" height="22" />
          </button>
        </div>
      </div>

      <div class="mh5-chat-filters">
        <div class="mh5-chat-filters__tabs" role="tablist" :aria-label="$t('会话筛选')">
          <button
            v-for="filter in CHAT_FILTERS"
            :key="filter.key"
            type="button"
            role="tab"
            class="mh5-chat-filter"
            :class="{ 'mh5-chat-filter--active': activeFilter === filter.key }"
            :aria-selected="activeFilter === filter.key"
            @click="activeFilter = filter.key"
          >
            {{ $t(filter.label) }}
          </button>
        </div>
        <button type="button" class="mh5-chat-filters__search" :aria-label="$t('搜索')">
          <img :src="CHAT_ASSETS.search" alt="" width="20" height="20" />
        </button>
      </div>
    </header>

    <main class="mh5-chat-main">
      <ul v-if="conversations.length" class="mh5-chat-list" role="list">
        <li
          v-for="item in conversations"
          :key="item.id"
          class="mh5-chat-item"
          :class="{ 'mh5-chat-item--guide': showGuide && item.official }"
          role="button"
          tabindex="0"
          @click="openRoom(item)"
          @keydown.enter="openRoom(item)"
        >
          <img class="mh5-chat-item__avatar" :src="item.avatar" :alt="item.title" width="52" height="52" />

          <div class="mh5-chat-item__body">
            <div class="mh5-chat-item__row">
              <h3 class="mh5-chat-item__title">
                {{ $t(item.title) }}
                <span v-if="item.official" class="mh5-chat-official-tag">{{ $t('官方') }}</span>
              </h3>
              <time
                class="mh5-chat-item__time"
                :class="{ 'mh5-chat-item__time--highlight': item.highlighted }"
              >
                {{ item.time }}
              </time>
            </div>
            <div class="mh5-chat-item__row">
              <p class="mh5-chat-item__preview">
                <img
                  v-if="item.previewLine.fromSelf && item.previewLine.delivery"
                  class="mh5-chat-item__check"
                  :src="CHAT_ASSETS.checkSent"
                  alt=""
                  width="14"
                  height="14"
                />
                <span v-if="item.previewLine.fromSelf" class="mh5-chat-item__you">{{ $t('你:') }}</span>
                <img
                  v-if="item.previewLine.mediaIcon"
                  class="mh5-chat-item__media-icon"
                  :src="mediaIconSrc(item.previewLine.mediaIcon)"
                  alt=""
                  width="14"
                  height="14"
                />
                <span class="mh5-chat-item__preview-text">{{ item.previewLine.text }}</span>
              </p>
              <img
                v-if="item.pinned && item.unread <= 0"
                class="mh5-chat-item__pin"
                :src="CHAT_ASSETS.pin"
                :alt="$t('置顶')"
                width="14"
                height="14"
              />
              <span
                v-else-if="item.unread > 0"
                class="mh5-chat-item__badge"
                :class="{ 'mh5-chat-item__badge--highlight': item.highlighted }"
              >
                {{ item.unread > 99 ? '99+' : item.unread }}
              </span>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="showGuide" class="mh5-chat-guide-card" role="dialog" :aria-label="$t('已为你开通充提专属服务群')">
        <p class="mh5-chat-guide-card__title">
          {{ $t('已为你开通充提专属服务群') }}
          <Mh5SpecAnnot :spec="CHAT_PAY_SERVICE_SPEC" placement="bottom" />
        </p>
        <p class="mh5-chat-guide-card__desc">
          {{ $t('充值未到账、提现进度等资金问题，直接在群里找专属客服，7×24 小时在线。') }}
        </p>
        <p class="mh5-chat-guide-card__safe">{{ $t('官方客服不会私聊索要密码或验证码') }}</p>
        <div class="mh5-chat-guide-card__actions">
          <button type="button" class="mh5-chat-guide-card__btn" @click="dismissGuide">{{ $t('我知道了') }}</button>
          <button type="button" class="mh5-chat-guide-card__btn mh5-chat-guide-card__btn--primary" @click="enterFromGuide">
            {{ $t('进群看看') }}
          </button>
        </div>
      </div>

      <div v-if="isNewUser && !showGuide" class="mh5-chat-new-empty" :class="{ 'mh5-chat-new-empty--inline': conversations.length }">
        <p class="mh5-chat-new-empty__title">{{ $t(newUserEmpty.title) }}</p>
        <p class="mh5-chat-new-empty__desc">{{ $t(newUserEmpty.desc) }}</p>
        <button v-if="newUserEmpty.action" type="button" class="mh5-chat-new-empty__btn" @click="goDiscover">
          {{ $t(newUserEmpty.action) }}
        </button>
      </div>

      <div v-else-if="!isNewUser && !conversations.length" class="mh5-chat-empty">
        <p>{{ $t('暂无会话消息') }}</p>
      </div>
    </main>

    <Transition name="mh5-chat-guide-fade">
      <div v-if="showGuide" class="mh5-chat-guide-mask" @click="dismissGuide" />
    </Transition>
    <Transition name="mh5-chat-room-toast">
      <div v-if="mockToast" class="mh5-chat-room-toast" role="status">{{ mockToast }}</div>
    </Transition>

    <span class="sr-only">未读消息共 {{ totalUnread }} 条</span>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
