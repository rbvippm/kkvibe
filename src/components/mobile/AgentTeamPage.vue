<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mh5Alert } from '../../composables/useMh5Confirm'
import {
  TEAM_FILTER_TABS,
  TEAM_SEARCH_HINT,
  TEAM_TREE_DEFAULT_EXPANDED,
  TEAM_TREE_DEFAULT_VISIBLE,
  CREATE_ACCOUNT_OPTIONS,
  DEFAULT_CREATE_ACCOUNT_OPTION,
  canShowAgentCreditAction,
  canShowMemberCreditAction,
  collectTeamFullExpandState,
  formatTeamMemberBetSearchKeyword,
  getTeamTreeRows,
  isCreditTeamKind,
  memberKindLabel,
  buildTeamSearchRoot,
  collectSearchExpandIds,
  getSearchTeamTreeRows,
  showAgentSubordinateTag,
  showMemberBadge,
  teamStatsLabel,
  updateTeamMemberRemark,
  type CreateAccountOption,
  type TeamFilterTab,
  type TeamListItem,
} from '../../constants/agentTeam'
import { agentSentInvites } from '../../constants/agentInvitation'
import {
  AGENT_TEAM_QUICK_ACTIONS_SPEC,
  AGENT_TEAM_REBATE_SPEC,
  AGENT_TEAM_SEARCH_SPEC,
} from '../../constants/agentTeamSpec'
import { setBetOrderSearchSeed } from '../../composables/useBetOrderSearchSeed'
import { useAgentIdentity } from '../../composables/useAgentIdentity'
import Mh5SpecAnnot from './Mh5SpecAnnot.vue'

const route = useRoute()
const router = useRouter()
const { isRebateAgent, withAgentQuery, agentTypeLabel } = useAgentIdentity()

const createAccountOptions = computed(() =>
  isRebateAgent.value
    ? CREATE_ACCOUNT_OPTIONS.filter((item) => item.key === 'member')
    : CREATE_ACCOUNT_OPTIONS,
)

/** 占成：完整筛选 Tab；返佣无 Tab，固定只看直属会员 */
const teamFilterTabs = computed(() => TEAM_FILTER_TABS)

const teamFilterTab = ref<TeamFilterTab>(isRebateAgent.value ? 'direct_member' : 'all')

/** 返佣固定「直属会员」，不提供全部/直属代理切换 */
const effectiveTeamFilterTab = computed<TeamFilterTab>(() =>
  isRebateAgent.value ? 'direct_member' : teamFilterTab.value,
)

watch(isRebateAgent, (rebate) => {
  if (rebate) {
    teamFilterTab.value = 'direct_member'
    applyFilterExpand('direct_member')
    return
  }
  if (teamFilterTab.value === 'credit_agent' || teamFilterTab.value === 'credit_member') {
    teamFilterTab.value = 'all'
  }
  if (teamFilterTab.value === 'all') applyFilterExpand('all')
})
const expandedIds = ref<Set<string>>(new Set(TEAM_TREE_DEFAULT_EXPANDED))
/** parentId → 该层已展开可见条数（「查看更多」累加） */
const moreVisibleCount = ref<Record<string, number>>({})

const teamTreeOptions = computed(() => ({
  includeCredit: !isRebateAgent.value,
  singleLayer: isRebateAgent.value,
  flatDirectMembers: isRebateAgent.value,
}))

function applyFilterExpand(tab: TeamFilterTab) {
  if (tab === 'all') {
    const state = collectTeamFullExpandState('all', teamTreeOptions.value)
    expandedIds.value = state.expandedIds
    moreVisibleCount.value = state.moreVisibleCount
    return
  }
  moreVisibleCount.value = {}
  expandedIds.value = new Set(TEAM_TREE_DEFAULT_EXPANDED)
}

applyFilterExpand(effectiveTeamFilterTab.value)

type TeamQuickAction =
  | 'profit_ratio'
  | 'rebate_ratio'
  | 'remark'
  | 'bet_order'
  | 'agent_credit'
  | 'member_credit'

const teamQuickMenuRow = ref<TeamListItem | null>(null)
const teamQuickMenuPos = ref({ top: 0, right: 0 })
let skipTeamMenuClose = false
/** 占成用底部抽屉；返佣操作少，仍用行内浮层 */
const useQuickActionSheet = computed(() => !isRebateAgent.value)

const teamQuickActions = computed(() => {
  const row = teamQuickMenuRow.value
  if (!row) return []
  const actions: { key: TeamQuickAction; label: string }[] = []
  if (!isRebateAgent.value) {
    if (showMemberBadge(row.kind)) actions.push({ key: 'rebate_ratio', label: '退水比例' })
    else actions.push({ key: 'profit_ratio', label: '收益比例' })
  }
  actions.push({ key: 'remark', label: '备注' }, { key: 'bet_order', label: '注单查询' })
  if (!isRebateAgent.value && canShowMemberCreditAction(row.kind)) {
    actions.push({ key: 'member_credit', label: '会员授信' })
  } else if (!isRebateAgent.value && canShowAgentCreditAction(row.kind)) {
    actions.push({ key: 'agent_credit', label: '代理授信' })
  }
  return actions
})

const createAccountSheetOpen = ref(false)
const createAccountSelection = ref<CreateAccountOption>(DEFAULT_CREATE_ACCOUNT_OPTION)
const createAccountDraft = ref<CreateAccountOption>(DEFAULT_CREATE_ACCOUNT_OPTION)

/** 顶栏搜索 Sheet：搜索前仅提示；搜索后展示树结果 */
const teamSearchOpen = ref(false)
const teamSearchDraft = ref('')
const teamSearchKeyword = ref('')
const teamSearchSubmitted = ref(false)
const teamSearchExpandedIds = ref<Set<string>>(new Set())

const teamSearchRoot = computed(() => {
  if (!teamSearchSubmitted.value) return null
  return buildTeamSearchRoot(teamSearchKeyword.value, {
    includeSelf: !isRebateAgent.value,
    flatDirectMembers: isRebateAgent.value,
    includeCredit: !isRebateAgent.value,
  })
})

const teamSearchRows = computed(() =>
  getSearchTeamTreeRows(
    teamSearchRoot.value,
    teamSearchExpandedIds.value,
    isRebateAgent.value,
  ),
)

const teamSearchEmpty = computed(
  () => teamSearchSubmitted.value && teamSearchRows.value.length === 0,
)

const teamSearchInputRef = ref<HTMLInputElement | null>(null)

async function openTeamSearch() {
  closeTeamQuickMenu()
  closeCreateAccountSheet()
  teamSearchOpen.value = true
  teamSearchDraft.value = ''
  teamSearchKeyword.value = ''
  teamSearchSubmitted.value = false
  teamSearchExpandedIds.value = new Set()
  await nextTick()
  teamSearchInputRef.value?.focus()
}

function closeTeamSearch() {
  teamSearchOpen.value = false
  teamSearchDraft.value = ''
  teamSearchKeyword.value = ''
  teamSearchSubmitted.value = false
  teamSearchExpandedIds.value = new Set()
}

function clearTeamSearchDraft() {
  teamSearchDraft.value = ''
  if (teamSearchSubmitted.value) {
    teamSearchKeyword.value = ''
    teamSearchSubmitted.value = false
    teamSearchExpandedIds.value = new Set()
  }
}

function submitTeamSearch() {
  const q = teamSearchDraft.value.trim()
  teamSearchDraft.value = q
  teamSearchKeyword.value = q
  teamSearchSubmitted.value = true
  if (!q) {
    teamSearchExpandedIds.value = new Set()
    return
  }
  const root = buildTeamSearchRoot(q, {
    includeSelf: !isRebateAgent.value,
    flatDirectMembers: isRebateAgent.value,
    includeCredit: !isRebateAgent.value,
  })
  teamSearchExpandedIds.value = new Set(collectSearchExpandIds(root))
}

function isSearchExpanded(id: string) {
  return teamSearchExpandedIds.value.has(id)
}

function toggleSearchExpand(id: string) {
  const next = new Set(teamSearchExpandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  teamSearchExpandedIds.value = next
}

function searchTreeRowKey(row: (typeof teamSearchRows.value)[number]) {
  if (row.type === 'more') return `search-more-${row.parentId}`
  return `search-${row.item.id}`
}

const teamTreeRows = computed(() =>
  getTeamTreeRows(
    effectiveTeamFilterTab.value,
    expandedIds.value,
    moreVisibleCount.value,
    teamTreeOptions.value,
  ),
)

function treeRowKey(row: (typeof teamTreeRows.value)[number]) {
  if (row.type === 'more') return `more-${row.parentId}-${row.depth}`
  return row.item.id
}

function showMoreChildren(parentId: string) {
  const current = moreVisibleCount.value[parentId] ?? TEAM_TREE_DEFAULT_VISIBLE
  moreVisibleCount.value = {
    ...moreVisibleCount.value,
    [parentId]: current + TEAM_TREE_DEFAULT_VISIBLE,
  }
}

watch(teamFilterTab, (tab) => {
  if (isRebateAgent.value) return
  applyFilterExpand(tab)
})

const pendingInviteCount = computed(
  () => agentSentInvites.value.filter((item) => item.status === 'pending').length,
)

function goTeamDetailByNickname(item: TeamListItem) {
  if (showMemberBadge(item.kind)) {
    router.push({ name: 'mobile-member-detail', query: withAgentQuery({ id: item.id }) })
    return
  }
  router.push({ name: 'mobile-agent-detail', query: withAgentQuery({ id: item.id }) })
}

function isExpanded(id: string) {
  return expandedIds.value.has(id)
}

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

function openTeamQuickMenu(row: TeamListItem, event: MouseEvent) {
  event.stopPropagation()
  skipTeamMenuClose = true

  if (teamQuickMenuRow.value?.id === row.id) {
    closeTeamQuickMenu()
    requestAnimationFrame(() => {
      skipTeamMenuClose = false
    })
    return
  }

  if (!useQuickActionSheet.value) {
    const btn = event.currentTarget as HTMLElement
    const rect = btn.getBoundingClientRect()
    teamQuickMenuPos.value = {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    }
  }
  teamQuickMenuRow.value = row

  requestAnimationFrame(() => {
    skipTeamMenuClose = false
  })
}

function closeTeamQuickMenu() {
  teamQuickMenuRow.value = null
}

function onTeamDocumentClick() {
  if (useQuickActionSheet.value) return
  if (skipTeamMenuClose) return
  if (teamQuickMenuRow.value) closeTeamQuickMenu()
}

function onTeamDocumentScroll() {
  if (useQuickActionSheet.value) return
  closeTeamQuickMenu()
}

async function onTeamQuickAction(action: TeamQuickAction) {
  const row = teamQuickMenuRow.value
  if (!row) return

  if (action === 'bet_order') {
    const keyword = formatTeamMemberBetSearchKeyword(row)
    setBetOrderSearchSeed(keyword)
    closeTeamQuickMenu()
    await router.replace({
      name: 'mobile-agent',
      query: withAgentQuery({ tab: 'bet-order', keyword }),
    })
    return
  }

  closeTeamQuickMenu()

  if (action === 'profit_ratio') {
    if (row.kind !== 'agent' && row.kind !== 'credit_agent') {
      await mh5Alert('收益比例仅支持代理账号')
      return
    }

    router.push({
      name: 'mobile-agent-profit-ratio',
      query: withAgentQuery({
        targetId: row.id,
        targetName: row.nickname,
        relation: 'direct',
        kind: row.kind,
        /** 全部 / 信用代理等任意入口：授信过即带标记，收益比例页展示现金/信用 Tab */
        credited: row.kind === 'credit_agent' ? '1' : '0',
      }),
    })
    return
  }

  if (action === 'rebate_ratio') {
    if (!showMemberBadge(row.kind)) {
      await mh5Alert('退水比例仅支持会员账号')
      return
    }

    router.push({
      name: 'mobile-member-rebate-ratio',
      query: withAgentQuery({
        targetId: row.id,
        targetName: row.nickname,
        relation: 'direct',
        kind: row.kind,
        credited: row.kind === 'credit_member' ? '1' : '0',
      }),
    })
    return
  }

  if (action === 'remark') {
    const next = window.prompt(`为「${row.nickname}」添加备注`, row.remark ?? '')
    if (next === null) return
    updateTeamMemberRemark(row.id, next)
    await mh5Alert(next.trim() ? `备注已保存：${next.trim()}` : '备注已清空')
    return
  }

  if (action === 'member_credit') {
    if (isRebateAgent.value) {
      await mh5Alert('返佣代理不支持会员授信，请使用占成代理入口')
      return
    }
    if (!canShowMemberCreditAction(row.kind)) {
      await mh5Alert(row.kind === 'credit_member' ? '该会员已授信，无需再次授信' : '会员授信仅支持直属会员')
      return
    }

    router.push({
      name: 'mobile-member-credit',
      query: withAgentQuery({ targetId: row.id, targetName: row.nickname }),
    })
    return
  }

  if (action === 'agent_credit') {
    if (isRebateAgent.value) {
      await mh5Alert('返佣代理不支持代理授信，请使用占成代理入口')
      return
    }
    if (!canShowAgentCreditAction(row.kind)) {
      await mh5Alert(row.kind === 'credit_agent' ? '该代理已授信，无需再次授信' : '代理授信仅支持代理账号')
      return
    }

    router.push({
      name: 'mobile-agent-credit',
      query: withAgentQuery({ targetId: row.id, targetName: row.nickname }),
    })
  }
}

function openCreateAccountSheet() {
  closeTeamQuickMenu()
  closeTeamSearch()
  const allowed = createAccountOptions.value.map((item) => item.key)
  const preferred = createAccountSelection.value
  createAccountDraft.value = allowed.includes(preferred) ? preferred : (allowed[0] ?? 'agent')
  createAccountSheetOpen.value = true
}

function closeCreateAccountSheet() {
  createAccountSheetOpen.value = false
}

function goInviteRecords() {
  closeTeamQuickMenu()
  router.push({ name: 'mobile-agent-invite-records', query: withAgentQuery() })
}

function closeAllSheets() {
  createAccountSheetOpen.value = false
  closeTeamSearch()
  closeTeamQuickMenu()
}

watch(
  () => route.fullPath,
  () => {
    closeAllSheets()
  },
)

function resetCreateAccountDraft() {
  createAccountDraft.value = isRebateAgent.value ? 'member' : DEFAULT_CREATE_ACCOUNT_OPTION
}

async function confirmCreateAccount() {
  createAccountSelection.value = createAccountDraft.value
  createAccountSheetOpen.value = false

  if (createAccountDraft.value === 'invite_existing') {
    router.push({ name: 'mobile-agent-invite-member', query: withAgentQuery() })
    return
  }

  if (createAccountDraft.value === 'member_credit') {
    if (isRebateAgent.value) {
      await mh5Alert('返佣代理不支持会员授信')
      return
    }
    router.push({ name: 'mobile-member-credit', query: withAgentQuery() })
    return
  }

  if (createAccountDraft.value === 'agent') {
    router.push({ name: 'mobile-agent-create-account', query: withAgentQuery() })
    return
  }

  if (createAccountDraft.value === 'member') {
    if (isRebateAgent.value) {
      router.push({ name: 'mobile-agent-create-member', query: withAgentQuery() })
      return
    }
    await mh5Alert('创建会员账户（占成代理原型占位）')
    return
  }

  await mh5Alert('创建账户（原型占位）')
}

onMounted(() => {
  document.addEventListener('click', onTeamDocumentClick)
  document.addEventListener('scroll', onTeamDocumentScroll, true)
})

onBeforeUnmount(() => {
  closeAllSheets()
})

onUnmounted(() => {
  document.removeEventListener('click', onTeamDocumentClick)
  document.removeEventListener('scroll', onTeamDocumentScroll, true)
})
</script>

<template>
  <div class="agent-team-page">
    <header class="agent-team-header">
      <h1 class="agent-team-header__title">{{ $t('团队管理') }}<span class="agent-team-header__identity">{{ agentTypeLabel }}</span>
        <Mh5SpecAnnot
          v-if="isRebateAgent"
          :spec="AGENT_TEAM_REBATE_SPEC"
          placement="bottom"
        />
        <Mh5SpecAnnot
          v-else
          :spec="AGENT_TEAM_QUICK_ACTIONS_SPEC"
          placement="bottom"
        />
      </h1>
      <div class="agent-team-header__actions">
        <button
          v-if="!isRebateAgent"
          type="button"
          class="agent-team-header__icon-btn agent-team-header__icon-btn--invite"
          :aria-label="$t('我的邀请记录')"
          @click="goInviteRecords"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5V8a1.5 1.5 0 0 1 1.5-1.5Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="m4 8 8 5.5L20 8"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="pendingInviteCount" class="agent-team-header__badge">{{ pendingInviteCount }}</span>
        </button>
        <button type="button" class="agent-team-header__icon-btn" :aria-label="$t('添加成员')" @click="openCreateAccountSheet">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <span class="agent-team-header__search-wrap">
          <button type="button" class="agent-team-header__icon-btn" :aria-label="$t('搜索')" @click="openTeamSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
              <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
          <Mh5SpecAnnot class="agent-team-header__search-annot" :spec="AGENT_TEAM_SEARCH_SPEC" placement="bottom" />
        </span>
      </div>
    </header>

    <div v-if="!isRebateAgent" class="agent-team-toolbar">
      <div class="agent-team-toolbar__tabs" role="tablist" :aria-label="$t('团队筛选')">
        <button
          v-for="tab in teamFilterTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="agent-team-filter-pill"
          :class="{ 'agent-team-filter-pill--active': teamFilterTab === tab.key }"
          :aria-selected="teamFilterTab === tab.key"
          @click="teamFilterTab = tab.key"
        >
          {{ $t(tab.label) }}
        </button>
      </div>
      <button type="button" class="agent-team-toolbar__sort" :aria-label="$t('排序')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h12M4 12h8M4 17h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>{{ $t('排序') }}</button>
    </div>

    <main class="agent-team-list">
      <div class="agent-team-list__track">
        <template v-for="row in teamTreeRows" :key="treeRowKey(row)">
          <!-- 查看更多：对齐 Figma 两侧虚线 + 文案 -->
          <button
            v-if="row.type === 'more'"
            type="button"
            class="agent-team-more"
            :style="{ paddingLeft: `${12 + row.depth * 18}px` }"
            @click="showMoreChildren(row.parentId)"
          >
            <span class="agent-team-more__line" aria-hidden="true" />
            <span class="agent-team-more__label">{{ $t('查看更多') }}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="agent-team-more__line" aria-hidden="true" />
          </button>

          <div
            v-else
            class="agent-team-row"
            :class="{
              'agent-team-row--self': row.item.kind === 'me',
              'agent-team-row--member': showMemberBadge(row.item.kind),
            }"
            :style="{ paddingLeft: `${12 + row.depth * 18}px` }"
          >
            <div class="agent-team-row__body">
              <button
                v-if="row.hasChildren"
                type="button"
                class="agent-team-row__caret"
                :class="{ 'agent-team-row__caret--open': isExpanded(row.item.id) }"
                :aria-label="$t('展开下级')"
                :aria-expanded="isExpanded(row.item.id)"
                @click.stop="toggleExpand(row.item.id)"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <path d="M2 1.2 8 5 2 8.8V1.2Z" />
                </svg>
              </button>
              <span v-else class="agent-team-row__caret-spacer" aria-hidden="true" />

              <div class="agent-team-row__avatar" :class="{ 'agent-team-row__avatar--online': row.item.online }">
                <span>{{ row.item.avatarEmoji || '👤' }}</span>
              </div>

              <div class="agent-team-row__main">
                <button
                  type="button"
                  class="agent-team-row__name agent-team-row__name--link"
                  @click="goTeamDetailByNickname(row.item)"
                >
                  {{ row.item.nickname }}
                </button>
                <div class="agent-team-row__tags">
                  <span v-if="row.item.kind === 'me'" class="agent-team-tag agent-team-tag--me">{{ $t('我') }}</span>
                  <span
                    v-if="effectiveTeamFilterTab === 'all' && isCreditTeamKind(row.item.kind)"
                    class="agent-team-tag agent-team-tag--credit"
                  >{{ $t('信用') }}</span>
                  <!-- Figma 1433:19549：VIP 钻石切面 + 组织人数图标 + 代/会文案 -->
                  <span
                    v-if="showAgentSubordinateTag(row.item)"
                    class="agent-team-tag agent-team-tag--stats"
                  >
                    <span
                      v-if="row.item.vipLevel"
                      class="agent-team-vip-badge"
                      :aria-label="`V${row.item.vipLevel}`"
                    >
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--1" src="/images/agent-team/vip-f1.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--2" src="/images/agent-team/vip-f2.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--3" src="/images/agent-team/vip-f3.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--4" src="/images/agent-team/vip-f4.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--5" src="/images/agent-team/vip-f5.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--6" src="/images/agent-team/vip-f6.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--7" src="/images/agent-team/vip-f7.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--8" src="/images/agent-team/vip-f8.svg" alt="" draggable="false" />
                      <img class="agent-team-vip-badge__f agent-team-vip-badge__f--9" src="/images/agent-team/vip-f9.svg" alt="" draggable="false" />
                      <span class="agent-team-vip-badge__text">
                        <i>V</i>{{ row.item.vipLevel }}
                      </span>
                    </span>
                    <img
                      class="agent-team-org-icon"
                      src="/images/agent-team/org-tree.svg"
                      alt=""
                      width="10"
                      height="10"
                      draggable="false"
                    />
                    <span class="agent-team-tag__stats-text">{{ teamStatsLabel(row.item) }}</span>
                  </span>
                  <span v-else-if="showMemberBadge(row.item.kind)" class="agent-team-tag agent-team-tag--member">
                    {{ memberKindLabel(row.item.kind) }}
                  </span>
                </div>
              </div>
            </div>

            <button
              v-if="row.item.kind !== 'me'"
              type="button"
              class="agent-team-row__menu"
              :class="{ 'agent-team-row__menu--active': teamQuickMenuRow?.id === row.item.id }"
              :aria-label="$t('更多操作')"
              :aria-expanded="teamQuickMenuRow?.id === row.item.id"
              @click.stop="openTeamQuickMenu(row.item, $event)"
            >
              <svg
                class="agent-team-row__menu-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="4" cy="10" r="1.75" fill="currentColor" />
                <circle cx="10" cy="10" r="1.75" fill="currentColor" />
                <circle cx="16" cy="10" r="1.75" fill="currentColor" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </main>

    <Teleport to="body">
      <div
        v-if="isRebateAgent && teamQuickMenuRow"
        class="agent-team-quick-menu"
        :style="{ top: `${teamQuickMenuPos.top}px`, right: `${teamQuickMenuPos.right}px` }"
        role="menu"
        @click.stop
      >
        <p class="agent-team-quick-menu__title">
          <span class="agent-team-quick-menu__accent" aria-hidden="true" />
          对
          <strong>{{ teamQuickMenuRow.nickname }}</strong>
          的更多快捷操作
        </p>
        <div class="agent-team-quick-menu__actions">
          <button
            v-for="action in teamQuickActions"
            :key="action.key"
            type="button"
            class="agent-team-quick-menu__btn"
            role="menuitem"
            @click.stop="onTeamQuickAction(action.key)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <Transition name="agent-team-create-sheet">
        <div
          v-if="useQuickActionSheet && teamQuickMenuRow"
          class="mh5-agent-overlay-mask agent-team-quick-sheet-mask"
          @click.self="closeTeamQuickMenu"
        >
          <div
            class="mh5-agent-overlay-sheet agent-team-create-sheet agent-team-quick-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-quick-sheet-title"
          >
            <div class="agent-team-create-sheet__head">
              <h2 id="team-quick-sheet-title" class="agent-team-create-sheet__title">更多快捷操作</h2>
              <button
                type="button"
                class="agent-team-create-sheet__close"
                aria-label="关闭"
                @click="closeTeamQuickMenu"
              >
                ×
              </button>
            </div>
            <p class="agent-team-quick-sheet__target">
              对
              <strong>{{ teamQuickMenuRow.nickname }}</strong>
              操作
            </p>
            <div v-if="teamQuickActions.length" class="agent-team-create-sheet__options">
              <button
                v-for="action in teamQuickActions"
                :key="action.key"
                type="button"
                class="agent-team-create-sheet__option agent-team-quick-sheet__option"
                @click="onTeamQuickAction(action.key)"
              >
                <span class="agent-team-create-sheet__label">{{ action.label }}</span>
                <svg class="agent-team-quick-sheet__chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
                  <path d="M1 1.5 6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            <p v-else class="agent-team-quick-sheet__empty">暂无可用操作</p>
            <button
              type="button"
              class="agent-team-quick-sheet__cancel"
              @click="closeTeamQuickMenu"
            >
              取消
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="agent-team-create-sheet">
        <div v-if="createAccountSheetOpen" class="agent-team-create-sheet-mask" @click.self="closeCreateAccountSheet">
          <div class="agent-team-create-sheet" role="dialog" aria-modal="true" aria-labelledby="create-account-title">
            <div class="agent-team-create-sheet__head">
              <h2 id="create-account-title" class="agent-team-create-sheet__title">创建账户</h2>
              <button type="button" class="agent-team-create-sheet__close" aria-label="关闭" @click="closeCreateAccountSheet">
                ×
              </button>
            </div>
            <div class="agent-team-create-sheet__options">
              <button
                v-for="option in createAccountOptions"
                :key="option.key"
                type="button"
                class="agent-team-create-sheet__option"
                :class="{ 'agent-team-create-sheet__option--active': createAccountDraft === option.key }"
                @click="createAccountDraft = option.key"
              >
                <span class="agent-team-create-sheet__label">{{ option.label }}</span>
                <span
                  class="agent-team-create-sheet__check"
                  :class="{ 'agent-team-create-sheet__check--active': createAccountDraft === option.key }"
                  aria-hidden="true"
                >
                  <svg
                    v-if="createAccountDraft === option.key"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6.2 5 8.7 9.5 3.8"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
            <div class="agent-team-create-sheet__footer">
              <button type="button" class="agent-team-create-sheet__btn agent-team-create-sheet__btn--ghost" @click="resetCreateAccountDraft">
                重置
              </button>
              <button type="button" class="agent-team-create-sheet__btn agent-team-create-sheet__btn--primary" @click="confirmCreateAccount">
                确定
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="agent-team-search-sheet">
        <div
          v-if="teamSearchOpen"
          class="mh5-agent-overlay-mask agent-team-search-mask"
          @click.self="closeTeamSearch"
        >
          <div
            class="mh5-agent-overlay-sheet agent-team-search-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="搜索团队成员"
          >
            <div class="agent-team-search-sheet__bar">
              <label class="agent-team-search-sheet__field">
                <svg class="agent-team-search-sheet__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
                  <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
                <input
                  ref="teamSearchInputRef"
                  v-model="teamSearchDraft"
                  type="search"
                  class="agent-team-search-sheet__input"
                  placeholder="昵称 / 金刚号 / 备注"
                  enterkeyhint="search"
                  autocomplete="off"
                  @keydown.enter.prevent="submitTeamSearch"
                />
                <button
                  v-if="teamSearchDraft"
                  type="button"
                  class="agent-team-search-sheet__clear"
                  aria-label="清空"
                  @click="clearTeamSearchDraft"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="6.2" fill="#c8c8c8" />
                    <path d="M4.6 4.6 9.4 9.4M9.4 4.6 4.6 9.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" />
                  </svg>
                </button>
              </label>
              <button type="button" class="agent-team-search-sheet__submit" @click="submitTeamSearch">
                搜索
              </button>
            </div>

            <p class="agent-team-search-sheet__hint">{{ TEAM_SEARCH_HINT }}</p>

            <div v-if="teamSearchSubmitted" class="agent-team-search-sheet__results">
              <p v-if="teamSearchEmpty" class="agent-team-search-sheet__empty">未找到匹配成员</p>
              <template v-else>
                <div
                  v-for="row in teamSearchRows"
                  :key="searchTreeRowKey(row)"
                  class="agent-team-row agent-team-search-sheet__row"
                  :class="{
                    'agent-team-row--self': row.type === 'node' && row.item.kind === 'me',
                    'agent-team-row--member': row.type === 'node' && showMemberBadge(row.item.kind),
                  }"
                  :style="row.type === 'node' ? { paddingLeft: `${12 + row.depth * 18}px` } : undefined"
                >
                  <template v-if="row.type === 'node'">
                    <div class="agent-team-row__body">
                      <button
                        v-if="row.hasChildren"
                        type="button"
                        class="agent-team-row__caret"
                        :class="{ 'agent-team-row__caret--open': isSearchExpanded(row.item.id) }"
                        aria-label="展开下级"
                        :aria-expanded="isSearchExpanded(row.item.id)"
                        @click.stop="toggleSearchExpand(row.item.id)"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                          <path d="M2 1.2 8 5 2 8.8V1.2Z" />
                        </svg>
                      </button>
                      <span v-else class="agent-team-row__caret-spacer" aria-hidden="true" />

                      <div class="agent-team-row__avatar" :class="{ 'agent-team-row__avatar--online': row.item.online }">
                        <span>{{ row.item.avatarEmoji || '👤' }}</span>
                      </div>

                      <div class="agent-team-row__main">
                        <button
                          type="button"
                          class="agent-team-row__name agent-team-row__name--link"
                          @click="goTeamDetailByNickname(row.item)"
                        >
                          {{ row.item.nickname }}
                        </button>
                        <div class="agent-team-row__tags">
                          <span v-if="row.item.kind === 'me'" class="agent-team-tag agent-team-tag--me">我</span>
                          <span
                            v-if="!isRebateAgent && isCreditTeamKind(row.item.kind)"
                            class="agent-team-tag agent-team-tag--credit"
                          >
                            信用
                          </span>
                          <span
                            v-if="showAgentSubordinateTag(row.item)"
                            class="agent-team-tag agent-team-tag--stats"
                          >
                            <span
                              v-if="row.item.vipLevel"
                              class="agent-team-vip-badge"
                              :aria-label="`V${row.item.vipLevel}`"
                            >
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--1" src="/images/agent-team/vip-f1.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--2" src="/images/agent-team/vip-f2.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--3" src="/images/agent-team/vip-f3.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--4" src="/images/agent-team/vip-f4.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--5" src="/images/agent-team/vip-f5.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--6" src="/images/agent-team/vip-f6.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--7" src="/images/agent-team/vip-f7.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--8" src="/images/agent-team/vip-f8.svg" alt="" draggable="false" />
                              <img class="agent-team-vip-badge__f agent-team-vip-badge__f--9" src="/images/agent-team/vip-f9.svg" alt="" draggable="false" />
                              <span class="agent-team-vip-badge__text">
                                <i>V</i>{{ row.item.vipLevel }}
                              </span>
                            </span>
                            <img
                              class="agent-team-org-icon"
                              src="/images/agent-team/org-tree.svg"
                              alt=""
                              width="10"
                              height="10"
                              draggable="false"
                            />
                            <span class="agent-team-tag__stats-text">{{ teamStatsLabel(row.item) }}</span>
                          </span>
                          <span v-else-if="showMemberBadge(row.item.kind)" class="agent-team-tag agent-team-tag--member">
                            {{ memberKindLabel(row.item.kind) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      v-if="row.item.kind !== 'me'"
                      type="button"
                      class="agent-team-row__menu"
                      :class="{ 'agent-team-row__menu--active': teamQuickMenuRow?.id === row.item.id }"
                      :aria-label="$t('更多操作')"
                      :aria-expanded="teamQuickMenuRow?.id === row.item.id"
                      @click.stop="openTeamQuickMenu(row.item, $event)"
                    >
                      <svg class="agent-team-row__menu-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <circle cx="4" cy="10" r="1.75" fill="currentColor" />
                        <circle cx="10" cy="10" r="1.75" fill="currentColor" />
                        <circle cx="16" cy="10" r="1.75" fill="currentColor" />
                      </svg>
                    </button>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
