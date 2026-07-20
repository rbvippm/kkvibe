<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { memberAgentMembershipJoined } from '../../constants/agentInvitation'
import {
  INVITE_TIME_PRESETS,
  INVITER_BOUND_CURRENCY,
  filterMemberDailyRows,
  findInviteMember,
  formatInviteDetailAmount,
  getInviteDateRange,
  inviteRebateSettleStatusLabel,
  resolveDefaultInviteCurrency,
  resolveInviteTimePresetFromRange,
  todayDateStr,
  vipDailyCap,
  type InviteCurrency,
  type InviteDailyRebateRow,
  type InviteDailySettleStatus,
  type InviteTimePreset,
} from '../../constants/inviteFriends'
import { INVITE_FRIENDS_REBATE_DETAIL_SPEC } from '../../constants/inviteFriendsSpec'
import { INVITE_REBATE_SETTLE_STATUS_OPTIONS } from '../../constants/inviteRebateOps'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

/** 有代理身份时不可查看返利明细，与「我的 → 代理邀请」联动 */
function guardRebateAccess() {
  if (memberAgentMembershipJoined.value) {
    router.replace({ name: 'mobile-invite-records' })
  }
}

onMounted(guardRebateAccess)
watch(memberAgentMembershipJoined, guardRebateAccess)

function parseCurrency(raw: unknown): InviteCurrency {
  const value = String(raw ?? '')
  if (value === 'KKC' || value === 'KKV' || value === 'USDT') return value
  return resolveDefaultInviteCurrency()
}

const memberId = computed(() => String(route.params.id ?? ''))
const member = computed(() => findInviteMember(memberId.value))
const currency = computed(() => parseCurrency(route.query.currency) || INVITER_BOUND_CURRENCY)

const defaultMonthRange = getInviteDateRange({
  timePreset: 'month',
  customStart: '',
  customEnd: '',
})
const defaultMonthStart = todayDateStr(defaultMonthRange.start)
const defaultMonthEnd = todayDateStr(defaultMonthRange.end)

const timePreset = ref<InviteTimePreset>('month')
const startDate = ref(defaultMonthStart)
const endDate = ref(defaultMonthEnd)
const settleStatus = ref<'' | InviteDailySettleStatus>('')
const filterSheetOpen = ref(false)
const draftPreset = ref<InviteTimePreset>('month')
const draftStart = ref(defaultMonthStart)
const draftEnd = ref(defaultMonthEnd)
const draftStatus = ref<'' | InviteDailySettleStatus>('')
const filterError = ref('')
/** 未达标 / 已取消：点击感叹号查看原因 */
const reasonTipRowId = ref('')

const pageTitle = computed(() => {
  if (!member.value) return '返利明细'
  return `${member.value.nickname} 的返利明细`
})

const timeRangeLabel = computed(() => {
  const preset = INVITE_TIME_PRESETS.find((item) => item.key === timePreset.value)
  if (preset && timePreset.value !== 'custom') return preset.label
  if (startDate.value === endDate.value) return startDate.value
  return `${startDate.value} 至 ${endDate.value}`
})

const statusFilterLabel = computed(() => {
  return (
    INVITE_REBATE_SETTLE_STATUS_OPTIONS.find((item) => item.value === settleStatus.value)?.label ??
    '全部'
  )
})

const filterSummaryLabel = computed(() => `${timeRangeLabel.value} · ${statusFilterLabel.value}`)

const rows = computed(() => {
  if (!member.value) return []
  return filterMemberDailyRows(member.value, startDate.value, endDate.value, currency.value).filter(
    (row) => !settleStatus.value || row.status === settleStatus.value,
  )
})

function goBackToRecords() {
  router.push({ name: 'mobile-invite-records' })
}

function statusTone(status: InviteDailyRebateRow['status']) {
  if (status === 'settled') return 'settled'
  if (status === 'pending') return 'pending'
  if (status === 'capped') return 'capped'
  if (status === 'cancelled') return 'cancelled'
  return 'fail'
}

function hasStatusReason(status: InviteDailyRebateRow['status']) {
  return status === 'cancelled' || status === 'not_qualified'
}

function toggleReasonTip(rowId: string) {
  reasonTipRowId.value = reasonTipRowId.value === rowId ? '' : rowId
}

function closeReasonTip() {
  reasonTipRowId.value = ''
}

function syncDraftFromApplied() {
  draftPreset.value = timePreset.value
  draftStart.value = startDate.value
  draftEnd.value = endDate.value
  draftStatus.value = settleStatus.value
  filterError.value = ''
}

function openFilterSheet() {
  closeReasonTip()
  syncDraftFromApplied()
  filterSheetOpen.value = true
}

function closeFilterSheet() {
  filterSheetOpen.value = false
  filterError.value = ''
}

function pickDraftPreset(preset: InviteTimePreset) {
  if (preset === 'custom') return
  draftPreset.value = preset
  const range = getInviteDateRange({
    timePreset: preset,
    customStart: '',
    customEnd: '',
  })
  draftStart.value = todayDateStr(range.start)
  draftEnd.value = todayDateStr(range.end)
  filterError.value = ''
}

function pickDraftStatus(value: '' | InviteDailySettleStatus) {
  draftStatus.value = value
}

function onDraftDateChange() {
  draftPreset.value = 'custom'
  filterError.value = ''
}

function applyFilter() {
  if (!draftStart.value || !draftEnd.value) {
    filterError.value = '请选择起止日期'
    return
  }
  if (draftStart.value > draftEnd.value) {
    filterError.value = '开始日期不能晚于结束日期'
    return
  }
  const start = new Date(draftStart.value)
  const end = new Date(draftEnd.value)
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 90) {
    filterError.value = '移动端仅支持查询近 90 天数据'
    return
  }

  startDate.value = draftStart.value
  endDate.value = draftEnd.value
  timePreset.value = resolveInviteTimePresetFromRange(draftStart.value, draftEnd.value)
  settleStatus.value = draftStatus.value
  filterSheetOpen.value = false
  filterError.value = ''
}
</script>

<template>
  <div class="mh5-invite-rebate-page">
    <Mh5SubPageHeader :title="pageTitle" :on-back="goBackToRecords">
      <template #right>
        <Mh5SpecAnnot :spec="INVITE_FRIENDS_REBATE_DETAIL_SPEC" placement="bottom" />
      </template>
    </Mh5SubPageHeader>

    <main v-if="member" class="mh5-invite-rebate-page__main" @click="closeReasonTip">
      <section class="mh5-invite-rebate-head">
        <button type="button" class="mh5-invite-rebate-filter" @click="openFilterSheet">
          <span class="mh5-invite-rebate-filter__label">筛选</span>
          <span class="mh5-invite-rebate-filter__value">{{ filterSummaryLabel }}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </section>

      <section class="mh5-invite-rebate-list-block">
        <ul v-if="rows.length" class="mh5-invite-rebate-cards">
          <li v-for="row in rows" :key="row.id" class="mh5-invite-rebate-card">
            <div class="mh5-invite-rebate-card__meta">
              <span class="mh5-invite-rebate-card__status-wrap">
                <span
                  class="mh5-invite-rebate-card__status"
                  :class="`mh5-invite-rebate-card__status--${statusTone(row.status)}`"
                >
                  {{ inviteRebateSettleStatusLabel(row.status) }}
                </span>
                <button
                  v-if="hasStatusReason(row.status)"
                  type="button"
                  class="mh5-invite-rebate-card__reason-btn"
                  aria-label="查看原因"
                  :aria-expanded="reasonTipRowId === row.id"
                  @click.stop="toggleReasonTip(row.id)"
                >
                  !
                </button>
                <span
                  v-if="reasonTipRowId === row.id"
                  class="mh5-invite-rebate-card__reason-bubble"
                  role="tooltip"
                  @click.stop
                >
                  {{ row.remark || '暂无原因说明' }}
                </span>
              </span>
              <span class="mh5-invite-rebate-card__vip">VIP{{ row.vipSnapshot }}</span>
              <span class="mh5-invite-rebate-card__biz">业务日 {{ row.bizDate }}</span>
            </div>

            <div class="mh5-invite-rebate-card__grid">
              <div class="mh5-invite-rebate-card__cell">
                <span>日存</span>
                <strong>{{ formatInviteDetailAmount(row.inviteeDailyDeposit, row.currency) }}</strong>
              </div>
              <div class="mh5-invite-rebate-card__cell">
                <span>累计存款</span>
                <strong>
                  {{ formatInviteDetailAmount(row.inviteeHistoryDeposit, row.currency) }}
                </strong>
              </div>
            </div>

            <div class="mh5-invite-rebate-card__amounts">
              <div class="mh5-invite-rebate-card__amount">
                <span>应发返利</span>
                <strong>{{ formatInviteDetailAmount(row.rebateAmount, row.currency) }}</strong>
              </div>
              <div class="mh5-invite-rebate-card__amount">
                <span>实发 / VIP当日上限</span>
                <strong
                  class="mh5-invite-rebate-card__settled"
                  :class="{ 'mh5-invite-rebate-card__settled--zero': row.settledAmount <= 0 }"
                >
                  {{ formatInviteDetailAmount(row.settledAmount, row.currency) }}
                  <em>/</em>
                  {{ formatInviteDetailAmount(vipDailyCap(row.vipSnapshot, row.currency), row.currency) }}
                </strong>
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="mh5-invite-rebate-list-block__empty">所选筛选暂无每日返利明细</p>
      </section>
    </main>

    <section v-else class="mh5-invite-rebate-page__empty">
      <p>未找到该被邀请人</p>
      <button type="button" class="mh5-invite-rebate-page__back-btn" @click="goBackToRecords">
        返回列表
      </button>
    </section>

    <Teleport to="body">
      <Transition name="mh5-sheet">
        <div v-if="filterSheetOpen" class="mh5-agent-overlay-mask" @click.self="closeFilterSheet">
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
            <h2 class="mh5-xcoin-sheet__title">筛选</h2>
            <p v-if="filterError" class="mh5-bet-order-sheet__error">{{ filterError }}</p>

            <div class="mh5-bet-order-sheet__body">
              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">派发状态</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in INVITE_REBATE_SETTLE_STATUS_OPTIONS"
                    :key="`status-${opt.value || 'all'}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': draftStatus === opt.value }"
                    @click="pickDraftStatus(opt.value as '' | InviteDailySettleStatus)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">快捷时间</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="tab in INVITE_TIME_PRESETS"
                    :key="tab.key"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': draftPreset === tab.key }"
                    @click="pickDraftPreset(tab.key)"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">业务日区间</h3>
                <div class="mh5-bet-order-date-row">
                  <input
                    v-model="draftStart"
                    type="date"
                    class="mh5-xcoin-filter-input"
                    @change="onDraftDateChange"
                  />
                  <span>至</span>
                  <input
                    v-model="draftEnd"
                    type="date"
                    class="mh5-xcoin-filter-input"
                    @change="onDraftDateChange"
                  />
                </div>
                <p class="mh5-xcoin-filter-hint">按业务日筛选，最长 90 天</p>
              </section>
            </div>

            <div class="mh5-xcoin-sheet__footer mh5-bet-order-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="closeFilterSheet">
                取消
              </button>
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--primary" @click="applyFilter">
                确定
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mh5-invite-rebate-page {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: #f5f6f8;
}

.mh5-invite-rebate-page__main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 0 calc(12px + env(safe-area-inset-bottom));
  -webkit-overflow-scrolling: touch;
}

.mh5-invite-rebate-head {
  padding: 10px 16px 12px;
  background: #fff;
  border-bottom: 8px solid #f5f6f8;
}

.mh5-invite-rebate-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #333;
  text-align: left;
}

.mh5-invite-rebate-filter:active {
  background: #eceff3;
}

.mh5-invite-rebate-filter__label {
  flex: none;
  color: #8a8f98;
  font-size: 13px;
}

.mh5-invite-rebate-filter__value {
  flex: 1;
  min-width: 0;
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mh5-invite-rebate-filter svg {
  flex: none;
  color: #999;
}

.mh5-invite-rebate-list-block {
  padding: 12px;
  background: transparent;
}

.mh5-invite-rebate-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mh5-invite-rebate-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: #fff;
}

.mh5-invite-rebate-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mh5-invite-rebate-card__status-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

.mh5-invite-rebate-card__status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.mh5-invite-rebate-card__reason-btn {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 1px solid currentColor;
  border-radius: 50%;
  background: #fff;
  color: #dc2626;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}

.mh5-invite-rebate-card__reason-btn:active {
  opacity: 0.75;
}

.mh5-invite-rebate-card__reason-bubble {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 6;
  width: min(260px, calc(100vw - 64px));
  padding: 10px 12px;
  border-radius: 10px;
  background: rgb(33 37 41 / 92%);
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  box-shadow: 0 8px 20px rgb(15 23 42 / 18%);
}

.mh5-invite-rebate-card__reason-bubble::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 36px;
  width: 10px;
  height: 10px;
  background: rgb(33 37 41 / 92%);
  transform: rotate(45deg);
}

.mh5-invite-rebate-card__vip {
  color: #c45a00;
  font-size: 12px;
  font-weight: 700;
}

.mh5-invite-rebate-card__status--settled {
  background: #ecfdf5;
  color: #059669;
}

.mh5-invite-rebate-card__status--pending {
  background: #fff7ed;
  color: #c2410c;
}

.mh5-invite-rebate-card__status--capped {
  background: #f3f4f6;
  color: #6b7280;
}

.mh5-invite-rebate-card__status--cancelled,
.mh5-invite-rebate-card__status--fail {
  background: #fef2f2;
  color: #dc2626;
}

.mh5-invite-rebate-card__biz {
  margin-left: auto;
  color: #6b7280;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: #f8f9fb;
}

.mh5-invite-rebate-card__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.mh5-invite-rebate-card__cell span {
  color: #9ca3af;
  font-size: 11px;
  line-height: 1.2;
}

.mh5-invite-rebate-card__cell strong {
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  word-break: break-all;
}

.mh5-invite-rebate-card__amounts {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.mh5-invite-rebate-card__amount {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mh5-invite-rebate-card__amount span {
  color: #9ca3af;
  font-size: 11px;
}

.mh5-invite-rebate-card__amount strong {
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-card__settled {
  color: #16a34a;
  font-size: 14px;
  text-align: right;
}

.mh5-invite-rebate-card__settled em {
  margin: 0 2px;
  color: #9ca3af;
  font-style: normal;
  font-weight: 500;
}

.mh5-invite-rebate-card__settled--zero {
  color: #9ca3af;
}

.mh5-invite-rebate-card__settled--zero em {
  color: #c4c9d2;
}

.mh5-invite-rebate-list-block__empty {
  margin: 0;
  padding: 48px 16px;
  border-radius: 12px;
  background: #fff;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.mh5-invite-rebate-page__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #999;
  font-size: 14px;
}

.mh5-invite-rebate-page__back-btn {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  background: #fff7ef;
  color: #ff8a1f;
  font-size: 13px;
  font-weight: 600;
}
</style>
