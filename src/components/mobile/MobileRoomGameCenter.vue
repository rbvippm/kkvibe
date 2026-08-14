<script setup lang="ts">
import { computed, ref } from 'vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  filterVoiceGames,
  VOICE_GAME_TABS,
  VOICE_ROOM_ASSETS,
  type VoiceGameTab,
} from '../../constants/mobileVoiceRoom'

const open = defineModel<boolean>('open', { default: false })

const showGameFloat = ref(true)
const showGameCenterFloat = ref(true)
const gameTab = ref<VoiceGameTab>('hot')
const gameList = computed(() => filterVoiceGames(gameTab.value))

function openPanel() {
  open.value = true
}

function closePanel() {
  open.value = false
}

async function openGame(name: string) {
  await mh5Alert({
    title: `即将打开「${name}」`,
    message: '原型演示：游戏玩法页待接入',
    showCancel: false,
  })
}

defineExpose({ openPanel, closePanel })
</script>

<template>
  <div class="mh5-voice-room__floats">
    <div v-if="showGameFloat" class="mh5-voice-float">
      <button type="button" class="mh5-voice-float__x" :aria-label="$t('关闭')" @click="showGameFloat = false">
        <img :src="VOICE_ROOM_ASSETS.floatClose" alt="" />
      </button>
      <button type="button" class="mh5-voice-float__hit" :aria-label="$t('打开游戏')" @click="openPanel">
        <img
          class="mh5-voice-float__img mh5-voice-float__img--game"
          :src="VOICE_ROOM_ASSETS.gameFloat"
          alt=""
        />
        <span class="mh5-voice-float__label">{{ $t('游戏名称...') }}</span>
      </button>
    </div>
    <div v-if="showGameCenterFloat" class="mh5-voice-float">
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
              <span v-if="game.live" class="mh5-voice-gc__live">
                <img :src="VOICE_ROOM_ASSETS.liveTag" alt="" width="14" height="14" />{{ $t('直播中') }}</span>
            </div>
            <button type="button" class="mh5-voice-gc__open" @click="openGame(game.name)">{{ $t('打开') }}</button>
          </article>

          <p v-if="!gameList.length" class="mh5-voice-gc__empty">{{ $t('该分类暂无游戏') }}</p>
        </div>
      </section>
    </div>
  </Transition>
</template>
