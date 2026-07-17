<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { memberAgentMembershipJoined } from '../../constants/agentInvitation'
import {
  INVITE_TIME_PRESETS,
  INVITER_BOUND_CURRENCY,
  filterMemberRecords,
  findInviteMember,
  formatExchangeRate,
  formatInviteAmount,
  formatInviteDetailAmount,
  formatRebateRate,
  getInviteDateRange,
  inviteFiatLabel,
  rebateTypeLabel,
  resolveDefaultInviteCurrency,
  resolveInviteTimePresetFromRange,
  todayDateStr,
  vipDailyCap,
  type InviteCurrency,
  type InviteTimePreset,
} from '../../constants/inviteFriends'
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
const timeSheetOpen = ref(false)
const draftPreset = ref<InviteTimePreset>('month')
const draftStart = ref(defaultMonthStart)
const draftEnd = ref(defaultMonthEnd)
const timeError = ref('')

const pageTitle = computed(() => {
  if (!member.value) return '返利明细'
  return `${member.value.nickname} 的返利明细`
})

const todayCap = computed(() => {
  if (!member.value) return 0
  return vipDailyCap(member.value.vipLevel, currency.value)
})

const todayUsed = computed(() => {
  if (!member.value) return 0
  return member.value.todayRebate[currency.value] ?? 0
})

const timeRangeLabel = computed(() => {
  const preset = INVITE_TIME_PRESETS.find((item) => item.key === timePreset.value)
  if (preset && timePreset.value !== 'custom') return preset.label
  if (startDate.value === endDate.value) return startDate.value
  return `${startDate.value} 至 ${endDate.value}`
})

const rows = computed(() => {
  if (!member.value) return []
  return filterMemberRecords(member.value, startDate.value, endDate.value, currency.value)
})

function goBackToRecords() {
  router.push({ name: 'mobile-invite-records' })
}

function displayRebate(row: { rebate: number; status: string }) {
  if (row.status === 'daily_capped' || row.status === 'not_qualified') return 0
  return row.rebate
}

function syncDraftFromApplied() {
  draftPreset.value = timePreset.value
  draftStart.value = startDate.value
  draftEnd.value = endDate.value
  timeError.value = ''
}

function openTimeSheet() {
  syncDraftFromApplied()
  timeSheetOpen.value = true
}

function closeTimeSheet() {
  timeSheetOpen.value = false
  timeError.value = ''
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
  timeError.value = ''
}

function onDraftDateChange() {
  draftPreset.value = 'custom'
  timeError.value = ''
}

function applyTimeFilter() {
  if (!draftStart.value || !draftEnd.value) {
    timeError.value = '请选择起止日期'
    return
  }
  if (draftStart.value > draftEnd.value) {
    timeError.value = '开始日期不能晚于结束日期'
    return
  }
  const start = new Date(draftStart.value)
  const end = new Date(draftEnd.value)
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 90) {
    timeError.value = '移动端仅支持查询近 90 天数据'
    return
  }

  startDate.value = draftStart.value
  endDate.value = draftEnd.value
  timePreset.value = resolveInviteTimePresetFromRange(draftStart.value, draftEnd.value)
  timeSheetOpen.value = false
  timeError.value = ''
}
</script>

<template>
  <div class="mh5-invite-rebate-page">
    <Mh5SubPageHeader :title="pageTitle" :on-back="goBackToRecords" />

    <main v-if="member" class="mh5-invite-rebate-page__main">
      <section class="mh5-invite-rebate-head">
        <div class="mh5-invite-rebate-head__vip">
          <span class="mh5-invite-rebate-head__vip-badge">VIP{{ member.vipLevel }}</span>
          <div class="mh5-invite-rebate-head__cap-wrap">
            <span class="mh5-invite-rebate-head__cap-label">当日</span>
            <strong class="mh5-invite-rebate-head__cap">
              {{ formatInviteDetailAmount(todayUsed, currency) }}
              <em>/</em>
              {{ formatInviteDetailAmount(todayCap, currency) }}
            </strong>
          </div>
        </div>

        <button type="button" class="mh5-invite-rebate-time" @click="openTimeSheet">
          <span class="mh5-invite-rebate-time__label">时间筛选</span>
          <span class="mh5-invite-rebate-time__value">{{ timeRangeLabel }}</span>
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
            <!-- 一层：类型（左）+ 时间（右） -->
            <div class="mh5-invite-rebate-card__meta">
              <span
                class="mh5-invite-rebate-card__type"
                :class="`mh5-invite-rebate-card__type--${row.rebateType}`"
              >
                {{ rebateTypeLabel(row.rebateType) }}
              </span>
              <span class="mh5-invite-rebate-card__meta-item">{{ row.occurredAt }}</span>
            </div>

            <!-- 二层：核心金额 · 实际充值 = 充值金额 × 汇率 -->
            <div class="mh5-invite-rebate-card__metrics">
              <div class="mh5-invite-rebate-card__metric">
                <span class="mh5-invite-rebate-card__metric-label">
                  充值金额({{ row.currency }})
                </span>
                <strong class="mh5-invite-rebate-card__metric-value">
                  {{ formatInviteDetailAmount(row.deposit, row.currency) }}
                </strong>
              </div>
              <span class="mh5-invite-rebate-card__op" aria-hidden="true">×</span>
              <div class="mh5-invite-rebate-card__metric">
                <span class="mh5-invite-rebate-card__metric-label">汇率</span>
                <strong class="mh5-invite-rebate-card__metric-value">
                  {{ formatExchangeRate(row.exchangeRate) }}
                </strong>
              </div>
              <span class="mh5-invite-rebate-card__op" aria-hidden="true">=</span>
              <div class="mh5-invite-rebate-card__metric mh5-invite-rebate-card__metric--result">
                <span class="mh5-invite-rebate-card__metric-label">
                  实际充值({{ inviteFiatLabel(row.currency) }})
                </span>
                <strong class="mh5-invite-rebate-card__metric-value">
                  {{ formatInviteAmount(row.activityAmount) }}
                </strong>
              </div>
            </div>

            <!-- 三层：返利比例 + 返利金额 -->
            <div class="mh5-invite-rebate-card__head">
              <div class="mh5-invite-rebate-card__rate">
                <span class="mh5-invite-rebate-card__rate-label">返利比例</span>
                <strong class="mh5-invite-rebate-card__rate-value">
                  {{ formatRebateRate(row.rate) }}
                </strong>
              </div>
              <div class="mh5-invite-rebate-card__outcome">
                <span class="mh5-invite-rebate-card__outcome-label">返利金额</span>
                <strong
                  class="mh5-invite-rebate-card__rebate"
                  :class="{ 'mh5-invite-rebate-card__rebate--zero': displayRebate(row) <= 0 }"
                >
                  {{ formatInviteDetailAmount(displayRebate(row), row.currency) }}
                </strong>
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="mh5-invite-rebate-list-block__empty">所选时间暂无返利记录</p>
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
        <div v-if="timeSheetOpen" class="mh5-agent-overlay-mask" @click.self="closeTimeSheet">
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
            <h2 class="mh5-xcoin-sheet__title">选择时间</h2>
            <p v-if="timeError" class="mh5-bet-order-sheet__error">{{ timeError }}</p>

            <div class="mh5-bet-order-sheet__body">
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
                <h3 class="mh5-xcoin-filter-group__label">自定义区间</h3>
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
                <p class="mh5-xcoin-filter-hint">选择后将回显到时间筛选项，最长 90 天</p>
              </section>
            </div>

            <div class="mh5-xcoin-sheet__footer mh5-bet-order-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="closeTimeSheet">
                取消
              </button>
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--primary" @click="applyTimeFilter">
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
  padding: 12px 16px;
  background: #fff;
  border-bottom: 8px solid #f5f6f8;
}

.mh5-invite-rebate-head__vip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.mh5-invite-rebate-head__vip-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b8);
  color: #c45a00;
  font-size: 13px;
  font-weight: 700;
}

.mh5-invite-rebate-head__cap-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
}

.mh5-invite-rebate-head__cap-label {
  color: #8a8f98;
  font-size: 11px;
  line-height: 1.2;
}

.mh5-invite-rebate-head__cap {
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-head__cap em {
  margin: 0 4px;
  color: #999;
  font-style: normal;
  font-weight: 500;
}

.mh5-invite-rebate-time {
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

.mh5-invite-rebate-time:active {
  background: #eceff3;
}

.mh5-invite-rebate-time__label {
  flex: none;
  color: #8a8f98;
  font-size: 13px;
}

.mh5-invite-rebate-time__value {
  flex: 1;
  min-width: 0;
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mh5-invite-rebate-time svg {
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
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #fff;
}

.mh5-invite-rebate-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mh5-invite-rebate-card__rate {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}

.mh5-invite-rebate-card__rate-label {
  color: #9ca3af;
  font-size: 11px;
  line-height: 1.2;
}

.mh5-invite-rebate-card__rate-value {
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.mh5-invite-rebate-card__type {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

/* 首充 */
.mh5-invite-rebate-card__type--first {
  background: #fff3e0;
  color: #c45a00;
}

/* 复充 */
.mh5-invite-rebate-card__type--repeat {
  background: #eef5ff;
  color: #2563eb;
}

/* 达标历史门槛 */
.mh5-invite-rebate-card__type--history_threshold {
  background: #ecfdf5;
  color: #059669;
}

/* 当日上限 */
.mh5-invite-rebate-card__type--daily_cap {
  background: #f3f4f6;
  color: #6b7280;
}

.mh5-invite-rebate-card__outcome {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
}

.mh5-invite-rebate-card__outcome-label {
  color: #9ca3af;
  font-size: 11px;
  line-height: 1.2;
}

.mh5-invite-rebate-card__rebate {
  color: #16a34a;
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.mh5-invite-rebate-card__rebate--zero {
  color: #9ca3af;
}

.mh5-invite-rebate-card__metrics {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 10px;
  background: #f8f9fb;
}

.mh5-invite-rebate-card__metric {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.mh5-invite-rebate-card__metric--result .mh5-invite-rebate-card__metric-value {
  color: #c45a00;
}

.mh5-invite-rebate-card__op {
  flex: none;
  color: #c4c9d2;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding-top: 14px;
}

.mh5-invite-rebate-card__metric-label {
  color: #9ca3af;
  font-size: 11px;
  line-height: 1.2;
}

.mh5-invite-rebate-card__metric-value {
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  word-break: break-all;
}

.mh5-invite-rebate-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mh5-invite-rebate-card__meta-item {
  flex: none;
  margin-left: auto;
  color: #9ca3af;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  text-align: right;
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
