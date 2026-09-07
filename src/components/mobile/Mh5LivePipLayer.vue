<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LIVE_PIP_ASSETS,
  LIVE_PIP_COLLAPSE_H,
  LIVE_PIP_COLLAPSE_W,
  LIVE_PIP_DRAG_CLICK_SLOP,
  LIVE_PIP_HINT_COPY,
  LIVE_PIP_SAFE_Y,
  LIVE_PIP_VOICE_SIZE,
  livePipBoxSize,
  livePipClampPoint,
  livePipCollapseSide,
  livePipDefaultPoint,
  type LivePipPoint,
} from '../../constants/livePip'
import { LIVE_STREAM_ASSETS } from '../../constants/mobileLiveStream'
import { withMineHallFrom } from '../../constants/mineHall'
import { useLivePip } from '../../composables/useLivePip'
import { t } from '../../i18n'

const route = useRoute()
const router = useRouter()
const pip = useLivePip()

const layerRef = ref<HTMLElement | null>(null)
const dragging = ref(false)
const pinToast = ref('')
let pinToastTimer = 0
let skipClick = false
let dragOrigin: LivePipPoint | null = null
let pointerOrigin: LivePipPoint | null = null

const isExternal = computed(() => pip.state.placement === 'external')
const isVoice = computed(() => pip.state.session?.kind === 'voice')
const hideTabBar = computed(
  () => Boolean(route.meta.hideTabBar) || route.path.startsWith('/mobile/agent'),
)

const box = computed(() => {
  if (isVoice.value) {
    const size = isExternal.value ? 148 : LIVE_PIP_VOICE_SIZE
    return { width: size, height: size }
  }
  const ratio = pip.state.session?.ratio || '9:16'
  return livePipBoxSize(ratio, isExternal.value ? 188 : 168, isExternal.value ? 268 : 240)
})

const inSourceRoom = computed(() => {
  const name = route.name
  return name === 'mobile-live-stream' || name === 'mobile-voice-room'
})

const watchingSameRoom = computed(() => {
  const session = pip.state.session
  if (!session) return false
  const routeName = session.kind === 'voice' ? 'mobile-voice-room' : 'mobile-live-stream'
  return route.name === routeName && String(route.query.id || '') === session.roomId
})

const showLayer = computed(
  () =>
    Boolean(pip.state.session) &&
    (pip.state.placement === 'in-app' || pip.state.placement === 'external') &&
    (isExternal.value || !inSourceRoom.value),
)

function sessionRouteName(kind: 'live' | 'voice' | undefined) {
  return kind === 'voice' ? 'mobile-voice-room' : 'mobile-live-stream'
}

function shellSize() {
  const host = layerRef.value
  const shell = host?.closest('.mh5-app-shell') as HTMLElement | null
  const el = shell || host
  return { w: el?.clientWidth || 375, h: el?.clientHeight || 812 }
}

function resolvedPos(): LivePipPoint {
  const shell = shellSize()
  const fallback = livePipDefaultPoint(shell, box.value, !hideTabBar.value)
  if (!pip.state.pos) return fallback
  return livePipClampPoint(pip.state.pos, shell, box.value, !hideTabBar.value)
}

const windowStyle = computed(() => {
  const point = dragging.value && pip.state.pos ? pip.state.pos : resolvedPos()
  return {
    width: `${box.value.width}px`,
    height: `${box.value.height}px`,
    left: `${point.x}px`,
    top: `${point.y}px`,
  }
})

const dockStyle = computed(() => {
  const shell = shellSize()
  const point = resolvedPos()
  const top = Math.min(
    Math.max(LIVE_PIP_SAFE_Y, point.y + (box.value.height - LIVE_PIP_COLLAPSE_H) / 2),
    shell.h - LIVE_PIP_SAFE_Y - LIVE_PIP_COLLAPSE_H - (hideTabBar.value ? 0 : 56),
  )
  return {
    top: `${Math.round(top)}px`,
    left: pip.state.collapsedSide === 'left' ? '0px' : `${shell.w - LIVE_PIP_COLLAPSE_W}px`,
  }
})

function reclampPos() {
  if (!pip.state.pos || !showLayer.value) return
  pip.setPos(livePipClampPoint(pip.state.pos, shellSize(), box.value, !hideTabBar.value))
}

function onVideoClick() {
  if (skipClick) {
    skipClick = false
    return
  }
  if (isExternal.value) {
    const session = pip.state.session
    pip.returnFromExternal()
    if (session && !watchingSameRoom.value) {
      void router.push({
        name: sessionRouteName(session.kind),
        query: session.query,
      })
    }
    return
  }
  const session = pip.state.session
  if (!session) return
  pip.hide()
  void router.push({
    name: sessionRouteName(session.kind),
    query: session.query,
  })
}

function showPinToast(pinned: boolean) {
  pinToast.value = pinned ? t('已置顶，切出应用将开画中画') : t('已取消置顶，切出应用仅保留声音')
  window.clearTimeout(pinToastTimer)
  pinToastTimer = window.setTimeout(() => {
    pinToast.value = ''
  }, 1800)
}

function onPin(event: Event) {
  event.stopPropagation()
  showPinToast(pip.togglePin())
}

function onClose(event: Event) {
  event.stopPropagation()
  if (isExternal.value) {
    pip.hide()
    return
  }
  pip.closeInApp()
}

function onMute(event: Event) {
  event.stopPropagation()
  pip.toggleMute()
}

function onToggleMic(event: Event) {
  event.stopPropagation()
  pip.toggleMicOn()
}

function onLeaveMic(event: Event) {
  event.stopPropagation()
  pip.leaveMic()
}

function bindDragListeners() {
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerUp)
  window.addEventListener('mousemove', onWindowPointerMove)
  window.addEventListener('mouseup', onWindowPointerUp)
}

function unbindDragListeners() {
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerUp)
  window.removeEventListener('mousemove', onWindowPointerMove)
  window.removeEventListener('mouseup', onWindowPointerUp)
}

function onWindowPointerDown(event: PointerEvent | MouseEvent) {
  if (event.button !== 0) return
  const target = event.target as HTMLElement | null
  if (target?.closest('.mh5-live-pip__btn')) return
  event.preventDefault()
  const point = dragging.value && pip.state.pos ? pip.state.pos : resolvedPos()
  dragging.value = true
  skipClick = false
  dragOrigin = { ...point }
  pointerOrigin = { x: event.clientX, y: event.clientY }
  pip.setPos(point)
  bindDragListeners()
}

function onWindowPointerMove(event: PointerEvent | MouseEvent) {
  if (!dragging.value || !dragOrigin || !pointerOrigin) return
  const dx = event.clientX - pointerOrigin.x
  const dy = event.clientY - pointerOrigin.y
  if (Math.hypot(dx, dy) > LIVE_PIP_DRAG_CLICK_SLOP) skipClick = true
  const shell = shellSize()
  const y = livePipClampPoint(
    { x: dragOrigin.x + dx, y: dragOrigin.y + dy },
    shell,
    box.value,
    !hideTabBar.value,
  ).y
  pip.setPos({ x: dragOrigin.x + dx, y })
}

function finishDrag() {
  if (!dragging.value) return
  dragging.value = false
  unbindDragListeners()
  const raw = pip.state.pos
  dragOrigin = null
  pointerOrigin = null
  if (!raw) return
  const shell = shellSize()
  const side = livePipCollapseSide(raw.x, shell, box.value, !hideTabBar.value)
  if (side && !isExternal.value) {
    pip.setPos(livePipClampPoint(raw, shell, box.value, !hideTabBar.value))
    pip.collapseTo(side)
    return
  }
  pip.setPos(livePipClampPoint(raw, shell, box.value, !hideTabBar.value))
}

function onWindowPointerUp() {
  finishDrag()
}

function onDockClick() {
  const shell = shellSize()
  const point = resolvedPos()
  const leftX = livePipClampPoint({ x: 12, y: point.y }, shell, box.value, !hideTabBar.value).x
  pip.setPos({
    x: pip.state.collapsedSide === 'left' ? leftX : point.x,
    y: point.y,
  })
  pip.expandFromDock()
}

function onHintGotIt() {
  pip.dismissHint()
}

async function onHintGoSettings() {
  pip.dismissHint()
  await nextTick()
  await router.push({
    name: 'mobile-mine-pip-settings',
    query: withMineHallFrom(route.query.from),
  })
}

watch([hideTabBar, box], () => {
  reclampPos()
})

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (!layerRef.value || typeof ResizeObserver === 'undefined') return
  resizeObs = new ResizeObserver(() => reclampPos())
  resizeObs.observe(layerRef.value)
})

onBeforeUnmount(() => {
  unbindDragListeners()
  resizeObs?.disconnect()
  window.clearTimeout(pinToastTimer)
})
</script>

<template>
  <div ref="layerRef" class="mh5-live-pip-host">
  <div
    v-if="showLayer && pip.state.session"
    class="mh5-live-pip"
    :class="{
      'mh5-live-pip--external': isExternal,
      'mh5-live-pip--dragging': dragging,
    }"
  >
    <button
      v-if="pip.state.collapsed && !isExternal"
      type="button"
      class="mh5-live-pip__dock"
      :class="`mh5-live-pip__dock--${pip.state.collapsedSide}`"
      :style="dockStyle"
      :aria-label="$t('展开小窗')"
      @click="onDockClick"
    >
      <span class="mh5-live-pip__dock-arrow" aria-hidden="true">{{
        pip.state.collapsedSide === 'left' ? '›' : '‹'
      }}</span>
    </button>

    <div
      v-else
      class="mh5-live-pip__window"
      :class="{
        'mh5-live-pip__window--dragging': dragging,
        'mh5-live-pip__window--voice': isVoice,
      }"
      :style="windowStyle"
      role="button"
      tabindex="0"
      :aria-label="isVoice ? $t('继续语聊') : $t('继续观看直播')"
      @pointerdown="onWindowPointerDown"
      @mousedown="onWindowPointerDown"
      @click="onVideoClick"
    >
      <img
        class="mh5-live-pip__stage"
        :src="pip.state.session.stage"
        :alt="pip.state.session.hostName"
        draggable="false"
      />
      <span v-if="pip.state.session.muted" class="mh5-live-pip__muted">{{ $t('已静音') }}</span>

      <span class="mh5-live-pip__controls" @click.stop @pointerdown.stop>
        <button
          v-if="!isExternal && !isVoice"
          type="button"
          class="mh5-live-pip__btn mh5-live-pip__btn--pin"
          :aria-label="pip.state.pinned ? $t('取消置顶') : $t('置顶')"
          @click="onPin"
        >
          <svg
            class="mh5-live-pip__pin-icon"
            :class="{ 'mh5-live-pip__pin-icon--down': pip.state.pinned }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </button>
        <button type="button" class="mh5-live-pip__btn mh5-live-pip__btn--close" :aria-label="$t('关闭小窗')" @click="onClose">
          <span aria-hidden="true">×</span>
        </button>
        <template v-if="isVoice && pip.state.session.onMic">
          <button
            type="button"
            class="mh5-live-pip__btn mh5-live-pip__btn--mic"
            :class="{ 'mh5-live-pip__btn--mic-off': !pip.state.session.micOn }"
            :aria-label="pip.state.session.micOn ? $t('关闭麦克风') : $t('开启麦克风')"
            @click="onToggleMic"
          >
            <img :src="LIVE_PIP_ASSETS.mic" alt="" width="16" height="16" />
          </button>
          <button
            type="button"
            class="mh5-live-pip__btn mh5-live-pip__btn--leave-mic"
            :aria-label="$t('下麦')"
            @click="onLeaveMic"
          >
            <img :src="LIVE_PIP_ASSETS.leaveMic" alt="" width="16" height="16" />
          </button>
        </template>
        <button
          v-else
          type="button"
          class="mh5-live-pip__btn mh5-live-pip__btn--mute"
          :aria-label="pip.state.session.muted ? $t('取消静音') : $t('静音')"
          @click="onMute"
        >
          <img
            :src="pip.state.session.muted ? LIVE_STREAM_ASSETS.shareSheet.muteOff : LIVE_STREAM_ASSETS.shareSheet.mute"
            alt=""
            width="16"
            height="16"
          />
        </button>
      </span>
    </div>
  </div>

  <Transition name="mh5-toast">
    <p v-if="pinToast" class="mh5-live-pip-toast">{{ pinToast }}</p>
  </Transition>

  <div
    v-if="pip.state.hint"
    class="mh5-live-pip-hint"
    role="presentation"
    @click.self="onHintGotIt"
  >
    <div class="mh5-live-pip-hint__dialog" role="alertdialog" aria-modal="true">
      <p class="mh5-live-pip-hint__text">{{ t(LIVE_PIP_HINT_COPY[pip.state.hint]) }}</p>
      <div class="mh5-live-pip-hint__actions">
        <button type="button" class="mh5-live-pip-hint__btn" @click="onHintGotIt">{{ $t('知道了') }}</button>
        <button type="button" class="mh5-live-pip-hint__btn mh5-live-pip-hint__btn--primary" @click="onHintGoSettings">
          {{ $t('去设置') }}
        </button>
      </div>
    </div>
  </div>
  </div>
</template>
