<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  findTransferCurrency,
  networksOf,
  splitAddressHighlights,
  walletDepositSharePairLabel,
  walletQrCells,
} from '../../constants/walletTransfer'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const toast = ref('')
let toastTimer = 0

const currency = computed(() => findTransferCurrency(String(route.query.currency || 'usdt')))
const networks = computed(() => networksOf(currency.value.id))
const network = computed(() => {
  const id = String(route.query.network || '')
  return networks.value.find((item) => item.id === id) ?? networks.value[0]
})
const networkLabel = computed(() => network.value?.label ?? '')
const supportLabel = computed(() =>
  walletDepositSharePairLabel(currency.value.name, networkLabel.value),
)
const address = computed(() => network.value?.address ?? '')
const addressSegments = computed(() => splitAddressHighlights(address.value))
const cryptoDepositMinText = computed(
  () => `最小充值${currency.value.minDeposit}${currency.value.name}`,
)
const qrCells = computed(() => walletQrCells(address.value || currency.value.id))
const promoQrCells = computed(() => walletQrCells('kingkong-app'))

function showToast(text: string) {
  toast.value = text
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1600)
}

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
})

async function copyAddress() {
  if (!address.value) {
    showToast('暂无充值地址')
    return
  }
  try {
    await navigator.clipboard.writeText(address.value)
  } catch {
    /* 原型兜底 */
  }
  showToast('充值地址已复制')
}

async function shareOut() {
  try {
    if (navigator.share && address.value) {
      await navigator.share({
        title: supportLabel.value,
        text: `${supportLabel.value} ${address.value}`,
      })
      return
    }
  } catch {
    /* 用户取消或环境不支持 */
  }
  showToast('已唤起分享（原型）')
}

function openContacts() {
  showToast('打开通讯录分享（原型）')
}
</script>

<template>
  <div class="mh5-wallet-share-page">
    <Mh5SubPageHeader title="分享" />

    <main class="mh5-wallet-share-main">
      <section class="mh5-wallet-share-card">
        <div class="mh5-wallet-share-card__head">
          <span class="mh5-wallet-transfer-dot" :style="{ background: currency.color }">{{ currency.symbol }}</span>
          <strong>{{ currency.name }}</strong>
        </div>
        <p class="mh5-wallet-share-card__warn">该地址仅支持{{ supportLabel }}收款</p>
        <p class="mh5-wallet-share-card__hint">请勿用于其他币种，否则资产将可能找不回</p>

        <div class="mh5-wallet-share-qr" aria-hidden="true">
          <div class="mh5-wallet-transfer-qr__grid">
            <span
              v-for="(on, idx) in qrCells"
              :key="idx"
              class="mh5-wallet-transfer-qr__cell"
              :class="{ 'mh5-wallet-transfer-qr__cell--on': on }"
            />
          </div>
        </div>

        <div class="mh5-wallet-transfer-address">
          <div class="mh5-wallet-transfer-address__row">
            <div class="mh5-wallet-transfer-address__text">
              <template v-if="addressSegments.length">
                <span
                  v-for="(seg, idx) in addressSegments"
                  :key="idx"
                  :class="{ 'mh5-wallet-transfer-address__mark': seg.accent }"
                >{{ seg.text }}</span>
              </template>
              <span v-else>暂无地址</span>
              <button type="button" class="mh5-wallet-transfer-copy" @click="copyAddress">复制</button>
            </div>
          </div>
        </div>
        <p class="mh5-wallet-transfer-tip mh5-wallet-transfer-tip--warn">
          <span class="mh5-wallet-transfer-tip__icon" aria-hidden="true">
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
              <path
                d="M7.2 1.7c.8-1.4 2.8-1.4 3.6 0l6.2 11c.8 1.4-.2 3.1-1.8 3.1H2.8c-1.6 0-2.6-1.7-1.8-3.1l6.2-11z"
                fill="#f04438"
              />
              <path
                d="M9 5.2v4.2M9 11.6h.01"
                stroke="#fff"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="mh5-wallet-transfer-tip__text">
            {{ cryptoDepositMinText }}。发送前请确认钱包地址和网络均正确无误。错误转账将无法找回。
          </span>
        </p>
      </section>

      <section class="mh5-wallet-share-promo">
        <span class="mh5-wallet-share-promo__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 8.5c0-2.2 2.7-4 6-4s6 1.8 6 4-2.7 4-6 4c-.6 0-1.2 0-1.7-.1L6.2 14.8 7 12.2C5.8 11.3 5 9.9 5 8.5z"
              fill="#fff"
            />
          </svg>
        </span>
        <div class="mh5-wallet-share-promo__text">
          <strong>金刚</strong>
          <p>端对端加密，安全的聊天工具</p>
        </div>
        <div class="mh5-wallet-share-promo__qr" aria-hidden="true">
          <span
            v-for="(on, idx) in promoQrCells"
            :key="idx"
            class="mh5-wallet-share-promo__cell"
            :class="{ 'mh5-wallet-share-promo__cell--on': on }"
          />
        </div>
      </section>
    </main>

    <footer class="mh5-wallet-share-actions">
      <button type="button" class="mh5-wallet-share-actions__btn" @click="shareOut">
        <span class="mh5-wallet-share-actions__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v10M8.5 7.5 12 4l3.5 3.5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 13v5.2A1.8 1.8 0 0 0 7.8 20h8.4A1.8 1.8 0 0 0 18 18.2V13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </span>
        {{ $t('分享') }}
      </button>
      <button type="button" class="mh5-wallet-share-actions__btn" @click="openContacts">
        <span class="mh5-wallet-share-actions__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="2.6" stroke="currentColor" stroke-width="1.7" />
            <path d="M4.8 17c.4-2.3 2.1-3.8 4.2-3.8s3.8 1.5 4.2 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            <circle cx="16.2" cy="8.4" r="2.2" stroke="currentColor" stroke-width="1.6" />
            <path d="M16.2 12.4c1.8 0 3.3 1.2 3.7 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </span>
        {{ $t('通讯录') }}
      </button>
    </footer>

    <Transition name="mh5-toast">
      <p v-if="toast" class="mh5-wallet-transfer-toast">{{ toast }}</p>
    </Transition>
  </div>
</template>
