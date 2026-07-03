<script setup lang="ts">
import {
  SHARE_AGENT_FILTER_ANNOT_MAP,
  type ShareAgentFilterAnnotContext,
} from '../../constants/pcShareAgent'
import WfSpecAnnot from './WfSpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    context: ShareAgentFilterAnnotContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const spec = SHARE_AGENT_FILTER_ANNOT_MAP[props.context]
</script>

<template>
  <WfSpecAnnot :no="spec.no" :title="spec.title" :items="[...spec.items]" :placement="placement" />
</template>
