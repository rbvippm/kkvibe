/** 运营管理 · 邀请好友充值返利 · 邀请人/被邀请人/统计/明细 Mock */

export type InviteRebateCurrency = 'KKC' | 'KKV' | 'USDT'

export type InviteRebateIdentity = 'member' | 'agent'

export type InviteRebateEligibleStatus = 'eligible' | 'ineligible' | 'cancelled'

/** 领取状态：待解锁 / 可领取 / 已领取 / 已过期 / 已取消（代理） */
export type InviteRebateSettleStatus =
  | 'locked'
  | 'claimable'
  | 'claimed'
  | 'expired'
  | 'cancelled'

/**
 * 汇总类「返利金额 / 累计返利 / 返利总额」计入的领取状态。
 * 与邀请列表注2一致：可领取 + 已领取 + 已过期 + 已取消；不含待解锁。
 * 单行「预估返利」仍可为当日公式计算结果（待解锁行也可展示预估值）。
 */
export const INVITE_REBATE_AMOUNT_STATUSES = [
  'claimable',
  'claimed',
  'expired',
  'cancelled',
] as const satisfies readonly InviteRebateSettleStatus[]

export type InviteRebateAmountStatus = (typeof INVITE_REBATE_AMOUNT_STATUSES)[number]

export function isInviteRebateAmountStatus(
  status: InviteRebateSettleStatus,
): status is InviteRebateAmountStatus {
  return (INVITE_REBATE_AMOUNT_STATUSES as readonly InviteRebateSettleStatus[]).includes(status)
}

/** 汇总返利时：非计入状态按 0 处理 */
export function inviteRebateAmountForAggregate(
  amount: number,
  status: InviteRebateSettleStatus,
): number {
  return isInviteRebateAmountStatus(status) ? amount : 0
}

/**
 * 邀请列表行：维度为人（用户ID），币种下沉到被邀请人每日明细。
 * 计入规则：至少成功邀请 1 名用户注册（inviteeCount > 0），无下级不入列表。
 */
export type InviteRebateInviterRow = {
  id: string
  /** 用户ID */
  account: string
  /** 金刚号 */
  kingkongId: string
  nickname: string
  identity: InviteRebateIdentity
  phoneBound: boolean
  phonePrefixes: string[]
  /** 下级人数：成功邀请并注册的用户数，列表侧必 > 0 */
  inviteeCount: number
  /**
   * 累计返利：按币种分列，不做跨币种折算。
   * 口径：状态 ∈ {可领取, 已领取, 已过期, 已取消} 的返利金额合计。
   */
  rebateKKC: number
  rebateKKV: number
  rebateUSDT: number
  joinedAt: string
}

/**
 * 被邀请人行：维度为人（被邀请人用户ID），挂在邀请人名下。
 * 列表结构对齐邀请列表（无「下级人数」）；币种门槛下沉到每日明细。
 */
export type InviteRebateInviteeRow = {
  id: string
  inviterId: string
  inviterAccount: string
  inviterNickname: string
  account: string
  /** 金刚号 */
  kingkongId: string
  nickname: string
  vipLevel: number
  identity: InviteRebateIdentity
  /**
   * 累计返利：按币种分列；该被邀请人对邀请人贡献的已计返利。
   * 口径同邀请列表：可领取 + 已领取 + 已过期 + 已取消。
   */
  rebateKKC: number
  rebateKKV: number
  rebateUSDT: number
  registeredAt: string
}

/** 日返利统计：邀请人维度，一行一个业务日；金额字段均按三币种分列 */
export type InviteRebateDailyStatsRow = {
  id: string
  /** 邀请人 id（与邀请列表行一致） */
  inviterId: string
  /** 返利计算日（业务日） */
  bizDate: string
  /**
   * 当日返利金额（按币种）。
   * 口径：可领取 + 已领取 + 已过期 + 已取消；不含待解锁。
   */
  rebateKkc: number
  rebateKkv: number
  rebateUsdt: number
  /** 当日已领取金额（按币种，状态=claimed） */
  claimKkc: number
  claimKkv: number
  claimUsdt: number
  /** 当日已过期金额（按币种，状态=expired） */
  expiredKkc: number
  expiredKkv: number
  expiredUsdt: number
  /** 当日待领取金额（按币种，状态=claimable） */
  pendingKkc: number
  pendingKkv: number
  pendingUsdt: number
  /** 当日已取消金额（按币种，状态=cancelled） */
  cancelledKkc: number
  cancelledKkv: number
  cancelledUsdt: number
}

/** @deprecated 旧「业务日×币种」行结构，请用 InviteRebateDailyStatsRow */
export type InviteRebateStatsRow = InviteRebateDailyStatsRow

export type InviteRebateRecordRow = {
  id: string
  flowNo: string
  bizDate: string
  claimOpenAt: string
  expireAt: string
  inviterId: string
  inviterAccount: string
  inviterNickname: string
  inviteeId: string
  inviteeAccount: string
  inviteeNickname: string
  currency: InviteRebateCurrency
  /** VIP 快照（配置口径不变） */
  vipSnapshot: number
  dailyCap: number
  /**
   * 当日预估返利（公式结果，可含待解锁行）。
   * 汇总「返利金额」时仅状态 ∈ INVITE_REBATE_AMOUNT_STATUSES 计入。
   */
  rebateAmount: number
  /** 实际领取金额（封顶后；未领取为 0） */
  claimedAmount: number
  status: InviteRebateSettleStatus
  remark: string
}

export const INVITE_REBATE_CURRENCY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'KKC', label: 'KKC' },
  { value: 'KKV', label: 'KKV' },
  { value: 'USDT', label: 'USDT' },
] as const

export const INVITE_REBATE_IDENTITY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'member', label: '普通会员' },
  { value: 'agent', label: '代理' },
] as const

/** VIP 等级枚举：全部 / VIP0～VIP10 */
export const INVITE_REBATE_VIP_OPTIONS: { value: '' | number; label: string }[] = [
  { value: '', label: '全部' },
  ...Array.from({ length: 11 }, (_, i) => ({ value: i as number, label: `VIP${i}` })),
]

export const INVITE_REBATE_ELIGIBLE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'eligible', label: '可计奖' },
  { value: 'ineligible', label: '未达标' },
  { value: 'cancelled', label: '已取消' },
] as const

export const INVITE_REBATE_SETTLE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'locked', label: '待解锁' },
  { value: 'claimable', label: '可领取' },
  { value: 'claimed', label: '已领取' },
  { value: 'expired', label: '已过期' },
  { value: 'cancelled', label: '已取消' },
] as const

/** Mock 默认领取有效期（天） */
export const INVITE_REBATE_MOCK_CLAIM_VALIDITY_DAYS = 1

export function inviteRebateIdentityLabel(v: InviteRebateIdentity) {
  return v === 'agent' ? '代理' : '普通会员'
}

export function inviteRebateEligibleLabel(v: InviteRebateEligibleStatus) {
  if (v === 'eligible') return '可计奖'
  if (v === 'cancelled') return '已取消'
  return '未达标'
}

export function inviteRebateSettleStatusLabel(v: InviteRebateSettleStatus) {
  return (
    INVITE_REBATE_SETTLE_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v
  )
}

export function formatInviteRebateAmount(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function ymdFromParts(y: number, m: number, day: number) {
  const d = new Date(y, m - 1, day)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 领取开放时间 = 业务日 T+1 的 GMT+7 12:00。
 * 入参/出参均为业务日日历日期字符串，不按时区换算偏移。
 */
export function inviteRebateClaimOpenAt(bizDate: string) {
  const [y, m, day] = bizDate.split('-').map(Number)
  return `${ymdFromParts(y, m, day + 1)} 12:00:00`
}

/**
 * 过期时刻 = startOfDay(T+1) + (X===0 ? 1 : X) × 1day（GMT+7 00:00）。
 * X=0 与 X=1 均在 T+2 00:00 作废。
 */
export function inviteRebateExpireAt(
  bizDate: string,
  claimValidityDays = INVITE_REBATE_MOCK_CLAIM_VALIDITY_DAYS,
) {
  const [y, m, day] = bizDate.split('-').map(Number)
  const x = claimValidityDays === 0 ? 1 : claimValidityDays
  return `${ymdFromParts(y, m, day + 1 + x)} 00:00:00`
}

/** @deprecated 使用 inviteRebateClaimOpenAt */
export function inviteRebatePlanSettleAt(bizDate: string) {
  return inviteRebateClaimOpenAt(bizDate)
}

export const MOCK_INVITE_REBATE_INVITERS: InviteRebateInviterRow[] = [
  {
    id: 'inv-1',
    account: '88001001',
    kingkongId: '11223344',
    nickname: '阿凯',
    identity: 'member',
    phoneBound: true,
    phonePrefixes: ['84'],
    inviteeCount: 4,
    rebateKKC: 2800,
    rebateKKV: 134800,
    rebateUSDT: 0,
    joinedAt: '2026-06-01 12:00:00',
  },
  {
    id: 'inv-2',
    account: '88001088',
    kingkongId: '66880031',
    nickname: '小幸运',
    identity: 'member',
    phoneBound: true,
    phonePrefixes: ['86', '852'],
    inviteeCount: 1,
    rebateKKC: 8600,
    rebateKKV: 0,
    rebateUSDT: 0,
    joinedAt: '2026-06-12 09:20:00',
  },
  {
    id: 'inv-3',
    account: '88001999',
    kingkongId: '88888888',
    nickname: '棋王阿杰',
    identity: 'agent',
    phoneBound: true,
    phonePrefixes: ['84'],
    inviteeCount: 1,
    rebateKKC: 0,
    rebateKKV: 0,
    rebateUSDT: 0,
    joinedAt: '2026-05-20 18:40:00',
  },
  {
    id: 'inv-4',
    account: '88002020',
    kingkongId: '88661234',
    nickname: '新手小白',
    identity: 'member',
    phoneBound: false,
    phonePrefixes: [],
    inviteeCount: 1,
    rebateKKC: 0,
    rebateKKV: 0,
    rebateUSDT: 12.5,
    joinedAt: '2026-07-10 21:00:00',
  },
]

export const MOCK_INVITE_REBATE_INVITEES: InviteRebateInviteeRow[] = [
  {
    id: 'ivt-1',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88291001',
    kingkongId: '55667788',
    nickname: '小幸运',
    vipLevel: 3,
    identity: 'member',
    rebateKKC: 0,
    rebateKKV: 8220,
    rebateUSDT: 0,
    registeredAt: '2026-07-18 10:12:00',
  },
  {
    id: 'ivt-2',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88291088',
    kingkongId: '55667701',
    nickname: '阿凯小号',
    vipLevel: 1,
    identity: 'member',
    rebateKKC: 0,
    rebateKKV: 2600,
    rebateUSDT: 0,
    registeredAt: '2026-07-17 15:40:00',
  },
  {
    id: 'ivt-3',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88291111',
    kingkongId: '55667702',
    nickname: '新手小白',
    vipLevel: 0,
    identity: 'member',
    rebateKKC: 0,
    rebateKKV: 0,
    rebateUSDT: 0,
    registeredAt: '2026-07-16 08:05:00',
  },
  {
    id: 'ivt-1-kkc',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88292001',
    kingkongId: '55667703',
    nickname: 'KKC新人',
    vipLevel: 1,
    identity: 'member',
    rebateKKC: 480,
    rebateKKV: 0,
    rebateUSDT: 0,
    registeredAt: '2026-07-14 14:08:00',
  },
  {
    id: 'ivt-4',
    inviterId: 'inv-2',
    inviterAccount: '88001088',
    inviterNickname: '小幸运',
    account: '88330001',
    kingkongId: '77889900',
    nickname: '明哥888',
    vipLevel: 2,
    identity: 'member',
    rebateKKC: 900,
    rebateKKV: 0,
    rebateUSDT: 0,
    registeredAt: '2026-07-15 19:22:00',
  },
  {
    id: 'ivt-5',
    inviterId: 'inv-3',
    inviterAccount: '88001999',
    inviterNickname: '棋王阿杰',
    account: '88440001',
    kingkongId: '99001122',
    nickname: '小林棋王',
    vipLevel: 4,
    identity: 'member',
    rebateKKC: 0,
    rebateKKV: 0,
    rebateUSDT: 0,
    registeredAt: '2026-07-12 11:00:00',
  },
]

/**
 * 日返利统计 Mock：按邀请人 × 业务日聚合。
 * 同币种近似关系：返利 ≈ 领取 + 待领取 + 已过期 + 已取消（不含待解锁）。
 */
export const MOCK_INVITE_REBATE_DAILY_STATS: InviteRebateDailyStatsRow[] = [
  {
    id: 'st-inv1-2026-07-17',
    inviterId: 'inv-1',
    bizDate: '2026-07-17',
    rebateKkc: 8600,
    rebateKkv: 986000,
    rebateUsdt: 0,
    claimKkc: 8600,
    claimKkv: 720000,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 86000,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 120000,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 60000,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv1-2026-07-16',
    inviterId: 'inv-1',
    bizDate: '2026-07-16',
    rebateKkc: 6200,
    rebateKkv: 812000,
    rebateUsdt: 0,
    claimKkc: 6200,
    claimKkv: 812000,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv1-2026-07-15',
    inviterId: 'inv-1',
    bizDate: '2026-07-15',
    rebateKkc: 4800,
    rebateKkv: 654000,
    rebateUsdt: 0,
    claimKkc: 2400,
    claimKkv: 0,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 2400,
    pendingKkv: 654000,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv1-2026-07-14',
    inviterId: 'inv-1',
    bizDate: '2026-07-14',
    rebateKkc: 3600,
    rebateKkv: 528000,
    rebateUsdt: 0,
    claimKkc: 3600,
    claimKkv: 528000,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv1-2026-07-13',
    inviterId: 'inv-1',
    bizDate: '2026-07-13',
    rebateKkc: 0,
    rebateKkv: 412000,
    rebateUsdt: 0,
    claimKkc: 0,
    claimKkv: 0,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 300000,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 112000,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv2-2026-07-17',
    inviterId: 'inv-2',
    bizDate: '2026-07-17',
    rebateKkc: 4000,
    rebateKkv: 0,
    rebateUsdt: 0,
    claimKkc: 4000,
    claimKkv: 0,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv2-2026-07-16',
    inviterId: 'inv-2',
    bizDate: '2026-07-16',
    rebateKkc: 3600,
    rebateKkv: 0,
    rebateUsdt: 0,
    claimKkc: 0,
    claimKkv: 0,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 2400,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 1200,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv2-2026-07-14',
    inviterId: 'inv-2',
    bizDate: '2026-07-14',
    rebateKkc: 1000,
    rebateKkv: 0,
    rebateUsdt: 0,
    claimKkc: 1000,
    claimKkv: 0,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv4-2026-07-17',
    inviterId: 'inv-4',
    bizDate: '2026-07-17',
    rebateKkc: 0,
    rebateKkv: 0,
    rebateUsdt: 6.36,
    claimKkc: 0,
    claimKkv: 0,
    claimUsdt: 6.36,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv4-2026-07-16',
    inviterId: 'inv-4',
    bizDate: '2026-07-16',
    rebateKkc: 0,
    rebateKkv: 0,
    rebateUsdt: 3.2,
    claimKkc: 0,
    claimKkv: 0,
    claimUsdt: 1.6,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 0,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 1.6,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
  {
    id: 'st-inv4-2026-07-13',
    inviterId: 'inv-4',
    bizDate: '2026-07-13',
    rebateKkc: 0,
    rebateKkv: 0,
    rebateUsdt: 2.94,
    claimKkc: 0,
    claimKkv: 0,
    claimUsdt: 0,
    expiredKkc: 0,
    expiredKkv: 0,
    expiredUsdt: 2.94,
    pendingKkc: 0,
    pendingKkv: 0,
    pendingUsdt: 0,
    cancelledKkc: 0,
    cancelledKkv: 0,
    cancelledUsdt: 0,
  },
]

/** @deprecated 请用 MOCK_INVITE_REBATE_DAILY_STATS */
export const MOCK_INVITE_REBATE_STATS = MOCK_INVITE_REBATE_DAILY_STATS

export const MOCK_INVITE_REBATE_RECORDS: InviteRebateRecordRow[] = [
  {
    id: 'rec-1',
    flowNo: 'IRB202607180001',
    bizDate: '2026-07-17',
    claimOpenAt: inviteRebateClaimOpenAt('2026-07-17'),
    expireAt: inviteRebateExpireAt('2026-07-17'),
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    inviteeId: 'ivt-1',
    inviteeAccount: '88291001',
    inviteeNickname: '小幸运',
    currency: 'KKV',
    vipSnapshot: 3,
    dailyCap: 6880000,
    rebateAmount: 25800,
    claimedAmount: 25800,
    status: 'claimed',
    remark: '',
  },
  {
    id: 'rec-2',
    flowNo: 'IRB202607180002',
    bizDate: '2026-07-17',
    claimOpenAt: inviteRebateClaimOpenAt('2026-07-17'),
    expireAt: inviteRebateExpireAt('2026-07-17'),
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    inviteeId: 'ivt-2',
    inviteeAccount: '88291088',
    inviteeNickname: '阿凯小号',
    currency: 'KKV',
    vipSnapshot: 1,
    dailyCap: 6880000,
    rebateAmount: 9800,
    claimedAmount: 9800,
    status: 'claimed',
    remark: '',
  },
  {
    id: 'rec-3',
    flowNo: '',
    bizDate: '2026-07-17',
    claimOpenAt: inviteRebateClaimOpenAt('2026-07-17'),
    expireAt: inviteRebateExpireAt('2026-07-17'),
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    inviteeId: 'ivt-3',
    inviteeAccount: '88291111',
    inviteeNickname: '新手小白',
    currency: 'KKV',
    vipSnapshot: 0,
    dailyCap: 6880000,
    rebateAmount: 800,
    claimedAmount: 0,
    status: 'locked',
    remark: '被邀请人次日存款未达解锁门槛，暂不可领取',
  },
  {
    id: 'rec-4',
    flowNo: 'IRB202607170010',
    bizDate: '2026-07-16',
    claimOpenAt: inviteRebateClaimOpenAt('2026-07-16'),
    expireAt: inviteRebateExpireAt('2026-07-16'),
    inviterId: 'inv-2',
    inviterAccount: '88001088',
    inviterNickname: '小幸运',
    inviteeId: 'ivt-4',
    inviteeAccount: '88330001',
    inviteeNickname: '明哥888',
    currency: 'KKC',
    vipSnapshot: 2,
    dailyCap: 900,
    rebateAmount: 12000,
    claimedAmount: 900,
    status: 'claimed',
    remark: '',
  },
  {
    id: 'rec-5',
    flowNo: '',
    bizDate: '2026-07-17',
    claimOpenAt: inviteRebateClaimOpenAt('2026-07-17'),
    expireAt: inviteRebateExpireAt('2026-07-17'),
    inviterId: 'inv-3',
    inviterAccount: '88001999',
    inviterNickname: '棋王阿杰',
    inviteeId: 'ivt-5',
    inviteeAccount: '88440001',
    inviteeNickname: '小林棋王',
    currency: 'KKV',
    vipSnapshot: 4,
    dailyCap: 6880000,
    rebateAmount: 36000,
    claimedAmount: 0,
    status: 'cancelled',
    remark: '邀请人已成为代理，返利资格已取消',
  },
]

/** 默认 Mock 返利比例（%），与活动中心邀请人条件一致 */
export const INVITE_REBATE_MOCK_RATE = 1

/** 预估奖金 = 被邀请人 T 日充值 × 业务日返利比例（再由调用方按 VIP 上限封顶） */
export function calcInviteRebateAmount(bizDayInviteeDeposit: number, rebateRatePercent: number) {
  return Math.round(bizDayInviteeDeposit * rebateRatePercent * 100) / 10000
}

/** 被邀请人每日条件与返利明细（人 + 币种 + 业务日） */
export type InviteRebateInviteeDailyRow = {
  id: string
  inviteeId: string
  bizDate: string
  /** 币种维度落在每日明细 */
  currency: InviteRebateCurrency
  vipSnapshot: number
  /** 返利比例（%） */
  rebateRate: number
  /** 被邀请人 T 日充值 */
  inviteeBizDayDeposit: number
  /** 被邀请人 T+1 日充值（次日解锁） */
  inviteeRechargeDayDeposit: number
  /** 邀请人 T 日充值（展示用） */
  inviterBizDayDeposit: number
  /** 邀请人 T+1 日充值（次日解锁） */
  inviterRechargeDayDeposit: number
  /** 邀请人解锁侧资格（可计奖 / 未达标 / 已取消） */
  inviterEligibleStatus: InviteRebateEligibleStatus
  /** 被邀请人解锁侧资格（可计奖 / 未达标 / 已取消） */
  inviteeEligibleStatus: InviteRebateEligibleStatus
  /** 预估奖金（封顶前或已封顶展示值） */
  rebateAmount: number
  /** 已领取金额；未领取为 0 */
  claimedAmount: number
  status: InviteRebateSettleStatus
  claimOpenAt: string
  expireAt: string
  /** 流水号：仅已领取有值 */
  flowNo: string
  /** 备注：待解锁缺条件 / 已取消 / 已过期等原因 */
  remark: string
}

function buildInviteeDailyMocks(): InviteRebateInviteeDailyRow[] {
  type DaySeed = {
    bizDate: string
    vip: number
    invHist: number
    invDaily: number
    ieHist: number
    ieDaily: number
    inviterEligible: InviteRebateEligibleStatus
    inviteeEligible: InviteRebateEligibleStatus
    status: InviteRebateSettleStatus
    /** 仅已取消 / 未达标填写 */
    remark?: string
    /** 封顶后的预估/已领金额（小于按比例算出的原始值） */
    settledCap?: number
    rebateRate?: number
    flowNo?: string
  }

  const seed: Array<{
    inviteeId: string
    currency: InviteRebateCurrency
    days: DaySeed[]
  }> = [
    {
      inviteeId: 'ivt-1',
      currency: 'KKV',
      days: [
        {
          bizDate: '2026-07-17',
          vip: 3,
          invHist: 2580000,
          invDaily: 180000,
          ieHist: 2580000,
          ieDaily: 220000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          flowNo: 'IRB202607180001',
        },
        {
          bizDate: '2026-07-16',
          vip: 3,
          invHist: 2400000,
          invDaily: 160000,
          ieHist: 2360000,
          ieDaily: 180000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          flowNo: 'IRB202607170001',
        },
        {
          bizDate: '2026-07-15',
          vip: 2,
          invHist: 2240000,
          invDaily: 90000,
          ieHist: 2180000,
          ieDaily: 45000,
          inviterEligible: 'eligible',
          inviteeEligible: 'ineligible',
          status: 'locked',
          remark: '被邀请人当日存款未达触发门槛，暂不可领取',
        },
        {
          bizDate: '2026-07-14',
          vip: 2,
          invHist: 2150000,
          invDaily: 150000,
          ieHist: 2135000,
          ieDaily: 160000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          flowNo: 'IRB202607150001',
        },
        {
          bizDate: '2026-07-13',
          vip: 2,
          invHist: 2000000,
          invDaily: 140000,
          ieHist: 1975000,
          ieDaily: 155000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          settledCap: 1200,
          flowNo: 'IRB202607140001',
        },
        {
          bizDate: '2026-07-12',
          vip: 2,
          invHist: 1860000,
          invDaily: 130000,
          ieHist: 1820000,
          ieDaily: 142000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          flowNo: 'IRB202607130001',
        },
        {
          bizDate: '2026-07-11',
          vip: 1,
          invHist: 1730000,
          invDaily: 80000,
          ieHist: 1678000,
          ieDaily: 150000,
          inviterEligible: 'ineligible',
          inviteeEligible: 'eligible',
          status: 'locked',
          remark: '邀请人次日存款未达解锁门槛，暂不可领取',
        },
      ],
    },
    {
      inviteeId: 'ivt-2',
      currency: 'KKV',
      days: [
        {
          bizDate: '2026-07-17',
          vip: 1,
          invHist: 2580000,
          invDaily: 180000,
          ieHist: 980000,
          ieDaily: 150000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          flowNo: 'IRB202607180002',
        },
        {
          bizDate: '2026-07-16',
          vip: 1,
          invHist: 2400000,
          invDaily: 160000,
          ieHist: 830000,
          ieDaily: 110000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimable',
        },
      ],
    },
    {
      inviteeId: 'ivt-3',
      currency: 'KKV',
      days: [
        {
          bizDate: '2026-07-17',
          vip: 0,
          invHist: 2580000,
          invDaily: 180000,
          ieHist: 80000,
          ieDaily: 20000,
          inviterEligible: 'eligible',
          inviteeEligible: 'ineligible',
          status: 'locked',
          remark: '被邀请人次日存款未达解锁门槛，暂不可领取',
        },
      ],
    },
    {
      inviteeId: 'ivt-1-kkc',
      currency: 'KKC',
      days: [
        {
          bizDate: '2026-07-16',
          vip: 1,
          invHist: 420000,
          invDaily: 36000,
          ieHist: 360000,
          ieDaily: 48000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          flowNo: 'IRB202607170011',
        },
        {
          bizDate: '2026-07-15',
          vip: 1,
          invHist: 384000,
          invDaily: 48000,
          ieHist: 312000,
          ieDaily: 12000,
          inviterEligible: 'eligible',
          inviteeEligible: 'ineligible',
          status: 'locked',
          remark: '被邀请人当日存款未达触发门槛，暂不可领取',
        },
        {
          bizDate: '2026-07-14',
          vip: 1,
          invHist: 280000,
          invDaily: 20000,
          ieHist: 300000,
          ieDaily: 50000,
          inviterEligible: 'ineligible',
          inviteeEligible: 'eligible',
          status: 'locked',
          remark: '邀请人次日存款未达解锁门槛，暂不可领取',
        },
      ],
    },
    {
      inviteeId: 'ivt-4',
      currency: 'KKC',
      days: [
        {
          bizDate: '2026-07-16',
          vip: 2,
          invHist: 980000,
          invDaily: 120000,
          ieHist: 1200000,
          ieDaily: 110000,
          inviterEligible: 'eligible',
          inviteeEligible: 'eligible',
          status: 'claimed',
          settledCap: 900,
          flowNo: 'IRB202607170012',
        },
      ],
    },
    {
      inviteeId: 'ivt-5',
      currency: 'KKV',
      days: [
        {
          bizDate: '2026-07-17',
          vip: 4,
          invHist: 5200000,
          invDaily: 300000,
          ieHist: 3600000,
          ieDaily: 260000,
          inviterEligible: 'cancelled',
          inviteeEligible: 'eligible',
          status: 'cancelled',
          remark: '邀请人已成为代理，返利资格已取消',
        },
        {
          bizDate: '2026-07-16',
          vip: 4,
          invHist: 5000000,
          invDaily: 280000,
          ieHist: 3400000,
          ieDaily: 240000,
          inviterEligible: 'eligible',
          inviteeEligible: 'cancelled',
          status: 'cancelled',
          remark: '被邀请人已成为代理，返利资格已取消',
        },
      ],
    },
  ]

  let flowSeq = 0
  return seed.flatMap((group) =>
    group.days.map((d) => {
      const claimOpenAt = inviteRebateClaimOpenAt(d.bizDate)
      const expireAt = inviteRebateExpireAt(d.bizDate)
      const rebateRate = d.rebateRate ?? INVITE_REBATE_MOCK_RATE
      /** T 日有充值即生成预估；未达蓄力门槛也计算金额 */
      const raw = d.ieHist > 0 ? calcInviteRebateAmount(d.ieHist, rebateRate) : 0
      const rebateAmount = d.settledCap != null ? Math.min(raw, d.settledCap) : raw
      const claimedAmount = d.status === 'claimed' ? rebateAmount : 0
      const hasBill = d.status === 'claimed'
      if (hasBill && !d.flowNo) flowSeq += 1
      const flowNo = hasBill
        ? d.flowNo ??
          `IRB${claimOpenAt.slice(0, 10).replace(/-/g, '')}${String(flowSeq).padStart(4, '0')}`
        : ''
      const remark =
        d.status === 'cancelled' || d.status === 'locked' || d.status === 'expired'
          ? (d.remark ?? '')
          : ''
      return {
        id: `${group.inviteeId}-${group.currency}-${d.bizDate}`,
        inviteeId: group.inviteeId,
        bizDate: d.bizDate,
        currency: group.currency,
        vipSnapshot: d.vip,
        rebateRate,
        inviteeBizDayDeposit: d.ieHist,
        inviteeRechargeDayDeposit: d.ieDaily,
        inviterBizDayDeposit: d.invHist,
        inviterRechargeDayDeposit: d.invDaily,
        inviterEligibleStatus: d.inviterEligible,
        inviteeEligibleStatus: d.inviteeEligible,
        rebateAmount,
        claimedAmount,
        status: d.status,
        claimOpenAt,
        expireAt,
        flowNo,
        remark,
      }
    }),
  )
}

export const MOCK_INVITE_REBATE_INVITEE_DAILY: InviteRebateInviteeDailyRow[] =
  buildInviteeDailyMocks()

/** 邀请列表数据源：仅含成功邀请过注册用户的邀请人（下级人数 > 0） */
export function listInviteRebateInviters() {
  return MOCK_INVITE_REBATE_INVITERS.filter((r) => r.inviteeCount > 0)
}

export function findInviteRebateInviter(id: string) {
  return listInviteRebateInviters().find((r) => r.id === id)
}

export function findInviteRebateInvitee(id: string) {
  return MOCK_INVITE_REBATE_INVITEES.find((r) => r.id === id)
}

export function inviteesByInviter(inviterId: string) {
  return MOCK_INVITE_REBATE_INVITEES.filter((r) => r.inviterId === inviterId)
}

export function inviteeDailyByInvitee(inviteeId: string) {
  return MOCK_INVITE_REBATE_INVITEE_DAILY.filter((r) => r.inviteeId === inviteeId).sort((a, b) => {
    const byDate = b.bizDate.localeCompare(a.bizDate)
    if (byDate !== 0) return byDate
    return a.currency.localeCompare(b.currency)
  })
}

/** 某邀请人的日返利统计（业务日倒序） */
export function dailyStatsByInviter(inviterId: string) {
  return MOCK_INVITE_REBATE_DAILY_STATS.filter((r) => r.inviterId === inviterId).sort((a, b) =>
    b.bizDate.localeCompare(a.bizDate),
  )
}
