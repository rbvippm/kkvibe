import { computed, ref } from 'vue'

const STORAGE_KEY = 'kkvibe-pc-anchor-session'

export type AnchorSession = {
  account: string
  nickname: string
  loginAt: string
}

const DEMO_ACCOUNT = 'anchoruat01'
const DEMO_PASSWORD = '1234qwer'
const DEMO_PHONE = '13800138001'
const DEMO_SMS_CODE = '123456'

const session = ref<AnchorSession | null>(readSession())

function readSession(): AnchorSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AnchorSession
  } catch {
    return null
  }
}

function persist(next: AnchorSession | null) {
  session.value = next
  if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  else sessionStorage.removeItem(STORAGE_KEY)
}

export function useAnchorSession() {
  const isLoggedIn = computed(() => Boolean(session.value))

  function loginByAccount(account: string, password: string): string | null {
    const name = account.trim()
    if (!name) return '请输入账号/邮箱'
    if (password.length < 6 || password.length > 20) return '密码需为 6~20 位英文字符或数字'
    if (name !== DEMO_ACCOUNT || password !== DEMO_PASSWORD) return '账号或密码错误'
    persist({
      account: DEMO_ACCOUNT,
      nickname: 'Lkpkupq',
      loginAt: new Date().toISOString(),
    })
    return null
  }

  function loginByPhone(phone: string, code: string): string | null {
    const mobile = phone.trim()
    if (!/^\d{6,15}$/.test(mobile)) return '请输入正确的手机号'
    if (!code.trim()) return '请输入验证码'
    if (mobile !== DEMO_PHONE || code.trim() !== DEMO_SMS_CODE) return '手机号或验证码错误'
    persist({
      account: DEMO_ACCOUNT,
      nickname: 'Lkpkupq',
      loginAt: new Date().toISOString(),
    })
    return null
  }

  function loginByQr(): void {
    persist({
      account: DEMO_ACCOUNT,
      nickname: 'Lkpkupq',
      loginAt: new Date().toISOString(),
    })
  }

  function logout() {
    persist(null)
  }

  return {
    session,
    isLoggedIn,
    loginByAccount,
    loginByPhone,
    loginByQr,
    logout,
    DEMO_ACCOUNT,
    DEMO_PASSWORD,
    DEMO_PHONE,
    DEMO_SMS_CODE,
  }
}
