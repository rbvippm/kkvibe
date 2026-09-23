<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'
import { LIVE_SHARE_SPEC } from '../../constants/liveShareSpec'
import { liveShareTargets, type LiveShareTarget } from '../../constants/liveShareChat'
import {
  LIVE_ROOM_SHARE_ACTIONS,
  LIVE_SHARE_ACTIONS,
  LIVE_STREAM_ASSETS,
  LIVE_STREAM_QUALITY_OPTIONS,
  type LiveShareAction,
  type LiveShareActionKey,
  type LiveStreamQuality,
} from '../../constants/mobileLiveStream'

const props = defineProps<{
  muted?: boolean
  /** 视频直播间：标题为分享，功能为转发 / 清晰度 / 清屏 / 声音 */
  roomTools?: boolean
  quality?: LiveStreamQuality
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  action: [key: LiveShareActionKey]
  'share-friend': [target: LiveShareTarget]
  forwarded: [targets: LiveShareTarget[]]
}>()

const showForward = ref(false)
const keyword = ref('')
const selectedIds = ref<string[]>([])

const actions = computed(() => (props.roomTools ? LIVE_ROOM_SHARE_ACTIONS : LIVE_SHARE_ACTIONS))
const sheetTitle = computed(() => (props.roomTools ? '分享' : '更多功能'))
const qualityShort = computed(
  () => LIVE_STREAM_QUALITY_OPTIONS.find((item) => item.key === props.quality)?.short ?? '高清',
)

const shareTargets = computed(() => liveShareTargets())
const quickTargets = computed(() => shareTargets.value.slice(0, 4))

const filteredSessions = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return shareTargets.value
  return shareTargets.value.filter((item) => item.name.toLowerCase().includes(q))
})

const canConfirm = computed(() => selectedIds.value.length > 0)

watch(open, (next) => {
  if (!next) {
    showForward.value = false
    keyword.value = ''
    selectedIds.value = []
  }
})

function actionLabel(action: LiveShareAction) {
  if (action.key !== 'mute') return action.label
  if (props.roomTools) return props.muted ? '已关闭' : '已开启'
  return props.muted ? '取消禁音' : action.label
}

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
  const targets = shareTargets.value.filter((item) => selectedIds.value.includes(item.id))
  emit('forwarded', targets)
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
        :aria-label="$t('选择会话')"
        @click.stop
      >
        <header class="mh5-live-forward__head">
          <button type="button" class="mh5-live-forward__back" :aria-label="$t('返回')" @click="backFromForward">
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
          <h2 class="mh5-live-forward__title">{{ $t('选择会话') }}</h2>
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
            :placeholder="$t('用户名/金刚号')"
            enterkeyhint="search"
          />
        </label>

        <div class="mh5-live-forward__section">{{ $t('最近会话') }}</div>

        <div class="mh5-live-forward__list" role="listbox" :aria-label="$t('最近会话')" aria-multiselectable="true">
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
            <span class="mh5-live-forward__name">{{ $t(session.name) }}</span>
            <span v-if="session.isGroup" class="mh5-live-forward__group" :aria-label="$t('群聊')">
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

          <p v-if="!filteredSessions.length" class="mh5-live-forward__empty">{{ $t('暂无匹配会话') }}</p>
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

      <!-- 分享 / 更多功能 -->
      <section
        v-else
        class="mh5-live-share"
        role="dialog"
        aria-modal="true"
        :aria-label="$t(sheetTitle)"
        @click.stop
      >
        <header class="mh5-live-share__head">
          <div class="mh5-live-share__title-row">
            <h2 class="mh5-live-share__title">{{ $t(sheetTitle) }}</h2>
            <Mh5SpecAnnot v-if="roomTools" :spec="LIVE_SHARE_SPEC" placement="top" />
          </div>
          <button type="button" class="mh5-live-share__close" :aria-label="$t('关闭')" @click="close">
            <img :src="LIVE_STREAM_ASSETS.shareSheet.close" alt="" width="24" height="24" />
          </button>
        </header>

        <div class="mh5-live-share__friends" :aria-label="$t('分享给好友')">
          <button
            v-for="friend in quickTargets"
            :key="friend.id"
            type="button"
            class="mh5-live-share__friend"
            @click="emit('share-friend', friend)"
          >
            <span class="mh5-live-share__avatar-wrap">
              <img class="mh5-live-share__avatar" :src="friend.avatar" :alt="friend.name" />
            </span>
            <span class="mh5-live-share__friend-name">{{ $t(friend.name) }}</span>
          </button>
          <button type="button" class="mh5-live-share__friend" @click="showForward = true">
            <span class="mh5-live-share__avatar-wrap mh5-live-share__avatar-wrap--add">
              <img :src="LIVE_STREAM_ASSETS.shareSheet.add" alt="" width="32" height="32" />
            </span>
            <span class="mh5-live-share__friend-name">{{ $t('更多') }}</span>
          </button>
        </div>

        <div class="mh5-live-share__divider" aria-hidden="true" />

        <div class="mh5-live-share__actions" :aria-label="$t('功能操作')">
          <button
            v-for="action in actions"
            :key="action.key"
            type="button"
            class="mh5-live-share__action"
            @click="onAction(action.key)"
          >
            <span class="mh5-live-share__action-icon" :class="{ 'is-plain': roomTools }">
              <span v-if="roomTools && action.key === 'quality'" class="mh5-live-share__quality-text">
                {{ qualityShort }}
              </span>
              <svg
                v-else-if="roomTools && action.key === 'forward'"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M14.2 6.2 19 10.4 14.2 14.6"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18.2 10.4H10.4c-3.1 0-5.2 1.9-5.2 5.1v2.2"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                v-else-if="roomTools && action.key === 'clear'"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 4.8h5.1L17.5 9v9.6A1.4 1.4 0 0 1 16.1 20H8.4A1.4 1.4 0 0 1 7 18.6V6.2A1.4 1.4 0 0 1 8.4 4.8H8Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
                <path d="M13 5v4.2h4.1" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                <path d="M9 16.2 15.4 9.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              <svg
                v-else-if="roomTools && action.key === 'mute'"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9.2 9.2H6.6v5.6h2.6l3.6 2.8V6.4l-3.6 2.8Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
                <path
                  v-if="!muted"
                  d="M15.4 9.3a3.4 3.4 0 0 1 0 5.4M17.4 7.4a6 6 0 0 1 0 9.2"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  v-else
                  d="M16 10.2 19.2 13.8M19.2 10.2 16 13.8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
              <img
                v-else
                :src="action.key === 'mute' && muted ? LIVE_STREAM_ASSETS.shareSheet.muteOff : action.icon"
                alt=""
                width="22"
                height="22"
              />
            </span>
            <span class="mh5-live-share__action-label">{{ $t(actionLabel(action)) }}</span>
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>
