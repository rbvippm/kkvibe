<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { memberAgentMembershipJoined } from '../../constants/agentInvitation'
import { INVITE_FRIENDS_RECORDS_SPEC } from '../../constants/inviteFriendsSpec'
import {
  INVITE_PAGE_SIZE,
  INVITE_TIME_PRESETS,
  INVITE_VIP_OPTIONS,
  INVITER_BOUND_CURRENCY,
  INVITER_BOUND_FIAT_LABEL,
  MOCK_INVITE_FRIENDS,
  createDefaultInviteFilter,
  filterInviteMembers,
  formatInviteAmount,
  resolveInviteTimePresetFromRange,
  summarizeInviteMembers,
  syncInviteFilterDates,
  validateInviteDateRange,
  type InviteFriendMember,
  type InviteRecordsFilter,
  type InviteTimePreset,
} from '../../constants/inviteFriends'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
/** 邀请人仅一种活动币种（区号绑定） */
const boundCurrency = INVITER_BOUND_CURRENCY
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

const summary = computed(() =>
  summarizeInviteMembers(filteredMembers.value, boundCurrency, {
    depositScope: showInviteRebate.value ? 'qualified' : 'all',
  }),
)

const visibleMembers = computed(() => filteredMembers.value.slice(0, page.value * INVITE_PAGE_SIZE))

const hasMore = computed(() => visibleMembers.value.length < filteredMembers.value.length)

watch(
  appliedFilter,
  () => {
    page.value = 1
  },
  { deep: true },
)

onUnmounted(() => {
  filterOpen.value = false
})

function formatRegisterDate(registeredAt: string) {
  return registeredAt.slice(0, 10)
}

function memberAmount(member: InviteFriendMember, field: 'deposit' | 'rebate') {
  return formatInviteAmount(member.totals[boundCurrency][field], boundCurrency)
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
  const next = { ...filterDraft.value, keyword: filterDraft.value.keyword.trim() }
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
    query: { currency: boundCurrency },
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
        <!-- 统计：邀请人绑定币种（单币种） -->
        <div class="mh5-invite-records-summary">
          <span
            v-if="showInviteRebate"
            class="mh5-invite-records-summary__currency"
          >{{ INVITER_BOUND_FIAT_LABEL }}</span>
          <div
            class="mh5-invite-records-summary__metrics"
            :class="{ 'mh5-invite-records-summary__metrics--no-rebate': !showInviteRebate }"
          >
            <div class="mh5-invite-records-summary__item">
              <span class="mh5-invite-records-summary__label">邀请人数</span>
              <strong>{{ summary.inviteCount }}</strong>
            </div>
            <div v-if="showInviteRebate" class="mh5-invite-records-summary__item">
              <span class="mh5-invite-records-summary__label">满足条件</span>
              <strong>{{ summary.eligibleCount }}</strong>
            </div>
            <div class="mh5-invite-records-summary__item">
              <span class="mh5-invite-records-summary__label">累计充值</span>
              <strong>{{ formatInviteAmount(summary.deposit, boundCurrency) }}</strong>
            </div>
            <div v-if="showInviteRebate" class="mh5-invite-records-summary__item">
              <span class="mh5-invite-records-summary__label">累计返利</span>
              <strong class="mh5-invite-records__rebate">
                {{ formatInviteAmount(summary.rebate, boundCurrency) }}
              </strong>
            </div>
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
                <h3 class="mh5-xcoin-filter-group__label">搜索</h3>
                <input
                  v-model="filterDraft.keyword"
                  type="search"
                  class="mh5-xcoin-filter-input mh5-invite-records-filter-search"
                  placeholder="昵称 / 金刚号"
                  enterkeyhint="search"
                />
              </section>

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

.mh5-invite-records-summary {
  position: relative;
  flex-shrink: 0;
  padding: 10px 12px;
  background: linear-gradient(180deg, #fff8f2 0%, #fff5eb 100%);
  border-bottom: 1px solid rgb(255 122 43 / 12%);
}

.mh5-invite-records-summary__currency {
  position: absolute;
  z-index: 1;
  top: 4px;
  left: 8px;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgb(255 122 43 / 14%);
  color: #ff7a2b;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  pointer-events: none;
}

.mh5-invite-records-summary__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.mh5-invite-records-summary__metrics--no-rebate {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mh5-invite-records-summary__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  text-align: center;
}

.mh5-invite-records-summary__label {
  color: var(--mh5-app-text-secondary, #8a8f98);
  font-size: 10px;
  white-space: nowrap;
}

.mh5-invite-records-summary__item strong {
  max-width: 100%;
  color: var(--mh5-app-text, #1a1a1a);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
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
  min-width: 480px;
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

.mh5-invite-records-filter-search {
  width: 100%;
  box-sizing: border-box;
}
</style>
