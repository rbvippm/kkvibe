<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title?: string
  /** 自定义返回；未传时执行浏览器返回 */
  onBack?: () => void
}>()

const router = useRouter()

function handleBack() {
  if (props.onBack) {
    props.onBack()
    return
  }
  router.back()
}
</script>

<template>
  <header class="mh5-sub-header" :class="{ 'mh5-sub-header--center': Boolean($slots.center) }">
    <button type="button" class="mh5-sub-header__back" :aria-label="$t('返回')" @click="handleBack">
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
    <div v-if="$slots.center" class="mh5-sub-header__center">
      <slot name="center" />
    </div>
    <h1 v-else class="mh5-sub-header__title">{{ $t(title || '') }}</h1>
    <div class="mh5-sub-header__right">
      <slot name="right" />
    </div>
  </header>
</template>
