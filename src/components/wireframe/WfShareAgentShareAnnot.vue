<script setup lang="ts">
import { SHARE_AGENT_SHARE_LABEL, SHARE_AGENT_SHARE_SPEC, SHARE_AGENT_SPEC_ANNOT_NO } from '../../constants/pcShareAgent'
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
    :no="SHARE_AGENT_SPEC_ANNOT_NO.share"
    :title="SHARE_AGENT_SHARE_LABEL"
    :items="[...SHARE_AGENT_SHARE_SPEC]"
    :placement="placement"
  />
</template>
