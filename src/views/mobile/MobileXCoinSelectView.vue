<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOtherMemberQuery } from '../../composables/useOtherMemberQuery'
import {
  MOCK_DIRECT_MEMBERS,
  MOCK_OTHER_MEMBERS,
  MOCK_SELECTABLE_AGENTS,
  MOCK_SELECTABLE_MEMBERS,
  relationTagClass,
  relationTagText,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

type MemberTab = 'direct' | 'other'

const route = useRoute()
const router = useRouter()

const isMember = computed(() => route.meta.xcoinMode === 'member')
const memberTab = ref<MemberTab>(route.query.tab === 'other' ? 'other' : 'direct')
const keyword = ref('')
const selectedId = ref(String(route.query.selected || ''))

const {
  accountQuery,
  queryLoading,
  queryError,
  queryResult,
  lookupAccount,
} = useOtherMemberQuery(selectedId)

const pageTitle = computed(() => (isMember.value ? '选择会员' : '选择代理'))
const confirmText = computed(() => (isMember.value ? '确认会员' : '确认代理'))

const sourceList = computed(() => {
  if (!isMember.value) return MOCK_SELECTABLE_AGENTS
  return memberTab.value === 'direct' ? MOCK_DIRECT_MEMBERS : MOCK_OTHER_MEMBERS
})

const filteredList = computed(() => {
  if (!isMember.value || memberTab.value === 'other') return sourceList.value
  const q = keyword.value.trim().toLowerCase()
  if (!q) return sourceList.value
  return sourceList.value.filter(
    (row) =>
      row.nickname.toLowerCase().includes(q) ||
      row.accountId.toLowerCase().includes(q) ||
      row.kingkongId.includes(q) ||
      row.userId.toLowerCase().includes(q),
  )
})

const canConfirm = computed(() => {
  if (!selectedId.value) return false
  return (
    sourceList.value.some((item) => item.id === selectedId.value) ||
    MOCK_SELECTABLE_MEMBERS.some((item) => item.id === selectedId.value)
  )
})

function switchMemberTab(tab: MemberTab) {
  memberTab.value = tab
  keyword.value = ''
  if (tab === 'direct') {
    const isDirect = MOCK_DIRECT_MEMBERS.some((m) => m.id === selectedId.value)
    if (!isDirect) selectedId.value = ''
  }
}

function confirmSelect() {
  const row =
    MOCK_SELECTABLE_MEMBERS.find((item) => item.id === selectedId.value) ??
    MOCK_SELECTABLE_AGENTS.find((item) => item.id === selectedId.value)
  if (!row) return
  router.push({
    name: isMember.value ? 'mobile-xcoin-credit-member' : 'mobile-xcoin-credit-agent',
    query: { targetId: row.id, targetName: row.nickname },
  })
}
</script>

<template>
  <div class="mh5-xcoin-page">
    <Mh5SubPageHeader :title="pageTitle" />

    <div v-if="isMember" class="mh5-sub-tabs">
      <button
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': memberTab === 'direct' }"
        @click="switchMemberTab('direct')"
      >
        直属会员
      </button>
      <button
        type="button"
        class="mh5-sub-tabs__item"
        :class="{ 'mh5-sub-tabs__item--active': memberTab === 'other' }"
        @click="switchMemberTab('other')"
      >
        其他会员
      </button>
    </div>

    <div v-if="!isMember || memberTab === 'direct'" class="mh5-xcoin-search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
        <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <input
        v-model="keyword"
        type="search"
        class="mh5-xcoin-search__input"
        :placeholder="isMember ? '搜索直属会员昵称、账号或ID' : '请输入昵称、账号或账号ID'"
      />
    </div>

    <div v-if="isMember && memberTab === 'other'" class="mh5-xcoin-other-search-area">
      <div class="mh5-xcoin-other-query-bar">
        <input
          v-model="accountQuery"
          type="text"
          class="mh5-xcoin-other-query-bar__input"
          placeholder="请输入会员账号或账号ID"
          @keydown.enter.prevent="lookupAccount"
        />
        <button
          type="button"
          class="mh5-xcoin-other-query-bar__btn"
          :disabled="queryLoading"
          @click="lookupAccount"
        >
          {{ queryLoading ? '查询中' : '查询' }}
        </button>
      </div>
      <p class="mh5-xcoin-other-member__tip">
        若该会员不在你的下级团队中，为其上分将自动挂靠为你的直属下级，请务必核实账号信息并注意资金安全。
      </p>
    </div>

    <main class="mh5-xcoin-select-list">
      <template v-if="isMember && memberTab === 'other'">
        <p v-if="queryError" class="mh5-xcoin-member-picker__error">{{ queryError }}</p>

        <label
          v-if="queryResult"
          class="mh5-xcoin-select-card"
          :class="{ 'mh5-xcoin-select-card--active': selectedId === queryResult.id }"
        >
          <input v-model="selectedId" type="radio" class="mh5-xcoin-select-card__radio" :value="queryResult.id" />
          <div class="mh5-xcoin-select-card__body">
            <div class="mh5-xcoin-select-card__title-row">
              <span class="mh5-xcoin-select-card__name">{{ queryResult.nickname }}</span>
              <span :class="relationTagClass(queryResult.relation)">{{ relationTagText(queryResult.relation) }}</span>
            </div>
            <div class="mh5-xcoin-select-card__stats">
              <div>
                <p class="mh5-xcoin-select-card__stat-label">金刚号</p>
                <p class="mh5-xcoin-select-card__stat-value">{{ queryResult.kingkongId }}</p>
              </div>
              <div>
                <p class="mh5-xcoin-select-card__stat-label">用户id</p>
                <p class="mh5-xcoin-select-card__stat-value">{{ queryResult.userId }}</p>
              </div>
            </div>
          </div>
        </label>
      </template>

      <template v-else>
        <p v-if="!filteredList.length" class="mh5-xcoin-empty">未找到匹配对象</p>

        <label
          v-for="row in filteredList"
          :key="row.id"
          class="mh5-xcoin-select-card"
          :class="{ 'mh5-xcoin-select-card--active': selectedId === row.id }"
        >
          <input v-model="selectedId" type="radio" class="mh5-xcoin-select-card__radio" :value="row.id" />
          <div class="mh5-xcoin-select-card__body">
            <div class="mh5-xcoin-select-card__title-row">
              <span class="mh5-xcoin-select-card__name">{{ row.nickname }}</span>
              <span :class="relationTagClass(row.relation)">{{ relationTagText(row.relation) }}</span>
            </div>
            <div class="mh5-xcoin-select-card__stats">
              <div>
                <p class="mh5-xcoin-select-card__stat-label">可用额度</p>
                <p class="mh5-xcoin-select-card__stat-value">{{ row.availableCredit.toFixed(2) }}</p>
              </div>
              <div>
                <p class="mh5-xcoin-select-card__stat-label">授信总额</p>
                <p class="mh5-xcoin-select-card__stat-value">{{ row.totalCreditLine.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </label>
      </template>
    </main>

    <footer class="mh5-xcoin-select-footer">
      <button
        type="button"
        class="mh5-xcoin-btn mh5-xcoin-btn--primary mh5-xcoin-btn--block"
        :disabled="!canConfirm"
        @click="confirmSelect"
      >
        {{ confirmText }}
      </button>
    </footer>
  </div>
</template>
