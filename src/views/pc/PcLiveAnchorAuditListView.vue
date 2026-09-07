<script setup lang="ts">
import { computed, ref } from 'vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import WfSpecAnnot from '../../components/wireframe/WfSpecAnnot.vue'
import { showPcToast } from '../../composables/usePcToast'
import {
  ANCHOR_AUDIT_RESULT_OPTIONS,
  ANCHOR_AUDIT_STATUS_OPTIONS,
  CURRENT_ANCHOR_AUDITOR,
  anchorAuditStatusLabel,
  formatAuditChannel,
  formatAuditDash,
  formatAuditGiftShare,
  liveAnchorAuditStore,
  type AnchorAuditRow,
  type AnchorAuditStatus,
} from '../../constants/liveAnchorAudit'
import { ANCHOR_CHANNEL_PAGE_SIZE, filterAnchorChannels } from '../../constants/liveAnchorMetric'
import { LIVE_ANCHOR_AUDIT_ANNOT_MAP } from '../../constants/liveAnchorAuditSpec'
import '../../styles/pc-wireframe.css'

type ListFilter = {
  applicantId: string
  appliedStart: string
  appliedEnd: string
  auditorId: string
  auditStart: string
  auditEnd: string
  auditStatus: '' | AnchorAuditStatus
}

type AuditResult = '' | 'approved' | 'rejected'

const defaultFilter = (): ListFilter => ({
  applicantId: '',
  appliedStart: '',
  appliedEnd: '',
  auditorId: '',
  auditStart: '',
  auditEnd: '',
  auditStatus: '',
})

const filter = ref<ListFilter>(defaultFilter())
const appliedFilter = ref<ListFilter>(defaultFilter())
const modalVisible = ref(false)
const activeRow = ref<AnchorAuditRow | null>(null)
const auditResult = ref<AuditResult>('')
const auditRemark = ref('')
const auditGiftShare = ref('')
const auditChannelIds = ref<string[]>([])
const channelKeyword = ref('')
const channelAppliedKeyword = ref('')
const channelPage = ref(1)
const formHint = ref('')
const channelPickerDisabled = computed(() => auditResult.value === 'rejected')
const giftShareDisabled = computed(() => auditResult.value === 'rejected')
const channelFilteredList = computed(() => filterAnchorChannels(channelAppliedKeyword.value))
const channelTotalPages = computed(() =>
  Math.max(1, Math.ceil(channelFilteredList.value.length / ANCHOR_CHANNEL_PAGE_SIZE)),
)
const channelPageItems = computed(() => {
  const start = (channelPage.value - 1) * ANCHOR_CHANNEL_PAGE_SIZE
  return channelFilteredList.value.slice(start, start + ANCHOR_CHANNEL_PAGE_SIZE)
})
const channelPageIds = computed(() => channelPageItems.value.map((item) => item.id))
const channelSelectedCount = computed(() => auditChannelIds.value.length)
const channelPageAllSelected = computed(
  () => channelPageIds.value.length > 0 && channelPageIds.value.every((id) => auditChannelIds.value.includes(id)),
)
const channelPagePartialSelected = computed(
  () =>
    !channelPageAllSelected.value && channelPageIds.value.some((id) => auditChannelIds.value.includes(id)),
)
const channelPageNumbers = computed(() =>
  Array.from({ length: channelTotalPages.value }, (_, index) => index + 1),
)

const channelAnnot = LIVE_ANCHOR_AUDIT_ANNOT_MAP.channel

function inRange(timeStr: string, start: string, end: string) {
  if (!timeStr) return !start && !end
  const t = new Date(timeStr.replace(' ', 'T')).getTime()
  if (start && t < new Date(start).getTime()) return false
  if (end && t > new Date(`${end}T23:59:59`).getTime()) return false
  return true
}

function matchRow(row: AnchorAuditRow, f: ListFilter) {
  if (f.applicantId && !row.applicantId.includes(f.applicantId.trim())) return false
  if (f.auditorId && !row.auditorId.includes(f.auditorId.trim())) return false
  if (f.auditStatus && row.auditStatus !== f.auditStatus) return false
  if (!inRange(row.appliedAt, f.appliedStart, f.appliedEnd)) return false
  if (!inRange(row.auditedAt, f.auditStart, f.auditEnd)) return false
  return true
}

const filteredRows = computed(() =>
  liveAnchorAuditStore.value.filter((row) => matchRow(row, appliedFilter.value)),
)

function applyFilter() {
  appliedFilter.value = { ...filter.value }
}

function resetFilter() {
  filter.value = defaultFilter()
  appliedFilter.value = defaultFilter()
}

function formatRejectReason(row: AnchorAuditRow) {
  if (row.auditStatus !== 'rejected') return '-'
  return formatAuditDash(row.rejectReason)
}

function formatNow() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function resetChannelPicker() {
  channelKeyword.value = ''
  channelAppliedKeyword.value = ''
  channelPage.value = 1
}

function resetForm() {
  auditResult.value = ''
  auditRemark.value = ''
  auditGiftShare.value = ''
  auditChannelIds.value = []
  resetChannelPicker()
  formHint.value = ''
}

function onAuditResultChange() {
  formHint.value = ''
  if (auditResult.value === 'rejected') {
    auditChannelIds.value = []
    auditGiftShare.value = ''
    resetChannelPicker()
  }
}

function parseGiftShare(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const percent = Number(trimmed)
  if (!Number.isFinite(percent)) return null
  return percent
}

function searchChannels() {
  channelAppliedKeyword.value = channelKeyword.value
  channelPage.value = 1
}

function isChannelChecked(id: string) {
  return auditChannelIds.value.includes(id)
}

function toggleChannel(id: string) {
  if (channelPickerDisabled.value) return
  const index = auditChannelIds.value.indexOf(id)
  if (index >= 0) {
    auditChannelIds.value = auditChannelIds.value.filter((item) => item !== id)
    return
  }
  auditChannelIds.value = [...auditChannelIds.value, id]
}

function toggleChannelPageAll() {
  if (channelPickerDisabled.value || !channelPageIds.value.length) return
  if (channelPageAllSelected.value) {
    auditChannelIds.value = auditChannelIds.value.filter((id) => !channelPageIds.value.includes(id))
    return
  }
  const next = new Set(auditChannelIds.value)
  channelPageIds.value.forEach((id) => next.add(id))
  auditChannelIds.value = [...next]
}

function goChannelPage(page: number) {
  if (page < 1 || page > channelTotalPages.value) return
  channelPage.value = page
}

function openModal(row: AnchorAuditRow) {
  activeRow.value = row
  resetForm()
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  activeRow.value = null
  resetForm()
}

const canSubmitAudit = computed(
  () => modalVisible.value && activeRow.value?.auditStatus === 'pending',
)

const modalTitle = computed(() => (canSubmitAudit.value ? '审核' : '查看'))

function submitAudit() {
  const row = activeRow.value
  if (!row) return
  if (row.auditStatus !== 'pending') {
    formHint.value = '该申请已审核，不可再次提交'
    return
  }
  if (!auditResult.value) {
    formHint.value = '请选择审核结果'
    return
  }
  if (auditResult.value === 'approved' && !auditChannelIds.value.length) {
    formHint.value = '请选择授权渠道'
    return
  }
  const giftShare = parseGiftShare(auditGiftShare.value)
  if (auditResult.value === 'approved') {
    if (giftShare === null) {
      formHint.value = '请填写礼物分成比例'
      return
    }
    if (giftShare < 0 || giftShare > 100) {
      formHint.value = '礼物分成比例需在 0～100 之间'
      return
    }
  }
  if (auditResult.value === 'rejected' && !auditRemark.value.trim()) {
    formHint.value = '请填写驳回理由'
    return
  }

  const remark = auditRemark.value.trim()
  row.auditStatus = auditResult.value
  row.auditorName = CURRENT_ANCHOR_AUDITOR.name
  row.auditorId = CURRENT_ANCHOR_AUDITOR.id
  row.auditedAt = formatNow()
  row.auditRemark = remark
  row.rejectReason = auditResult.value === 'rejected' ? remark : ''
  row.channelIds = auditResult.value === 'approved' ? [...auditChannelIds.value] : []
  row.giftSharePercent = auditResult.value === 'approved' && giftShare !== null ? giftShare : null

  const resultLabel = auditResult.value === 'approved' ? '审核通过' : '审核拒绝'
  showPcToast(`已${resultLabel}「${row.applicantName}」的主播申请`)
  closeModal()
}
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />

    <section class="wf-block">
      <h1 class="laa-title">主播审核列表</h1>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">申请人ID：</label>
        <input
          v-model="filter.applicantId"
          type="text"
          class="wf-input"
          placeholder="请输入申请人ID"
        />

        <label class="wf-label">申请时间：</label>
        <input v-model="filter.appliedStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">至</span>
        <input v-model="filter.appliedEnd" type="date" class="wf-input wf-input--date" />

        <label class="wf-label">审核人ID：</label>
        <input
          v-model="filter.auditorId"
          type="text"
          class="wf-input"
          placeholder="请输入审核人ID"
        />

        <label class="wf-label">审核时间：</label>
        <input v-model="filter.auditStart" type="date" class="wf-input wf-input--date" />
        <span class="wf-range-sep">至</span>
        <input v-model="filter.auditEnd" type="date" class="wf-input wf-input--date" />
      </div>

      <div class="wf-toolbar wf-toolbar--filters">
        <label class="wf-label">审核状态：</label>
        <select v-model="filter.auditStatus" class="wf-input wf-input--select">
          <option v-for="opt in ANCHOR_AUDIT_STATUS_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <span class="wf-toolbar__actions">
          <button type="button" class="wf-btn wf-btn--primary" @click="applyFilter">搜索</button>
          <button type="button" class="wf-btn wf-btn--danger" @click="resetFilter">清除</button>
        </span>
      </div>

      <div class="wf-table-wrap">
        <table class="wf-table wf-table--manage">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">申请人</th>
              <th class="wf-th">申请人ID</th>
              <th class="wf-th">申请时间</th>
              <th class="wf-th">审核状态</th>
              <th class="wf-th">审核人</th>
              <th class="wf-th">审核人ID</th>
              <th class="wf-th">审核时间</th>
              <th class="wf-th">驳回理由</th>
              <th class="wf-th">审核备注</th>
              <th class="wf-th wf-th--op">
                <span class="laa-op-head">
                  操作
                  <WfSpecAnnot
                    :no="channelAnnot.no"
                    :title="channelAnnot.title"
                    :items="[...channelAnnot.items]"
                    placement="top"
                  />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredRows" :key="row.id">
              <td class="wf-td wf-td--center">{{ index + 1 }}</td>
              <td class="wf-td">{{ row.applicantName }}</td>
              <td class="wf-td">{{ row.applicantId }}</td>
              <td class="wf-td">{{ row.appliedAt }}</td>
              <td class="wf-td">{{ anchorAuditStatusLabel(row.auditStatus) }}</td>
              <td class="wf-td">{{ formatAuditDash(row.auditorName) }}</td>
              <td class="wf-td">{{ formatAuditDash(row.auditorId) }}</td>
              <td class="wf-td">{{ formatAuditDash(row.auditedAt) }}</td>
              <td class="wf-td">{{ formatRejectReason(row) }}</td>
              <td class="wf-td">{{ formatAuditDash(row.auditRemark) }}</td>
              <td class="wf-td wf-td--center wf-td--actions">
                <button type="button" class="wf-link-action" @click="openModal(row)">
                  {{ row.auditStatus === 'pending' ? '审核' : '查看' }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td colspan="11" class="wf-td wf-td--empty">暂无审核记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wf-pagination">
        <span class="wf-pagination__info">共 {{ filteredRows.length }} 条</span>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="modalVisible && activeRow"
        class="wf-modal-mask"
        role="presentation"
        @click.self="closeModal"
      >
        <div
          class="wf-modal wf-modal--detail-wide wf-modal--scroll"
          role="dialog"
          :aria-labelledby="canSubmitAudit ? 'anchor-audit-edit-title' : 'anchor-audit-detail-title'"
          aria-modal="true"
        >
          <div class="wf-modal__header">
            <h3
              :id="canSubmitAudit ? 'anchor-audit-edit-title' : 'anchor-audit-detail-title'"
              class="wf-modal__title"
            >
              {{ modalTitle }}
            </h3>
            <button type="button" class="wf-modal__close" aria-label="关闭" @click="closeModal">
              ×
            </button>
          </div>
          <div class="wf-modal__body">
            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">申请信息详情</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">申请人</span>
                  <span class="wf-detail-panel__value">{{ activeRow.applicantName }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">申请人ID</span>
                  <span class="wf-detail-panel__value">{{ activeRow.applicantId }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">申请时间</span>
                  <span class="wf-detail-panel__value">{{ activeRow.appliedAt }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">真实姓名</span>
                  <span class="wf-detail-panel__value">{{ formatAuditDash(activeRow.realName) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">身份证号</span>
                  <span class="wf-detail-panel__value">{{ formatAuditDash(activeRow.idNumber) }}</span>
                </div>
              </div>
            </section>

            <section class="wf-detail-panel__section">
              <h4 class="wf-detail-panel__title">审核信息</h4>
              <div class="wf-detail-panel__grid">
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">审核人</span>
                  <span class="wf-detail-panel__value">{{ formatAuditDash(activeRow.auditorName) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">审核人ID</span>
                  <span class="wf-detail-panel__value">{{ formatAuditDash(activeRow.auditorId) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">审核时间</span>
                  <span class="wf-detail-panel__value">{{ formatAuditDash(activeRow.auditedAt) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">审核状态</span>
                  <span class="wf-detail-panel__value">{{
                    anchorAuditStatusLabel(activeRow.auditStatus)
                  }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">驳回理由</span>
                  <span class="wf-detail-panel__value">{{ formatRejectReason(activeRow) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">审核备注</span>
                  <span class="wf-detail-panel__value">{{ formatAuditDash(activeRow.auditRemark) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">授权渠道</span>
                  <span class="wf-detail-panel__value">{{ formatAuditChannel(activeRow.channelIds) }}</span>
                </div>
                <div class="wf-detail-panel__cell">
                  <span class="wf-detail-panel__label">礼物分成比例</span>
                  <span class="wf-detail-panel__value">{{
                    formatAuditGiftShare(activeRow.giftSharePercent)
                  }}</span>
                </div>
              </div>
            </section>

            <div v-if="canSubmitAudit" class="wf-modal__form">
              <div class="wf-form-row">
                <label class="wf-form-row__label wf-form-row__label--required" for="anchor-audit-result">
                  审核
                </label>
                <select
                  id="anchor-audit-result"
                  v-model="auditResult"
                  class="wf-input wf-input--select wf-input--full"
                  @change="onAuditResultChange"
                >
                  <option value="">请选择</option>
                  <option
                    v-for="opt in ANCHOR_AUDIT_RESULT_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="wf-form-row laa-form-row--channel">
                <span
                  class="wf-form-row__label"
                  :class="{ 'wf-form-row__label--required': auditResult === 'approved' }"
                >
                  渠道选择
                </span>
                <div class="laa-channel" :class="{ 'laa-channel--disabled': channelPickerDisabled }">
                  <div class="wf-modal__query">
                    <input
                      id="anchor-audit-channel"
                      v-model="channelKeyword"
                      type="text"
                      class="wf-input"
                      placeholder="请输入关键词"
                      :disabled="channelPickerDisabled"
                      @keyup.enter="searchChannels"
                    />
                    <button
                      type="button"
                      class="wf-btn wf-btn--primary"
                      :disabled="channelPickerDisabled"
                      @click="searchChannels"
                    >
                      搜索
                    </button>
                  </div>
                  <div class="laa-channel-box">
                    <div class="laa-channel-box__bar">
                      <label class="laa-channel-check">
                        <input
                          type="checkbox"
                          :checked="channelPageAllSelected"
                          :indeterminate="channelPagePartialSelected"
                          :disabled="channelPickerDisabled || !channelPageIds.length"
                          @change="toggleChannelPageAll"
                        />
                        全选
                      </label>
                      <span class="wf-muted">已选：{{ channelSelectedCount }}</span>
                    </div>
                    <div v-if="channelPageItems.length" class="laa-channel-grid">
                      <label v-for="item in channelPageItems" :key="item.id" class="laa-channel-check">
                        <input
                          type="checkbox"
                          :checked="isChannelChecked(item.id)"
                          :disabled="channelPickerDisabled"
                          @change="toggleChannel(item.id)"
                        />
                        {{ item.name }}
                      </label>
                    </div>
                    <p v-else class="wf-td--empty laa-channel-empty">暂无匹配渠道</p>
                  </div>
                  <div v-if="channelFilteredList.length" class="wf-pagination laa-channel-pages">
                    <button
                      type="button"
                      class="wf-btn wf-btn--default"
                      :disabled="channelPage <= 1 || channelPickerDisabled"
                      @click="goChannelPage(channelPage - 1)"
                    >
                      上一页
                    </button>
                    <button
                      v-for="page in channelPageNumbers"
                      :key="page"
                      type="button"
                      class="wf-btn"
                      :class="page === channelPage ? 'wf-btn--primary' : 'wf-btn--default'"
                      :disabled="channelPickerDisabled"
                      @click="goChannelPage(page)"
                    >
                      {{ page }}
                    </button>
                    <button
                      type="button"
                      class="wf-btn wf-btn--default"
                      :disabled="channelPage >= channelTotalPages || channelPickerDisabled"
                      @click="goChannelPage(channelPage + 1)"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
              <div class="wf-form-row">
                <label
                  class="wf-form-row__label"
                  :class="{ 'wf-form-row__label--required': auditResult === 'approved' }"
                  for="anchor-audit-gift-share"
                >
                  礼物分成比例
                </label>
                <div class="wf-modal__pct-row">
                  <input
                    id="anchor-audit-gift-share"
                    v-model="auditGiftShare"
                    type="text"
                    inputmode="decimal"
                    class="wf-input wf-input--pct"
                    placeholder="0～100"
                    :disabled="giftShareDisabled"
                  />
                  <span class="wf-pct">%</span>
                </div>
              </div>
              <div class="wf-form-row">
                <label
                  class="wf-form-row__label"
                  :class="{ 'wf-form-row__label--required': auditResult === 'rejected' }"
                  for="anchor-audit-remark"
                >
                  备注
                </label>
                <input
                  id="anchor-audit-remark"
                  v-model="auditRemark"
                  type="text"
                  class="wf-input wf-input--full"
                  :placeholder="auditResult === 'rejected' ? '请填写驳回理由' : '选填审核备注'"
                />
              </div>
              <p v-if="formHint" class="wf-modal__hint">{{ formHint }}</p>
            </div>
          </div>
          <div class="wf-modal__footer">
            <button type="button" class="wf-btn wf-btn--default" @click="closeModal">
              {{ canSubmitAudit ? '取消' : '关闭' }}
            </button>
            <button
              v-if="canSubmitAudit"
              type="button"
              class="wf-btn wf-btn--primary"
              @click="submitAudit"
            >
              审核
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.laa-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text);
}

.laa-op-head {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.laa-form-row--channel {
  align-items: start;
}

.laa-channel {
  min-width: 0;
}

.laa-channel--disabled {
  opacity: 0.6;
}

.laa-channel-box {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--pc-border-light);
}

.laa-channel-box__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.laa-channel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.laa-channel-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pc-text);
  font-size: 14px;
  cursor: pointer;
}

.laa-channel--disabled .laa-channel-check {
  cursor: not-allowed;
}

.laa-channel-empty {
  padding: 24px 0;
  text-align: center;
}

.laa-channel-pages {
  height: auto;
  min-height: 56px;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0 0;
}
</style>
