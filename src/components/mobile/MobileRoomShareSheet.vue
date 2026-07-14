<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  LIVE_SHARE_ACTIONS,
  LIVE_STREAM_ASSETS,
  MOCK_LIVE_FORWARD_SESSIONS,
  MOCK_LIVE_SHARE_FRIENDS,
  type LiveShareActionKey,
} from '../../constants/mobileLiveStream'

defineProps<{
  muted?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  action: [key: LiveShareActionKey]
  'share-friend': [name: string]
  forwarded: [names: string[]]
}>()

const showForward = ref(false)
const keyword = ref('')
const selectedIds = ref<string[]>([])

const filteredSessions = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return MOCK_LIVE_FORWARD_SESSIONS
  return MOCK_LIVE_FORWARD_SESSIONS.filter((item) => item.name.toLowerCase().includes(q))
})

const canConfirm = computed(() => selectedIds.value.length > 0)

watch(open, (next) => {
  if (!next) {
    showForward.value = false
    keyword.value = ''
    selectedIds.value = []
  }
})

function close() {
  open.value = false
}

function backFromForward() {
  showForward.value = false
  keyword.value = ''
  selectedIds.value = []
}

function onAction(key: LiveShareActionKey) {
  if (key === 'forward') {
    showForward.value = true
    return
  }
  emit('action', key)
}

function toggleSession(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function confirmForward() {
  if (!canConfirm.value) return
  const names = MOCK_LIVE_FORWARD_SESSIONS.filter((s) => selectedIds.value.includes(s.id)).map(
    (s) => s.name,
  )
  emit('forwarded', names)
  open.value = false
}
</script>

<template>
  <Transition name="mh5-live-share">
    <div v-if="open" class="mh5-live-share-mask" @click.self="close">
      <!-- 选择会话（浅色） -->
      <section
        v-if="showForward"
        class="mh5-live-forward"
        role="dialog"
        aria-modal="true"
        aria-label="选择会话"
        @click.stop
      >
        <header class="mh5-live-forward__head">
          <button type="button" class="mh5-live-forward__back" aria-label="返回" @click="backFromForward">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <h2 class="mh5-live-forward__title">选择会话</h2>
        </header>

        <label class="mh5-live-forward__search">
          <svg class="mh5-live-forward__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
            <path d="M16.2 16.2 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="keyword"
            class="mh5-live-forward__search-input"
            type="search"
            placeholder="用户名/金刚号"
            enterkeyhint="search"
          />
        </label>

        <div class="mh5-live-forward__section">最近会话</div>

        <div class="mh5-live-forward__list" role="listbox" aria-label="最近会话" aria-multiselectable="true">
          <button
            v-for="session in filteredSessions"
            :key="session.id"
            type="button"
            class="mh5-live-forward__row"
            role="option"
            :aria-selected="selectedIds.includes(session.id)"
            @click="toggleSession(session.id)"
          >
            <span
              class="mh5-live-forward__check"
              :class="{ 'mh5-live-forward__check--on': selectedIds.includes(session.id) }"
              aria-hidden="true"
            />
            <img class="mh5-live-forward__avatar" :src="session.avatar" :alt="session.name" />
            <span class="mh5-live-forward__name">{{ session.name }}</span>
            <span v-if="session.isGroup" class="mh5-live-forward__group" aria-label="群聊">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="3.2" stroke="currentColor" stroke-width="1.6" />
                <circle cx="16" cy="10" r="2.6" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M3.5 18.5c.8-2.6 2.8-4 5.5-4s4.7 1.4 5.5 4"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M14 14.2c1.9.2 3.4 1.2 4 3.3"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </button>

          <p v-if="!filteredSessions.length" class="mh5-live-forward__empty">暂无匹配会话</p>
        </div>

        <div class="mh5-live-forward__footer">
          <button
            type="button"
            class="mh5-live-forward__confirm"
            :disabled="!canConfirm"
            @click="confirmForward"
          >
            确定{{ canConfirm ? `（${selectedIds.length}）` : '' }}
          </button>
        </div>
      </section>

      <!-- 转发底栏 -->
      <section
        v-else
        class="mh5-live-share"
        role="dialog"
        aria-modal="true"
        aria-label="转发"
        @click.stop
      >
        <header class="mh5-live-share__head">
          <h2 class="mh5-live-share__title">转发</h2>
          <button type="button" class="mh5-live-share__close" aria-label="关闭" @click="close">
            <img :src="LIVE_STREAM_ASSETS.shareSheet.close" alt="" width="24" height="24" />
          </button>
        </header>

        <div class="mh5-live-share__friends" aria-label="分享给好友">
          <button
            v-for="friend in MOCK_LIVE_SHARE_FRIENDS"
            :key="friend.id"
            type="button"
            class="mh5-live-share__friend"
            @click="emit('share-friend', friend.name)"
          >
            <span class="mh5-live-share__avatar-wrap">
              <img class="mh5-live-share__avatar" :src="friend.avatar" :alt="friend.name" />
            </span>
            <span class="mh5-live-share__friend-name">{{ friend.name }}</span>
          </button>
          <button type="button" class="mh5-live-share__friend" @click="showForward = true">
            <span class="mh5-live-share__avatar-wrap mh5-live-share__avatar-wrap--add">
              <img :src="LIVE_STREAM_ASSETS.shareSheet.add" alt="" width="32" height="32" />
            </span>
            <span class="mh5-live-share__friend-name">更多</span>
          </button>
        </div>

        <div class="mh5-live-share__divider" aria-hidden="true" />

        <div class="mh5-live-share__actions" aria-label="功能操作">
          <button
            v-for="action in LIVE_SHARE_ACTIONS"
            :key="action.key"
            type="button"
            class="mh5-live-share__action"
            @click="onAction(action.key)"
          >
            <span class="mh5-live-share__action-icon">
              <img
                :src="
                  action.key === 'mute' && muted
                    ? LIVE_STREAM_ASSETS.shareSheet.muteOff
                    : action.icon
                "
                alt=""
                width="48"
                height="48"
              />
            </span>
            <span class="mh5-live-share__action-label">
              {{ action.key === 'mute' && muted ? '取消禁音' : action.label }}
            </span>
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>
