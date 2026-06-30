<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  LOBBY_ANNOUNCEMENT,
  LOBBY_CATEGORIES,
  LOBBY_CATEGORY_EMPTY,
  LOBBY_FEATURED_BANNER,
  LOBBY_MODES,
  LOBBY_WALLET,
  gamesForCategory,
  type LobbyCategory,
  type LobbyMode,
} from '../../constants/mobileLobby'
import { LOBBY_ASSETS } from '../../constants/mobileLobbyAssets'

const router = useRouter()
const activeMode = ref<LobbyMode>('social')
const activeCategory = ref<LobbyCategory>('hot')
const favorites = ref<Set<string>>(new Set())
const floatCollapsed = ref(false)

const filteredGames = computed(() => gamesForCategory(activeCategory.value))
const categoryEmpty = computed(() => LOBBY_CATEGORY_EMPTY[activeCategory.value])
const showBanner = computed(() => activeCategory.value === 'hot')

function toggleFavorite(id: string) {
  const next = new Set(favorites.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  favorites.value = next
}

function goBilling() {
  router.push({ name: 'mobile-billing-list' })
}
</script>

<template>
  <div class="mh5-lobby-page">
    <header class="mh5-lobby-header">
      <img class="mh5-lobby-header__logo" :src="LOBBY_ASSETS.logo" alt="金刚 KING KONG" width="148" height="36" />

      <div class="mh5-lobby-wallet">
        <button type="button" class="mh5-lobby-wallet__add" aria-label="充值">
          <img :src="LOBBY_ASSETS.walletAdd" alt="" width="18" height="18" />
        </button>
        <button type="button" class="mh5-lobby-wallet__pill" aria-label="切换币种">
          <img class="mh5-lobby-wallet__coin" :src="LOBBY_ASSETS.walletKkc" alt="" width="22" height="22" />
          <span class="mh5-lobby-wallet__currency">{{ LOBBY_WALLET.currency }}</span>
          <span class="mh5-lobby-wallet__balance">{{ LOBBY_WALLET.balance }}</span>
          <svg class="mh5-lobby-wallet__chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <button type="button" class="mh5-lobby-header__history" aria-label="账单" @click="goBilling">
        <img :src="LOBBY_ASSETS.history" alt="" width="22" height="22" />
      </button>
    </header>

    <div class="mh5-lobby-notice" aria-label="公告">
      <img class="mh5-lobby-notice__icon" :src="LOBBY_ASSETS.speaker" alt="" width="16" height="16" />
      <div class="mh5-lobby-notice__track">
        <p class="mh5-lobby-notice__text">
          <span>{{ LOBBY_ANNOUNCEMENT }}</span>
          <span aria-hidden="true">{{ LOBBY_ANNOUNCEMENT }}</span>
        </p>
      </div>
    </div>

    <div class="mh5-lobby-body">
      <main class="mh5-lobby-main">
        <div class="mh5-lobby-mode" role="tablist" aria-label="模式切换">
          <button
            v-for="mode in LOBBY_MODES"
            :key="mode.key"
            type="button"
            role="tab"
            class="mh5-lobby-mode__btn"
            :class="{ 'mh5-lobby-mode__btn--active': activeMode === mode.key }"
            :aria-selected="activeMode === mode.key"
            @click="activeMode = mode.key"
          >
            <img :src="mode.icon" alt="" width="28" height="28" />
            <span>{{ mode.label }}</span>
          </button>
        </div>

        <div class="mh5-lobby-cats" role="tablist" aria-label="分类导航">
          <button
            v-for="cat in LOBBY_CATEGORIES"
            :key="cat.key"
            type="button"
            role="tab"
            class="mh5-lobby-cat"
            :class="{ 'mh5-lobby-cat--active': activeCategory === cat.key }"
            :aria-selected="activeCategory === cat.key"
            @click="activeCategory = cat.key"
          >
            <span class="mh5-lobby-cat__icon-wrap">
              <img class="mh5-lobby-cat__icon" :src="cat.icon" alt="" width="48" height="48" />
            </span>
            <span class="mh5-lobby-cat__label">{{ cat.label }}</span>
          </button>
        </div>

        <section v-if="showBanner" class="mh5-lobby-banner" aria-label="活动横幅">
          <div class="mh5-lobby-banner__card">
            <div class="mh5-lobby-banner__content">
              <h2 class="mh5-lobby-banner__title">{{ LOBBY_FEATURED_BANNER.title }}</h2>
              <p class="mh5-lobby-banner__status">{{ LOBBY_FEATURED_BANNER.status }}</p>
              <span class="mh5-lobby-banner__tag">{{ LOBBY_FEATURED_BANNER.subtitle }}</span>
            </div>
            <div class="mh5-lobby-banner__deco" aria-hidden="true">
              <span class="mh5-lobby-banner__year">{{ LOBBY_FEATURED_BANNER.year }}</span>
              <span class="mh5-lobby-banner__trophy" />
            </div>
          </div>
        </section>

        <section class="mh5-lobby-games" aria-label="游戏列表">
          <div v-if="!filteredGames.length" class="mh5-lobby-empty">
            <span class="mh5-lobby-empty__emoji" aria-hidden="true">{{ categoryEmpty.emoji }}</span>
            <p class="mh5-lobby-empty__title">{{ categoryEmpty.title }}</p>
            <p class="mh5-lobby-empty__desc">{{ categoryEmpty.desc }}</p>
          </div>

          <article v-for="game in filteredGames" :key="game.id" class="mh5-lobby-game">
            <div class="mh5-lobby-game__cover-wrap">
              <img class="mh5-lobby-game__cover" :src="game.cover" :alt="game.title" width="166" height="166" loading="lazy" />
              <span class="mh5-lobby-game__tag" :class="`mh5-lobby-game__tag--${game.tag.type}`">
                {{ game.tag.label }}
              </span>
              <button
                type="button"
                class="mh5-lobby-game__fav"
                :aria-label="favorites.has(game.id) ? '取消收藏' : '收藏'"
                @click="toggleFavorite(game.id)"
              >
                <img
                  :src="favorites.has(game.id) ? LOBBY_ASSETS.heartFilled : LOBBY_ASSETS.heart"
                  alt=""
                  width="18"
                  height="18"
                />
              </button>
            </div>
            <h3 class="mh5-lobby-game__title">{{ game.title }}</h3>
          </article>
        </section>

        <p v-if="filteredGames.length" class="mh5-lobby-end">没有更多了</p>
      </main>

      <aside class="mh5-lobby-float" :class="{ 'mh5-lobby-float--collapsed': floatCollapsed }" aria-label="快捷入口">
        <button type="button" class="mh5-lobby-float__item" aria-label="最爱">
          <img :src="LOBBY_ASSETS.floatFavorite" alt="" width="24" height="24" />
          <span>最爱</span>
        </button>
        <button type="button" class="mh5-lobby-float__item" aria-label="客服">
          <img :src="LOBBY_ASSETS.floatService" alt="" width="36" height="36" />
          <span>客服</span>
        </button>
        <button type="button" class="mh5-lobby-float__item" aria-label="活动">
          <img :src="LOBBY_ASSETS.floatActivity" alt="" width="28" height="28" />
          <span>活动</span>
        </button>
        <button
          type="button"
          class="mh5-lobby-float__collapse"
          :aria-label="floatCollapsed ? '展开' : '收起'"
          @click="floatCollapsed = !floatCollapsed"
        >
          <img
            :src="LOBBY_ASSETS.floatCollapse"
            alt=""
            width="12"
            height="12"
            :class="{ 'mh5-lobby-float__collapse-icon--flipped': floatCollapsed }"
          />
        </button>
      </aside>
    </div>
  </div>
</template>
