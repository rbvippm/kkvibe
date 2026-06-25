<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  MOCK_TRANSFER_RECORDS,
  TRANSFER_DIRECTION_OPTIONS,
  TRANSFER_SOURCE_OPTIONS,
  TRANSFER_TARGET_OPTIONS,
  relationTagClass,
  type TransferDirection,
  type TransferSourceType,
  type TransferTargetType,
  type XCoinTransferRecord,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

type ListTab = '' | TransferDirection

const listTab = ref<ListTab>('')
const filterOpen = ref(false)
const filterDraft = ref({
  direction: '' as '' | TransferDirection,
  source: '' as '' | TransferSourceType,
  target: '' as '' | TransferTargetType,
})
const appliedFilter = ref({ ...filterDraft.value })

const filteredRecords = computed(() => {
  return MOCK_TRANSFER_RECORDS.filter((row) => {
    if (listTab.value && row.direction !== listTab.value) return false
    if (appliedFilter.value.direction && row.direction !== appliedFilter.value.direction) return false
    if (appliedFilter.value.source && row.sourceType !== appliedFilter.value.source) return false
    if (appliedFilter.value.target && row.targetType !== appliedFilter.value.target) return false
    return true
  })
})

function openFilter() {
  filterDraft.value = { ...appliedFilter.value }
  filterOpen.value = true
}

function resetFilter() {
  filterDraft.value = { direction: '', source: '', target: '' }
}

function applyFilter() {
  appliedFilter.value = { ...filterDraft.value }
  filterOpen.value = false
}

function formatAmount(row: XCoinTransferRecord) {
  const sign = row.amount > 0 ? '+' : ''
  return `${sign}${row.amount.toFixed(2)} X币`
}

function sourceAgentLine(row: XCoinTransferRecord) {
  if (!row.sourceAgentName) return ''
  const relation =
    row.sourceAgentRelation === 'direct_superior' ? '直属上级' : '非直属代理'
  return `来源代理：${row.sourceAgentName}（${relation}）`
}
</script>

<template>
  <div class="mh5-xcoin-page">
    <Mh5SubPageHeader title="上下分记录">
      <template #right>
        <button type="button" class="mh5-sub-header__action" @click="openFilter">筛选</button>
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-sub-tabs">
      <button
        v-for="opt in TRANSFER_DIRECTION_OPTIONS"
        :key="opt.value || 'all'"
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': listTab === opt.value }"
        @click="listTab = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <main class="mh5-xcoin-main">
      <p v-if="!filteredRecords.length" class="mh5-xcoin-empty">暂无符合条件的记录</p>

      <article v-for="row in filteredRecords" :key="row.id" class="mh5-xcoin-record">
        <div class="mh5-xcoin-record__top">
          <span class="mh5-xcoin-record__relation">{{ row.relationLabel }}</span>
          <span
            class="mh5-xcoin-record__amount"
            :class="row.amount >= 0 ? 'mh5-xcoin-record__amount--up' : 'mh5-xcoin-record__amount--down'"
          >
            {{ formatAmount(row) }}
          </span>
        </div>
        <p class="mh5-xcoin-record__summary">{{ row.summary }}</p>
        <p v-if="sourceAgentLine(row)" class="mh5-xcoin-record__agent">
          <span
            v-if="row.sourceAgentRelation"
            :class="relationTagClass(row.sourceAgentRelation)"
          >
            {{ row.sourceAgentRelation === 'direct_superior' ? '直属上级' : '非直属' }}
          </span>
          {{ sourceAgentLine(row) }}
        </p>
        <p class="mh5-xcoin-record__time">{{ row.createdAt }}</p>
      </article>
    </main>

    <Transition name="mh5-sheet">
        <div v-if="filterOpen" class="mh5-xcoin-sheet-mask" @click.self="filterOpen = false">
          <div class="mh5-xcoin-sheet">
            <h2 class="mh5-xcoin-sheet__title">筛选</h2>

            <section class="mh5-xcoin-filter-group">
              <h3 class="mh5-xcoin-filter-group__label">类型</h3>
              <div class="mh5-xcoin-filter-chips">
                <button
                  v-for="opt in TRANSFER_DIRECTION_OPTIONS"
                  :key="`d-${opt.value || 'all'}`"
                  type="button"
                  class="mh5-xcoin-chip"
                  :class="{ 'mh5-xcoin-chip--active': filterDraft.direction === opt.value }"
                  @click="filterDraft.direction = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </section>

            <section class="mh5-xcoin-filter-group">
              <h3 class="mh5-xcoin-filter-group__label">来源</h3>
              <div class="mh5-xcoin-filter-chips">
                <button
                  v-for="opt in TRANSFER_SOURCE_OPTIONS"
                  :key="`s-${opt.value || 'all'}`"
                  type="button"
                  class="mh5-xcoin-chip"
                  :class="{ 'mh5-xcoin-chip--active': filterDraft.source === opt.value }"
                  @click="filterDraft.source = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
              <p class="mh5-xcoin-filter-hint">改版：「上级代理」拆分为「直属上级代理」与「非直属代理」</p>
            </section>

            <section class="mh5-xcoin-filter-group">
              <h3 class="mh5-xcoin-filter-group__label">目标</h3>
              <div class="mh5-xcoin-filter-chips">
                <button
                  v-for="opt in TRANSFER_TARGET_OPTIONS"
                  :key="`t-${opt.value || 'all'}`"
                  type="button"
                  class="mh5-xcoin-chip"
                  :class="{ 'mh5-xcoin-chip--active': filterDraft.target === opt.value }"
                  @click="filterDraft.target = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </section>

            <div class="mh5-xcoin-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="resetFilter">重置</button>
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--primary" @click="applyFilter">确定</button>
            </div>
          </div>
        </div>
      </Transition>
  </div>
</template>

<style scoped>
.mh5-sheet-enter-active,
.mh5-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-sheet-enter-active .mh5-xcoin-sheet,
.mh5-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-sheet-enter-from,
.mh5-sheet-leave-to {
  opacity: 0;
}

.mh5-sheet-enter-from .mh5-xcoin-sheet,
.mh5-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
