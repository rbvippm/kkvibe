<script setup lang="ts">
import { SHARE_AGENT_REBATE_SPEC, SHARE_AGENT_SPEC_ANNOT_NO } from '../../constants/pcShareAgent'
import WfSpecAnnot from './WfSpecAnnot.vue'

withDefaults(
  defineProps<{
    title?: string
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    :no="SHARE_AGENT_SPEC_ANNOT_NO.rebate"
    :title="title || '退水'"
    :items="[...SHARE_AGENT_REBATE_SPEC]"
    :placement="placement"
  />
</template>
