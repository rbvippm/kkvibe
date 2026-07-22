<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { memberAgentMembershipJoined } from '../../constants/agentInvitation'
import {
  INVITE_CURRENCY_OPTIONS,
  INVITE_DETAIL_CURRENCY_OPTIONS,
  INVITE_REBATE_TIME_PRESETS,
  findInviteMember,
  formatInviteDetailAmount,
  getInviteDateRange,
  inviteRebateSettleStatusLabel,
  listAllInviteRebateRows,
  resolveInviteTimePresetFromRange,
  resolveInviteVipDayCapDisplay,
  todayDateStr,
  type InviteCurrency,
  type InviteDailyRebateRow,
  type InviteDailySettleStatus,
  type InviteDetailCurrencyFilter,
  type InviteRebateOverviewRow,
  type InviteTimePreset,
} from '../../constants/inviteFriends'
import { INVITE_FRIENDS_REBATE_LIST_SPEC } from '../../constants/inviteFriendsSpec'
import { INVITE_REBATE_SETTLE_STATUS_OPTIONS } from '../../constants/inviteRebateOps'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const claimTick = ref(0)
const reasonTipRowId = ref('')
const keyword = ref('')

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
const currency = ref<InviteDetailCurrencyFilter>('')
const filterSheetOpen = ref(false)
const draftPreset = ref<InviteTimePreset>('month')
const draftStart = ref(defaultMonthStart)
const draftEnd = ref(defaultMonthEnd)
const draftStatus = ref<'' | InviteDailySettleStatus>('')
const draftCurrency = ref<InviteDetailCurrencyFilter>('')
const filterError = ref('')

function guardRebateAccess() {
  if (memberAgentMembershipJoined.value) {
    router.replace({ name: 'mobile-invite-friends' })
  }
}

onMounted(guardRebateAccess)
watch(memberAgentMembershipJoined, guardRebateAccess)

const rows = computed(() => {
  void claimTick.value
  const kw = keyword.value.trim().toLowerCase()
  return listAllInviteRebateRows().filter((row) => {
    if (startDate.value && row.bizDate < startDate.value) return false
    if (endDate.value && row.bizDate > endDate.value) return false
    if (currency.value && row.currency !== currency.value) return false
    if (settleStatus.value && row.status !== settleStatus.value) return false
    if (kw) {
      const nick = row.nickname.toLowerCase()
      const diamond = row.diamondId.toLowerCase()
      if (!nick.includes(kw) && !diamond.includes(kw)) return false
    }
    return true
  })
})

/** 按币种汇总：存款/返利为金额；待解锁/可领取为筛选后笔数 */
const summaryCards = computed(() => {
  const currencies: InviteCurrency[] = currency.value
    ? [currency.value]
    : INVITE_CURRENCY_OPTIONS.map((item) => item.value)
  return currencies.map((cur) => {
    const list = rows.value.filter((row) => row.currency === cur)
    return {
      currency: cur,
      deposit: list.reduce((sum, row) => sum + row.inviteeBizDayDeposit, 0),
      rebate: list.reduce((sum, row) => sum + row.rebateAmount, 0),
      lockedCount: list.filter((row) => row.status === 'locked').length,
      claimableCount: list.filter((row) => row.status === 'claimable').length,
    }
  })
})

const summaryCarouselRef = ref<HTMLElement | null>(null)
const summarySlideIndex = ref(0)

function onSummaryCarouselScroll() {
  const el = summaryCarouselRef.value
  if (!el || !el.clientWidth) return
  summarySlideIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}

function resetSummaryCarousel() {
  summarySlideIndex.value = 0
  nextTick(() => {
    summaryCarouselRef.value?.scrollTo({ left: 0 })
  })
}

watch([startDate, endDate, settleStatus, currency, keyword], resetSummaryCarousel)

function goBack() {
  router.push({ name: 'mobile-invite-friends' })
}

function statusTone(status: InviteDailyRebateRow['status']) {
  if (status === 'claimed') return 'claimed'
  if (status === 'claimable') return 'claimable'
  if (status === 'locked') return 'locked'
  if (status === 'expired') return 'expired'
  if (status === 'cancelled') return 'cancelled'
  return 'fail'
}

function hasStatusReason(status: InviteDailyRebateRow['status']) {
  return status === 'cancelled' || status === 'locked' || status === 'expired'
}

function toggleReasonTip(rowId: string) {
  reasonTipRowId.value = reasonTipRowId.value === rowId ? '' : rowId
}

function closeReasonTip() {
  reasonTipRowId.value = ''
}

function clearKeyword() {
  keyword.value = ''
}

function claimRebate(row: InviteRebateOverviewRow) {
  if (row.status !== 'claimable') return
  const source = findInviteMember(row.memberId)?.dailyRows.find((d) => d.id === row.id)
  if (!source || source.status !== 'claimable') return
  source.status = 'claimed'
  source.claimedAmount = source.rebateAmount
  source.remark = '领取成功'
  claimTick.value += 1
}

function syncDraftFromApplied() {
  draftPreset.value = timePreset.value
  draftStart.value = startDate.value
  draftEnd.value = endDate.value
  draftStatus.value = settleStatus.value
  draftCurrency.value = currency.value
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

function pickDraftCurrency(value: InviteDetailCurrencyFilter) {
  draftCurrency.value = value
}

function onDraftDateChange() {
  filterError.value = ''
  if (!draftStart.value || !draftEnd.value) {
    draftPreset.value = 'custom'
    return
  }
  draftPreset.value = resolveInviteTimePresetFromRange(draftStart.value, draftEnd.value)
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
  currency.value = draftCurrency.value
  filterSheetOpen.value = false
  filterError.value = ''
}

function resetFilterDraft() {
  draftPreset.value = 'month'
  const range = getInviteDateRange({
    timePreset: 'month',
    customStart: '',
    customEnd: '',
  })
  draftStart.value = todayDateStr(range.start)
  draftEnd.value = todayDateStr(range.end)
  draftStatus.value = ''
  draftCurrency.value = ''
  filterError.value = ''
}
</script>

<template>
  <div class="mh5-invite-rebate-list">
    <Mh5SubPageHeader title="邀请返利" :on-back="goBack">
      <template #right>
        <div class="mh5-sub-header__actions">
          <Mh5SpecAnnot :spec="INVITE_FRIENDS_REBATE_LIST_SPEC" placement="bottom" />
          <button type="button" class="mh5-sub-header__action" @click="openFilterSheet">筛选</button>
        </div>
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-invite-rebate-list__main" @click="closeReasonTip">
      <section class="mh5-invite-rebate-list__toolbar">
        <div class="mh5-invite-rebate-list__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M16 16l4 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="keyword"
            type="search"
            class="mh5-invite-rebate-list__search-input"
            placeholder="用户关键词（支持昵称，金刚号）"
            enterkeyhint="search"
          />
          <button
            v-if="keyword"
            type="button"
            class="mh5-invite-rebate-list__search-clear"
            aria-label="清除搜索"
            @click="clearKeyword"
          >
            ×
          </button>
        </div>
      </section>

      <div class="mh5-bet-order-summary-carousel mh5-bet-order-summary-carousel--scroll">
        <div
          ref="summaryCarouselRef"
          class="mh5-bet-order-summary-carousel__track"
          @scroll.passive="onSummaryCarouselScroll"
        >
          <section
            v-for="summary in summaryCards"
            :key="summary.currency"
            class="mh5-bet-order-summary mh5-bet-order-summary--slide"
          >
            <span class="mh5-bet-order-summary__currency">{{ summary.currency }}</span>
            <div class="mh5-bet-order-summary__metrics mh5-invite-rebate-list__summary-metrics">
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">存款总额</span>
                <strong>{{ formatInviteDetailAmount(summary.deposit, summary.currency) }}</strong>
              </div>
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">返利总额</span>
                <strong>{{ formatInviteDetailAmount(summary.rebate, summary.currency) }}</strong>
              </div>
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">待解锁</span>
                <strong>{{ summary.lockedCount }}</strong>
              </div>
              <div class="mh5-bet-order-summary__item">
                <span class="mh5-bet-order-summary__label">可领取</span>
                <strong class="mh5-invite-rebate-list__summary-claimable">
                  {{ summary.claimableCount }}
                </strong>
              </div>
            </div>
          </section>
        </div>
        <div
          v-if="summaryCards.length > 1"
          class="mh5-bet-order-summary-carousel__dots"
          aria-hidden="true"
        >
          <span
            v-for="(summary, idx) in summaryCards"
            :key="`dot-${summary.currency}`"
            class="mh5-bet-order-summary-carousel__dot"
            :class="{ 'mh5-bet-order-summary-carousel__dot--active': summarySlideIndex === idx }"
          />
        </div>
      </div>

      <ul v-if="rows.length" class="mh5-invite-rebate-cards">
        <li
          v-for="row in rows"
          :key="row.id"
          class="mh5-invite-rebate-card"
        >
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
            <span class="mh5-invite-rebate-card__name">{{ row.nickname }}</span>
            <span
              v-if="!currency"
              class="mh5-invite-rebate-card__currency"
            >
              {{ row.currency }}
            </span>
            <span class="mh5-invite-rebate-card__biz">业务日 {{ row.bizDate }}</span>
          </div>

          <div class="mh5-invite-rebate-card__grid">
            <div class="mh5-invite-rebate-card__cell">
              <span>好友当日存款</span>
              <strong>{{ formatInviteDetailAmount(row.inviteeBizDayDeposit, row.currency) }}</strong>
            </div>
            <div class="mh5-invite-rebate-card__cell">
              <span>好友次日存款</span>
              <strong>
                {{ formatInviteDetailAmount(row.inviteeRechargeDayDeposit, row.currency) }}
              </strong>
            </div>
          </div>

          <div class="mh5-invite-rebate-card__amounts">
            <div class="mh5-invite-rebate-card__amount">
              <span>预估返利</span>
              <strong>{{ formatInviteDetailAmount(row.rebateAmount, row.currency) }}</strong>
            </div>
            <div class="mh5-invite-rebate-card__amount">
              <span>已领 / VIP当日上限</span>
              <strong
                class="mh5-invite-rebate-card__settled"
                :class="{ 'mh5-invite-rebate-card__settled--zero': row.claimedAmount <= 0 }"
              >
                {{ formatInviteDetailAmount(row.claimedAmount, row.currency) }}
                <em>/</em>
                {{ formatInviteDetailAmount(resolveInviteVipDayCapDisplay(row), row.currency) }}
              </strong>
            </div>
          </div>

          <div class="mh5-invite-rebate-card__claim-row">
            <span class="mh5-invite-rebate-card__time">
              开放 {{ row.claimOpenAt.slice(5, 16) }} · 截止 {{ row.expireAt.slice(5, 16) }}
            </span>
            <button
              v-if="row.status === 'claimable'"
              type="button"
              class="mh5-invite-rebate-card__claim-btn"
              @click.stop="claimRebate(row)"
            >
              领取
            </button>
            <span v-else-if="row.status === 'locked'" class="mh5-invite-rebate-card__claim-disabled">
              待解锁
            </span>
            <span v-else-if="row.status === 'expired'" class="mh5-invite-rebate-card__claim-disabled">
              已失效
            </span>
            <span v-else-if="row.status === 'claimed'" class="mh5-invite-rebate-card__claim-done">
              已到账
            </span>
          </div>
        </li>
      </ul>
      <p v-else class="mh5-invite-rebate-list__empty">所选筛选暂无邀请返利数据</p>
    </main>

    <Teleport to="body">
      <Transition name="mh5-sheet">
        <div v-if="filterSheetOpen" class="mh5-agent-overlay-mask" @click.self="closeFilterSheet">
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
            <h2 class="mh5-xcoin-sheet__title">筛选</h2>
            <p v-if="filterError" class="mh5-bet-order-sheet__error">{{ filterError }}</p>

            <div class="mh5-bet-order-sheet__body">
              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">币种</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in INVITE_DETAIL_CURRENCY_OPTIONS"
                    :key="`currency-${opt.label}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': draftCurrency === opt.value }"
                    @click="pickDraftCurrency(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">领取状态</h3>
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
                    v-for="tab in INVITE_REBATE_TIME_PRESETS"
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
                <p class="mh5-xcoin-filter-hint">
                  按业务日查询；与上方「昨天 / 本周 / 本月」联动；最长 90 天
                </p>
              </section>
            </div>

            <div class="mh5-xcoin-sheet__footer mh5-bet-order-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="resetFilterDraft">
                重置
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
.mh5-invite-rebate-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background: #f5f6f8;
}

.mh5-invite-rebate-list__main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  -webkit-overflow-scrolling: touch;
}

.mh5-invite-rebate-list__toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.mh5-invite-rebate-list__summary-metrics {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 4px;
}

.mh5-invite-rebate-list__summary-claimable {
  color: #2563eb;
}

.mh5-invite-rebate-list :deep(.mh5-bet-order-summary-carousel) {
  margin-bottom: 12px;
}

.mh5-invite-rebate-list :deep(.mh5-bet-order-summary--slide) {
  min-height: auto;
}

.mh5-invite-rebate-list :deep(.mh5-bet-order-summary__item strong) {
  max-width: 100%;
  font-size: 12px;
  line-height: 1.25;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;
}

.mh5-invite-rebate-list__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  background: #fff;
  color: #8a8f98;
}

.mh5-invite-rebate-list__search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  color: #1a1a1a;
  font-size: 14px;
  outline: none;
}

.mh5-invite-rebate-list__search-input::placeholder {
  color: #aeb3bb;
}

.mh5-invite-rebate-list__search-clear {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(138 143 152 / 22%);
  color: #666;
  font-size: 14px;
  line-height: 1;
}

.mh5-invite-rebate-list__empty {
  margin: 48px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
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
  flex-wrap: wrap;
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
  font-weight: 700;
  line-height: 1;
}

.mh5-invite-rebate-card__reason-bubble {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 2;
  width: max-content;
  max-width: 220px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #1f2937;
  color: #fff;
  font-size: 12px;
  line-height: 1.45;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.mh5-invite-rebate-card__name {
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 600;
}

.mh5-invite-rebate-card__currency {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  background: #fff7ed;
  color: #ea580c;
  font-size: 10px;
  font-weight: 700;
}

.mh5-invite-rebate-card__biz {
  margin-left: auto;
  color: #6b7280;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-card__status--claimed {
  background: #ecfdf5;
  color: #059669;
}

.mh5-invite-rebate-card__status--claimable {
  background: #eff6ff;
  color: #2563eb;
}

.mh5-invite-rebate-card__status--locked {
  background: #fff7ed;
  color: #c2410c;
}

.mh5-invite-rebate-card__status--expired,
.mh5-invite-rebate-card__status--cancelled,
.mh5-invite-rebate-card__status--fail {
  background: #fef2f2;
  color: #dc2626;
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
  color: #8a8f98;
  font-size: 11px;
}

.mh5-invite-rebate-card__cell strong {
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-card__amounts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.mh5-invite-rebate-card__amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.mh5-invite-rebate-card__amount span {
  color: #8a8f98;
  font-size: 11px;
}

.mh5-invite-rebate-card__amount strong {
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-card__settled {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px;
}

.mh5-invite-rebate-card__settled em {
  margin: 0 2px;
  font-style: normal;
  color: #c4c4c4;
  font-weight: 500;
}

.mh5-invite-rebate-card__settled--zero {
  color: #9ca3af;
}

.mh5-invite-rebate-card__claim-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mh5-invite-rebate-card__time {
  flex: 1;
  min-width: 0;
  color: #9ca3af;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.mh5-invite-rebate-card__claim-btn {
  flex: none;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.mh5-invite-rebate-card__claim-btn:active {
  background: #1d4ed8;
}

.mh5-invite-rebate-card__claim-disabled,
.mh5-invite-rebate-card__claim-done {
  flex: none;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
}

.mh5-invite-rebate-card__claim-done {
  color: #059669;
}
</style>
