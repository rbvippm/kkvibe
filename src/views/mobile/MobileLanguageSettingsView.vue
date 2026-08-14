<script setup lang="ts">
import { appLocale, APP_LOCALE_OPTIONS, setAppLocale, type AppLocale } from '../../i18n'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import '../../styles/mobile-app-shell.css'

function selectLocale(id: AppLocale) {
  if (id === appLocale.value) return
  setAppLocale(id)
}
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('语言设置')" />

    <main class="mh5-settings-main">
      <section class="mh5-settings-group">
        <button
          v-for="item in APP_LOCALE_OPTIONS"
          :key="item.id"
          type="button"
          class="mh5-settings-item"
          :class="{ 'mh5-settings-item--checked': appLocale === item.id }"
          @click="selectLocale(item.id)"
        >
          <span class="mh5-settings-item__title">{{ item.nativeName }}</span>
          <span v-if="appLocale === item.id" class="mh5-settings-item__check" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3.5 9.5l4 4 7-8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
      </section>
    </main>
  </div>
</template>
