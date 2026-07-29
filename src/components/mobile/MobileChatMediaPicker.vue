<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  CHAT_GALLERY_ALBUMS,
  CHAT_GALLERY_ITEMS,
  galleryItemsForAlbum,
  type ChatMediaSendPayload,
  type GalleryMediaItem,
} from '../../constants/mobileChatGallery'
import { CHAT_ROOM_ASSETS } from '../../constants/mobileChatRoomAssets'

const props = defineProps<{
  open: boolean
  recipientName: string
}>()

const emit = defineEmits<{
  close: []
  send: [payload: ChatMediaSendPayload]
}>()

type Stage = 'gallery' | 'preview'
type GalleryTab = 'photos' | 'albums'

const stage = ref<Stage>('gallery')
const tab = ref<GalleryTab>('photos')
const albumId = ref('recents')
const hd = ref(false)
const caption = ref('')
const selectedIds = ref<string[]>([])
const previewIndex = ref(0)
const toast = ref('')
const videoPlaying = ref(false)
const videoMuted = ref(true)
/** 播放块位置 0~1 */
const playhead = ref(0)
let toastTimer: ReturnType<typeof setTimeout> | null = null
let playRaf: number | null = null

const albumItems = computed(() => galleryItemsForAlbum(albumId.value))

const selectedItems = computed(() =>
  selectedIds.value
    .map((id) => CHAT_GALLERY_ITEMS.find((item) => item.id === id))
    .filter((item): item is GalleryMediaItem => Boolean(item)),
)

const previewItem = computed(() => selectedItems.value[previewIndex.value] ?? selectedItems.value[0] ?? null)
const canSend = computed(() => selectedItems.value.length > 0)
const isPreviewVideo = computed(() => previewItem.value?.type === 'video')

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
  stage.value = 'gallery'
  tab.value = 'photos'
  albumId.value = 'recents'
  hd.value = false
  caption.value = ''
  selectedIds.value = []
  previewIndex.value = 0
  resetVideoUi()
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

function removePreviewItem() {
  if (!previewItem.value) return
  selectedIds.value = selectedIds.value.filter((id) => id !== previewItem.value!.id)
  if (!selectedItems.value.length) {
    stage.value = 'gallery'
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
      :class="{ 'mh5-media-picker--preview': stage === 'preview' }"
      role="dialog"
      aria-modal="true"
      aria-label="选择照片"
      @click.self="close"
    >
      <!-- 图库选择 · 底部弹层 -->
      <div v-if="stage === 'gallery'" class="mh5-media-picker__sheet" @click.stop>
          <div class="mh5-media-picker__handle" aria-hidden="true" />
          <header class="mh5-media-picker__header">
            <button type="button" class="mh5-media-picker__icon-btn" aria-label="关闭" @click="close">
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
        <div v-else class="mh5-media-preview" @click.stop>
          <header class="mh5-media-preview__header">
            <button type="button" class="mh5-media-preview__tool" aria-label="返回" @click="backToGallery">
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
            <button type="button" class="mh5-media-preview__add" aria-label="继续添加" @click="backToGallery">＋</button>
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
