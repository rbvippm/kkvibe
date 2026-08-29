<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CHAT_FILTERS,
  chatConversationsState,
  conversationsForFilter,
  type ChatConversation,
  type ChatFilter,
  type ChatPreviewMediaIcon,
} from '../../constants/mobileChat'
import { CHAT_ASSETS } from '../../constants/mobileChatAssets'

const router = useRouter()
const activeFilter = ref<ChatFilter>('all')

const conversations = computed(() => conversationsForFilter(activeFilter.value))

const totalUnread = computed(() =>
  chatConversationsState.reduce((sum, c) => sum + c.unread, 0),
)

function goDiscover() {
  router.push({ name: 'mobile-discover' })
}

function openRoom(item: ChatConversation) {
  router.push({
    name: 'mobile-chat-room',
    params: { id: item.roomId },
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
        <img class="mh5-chat-header__logo" :src="CHAT_ASSETS.logo" :alt="$t('金刚 KING KONG')" width="120" height="28" />
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
          role="button"
          tabindex="0"
          @click="openRoom(item)"
          @keydown.enter="openRoom(item)"
        >
          <img class="mh5-chat-item__avatar" :src="item.avatar" :alt="item.title" width="52" height="52" />

          <div class="mh5-chat-item__body">
            <div class="mh5-chat-item__row">
              <h3 class="mh5-chat-item__title">{{ $t(item.title) }}</h3>
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

      <div v-else class="mh5-chat-empty">
        <p>{{ $t('暂无会话消息') }}</p>
      </div>
    </main>

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
