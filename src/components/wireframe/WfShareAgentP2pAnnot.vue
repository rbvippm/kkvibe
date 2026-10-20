<script setup lang="ts">
import { SHARE_AGENT_P2P_SPEC, SHARE_AGENT_SPEC_ANNOT_NO } from '../../constants/pcShareAgent'
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
    :no="SHARE_AGENT_SPEC_ANNOT_NO.p2p"
    :title="title || 'P2P返利占成'"
    :items="[...SHARE_AGENT_P2P_SPEC]"
    :placement="placement"
  />
</template>
