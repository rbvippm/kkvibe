<script setup lang="ts">
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('黑名单')" />
    <main class="mh5-app-lock-main">
      <p class="mh5-privacy-empty">{{ $t('暂无黑名单') }}</p>
    </main>
  </div>
</template>
