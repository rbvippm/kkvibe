<script setup lang="ts">
import {
  WITHDRAW_TURNOVER_RECORD_SPEC,
  type WithdrawTurnoverRecordSpecContext,
} from '../../constants/withdrawTurnoverRecord'
import { VERSION_V2_SPEC_ANNOT_NO } from '../../constants/versionRecordV2'
import WfSpecAnnot from './WfSpecAnnot.vue'

const TITLE_MAP: Record<WithdrawTurnoverRecordSpecContext, string> = {
  remainingBefore: '变更前剩余提现流水要求',
  adjustAmount: '变更流水',
  remainingAfter: '变更后剩余提现流水要求',
  relatedFlowNo: '关联流水号',
  changeType: '变动类型',
}

withDefaults(
  defineProps<{
    context: WithdrawTurnoverRecordSpecContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    :no="VERSION_V2_SPEC_ANNOT_NO.withdrawTurnoverRecord"
    :title="TITLE_MAP[context]"
    :items="[...WITHDRAW_TURNOVER_RECORD_SPEC[context]]"
    :placement="placement"
  />
</template>
