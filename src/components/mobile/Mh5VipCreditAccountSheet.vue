<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useVipCreditAccounts } from '../../composables/useVipCreditAccounts'
import {
  CREDIT_CURRENCY_TABS,
  creditAllWalletsLabel,
  formatCreditWalletBalance,
  groupCreditWalletsByAgent,
  type CreditCurrencyCode,
  type CreditWalletItem,
} from '../../constants/walletCatalog'
import '../../styles/mobile-app-shell.css'

const props = withDefaults(
  defineProps<{
    open: boolean
    teleportTo?: string
    maskClass?: string
    /** 投注记录等场景不展示账户余额 */
    hideBalance?: boolean
  }>(),
  {
    teleportTo: 'body',
    maskClass: 'mh5-agent-overlay-mask',
    hideBalance: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

const { wallets, selectedId, selectAccount, selectRecordsAll, recordsSelectAll, recordsCurrencyFilter, reorderAgentGroups } =
  useVipCreditAccounts()
const searchOpen = ref(false)
const searchKeyword = ref('')
const currencyFilter = ref<CreditCurrencyCode | ''>('')
const collapsedAgents = ref<string[]>(['agent-a', 'agent-b'])
const searchInputRef = ref<HTMLInputElement | null>(null)

const filteredWallets = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  return wallets.value.filter((item) => {
    if (currencyFilter.value && item.currency !== currencyFilter.value) return false
    if (!kw) return true
    return [item.displayName, item.accountCode, item.source].some((text) =>
      text.toLowerCase().includes(kw),
    )
  })
})

const agentGroups = computed(() => groupCreditWalletsByAgent(filteredWallets.value))

/** 账单 / 投注记录：列表上方「全部钱包」；选 CNY / USD 后改为信用额度-CNY / USD */
const showAllRow = computed(() => props.hideBalance && !searchKeyword.value.trim())
const recordsAllMode = computed(() => props.hideBalance && recordsSelectAll.value)
const allRowLabel = computed(() => creditAllWalletsLabel(currencyFilter.value))
const sheetTitle = computed(() => (props.hideBalance ? '选择钱包' : '信用额度'))

function isItemSelected(item: CreditWalletItem) {
  if (recordsAllMode.value) return false
  return item.id === selectedId.value
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      searchOpen.value = false
      searchKeyword.value = ''
      return
    }
    if (props.hideBalance) {
      currencyFilter.value = recordsSelectAll.value ? recordsCurrencyFilter.value : ''
    }
    if (recordsAllMode.value) return
    const selected = wallets.value.find((item) => item.id === selectedId.value)
    if (selected) {
      collapsedAgents.value = collapsedAgents.value.filter((id) => id !== selected.agentId)
    }
  },
)

function toggleCollapse(agentId: string) {
  collapsedAgents.value = collapsedAgents.value.includes(agentId)
    ? collapsedAgents.value.filter((id) => id !== agentId)
    : [...collapsedAgents.value, agentId]
}

function isCollapsed(agentId: string) {
  return collapsedAgents.value.includes(agentId)
}

function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (!searchOpen.value) searchKeyword.value = ''
  else void nextTick(() => searchInputRef.value?.focus())
}

const accountFilterTabs: { key: CreditCurrencyCode | ''; label: string }[] = [
  { key: '', label: '全部' },
  ...CREDIT_CURRENCY_TABS,
]

function setCurrencyFilter(key: CreditCurrencyCode | '') {
  currencyFilter.value = key
}

function onSelect(item: CreditWalletItem) {
  selectAccount(item)
  emit('close')
}

function onSelectAll() {
  selectRecordsAll(currencyFilter.value)
  emit('close')
}

function close() {
  emit('close')
}

const draggingId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)
let pressTimer: ReturnType<typeof setTimeout> | null = null
let startY = 0

function clearPressTimer() {
  if (!pressTimer) return
  clearTimeout(pressTimer)
  pressTimer = null
}

function onHandlePointerDown(agentId: string, event: PointerEvent) {
  event.preventDefault()
  event.stopPropagation()
  const target = event.currentTarget as HTMLElement
  startY = event.clientY
  target.setPointerCapture(event.pointerId)
  clearPressTimer()
  pressTimer = setTimeout(() => {
    draggingId.value = agentId
    dragOverId.value = agentId
  }, 280)
}

function onHandlePointerMove(event: PointerEvent) {
  if (!draggingId.value) {
    if (pressTimer && Math.abs(event.clientY - startY) > 10) clearPressTimer()
    return
  }
  const hit = document.elementFromPoint(event.clientX, event.clientY)
  const section = hit?.closest<HTMLElement>('[data-credit-agent]')
  const nextId = section?.dataset.creditAgent
  if (nextId) dragOverId.value = nextId
}

function onHandlePointerUp() {
  const fromId = draggingId.value
  const toId = dragOverId.value
  clearPressTimer()
  draggingId.value = null
  dragOverId.value = null
  if (fromId && toId) reorderAgentGroups(fromId, toId)
}
</script>

<template>
  <Teleport :to="teleportTo" defer>
    <Transition name="mh5-wallet-sheet">
      <div v-if="open" :class="maskClass" @click.self="close">
        <div
          class="mh5-wallet-sheet mh5-credit-account-sheet"
          :class="{ 'mh5-credit-account-sheet--no-balance': hideBalance }"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mh5-credit-account-title"
        >
          <div class="mh5-credit-account-sheet__head">
            <button type="button" class="mh5-credit-account-sheet__icon-btn" :aria-label="$t('搜索')" @click="toggleSearch">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
                <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
            <h2 id="mh5-credit-account-title" class="mh5-wallet-sheet__title">{{ $t(sheetTitle) }}</h2>
            <button type="button" class="mh5-wallet-sheet__close" :aria-label="$t('关闭')" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div v-if="searchOpen" class="mh5-credit-account-sheet__search">
            <input
              ref="searchInputRef"
              v-model="searchKeyword"
              class="mh5-credit-account-sheet__search-input"
              type="search"
              :placeholder="$t('搜索账户')"
            />
          </div>

          <div
            class="mh5-wallet-sheet__filters"
            role="tablist"
            :aria-label="$t(sheetTitle)"
          >
            <button
              v-for="tab in accountFilterTabs"
              :key="tab.key || 'all'"
              type="button"
              class="mh5-wallet-sheet__filter"
              :class="{ 'mh5-wallet-sheet__filter--active': currencyFilter === tab.key }"
              role="tab"
              :aria-selected="currencyFilter === tab.key"
              @click="setCurrencyFilter(tab.key)"
            >
              {{ $t(tab.label) }}
            </button>
          </div>

          <div class="mh5-wallet-sheet__list" :class="{ 'mh5-wallet-sheet__list--sorting': Boolean(draggingId) }">
            <p v-if="!agentGroups.length && !showAllRow" class="mh5-wallet-sheet__empty">{{ $t('暂无匹配账户') }}</p>
            <button
              v-if="showAllRow"
              type="button"
              class="mh5-credit-account-card mh5-credit-account-card--all"
              :class="{ 'mh5-credit-account-card--active': recordsAllMode }"
              @click="onSelectAll"
            >
              <img
                class="mh5-credit-account-card__all-icon"
                src="/images/vip-club/icon-credit-all.svg"
                alt=""
                width="28"
                height="28"
              />
              <span class="mh5-credit-account-card__all-name">{{ $t(allRowLabel) }}</span>
              <span v-if="recordsAllMode" class="mh5-credit-account-card__check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#d99d46" />
                  <path d="M4.8 8.2l2.2 2.2 4.2-4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
                </svg>
              </span>
            </button>
            <section
              v-for="(group, index) in agentGroups"
              :key="group.agentId"
              class="mh5-credit-account-group"
              :class="{
                'mh5-credit-account-group--dragging': draggingId === group.agentId,
                'mh5-credit-account-group--over': dragOverId === group.agentId && draggingId !== group.agentId,
              }"
              :data-credit-agent="group.agentId"
            >
              <div class="mh5-credit-account-group__head">
                <button
                  type="button"
                  class="mh5-credit-account-group__toggle"
                  @click="toggleCollapse(group.agentId)"
                >
                  <span class="mh5-credit-account-group__wallet" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.6" />
                      <path d="M3 10h18" stroke="currentColor" stroke-width="1.6" />
                    </svg>
                  </span>
                  <span class="mh5-credit-account-group__name">{{ group.source }}</span>
                  <svg
                    class="mh5-credit-account-group__chevron"
                    :class="{ 'mh5-credit-account-group__chevron--up': !isCollapsed(group.agentId) }"
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                  </svg>
                </button>
                <div class="mh5-credit-account-group__drag">
                  <span v-if="index === 0" class="mh5-credit-account-group__drag-hint">{{ $t('长按拖动') }}</span>
                  <button
                    type="button"
                    class="mh5-credit-account-group__handle"
                    :aria-label="$t('长按拖动')"
                    @click.prevent
                    @pointerdown="onHandlePointerDown(group.agentId, $event)"
                    @pointermove="onHandlePointerMove"
                    @pointerup="onHandlePointerUp"
                    @pointercancel="onHandlePointerUp"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                v-if="isCollapsed(group.agentId)"
                type="button"
                class="mh5-credit-account-card mh5-credit-account-card--summary"
                @click="toggleCollapse(group.agentId)"
              >
                <span class="mh5-credit-account-card__icons" aria-hidden="true">
                  <img
                    v-for="item in group.items.slice(0, 2)"
                    :key="item.id"
                    class="mh5-credit-account-card__mini-icon"
                    :src="item.icon"
                    alt=""
                    width="28"
                    height="28"
                  />
                </span>
                <span class="mh5-credit-account-card__count">{{ group.items.length }} {{ $t('个账户') }}</span>
              </button>

              <template v-else>
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  type="button"
                  class="mh5-credit-account-card"
                  :class="{ 'mh5-credit-account-card--active': isItemSelected(item) }"
                  @click="onSelect(item)"
                >
                  <img class="mh5-credit-account-card__icon" :src="item.icon" alt="" width="36" height="36" />
                  <span class="mh5-credit-account-card__meta">
                    <span class="mh5-credit-account-card__name">{{ item.displayName }}</span>
                    <span
                      v-if="!hideBalance"
                      class="mh5-credit-account-card__balance"
                    >{{ item.symbol }} {{ formatCreditWalletBalance(item.balance) }}</span>
                  </span>
                  <span v-if="isItemSelected(item)" class="mh5-credit-account-card__check" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#d99d46" />
                      <path d="M4.8 8.2l2.2 2.2 4.2-4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </span>
                </button>
              </template>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
