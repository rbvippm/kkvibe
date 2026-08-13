<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5WalletSheet from '../../components/mobile/Mh5WalletSheet.vue'
import {
  PAYOUT_ADD_TYPES,
  PAYOUT_BANK_OPTIONS,
  PAYOUT_CRYPTO_ADDRESSES,
  PAYOUT_FIAT_METHODS,
  PAYOUT_FIAT_TABS,
  PAYOUT_QR_HINT,
  PAYOUT_WALLET_TYPES,
  payoutAddHint,
  payoutAddTitle,
  payoutBankMeta,
  payoutMaskAccount,
  payoutNetworkShort,
  parsePayoutCurrencyId,
  parsePayoutListTab,
  payoutWalletTypeMeta,
  buildCryptoPayoutPick,
  buildFiatPayoutPick,
  withdrawPayoutPick,
  withdrawPayoutPickPending,
  type PayoutAddKind,
  type PayoutCryptoAddress,
  type PayoutFiatMethod,
  type PayoutListTab,
} from '../../constants/payoutMethods'
import { PAYOUT_METHODS_PAGE_SPEC } from '../../constants/payoutMethodsSpec'
import { findTransferCurrency, networksOf, walletTransferRoute } from '../../constants/walletTransfer'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()
const selectedId = ref(parsePayoutCurrencyId(route.query.ccy))
const listTab = ref<PayoutListTab>(parsePayoutListTab(route.query.type))
const pickerOpen = ref(false)
const isPickMode = computed(() => String(route.query.pick ?? '') === '1')

watch(
  () => [route.query.ccy, route.query.type] as const,
  ([ccy, type]) => {
    selectedId.value = parsePayoutCurrencyId(ccy)
    listTab.value = parsePayoutListTab(type)
  },
)

const adding = ref(false)
const addKind = ref<PayoutAddKind>('bank')
const typeSheet = ref(false)
const optionSheet = ref<'bank' | 'wallet' | null>(null)
const toast = ref('')
let toastTimer = 0

const cryptoList = reactive<PayoutCryptoAddress[]>(PAYOUT_CRYPTO_ADDRESSES.map((item) => ({ ...item })))
const fiatList = reactive<PayoutFiatMethod[]>(PAYOUT_FIAT_METHODS.map((item) => ({ ...item })))

const addNetworkId = ref('')
const addAddress = ref('')
const addAddressName = ref('')
const addHolder = ref('')
const addBankName = ref('')
const addBankNumber = ref('')
const addBranch = ref('')
const addAlipayName = ref('')
const addAlipayAccount = ref('')
const addWechatName = ref('')
const addWechatNick = ref('')
const addWalletId = ref(PAYOUT_WALLET_TYPES[0]?.id ?? '')
const addWalletRealName = ref('')
const addWalletAddress = ref('')
const addQrUploaded = ref(false)

const activeCurrency = computed(() => findTransferCurrency(selectedId.value))
const isCrypto = computed(() => activeCurrency.value.kind === 'crypto')
const activeNetworks = computed(() => networksOf(selectedId.value))
const visibleCrypto = computed(() => cryptoList.filter((item) => item.currencyId === selectedId.value))
const visibleFiat = computed(() =>
  listTab.value === 'all' ? fiatList : fiatList.filter((item) => item.kind === listTab.value),
)
const listEmpty = computed(() => (isCrypto.value ? visibleCrypto.value.length === 0 : visibleFiat.value.length === 0))
const pageTitle = computed(() => (adding.value ? payoutAddTitle(addKind.value) : '收款方式'))
const addWalletMeta = computed(() => payoutWalletTypeMeta(addWalletId.value))
const addBankMeta = computed(() => payoutBankMeta(addBankName.value))

const canSaveAdd = computed(() => {
  if (addKind.value === 'crypto') return Boolean(addNetworkId.value && addAddress.value.trim())
  if (addKind.value === 'bank') {
    return Boolean(addHolder.value.trim() && addBankName.value && addBankNumber.value.trim())
  }
  if (addKind.value === 'alipay') {
    return Boolean(addAlipayName.value.trim() && addAlipayAccount.value.trim() && addQrUploaded.value)
  }
  if (addKind.value === 'wechat') {
    return Boolean(addWechatName.value.trim() && addWechatNick.value.trim() && addQrUploaded.value)
  }
  return Boolean(addWalletId.value && addWalletRealName.value.trim() && addWalletAddress.value.trim())
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
})

function showToast(text: string) {
  toast.value = text
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1600)
}

function resetAddForm() {
  addNetworkId.value = activeNetworks.value[0]?.id ?? ''
  addAddress.value = ''
  addAddressName.value = ''
  addHolder.value = ''
  addBankName.value = ''
  addBankNumber.value = ''
  addBranch.value = ''
  addAlipayName.value = ''
  addAlipayAccount.value = ''
  addWechatName.value = ''
  addWechatNick.value = ''
  addWalletId.value = PAYOUT_WALLET_TYPES[0]?.id ?? ''
  addWalletRealName.value = ''
  addWalletAddress.value = ''
  addQrUploaded.value = false
}

function pickCurrency(id: string) {
  selectedId.value = id
  pickerOpen.value = false
  if (findTransferCurrency(id).kind === 'crypto') {
    listTab.value = 'all'
  }
  if (adding.value && findTransferCurrency(id).kind !== 'crypto' && addKind.value === 'crypto') {
    adding.value = false
  }
}

function returnPayoutPick() {
  withdrawPayoutPickPending.value = true
  if (isPickMode.value) {
    router.back()
    return
  }
  void router.push(walletTransferRoute('withdraw'))
}

function chooseCrypto(item: PayoutCryptoAddress) {
  withdrawPayoutPick.value = buildCryptoPayoutPick(item)
  returnPayoutPick()
}

function chooseFiat(item: PayoutFiatMethod) {
  withdrawPayoutPick.value = buildFiatPayoutPick(item, selectedId.value)
  returnPayoutPick()
}

function closeAdd() {
  adding.value = false
  optionSheet.value = null
  typeSheet.value = false
}

function startAdd(kind: PayoutAddKind) {
  if (kind === 'alipay' && fiatList.some((item) => item.kind === 'alipay')) {
    showToast('可绑定一个地址')
    return
  }
  if (kind === 'wechat' && fiatList.some((item) => item.kind === 'wechat')) {
    showToast('可绑定一个地址')
    return
  }
  resetAddForm()
  addKind.value = kind
  typeSheet.value = false
  adding.value = true
}

function onFooterClick() {
  if (adding.value) {
    saveAdd()
    return
  }
  if (isCrypto.value) {
    startAdd('crypto')
    return
  }
  if (listTab.value === 'all') {
    typeSheet.value = true
    return
  }
  startAdd(listTab.value)
}

function saveAdd() {
  if (!canSaveAdd.value) return
  if (addKind.value === 'crypto') {
    cryptoList.push({
      id: `crypto-${Date.now()}`,
      currencyId: selectedId.value,
      networkId: addNetworkId.value,
      address: addAddress.value.trim(),
      name: addAddressName.value.trim() || payoutNetworkShort(addNetworkId.value, addNetworkId.value),
    })
  } else if (addKind.value === 'bank') {
    const bank = payoutBankMeta(addBankName.value)
    fiatList.push({
      id: `bank-${Date.now()}`,
      kind: 'bank',
      title: addBankName.value,
      account: addBankNumber.value.trim(),
      holder: addHolder.value.trim(),
      icon: bank?.icon ?? '卡',
      color: bank?.color ?? '#2563eb',
      branch: addBranch.value.trim(),
    })
  } else if (addKind.value === 'alipay') {
    fiatList.push({
      id: `alipay-${Date.now()}`,
      kind: 'alipay',
      title: '支付宝',
      account: addAlipayAccount.value.trim(),
      holder: addAlipayName.value.trim(),
      icon: '支',
      color: '#1677ff',
      hasQr: true,
    })
  } else if (addKind.value === 'wechat') {
    fiatList.push({
      id: `wechat-${Date.now()}`,
      kind: 'wechat',
      title: '微信',
      account: addWechatNick.value.trim(),
      holder: addWechatName.value.trim(),
      icon: '微',
      color: '#07c160',
      nickname: addWechatNick.value.trim(),
      hasQr: true,
    })
  } else {
    if (fiatList.some((item) => item.kind === 'wallet' && item.walletId === addWalletId.value)) {
      showToast('可绑定一个地址')
      return
    }
    const meta = payoutWalletTypeMeta(addWalletId.value)
    fiatList.push({
      id: `wallet-${Date.now()}`,
      kind: 'wallet',
      title: meta?.name ?? '钱包',
      account: addWalletAddress.value.trim(),
      holder: addWalletRealName.value.trim(),
      icon: meta?.icon ?? '钱',
      color: meta?.color ?? '#ff8c00',
      walletId: addWalletId.value,
    })
  }
  adding.value = false
  showToast('添加成功')
}

function scanAddress() {
  const mock = activeNetworks.value.find((item) => item.id === addNetworkId.value)?.address
    ?? 'TCg7KwSqrkwoqsRJFBVwW7XXo47ouPk16b'
  addAddress.value = mock
  showToast('已识别地址（原型）')
}

function uploadQr() {
  addQrUploaded.value = true
  showToast('已选择收款码（原型）')
}

function pickWalletType(id: string) {
  if (fiatList.some((item) => item.kind === 'wallet' && item.walletId === id)) {
    showToast('可绑定一个地址')
    return
  }
  addWalletId.value = id
  optionSheet.value = null
}
</script>

<template>
  <div class="mh5-payout-page">
    <Mh5SubPageHeader :title="pageTitle" :on-back="adding ? closeAdd : undefined">
      <template #right>
        <Mh5SpecAnnot :spec="PAYOUT_METHODS_PAGE_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <template v-if="!adding">
      <button type="button" class="mh5-payout-currency" @click="pickerOpen = true">
        <span class="mh5-wallet-transfer-select__label">货币</span>
        <span class="mh5-wallet-transfer-select__value">
          <span class="mh5-wallet-transfer-dot" :style="{ background: activeCurrency.color }">{{ activeCurrency.symbol }}</span>
          {{ activeCurrency.name }}
          <span class="mh5-wallet-transfer-select__chevron" aria-hidden="true">›</span>
        </span>
      </button>

      <div v-if="!isCrypto" class="mh5-sub-tabs mh5-sub-tabs--scroll" role="tablist" aria-label="收款方式分类">
        <button
          v-for="tab in PAYOUT_FIAT_TABS"
          :key="tab.key"
          type="button"
          class="mh5-sub-tabs__item"
          :class="{ 'mh5-sub-tabs__item--active': listTab === tab.key }"
          role="tab"
          :aria-selected="listTab === tab.key"
          @click="listTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <main class="mh5-payout-body">
        <div v-if="listEmpty" class="mh5-payout-empty">
          <svg class="mh5-payout-empty__icon" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
            <rect x="14" y="18" width="44" height="40" rx="6" stroke="#d1d5db" stroke-width="2" />
            <path d="M14 28h44" stroke="#d1d5db" stroke-width="2" />
            <path d="M24 40h16M24 48h10" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" />
          </svg>
          <p class="mh5-payout-empty__title">暂无收款方式</p>
          <p class="mh5-payout-empty__desc">{{ isCrypto ? '请添加本人的钱包地址' : '请添加本人收款账户' }}</p>
        </div>

        <div v-else-if="isCrypto" class="mh5-payout-list">
          <button
            v-for="item in visibleCrypto"
            :key="item.id"
            type="button"
            class="mh5-payout-method"
            :class="{ 'mh5-payout-method--on': withdrawPayoutPick?.id === item.id }"
            @click="chooseCrypto(item)"
          >
            <span class="mh5-payout-method__icon" :style="{ background: activeCurrency.color }">{{ activeCurrency.symbol }}</span>
            <span class="mh5-payout-method__meta">
              <strong>{{ activeCurrency.name }} {{ payoutNetworkShort(item.networkId, item.networkId) }}</strong>
              <em>{{ payoutMaskAccount(item.address) }}</em>
            </span>
            <span class="mh5-payout-method__holder">{{ item.name }}</span>
          </button>
        </div>

        <div v-else class="mh5-payout-list">
          <button
            v-for="item in visibleFiat"
            :key="item.id"
            type="button"
            class="mh5-payout-method"
            :class="{ 'mh5-payout-method--on': withdrawPayoutPick?.id === item.id }"
            @click="chooseFiat(item)"
          >
            <span class="mh5-payout-method__icon" :style="{ background: item.color }">{{ item.icon }}</span>
            <span class="mh5-payout-method__meta">
              <strong>{{ item.title }}</strong>
              <em>{{ payoutMaskAccount(item.account) }}</em>
            </span>
            <span class="mh5-payout-method__holder">{{ item.holder }}</span>
          </button>
        </div>
      </main>
    </template>

    <main v-else class="mh5-payout-body mh5-payout-body--form">
      <p class="mh5-payout-form__hint">{{ payoutAddHint(addKind) }}</p>

      <template v-if="addKind === 'crypto'">
        <div class="mh5-payout-form__group">
          <span class="mh5-payout-form__label">币种</span>
          <button type="button" class="mh5-payout-form__control" @click="pickerOpen = true">
            <span class="mh5-wallet-transfer-dot" :style="{ background: activeCurrency.color }">{{ activeCurrency.symbol }}</span>
            {{ activeCurrency.name }}
            <span class="mh5-payout-form__chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <div class="mh5-payout-form__group">
          <span class="mh5-payout-form__label">转账网络</span>
          <div class="mh5-payout-nets" role="listbox" aria-label="转账网络">
            <button
              v-for="net in activeNetworks"
              :key="net.id"
              type="button"
              class="mh5-payout-net"
              :class="{ 'mh5-payout-net--on': addNetworkId === net.id }"
              @click="addNetworkId = net.id"
            >
              {{ payoutNetworkShort(net.id, net.label) }}
            </button>
          </div>
        </div>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label">地址</span>
          <span class="mh5-payout-form__control">
            <input v-model="addAddress" type="text" placeholder="接收者地址" />
            <button type="button" class="mh5-payout-scan" aria-label="扫描二维码" @click="scanAddress">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <rect x="7" y="7" width="4" height="4" rx="0.6" stroke="currentColor" stroke-width="1.6" />
                <rect x="13" y="7" width="4" height="4" rx="0.6" stroke="currentColor" stroke-width="1.6" />
                <rect x="7" y="13" width="4" height="4" rx="0.6" stroke="currentColor" stroke-width="1.6" />
                <path d="M13 13h2.5M13 17h4M17 13v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </span>
        </label>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label">地址名称</span>
          <span class="mh5-payout-form__control">
            <input v-model="addAddressName" type="text" placeholder="请输入" />
          </span>
        </label>
      </template>

      <template v-else-if="addKind === 'bank'">
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>姓名</span>
          <span class="mh5-payout-form__control">
            <input v-model="addHolder" type="text" placeholder="请输入" />
          </span>
        </label>
        <div class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>开户银行</span>
          <button type="button" class="mh5-payout-form__control" @click="optionSheet = 'bank'">
            <span v-if="addBankMeta" class="mh5-payout-method__icon mh5-payout-method__icon--sm" :style="{ background: addBankMeta.color }">{{ addBankMeta.icon }}</span>
            <span :class="{ 'mh5-payout-form__placeholder': !addBankName }">{{ addBankName || '请选择' }}</span>
            <span class="mh5-payout-form__chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>银行卡号</span>
          <span class="mh5-payout-form__control">
            <input v-model="addBankNumber" type="text" inputmode="numeric" placeholder="请输入" />
          </span>
        </label>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label">开户支行 (选填)</span>
          <span class="mh5-payout-form__control">
            <input v-model="addBranch" type="text" placeholder="请输入" />
          </span>
        </label>
      </template>

      <template v-else-if="addKind === 'alipay'">
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>支付宝姓名</span>
          <span class="mh5-payout-form__control">
            <input v-model="addAlipayName" type="text" placeholder="请输入" />
          </span>
        </label>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>支付宝账户</span>
          <span class="mh5-payout-form__control">
            <input v-model="addAlipayAccount" type="text" placeholder="请输入" />
          </span>
        </label>
        <div class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>支付宝收款码</span>
          <p class="mh5-payout-form__note">{{ PAYOUT_QR_HINT }}</p>
          <button type="button" class="mh5-payout-upload" :class="{ 'mh5-payout-upload--on': addQrUploaded }" @click="uploadQr">
            <span v-if="addQrUploaded">已上传</span>
            <span v-else aria-hidden="true">+</span>
          </button>
        </div>
      </template>

      <template v-else-if="addKind === 'wechat'">
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>微信姓名</span>
          <span class="mh5-payout-form__control">
            <input v-model="addWechatName" type="text" placeholder="请输入" />
          </span>
        </label>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>微信昵称</span>
          <span class="mh5-payout-form__control">
            <input v-model="addWechatNick" type="text" placeholder="请输入" />
          </span>
        </label>
        <div class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>微信支付收款码</span>
          <p class="mh5-payout-form__note">{{ PAYOUT_QR_HINT }}</p>
          <button type="button" class="mh5-payout-upload" :class="{ 'mh5-payout-upload--on': addQrUploaded }" @click="uploadQr">
            <span v-if="addQrUploaded">已上传</span>
            <span v-else aria-hidden="true">+</span>
          </button>
        </div>
      </template>

      <template v-else>
        <div class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>钱包类型</span>
          <button type="button" class="mh5-payout-form__control" @click="optionSheet = 'wallet'">
            <span class="mh5-payout-method__icon mh5-payout-method__icon--sm" :style="{ background: addWalletMeta?.color }">{{ addWalletMeta?.icon }}</span>
            {{ addWalletMeta?.name ?? '请选择' }}
            <span class="mh5-payout-form__chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>钱包地址实名认证</span>
          <span class="mh5-payout-form__control">
            <input v-model="addWalletRealName" type="text" placeholder="请输入" />
          </span>
        </label>
        <label class="mh5-payout-form__group">
          <span class="mh5-payout-form__label"><i class="mh5-payout-req">*</i>钱包地址</span>
          <span class="mh5-payout-form__control">
            <input v-model="addWalletAddress" type="text" placeholder="请输入" />
          </span>
        </label>
      </template>
    </main>

    <footer class="mh5-payout-footer">
      <button
        v-if="adding"
        type="button"
        class="mh5-wallet-transfer-submit"
        :disabled="!canSaveAdd"
        @click="saveAdd"
      >
        保存
      </button>
      <button v-else type="button" class="mh5-payout-addbtn" @click="onFooterClick">
        <i>+</i>
        添加收款方式
      </button>
    </footer>

    <Mh5WalletSheet
      :open="pickerOpen"
      title="全部钱包"
      selectable
      hide-balance
      :selected-id="selectedId"
      @close="pickerOpen = false"
      @select="pickCurrency"
    />

    <Transition name="mh5-wallet-sheet">
      <div v-if="typeSheet" class="mh5-wallet-sheet-mask" @click.self="typeSheet = false">
        <div class="mh5-wallet-sheet mh5-payout-option-sheet" role="dialog" aria-modal="true" aria-labelledby="payout-type-title">
          <div class="mh5-wallet-sheet__head">
            <h2 id="payout-type-title" class="mh5-wallet-sheet__title">请选择收款方式</h2>
            <button type="button" class="mh5-wallet-sheet__close" aria-label="关闭" @click="typeSheet = false">×</button>
          </div>
          <div class="mh5-payout-option-list">
            <button
              v-for="item in PAYOUT_ADD_TYPES"
              :key="item.key"
              type="button"
              class="mh5-payout-wtype"
              @click="startAdd(item.key)"
            >
              <span class="mh5-payout-method__icon" :style="{ background: item.color }">{{ item.icon }}</span>
              <span class="mh5-payout-wtype__text">
                <strong>{{ item.label }}</strong>
              </span>
              <span class="mh5-payout-form__chevron" aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-wallet-sheet">
      <div v-if="optionSheet" class="mh5-wallet-sheet-mask" @click.self="optionSheet = null">
        <div class="mh5-wallet-sheet mh5-payout-option-sheet" role="dialog" aria-modal="true">
          <div class="mh5-wallet-sheet__head">
            <h2 class="mh5-wallet-sheet__title">{{ optionSheet === 'wallet' ? '请选择钱包类型' : '请选择开户银行' }}</h2>
            <button type="button" class="mh5-wallet-sheet__close" aria-label="关闭" @click="optionSheet = null">×</button>
          </div>
          <div class="mh5-payout-option-list">
            <template v-if="optionSheet === 'wallet'">
              <button
                v-for="item in PAYOUT_WALLET_TYPES"
                :key="item.id"
                type="button"
                class="mh5-payout-wtype"
                @click="pickWalletType(item.id)"
              >
                <span class="mh5-payout-method__icon" :style="{ background: item.color }">{{ item.icon }}</span>
                <span class="mh5-payout-wtype__text">
                  <strong>{{ item.name }}</strong>
                  <em>可绑定一个地址</em>
                </span>
                <span class="mh5-payout-form__chevron" aria-hidden="true">›</span>
              </button>
            </template>
            <template v-else>
              <button
                v-for="bank in PAYOUT_BANK_OPTIONS"
                :key="bank.name"
                type="button"
                class="mh5-payout-wtype"
                @click="addBankName = bank.name; optionSheet = null"
              >
                <span class="mh5-payout-method__icon" :style="{ background: bank.color }">{{ bank.icon }}</span>
                <span class="mh5-payout-wtype__text">
                  <strong>{{ bank.name }}</strong>
                </span>
                <span class="mh5-payout-form__chevron" aria-hidden="true">›</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-toast">
      <p v-if="toast" class="mh5-wallet-transfer-toast">{{ toast }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.mh5-toast-enter-active,
.mh5-toast-leave-active {
  transition: opacity 0.2s ease;
}
.mh5-toast-enter-from,
.mh5-toast-leave-to {
  opacity: 0;
}
</style>
