<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AGENT_CREDIT_CURRENCY_TABS,
  getAgentDetailCurrencyOptions,
  type AgentCreditCurrency,
  type AgentWalletCurrency,
} from '../../constants/agentDetail'
import {
  agentAppCreditCurrency,
  agentAppCurrency,
  isAgentCreditCurrency,
  setAgentAppCreditCurrency,
  setAgentAppCurrency,
} from '../../constants/agentAppCurrency'
import {
  MEMBER_GAME_SUB_TABS,
  findMemberDetail,
  formatMemberCashWalletGroups,
  formatMemberCreditLimitRows,
  getMemberDetailTabs,
  type MemberDetailTab,
  type MemberGameSubTab,
} from '../../constants/memberDetail'
import {
  MEMBER_GAME_PROFIT_FORMULA,
  MEMBER_PROFIT_CATEGORY_TABS,
  MEMBER_PROFIT_FORMULA,
  MEMBER_PROFIT_VENDORS,
  getMemberProfitDetail,
  getMemberProfitSummaryRows,
  getMemberTotalProfit,
  profitTotalClass,
  profitValueClass,
  type MemberProfitCategoryKey,
  type MemberProfitVendorKey,
} from '../../constants/memberDetailProfit'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import { MEMBER_DETAIL_CREDIT_CURRENCY_SPEC } from '../../constants/memberDetailSpec'
import '../../styles/mobile-app-shell.css'

const route = useRoute()
const router = useRouter()

const activeTab = ref<MemberDetailTab>('manage')
const gameSubTab = ref<MemberGameSubTab>('records')
const currencyPickerOpen = ref(false)
const currency = agentAppCurrency
const creditCurrency = agentAppCreditCurrency
const profitCategory = ref<MemberProfitCategoryKey>('overall')
const profitVendor = ref<MemberProfitVendorKey>('all')
const profitFormulaTipOpen = ref(false)
const gameProfitFormulaTipOpen = ref(false)

const member = computed(() => findMemberDetail(String(route.query.id ?? '')))
const isCredited = computed(() => Boolean(member.value?.isCredited))
const detailTabs = computed(() => getMemberDetailTabs(isCredited.value))
const currencyOptions = computed(() => getAgentDetailCurrencyOptions(isCredited.value))
const cashWalletGroups = computed(() => formatMemberCashWalletGroups(member.value?.wallets))
const profitVendorOptions = computed(() => MEMBER_PROFIT_VENDORS[profitCategory.value])
const profitDetail = computed(() => getMemberProfitDetail(profitCategory.value, profitVendor.value))
const profitSummaryRows = computed(() => getMemberProfitSummaryRows(currency.value))
const memberTotalProfit = computed(() => getMemberTotalProfit(currency.value))

watch(isCredited, (credited) => {
  if (!credited) {
    if (activeTab.value === 'credit') activeTab.value = 'manage'
    if (isAgentCreditCurrency(currency.value)) setAgentAppCurrency('KKC')
  }
})

const summaryItems = computed(() => {
  if (!member.value) return []
  const s = member.value.summary
  const cur = currency.value
  if (cur === '信用额度-CNY') {
    return [
      { label: '总投注单数', value: String(s.totalBets + 2), positive: false },
      { label: '有效投注额', value: '¥3,200', positive: false },
      { label: '累计输赢', value: '+1,100', positive: true },
    ]
  }
  if (cur === '信用额度-USD') {
    return [
      { label: '总投注单数', value: String(Math.max(1, s.totalBets - 1)), positive: false },
      { label: '有效投注额', value: '¥980', positive: false },
      { label: '累计输赢', value: '-120', positive: false },
    ]
  }
  if (cur === 'USDT') {
    return [
      { label: '总投注单数', value: String(s.totalBets), positive: false },
      { label: '有效投注额', value: '¥1,500', positive: false },
      { label: '累计输赢', value: '+420', positive: true },
    ]
  }
  if (cur === 'KKV') {
    return [
      { label: '总投注单数', value: String(s.totalBets + 1), positive: false },
      { label: '有效投注额', value: '¥2,400', positive: false },
      { label: '累计输赢', value: '+680', positive: true },
    ]
  }
  return [
    { label: '总投注单数', value: String(s.totalBets), positive: false },
    { label: '有效投注额', value: s.validBetAmount, positive: false },
    { label: '累计输赢', value: s.cumulativeWinLose, positive: s.winLosePositive },
  ]
})

const creditLimitTitle = '信用额度'

const creditLimitItems = computed(() => {
  if (!member.value) return []
  return formatMemberCreditLimitRows(member.value.creditLimits[creditCurrency.value])
})

function selectProfitCategory(key: MemberProfitCategoryKey) {
  profitCategory.value = key
  /** 切一级品类时，二级默认「全部」 */
  profitVendor.value = MEMBER_PROFIT_VENDORS[key][0]?.key ?? 'all'
}

function toggleProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = false
  profitFormulaTipOpen.value = !profitFormulaTipOpen.value
}

function closeProfitFormulaTip() {
  profitFormulaTipOpen.value = false
}

function toggleGameProfitFormulaTip() {
  profitFormulaTipOpen.value = false
  gameProfitFormulaTipOpen.value = !gameProfitFormulaTipOpen.value
}

function closeGameProfitFormulaTip() {
  gameProfitFormulaTipOpen.value = false
}

function goCredit() {
  router.push({
    name: 'mobile-xcoin-credit-member',
    query: {
      targetId: member.value?.id,
      targetName: member.value?.nickname,
      currency: creditCurrency.value,
    },
  })
}

function pickCurrency(value: AgentWalletCurrency) {
  setAgentAppCurrency(value)
  currencyPickerOpen.value = false
}

function pickCreditCurrency(value: AgentCreditCurrency) {
  setAgentAppCreditCurrency(value)
}
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
        <div class="mh5-member-detail-nav__actions">
          <Mh5SpecAnnot :spec="MEMBER_DETAIL_CREDIT_CURRENCY_SPEC" placement="bottom" />
          <button
            type="button"
            class="mh5-member-detail-nav__currency"
            aria-label="切换币种"
            @click="currencyPickerOpen = true"
          >
            <span>{{ currency }}</span>
            <span class="mh5-member-detail-nav__chevron">▾</span>
          </button>
        </div>
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
      <div class="mh5-member-detail-tabs" role="tablist" aria-label="会员详情分类">
        <button
          v-for="tab in detailTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="mh5-member-detail-tab"
          :class="{ 'mh5-member-detail-tab--active': activeTab === tab.key }"
          :aria-selected="activeTab === tab.key"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="activeTab === 'manage'">
        <section
          v-for="group in cashWalletGroups"
          :key="group.currency"
          class="mh5-member-detail-panel"
        >
          <div class="mh5-member-detail-panel__head">
            <h3 class="mh5-member-detail-panel__title">{{ group.title }}</h3>
          </div>
          <div
            v-for="item in group.rows"
            :key="`${group.currency}-${item.label}`"
            class="mh5-member-detail-panel__row"
          >
            <span class="mh5-member-detail-panel__label">{{ item.label }}</span>
            <span class="mh5-member-detail-panel__value">{{ item.value }}</span>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'credit'">
        <nav
          class="mh5-agent-profit-ratio-seg mh5-member-detail-credit-seg"
          role="tablist"
          aria-label="信用额度币种"
        >
          <button
            v-for="tab in AGENT_CREDIT_CURRENCY_TABS"
            :key="tab.key"
            type="button"
            role="tab"
            class="mh5-agent-profit-ratio-seg__item"
            :class="{ 'mh5-agent-profit-ratio-seg__item--active': creditCurrency === tab.key }"
            :aria-selected="creditCurrency === tab.key"
            @click="pickCreditCurrency(tab.key)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <section class="mh5-member-detail-panel">
          <div class="mh5-member-detail-panel__head">
            <h3 class="mh5-member-detail-panel__title">{{ creditLimitTitle }}</h3>
            <button type="button" class="mh5-member-detail-panel__action" @click="goCredit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              给他上下分
            </button>
          </div>
          <div
            v-for="item in creditLimitItems"
            :key="item.label"
            class="mh5-member-detail-panel__row"
          >
            <span class="mh5-member-detail-panel__label">{{ item.label }}</span>
            <span
              class="mh5-member-detail-panel__value"
              :class="{ 'mh5-member-detail-panel__value--positive': item.positive }"
            >
              {{ item.value }}
            </span>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'profit'">
        <section class="mh5-member-detail-profit" @click="closeProfitFormulaTip">
          <section class="mh5-agent-detail-wallet mh5-agent-detail-profit-summary">
            <div class="mh5-agent-detail-wallet__row mh5-agent-detail-profit-summary__total">
              <span class="mh5-agent-detail-profit-summary__label-wrap">
                <span class="mh5-agent-detail-wallet__label">会员盈亏</span>
                <button
                  type="button"
                  class="mh5-agent-detail-profit-summary__tip-btn"
                  aria-label="查看会员盈亏计算公式"
                  :aria-expanded="profitFormulaTipOpen"
                  @click.stop="toggleProfitFormulaTip"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
                    <path
                      d="M8 4.6v5.2M8 11.6h.01"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <span
                  v-if="profitFormulaTipOpen"
                  class="mh5-agent-detail-profit-summary__tip-bubble"
                  role="tooltip"
                >
                  {{ MEMBER_PROFIT_FORMULA }}
                </span>
              </span>
              <span
                class="mh5-agent-detail-wallet__value"
                :class="{
                  'mh5-agent-detail-wallet__value--positive': memberTotalProfit.tone === 'positive',
                  'mh5-agent-detail-wallet__value--negative': memberTotalProfit.tone === 'negative',
                }"
              >
                {{ memberTotalProfit.value }}
              </span>
            </div>
            <div
              v-for="row in profitSummaryRows"
              :key="row.label"
              class="mh5-agent-detail-wallet__row"
            >
              <span class="mh5-agent-detail-wallet__label">{{ row.label }}</span>
              <span
                class="mh5-agent-detail-wallet__value"
                :class="{
                  'mh5-agent-detail-wallet__value--positive': row.tone === 'positive',
                  'mh5-agent-detail-wallet__value--negative': row.tone === 'negative',
                }"
              >
                {{ row.value }}
              </span>
            </div>
          </section>
        </section>
      </template>

      <template v-else-if="activeTab === 'game'">
        <div class="mh5-member-detail-subtabs">
          <button
            v-for="sub in MEMBER_GAME_SUB_TABS"
            :key="sub.key"
            type="button"
            class="mh5-member-detail-subtab"
            :class="{ 'mh5-member-detail-subtab--active': gameSubTab === sub.key }"
            @click="gameSubTab = sub.key"
          >
            {{ sub.label }}
          </button>
        </div>

        <section
          v-if="gameSubTab === 'stats'"
          class="mh5-member-detail-profit"
          @click="closeGameProfitFormulaTip"
        >
          <div class="mh5-agent-report-categories">
            <div class="mh5-agent-report-cat-tabs" role="tablist" aria-label="游戏数据品类">
              <button
                v-for="tab in MEMBER_PROFIT_CATEGORY_TABS"
                :key="tab.key"
                type="button"
                role="tab"
                class="mh5-agent-report-cat-tab"
                :class="{ 'mh5-agent-report-cat-tab--active': profitCategory === tab.key }"
                :aria-selected="profitCategory === tab.key"
                @click="selectProfitCategory(tab.key)"
              >
                {{ tab.label }}
              </button>
            </div>
            <div
              v-if="profitVendorOptions.length"
              class="mh5-agent-report-vendors"
              role="tablist"
              aria-label="游戏数据场馆"
            >
              <button
                v-for="pill in profitVendorOptions"
                :key="pill.key"
                type="button"
                role="tab"
                class="mh5-agent-report-vendor"
                :class="{ 'mh5-agent-report-vendor--active': profitVendor === pill.key }"
                :aria-selected="profitVendor === pill.key"
                @click="profitVendor = pill.key"
              >
                {{ pill.label }}
              </button>
            </div>
          </div>

          <section class="mh5-agent-report-detail">
            <div class="mh5-agent-report-detail__head">
              <span class="mh5-agent-report-detail__title">{{ profitDetail.title }}</span>
              <span class="mh5-agent-report-detail__profit">
                <span class="mh5-agent-report-detail__profit-label-wrap">
                  <button
                    type="button"
                    class="mh5-agent-detail-profit-summary__tip-btn mh5-agent-report-detail__tip-btn"
                    aria-label="查看净输赢计算公式"
                    :aria-expanded="gameProfitFormulaTipOpen"
                    @click.stop="toggleGameProfitFormulaTip"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
                      <path
                        d="M8 4.6v5.2M8 11.6h.01"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <span>净输赢</span>
                  <span
                    v-if="gameProfitFormulaTipOpen"
                    class="mh5-agent-detail-profit-summary__tip-bubble mh5-agent-report-detail__tip-bubble"
                    role="tooltip"
                  >
                    {{ MEMBER_GAME_PROFIT_FORMULA }}
                  </span>
                </span>
                <em :class="profitTotalClass(profitDetail.totalProfitTone)">
                  {{ profitDetail.totalProfit }}
                </em>
              </span>
            </div>
            <div
              v-for="row in profitDetail.rows"
              :key="row.label"
              class="mh5-agent-report-detail__row"
            >
              <span class="mh5-agent-report-detail__row-label">{{ row.label }}</span>
              <span
                class="mh5-agent-report-detail__row-value"
                :class="profitValueClass(row.tone)"
              >
                {{ row.value }}
              </span>
            </div>
          </section>
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

      <template v-else-if="activeTab === 'login'">
        <section class="mh5-member-detail-panel">
          <div class="mh5-member-detail-panel__head mh5-member-detail-panel__head--plain">
            <h3 class="mh5-member-detail-panel__title">登录日志</h3>
          </div>
          <div class="mh5-member-detail-panel__row">
            <span class="mh5-member-detail-panel__label">注册时间</span>
            <span class="mh5-member-detail-panel__value">{{ member.loginLog.registeredAt }}</span>
          </div>
          <div class="mh5-member-detail-panel__row">
            <span class="mh5-member-detail-panel__label">最后登录时间</span>
            <span class="mh5-member-detail-panel__value">{{ member.loginLog.lastLoginAt }}</span>
          </div>
        </section>
      </template>
    </main>

    <main v-else class="mh5-member-detail-body">
      <p class="mh5-member-detail-empty">未找到该会员信息</p>
    </main>

    <Transition name="mh5-member-detail-sheet">
      <div
        v-if="currencyPickerOpen"
        class="mh5-xcoin-sheet-mask"
        @click.self="currencyPickerOpen = false"
      >
        <div class="mh5-xcoin-sheet">
          <h2 class="mh5-xcoin-sheet__title">选择币种</h2>
          <button
            v-for="opt in currencyOptions"
            :key="opt"
            type="button"
            class="mh5-xcoin-sheet__option"
            :class="{ 'mh5-xcoin-sheet__option--active': currency === opt }"
            @click="pickCurrency(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mh5-member-detail-sheet-enter-active,
.mh5-member-detail-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.mh5-member-detail-sheet-enter-active .mh5-xcoin-sheet,
.mh5-member-detail-sheet-leave-active .mh5-xcoin-sheet {
  transition: transform 0.25s ease;
}

.mh5-member-detail-sheet-enter-from,
.mh5-member-detail-sheet-leave-to {
  opacity: 0;
}

.mh5-member-detail-sheet-enter-from .mh5-xcoin-sheet,
.mh5-member-detail-sheet-leave-to .mh5-xcoin-sheet {
  transform: translateY(100%);
}
</style>
