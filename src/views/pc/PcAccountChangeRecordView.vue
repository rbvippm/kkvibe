<script setup lang="ts">
import { computed, ref } from 'vue'
import '../../styles/pc-wireframe.css'

/** 账变方式枚举值 */
const ACCOUNT_CHANGE_METHODS = ['充值加币', '充值减币', '人工加分', '人工减分'] as const

type ChangeMethod = (typeof ACCOUNT_CHANGE_METHODS)[number]

type ChangeStatus = 'success' | 'processing' | 'failed'

const RECHARGE_DATA_METHODS: ChangeMethod[] = ['充值加币', '充值减币']

function countsRechargeData(method: ChangeMethod) {
  return RECHARGE_DATA_METHODS.includes(method)
}

function statusLabel(status: ChangeStatus) {
  const map: Record<ChangeStatus, string> = {
    success: '账变成功',
    processing: '处理中',
    failed: '账变失败',
  }
  return map[status]
}

const CURRENCY_OPTIONS = [
  { value: '', label: '请选择' },
  { value: 'usdt_tron', label: 'USDT(TRON)' },
  { value: 'kkc', label: 'KKC' },
  { value: 'kkv', label: 'KKV' },
]

const changeStatusOptions = [
  { value: '', label: '请选择' },
  { value: 'success', label: '账变成功' },
  { value: 'processing', label: '处理中' },
  { value: 'failed', label: '账变失败' },
]

type RecordRow = {
  id: number
  billNo: string
  username: string
  userId: string
  appliedAt: string
  arrivedAt: string
  amount: number
  currency: string
  status: ChangeStatus
  method: ChangeMethod
  turnover: number
  reason: string
  initiator: string
  initiatorId: string
  canRetry: boolean
}

const filter = ref({
  billNo: '',
  userId: '',
  appliedStart: '',
  appliedEnd: '',
  arrivedStart: '',
  arrivedEnd: '',
  changeStatus: '' as '' | ChangeStatus,
  method: '' as '' | ChangeMethod,
  currency: '',
})

function currencyLabel(value: string) {
  const map: Record<string, string> = {
    usdt_tron: 'USDT(TRON)',
    kkc: 'KKC',
    kkv: 'KKV',
  }
  return map[value] ?? value
}

const recordSource = ref<RecordRow[]>([
  {
    id: 1,
    billNo: '1779451515ioe8w0',
    username: 'dx01',
    userId: '3180664521199420635',
    appliedAt: '2026-05-22 20:05:15',
    arrivedAt: '2026-05-22 20:05:18',
    amount: 500,
    currency: 'USDT(TRON)',
    status: 'success',
    method: '充值加币',
    turnover: 500,
    reason: '活动补发',
    initiator: 'ruby',
    initiatorId: '76',
    canRetry: false,
  },
  {
    id: 2,
    billNo: '1779451488k9m2p1',
    username: 'wade',
    userId: '3180664521199420636',
    appliedAt: '2026-05-22 19:48:02',
    arrivedAt: '2026-05-22 19:48:05',
    amount: 1000,
    currency: 'KKC',
    status: 'success',
    method: '充值加币',
    turnover: 1000,
    reason: '11',
    initiator: 'Wade',
    initiatorId: '103',
    canRetry: false,
  },
  {
    id: 3,
    billNo: '1779449021ab3c7d',
    username: 'qx1',
    userId: '3180664521199420637',
    appliedAt: '2026-05-21 16:30:44',
    arrivedAt: '2026-05-21 16:30:50',
    amount: 200,
    currency: 'USDT(TRON)',
    status: 'success',
    method: '人工加分',
    turnover: 0,
    reason: '测',
    initiator: 'COKE',
    initiatorId: '90',
    canRetry: false,
  },
  {
    id: 4,
    billNo: '1779441200x7y2z9',
    username: 'UI',
    userId: '3180664521199420634',
    appliedAt: '2026-05-20 11:22:18',
    arrivedAt: '2026-05-20 11:22:20',
    amount: -88,
    currency: 'KKV',
    status: 'success',
    method: '人工减分',
    turnover: -50,
    reason: '222',
    initiator: 'ruby',
    initiatorId: '76',
    canRetry: false,
  },
  {
    id: 5,
    billNo: '1779438801m5n8q2',
    username: '南岸听风',
    userId: '3180664521199420999',
    appliedAt: '2026-05-19 09:15:33',
    arrivedAt: '2026-05-19 09:15:40',
    amount: -300,
    currency: 'KKC',
    status: 'success',
    method: '充值减币',
    turnover: -300,
    reason: '送的',
    initiator: 'admin01',
    initiatorId: '12',
    canRetry: false,
  },
  {
    id: 6,
    billNo: '1779432100p2k8w1',
    username: 'feature',
    userId: '3180664521199420640',
    appliedAt: '2026-05-18 14:02:11',
    arrivedAt: '2026-05-18 14:02:11',
    amount: 2147.48,
    currency: 'USDT(TRON)',
    status: 'success',
    method: '充值加币',
    turnover: 2147.48,
    reason: '大额充值',
    initiator: 'ruby',
    initiatorId: '76',
    canRetry: false,
  },
  {
    id: 7,
    billNo: '1779429000t9r4s3',
    username: '小猫电台',
    userId: '3180664521199420641',
    appliedAt: '2026-05-17 22:18:55',
    arrivedAt: '',
    amount: 120,
    currency: 'KKC',
    status: 'processing',
    method: '人工加分',
    turnover: 120,
    reason: '待到账',
    initiator: 'Wade',
    initiatorId: '103',
    canRetry: true,
  },
  {
    id: 8,
    billNo: '1779425000u1v6w8',
    username: 'Vicky02',
    userId: '3180664521199420639',
    appliedAt: '2026-05-17 10:05:00',
    arrivedAt: '2026-05-17 10:05:02',
    amount: -50,
    currency: 'KKV',
    status: 'failed',
    method: '人工减分',
    turnover: -50,
    reason: '余额不足',
    initiator: 'COKE',
    initiatorId: '90',
    canRetry: true,
  },
  {
    id: 9,
    billNo: '1779421000h3j5k7',
    username: 'dx01',
    userId: '3180664521199420635',
    appliedAt: '2026-05-16 08:30:22',
    arrivedAt: '2026-05-16 08:30:25',
    amount: 66,
    currency: 'KKC',
    status: 'success',
    method: '充值减币',
    turnover: -66,
    reason: '调整',
    initiator: 'ruby',
    initiatorId: '76',
    canRetry: false,
  },
])

function inRange(timeStr: string, start: string, end: string) {
  if (!timeStr) return !start && !end
  const t = new Date(timeStr.replace(' ', 'T')).getTime()
  if (start && t < new Date(start).getTime()) return false
  if (end && t > new Date(end + 'T23:59:59').getTime()) return false
  return true
}

function matchRecord(row: RecordRow) {
  const f = filter.value
  if (f.billNo && !row.billNo.includes(f.billNo.trim())) return false
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.changeStatus && row.status !== f.changeStatus) return false
  if (f.method && row.method !== f.method) return false
  if (f.currency && row.currency !== currencyLabel(f.currency)) return false
  if (!inRange(row.appliedAt, f.appliedStart, f.appliedEnd)) return false
  if (!inRange(row.arrivedAt, f.arrivedStart, f.arrivedEnd)) return false
  return true
}

const recordRows = computed(() => recordSource.value.filter(matchRecord))

function resetFilter() {
  filter.value = {
    billNo: '',
    userId: '',
    appliedStart: '',
    appliedEnd: '',
    arrivedStart: '',
    arrivedEnd: '',
    changeStatus: '',
    method: '',
    currency: '',
  }
}

function formatAmount(row: RecordRow) {
  const sign = row.amount >= 0 ? '+' : ''
  return `${sign}${row.amount} ${row.currency}`
}

function formatArrivedAt(value: string) {
  return value.trim() ? value : '—'
}

/* ---------- 查看详情 ---------- */
const detailVisible = ref(false)
const detailRow = ref<RecordRow | null>(null)

function openDetail(row: RecordRow) {
  detailRow.value = row
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  detailRow.value = null
}

const detailRechargeHint = computed(() => {
  if (!detailRow.value) return ''
  return countsRechargeData(detailRow.value.method)
    ? '该账变方式计入充值数据'
    : '该账变方式不加入充值数据'
})

function onRetry(row: RecordRow) {
  if (!row.canRetry) return
  window.alert(`演示：重新发起账变 ${row.billNo}`)
}
</script>

<template>
  <div class="pc-wireframe-page">
    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">账单号：</label>
        <input v-model="filter.billNo" type="text" class="wf-input" placeholder="请输入账单号" />

        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">申请时间：</label>
        <input v-model="filter.appliedStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.appliedEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">到账时间：</label>
        <input v-model="filter.arrivedStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.arrivedEnd" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">账变状态：</label>
        <select v-model="filter.changeStatus" class="wf-input wf-input--select">
          <option v-for="opt in changeStatusOptions" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">账变方式：</label>
        <select v-model="filter.method" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option v-for="m in ACCOUNT_CHANGE_METHODS" :key="m" :value="m">
            {{ m }}
          </option>
        </select>

        <label class="wf-label">币种类型：</label>
        <select v-model="filter.currency" class="wf-input wf-input--select">
          <option value="">全部</option>
          <option
            v-for="opt in CURRENCY_OPTIONS.filter((c) => c.value)"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="wf-toolbar">
        <span class="wf-toolbar__actions wf-toolbar__actions--start">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--account-change">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th wf-th--bill">账单号</th>
              <th class="wf-th wf-th--user">用户</th>
              <th class="wf-th wf-th--user-id">用户ID</th>
              <th class="wf-th wf-th--time">发起时间</th>
              <th class="wf-th wf-th--time">到账时间</th>
              <th class="wf-th wf-th--amount">账变金额</th>
              <th class="wf-th wf-th--method">账变方式</th>
              <th class="wf-th wf-th--turnover">流水</th>
              <th class="wf-th wf-th--status">账变状态</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in recordRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--bill">{{ row.billNo }}</td>
              <td class="wf-td wf-td--user">{{ row.username }}</td>
              <td class="wf-td wf-td--user-id">{{ row.userId }}</td>
              <td class="wf-td wf-td--time">{{ row.appliedAt }}</td>
              <td class="wf-td wf-td--time">{{ formatArrivedAt(row.arrivedAt) }}</td>
              <td
                class="wf-td wf-td--amount"
                :class="row.amount >= 0 ? 'wf-amount--positive' : 'wf-amount--negative'"
              >
                {{ formatAmount(row) }}
              </td>
              <td class="wf-td wf-td--method">{{ row.method }}</td>
              <td class="wf-td wf-td--center wf-td--turnover">{{ row.turnover }}</td>
              <td class="wf-td wf-td--status">{{ statusLabel(row.status) }}</td>
              <td class="wf-td wf-td--center wf-td--actions">
                <button
                  type="button"
                  class="wf-link-action"
                  :class="{ 'wf-link-action--disabled': !row.canRetry }"
                  :disabled="!row.canRetry"
                  @click="onRetry(row)"
                >
                  重新账变
                </button>
                <span class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="openDetail(row)">查看详情</button>
              </td>
            </tr>
            <tr v-if="recordRows.length === 0">
              <td colspan="11" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>

    <!-- 查看详情 -->
    <Teleport to="body">
      <div
        v-if="detailVisible && detailRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeDetail"
      >
        <div class="wf-modal wf-modal--detail" role="dialog" aria-labelledby="detail-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="detail-title" class="wf-modal__title">账变记录详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDetail">×</button>
          </div>
          <div class="wf-modal__body">
            <dl class="wf-detail-list">
              <div class="wf-detail-list__row">
                <dt>账单号</dt>
                <dd>{{ detailRow.billNo }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>用户</dt>
                <dd>{{ detailRow.username }}（{{ detailRow.userId }}）</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>账变方式</dt>
                <dd>{{ detailRow.method }} · {{ detailRechargeHint }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>账变金额</dt>
                <dd :class="detailRow.amount >= 0 ? 'wf-amount--positive' : 'wf-amount--negative'">
                  {{ formatAmount(detailRow) }}
                </dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>流水</dt>
                <dd>{{ detailRow.turnover }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>账变状态</dt>
                <dd>{{ statusLabel(detailRow.status) }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>申请时间</dt>
                <dd>{{ detailRow.appliedAt }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>到账时间</dt>
                <dd>{{ detailRow.arrivedAt || '—' }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>账变理由</dt>
                <dd>{{ detailRow.reason }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>发起人</dt>
                <dd>{{ detailRow.initiator }}（ID: {{ detailRow.initiatorId }}）</dd>
              </div>
            </dl>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeDetail">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
