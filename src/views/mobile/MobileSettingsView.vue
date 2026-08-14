<script setup lang="ts">
import { useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { mh5Alert } from '../../composables/useMh5Confirm'
import { MINE_SETTINGS_GROUPS, type MineSettingsItem } from '../../constants/mineSettings'
import { appLocaleMeta, t } from '../../i18n'
import '../../styles/mobile-app-shell.css'

const router = useRouter()

function handleItemClick(item: MineSettingsItem) {
  if (item.key === 'language') {
    void router.push({ name: 'mobile-mine-language' })
    return
  }
  void mh5Alert({
    title: t('「{title}」功能开发中', { title: t(item.title) }),
    message: t('原型占位'),
  })
}
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('设置')" />

    <main class="mh5-settings-main">
      <section v-for="group in MINE_SETTINGS_GROUPS" :key="group.key" class="mh5-settings-group">
        <button
          v-for="item in group.items"
          :key="item.key"
          type="button"
          class="mh5-settings-item"
          @click="handleItemClick(item)"
        >
          <span class="mh5-settings-item__icon" aria-hidden="true">
            <!-- 账号与安全 -->
            <svg v-if="item.key === 'account-security'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.6" />
              <path
                d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
            <!-- 钱包安全密码 -->
            <svg v-else-if="item.key === 'wallet-password'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 10V8a4 4 0 118 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <circle cx="12" cy="15" r="1.2" fill="currentColor" />
            </svg>
            <!-- 语言设置 -->
            <svg v-else-if="item.key === 'language'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 8h8M8 12h6M8 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <!-- 聊天设置 -->
            <svg v-else-if="item.key === 'chat'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 6h14a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <!-- 隐私设置 -->
            <svg v-else-if="item.key === 'privacy'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l7 3v6c0 4.4-3.1 8.5-7 9.8C8.1 20.5 5 16.4 5 12V6l7-3z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <!-- 通知 -->
            <svg v-else-if="item.key === 'notification'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4a5 5 0 00-5 5v3.5L5 15h14l-2-2.5V9a5 5 0 00-5-5z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path d="M10 17a2 2 0 004 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <!-- 数据与储存 -->
            <svg v-else-if="item.key === 'storage'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="7" rx="7" ry="3" stroke="currentColor" stroke-width="1.6" />
              <path
                d="M5 7v4c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"
                stroke="currentColor"
                stroke-width="1.6"
              />
            </svg>
            <!-- 设备 -->
            <svg v-else-if="item.key === 'devices'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.6" />
              <rect x="14" y="9" width="7" height="11" rx="1.5" stroke="currentColor" stroke-width="1.6" />
              <path d="M7 17h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <!-- 帮助与反馈 -->
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l8 4.5v7L12 19l-8-4.5v-7L12 3z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path
                d="M12 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                fill="currentColor"
              />
              <path d="M12 13v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>

          <span class="mh5-settings-item__title">{{ $t(item.title) }}</span>

          <span class="mh5-settings-item__trail">
            <template v-if="item.key === 'language'">
              <span class="mh5-settings-item__locale">{{ appLocaleMeta.nativeName }}</span>
            </template>
            <template v-else-if="item.trailing?.type === 'phone'">
              <span class="mh5-settings-item__phone">{{ item.trailing.value }}</span>
            </template>
            <template v-else-if="item.trailing?.type === 'wallet-unset'">
              <svg
                class="mh5-settings-item__warn-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2.5l9 5.2v7.6L12 20.5 3 15.3V7.7L12 2.5z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
                <path d="M12 8.5v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              <span class="mh5-settings-item__warn-text">未设置</span>
            </template>
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              class="mh5-settings-item__arrow"
              aria-hidden="true"
            >
              <path
                d="M7 4l6 6-6 6"
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
