<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  LOBBY_ANNOUNCEMENT,
  LOBBY_CATEGORIES,
  LOBBY_CATEGORY_EMPTY,
  LOBBY_CURRENCY_OPTIONS,
  LOBBY_FEATURED_BANNER,
  LOBBY_MODES,
  formatLobbyCurrencyBalance,
  gamesForCategory,
  type LobbyCategory,
  type LobbyCurrencyId,
  type LobbyMode,
} from '../../constants/mobileLobby'
import { LOBBY_ASSETS } from '../../constants/mobileLobbyAssets'
import { walletTransferRoute } from '../../constants/walletTransfer'
import {
  effectiveLobbyCurrency,
  pickLobbyCurrency,
  sortByLocaleCashOrder,
} from '../../i18n'

const router = useRouter()
const activeMode = ref<LobbyMode>('social')
const activeCategory = ref<LobbyCategory>('hot')
const favorites = ref<Set<string>>(new Set())
const floatCollapsed = ref(false)
const currencyPickerOpen = ref(false)
const selectedCurrencyId = computed({
  get: () => effectiveLobbyCurrency.value as LobbyCurrencyId,
  set: (id: LobbyCurrencyId) => pickLobbyCurrency(id),
})
const lobbyCurrencyOptions = computed(() =>
  sortByLocaleCashOrder(LOBBY_CURRENCY_OPTIONS, (item) => item.id),
)

const filteredGames = computed(() => gamesForCategory(activeCategory.value))
const categoryEmpty = computed(() => LOBBY_CATEGORY_EMPTY[activeCategory.value])
const showBanner = computed(() => activeCategory.value === 'hot')

const selectedCurrency = computed(
  () => LOBBY_CURRENCY_OPTIONS.find((item) => item.id === selectedCurrencyId.value) ?? LOBBY_CURRENCY_OPTIONS[0],
)

const selectedBalanceText = computed(() => formatLobbyCurrencyBalance(selectedCurrency.value.balance))

function toggleFavorite(id: string) {
  const next = new Set(favorites.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  favorites.value = next
}

function goBetRecords() {
  router.push({ name: 'mobile-bet-records' })
}

function goDeposit() {
  router.push(walletTransferRoute('deposit'))
}

function pickCurrency(id: LobbyCurrencyId) {
  selectedCurrencyId.value = id
  currencyPickerOpen.value = false
}
</script>

<template>
  <div class="mh5-lobby-page">
    <header class="mh5-lobby-header">
      <img class="mh5-lobby-header__logo" :src="LOBBY_ASSETS.logo" :alt="$t('金刚 KING KONG')" width="148" height="36" />

      <div class="mh5-lobby-wallet">
        <button type="button" class="mh5-lobby-wallet__add" :aria-label="$t('充值')" @click="goDeposit">
          <img :src="LOBBY_ASSETS.walletAdd" alt="" width="18" height="18" />
        </button>
        <button
          type="button"
          class="mh5-lobby-wallet__pill"
          :aria-label="$t('切换币种')"
          @click="currencyPickerOpen = true"
        >
          <img
            v-if="selectedCurrency.id === 'kkc'"
            class="mh5-lobby-wallet__coin"
            :src="LOBBY_ASSETS.walletKkc"
            alt=""
            width="22"
            height="22"
          />
          <span
            v-else
            class="mh5-lobby-wallet__coin-fallback"
            :style="{ background: selectedCurrency.color }"
            aria-hidden="true"
          >
            {{ selectedCurrency.symbol }}
          </span>
          <span class="mh5-lobby-wallet__currency">{{ $t(selectedCurrency.name) }}</span>
          <span class="mh5-lobby-wallet__balance">{{ selectedBalanceText }}</span>
          <svg class="mh5-lobby-wallet__chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <button type="button" class="mh5-lobby-header__history" :aria-label="$t('投注记录')" @click="goBetRecords">
        <img :src="LOBBY_ASSETS.history" alt="" width="22" height="22" />
      </button>
    </header>

    <div class="mh5-lobby-notice" :aria-label="$t('公告')">
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
        <div class="mh5-lobby-mode" role="tablist" :aria-label="$t('模式切换')">
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
            <span>{{ $t(mode.label) }}</span>
          </button>
        </div>

        <div class="mh5-lobby-cats" role="tablist" :aria-label="$t('分类导航')">
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
            <span class="mh5-lobby-cat__label">{{ $t(cat.label) }}</span>
          </button>
        </div>

        <section v-if="showBanner" class="mh5-lobby-banner" :aria-label="$t('活动横幅')">
          <div class="mh5-lobby-banner__card">
            <div class="mh5-lobby-banner__content">
              <h2 class="mh5-lobby-banner__title">{{ $t(LOBBY_FEATURED_BANNER.title) }}</h2>
              <p class="mh5-lobby-banner__status">{{ LOBBY_FEATURED_BANNER.status }}</p>
              <span class="mh5-lobby-banner__tag">{{ LOBBY_FEATURED_BANNER.subtitle }}</span>
            </div>
            <div class="mh5-lobby-banner__deco" aria-hidden="true">
              <span class="mh5-lobby-banner__year">{{ LOBBY_FEATURED_BANNER.year }}</span>
              <span class="mh5-lobby-banner__trophy" />
            </div>
          </div>
        </section>

        <section class="mh5-lobby-games" :aria-label="$t('游戏列表')">
          <div v-if="!filteredGames.length" class="mh5-lobby-empty">
            <span class="mh5-lobby-empty__emoji" aria-hidden="true">{{ categoryEmpty.emoji }}</span>
            <p class="mh5-lobby-empty__title">{{ $t(categoryEmpty.title) }}</p>
            <p class="mh5-lobby-empty__desc">{{ categoryEmpty.desc }}</p>
          </div>

          <article v-for="game in filteredGames" :key="game.id" class="mh5-lobby-game">
            <div class="mh5-lobby-game__cover-wrap">
              <img class="mh5-lobby-game__cover" :src="game.cover" :alt="game.title" width="166" height="166" loading="lazy" />
              <span class="mh5-lobby-game__tag" :class="`mh5-lobby-game__tag--${game.tag.type}`">
                {{ $t(game.tag.label) }}
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
            <h3 class="mh5-lobby-game__title">{{ $t(game.title) }}</h3>
          </article>
        </section>

        <p v-if="filteredGames.length" class="mh5-lobby-end">{{ $t('没有更多了') }}</p>
      </main>

      <aside class="mh5-lobby-float" :class="{ 'mh5-lobby-float--collapsed': floatCollapsed }" :aria-label="$t('快捷入口')">
        <button type="button" class="mh5-lobby-float__item" :aria-label="$t('最爱')">
          <img :src="LOBBY_ASSETS.floatFavorite" alt="" width="24" height="24" />
          <span>{{ $t('最爱') }}</span>
        </button>
        <button type="button" class="mh5-lobby-float__item" :aria-label="$t('客服')">
          <img :src="LOBBY_ASSETS.floatService" alt="" width="36" height="36" />
          <span>{{ $t('客服') }}</span>
        </button>
        <button type="button" class="mh5-lobby-float__item" :aria-label="$t('活动')">
          <img :src="LOBBY_ASSETS.floatActivity" alt="" width="28" height="28" />
          <span>{{ $t('活动') }}</span>
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

    <Teleport to="body">
      <Transition name="mh5-wallet-sheet">
        <div
          v-if="currencyPickerOpen"
          class="mh5-agent-overlay-mask"
          @click.self="currencyPickerOpen = false"
        >
          <div
            class="mh5-wallet-sheet agent-currency-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lobby-currency-sheet-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="lobby-currency-sheet-title" class="mh5-wallet-sheet__title">{{ $t('选择币种') }}</h2>
              <button
                type="button"
                class="mh5-wallet-sheet__close"
                :aria-label="$t('关闭')"
                @click="currencyPickerOpen = false"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <div class="mh5-wallet-sheet__list agent-currency-sheet__list">
              <button
                v-for="item in lobbyCurrencyOptions"
                :key="item.id"
                type="button"
                class="agent-currency-sheet__item"
                :class="{
                  'agent-currency-sheet__item--active': selectedCurrencyId === item.id,
                  'agent-currency-sheet__item--credit': item.isCredit,
                }"
                @click="pickCurrency(item.id)"
              >
                <span
                  class="agent-currency-sheet__icon"
                  :style="{ background: item.color }"
                  aria-hidden="true"
                >
                  {{ item.symbol }}
                </span>
                <span class="agent-currency-sheet__meta">
                  <span class="agent-currency-sheet__name">{{ $t(item.name) }}</span>
                  <span v-if="item.isCredit" class="mh5-lobby-currency-tip-inline">{{ $t('仅限特定游戏使用') }}</span>
                </span>
                <span
                  v-if="selectedCurrencyId === item.id"
                  class="agent-currency-sheet__check agent-currency-sheet__check--active"
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2l2.4 2.4 4.6-5"
                      stroke="#fff"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
