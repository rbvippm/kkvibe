<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  formatBillingHeroAmount,
  getBillingDetail,
  type BillingDetail,
} from '../../constants/billingList'
import { isVipClubMineFrom, withMineHallFrom } from '../../constants/mineHall'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const detail = computed(() => getBillingDetail(String(route.params.id || '')))
const isVipClubBilling = computed(() => isVipClubMineFrom(route.query.from))
const isXcoinTransfer = computed(() => detail.value?.layout === 'xcoin_transfer')
const isSystemPayment = computed(() => detail.value?.layout === 'system_payment')
const amountUnit = computed(
  () => detail.value?.currencyCode || detail.value?.currencySymbol || '',
)
const heroTitle = computed(() => detail.value?.heroTitle || detail.value?.typeLabel || '')
const billNo = computed(() => detail.value?.billNo || detail.value?.orderNo || '')

const amountLabel = computed(() => {
  if (!detail.value) return '金额'
  if (detail.value.typeLabel.includes('下分')) return '下分金额'
  if (detail.value.typeLabel.includes('上分')) return '上分金额'
  return '金额'
})

const systemAmountText = computed(() => {
  if (!detail.value) return ''
  return `${Math.abs(detail.value.amount).toFixed(2)} ${amountUnit.value}`
})

function copyText(value: string) {
  navigator.clipboard?.writeText(value).catch(() => {})
}

function goBackOrList() {
  if (window.history.length > 1) router.back()
  else router.replace({ name: 'mobile-billing-list', query: withMineHallFrom(route.query.from) })
}

function rowValue(field: NonNullable<BillingDetail['fields']>[number]) {
  return field.value
}
</script>

<template>
  <div class="mh5-billing-detail-page" :class="{ 'mh5-vip-records': isVipClubBilling }">
    <header class="mh5-billing-detail-header">
      <button type="button" class="mh5-billing-detail-header__back" :aria-label="$t('返回')" @click="goBackOrList">
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
      <h1 class="mh5-billing-detail-header__title">{{ $t('账单详情') }}</h1>
      <button type="button" class="mh5-billing-detail-header__service" :aria-label="$t('联系客服')">
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
          <svg v-if="isSystemPayment" width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="#3b82f6" />
            <path
              d="M36 20v24M36 44l-9-9M36 44l9-9"
              stroke="#fff"
              stroke-width="3.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M22 50h28" stroke="#fff" stroke-width="3.2" stroke-linecap="round" />
          </svg>
          <svg v-else width="72" height="72" viewBox="0 0 72 72" fill="none">
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
              {{ detail.currencySymbol }}
            </text>
          </svg>
        </div>
        <h2 class="mh5-billing-detail-hero__title">{{ heroTitle }}</h2>
        <p class="mh5-billing-detail-hero__amount">{{ formatBillingHeroAmount(detail.amount) }}</p>
        <p v-if="!isSystemPayment" class="mh5-billing-detail-hero__unit">{{ amountUnit }}</p>
      </section>

      <section v-if="isSystemPayment" class="mh5-billing-detail-card">
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('金额') }}</span>
          <span class="mh5-billing-detail-row__value mh5-billing-detail-row__value--accent">
            {{ systemAmountText }}
          </span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('打款原因') }}</span>
          <span class="mh5-billing-detail-row__value">{{ detail.paymentReason }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('账单号') }}</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
            <span class="mh5-billing-detail-row__order">{{ billNo }}</span>
            <button type="button" class="mh5-billing-detail-copy-icon" :aria-label="$t('复制账单号')" @click="copyText(billNo)">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="6" y="2" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                <rect x="3" y="5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
              </svg>
            </button>
          </div>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('打款时间') }}</span>
          <span class="mh5-billing-detail-row__value">{{ detail.timeDisplay }}</span>
        </div>
      </section>

      <section v-else-if="isXcoinTransfer" class="mh5-billing-detail-card">
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ amountLabel }}</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--stack">
            <span class="mh5-billing-detail-row__amount">{{ Math.abs(detail.amount).toFixed(2) }}</span>
            <span class="mh5-billing-detail-row__unit">{{ amountUnit }}</span>
          </div>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('上级代理') }}</span>
          <span class="mh5-billing-detail-row__value">{{ detail.superiorAgent }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('时间') }}</span>
          <span class="mh5-billing-detail-row__value">{{ detail.timeDisplay }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('单号') }}</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
            <span class="mh5-billing-detail-row__order">{{ detail.orderNo }}</span>
            <button type="button" class="mh5-billing-detail-copy-icon" :aria-label="$t('复制单号')" @click="copyText(detail.orderNo || '')">
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
          <span class="mh5-billing-detail-row__label">{{ $t(field.label) }}</span>
          <span
            class="mh5-billing-detail-row__value"
            :class="{ 'mh5-billing-detail-row__value--accent': field.emphasis }"
          >
            {{ rowValue(field) }}
          </span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('时间') }}</span>
          <span class="mh5-billing-detail-row__value">{{ detail.timeDisplay }}</span>
        </div>
        <div class="mh5-billing-detail-row">
          <span class="mh5-billing-detail-row__label">{{ $t('单号') }}</span>
          <div class="mh5-billing-detail-row__value mh5-billing-detail-row__value--copy">
            <span class="mh5-billing-detail-row__order">{{ detail.orderNo }}</span>
            <button type="button" class="mh5-billing-detail-copy-icon" :aria-label="$t('复制单号')" @click="copyText(detail.orderNo || '')">
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
      <p class="mh5-billing-detail-empty">{{ $t('未找到该账单') }}</p>
      <button type="button" class="mh5-billing-detail-empty-btn" @click="goBackOrList">{{ $t('返回账单列表') }}</button>
    </main>
  </div>
</template>
