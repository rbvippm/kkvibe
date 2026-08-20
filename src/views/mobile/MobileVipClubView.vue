<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5VipCreditAccountSheet from '../../components/mobile/Mh5VipCreditAccountSheet.vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import { formatCreditWalletBalance } from '../../constants/walletCatalog'
import { VIP_CLUB_ASSETS, VIP_CLUB_GAMES, VIP_CLUB_HALLS, getVipClubVendors, type VipClubGameAction, type VipClubVendorKind } from '../../constants/vipClub'
import { VIP_CLUB_ENTRY_SPEC } from '../../constants/vipClubSpec'
import { mineHallQuery } from '../../constants/mineHall'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const hallSheetOpen = ref(false)
const vendorSheetKind = ref<VipClubVendorKind | null>(null)
const accountSheetOpen = ref(false)
const hallMenuOpen = ref(false)

const { selectedWallet } = useVipCreditAccounts()
const selectedBalanceText = computed(() =>
  selectedWallet.value ? formatCreditWalletBalance(selectedWallet.value.balance) : '',
)

function goFlagshipHall() {
  hallMenuOpen.value = false
  router.push({ name: 'mobile-home' })
}

function goBetRecords() {
  router.push({ name: 'mobile-bet-records', query: mineHallQuery(true) })
}

function onGameAction(action: VipClubGameAction, key: string) {
  if (action === 'hall') {
    hallSheetOpen.value = true
    return
  }
  if (action === 'vendor') {
    vendorSheetKind.value = key === 'live' ? 'live' : 'slot'
    return
  }
  if (action === 'lottery') {
    router.push({ name: 'mobile-vip-club-lottery' })
    return
  }
  router.push({ name: 'mobile-vip-club-play', params: { kind: 'sports' } })
}

function openHall(id: string) {
  hallSheetOpen.value = false
  router.push({ name: 'mobile-vip-club-hall', params: { hallId: id } })
}

function openVendor(id: string) {
  const kind = vendorSheetKind.value
  if (!kind) return
  vendorSheetKind.value = null
  router.push({ name: 'mobile-vip-club-play', params: { kind, id } })
}

const vendorSheetTitle = computed(() =>
  vendorSheetKind.value === 'slot' ? '老虎机游戏' : '真人游戏',
)
const vendorOptions = computed(() =>
  vendorSheetKind.value ? getVipClubVendors(vendorSheetKind.value) : [],
)
</script>

<template>
  <div class="mh5-vip-club-page mh5-route-view">
    <header class="mh5-vip-club-header">
      <button
        type="button"
        class="mh5-vip-club-header__menu"
        :aria-label="hallMenuOpen ? '关闭入口' : '打开入口'"
        :aria-expanded="hallMenuOpen"
        aria-controls="vip-club-hall-menu"
        @click="hallMenuOpen = !hallMenuOpen"
      >
        <img :src="VIP_CLUB_ASSETS.menu" alt="" width="20" height="20" />
      </button>
      <div class="mh5-vip-club-header__brand">
        <img class="mh5-vip-club-header__logo" :src="VIP_CLUB_ASSETS.logo" alt="金刚 KING KONG" width="87" height="32" />
      </div>
      <Mh5SpecAnnot :spec="VIP_CLUB_ENTRY_SPEC" placement="bottom" />

      <button
        v-if="selectedWallet"
        type="button"
        class="mh5-vip-club-wallet"
        :aria-label="$t('信用额度')"
        @click="accountSheetOpen = true; hallMenuOpen = false"
      >
        <img class="mh5-vip-club-wallet__coin" :src="selectedWallet.icon" alt="" width="20" height="20" />
        <span class="mh5-vip-club-wallet__balance">{{ selectedBalanceText }}</span>
        <img class="mh5-vip-club-wallet__chevron" :src="VIP_CLUB_ASSETS.chevronDown" alt="" width="12" height="12" />
      </button>

      <button type="button" class="mh5-vip-club-header__history" :aria-label="$t('投注记录')" @click="goBetRecords">
        <img :src="VIP_CLUB_ASSETS.history" alt="" width="28" height="28" />
      </button>
    </header>

    <main class="mh5-vip-club-main">
      <section class="mh5-vip-club-hero" aria-label="金刚尊享专区">
        <div class="mh5-vip-club-hero__copy">
          <h1>金刚尊享专区</h1>
          <p>定制专属娱乐权益</p>
        </div>
        <img class="mh5-vip-club-hero__art" :src="VIP_CLUB_ASSETS.heroArt" alt="" width="140" height="136" />
      </section>

      <section class="mh5-vip-club-list" aria-label="尊享场馆">
        <article v-for="game in VIP_CLUB_GAMES" :key="game.key" class="mh5-vip-club-row">
          <div class="mh5-vip-club-row__cover">
            <img :src="game.cover" :alt="game.title" width="149" height="108" />
          </div>
          <div class="mh5-vip-club-row__body">
            <h2>{{ game.title }}</h2>
            <p>{{ game.desc }}</p>
            <button type="button" class="mh5-vip-club-row__play" @click="onGameAction(game.action, game.key)">
              立即游戏
              <img :src="VIP_CLUB_ASSETS.arrowRight" alt="" width="12" height="12" />
            </button>
          </div>
        </article>
      </section>
    </main>

    <Transition name="mh5-lobby-vip-menu">
      <div v-if="hallMenuOpen" id="vip-club-hall-menu" class="mh5-lobby-vip-menu">
        <button type="button" class="mh5-lobby-vip-menu__mask" aria-label="关闭入口" @click="hallMenuOpen = false" />
        <div class="mh5-lobby-vip-menu__panel" role="dialog" aria-modal="true" aria-labelledby="vip-club-hall-menu-title">
          <p id="vip-club-hall-menu-title" class="mh5-lobby-vip-menu__sr">选择入口</p>
          <button type="button" class="mh5-lobby-vip-menu__item mh5-lobby-vip-menu__item--dark" @click="goFlagshipHall">
            <span class="mh5-lobby-vip-menu__lead">
              <img
                class="mh5-lobby-vip-menu__icon mh5-lobby-vip-menu__icon--mark"
                :src="VIP_CLUB_ASSETS.logoMark"
                alt=""
                width="24"
                height="24"
              />
              <span class="mh5-lobby-vip-menu__name">{{ $t('旗舰厅') }}</span>
            </span>
            <img class="mh5-lobby-vip-menu__arrow" :src="VIP_CLUB_ASSETS.arrowRight" alt="" width="12" height="12" />
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-sheet">
      <div
        v-if="vendorSheetKind"
        class="mh5-vip-club-sheet-mask"
        @click.self="vendorSheetKind = null"
      >
        <div
          class="mh5-vip-club-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-club-vendor-sheet-title"
        >
          <div class="mh5-vip-club-sheet__head">
            <h2 id="vip-club-vendor-sheet-title">{{ vendorSheetTitle }}</h2>
            <button type="button" class="mh5-vip-club-sheet__close" aria-label="关闭" @click="vendorSheetKind = null">
              <img :src="VIP_CLUB_ASSETS.close" alt="" width="14" height="14" />
            </button>
          </div>
          <button
            v-for="vendor in vendorOptions"
            :key="vendor.id"
            type="button"
            class="mh5-vip-club-hall-item"
            @click="openVendor(vendor.id)"
          >
            <span class="mh5-vip-club-vendor-logo">
              <img :src="vendor.logo" :alt="vendor.title" width="28" height="28" />
            </span>
            <span class="mh5-vip-club-hall-item__text">
              <strong>{{ vendor.title }}</strong>
              <em>{{ vendor.desc }}</em>
            </span>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-sheet">
      <div
        v-if="hallSheetOpen"
        class="mh5-vip-club-sheet-mask"
        @click.self="hallSheetOpen = false"
      >
        <div
          class="mh5-vip-club-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-club-hall-sheet-title"
        >
          <div class="mh5-vip-club-sheet__head">
            <h2 id="vip-club-hall-sheet-title">尊贵贵宾厅</h2>
            <button type="button" class="mh5-vip-club-sheet__close" aria-label="关闭" @click="hallSheetOpen = false">
              <img :src="VIP_CLUB_ASSETS.close" alt="" width="14" height="14" />
            </button>
          </div>
          <button
            v-for="hall in VIP_CLUB_HALLS"
            :key="hall.id"
            type="button"
            class="mh5-vip-club-hall-item"
            @click="openHall(hall.id)"
          >
            <span class="mh5-vip-club-hall-item__flag">
              <img :src="hall.flag" alt="" width="28" height="28" />
            </span>
            <span class="mh5-vip-club-hall-item__text">
              <strong>{{ hall.pickerTitle }}</strong>
              <em>{{ hall.pickerDesc }}</em>
            </span>
          </button>
        </div>
      </div>
    </Transition>

    <Mh5VipCreditAccountSheet :open="accountSheetOpen" @close="accountSheetOpen = false" />
  </div>
</template>
