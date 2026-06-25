<script setup lang="ts">
import { computed } from 'vue'
import type { XCoinSelectableTarget } from '../../constants/xCoinTransfer'

const props = defineProps<{
  modelValue: XCoinSelectableTarget | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: XCoinSelectableTarget | null]
  selectMember: []
}>()

const memberLabel = computed(() => props.modelValue?.nickname ?? '请选择会员')
</script>

<template>
  <button type="button" class="mh5-xcoin-select-row" @click="emit('selectMember')">
    <span :class="{ 'mh5-xcoin-select-row__placeholder': !modelValue }">{{ memberLabel }}</span>
    <span class="mh5-xcoin-select-row__arrow">›</span>
  </button>
</template>
