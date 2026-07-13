<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberAgentInvites, memberAgentMembershipJoined } from '../../constants/agentInvitation'
import '../../styles/mobile-app-shell.css'

type WalletFilter = 'all' | 'fiat' | 'crypto' | 'credit'
type WalletKind = 'fiat' | 'crypto' | 'credit'

interface SimpleWalletItem {
  id: string
  name: string
  color: string
  symbol: string
  kind: WalletKind
  balance: number
  /** Mock：折合人民币汇率，用于总资产汇总 */
  cnyRate: number
}

interface PreferredFiatOption {
  id: string
  name: string
  symbol: string
  color: string
  /** Mock：1 CNY 可兑换的该币数量 */
  fromCny: number
}

const balanceHidden = ref(false)
const refreshing = ref(false)
const walletSheetOpen = ref(false)
const fiatPreferenceOpen = ref(false)
const preferredFiatId = ref('cny')
const walletFilter = ref<WalletFilter>('all')
const router = useRouter()

const walletFilterTabs = [
  { key: 'all' as const, label: '全部' },
  { key: 'fiat' as const, label: '法币' },
  { key: 'crypto' as const, label: '虚拟币' },
  { key: 'credit' as const, label: '信用额度' },
]

/** 钱包内法币：KKC / KKV */
const fiatWallets: SimpleWalletItem[] = [
  { id: 'kkc', name: 'KKC', color: '#ff7a2b', symbol: 'K', kind: 'fiat', balance: 236188.66, cnyRate: 1 },
  { id: 'kkv', name: 'KKV', color: '#ec4899', symbol: 'V', kind: 'fiat', balance: 12880.5, cnyRate: 0.5 },
]

const cryptoWallets: SimpleWalletItem[] = [
  { id: 'usdt-tron', name: 'USDT-TRON', color: '#26a17b', symbol: '₮', kind: 'crypto', balance: 8652.3, cnyRate: 7.2 },
  { id: 'usdt-sol', name: 'USDT-SOL', color: '#26a17b', symbol: '₮', kind: 'crypto', balance: 1205.05, cnyRate: 7.2 },
  { id: 'eth', name: 'ETH', color: '#627eea', symbol: 'Ξ', kind: 'crypto', balance: 1.256789, cnyRate: 25000 },
  { id: 'btc', name: 'BTC', color: '#f7931a', symbol: '₿', kind: 'crypto', balance: 0.08543218, cnyRate: 650000 },
  { id: 'trx', name: 'TRX', color: '#ef0027', symbol: 'T', kind: 'crypto', balance: 12580.45, cnyRate: 1.2 },
  { id: 'sol', name: 'SOL', color: '#111827', symbol: 'S', kind: 'crypto', balance: 128.45012, cnyRate: 1200 },
  { id: 'bnb', name: 'BNB', color: '#f3ba2f', symbol: 'B', kind: 'crypto', balance: 12.345678, cnyRate: 4500 },
]

const creditWallets: SimpleWalletItem[] = [
  { id: 'credit-cny', name: 'CNY', color: '#ff7a2b', symbol: '¥', kind: 'credit', balance: 50000, cnyRate: 1 },
  { id: 'credit-usd', name: 'USD', color: '#3b82f6', symbol: '$', kind: 'credit', balance: 1280.5, cnyRate: 7.2 },
]

/** 总资产计价法币：按实时汇率汇总展示 */
const preferredFiatOptions: PreferredFiatOption[] = [
  { id: 'cny', name: 'CNY', symbol: '¥', color: '#ff7a2b', fromCny: 1 },
  { id: 'vnd', name: 'VND', symbol: '₫', color: '#ef4444', fromCny: 3500 },
  { id: 'usd', name: 'USD', symbol: '$', color: '#26a17b', fromCny: 1 / 7.2 },
]

const walletListItems = computed(() => {
  if (walletFilter.value === 'fiat') return fiatWallets
  if (walletFilter.value === 'crypto') return cryptoWallets
  if (walletFilter.value === 'credit') return creditWallets
  return [...fiatWallets, ...cryptoWallets, ...creditWallets]
})

/** 法币 / 信用额度固定 2 位；虚拟币按币种精度，均带千分位 */
function formatWalletBalance(item: SimpleWalletItem) {
  if (item.kind === 'fiat' || item.kind === 'credit') {
    return item.balance.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const maxDigits =
    item.id === 'btc'
      ? 8
      : item.id === 'eth' || item.id === 'sol' || item.id === 'bnb'
        ? 6
        : item.id.startsWith('usdt') || item.id === 'trx'
          ? 4
          : 2

  return item.balance.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  })
}

function formatPreferredAmount(amount: number) {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const preferredFiat = computed(
  () => preferredFiatOptions.find((item) => item.id === preferredFiatId.value) ?? preferredFiatOptions[0],
)

/** 全部钱包按 Mock 汇率折合 CNY，再换算为所选计价法币 */
const totalAssetsInPreferredFiat = computed(() => {
  const totalCny = [...fiatWallets, ...cryptoWallets, ...creditWallets].reduce(
    (sum, item) => sum + item.balance * item.cnyRate,
    0,
  )
  return totalCny * preferredFiat.value.fromCny
})

const preferredFiatAmountText = computed(() => {
  const amount = formatPreferredAmount(totalAssetsInPreferredFiat.value)
  if (balanceHidden.value) return `${preferredFiat.value.symbol} ${mask(amount)}`
  return `${preferredFiat.value.symbol} ${amount}`
})
const user = {
  name: 'EZ',
  id: 'EZ888888',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EZ&backgroundColor=ffdfbf',
  stats: [
    { value: 0, label: '动态' },
    { value: 2, label: '收藏' },
    { value: 2, label: '关注' },
    { value: 0, label: '粉丝' },
  ],
}

interface MineShortcutItem {
  key: string
  label: string
  route?: string
}

interface MineMenuItem {
  key: string
  title: string
  hot?: boolean
  badge?: number
  route?: string
}

const walletShortcuts: MineShortcutItem[] = [
  { key: 'assets', label: '资产明细', route: 'mobile-asset-detail' },
  { key: 'bill', label: '账单', route: 'mobile-billing-list' },
  { key: 'bank', label: '银行' },
  { key: 'payment', label: '收款方式' },
]

const pendingInviteCount = computed(
  () => memberAgentInvites.value.filter((item) => item.status === 'pending').length,
)

const menuItems = computed<MineMenuItem[]>(() => {
  const base: MineMenuItem[] = [
    { key: 'live', title: '直播中心', route: 'mobile-live' },
    { key: 'invite', title: '邀请好友' },
  ]

  if (memberAgentMembershipJoined.value) {
    return [...base, { key: 'agent', title: '代理中心' }]
  }

  return [
    ...base,
    {
      key: 'agent-invite',
      title: '代理邀请',
      badge: pendingInviteCount.value > 0 ? pendingInviteCount.value : undefined,
      route: 'mobile-agent-invites',
    },
  ]
})

function mask(value: string) {
  return balanceHidden.value ? '****' : value
}

function goUserHome() {
  router.push({ name: 'mobile-user-home' })
}

function goSettings() {
  router.push({ name: 'mobile-mine-settings' })
}

function goAllWallets() {
  walletSheetOpen.value = true
}

function closeWalletSheet() {
  walletSheetOpen.value = false
}

function openFiatPreference() {
  fiatPreferenceOpen.value = true
}

function closeFiatPreference() {
  fiatPreferenceOpen.value = false
}

function pickPreferredFiat(id: string) {
  preferredFiatId.value = id
  fiatPreferenceOpen.value = false
}

function switchWalletFilter(key: WalletFilter) {
  walletFilter.value = key
}

function handleRefresh() {
  if (refreshing.value) return
  refreshing.value = true
  window.setTimeout(() => {
    refreshing.value = false
  }, 800)
}

function goRoute(routeName?: string) {
  if (routeName) router.push({ name: routeName })
}

function goMenuItem(item: MineMenuItem) {
  if (item.key === 'agent') {
    router.push({ name: 'mobile-agent', query: { from: 'mine' } })
    return
  }
  goRoute(item.route)
}
</script>

<template>
  <div class="mh5-mine-root">
    <div class="mh5-mine-page">
    <div class="mh5-mine-topbar">
      <button type="button" class="mh5-mine-topbar__btn" aria-label="客服">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 14v2a2 2 0 002 2h1l2 3 4-3h5a2 2 0 002-2v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v6z"
            stroke="currentColor"
            stroke-width="1.6"
          />
          <circle cx="9" cy="11" r="1" fill="currentColor" />
          <circle cx="12" cy="11" r="1" fill="currentColor" />
          <circle cx="15" cy="11" r="1" fill="currentColor" />
        </svg>
      </button>
      <button type="button" class="mh5-mine-topbar__btn" aria-label="设置" @click="goSettings">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2.5l6.5 3.75v7.5L12 17.5 5.5 13.75v-7.5L12 2.5z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="2.2" stroke="currentColor" stroke-width="1.4" />
          <path
            d="M12 10.2v1.6M12 13.8v.2"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <section
      class="mh5-mine-profile"
      role="button"
      tabindex="0"
      @click="goUserHome"
      @keydown.enter="goUserHome"
      @keydown.space.prevent="goUserHome"
    >
      <div class="mh5-mine-profile__main">
        <img :src="user.avatar" alt="" class="mh5-mine-profile__avatar" />
        <div class="mh5-mine-profile__info">
          <h2 class="mh5-mine-profile__name">{{ user.name }}</h2>
          <p class="mh5-mine-profile__id">
            <span>金刚号：{{ user.id }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6" />
              <rect x="14" y="14" width="3" height="3" fill="currentColor" />
              <rect x="18" y="14" width="3" height="3" fill="currentColor" />
              <rect x="14" y="18" width="3" height="3" fill="currentColor" />
              <rect x="18" y="18" width="3" height="3" fill="currentColor" />
            </svg>
          </p>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          class="mh5-mine-profile__arrow"
          aria-hidden="true"
        >
          <path
            d="M7 4l6 6-6 6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="mh5-mine-profile__stats">
        <div v-for="stat in user.stats" :key="stat.label" class="mh5-mine-profile__stat">
          <span class="mh5-mine-profile__stat-value">{{ stat.value }}</span>
          <span class="mh5-mine-profile__stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <div class="mh5-mine-actions">
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8.5V18a2 2 0 002 2h12a2 2 0 002-2V8.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M4 10h16" stroke="currentColor" stroke-width="1.6" />
            <path
              d="M12 14v4M10 16h4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </span>
        充值
      </button>
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8.5V18a2 2 0 002 2h12a2 2 0 002-2V8.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M4 10h16" stroke="currentColor" stroke-width="1.6" />
            <path
              d="M12 16V12M10 14h4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </span>
        提现
      </button>
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 8h11M15 6l3 2-3 2M17 16H6M9 18l-3-2 3-2"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        交易
      </button>
    </div>

    <section class="mh5-mine-wallet">
      <div class="mh5-mine-wallet__head">
        <div class="mh5-mine-wallet__label">
          总资产
          <button
            type="button"
            class="mh5-mine-wallet__currency"
            aria-label="选择偏好计价法币"
            @click="openFiatPreference"
          >
            {{ preferredFiat.name }}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="mh5-mine-wallet__icon-btn mh5-mine-wallet__icon-btn--inline"
            :aria-label="balanceHidden ? '显示余额' : '隐藏余额'"
            @click="balanceHidden = !balanceHidden"
          >
            <svg v-if="!balanceHidden" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3l18 18M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4M6.7 6.7C4.6 8.1 3 10 3 10s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8M17.3 17.3C19.4 15.9 21 14 21 14s-3.5-6-10-6c-1.1 0-2.1.2-3 .5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <button type="button" class="mh5-mine-wallet__all" @click="goAllWallets">
          全部钱包
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="mh5-mine-wallet__balance-row">
        <div class="mh5-mine-wallet__balance">
          <span class="mh5-mine-wallet__amount">{{ preferredFiatAmountText }}</span>
          <button
            type="button"
            class="mh5-mine-wallet__icon-btn"
            :class="{ 'mh5-mine-wallet__icon-btn--spin': refreshing }"
            aria-label="刷新资产"
            @click="handleRefresh"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12a8 8 0 10-2.3 5.7M20 12v-5M20 12h-5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="mh5-mine-wallet__shortcuts">
        <button
          v-for="item in walletShortcuts"
          :key="item.key"
          type="button"
          class="mh5-mine-wallet__shortcut"
          @click="goRoute(item.route)"
        >
          <span class="mh5-mine-wallet__shortcut-icon" aria-hidden="true">
            <svg v-if="item.key === 'assets'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <svg v-else-if="item.key === 'bill'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <svg v-else-if="item.key === 'bank'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 10h16M6 10V18M10 10V18M14 10V18M18 10V18M3 18h18M12 4l9 4H3l9-4z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M3 10h18M7 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          <span class="mh5-mine-wallet__shortcut-label">{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section class="mh5-mine-more">
      <h2 class="mh5-mine-more__title">更多功能</h2>
      <div class="mh5-mine-menu">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="mh5-mine-menu__item"
        @click="goMenuItem(item)"
      >
        <span class="mh5-mine-menu__icon" aria-hidden="true">
          <svg v-if="item.key === 'live'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.6" />
            <path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <svg v-else-if="item.key === 'invite'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.6" />
            <path d="M4 19c0-2.8 2.2-5 5-5M16 11v6M13 14h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <svg v-else-if="item.key === 'agent'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l8 4v6c0 4.4-3.6 8-8 8s-8-3.6-8-8V7l8-4z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <svg v-else-if="item.key === 'agent-invite'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 7.5A2.5 2.5 0 017.5 5h9A2.5 2.5 0 0119 7.5v7A2.5 2.5 0 0116.5 17H13l-3 3v-3H7.5A2.5 2.5 0 015 14.5v-7z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M8.5 10h7M8.5 13h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 11v2a2 2 0 002 2h1l1 3 3-2h4a2 2 0 002-2v-6a6 6 0 10-12 0z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <span class="mh5-mine-menu__title">{{ item.title }}</span>
        <span class="mh5-mine-menu__tail">
          <span v-if="item.badge" class="mh5-mine-menu__badge" :aria-label="`${item.badge}条待处理`">{{ item.badge }}</span>
          <span v-if="item.hot" class="mh5-mine-menu__hot" aria-label="热门">🔥</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M7 4l6 6-6 6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
      </div>
    </section>
    </div>

    <Transition name="mh5-wallet-sheet">
      <div
        v-if="walletSheetOpen"
        class="mh5-wallet-sheet-mask"
        @click.self="closeWalletSheet"
      >
        <div class="mh5-wallet-sheet" role="dialog" aria-modal="true" aria-labelledby="wallet-sheet-title">
          <div class="mh5-wallet-sheet__head">
            <h2 id="wallet-sheet-title" class="mh5-wallet-sheet__title">全部钱包</h2>
            <button type="button" class="mh5-wallet-sheet__close" aria-label="关闭" @click="closeWalletSheet">
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

          <div class="mh5-wallet-sheet__filters" role="tablist" aria-label="钱包分类">
            <button
              v-for="tab in walletFilterTabs"
              :key="tab.key"
              type="button"
              class="mh5-wallet-sheet__filter"
              :class="{ 'mh5-wallet-sheet__filter--active': walletFilter === tab.key }"
              role="tab"
              :aria-selected="walletFilter === tab.key"
              @click="switchWalletFilter(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="mh5-wallet-sheet__list">
            <div
              v-for="item in walletListItems"
              :key="item.id"
              class="mh5-wallet-sheet__item"
            >
              <span class="mh5-wallet-sheet__icon" :style="{ background: item.color }">
                {{ item.symbol }}
              </span>
              <span class="mh5-wallet-sheet__name">{{ item.name }}</span>
              <span class="mh5-wallet-sheet__balance">{{ formatWalletBalance(item) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-wallet-sheet">
      <div
        v-if="fiatPreferenceOpen"
        class="mh5-wallet-sheet-mask"
        @click.self="closeFiatPreference"
      >
        <div
          class="mh5-wallet-sheet agent-currency-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fiat-preference-title"
        >
          <div class="mh5-wallet-sheet__head">
            <h2 id="fiat-preference-title" class="mh5-wallet-sheet__title">选择偏好计价法币</h2>
            <button
              type="button"
              class="mh5-wallet-sheet__close"
              aria-label="关闭"
              @click="closeFiatPreference"
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
              v-for="item in preferredFiatOptions"
              :key="item.id"
              type="button"
              class="agent-currency-sheet__item"
              :class="{ 'agent-currency-sheet__item--active': preferredFiatId === item.id }"
              @click="pickPreferredFiat(item.id)"
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
  </div>
</template>
