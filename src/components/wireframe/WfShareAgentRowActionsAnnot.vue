<script setup lang="ts">
import {
  SHARE_AGENT_ROW_ACTIONS_LABEL,
  SHARE_AGENT_ROW_ACTIONS_SPEC,
  SHARE_AGENT_SPEC_ANNOT_NO,
} from '../../constants/pcShareAgent'
import WfSpecAnnot from './WfSpecAnnot.vue'

withDefaults(
  defineProps<{
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    :no="SHARE_AGENT_SPEC_ANNOT_NO.rowActions"
    :title="SHARE_AGENT_ROW_ACTIONS_LABEL"
    :items="[...SHARE_AGENT_ROW_ACTIONS_SPEC]"
    :placement="placement"
  />
</template>
