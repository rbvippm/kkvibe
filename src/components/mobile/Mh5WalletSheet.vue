<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  CREDIT_CURRENCY_TABS,
  CREDIT_REMARK_MAX_LEN,
  CREDIT_WALLET_CATALOG,
  creditWalletsByCurrency,
  formatCreditWalletBalance,
  formatWalletBalance,
  sheetWalletGroups,
  walletFilterTabs,
  type CreditCurrencyCode,
  type CreditWalletItem,
  type WalletCatalogItem,
  type WalletFilter,
} from '../../constants/walletCatalog'
import '../../styles/mobile-app-shell.css'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    /** 个人中心展示「信用额度」分类；充提兑不展示 */
    showCredit?: boolean
    /** 贵宾厅：只展示信用额度，不含现金钱包 */
    creditOnly?: boolean
    selectable?: boolean
    selectedId?: string
    /** 收款方式选币：只展示币种，不展示余额 */
    hideBalance?: boolean
  }>(),
  {
    title: '全部钱包',
    showCredit: false,
    creditOnly: false,
    selectable: false,
    selectedId: '',
    hideBalance: false,
  },
)

const emit = defineEmits<{
  close: []
  select: [id: string]
}>()

const listRef = ref<HTMLElement | null>(null)
const activeAnchor = ref<WalletFilter>('frequent')
const creditTab = ref<CreditCurrencyCode>('cny')
const creditWallets = ref<CreditWalletItem[]>(CREDIT_WALLET_CATALOG.map((item) => ({ ...item })))
const remarkTargetId = ref('')
const remarkDraft = ref('')
const remarkInputRef = ref<HTMLInputElement | null>(null)
const anchorSpacer = ref(0)
let scrollingByClick = false
let scrollUnlockTimer = 0
let listResizeObs: ResizeObserver | null = null

const sheetTitle = computed(() => {
  if (props.creditOnly && props.title === '全部钱包') return '信用额度'
  return props.title
})

const tabs = computed(() => walletFilterTabs(props.showCredit, props.creditOnly))
const groups = computed(() => sheetWalletGroups(props.showCredit, props.creditOnly))
const creditItems = computed(() => creditWalletsByCurrency(creditTab.value, creditWallets.value))
const remarkTarget = computed(
  () => creditWallets.value.find((item) => item.id === remarkTargetId.value) ?? null,
)
const remarkOverLimit = computed(() => remarkDraft.value.trim().length > CREDIT_REMARK_MAX_LEN)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      listResizeObs?.disconnect()
      listResizeObs = null
      closeRemarkEditor()
      return
    }
    activeAnchor.value = props.creditOnly ? 'credit' : 'frequent'
    creditTab.value = 'cny'
    void nextTick(() => {
      updateAnchorSpacer()
      listRef.value?.scrollTo({ top: 0 })
      observeListSize()
    })
  },
)

watch(groups, () => {
  if (!props.open || props.creditOnly) return
  void nextTick(() => updateAnchorSpacer())
})

function observeListSize() {
  listResizeObs?.disconnect()
  const list = listRef.value
  if (!list) return
  listResizeObs = new ResizeObserver(() => updateAnchorSpacer())
  listResizeObs.observe(list)
}

function updateAnchorSpacer() {
  const list = listRef.value
  if (!list) {
    anchorSpacer.value = 0
    return
  }
  const headers = [...list.querySelectorAll<HTMLElement>('[data-wallet-group]')]
  const lastHeader = headers.at(-1)
  if (!lastHeader) {
    anchorSpacer.value = 0
    return
  }
  let lastEl = lastHeader
  let node: Element | null = lastHeader.nextElementSibling
  while (node) {
    if (node instanceof HTMLElement && !node.classList.contains('mh5-wallet-sheet__anchor-spacer')) {
      lastEl = node
    }
    node = node.nextElementSibling
  }
  const lastGroupHeight = lastEl.getBoundingClientRect().bottom - lastHeader.getBoundingClientRect().top
  anchorSpacer.value = Math.max(0, Math.ceil(list.clientHeight - lastGroupHeight))
}

onBeforeUnmount(() => {
  listResizeObs?.disconnect()
  window.clearTimeout(scrollUnlockTimer)
})

function groupScrollTop(list: HTMLElement, el: HTMLElement) {
  return el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
}

function scrollToAnchor(key: WalletFilter) {
  const list = listRef.value
  if (!list) return
  activeAnchor.value = key
  scrollingByClick = true
  window.clearTimeout(scrollUnlockTimer)
  const el = list.querySelector<HTMLElement>(`[data-wallet-group="${key}"]`)
  const top = el ? groupScrollTop(list, el) : 0
  list.scrollTo({ top, behavior: 'smooth' })
  scrollUnlockTimer = window.setTimeout(() => {
    scrollingByClick = false
  }, 560)
}

function onListScroll() {
  if (scrollingByClick) return
  const list = listRef.value
  if (!list) return
  const headers = [...list.querySelectorAll<HTMLElement>('[data-wallet-group]')]
  if (!headers.length) return
  const line = list.getBoundingClientRect().top + 16
  let current: WalletFilter = (headers[0].dataset.walletGroup as WalletFilter) ?? 'frequent'
  for (const header of headers) {
    if (header.getBoundingClientRect().top <= line) {
      current = (header.dataset.walletGroup as WalletFilter) ?? current
    }
  }
  activeAnchor.value = current
}

function switchCreditTab(key: CreditCurrencyCode) {
  if (creditTab.value === key) return
  creditTab.value = key
  closeRemarkEditor()
  void nextTick(() => listRef.value?.scrollTo({ top: 0 }))
}

function openRemarkEditor(item: CreditWalletItem) {
  remarkTargetId.value = item.id
  remarkDraft.value = item.remark
  void nextTick(() => remarkInputRef.value?.focus())
}

function closeRemarkEditor() {
  remarkTargetId.value = ''
  remarkDraft.value = ''
}

function saveRemark() {
  const target = remarkTarget.value
  if (!target || remarkOverLimit.value) return
  target.remark = remarkDraft.value.trim()
  closeRemarkEditor()
}

function onSelect(item: WalletCatalogItem) {
  if (!props.selectable) return
  emit('select', item.id)
}

function close() {
  closeRemarkEditor()
  emit('close')
}
</script>

<template>
  <Transition name="mh5-wallet-sheet">
    <div v-if="open" class="mh5-wallet-sheet-mask" @click.self="close">
      <div class="mh5-wallet-sheet" role="dialog" aria-modal="true" aria-labelledby="mh5-wallet-sheet-title">
        <div class="mh5-wallet-sheet__head">
          <h2 id="mh5-wallet-sheet-title" class="mh5-wallet-sheet__title">{{ $t(sheetTitle) }}</h2>
          <button type="button" class="mh5-wallet-sheet__close" :aria-label="$t('关闭')" @click="close">
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

        <template v-if="creditOnly">
          <div class="mh5-wallet-sheet__filters" role="tablist" :aria-label="$t('信用额度')">
            <button
              v-for="tab in CREDIT_CURRENCY_TABS"
              :key="tab.key"
              type="button"
              class="mh5-wallet-sheet__filter"
              :class="{ 'mh5-wallet-sheet__filter--active': creditTab === tab.key }"
              role="tab"
              :aria-selected="creditTab === tab.key"
              @click="switchCreditTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div ref="listRef" class="mh5-wallet-sheet__list">
            <p v-if="!creditItems.length" class="mh5-wallet-sheet__empty">{{ $t('暂无该币种信用钱包') }}</p>
            <div
              v-for="item in creditItems"
              :key="item.id"
              class="mh5-wallet-sheet__item mh5-wallet-sheet__item--credit"
            >
              <div class="mh5-wallet-sheet__item-main">
                <span class="mh5-wallet-sheet__icon" :style="{ background: item.color }">{{ item.symbol }}</span>
                <span class="mh5-wallet-sheet__meta">
                  <span class="mh5-wallet-sheet__source">
                    <span class="mh5-wallet-sheet__source-label">{{ $t('来源') }}</span>
                    {{ item.source }}
                  </span>
                </span>
                <span class="mh5-wallet-sheet__balance">{{ formatCreditWalletBalance(item.balance) }}</span>
              </div>
              <button
                type="button"
                class="mh5-wallet-sheet__remark"
                :aria-label="item.remark ? $t('编辑备注') : $t('添加备注')"
                @click="openRemarkEditor(item)"
              >
                <span class="mh5-wallet-sheet__remark-label">{{ $t('备注') }}</span>
                <span
                  class="mh5-wallet-sheet__remark-value"
                  :class="{ 'mh5-wallet-sheet__remark-value--empty': !item.remark }"
                >
                  {{ item.remark || $t('添加备注') }}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 20h4.2L19 9.2l-4.2-4.2L4 15.8V20zM13.6 6.2l4.2 4.2"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="remarkTarget" class="mh5-wallet-remark-editor">
            <div class="mh5-wallet-remark-editor__head">
              <span class="mh5-wallet-remark-editor__title">{{
                remarkTarget.remark ? $t('编辑备注') : $t('添加备注')
              }}</span>
              <button type="button" class="mh5-wallet-remark-editor__close" @click="closeRemarkEditor">
                {{ $t('取消') }}
              </button>
            </div>
            <input
              ref="remarkInputRef"
              v-model="remarkDraft"
              class="mh5-wallet-remark-editor__input"
              type="text"
              :maxlength="CREDIT_REMARK_MAX_LEN"
              :placeholder="$t('最多20个字')"
              :aria-label="$t('备注')"
            />
            <button
              type="button"
              class="mh5-wallet-remark-editor__save"
              :disabled="remarkOverLimit"
              @click="saveRemark"
            >
              {{ $t('保存') }}
            </button>
          </div>
        </template>

        <template v-else>
          <div v-if="tabs.length > 1" class="mh5-wallet-sheet__filters" role="tablist" :aria-label="$t('钱包分类')">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="mh5-wallet-sheet__filter"
              :class="{ 'mh5-wallet-sheet__filter--active': activeAnchor === tab.key }"
              role="tab"
              :aria-selected="activeAnchor === tab.key"
              @click="scrollToAnchor(tab.key)"
            >
              {{ $t(tab.label) }}
            </button>
          </div>

          <div ref="listRef" class="mh5-wallet-sheet__list mh5-wallet-sheet__list--anchors" @scroll.passive="onListScroll">
            <p v-if="!groups.length" class="mh5-wallet-sheet__empty">{{ $t('暂无匹配币种') }}</p>
            <template v-for="group in groups" :key="group.kind">
              <p class="mh5-wallet-sheet__group" :data-wallet-group="group.kind">{{ $t(group.label) }}</p>
              <button
                v-for="item in group.items"
                :key="`${group.kind}-${item.id}`"
                type="button"
                class="mh5-wallet-sheet__item"
                :class="{ 'mh5-wallet-sheet__item--selectable': selectable }"
                @click="onSelect(item)"
              >
                <span class="mh5-wallet-sheet__icon" :style="{ background: item.color }">{{ item.symbol }}</span>
                <span class="mh5-wallet-sheet__name">{{ $t(item.name) }}</span>
                <span v-if="!hideBalance" class="mh5-wallet-sheet__balance">{{ formatWalletBalance(item) }}</span>
                <span v-if="selectable && selectedId === item.id" class="mh5-wallet-transfer-check">✓</span>
              </button>
            </template>
            <div class="mh5-wallet-sheet__anchor-spacer" :style="{ height: `${anchorSpacer}px` }" aria-hidden="true" />
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>
