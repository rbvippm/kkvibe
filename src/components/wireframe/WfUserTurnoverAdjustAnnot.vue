<script setup lang="ts">
import {
  USER_TURNOVER_ADJUST_SPEC,
  type UserTurnoverAdjustSpecContext,
} from '../../constants/userTurnoverAdjust'
import WfSpecAnnot from './WfSpecAnnot.vue'

const TITLE_MAP: Record<UserTurnoverAdjustSpecContext, string> = {
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
    :title="TITLE_MAP[context]"
    :items="[...USER_TURNOVER_ADJUST_SPEC[context]]"
    :placement="placement"
  />
</template>
