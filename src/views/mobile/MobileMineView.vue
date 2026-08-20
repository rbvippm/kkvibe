<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5VipCreditWallet from '../../components/mobile/Mh5VipCreditWallet.vue'
import Mh5WalletSheet from '../../components/mobile/Mh5WalletSheet.vue'
import { memberAgentInvites, memberAgentMembershipJoined } from '../../constants/agentInvitation'
import { countClaimableInviteRebates } from '../../constants/inviteFriends'
import { mineHallQuery } from '../../constants/mineHall'
import { VIP_CLUB_MINE_SPEC } from '../../constants/vipClubSpec'
import { sumWalletsCny, walletsForSheet } from '../../constants/walletCatalog'
import { walletTransferRoute } from '../../constants/walletTransfer'
import {
  effectivePreferredFiat,
  fiatOrderForLocale,
  pickPreferredFiat,
  type PreferredFiatId,
} from '../../i18n'
import '../../styles/mobile-app-shell.css'

interface PreferredFiatOption {
  id: PreferredFiatId
  name: string
  symbol: string
  color: string
  /** Mock：1 CNY 可兑换的该币数量 */
  fromCny: number
}

const PREFERRED_FIAT_ALL: PreferredFiatOption[] = [
  { id: 'cny', name: 'CNY', symbol: '¥', color: '#ff8c00', fromCny: 1 },
  { id: 'vnd', name: 'VND', symbol: '₫', color: '#ef4444', fromCny: 3500 },
  { id: 'usd', name: 'USD', symbol: '$', color: '#26a17b', fromCny: 1 / 7.2 },
]

const preferredFiatOptions = computed(() =>
  fiatOrderForLocale().map(
    (id) => PREFERRED_FIAT_ALL.find((item) => item.id === id) ?? PREFERRED_FIAT_ALL[0],
  ),
)

const balanceHidden = ref(false)
const refreshing = ref(false)
const walletSheetOpen = ref(false)
const fiatPreferenceOpen = ref(false)
const preferredFiatId = computed({
  get: () => effectivePreferredFiat.value,
  set: (id: PreferredFiatId) => pickPreferredFiat(id),
})
const router = useRouter()
const route = useRoute()
/** 信用额度只在贵宾厅「我的」出现，旗舰厅个人中心不含 */
const isVipClub = computed(() => route.path.startsWith('/mobile/vip-club'))

/** 总资产计价法币：按实时汇率汇总展示，默认跟随语言 */

function formatPreferredAmount(amount: number) {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const preferredFiat = computed(
  () => preferredFiatOptions.value.find((item) => item.id === preferredFiatId.value) ?? preferredFiatOptions.value[0],
)

/** 全部钱包按 Mock 汇率折合 CNY；旗舰厅仅现金，贵宾厅仅信用额度 */
const totalAssetsInPreferredFiat = computed(
  () => sumWalletsCny(walletsForSheet(false, isVipClub.value)) * preferredFiat.value.fromCny,
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
  icon: string
  route?: string
}

interface MineMenuItem {
  key: string
  title: string
  hot?: boolean
  badge?: number
  route?: string
}

const BILL_SHORTCUT: MineShortcutItem = {
  key: 'bill',
  label: '账单记录',
  icon: '/images/mine/icon-bill.svg',
  route: 'mobile-billing-list',
}
const BET_SHORTCUT: MineShortcutItem = {
  key: 'bet',
  label: '投注记录',
  icon: '/images/mine/icon-bet-records.svg',
  route: 'mobile-bet-records',
}

/** 贵宾厅：账单 / 投注 / 代理交收上移到原充提兑位置；代理交收仅贵宾厅 */
const vipRecordActions: MineShortcutItem[] = [
  { ...BILL_SHORTCUT, icon: '/images/vip-club/icon-mine-bill.png' },
  { ...BET_SHORTCUT, icon: '/images/vip-club/icon-mine-bet.png' },
  { key: 'settle', label: '代理交收', icon: '/images/vip-club/icon-mine-agent.png', route: 'mobile-agent-settle' },
]

const walletShortcuts = computed(() =>
  isVipClub.value
    ? []
    : [
        BILL_SHORTCUT,
        BET_SHORTCUT,
        { key: 'assets', label: '资产明细', icon: '/images/mine/icon-assets.svg', route: 'mobile-asset-detail' },
        { key: 'bank', label: '金刚银行', icon: '/images/mine/icon-bank.svg' },
      ],
)

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
    ...(!isVipClub.value ? [{ key: 'payment', title: '收款方式', route: 'mobile-payout-methods' }] : []),
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

function hallQuery() {
  return mineHallQuery(isVipClub.value)
}

function menuIconSrc(key: string) {
  if (isVipClub.value) {
    if (key === 'live') return '/images/vip-club/icon-mine-live.svg'
    if (key === 'invite') return '/images/vip-club/icon-mine-invite.svg'
    if (key === 'agent' || key === 'agent-invite') return '/images/vip-club/icon-mine-agent.svg'
  }
  if (key === 'live') return '/images/mine/icon-live.svg'
  if (key === 'invite') return '/images/mine/icon-invite.svg'
  if (key === 'agent' || key === 'agent-invite') return '/images/mine/icon-agent.svg'
  return '/images/mine/icon-invite.svg'
}

function goUserHome() {
  router.push({ name: 'mobile-user-home', query: hallQuery() })
}

function goSettings() {
  router.push({ name: 'mobile-mine-settings', query: hallQuery() })
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

function applyPreferredFiat(id: PreferredFiatId) {
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
  if (routeName) router.push({ name: routeName, query: hallQuery() })
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
    <div id="mh5-mine-overlays" class="mh5-mine-overlays" />
    <div class="mh5-mine-page">
    <div class="mh5-mine-topbar">
      <Mh5SpecAnnot v-if="isVipClub" :spec="VIP_CLUB_MINE_SPEC" placement="bottom" />
      <div class="mh5-mine-topbar__actions">
      <button type="button" class="mh5-mine-topbar__btn" :aria-label="$t('客服')">
        <img src="/images/mine/icon-cs.svg" alt="" class="mh5-mine-icon mh5-mine-icon--22" aria-hidden="true" />
      </button>
      <button type="button" class="mh5-mine-topbar__btn" :aria-label="$t('设置')" @click="goSettings">
        <img src="/images/mine/icon-settings.svg" alt="" class="mh5-mine-icon mh5-mine-icon--22" aria-hidden="true" />
      </button>
      </div>
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
          <h2 class="mh5-mine-profile__name">{{ $t(user.name) }}</h2>
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
          <span class="mh5-mine-profile__stat-label">{{ $t(stat.label) }}</span>
        </div>
      </div>
    </section>

    <Mh5VipCreditWallet v-if="isVipClub" :actions="vipRecordActions" @go="goRoute" />

    <div v-else class="mh5-mine-wallet-overview">
      <div class="mh5-mine-wallet__head">
        <div class="mh5-mine-wallet__label">
          <span class="mh5-mine-wallet__title">{{ $t('总资产') }}</span>
          <button
            type="button"
            class="mh5-mine-wallet__currency"
            :aria-label="$t('选择偏好计价法币')"
            @click="openFiatPreference"
          >
            {{ $t(preferredFiat.name) }}
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
        <button type="button" class="mh5-mine-wallet__all" @click="goAllWallets">{{ $t('全部钱包') }}<img src="/images/mine/icon-arrow-down.svg" alt="" class="mh5-mine-icon mh5-mine-icon--12" aria-hidden="true" />
        </button>
      </div>
    </div>

    <section v-if="!isVipClub" class="mh5-mine-wallet">
      <div class="mh5-mine-wallet__balance-row">
        <div class="mh5-mine-wallet__balance">
          <span ref="amountRef" class="mh5-mine-wallet__amount">{{ preferredFiatAmountText }}</span>
          <button
            type="button"
            class="mh5-mine-wallet__icon-btn"
            :class="{ 'mh5-mine-wallet__icon-btn--spin': refreshing }"
            :aria-label="$t('刷新资产')"
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
          </span>{{ $t('充值') }}</button>
        <button type="button" class="mh5-mine-action" @click="goWalletTransfer('withdraw')">
          <span class="mh5-mine-action__icon" aria-hidden="true">
            <img src="/images/mine/icon-withdraw.svg" alt="" class="mh5-mine-icon mh5-mine-icon--28" />
          </span>{{ $t('提现') }}</button>
        <button type="button" class="mh5-mine-action" @click="goWalletTransfer('exchange')">
          <span class="mh5-mine-action__icon" aria-hidden="true">
            <img src="/images/mine/icon-convert.svg" alt="" class="mh5-mine-icon mh5-mine-icon--24" />
          </span>{{ $t('兑换') }}</button>
      </div>

      <div v-if="walletShortcuts.length" class="mh5-mine-wallet__shortcuts">
        <button
          v-for="item in walletShortcuts"
          :key="item.key"
          type="button"
          class="mh5-mine-wallet__shortcut"
          @click="goRoute(item.route)"
        >
          <span class="mh5-mine-wallet__shortcut-icon" aria-hidden="true">
            <img :src="item.icon" alt="" class="mh5-mine-icon mh5-mine-icon--24" />
          </span>
          <span class="mh5-mine-wallet__shortcut-label">{{ $t(item.label) }}</span>
        </button>
      </div>
    </section>

    <section class="mh5-mine-more">
      <h2 class="mh5-mine-more__title">{{ $t('更多功能') }}</h2>
      <div class="mh5-mine-menu">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="mh5-mine-menu__item"
        @click="goMenuItem(item)"
      >
        <span class="mh5-mine-menu__icon" aria-hidden="true">
          <svg
            v-if="item.key === 'payment'"
            class="mh5-mine-icon mh5-mine-icon--24"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M13.6377 2.19015C14.0125 2.12058 14.3982 2.13338 14.7676 2.22823C15.1407 2.3241 15.4882 2.50128 15.7852 2.74679C16.0822 2.99251 16.3221 3.3013 16.4863 3.65011C16.6505 3.99885 16.7352 4.3799 16.7354 4.76534V5.3171C17.9069 5.54361 18.792 6.57448 18.792 7.81222V15.3122C18.792 16.7159 17.6537 17.8542 16.25 17.8542H3.75C2.34628 17.8542 1.20898 16.7159 1.20898 15.3122V6.52315C1.20872 5.91336 1.42098 5.32222 1.80957 4.85226C2.19823 4.38236 2.73888 4.06217 3.33789 3.94796C3.34196 3.94724 3.34653 3.9467 3.35059 3.94601L13.6377 2.19015ZM3.75 6.60421C3.08266 6.60421 2.54199 7.14487 2.54199 7.81222V15.3122C2.54199 15.9796 3.08266 16.5212 3.75 16.5212H16.25C16.9173 16.5212 17.459 15.9796 17.459 15.3122V7.81222C17.459 7.14487 16.9173 6.60421 16.25 6.60421H3.75ZM10 8.3962C10.3682 8.3962 10.667 8.69403 10.667 9.06222V12.4538L12.0293 11.0915C12.2896 10.8312 12.7113 10.8312 12.9717 11.0915C13.2315 11.3519 13.2319 11.7737 12.9717 12.0339L10.4717 14.5339C10.2115 14.7941 9.78968 14.7938 9.5293 14.5339L7.0293 12.0339C6.76895 11.7735 6.76895 11.3519 7.0293 11.0915C7.27343 10.8474 7.65905 10.8319 7.9209 11.0456L7.97168 11.0915L9.33398 12.4538V9.06222C9.33398 8.69403 9.63181 8.3962 10 8.3962ZM14.4355 3.52022C14.2525 3.47326 14.0607 3.46637 13.875 3.50167C13.8709 3.50244 13.8664 3.5039 13.8623 3.5046L3.58105 5.25948C3.54122 5.26729 3.50153 5.27636 3.46289 5.2878C3.55717 5.2772 3.65289 5.2712 3.75 5.2712H15.4023V4.76534C15.4022 4.57627 15.3598 4.38955 15.2793 4.21847C15.1987 4.04726 15.0813 3.89574 14.9355 3.77511C14.7898 3.65452 14.6188 3.56734 14.4355 3.52022Z"
              fill="#454545"
            />
          </svg>
          <img
            v-else
            :src="menuIconSrc(item.key)"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--24"
          />
        </span>
        <span class="mh5-mine-menu__title">{{ $t(item.title) }}</span>
        <span class="mh5-mine-menu__tail">
          <span
            v-if="item.badge"
            class="mh5-mine-menu__badge"
            :aria-label="item.key === 'invite' ? `${item.badge}笔可领取返利` : `${item.badge}条待处理`"
          >
            {{ item.badge }}
          </span>
          <span v-if="item.hot" class="mh5-mine-menu__hot" :aria-label="$t('热门')">🔥</span>
          <img
            :src="isVipClub ? '/images/vip-club/icon-mine-arrow.svg' : '/images/mine/icon-arrow-right.svg'"
            alt=""
            class="mh5-mine-icon mh5-mine-icon--16"
            aria-hidden="true"
          />
        </span>
      </button>
      </div>
    </section>
    </div>

    <Mh5WalletSheet
      :open="walletSheetOpen"
      @close="closeWalletSheet"
    />

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
            <h2 id="fiat-preference-title" class="mh5-wallet-sheet__title">{{ $t('选择偏好计价法币') }}</h2>
            <button
              type="button"
              class="mh5-wallet-sheet__close"
              :aria-label="$t('关闭')"
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
              @click="applyPreferredFiat(item.id)"
            >
              <span
                class="agent-currency-sheet__icon"
                :style="{ background: item.color }"
                aria-hidden="true"
              >
                {{ item.symbol }}
              </span>
              <span class="agent-currency-sheet__name">{{ $t(item.name) }}</span>
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
