<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5WalletSheet from '../../components/mobile/Mh5WalletSheet.vue'
import { mh5Confirm } from '../../composables/useMh5Confirm'
import {
  WALLET_EXCHANGE_ETA,
  WALLET_EXCHANGE_FEE,
  WALLET_FIAT_DEPOSIT_MAX,
  WALLET_FIAT_DEPOSIT_METHODS,
  WALLET_FIAT_DEPOSIT_MIN,
  WALLET_FIAT_DEPOSIT_NOTICE,
  WALLET_FIAT_DEPOSIT_PREVIEW,
  WALLET_FIAT_DEPOSIT_TABS,
  WALLET_FIAT_PRESETS,
  WALLET_FIAT_WITHDRAW_DAILY_LIMIT,
  WALLET_FIAT_WITHDRAW_EWALLET_MAX,
  WALLET_FIAT_WITHDRAW_EWALLET_MIN,
  WALLET_FIAT_WITHDRAW_FEE,
  WALLET_FIAT_WITHDRAW_REF,
  WALLET_FIAT_WITHDRAW_TABS,
  WALLET_FIAT_WITHDRAW_WALLET_PREVIEW,
  WALLET_FIAT_WITHDRAW_WALLETS,
  WALLET_QUICK_CURRENCY_IDS,
  WALLET_TRANSFER_CURRENCIES,
  WALLET_TRANSFER_TABS,
  fiatDepositMethodsByCategory,
  fiatDepositQuoteText,
  exchangeQuote,
  exchangeRateText,
  findTransferCurrency,
  formatTransferAmount,
  networksOf,
  parseWalletTransferTab,
  splitAddressHighlights,
  type WalletFiatCategory,
  type WalletFiatWithdrawKind,
  type WalletTransferTab,
} from '../../constants/walletTransfer'
import { payoutMethodsRoute, payoutListTabFromWithdraw, withdrawPayoutPick, withdrawPayoutPickPending, type WithdrawPayoutPick } from '../../constants/payoutMethods'
import { WALLET_TRANSFER_PAGE_SPEC } from '../../constants/walletTransferSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const activeTab = ref<WalletTransferTab>(parseWalletTransferTab(route.query.tab))
const selectedId = ref('usdt')
const networkId = ref('trc20')
const fiatMethodId = ref('alipay')
const fiatCategory = ref<WalletFiatCategory>('hot')
const fiatWithdrawKind = ref<WalletFiatWithdrawKind>('ewallet')
const fiatWithdrawWalletId = ref(WALLET_FIAT_WITHDRAW_WALLETS[0]?.id ?? '')
const ewalletExpanded = ref(false)
const paygridExpanded = ref(false)
const withdrawRemark = ref('')
const depositAmount = ref('')
const withdrawAmount = ref('')
const withdrawAddress = ref('')
const fiatPayoutDisplay = ref('')
const exchangeFromId = ref('usdt')
const exchangeToId = ref('kkc')
const exchangeFromAmount = ref('')
const pickerKind = ref<'more' | 'network' | 'from' | 'to' | null>(null)
const toast = ref('')
let toastTimer = 0

const activeCurrency = computed(() => findTransferCurrency(selectedId.value))
const isCrypto = computed(() => activeCurrency.value.kind === 'crypto')
const showCurrencyChips = computed(() => activeTab.value === 'deposit' || activeTab.value === 'withdraw')
const quickCurrencies = computed(() =>
  WALLET_QUICK_CURRENCY_IDS.map((id) => findTransferCurrency(id)),
)
const morePreviewCurrencies = computed(() =>
  WALLET_TRANSFER_CURRENCIES.filter(
    (item) => item.kind === 'crypto' && !(WALLET_QUICK_CURRENCY_IDS as readonly string[]).includes(item.id),
  ).slice(0, 3),
)
const activeNetworks = computed(() => networksOf(selectedId.value))
const activeNetwork = computed(
  () => activeNetworks.value.find((item) => item.id === networkId.value) ?? activeNetworks.value[0],
)
const addressSegments = computed(() => splitAddressHighlights(activeNetwork.value?.address ?? ''))
const fiatPresets = computed(() => WALLET_FIAT_PRESETS[selectedId.value] ?? WALLET_FIAT_PRESETS.kkc)
const activeFiatMethod = computed(
  () => WALLET_FIAT_DEPOSIT_METHODS.find((item) => item.id === fiatMethodId.value) ?? WALLET_FIAT_DEPOSIT_METHODS[0],
)
const fiatMethodsInCategory = computed(() => fiatDepositMethodsByCategory(fiatCategory.value))
const hasMoreFiatMethods = computed(
  () => fiatMethodsInCategory.value.length > WALLET_FIAT_DEPOSIT_PREVIEW,
)
const visibleFiatMethods = computed(() =>
  paygridExpanded.value || !hasMoreFiatMethods.value
    ? fiatMethodsInCategory.value
    : fiatMethodsInCategory.value.slice(0, WALLET_FIAT_DEPOSIT_PREVIEW),
)
const fiatMin = computed(() => WALLET_FIAT_DEPOSIT_MIN)
const fiatMax = computed(() => WALLET_FIAT_DEPOSIT_MAX)
const withdrawAmountMinText = computed(() =>
  formatTransferAmount(activeCurrency.value.minWithdraw, 2),
)

const withdrawAmountNum = computed(() => Number(withdrawAmount.value) || 0)
const depositAmountNum = computed(() => Number(depositAmount.value) || 0)
const fiatAmountRangeLabel = computed(() => {
  const ccy = activeCurrency.value
  return `充值金额(${fiatDepositQuoteText(ccy.id, ccy.name)})`
})
const fiatAmountPlaceholder = computed(() => {
  const minText = formatTransferAmount(fiatMin.value, 2)
  const maxText = formatTransferAmount(fiatMax.value, 2)
  return `${minText} - ${maxText}`
})
const fiatAmountHint = computed(() => {
  const name = activeCurrency.value.name
  const minText = formatTransferAmount(fiatMin.value, 2)
  const maxText = formatTransferAmount(fiatMax.value, 2)
  if (depositAmountNum.value > 0 && depositAmountNum.value < fiatMin.value) {
    return `最低充值 ${minText} ${name}`
  }
  if (depositAmountNum.value > fiatMax.value) {
    return `最高充值 ${maxText} ${name}`
  }
  return ''
})
const exchangeFromNum = computed(() => Number(exchangeFromAmount.value) || 0)
const exchangeToAmount = computed(() =>
  exchangeQuote(exchangeFromId.value, exchangeToId.value, exchangeFromNum.value),
)
const exchangeFromCcy = computed(() => findTransferCurrency(exchangeFromId.value))
const exchangeToCcy = computed(() => findTransferCurrency(exchangeToId.value))
const exchangeCnyApprox = computed(() => {
  const usdt = exchangeQuote(exchangeFromId.value, 'usdt', exchangeFromNum.value)
  return `≈¥${formatTransferAmount(usdt * 7.2, 2)}`
})

const canSubmitDeposit = computed(() => {
  if (isCrypto.value) return Boolean(activeNetwork.value?.address)
  if (activeFiatMethod.value?.disabled) return false
  if (depositAmountNum.value < fiatMin.value) return false
  if (depositAmountNum.value > fiatMax.value) return false
  return true
})
const visibleWithdrawWallets = computed(() =>
  ewalletExpanded.value
    ? WALLET_FIAT_WITHDRAW_WALLETS
    : WALLET_FIAT_WITHDRAW_WALLETS.slice(0, WALLET_FIAT_WITHDRAW_WALLET_PREVIEW),
)
const hasMoreWithdrawWallets = computed(
  () => WALLET_FIAT_WITHDRAW_WALLETS.length > WALLET_FIAT_WITHDRAW_WALLET_PREVIEW,
)
const activeWithdrawWallet = computed(
  () => WALLET_FIAT_WITHDRAW_WALLETS.find((item) => item.id === fiatWithdrawWalletId.value),
)
const fiatWithdrawMin = computed(() =>
  fiatWithdrawKind.value === 'ewallet' ? WALLET_FIAT_WITHDRAW_EWALLET_MIN : activeCurrency.value.minWithdraw,
)
const fiatWithdrawMax = computed(() =>
  fiatWithdrawKind.value === 'ewallet' ? WALLET_FIAT_WITHDRAW_EWALLET_MAX : WALLET_FIAT_WITHDRAW_DAILY_LIMIT,
)
const fiatWithdrawPlaceholder = computed(() => {
  const minText = formatTransferAmount(fiatWithdrawMin.value, 2)
  const maxText = formatTransferAmount(fiatWithdrawMax.value, 2)
  return `${minText} - ${maxText}`
})
const fiatWithdrawFee = computed(() =>
  withdrawAmountNum.value > 0 ? WALLET_FIAT_WITHDRAW_FEE : null,
)
const fiatWithdrawReceive = computed(() => {
  if (!withdrawAmountNum.value) return null
  return Math.max(withdrawAmountNum.value - WALLET_FIAT_WITHDRAW_FEE, 0)
})
const canPreviewWithdraw = computed(() => {
  if (withdrawAmountNum.value < (isCrypto.value ? activeCurrency.value.minWithdraw : fiatWithdrawMin.value)) {
    return false
  }
  if (withdrawAmountNum.value > activeCurrency.value.balance) return false
  if (!isCrypto.value && withdrawAmountNum.value > fiatWithdrawMax.value) return false
  if (isCrypto.value && !withdrawAddress.value.trim()) return false
  if (!isCrypto.value && fiatWithdrawKind.value === 'ewallet' && !activeWithdrawWallet.value) return false
  if (!isCrypto.value && !fiatPayoutDisplay.value.trim()) return false
  return true
})
const canExchange = computed(() => {
  if (exchangeFromId.value === exchangeToId.value) return false
  if (exchangeFromNum.value <= 0) return false
  if (exchangeFromNum.value > exchangeFromCcy.value.balance) return false
  return true
})

const pickerTitle = computed(() => {
  if (pickerKind.value === 'from') return '选择转出币种'
  if (pickerKind.value === 'to') return '选择转入币种'
  return '全部钱包'
})
const walletSheetOpen = computed(
  () => pickerKind.value === 'more' || pickerKind.value === 'from' || pickerKind.value === 'to',
)
const pickerSelectedId = computed(() => {
  if (pickerKind.value === 'from') return exchangeFromId.value
  if (pickerKind.value === 'to') return exchangeToId.value
  return selectedId.value
})

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = parseWalletTransferTab(tab)
  },
)

watch(selectedId, (id) => {
  const nets = networksOf(id)
  const pickedNet =
    withdrawPayoutPick.value?.currencyId === id ? withdrawPayoutPick.value.networkId : undefined
  if (pickedNet && nets.some((item) => item.id === pickedNet)) {
    networkId.value = pickedNet
    return
  }
  if (!nets.some((item) => item.id === networkId.value)) {
    networkId.value = nets[0]?.id ?? ''
  }
})

watch(fiatCategory, () => {
  paygridExpanded.value = false
})

onMounted(() => {
  consumePendingPayoutPick()
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

function selectTab(tab: WalletTransferTab) {
  if (tab === activeTab.value) return
  activeTab.value = tab
  void router.replace({ query: { ...route.query, tab } })
}

function selectChip(id: string) {
  selectedId.value = id
}

function openMoreCurrencies() {
  pickerKind.value = 'more'
}

function applyWithdrawMax() {
  const cap = Math.min(activeCurrency.value.balance, fiatWithdrawMax.value)
  withdrawAmount.value = cap > 0 ? String(Number(cap.toFixed(2))) : '0'
}

function applyFiatWithdrawPercent(percent: number) {
  if (percent === 100) {
    applyWithdrawMax()
    return
  }
  const balance = activeCurrency.value.balance
  const min = fiatWithdrawMin.value
  const cap = Math.min(balance, fiatWithdrawMax.value)
  let next = percent === 0 ? min : (balance * percent) / 100
  if (percent !== 0) next = Math.min(Math.max(next, 0), cap)
  withdrawAmount.value = String(Number(next.toFixed(2)))
}

function downloadWalletAddress() {
  showToast('钱包地址已复制（原型）')
}

function goAddressBook() {
  const tab = isCrypto.value
    ? undefined
    : payoutListTabFromWithdraw(fiatWithdrawKind.value, fiatWithdrawWalletId.value)
  router.push(payoutMethodsRoute(selectedId.value, { pick: true, tab }))
}

function applyWithdrawPayoutPick(pick: WithdrawPayoutPick) {
  if (activeTab.value !== 'withdraw') {
    activeTab.value = 'withdraw'
    void router.replace({ query: { ...route.query, tab: 'withdraw' } })
  }
  selectedId.value = pick.currencyId
  if (pick.channel === 'crypto') {
    if (pick.networkId) networkId.value = pick.networkId
    withdrawAddress.value = pick.address ?? pick.display
    fiatPayoutDisplay.value = ''
    return
  }
  fiatPayoutDisplay.value = pick.display
  if (pick.fiatKind === 'bank') {
    fiatWithdrawKind.value = 'bank'
    return
  }
  fiatWithdrawKind.value = 'ewallet'
  if (pick.fiatKind === 'alipay') fiatWithdrawWalletId.value = 'alipay'
  else if (pick.fiatKind === 'wechat') fiatWithdrawWalletId.value = 'wechat'
  else if (pick.walletId) fiatWithdrawWalletId.value = pick.walletId
  const preview = WALLET_FIAT_WITHDRAW_WALLETS.slice(0, WALLET_FIAT_WITHDRAW_WALLET_PREVIEW)
  if (!preview.some((item) => item.id === fiatWithdrawWalletId.value)) {
    ewalletExpanded.value = true
  }
}

function consumePendingPayoutPick() {
  if (!withdrawPayoutPickPending.value || !withdrawPayoutPick.value) return
  applyWithdrawPayoutPick(withdrawPayoutPick.value)
  withdrawPayoutPickPending.value = false
}

function applyPercent(percent: number, target: 'withdraw' | 'exchange') {
  const balance =
    target === 'withdraw' ? activeCurrency.value.balance : exchangeFromCcy.value.balance
  const min = target === 'withdraw' ? activeCurrency.value.minWithdraw : 0
  let next = (balance * percent) / 100
  if (target === 'withdraw' && percent === 0) next = min
  const text = next.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
  if (target === 'withdraw') withdrawAmount.value = text
  else exchangeFromAmount.value = text
}

async function copyAddress() {
  const address = activeNetwork.value?.address ?? ''
  try {
    await navigator.clipboard.writeText(address)
  } catch {
    /* 原型兜底 */
  }
  showToast('充值地址已复制')
}

function pickCurrency(id: string) {
  if (pickerKind.value === 'from') exchangeFromId.value = id
  else if (pickerKind.value === 'to') exchangeToId.value = id
  else selectedId.value = id
  pickerKind.value = null
}

function pickNetwork(id: string) {
  networkId.value = id
  pickerKind.value = null
}

function swapExchange() {
  const from = exchangeFromId.value
  exchangeFromId.value = exchangeToId.value
  exchangeToId.value = from
  exchangeFromAmount.value = exchangeToAmount.value
    ? String(Number(exchangeToAmount.value.toFixed(6)))
    : ''
}

function onFiatMethodClick(id: string, disabled?: boolean) {
  if (disabled) {
    showToast('该方式维护中')
    return
  }
  fiatMethodId.value = id
}

function isFiatPresetDisabled(preset: number) {
  return preset < fiatMin.value || preset > fiatMax.value
}

function formatFiatLimit(value: number) {
  return Math.round(value).toLocaleString('zh-CN')
}

async function submitDeposit() {
  if (!canSubmitDeposit.value) return
  const ok = await mh5Confirm({
    title: '确认充值',
    message: isCrypto.value
      ? `请向 ${activeNetwork.value?.label} 地址转入 ${activeCurrency.value.name}`
      : `使用${WALLET_FIAT_DEPOSIT_METHODS.find((m) => m.id === fiatMethodId.value)?.name}充值 ${depositAmount.value} ${activeCurrency.value.name}`,
    showCancel: true,
    confirmText: '确定',
  })
  if (ok) showToast('充值申请已提交（原型）')
}

async function submitWithdraw() {
  if (!canPreviewWithdraw.value) return
  const method = isCrypto.value
    ? activeNetwork.value?.label
    : fiatWithdrawKind.value === 'ewallet'
      ? activeWithdrawWallet.value?.name
      : '银行卡'
  const ok = await mh5Confirm({
    title: '确认提现',
    message: `${activeCurrency.value.name} ${withdrawAmount.value} · ${method ?? ''}`,
    showCancel: true,
    confirmText: '提交',
  })
  if (ok) showToast('提现申请已提交（原型）')
}

async function submitExchange() {
  if (!canExchange.value) {
    if (exchangeFromId.value === exchangeToId.value) showToast('请选择不同币种')
    return
  }
  const ok = await mh5Confirm({
    title: '确认兑换',
    message: `${formatTransferAmount(exchangeFromNum.value)} ${exchangeFromCcy.value.name} → ${formatTransferAmount(exchangeToAmount.value)} ${exchangeToCcy.value.name}`,
    showCancel: true,
    confirmText: '立即兑换',
  })
  if (ok) showToast('兑换成功（原型）')
}

function qrCells(seed: string) {
  const cells: boolean[] = []
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  for (let i = 0; i < 121; i += 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0
    cells.push(hash % 3 !== 0)
  }
  return cells
}
</script>

<template>
  <div class="mh5-wallet-transfer-page">
    <Mh5SubPageHeader>
      <template #center>
        <div class="mh5-wallet-transfer-tabs" role="tablist" aria-label="充值提现兑换">
          <button
            v-for="tab in WALLET_TRANSFER_TABS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-wallet-transfer-tabs__item"
            :class="{ 'mh5-wallet-transfer-tabs__item--active': activeTab === tab.key }"
            :aria-selected="activeTab === tab.key"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </template>
      <template #right>
        <Mh5SpecAnnot :spec="WALLET_TRANSFER_PAGE_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-wallet-transfer-main">
      <section v-if="activeTab !== 'exchange'" class="mh5-wallet-transfer-card">
        <div v-if="showCurrencyChips" class="mh5-wallet-transfer-chips">
          <button
            v-for="item in quickCurrencies"
            :key="item.id"
            type="button"
            class="mh5-wallet-transfer-chip"
            :class="{ 'mh5-wallet-transfer-chip--active': selectedId === item.id }"
            @click="selectChip(item.id)"
          >
            <span class="mh5-wallet-transfer-chip__icon" :style="{ background: item.color }">{{ item.symbol }}</span>
            {{ item.name }}
          </button>
          <button
            type="button"
            class="mh5-wallet-transfer-chip mh5-wallet-transfer-chip--more"
            aria-label="更多币种"
            @click="openMoreCurrencies"
          >
            <span class="mh5-wallet-transfer-chip__stack" aria-hidden="true">
              <span
                v-for="item in morePreviewCurrencies"
                :key="item.id"
                :style="{ background: item.color }"
              >{{ item.symbol }}</span>
            </span>
            更多
            <span class="mh5-wallet-transfer-chip__chevron" aria-hidden="true">›</span>
          </button>
        </div>

        <button type="button" class="mh5-wallet-transfer-select" @click="openMoreCurrencies">
          <span class="mh5-wallet-transfer-select__label">货币</span>
          <span class="mh5-wallet-transfer-select__value">
            <span class="mh5-wallet-transfer-dot" :style="{ background: activeCurrency.color }">{{ activeCurrency.symbol }}</span>
            {{ activeCurrency.name }}
            <span class="mh5-wallet-transfer-select__balance">{{ formatTransferAmount(activeCurrency.balance, 2) }}</span>
            <span class="mh5-wallet-transfer-select__chevron" aria-hidden="true">›</span>
          </span>
        </button>

        <template v-if="activeTab === 'deposit' && isCrypto">
          <button type="button" class="mh5-wallet-transfer-select" @click="pickerKind = 'network'">
            <span class="mh5-wallet-transfer-select__label">网络</span>
            <span class="mh5-wallet-transfer-select__value">
              {{ activeNetwork?.label ?? '请选择网络' }}
              <span class="mh5-wallet-transfer-select__chevron" aria-hidden="true">›</span>
            </span>
          </button>
          <div class="mh5-wallet-transfer-qr" aria-hidden="true">
            <div class="mh5-wallet-transfer-qr__grid">
              <span
                v-for="(on, idx) in qrCells(activeNetwork?.address ?? selectedId)"
                :key="idx"
                class="mh5-wallet-transfer-qr__cell"
                :class="{ 'mh5-wallet-transfer-qr__cell--on': on }"
              />
            </div>
            <span class="mh5-wallet-transfer-qr__logo" :style="{ background: activeCurrency.color }">
              {{ activeCurrency.symbol }}
            </span>
          </div>
          <div class="mh5-wallet-transfer-address">
            <span class="mh5-wallet-transfer-select__label">充值地址</span>
            <div class="mh5-wallet-transfer-address__row">
              <p class="mh5-wallet-transfer-address__text">
                <span
                  v-for="(seg, idx) in addressSegments"
                  :key="idx"
                  :class="{ 'mh5-wallet-transfer-address__mark': seg.accent }"
                >{{ seg.text }}</span>
              </p>
              <button type="button" class="mh5-wallet-transfer-copy" @click="copyAddress">复制</button>
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
            发送前请确认钱包地址和网络均正确无误。错误转账将无法找回。
          </p>
        </template>

        <template v-else-if="activeTab === 'deposit'">
          <p class="mh5-wallet-transfer-select__label">支付方式</p>
          <div class="mh5-wallet-transfer-paytabs" role="tablist" aria-label="支付方式分类">
            <button
              v-for="tab in WALLET_FIAT_DEPOSIT_TABS"
              :key="tab.key"
              type="button"
              class="mh5-wallet-transfer-paytab"
              :class="{ 'mh5-wallet-transfer-paytab--active': fiatCategory === tab.key }"
              role="tab"
              :aria-selected="fiatCategory === tab.key"
              @click="fiatCategory = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
          <p v-if="!visibleFiatMethods.length" class="mh5-wallet-transfer-empty">暂无匹配渠道</p>
          <template v-else>
            <div class="mh5-wallet-transfer-paygrid" role="listbox" aria-label="支付方式">
              <button
                v-for="method in visibleFiatMethods"
                :key="method.id"
                type="button"
                class="mh5-wallet-transfer-paycard"
                :class="{
                  'mh5-wallet-transfer-paycard--active': fiatMethodId === method.id && !method.disabled,
                  'mh5-wallet-transfer-paycard--disabled': method.disabled,
                }"
                :aria-selected="fiatMethodId === method.id && !method.disabled"
                @click="onFiatMethodClick(method.id, method.disabled)"
              >
                <span
                  class="mh5-wallet-transfer-paycard__icon"
                  :style="{ background: method.color ?? '#64748b' }"
                >{{ method.icon ?? method.name.slice(0, 1) }}</span>
                <strong>{{ method.name }}</strong>
                <span class="mh5-wallet-transfer-paycard__promo">
                  {{ method.disabled ? '维护中' : method.promo || '立即到账' }}
                </span>
              </button>
            </div>
            <button
              v-if="hasMoreFiatMethods"
              type="button"
              class="mh5-wallet-transfer-wdmore"
              @click="paygridExpanded = !paygridExpanded"
            >
              {{ paygridExpanded ? '收起' : '更多' }}
              <span aria-hidden="true">{{ paygridExpanded ? '∧' : '∨' }}</span>
            </button>
          </template>
          <label class="mh5-wallet-transfer-amount">
            <span class="mh5-wallet-transfer-select__label">{{ fiatAmountRangeLabel }}</span>
            <div class="mh5-wallet-transfer-swap-row">
              <input
                v-model="depositAmount"
                class="mh5-wallet-transfer-input mh5-wallet-transfer-input--bare mh5-wallet-transfer-input--range"
                type="number"
                min="0"
                :placeholder="fiatAmountPlaceholder"
              />
              <span class="mh5-wallet-transfer-ccy-btn mh5-wallet-transfer-ccy-btn--static">
                <span class="mh5-wallet-transfer-dot" :style="{ background: activeCurrency.color }">{{ activeCurrency.symbol }}</span>
                {{ activeCurrency.name }}
              </span>
            </div>
            <span
              v-if="fiatAmountHint"
              class="mh5-wallet-transfer-available mh5-wallet-transfer-select__label--warn"
            >
              {{ fiatAmountHint }}
            </span>
          </label>
          <div class="mh5-wallet-transfer-presets mh5-wallet-transfer-presets--fiat">
            <button
              v-for="preset in fiatPresets"
              :key="preset"
              type="button"
              class="mh5-wallet-transfer-preset"
              :class="{
                'mh5-wallet-transfer-preset--active': depositAmountNum === preset,
                'mh5-wallet-transfer-preset--disabled': isFiatPresetDisabled(preset),
              }"
              :disabled="isFiatPresetDisabled(preset)"
              @click="depositAmount = String(preset)"
            >
              {{ formatFiatLimit(preset) }}
            </button>
          </div>
          <button
            type="button"
            class="mh5-wallet-transfer-submit"
            :disabled="!canSubmitDeposit"
            @click="submitDeposit"
          >
            立即充值
          </button>
          <p v-if="WALLET_FIAT_DEPOSIT_NOTICE" class="mh5-wallet-transfer-tip mh5-wallet-transfer-tip--warn">
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
            {{ WALLET_FIAT_DEPOSIT_NOTICE }}
          </p>
        </template>

        <template v-else-if="isCrypto">
          <button type="button" class="mh5-wallet-transfer-select" @click="pickerKind = 'network'">
            <span class="mh5-wallet-transfer-select__label">网络</span>
            <span class="mh5-wallet-transfer-select__value">
              {{ activeNetwork?.label ?? '请选择网络' }}
              <span class="mh5-wallet-transfer-select__chevron" aria-hidden="true">›</span>
            </span>
          </button>
          <div class="mh5-wallet-transfer-amount">
            <span class="mh5-wallet-transfer-select__label">提款地址</span>
            <div class="mh5-wallet-transfer-addr">
              <input
                v-model="withdrawAddress"
                class="mh5-wallet-transfer-input"
                type="text"
                :placeholder="`请输入 ${activeCurrency.name} 钱包地址`"
              />
              <button
                type="button"
                class="mh5-wallet-transfer-addressbook mh5-wallet-transfer-addressbook--icon"
                aria-label="地址本"
                @click.stop.prevent="goAddressBook"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.7" />
                  <path d="M9 3v18" stroke="currentColor" stroke-width="1.7" />
                  <circle cx="14.2" cy="10" r="1.7" stroke="currentColor" stroke-width="1.5" />
                  <path
                    d="M11.6 15.2c.4-1.2 1.4-1.9 2.6-1.9s2.2.7 2.6 1.9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <label class="mh5-wallet-transfer-amount">
            <span class="mh5-wallet-transfer-select__label">
              提款金额(最小提款<span class="mh5-wallet-transfer-select__label--warn">{{ withdrawAmountMinText }}</span> {{ activeCurrency.name }})
            </span>
            <input
              v-model="withdrawAmount"
              class="mh5-wallet-transfer-input"
              type="number"
              min="0"
              placeholder="请输入提款金额"
            />
          </label>
          <div class="mh5-wallet-transfer-presets">
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(0, 'withdraw')">最小值</button>
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(25, 'withdraw')">25%</button>
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(50, 'withdraw')">50%</button>
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(100, 'withdraw')">最大值</button>
          </div>
          <button
            type="button"
            class="mh5-wallet-transfer-submit"
            :disabled="!canPreviewWithdraw"
            @click="submitWithdraw"
          >
            提交
          </button>
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
            为了安全起见，该笔提款会尽快审核处理，我们感谢您的耐心等待！
          </p>
        </template>

        <template v-else>
          <p class="mh5-wallet-transfer-select__label">提款类型</p>
          <div class="mh5-wallet-transfer-paytabs" role="tablist" aria-label="提款类型">
            <button
              v-for="tab in WALLET_FIAT_WITHDRAW_TABS"
              :key="tab.key"
              type="button"
              class="mh5-wallet-transfer-paytab"
              :class="{ 'mh5-wallet-transfer-paytab--active': fiatWithdrawKind === tab.key }"
              role="tab"
              :aria-selected="fiatWithdrawKind === tab.key"
              @click="fiatWithdrawKind = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <template v-if="fiatWithdrawKind === 'ewallet'">
            <div class="mh5-wallet-transfer-wdgrid" role="listbox" aria-label="电子钱包">
              <button
                v-for="wallet in visibleWithdrawWallets"
                :key="wallet.id"
                type="button"
                class="mh5-wallet-transfer-wdcard"
                :class="{ 'mh5-wallet-transfer-wdcard--active': fiatWithdrawWalletId === wallet.id }"
                :aria-selected="fiatWithdrawWalletId === wallet.id"
                @click="fiatWithdrawWalletId = wallet.id"
              >
                <span class="mh5-wallet-transfer-wdcard__icon" :style="{ background: wallet.color }">{{ wallet.icon }}</span>
                <strong>{{ wallet.name }}</strong>
              </button>
            </div>
            <button
              v-if="hasMoreWithdrawWallets"
              type="button"
              class="mh5-wallet-transfer-wdmore"
              @click="ewalletExpanded = !ewalletExpanded"
            >
              {{ ewalletExpanded ? '收起' : '更多' }}
              <span aria-hidden="true">{{ ewalletExpanded ? '∧' : '∨' }}</span>
            </button>
          </template>

          <div class="mh5-wallet-transfer-amount">
            <span class="mh5-wallet-transfer-select__label">收款方式</span>
            <div class="mh5-wallet-transfer-addr">
              <input
                class="mh5-wallet-transfer-input mh5-wallet-transfer-input--select"
                type="text"
                readonly
                :value="fiatPayoutDisplay"
                placeholder="选择您的收款方式"
                @click="goAddressBook"
              />
              <button
                type="button"
                class="mh5-wallet-transfer-addressbook mh5-wallet-transfer-addressbook--icon"
                aria-label="地址本"
                @click.stop.prevent="goAddressBook"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.7" />
                  <path d="M9 3v18" stroke="currentColor" stroke-width="1.7" />
                  <circle cx="14.2" cy="10" r="1.7" stroke="currentColor" stroke-width="1.5" />
                  <path
                    d="M11.6 15.2c.4-1.2 1.4-1.9 2.6-1.9s2.2.7 2.6 1.9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="mh5-wallet-transfer-wdamount">
            <div class="mh5-wallet-transfer-wdamount__head">
              <span class="mh5-wallet-transfer-select__label">
                <i v-if="fiatWithdrawKind === 'ewallet'" class="mh5-wallet-transfer-req">*</i>
                提款金额({{ fiatDepositQuoteText(activeCurrency.id, activeCurrency.name) }})
              </span>
              <button
                v-if="fiatWithdrawKind === 'ewallet'"
                type="button"
                class="mh5-wallet-transfer-wdamount__link"
                @click="downloadWalletAddress"
              >
                下载钱包地址
              </button>
            </div>
            <div class="mh5-wallet-transfer-swap-row">
              <input
                v-model="withdrawAmount"
                class="mh5-wallet-transfer-input mh5-wallet-transfer-input--bare mh5-wallet-transfer-input--range"
                type="number"
                min="0"
                :placeholder="fiatWithdrawPlaceholder"
              />
              <span class="mh5-wallet-transfer-ccy-btn mh5-wallet-transfer-ccy-btn--static">
                <span class="mh5-wallet-transfer-dot" :style="{ background: activeCurrency.color }">{{ activeCurrency.symbol }}</span>
                {{ activeCurrency.name }}
              </span>
            </div>
          </div>
          <div class="mh5-wallet-transfer-presets">
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyFiatWithdrawPercent(0)">最小值</button>
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyFiatWithdrawPercent(25)">25%</button>
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyFiatWithdrawPercent(50)">50%</button>
            <button type="button" class="mh5-wallet-transfer-preset" @click="applyFiatWithdrawPercent(100)">最大值</button>
          </div>

          <div v-if="fiatWithdrawKind === 'ewallet'" class="mh5-wallet-transfer-summary">
            <div>
              <span>钱包余额</span>
              <strong>{{ formatTransferAmount(activeCurrency.balance, 2) }} {{ activeCurrency.name }}</strong>
            </div>
            <div>
              <span>手续费</span>
              <strong>
                {{ fiatWithdrawFee == null ? '--' : formatTransferAmount(fiatWithdrawFee, 2) }}
                {{ activeCurrency.name }}
              </strong>
            </div>
            <div>
              <span>实际到账金额</span>
              <strong class="mh5-wallet-transfer-summary__accent">
                {{ fiatWithdrawReceive == null ? '--' : formatTransferAmount(fiatWithdrawReceive, 2) }}
                {{ activeCurrency.name }}
              </strong>
            </div>
          </div>
          <dl v-else class="mh5-wallet-transfer-meta">
            <div>
              <dt>钱包余额</dt>
              <dd>{{ formatTransferAmount(activeCurrency.balance, 2) }} {{ activeCurrency.name }}</dd>
            </div>
            <div>
              <dt>手续费</dt>
              <dd>
                {{ fiatWithdrawFee == null ? '--' : formatTransferAmount(fiatWithdrawFee, 2) }}
                {{ activeCurrency.name }}
              </dd>
            </div>
            <div>
              <dt>实际到账金额</dt>
              <dd class="mh5-wallet-transfer-summary__accent">
                {{ fiatWithdrawReceive == null ? '--' : formatTransferAmount(fiatWithdrawReceive, 2) }}
                {{ activeCurrency.name }}
              </dd>
            </div>
          </dl>

          <label class="mh5-wallet-transfer-amount">
            <span class="mh5-wallet-transfer-select__label">备注</span>
            <input
              v-model="withdrawRemark"
              class="mh5-wallet-transfer-input"
              type="text"
              maxlength="50"
              placeholder="请输入"
            />
          </label>

          <p v-if="fiatWithdrawKind === 'bank'" class="mh5-wallet-transfer-wdhints">
            {{ WALLET_FIAT_WITHDRAW_REF }}<br>
            24H提现额度：<em>{{ formatTransferAmount(WALLET_FIAT_WITHDRAW_DAILY_LIMIT, 2) }} {{ activeCurrency.name }}</em><br>
            到账数量 = 提款数量 - 手续费<br>
            请勿用于其他币种，否则资产将不可找回
          </p>

          <button
            type="button"
            class="mh5-wallet-transfer-submit"
            :disabled="!canPreviewWithdraw"
            @click="submitWithdraw"
          >
            提交
          </button>
        </template>
      </section>

      <!-- 兑换 -->
      <section v-else class="mh5-wallet-transfer-card">
        <div class="mh5-wallet-transfer-swap-head">
          <span>转出</span>
          <span>{{ exchangeCnyApprox }}</span>
        </div>
        <div class="mh5-wallet-transfer-swap-row">
          <input
            v-model="exchangeFromAmount"
            class="mh5-wallet-transfer-input mh5-wallet-transfer-input--bare"
            type="number"
            min="0"
            placeholder="0.00"
          />
          <button type="button" class="mh5-wallet-transfer-ccy-btn" @click="pickerKind = 'from'">
            <span class="mh5-wallet-transfer-dot" :style="{ background: exchangeFromCcy.color }">{{ exchangeFromCcy.symbol }}</span>
            {{ exchangeFromCcy.name }}
          </button>
        </div>
        <div class="mh5-wallet-transfer-presets">
          <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(25, 'exchange')">25%</button>
          <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(50, 'exchange')">50%</button>
          <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(75, 'exchange')">75%</button>
          <button type="button" class="mh5-wallet-transfer-preset" @click="applyPercent(100, 'exchange')">100%</button>
        </div>

        <button type="button" class="mh5-wallet-transfer-swap" aria-label="对调币种" @click="swapExchange">
          ↕
        </button>

        <div class="mh5-wallet-transfer-swap-head">
          <span>转入</span>
        </div>
        <div class="mh5-wallet-transfer-swap-row">
          <input
            class="mh5-wallet-transfer-input mh5-wallet-transfer-input--bare"
            type="text"
            readonly
            :value="exchangeToAmount ? formatTransferAmount(exchangeToAmount) : '0.00'"
          />
          <button type="button" class="mh5-wallet-transfer-ccy-btn" @click="pickerKind = 'to'">
            <span class="mh5-wallet-transfer-dot" :style="{ background: exchangeToCcy.color }">{{ exchangeToCcy.symbol }}</span>
            {{ exchangeToCcy.name }}
          </button>
        </div>
        <p class="mh5-wallet-transfer-available">
          充值余额: {{ formatTransferAmount(exchangeFromCcy.balance) }}
        </p>
        <dl class="mh5-wallet-transfer-meta">
          <div>
            <dt>费率</dt>
            <dd>{{ exchangeRateText(exchangeFromId, exchangeToId) }}</dd>
          </div>
          <div>
            <dt>预计时间</dt>
            <dd>{{ WALLET_EXCHANGE_ETA }}</dd>
          </div>
          <div>
            <dt>兑换费</dt>
            <dd>{{ WALLET_EXCHANGE_FEE }} {{ exchangeFromCcy.name }}</dd>
          </div>
        </dl>
        <button
          type="button"
          class="mh5-wallet-transfer-submit"
          :disabled="!canExchange"
          @click="submitExchange"
        >
          立即兑换
        </button>
      </section>
    </main>

    <Mh5WalletSheet
      :open="walletSheetOpen"
      :title="pickerTitle"
      selectable
      :selected-id="pickerSelectedId"
      @close="pickerKind = null"
      @select="pickCurrency"
    />

    <Transition name="mh5-wallet-sheet">
      <div
        v-if="pickerKind === 'network'"
        class="mh5-wallet-sheet-mask"
        @click.self="pickerKind = null"
      >
        <div class="mh5-wallet-sheet" role="dialog" aria-modal="true" aria-labelledby="wallet-network-sheet-title">
          <div class="mh5-wallet-sheet__head">
            <h2 id="wallet-network-sheet-title" class="mh5-wallet-sheet__title">选择网络</h2>
            <button type="button" class="mh5-wallet-sheet__close" aria-label="关闭" @click="pickerKind = null">
              ×
            </button>
          </div>
          <div class="mh5-wallet-sheet__list">
            <button
              v-for="net in activeNetworks"
              :key="net.id"
              type="button"
              class="mh5-wallet-sheet__item mh5-wallet-sheet__item--selectable"
              @click="pickNetwork(net.id)"
            >
              <span class="mh5-wallet-sheet__name">{{ net.label }}</span>
              <span v-if="networkId === net.id" class="mh5-wallet-transfer-check">✓</span>
            </button>
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
