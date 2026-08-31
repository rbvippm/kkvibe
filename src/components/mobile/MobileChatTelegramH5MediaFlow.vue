<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChatMediaSendPayload, GalleryMediaItem } from '../../constants/mobileChatGallery'
import {
  CHAT_FILE_VIDEO_LIMIT_ALERT,
  chatFileH5FilteredHint,
  chatFileKindTone,
  galleryItemToChatFile,
  isChatFileOversize,
  isFileEntryItemOversize,
  type ChatFileAttachment,
  type ChatFileSendPayload,
} from '../../constants/mobileChatFileSend'
import {
  TG_H5_ATTACH_ACTIONS,
  TG_H5_SEND_MORE_ACTIONS,
  TG_H5_SYSTEM_SOURCES,
  tgH5CameraCaptureItem,
  tgH5FileSendTitle,
  tgH5PickerItems,
  tgH5SendTitle,
} from '../../constants/mobileChatTelegramH5'
import MobileChatFileSendFlow from './MobileChatFileSendFlow.vue'

const props = defineProps<{
  open: boolean
  /** attach：附件菜单；system：系统来源；picker：系统相册；camera：系统相机 */
  startAt?: 'attach' | 'system' | 'picker' | 'camera'
}>()

const emit = defineEmits<{
  close: []
  send: [payload: ChatMediaSendPayload]
  sendFiles: [payload: ChatFileSendPayload]
}>()

type Stage = 'attach' | 'system' | 'picker' | 'camera' | 'files' | 'send'

const stage = ref<Stage>('attach')
const selectedIds = ref<string[]>([])
const caption = ref('')
const hd = ref(false)
const moreOpen = ref(false)
const cameraMode = ref<'photo' | 'video'>('photo')
const zoom = ref('1x')
const tip = ref('')
let tipTimer: ReturnType<typeof setTimeout> | null = null

const pickerItems = computed(() => tgH5PickerItems())
const selectedItems = computed(() =>
  selectedIds.value
    .map((id) => {
      const fromPicker = pickerItems.value.find((item) => item.id === id)
      if (fromPicker) return fromPicker
      return cameraBagups.value.find((item) => item.id === id)
    })
    .filter((item): item is GalleryMediaItem => Boolean(item)),
)
const cameraBagups = ref<GalleryMediaItem[]>([])
const sendFiles = ref<ChatFileAttachment[]>([])
const sendKind = ref<'media' | 'file'>('media')
/** H5 关闭系统文件弹层后滤掉的超 2GB 项数，预览卡回显 */
const filteredOversizeCount = ref(0)
const canConfirmPicker = computed(() => selectedIds.value.length > 0)
const isFileSend = computed(() => sendKind.value === 'file')
/** 「+」→「文件」→「选择照片或视频」：选完按文件卡回显 */
const fileFromGallery = computed(() => props.startAt === 'picker')
const canCaption = computed(() => !isFileSend.value || sendFiles.value.length === 1)
const moreActions = computed(() =>
  isFileSend.value ? TG_H5_SEND_MORE_ACTIONS.filter((action) => action.key === 'add') : TG_H5_SEND_MORE_ACTIONS,
)
const sendTitle = computed(() =>
  isFileSend.value
    ? tgH5FileSendTitle(sendFiles.value.length)
    : tgH5SendTitle(
        selectedItems.value.length,
        selectedItems.value.some((item) => item.type === 'video'),
      ),
)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      moreOpen.value = false
      return
    }
    const next =
      props.startAt === 'camera' ||
      props.startAt === 'system' ||
      props.startAt === 'attach' ||
      props.startAt === 'picker'
        ? props.startAt
        : 'attach'
    resetFlow(next)
  },
)

function resetFlow(next: Stage) {
  stage.value = next
  selectedIds.value = []
  cameraBagups.value = []
  sendFiles.value = []
  sendKind.value = 'media'
  caption.value = ''
  hd.value = false
  moreOpen.value = false
  cameraMode.value = 'photo'
  zoom.value = '1x'
  tip.value = ''
  filteredOversizeCount.value = 0
}

function showTip(text: string) {
  tip.value = text
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => {
    tip.value = ''
  }, 1400)
}

function closeAll() {
  emit('close')
}

function onAttach(key: string, label: string) {
  if (key === 'photo_video') {
    stage.value = 'system'
    return
  }
  showTip(`「${label}」原型演示`)
}

function onSystemSource(key: string) {
  if (key === 'library') {
    sendKind.value = 'media'
    stage.value = 'picker'
    return
  }
  if (key === 'files') {
    sendKind.value = 'file'
    stage.value = 'files'
    return
  }
  if (key === 'camera') {
    sendKind.value = 'media'
    stage.value = 'camera'
  }
}

function onFilePickerClose() {
  stage.value = sendFiles.value.length ? 'send' : 'system'
}

function onFilesPicked(files: ChatFileAttachment[]) {
  const allowed = files.filter((file) => !isChatFileOversize(file))
  const dropped = files.length - allowed.length
  const next = new Map(sendFiles.value.map((file) => [file.id, file]))
  for (const file of allowed) next.set(file.id, file)
  sendFiles.value = [...next.values()].slice(0, 9)
  sendKind.value = 'file'
  caption.value = sendFiles.value.length === 1 ? caption.value : ''
  filteredOversizeCount.value = dropped
  if (sendFiles.value.length) {
    stage.value = 'send'
    return
  }
  if (dropped > 0) showTip(chatFileH5FilteredHint(dropped))
}

function removeSendFile(id: string) {
  sendFiles.value = sendFiles.value.filter((file) => file.id !== id)
  if (!sendFiles.value.length) {
    caption.value = ''
    stage.value = fileFromGallery.value ? 'picker' : 'system'
  }
}

function filesFromGalleryItems(items: GalleryMediaItem[]) {
  return items.map((item, index) => ({
    ...galleryItemToChatFile(item, index),
    id: `gal-file-${item.id}`,
  }))
}

function selectionOn(id: string) {
  return selectedIds.value.includes(id)
}

function togglePickerItem(item: GalleryMediaItem) {
  if (fileFromGallery.value && isFileEntryItemOversize(item) && !selectionOn(item.id)) {
    showTip(CHAT_FILE_VIDEO_LIMIT_ALERT)
    return
  }
  if (selectionOn(item.id)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
    return
  }
  if (selectedIds.value.length >= 9) {
    showTip('最多选择 9 项')
    return
  }
  selectedIds.value = [...selectedIds.value, item.id]
}

function confirmPicker() {
  if (!canConfirmPicker.value) return
  if (fileFromGallery.value) {
    const incoming = filesFromGalleryItems(selectedItems.value)
    const next = new Map(sendFiles.value.map((file) => [file.id, file]))
    for (const file of incoming) next.set(file.id, file)
    sendFiles.value = [...next.values()].slice(0, 9)
    sendKind.value = 'file'
    caption.value = sendFiles.value.length === 1 ? caption.value : ''
    stage.value = 'send'
    return
  }
  sendKind.value = 'media'
  sendFiles.value = []
  stage.value = 'send'
}

function capturePhoto() {
  if (cameraMode.value === 'video') {
    showTip('视频拍摄原型演示，请切换到照片')
    return
  }
  const shot = tgH5CameraCaptureItem(cameraBagups.value.length)
  cameraBagups.value = [...cameraBagups.value, shot]
  selectedIds.value = [...selectedIds.value, shot.id]
  stage.value = 'send'
}

function removeSendItem(id: string) {
  selectedIds.value = selectedIds.value.filter((itemId) => itemId !== id)
  cameraBagups.value = cameraBagups.value.filter((item) => item.id !== id)
  if (!selectedIds.value.length) {
    stage.value = props.startAt === 'picker' ? 'picker' : 'system'
  }
}

function backFromPicker() {
  if (sendFiles.value.length) {
    stage.value = 'send'
    return
  }
  if (fileFromGallery.value) {
    closeAll()
    return
  }
  stage.value = 'system'
}

function onMoreAction(key: string) {
  moreOpen.value = false
  if (key === 'add') {
    if (fileFromGallery.value) {
      selectedIds.value = sendFiles.value
        .map((file) => file.id.replace(/^gal-file-/, ''))
        .filter(Boolean)
      stage.value = 'picker'
      return
    }
    stage.value = isFileSend.value ? 'files' : 'picker'
    return
  }
  if (key === 'hd') {
    hd.value = !hd.value
    showTip(hd.value ? '已开启高清' : '已关闭高清')
  }
}

function send() {
  if (isFileSend.value) {
    if (!sendFiles.value.length) return
    emit('sendFiles', {
      files: sendFiles.value,
      caption: canCaption.value ? caption.value.trim() : '',
    })
    return
  }
  if (!selectedItems.value.length) return
  emit('send', {
    items: selectedItems.value,
    caption: caption.value.trim(),
    hd: hd.value,
  })
}
</script>

<template>
  <div v-if="open" class="mh5-tg-h5-flow" role="presentation">
      <!-- 1. 附件菜单 -->
      <Transition name="mh5-tg-h5-fade">
        <div
          v-if="stage === 'attach'"
          class="mh5-tg-h5-flow__mask mh5-tg-h5-flow__mask--soft"
          @click.self="closeAll"
        >
          <div class="mh5-tg-h5-attach" role="menu" :aria-label="$t('附件')">
            <button
              v-for="action in TG_H5_ATTACH_ACTIONS"
              :key="action.key"
              type="button"
              class="mh5-tg-h5-attach__item"
              role="menuitem"
              @click="onAttach(action.key, action.label)"
            >
              <span class="mh5-tg-h5-attach__icon" :data-icon="action.icon" aria-hidden="true" />
              <span>{{ $t(action.label) }}</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- 2. 系统来源 -->
      <Transition name="mh5-tg-h5-fade">
        <div
          v-if="stage === 'system'"
          class="mh5-tg-h5-flow__mask"
          @click.self="closeAll"
        >
          <div class="mh5-tg-h5-system" role="dialog" aria-modal="true" :aria-label="$t('选择来源')">
            <div class="mh5-tg-h5-system__card">
              <button
                v-for="source in TG_H5_SYSTEM_SOURCES"
                :key="source.key"
                type="button"
                class="mh5-tg-h5-system__item"
                @click="onSystemSource(source.key)"
              >
                <span class="mh5-tg-h5-system__glyph" :data-source="source.key" aria-hidden="true" />
                <span>{{ $t(source.label) }}</span>
              </button>
            </div>
            <button type="button" class="mh5-tg-h5-system__cancel" @click="closeAll">{{ $t('取消') }}</button>
          </div>
        </div>
      </Transition>

      <MobileChatFileSendFlow
        :open="stage === 'files'"
        start-at="files"
        pick-only
        @close="onFilePickerClose"
        @picked="onFilesPicked"
        @toast="showTip"
      />

      <!-- 3. iOS 系统相册 -->
      <Transition name="mh5-tg-h5-sheet">
        <div
          v-if="stage === 'picker'"
          class="mh5-tg-h5-picker"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('照片图库')"
        >
          <header class="mh5-tg-h5-picker__header">
            <button type="button" class="mh5-tg-h5-picker__round" :aria-label="$t('关闭')" @click="backFromPicker">
              ✕
            </button>
            <div class="mh5-tg-h5-picker__seg" role="tablist">
              <span class="mh5-tg-h5-picker__seg-item mh5-tg-h5-picker__seg-item--on">{{ $t('照片') }}</span>
              <span class="mh5-tg-h5-picker__seg-item">{{ $t('精选集') }}</span>
            </div>
            <button
              type="button"
              class="mh5-tg-h5-picker__confirm"
              :class="{ 'mh5-tg-h5-picker__confirm--on': canConfirmPicker }"
              :disabled="!canConfirmPicker"
              :aria-label="$t('完成')"
              @click="confirmPicker"
            >
              ✓
            </button>
          </header>

          <div class="mh5-tg-h5-picker__privacy">
            <strong>{{ $t('私密访问照片') }}</strong>
            <p>{{ $t('你的照片图库会在此处显示，但浏览器仅可访问你选定的项目。') }}</p>
          </div>

          <div class="mh5-tg-h5-picker__grid">
            <button
              v-for="item in pickerItems"
              :key="item.id"
              type="button"
              class="mh5-tg-h5-picker__cell"
              @click="togglePickerItem(item)"
            >
              <img :src="item.src" alt="" />
              <span
                class="mh5-tg-h5-picker__check"
                :class="{ 'mh5-tg-h5-picker__check--on': selectionOn(item.id) }"
              />
              <span v-if="item.type === 'video'" class="mh5-tg-h5-picker__duration">{{ item.duration }}</span>
            </button>
          </div>

          <footer class="mh5-tg-h5-picker__footer">
            <span class="mh5-tg-h5-picker__more">···</span>
            <div class="mh5-tg-h5-picker__summary">
              <strong v-if="selectedIds.length">{{ selectedIds.length }} 张照片</strong>
              <strong v-else>{{ $t('选择项目') }}</strong>
              <span>{{ $t('包含位置') }}</span>
            </div>
            <span class="mh5-tg-h5-picker__search" aria-hidden="true">⌕</span>
          </footer>
        </div>
      </Transition>

      <!-- 4. iOS 相机 -->
      <Transition name="mh5-tg-h5-sheet">
        <div
          v-if="stage === 'camera'"
          class="mh5-tg-h5-camera"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('相机')"
        >
          <div class="mh5-tg-h5-camera__top">
            <span class="mh5-tg-h5-camera__flash">A⚡</span>
          </div>
          <div class="mh5-tg-h5-camera__view">
            <img class="mh5-tg-h5-camera__preview" src="/images/discover/cover-4.jpg" :alt="$t('取景')" />
            <div class="mh5-tg-h5-camera__zoom">
              <button
                v-for="z in ['.5', '1x', '2']"
                :key="z"
                type="button"
                :class="{ 'is-on': zoom === z }"
                @click="zoom = z"
              >
                {{ z }}
              </button>
            </div>
          </div>
          <div class="mh5-tg-h5-camera__controls">
            <button
              type="button"
              class="mh5-tg-h5-camera__close"
              :aria-label="$t('关闭')"
              @click="startAt === 'camera' ? closeAll() : (stage = 'system')"
            >
              ✕
            </button>
            <button type="button" class="mh5-tg-h5-camera__shutter" :aria-label="$t('快门')" @click="capturePhoto" />
            <button type="button" class="mh5-tg-h5-camera__flip" :aria-label="$t('翻转')" @click="showTip('已切换摄像头')">
              ↺
            </button>
          </div>
          <div class="mh5-tg-h5-camera__mode">
            <button
              type="button"
              :class="{ 'is-on': cameraMode === 'video' }"
              @click="cameraMode = 'video'"
            >{{ $t('视频') }}</button>
            <button
              type="button"
              :class="{ 'is-on': cameraMode === 'photo' }"
              @click="cameraMode = 'photo'"
            >{{ $t('照片') }}</button>
          </div>
        </div>
      </Transition>

      <!-- 5. 发送预览卡 -->
      <Transition name="mh5-tg-h5-fade">
        <div
          v-if="stage === 'send'"
          class="mh5-tg-h5-flow__mask"
          @click.self="closeAll"
        >
          <div class="mh5-tg-h5-send" role="dialog" aria-modal="true" :aria-label="sendTitle" @click.stop>
            <header class="mh5-tg-h5-send__header">
              <button type="button" class="mh5-tg-h5-send__x" :aria-label="$t('关闭')" @click="closeAll">✕</button>
              <h2>{{ sendTitle }}</h2>
              <button type="button" class="mh5-tg-h5-send__more" :aria-label="$t('更多')" @click="moreOpen = !moreOpen">
                ⋮
              </button>
            </header>

            <div v-if="moreOpen" class="mh5-tg-h5-send__menu" role="menu">
              <button
                v-for="action in moreActions"
                :key="action.key"
                type="button"
                role="menuitem"
                class="mh5-tg-h5-send__menu-item"
                :class="{ 'mh5-tg-h5-send__menu-item--hd-on': action.key === 'hd' && hd }"
                @click="onMoreAction(action.key)"
              >
                <span
                  v-if="action.key === 'hd'"
                  class="mh5-tg-h5-send__hd-badge"
                  :class="{ 'mh5-tg-h5-send__hd-badge--on': hd }"
                  aria-hidden="true"
                >
                  HD
                </span>
                <span>{{ $t(action.label) }}</span>
              </button>
            </div>

            <div v-if="isFileSend" class="mh5-tg-h5-send__files">
              <div v-for="file in sendFiles" :key="file.id" class="mh5-tg-h5-send__file">
                <span class="mh5-tg-h5-send__file-badge" :style="{ background: chatFileKindTone(file.kind) }">
                  {{ file.ext }}
                </span>
                <div class="mh5-tg-h5-send__file-meta">
                  <strong>{{ file.name }}</strong>
                  <small>{{ file.sizeLabel }}</small>
                </div>
                <button
                  type="button"
                  class="mh5-tg-h5-send__file-trash"
                  :aria-label="$t('删除')"
                  @click="removeSendFile(file.id)"
                >
                  🗑
                </button>
              </div>
              <p
                v-if="filteredOversizeCount"
                class="mh5-tg-h5-send__filter"
                role="status"
              >
                {{ $t('已过滤 {n} 个超过 2GB 的文件', { n: filteredOversizeCount }) }}
              </p>
            </div>
            <div v-else class="mh5-tg-h5-send__grid">
              <div v-for="item in selectedItems" :key="item.id" class="mh5-tg-h5-send__thumb">
                <img :src="item.src" alt="" />
                <span v-if="item.type === 'video'" class="mh5-tg-h5-send__dur">{{ item.duration }}</span>
                <button
                  type="button"
                  class="mh5-tg-h5-send__trash"
                  :aria-label="$t('删除')"
                  @click="removeSendItem(item.id)"
                >
                  🗑
                </button>
              </div>
            </div>

            <footer class="mh5-tg-h5-send__footer">
              <div v-if="canCaption" class="mh5-tg-h5-send__caption">
                <span aria-hidden="true">☺</span>
                <input v-model="caption" type="text" :placeholder="$t('添加说明…')" enterkeyhint="send" />
              </div>
              <button type="button" class="mh5-tg-h5-send__btn" :aria-label="$t('发送')" @click="send">
                ➤
              </button>
            </footer>
          </div>
        </div>
      </Transition>

      <Transition name="mh5-tg-h5-fade">
        <div v-if="tip" class="mh5-tg-h5-tip">{{ tip }}</div>
      </Transition>
  </div>
</template>

<style scoped>
.mh5-tg-h5-flow {
  position: absolute;
  inset: 0;
  z-index: 80;
  overflow: hidden;
  pointer-events: none;
}

.mh5-tg-h5-flow > * {
  pointer-events: auto;
}

.mh5-tg-h5-flow__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgb(0 0 0 / 45%);
}

.mh5-tg-h5-flow__mask--soft {
  background: rgb(0 0 0 / 18%);
  align-items: flex-end;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}

.mh5-tg-h5-attach {
  width: min(280px, 100%);
  margin-right: auto;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 40px rgb(0 0 0 / 18%);
  overflow: hidden;
}

.mh5-tg-h5-attach__item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  font-size: 16px;
  color: #111;
  text-align: left;
}

.mh5-tg-h5-attach__item:last-child {
  border-bottom: 0;
}

.mh5-tg-h5-attach__icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: #8e8e93 center / 14px no-repeat;
}

.mh5-tg-h5-attach__icon[data-icon='photo'] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Ccircle cx='9' cy='10' r='1.5'/%3E%3Cpath d='M3 16l5-4 4 3 4-5 5 6'/%3E%3C/svg%3E");
}
.mh5-tg-h5-attach__icon[data-icon='file'] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Cpath d='M8 3h7l5 5v13H8z'/%3E%3Cpath d='M15 3v5h5'/%3E%3C/svg%3E");
}
.mh5-tg-h5-attach__icon[data-icon='poll'] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Cpath d='M5 19V9M12 19V5M19 19v-7'/%3E%3C/svg%3E");
}
.mh5-tg-h5-attach__icon[data-icon='check'] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M8 12l3 3 5-6'/%3E%3C/svg%3E");
}
.mh5-tg-h5-attach__icon[data-icon='date'] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Crect x='3' y='5' width='18' height='16' rx='2'/%3E%3Cpath d='M3 10h18M8 3v4M16 3v4'/%3E%3C/svg%3E");
}
.mh5-tg-h5-attach__icon[data-icon='article'] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Cpath d='M5 5h14v14H5z'/%3E%3Cpath d='M8 9h8M8 13h8M8 17h5'/%3E%3C/svg%3E");
}

.mh5-tg-h5-system {
  width: min(340px, 100%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.mh5-tg-h5-system__card {
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.mh5-tg-h5-system__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: 0;
  border-bottom: 1px solid #eee;
  background: #fff;
  font-size: 17px;
  color: #007aff;
  text-align: left;
}

.mh5-tg-h5-system__item:last-child {
  border-bottom: 0;
}

.mh5-tg-h5-system__glyph {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: #c7c7cc;
}

.mh5-tg-h5-system__glyph[data-source='library'] {
  background: linear-gradient(135deg, #ff9f0a, #ff375f);
}
.mh5-tg-h5-system__glyph[data-source='camera'] {
  background: #8e8e93;
}
.mh5-tg-h5-system__glyph[data-source='files'] {
  background: #5856d6;
}

.mh5-tg-h5-system__cancel {
  border: 0;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
  font-size: 17px;
  font-weight: 600;
  color: #007aff;
}

.mh5-tg-h5-picker {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: #f2f2f7;
}

.mh5-tg-h5-picker__header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
}

.mh5-tg-h5-picker__round,
.mh5-tg-h5-picker__confirm {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #e5e5ea;
  color: #111;
  font-size: 16px;
}

.mh5-tg-h5-picker__confirm--on {
  background: #007aff;
  color: #fff;
}

.mh5-tg-h5-picker__confirm:disabled {
  opacity: 0.45;
}

.mh5-tg-h5-picker__seg {
  display: flex;
  justify-self: center;
  padding: 3px;
  border-radius: 9px;
  background: #e5e5ea;
}

.mh5-tg-h5-picker__seg-item {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 13px;
  color: #3a3a3c;
}

.mh5-tg-h5-picker__seg-item--on {
  background: #fff;
  font-weight: 600;
}

.mh5-tg-h5-picker__privacy {
  margin: 10px 12px;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
}

.mh5-tg-h5-picker__privacy strong {
  display: block;
  font-size: 14px;
}

.mh5-tg-h5-picker__privacy p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8e8e93;
  line-height: 1.4;
}

.mh5-tg-h5-picker__grid {
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  padding: 0 0 80px;
  box-sizing: border-box;
}

.mh5-tg-h5-picker__cell {
  position: relative;
  min-width: 0;
  width: 100%;
  aspect-ratio: 1;
  border: 0;
  padding: 0;
  margin: 0;
  background: #ddd;
  box-sizing: border-box;
  overflow: hidden;
}

.mh5-tg-h5-picker__cell img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mh5-tg-h5-picker__check {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid #fff;
  background: rgb(0 0 0 / 25%);
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%);
}

.mh5-tg-h5-picker__check--on {
  background: #007aff;
  border-color: #fff;
}

.mh5-tg-h5-picker__check--on::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.mh5-tg-h5-picker__duration {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgb(0 0 0 / 55%);
  color: #fff;
  font-size: 11px;
}

.mh5-tg-h5-picker__footer {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 22px;
  background: rgb(255 255 255 / 88%);
  backdrop-filter: blur(12px);
}

.mh5-tg-h5-picker__summary {
  text-align: center;
}

.mh5-tg-h5-picker__summary strong {
  display: block;
  font-size: 14px;
}

.mh5-tg-h5-picker__summary span {
  font-size: 11px;
  color: #8e8e93;
}

.mh5-tg-h5-picker__more,
.mh5-tg-h5-picker__search {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #e5e5ea;
  font-size: 16px;
}

.mh5-tg-h5-camera {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #000;
  color: #fff;
}

.mh5-tg-h5-camera__top {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
}

.mh5-tg-h5-camera__view {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 0 0 8px;
  overflow: hidden;
}

.mh5-tg-h5-camera__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.1);
}

.mh5-tg-h5-camera__zoom {
  position: absolute;
  left: 50%;
  bottom: 16px;
  display: flex;
  gap: 8px;
  transform: translateX(-50%);
}

.mh5-tg-h5-camera__zoom button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: rgb(0 0 0 / 45%);
  color: #fff;
  font-size: 12px;
}

.mh5-tg-h5-camera__zoom button.is-on {
  background: #ffd60a;
  color: #111;
  font-weight: 700;
}

.mh5-tg-h5-camera__controls {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 28px 8px;
}

.mh5-tg-h5-camera__close,
.mh5-tg-h5-camera__flip {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 18%);
  color: #fff;
  font-size: 18px;
  justify-self: center;
}

.mh5-tg-h5-camera__shutter {
  width: 72px;
  height: 72px;
  border: 4px solid #fff;
  border-radius: 999px;
  background: #fff;
}

.mh5-tg-h5-camera__mode {
  display: flex;
  justify-content: center;
  gap: 18px;
  padding: 8px 0 calc(16px + env(safe-area-inset-bottom, 0px));
}

.mh5-tg-h5-camera__mode button {
  border: 0;
  background: transparent;
  color: #aeaeb2;
  font-size: 15px;
}

.mh5-tg-h5-camera__mode button.is-on {
  color: #ffd60a;
  font-weight: 700;
}

.mh5-tg-h5-send {
  position: relative;
  width: min(340px, 100%);
  margin: auto;
  border-radius: 18px;
  background: #fff;
  color: #111;
  box-shadow: 0 16px 48px rgb(0 0 0 / 28%);
  overflow: hidden;
}

.mh5-tg-h5-send__header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 12px 8px 8px;
}

.mh5-tg-h5-send__header h2 {
  margin: 0;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #111;
}

.mh5-tg-h5-send__x,
.mh5-tg-h5-send__more {
  border: 0;
  background: transparent;
  font-size: 18px;
  color: #8e8e93;
}

.mh5-tg-h5-send__menu {
  position: absolute;
  top: 48px;
  right: 10px;
  z-index: 2;
  min-width: 180px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgb(0 0 0 / 18%);
  overflow: hidden;
}

.mh5-tg-h5-send__menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid #f1f1f1;
  background: #fff;
  text-align: left;
  font-size: 14px;
  color: #111;
}

.mh5-tg-h5-send__menu-item:last-child {
  border-bottom: 0;
}

.mh5-tg-h5-send__hd-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  padding: 0 6px;
  border: 1.5px solid #bbb;
  border-radius: 6px;
  color: #888;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.mh5-tg-h5-send__hd-badge--on,
.mh5-tg-h5-send__menu-item--hd-on .mh5-tg-h5-send__hd-badge {
  border-color: #25d366;
  color: #25d366;
  background: rgb(37 211 102 / 10%);
}

.mh5-tg-h5-send__files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 12px 8px;
  max-height: 280px;
  overflow: auto;
}

.mh5-tg-h5-send__file {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7f7f8;
}

.mh5-tg-h5-send__file-badge {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.mh5-tg-h5-send__file-meta {
  min-width: 0;
  flex: 1;
}

.mh5-tg-h5-send__file-meta strong,
.mh5-tg-h5-send__file-meta small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mh5-tg-h5-send__file-meta strong {
  font-size: 15px;
  color: #111;
}

.mh5-tg-h5-send__file-meta small {
  margin-top: 2px;
  color: #8e8e93;
  font-size: 12px;
}

.mh5-tg-h5-send__filter {
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff4e5;
  font-size: 12px;
  line-height: 1.4;
  color: #9a5b00;
}

.mh5-tg-h5-send__file-trash {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-size: 14px;
}

.mh5-tg-h5-send__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px 12px 4px;
  max-height: 280px;
  overflow: auto;
}

.mh5-tg-h5-send__thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: #eee;
}

.mh5-tg-h5-send__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mh5-tg-h5-send__dur {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgb(0 0 0 / 55%);
  color: #fff;
  font-size: 11px;
}

.mh5-tg-h5-send__trash {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: rgb(0 0 0 / 45%);
  font-size: 12px;
}

.mh5-tg-h5-send__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px;
}

.mh5-tg-h5-send__caption {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 20px;
  background: #f2f2f7;
}

.mh5-tg-h5-send__caption input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font-size: 15px;
  outline: none;
}

.mh5-tg-h5-send__btn {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: #3390ec;
  color: #fff;
  font-size: 18px;
}

.mh5-tg-h5-tip {
  position: absolute;
  left: 50%;
  bottom: 100px;
  z-index: 90;
  transform: translateX(-50%);
  padding: 8px 14px;
  border-radius: 10px;
  background: rgb(0 0 0 / 78%);
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
}

.mh5-tg-h5-fade-enter-active,
.mh5-tg-h5-fade-leave-active,
.mh5-tg-h5-sheet-enter-active,
.mh5-tg-h5-sheet-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}

.mh5-tg-h5-fade-enter-from,
.mh5-tg-h5-fade-leave-to {
  opacity: 0;
}

.mh5-tg-h5-sheet-enter-from,
.mh5-tg-h5-sheet-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
