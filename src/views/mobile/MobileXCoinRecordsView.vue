<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  MOCK_TRANSFER_RECORDS,
  TRANSFER_RECORD_TYPE_OPTIONS,
  TRANSFER_ROLE_FILTER_OPTIONS,
  matchTransferRecordPerson,
  matchTransferRecordRole,
  recordFlowDisplay,
  recordTypeBadgeClass,
  recordTypeBadgeLabel,
  transferRecordOrderNo,
  type TransferRecordType,
  type TransferRoleFilter,
  type XCoinTransferRecord,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

type PickerKind = 'type' | 'role' | null

type AppliedFilter = {
  recordType: '' | TransferRecordType
  role: TransferRoleFilter
  personKeyword: string
}

const pickerOpen = ref<PickerKind>(null)
const filterOpen = ref(false)
const appliedFilter = ref<AppliedFilter>({
  recordType: '',
  role: '',
  personKeyword: '',
})
const filterDraft = ref<AppliedFilter>({ ...appliedFilter.value })

const typeLabel = computed(
  () =>
    TRANSFER_RECORD_TYPE_OPTIONS.find((o) => o.value === appliedFilter.value.recordType)?.label ??
    '类型',
)
const roleLabel = computed(
  () =>
    TRANSFER_ROLE_FILTER_OPTIONS.find((o) => o.value === appliedFilter.value.role)?.label ?? '对象',
)

const activePickerOptions = computed(() => {
  if (pickerOpen.value === 'type') return TRANSFER_RECORD_TYPE_OPTIONS
  if (pickerOpen.value === 'role') return TRANSFER_ROLE_FILTER_OPTIONS
  return []
})

const pickerTitle = computed(() => (pickerOpen.value === 'type' ? '选择类型' : '选择对象'))

const filteredRecords = computed(() => {
  return MOCK_TRANSFER_RECORDS.filter((row) => {
    if (appliedFilter.value.recordType && row.recordType !== appliedFilter.value.recordType) {
      return false
    }
    if (!matchTransferRecordRole(row, appliedFilter.value.role)) return false
    if (!matchTransferRecordPerson(row, appliedFilter.value.personKeyword)) return false
    return true
  }).map((row) => ({
    ...row,
    flow: recordFlowDisplay(row),
    orderNo: transferRecordOrderNo(row),
  }))
})

function openPicker(kind: PickerKind) {
  pickerOpen.value = kind
}

function closePicker() {
  pickerOpen.value = null
}

function selectPicker(value: string) {
  if (pickerOpen.value === 'type') {
    appliedFilter.value.recordType = value as '' | TransferRecordType
  }
  if (pickerOpen.value === 'role') {
    appliedFilter.value.role = value as TransferRoleFilter
  }
  closePicker()
}

function openFilter() {
  filterDraft.value = { ...appliedFilter.value }
  filterOpen.value = true
}

function resetFilter() {
  filterDraft.value = {
    recordType: '',
    role: '',
    personKeyword: '',
  }
}

function applyFilter() {
  appliedFilter.value = { ...filterDraft.value }
  filterOpen.value = false
}

function formatAmount(row: XCoinTransferRecord) {
  if (row.recordType === 'daily_rebate') {
    return `+${row.amount.toFixed(2)}`
  }
  const sign = row.amount > 0 ? '+' : ''
  return `${sign}${row.amount.toFixed(2)}`
}

function amountClass(row: XCoinTransferRecord) {
  if (row.recordType === 'daily_rebate') return 'mh5-xcoin-record__amount--rebate'
  return row.amount >= 0 ? 'mh5-xcoin-record__amount--up' : 'mh5-xcoin-record__amount--down'
}

function isPickerOptionActive(opt: { value: string }) {
  if (pickerOpen.value === 'type') return appliedFilter.value.recordType === opt.value
  if (pickerOpen.value === 'role') return appliedFilter.value.role === opt.value
  return false
}
</script>

<template>
  <div class="mh5-xcoin-page">
    <Mh5SubPageHeader title="信用额度记录">
      <template #right>
        <button type="button" class="mh5-sub-header__action" @click="openFilter">筛选</button>
      </template>
    </Mh5SubPageHeader>

    <div class="mh5-xcoin-filters">
      <button type="button" class="mh5-xcoin-filter" @click="openPicker('type')">
        {{ typeLabel }}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
          <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="mh5-xcoin-filter" @click="openPicker('role')">
        {{ roleLabel }}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
          <path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <main class="mh5-xcoin-main">
      <p v-if="!filteredRecords.length" class="mh5-xcoin-empty">暂无符合条件的记录</p>

      <article v-for="row in filteredRecords" :key="row.id" class="mh5-xcoin-record">
        <div class="mh5-xcoin-record__head">
          <span
            class="mh5-xcoin-record__type"
            :class="recordTypeBadgeClass(row.recordType)"
          >
            {{ recordTypeBadgeLabel(row.recordType) }}
          </span>
          <span class="mh5-xcoin-record__amount" :class="amountClass(row)">
            {{ formatAmount(row) }}
          </span>
        </div>

        <div class="mh5-xcoin-record__meta">
          <div class="mh5-xcoin-record__row">
            <span class="mh5-xcoin-record__label">发起人</span>
            <span class="mh5-xcoin-record__value">{{ row.flow.initiator }}</span>
          </div>
          <div class="mh5-xcoin-record__row">
            <span class="mh5-xcoin-record__label">对象</span>
            <span class="mh5-xcoin-record__value">{{ row.flow.target }}</span>
          </div>
          <div class="mh5-xcoin-record__row">
            <span class="mh5-xcoin-record__label">时间</span>
            <time class="mh5-xcoin-record__value">{{ row.createdAt }}</time>
          </div>
          <div class="mh5-xcoin-record__row">
            <span class="mh5-xcoin-record__label">单号</span>
            <span class="mh5-xcoin-record__value mh5-xcoin-record__value--mono">{{ row.orderNo }}</span>
          </div>
        </div>
      </article>
    </main>

    <Transition name="mh5-sheet">
      <div v-if="pickerOpen" class="mh5-xcoin-sheet-mask" @click.self="closePicker">
        <div class="mh5-xcoin-sheet">
          <h2 class="mh5-xcoin-sheet__title">{{ pickerTitle }}</h2>
          <button
            v-for="opt in activePickerOptions"
            :key="`${pickerOpen}-${opt.value || 'all'}`"
            type="button"
            class="mh5-xcoin-sheet__option"
            :class="{ 'mh5-xcoin-sheet__option--active': isPickerOptionActive(opt) }"
            @click="selectPicker(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="mh5-sheet">
      <div v-if="filterOpen" class="mh5-xcoin-sheet-mask" @click.self="filterOpen = false">
        <div class="mh5-xcoin-sheet">
          <h2 class="mh5-xcoin-sheet__title">筛选</h2>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">类型</h3>
            <div class="mh5-xcoin-filter-chips">
              <button
                v-for="opt in TRANSFER_RECORD_TYPE_OPTIONS"
                :key="`type-${opt.value || 'all'}`"
                type="button"
                class="mh5-xcoin-chip"
                :class="{ 'mh5-xcoin-chip--active': filterDraft.recordType === opt.value }"
                @click="filterDraft.recordType = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">对象</h3>
            <div class="mh5-xcoin-filter-chips">
              <button
                v-for="opt in TRANSFER_ROLE_FILTER_OPTIONS"
                :key="`role-${opt.value || 'all'}`"
                type="button"
                class="mh5-xcoin-chip"
                :class="{ 'mh5-xcoin-chip--active': filterDraft.role === opt.value }"
                @click="filterDraft.role = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <section class="mh5-xcoin-filter-group">
            <h3 class="mh5-xcoin-filter-group__label">账号</h3>
            <input
              v-model="filterDraft.personKeyword"
              type="search"
              class="mh5-xcoin-filter-input"
              placeholder="请输入昵称、账号或账号ID"
            />
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
