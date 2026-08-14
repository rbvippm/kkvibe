<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  formatWalletBalance,
  sheetWalletGroups,
  walletFilterTabs,
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
    selectable?: boolean
    selectedId?: string
    /** 收款方式选币：只展示币种，不展示余额 */
    hideBalance?: boolean
  }>(),
  {
    title: '全部钱包',
    showCredit: false,
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
const anchorSpacer = ref(0)
let scrollingByClick = false
let scrollUnlockTimer = 0
let listResizeObs: ResizeObserver | null = null

const tabs = computed(() => walletFilterTabs(props.showCredit))
const groups = computed(() => sheetWalletGroups(props.showCredit))

watch(
  () => props.open,
  (open) => {
    if (!open) {
      listResizeObs?.disconnect()
      listResizeObs = null
      return
    }
    activeAnchor.value = 'frequent'
    void nextTick(() => {
      updateAnchorSpacer()
      listRef.value?.scrollTo({ top: 0 })
      observeListSize()
    })
  },
)

watch(groups, () => {
  if (!props.open) return
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

function onSelect(item: WalletCatalogItem) {
  if (!props.selectable) return
  emit('select', item.id)
}

function close() {
  emit('close')
}
</script>

<template>
  <Transition name="mh5-wallet-sheet">
    <div v-if="open" class="mh5-wallet-sheet-mask" @click.self="close">
      <div class="mh5-wallet-sheet" role="dialog" aria-modal="true" aria-labelledby="mh5-wallet-sheet-title">
        <div class="mh5-wallet-sheet__head">
          <h2 id="mh5-wallet-sheet-title" class="mh5-wallet-sheet__title">{{ $t(title) }}</h2>
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

        <div class="mh5-wallet-sheet__filters" role="tablist" :aria-label="$t('钱包分类')">
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
      </div>
    </div>
  </Transition>
</template>
