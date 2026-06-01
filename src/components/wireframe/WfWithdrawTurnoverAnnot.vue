<script setup lang="ts">
import {
  WITHDRAW_TURNOVER_LABEL,
  WITHDRAW_TURNOVER_SPEC,
  type WithdrawTurnoverSpecContext,
} from '../../constants/withdrawTurnover'
import WfSpecAnnot from './WfSpecAnnot.vue'

withDefaults(
  defineProps<{
    context: WithdrawTurnoverSpecContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    :title="WITHDRAW_TURNOVER_LABEL"
    :items="[...WITHDRAW_TURNOVER_SPEC[context]]"
    :placement="placement"
  />
</template>
