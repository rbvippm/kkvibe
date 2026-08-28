import { computed, ref } from 'vue'

const STORAGE_KEY = 'kkvibe-pc-anchor-session'

export type AnchorSession = {
  account: string
  nickname: string
  loginAt: string
}

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
    if (!name) return '请输入金刚号/手机号/邮箱'
    if (!password) return '请输入密码'
    persist({
      account: name,
      nickname: name,
      loginAt: new Date().toISOString(),
    })
    return null
  }

  function loginByPhone(phone: string, code: string): string | null {
    const identity = phone.trim()
    if (!identity) return '请输入手机号/邮箱'
    if (!code.trim()) return '请输入验证码'
    persist({
      account: identity,
      nickname: identity,
      loginAt: new Date().toISOString(),
    })
    return null
  }

  function loginByQr(): void {
    persist({
      account: '主播',
      nickname: '主播',
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
  }
}
