<script setup lang="ts">
import {
  REMAINING_WITHDRAW_TURNOVER_LABEL,
  USER_TURNOVER_ADJUST_SPEC,
  type UserTurnoverAdjustSpecContext,
} from '../../constants/userTurnoverAdjust'
import { VERSION_V2_SPEC_ANNOT_NO } from '../../constants/versionRecordV2'
import WfSpecAnnot from './WfSpecAnnot.vue'

const TITLE_MAP: Record<UserTurnoverAdjustSpecContext, string> = {
  remaining: REMAINING_WITHDRAW_TURNOVER_LABEL,
  entry: '调整提现流水',
  record: '流水变动',
  amount: '流水',
  reason: '调整理由',
}

withDefaults(
  defineProps<{
    context: UserTurnoverAdjustSpecContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    :no="VERSION_V2_SPEC_ANNOT_NO.userTurnoverAdjust"
    :title="TITLE_MAP[context]"
    :items="[...USER_TURNOVER_ADJUST_SPEC[context]]"
    :placement="placement"
  />
</template>
