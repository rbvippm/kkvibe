<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { appLock } from '../../constants/appLock'
import { HIDDEN_MODE_SPEC } from '../../constants/hiddenModeSpec'
import '../../styles/mobile-app-shell.css'

const router = useRouter()
const stage = ref<'' | 'set' | 'confirm'>('')
const purpose = ref<'enable' | 'edit'>('enable')
const draft = ref('')
const entry = ref('')
const error = ref('')

const title = computed(() => {
  if (stage.value === 'confirm') return '再次输入'
  return purpose.value === 'edit' ? '修改进入字符' : '设置进入字符'
})
const canFinish = computed(() => entry.value.length >= 4)

function onBack() {
  if (stage.value === 'confirm') {
    stage.value = 'set'
    entry.value = draft.value
    error.value = ''
    return
  }
  if (stage.value) {
    stage.value = ''
    entry.value = ''
    draft.value = ''
    error.value = ''
    return
  }
  router.back()
}

function beginEntry(next: 'enable' | 'edit') {
  purpose.value = next
  draft.value = ''
  entry.value = ''
  error.value = ''
  stage.value = 'set'
}

function toggle() {
  if (appLock.hidden) {
    appLock.hidden = false
    appLock.hiddenCode = ''
    appLock.calculator = false
    return
  }
  beginEntry('enable')
}

function editCode() {
  if (!appLock.hidden) return
  beginEntry('edit')
}

function press(digit: string) {
  error.value = ''
  if (entry.value.length >= 8) return
  entry.value += digit
}

function backspace() {
  error.value = ''
  entry.value = entry.value.slice(0, -1)
}

function finish() {
  if (entry.value.length < 4) return
  if (stage.value === 'set') {
    draft.value = entry.value
    entry.value = ''
    error.value = ''
    stage.value = 'confirm'
    return
  }
  if (entry.value !== draft.value) {
    entry.value = ''
    error.value = '两次输入不一致'
    return
  }
  appLock.hiddenCode = entry.value
  appLock.hidden = true
  if (purpose.value === 'enable') {
    appLock.locked = false
    appLock.calculator = true
  }
  stage.value = ''
  entry.value = ''
  draft.value = ''
}
</script>

<template>
  <div class="mh5-settings-page mh5-app-lock-page">
    <Mh5SubPageHeader :on-back="onBack">
      <template #center>
        <h1 class="mh5-sub-header__title mh5-app-lock-heading">
          {{ $t('隐藏模式') }}
          <Mh5SpecAnnot v-if="!stage" :spec="HIDDEN_MODE_SPEC" placement="bottom" />
        </h1>
      </template>
    </Mh5SubPageHeader>

    <div v-if="stage" class="mh5-pin">
      <p class="mh5-pin__title">{{ $t(title) }}</p>
      <p class="mh5-pin__error">{{ error ? $t(error) : ' ' }}</p>
      <p class="mh5-hidden-code" :class="{ 'is-placeholder': !entry }">
        {{ entry || $t('请输入 4 到 8 位数字') }}
      </p>
      <button type="button" class="mh5-hidden-code-done" :disabled="!canFinish" @click="finish">
        {{ $t('完成') }}
      </button>
      <div class="mh5-pin__pad">
        <button v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" :key="digit" type="button" @click="press(digit)">
          {{ digit }}
        </button>
        <span class="mh5-pin__gap" />
        <button type="button" @click="press('0')">0</button>
        <button type="button" class="mh5-pin__delete" :aria-label="$t('删除')" @click="backspace">
          <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
            <path d="M8 1h15a2 2 0 012 2v14a2 2 0 01-2 2H8l-7-9 7-9z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M12 6l7 8M19 6l-7 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <main v-else class="mh5-app-lock-main">
      <section class="mh5-app-lock-card">
        <div class="mh5-app-lock-switch-row">
          <div class="mh5-app-lock-copy">
            <p>{{ $t('隐藏模式') }}</p>
            <span v-if="appLock.hidden">{{ $t('开启隐藏模式后会默认进入计算器，在计算器内输入进入字符') }} {{ appLock.hiddenCode }} {{ $t('打开原有应用') }}</span>
            <span v-else>{{ $t('开启后打开应用直接进入计算器') }}</span>
          </div>
          <button
            type="button"
            class="mh5-channel-switch"
            :class="{ 'mh5-channel-switch--on': appLock.hidden }"
            :aria-pressed="appLock.hidden"
            :aria-label="$t('隐藏模式')"
            @click="toggle"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
        <button v-if="appLock.hidden" type="button" class="mh5-app-lock-row" @click="editCode">
          {{ $t('修改进入字符') }}
        </button>
      </section>
    </main>
  </div>
</template>
