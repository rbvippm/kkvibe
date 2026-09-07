<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { CHAT_GROUP_GAME_ASSETS } from '../../constants/mobileChatGroupGame'
import Mh5VipSportsDesk from './Mh5VipSportsDesk.vue'
import {
  filterVoiceGames,
  resolveVoiceGameDisplay,
  resolveVoiceGameIcon,
  voiceGameDisplayLabel,
  VOICE_GAME_TABS,
  VOICE_ROOM_ASSETS,
  type VoiceGameTab,
} from '../../constants/mobileVoiceRoom'

const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(
  defineProps<{
    showFloats?: boolean
    interceptOpen?: boolean
  }>(),
  { showFloats: true, interceptOpen: false },
)
const emit = defineEmits<{
  openGame: [name: string]
}>()

const rootEl = ref<HTMLElement | null>(null)
const showGameFloat = ref(true)
const showGameCenterFloat = ref(true)
const gameTab = ref<VoiceGameTab>('hot')
const gameList = computed(() => filterVoiceGames(gameTab.value))
const lastGameName = ref('奔驰宝马')
const gamePlayName = ref('')
const gamePlayExpanded = ref(false)
const playAnchor = ref<'game' | 'center'>('game')
const floatPulse = ref(false)
const flyChip = ref<{ x: number; y: number; scale: number; opacity: number } | null>(null)
const flyChipIcon = ref<string>(VOICE_ROOM_ASSETS.gameFloat)
let flyRaf = 0
let pulseTimer: ReturnType<typeof setTimeout> | null = null

function gameIconOf(name: string) {
  return resolveVoiceGameIcon(name)
}

const showPlayOverlay = computed(() => !props.interceptOpen && Boolean(gamePlayName.value))
const showRoomFloats = computed(
  () => props.showFloats && (!showPlayOverlay.value || Boolean(flyChip.value)),
)

function playHost() {
  return (rootEl.value?.closest('.mh5-route-view') as HTMLElement | null) ?? rootEl.value
}

function openPanel() {
  open.value = true
}

function closePanel() {
  open.value = false
}

function openGame(name: string, anchor: 'game' | 'center' = 'center') {
  emit('openGame', name)
  playAnchor.value = anchor
  lastGameName.value = name
  if (props.interceptOpen) return
  open.value = false
  gamePlayName.value = name
  gamePlayExpanded.value = resolveVoiceGameDisplay(name) === 'portrait'
}

function openGameFloat() {
  if (props.interceptOpen) {
    emit('openGame', lastGameName.value)
    playAnchor.value = 'game'
    return
  }
  openGame(lastGameName.value, 'game')
}

function closeGamePlay() {
  gamePlayName.value = ''
  gamePlayExpanded.value = false
}

function toggleGamePlaySize() {
  gamePlayExpanded.value = !gamePlayExpanded.value
}

function quadPoint(t: number, a: number, b: number, c: number) {
  const u = 1 - t
  return u * u * a + 2 * u * t * b + t * t * c
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function stopFlyChip() {
  if (flyRaf) {
    cancelAnimationFrame(flyRaf)
    flyRaf = 0
  }
  flyChip.value = null
}

function minimizeGamePlay(ev?: MouseEvent) {
  const host = playHost()
  const startEl =
    host?.querySelector<HTMLElement>('.mh5-chat-game-play__icon') ??
    host?.querySelector<HTMLElement>('.mh5-chat-game-play') ??
    (ev?.currentTarget as HTMLElement | null)
  if (!host || !startEl || flyChip.value) {
    closeGamePlay()
    return
  }

  const startBox = startEl.getBoundingClientRect()
  const hostBox = host.getBoundingClientRect()
  const start = {
    x: startBox.left + startBox.width / 2 - hostBox.left,
    y: startBox.top + startBox.height / 2 - hostBox.top,
  }
  const startScale = Math.max(0.4, startBox.width / 56)
  const icon = gameIconOf(gamePlayName.value || lastGameName.value)
  const anchor = playAnchor.value

  if (anchor === 'center') showGameCenterFloat.value = true
  else showGameFloat.value = true
  flyChipIcon.value = icon
  flyChip.value = { x: start.x, y: start.y, scale: startScale, opacity: 1 }
  closeGamePlay()

  void nextTick(() => {
    const latestHost = playHost()?.getBoundingClientRect() ?? hostBox
    const targetEl = playHost()?.querySelector<HTMLElement>(`[data-voice-float="${anchor}"]`)
    const targetBox = targetEl?.getBoundingClientRect()
    const end = targetBox
      ? {
          x: targetBox.left + targetBox.width / 2 - latestHost.left,
          y: targetBox.top + targetBox.height / 2 - latestHost.top,
        }
      : { x: latestHost.width - 41, y: latestHost.height - 150 }
    const endScale = targetBox ? Math.max(0.55, targetBox.width / 56) : 1
    const ctrl = {
      x: start.x + (end.x - start.x) * 0.42 - 28,
      y: Math.min(start.y, end.y) - 180,
    }
    const duration = 680
    const t0 = performance.now()

    const tick = (now: number) => {
      const raw = Math.min(1, (now - t0) / duration)
      const t = easeInOutCubic(raw)
      flyChip.value = {
        x: quadPoint(t, start.x, ctrl.x, end.x),
        y: quadPoint(t, start.y, ctrl.y, end.y),
        scale: startScale + (endScale - startScale) * t,
        opacity: 1 - 0.08 * t,
      }
      if (raw < 1) {
        flyRaf = requestAnimationFrame(tick)
        return
      }
      flyRaf = 0
      flyChip.value = null
      floatPulse.value = true
      if (pulseTimer) clearTimeout(pulseTimer)
      pulseTimer = setTimeout(() => {
        floatPulse.value = false
        pulseTimer = null
      }, 460)
    }
    flyRaf = requestAnimationFrame(tick)
  })
}

onBeforeUnmount(() => {
  stopFlyChip()
  if (pulseTimer) clearTimeout(pulseTimer)
})

defineExpose({ openPanel, closePanel })
</script>

<template>
  <div ref="rootEl" class="mh5-room-gc-anchor">
    <div v-if="showRoomFloats" class="mh5-voice-room__floats">
      <div
        v-if="showGameFloat"
        class="mh5-voice-float"
        :class="{ 'mh5-voice-float--pulse': floatPulse && playAnchor === 'game' }"
        data-voice-float="game"
      >
        <button type="button" class="mh5-voice-float__x" :aria-label="$t('关闭')" @click="showGameFloat = false">
          <img :src="VOICE_ROOM_ASSETS.floatClose" alt="" />
        </button>
        <button type="button" class="mh5-voice-float__hit" :aria-label="$t('打开游戏')" @click="openGameFloat">
          <img
            class="mh5-voice-float__img mh5-voice-float__img--game"
            :src="gameIconOf(lastGameName)"
            alt=""
          />
          <span class="mh5-voice-float__label">{{ $t(lastGameName) }}</span>
        </button>
      </div>
      <div
        v-if="showGameCenterFloat"
        class="mh5-voice-float"
        :class="{ 'mh5-voice-float--pulse': floatPulse && playAnchor === 'center' }"
        data-voice-float="center"
      >
        <button
          type="button"
          class="mh5-voice-float__x"
          :aria-label="$t('关闭')"
          @click="showGameCenterFloat = false"
        >
          <img :src="VOICE_ROOM_ASSETS.floatClose" alt="" />
        </button>
        <button type="button" class="mh5-voice-float__hit" :aria-label="$t('打开游戏中心')" @click="openPanel">
          <img class="mh5-voice-float__img" :src="VOICE_ROOM_ASSETS.gameCenter" alt="" />
          <span class="mh5-voice-float__label">{{ $t('游戏中心') }}</span>
        </button>
      </div>
    </div>
  </div>

  <Transition name="mh5-voice-gc">
    <div v-if="open" class="mh5-voice-gc-mask" @click.self="closePanel">
      <section class="mh5-voice-gc" :aria-label="$t('游戏中心')" role="dialog" aria-modal="true">
        <header class="mh5-voice-gc__head">
          <h2 class="mh5-voice-gc__title">{{ $t('游戏中心') }}</h2>
          <button type="button" class="mh5-voice-gc__close" :aria-label="$t('关闭')" @click="closePanel">
            <img :src="VOICE_ROOM_ASSETS.sheetClose" alt="" width="24" height="24" />
          </button>
        </header>

        <div class="mh5-voice-gc__tabs" role="tablist" :aria-label="$t('游戏分类')">
          <button
            v-for="tab in VOICE_GAME_TABS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-voice-gc__tab"
            :class="{ 'mh5-voice-gc__tab--active': gameTab === tab.key }"
            :aria-selected="gameTab === tab.key"
            @click="gameTab = tab.key"
          >
            {{ $t(tab.label) }}
          </button>
        </div>

        <div class="mh5-voice-gc__list">
          <article
            v-for="(game, index) in gameList"
            :key="game.id"
            class="mh5-voice-gc__row"
            :class="{ 'mh5-voice-gc__row--split': index === 0 }"
          >
            <img class="mh5-voice-gc__icon" :src="game.icon" :alt="game.name" />
            <div class="mh5-voice-gc__meta">
              <p class="mh5-voice-gc__name">{{ $t(game.name) }}</p>
              <p class="mh5-voice-gc__display">{{ $t(voiceGameDisplayLabel(game.display)) }}</p>
            </div>
            <button type="button" class="mh5-voice-gc__open" @click="openGame(game.name, 'center')">{{ $t('打开') }}</button>
          </article>

          <p v-if="!gameList.length" class="mh5-voice-gc__empty">{{ $t('该分类暂无游戏') }}</p>
        </div>
      </section>
    </div>
  </Transition>

  <template v-if="!interceptOpen">
    <div
      v-if="flyChip"
      class="mh5-chat-game-fly"
      :style="{
        transform: `translate(${flyChip.x}px, ${flyChip.y}px) scale(${flyChip.scale})`,
        opacity: flyChip.opacity,
      }"
      aria-hidden="true"
    >
      <img :src="flyChipIcon" alt="" width="56" height="56" />
    </div>

    <button
      v-if="showPlayOverlay && !gamePlayExpanded"
      type="button"
      class="mh5-chat-game-play-mask"
      :aria-label="$t('收起')"
      @click="minimizeGamePlay"
    />

    <Transition :name="flyChip ? '' : 'mh5-chat-game-play'">
      <section
        v-if="showPlayOverlay"
        class="mh5-chat-game-play"
        :class="{ 'mh5-chat-game-play--expanded': gamePlayExpanded }"
        role="dialog"
        aria-modal="true"
        :aria-label="gamePlayName"
      >
        <header class="mh5-chat-game-play__head">
          <div class="mh5-chat-game-play__title">
            <img
              class="mh5-chat-game-play__icon"
              :src="gameIconOf(gamePlayName)"
              alt=""
              width="28"
              height="28"
            />
            <h2 class="mh5-chat-game-play__name">{{ $t(gamePlayName) }}</h2>
          </div>
          <div class="mh5-chat-game-play__actions">
            <button
              type="button"
              class="mh5-chat-game-play__btn"
              :aria-label="gamePlayExpanded ? $t('收起') : $t('放大')"
              @click="toggleGamePlaySize"
            >
              <img :src="CHAT_GROUP_GAME_ASSETS.expand" alt="" width="24" height="24" />
            </button>
            <button
              type="button"
              class="mh5-chat-game-play__btn"
              :aria-label="$t('收起')"
              @click="minimizeGamePlay"
            >
              <span class="mh5-chat-game-play__min" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="mh5-chat-game-play__btn"
              :aria-label="$t('关闭')"
              @click="closeGamePlay"
            >
              <img :src="CHAT_GROUP_GAME_ASSETS.playClose" alt="" width="24" height="24" />
            </button>
          </div>
        </header>
        <div class="mh5-chat-game-play__body">
          <Mh5VipSportsDesk embedded />
        </div>
      </section>
    </Transition>
  </template>
</template>
