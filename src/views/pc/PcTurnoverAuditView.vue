<script setup lang="ts">
import { computed, ref } from 'vue'
import WfWithdrawTurnoverAnnot from '../../components/wireframe/WfWithdrawTurnoverAnnot.vue'
import { WITHDRAW_TURNOVER_LABEL } from '../../constants/withdrawTurnover'
import '../../styles/pc-wireframe.css'
import { formatSignedNumber, signedNumberClass } from '../../utils/formatSignedNumber'

type AuditStatus = 'pending' | 'approved' | 'rejected'

function auditStatusLabel(status: AuditStatus) {
  const map: Record<AuditStatus, string> = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝',
  }
  return map[status]
}

const auditStatusOptions = [
  { value: '', label: '请选择' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '审核拒绝' },
]

type TurnoverAuditRow = {
  id: number
  flowNo: string
  username: string
  userId: string
  turnover: number
  currency: string
  relatedBillNo: string
  reason: string
  initiator: string
  initiatorId: string
  appliedAt: string
  auditStatus: AuditStatus
  auditorId: string
  auditorName: string
  auditedAt: string
  rejectReason: string
}

const filter = ref({
  flowNo: '',
  userId: '',
  relatedBillNo: '',
  auditStatus: '' as '' | AuditStatus,
  appliedStart: '',
  appliedEnd: '',
  auditorId: '',
  auditStart: '',
  auditEnd: '',
})

const auditSource = ref<TurnoverAuditRow[]>([
  {
    id: 1,
    flowNo: 'LS202605220001',
    username: 'dx01',
    userId: '2673875810693327909',
    turnover: 500,
    currency: 'USDT(TRON)',
    relatedBillNo: 'AC202605220015',
    reason: '充值加币同步增加提现流水',
    initiator: 'ruby',
    initiatorId: '76',
    appliedAt: '2026-05-22 20:05:15',
    auditStatus: 'approved',
    auditorId: '88',
    auditorName: '风控A',
    auditedAt: '2026-05-22 20:08:30',
    rejectReason: '',
  },
  {
    id: 2,
    flowNo: 'LS202605210002',
    username: 'qx1',
    userId: '2673875810693327911',
    turnover: -120,
    currency: 'KKC',
    relatedBillNo: 'AC202605210008',
    reason: '人工减分扣减提现流水',
    initiator: 'COKE',
    initiatorId: '90',
    appliedAt: '2026-05-21 16:30:44',
    auditStatus: 'approved',
    auditorId: '92',
    auditorName: '风控B',
    auditedAt: '2026-05-21 16:35:02',
    rejectReason: '',
  },
  {
    id: 3,
    flowNo: 'LS202605180003',
    username: 'feature',
    userId: '3180664521199420640',
    turnover: 120,
    currency: 'KKC',
    relatedBillNo: 'AC202605180003',
    reason: '活动补发提现流水',
    initiator: 'Wade',
    initiatorId: '103',
    appliedAt: '2026-05-18 14:02:11',
    auditStatus: 'pending',
    auditorId: '',
    auditorName: '',
    auditedAt: '',
    rejectReason: '',
  },
  {
    id: 4,
    flowNo: 'LS202605170004',
    username: 'Vicky02',
    userId: '3180664521199420641',
    turnover: -50,
    currency: 'KKV',
    relatedBillNo: 'AC202605170002',
    reason: '违规扣减提现流水',
    initiator: 'COKE',
    initiatorId: '90',
    appliedAt: '2026-05-17 10:05:00',
    auditStatus: 'rejected',
    auditorId: '92',
    auditorName: '风控B',
    auditedAt: '2026-05-17 10:12:33',
    rejectReason: '流水变动与账变理由不一致',
  },
  {
    id: 5,
    flowNo: 'LS202605160005',
    username: 'UI',
    userId: '3180664521199420634',
    turnover: 880,
    currency: 'KKV',
    relatedBillNo: '—',
    reason: '独立申请增加提现流水（无关联账变）',
    initiator: 'admin01',
    initiatorId: '12',
    appliedAt: '2026-05-16 09:20:00',
    auditStatus: 'pending',
    auditorId: '',
    auditorName: '',
    auditedAt: '',
    rejectReason: '',
  },
])

function inRange(timeStr: string, start: string, end: string) {
  if (!timeStr) return !start && !end
  const t = new Date(timeStr.replace(' ', 'T')).getTime()
  if (start && t < new Date(start).getTime()) return false
  if (end && t > new Date(end + 'T23:59:59').getTime()) return false
  return true
}

function matchRow(row: TurnoverAuditRow) {
  const f = filter.value
  if (f.flowNo && !row.flowNo.includes(f.flowNo.trim())) return false
  if (f.userId && !row.userId.includes(f.userId.trim())) return false
  if (f.relatedBillNo && !row.relatedBillNo.includes(f.relatedBillNo.trim())) return false
  if (f.auditorId && !row.auditorId.includes(f.auditorId.trim())) return false
  if (f.auditStatus && row.auditStatus !== f.auditStatus) return false
  if (!inRange(row.appliedAt, f.appliedStart, f.appliedEnd)) return false
  if (!inRange(row.auditedAt, f.auditStart, f.auditEnd)) return false
  return true
}

const auditRows = computed(() => auditSource.value.filter(matchRow))

function resetFilter() {
  filter.value = {
    flowNo: '',
    userId: '',
    relatedBillNo: '',
    auditStatus: '',
    appliedStart: '',
    appliedEnd: '',
    auditorId: '',
    auditStart: '',
    auditEnd: '',
  }
}

function formatOptionalText(value: string) {
  return value.trim() ? value : '—'
}

function formatRejectReason(row: TurnoverAuditRow) {
  if (row.auditStatus !== 'rejected') return '—'
  return formatOptionalText(row.rejectReason)
}

function formatTurnoverCell(row: TurnoverAuditRow) {
  return `${formatSignedNumber(row.turnover)} ${row.currency}`
}

const detailVisible = ref(false)
const detailRow = ref<TurnoverAuditRow | null>(null)

const auditModalVisible = ref(false)
const auditTarget = ref<TurnoverAuditRow | null>(null)
const auditRejectReason = ref('')
const auditHint = ref('')

function openDetail(row: TurnoverAuditRow) {
  detailRow.value = row
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  detailRow.value = null
}

function openAudit(row: TurnoverAuditRow) {
  if (row.auditStatus !== 'pending') return
  auditTarget.value = row
  auditRejectReason.value = ''
  auditHint.value = ''
  auditModalVisible.value = true
}

function closeAuditModal() {
  auditModalVisible.value = false
  auditTarget.value = null
  auditRejectReason.value = ''
  auditHint.value = ''
}

function submitAudit(decision: 'approved' | 'rejected') {
  const row = auditTarget.value
  if (!row) return
  if (decision === 'rejected' && !auditRejectReason.value.trim()) {
    auditHint.value = '驳回时请填写理由'
    return
  }
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  row.auditStatus = decision
  row.auditorId = '1'
  row.auditorName = '当前审核员'
  row.auditedAt = now
  row.rejectReason = decision === 'rejected' ? auditRejectReason.value.trim() : ''
  closeAuditModal()
  if (detailRow.value?.id === row.id) {
    detailRow.value = { ...row }
  }
}
</script>

<template>
  <div class="pc-wireframe-page">
    <div class="wf-top">
      <div class="wf-notice">
        <span class="wf-notice-label">流水审核说明：</span>
        本页为风控侧对{{ WITHDRAW_TURNOVER_LABEL }}变动申请的审核，与账变审核独立；待审记录请通过操作列「审核」处理。
      </div>
    </div>

    <section class="wf-block">
      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">流水单号：</label>
        <input v-model="filter.flowNo" type="text" class="wf-input" placeholder="请输入流水单号" />

        <label class="wf-label">用户ID：</label>
        <input v-model="filter.userId" type="text" class="wf-input" placeholder="请输入用户ID" />

        <label class="wf-label">关联账变单号：</label>
        <input v-model="filter.relatedBillNo" type="text" class="wf-input" placeholder="请输入关联账变单号" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">审核状态：</label>
        <select v-model="filter.auditStatus" class="wf-input wf-input--select">
          <option v-for="opt in auditStatusOptions" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <label class="wf-label">发起时间：</label>
        <input v-model="filter.appliedStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.appliedEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">审核人ID：</label>
        <input v-model="filter.auditorId" type="text" class="wf-input" placeholder="请输入审核人ID" />

        <label class="wf-label">审核时间：</label>
        <input v-model="filter.auditStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">-</span>
        <input v-model="filter.auditEnd" type="date" class="wf-input wf-input--date" />

        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--primary">搜索</button>
          <button type="button" class="wf-btn wf-btn--default" @click="resetFilter">重置</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--account-change wf-table--turnover-audit">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th wf-th--bill">流水单号</th>
              <th class="wf-th wf-th--user">用户</th>
              <th class="wf-th wf-th--user-id">用户ID</th>
              <th class="wf-th wf-th--turnover wf-th--with-spec">
                {{ WITHDRAW_TURNOVER_LABEL }}
                <WfWithdrawTurnoverAnnot context="audit" placement="bottom" />
              </th>
              <th class="wf-th wf-th--bill">关联账变单号</th>
              <th class="wf-th">申请说明</th>
              <th class="wf-th">发起人</th>
              <th class="wf-th wf-th--initiator-id">发起人ID</th>
              <th class="wf-th wf-th--time">发起时间</th>
              <th class="wf-th wf-th--status">审核状态</th>
              <th class="wf-th wf-th--auditor">审核人</th>
              <th class="wf-th wf-th--time">审核时间</th>
              <th class="wf-th wf-th--reject">驳回理由</th>
              <th class="wf-th wf-th--op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in auditRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td wf-td--bill">{{ row.flowNo }}</td>
              <td class="wf-td wf-td--user">{{ row.username }}</td>
              <td class="wf-td wf-td--user-id">{{ row.userId }}</td>
              <td
                class="wf-td wf-td--center wf-td--turnover"
                :class="signedNumberClass(row.turnover)"
              >
                {{ formatTurnoverCell(row) }}
              </td>
              <td class="wf-td wf-td--bill">{{ row.relatedBillNo }}</td>
              <td class="wf-td">{{ row.reason }}</td>
              <td class="wf-td">{{ row.initiator }}</td>
              <td class="wf-td wf-td--initiator-id">{{ row.initiatorId }}</td>
              <td class="wf-td wf-td--time">{{ row.appliedAt }}</td>
              <td class="wf-td wf-td--status">{{ auditStatusLabel(row.auditStatus) }}</td>
              <td class="wf-td wf-td--auditor">{{ formatOptionalText(row.auditorName) }}</td>
              <td class="wf-td wf-td--time">{{ formatOptionalText(row.auditedAt) }}</td>
              <td class="wf-td wf-td--reject">{{ formatRejectReason(row) }}</td>
              <td class="wf-td wf-td--center wf-td--actions">
                <button
                  v-if="row.auditStatus === 'pending'"
                  type="button"
                  class="wf-link-action"
                  @click="openAudit(row)"
                >
                  审核
                </button>
                <span v-if="row.auditStatus === 'pending'" class="wf-action-sep">|</span>
                <button type="button" class="wf-link-action" @click="openDetail(row)">查看详情</button>
              </td>
            </tr>
            <tr v-if="auditRows.length === 0">
              <td colspan="15" class="wf-td wf-td--empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">分页组件</div>
    </section>

    <!-- 审核 -->
    <Teleport to="body">
      <div
        v-if="auditModalVisible && auditTarget"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeAuditModal"
      >
        <div class="wf-modal wf-modal--detail" role="dialog" aria-labelledby="turnover-audit-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="turnover-audit-title" class="wf-modal__title">流水审核</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeAuditModal">×</button>
          </div>
          <div class="wf-modal__body">
            <dl class="wf-detail-list">
              <div class="wf-detail-list__row">
                <dt>流水单号</dt>
                <dd>{{ auditTarget.flowNo }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>用户</dt>
                <dd>{{ auditTarget.username }}（{{ auditTarget.userId }}）</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt class="wf-detail-list__term--with-spec">
                  {{ WITHDRAW_TURNOVER_LABEL }}
                  <WfWithdrawTurnoverAnnot context="audit" placement="bottom" />
                </dt>
                <dd :class="signedNumberClass(auditTarget.turnover)">
                  {{ formatTurnoverCell(auditTarget) }}
                </dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>申请说明</dt>
                <dd>{{ auditTarget.reason }}</dd>
              </div>
            </dl>
            <p v-if="auditHint" class="wf-modal__hint">{{ auditHint }}</p>
            <label class="wf-modal__field-label">驳回理由（驳回时必填）</label>
            <input
              v-model="auditRejectReason"
              type="text"
              class="wf-input wf-input--full"
              placeholder="请输入驳回理由"
            />
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeAuditModal">取消</button>
            <button type="button" class="wf-btn wf-btn--danger" @click="submitAudit('rejected')">驳回</button>
            <button type="button" class="wf-btn wf-btn--primary" @click="submitAudit('approved')">通过</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 详情 -->
    <Teleport to="body">
      <div
        v-if="detailVisible && detailRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeDetail"
      >
        <div class="wf-modal wf-modal--detail" role="dialog" aria-labelledby="turnover-detail-title" aria-modal="true">
          <div class="wf-modal__header">
            <h3 id="turnover-detail-title" class="wf-modal__title">流水审核详情</h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeDetail">×</button>
          </div>
          <div class="wf-modal__body">
            <dl class="wf-detail-list">
              <div class="wf-detail-list__row">
                <dt>流水单号</dt>
                <dd>{{ detailRow.flowNo }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>用户</dt>
                <dd>{{ detailRow.username }}（{{ detailRow.userId }}）</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt class="wf-detail-list__term--with-spec">
                  {{ WITHDRAW_TURNOVER_LABEL }}
                  <WfWithdrawTurnoverAnnot context="detail" placement="bottom" />
                </dt>
                <dd :class="signedNumberClass(detailRow.turnover)">
                  {{ formatTurnoverCell(detailRow) }}
                </dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>关联账变单号</dt>
                <dd>{{ detailRow.relatedBillNo }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>申请说明</dt>
                <dd>{{ detailRow.reason }}</dd>
              </div>
              <div class="wf-detail-list__row">
                <dt>发起人</dt>
                <dd>{{ detailRow.initiator }}（ID: {{ detailRow.initiatorId }}）</dd>
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
            <button
              v-if="detailRow.auditStatus === 'pending'"
              type="button"
              class="wf-btn wf-btn--primary"
              @click="closeDetail(); openAudit(detailRow)"
            >
              去审核
            </button>
            <button type="button" class="wf-btn wf-btn--default" @click="closeDetail">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
