<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  REPORT_CATEGORY_TABS,
  REPORT_DETAIL_ROWS,
  REPORT_RANGE_PRESETS,
  REPORT_SUMMARY_CARDS,
  REPORT_VENDOR_PILLS,
  reportCategoryTitle,
  reportDateRangeText,
  type ReportCategoryKey,
  type ReportRangePreset,
  type ReportVendorKey,
} from '../../constants/agentReport'
import '../../styles/mobile-app-shell.css'

const router = useRouter()

const preset = ref<ReportRangePreset>('today')
const category = ref<ReportCategoryKey>('all')
const vendor = ref<ReportVendorKey>('all')

const dateRangeText = computed(() => reportDateRangeText(preset.value))
const sectionTitle = computed(() => reportCategoryTitle(category.value, vendor.value))
const totalProfit = '+0.86'

function pickPreset(v: ReportRangePreset) {
  preset.value = v
}

function switchAgentTab(tab: 'overview' | 'team' | 'report' | 'me') {
  if (tab === 'report') return
  if (tab === 'overview') {
    router.push({ name: 'mobile-agent' })
    return
  }
  router.push({ name: 'mobile-agent', query: { tab } })
}
</script>

<template>
  <div class="mh5-agent-report-page">
    <header class="mh5-agent-report-header">
      <h1 class="mh5-agent-report-header__title">我的报表</h1>
      <button type="button" class="mh5-agent-report-header__currency" aria-label="切换币种">
        <span>X</span>
        <span class="mh5-agent-report-header__chevron">▾</span>
      </button>
    </header>

    <main class="mh5-agent-report-main">
      <section class="mh5-agent-report-period">
        <p class="mh5-agent-report-period__label">时间段</p>
        <div class="mh5-agent-report-period__row">
          <div class="mh5-agent-report-period__input">{{ dateRangeText }}</div>
          <button type="button" class="mh5-agent-report-period__calendar" aria-label="选择日期">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </button>
        </div>
        <div class="mh5-agent-report-presets">
          <button
            v-for="item in REPORT_RANGE_PRESETS"
            :key="item.key"
            type="button"
            class="mh5-agent-report-preset"
            :class="{ 'mh5-agent-report-preset--active': preset === item.key }"
            @click="pickPreset(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <section class="mh5-agent-report-summary">
        <div
          v-for="card in REPORT_SUMMARY_CARDS"
          :key="card.key"
          class="mh5-agent-report-summary-card"
        >
          <p class="mh5-agent-report-summary-card__label">{{ card.label }}</p>
          <p class="mh5-agent-report-summary-card__value">{{ card.value }}</p>
        </div>
      </section>

      <div class="mh5-agent-report-categories">
        <div class="mh5-agent-report-cat-tabs">
          <button
            v-for="tab in REPORT_CATEGORY_TABS"
            :key="tab.key"
            type="button"
            class="mh5-agent-report-cat-tab"
            :class="{ 'mh5-agent-report-cat-tab--active': category === tab.key }"
            @click="category = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="mh5-agent-report-vendors">
          <button
            v-for="pill in REPORT_VENDOR_PILLS"
            :key="pill.key"
            type="button"
            class="mh5-agent-report-vendor"
            :class="{ 'mh5-agent-report-vendor--active': vendor === pill.key }"
            @click="vendor = pill.key"
          >
            {{ pill.label }}
          </button>
        </div>
      </div>

      <section class="mh5-agent-report-detail">
        <div class="mh5-agent-report-detail__head">
          <span class="mh5-agent-report-detail__title">{{ sectionTitle }}</span>
          <span class="mh5-agent-report-detail__profit">
            总盈亏
            <em>{{ totalProfit }}</em>
          </span>
        </div>
        <div
          v-for="row in REPORT_DETAIL_ROWS"
          :key="row.key"
          class="mh5-agent-report-detail__row"
        >
          <span class="mh5-agent-report-detail__row-label">{{ row.label }}</span>
          <span class="mh5-agent-report-detail__row-value">{{ row.value }}</span>
        </div>
      </section>
    </main>

    <nav class="mh5-agent-report-tabbar" aria-label="代理中心导航">
      <button type="button" class="mh5-agent-report-tabbar__item" @click="switchAgentTab('overview')">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z"
            stroke="#bdbdbd"
            stroke-width="1.8"
          />
          <path d="M12 12 12 7a5 5 0 1 1-5 5" stroke="#bdbdbd" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span>概况</span>
      </button>
      <button type="button" class="mh5-agent-report-tabbar__item" @click="switchAgentTab('team')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4.5 20a4.5 4.5 0 0 1 9 0M11 20a4.5 4.5 0 0 1 8.5-1"
            stroke="#bdbdbd"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <span>团队管理</span>
      </button>
      <button type="button" class="mh5-agent-report-tabbar__item mh5-agent-report-tabbar__item--active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 18V6" stroke="#e07a2b" stroke-width="1.8" stroke-linecap="round" />
          <path d="M8 15V9" stroke="#e07a2b" stroke-width="1.8" stroke-linecap="round" />
          <path d="M12 17v-8" stroke="#e07a2b" stroke-width="1.8" stroke-linecap="round" />
          <path d="M16 13V7" stroke="#e07a2b" stroke-width="1.8" stroke-linecap="round" />
          <path d="M20 16V5" stroke="#e07a2b" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span>我的报表</span>
      </button>
      <button type="button" class="mh5-agent-report-tabbar__item" @click="switchAgentTab('me')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 13.2a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 13.2Z"
            stroke="#bdbdbd"
            stroke-width="1.8"
          />
          <path
            d="M5.5 20.3c.9-3.1 3.6-5.1 6.5-5.1s5.6 2 6.5 5.1"
            stroke="#bdbdbd"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <span>我的</span>
      </button>
    </nav>
  </div>
</template>
