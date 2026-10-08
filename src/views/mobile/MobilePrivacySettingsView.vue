<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import Mh5DigitPad from '../../components/mobile/Mh5DigitPad.vue'
import Mh5GesturePad from '../../components/mobile/Mh5GesturePad.vue'
import Mh5SpecAnnot from '../../components/mobile/Mh5SpecAnnot.vue'
import Mh5SubPageHeader from '../../components/mobile/Mh5SubPageHeader.vue'
import { appLock, type AppLockMode } from '../../constants/appLock'
import { APP_LOCK_SPEC } from '../../constants/appLockSpec'
import '../../styles/mobile-app-shell.css'

type Stage =
  | ''
  | 'set-pin'
  | 'confirm-pin'
  | 'verify-pin'
  | 'change-pin'
  | 'confirm-change-pin'
  | 'set-gesture'
  | 'confirm-gesture'
  | 'verify-gesture'
  | 'change-gesture'
  | 'confirm-change-gesture'
  | 'set-decoy'
  | 'confirm-decoy'
  | 'verify-pin-for-decoy'
  | 'verify-gesture-for-decoy'
  | 'change-decoy'
  | 'confirm-change-decoy'
  | 'set-decoy-gesture'
  | 'confirm-decoy-gesture'
  | 'change-decoy-gesture'
  | 'confirm-change-decoy-gesture'

const router = useRouter()
const stage = ref<Stage>('')
const draft = ref('')
const pinError = ref('')
const gestureError = ref('')
const sheetOpen = ref(false)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const lockedOn = computed(() => appLock.mode !== 'none')
const decoyTitle = computed(() => (appLock.mode === 'gesture' ? '替身手势' : '替身密码'))
const decoyHint = computed(() =>
  appLock.mode === 'gesture'
    ? '当被要求打开应用时，绘制替身手势会进入计算器，而不是真实内容。'
    : '当被要求打开应用时，输入替身密码会进入计算器，而不是真实内容。',
)
const decoyEditLabel = computed(() => (appLock.mode === 'gesture' ? '修改替身手势' : '修改替身密码'))
const decoyOn = computed(() => (appLock.mode === 'gesture' ? Boolean(appLock.decoyGesture) : Boolean(appLock.decoyPin)))

const modeLabel = computed(() => {
  if (appLock.mode === 'pin') return '密码'
  if (appLock.mode === 'gesture') return '手势'
  return '无'
})

const stageTitle = computed(() => {
  if (stage.value === 'set-pin') return '设置密码'
  if (stage.value === 'change-pin') return '设置新密码'
  if (stage.value === 'confirm-pin' || stage.value === 'confirm-change-pin') return '再次输入密码'
  if (stage.value === 'verify-pin') return '输入密码'
  if (stage.value === 'set-gesture' || stage.value === 'verify-gesture' || stage.value === 'verify-gesture-for-decoy') {
    return '绘制手势密码'
  }
  if (stage.value === 'change-gesture') return '绘制新手势密码'
  if (stage.value === 'confirm-gesture' || stage.value === 'confirm-change-gesture') return '再次绘制手势密码'
  if (stage.value === 'set-decoy' || stage.value === 'change-decoy') return '设置替身密码'
  if (stage.value === 'confirm-decoy' || stage.value === 'confirm-change-decoy') return '再次输入替身密码'
  if (stage.value === 'set-decoy-gesture' || stage.value === 'change-decoy-gesture') return '绘制替身手势'
  if (stage.value === 'confirm-decoy-gesture' || stage.value === 'confirm-change-decoy-gesture') return '再次绘制替身手势'
  if (stage.value === 'verify-pin-for-decoy') return '输入密码'
  return ''
})

const gestureStage = computed(() => stage.value.includes('gesture'))

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 1600)
}

function closeStage() {
  stage.value = ''
  draft.value = ''
  pinError.value = ''
  gestureError.value = ''
}

function openStage(next: Stage, keepDraft = false) {
  if (!keepDraft) draft.value = ''
  pinError.value = ''
  gestureError.value = ''
  stage.value = next
}

async function reject(message: string) {
  if (gestureStage.value) {
    gestureError.value = ''
    await nextTick()
    gestureError.value = message
    return
  }
  pinError.value = ''
  await nextTick()
  pinError.value = message
}

function choose(next: AppLockMode) {
  sheetOpen.value = false
  if (next === 'none') {
    appLock.mode = 'none'
    appLock.decoyPin = ''
    appLock.decoyGesture = ''
    appLock.locked = false
    appLock.calculator = false
    return
  }
  if (next === appLock.mode) return
  if (next === 'pin') {
    if (!appLock.pin) {
      openStage('set-pin')
      return
    }
    appLock.mode = 'pin'
    return
  }
  if (!appLock.gesture) {
    openStage('set-gesture')
    return
  }
  appLock.mode = 'gesture'
}

function changeSecret() {
  if (appLock.mode === 'pin') openStage('verify-pin')
  if (appLock.mode === 'gesture') openStage('verify-gesture')
}

function toggleDecoy() {
  if (appLock.mode === 'gesture') {
    if (appLock.decoyGesture) {
      appLock.decoyGesture = ''
      showToast('已关闭替身手势')
      return
    }
    openStage('set-decoy-gesture')
    return
  }
  if (appLock.decoyPin) {
    appLock.decoyPin = ''
    showToast('已关闭替身密码')
    return
  }
  openStage('set-decoy')
}

function editDecoy() {
  if (!decoyOn.value) return
  openStage(appLock.mode === 'gesture' ? 'verify-gesture-for-decoy' : 'verify-pin-for-decoy')
}

function onPin(pin: string) {
  if (stage.value === 'set-decoy' || stage.value === 'change-decoy') {
    if (appLock.pin && pin === appLock.pin) {
      void reject('不能与密码相同')
      return
    }
    draft.value = pin
    openStage(stage.value === 'set-decoy' ? 'confirm-decoy' : 'confirm-change-decoy', true)
    return
  }
  if (stage.value === 'confirm-decoy' || stage.value === 'confirm-change-decoy') {
    if (pin !== draft.value) {
      void reject('两次密码不一致')
      return
    }
    appLock.decoyPin = pin
    closeStage()
    showToast('替身密码已保存')
    return
  }
  if (stage.value === 'verify-pin-for-decoy') {
    if (pin !== appLock.pin) {
      void reject('密码错误')
      return
    }
    openStage('change-decoy')
    return
  }
  if (stage.value === 'set-pin' || stage.value === 'change-pin') {
    if (appLock.decoyPin && pin === appLock.decoyPin) {
      void reject('不能与替身密码相同')
      return
    }
    draft.value = pin
    openStage(stage.value === 'set-pin' ? 'confirm-pin' : 'confirm-change-pin', true)
    return
  }
  if (stage.value === 'confirm-pin' || stage.value === 'confirm-change-pin') {
    if (pin !== draft.value) {
      void reject('两次密码不一致')
      return
    }
    appLock.pin = pin
    appLock.mode = 'pin'
    closeStage()
    showToast('密码已保存')
    return
  }
  if (stage.value === 'verify-pin') {
    if (pin !== appLock.pin) {
      void reject('密码错误')
      return
    }
    openStage('change-pin')
  }
}

function onGesture(pattern: string) {
  const points = pattern.split('-').filter(Boolean)
  if (points.length < 4) {
    void reject('至少连接 4 个点')
    return
  }
  if (stage.value === 'set-decoy-gesture' || stage.value === 'change-decoy-gesture') {
    if (pattern === appLock.gesture) {
      void reject('不能与手势相同')
      return
    }
    draft.value = pattern
    openStage(stage.value === 'set-decoy-gesture' ? 'confirm-decoy-gesture' : 'confirm-change-decoy-gesture', true)
    return
  }
  if (stage.value === 'confirm-decoy-gesture' || stage.value === 'confirm-change-decoy-gesture') {
    if (pattern !== draft.value) {
      void reject('两次绘制不一致')
      return
    }
    appLock.decoyGesture = pattern
    closeStage()
    showToast('替身手势已保存')
    return
  }
  if (stage.value === 'set-gesture' || stage.value === 'change-gesture') {
    if (appLock.decoyGesture && pattern === appLock.decoyGesture) {
      void reject('不能与替身手势相同')
      return
    }
    draft.value = pattern
    openStage(stage.value === 'set-gesture' ? 'confirm-gesture' : 'confirm-change-gesture', true)
    return
  }
  if (stage.value === 'confirm-gesture' || stage.value === 'confirm-change-gesture') {
    if (pattern !== draft.value) {
      void reject('两次绘制不一致')
      return
    }
    appLock.gesture = pattern
    appLock.mode = 'gesture'
    closeStage()
    showToast('手势已保存')
    return
  }
  if (stage.value === 'verify-gesture' || stage.value === 'verify-gesture-for-decoy') {
    if (pattern !== appLock.gesture) {
      void reject('手势错误')
      return
    }
    openStage(stage.value === 'verify-gesture-for-decoy' ? 'change-decoy-gesture' : 'change-gesture')
  }
}

function onBack() {
  if (stage.value) {
    closeStage()
    return
  }
  router.back()
}
</script>

<template>
  <div class="mh5-settings-page mh5-app-lock-page">
    <Mh5SubPageHeader :on-back="onBack">
      <template #center>
        <h1 class="mh5-sub-header__title mh5-app-lock-heading">
          {{ $t('App锁定') }}
          <Mh5SpecAnnot v-if="!stage" :spec="APP_LOCK_SPEC" placement="bottom" />
        </h1>
      </template>
    </Mh5SubPageHeader>

    <Mh5DigitPad v-if="stage && !gestureStage" :key="stage" :title="stageTitle" :error="pinError" @submit="onPin" />
    <Mh5GesturePad v-else-if="gestureStage" :key="stage" :title="stageTitle" :error="gestureError" @submit="onGesture" />

    <main v-else class="mh5-app-lock-main">
      <section class="mh5-app-lock-card">
        <div class="mh5-app-lock-choice">
          <button type="button" class="mh5-app-lock-choice__hit" @click="sheetOpen = true">
            <span>{{ $t('App锁定') }}</span>
            <span class="mh5-app-lock-choice__value">{{ $t(modeLabel) }}</span>
          </button>
        </div>
        <button v-if="lockedOn" type="button" class="mh5-app-lock-row" @click="changeSecret">
          {{ $t('变更密码') }}
        </button>
      </section>
      <p class="mh5-app-lock-hint">{{ $t('使用密码或手势保护你的应用') }}</p>

      <section v-if="lockedOn" class="mh5-app-lock-card">
        <div class="mh5-app-lock-switch-row">
          <div class="mh5-app-lock-copy">
            <p>{{ $t('Face ID') }}</p>
            <span>{{ $t('使用Face ID解锁') }}</span>
          </div>
          <button
            type="button"
            class="mh5-channel-switch mh5-app-lock-switch"
            :class="{ 'mh5-channel-switch--on': appLock.faceId }"
            :aria-pressed="appLock.faceId"
            :aria-label="$t('Face ID')"
            @click="appLock.faceId = !appLock.faceId"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
      </section>

      <section v-if="lockedOn" class="mh5-app-lock-card">
        <div class="mh5-app-lock-switch-row">
          <div class="mh5-app-lock-copy">
            <p>{{ $t(decoyTitle) }}</p>
            <span>{{ $t(decoyHint) }}</span>
          </div>
          <button
            type="button"
            class="mh5-channel-switch mh5-app-lock-switch"
            :class="{ 'mh5-channel-switch--on': decoyOn }"
            :aria-pressed="decoyOn"
            :aria-label="$t(decoyTitle)"
            @click="toggleDecoy"
          >
            <span class="mh5-channel-switch__knob" />
          </button>
        </div>
        <button v-if="decoyOn" type="button" class="mh5-app-lock-row" @click="editDecoy">
          {{ $t(decoyEditLabel) }}
        </button>
      </section>
    </main>

    <p v-if="toast" class="mh5-app-lock-toast">{{ toast }}</p>

    <div v-if="sheetOpen" class="mh5-app-lock-mask" @click="sheetOpen = false">
      <div class="mh5-app-lock-sheet" role="menu" @click.stop>
        <button type="button" role="menuitem" @click="choose('pin')">{{ $t('密码') }}</button>
        <button type="button" role="menuitem" @click="choose('gesture')">{{ $t('手势') }}</button>
        <button type="button" role="menuitem" @click="choose('none')">{{ $t('无') }}</button>
      </div>
    </div>
  </div>
</template>
