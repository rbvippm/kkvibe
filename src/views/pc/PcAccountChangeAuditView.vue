<script setup lang="ts">
import { computed, ref } from 'vue'
import WfAccountChangeMethodAnnot from '../../components/wireframe/WfAccountChangeMethodAnnot.vue'
import WfWithdrawTurnoverAnnot from '../../components/wireframe/WfWithdrawTurnoverAnnot.vue'
import { WITHDRAW_TURNOVER_LABEL } from '../../constants/withdrawTurnover'
import {
  ACCOUNT_CHANGE_METHODS,
  countsRechargeData,
  type AccountChangeMethod,
} from '../../constants/accountChangeMethod'
import '../../styles/pc-wireframe.css'
import { formatSignedNumber, signedNumberClass } from '../../utils/formatSignedNumber'

type ChangeMethod = AccountChangeMethod

type AuditStatus = 'pending' | 'approved' | 'rejected'

function auditStatusLabel(status: AuditStatus) {
  const map: Record<AuditStatus, string> = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝',
  }
  return map[status]
}

const CURRENCY_OPTIONS = [
  { value: '', label: '请选择' },
  { value: 'usdt_tron', label: 'USDT(TRON)' },
  { value: 'kkc', label: 'KKC' },
  { value: 'kkv', label: 'KKV' },
]

const auditStatusOptions = [
  { value: '', label: '请选择' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '审核拒绝' },
]

type AuditRow = {
  id: number
  username: string
  userId: string
  initiator: string
  initiatorId: string
  appliedAt: string
  amount: number
  currency: string
  method: ChangeMethod
  turnover: number
  reason: string
  auditStatus: AuditStatus
  auditorId: string
  auditorName: string
  auditedAt: string
  rejectReason: string
}

const filter = ref({
  userId: '',
  initiatorId: '',
  appliedStart: '',
  appliedEnd: '',
  auditStatus: '' as '' | AuditStatus,
  auditorId: '',
  auditStart: '',
  auditEnd: '',
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

const auditSource = ref<AuditRow[]>([
  {
    id: 1,
    username: 'dx01',
    userId: '2673875810693327909',
    initiator: 'ruby',
    initiatorId: '76',
    appliedAt: '2026-05-22 20:05:15',
    amount: 500,
    currency: 'USDT(TRON)',
    method: '充值加分',
    turnover: 500,
    reason: '1',
    auditStatus: 'approved',
    auditorId: '88',
    auditorName: '审核员A',
    auditedAt: '2026-05-22 20:08:30',
    rejectReason: '',
  },
  {
    id: 2,
    username: 'wade',
    userId: '2673875810693327910',
    initiator: 'Wade',
    initiatorId: '103',
    appliedAt: '2026-05-22 19:48:02',
    amount: 1000,
    currency: 'KKC',
    method: '充值加分',
    turnover: 1000,
    reason: '11',
    auditStatus: 'approved',
    auditorId: '88',
    auditorName: '审核员A',
    auditedAt: '2026-05-22 19:50:11',
    rejectReason: '',
  },
  {
    id: 3,
    username: 'qx1',
    userId: '2673875810693327911',
    initiator: 'COKE',
    initiatorId: '90',
    appliedAt: '2026-05-21 16:30:44',
    amount: 200,
    currency: 'USDT(TRON)',
    method: '加币',
    turnover: 0,
    reason: '测',
    auditStatus: 'approved',
    auditorId: '92',
    auditorName: '审核员B',
    auditedAt: '2026-05-21 16:35:02',
    rejectReason: '',
  },
  {
    id: 4,
    username: 'UI',
    userId: '3180664521199420634',
    initiator: 'ruby',
    initiatorId: '76',
    appliedAt: '2026-05-20 11:22:18',
    amount: -88,
    currency: 'KKV',
    method: '减币',
    turnover: -50,
    reason: '222',
    auditStatus: 'approved',
    auditorId: '92',
    auditorName: '审核员B',
    auditedAt: '2026-05-20 11:25:00',
    rejectReason: '',
  },
  {
    id: 5,
    username: '南岸听风',
    userId: '3180664521199420999',
    initiator: 'admin01',
    initiatorId: '12',
    appliedAt: '2026-05-19 09:15:33',
    amount: -300,
    currency: 'KKC',
    method: '充值减分',
    turnover: -300,
    reason: '送的',
    auditStatus: 'approved',
    auditorId: '88',
    auditorName: '审核员A',
    auditedAt: '2026-05-19 09:18:44',
    rejectReason: '',
  },
  {
    id: 6,
    username: 'feature',
    userId: '3180664521199420640',
    initiator: 'Wade',
    initiatorId: '103',
    appliedAt: '2026-05-18 14:02:11',
    amount: 120,
    currency: 'KKC',
    method: '加币',
    turnover: 120,
    reason: '补发活动金',
    auditStatus: 'pending',
    auditorId: '',
    auditorName: '',
    auditedAt: '',
    rejectReason: '',
  },
  {
    id: 7,
    username: 'Vicky02',
    userId: '3180664521199420641',
    initiator: 'COKE',
    initiatorId: '90',
    appliedAt: '2026-05-17 10:05:00',
    amount: -50,
    currency: 'KKV',
    method: '减币',
    turnover: -50,
    reason: '违规扣减',
    auditStatus: 'rejected',
    auditorId: '92',
    auditorName: '审核员B',
    auditedAt: '2026-05-17 10:12:33',
    rejectReason: '风控规则命中，不予通过',
  },
])

function inRange(timeStr: string, start: string, end: string) {
  if (!timeStr) return !start && !end
  const t = new Date(timeStr.replace(' ', 'T')).getTime()
  if (start && t < new Date(start).getTime()) return false
  if (end && t > new Date(end + 'T23:59:59').getTime()) return false
  return true
}

function matchRow(row: AuditRow) {
  const f = filter.value
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.initiatorId && !row.initiatorId.includes(f.initiatorId.trim())) return false
  if (f.auditorId && !row.auditorId.includes(f.auditorId.trim())) return false
  if (f.auditStatus && row.auditStatus !== f.auditStatus) return false
  if (f.method && row.method !== f.method) return false
  if (f.currency && row.currency !== currencyLabel(f.currency)) return false
  if (!inRange(row.appliedAt, f.appliedStart, f.appliedEnd)) return false
  if (!inRange(row.auditedAt, f.auditStart, f.auditEnd)) return false
  return true
}

const auditRows = computed(() => auditSource.value.filter(matchRow))

function resetFilter() {
  filter.value = {
    userId: '',
    initiatorId: '',
    appliedStart: '',
    appliedEnd: '',
    auditStatus: '',
    auditorId: '',
    auditStart: '',
    auditEnd: '',
    method: '',
    currency: '',
  }
}

function formatAmount(row: AuditRow) {
  const sign = row.amount >= 0 ? '+' : ''
  return `${sign}${row.amount} ${row.currency}`
}

function formatOptionalText(value: string) {
  return value.trim() ? value : '—'
}

function formatRejectReason(row: AuditRow) {
  if (row.auditStatus !== 'rejected') return '—'
  return formatOptionalText(row.rejectReason)
}

const detailVisible = ref(false)
const detailRow = ref<AuditRow | null>(null)

function openDetail(row: AuditRow) {
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
</script>

<template>
  <div class="pc-wireframe-page">
    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">发起人ID：</label>
        <input v-model="filter.initiatorId" type="text" class="wf-input" placeholder="请输入发起人ID" />

        <label class="wf-label">发起时间：</label>
        <input v-model="filter.appliedStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.appliedEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">审核状态：</label>
        <select v-model="filter.auditStatus" class="wf-input wf-input--select">
          <option v-for="opt in auditStatusOptions" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">审核人ID：</label>
        <input v-model="filter.auditorId" type="text" class="wf-input" placeholder="请输入审核人ID" />

        <label class="wf-label">审核时间：</label>
        <input v-model="filter.auditStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.auditEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label wf-label--with-spec">
          账变方式：
          <WfAccountChangeMethodAnnot context="filter" />
        </label>
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

        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--account-change wf-table--audit">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th wf-th--user">用户</th>
              <th class="wf-th wf-th--user-id">用户ID</th>
              <th class="wf-th">发起人</th>
              <th class="wf-th wf-th--initiator-id">发起人ID</th>
              <th class="wf-th wf-th--time">发起时间</th>
              <th class="wf-th wf-th--amount">账变金额</th>
              <th class="wf-th wf-th--method wf-th--with-spec">
                账变方式
                <WfAccountChangeMethodAnnot context="table" placement="bottom" />
              </th>
              <th class="wf-th wf-th--turnover wf-th--with-spec">
                {{ WITHDRAW_TURNOVER_LABEL }}
                <WfWithdrawTurnoverAnnot context="table" placement="bottom" />
              </th>
              <th class="wf-th">账变原因</th>
              <th class="wf-th wf-th--status">审核状态</th>
              <th class="wf-th wf-th--auditor">审核人</th>
              <th class="wf-th wf-th--auditor-id">审核人ID</th>
              <th class="wf-th wf-th--time">审核时间</th>
              <th class="wf-th wf-th--reject">驳回理由</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in auditRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--user">{{ row.username }}</td>
              <td class="wf-td wf-td--user-id">{{ row.userId }}</td>
              <td class="wf-td">{{ row.initiator }}</td>
              <td class="wf-td wf-td--initiator-id">{{ row.initiatorId }}</td>
              <td class="wf-td wf-td--time">{{ row.appliedAt }}</td>
              <td
                class="wf-td wf-td--amount"
                :class="row.amount >= 0 ? 'wf-amount--positive' : 'wf-amount--negative'"
              >
                {{ formatAmount(row) }}
              </td>
              <td class="wf-td wf-td--method">{{ row.method }}</td>
              <td
                class="wf-td wf-td--center wf-td--turnover"
                :class="signedNumberClass(row.turnover)"
              >
                {{ formatSignedNumber(row.turnover) }}
              </td>
              <td class="wf-td">{{ row.reason }}</td>
              <td class="wf-td wf-td--status">{{ auditStatusLabel(row.auditStatus) }}</td>
              <td class="wf-td wf-td--auditor">{{ formatOptionalText(row.auditorName) }}</td>
              <td class="wf-td wf-td--auditor-id">{{ formatOptionalText(row.auditorId) }}</td>
              <td class="wf-td wf-td--time">{{ formatOptionalText(row.auditedAt) }}</td>
              <td class="wf-td wf-td--reject">{{ formatRejectReason(row) }}</td>
              <td class="wf-td wf-td--center">
                <button type="button" class="wf-link-action" @click="openDetail(row)">查看详情</button>
              </td>
            </tr>
            <tr v-if="auditRows.length === 0">
              <td colspan="16" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>

    <Teleport to="body">
      <div
        v-if="detailVisible && detailRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeDetail"
      >
        <div class="wf-modal wf-modal--detail" role="dialog" aria-labelledby="audit-detail-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="audit-detail-title" class="wf-modal__title">账变审核详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDetail">×</button>
          </div>
          <div class="wf-modal__body">
            <dl class="wf-detail-list">
              <div class="wf-detail-list__row">
                <dt>用户</dt>
                <dd>{{ detailRow.username }}（{{ detailRow.userId }}）</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>发起人</dt>
                <dd>{{ detailRow.initiator }}（ID: {{ detailRow.initiatorId }}）</dd>
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
                <dt class="wf-detail-list__term--with-spec">
                  {{ WITHDRAW_TURNOVER_LABEL }}
                  <WfWithdrawTurnoverAnnot context="detail" placement="bottom" />
                </dt>
                <dd :class="signedNumberClass(detailRow.turnover)">
                  {{ formatSignedNumber(detailRow.turnover) }}
                </dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>账变原因</dt>
                <dd>{{ detailRow.reason }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>发起时间</dt>
                <dd>{{ detailRow.appliedAt }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>审核状态</dt>
                <dd>{{ auditStatusLabel(detailRow.auditStatus) }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>审核人</dt>
                <dd>
                  {{
                    detailRow.auditorName
                      ? `${detailRow.auditorName}（ID: ${detailRow.auditorId}）`
                      : '—'
                  }}
                </dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>审核时间</dt>
                <dd>{{ formatOptionalText(detailRow.auditedAt) }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>驳回理由</dt>
                <dd>{{ formatRejectReason(detailRow) }}</dd>
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
