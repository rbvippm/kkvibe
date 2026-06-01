<script setup lang="ts">
import {
  ACCOUNT_CHANGE_METHOD_SPEC,
  type AccountChangeMethodSpecContext,
} from '../../constants/accountChangeMethod'
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
    title="账变方式"
    :items="[...ACCOUNT_CHANGE_METHOD_SPEC[context]]"
    :placement="placement"
  />
</template>
