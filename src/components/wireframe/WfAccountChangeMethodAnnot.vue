<script setup lang="ts">
import {
  ACCOUNT_CHANGE_METHOD_SPEC,
  type AccountChangeMethodSpecContext,
} from '../../constants/accountChangeMethod'
import { VERSION_V2_SPEC_ANNOT_NO } from '../../constants/versionRecordV2'
import WfSpecAnnot from './WfSpecAnnot.vue'

withDefaults(
  defineProps<{
    context: AccountChangeMethodSpecContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    :no="VERSION_V2_SPEC_ANNOT_NO.accountChangeMethod"
    title="账变方式"
    :items="[...ACCOUNT_CHANGE_METHOD_SPEC[context]]"
    :placement="placement"
  />
</template>
