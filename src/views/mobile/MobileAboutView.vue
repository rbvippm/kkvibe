<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import { mineHomeRouteName } from '../../constants/mineHall'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const route = useRoute()

function goBack() {
  router.push({ name: mineHomeRouteName(route.query.from) })
}

function openDoc(title: string) {
  void mh5Alert({
    title,
    message: '原型占位，正式环境将打开对应协议全文',
    showCancel: false,
  })
}
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('关于我们')" :on-back="goBack" />
    <main class="mh5-settings-main mh5-mine-about">
      <section class="mh5-mine-about__hero">
        <strong>{{ $t('KK Vibe') }}</strong>
        <span>{{ $t('版本 1.0.0（原型）') }}</span>
        <p>{{ $t('为全球玩家提供直播、游戏与代理服务。') }}</p>
      </section>
      <section class="mh5-settings-group">
        <button type="button" class="mh5-settings-item" @click="openDoc('用户协议')">
          <span class="mh5-settings-item__title">{{ $t('用户协议') }}</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button type="button" class="mh5-settings-item" @click="openDoc('隐私政策')">
          <span class="mh5-settings-item__title">{{ $t('隐私政策') }}</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </section>
    </main>
  </div>
</template>
