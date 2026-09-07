<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  CHAT_GAME_MENU_ACTIONS,
  CHAT_GAME_MENU_CATEGORIES,
  CHAT_GROUP_GAME_ASSETS,
  type ChatGameMenuActionId,
} from '../../constants/mobileChatGroupGame'
import { VIP_CLUB_ASSETS } from '../../constants/vipClub'
import { useMiniAppGame } from '../../composables/useMiniAppGame'
import Mh5VipSportsDesk from './Mh5VipSportsDesk.vue'

const router = useRouter()
const {
  gameName,
  gameKind,
  mode,
  showMenu,
  toast,
  homeDismiss,
  dockOpen,
  dockSlotH,
  stageStyle,
  showToast,
  close,
  dismissToHome,
  expandFromDock,
} = useMiniAppGame()

function openMenu() {
  showMenu.value = true
}

function closeMenu() {
  showMenu.value = false
}

function onMenuAction(id: ChatGameMenuActionId) {
  closeMenu()
  if (id === 'home') {
    const shell = document.getElementById('mh5-app-shell')
    dismissToHome(shell?.clientHeight || 812)
    return
  }
  if (id === 'recharge') {
    close()
    void router.push({ name: 'mobile-wallet-transfer' })
    return
  }
  if (id === 'activity') {
    showToast('活动中心即将开放')
    return
  }
  showToast('已为你接通专属客服')
}

function onMenuCategory(label: string) {
  closeMenu()
  showToast(`已切换到「${label}」`)
}
</script>

<template>
  <div
    v-if="gameName"
    class="mh5-mini-game-layer"
      :class="{
        'mh5-mini-game-layer--full': mode === 'full',
        'mh5-mini-game-layer--dock': dockOpen,
        'mh5-mini-game-layer--leaving': Boolean(homeDismiss),
      }"
    >
      <section
        v-if="mode === 'full'"
        class="mh5-chat-game-stage mh5-chat-game-stage--full"
        :class="{ 'mh5-chat-game-stage--leaving': Boolean(homeDismiss) }"
        :style="stageStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="gameName"
      >
        <Mh5VipSportsDesk
          v-if="gameKind === 'sports'"
          embedded
          :show-collapse-handle="!showMenu && !homeDismiss"
          @menu="openMenu"
        />
        <div v-else class="mh5-mini-game-placeholder">
          <button
            v-if="!showMenu && !homeDismiss"
            type="button"
            class="mh5-vip-sports-header__drop"
            :aria-label="$t('打开游戏菜单')"
            @click.stop="openMenu"
          >
            <img :src="VIP_CLUB_ASSETS.collapseTab" alt="" width="90" height="19" />
          </button>
          <p class="mh5-mini-game-placeholder__title">{{ $t(gameName) }}</p>
          <p class="mh5-mini-game-placeholder__hint">游戏加载中（原型占位）</p>
        </div>

        <template v-if="!homeDismiss">
          <Transition name="mh5-chat-game-menu">
            <div v-if="showMenu" class="mh5-chat-game-menu">
              <button
                type="button"
                class="mh5-chat-game-menu__mask"
                :aria-label="$t('收起游戏菜单')"
                @click="closeMenu"
              />
              <section class="mh5-chat-game-menu__panel" :aria-label="$t('切换游戏')">
                <div class="mh5-chat-game-menu__actions">
                  <button
                    v-for="item in CHAT_GAME_MENU_ACTIONS"
                    :key="item.id"
                    type="button"
                    class="mh5-chat-game-menu__quick"
                    @click="onMenuAction(item.id)"
                  >
                    <span class="mh5-chat-game-menu__quick-ico" v-html="item.icon" />
                    <span class="mh5-chat-game-menu__quick-txt">{{ $t(item.label) }}</span>
                  </button>
                </div>
                <div class="mh5-chat-game-menu__switch">
                  <h3 class="mh5-chat-game-menu__title">{{ $t('切换游戏') }}</h3>
                  <div class="mh5-chat-game-menu__cats">
                    <button
                      v-for="item in CHAT_GAME_MENU_CATEGORIES"
                      :key="item.id"
                      type="button"
                      class="mh5-chat-game-menu__cat"
                      @click="onMenuCategory(item.label)"
                    >
                      <span class="mh5-chat-game-menu__cat-ico" v-html="item.icon" />
                      <span class="mh5-chat-game-menu__cat-txt">{{ $t(item.label) }}</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  class="mh5-chat-game-menu__handle"
                  :aria-label="$t('收起游戏菜单')"
                  @click="closeMenu"
                >
                  <img :src="CHAT_GROUP_GAME_ASSETS.menuHandle" alt="" width="90" height="19" />
                </button>
              </section>
            </div>
          </Transition>
        </template>
      </section>

      <div
        v-if="dockOpen"
        class="mh5-chat-game-dock"
        :style="{ height: `${dockSlotH}px` }"
      >
        <div v-if="mode === 'dock'" class="mh5-chat-game-dock__bar">
          <button
            type="button"
            class="mh5-chat-game-dock__close"
            :aria-label="$t('关闭游戏')"
            @click.stop="close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-chat-game-dock__title"
            :aria-label="$t('打开游戏')"
            @click="expandFromDock"
          >
            {{ $t(gameName) }}
          </button>
          <span class="mh5-chat-game-dock__spacer" aria-hidden="true" />
        </div>
      </div>

      <Transition name="mh5-toast">
        <p v-if="toast" class="mh5-wallet-transfer-toast">{{ toast }}</p>
      </Transition>
    </div>
</template>
