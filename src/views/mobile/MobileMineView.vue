<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberAgentInvites, memberAgentMembershipJoined } from '../../constants/agentInvitation'
import { countClaimableInviteRebates } from '../../constants/inviteFriends'
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
  { id: 'kkc', name: 'KKC', color: '#ff8c00', symbol: 'K', kind: 'fiat', balance: 236188.66, cnyRate: 1 },
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
  { id: 'credit-cny', name: 'CNY', color: '#ff8c00', symbol: '¥', kind: 'credit', balance: 50000, cnyRate: 1 },
  { id: 'credit-usd', name: 'USD', color: '#3b82f6', symbol: '$', kind: 'credit', balance: 1280.5, cnyRate: 7.2 },
]

/** 总资产计价法币：按实时汇率汇总展示 */
const preferredFiatOptions: PreferredFiatOption[] = [
  { id: 'cny', name: 'CNY', symbol: '¥', color: '#ff8c00', fromCny: 1 },
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

/** 无代理身份时展示邀请返利可领取笔数 */
const claimableRebateCount = computed(() =>
  memberAgentMembershipJoined.value ? 0 : countClaimableInviteRebates(),
)

const menuItems = computed<MineMenuItem[]>(() => {
  const inviteItem: MineMenuItem = {
    key: 'invite',
    title: '邀请好友',
    route: 'mobile-invite-friends',
    badge: claimableRebateCount.value > 0 ? claimableRebateCount.value : undefined,
  }
  const base: MineMenuItem[] = [
    { key: 'live', title: '直播中心', route: 'mobile-live' },
    inviteItem,
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
        <img src="/images/mine/icon-cs.svg" alt="" class="mh5-mine-icon mh5-mine-icon--22" aria-hidden="true" />
      </button>
      <button type="button" class="mh5-mine-topbar__btn" aria-label="设置" @click="goSettings">
        <img src="/images/mine/icon-settings.svg" alt="" class="mh5-mine-icon mh5-mine-icon--22" aria-hidden="true" />
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
          </p>
        </div>
        <div class="mh5-mine-profile__trailing">
          <img
            src="/images/mine/icon-qr.svg"
            alt=""
            class="mh5-mine-profile__qr mh5-mine-icon mh5-mine-icon--28"
            aria-hidden="true"
          />
          <img
            src="/images/mine/icon-arrow-right.svg"
            alt=""
            class="mh5-mine-profile__arrow mh5-mine-icon mh5-mine-icon--20"
            aria-hidden="true"
          />
        </div>
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
          <img src="/images/mine/icon-deposit.svg" alt="" class="mh5-mine-icon mh5-mine-icon--28" />
        </span>
        充值
      </button>
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon" aria-hidden="true">
          <img src="/images/mine/icon-withdraw.svg" alt="" class="mh5-mine-icon mh5-mine-icon--28" />
        </span>
        提现
      </button>
      <button type="button" class="mh5-mine-action">
        <span class="mh5-mine-action__icon" aria-hidden="true">
          <img src="/images/mine/icon-convert.svg" alt="" class="mh5-mine-icon mh5-mine-icon--28" />
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
            <img src="/images/mine/icon-arrow-down.svg" alt="" class="mh5-mine-icon mh5-mine-icon--12" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="mh5-mine-wallet__icon-btn mh5-mine-wallet__icon-btn--inline"
            :aria-label="balanceHidden ? '显示余额' : '隐藏余额'"
            @click="balanceHidden = !balanceHidden"
          >
            <img
              v-if="!balanceHidden"
              src="/images/mine/icon-eye.svg"
              alt=""
              class="mh5-mine-icon mh5-mine-icon--20"
            />
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
          <img src="/images/mine/icon-arrow-down.svg" alt="" class="mh5-mine-icon mh5-mine-icon--12" aria-hidden="true" />
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
            <img src="/images/mine/icon-refresh.svg" alt="" class="mh5-mine-icon mh5-mine-icon--20" />
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
            <img
              v-if="item.key === 'assets'"
              src="/images/mine/icon-assets.svg"
              alt=""
              class="mh5-mine-icon mh5-mine-icon--24"
            />
            <img
              v-else-if="item.key === 'bill'"
              src="/images/mine/icon-bill.svg"
              alt=""
              class="mh5-mine-icon mh5-mine-icon--24"
            />
            <img
              v-else-if="item.key === 'bank'"
              src="/images/mine/icon-bank.svg"
              alt=""
              class="mh5-mine-icon mh5-mine-icon--24"
            />
            <img
              v-else
              src="/images/mine/icon-payment.svg"
              alt=""
              class="mh5-mine-icon mh5-mine-icon--24"
            />
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
          <img
            v-if="item.key === 'live'"
            src="/images/mine/icon-live.svg"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--24"
          />
          <img
            v-else-if="item.key === 'invite'"
            src="/images/mine/icon-invite.svg"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--24"
          />
          <img
            v-else-if="item.key === 'agent'"
            src="/images/mine/icon-agent.svg"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--24"
          />
          <img
            v-else-if="item.key === 'agent-invite'"
            src="/images/mine/icon-agent.svg"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--24"
          />
          <img
            v-else
            src="/images/mine/icon-invite.svg"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--24"
          />
        </span>
        <span class="mh5-mine-menu__title">{{ item.title }}</span>
        <span class="mh5-mine-menu__tail">
          <span
            v-if="item.badge"
            class="mh5-mine-menu__badge"
            :aria-label="item.key === 'invite' ? `${item.badge}笔可领取返利` : `${item.badge}条待处理`"
          >
            {{ item.badge }}
          </span>
          <span v-if="item.hot" class="mh5-mine-menu__hot" aria-label="热门">🔥</span>
          <img src="/images/mine/icon-arrow-right.svg" alt="" class="mh5-mine-icon mh5-mine-icon--16" aria-hidden="true" />
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
