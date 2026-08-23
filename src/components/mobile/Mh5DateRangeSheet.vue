<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AGENT_REPORT_FILTER_ASSETS } from '../../constants/agentReport'
import {
  DATE_RANGE_SHEET_PRESETS,
  MH5_DATE_RANGE_MAX_MONTHS,
  MH5_DATE_RANGE_TODAY,
  addMonthsYmd,
  clampYmd,
  dateRangeSheetPresetRange,
  matchDateRangeSheetPreset,
  padDatePart,
  parseYmd,
  shiftYmd,
  type DatePart,
  type DateRangeSheetPreset,
} from '../../constants/mh5DateRange'

const props = withDefaults(
  defineProps<{
    open: boolean
    start: string
    end: string
    today?: string
    maxMonths?: number
    tone?: 'default' | 'vip'
  }>(),
  {
    today: MH5_DATE_RANGE_TODAY,
    maxMonths: MH5_DATE_RANGE_MAX_MONTHS,
    tone: 'default',
  },
)

const emit = defineEmits<{
  close: []
  confirm: [start: string, end: string]
}>()

const draftStart = ref(props.start)
const draftEnd = ref(props.end)
const editing = ref<'start' | 'end'>('start')
const activePreset = ref<DateRangeSheetPreset | null>(null)

const minDate = computed(() => addMonthsYmd(props.today, -props.maxMonths))
const maxDate = computed(() => props.today)

function syncActivePreset() {
  activePreset.value = matchDateRangeSheetPreset(draftStart.value, draftEnd.value, props.today)
}

function applyRange(start: string, end: string) {
  draftStart.value = clampYmd(start, minDate.value, maxDate.value)
  draftEnd.value = clampYmd(end, minDate.value, maxDate.value)
  if (draftEnd.value < draftStart.value) draftEnd.value = draftStart.value
  editing.value = 'start'
  syncActivePreset()
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    applyRange(props.start || props.today, props.end || props.today)
  },
)

const editingValue = computed(() => (editing.value === 'start' ? draftStart.value : draftEnd.value))
const wheel = computed(() => parseYmd(editingValue.value) ?? parseYmd(props.today)!)

function setEditingValue(next: string) {
  const clamped = clampYmd(next, minDate.value, maxDate.value)
  if (editing.value === 'start') {
    draftStart.value = clamped
    if (draftEnd.value < clamped) draftEnd.value = clamped
  } else {
    draftEnd.value = clamped
    if (draftStart.value > clamped) draftStart.value = clamped
  }
  syncActivePreset()
}

function pickPreset(key: DateRangeSheetPreset) {
  const range = dateRangeSheetPresetRange(key, props.today)
  applyRange(range.start, range.end)
}

function stepPart(part: DatePart, delta: number) {
  setEditingValue(shiftYmd(editingValue.value, part, delta))
}

function neighborLabel(part: DatePart, delta: number) {
  const next = parseYmd(shiftYmd(editingValue.value, part, delta))
  if (!next) return ''
  if (part === 'year') return String(next.y)
  if (part === 'month') return padDatePart(next.m)
  return padDatePart(next.d)
}

function resetDraft() {
  applyRange(props.today, props.today)
}

function confirmDraft() {
  emit('confirm', draftStart.value, draftEnd.value)
}

const yearLabel = computed(() => String(wheel.value.y))
const monthLabel = computed(() => padDatePart(wheel.value.m))
const dayLabel = computed(() => padDatePart(wheel.value.d))
const wheelCols: { key: DatePart }[] = [
  { key: 'year' },
  { key: 'month' },
  { key: 'day' },
]

function currentLabel(col: DatePart) {
  if (col === 'year') return yearLabel.value
  if (col === 'month') return monthLabel.value
  return dayLabel.value
}
</script>

<template>
  <Teleport to="body">
    <Transition name="mh5-agent-report-sheet">
      <div
        v-if="open"
        class="mh5-agent-overlay-mask"
        @click.self="emit('close')"
      >
        <div
          class="mh5-agent-overlay-sheet mh5-date-range-sheet"
          :class="{ 'mh5-date-range-sheet--vip': tone === 'vip' }"
          role="dialog"
          aria-modal="true"
          aria-label="筛选时间"
        >
          <div class="mh5-date-range-sheet__head">
            <h2 class="mh5-date-range-sheet__title">筛选时间</h2>
            <button
              type="button"
              class="mh5-date-range-sheet__close"
              aria-label="关闭"
              @click="emit('close')"
            >
              <img :src="AGENT_REPORT_FILTER_ASSETS.close" alt="" width="14" height="14" />
            </button>
          </div>

          <div class="mh5-date-range-sheet__body">
            <div class="mh5-date-range-sheet__presets" role="tablist" aria-label="快捷时间">
              <button
                v-for="item in DATE_RANGE_SHEET_PRESETS"
                :key="item.key"
                type="button"
                role="tab"
                class="mh5-date-range-sheet__preset"
                :class="{ 'mh5-date-range-sheet__preset--active': activePreset === item.key }"
                :aria-selected="activePreset === item.key"
                @click="pickPreset(item.key)"
              >
                {{ item.label }}
              </button>
            </div>
            <div class="mh5-date-range-sheet__panel">
              <div class="mh5-date-range-sheet__chips">
                <button
                  type="button"
                  class="mh5-date-range-sheet__chip"
                  :class="{ 'mh5-date-range-sheet__chip--active': editing === 'start' }"
                  @click="editing = 'start'"
                >
                  {{ draftStart }}
                </button>
                <span class="mh5-date-range-sheet__to">至</span>
                <button
                  type="button"
                  class="mh5-date-range-sheet__chip"
                  :class="{ 'mh5-date-range-sheet__chip--active': editing === 'end' }"
                  @click="editing = 'end'"
                >
                  {{ draftEnd }}
                </button>
              </div>

              <div class="mh5-date-range-sheet__wheel" aria-label="年月日滚轮">
                <div class="mh5-date-range-sheet__highlight" aria-hidden="true" />
                <div
                  v-for="col in wheelCols"
                  :key="col.key"
                  class="mh5-date-range-sheet__col"
                >
                  <button type="button" @click="stepPart(col.key, -1)">
                    {{ neighborLabel(col.key, -1) }}
                  </button>
                  <span>{{ currentLabel(col.key) }}</span>
                  <button type="button" @click="stepPart(col.key, 1)">
                    {{ neighborLabel(col.key, 1) }}
                  </button>
                </div>
              </div>
            </div>
            <p class="mh5-date-range-sheet__hint">仅支持查询近 6 个月的记录</p>
          </div>

          <div class="mh5-date-range-sheet__footer">
            <button type="button" class="mh5-date-range-sheet__btn mh5-date-range-sheet__btn--ghost" @click="resetDraft">
              重置
            </button>
            <button type="button" class="mh5-date-range-sheet__btn mh5-date-range-sheet__btn--primary" @click="confirmDraft">
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
