/** 代理中心 · 创建会员账户（返佣两步） */

export const AGENT_CREATE_MEMBER_REBATE_STEPS = [
  { key: 'account', label: '填写账号' },
  { key: 'success', label: '完成创建' },
] as const

export const AGENT_CREATE_MEMBER_DIAL_CODES = ['+65', '+86', '+852', '+853'] as const

export const AGENT_CREATE_MEMBER_KINGKONG_URL = 'https://kingkongmsg.com/zh'

export const AGENT_CREATE_MEMBER_DEFAULTS = {
  dialCode: '+852',
  memberAccount: '',
  password: '',
  confirmPassword: '',
  remark: '',
} as const
