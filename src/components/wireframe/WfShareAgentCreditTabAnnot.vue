<script setup lang="ts">
import { SHARE_AGENT_CREDIT_TAB_LABEL, SHARE_AGENT_CREDIT_TAB_SPEC, SHARE_AGENT_SPEC_ANNOT_NO } from '../../constants/pcShareAgent'
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
    :no="SHARE_AGENT_SPEC_ANNOT_NO.creditTab"
    :title="SHARE_AGENT_CREDIT_TAB_LABEL"
    :items="[...SHARE_AGENT_CREDIT_TAB_SPEC]"
    :placement="placement"
  />
</template>
