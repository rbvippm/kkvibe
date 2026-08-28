<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnchorSession } from '../../composables/useAnchorSession'
import { ANCHOR_COUNTRY_CODES, type AnchorCountryCode } from '../../constants/liveAnchorAssistant'
import '../../styles/pc-anchor-login.css'

const router = useRouter()
const route = useRoute()
const { loginByAccount, loginByPhone, isLoggedIn } = useAnchorSession()

const tab = ref<'password' | 'code'>('password')
const identity = ref('')
const country = ref('+86')
const password = ref('')
const sms = ref('')
const showPassword = ref(false)
const error = ref('')
const submitting = ref(false)
const countdown = ref(0)
const identityFieldRef = ref<HTMLElement | null>(null)
const dialSearchRef = ref<HTMLInputElement | null>(null)
const dialOpen = ref(false)
const dialQuery = ref('')
let timer: number | null = null

const isPhoneIdentity = computed(() => /^\d+$/.test(identity.value.trim()))
const identityPlaceholder = computed(() =>
  tab.value === 'code' ? '请输入手机号/邮箱' : '请输入金刚号/手机号/邮箱',
)

const groupedDialCodes = computed(() => {
  const raw = dialQuery.value.trim()
  const q = raw.toLowerCase().replace(/^\+/, '')
  const list = ANCHOR_COUNTRY_CODES.filter((item) => {
    if (!q) return true
    return item.name.includes(raw) || item.value.toLowerCase().includes(q) || item.value.slice(1) === q
  })
  const groups: { letter: string; items: AnchorCountryCode[] }[] = []
  for (const item of list) {
    const last = groups[groups.length - 1]
    if (!last || last.letter !== item.letter) groups.push({ letter: item.letter, items: [item] })
    else last.items.push(item)
  }
  return groups
})

const canSubmit = computed(() => {
  if (!identity.value.trim()) return false
  if (tab.value === 'password') return Boolean(password.value)
  return Boolean(sms.value.trim())
})

function goHome() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/pc-anchor/live-assistant'
  router.replace(redirect)
}

function closeDial() {
  dialOpen.value = false
  dialQuery.value = ''
}

watch(isPhoneIdentity, (on) => {
  if (!on) closeDial()
})

function toggleDial() {
  dialOpen.value = !dialOpen.value
  if (dialOpen.value) {
    dialQuery.value = ''
    void nextTick(() => dialSearchRef.value?.focus())
    return
  }
  dialQuery.value = ''
}

function pickDial(value: string) {
  country.value = value
  closeDial()
}

function onDocPointer(e: MouseEvent) {
  if (!dialOpen.value) return
  const root = identityFieldRef.value
  if (root && !root.contains(e.target as Node)) closeDial()
}

function onDocKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDial()
}

onMounted(() => {
  if (isLoggedIn.value) goHome()
  document.addEventListener('mousedown', onDocPointer)
  document.addEventListener('keydown', onDocKey)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
  document.removeEventListener('mousedown', onDocPointer)
  document.removeEventListener('keydown', onDocKey)
})

function switchTab(next: 'password' | 'code') {
  tab.value = next
  error.value = ''
  closeDial()
}

function sendCode() {
  if (countdown.value > 0) return
  const value = identity.value.trim()
  if (!value) {
    error.value = tab.value === 'code' ? '请输入手机号/邮箱' : '请输入金刚号/手机号/邮箱'
    return
  }
  error.value = ''
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      window.clearInterval(timer)
      timer = null
    }
  }, 1000)
}

function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  error.value = ''
  const msg =
    tab.value === 'password'
      ? loginByAccount(identity.value, password.value)
      : loginByPhone(identity.value, sms.value)
  submitting.value = false
  if (msg) {
    error.value = msg
    return
  }
  goHome()
}
</script>

<template>
  <div class="pca-login">
    <div class="pca-login__inner">
      <section class="pca-login__hero">
        <div class="pca-login__art" aria-hidden="true">
          <img src="/images/discover/mic-deco.png" alt="" width="240" height="320" />
        </div>
        <h1 class="pca-login__hero-title">主播</h1>
        <p class="pca-login__hero-desc">开播、互动与房间经营，一站完成。</p>
      </section>
      <section class="pca-login__card">
      <h1 class="pca-login__title">登录</h1>

      <div class="pca-login__tabs" role="tablist" aria-label="登录方式">
        <button
          type="button"
          role="tab"
          class="pca-login__tab"
          :class="{ 'is-on': tab === 'password' }"
          :aria-selected="tab === 'password'"
          @click="switchTab('password')"
        >
          账号密码登录
        </button>
        <button
          type="button"
          role="tab"
          class="pca-login__tab"
          :class="{ 'is-on': tab === 'code' }"
          :aria-selected="tab === 'code'"
          @click="switchTab('code')"
        >
          验证码登录
        </button>
      </div>

      <form class="pca-login__form" @submit.prevent="submit">
        <div ref="identityFieldRef" class="pca-login__field pca-login__field--identity">
          <div class="pca-login__control" :class="{ 'is-phone': isPhoneIdentity }">
            <template v-if="isPhoneIdentity">
              <button
                type="button"
                class="pca-login__dial"
                :class="{ 'is-open': dialOpen }"
                aria-label="区号"
                :aria-expanded="dialOpen"
                aria-haspopup="listbox"
                @click="toggleDial"
              >
                {{ country }}
              </button>
              <span class="pca-login__split" aria-hidden="true" />
            </template>
            <input
              v-model="identity"
              type="text"
              :placeholder="identityPlaceholder"
              autocomplete="username"
            />
            <button
              v-if="identity"
              type="button"
              class="pca-login__clear"
              aria-label="清空"
              @click="identity = ''"
            >
              ×
            </button>
          </div>
          <div v-if="dialOpen && isPhoneIdentity" class="pca-login__dial-menu" role="listbox" aria-label="选择区号">
            <div class="pca-login__dial-search">
              <img src="/images/discover/icon-search.svg" alt="" width="20" height="20" />
              <input
                ref="dialSearchRef"
                v-model="dialQuery"
                type="text"
                placeholder="搜索"
                autocomplete="off"
                @keydown.enter.prevent
              />
            </div>
            <div class="pca-login__dial-scroll">
              <template v-for="group in groupedDialCodes" :key="group.letter">
                <p class="pca-login__dial-letter">{{ group.letter }}</p>
                <button
                  v-for="item in group.items"
                  :key="`${item.letter}-${item.name}-${item.value}`"
                  type="button"
                  class="pca-login__dial-item"
                  :class="{ 'is-on': country === item.value }"
                  role="option"
                  :aria-selected="country === item.value"
                  @click="pickDial(item.value)"
                >
                  <span>{{ item.name }}</span>
                  <em>{{ item.value }}</em>
                </button>
              </template>
              <p v-if="!groupedDialCodes.length" class="pca-login__dial-empty">无匹配区号</p>
            </div>
          </div>
        </div>

        <label v-if="tab === 'password'" class="pca-login__field">
          <span class="pca-login__label">密码</span>
          <span class="pca-login__control">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
            <button type="button" class="pca-login__extra" @click="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </span>
        </label>

        <label v-else class="pca-login__field">
          <span class="pca-login__label">验证码</span>
          <span class="pca-login__control">
            <input v-model="sms" inputmode="numeric" placeholder="请输入验证码" autocomplete="one-time-code" />
            <button type="button" class="pca-login__code-btn" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </span>
        </label>

        <p v-if="error" class="pca-login__error">{{ error }}</p>

        <button type="submit" class="pca-login__submit" :disabled="!canSubmit || submitting">登录</button>
      </form>
    </section>
    </div>
  </div>
</template>
