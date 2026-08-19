<script setup lang="ts">
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'
</script>

<template>
  <div class="mh5-route-view">
    <Mh5SubPageHeader title="代理交收" />
    <div class="mh5-sub-content mh5-tab-placeholder">
      <div class="mh5-tab-placeholder__card">
        <span class="mh5-tab-placeholder__emoji" aria-hidden="true">📒</span>
        <h1 class="mh5-tab-placeholder__title">{{ $t('代理交收') }}</h1>
        <p class="mh5-tab-placeholder__desc">{{ $t('该功能正在建设中，后续将在此展示代理交收记录。') }}</p>
        <p class="mh5-tab-placeholder__hint">{{ $t('原型缺省页 · 演示环境') }}</p>
      </div>
    </div>
  </div>
</template>
