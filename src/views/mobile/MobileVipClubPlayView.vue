<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VIP_CLUB_ASSETS,
  VIP_CLUB_SPORTS_ASSETS,
  VIP_CLUB_SPORTS_CATS,
  VIP_CLUB_SPORTS_NAV,
  VIP_CLUB_SPORTS_TABS,
  getVipClubLotteryGame,
  getVipClubVendor,
} from '../../constants/vipClub'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const toast = ref('')
const sportsTab = ref<(typeof VIP_CLUB_SPORTS_TABS)[number]['id']>('inplay')
const sportsNav = ref<(typeof VIP_CLUB_SPORTS_NAV)[number]['id']>('home')
const sportsCat = ref<(typeof VIP_CLUB_SPORTS_CATS)[number]['id']>('soccer')
const fontSize = ref<'large' | 'small'>('small')
let toastTimer = 0

const kind = computed(() => String(route.params.kind || ''))
const id = computed(() => String(route.params.id || ''))

const lotteryGame = computed(() =>
  kind.value === 'lottery' ? getVipClubLotteryGame(id.value) : null,
)
const vendor = computed(() =>
  kind.value === 'live' || kind.value === 'slot' ? getVipClubVendor(kind.value, id.value) : null,
)

const pageTitle = computed(() => {
  if (kind.value === 'sports') return '金刚体育'
  if (lotteryGame.value) return lotteryGame.value.title
  if (vendor.value) return vendor.value.title
  return '进入游戏'
})

const missing = computed(() => {
  if (kind.value === 'sports') return false
  if (kind.value === 'lottery') return !lotteryGame.value
  if (kind.value === 'live' || kind.value === 'slot') return !vendor.value
  return true
})

function goToVipClub() {
  router.push({ name: 'mobile-vip-club' })
}

function showToast(message: string) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1600)
}

function onMatchClick() {
  showToast('进入盘口（原型）')
}

function onSportsNav(id: (typeof VIP_CLUB_SPORTS_NAV)[number]['id']) {
  sportsNav.value = id
  if (id !== 'home') showToast(`${VIP_CLUB_SPORTS_NAV.find((item) => item.id === id)?.label}（原型）`)
}

function onFilter(name: string) {
  showToast(`${name}（原型）`)
}

function refreshBalance() {
  showToast('余额已刷新（原型）')
}
</script>

<template>
  <div class="mh5-vip-club-play-page mh5-route-view" :class="{ 'mh5-vip-sports-page': kind === 'sports' }">
    <template v-if="kind === 'sports'">
      <header class="mh5-vip-sports-header">
        <button type="button" class="mh5-vip-sports-header__brand" aria-label="返回尊享专区" @click="goToVipClub">
          <img :src="VIP_CLUB_SPORTS_ASSETS.menu" alt="" width="20" height="20" />
          <img class="mh5-vip-sports-header__logo" :src="VIP_CLUB_SPORTS_ASSETS.logo" alt="KINGKONG" width="100" height="28" />
        </button>
        <button type="button" class="mh5-vip-sports-header__wallet" aria-label="刷新余额" @click="refreshBalance">
          <img :src="VIP_CLUB_SPORTS_ASSETS.refresh" alt="" width="20" height="20" />
          <span>888,688,00 CNY</span>
        </button>
      </header>

      <nav class="mh5-vip-sports-tabs" aria-label="盘口分类">
        <button
          v-for="tab in VIP_CLUB_SPORTS_TABS"
          :key="tab.id"
          type="button"
          class="mh5-vip-sports-tabs__item"
          :class="{ 'is-active': sportsTab === tab.id }"
          @click="sportsTab = tab.id"
        >
          {{ tab.label }}<em>({{ tab.count }})</em>
        </button>
      </nav>

      <div class="mh5-vip-sports-cats" aria-label="球类">
        <button
          v-for="cat in VIP_CLUB_SPORTS_CATS"
          :key="cat.id"
          type="button"
          class="mh5-vip-sports-cat"
          :class="{ 'is-active': sportsCat === cat.id }"
          @click="sportsCat = cat.id"
        >
          <img :src="cat.icon" :alt="cat.label" width="32" height="32" />
          <span>{{ cat.label }}</span>
          <em>（{{ cat.count }}）</em>
        </button>
      </div>

      <div class="mh5-vip-sports-filter">
        <button type="button" class="mh5-vip-sports-filter__league" @click="onFilter('联赛')">
          联赛
          <img :src="VIP_CLUB_SPORTS_ASSETS.iconSort" alt="" width="16" height="16" />
          时间
        </button>
        <span class="mh5-vip-sports-filter__font">
          字体:
          <button type="button" :class="{ 'is-on': fontSize === 'large' }" @click="fontSize = 'large'">大</button>
          <img :src="VIP_CLUB_SPORTS_ASSETS.iconSort" alt="" width="16" height="16" />
          <button type="button" :class="{ 'is-on': fontSize === 'small' }" @click="fontSize = 'small'">小</button>
        </span>
        <button type="button" class="mh5-vip-sports-filter__more" @click="onFilter('筛选')">
          筛选
          <img :src="VIP_CLUB_SPORTS_ASSETS.iconFilter" alt="" width="16" height="16" />
          <img :src="VIP_CLUB_SPORTS_ASSETS.iconCollapse" alt="" width="16" height="16" />
        </button>
      </div>

      <main class="mh5-vip-sports-main">
        <button type="button" class="mh5-vip-sports-match" aria-label="欧洲足球锦标赛 曼彻斯特对切尔西" @click="onMatchClick">
          <img :src="VIP_CLUB_SPORTS_ASSETS.matchCard" alt="欧洲足球锦标赛 曼彻斯特 2-1 切尔西" width="355" height="349" />
        </button>
        <button type="button" class="mh5-vip-sports-match" aria-label="欧洲足球锦标赛 曼彻斯特对切尔西" @click="onMatchClick">
          <img :src="VIP_CLUB_SPORTS_ASSETS.matchCard" alt="欧洲足球锦标赛 曼彻斯特 2-1 切尔西" width="355" height="349" />
        </button>
      </main>

      <nav class="mh5-vip-sports-dock" aria-label="体育导航">
        <button
          v-for="item in VIP_CLUB_SPORTS_NAV"
          :key="item.id"
          type="button"
          :class="{ 'is-active': sportsNav === item.id }"
          @click="onSportsNav(item.id)"
        >
          <span class="mh5-vip-sports-dock__icon">
            <img :src="item.icon" alt="" width="24" height="24" />
            <i v-if="item.badge">{{ item.badge }}</i>
          </span>
          {{ item.label }}
        </button>
      </nav>
    </template>

    <template v-else>
      <main v-if="!missing" class="mh5-vip-club-play-body">
        <p class="mh5-vip-club-play-kicker">{{ pageTitle }}</p>
        <p class="mh5-vip-club-play-hint">游戏加载中（原型占位）</p>
      </main>
      <main v-else class="mh5-vip-club-play-body">
        <p class="mh5-vip-club-play-hint">未找到该游戏</p>
      </main>
    </template>

    <button
      type="button"
      class="mh5-vip-club-collapse"
      aria-label="返回贵宾会"
      @click="goToVipClub"
    >
      <img :src="VIP_CLUB_ASSETS.collapseTab" alt="" width="90" height="17" />
    </button>

    <Transition name="mh5-toast">
      <p v-if="toast" class="mh5-wallet-transfer-toast">{{ toast }}</p>
    </Transition>
  </div>
</template>
