<script setup lang="ts">
import { computed, ref } from 'vue'
import WfWithdrawTurnoverRecordAnnot from '../../components/wireframe/WfWithdrawTurnoverRecordAnnot.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import {
  RECORD_CHANGE_TYPE_LABEL,
  RECORD_CHANGE_TYPE_OPTIONS,
  recordChangeTypeHasRelatedFlowNo,
  TURNOVER_RECORD_NOTICE,
  type RecordChangeType,
} from '../../constants/withdrawTurnoverRecord'
import { USER_GAME_CURRENCY_FILTER_OPTIONS } from '../../constants/userAssetCurrency'
import '../../styles/pc-wireframe.css'
import { formatSignedNumber, signedNumberClass } from '../../utils/formatSignedNumber'

const GAME_CURRENCY_OPTIONS = USER_GAME_CURRENCY_FILTER_OPTIONS

const changeTypeOptions = [
  { value: '', label: '全部' },
  ...RECORD_CHANGE_TYPE_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
]

type RecordRow = {
  id: number
  recordNo: string
  relatedFlowNo: string | null
  username: string
  userId: string
  currency: string
  changeType: RecordChangeType
  remainingBefore: number
  adjustAmount: number
  remainingAfter: number
  occurredAt: string
}

const filter = ref({
  userId: '',
  currency: '',
  relatedFlowNo: '',
  changeType: '' as '' | RecordChangeType,
  occurredStart: '',
  occurredEnd: '',
})

const recordSource = ref<RecordRow[]>([
  {
    id: 1,
    recordNo: 'WT20260601090001',
    relatedFlowNo: 'RCH20260601090001',
    username: 'dx01',
    userId: '3180664521199420635',
    currency: 'KKC',
    changeType: 'system_increase',
    remainingBefore: 0,
    adjustAmount: 100,
    remainingAfter: 100,
    occurredAt: '2026-06-01 09:00:00',
  },
  {
    id: 2,
    recordNo: 'WT20260602101533',
    relatedFlowNo: 'RCH20260602101533',
    username: 'dx01',
    userId: '3180664521199420635',
    currency: 'KKC',
    changeType: 'system_increase',
    remainingBefore: 100,
    adjustAmount: 100,
    remainingAfter: 200,
    occurredAt: '2026-06-02 10:15:33',
  },
  {
    id: 3,
    recordNo: 'WT20260603110555',
    relatedFlowNo: 'RCH20260603110555',
    username: 'dx01',
    userId: '3180664521199420635',
    currency: 'KKC',
    changeType: 'system_increase',
    remainingBefore: 200,
    adjustAmount: 200,
    remainingAfter: 400,
    occurredAt: '2026-06-03 11:05:55',
  },
  {
    id: 4,
    recordNo: 'WT20260604081509',
    relatedFlowNo: 'WDR20260604081509',
    username: 'dx01',
    userId: '3180664521199420635',
    currency: 'KKC',
    changeType: 'system_decrease',
    remainingBefore: 300,
    adjustAmount: -300,
    remainingAfter: 0,
    occurredAt: '2026-06-04 08:15:09',
  },
  {
    id: 5,
    recordNo: 'WT20260604120010',
    relatedFlowNo: 'TRF20260604120010',
    username: 'wade',
    userId: '3180664521199420636',
    currency: 'USDT-TRON',
    changeType: 'system_increase',
    remainingBefore: 0,
    adjustAmount: 150,
    remainingAfter: 150,
    occurredAt: '2026-06-04 12:00:10',
  },
  {
    id: 6,
    recordNo: 'WT20260604153021',
    relatedFlowNo: 'TIP20260604153021',
    username: 'wade',
    userId: '3180664521199420636',
    currency: 'USDT-TRON',
    changeType: 'system_decrease',
    remainingBefore: 150,
    adjustAmount: -50,
    remainingAfter: 100,
    occurredAt: '2026-06-04 15:30:21',
  },
  {
    id: 7,
    recordNo: 'WT20260604180032',
    relatedFlowNo: 'RPK20260604180032',
    username: 'qx1',
    userId: '3180664521199420637',
    currency: 'KKV',
    changeType: 'system_increase',
    remainingBefore: 0,
    adjustAmount: 88,
    remainingAfter: 88,
    occurredAt: '2026-06-04 18:00:32',
  },
  {
    id: 8,
    recordNo: 'WT20260605093054',
    relatedFlowNo: null,
    username: 'kk_user',
    userId: '3180664521199420634',
    currency: 'KKC',
    changeType: 'system_clear',
    remainingBefore: 800,
    adjustAmount: -800,
    remainingAfter: 0,
    occurredAt: '2026-06-05 09:30:54',
  },
  {
    id: 9,
    recordNo: 'WT20260605143005',
    relatedFlowNo: null,
    username: 'kk_user',
    userId: '3180664521199420634',
    currency: 'KKC',
    changeType: 'backend_increase',
    remainingBefore: 0,
    adjustAmount: 200,
    remainingAfter: 200,
    occurredAt: '2026-06-05 14:30:05',
  },
  {
    id: 10,
    recordNo: 'WT20260605160006',
    relatedFlowNo: null,
    username: 'kk_user',
    userId: '3180664521199420634',
    currency: 'KKC',
    changeType: 'backend_decrease',
    remainingBefore: 200,
    adjustAmount: -50,
    remainingAfter: 150,
    occurredAt: '2026-06-05 16:00:06',
  },
])

const recordRows = computed(() => {
  return recordSource.value.filter((row) => {
    if (filter.value.userId && !row.userId.includes(filter.value.userId)) return false
    if (filter.value.currency && row.currency !== filter.value.currency) return false
    if (filter.value.relatedFlowNo) {
      if (!row.relatedFlowNo || !row.relatedFlowNo.includes(filter.value.relatedFlowNo)) {
        return false
      }
    }
    if (filter.value.changeType && row.changeType !== filter.value.changeType) return false
    if (filter.value.occurredStart && row.occurredAt.slice(0, 10) < filter.value.occurredStart) {
      return false
    }
    if (filter.value.occurredEnd && row.occurredAt.slice(0, 10) > filter.value.occurredEnd) {
      return false
    }
    return true
  })
})

function formatRelatedFlowNo(row: RecordRow) {
  if (!recordChangeTypeHasRelatedFlowNo(row.changeType) || !row.relatedFlowNo) {
    return '—'
  }
  return row.relatedFlowNo
}

function resetFilter() {
  filter.value = {
    userId: '',
    currency: '',
    relatedFlowNo: '',
    changeType: '',
    occurredStart: '',
    occurredEnd: '',
  }
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <div class="wf-top">
      <div class="wf-notice wf-notice--full">
        <span class="wf-notice-label">提现流水规则：</span>
        {{ TURNOVER_RECORD_NOTICE.join(' ') }}
      </div>
    </div>

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">选择币种：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option v-for="opt in GAME_CURRENCY_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">关联流水号：</label>
        <input
          v-model="filter.relatedFlowNo"
          type="text"
          class="wf-input"
          placeholder="请输入关联流水号"
        />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          变动类型：
          <WfWithdrawTurnoverRecordAnnot context="changeType" />
        </label>
        <select v-model="filter.changeType" class="wf-input wf-input--select">
          <option v-for="opt in changeTypeOptions" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">发生时间：</label>
        <input v-model="filter.occurredStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.occurredEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--account-change wf-table--turnover-record">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th wf-th--bill">记录号</th>
              <th class="wf-th wf-th--bill wf-th--with-spec">
                关联流水号
                <WfWithdrawTurnoverRecordAnnot context="relatedFlowNo" placement="bottom" />
              </th>
              <th class="wf-th wf-th--user">用户</th>
              <th class="wf-th wf-th--user-id">用户ID</th>
              <th class="wf-th">币种</th>
              <th class="wf-th">变动类型</th>
              <th class="wf-th wf-th--with-spec">
                变更前剩余提现流水要求
                <WfWithdrawTurnoverRecordAnnot context="remainingBefore" placement="bottom" />
              </th>
              <th class="wf-th wf-th--turnover wf-th--with-spec">
                变更流水
                <WfWithdrawTurnoverRecordAnnot context="adjustAmount" placement="bottom" />
              </th>
              <th class="wf-th wf-th--with-spec">
                变更后剩余提现流水要求
                <WfWithdrawTurnoverRecordAnnot context="remainingAfter" placement="bottom" />
              </th>
              <th class="wf-th wf-th--time">发生时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in recordRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--bill">{{ row.recordNo }}</td>
              <td class="wf-td wf-td--bill">{{ formatRelatedFlowNo(row) }}</td>
              <td class="wf-td wf-td--user">{{ row.username }}</td>
              <td class="wf-td wf-td--user-id">{{ row.userId }}</td>
              <td class="wf-td">{{ row.currency }}</td>
              <td class="wf-td">{{ RECORD_CHANGE_TYPE_LABEL[row.changeType] }}</td>
              <td class="wf-td wf-td--num">{{ row.remainingBefore.toFixed(2) }}</td>
              <td
                class="wf-td wf-td--center wf-td--turnover"
                :class="signedNumberClass(row.adjustAmount)"
              >
                {{ formatSignedNumber(row.adjustAmount) }}
              </td>
              <td class="wf-td wf-td--num">{{ row.remainingAfter.toFixed(2) }}</td>
              <td class="wf-td wf-td--time">{{ row.occurredAt }}</td>
            </tr>
            <tr v-if="!recordRows.length">
              <td colspan="11" class="wf-td wf-td--empty">暂无提现流水变更记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>
  </div>
</template>

<style scoped>
.wf-notice--full {
  flex: 1;
  width: 100%;
  min-width: 0;
}
</style>
