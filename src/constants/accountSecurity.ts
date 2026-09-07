/** 账号与安全 · 原型 Mock（对齐 Figma 1227:21546） */

export type AccountBindStatus = 'bound' | 'unbound'
export type SecurityPasswordStatus = 'set' | 'unset'

export type AccountSecurityProfile = {
  kingkongId: string
  /** 与「我的」页同一金刚号 */
  phoneStatus: AccountBindStatus
  emailStatus: AccountBindStatus
  securityPasswordStatus: SecurityPasswordStatus
}

export const ACCOUNT_SECURITY_PROFILE: AccountSecurityProfile = {
  kingkongId: 'EZ888888',
  phoneStatus: 'unbound',
  emailStatus: 'unbound',
  securityPasswordStatus: 'unset',
}

export const ACCOUNT_SECURITY_COPY_ICON = '/images/settings/icon-copy.svg'
