<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { VIP_CLUB_HALL_ASSETS, getVipClubHall } from '../../constants/vipClub'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const toast = ref('')
let toastTimer = 0

const hall = computed(() => getVipClubHall(String(route.params.hallId || '')))

const featureIcons = {
  sofa: VIP_CLUB_HALL_ASSETS.sofa,
  bell: VIP_CLUB_HALL_ASSETS.bell,
  crown: VIP_CLUB_HALL_ASSETS.crown,
} as const

function featureIcon(icon: keyof typeof featureIcons) {
  return featureIcons[icon]
}

function goBack() {
  router.push({ name: 'mobile-vip-club' })
}

function joinVipGroup() {
  toast.value = '已打开金刚 VIP 群（原型）'
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1600)
}
</script>

<template>
  <div class="mh5-vip-club-hall-page mh5-route-view">
    <Mh5SubPageHeader
      :title="hall ? hall.pageTitle : '贵宾厅'"
      :on-back="goBack"
    />

    <main v-if="hall" class="mh5-vip-club-hall-main">
      <section class="mh5-vip-club-hall-hero">
        <img :src="hall.hero" :alt="hall.heroTitle" />
      </section>

      <section class="mh5-vip-club-hall-features" aria-label="尊享服务">
        <div class="mh5-vip-club-hall-features__row">
          <span v-for="(item, index) in hall.features.slice(0, 3)" :key="item.label" class="mh5-vip-club-hall-feature">
            <img :src="featureIcon(item.icon)" alt="" />
            {{ item.label }}
            <i v-if="index !== 2" aria-hidden="true" />
          </span>
        </div>
        <div class="mh5-vip-club-hall-features__row">
          <span v-for="(item, index) in hall.features.slice(3)" :key="item.label" class="mh5-vip-club-hall-feature">
            <img :src="featureIcon(item.icon)" alt="" />
            {{ item.label }}
            <i v-if="index === 0" aria-hidden="true" />
          </span>
        </div>
      </section>

      <section v-if="hall.hotel" class="mh5-vip-club-hall-card">
        <img :src="hall.hotel" :alt="hall.brandName" />
        <img v-if="hall.id === 'macau'" class="mh5-vip-club-hall-card__logo" :src="VIP_CLUB_HALL_ASSETS.wynn" alt="" />
      </section>

      <section class="mh5-vip-club-hall-contact">
        <h2>联系方式</h2>
        <div class="mh5-vip-club-hall-contact__box">
          <p>点击下方 VIP群</p>
          <button type="button" class="mh5-vip-club-hall-contact__btn" @click="joinVipGroup">
            <img :src="VIP_CLUB_HALL_ASSETS.vipGroup" alt="" />
            <span>金刚 VIP 群</span>
          </button>
        </div>
      </section>

      <p class="mh5-vip-club-hall-note">
        <img :src="VIP_CLUB_HALL_ASSETS.age" alt="" width="16" height="16" />
        仅面向符合法定年龄及当地法律法规的用户，请理性娱乐。
      </p>
    </main>

    <main v-else class="mh5-sub-content mh5-vip-club-play-body">
      <p class="mh5-vip-club-play-hint">未找到该贵宾厅</p>
      <button type="button" class="mh5-vip-club-row__play" @click="goBack">返回尊享专区</button>
    </main>
    <Transition name="mh5-toast">
      <p v-if="toast" class="mh5-wallet-transfer-toast">{{ toast }}</p>
    </Transition>
  </div>
</template>
