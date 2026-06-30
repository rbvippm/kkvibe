<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  TEAM_FILTER_TABS,
  MOCK_TEAM_SELF,
  CREATE_ACCOUNT_OPTIONS,
  DEFAULT_CREATE_ACCOUNT_OPTION,
  agentSubordinateLabel,
  getTeamChildren,
  memberKindLabel,
  showAgentSubordinateTag,
  showMemberBadge,
  type CreateAccountOption,
  type TeamFilterTab,
  type TeamListItem,
} from '../../constants/agentTeam'

const router = useRouter()

const teamFilterTab = ref<TeamFilterTab>('all')
const teamSelfExpanded = ref(true)

type TeamQuickAction = 'profit_ratio' | 'remark' | 'agent_credit' | 'member_credit'

const teamQuickMenuRow = ref<TeamListItem | null>(null)
const teamQuickMenuPos = ref({ top: 0, right: 0 })
let skipTeamMenuClose = false

const createAccountSheetOpen = ref(false)
const createAccountSelection = ref<CreateAccountOption>(DEFAULT_CREATE_ACCOUNT_OPTION)
const createAccountDraft = ref<CreateAccountOption>(DEFAULT_CREATE_ACCOUNT_OPTION)

const teamChildRows = computed(() => getTeamChildren(teamFilterTab.value))

function goTeamDetailByNickname(item: TeamListItem) {
  if (showMemberBadge(item.kind)) {
    router.push({ name: 'mobile-member-detail', query: { id: item.id } })
    return
  }
  router.push({ name: 'mobile-agent-detail', query: { id: item.id } })
}

function toggleTeamExpand() {
  teamSelfExpanded.value = !teamSelfExpanded.value
}

function teamRowBadge(item: TeamListItem) {
  return memberKindLabel(item.kind)
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

  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  teamQuickMenuPos.value = {
    top: rect.bottom + 8,
    right: window.innerWidth - rect.right,
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
  if (skipTeamMenuClose) return
  if (teamQuickMenuRow.value) closeTeamQuickMenu()
}

function onTeamQuickAction(action: TeamQuickAction) {
  const row = teamQuickMenuRow.value
  if (!row) return
  closeTeamQuickMenu()

  if (action === 'profit_ratio') {
    window.alert(`设置「${row.nickname}」的收益比例（原型占位）`)
    return
  }

  if (action === 'remark') {
    const next = window.prompt(`为「${row.nickname}」添加备注`, '')
    if (next === null) return
    window.alert(next.trim() ? `备注已保存：${next.trim()}` : '备注已清空')
    return
  }

  if (action === 'member_credit') {
    if (!showMemberBadge(row.kind)) {
      window.alert('会员授信仅支持信用会员')
      return
    }

    router.push({
      name: 'mobile-member-credit',
      query: { targetId: row.id, targetName: row.nickname },
    })
    return
  }

  if (action === 'agent_credit') {
    if (row.kind !== 'agent' && row.kind !== 'credit_agent') {
      window.alert('代理授信仅支持代理账号')
      return
    }

    router.push({
      name: 'mobile-agent-credit',
      query: { targetId: row.id, targetName: row.nickname },
    })
  }
}

function openCreateAccountSheet() {
  closeTeamQuickMenu()
  createAccountDraft.value = createAccountSelection.value
  createAccountSheetOpen.value = true
}

function closeCreateAccountSheet() {
  createAccountSheetOpen.value = false
}

function resetCreateAccountDraft() {
  createAccountDraft.value = DEFAULT_CREATE_ACCOUNT_OPTION
}

function confirmCreateAccount() {
  createAccountSelection.value = createAccountDraft.value
  createAccountSheetOpen.value = false

  if (createAccountDraft.value === 'member_credit') {
    router.push({ name: 'mobile-member-credit' })
    return
  }

  if (createAccountDraft.value === 'agent') {
    window.alert('创建代理账户（原型占位）')
    return
  }

  window.alert('创建会员账户（原型占位）')
}

onMounted(() => {
  document.addEventListener('click', onTeamDocumentClick)
  document.addEventListener('scroll', closeTeamQuickMenu, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onTeamDocumentClick)
  document.removeEventListener('scroll', closeTeamQuickMenu, true)
})
</script>

<template>
  <div class="agent-team-page">
    <header class="agent-team-header">
      <h1 class="agent-team-header__title">团队管理</h1>
      <div class="agent-team-header__actions">
        <button type="button" class="agent-team-header__icon-btn" aria-label="添加成员" @click="openCreateAccountSheet">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="agent-team-header__icon-btn" aria-label="搜索">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
            <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <div class="agent-team-toolbar">
      <div class="agent-team-toolbar__tabs" role="tablist" aria-label="团队筛选">
        <button
          v-for="tab in TEAM_FILTER_TABS"
          :key="tab.key"
          type="button"
          role="tab"
          class="agent-team-filter-pill"
          :class="{ 'agent-team-filter-pill--active': teamFilterTab === tab.key }"
          :aria-selected="teamFilterTab === tab.key"
          @click="teamFilterTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <main class="agent-team-list">
      <div class="agent-team-row agent-team-row--self">
        <div class="agent-team-row__avatar">
          {{ MOCK_TEAM_SELF.avatarEmoji }}
        </div>
        <div class="agent-team-row__main">
          <button
            type="button"
            class="agent-team-row__name agent-team-row__name--link"
            @click="goTeamDetailByNickname(MOCK_TEAM_SELF)"
          >
            {{ MOCK_TEAM_SELF.nickname }}
          </button>
          <div class="agent-team-row__tags">
            <span class="agent-team-tag agent-team-tag--me">我</span>
            <span v-if="MOCK_TEAM_SELF.vipLevel" class="agent-team-tag agent-team-tag--vip">
              ★ V{{ MOCK_TEAM_SELF.vipLevel }}
            </span>
            <span
              v-if="showAgentSubordinateTag(MOCK_TEAM_SELF)"
              class="agent-team-tag agent-team-tag--agent"
            >
              {{ agentSubordinateLabel(MOCK_TEAM_SELF.subordinateCount) }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="agent-team-row__expand"
          :class="{ 'agent-team-row__expand--open': teamSelfExpanded }"
          aria-label="展开下级"
          :aria-expanded="teamSelfExpanded"
          @click.stop="toggleTeamExpand"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <template v-if="teamSelfExpanded">
        <div
          v-for="row in teamChildRows"
          :key="row.id"
          class="agent-team-row agent-team-row--child"
        >
          <div class="agent-team-row__avatar agent-team-row__avatar--placeholder" aria-hidden="true" />
          <div class="agent-team-row__main">
            <button
              type="button"
              class="agent-team-row__name agent-team-row__name--link"
              @click="goTeamDetailByNickname(row)"
            >
              {{ row.nickname }}
            </button>
            <div class="agent-team-row__tags">
              <span v-if="showMemberBadge(row.kind)" class="agent-team-tag agent-team-tag--xcoin">
                {{ teamRowBadge(row) }}
              </span>
              <span v-if="row.vipLevel" class="agent-team-tag agent-team-tag--vip">
                ★ V{{ row.vipLevel }}
              </span>
              <span v-if="showAgentSubordinateTag(row)" class="agent-team-tag agent-team-tag--agent">
                {{ agentSubordinateLabel(row.subordinateCount) }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="agent-team-row__menu"
            :class="{ 'agent-team-row__menu--active': teamQuickMenuRow?.id === row.id }"
            aria-label="更多操作"
            :aria-expanded="teamQuickMenuRow?.id === row.id"
            @click.stop="openTeamQuickMenu(row, $event)"
          >
            ···
          </button>
        </div>
      </template>
    </main>

    <Teleport to="body">
      <div
        v-if="teamQuickMenuRow"
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
          <button type="button" class="agent-team-quick-menu__btn" role="menuitem" @click="onTeamQuickAction('profit_ratio')">
            收益比例
          </button>
          <button type="button" class="agent-team-quick-menu__btn" role="menuitem" @click="onTeamQuickAction('remark')">
            备注
          </button>
          <button
            v-if="teamQuickMenuRow && showMemberBadge(teamQuickMenuRow.kind)"
            type="button"
            class="agent-team-quick-menu__btn"
            role="menuitem"
            @click="onTeamQuickAction('member_credit')"
          >
            会员授信
          </button>
          <button
            v-else-if="teamQuickMenuRow?.kind === 'agent'"
            type="button"
            class="agent-team-quick-menu__btn"
            role="menuitem"
            @click="onTeamQuickAction('agent_credit')"
          >
            代理授信
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to=".mh5-app-shell">
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
              v-for="option in CREATE_ACCOUNT_OPTIONS"
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
  </div>
</template>
