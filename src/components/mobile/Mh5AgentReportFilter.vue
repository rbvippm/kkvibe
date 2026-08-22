<script setup lang="ts">
import { computed } from 'vue'
import { formatAgentCurrencyLabel } from '../../constants/agentCurrencyIcons'
import {
  AGENT_REPORT_FILTER_ASSETS,
  REPORT_RANGE_PRESETS,
} from '../../constants/agentReport'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'

const props = defineProps<{
  dateText: string
  currency: string
  activePreset?: string | null
  presets?: { key: string; label: string }[]
}>()

const emit = defineEmits<{
  openDate: []
  openCurrency: []
  pickPreset: [key: string]
}>()

const presetItems = computed(() => props.presets ?? REPORT_RANGE_PRESETS)
</script>

<template>
  <section class="mh5-agent-report-filter" :aria-label="$t('筛选')">
    <div class="mh5-agent-report-filter__row">
      <button
        type="button"
        class="mh5-agent-report-filter__date mh5-agent-report-filter__date--action"
        :aria-label="$t('选择日期')"
        @click="emit('openDate')"
      >
        <span>{{ dateText }}</span>
        <span class="mh5-agent-report-filter__calendar" aria-hidden="true">
          <img :src="AGENT_REPORT_FILTER_ASSETS.calendar" alt="" width="16" height="16" />
        </span>
      </button>
      <button
        type="button"
        class="mh5-agent-report-filter__currency"
        :aria-label="$t('切换币种')"
        @click="emit('openCurrency')"
      >
        <span class="mh5-agent-report-filter__currency-main">
          <Mh5CurrencyIcon :code="currency" :size="20" />
          <span>{{ $t(formatAgentCurrencyLabel(currency)) }}</span>
        </span>
        <span class="mh5-agent-report-filter__chevron" aria-hidden="true">
          <img :src="AGENT_REPORT_FILTER_ASSETS.dropdown" alt="" width="8" height="5" />
        </span>
      </button>
    </div>
    <div class="mh5-agent-report-filter__presets" role="tablist" :aria-label="$t('快捷时间')">
      <button
        v-for="item in presetItems"
        :key="item.key"
        type="button"
        role="tab"
        class="mh5-agent-report-filter__preset"
        :class="{ 'mh5-agent-report-filter__preset--active': activePreset === item.key }"
        :aria-selected="activePreset === item.key"
        @click="emit('pickPreset', item.key)"
      >
        {{ $t(item.label) }}
      </button>
    </div>
  </section>
</template>
