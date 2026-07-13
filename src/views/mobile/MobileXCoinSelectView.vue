<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MOCK_DIRECT_MEMBERS,
  MOCK_SELECTABLE_AGENTS,
  MOCK_SELECTABLE_MEMBERS,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const isMember = computed(() => route.meta.xcoinMode === 'member')
const keyword = ref('')
const selectedId = ref(String(route.query.selected || ''))

const pageTitle = computed(() => (isMember.value ? '选择信用会员' : '选择信用代理'))
const confirmText = computed(() => (isMember.value ? '确认会员' : '确认代理'))

const sourceList = computed(() => {
  if (!isMember.value) return MOCK_SELECTABLE_AGENTS
  return MOCK_DIRECT_MEMBERS
})

const filteredList = computed(() => {
  if (!isMember.value) return sourceList.value
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

function confirmSelect() {
  const row =
    MOCK_SELECTABLE_MEMBERS.find((item) => item.id === selectedId.value) ??
    MOCK_SELECTABLE_AGENTS.find((item) => item.id === selectedId.value)
  if (!row) return
  const currency = String(route.query.currency || '信用额度-kkc')
  router.push({
    name: isMember.value ? 'mobile-xcoin-credit-member' : 'mobile-xcoin-credit-agent',
    query: { targetId: row.id, targetName: row.nickname, currency },
  })
}
</script>

<template>
  <div class="mh5-xcoin-page">
    <Mh5SubPageHeader :title="pageTitle" />

    <div class="mh5-xcoin-search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
        <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <input
        v-model="keyword"
        type="search"
        class="mh5-xcoin-search__input"
        placeholder="请输入昵称、账号或账号ID"
      />
    </div>

    <main class="mh5-xcoin-select-list">
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
