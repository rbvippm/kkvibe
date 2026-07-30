<script setup lang="ts">
import {
  REBATE_AGENT_CONFIG_ANNOT_MAP,
  type RebateAgentConfigAnnotContext,
} from '../../constants/rebateAgentConfigSpec'
import WfSpecAnnot from './WfSpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    context: RebateAgentConfigAnnotContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const spec = REBATE_AGENT_CONFIG_ANNOT_MAP[props.context]
</script>

<template>
  <WfSpecAnnot :no="spec.no" :title="spec.title" :items="[...spec.items]" :placement="placement" />
</template>
