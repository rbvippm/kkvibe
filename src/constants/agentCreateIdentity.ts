/** 创建代理 / 会员 · 登录账号方式 */

export const AGENT_CREATE_IDENTITY_METHODS = [
  { key: 'account', label: '账号' },
  { key: 'phone', label: '手机号' },
  { key: 'email', label: '邮箱' },
] as const

export type AgentCreateIdentityMethod = (typeof AGENT_CREATE_IDENTITY_METHODS)[number]['key']

export const AGENT_CREATE_IDENTITY_DIAL_CODES = ['+65', '+86', '+852', '+853'] as const

/** 金刚号输入框下方的固定说明 */
export const AGENT_CREATE_KINGKONG_HINT = '6-20位，需包含字母和数字且以字母开头'

/** 设置密码输入框下方的固定说明 */
export const AGENT_CREATE_PASSWORD_HINT = '6-20位，须含大小写字母和数字'

export function validateCreatePassword(password: string) {
  if (!password) return '请填写设置密码'
  const valid =
    password.length >= 6 &&
    password.length <= 20 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  if (!valid) return `密码须为${AGENT_CREATE_PASSWORD_HINT}`
  return ''
}

export function formatCreateIdentityAccount(input: {
  method: AgentCreateIdentityMethod
  account: string
  phone: string
  email: string
  dialCode: string
}) {
  if (input.method === 'phone') {
    const phone = input.phone.trim()
    return phone ? `${input.dialCode} ${phone}` : ''
  }
  if (input.method === 'email') return input.email.trim()
  return input.account.trim()
}

export function validateCreateIdentity(input: {
  method: AgentCreateIdentityMethod
  account: string
  phone: string
  email: string
}) {
  if (input.method === 'phone') {
    const phone = input.phone.trim()
    if (!phone) return '请填写手机号'
    if (!/^\d{6,15}$/.test(phone)) return '请输入正确的手机号'
    return ''
  }
  if (input.method === 'email') {
    const email = input.email.trim()
    if (!email) return '请填写邮箱'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入正确的邮箱'
    return ''
  }
  const account = input.account.trim()
  if (!account) return '请填写金刚号'
  const valid =
    /^[A-Za-z][A-Za-z0-9]{5,19}$/.test(account) && /[A-Za-z]/.test(account) && /\d/.test(account)
  if (!valid) return `金刚号须为${AGENT_CREATE_KINGKONG_HINT}`
  return ''
}
