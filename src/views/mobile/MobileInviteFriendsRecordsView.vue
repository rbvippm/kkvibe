<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { memberAgentMembershipJoined } from '../../constants/agentInvitation'
import { INVITE_FRIENDS_RECORDS_SPEC } from '../../constants/inviteFriendsSpec'
import {
  INVITE_FILTER_CURRENCY_OPTIONS,
  INVITE_PAGE_SIZE,
  INVITE_TIME_PRESETS,
  INVITE_VIP_OPTIONS,
  MOCK_INVITE_FRIENDS,
  createDefaultInviteFilter,
  filterInviteMembers,
  formatInviteAmount,
  resolveInviteTimePresetFromRange,
  resolveMemberDisplayCurrency,
  summarizeInviteMembersByCurrency,
  syncInviteFilterDates,
  validateInviteDateRange,
  type InviteCurrency,
  type InviteFriendMember,
  type InviteRecordsFilter,
  type InviteTimePreset,
} from '../../constants/inviteFriends'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
/** 与「我的 → 代理邀请」联动：已加入代理团队则不展示返利 */
const showInviteRebate = computed(() => !memberAgentMembershipJoined.value)

const appliedFilter = ref<InviteRecordsFilter>(createDefaultInviteFilter())
const filterDraft = ref<InviteRecordsFilter>(createDefaultInviteFilter())
const filterOpen = ref(false)
const filterError = ref('')
const page = ref(1)
const loadingMore = ref(false)

const filteredMembers = computed(() =>
  filterInviteMembers(MOCK_INVITE_FRIENDS, appliedFilter.value).sort((a, b) =>
    b.registeredAt.localeCompare(a.registeredAt),
  ),
)

const depositScope = computed<'qualified' | 'all'>(() =>
  showInviteRebate.value ? 'qualified' : 'all',
)

/** 统计忽略币种筛选：KKC / KKV / USDT 各自原生金额，互不换算 */
const summaryMembers = computed(() =>
  filterInviteMembers(MOCK_INVITE_FRIENDS, appliedFilter.value, { ignoreCurrency: true }),
)

const summaryCards = computed(() =>
  summarizeInviteMembersByCurrency(summaryMembers.value, {
    depositScope: depositScope.value,
  }),
)

const visibleMembers = computed(() => filteredMembers.value.slice(0, page.value * INVITE_PAGE_SIZE))

const hasMore = computed(() => visibleMembers.value.length < filteredMembers.value.length)

const summaryCarouselRef = ref<HTMLElement | null>(null)
const summarySlideIndex = ref(0)

function onSummaryCarouselScroll() {
  const el = summaryCarouselRef.value
  if (!el || !el.clientWidth) return
  summarySlideIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}

function scrollSummaryToCurrency(currency: InviteCurrency) {
  const idx = summaryCards.value.findIndex((item) => item.currency === currency)
  summarySlideIndex.value = idx >= 0 ? idx : 0
  nextTick(() => {
    const el = summaryCarouselRef.value
    if (!el || !el.clientWidth) return
    el.scrollTo({ left: summarySlideIndex.value * el.clientWidth })
  })
}

watch(summaryCards, () => scrollSummaryToCurrency(appliedFilter.value.currency), { deep: true })

watch(
  appliedFilter,
  () => {
    page.value = 1
    scrollSummaryToCurrency(appliedFilter.value.currency)
  },
  { deep: true },
)

onUnmounted(() => {
  filterOpen.value = false
})

function formatRegisterDate(registeredAt: string) {
  return registeredAt.slice(0, 10)
}

function memberDisplayCurrency(member: InviteFriendMember): InviteCurrency {
  return resolveMemberDisplayCurrency(member, appliedFilter.value.currency)
}

function memberAmount(
  member: InviteFriendMember,
  field: 'deposit' | 'withdraw' | 'bet' | 'rebate',
) {
  const currency = memberDisplayCurrency(member)
  return formatInviteAmount(member.totals[currency][field], currency)
}

function selectTimePreset(preset: InviteTimePreset) {
  appliedFilter.value = syncInviteFilterDates({
    ...appliedFilter.value,
    timePreset: preset,
  })
}

function openFilter() {
  filterDraft.value = syncInviteFilterDates({ ...appliedFilter.value })
  filterError.value = ''
  filterOpen.value = true
}

function resetFilter() {
  filterDraft.value = createDefaultInviteFilter()
  filterError.value = ''
}

function applyFilter() {
  const next = { ...filterDraft.value }
  if (next.customStart && next.customEnd) {
    next.timePreset = resolveInviteTimePresetFromRange(next.customStart, next.customEnd)
  } else {
    next.timePreset = 'custom'
  }
  const err = validateInviteDateRange(next)
  if (err) {
    filterError.value = err
    return
  }
  appliedFilter.value = syncInviteFilterDates(next)
  filterOpen.value = false
  filterError.value = ''
}

function onDraftDateChange() {
  filterError.value = ''
  if (!filterDraft.value.customStart || !filterDraft.value.customEnd) {
    filterDraft.value.timePreset = 'custom'
    return
  }
  filterDraft.value.timePreset = resolveInviteTimePresetFromRange(
    filterDraft.value.customStart,
    filterDraft.value.customEnd,
  )
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  await new Promise((r) => setTimeout(r, 350))
  page.value += 1
  loadingMore.value = false
}

function openDetail(member: InviteFriendMember) {
  if (!showInviteRebate.value || !member.meetsCondition) return
  router.push({
    name: 'mobile-invite-rebate-detail',
    params: { id: member.id },
    query: { currency: memberDisplayCurrency(member) },
  })
}

function rowClickable(member: InviteFriendMember) {
  return showInviteRebate.value && member.meetsCondition
}

function goBackToInviteFriends() {
  router.push({ name: 'mobile-invite-friends' })
}

function pickDraftVip(value: '' | number) {
  filterDraft.value.vipLevel = value
}

function pickDraftCurrency(value: InviteCurrency) {
  filterDraft.value.currency = value
}
</script>

<template>
  <div class="mh5-invite-records-page mh5-bet-order-page">
    <Mh5SubPageHeader title="邀请好友记录" :on-back="goBackToInviteFriends">
      <template #right>
        <div class="mh5-sub-header__actions">
          <Mh5SpecAnnot :spec="INVITE_FRIENDS_RECORDS_SPEC" placement="bottom" />
          <button type="button" class="mh5-sub-header__action" @click="openFilter">筛选</button>
        </div>
      </template>
    </Mh5SubPageHeader>

    <!-- 时间快捷 -->
    <div class="mh5-bet-order-toolbar">
      <div class="mh5-bet-order-tabs" role="tablist" aria-label="注册时间快捷切换">
        <button
          v-for="tab in INVITE_TIME_PRESETS"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-bet-order-tabs__item"
          :class="{ 'mh5-bet-order-tabs__item--active': appliedFilter.timePreset === tab.key }"
          @click="selectTimePreset(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <main class="mh5-bet-order-main">
      <div v-if="!filteredMembers.length" class="mh5-bet-order-empty">
        <span class="mh5-bet-order-empty__icon" aria-hidden="true">📭</span>
        <p class="mh5-bet-order-empty__title">暂无邀请记录</p>
        <p class="mh5-bet-order-empty__desc">尝试放宽注册时间或更改筛选条件</p>
      </div>

      <template v-else>
        <!-- 统计：按币种 Banner 左右滑动（对齐注单查询汇总轮播） -->
        <div class="mh5-bet-order-summary-carousel mh5-bet-order-summary-carousel--scroll">
          <div
            ref="summaryCarouselRef"
            class="mh5-bet-order-summary-carousel__track"
            @scroll.passive="onSummaryCarouselScroll"
          >
            <div
              v-for="summary in summaryCards"
              :key="summary.currency"
              class="mh5-bet-order-summary mh5-bet-order-summary--slide"
            >
              <span class="mh5-bet-order-summary__currency">{{ summary.currency }}</span>
              <div
                class="mh5-bet-order-summary__metrics"
                :class="{ 'mh5-invite-records-summary__metrics--agent': !showInviteRebate }"
              >
                <div class="mh5-bet-order-summary__item">
                  <span class="mh5-bet-order-summary__label">邀请人数</span>
                  <strong>{{ summary.inviteCount }}</strong>
                </div>
                <template v-if="showInviteRebate">
                  <div class="mh5-bet-order-summary__item">
                    <span class="mh5-bet-order-summary__label">满足条件</span>
                    <strong>{{ summary.eligibleCount }}</strong>
                  </div>
                  <div class="mh5-bet-order-summary__item">
                    <span class="mh5-bet-order-summary__label">累计充值</span>
                    <strong>{{ formatInviteAmount(summary.deposit, summary.currency) }}</strong>
                  </div>
                  <div class="mh5-bet-order-summary__item">
                    <span class="mh5-bet-order-summary__label">累计返利</span>
                    <strong class="mh5-invite-records__rebate">
                      {{ formatInviteAmount(summary.rebate, summary.currency) }}
                    </strong>
                  </div>
                </template>
                <template v-else>
                  <div class="mh5-bet-order-summary__item">
                    <span class="mh5-bet-order-summary__label">累计充值</span>
                    <strong>{{ formatInviteAmount(summary.deposit, summary.currency) }}</strong>
                  </div>
                  <div class="mh5-bet-order-summary__item">
                    <span class="mh5-bet-order-summary__label">累计提款</span>
                    <strong>{{ formatInviteAmount(summary.withdraw, summary.currency) }}</strong>
                  </div>
                  <div class="mh5-bet-order-summary__item">
                    <span class="mh5-bet-order-summary__label">累计投注</span>
                    <strong>{{ formatInviteAmount(summary.bet, summary.currency) }}</strong>
                  </div>
                </template>
              </div>
            </div>
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

        <div class="mh5-invite-records-table-wrap">
          <table
            class="mh5-invite-records-table"
            :class="{ 'mh5-invite-records-table--no-rebate': !showInviteRebate }"
          >
            <thead>
              <tr>
                <th>昵称</th>
                <th>金刚号</th>
                <th>注册时间</th>
                <th>充值金额</th>
                <th v-if="!showInviteRebate">提款金额</th>
                <th v-if="!showInviteRebate">投注金额</th>
                <th v-if="showInviteRebate">返利金额</th>
                <th v-if="showInviteRebate">详情</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in visibleMembers"
                :key="member.id"
                class="mh5-invite-records-table__row"
                :class="{ 'mh5-invite-records-table__row--clickable': rowClickable(member) }"
                :role="rowClickable(member) ? 'button' : undefined"
                :tabindex="rowClickable(member) ? 0 : undefined"
                @click="openDetail(member)"
                @keydown.enter="openDetail(member)"
              >
                <td>
                  <div class="mh5-invite-records-table__name">
                    <span>{{ member.nickname }}</span>
                    <span class="mh5-invite-records-table__vip">VIP{{ member.vipLevel }}</span>
                  </div>
                </td>
                <td>{{ member.diamondId }}</td>
                <td class="mh5-invite-records-table__time">
                  {{ formatRegisterDate(member.registeredAt) }}
                </td>
                <td class="mh5-invite-records-table__num">
                  <template v-if="!showInviteRebate || member.meetsCondition">
                    {{ memberAmount(member, 'deposit') }}
                  </template>
                  <span v-else class="mh5-invite-records-table__na">-</span>
                </td>
                <td v-if="!showInviteRebate" class="mh5-invite-records-table__num">
                  {{ memberAmount(member, 'withdraw') }}
                </td>
                <td v-if="!showInviteRebate" class="mh5-invite-records-table__num">
                  {{ memberAmount(member, 'bet') }}
                </td>
                <td
                  v-if="showInviteRebate"
                  class="mh5-invite-records-table__num mh5-invite-records-table__rebate"
                >
                  <template v-if="member.meetsCondition">
                    {{ memberAmount(member, 'rebate') }}
                  </template>
                  <span v-else class="mh5-invite-records-table__na">-</span>
                </td>
                <td v-if="showInviteRebate">
                  <span v-if="member.meetsCondition" class="mh5-invite-records-table__link">
                    详情
                  </span>
                  <span v-else class="mh5-invite-records-table__na">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mh5-bet-order-load">
          <p class="mh5-bet-order-load__info">
            已加载 {{ visibleMembers.length }} / {{ filteredMembers.length }} 条
          </p>
          <button
            v-if="hasMore"
            type="button"
            class="mh5-bet-order-load__btn"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
          <p v-else class="mh5-bet-order-load__done">没有更多了</p>
        </div>
      </template>
    </main>

    <!-- 筛选：高级筛选 Bottom Sheet -->
    <Teleport to="body">
      <Transition name="mh5-sheet">
        <div v-if="filterOpen" class="mh5-agent-overlay-mask" @click.self="filterOpen = false">
          <div class="mh5-xcoin-sheet mh5-bet-order-sheet">
            <h2 class="mh5-xcoin-sheet__title">高级筛选</h2>
            <p v-if="filterError" class="mh5-bet-order-sheet__error">{{ filterError }}</p>

            <div class="mh5-bet-order-sheet__body">
              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">注册时间区间</h3>
                <div class="mh5-bet-order-date-row">
                  <input
                    v-model="filterDraft.customStart"
                    type="date"
                    class="mh5-xcoin-filter-input"
                    @change="onDraftDateChange"
                  />
                  <span>至</span>
                  <input
                    v-model="filterDraft.customEnd"
                    type="date"
                    class="mh5-xcoin-filter-input"
                    @change="onDraftDateChange"
                  />
                </div>
                <p class="mh5-xcoin-filter-hint">
                  与顶部「今天 / 昨天 / 本周 / 本月」联动；区间与快捷 Tab 一致时自动选中对应 Tab，最长 90 天
                </p>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">币种</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in INVITE_FILTER_CURRENCY_OPTIONS"
                    :key="`currency-${opt.label}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.currency === opt.value }"
                    @click="pickDraftCurrency(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <p class="mh5-xcoin-filter-hint">按活动币种筛选被邀请人与统计，默认 KKC</p>
              </section>

              <section class="mh5-xcoin-filter-group">
                <h3 class="mh5-xcoin-filter-group__label">VIP 等级</h3>
                <div class="mh5-xcoin-filter-chips">
                  <button
                    v-for="opt in INVITE_VIP_OPTIONS"
                    :key="`vip-${opt.label}`"
                    type="button"
                    class="mh5-xcoin-chip"
                    :class="{ 'mh5-xcoin-chip--active': filterDraft.vipLevel === opt.value }"
                    @click="pickDraftVip(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>
            </div>

            <div class="mh5-xcoin-sheet__footer mh5-bet-order-sheet__footer">
              <button type="button" class="mh5-xcoin-btn mh5-xcoin-btn--ghost" @click="resetFilter">
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
.mh5-invite-records-page {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: var(--mh5-app-bg, #f5f6f8);
}

.mh5-invite-records__rebate {
  color: #16a34a !important;
}

.mh5-invite-records-summary__metrics--agent {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.mh5-bet-order-summary__item strong {
  max-width: 100%;
  font-size: 12px;
  line-height: 1.25;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.mh5-invite-records-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--mh5-app-card, #fff);
}

.mh5-invite-records-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: auto;
  background: var(--mh5-app-card, #fff);
}

.mh5-invite-records-table--no-rebate {
  min-width: 720px;
}

.mh5-invite-records-table th,
.mh5-invite-records-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.mh5-invite-records-table th {
  color: var(--mh5-app-text-secondary, #999);
  font-weight: 500;
  background: var(--mh5-app-card, #fff);
}

.mh5-invite-records-table td {
  color: var(--mh5-app-text, #333);
}

.mh5-invite-records-table__row--clickable {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.mh5-invite-records-table__row--clickable:active {
  background: #fafafa;
}

.mh5-invite-records-table__name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mh5-invite-records-table__vip {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b8);
  color: #c45a00;
  font-size: 10px;
  font-weight: 700;
}

.mh5-invite-records-table__time {
  color: #888;
  font-size: 12px;
}

.mh5-invite-records-table__num {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.mh5-invite-records-table__rebate {
  color: #16a34a;
}

.mh5-invite-records-table__link {
  color: #ff8a1f;
  font-size: 13px;
  font-weight: 600;
}

.mh5-invite-records-table__na {
  color: #ccc;
}
</style>
