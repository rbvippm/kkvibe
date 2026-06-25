<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MEMBER_DETAIL_TABS,
  MEMBER_FLOW_SUB_TABS,
  findMemberDetail,
  type MemberDetailTab,
  type MemberFlowSubTab,
} from '../../constants/memberDetail'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const activeTab = ref<MemberDetailTab>('flow')
const flowSubTab = ref<MemberFlowSubTab>('records')
const currency = ref('KKC')

const member = computed(() => findMemberDetail(String(route.query.id ?? '')))

const summaryItems = computed(() => {
  if (!member.value) return []
  const s = member.value.summary
  return [
    { label: '总投注单数', value: String(s.totalBets), positive: false },
    { label: '有效投注额', value: s.validBetAmount, positive: false },
    { label: '累计输赢', value: s.cumulativeWinLose, positive: s.winLosePositive },
  ]
})

const xcoinStatItems = computed(() => {
  if (!member.value) return []
  const { creditUpTotal, creditDownTotal } = member.value.xcoinStats
  const net = creditUpTotal - creditDownTotal
  const format = (n: number) => n.toLocaleString('zh-CN')
  return [
    { label: '上分总额', value: format(creditUpTotal), positive: false },
    { label: '下分总额', value: format(creditDownTotal), positive: false },
    {
      label: '上下分净额',
      value: `${net >= 0 ? '+' : ''}${format(net)}`,
      positive: net >= 0,
    },
  ]
})
</script>

<template>
  <div class="mh5-member-detail-page">
    <header class="mh5-member-detail-hero">
      <div class="mh5-member-detail-nav">
        <button type="button" class="mh5-member-detail-nav__back" aria-label="返回" @click="router.back()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="mh5-member-detail-nav__title">会员详情</h1>
        <button type="button" class="mh5-member-detail-nav__currency" aria-label="切换币种">
          <span>{{ currency }}</span>
          <span class="mh5-member-detail-nav__chevron">▾</span>
        </button>
      </div>

      <section v-if="member" class="mh5-member-detail-card">
        <div class="mh5-member-detail-card__top">
          <div class="mh5-member-detail-card__avatar">{{ member.avatarEmoji }}</div>
          <div class="mh5-member-detail-card__info">
            <div class="mh5-member-detail-card__name-row">
              <h2 class="mh5-member-detail-card__name">{{ member.nickname }}</h2>
              <span class="mh5-member-detail-card__tag">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M6 1l1.2 3.6H11L8.4 7.2l1.2 3.6L6 9.6 2.4 10.8 3.6 7.2 1 4.6h3.8L6 1Z" fill="currentColor" />
                </svg>
                {{ member.memberTag }}
              </span>
            </div>
            <p class="mh5-member-detail-card__login">最近登陆 {{ member.lastLogin }}</p>
          </div>
        </div>
        <div class="mh5-member-detail-card__divider" aria-hidden="true" />
        <div class="mh5-member-detail-card__meta">
          <div class="mh5-member-detail-meta">
            <p class="mh5-member-detail-meta__label">会员账号</p>
            <p class="mh5-member-detail-meta__value">{{ member.memberAccount }}</p>
          </div>
          <div class="mh5-member-detail-meta">
            <p class="mh5-member-detail-meta__label">上级代理</p>
            <p class="mh5-member-detail-meta__value">{{ member.superiorAgent }}</p>
          </div>
        </div>
      </section>
    </header>

    <main v-if="member" class="mh5-member-detail-body">
      <div class="mh5-member-detail-tabs">
        <button
          v-for="tab in MEMBER_DETAIL_TABS"
          :key="tab.key"
          type="button"
          class="mh5-member-detail-tab"
          :class="{ 'mh5-member-detail-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="activeTab === 'flow'">
        <div class="mh5-member-detail-subtabs">
          <button
            v-for="sub in MEMBER_FLOW_SUB_TABS"
            :key="sub.key"
            type="button"
            class="mh5-member-detail-subtab"
            :class="{ 'mh5-member-detail-subtab--active': flowSubTab === sub.key }"
            @click="flowSubTab = sub.key"
          >
            {{ sub.label }}
          </button>
        </div>

        <section v-if="flowSubTab === 'xcoin'" class="mh5-member-detail-xcoin">
          <div
            v-for="item in xcoinStatItems"
            :key="item.label"
            class="mh5-member-detail-xcoin__row"
          >
            <span class="mh5-member-detail-xcoin__label">{{ item.label }}</span>
            <span
              class="mh5-member-detail-xcoin__value"
              :class="{ 'mh5-member-detail-xcoin__value--positive': item.positive }"
            >
              {{ item.value }}
            </span>
          </div>
        </section>

        <section v-else class="mh5-member-detail-summary">
          <div
            v-for="(item, idx) in summaryItems"
            :key="item.label"
            class="mh5-member-detail-summary__col"
            :class="{ 'mh5-member-detail-summary__col--border': idx > 0 }"
          >
            <p class="mh5-member-detail-summary__label">{{ item.label }}</p>
            <p
              class="mh5-member-detail-summary__value"
              :class="{ 'mh5-member-detail-summary__value--positive': item.positive }"
            >
              {{ item.value }}
            </p>
          </div>
        </section>
      </template>

      <section v-else class="mh5-member-detail-placeholder">
        <p>会员管理功能</p>
        <span>备注、状态与风控操作（原型占位）</span>
      </section>
    </main>

    <main v-else class="mh5-member-detail-body">
      <p class="mh5-member-detail-empty">未找到该会员信息</p>
    </main>
  </div>
</template>
