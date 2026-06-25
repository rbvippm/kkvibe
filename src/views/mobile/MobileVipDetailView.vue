<script setup lang="ts">
import { computed, ref } from 'vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

const vip = ref({
  level: 1,
  need流水: 5,
})

const benefits = computed(() => {
  return [
    {
      lock: true,
      title: '晋级彩金',
      desc: `晋级即可获得 ${vip.value.level * 11}`,
      emoji: '🎁',
    },
    {
      lock: true,
      title: '每日返水',
      desc: `晋级即可享有返水 +${vip.value.level * 20}%`,
      emoji: '🏷',
    },
  ]
})
</script>

<template>
  <div class="mh5-vip-page">
    <Mh5SubPageHeader title="VIP 详情" />

    <main class="mh5-vip-body">
      <section class="mh5-vip-hero" aria-label="VIP 等级">
        <div class="mh5-vip-hero__badge" aria-hidden="true">
          <span class="mh5-vip-hero__badgeInner">VIP</span>
        </div>
        <div class="mh5-vip-hero__main">
          <div class="mh5-vip-hero__title">VIP{{ vip.level }}</div>
          <div class="mh5-vip-hero__sub">
            需达到流水要求
            <b class="mh5-vip-hero__num">{{ vip.need流水 }}</b>
          </div>
        </div>
      </section>

      <h2 class="mh5-vip-section-title">VIP{{ vip.level }} 专属福利</h2>

      <section class="mh5-vip-benefits">
        <article v-for="(b, i) in benefits" :key="i" class="mh5-vip-benefit">
          <div class="mh5-vip-benefit__left">
            <span v-if="b.lock" class="mh5-vip-benefit__lock" aria-hidden="true">🔒</span>
            <span class="mh5-vip-benefit__tag">VIP{{ vip.level }}</span>
            <div class="mh5-vip-benefit__text">
              <div class="mh5-vip-benefit__title">{{ b.title }}</div>
              <div class="mh5-vip-benefit__desc">{{ b.desc }}</div>
            </div>
          </div>
          <div class="mh5-vip-benefit__art" aria-hidden="true">{{ b.emoji }}</div>
        </article>
      </section>
    </main>
  </div>
</template>

