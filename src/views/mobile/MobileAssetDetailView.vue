<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import {
  ASSET_DETAIL_FIAT_OPTIONS,
  ASSET_DETAIL_GROUP_MODES,
  ASSET_DETAIL_ITEMS,
  ASSET_DETAIL_KIND_FILTERS,
  ASSET_DETAIL_MAIN_TABS,
  filterAssetDetailItems,
  formatAssetAmount,
  sumAssetAvailable,
  type AssetDetailFiatId,
  type AssetDetailGroupMode,
  type AssetDetailKindFilter,
  type AssetDetailMainTab,
} from '../../constants/assetDetail'
import { walletTransferRoute } from '../../constants/walletTransfer'
import '../../styles/mobile-app-shell.css'

const mainTab = ref<AssetDetailMainTab>('overview')
const groupMode = ref<AssetDetailGroupMode>('currency')
const kindFilter = ref<AssetDetailKindFilter>('all')
const balanceHidden = ref(false)
const fiatPickerOpen = ref(false)
const preferredFiatId = ref<AssetDetailFiatId>('cny')
const router = useRouter()

const preferredFiat = computed(
  () => ASSET_DETAIL_FIAT_OPTIONS.find((item) => item.id === preferredFiatId.value) ?? ASSET_DETAIL_FIAT_OPTIONS[0],
)

const filteredItems = computed(() => filterAssetDetailItems(ASSET_DETAIL_ITEMS, kindFilter.value))

const totalAmount = computed(() => sumAssetAvailable(ASSET_DETAIL_ITEMS))

const totalAmountText = computed(() => {
  const amount = formatAssetAmount(totalAmount.value)
  return balanceHidden.value ? '****' : amount
})

function pickFiat(id: AssetDetailFiatId) {
  preferredFiatId.value = id
  fiatPickerOpen.value = false
}

function rowTotal(item: (typeof ASSET_DETAIL_ITEMS)[number]) {
  return item.available + item.frozen
}

function goWalletTransfer(tab: 'deposit' | 'withdraw' | 'exchange') {
  router.push(walletTransferRoute(tab))
}
</script>

<template>
  <div class="mh5-asset-detail-page">
    <Mh5SubPageHeader title="资产明细" />

    <div class="mh5-asset-detail-tabs" role="tablist" aria-label="资产明细分类">
      <button
        v-for="tab in ASSET_DETAIL_MAIN_TABS"
        :key="tab.key"
        type="button"
        role="tab"
        class="mh5-asset-detail-tabs__item"
        :class="{ 'mh5-asset-detail-tabs__item--active': mainTab === tab.key }"
        :aria-selected="mainTab === tab.key"
        @click="mainTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <main v-if="mainTab === 'overview'" class="mh5-asset-detail-main">
      <section class="mh5-asset-detail-summary">
        <div class="mh5-asset-detail-summary__head">
          <span class="mh5-asset-detail-summary__label">总资产</span>
          <button
            type="button"
            class="mh5-asset-detail-summary__fiat"
            aria-label="选择偏好计价法币"
            @click="fiatPickerOpen = true"
          >
            {{ preferredFiat.name }}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="mh5-asset-detail-summary__amount-row">
          <p class="mh5-asset-detail-summary__amount">{{ totalAmountText }}</p>
          <button
            type="button"
            class="mh5-asset-detail-summary__eye"
            :aria-label="balanceHidden ? '显示余额' : '隐藏余额'"
            @click="balanceHidden = !balanceHidden"
          >
            <svg v-if="!balanceHidden" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3l18 18M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4M6.7 6.7C4.6 8.1 3 10 3 10s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8M17.3 17.3C19.4 15.9 21 14 21 14s-3.5-6-10-6c-1.1 0-2.1.2-3 .5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <div class="mh5-asset-detail-actions">
          <button type="button" class="mh5-asset-detail-action mh5-asset-detail-action--primary" @click="goWalletTransfer('exchange')">
            <span class="mh5-asset-detail-action__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M8 10.5h12M16.5 8l3 2.5-3 2.5M20 17.5H8M11.5 20l-3-2.5 3-2.5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span>兑换</span>
          </button>
          <button type="button" class="mh5-asset-detail-action" @click="goWalletTransfer('deposit')">
            <span class="mh5-asset-detail-action__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 6v10M10 12l4 4 4-4M7 20h14"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span>充值</span>
          </button>
          <button type="button" class="mh5-asset-detail-action" @click="goWalletTransfer('withdraw')">
            <span class="mh5-asset-detail-action__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 16V6M10 10l4-4 4 4M7 20h14"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span>提现</span>
          </button>
        </div>
      </section>

      <div class="mh5-asset-detail-toolbar">
        <div class="mh5-asset-detail-segment" role="tablist" aria-label="资产分组方式">
          <button
            v-for="mode in ASSET_DETAIL_GROUP_MODES"
            :key="mode.key"
            type="button"
            role="tab"
            class="mh5-asset-detail-segment__item"
            :class="{ 'mh5-asset-detail-segment__item--active': groupMode === mode.key }"
            :aria-selected="groupMode === mode.key"
            @click="groupMode = mode.key"
          >
            {{ mode.label }}
          </button>
        </div>

        <div class="mh5-asset-detail-kinds" role="tablist" aria-label="资产类型筛选">
          <button
            v-for="tab in ASSET_DETAIL_KIND_FILTERS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-asset-detail-kinds__item"
            :class="{ 'mh5-asset-detail-kinds__item--active': kindFilter === tab.key }"
            :aria-selected="kindFilter === tab.key"
            @click="kindFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <section v-if="groupMode === 'currency'" class="mh5-asset-detail-list">
        <article v-for="item in filteredItems" :key="item.id" class="mh5-asset-detail-row">
          <span class="mh5-asset-detail-row__icon" :style="{ background: item.color }" aria-hidden="true">
            {{ item.symbol }}
          </span>
          <div class="mh5-asset-detail-row__body">
            <div class="mh5-asset-detail-row__top">
              <span class="mh5-asset-detail-row__name">{{ item.name }}</span>
              <span class="mh5-asset-detail-row__total">
                {{ balanceHidden ? '****' : formatAssetAmount(rowTotal(item)) }}
              </span>
            </div>
            <div class="mh5-asset-detail-row__line">
              <span>可用</span>
              <span>{{ balanceHidden ? '****' : formatAssetAmount(item.available) }}</span>
            </div>
            <div class="mh5-asset-detail-row__line">
              <span>冻结</span>
              <span>{{ balanceHidden ? '****' : formatAssetAmount(item.frozen) }}</span>
            </div>
          </div>
        </article>
      </section>

      <section v-else class="mh5-asset-detail-empty">
        <p>按账户视图原型占位，后续可接账户维度明细</p>
      </section>
    </main>

    <main v-else class="mh5-asset-detail-main mh5-asset-detail-main--placeholder">
      <p class="mh5-asset-detail-empty">
        「{{ ASSET_DETAIL_MAIN_TABS.find((tab) => tab.key === mainTab)?.label }}」内容原型占位
      </p>
    </main>

    <Teleport to="body">
      <Transition name="mh5-wallet-sheet">
        <div
          v-if="fiatPickerOpen"
          class="mh5-agent-overlay-mask"
          @click.self="fiatPickerOpen = false"
        >
          <div
            class="mh5-wallet-sheet agent-currency-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-fiat-title"
          >
            <div class="mh5-wallet-sheet__head">
              <h2 id="asset-fiat-title" class="mh5-wallet-sheet__title">选择偏好计价法币</h2>
              <button
                type="button"
                class="mh5-wallet-sheet__close"
                aria-label="关闭"
                @click="fiatPickerOpen = false"
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
                v-for="item in ASSET_DETAIL_FIAT_OPTIONS"
                :key="item.id"
                type="button"
                class="agent-currency-sheet__item"
                :class="{ 'agent-currency-sheet__item--active': preferredFiatId === item.id }"
                @click="pickFiat(item.id)"
              >
                <span
                  class="agent-currency-sheet__icon"
                  :style="{ background: item.color }"
                  aria-hidden="true"
                >
                  {{ item.symbol }}
                </span>
                <span class="agent-currency-sheet__name">{{ item.name }}</span>
                <span
                  v-if="preferredFiatId === item.id"
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
