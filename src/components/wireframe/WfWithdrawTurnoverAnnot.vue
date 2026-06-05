<script setup lang="ts">
import {
  WITHDRAW_TURNOVER_LABEL,
  WITHDRAW_TURNOVER_SPEC,
  type WithdrawTurnoverSpecContext,
} from '../../constants/withdrawTurnover'
import { VERSION_V2_SPEC_ANNOT_NO } from '../../constants/versionRecordV2'
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
    :no="VERSION_V2_SPEC_ANNOT_NO.accountChangeTurnover"
    :title="WITHDRAW_TURNOVER_LABEL"
    :items="[...WITHDRAW_TURNOVER_SPEC[context]]"
    :placement="placement"
  />
</template>
