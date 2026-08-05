<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  CHAT_GALLERY_ALBUMS,
  CHAT_GALLERY_ITEMS,
  createCameraCaptureItem,
  galleryItemsForAlbum,
  type ChatMediaSendPayload,
  type GalleryMediaItem,
} from '../../constants/mobileChatGallery'
import { CHAT_ROOM_ASSETS } from '../../constants/mobileChatRoomAssets'

const props = withDefaults(
  defineProps<{
    open: boolean
    recipientName: string
    /** gallery：相册选图；camera：WhatsApp 全屏相机 */
    startAt?: 'gallery' | 'camera'
  }>(),
  { startAt: 'gallery' },
)

const emit = defineEmits<{
  close: []
  send: [payload: ChatMediaSendPayload]
}>()

type Stage = 'gallery' | 'camera' | 'preview'
type GalleryTab = 'photos' | 'albums'
type CameraMode = 'photo' | 'video'
type FlashMode = 'off' | 'auto' | 'on'

const stage = ref<Stage>('gallery')
const tab = ref<GalleryTab>('photos')
const albumId = ref('recents')
const hd = ref(false)
const caption = ref('')
const selectedIds = ref<string[]>([])
/** 相机快门生成的媒体（不在静态图库列表内） */
const capturedItems = ref<GalleryMediaItem[]>([])
const previewIndex = ref(0)
const toast = ref('')
const videoPlaying = ref(false)
const videoMuted = ref(true)
/** 从相机入口进入；预览关闭时回到相机 */
const fromCamera = ref(false)
const cameraMode = ref<CameraMode>('photo')
const flash = ref<FlashMode>('auto')
const captureCount = ref(0)
/** 播放块位置 0~1 */
const playhead = ref(0)
let toastTimer: ReturnType<typeof setTimeout> | null = null
let playRaf: number | null = null

const albumItems = computed(() => galleryItemsForAlbum(albumId.value))
/** 相机底部最近项目缩略条 */
const recentStrip = computed(() => CHAT_GALLERY_ITEMS.slice(0, 8))

function resolveItem(id: string) {
  return (
    capturedItems.value.find((item) => item.id === id) ??
    CHAT_GALLERY_ITEMS.find((item) => item.id === id)
  )
}

const selectedItems = computed(() =>
  selectedIds.value
    .map((id) => resolveItem(id))
    .filter((item): item is GalleryMediaItem => Boolean(item)),
)

const previewItem = computed(() => selectedItems.value[previewIndex.value] ?? selectedItems.value[0] ?? null)
const canSend = computed(() => selectedItems.value.length > 0)
const isPreviewVideo = computed(() => previewItem.value?.type === 'video')
const flashLabel = computed(() => {
  if (flash.value === 'on') return '开'
  if (flash.value === 'off') return '关'
  return '自动'
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetVideoUi()
      return
    }
    resetState()
  },
)

watch(
  () => props.startAt,
  () => {
    if (props.open) resetState()
  },
)

watch([previewIndex, stage], () => {
  resetVideoUi()
})

onUnmounted(() => {
  stopVideoPlayback()
})

function parseDurationSec(label?: string) {
  if (!label) return 4
  const parts = label.split(':').map((p) => Number(p))
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
    return Math.max(0.5, parts[0]! * 60 + parts[1]!)
  }
  return 4
}

function stopVideoPlayback() {
  videoPlaying.value = false
  if (playRaf != null) {
    cancelAnimationFrame(playRaf)
    playRaf = null
  }
}

function resetVideoUi() {
  stopVideoPlayback()
  playhead.value = 0
  videoMuted.value = true
}

function toggleVideoPlayback() {
  if (!isPreviewVideo.value) return
  if (videoPlaying.value) {
    stopVideoPlayback()
    return
  }

  videoPlaying.value = true
  const startAt = playhead.value >= 0.98 ? 0 : playhead.value
  playhead.value = startAt
  const startTs = performance.now()
  const durationMs = parseDurationSec(previewItem.value?.duration) * 1000 * (1 - startAt)

  const tick = (now: number) => {
    const t = Math.min(1, (now - startTs) / Math.max(durationMs, 80))
    playhead.value = startAt + (1 - startAt) * t
    if (t >= 1) {
      stopVideoPlayback()
      playhead.value = 0
      return
    }
    playRaf = requestAnimationFrame(tick)
  }
  playRaf = requestAnimationFrame(tick)
}

function onStageClick() {
  if (isPreviewVideo.value) toggleVideoPlayback()
}

function resetState() {
  const startCamera = props.startAt === 'camera'
  stage.value = startCamera ? 'camera' : 'gallery'
  fromCamera.value = startCamera
  tab.value = 'photos'
  albumId.value = 'recents'
  hd.value = false
  caption.value = ''
  selectedIds.value = []
  capturedItems.value = []
  previewIndex.value = 0
  cameraMode.value = 'photo'
  flash.value = 'auto'
  captureCount.value = 0
  resetVideoUi()
}

function cycleFlash() {
  flash.value = flash.value === 'auto' ? 'on' : flash.value === 'on' ? 'off' : 'auto'
  showTip(`手电筒：${flashLabel.value}`)
}

function openGalleryFromCamera() {
  stage.value = 'gallery'
  /* 保留 fromCamera，图库关闭后回到相机 */
}

function closeGallerySheet() {
  if (fromCamera.value) {
    stage.value = 'camera'
    return
  }
  close()
}

function captureShutter() {
  if (selectedIds.value.length >= 9) {
    showTip('最多选择 9 张')
    return
  }
  if (cameraMode.value === 'video') {
    showTip('已录制短视频（原型演示）')
  }
  const shot = createCameraCaptureItem(cameraMode.value, captureCount.value)
  captureCount.value += 1
  capturedItems.value = [...capturedItems.value, shot]
  // 继续添加：追加到已选；首次拍摄：仅当前一张
  selectedIds.value = selectedIds.value.includes(shot.id)
    ? selectedIds.value
    : [...selectedIds.value, shot.id]
  previewIndex.value = selectedIds.value.indexOf(shot.id)
  stage.value = 'preview'
}

function pickFromCameraStrip(item: GalleryMediaItem) {
  if (!selectedIds.value.includes(item.id)) {
    if (selectedIds.value.length >= 9) {
      showTip('最多选择 9 张')
      return
    }
    selectedIds.value = [...selectedIds.value, item.id]
  }
  previewIndex.value = selectedIds.value.indexOf(item.id)
  stage.value = 'preview'
}

function showTip(text: string) {
  toast.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 1400)
}

function close() {
  emit('close')
}

function selectionOrder(id: string) {
  const idx = selectedIds.value.indexOf(id)
  return idx >= 0 ? idx + 1 : 0
}

function toggleSelect(item: GalleryMediaItem) {
  const idx = selectedIds.value.indexOf(item.id)
  if (idx >= 0) {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
    if (previewIndex.value >= selectedItems.value.length) {
      previewIndex.value = Math.max(0, selectedItems.value.length - 1)
    }
    return
  }
  if (selectedIds.value.length >= 9) {
    showTip('最多选择 9 张')
    return
  }
  selectedIds.value = [...selectedIds.value, item.id]
}

function openAlbum(id: string) {
  albumId.value = id
  tab.value = 'photos'
}

function openPreview(fromItem?: GalleryMediaItem) {
  if (!selectedItems.value.length) {
    if (fromItem) {
      selectedIds.value = [fromItem.id]
    } else {
      return
    }
  }
  if (fromItem) {
    const idx = selectedItems.value.findIndex((item) => item.id === fromItem.id)
    previewIndex.value = idx >= 0 ? idx : selectedItems.value.length - 1
  } else {
    previewIndex.value = 0
  }
  stage.value = 'preview'
}

function backToGallery() {
  stage.value = 'gallery'
}

/** 配文预览「继续添加」：相机入口回到相机，相册入口回到图库 */
function continueAddFromPreview() {
  if (fromCamera.value) {
    stage.value = 'camera'
    return
  }
  stage.value = 'gallery'
}

function backFromPreview() {
  if (fromCamera.value) {
    selectedIds.value = []
    previewIndex.value = 0
    caption.value = ''
    stage.value = 'camera'
    return
  }
  stage.value = 'gallery'
}

function removePreviewItem() {
  if (!previewItem.value) return
  const removedId = previewItem.value.id
  selectedIds.value = selectedIds.value.filter((id) => id !== removedId)
  capturedItems.value = capturedItems.value.filter((item) => item.id !== removedId)
  if (!selectedItems.value.length) {
    stage.value = fromCamera.value ? 'camera' : 'gallery'
    previewIndex.value = 0
    return
  }
  previewIndex.value = Math.min(previewIndex.value, selectedItems.value.length - 1)
}

function shiftPreview(delta: number) {
  if (selectedItems.value.length < 2) return
  const next = previewIndex.value + delta
  if (next < 0 || next >= selectedItems.value.length) return
  previewIndex.value = next
}

function send() {
  if (!canSend.value) return
  emit('send', {
    items: selectedItems.value,
    caption: caption.value.trim(),
    hd: hd.value,
  })
}
</script>

<template>
  <Transition name="mh5-media-picker">
    <div
      v-if="open"
      class="mh5-media-picker"
      :class="{
        'mh5-media-picker--preview': stage === 'preview',
        'mh5-media-picker--camera': stage === 'camera',
      }"
      role="dialog"
      aria-modal="true"
      :aria-label="stage === 'camera' ? '相机' : '选择照片'"
      @click.self="stage === 'gallery' ? closeGallerySheet() : undefined"
    >
      <!-- WhatsApp 全屏相机 -->
      <div v-if="stage === 'camera'" class="mh5-media-camera" @click.stop>
        <div class="mh5-media-camera__view">
          <img class="mh5-media-camera__preview" src="/images/discover/cover-4.jpg" alt="取景" />
          <!-- 手电筒：对齐 WhatsApp，叠在取景右上角 -->
          <button
            type="button"
            class="mh5-media-camera__flash"
            :class="{
              'mh5-media-camera__flash--on': flash === 'on',
              'mh5-media-camera__flash--off': flash === 'off',
            }"
            :aria-label="`手电筒${flashLabel}`"
            @click="cycleFlash"
          >
            <svg class="mh5-media-camera__flash-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <!-- 手电筒轮廓 -->
              <path
                d="M9.2 3.8h5.6c.7 0 1.2.5 1.2 1.2v2.2c0 .4-.2.8-.5 1L14 10.2v8.4c0 .9-.7 1.6-1.6 1.6h-1.8c-.9 0-1.6-.7-1.6-1.6v-8.4L8.5 8.2c-.3-.2-.5-.6-.5-1V5c0-.7.5-1.2 1.2-1.2z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path d="M9.5 6.6h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              <path
                d="M11.2 13.2h1.6M11.2 16h1.6"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
              <!-- 关闭态斜线 -->
              <path
                v-if="flash === 'off'"
                class="mh5-media-camera__flash-slash"
                d="M5 5l14 14"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button type="button" class="mh5-media-camera__close" aria-label="关闭" @click="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
          <div class="mh5-media-camera__hint">点击拍照，长按录像</div>
        </div>

        <div class="mh5-media-camera__strip" aria-label="最近项目">
          <button
            v-for="item in recentStrip"
            :key="item.id"
            type="button"
            class="mh5-media-camera__strip-item"
            @click="pickFromCameraStrip(item)"
          >
            <img :src="item.src" :alt="item.type === 'video' ? '视频' : '照片'" />
            <span v-if="item.type === 'video'" class="mh5-media-camera__strip-dur">{{ item.duration }}</span>
          </button>
        </div>

        <div class="mh5-media-camera__controls">
          <button
            type="button"
            class="mh5-media-camera__gallery"
            aria-label="打开图库"
            @click="openGalleryFromCamera"
          >
            <img :src="recentStrip[0]?.src" alt="" />
          </button>
          <button
            type="button"
            class="mh5-media-camera__shutter"
            :class="{ 'mh5-media-camera__shutter--video': cameraMode === 'video' }"
            :aria-label="cameraMode === 'video' ? '录制' : '快门'"
            @click="captureShutter"
          />
          <button
            type="button"
            class="mh5-media-camera__icon-btn"
            aria-label="翻转摄像头"
            @click="showTip('已切换摄像头')"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M16 4h2a2 2 0 012 2v3M8 20H6a2 2 0 01-2-2v-3"
                stroke="#fff"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path d="M17 7l-3-3 3-3M7 17l3 3-3 3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="12" r="3.2" stroke="#fff" stroke-width="1.8" />
            </svg>
          </button>
        </div>

        <div class="mh5-media-camera__modes" role="tablist">
          <button
            type="button"
            role="tab"
            class="mh5-media-camera__mode"
            :class="{ 'is-on': cameraMode === 'video' }"
            :aria-selected="cameraMode === 'video'"
            @click="cameraMode = 'video'"
          >
            视频
          </button>
          <button
            type="button"
            role="tab"
            class="mh5-media-camera__mode"
            :class="{ 'is-on': cameraMode === 'photo' }"
            :aria-selected="cameraMode === 'photo'"
            @click="cameraMode = 'photo'"
          >
            照片
          </button>
        </div>
      </div>

      <!-- 图库选择 · 底部弹层 -->
      <div v-else-if="stage === 'gallery'" class="mh5-media-picker__sheet" @click.stop>
          <div class="mh5-media-picker__handle" aria-hidden="true" />
          <header class="mh5-media-picker__header">
            <button type="button" class="mh5-media-picker__icon-btn" aria-label="关闭" @click="closeGallerySheet">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="#111" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </button>
            <div class="mh5-media-picker__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                class="mh5-media-picker__tab"
                :class="{ 'mh5-media-picker__tab--active': tab === 'photos' }"
                :aria-selected="tab === 'photos'"
                @click="tab = 'photos'"
              >
                照片
              </button>
              <button
                type="button"
                role="tab"
                class="mh5-media-picker__tab"
                :class="{ 'mh5-media-picker__tab--active': tab === 'albums' }"
                :aria-selected="tab === 'albums'"
                @click="tab = 'albums'"
              >
                相册
              </button>
            </div>
            <button
              type="button"
              class="mh5-media-picker__hd"
              :class="{ 'mh5-media-picker__hd--on': hd }"
              aria-label="原图"
              :aria-pressed="hd"
              @click="hd = !hd"
            >
              HD
            </button>
          </header>

          <main v-if="tab === 'photos'" class="mh5-media-picker__grid">
            <button
              v-for="item in albumItems"
              :key="item.id"
              type="button"
              class="mh5-media-picker__cell"
              :class="{ 'mh5-media-picker__cell--selected': selectionOrder(item.id) > 0 }"
              @click="toggleSelect(item)"
            >
              <img :src="item.src" :alt="item.type === 'video' ? '视频' : '照片'" />
              <span v-if="item.type === 'video'" class="mh5-media-picker__duration">{{ item.duration }}</span>
              <span
                class="mh5-media-picker__badge"
                :class="{ 'mh5-media-picker__badge--on': selectionOrder(item.id) > 0 }"
              >
                {{ selectionOrder(item.id) || '' }}
              </span>
            </button>
          </main>

          <main v-else class="mh5-media-picker__albums">
            <button
              v-for="album in CHAT_GALLERY_ALBUMS"
              :key="album.id"
              type="button"
              class="mh5-media-picker__album"
              @click="openAlbum(album.id)"
            >
              <img :src="album.cover" :alt="album.name" />
              <div>
                <strong>{{ album.name }}</strong>
                <span>{{ album.count }}</span>
              </div>
            </button>
          </main>

          <footer v-if="canSend" class="mh5-media-picker__footer">
            <button type="button" class="mh5-media-picker__thumb" aria-label="编辑所选" @click="openPreview()">
              <img :src="selectedItems[0]?.src" alt="" />
              <span class="mh5-media-picker__thumb-edit" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" />
                </svg>
              </span>
            </button>
            <div class="mh5-media-picker__caption">
              <textarea
                v-model="caption"
                class="mh5-media-picker__caption-input"
                rows="1"
                placeholder="添加配文..."
                enterkeyhint="enter"
              />
            </div>
            <button type="button" class="mh5-media-picker__send" aria-label="发送" @click="send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l16-8-6 16-2.5-7.5L4 12z" fill="#fff" />
              </svg>
              <span class="mh5-media-picker__send-count">{{ selectedItems.length }}</span>
            </button>
          </footer>
        </div>

        <!-- 深色预览编辑 · 全屏 -->
        <div v-else-if="stage === 'preview'" class="mh5-media-preview" @click.stop>
          <header class="mh5-media-preview__header">
            <button type="button" class="mh5-media-preview__tool" aria-label="返回" @click="backFromPreview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <div class="mh5-media-preview__tools">
              <button
                type="button"
                class="mh5-media-preview__tool"
                :class="{ 'mh5-media-preview__tool--on': hd }"
                aria-label="原图"
                :aria-pressed="hd"
                @click="hd = !hd"
              >
                HD
              </button>
            </div>
          </header>

          <div class="mh5-media-preview__stage" @click="onStageClick">
            <button v-if="selectedItems.length > 1" type="button" class="mh5-media-preview__nav mh5-media-preview__nav--prev" aria-label="上一张" @click.stop="shiftPreview(-1)">‹</button>
            <img v-if="previewItem" class="mh5-media-preview__image" :src="previewItem.src" alt="预览" />
            <button v-if="selectedItems.length > 1" type="button" class="mh5-media-preview__nav mh5-media-preview__nav--next" aria-label="下一张" @click.stop="shiftPreview(1)">›</button>

            <template v-if="isPreviewVideo && previewItem">
              <div class="mh5-media-preview__video-meta" @click.stop>
                <button
                  type="button"
                  class="mh5-media-preview__mute"
                  :aria-label="videoMuted ? '取消静音' : '静音'"
                  :aria-pressed="videoMuted"
                  @click="videoMuted = !videoMuted"
                >
                  <!-- WhatsApp 风格：扬声器 + 斜线 / 声波 -->
                  <svg v-if="videoMuted" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M11 5L6.5 9H3v6h3.5L11 19V5z"
                      stroke="#fff"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path d="M15 9.5l5 5M20 9.5l-5 5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M11 5L6.5 9H3v6h3.5L11 19V5z"
                      stroke="#fff"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M15.5 9.5a4 4 0 010 5M18 7.5a7 7 0 010 9"
                      stroke="#fff"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <span>{{ previewItem.duration }} · {{ previewItem.sizeLabel }}</span>
              </div>
              <button
                v-show="!videoPlaying"
                type="button"
                class="mh5-media-preview__play"
                aria-label="播放"
                @click.stop="toggleVideoPlayback"
              >
                ▶
              </button>
              <div
                class="mh5-media-preview__timeline"
                role="group"
                aria-label="视频进度条"
                @click.stop
              >
                <div class="mh5-media-preview__film">
                  <span
                    v-for="n in 10"
                    :key="n"
                    class="mh5-media-preview__frame"
                    :style="{ backgroundImage: `url(${previewItem.src})`, backgroundPosition: `${(n - 1) * 11}% center` }"
                  />
                  <div
                    class="mh5-media-preview__playhead"
                    :class="{ 'mh5-media-preview__playhead--playing': videoPlaying }"
                    :style="{ left: `${playhead * 100}%` }"
                  />
                </div>
              </div>
            </template>
          </div>

          <div class="mh5-media-preview__selected">
            <button type="button" class="mh5-media-preview__trash" aria-label="移除当前" @click="removePreviewItem">
              <img :src="CHAT_ROOM_ASSETS.trash" alt="" width="18" height="18" />
            </button>
            <button
              v-for="(item, index) in selectedItems"
              :key="item.id"
              type="button"
              class="mh5-media-preview__mini"
              :class="{ 'mh5-media-preview__mini--active': index === previewIndex }"
              @click="previewIndex = index"
            >
              <img :src="item.src" alt="" />
            </button>
          </div>

          <div class="mh5-media-preview__caption">
            <button type="button" class="mh5-media-preview__add" aria-label="继续添加" @click="continueAddFromPreview">＋</button>
            <textarea
              v-model="caption"
              class="mh5-media-picker__caption-input"
              rows="1"
              placeholder="添加配文..."
              enterkeyhint="enter"
            />
          </div>

          <footer class="mh5-media-preview__footer">
            <span class="mh5-media-preview__recipient">{{ recipientName }}</span>
            <button type="button" class="mh5-media-preview__send" aria-label="发送" @click="send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l16-8-6 16-2.5-7.5L4 12z" fill="#111" />
              </svg>
            </button>
          </footer>
        </div>

      <div v-if="toast" class="mh5-media-picker__toast">{{ toast }}</div>
    </div>
  </Transition>
</template>
