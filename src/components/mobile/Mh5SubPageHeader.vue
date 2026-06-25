<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
}>()

const router = useRouter()
</script>

<template>
  <header class="mh5-sub-header">
    <button type="button" class="mh5-sub-header__back" aria-label="返回" @click="router.back()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <h1 class="mh5-sub-header__title">{{ title }}</h1>
    <div class="mh5-sub-header__right">
      <slot name="right" />
    </div>
  </header>
</template>
