/** 运营管理 · 邀请好友充值返利 · 邀请人/被邀请人/统计/明细 Mock */

export type InviteRebateCurrency = 'KKC' | 'KKV' | 'USDT'

export type InviteRebateIdentity = 'member' | 'agent'

export type InviteRebateEligibleStatus = 'eligible' | 'ineligible' | 'cancelled'

export type InviteRebateSettleStatus =
  | 'pending'
  | 'settled'
  | 'capped'
  | 'cancelled'
  | 'not_qualified'

export type InviteRebateInviterRow = {
  id: string
  account: string
  nickname: string
  currency: InviteRebateCurrency
  identity: InviteRebateIdentity
  phoneBound: boolean
  phonePrefixes: string[]
  historyDeposit: number
  yesterdayDailyDeposit: number
  inviteeCount: number
  qualifiedInviteeCount: number
  totalRebate: number
  eligibleStatus: InviteRebateEligibleStatus
  joinedAt: string
}

export type InviteRebateInviteeRow = {
  id: string
  inviterId: string
  inviterAccount: string
  inviterNickname: string
  account: string
  nickname: string
  vipLevel: number
  currency: InviteRebateCurrency
  identity: InviteRebateIdentity
  historyDeposit: number
  yesterdayDailyDeposit: number
  depositTotal: number
  rebateTotal: number
  meetsCondition: boolean
  eligibleStatus: InviteRebateEligibleStatus
  registeredAt: string
}

export type InviteRebateStatsRow = {
  id: string
  /** 返利计算日（业务日） */
  bizDate: string
  currency: InviteRebateCurrency
  inviterCount: number
  inviteeCount: number
  qualifiedInviteeCount: number
  depositSum: number
  rebateSum: number
  /** 截断后实际派发 */
  settledSum: number
  /** GMT+8 12:00 计划派发时间 */
  settleAt: string
}

export type InviteRebateRecordRow = {
  id: string
  flowNo: string
  bizDate: string
  settleAt: string
  inviterId: string
  inviterAccount: string
  inviterNickname: string
  inviteeId: string
  inviteeAccount: string
  inviteeNickname: string
  currency: InviteRebateCurrency
  /** 计算日 23:59:59 VIP 快照 */
  vipSnapshot: number
  dailyCap: number
  rebateAmount: number
  /** 截断后实际派发金额 */
  settledAmount: number
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

export const INVITE_REBATE_ELIGIBLE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'eligible', label: '可计奖' },
  { value: 'ineligible', label: '未达标' },
  { value: 'cancelled', label: '已取消' },
] as const

export const INVITE_REBATE_SETTLE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待派发' },
  { value: 'settled', label: '已派发' },
  { value: 'capped', label: '触达上限' },
  { value: 'cancelled', label: '已取消' },
  { value: 'not_qualified', label: '未达标' },
] as const

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

export const MOCK_INVITE_REBATE_INVITERS: InviteRebateInviterRow[] = [
  {
    id: 'inv-1',
    account: '88001001',
    nickname: '阿凯',
    currency: 'KKV',
    identity: 'member',
    phoneBound: true,
    phonePrefixes: ['84'],
    historyDeposit: 2580000,
    yesterdayDailyDeposit: 180000,
    inviteeCount: 5,
    qualifiedInviteeCount: 4,
    totalRebate: 134800,
    eligibleStatus: 'eligible',
    joinedAt: '2026-06-01 12:00:00',
  },
  {
    id: 'inv-2',
    account: '88001088',
    nickname: '小幸运',
    currency: 'KKC',
    identity: 'member',
    phoneBound: true,
    phonePrefixes: ['86', '852'],
    historyDeposit: 980000,
    yesterdayDailyDeposit: 120000,
    inviteeCount: 3,
    qualifiedInviteeCount: 2,
    totalRebate: 8600,
    eligibleStatus: 'eligible',
    joinedAt: '2026-06-12 09:20:00',
  },
  {
    id: 'inv-3',
    account: '88001999',
    nickname: '棋王阿杰',
    currency: 'KKV',
    identity: 'agent',
    phoneBound: true,
    phonePrefixes: ['84'],
    historyDeposit: 5200000,
    yesterdayDailyDeposit: 300000,
    inviteeCount: 8,
    qualifiedInviteeCount: 0,
    totalRebate: 0,
    eligibleStatus: 'cancelled',
    joinedAt: '2026-05-20 18:40:00',
  },
  {
    id: 'inv-4',
    account: '88002020',
    nickname: '新手小白',
    currency: 'USDT',
    identity: 'member',
    phoneBound: false,
    phonePrefixes: [],
    historyDeposit: 80,
    yesterdayDailyDeposit: 5,
    inviteeCount: 1,
    qualifiedInviteeCount: 0,
    totalRebate: 0,
    eligibleStatus: 'ineligible',
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
    nickname: '小幸运',
    vipLevel: 3,
    currency: 'KKV',
    identity: 'member',
    historyDeposit: 2580000,
    yesterdayDailyDeposit: 220000,
    depositTotal: 2580000,
    rebateTotal: 21600,
    meetsCondition: true,
    eligibleStatus: 'eligible',
    registeredAt: '2026-07-18 10:12:00',
  },
  {
    id: 'ivt-2',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88291088',
    nickname: '阿凯小号',
    vipLevel: 1,
    currency: 'KKV',
    identity: 'member',
    historyDeposit: 980000,
    yesterdayDailyDeposit: 150000,
    depositTotal: 980000,
    rebateTotal: 9800,
    meetsCondition: true,
    eligibleStatus: 'eligible',
    registeredAt: '2026-07-17 15:40:00',
  },
  {
    id: 'ivt-3',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88291111',
    nickname: '新手小白',
    vipLevel: 0,
    currency: 'KKV',
    identity: 'member',
    historyDeposit: 80000,
    yesterdayDailyDeposit: 20000,
    depositTotal: 80000,
    rebateTotal: 0,
    meetsCondition: false,
    eligibleStatus: 'ineligible',
    registeredAt: '2026-07-16 08:05:00',
  },
  {
    id: 'ivt-4',
    inviterId: 'inv-2',
    inviterAccount: '88001088',
    inviterNickname: '小幸运',
    account: '88330001',
    nickname: '明哥888',
    vipLevel: 2,
    currency: 'KKC',
    identity: 'member',
    historyDeposit: 1200000,
    yesterdayDailyDeposit: 110000,
    depositTotal: 1200000,
    rebateTotal: 5200,
    meetsCondition: true,
    eligibleStatus: 'eligible',
    registeredAt: '2026-07-15 19:22:00',
  },
  {
    id: 'ivt-5',
    inviterId: 'inv-3',
    inviterAccount: '88001999',
    inviterNickname: '棋王阿杰',
    account: '88440001',
    nickname: '小林棋王',
    vipLevel: 4,
    currency: 'KKV',
    identity: 'member',
    historyDeposit: 3600000,
    yesterdayDailyDeposit: 260000,
    depositTotal: 3600000,
    rebateTotal: 0,
    meetsCondition: false,
    eligibleStatus: 'cancelled',
    registeredAt: '2026-07-12 11:00:00',
  },
]

export const MOCK_INVITE_REBATE_STATS: InviteRebateStatsRow[] = [
  {
    id: 'st-1',
    bizDate: '2026-07-17',
    currency: 'KKV',
    inviterCount: 12,
    inviteeCount: 48,
    qualifiedInviteeCount: 31,
    depositSum: 186400000,
    rebateSum: 1428000,
    settledSum: 1288000,
    settleAt: '2026-07-18 12:00:00',
  },
  {
    id: 'st-2',
    bizDate: '2026-07-17',
    currency: 'KKC',
    inviterCount: 8,
    inviteeCount: 22,
    qualifiedInviteeCount: 14,
    depositSum: 980000,
    rebateSum: 12600,
    settledSum: 12600,
    settleAt: '2026-07-18 12:00:00',
  },
  {
    id: 'st-3',
    bizDate: '2026-07-16',
    currency: 'KKV',
    inviterCount: 11,
    inviteeCount: 41,
    qualifiedInviteeCount: 27,
    depositSum: 152200000,
    rebateSum: 1186000,
    settledSum: 1102000,
    settleAt: '2026-07-17 12:00:00',
  },
  {
    id: 'st-4',
    bizDate: '2026-07-16',
    currency: 'USDT',
    inviterCount: 3,
    inviteeCount: 6,
    qualifiedInviteeCount: 2,
    depositSum: 420,
    rebateSum: 8.5,
    settledSum: 8.5,
    settleAt: '2026-07-17 12:00:00',
  },
]

export const MOCK_INVITE_REBATE_RECORDS: InviteRebateRecordRow[] = [
  {
    id: 'rec-1',
    flowNo: 'IRB202607180001',
    bizDate: '2026-07-17',
    settleAt: '2026-07-18 12:00:00',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    inviteeId: 'ivt-1',
    inviteeAccount: '88291001',
    inviteeNickname: '小幸运',
    currency: 'KKV',
    vipSnapshot: 3,
    dailyCap: 6880000,
    rebateAmount: 21600,
    settledAmount: 21600,
    status: 'settled',
    remark: '隔日派发成功',
  },
  {
    id: 'rec-2',
    flowNo: 'IRB202607180002',
    bizDate: '2026-07-17',
    settleAt: '2026-07-18 12:00:00',
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
    settledAmount: 9800,
    status: 'settled',
    remark: '隔日派发成功',
  },
  {
    id: 'rec-3',
    flowNo: 'IRB202607180003',
    bizDate: '2026-07-17',
    settleAt: '2026-07-18 12:00:00',
    inviterId: 'inv-1',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    inviteeId: 'ivt-3',
    inviteeAccount: '88291111',
    inviteeNickname: '新手小白',
    currency: 'KKV',
    vipSnapshot: 0,
    dailyCap: 6880000,
    rebateAmount: 0,
    settledAmount: 0,
    status: 'not_qualified',
    remark: '昨日每日最低存款或历史累计未达标',
  },
  {
    id: 'rec-4',
    flowNo: 'IRB202607170010',
    bizDate: '2026-07-16',
    settleAt: '2026-07-17 12:00:00',
    inviterId: 'inv-2',
    inviterAccount: '88001088',
    inviterNickname: '小幸运',
    inviteeId: 'ivt-4',
    inviteeAccount: '88330001',
    inviteeNickname: '明哥888',
    currency: 'KKC',
    vipSnapshot: 2,
    dailyCap: 6880000,
    rebateAmount: 5200,
    settledAmount: 4200,
    status: 'capped',
    remark: '当日应发超过各被邀请人上限之和，已扣减超出',
  },
  {
    id: 'rec-5',
    flowNo: 'IRB202607180099',
    bizDate: '2026-07-17',
    settleAt: '2026-07-18 12:00:00',
    inviterId: 'inv-3',
    inviterAccount: '88001999',
    inviterNickname: '棋王阿杰',
    inviteeId: 'ivt-5',
    inviteeAccount: '88440001',
    inviteeNickname: '小林棋王',
    currency: 'KKV',
    vipSnapshot: 4,
    dailyCap: 6880000,
    rebateAmount: 0,
    settledAmount: 0,
    status: 'cancelled',
    remark: '邀请人已成为代理，取消返利资格',
  },
]

export function findInviteRebateInviter(id: string) {
  return MOCK_INVITE_REBATE_INVITERS.find((r) => r.id === id)
}

export function findInviteRebateInvitee(id: string) {
  return MOCK_INVITE_REBATE_INVITEES.find((r) => r.id === id)
}

export function inviteesByInviter(inviterId: string) {
  return MOCK_INVITE_REBATE_INVITEES.filter((r) => r.inviterId === inviterId)
}
