<script setup lang="ts">
import {
  LIVE_BROADCAST_ANNOT_MAP,
  type LiveBroadcastAnnotContext,
} from '../../constants/liveBroadcastSpec'
import WfSpecAnnot from './WfSpecAnnot.vue'

const props = withDefaults(
  defineProps<{
    context: LiveBroadcastAnnotContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const spec = LIVE_BROADCAST_ANNOT_MAP[props.context]
</script>

<template>
  <WfSpecAnnot :no="spec.no" :title="spec.title" :items="[...spec.items]" :placement="placement" />
</template>
