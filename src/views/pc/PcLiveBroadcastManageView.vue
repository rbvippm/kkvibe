<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfLiveBroadcastAnnot from '../../components/wireframe/WfLiveBroadcastAnnot.vue'
import {
  danmakuSenderRoleLabel,
  isDanmakuMuteDisabled,
  useLiveDanmakuMute,
  type DanmakuMessage,
  type MuteType,
} from '../../composables/useLiveDanmakuMute'
import '../../styles/pc-wireframe.css'

const {
  currentRoom,
  liveStats,
  danmakuMessages,
  mutedCount,
  muteUser,
  isUserMuted,
  sendLiveReminder,
} = useLiveDanmakuMute()

const reminderText = ref('')
const actionMenuVisible = ref(false)
const actionMenuPos = ref({ x: 0, y: 0 })
const activeMessage = ref<DanmakuMessage | null>(null)
const actionHint = ref('')
const muteModalVisible = ref(false)
const muteTargetMessage = ref<DanmakuMessage | null>(null)
const muteReason = ref('')
const muteType = ref<MuteType>('房间禁言')
const muteReasonHint = ref('')
let skipNextDocumentClose = false

const activeMessageRoleLabel = computed(() =>
  activeMessage.value ? danmakuSenderRoleLabel(activeMessage.value) : null,
)
const activeMessageMuteDisabled = computed(() =>
  activeMessage.value ? isDanmakuMuteDisabled(activeMessage.value) : true,
)

function openActionMenu(event: MouseEvent, message: DanmakuMessage) {
  event.preventDefault()
  event.stopPropagation()
  skipNextDocumentClose = true
  activeMessage.value = message
  actionMenuPos.value = { x: event.clientX, y: event.clientY }
  actionMenuVisible.value = true
  requestAnimationFrame(() => {
    skipNextDocumentClose = false
  })
}

function closeActionMenu() {
  actionMenuVisible.value = false
  activeMessage.value = null
}

function onDocumentClick() {
  if (skipNextDocumentClose) return
  if (actionMenuVisible.value) closeActionMenu()
}

function onDocumentContextMenu(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest('.live-danmaku-item')) {
    closeActionMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('contextmenu', onDocumentContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('contextmenu', onDocumentContextMenu)
})

function openMuteModal() {
  const message = activeMessage.value
  if (!message || isDanmakuMuteDisabled(message)) return
  muteTargetMessage.value = message
  muteReason.value = ''
  muteType.value = '房间禁言'
  muteReasonHint.value = ''
  closeActionMenu()
  muteModalVisible.value = true
}

function closeMuteModal() {
  muteModalVisible.value = false
  muteTargetMessage.value = null
  muteReason.value = ''
  muteType.value = '房间禁言'
  muteReasonHint.value = ''
}

async function confirmMute() {
  const message = muteTargetMessage.value
  if (!message) return
  if (!muteReason.value.trim()) {
    muteReasonHint.value = '请输入禁言原因'
    return
  }
  muteUser({
    userId: message.userId,
    username: message.username,
    muteSource: '主播',
    muteType: muteType.value,
    reason: muteReason.value.trim(),
    danmakuContent: message.isSystem ? '—' : message.content,
    danmakuSentAt: message.sentAt,
  })
  actionHint.value = `已${muteType.value}用户 ${message.username}，可在禁言列表查看`
  closeMuteModal()
  await nextTick()
  setTimeout(() => {
    actionHint.value = ''
  }, 3000)
}

function submitReminder() {
  if (!reminderText.value.trim()) return
  sendLiveReminder(reminderText.value)
  reminderText.value = ''
  actionHint.value = '直播提醒已发送至弹幕区'
  setTimeout(() => {
    actionHint.value = ''
  }, 2500)
}

function displayContent(message: DanmakuMessage) {
  if (message.isSystem && message.content === '进入直播间') {
    return `${message.username} 进入直播间`
  }
  if (message.username === '直播提醒') {
    return message.content
  }
  return `${message.username}：${message.content}`
}
</script>

<template>
  <div class="pc-wireframe-page live-broadcast-page">
    <WfPagePathMenu />

    <div class="live-broadcast-page__toolbar">
      <div class="live-broadcast-page__room-wrap">
        <p class="live-broadcast-page__room">
          当前直播间：<strong>{{ currentRoom.name }}</strong>（{{ currentRoom.id }}）
        </p>
        <WfLiveBroadcastAnnot context="currentRoom" placement="bottom" />
      </div>
      <div class="live-broadcast-page__toolbar-right">
        <RouterLink to="/pc/live-danmaku-mute-list" class="wf-link-action live-broadcast-page__mute-link">
          禁言列表（{{ mutedCount }}）
        </RouterLink>
        <WfLiveBroadcastAnnot context="muteListLink" placement="bottom" />
      </div>
    </div>

    <p v-if="actionHint" class="live-broadcast-page__hint">{{ actionHint }}</p>

    <div class="live-broadcast-page__layout">
      <section class="live-broadcast-page__main">
        <div class="live-broadcast-page__player" aria-label="直播画面">
          <WfLiveBroadcastAnnot context="livePlayer" placement="bottom" />
          <div class="live-broadcast-page__player-inner">
            <span class="live-broadcast-page__player-placeholder">直播画面</span>
          </div>
        </div>

        <div class="live-broadcast-page__reminder">
          <label class="wf-label" for="live-reminder-input">直播提醒：</label>
          <input
            id="live-reminder-input"
            v-model="reminderText"
            type="text"
            class="wf-input live-broadcast-page__reminder-input"
            placeholder="请输入提醒内容"
            maxlength="100"
            @keydown.enter.prevent="submitReminder"
          />
          <button type="button" class="wf-btn wf-btn--primary" @click="submitReminder">发送</button>
          <WfLiveBroadcastAnnot context="liveReminder" placement="bottom" />
        </div>
        <p class="live-broadcast-page__reminder-tip">直播提醒内容会发送至当前直播间弹幕消息中</p>
      </section>

      <aside class="live-broadcast-page__danmaku-panel">
        <header class="live-broadcast-page__danmaku-header">
          <h2 class="live-broadcast-page__danmaku-title">弹幕消息</h2>
          <div class="live-broadcast-page__danmaku-header-right">
            <div class="live-broadcast-page__stats">
              <span class="live-broadcast-page__stat" title="点赞">👍 {{ liveStats.likes }}</span>
              <span class="live-broadcast-page__stat" title="观看">👁 {{ liveStats.viewers }}</span>
            </div>
            <WfLiveBroadcastAnnot context="danmakuList" placement="bottom" />
          </div>
        </header>
        <p class="live-broadcast-page__danmaku-notice">提示：数据统计每 2 分钟自动更新一次</p>

        <div class="live-broadcast-page__danmaku-list-head">
          <WfLiveBroadcastAnnot context="mutedBadge" placement="bottom" />
        </div>

        <ul class="live-broadcast-page__danmaku-list">
          <li
            v-for="message in danmakuMessages"
            :key="message.id"
            class="live-danmaku-item"
            :class="{ 'live-danmaku-item--muted': isUserMuted(message.userId) }"
            @click="openActionMenu($event, message)"
            @contextmenu="openActionMenu($event, message)"
          >
            <span class="live-danmaku-item__avatar" aria-hidden="true">{{ message.avatar }}</span>
            <div class="live-danmaku-item__body">
              <p class="live-danmaku-item__text">{{ displayContent(message) }}</p>
              <span v-if="isUserMuted(message.userId)" class="live-danmaku-item__badge">已禁言</span>
            </div>
            <time class="live-danmaku-item__time">{{ message.sentAt }}</time>
          </li>
          <li v-if="!danmakuMessages.length" class="live-danmaku-item live-danmaku-item--empty">
            暂无弹幕消息
          </li>
        </ul>
      </aside>
    </div>

    <Teleport to="body">
      <div
        v-if="actionMenuVisible && activeMessage"
        class="live-danmaku-action-menu"
        :style="{ left: `${actionMenuPos.x}px`, top: `${actionMenuPos.y}px` }"
        role="menu"
        @click.stop
      >
        <p class="live-danmaku-action-menu__title">
          {{ activeMessage.username }}
          <span
            v-if="activeMessageRoleLabel"
            class="live-danmaku-action-menu__tag"
          >
            {{ activeMessageRoleLabel }}
          </span>
          <WfLiveBroadcastAnnot context="danmakuActionMenu" placement="top" />
        </p>
        <button
          type="button"
          class="live-danmaku-action-menu__item"
          :disabled="activeMessageMuteDisabled"
          role="menuitem"
          @click="openMuteModal"
        >
          禁言
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="muteModalVisible && muteTargetMessage"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeMuteModal"
      >
        <div class="wf-modal" role="dialog" aria-labelledby="mute-reason-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="mute-reason-title" class="wf-modal__title">禁言用户</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeMuteModal">×</button>
          </div>
          <div class="wf-modal__body">
            <p class="live-mute-modal__user">
              用户：<strong>{{ muteTargetMessage.username }}</strong>（{{ muteTargetMessage.userId }}）
            </p>
            <p class="live-mute-modal__danmaku">
              触发弹幕：{{ displayContent(muteTargetMessage) }}
            </p>
            <div class="wf-form-row">
              <span class="wf-form-row__label">禁言类型</span>
              <div class="live-mute-modal__type-group">
                <label class="live-mute-modal__type">
                  <input v-model="muteType" type="radio" value="房间禁言" />
                  房间禁言
                </label>
                <label class="live-mute-modal__type">
                  <input v-model="muteType" type="radio" value="全局禁言" />
                  全局禁言
                </label>
                <WfLiveBroadcastAnnot context="muteType" placement="top" />
              </div>
            </div>
            <div class="wf-form-row live-mute-modal__reason-row">
              <label class="wf-form-row__label wf-form-row__label--required" for="mute-reason-input">
                禁言原因
              </label>
              <div class="live-mute-modal__reason-field">
                <input
                  id="mute-reason-input"
                  v-model="muteReason"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="请输入禁言原因"
                  maxlength="50"
                  @keydown.enter.prevent="confirmMute"
                />
                <WfLiveBroadcastAnnot context="muteReason" placement="top" />
              </div>
            </div>
            <p v-if="muteReasonHint" class="wf-modal__hint">{{ muteReasonHint }}</p>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeMuteModal">取消</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="confirmMute">确定禁言</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.live-broadcast-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.live-broadcast-page__room-wrap,
.live-broadcast-page__toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.live-broadcast-page__mute-link {
  margin-right: 0;
}

.live-broadcast-page__room {
  margin: 0;
  font-size: 14px;
  color: var(--pc-text-secondary, #666);
}

.live-broadcast-page__hint {
  margin: 0 0 12px;
  padding: 8px 12px;
  border: 1px solid var(--pc-primary-border, #91d5ff);
  background: var(--pc-primary-bg, #e6f7ff);
  font-size: 13px;
  color: var(--pc-primary, #1890ff);
}

.live-broadcast-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.live-broadcast-page__player {
  position: relative;
  background: #000;
  border: 1px solid var(--pc-border, #d9d9d9);
}

.live-broadcast-page__player :deep(.wf-spec-annot) {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.live-broadcast-page__player-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  min-height: 280px;
}

.live-broadcast-page__player-placeholder {
  color: rgb(255 255 255 / 45%);
  font-size: 14px;
}

.live-broadcast-page__reminder {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.live-broadcast-page__reminder-input {
  flex: 1;
  min-width: 200px;
}

.live-broadcast-page__reminder-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--pc-danger, #ff4d4f);
}

.live-broadcast-page__danmaku-panel {
  border: 1px solid var(--pc-border-light, #e8e8e8);
  background: #fff;
  min-height: 420px;
}

.live-broadcast-page__danmaku-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  border-bottom: 1px solid var(--pc-border-light, #e8e8e8);
}

.live-broadcast-page__danmaku-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-broadcast-page__danmaku-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--pc-text, #333);
}

.live-broadcast-page__stats {
  display: flex;
  gap: 8px;
}

.live-broadcast-page__stat {
  padding: 2px 10px;
  border-radius: 12px;
  background: var(--pc-primary-bg, #e6f7ff);
  font-size: 12px;
  color: var(--pc-primary, #1890ff);
}

.live-broadcast-page__danmaku-notice {
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--pc-danger, #ff4d4f);
}

.live-broadcast-page__danmaku-list-head {
  padding: 0 12px 4px;
}

.live-broadcast-page__danmaku-list {
  margin: 0;
  padding: 0 8px 12px;
  list-style: none;
  max-height: 520px;
  overflow-y: auto;
}

.live-danmaku-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
}

.live-danmaku-item:hover {
  background: #ebebeb;
}

.live-danmaku-item--muted {
  opacity: 0.72;
}

.live-danmaku-item--empty {
  justify-content: center;
  color: var(--pc-text-muted, #999);
  cursor: default;
}

.live-danmaku-item__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d9d9d9;
  font-size: 13px;
  color: #666;
}

.live-danmaku-item__body {
  flex: 1;
  min-width: 0;
}

.live-danmaku-item__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.live-danmaku-item__badge {
  display: inline-block;
  margin-top: 4px;
  padding: 0 6px;
  border-radius: 2px;
  background: #fff1f0;
  font-size: 11px;
  color: var(--pc-danger, #ff4d4f);
}

.live-danmaku-item__time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--pc-text-muted, #999);
  white-space: nowrap;
}

.live-danmaku-action-menu {
  position: fixed;
  z-index: 10000;
  min-width: 240px;
  padding: 6px 0;
  border: 1px solid var(--pc-border, #d9d9d9);
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  transform: translate(-8px, 4px);
}

.live-danmaku-action-menu__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 6px 12px 8px;
  border-bottom: 1px solid var(--pc-border-light, #e8e8e8);
  font-size: 12px;
  font-weight: 600;
  color: var(--pc-text-secondary, #666);
}

.live-danmaku-action-menu__tag {
  margin-left: 4px;
  padding: 0 4px;
  border-radius: 2px;
  background: #f0f0f0;
  font-weight: 400;
  color: var(--pc-text-muted, #999);
}

.live-danmaku-action-menu__item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  text-align: left;
  color: var(--pc-text, #333);
  cursor: pointer;
}

.live-danmaku-action-menu__item:hover:not(:disabled) {
  background: var(--pc-bg-table-head, #fafafa);
}

.live-danmaku-action-menu__item:disabled {
  color: var(--pc-text-muted, #999);
  cursor: not-allowed;
}

.live-mute-modal__user {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--pc-text, #333);
}

.live-mute-modal__danmaku {
  margin: 0 0 16px;
  padding: 8px 10px;
  border: 1px solid var(--pc-border-light, #e8e8e8);
  background: var(--pc-bg-table-head, #fafafa);
  font-size: 13px;
  line-height: 1.5;
  color: var(--pc-text-secondary, #666);
  word-break: break-word;
}

.live-mute-modal__type-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding-top: 6px;
}

.live-mute-modal__type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--pc-text, #333);
  cursor: pointer;
}

.live-mute-modal__type input {
  margin: 0;
  cursor: pointer;
}

.live-mute-modal__reason-row {
  align-items: flex-start;
}

.live-mute-modal__reason-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.live-mute-modal__reason-field .wf-input--full {
  flex: 1;
}

@media (max-width: 900px) {
  .live-broadcast-page__layout {
    grid-template-columns: 1fr;
  }
}
</style>
