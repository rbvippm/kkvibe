<script setup lang="ts">
import { computed, ref } from 'vue'
import WfAccountChangeCurrencyAnnot from '../../components/wireframe/WfAccountChangeCurrencyAnnot.vue'
import WfAccountChangeMethodAnnot from '../../components/wireframe/WfAccountChangeMethodAnnot.vue'
import WfWithdrawTurnoverAnnot from '../../components/wireframe/WfWithdrawTurnoverAnnot.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { WITHDRAW_TURNOVER_LABEL } from '../../constants/withdrawTurnover'
import {
  ACCOUNT_CHANGE_CURRENCY_OPTIONS,
  accountChangeCurrencyLabel,
} from '../../constants/accountChangeCurrency'
import {
  ACCOUNT_CHANGE_METHODS,
  countsRechargeData,
  isSubtractMethod,
  type AccountChangeMethod,
} from '../../constants/accountChangeMethod'
import '../../styles/pc-wireframe.css'
import { formatSignedNumber, signedNumberClass } from '../../utils/formatSignedNumber'

type ChangeMethod = AccountChangeMethod

type ReviewStatus = 'pending' | 'approved' | 'rejected'

type ChangeStatus = 'success' | 'processing' | 'failed'

function changeStatusLabel(status: ChangeStatus) {
  const map: Record<ChangeStatus, string> = {
    success: '账变成功',
    processing: '处理中',
    failed: '账变失败',
  }
  return map[status]
}

function formatArrivedAt(value: string) {
  return value.trim() ? value : '—'
}

function reviewStatusLabel(status: ReviewStatus) {
  const map: Record<ReviewStatus, string> = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝',
  }
  return map[status]
}

function formatRejectReason(reason: string) {
  return reason.trim() ? reason : '—'
}

const CURRENCY_OPTIONS = ACCOUNT_CHANGE_CURRENCY_OPTIONS

const reviewStatusOptions = [
  { value: '', label: '请选择' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '审核拒绝' },
]

type ManageRow = {
  id: number
  username: string
  userId: string
  amount: number
  currency: string
  method: ChangeMethod
  turnover: number
  initiator: string
  initiatorId: string
  appliedAt: string
  arrivedAt: string
  changeStatus: ChangeStatus
  reason: string
  riskAuditStatus: ReviewStatus
  riskRejectReason: string
  financeAuditStatus: ReviewStatus
  financeRejectReason: string
}

const filter = ref({
  userId: '',
  initiatorId: '',
  appliedStart: '',
  appliedEnd: '',
  riskAudit: '' as '' | ReviewStatus,
  financeAudit: '' as '' | ReviewStatus,
  method: '' as '' | ChangeMethod,
  currency: '',
})

function currencyLabel(value: string) {
  return accountChangeCurrencyLabel(value)
}

const manageSource = ref<ManageRow[]>([
  {
    id: 1,
    username: 'dx01',
    userId: '3180664521199420635',
    amount: 500,
    currency: 'USDT(TRON)',
    method: '充值加币',
    turnover: 500,
    initiator: 'ruby',
    initiatorId: '76',
    appliedAt: '2026-05-22 20:05:15',
    arrivedAt: '2026-05-22 20:05:18',
    changeStatus: 'success',
    reason: '1',
    riskAuditStatus: 'approved',
    riskRejectReason: '',
    financeAuditStatus: 'approved',
    financeRejectReason: '',
  },
  {
    id: 2,
    username: 'wade',
    userId: '3180664521199420636',
    amount: 1000,
    currency: 'KKC',
    method: '充值加币',
    turnover: 1000,
    initiator: 'Wade',
    initiatorId: '103',
    appliedAt: '2026-05-22 19:48:02',
    arrivedAt: '2026-05-22 19:48:05',
    changeStatus: 'success',
    reason: '11',
    riskAuditStatus: 'approved',
    riskRejectReason: '',
    financeAuditStatus: 'approved',
    financeRejectReason: '',
  },
  {
    id: 3,
    username: 'qx1',
    userId: '3180664521199420637',
    amount: 200,
    currency: 'USDT(TRON)',
    method: '人工加分',
    turnover: 0,
    initiator: 'COKE',
    initiatorId: '90',
    appliedAt: '2026-05-21 16:30:44',
    arrivedAt: '2026-05-21 16:30:50',
    changeStatus: 'success',
    reason: '测',
    riskAuditStatus: 'approved',
    riskRejectReason: '',
    financeAuditStatus: 'approved',
    financeRejectReason: '',
  },
  {
    id: 4,
    username: 'UI',
    userId: '3180664521199420634',
    amount: -88,
    currency: 'KKV',
    method: '人工减分',
    turnover: -50,
    initiator: 'ruby',
    initiatorId: '76',
    appliedAt: '2026-05-20 11:22:18',
    arrivedAt: '2026-05-20 11:22:20',
    changeStatus: 'success',
    reason: '222',
    riskAuditStatus: 'approved',
    riskRejectReason: '',
    financeAuditStatus: 'approved',
    financeRejectReason: '',
  },
  {
    id: 5,
    username: '南岸听风',
    userId: '3180664521199420999',
    amount: -300,
    currency: 'KKC',
    method: '充值减币',
    turnover: -300,
    initiator: 'admin01',
    initiatorId: '12',
    appliedAt: '2026-05-19 09:15:33',
    arrivedAt: '2026-05-19 09:15:40',
    changeStatus: 'success',
    reason: '送的',
    riskAuditStatus: 'approved',
    riskRejectReason: '',
    financeAuditStatus: 'approved',
    financeRejectReason: '',
  },
  {
    id: 6,
    username: 'feature',
    userId: '3180664521199420640',
    amount: 120,
    currency: 'KKC',
    method: '人工加分',
    turnover: 120,
    initiator: 'Wade',
    initiatorId: '103',
    appliedAt: '2026-05-18 14:02:11',
    arrivedAt: '',
    changeStatus: 'processing',
    reason: '补发活动金',
    riskAuditStatus: 'pending',
    riskRejectReason: '',
    financeAuditStatus: 'pending',
    financeRejectReason: '',
  },
  {
    id: 7,
    username: 'Vicky02',
    userId: '3180664521199420639',
    amount: -50,
    currency: 'KKV',
    method: '人工减分',
    turnover: -50,
    initiator: 'COKE',
    initiatorId: '90',
    appliedAt: '2026-05-17 10:05:00',
    arrivedAt: '',
    changeStatus: 'failed',
    reason: '违规扣减',
    riskAuditStatus: 'rejected',
    riskRejectReason: '风控规则命中',
    financeAuditStatus: 'pending',
    financeRejectReason: '',
  },
  {
    id: 8,
    username: 'dx01',
    userId: '3180664521199420635',
    amount: 66,
    currency: 'KKC',
    method: '充值减币',
    turnover: -66,
    initiator: 'ruby',
    initiatorId: '76',
    appliedAt: '2026-05-16 08:30:22',
    arrivedAt: '2026-05-16 08:30:25',
    changeStatus: 'success',
    reason: '调整',
    riskAuditStatus: 'approved',
    riskRejectReason: '',
    financeAuditStatus: 'rejected',
    financeRejectReason: '财务复核不通过',
  },
])

function inRange(timeStr: string, start: string, end: string) {
  if (!timeStr) return !start && !end
  const t = new Date(timeStr.replace(' ', 'T')).getTime()
  if (start && t < new Date(start).getTime()) return false
  if (end && t > new Date(end + 'T23:59:59').getTime()) return false
  return true
}

function matchRow(row: ManageRow) {
  const f = filter.value
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.initiatorId && !row.initiatorId.includes(f.initiatorId.trim())) return false
  if (f.riskAudit && row.riskAuditStatus !== f.riskAudit) return false
  if (f.financeAudit && row.financeAuditStatus !== f.financeAudit) return false
  if (f.method && row.method !== f.method) return false
  if (f.currency && row.currency !== currencyLabel(f.currency)) return false
  if (!inRange(row.appliedAt, f.appliedStart, f.appliedEnd)) return false
  return true
}

const manageRows = computed(() => manageSource.value.filter(matchRow))

function resetFilter() {
  filter.value = {
    userId: '',
    initiatorId: '',
    appliedStart: '',
    appliedEnd: '',
    riskAudit: '',
    financeAudit: '',
    method: '',
    currency: '',
  }
}

function formatAmount(row: ManageRow) {
  const sign = row.amount >= 0 ? '+' : ''
  return `${sign}${row.amount} ${row.currency}`
}

/* ---------- 发起账变 ---------- */
type QueriedUser = {
  username: string
  userId: string
  kingKongId: string
  usdtTron: string
  kkc: string
  kkv: string
}

const MOCK_USER_DIRECTORY: Record<string, QueriedUser> = {
  '3180664521199420635': {
    username: 'dx01',
    userId: '3180664521199420635',
    kingKongId: 'mid_cetnv5zckq9',
    usdtTron: '3,450.00',
    kkc: '52,600.00',
    kkv: '890.00',
  },
  '3180664521199420634': {
    username: 'UI',
    userId: '3180664521199420634',
    kingKongId: 'KK100886',
    usdtTron: '1,280.50',
    kkc: '8,200.00',
    kkv: '0.00',
  },
}

const initiateModalVisible = ref(false)
const initiateQueryId = ref('')
const initiateQueried = ref<QueriedUser | null>(null)
const initiateQuerying = ref(false)
const initiateQueryHint = ref('')
const initiateMethod = ref<ChangeMethod | ''>('')
const initiateCurrency = ref('')
const initiateAmount = ref('')
const initiateTurnover = ref('')
const initiateReason = ref('')

const methodNotice = computed(() => {
  if (!initiateMethod.value) {
    return '充值加币、充值减币计入充值数据；人工加分、人工减分不加入充值数据。'
  }
  if (countsRechargeData(initiateMethod.value)) {
    return `当前方式「${initiateMethod.value}」将计入充值数据统计。`
  }
  return `当前方式「${initiateMethod.value}」不加入充值数据统计。`
})

function resetInitiateModal() {
  initiateQueryId.value = ''
  initiateQueried.value = null
  initiateQuerying.value = false
  initiateQueryHint.value = ''
  initiateMethod.value = ''
  initiateCurrency.value = ''
  initiateAmount.value = ''
  initiateTurnover.value = ''
  initiateReason.value = ''
}

function openInitiateModal() {
  resetInitiateModal()
  initiateModalVisible.value = true
}

function closeInitiateModal() {
  initiateModalVisible.value = false
  resetInitiateModal()
}

async function queryInitiateUser() {
  const id = initiateQueryId.value.trim()
  initiateQueryHint.value = ''
  initiateQueried.value = null
  if (!id) {
    initiateQueryHint.value = '请输入用户 ID'
    return
  }
  initiateQuerying.value = true
  await new Promise((r) => setTimeout(r, 350))
  initiateQuerying.value = false
  const found = MOCK_USER_DIRECTORY[id]
  if (!found) {
    initiateQueryHint.value = '未查询到该用户'
    return
  }
  initiateQueried.value = { ...found }
}

function removeInitiateQueried() {
  initiateQueried.value = null
}

function parseSignedNumber(raw: string) {
  const v = raw.trim()
  if (v === '' || v === '-' || v === '+') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function confirmInitiate() {
  if (!initiateQueried.value) {
    initiateQueryHint.value = '请先查询用户'
    return
  }
  if (!initiateMethod.value) {
    initiateQueryHint.value = '请选择账变方式'
    return
  }
  if (!initiateCurrency.value) {
    initiateQueryHint.value = '请选择账变币种'
    return
  }
  const amount = parseSignedNumber(initiateAmount.value)
  if (amount === null || amount === 0) {
    initiateQueryHint.value = '请输入有效账变金额'
    return
  }
  const turnover = parseSignedNumber(initiateTurnover.value)
  if (initiateTurnover.value.trim() !== '' && turnover === null) {
    initiateQueryHint.value = `${WITHDRAW_TURNOVER_LABEL}格式不正确，可输入负数`
    return
  }
  if (!initiateReason.value.trim()) {
    initiateQueryHint.value = '请输入账变理由'
    return
  }

  const currency = currencyLabel(initiateCurrency.value)
  const signedAmount = isSubtractMethod(initiateMethod.value) ? -Math.abs(amount) : Math.abs(amount)
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  manageSource.value.unshift({
    id: Date.now(),
    username: initiateQueried.value.username,
    userId: initiateQueried.value.userId,
    amount: signedAmount,
    currency,
    method: initiateMethod.value,
    turnover: turnover ?? 0,
    initiator: '当前管理员',
    initiatorId: '1',
    appliedAt: now,
    arrivedAt: '',
    changeStatus: 'processing',
    reason: initiateReason.value.trim(),
    riskAuditStatus: 'pending',
    riskRejectReason: '',
    financeAuditStatus: 'pending',
    financeRejectReason: '',
  })

  closeInitiateModal()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

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
        <label class="wf-label">风控审核状态：</label>
        <select v-model="filter.riskAudit" class="wf-input wf-input--select">
          <option v-for="opt in reviewStatusOptions" :key="'r-' + (opt.value || 'all')" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">财务审核状态：</label>
        <select v-model="filter.financeAudit" class="wf-input wf-input--select">
          <option v-for="opt in reviewStatusOptions" :key="'f-' + (opt.value || 'all')" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

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

        <label class="wf-label wf-label--with-spec">
          币种类型：
          <WfAccountChangeCurrencyAnnot context="filter" />
        </label>
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
          <button type="button" class="wf-btn wf-btn--add" @click="openInitiateModal">发起账变</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--account-change wf-table--manage">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th wf-th--user">用户</th>
              <th class="wf-th wf-th--user-id">用户ID</th>
              <th class="wf-th wf-th--amount">账变金额</th>
              <th class="wf-th wf-th--method wf-th--with-spec">
                账变方式
                <WfAccountChangeMethodAnnot context="table" placement="bottom" />
              </th>
              <th class="wf-th wf-th--turnover wf-th--with-spec">
                {{ WITHDRAW_TURNOVER_LABEL }}
                <WfWithdrawTurnoverAnnot context="table" placement="bottom" />
              </th>
              <th class="wf-th">发起人</th>
              <th class="wf-th wf-th--initiator-id">发起人ID</th>
              <th class="wf-th wf-th--time">发起时间</th>
              <th class="wf-th wf-th--time">到账时间</th>
              <th class="wf-th wf-th--status">账变状态</th>
              <th class="wf-th">账变理由</th>
              <th class="wf-th wf-th--audit">风控审核状态</th>
              <th class="wf-th wf-th--reject">风控驳回理由</th>
              <th class="wf-th wf-th--audit">财务审核状态</th>
              <th class="wf-th wf-th--reject">财务驳回理由</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in manageRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--user">{{ row.username }}</td>
              <td class="wf-td wf-td--user-id">{{ row.userId }}</td>
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
              <td class="wf-td">{{ row.initiator }}</td>
              <td class="wf-td wf-td--initiator-id">{{ row.initiatorId }}</td>
              <td class="wf-td wf-td--time">{{ row.appliedAt }}</td>
              <td class="wf-td wf-td--time">{{ formatArrivedAt(row.arrivedAt) }}</td>
              <td class="wf-td wf-td--status">{{ changeStatusLabel(row.changeStatus) }}</td>
              <td class="wf-td">{{ row.reason }}</td>
              <td class="wf-td wf-td--audit">{{ reviewStatusLabel(row.riskAuditStatus) }}</td>
              <td class="wf-td wf-td--reject">{{ formatRejectReason(row.riskRejectReason) }}</td>
              <td class="wf-td wf-td--audit">{{ reviewStatusLabel(row.financeAuditStatus) }}</td>
              <td class="wf-td wf-td--reject">{{ formatRejectReason(row.financeRejectReason) }}</td>
            </tr>
            <tr v-if="manageRows.length === 0">
              <td colspan="16" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>

    <Teleport to="body">
      <div
        v-if="initiateModalVisible"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeInitiateModal"
      >
        <div
          class="wf-modal wf-modal--account-change"
          role="dialog"
          aria-labelledby="initiate-change-title"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3 id="initiate-change-title" class="wf-modal__title">发起账变</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeInitiateModal">×</button>
          </div>
          <div class="wf-modal__body">
            <div class="wf-modal__query">
              <input
                v-model="initiateQueryId"
                type="text"
                class="wf-input wf-input--grow"
                placeholder="请输入用户ID"
                @keyup.enter="queryInitiateUser"
              />
              <button
                type="button"
                class="wf-btn wf-btn--primary"
                :disabled="initiateQuerying"
                @click="queryInitiateUser"
              >
                {{ initiateQuerying ? '搜索中…' : '搜索' }}
              </button>
            </div>
            <p v-if="initiateQueryHint" class="wf-modal__hint">{{ initiateQueryHint }}</p>

            <table class="wf-table wf-table--modal">
              <thead>
                <tr>
                  <th class="wf-th">用户名</th>
                  <th class="wf-th">用户ID</th>
                  <th class="wf-th">金刚号</th>
                  <th class="wf-th">USDT(TRON)余额</th>
                  <th class="wf-th">KKC余额</th>
                  <th class="wf-th">KKV余额</th>
                  <th class="wf-th wf-th--op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="initiateQueried">
                  <td class="wf-td">{{ initiateQueried.username }}</td>
                  <td class="wf-td">{{ initiateQueried.userId }}</td>
                  <td class="wf-td">{{ initiateQueried.kingKongId }}</td>
                  <td class="wf-td">{{ initiateQueried.usdtTron }}</td>
                  <td class="wf-td">{{ initiateQueried.kkc }}</td>
                  <td class="wf-td">{{ initiateQueried.kkv }}</td>
                  <td class="wf-td wf-td--center">
                    <button type="button" class="wf-link-del" @click="removeInitiateQueried">移除</button>
                  </td>
                </tr>
                <tr v-else>
                  <td colspan="7" class="wf-td wf-td--empty">
                    暂无数据，可先搜索用户（演示 ID：3180664521199420635）
                  </td>
                </tr>
              </tbody>
            </table>

            <form class="wf-modal__form" @submit.prevent="confirmInitiate">
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">账变方式</label>
                <div>
                  <div class="wf-form-row__field-head">
                    <select v-model="initiateMethod" class="wf-select wf-select--full">
                      <option value="">请选择</option>
                      <option v-for="m in ACCOUNT_CHANGE_METHODS" :key="m" :value="m">
                        {{ m }}
                      </option>
                    </select>
                    <WfAccountChangeMethodAnnot context="form" />
                  </div>
                  <p class="wf-form-row__hint">{{ methodNotice }}</p>
                </div>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">账变币种</label>
                <select v-model="initiateCurrency" class="wf-select wf-select--full">
                  <option v-for="opt in CURRENCY_OPTIONS" :key="opt.value || 'empty'" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">账变金额</label>
                <input
                  v-model="initiateAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="wf-input wf-input--full"
                  placeholder="请输入账变金额"
                />
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label">{{ WITHDRAW_TURNOVER_LABEL }}</label>
                <div class="wf-form-row__field-head">
                  <input
                    v-model="initiateTurnover"
                    type="number"
                    step="0.01"
                    class="wf-input wf-input--full"
                    :placeholder="`请输入${WITHDRAW_TURNOVER_LABEL}，负数为扣减`"
                  />
                  <WfWithdrawTurnoverAnnot context="form" />
                </div>
              </div>
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required">账变理由</label>
                <input
                  v-model="initiateReason"
                  type="text"
                  class="wf-input wf-input--full"
                  placeholder="请输入账变理由"
                />
              </div>
            </form>
          </div>
          <div class="wf-modal__footer wf-modal__footer--center">
            <button type="button" class="wf-btn wf-btn--primary wf-btn--lg" @click="confirmInitiate">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
