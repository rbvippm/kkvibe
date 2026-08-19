<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LOBBY_ANNOUNCEMENT,
  LOBBY_CASH_CURRENCY_OPTIONS,
  LOBBY_CATEGORIES,
  LOBBY_CATEGORY_EMPTY,
  LOBBY_FEATURED_BANNER,
  LOBBY_MODES,
  formatLobbyCurrencyBalance,
  gamesForCategory,
  hasSeenLobbyHallSwitchHint,
  markLobbyHallSwitchHintSeen,
  memberHasCreditLimit,
  type LobbyCategory,
  type LobbyCurrencyId,
  type LobbyMode,
} from '../../constants/mobileLobby'
import { LOBBY_ASSETS } from '../../constants/mobileLobbyAssets'
import { VIP_CLUB_ASSETS } from '../../constants/vipClub'
import { walletTransferRoute } from '../../constants/walletTransfer'
import {
  effectiveFlagshipCurrency,
  pickLobbyCurrency,
  sortByLocaleCashOrder,
} from '../../i18n'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'

const router = useRouter()
const route = useRoute()
const activeMode = ref<LobbyMode>('social')
const activeCategory = ref<LobbyCategory>('hot')
const favorites = ref<Set<string>>(new Set())
const floatCollapsed = ref(false)
const currencyPickerOpen = ref(false)
const vipMenuOpen = ref(false)
const hallSwitchHintOpen = ref(false)
const selectedCurrencyId = computed({
  get: () => effectiveFlagshipCurrency.value as LobbyCurrencyId,
  set: (id: LobbyCurrencyId) => pickLobbyCurrency(id),
})
const lobbyCurrencyOptions = computed(() =>
  sortByLocaleCashOrder(LOBBY_CASH_CURRENCY_OPTIONS, (item) => item.id),
)

const filteredGames = computed(() => gamesForCategory(activeCategory.value))
const categoryEmpty = computed(() => LOBBY_CATEGORY_EMPTY[activeCategory.value])
const showBanner = computed(() => activeCategory.value === 'hot')

const selectedCurrency = computed(
  () =>
    LOBBY_CASH_CURRENCY_OPTIONS.find((item) => item.id === selectedCurrencyId.value) ??
    LOBBY_CASH_CURRENCY_OPTIONS[0],
)

const selectedBalanceText = computed(() => formatLobbyCurrencyBalance(selectedCurrency.value.balance))
const walletIconCode = computed(() => selectedCurrency.value.name)

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

function dismissHallSwitchHint() {
  if (!hallSwitchHintOpen.value) return
  hallSwitchHintOpen.value = false
  markLobbyHallSwitchHintSeen()
}

function toggleVipMenu() {
  dismissHallSwitchHint()
  vipMenuOpen.value = !vipMenuOpen.value
}

function goVipClub() {
  vipMenuOpen.value = false
  dismissHallSwitchHint()
  router.push({ name: 'mobile-vip-club' })
}

function pickCurrency(id: LobbyCurrencyId) {
  selectedCurrencyId.value = id
  currencyPickerOpen.value = false
}

const LOGO_HINT_WINDOW_MS = 1200
const logoTapCount = ref(0)
let logoTapTimer: ReturnType<typeof setTimeout> | null = null

function showHallSwitchHint() {
  hallSwitchHintOpen.value = true
}

function onLogoTap() {
  if (logoTapTimer) clearTimeout(logoTapTimer)
  logoTapCount.value += 1
  if (logoTapCount.value >= 3) {
    logoTapCount.value = 0
    showHallSwitchHint()
    return
  }
  logoTapTimer = setTimeout(() => {
    logoTapCount.value = 0
    logoTapTimer = null
  }, LOGO_HINT_WINDOW_MS)
}

const forceHallSwitchHint = computed(() => {
  const value = route.query.hallHint
  const token = Array.isArray(value) ? value[0] : value
  return token === '1' || token === 'true' || token === 'demo'
})

watch(
  forceHallSwitchHint,
  (force) => {
    if (force || (memberHasCreditLimit() && !hasSeenLobbyHallSwitchHint())) {
      hallSwitchHintOpen.value = true
      return
    }
    if (!force) hallSwitchHintOpen.value = false
  },
  { immediate: true },
)
</script>

<template>
  <div class="mh5-lobby-page">
    <header class="mh5-lobby-header">
      <div class="mh5-lobby-header__brand">
        <button
          type="button"
          class="mh5-lobby-header__menu"
          :aria-label="vipMenuOpen ? '关闭入口' : '打开入口'"
          :aria-expanded="vipMenuOpen"
          aria-controls="lobby-vip-menu"
          :class="{ 'mh5-lobby-header__menu--hint': hallSwitchHintOpen }"
          @click="toggleVipMenu"
        >
          <img :src="LOBBY_ASSETS.menu" alt="" width="20" height="20" />
        </button>
        <button
          type="button"
          class="mh5-lobby-header__logo-btn"
          :aria-label="$t('金刚 KING KONG')"
          @click="onLogoTap"
        >
          <img
            class="mh5-lobby-header__logo"
            :src="LOBBY_ASSETS.logo"
            alt=""
            width="85"
            height="36"
          />
        </button>
      </div>

      <div class="mh5-lobby-header__actions">
        <div class="mh5-lobby-wallet">
          <button type="button" class="mh5-lobby-wallet__add" :aria-label="$t('充值')" @click="goDeposit">
            <img :src="LOBBY_ASSETS.walletAdd" alt="" width="10" height="10" />
          </button>
          <button
            type="button"
            class="mh5-lobby-wallet__pill"
            :aria-label="$t('切换币种')"
            @click="currencyPickerOpen = true; vipMenuOpen = false; dismissHallSwitchHint()"
          >
            <img
              v-if="selectedCurrency.id === 'kkc'"
              class="mh5-lobby-wallet__coin"
              :src="LOBBY_ASSETS.walletKkc"
              alt=""
              width="20"
              height="20"
            />
            <Mh5CurrencyIcon v-else class="mh5-lobby-wallet__coin" :code="walletIconCode" :size="20" />
            <span class="mh5-lobby-wallet__balance">{{ selectedBalanceText }}</span>
            <span class="mh5-lobby-wallet__chevron">
              <img :src="LOBBY_ASSETS.walletChevron" alt="" width="10" height="6" />
            </span>
          </button>
        </div>
        <button type="button" class="mh5-lobby-header__history" :aria-label="$t('投注记录')" @click="goBetRecords">
          <img :src="LOBBY_ASSETS.history" alt="" width="20" height="20" />
        </button>
      </div>
    </header>

    <Transition name="mh5-lobby-hall-hint">
      <div v-if="hallSwitchHintOpen" class="mh5-lobby-hall-hint">
        <button type="button" class="mh5-lobby-hall-hint__mask" aria-label="关闭提示" @click="dismissHallSwitchHint" />
        <div class="mh5-lobby-hall-hint__card" role="status">
          <img
            class="mh5-lobby-hall-hint__vip"
            :src="LOBBY_ASSETS.vipEntry"
            alt=""
            width="40"
            height="40"
          />
          <div class="mh5-lobby-hall-hint__copy">
            <p class="mh5-lobby-hall-hint__title">{{ $t('点左上角可切换贵宾厅') }}</p>
            <p class="mh5-lobby-hall-hint__desc">{{ $t('信用额度会员专属入口') }}</p>
          </div>
          <button type="button" class="mh5-lobby-hall-hint__ok" @click="dismissHallSwitchHint">
            {{ $t('知道了') }}
          </button>
        </div>
      </div>
    </Transition>

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

    <Transition name="mh5-lobby-vip-menu">
      <div v-if="vipMenuOpen" id="lobby-vip-menu" class="mh5-lobby-vip-menu">
        <button type="button" class="mh5-lobby-vip-menu__mask" aria-label="关闭入口" @click="vipMenuOpen = false" />
        <div class="mh5-lobby-vip-menu__panel" role="dialog" aria-modal="true" aria-labelledby="lobby-vip-menu-title">
          <p id="lobby-vip-menu-title" class="mh5-lobby-vip-menu__sr">选择入口</p>
          <button type="button" class="mh5-lobby-vip-menu__item" @click="goVipClub">
            <span class="mh5-lobby-vip-menu__lead">
              <img
                class="mh5-lobby-vip-menu__icon mh5-lobby-vip-menu__icon--chair"
                :src="VIP_CLUB_ASSETS.chair"
                alt=""
                width="32"
                height="32"
              />
              <span class="mh5-lobby-vip-menu__name">{{ $t('贵宾厅') }}</span>
            </span>
            <img class="mh5-lobby-vip-menu__arrow" :src="LOBBY_ASSETS.arrowRight" alt="" width="12" height="12" />
          </button>
        </div>
      </div>
    </Transition>

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
