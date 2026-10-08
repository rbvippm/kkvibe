<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { appLock } from '../../constants/appLock'
import { withMineHallFrom } from '../../constants/mineHall'
import { privacyPrefs } from '../../constants/privacyPrefs'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const route = useRoute()

const modeLabel = computed(() => {
  if (appLock.mode === 'pin') return '密码'
  if (appLock.mode === 'gesture') return '手势'
  return '无'
})

function hallQuery() {
  return withMineHallFrom(route.query.from)
}

function openAppLock() {
  void router.push({ name: 'mobile-mine-app-lock', query: hallQuery() })
}

function openBlacklist() {
  void router.push({ name: 'mobile-mine-blacklist', query: hallQuery() })
}
</script>

<template>
  <div class="mh5-settings-page">
    <Mh5SubPageHeader :title="$t('隐私设置')" />

    <main class="mh5-app-lock-main">
      <section class="mh5-app-lock-card">
        <button type="button" class="mh5-app-lock-choice__hit" @click="openAppLock">
          <span>{{ $t('App锁定') }}</span>
          <span class="mh5-privacy-trail">
            <span class="mh5-app-lock-choice__value">{{ $t(modeLabel) }}</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </section>

      <section class="mh5-app-lock-card">
        <div class="mh5-app-lock-switch-row">
          <div class="mh5-app-lock-copy">
            <p>{{ $t('发送已读回执') }}</p>
          </div>
          <button
            type="button"
            class="mh5-channel-switch"
            :class="{ 'mh5-channel-switch--on': privacyPrefs.readReceipt }"
            :aria-pressed="privacyPrefs.readReceipt"
            :aria-label="$t('发送已读回执')"
            @click="privacyPrefs.readReceipt = !privacyPrefs.readReceipt"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
      </section>

      <section class="mh5-app-lock-card">
        <div class="mh5-app-lock-switch-row">
          <div class="mh5-app-lock-copy">
            <p>{{ $t('不能被搜索到') }}</p>
            <span>{{ $t('开启后别人不能通过账号或金刚号搜索到你') }}</span>
          </div>
          <button
            type="button"
            class="mh5-channel-switch"
            :class="{ 'mh5-channel-switch--on': privacyPrefs.unsearchable }"
            :aria-pressed="privacyPrefs.unsearchable"
            :aria-label="$t('不能被搜索到')"
            @click="privacyPrefs.unsearchable = !privacyPrefs.unsearchable"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
      </section>

      <section class="mh5-app-lock-card">
        <div class="mh5-app-lock-switch-row">
          <div class="mh5-app-lock-copy">
            <p>{{ $t('申请好友免验证') }}</p>
            <span>{{ $t('添加我为好友时无需验证') }}</span>
          </div>
          <button
            type="button"
            class="mh5-channel-switch"
            :class="{ 'mh5-channel-switch--on': privacyPrefs.friendNoVerify }"
            :aria-pressed="privacyPrefs.friendNoVerify"
            :aria-label="$t('申请好友免验证')"
            @click="privacyPrefs.friendNoVerify = !privacyPrefs.friendNoVerify"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
      </section>

      <section class="mh5-app-lock-card">
        <button type="button" class="mh5-app-lock-choice__hit" @click="openBlacklist">
          <span>{{ $t('黑名单') }}</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" class="mh5-privacy-arrow" aria-hidden="true">
            <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </section>
    </main>
  </div>
</template>
