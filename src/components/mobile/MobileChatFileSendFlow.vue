<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  CHAT_GALLERY_ALBUMS,
  CHAT_GALLERY_ITEMS,
  galleryItemsForAlbum,
} from '../../constants/mobileChatGallery'
import {
  CHAT_FILE_BROWSE_LOCATIONS,
  CHAT_FILE_CAPTION_EMOJIS,
  CHAT_FILE_PICKER_TABS,
  CHAT_FILE_PREVIEW_LINES,
  CHAT_FILE_SOURCE_ACTIONS,
  CHAT_FILE_DOC_LIMIT_ALERT,
  CHAT_FILE_VIDEO_LIMIT_ALERT,
  chatFileKindLabel,
  chatFileKindTone,
  chatFileLocationLabel,
  chatFileNeedsPrepare,
  chatFileStem,
  filterChatFiles,
  galleryItemToChatFile,
  isChatFileOversize,
  isFileEntryItemOversize,
  type ChatFileAttachment,
  type ChatFileLocation,
  type ChatFilePickerTab,
  type ChatFileSendPayload,
} from '../../constants/mobileChatFileSend'

const props = withDefaults(
  defineProps<{
    open: boolean
    recipientName?: string
    draft?: string
    /** source：选择文档；files：直接打开系统文件弹层 */
    startAt?: 'source' | 'files'
    /** 勾选后「打开」只回传文件，不进入配文/快览 */
    pickOnly?: boolean
    /** H5：选择照片或视频走照片入口（系统相册），不走 App 文件相册 */
    useH5PhotoPicker?: boolean
  }>(),
  { recipientName: '', draft: '', startAt: 'source', pickOnly: false, useH5PhotoPicker: false },
)

const emit = defineEmits<{
  close: []
  send: [payload: ChatFileSendPayload]
  picked: [files: ChatFileAttachment[]]
  pickGallery: []
  toast: [text: string]
}>()

type Stage = 'source' | 'files' | 'gallery' | 'preview' | 'look' | 'preparing'
type GalleryTab = 'photos' | 'albums'

const MAX_FILES = 9
const stage = ref<Stage>('source')
const pickerTab = ref<ChatFilePickerTab>('recents')
const fileView = ref<'grid' | 'list'>('grid')
const search = ref('')
const browseLocation = ref<ChatFileLocation | null>(null)
const galleryTab = ref<GalleryTab>('photos')
const galleryAlbumId = ref('recents')
const galleryIds = ref<string[]>([])
const selectedIds = ref<string[]>([])
const previewFiles = ref<ChatFileAttachment[]>([])
const previewIndex = ref(0)
const caption = ref('')
const emojiOpen = ref(false)
const lookSendable = ref(false)
const lookListOpen = ref(false)
const limitAlert = ref('')
const lookDragX = ref(0)
const lookDragging = ref(false)
const lookStageEl = ref<HTMLElement | null>(null)
const prepareText = ref('正在准备影音内容...')
const videoPlaying = ref(false)
const playhead = ref(0)
let prepareTimer: ReturnType<typeof setTimeout> | null = null
let playRaf: number | null = null
let lookPointerX = 0
let lookPointerY = 0
let lookPointerActive = false
let lookPointerId: number | null = null

const fileList = computed(() =>
  pickerTab.value === 'shared'
    ? []
    : filterChatFiles(search.value, pickerTab.value === 'browse' ? browseLocation.value : null),
)

const selectableFiles = computed(() => fileList.value.filter((file) => !isChatFileOversize(file)))
const selectedCount = computed(() => selectedIds.value.length)
const allSelectableOn = computed(
  () => selectableFiles.value.length > 0 && selectableFiles.value.every((file) => selectedIds.value.includes(file.id)),
)

const galleryAlbumItems = computed(() => galleryItemsForAlbum(galleryAlbumId.value))
const gallerySelected = computed(() =>
  galleryIds.value
    .map((id) => CHAT_GALLERY_ITEMS.find((item) => item.id === id))
    .filter((item): item is (typeof CHAT_GALLERY_ITEMS)[number] => Boolean(item)),
)
const selectedGalleryFiles = computed(() =>
  gallerySelected.value.map((item, index) => galleryItemToChatFile(item, index)),
)
const canOpenGallery = computed(() => gallerySelected.value.length > 0)

const filesTitle = computed(() => {
  if (pickerTab.value === 'shared') return '共享'
  if (pickerTab.value === 'browse') {
    return browseLocation.value ? chatFileLocationLabel(browseLocation.value) : '浏览'
  }
  return '最近项目'
})

const previewFile = computed(() => previewFiles.value[previewIndex.value] ?? previewFiles.value[0] ?? null)
const previewLookName = computed(() => previewFile.value?.name.replace(/\.[^.]+$/, '') ?? '')
const isPreviewVideo = computed(() => previewFile.value?.kind === 'video')
const lookDurationSec = computed(() => parseDurationSec(previewFile.value?.duration))
const lookElapsedLabel = computed(() => formatClock(playhead.value * lookDurationSec.value))
const lookRemainLabel = computed(() => `-${formatClock((1 - playhead.value) * lookDurationSec.value)}`)
const recipientChip = computed(() => {
  const name = props.recipientName.trim()
  return name.slice(0, 2) || '我'
})
const lookCount = computed(() => previewFiles.value.length)
const canLookPrev = computed(() => lookCount.value > 1 && previewIndex.value > 0)
const canLookNext = computed(() => lookCount.value > 1 && previewIndex.value < lookCount.value - 1)
const lookPagerText = computed(() => `${previewIndex.value + 1} / ${lookCount.value}`)
const lookTrackStyle = computed(() => {
  const shift = `calc(${-previewIndex.value * 100}% + ${lookDragX.value}px)`
  return {
    transform: `translate3d(${shift}, 0, 0)`,
    transition: lookDragging.value ? 'none' : 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
  }
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      clearPrepare()
      return
    }
    resetFlow()
  },
)

watch([previewIndex, stage], () => {
  resetLookVideo()
})

onUnmounted(() => {
  stopLookVideo()
  clearPrepare()
})

function parseDurationSec(label?: string) {
  if (!label) return 4
  const parts = label.split(':').map((part) => Number(part))
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
    return Math.max(0.5, parts[0]! * 60 + parts[1]!)
  }
  return 4
}

function formatClock(sec: number) {
  const total = Math.max(0, Math.round(sec))
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, '0')}`
}

function stopLookVideo() {
  videoPlaying.value = false
  if (playRaf != null) {
    cancelAnimationFrame(playRaf)
    playRaf = null
  }
}

function resetLookVideo() {
  stopLookVideo()
  playhead.value = 0
}

function startLookVideo(from = playhead.value) {
  if (!isPreviewVideo.value) return
  stopLookVideo()
  const startAt = from >= 0.98 ? 0 : from
  playhead.value = startAt
  videoPlaying.value = true
  const startTs = performance.now()
  const durationMs = lookDurationSec.value * 1000 * (1 - startAt)
  const tick = (now: number) => {
    const t = Math.min(1, (now - startTs) / Math.max(durationMs, 80))
    playhead.value = startAt + (1 - startAt) * t
    if (t >= 1) {
      stopLookVideo()
      playhead.value = 0
      return
    }
    playRaf = requestAnimationFrame(tick)
  }
  playRaf = requestAnimationFrame(tick)
}

function toggleLookVideo() {
  if (!isPreviewVideo.value) return
  if (videoPlaying.value) {
    stopLookVideo()
    return
  }
  startLookVideo()
}

function skipLookVideo(sec: number) {
  if (!isPreviewVideo.value) return
  const next = Math.min(1, Math.max(0, playhead.value + sec / lookDurationSec.value))
  playhead.value = next
  if (videoPlaying.value) startLookVideo(next)
}

function resetFlow() {
  clearPrepare()
  resetLookVideo()
  stage.value = props.startAt === 'files' ? 'files' : 'source'
  pickerTab.value = 'recents'
  fileView.value = 'grid'
  search.value = ''
  browseLocation.value = null
  galleryTab.value = 'photos'
  galleryAlbumId.value = 'recents'
  galleryIds.value = []
  selectedIds.value = []
  previewFiles.value = []
  previewIndex.value = 0
  lookSendable.value = false
  lookListOpen.value = false
  lookDragX.value = 0
  lookDragging.value = false
  limitAlert.value = ''
  caption.value = props.draft.trim()
  emojiOpen.value = false
  prepareText.value = '正在准备影音内容...'
}

function clearPrepare() {
  if (prepareTimer) {
    clearTimeout(prepareTimer)
    prepareTimer = null
  }
}

function closeAll() {
  emit('close')
}

function onOverlayClick() {
  if (stage.value === 'source' || stage.value === 'files') {
    closeAll()
    return
  }
  if (stage.value === 'gallery') backToSource()
}

function onSource(key: string) {
  if (key === 'files') {
    pickerTab.value = 'recents'
    search.value = ''
    browseLocation.value = null
    selectedIds.value = []
    stage.value = 'files'
    return
  }
  if (key === 'gallery') {
    if (props.useH5PhotoPicker) {
      emit('pickGallery')
      return
    }
    galleryIds.value = []
    galleryTab.value = 'photos'
    galleryAlbumId.value = 'recents'
    stage.value = 'gallery'
  }
}

function backToSource() {
  if (props.pickOnly || props.startAt === 'files') {
    closeAll()
    return
  }
  stage.value = 'source'
  search.value = ''
  browseLocation.value = null
  galleryIds.value = []
  selectedIds.value = []
}

function backToPicker() {
  if (previewFiles.value.some((file) => file.id.startsWith('gal-file-'))) {
    stage.value = 'gallery'
    return
  }
  stage.value = 'files'
}

function isFileOn(id: string) {
  return selectedIds.value.includes(id)
}

function showLimitAlert(text: string) {
  limitAlert.value = text
}

function toggleFile(file: ChatFileAttachment) {
  if (isChatFileOversize(file)) {
    showLimitAlert(file.kind === 'video' ? CHAT_FILE_VIDEO_LIMIT_ALERT : CHAT_FILE_DOC_LIMIT_ALERT)
    return
  }
  if (isFileOn(file.id)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== file.id)
    return
  }
  if (selectedIds.value.length >= MAX_FILES) {
    emit('toast', '最多选择 9 项')
    return
  }
  selectedIds.value = [...selectedIds.value, file.id]
}

function selectAllFiles() {
  const next = selectableFiles.value.slice(0, MAX_FILES).map((file) => file.id)
  selectedIds.value = next
  if (selectableFiles.value.length > MAX_FILES) emit('toast', '最多选择 9 项')
}

function deselectAllFiles() {
  selectedIds.value = []
}

function openSelectedFiles() {
  const picked = selectedIds.value
    .map((id) => fileList.value.find((item) => item.id === id))
    .filter((item): item is ChatFileAttachment => Boolean(item))
  const files = picked.filter((file) => !isChatFileOversize(file))
  if (picked.some((file) => isChatFileOversize(file))) {
    selectedIds.value = files.map((file) => file.id)
    showLimitAlert(
      picked.some((file) => file.kind === 'video' && isChatFileOversize(file))
        ? CHAT_FILE_VIDEO_LIMIT_ALERT
        : CHAT_FILE_DOC_LIMIT_ALERT,
    )
    return
  }
  if (!files.length) return
  if (props.pickOnly) {
    emit('picked', files)
    return
  }
  if (files.length === 1) {
    enterPreview(files)
    return
  }
  enterLook(files, true)
}

function galleryOrder(id: string) {
  const idx = galleryIds.value.indexOf(id)
  return idx >= 0 ? idx + 1 : 0
}

function toggleGallery(id: string) {
  if (galleryIds.value.includes(id)) {
    galleryIds.value = galleryIds.value.filter((item) => item !== id)
    return
  }
  const item = CHAT_GALLERY_ITEMS.find((entry) => entry.id === id)
  if (item && isFileEntryItemOversize(item)) {
    showLimitAlert(item.type === 'video' ? CHAT_FILE_VIDEO_LIMIT_ALERT : CHAT_FILE_DOC_LIMIT_ALERT)
    return
  }
  if (galleryIds.value.length >= MAX_FILES) {
    emit('toast', '最多选择 9 项')
    return
  }
  galleryIds.value = [...galleryIds.value, id]
}

function openGalleryAlbum(id: string) {
  galleryAlbumId.value = id
  galleryTab.value = 'photos'
}

function enterLook(files: ChatFileAttachment[], sendable: boolean, startId?: string) {
  previewFiles.value = files
  lookSendable.value = sendable
  const idx = startId ? galleryIds.value.indexOf(startId) : 0
  previewIndex.value = idx >= 0 ? idx : 0
  if (!caption.value) caption.value = props.draft.trim()
  resetLookVideo()
  stage.value = 'look'
}

function reviewSelectedGallery(fromId?: string) {
  if (!canOpenGallery.value) return
  enterLook(selectedGalleryFiles.value, false, fromId)
}

function openSelectedGallery() {
  if (!canOpenGallery.value) return
  const files = selectedGalleryFiles.value
  if (files.length === 1) {
    enterPreview(files)
    return
  }
  enterLook(files, true)
}

function onLookPointerDown(event: PointerEvent) {
  lookListOpen.value = false
  lookPointerActive = true
  lookDragging.value = false
  lookPointerX = event.clientX
  lookPointerY = event.clientY
  lookPointerId = event.pointerId
  lookDragX.value = 0
}

function onLookPointerMove(event: PointerEvent) {
  if (!lookPointerActive || lookCount.value <= 1) return
  const dx = event.clientX - lookPointerX
  const dy = event.clientY - lookPointerY
  if (!lookDragging.value) {
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return
    if (Math.abs(dy) >= Math.abs(dx)) {
      lookPointerActive = false
      return
    }
    lookDragging.value = true
    try {
      lookStageEl.value?.setPointerCapture?.(event.pointerId)
    } catch {
      /* 合成指针或未捕获时忽略 */
    }
  }
  const atStart = previewIndex.value <= 0 && dx > 0
  const atEnd = previewIndex.value >= lookCount.value - 1 && dx < 0
  lookDragX.value = atStart || atEnd ? dx * 0.26 : dx
}

function onLookPointerUp(event: PointerEvent) {
  if (!lookPointerActive && !lookDragging.value) return
  const dx = event.clientX - lookPointerX
  const wasDrag = lookDragging.value
  lookPointerActive = false
  lookDragging.value = false
  if (lookPointerId != null) {
    lookStageEl.value?.releasePointerCapture?.(lookPointerId)
    lookPointerId = null
  }
  if (wasDrag) {
    const width = lookStageEl.value?.clientWidth || 320
    if (dx > Math.max(48, width * 0.16)) shiftPreview(-1)
    else if (dx < -Math.max(48, width * 0.16)) shiftPreview(1)
    lookDragX.value = 0
    return
  }
  lookDragX.value = 0
  if (isPreviewVideo.value) toggleLookVideo()
}

function jumpLook(index: number) {
  if (index < 0 || index >= lookCount.value) return
  previewIndex.value = index
  lookListOpen.value = false
  lookDragX.value = 0
}

function toggleLookList() {
  if (lookCount.value <= 1) return
  lookListOpen.value = !lookListOpen.value
}

function enterPreview(files: ChatFileAttachment[]) {
  previewFiles.value = files
  previewIndex.value = 0
  emojiOpen.value = false
  if (!caption.value) caption.value = props.draft.trim()
  stage.value = 'preview'
}

function insertEmoji(emoji: string) {
  caption.value += emoji
}

function confirmLook() {
  dispatchFiles(previewFiles.value, '')
}

function shiftPreview(step: number) {
  const total = previewFiles.value.length
  if (total <= 1) return
  previewIndex.value = Math.min(total - 1, Math.max(0, previewIndex.value + step))
}

function onCaptionEnter(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return
  confirmPreview()
}

function confirmPreview() {
  const text = caption.value.trim() || props.draft.trim()
  dispatchFiles(previewFiles.value, text)
}

function dispatchFiles(files: ChatFileAttachment[], text: string) {
  const allowed = files.filter((file) => !isChatFileOversize(file))
  if (allowed.length !== files.length) {
    showLimitAlert(
      files.some((file) => file.kind === 'video' && isChatFileOversize(file))
        ? CHAT_FILE_VIDEO_LIMIT_ALERT
        : CHAT_FILE_DOC_LIMIT_ALERT,
    )
    return
  }
  const needPrepare = allowed.some((file) => chatFileNeedsPrepare(file))
  if (!needPrepare) {
    emit('send', { files: allowed, caption: text })
    return
  }
  prepareText.value = allowed.every((file) => file.kind !== 'video' && file.ext !== 'MP4' && file.ext !== 'MOV')
    ? '正在准备文档...'
    : '正在准备影音内容...'
  stage.value = 'preparing'
  clearPrepare()
  prepareTimer = setTimeout(() => {
    emit('send', { files: allowed, caption: text })
  }, 1100)
}

function fileTone(file: ChatFileAttachment) {
  return chatFileKindTone(file.kind)
}

function isDocPreview(file: ChatFileAttachment) {
  return file.kind === 'pdf' || file.kind === 'doc' || file.kind === 'sheet'
}
</script>

<template>
  <Transition name="mh5-chat-file">
    <div
      v-if="open"
      class="mh5-chat-file"
      :class="`mh5-chat-file--${stage}`"
      @click.self="onOverlayClick"
    >
      <!-- 选择文档 -->
      <div
        v-if="stage === 'source'"
        class="mh5-chat-file-sheet"
        role="dialog"
        aria-label="选择文档"
        @click.stop
      >
        <header class="mh5-chat-file-sheet__head">
          <div>
            <h2>{{ $t('选择文档') }}</h2>
            <p>{{ $t('发送原始文件 (大小上限为 2 GB)。') }}</p>
          </div>
          <button type="button" class="mh5-chat-file-sheet__close" aria-label="关闭" @click="closeAll">
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="mh5-chat-file-sheet__list">
          <button
            v-for="action in CHAT_FILE_SOURCE_ACTIONS"
            :key="action.key"
            type="button"
            class="mh5-chat-file-sheet__item"
            @click="onSource(action.key)"
          >
            <span>{{ $t(action.label) }}</span>
            <span class="mh5-chat-file-sheet__glyph" :data-icon="action.icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- 系统文件（iOS 弹层勾选） -->
      <section v-else-if="stage === 'files'" class="mh5-chat-file-picker mh5-chat-file-picker--sheet" @click.stop>
        <span class="mh5-chat-file-picker__grab" aria-hidden="true" />
        <header class="mh5-chat-file-picker__bar">
          <button
            v-if="browseLocation"
            type="button"
            class="mh5-chat-file-picker__back"
            aria-label="返回"
            @click="browseLocation = null"
          >
            ‹
          </button>
          <span v-else class="mh5-chat-file-picker__spacer" />
          <h2>{{ $t(filesTitle) }}</h2>
          <div class="mh5-chat-file-picker__tools">
            <button
              type="button"
              class="mh5-chat-file-picker__tool"
              :aria-label="fileView === 'grid' ? '切换为列表' : '切换为网格'"
              @click="fileView = fileView === 'grid' ? 'list' : 'grid'"
            >
              <span class="mh5-chat-file-picker__view" :data-view="fileView" />
            </button>
            <button
              v-if="selectedCount"
              type="button"
              class="mh5-chat-file-picker__open"
              @click="openSelectedFiles"
            >
              {{ $t('打开') }}
            </button>
            <button type="button" class="mh5-chat-file-picker__cancel" @click="closeAll">{{ $t('取消') }}</button>
          </div>
        </header>
        <label class="mh5-chat-file-picker__search">
          <span class="mh5-chat-file-picker__search-icon" aria-hidden="true" />
          <input v-model="search" type="search" :placeholder="$t('搜索')" enterkeyhint="search" />
        </label>

        <div v-if="pickerTab === 'browse' && !browseLocation" class="mh5-chat-file-browse">
          <button
            v-for="loc in CHAT_FILE_BROWSE_LOCATIONS"
            :key="loc.key"
            type="button"
            class="mh5-chat-file-browse__item"
            @click="browseLocation = loc.key"
          >
            <span class="mh5-chat-file-browse__icon" />
            <span>
              <strong>{{ loc.label }}</strong>
              <small>{{ loc.hint }}</small>
            </span>
          </button>
        </div>

        <p v-else-if="pickerTab === 'shared'" class="mh5-chat-file-empty">{{ $t('暂无共享文件') }}</p>
        <p v-else-if="!fileList.length" class="mh5-chat-file-empty">{{ $t('未找到相关文件') }}</p>

        <div
          v-else
          class="mh5-chat-file-grid"
          :class="`mh5-chat-file-grid--${fileView}`"
        >
          <button
            v-for="file in fileList"
            :key="file.id"
            type="button"
            class="mh5-chat-file-card"
            :class="{ 'is-on': isFileOn(file.id), 'is-oversize': isChatFileOversize(file) }"
            :aria-pressed="isFileOn(file.id)"
            @click="toggleFile(file)"
          >
            <span class="mh5-chat-file-card__thumb">
              <img v-if="file.thumb" :src="file.thumb" alt="" />
              <span v-else class="mh5-chat-file-badge" :style="{ background: fileTone(file) }">
                {{ file.ext }}
              </span>
              <span v-if="fileView === 'grid'" class="mh5-chat-file-card__size">{{ file.sizeLabel }}</span>
              <span class="mh5-chat-file-card__check" aria-hidden="true" />
            </span>
            <span class="mh5-chat-file-card__meta">
              <strong>{{ chatFileStem(file.name) }}</strong>
              <small>{{ file.dateLabel }}</small>
              <small v-if="fileView === 'list'">{{ file.sizeLabel }}</small>
            </span>
          </button>
        </div>

        <footer class="mh5-chat-file-selectbar">
          <button
            type="button"
            class="mh5-chat-file-selectbar__btn"
            :disabled="!selectableFiles.length || allSelectableOn"
            @click="selectAllFiles"
          >
            {{ $t('全选') }}
          </button>
          <span v-if="selectedCount" class="mh5-chat-file-selectbar__count">已选 {{ selectedCount }} 项</span>
          <button
            type="button"
            class="mh5-chat-file-selectbar__btn"
            :disabled="!selectedCount"
            @click="deselectAllFiles"
          >
            {{ $t('取消全选') }}
          </button>
        </footer>

        <nav class="mh5-chat-file-tabs" aria-label="文件位置">
          <button
            v-for="tab in CHAT_FILE_PICKER_TABS"
            :key="tab.key"
            type="button"
            class="mh5-chat-file-tabs__item"
            :class="{ 'is-active': pickerTab === tab.key }"
            @click="pickerTab = tab.key; browseLocation = null; search = ''"
          >
            <span class="mh5-chat-file-tabs__icon" :data-tab="tab.key" />
            {{ $t(tab.label) }}
          </button>
        </nav>
      </section>

      <!-- 照片或视频 · 复用照片入口同一套选图弹层 -->
      <section
        v-else-if="stage === 'gallery'"
        class="mh5-media-picker__sheet mh5-chat-file-picker--gallery"
        role="dialog"
        aria-label="选择照片或视频"
        @click.stop
      >
        <div class="mh5-media-picker__handle" aria-hidden="true" />
        <header class="mh5-media-picker__header">
          <button type="button" class="mh5-media-picker__icon-btn" aria-label="关闭" @click="backToSource">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="#111" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
          <div class="mh5-media-picker__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              class="mh5-media-picker__tab"
              :class="{ 'mh5-media-picker__tab--active': galleryTab === 'photos' }"
              :aria-selected="galleryTab === 'photos'"
              @click="galleryTab = 'photos'"
            >
              {{ $t('照片') }}
            </button>
            <button
              type="button"
              role="tab"
              class="mh5-media-picker__tab"
              :class="{ 'mh5-media-picker__tab--active': galleryTab === 'albums' }"
              :aria-selected="galleryTab === 'albums'"
              @click="galleryTab = 'albums'"
            >
              {{ $t('相册') }}
            </button>
          </div>
          <span class="mh5-chat-file-picker__spacer" aria-hidden="true" />
        </header>

        <main v-if="galleryTab === 'photos'" class="mh5-media-picker__grid">
          <button
            v-for="item in galleryAlbumItems"
            :key="item.id"
            type="button"
            class="mh5-media-picker__cell"
            :class="{ 'mh5-media-picker__cell--selected': galleryOrder(item.id) > 0 }"
            @click="toggleGallery(item.id)"
          >
            <img :src="item.src" :alt="item.type === 'video' ? '视频' : '照片'" />
            <span v-if="item.type === 'video'" class="mh5-media-picker__duration">{{ item.duration }}</span>
            <span
              class="mh5-media-picker__badge"
              :class="{ 'mh5-media-picker__badge--on': galleryOrder(item.id) > 0 }"
            >
              {{ galleryOrder(item.id) || '' }}
            </span>
          </button>
        </main>
        <main v-else class="mh5-media-picker__albums">
          <button
            v-for="album in CHAT_GALLERY_ALBUMS"
            :key="album.id"
            type="button"
            class="mh5-media-picker__album"
            @click="openGalleryAlbum(album.id)"
          >
            <img :src="album.cover" :alt="album.name" />
            <div>
              <strong>{{ $t(album.name) }}</strong>
              <span>{{ album.count }}</span>
            </div>
          </button>
        </main>

        <footer v-if="canOpenGallery" class="mh5-chat-file-gallerybar">
          <button
            type="button"
            class="mh5-chat-file-gallerybar__btn"
            @click="reviewSelectedGallery()"
          >
            {{ $t('预览') }}
          </button>
          <div class="mh5-chat-file-gallerybar__thumbs" aria-label="已选预览">
            <button
              v-for="item in gallerySelected"
              :key="item.id"
              type="button"
              class="mh5-chat-file-gallerybar__thumb"
              :aria-label="item.type === 'video' ? '视频' : '照片'"
              @click="reviewSelectedGallery(item.id)"
            >
              <img :src="item.src" alt="" />
            </button>
          </div>
          <button
            type="button"
            class="mh5-chat-file-gallerybar__btn mh5-chat-file-gallerybar__next"
            @click="openSelectedGallery"
          >
            {{ $t('下一步') }}
          </button>
        </footer>
      </section>

      <!-- 多选快览 / 预览：左右滑 + 播视频 -->
      <section v-else-if="stage === 'look' && previewFile" class="mh5-chat-file-look" @click.stop>
        <header class="mh5-chat-file-look__bar">
          <div class="mh5-chat-file-look__left">
            <button type="button" class="mh5-chat-file-look__icon" aria-label="已选列表" @click="backToPicker">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 7h11M8 12h11M8 17h11" stroke="#111" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="4.2" cy="7" r="1.2" fill="#111" />
                <circle cx="4.2" cy="12" r="1.2" fill="#111" />
                <circle cx="4.2" cy="17" r="1.2" fill="#111" />
              </svg>
            </button>
            <button type="button" class="mh5-chat-file-look__icon" aria-label="关闭" @click="backToPicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="#111" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            class="mh5-chat-file-look__name"
            :class="{ 'is-open': lookListOpen }"
            :aria-expanded="lookListOpen"
            :disabled="lookCount <= 1"
            @click="toggleLookList"
          >
            {{ previewLookName }}
            <span v-if="lookCount > 1" aria-hidden="true">▾</span>
          </button>
          <button
            v-if="lookSendable"
            type="button"
            class="mh5-chat-file-look__send"
            @click="confirmLook"
          >
            {{ $t('发送') }}
          </button>
          <span v-else class="mh5-chat-file-look__pad" />
        </header>

        <div v-if="lookListOpen && lookCount > 1" class="mh5-chat-file-look__list">
          <button
            v-for="(file, index) in previewFiles"
            :key="file.id"
            type="button"
            :class="{ 'is-current': index === previewIndex }"
            @click="jumpLook(index)"
          >
            <span>{{ chatFileStem(file.name) }}</span>
            <small>{{ file.ext }} · {{ file.sizeLabel }}</small>
          </button>
        </div>

        <div
          ref="lookStageEl"
          class="mh5-chat-file-look__stage"
          :class="{ 'is-swiping': lookDragging }"
          @pointerdown="onLookPointerDown"
          @pointermove="onLookPointerMove"
          @pointerup="onLookPointerUp"
          @pointercancel="onLookPointerUp"
        >
          <div class="mh5-chat-file-look__reel" :style="lookTrackStyle">
            <div v-for="file in previewFiles" :key="file.id" class="mh5-chat-file-look__slide">
              <article v-if="isDocPreview(file)" class="mh5-chat-file-look__paper">
                <h3>{{ chatFileStem(file.name) }}</h3>
                <ol>
                  <li v-for="line in CHAT_FILE_PREVIEW_LINES" :key="`${file.id}-${line}`">{{ line }}</li>
                </ol>
              </article>
              <img
                v-else-if="file.thumb"
                class="mh5-chat-file-look__media"
                :src="file.thumb"
                :alt="file.name"
                draggable="false"
              />
              <div v-else class="mh5-chat-file-look__fallback">
                <p class="mh5-chat-file-look__title">{{ chatFileStem(file.name) }}</p>
                <p class="mh5-chat-file-look__kind">{{ $t(chatFileKindLabel(file.kind)) }}</p>
                <p class="mh5-chat-file-look__size">{{ file.sizeLabel }}</p>
              </div>
            </div>
          </div>

          <button
            v-if="canLookPrev"
            type="button"
            class="mh5-chat-file-look__nav mh5-chat-file-look__nav--prev"
            :aria-label="$t('上一张')"
            @pointerdown.stop
            @click.stop="shiftPreview(-1)"
          >
            ‹
          </button>
          <button
            v-if="canLookNext"
            type="button"
            class="mh5-chat-file-look__nav mh5-chat-file-look__nav--next"
            :aria-label="$t('下一张')"
            @pointerdown.stop
            @click.stop="shiftPreview(1)"
          >
            ›
          </button>
          <p v-if="lookCount > 1" class="mh5-chat-file-look__pager">{{ lookPagerText }}</p>

          <template v-if="isPreviewVideo">
            <div class="mh5-chat-file-look__transport">
              <button
                type="button"
                class="mh5-chat-file-look__skip"
                aria-label="后退10秒"
                @pointerdown.stop
                @click.stop="skipLookVideo(-10)"
              >
                <span>10</span>
              </button>
              <button
                v-show="!videoPlaying"
                type="button"
                class="mh5-chat-file-look__play"
                aria-label="播放"
                @pointerdown.stop
                @click.stop="toggleLookVideo"
              >
                ▶
              </button>
              <span v-show="videoPlaying" class="mh5-chat-file-look__play-gap" />
              <button
                type="button"
                class="mh5-chat-file-look__skip mh5-chat-file-look__skip--fwd"
                aria-label="前进10秒"
                @pointerdown.stop
                @click.stop="skipLookVideo(10)"
              >
                <span>10</span>
              </button>
            </div>
            <button
              type="button"
              class="mh5-chat-file-look__more"
              aria-label="更多"
              @pointerdown.stop
              @click.stop
            >
              ···
            </button>
            <div class="mh5-chat-file-look__progress" @pointerdown.stop @click.stop>
              <span>{{ lookElapsedLabel }}</span>
              <div class="mh5-chat-file-look__track">
                <i :style="{ width: `${playhead * 100}%` }" />
              </div>
              <span>{{ lookRemainLabel }}</span>
            </div>
          </template>
        </div>

        <footer class="mh5-chat-file-look__dock">
          <button type="button" class="mh5-chat-file-look__share" aria-label="分享" @click="emit('toast', '分享（原型演示）')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 4v11M8.2 7.6 12 3.8l3.8 3.8"
                stroke="#111"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 13.2v5.4A1.6 1.6 0 0 0 7.6 20.2h8.8A1.6 1.6 0 0 0 18 18.6v-5.4"
                stroke="#111"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </footer>
      </section>

      <!-- 配文预览（对齐图文发送下一步） -->
      <section v-else-if="stage === 'preview' && previewFile" class="mh5-chat-file-preview" @click.stop>
        <header class="mh5-chat-file-preview__bar">
          <button type="button" class="mh5-chat-file-preview__close" aria-label="关闭" @click="backToPicker">
            ×
          </button>
          <h2>{{ previewFile.name }}</h2>
          <span class="mh5-chat-file-preview__pad" />
        </header>

        <div class="mh5-chat-file-preview__stage">
          <button
            v-if="previewFiles.length > 1"
            type="button"
            class="mh5-chat-file-preview__nav mh5-chat-file-preview__nav--prev"
            aria-label="上一张"
            @click="shiftPreview(-1)"
          >
            ‹
          </button>
          <article v-if="isDocPreview(previewFile)" class="mh5-chat-file-preview__paper">
            <h3>{{ previewFile.name.replace(/\.[^.]+$/, '') }}</h3>
            <ol>
              <li v-for="line in CHAT_FILE_PREVIEW_LINES" :key="line">{{ line }}</li>
            </ol>
          </article>
          <div v-else-if="previewFile.thumb" class="mh5-chat-file-preview__media" @click="isPreviewVideo && toggleLookVideo()">
            <img :src="previewFile.thumb" :alt="previewFile.name" />
            <span v-if="isPreviewVideo && !videoPlaying" class="mh5-chat-file-preview__play">▶</span>
          </div>
          <div v-else class="mh5-chat-file-preview__fallback">
            <span class="mh5-chat-file-badge" :style="{ background: fileTone(previewFile) }">{{ previewFile.ext }}</span>
            <p>{{ previewFile.name }}</p>
            <small>{{ previewFile.sizeLabel }}</small>
          </div>
          <button
            v-if="previewFiles.length > 1"
            type="button"
            class="mh5-chat-file-preview__nav mh5-chat-file-preview__nav--next"
            aria-label="下一张"
            @click="shiftPreview(1)"
          >
            ›
          </button>
        </div>

        <div class="mh5-chat-file-preview__caption">
          <div class="mh5-chat-file-preview__input-wrap">
            <input
              v-model="caption"
              class="mh5-chat-file-preview__input"
              type="text"
              :placeholder="$t('添加配文...')"
              enterkeyhint="send"
              @keydown.enter.prevent="onCaptionEnter"
            />
            <button
              type="button"
              class="mh5-chat-file-preview__emoji"
              aria-label="表情"
              :aria-expanded="emojiOpen"
              @click="emojiOpen = !emojiOpen"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.2" stroke="#fff" stroke-width="1.7" />
                <circle cx="9.2" cy="10.2" r="1" fill="#fff" />
                <circle cx="14.8" cy="10.2" r="1" fill="#fff" />
                <path d="M8.6 14.2c1 .9 2.2 1.4 3.4 1.4s2.4-.5 3.4-1.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <div v-if="emojiOpen" class="mh5-chat-file-preview__emoji-panel" role="listbox" aria-label="表情">
            <button
              v-for="item in CHAT_FILE_CAPTION_EMOJIS"
              :key="item"
              type="button"
              class="mh5-chat-file-preview__emoji-item"
              @click="insertEmoji(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>
        <footer class="mh5-chat-file-preview__footer">
          <span class="mh5-chat-file-preview__chip">{{ recipientChip }}</span>
          <button type="button" class="mh5-chat-file-preview__send" aria-label="发送" @click="confirmPreview">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12l16-8-6 16-2.5-7.5L4 12z" fill="#fff" />
            </svg>
          </button>
        </footer>
      </section>

      <!-- 准备中 -->
      <div v-else class="mh5-chat-file-prepare" role="status" aria-live="polite">
        <div class="mh5-chat-file-prepare__card">
          <p>{{ $t(prepareText) }}</p>
          <span class="mh5-chat-file-prepare__spin" />
        </div>
      </div>

      <div v-if="limitAlert" class="mh5-chat-limit" @click.stop>
        <div class="mh5-chat-limit__card" role="alertdialog" aria-modal="true">
          <p>{{ $t(limitAlert) }}</p>
          <button type="button" @click="limitAlert = ''">{{ $t('确定') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
