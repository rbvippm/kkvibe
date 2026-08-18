<script setup lang="ts">
import {
  formatAgentCurrencyLabel,
  isSameAgentCurrency,
} from '../../constants/agentCurrencyIcons'
import Mh5CurrencyIcon from './Mh5CurrencyIcon.vue'

const props = defineProps<{
  open: boolean
  currency: string
  options: readonly string[]
  formatLabel?: (code: string) => string
}>()

const emit = defineEmits<{
  close: []
  pick: [value: string]
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="mh5-agent-report-sheet">
      <div
        v-if="open"
        class="mh5-agent-overlay-mask"
        @click.self="emit('close')"
      >
        <div
          class="mh5-xcoin-sheet mh5-agent-overlay-sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('选择币种')"
        >
          <div class="mh5-currency-picker-sheet__head">
            <h2 class="mh5-xcoin-sheet__title">{{ $t('选择币种') }}</h2>
            <slot name="title-extra" />
          </div>
          <button
            v-for="opt in options"
            :key="opt"
            type="button"
            class="mh5-xcoin-sheet__option mh5-xcoin-sheet__option--currency"
            :class="{ 'mh5-xcoin-sheet__option--active': isSameAgentCurrency(currency, opt) }"
            @click="emit('pick', opt)"
          >
            <Mh5CurrencyIcon :code="opt" />
            <span>{{ $t(props.formatLabel ? props.formatLabel(opt) : formatAgentCurrencyLabel(opt)) }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
