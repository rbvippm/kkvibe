<script setup lang="ts">
import {
  AGENT_COMMISSION_SETTING_ANNOT_MAP,
  type AgentCommissionSettingAnnotContext,
} from '../../constants/agentCommissionSettingSpec'
import WfSpecAnnot from './WfSpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    context: AgentCommissionSettingAnnotContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const spec = AGENT_COMMISSION_SETTING_ANNOT_MAP[props.context]
</script>

<template>
  <WfSpecAnnot :no="spec.no" :title="spec.title" :items="[...spec.items]" :placement="placement" />
</template>
