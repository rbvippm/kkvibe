<script setup lang="ts">
/** aidemo · 邮箱 & 账号注册（1:1 嵌入原 HTML 原型） */
const aidemoSrc = `${import.meta.env.BASE_URL}aidemo/v2.21.1-email-account-register.html`
</script>

<template>
  <div class="aidemo-embed">
    <iframe
      :src="aidemoSrc"
      title="金刚 · 邮箱与账号注册产品原型"
      class="aidemo-embed__frame"
    />
  </div>
</template>

<style scoped>
.aidemo-embed {
  height: 100%;
  min-height: calc(100vh - var(--pc-layout-header-height, 88px));
  margin: -1px;
  overflow: hidden;
  background: #0f1115;
}

.aidemo-embed__frame {
  display: block;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - var(--pc-layout-header-height, 88px));
  border: 0;
}
</style>
