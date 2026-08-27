<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnchorSession } from '../../composables/useAnchorSession'
import { ANCHOR_COUNTRY_CODES, ANCHOR_LOGIN_SLIDES } from '../../constants/liveAnchorAssistant'
import '../../styles/pc-anchor-login.css'

const router = useRouter()
const route = useRoute()
const { loginByAccount, loginByPhone, loginByQr, isLoggedIn, DEMO_ACCOUNT, DEMO_PASSWORD, DEMO_PHONE, DEMO_SMS_CODE } =
  useAnchorSession()

const tab = ref<'phone' | 'account'>('account')
const showQr = ref(false)
const slide = ref(0)
const country = ref('+86')
const phone = ref('')
const sms = ref('')
const account = ref(DEMO_ACCOUNT)
const password = ref('')
const error = ref('')
const submitting = ref(false)
const countdown = ref(0)
let timer: number | null = null
let slideTimer: number | null = null

const latency = ref(256)

function goHome() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/pc-anchor/live-assistant'
  router.replace(redirect)
}

onMounted(() => {
  if (isLoggedIn.value) goHome()
  slideTimer = window.setInterval(() => {
    slide.value = (slide.value + 1) % ANCHOR_LOGIN_SLIDES.length
  }, 4000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
  if (slideTimer) window.clearInterval(slideTimer)
})

function sendCode() {
  if (countdown.value > 0) return
  if (!/^\d{6,15}$/.test(phone.value.trim())) {
    error.value = '请输入正确的手机号'
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
  submitting.value = true
  error.value = ''
  const msg = tab.value === 'account' ? loginByAccount(account.value, password.value) : loginByPhone(phone.value, sms.value)
  submitting.value = false
  if (msg) {
    error.value = msg
    return
  }
  goHome()
}

function confirmQr() {
  loginByQr()
  goHome()
}
</script>

<template>
  <div class="pca-login">
    <div class="pca-login__inner">
      <section class="pca-login__hero">
        <div class="pca-login__art" aria-hidden="true">📺</div>
        <h1 class="pca-login__hero-title">{{ ANCHOR_LOGIN_SLIDES[slide].title }}</h1>
        <p class="pca-login__hero-desc">{{ ANCHOR_LOGIN_SLIDES[slide].desc }}</p>
        <div class="pca-login__dots">
          <button
            v-for="(item, index) in ANCHOR_LOGIN_SLIDES"
            :key="item.title"
            type="button"
            class="pca-login__dot"
            :class="{ 'pca-login__dot--on': slide === index }"
            :aria-label="item.title"
            @click="slide = index"
          />
        </div>
      </section>

      <section class="pca-login__card">
        <button type="button" class="pca-login__qr-toggle" @click="showQr = !showQr">
          {{ showQr ? '账号' : '扫码' }}
        </button>
        <h2 class="pca-login__welcome">欢迎使用 KK Vibe</h2>

        <template v-if="showQr">
          <div class="pca-login__qr">
            <div class="pca-login__qr-box">请使用 App 扫码登录</div>
            <button type="button" class="pca-login__submit" @click="confirmQr">已扫码登录</button>
            <p class="pca-login__hint">原型可点「已扫码登录」进入，无需真实扫码。</p>
          </div>
        </template>

        <template v-else>
          <div class="pca-login__tabs">
            <button type="button" class="pca-login__tab" :class="{ 'pca-login__tab--on': tab === 'phone' }" @click="tab = 'phone'">
              手机号
            </button>
            <button
              type="button"
              class="pca-login__tab"
              :class="{ 'pca-login__tab--on': tab === 'account' }"
              @click="tab = 'account'"
            >
              账号/邮箱
            </button>
          </div>

          <form @submit.prevent="submit">
            <template v-if="tab === 'phone'">
              <div class="pca-login__row">
                <select v-model="country" aria-label="区号">
                  <option v-for="item in ANCHOR_COUNTRY_CODES" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
                <input v-model="phone" type="tel" placeholder="请输入手机号" autocomplete="tel" />
              </div>
              <div class="pca-login__code">
                <input v-model="sms" inputmode="numeric" placeholder="请输入验证码" />
                <button type="button" class="pca-login__send" :disabled="countdown > 0" @click="sendCode">
                  {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                </button>
              </div>
            </template>
            <template v-else>
              <div class="pca-login__row">
                <input v-model="account" placeholder="请输入账号/邮箱" autocomplete="username" />
              </div>
              <div class="pca-login__row">
                <input
                  v-model="password"
                  type="password"
                  placeholder="请输入6~20位英文字符或数字密码"
                  autocomplete="current-password"
                />
              </div>
            </template>
            <p class="pca-login__error">{{ error }}</p>
            <button type="submit" class="pca-login__submit" :disabled="submitting">登 录</button>
            <p class="pca-login__hint">
              演示账号 {{ DEMO_ACCOUNT }} / {{ DEMO_PASSWORD }}；手机 {{ DEMO_PHONE }} 验证码 {{ DEMO_SMS_CODE }}。
            </p>
          </form>
        </template>

        <p class="pca-login__line">线路检测 {{ latency }}ms · 信号正常</p>
      </section>
    </div>
  </div>
</template>
