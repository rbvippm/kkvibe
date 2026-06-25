<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  formatBillingHeroAmount,
  getBillingDetail,
  type BillingDetail,
} from '../../constants/billingList'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const detail = computed(() => getBillingDetail(String(route.params.id || '')))
const isXcoinTransfer = computed(() => detail.value?.layout === 'xcoin_transfer')

const amountLabel = computed(() => {
  if (!detail.value) return '金额'
  if (detail.value.typeLabel.includes('下分')) return '下分金额'
  if (detail.value.typeLabel.includes('上分')) return '上分金额'
  return '金额'
})

function copyText(value: string) {
  navigator.clipboard?.writeText(value).catch(() => {})
}

function goBackOrList() {
  if (window.history.length > 1) router.back()
  else router.replace({ name: 'mobile-billing-list' })
}

function rowValue(field: NonNullable<BillingDetail['fields']>[number]) {
  return field.value
}
</script>

<template>
  <div class="mh5-billing-detail-page">
    <header class="mh5-billing-detail-header">
      <button type="button" class="mh5-billing-detail-header__back" aria-label="返回" @click="goBackOrList">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="mh5-billing-detail-header__title">账单详情</h1>
      <button type="button" class="mh5-billing-detail-header__service" aria-label="联系客服">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <path
            d="M7 11.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5v1.1c1 .3 1.7 1.2 1.7 2.3V18c0 1.4-1.1 2.5-2.5 2.5h-9C9.1 20.5 8 19.4 8 18v-3.1c0-1.1.7-2 1.7-2.3V11.5z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
          <path d="M10 14h6M10 16.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <circle cx="19" cy="7.5" r="4" fill="#fff" stroke="currentColor" stroke-width="1.2" />
          <text x="19" y="9.2" text-anchor="middle" fill="currentColor" font-size="5.5" font-weight="700">?</text>
        </svg>
      </button>
    </header>

    <main v-if="detail" class="mh5-billing-detail-main">
      <section class="mh5-billing-detail-hero">
        <div class="mh5-billing-detail-hero__logo" aria-hidden="true">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="var(--mh5-app-orange, #ff7a2b)" />
            <text
              x="36"
              y="46"
              text-anchor="middle"
              fill="#fff"
              font-size="34"
              font-weight="700"
              font-family="system-ui, -apple-system, sans-serif"
            >
              X
            </text>
          </svg>
        </div>
        <h2 class="mh5-billing-detail-hero__title">{{ detail.typeLabel }}</h2>
        <p class="mh5-billing-detail-hero__amount">{{ formatBillingHeroAmount(detail.amount) }}</p>
        <p class="mh5-billing-detail-hero__unit">{{ detail.currencySymbol }}</p>
      </section>

      <section v-if="isXcoinTransfer" class="mh5-billing-detail-card">
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ amountLabel }}</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--stack">
            <span class="mh5-billing-detail-row__amount">{{ Math.abs(detail.amount).toFixed(2) }}</span>
            <span class="mh5-billing-detail-row__unit">{{ detail.currencySymbol }}</span>
          </div>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">上级代理</span>
          <span class="mh5-billing-detail-row__value">{{ detail.superiorAgent }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">时间</span>
          <span class="mh5-billing-detail-row__value">{{ detail.timeDisplay }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">单号</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
            <span class="mh5-billing-detail-row__order">{{ detail.orderNo }}</span>
            <button type="button" class="mh5-billing-detail-copy-icon" aria-label="复制单号" @click="copyText(detail.orderNo || '')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section v-else class="mh5-billing-detail-card">
        <div v-for="field in detail.fields" :key="field.label" class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ field.label }}</span>
          <span class="mh5-billing-detail-row__value">{{ rowValue(field) }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">时间</span>
          <span class="mh5-billing-detail-row__value">{{ detail.timeDisplay }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">单号</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
            <span class="mh5-billing-detail-row__order">{{ detail.orderNo }}</span>
            <button type="button" class="mh5-billing-detail-copy-icon" aria-label="复制单号" @click="copyText(detail.orderNo || '')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>

    <main v-else class="mh5-billing-detail-main mh5-billing-detail-main--empty">
      <p class="mh5-billing-detail-empty">未找到该账单</p>
      <button type="button" class="mh5-billing-detail-empty-btn" @click="goBackOrList">返回账单列表</button>
    </main>
  </div>
</template>
