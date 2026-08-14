<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import '../../styles/mobile-app-shell.css'

const route = useRoute()

const title = computed(() => (route.meta.placeholderTitle as string) || '敬请期待')
const desc = computed(
  () =>
    (route.meta.placeholderDesc as string) ||
    '该模块正在建设中，后续将在此展示相关内容。',
)
const emoji = computed(() => (route.meta.placeholderEmoji as string) || '📭')
</script>

<template>
  <div class="mh5-tab-placeholder">
    <div class="mh5-tab-placeholder__card">
      <span class="mh5-tab-placeholder__emoji" aria-hidden="true">{{ emoji }}</span>
      <h1 class="mh5-tab-placeholder__title">{{ title }}</h1>
      <p class="mh5-tab-placeholder__desc">{{ desc }}</p>
      <p class="mh5-tab-placeholder__hint">{{ $t('原型缺省页 · 演示环境') }}</p>
    </div>
  </div>
</template>
