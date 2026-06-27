<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  MOCK_AGENT_CREDIT_SUMMARY,
  RELATION_LABEL,
  relationTagClass,
} from '../../constants/xCoinTransfer'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

const router = useRouter()
const preset = ref<RangePreset>('today')

const dateRangeText = computed(() => {
  const base = '2026-06-24'
  if (preset.value === 'today') return `${base}至${base}`
  if (preset.value === 'yesterday') return '2026-06-23至2026-06-23'
  if (preset.value === 'thisWeek') return '2026-06-22至2026-06-24'
  return '2026-06-15至2026-06-21'
})

const xCoinCreditTotal = computed(() =>
  MOCK_AGENT_CREDIT_SUMMARY.reduce((sum, row) => sum + row.creditUpTotal, 0),
)

function pickPreset(v: RangePreset) {
  preset.value = v
}

function goRecords() {
  router.push({ name: 'mobile-xcoin-records' })
}
</script>

<template>
  <div class="mh5-xcoin-page">
    <Mh5SubPageHeader title="我的报表">
      <template #right>
        <span class="mh5-xcoin-report-currency">X ▾</span>
      </template>
    </Mh5SubPageHeader>

    <main class="mh5-xcoin-report-main">
      <div class="mh5-xcoin-report-daterange">
        <span>{{ dateRangeText }}</span>
        <button type="button" class="mh5-xcoin-report-calendar" aria-label="选择日期">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-width="1.6" />
          </svg>
        </button>
      </div>

      <div class="mh5-xcoin-report-presets">
        <button
          v-for="item in [
            ['today', '今天'],
            ['yesterday', '昨天'],
            ['thisWeek', '本周'],
            ['lastWeek', '上周'],
          ] as const"
          :key="item[0]"
          type="button"
          class="mh5-xcoin-report-preset"
          :class="{ 'mh5-xcoin-report-preset--active': preset === item[0] }"
          @click="pickPreset(item[0])"
        >
          {{ item[1] }}
        </button>
      </div>

      <section class="mh5-xcoin-report-highlight">
        <p class="mh5-xcoin-report-highlight__label">本期收到代理收入合计</p>
        <p class="mh5-xcoin-report-highlight__value">+{{ xCoinCreditTotal.toFixed(2) }} X币</p>
      </section>

      <section class="mh5-xcoin-report-block">
        <h2 class="mh5-xcoin-report-block__title">代理收入明细（按来源）</h2>
        <p class="mh5-xcoin-report-block__desc">清晰展示哪个代理给你上了多少分，含非直属代理</p>

        <div v-for="row in MOCK_AGENT_CREDIT_SUMMARY" :key="row.agentId" class="mh5-xcoin-report-row">
          <div>
            <p class="mh5-xcoin-report-row__name">{{ row.agentName }}</p>
            <span :class="relationTagClass(row.relation)">{{ RELATION_LABEL[row.relation] }}</span>
          </div>
          <div class="text-right">
            <p class="mh5-xcoin-report-row__amount">+{{ row.creditUpTotal.toFixed(2) }} X币</p>
            <p class="text-[11px] text-[var(--mh5-app-text-secondary)]">收入 {{ row.creditUpTotal.toFixed(2) }}</p>
          </div>
        </div>
      </section>

      <button type="button" class="mh5-xcoin-report-link" @click="goRecords">查看全部信用额度记录 →</button>
      <button type="button" class="mh5-xcoin-report-link mh5-xcoin-report-link--muted" @click="router.push({ name: 'mobile-mine-more' })">
        返回更多功能
      </button>
    </main>
  </div>
</template>
