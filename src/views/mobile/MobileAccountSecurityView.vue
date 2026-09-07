<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { ACCOUNT_SECURITY_COPY_ICON, ACCOUNT_SECURITY_PROFILE } from '../../constants/accountSecurity'
import { mineHomeRouteName, withMineHallFrom } from '../../constants/mineHall'
import { mh5Alert, mh5Confirm } from '../../composables/useMh5Confirm'
import { t } from '../../i18n'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const route = useRoute()
const toast = ref('')
const profile = ACCOUNT_SECURITY_PROFILE

function hallQuery() {
  return withMineHallFrom(route.query.from)
}

function showToast(message: string) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 1600)
}

async function copyKingkongId() {
  try {
    await navigator.clipboard.writeText(profile.kingkongId)
    showToast(t('已复制金刚号'))
  } catch {
    showToast(t('复制失败，请手动长按复制'))
  }
}

function onKingkongRow() {
  showToast(t('金刚号仅可修改一次，当前暂不可改'))
}

async function openComingSoon(title: string) {
  await mh5Alert({
    title: t('「{title}」功能开发中', { title: t(title) }),
    message: t('原型占位'),
  })
}

async function confirmDeleteAccount() {
  const ok = await mh5Confirm({
    title: t('确认注销账号？'),
    message: t('注销后无法恢复，账号与资产将按平台规则处理。'),
    confirmText: t('注销账号'),
    cancelText: t('取消'),
  })
  if (!ok) return
  await mh5Alert({
    title: t('已提交注销申请（原型）'),
    message: t('原型占位'),
  })
}

async function confirmLogout() {
  const ok = await mh5Confirm({
    title: t('确认登出当前账号？'),
    confirmText: t('登出'),
    cancelText: t('取消'),
  })
  if (!ok) return
  await mh5Alert(t('已登出（原型）'))
  void router.push({ name: mineHomeRouteName(route.query.from), query: hallQuery() })
}
</script>

<template>
  <div class="mh5-settings-page mh5-account-security-page">
    <Mh5SubPageHeader :title="$t('账号与安全')" />

    <main class="mh5-account-security">
      <section class="mh5-account-security__block">
        <h2 class="mh5-account-security__heading">{{ $t('账号信息') }}</h2>
        <div class="mh5-settings-group mh5-account-security__card">
          <button type="button" class="mh5-settings-item mh5-account-security__row" @click="onKingkongRow">
            <span class="mh5-settings-item__title mh5-account-security__label">{{ $t('金刚号') }}</span>
            <span class="mh5-settings-item__trail">
              <span class="mh5-account-security__value">{{ profile.kingkongId }}</span>
              <span
                class="mh5-account-security__copy"
                role="button"
                :aria-label="$t('复制金刚号')"
                @click.stop="copyKingkongId"
              >
                <img
                  :src="ACCOUNT_SECURITY_COPY_ICON"
                  alt=""
                  width="20"
                  height="20"
                  class="mh5-account-security__copy-icon"
                />
              </span>
              <svg
                width="20"
                height="20"
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

          <button type="button" class="mh5-settings-item mh5-account-security__row" @click="openComingSoon('手机号')">
            <span class="mh5-settings-item__title mh5-account-security__label">{{ $t('手机号') }}</span>
            <span class="mh5-settings-item__trail">
              <span v-if="profile.phoneStatus === 'unbound'" class="mh5-account-security__tag">{{ $t('未绑定') }}</span>
              <svg
                width="20"
                height="20"
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

          <button type="button" class="mh5-settings-item mh5-account-security__row" @click="openComingSoon('邮箱')">
            <span class="mh5-settings-item__title mh5-account-security__label">{{ $t('邮箱') }}</span>
            <span class="mh5-settings-item__trail">
              <span v-if="profile.emailStatus === 'unbound'" class="mh5-account-security__tag">{{ $t('未绑定') }}</span>
              <svg
                width="20"
                height="20"
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
        </div>
      </section>

      <section class="mh5-account-security__block">
        <h2 class="mh5-account-security__heading">{{ $t('安全设置') }}</h2>
        <div class="mh5-settings-group mh5-account-security__card">
          <button type="button" class="mh5-settings-item mh5-account-security__row" @click="openComingSoon('登录密码')">
            <span class="mh5-settings-item__title mh5-account-security__label">{{ $t('登录密码') }}</span>
            <span class="mh5-settings-item__trail">
              <svg
                width="20"
                height="20"
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

          <button type="button" class="mh5-settings-item mh5-account-security__row" @click="openComingSoon('安全密码')">
            <span class="mh5-settings-item__title mh5-account-security__label">{{ $t('安全密码') }}</span>
            <span class="mh5-settings-item__trail">
              <span v-if="profile.securityPasswordStatus === 'unset'" class="mh5-account-security__tag">{{
                $t('未设置')
              }}</span>
              <svg
                width="20"
                height="20"
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
        </div>
      </section>

      <section class="mh5-account-security__block mh5-account-security__block--alone">
        <div class="mh5-settings-group mh5-account-security__card">
          <button type="button" class="mh5-settings-item mh5-account-security__row" @click="confirmDeleteAccount">
            <span class="mh5-settings-item__title mh5-account-security__label mh5-account-security__label--danger">{{
              $t('注销账号')
            }}</span>
          </button>
        </div>
      </section>

      <button type="button" class="mh5-account-security__logout" @click="confirmLogout">{{ $t('登出') }}</button>
    </main>

    <p v-if="toast" class="mh5-bet-order-copy-tip">{{ toast }}</p>
  </div>
</template>
