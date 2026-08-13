<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Mh5WalletSheet from '../../components/mobile/Mh5WalletSheet.vue'
import { memberAgentInvites, memberAgentMembershipJoined } from '../../constants/agentInvitation'
import { countClaimableInviteRebates } from '../../constants/inviteFriends'
import { WALLET_CATALOG, sumWalletsCny } from '../../constants/walletCatalog'
import { walletTransferRoute } from '../../constants/walletTransfer'
import '../../styles/mobile-app-shell.css'

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
const router = useRouter()

/** 总资产计价法币：按实时汇率汇总展示 */
const preferredFiatOptions: PreferredFiatOption[] = [
  { id: 'cny', name: 'CNY', symbol: '¥', color: '#ff8c00', fromCny: 1 },
  { id: 'vnd', name: 'VND', symbol: '₫', color: '#ef4444', fromCny: 3500 },
  { id: 'usd', name: 'USD', symbol: '$', color: '#26a17b', fromCny: 1 / 7.2 },
]

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
const totalAssetsInPreferredFiat = computed(
  () => sumWalletsCny(WALLET_CATALOG) * preferredFiat.value.fromCny,
)

const preferredFiatAmountText = computed(() => {
  const amount = formatPreferredAmount(totalAssetsInPreferredFiat.value)
  const value = balanceHidden.value ? mask(amount) : amount
  return `${preferredFiat.value.symbol}\u00A0${value}`
})

const amountRef = ref<HTMLElement | null>(null)
const AMOUNT_MAX_PX = 28
const AMOUNT_MIN_PX = 15
let amountResizeObs: ResizeObserver | null = null

function fitAmountText() {
  const el = amountRef.value
  if (!el) return
  el.style.fontSize = `${AMOUNT_MAX_PX}px`
  let size = AMOUNT_MAX_PX
  while (size > AMOUNT_MIN_PX && el.scrollWidth > el.clientWidth + 0.5) {
    size -= 0.5
    el.style.fontSize = `${size}px`
  }
}
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
  { key: 'payment', label: '收款方式', route: 'mobile-payout-methods' },
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

function handleRefresh() {
  if (refreshing.value) return
  refreshing.value = true
  window.setTimeout(() => {
    refreshing.value = false
  }, 800)
}

function goWalletTransfer(tab: 'deposit' | 'withdraw' | 'exchange') {
  router.push(walletTransferRoute(tab))
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

onMounted(() => {
  void nextTick(fitAmountText)
  const parent = amountRef.value?.parentElement
  if (!parent || typeof ResizeObserver === 'undefined') return
  amountResizeObs = new ResizeObserver(() => fitAmountText())
  amountResizeObs.observe(parent)
})

onBeforeUnmount(() => {
  amountResizeObs?.disconnect()
  amountResizeObs = null
})

watch(preferredFiatAmountText, () => {
  void nextTick(fitAmountText)
})
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

    <div class="mh5-mine-wallet-overview">
      <div class="mh5-mine-wallet__head">
        <div class="mh5-mine-wallet__label">
          <span class="mh5-mine-wallet__title">总资产</span>
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
    </div>

    <section class="mh5-mine-wallet">
      <div class="mh5-mine-wallet__balance-row">
        <div class="mh5-mine-wallet__balance">
          <span ref="amountRef" class="mh5-mine-wallet__amount">{{ preferredFiatAmountText }}</span>
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

      <div class="mh5-mine-actions">
        <button type="button" class="mh5-mine-action mh5-mine-action--deposit" @click="goWalletTransfer('deposit')">
          <span class="mh5-mine-action__icon" aria-hidden="true">
            <img src="/images/mine/icon-deposit.svg" alt="" class="mh5-mine-icon mh5-mine-icon--24" />
          </span>
          充值
        </button>
        <button type="button" class="mh5-mine-action" @click="goWalletTransfer('withdraw')">
          <span class="mh5-mine-action__icon" aria-hidden="true">
            <img src="/images/mine/icon-withdraw.svg" alt="" class="mh5-mine-icon mh5-mine-icon--28" />
          </span>
          提现
        </button>
        <button type="button" class="mh5-mine-action" @click="goWalletTransfer('exchange')">
          <span class="mh5-mine-action__icon" aria-hidden="true">
            <img src="/images/mine/icon-convert.svg" alt="" class="mh5-mine-icon mh5-mine-icon--24" />
          </span>
          交易
        </button>
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

    <Mh5WalletSheet :open="walletSheetOpen" show-credit @close="closeWalletSheet" />

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
