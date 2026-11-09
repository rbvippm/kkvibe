<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WfSpecAnnot from '../wireframe/WfSpecAnnot.vue'
import {
  formatReconcileValue,
  groupReconcileByUser,
  RECONCILE_CHANNELS,
  RECONCILE_DEVELOPERS,
  RECONCILE_MINI_PROGRAMS,
  RECONCILE_TIMEZONES,
  RECONCILE_TODAY,
  reconcileChannelName,
  reconcileRowsOf,
  sumReconcileRows,
  type ReconcileField,
  type ReconcileLedger,
  type ReconcileMetricKey,
} from '../../constants/billingReconcile'
import { signedNumberClass } from '../../utils/formatSignedNumber'
import { showPcToast } from '../../composables/usePcToast'

type SpecAnnot = { no: number; title: string; items: string[] }

/** 平台对账「平台对账数据」与渠道对账详情「渠道对账数据」共用：筛选 → 统计卡片 → 用户明细 */
const props = defineProps<{
  ledger: ReconcileLedger
  currency: string
  statFields: ReconcileField[]
  columns: ReconcileField<ReconcileMetricKey>[]
  /** 渠道详情内固定渠道，隐藏「所属渠道」筛选与列 */
  channelNo?: number
  /** 渠道详情：日统计 / 月统计 */
  periodTabs?: boolean
  showIndex?: boolean
  filterAnnot?: SpecAnnot
  tableAnnot?: SpecAnnot
}>()

type Period = 'day' | 'month'

type DataFilter = {
  userId: string
  channelNo: number | ''
  miniProgram: string
  developer: string
  start: string
  end: string
  timezone: string
}

const router = useRouter()
const period = ref<Period>('day')

const defaultFilter = (p: Period): DataFilter => ({
  userId: '',
  channelNo: '',
  miniProgram: '',
  developer: '',
  start: p === 'day' ? RECONCILE_TODAY : RECONCILE_TODAY.slice(0, 7),
  end: p === 'day' ? RECONCILE_TODAY : RECONCILE_TODAY.slice(0, 7),
  timezone: RECONCILE_TIMEZONES[0],
})

const filter = ref<DataFilter>(defaultFilter('day'))
const applied = ref<DataFilter>(defaultFilter('day'))
const hint = ref('')

const filteredRows = computed(() => {
  const f = applied.value
  const len = period.value === 'day' ? 10 : 7
  return reconcileRowsOf(props.ledger, props.currency).filter((row) => {
    if (props.channelNo !== undefined && row.user.channelNo !== props.channelNo) return false
    if (f.userId && row.user.userId !== f.userId) return false
    if (f.channelNo !== '' && row.user.channelNo !== f.channelNo) return false
    if (f.miniProgram && row.user.miniProgram !== f.miniProgram) return false
    if (f.developer && row.user.developer !== f.developer) return false
    const key = row.date.slice(0, len)
    if (f.start && key < f.start) return false
    if (f.end && key > f.end) return false
    return true
  })
})

const totals = computed(() => sumReconcileRows(filteredRows.value))
const userRows = computed(() => groupReconcileByUser(filteredRows.value))
const showChannel = computed(() => props.channelNo === undefined)
const colCount = computed(
  () => props.columns.length + 2 + (props.showIndex ? 1 : 0) + (showChannel.value ? 1 : 0),
)

function switchPeriod(next: Period) {
  if (next === period.value) return
  period.value = next
  filter.value = defaultFilter(next)
  applied.value = defaultFilter(next)
  hint.value = ''
}

function search() {
  const next = { ...filter.value, userId: filter.value.userId.trim() }
  if (next.userId && !/^\d+$/.test(next.userId)) {
    hint.value = '用户ID 只能输入数字'
    return
  }
  if (next.start && next.end && next.start > next.end) {
    hint.value = '结束时间不能早于开始时间'
    return
  }
  hint.value = ''
  applied.value = next
}

function reset() {
  filter.value = defaultFilter(period.value)
  applied.value = defaultFilter(period.value)
  hint.value = ''
}

function exportData() {
  const count = userRows.value.length
  if (count) showPcToast(`已导出 ${props.currency} 对账数据 ${count} 条`)
  else showPcToast('暂无数据可导出', 'info')
}

function openUserDetail(userId: string) {
  router.push({ name: 'pc-user-detail', query: { userId } })
}
</script>

<template>
  <div class="reconcile-data">
    <div v-if="periodTabs" class="wf-tabs reconcile-data__period">
      <button
        type="button"
        class="wf-tab"
        :class="{ 'wf-tab--active': period === 'day' }"
        @click="switchPeriod('day')"
      >
        日统计
      </button>
      <button
        type="button"
        class="wf-tab"
        :class="{ 'wf-tab--active': period === 'month' }"
        @click="switchPeriod('month')"
      >
        月统计
      </button>
    </div>

    <div class="wf-toolbar wf-toolbar--filters">
      <label class="wf-label wf-label--with-spec">
        用户ID：
        <WfSpecAnnot v-if="filterAnnot" :no="filterAnnot.no" :title="filterAnnot.title" :items="filterAnnot.items" />
      </label>
      <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" @keyup.enter="search" />
      <template v-if="showChannel">
        <label class="wf-label">所属渠道：</label>
        <select v-model="filter.channelNo" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="ch in RECONCILE_CHANNELS" :key="ch.no" :value="ch.no">{{ ch.name }}</option>
        </select>
      </template>
      <label class="wf-label">小程序：</label>
      <select v-model="filter.miniProgram" class="wf-input wf-input--select">
        <option value="">全部</option>
        <option v-for="mp in RECONCILE_MINI_PROGRAMS" :key="mp" :value="mp">{{ mp }}</option>
      </select>
      <label class="wf-label">开发者：</label>
      <select v-model="filter.developer" class="wf-input wf-input--select">
        <option value="">全部</option>
        <option v-for="dev in RECONCILE_DEVELOPERS" :key="dev" :value="dev">{{ dev }}</option>
      </select>
    </div>
    <div class="wf-toolbar wf-toolbar--filters">
      <label class="wf-label">统计时间：</label>
      <template v-if="period === 'day'">
        <input v-model="filter.start" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">至</span>
        <input v-model="filter.end" type="date" class="wf-input wf-input--date" />
      </template>
      <template v-else>
        <input v-model="filter.start" type="month" class="wf-input wf-input--date" />
        <span class="wf-range-sep">至</span>
        <input v-model="filter.end" type="month" class="wf-input wf-input--date" />
      </template>
      <label class="wf-label">时区：</label>
      <select v-model="filter.timezone" class="wf-input wf-input--select">
        <option v-for="tz in RECONCILE_TIMEZONES" :key="tz" :value="tz">{{ tz }}</option>
      </select>
    </div>
    <div class="wf-toolbar">
      <span class="wf-toolbar__actions wf-toolbar__actions--start">
        <button type="button" class="wf-btn wf-btn--primary" @click="search">搜索</button>
        <button type="button" class="wf-btn wf-btn--default" @click="reset">{{ channelNo === undefined ? '重置' : '清除' }}</button>
        <button type="button" class="wf-btn reconcile-data__btn--export" @click="exportData">导出</button>
      </span>
      <p v-if="hint" class="wf-modal__hint">{{ hint }}</p>
    </div>

    <div class="reconcile-data__stats">
      <div v-for="field in statFields" :key="field.key" class="reconcile-data__stat">
        {{ field.label }}：<span :class="field.key === 'profit' ? signedNumberClass(totals.profit) : ''">{{
          formatReconcileValue(field.key, totals[field.key])
        }}</span>
      </div>
      <WfSpecAnnot
        v-if="tableAnnot"
        class="reconcile-data__stats-annot"
        :no="tableAnnot.no"
        :title="tableAnnot.title"
        :items="tableAnnot.items"
      />
    </div>

    <div class="wf-table-wrap">
      <table class="wf-table reconcile-data__table">
        <thead>
          <tr>
            <th v-if="showIndex" class="wf-th wf-th--no">编号</th>
            <th class="wf-th">用户名</th>
            <th class="wf-th">用户ID</th>
            <th v-if="showChannel" class="wf-th">所属渠道</th>
            <th v-for="col in columns" :key="col.key" class="wf-th">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!userRows.length">
            <td :colspan="colCount" class="wf-td wf-td--empty">暂无数据</td>
          </tr>
          <tr v-for="(row, index) in userRows" :key="row.user.userId">
            <td v-if="showIndex" class="wf-td wf-td--center">{{ index + 1 }}</td>
            <td class="wf-td">{{ row.user.nickname }}</td>
            <td class="wf-td wf-td--bill">
              <button type="button" class="wf-link-action" @click="openUserDetail(row.user.userId)">
                {{ row.user.userId }}
              </button>
            </td>
            <td v-if="showChannel" class="wf-td">{{ reconcileChannelName(row.user.channelNo) }}</td>
            <td
              v-for="col in columns"
              :key="col.key"
              class="wf-td wf-td--num"
              :class="col.key === 'profit' ? signedNumberClass(row.profit) : ''"
            >
              {{ formatReconcileValue(col.key, row[col.key]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.reconcile-data__period {
  margin-bottom: 12px;
}

.reconcile-data__btn--export {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #e6a23c;
}

.reconcile-data__stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px 16px;
  margin: 4px 0 16px;
  padding-right: 40px;
}

.reconcile-data__stat {
  padding: 10px 12px;
  background: #f2f3f5;
  color: var(--pc-text);
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.reconcile-data__stats-annot {
  position: absolute;
  top: 8px;
  right: 0;
}

.reconcile-data__table {
  table-layout: auto;
}
</style>
