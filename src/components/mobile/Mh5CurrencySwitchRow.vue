<script setup lang="ts">
import { formatAgentCurrencyLabel } from '../../constants/agentCurrencyIcons'
import { AGENT_REPORT_FILTER_ASSETS } from '../../constants/agentReport'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'

defineProps<{
  currency: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="mh5-currency-switch">
    <p class="mh5-currency-switch__label">{{ $t('币种切换') }}</p>
    <button
      type="button"
      class="mh5-currency-switch__btn"
      :aria-label="$t('切换币种')"
      @click="emit('click')"
    >
      <span class="mh5-currency-switch__main">
        <Mh5CurrencyIcon :code="currency" :size="20" />
        <span>{{ $t(formatAgentCurrencyLabel(currency)) }}</span>
      </span>
      <span class="mh5-currency-switch__chevron" aria-hidden="true">
        <img :src="AGENT_REPORT_FILTER_ASSETS.dropdown" alt="" width="8" height="5" />
      </span>
    </button>
  </div>
</template>
