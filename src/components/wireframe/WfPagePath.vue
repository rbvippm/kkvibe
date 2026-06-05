<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 路径各层级，如 ['用户管理', '用户列表', '用户资产详情'] */
  segments: string[]
}>()

const pathText = computed(() => props.segments.join('-'))
</script>

<template>
  <div class="wf-page-path">
    <span class="wf-page-path__label">路径：</span>
    <span class="wf-page-path__value">{{ pathText }}</span>
  </div>
</template>
