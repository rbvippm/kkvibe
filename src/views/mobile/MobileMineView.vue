<script setup lang="ts">
import { ref } from 'vue'
import '../../styles/mobile-app-shell.css'

const balanceHidden = ref(true)

const user = {
  name: 'EZ1',
  id: 'mid_yly487ecnmd',
  avatar: 'E',
}

const assets = [
  { name: '活动金', icon: '🎁', available: '1,280.00', frozen: '0.00' },
  { name: 'KKC', icon: 'K', available: '52,600.00', frozen: '200.00' },
  { name: 'USDT-TRON', icon: '₮', available: '3,450.00', frozen: '0.00' },
  { name: 'USDT-SOL', icon: '₮', available: '890.00', frozen: '0.00' },
  { name: 'ETH', icon: 'Ξ', available: '0.42', frozen: '0.00' },
]

function mask(value: string) {
  return balanceHidden.value ? '******' : value
}
</script>

<template>
  <div class="mh5-mine-page">
    <div class="mh5-mine-topbar">
      <button type="button" class="mh5-mine-topbar__btn" aria-label="客服">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 14v2a2 2 0 002 2h1l2 3 4-3h5a2 2 0 002-2v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v6z" stroke="currentColor" stroke-width="1.6" />
          <circle cx="9" cy="11" r="1" fill="currentColor" />
          <circle cx="12" cy="11" r="1" fill="currentColor" />
          <circle cx="15" cy="11" r="1" fill="currentColor" />
        </svg>
      </button>
      <button type="button" class="mh5-mine-topbar__btn" aria-label="设置">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <section class="mh5-mine-profile">
      <div class="mh5-mine-profile__avatar">{{ user.avatar }}</div>
      <div class="mh5-mine-profile__info">
        <h2 class="mh5-mine-profile__name">{{ user.name }}</h2>
        <p class="mh5-mine-profile__id">MiCall号：{{ user.id }}</p>
      </div>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="text-[var(--mh5-app-text-secondary)]" aria-hidden="true">
        <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </section>

    <div class="mh5-mine-actions">
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon">💳</span>
        充值
      </button>
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon">💰</span>
        提现
      </button>
    </div>

    <section class="mh5-mine-wallet">
      <div class="mh5-mine-wallet__head">
        <div class="mh5-mine-wallet__label">
          总资产
          <span class="mh5-mine-wallet__currency">CNY ▾</span>
        </div>
        <div class="mh5-mine-wallet__tools">
          <span title="兑换">⇄</span>
          <span title="资产分布">◔</span>
          <span title="账单">🕐</span>
        </div>
      </div>

      <div class="mh5-mine-wallet__balance">
        {{ balanceHidden ? '******' : '128,560.88' }}
        <button type="button" class="mh5-mine-wallet__eye" @click="balanceHidden = !balanceHidden">
          {{ balanceHidden ? '👁' : '🙈' }}
        </button>
      </div>

      <div class="mh5-mine-wallet__btns">
        <button type="button" class="mh5-mine-wallet__btn mh5-mine-wallet__btn--primary">
          <span class="mh5-mine-wallet__btn-icon">⇄</span>
          兑换
        </button>
        <button type="button" class="mh5-mine-wallet__btn">
          <span class="mh5-mine-wallet__btn-icon">⬇</span>
          充币
        </button>
        <button type="button" class="mh5-mine-wallet__btn">
          <span class="mh5-mine-wallet__btn-icon">⬆</span>
          提币
        </button>
      </div>
    </section>

    <section class="mh5-mine-assets">
      <div v-for="asset in assets" :key="asset.name" class="mh5-mine-asset">
        <div class="mh5-mine-asset__left">
          <span class="mh5-mine-asset__icon">{{ asset.icon }}</span>
          <div>
            <div class="mh5-mine-asset__name">{{ asset.name }}</div>
            <div class="mh5-mine-asset__sub">可用 {{ mask(asset.available) }} · 冻结 {{ mask(asset.frozen) }}</div>
          </div>
        </div>
        <span class="mh5-mine-asset__value">{{ mask(asset.available) }}</span>
      </div>
    </section>
  </div>
</template>
