<script setup lang="ts">
import PcCreditFlowPanel from '../../components/pc/PcCreditFlowPanel.vue'
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import { CREDIT_FLOW_LIST_SPEC_ANNOT_NO } from '../../constants/creditFlowListSpec'
import '../../styles/pc-wireframe.css'
</script>

<template>
  <div class="pc-wireframe-page">
    <WfPagePathMenu />
    <PcCreditFlowPanel :annot-no="CREDIT_FLOW_LIST_SPEC_ANNOT_NO" />
  </div>
</template>
