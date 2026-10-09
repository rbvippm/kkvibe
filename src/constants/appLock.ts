/** 隐私设置 · App 锁定。真实密码或手势进应用，替身密码进计算器。 */

import { reactive, watch } from 'vue'

const STORAGE_KEY = 'kkvibe.app-lock'

export type AppLockMode = 'none' | 'pin' | 'gesture'

type SavedAppLock = {
  mode: AppLockMode
  pin: string
  gesture: string
  faceId: boolean
  decoyPin: string
  decoyGesture: string
  hidden: boolean
  hiddenCode: string
}

function readSaved(): SavedAppLock {
  const empty: SavedAppLock = {
    mode: 'none',
    pin: '',
    gesture: '',
    faceId: false,
    decoyPin: '',
    decoyGesture: '',
    hidden: false,
    hiddenCode: '',
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<SavedAppLock> & { decoy?: string }
    const mode = parsed.mode === 'pin' || parsed.mode === 'gesture' || parsed.mode === 'none' ? parsed.mode : 'none'
    const pin = typeof parsed.pin === 'string' ? parsed.pin : ''
    const gesture = typeof parsed.gesture === 'string' ? parsed.gesture : ''
    const legacy = typeof parsed.decoy === 'string' ? parsed.decoy : ''
    const decoyPin = typeof parsed.decoyPin === 'string' ? parsed.decoyPin : /^\d{6}$/.test(legacy) ? legacy : ''
    const decoyGesture = typeof parsed.decoyGesture === 'string' ? parsed.decoyGesture : legacy.includes('-') ? legacy : ''
    const resolved = mode === 'pin' && !pin ? 'none' : mode === 'gesture' && !gesture ? 'none' : mode
    const hiddenCode = typeof parsed.hiddenCode === 'string' && /^\d{4,8}$/.test(parsed.hiddenCode) ? parsed.hiddenCode : ''
    return {
      mode: resolved,
      pin,
      gesture,
      faceId: Boolean(parsed.faceId),
      decoyPin: resolved === 'none' ? '' : decoyPin,
      decoyGesture: resolved === 'none' ? '' : decoyGesture,
      hidden: Boolean(parsed.hidden) && Boolean(hiddenCode),
      hiddenCode,
    }
  } catch {
    return empty
  }
}

const saved = readSaved()

export const appLock = reactive({
  mode: saved.mode,
  pin: saved.pin,
  gesture: saved.gesture,
  faceId: saved.faceId,
  decoyPin: saved.decoyPin,
  decoyGesture: saved.decoyGesture,
  /** 隐藏模式：打开应用直接进入计算器 */
  hidden: saved.hidden,
  /** 在计算器中输入这组数字后进入真实应用 */
  hiddenCode: saved.hiddenCode,
  /** 挡住真实界面，要求重新验证 */
  locked: saved.hidden ? false : saved.mode !== 'none',
  /** 替身或隐藏模式进入的计算器 */
  calculator: saved.hidden,
})

watch(
  () => [appLock.mode, appLock.pin, appLock.gesture, appLock.faceId, appLock.decoyPin, appLock.decoyGesture, appLock.hidden, appLock.hiddenCode],
  () => {
    try {
      const payload: SavedAppLock = {
        mode: appLock.mode,
        pin: appLock.pin,
        gesture: appLock.gesture,
        faceId: appLock.faceId,
        decoyPin: appLock.decoyPin,
        decoyGesture: appLock.decoyGesture,
        hidden: appLock.hidden,
        hiddenCode: appLock.hiddenCode,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* 原型不阻断页面 */
    }
  },
)

export function lockApp() {
  if (appLock.hidden && appLock.hiddenCode) {
    appLock.locked = false
    appLock.calculator = true
    return
  }
  if (appLock.mode === 'none') return
  appLock.locked = true
  appLock.calculator = false
}

export function unlockReal() {
  appLock.locked = false
  appLock.calculator = false
}

export function submitAppPin(pin: string): 'real' | 'decoy' | 'wrong' {
  if (appLock.mode === 'pin' && pin && pin === appLock.pin) {
    unlockReal()
    return 'real'
  }
  if (appLock.mode === 'pin' && appLock.decoyPin && pin === appLock.decoyPin) {
    appLock.locked = false
    appLock.calculator = true
    return 'decoy'
  }
  return 'wrong'
}

export function submitAppGesture(pattern: string): 'real' | 'decoy' | 'wrong' {
  if (appLock.mode === 'gesture' && pattern && pattern === appLock.gesture) {
    unlockReal()
    return 'real'
  }
  if (appLock.mode === 'gesture' && appLock.decoyGesture && pattern === appLock.decoyGesture) {
    appLock.locked = false
    appLock.calculator = true
    return 'decoy'
  }
  return 'wrong'
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') lockApp()
  })
  window.addEventListener('pagehide', () => lockApp())
}
