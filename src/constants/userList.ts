/** 用户管理 · 用户列表 · Mock 与枚举 */

export type UserAccountStatus = 'enabled' | 'disabled'
export type UserGender = 'male' | 'female' | 'unknown'
export type UserSource = 'manual' | 'system'
export type UserChannel = 'platform' | 'agent' | 'activity'
export type UserRegisterPlatform = 'ios' | 'android' | 'h5' | 'web'

export type UserListRow = {
  id: string
  userId: string
  /** 金刚号（mid_ / link 等账号标识） */
  kingKongId: string
  /** 第三方 openid，空则列表展示「-」 */
  openId: string
  source: UserSource
  channel: UserChannel
  nickname: string
  inviteCode: string
  phone: string
  signature: string
  friendCount: number
  lastOnlineAt: string
  registeredAt: string
  status: UserAccountStatus
  gender: UserGender
  registerPlatform: UserRegisterPlatform
  realNameVerified: boolean
  locked: boolean
  deleted: boolean
  /** 三方登录 ID（列表 Mock 保留，查询弹框走独立映射） */
  thirdPartyId: string
}

/** 查询三方 ID · 查询维度（文案「现金网」统一改为「现金」） */
export type ThirdPartyQueryType =
  | 'kingkongId'
  | 'openId'
  | 'cashId'
  | 'memberId'
  | 'agentId'
  | 'paymentGatewayId'
  | 'cashAccount'

export type ThirdPartyIdMap = {
  kingkongId: string
  openId: string
  cashId: string
  memberId: string
  agentId: string
  paymentGatewayId: string
  cashAccount: string
}

export const THIRD_PARTY_QUERY_OPTIONS: { value: ThirdPartyQueryType; label: string }[] = [
  { value: 'kingkongId', label: '金刚id' },
  { value: 'openId', label: 'openid' },
  { value: 'cashId', label: '现金id' },
  { value: 'memberId', label: '会员id' },
  { value: 'agentId', label: '代理id' },
  { value: 'paymentGatewayId', label: '支付网关id' },
  { value: 'cashAccount', label: '现金系统账号' },
]

export const THIRD_PARTY_RESULT_FIELDS: { key: keyof ThirdPartyIdMap; label: string }[] = [
  { key: 'kingkongId', label: '金刚id' },
  { key: 'openId', label: 'openid' },
  { key: 'cashId', label: '现金id' },
  { key: 'memberId', label: '会员id' },
  { key: 'agentId', label: '代理id' },
  { key: 'paymentGatewayId', label: '支付网关id' },
  { key: 'cashAccount', label: '现金系统账号' },
]

export const MOCK_THIRD_PARTY_ID_MAPS: ThirdPartyIdMap[] = [
  {
    kingkongId: '7620716212081045399',
    openId: 'oXk8a2pQ1mN7sT4vB9cD',
    cashId: '148471',
    memberId: '277320',
    agentId: '0',
    paymentGatewayId: '2087767562096922624',
    cashAccount: 'openapi23y9pa',
  },
  {
    kingkongId: '7831562076704421988',
    openId: 'oLink12wx8k9p0q1r2st',
    cashId: '148472',
    memberId: '277321',
    agentId: '12008',
    paymentGatewayId: '2087767562096922625',
    cashAccount: 'openapi_kk_link12',
  },
  {
    kingkongId: 'link_vip_888',
    openId: 'oVip888wx3a4b5c6d7e8',
    cashId: '888001',
    memberId: '900128',
    agentId: '33021',
    paymentGatewayId: '2087767562096922888',
    cashAccount: 'openapi_vip888',
  },
]

export function queryThirdPartyIdMap(
  type: ThirdPartyQueryType,
  keyword: string,
): ThirdPartyIdMap | null {
  const kw = keyword.trim()
  if (!kw) return null
  return MOCK_THIRD_PARTY_ID_MAPS.find((row) => row[type] === kw) ?? null
}

export const USER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '禁用' },
] as const

export const USER_GENDER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
] as const

export const USER_SOURCE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'manual', label: '人工注册' },
  { value: 'system', label: '系统自增' },
] as const

export const USER_CHANNEL_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'platform', label: '平台自营' },
  { value: 'agent', label: '代理渠道' },
  { value: 'activity', label: '活动渠道' },
] as const

export const USER_REGISTER_PLATFORM_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'h5', label: 'H5' },
  { value: 'web', label: 'Web' },
] as const

export function sourceLabel(value: UserSource) {
  return USER_SOURCE_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function channelLabel(value: UserChannel) {
  return USER_CHANNEL_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function statusLabel(value: UserAccountStatus) {
  return value === 'enabled' ? '启用' : '禁用'
}

export function genderLabel(value: UserGender) {
  return USER_GENDER_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function registerPlatformLabel(value: UserRegisterPlatform) {
  return USER_REGISTER_PLATFORM_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone || '-'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export const MOCK_USER_LIST_ROWS: UserListRow[] = [
  {
    id: 'u1',
    userId: '7831562076704421988',
    kingKongId: 'mid_p6uw633aqcy',
    openId: 'oLink12wx8k9p0q1r2st',
    source: 'manual',
    channel: 'platform',
    nickname: 'Link12',
    inviteCode: '103855',
    phone: '9875566122',
    signature: '-',
    friendCount: 12,
    lastOnlineAt: '2026-07-15 20:10:02',
    registeredAt: '2026-07-15 20:15:24',
    status: 'enabled',
    gender: 'male',
    registerPlatform: 'ios',
    realNameVerified: false,
    locked: true,
    deleted: false,
    thirdPartyId: 'tp_apple_883120',
  },
  {
    id: 'u2',
    userId: '7831562076704421989',
    kingKongId: 'link123456',
    openId: 'oOwen666wx1a2b3c4d5e',
    source: 'manual',
    channel: 'platform',
    nickname: 'owen666',
    inviteCode: '228401',
    phone: '9123344556',
    signature: '-',
    friendCount: 3,
    lastOnlineAt: '2026-07-15 19:42:11',
    registeredAt: '2026-07-15 19:48:03',
    status: 'enabled',
    gender: 'male',
    registerPlatform: 'android',
    realNameVerified: false,
    locked: false,
    deleted: false,
    thirdPartyId: 'tp_google_552901',
  },
  {
    id: 'u3',
    userId: '7831562076704421990',
    kingKongId: 'mid_k9x2m1n0pqr',
    openId: '',
    source: 'system',
    channel: 'platform',
    nickname: '-',
    inviteCode: '551028',
    phone: '9887766554',
    signature: '-',
    friendCount: 0,
    lastOnlineAt: '-',
    registeredAt: '2026-07-15 18:22:40',
    status: 'enabled',
    gender: 'unknown',
    registerPlatform: 'h5',
    realNameVerified: false,
    locked: false,
    deleted: false,
    thirdPartyId: '',
  },
  {
    id: 'u4',
    userId: '7831562076704421991',
    kingKongId: 'mid_ab12cd34ef',
    openId: 'oFishwx9k8j7h6g5f4e3',
    source: 'manual',
    channel: 'agent',
    nickname: '小鱼干',
    inviteCode: '776012',
    phone: '9012233445',
    signature: '今天天气不错',
    friendCount: 28,
    lastOnlineAt: '2026-07-14 23:01:55',
    registeredAt: '2026-07-14 12:08:19',
    status: 'disabled',
    gender: 'female',
    registerPlatform: 'ios',
    realNameVerified: true,
    locked: false,
    deleted: false,
    thirdPartyId: 'tp_apple_120988',
  },
  {
    id: 'u5',
    userId: '7831562076704421992',
    kingKongId: 'mid_zz99yy88xx',
    openId: 'oAct01wx2s3d4f5g6h7j',
    source: 'system',
    channel: 'activity',
    nickname: '活动用户01',
    inviteCode: '334455',
    phone: '9654321987',
    signature: '-',
    friendCount: 1,
    lastOnlineAt: '2026-07-13 09:15:00',
    registeredAt: '2026-07-13 09:00:12',
    status: 'enabled',
    gender: 'male',
    registerPlatform: 'web',
    realNameVerified: false,
    locked: false,
    deleted: true,
    thirdPartyId: 'tp_web_778821',
  },
  {
    id: 'u6',
    userId: '7831562076704421993',
    kingKongId: 'mid_hello_kk',
    openId: 'oHelperwx7y8u9i0o1p2',
    source: 'manual',
    channel: 'platform',
    nickname: 'KK小助手',
    inviteCode: '102938',
    phone: '9334455667',
    signature: '欢迎来玩',
    friendCount: 56,
    lastOnlineAt: '2026-07-15 21:00:00',
    registeredAt: '2026-06-20 10:11:12',
    status: 'enabled',
    gender: 'female',
    registerPlatform: 'android',
    realNameVerified: true,
    locked: true,
    deleted: false,
    thirdPartyId: 'tp_google_991122',
  },
  {
    id: 'u7',
    userId: '7831562076704421994',
    kingKongId: 'mid_guest_001',
    openId: '',
    source: 'system',
    channel: 'platform',
    nickname: '游客001',
    inviteCode: '667788',
    phone: '',
    signature: '-',
    friendCount: 0,
    lastOnlineAt: '-',
    registeredAt: '2026-07-12 08:30:00',
    status: 'disabled',
    gender: 'unknown',
    registerPlatform: 'h5',
    realNameVerified: false,
    locked: false,
    deleted: false,
    thirdPartyId: '',
  },
  {
    id: 'u8',
    userId: '7831562076704421995',
    kingKongId: 'link_vip_888',
    openId: 'oVip888wx3a4b5c6d7e8',
    source: 'manual',
    channel: 'agent',
    nickname: 'VIP888',
    inviteCode: '888001',
    phone: '9776655443',
    signature: '-',
    friendCount: 120,
    lastOnlineAt: '2026-07-15 16:45:33',
    registeredAt: '2026-05-01 14:20:00',
    status: 'enabled',
    gender: 'male',
    registerPlatform: 'ios',
    realNameVerified: true,
    locked: false,
    deleted: false,
    thirdPartyId: 'tp_apple_888001',
  },
]
