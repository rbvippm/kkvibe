<script setup lang="ts">
import {
  ACCOUNT_CHANGE_CURRENCY_SPEC,
  type AccountChangeCurrencySpecContext,
} from '../../constants/accountChangeCurrency'
import WfSpecAnnot from './WfSpecAnnot.vue'

withDefaults(
  defineProps<{
    context: AccountChangeCurrencySpecContext
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)
</script>

<template>
  <WfSpecAnnot
    title="币种类型"
    :items="[...ACCOUNT_CHANGE_CURRENCY_SPEC[context]]"
    :placement="placement"
  />
</template>
