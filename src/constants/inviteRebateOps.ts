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

/** 邀请活动行：维度为用户ID（account）+ 币种，同一用户多币种各占一行 */
export type InviteRebateInviterRow = {
  id: string
  /** 用户ID */
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
    id: 'inv-1-kkc',
    account: '88001001',
    nickname: '阿凯',
    currency: 'KKC',
    identity: 'member',
    phoneBound: true,
    phonePrefixes: ['84'],
    historyDeposit: 420000,
    yesterdayDailyDeposit: 36000,
    inviteeCount: 2,
    qualifiedInviteeCount: 1,
    totalRebate: 2800,
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
    rebateTotal: 8220,
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
    rebateTotal: 2600,
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
    id: 'ivt-1-kkc',
    inviterId: 'inv-1-kkc',
    inviterAccount: '88001001',
    inviterNickname: '阿凯',
    account: '88292001',
    nickname: 'KKC新人',
    vipLevel: 1,
    currency: 'KKC',
    identity: 'member',
    historyDeposit: 360000,
    yesterdayDailyDeposit: 48000,
    depositTotal: 360000,
    rebateTotal: 480,
    meetsCondition: true,
    eligibleStatus: 'eligible',
    registeredAt: '2026-07-14 14:08:00',
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
    rebateTotal: 900,
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
    rebateAmount: 2200,
    settledAmount: 2200,
    status: 'settled',
    remark: '应发 = 当天存款 × 1%；隔日派发成功',
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
    rebateAmount: 1500,
    settledAmount: 1500,
    status: 'settled',
    remark: '应发 = 当天存款 × 1%；隔日派发成功',
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
    rebateAmount: 1100,
    settledAmount: 900,
    status: 'capped',
    remark: '应发 = 当天存款 × 1%；当日应发超过各被邀请人上限之和，已扣减超出',
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

/** 默认 Mock 返利比例（%），与活动中心 VIP 阶梯一致 */
export const INVITE_REBATE_MOCK_RATE = 1

/** 应发返利 = 当天存款金额 × 返利比例 */
export function calcInviteRebateAmount(dailyDeposit: number, rebateRatePercent: number) {
  return Math.round(dailyDeposit * rebateRatePercent * 100) / 10000
}

/** 被邀请人每日条件与返利明细（业务日维度） */
export type InviteRebateInviteeDailyRow = {
  id: string
  inviteeId: string
  bizDate: string
  currency: InviteRebateCurrency
  vipSnapshot: number
  /** 返利比例（%） */
  rebateRate: number
  inviteeHistoryDeposit: number
  inviteeDailyDeposit: number
  inviterHistoryDeposit: number
  inviterDailyDeposit: number
  meetsThreshold: boolean
  eligibleStatus: InviteRebateEligibleStatus
  /** 应发 = 被邀请人当天存款 × 返利比例 */
  rebateAmount: number
  settledAmount: number
  status: InviteRebateSettleStatus
  settleAt: string
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
    meets: boolean
    eligible: InviteRebateEligibleStatus
    status: InviteRebateSettleStatus
    remark: string
    /** 触达上限时的实发（小于应发） */
    settledCap?: number
    rebateRate?: number
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
          meets: true,
          eligible: 'eligible',
          status: 'settled',
          remark: '应发 = 当天存款 × 1%；双方日存与历史累计均达标',
        },
        {
          bizDate: '2026-07-16',
          vip: 3,
          invHist: 2400000,
          invDaily: 160000,
          ieHist: 2360000,
          ieDaily: 180000,
          meets: true,
          eligible: 'eligible',
          status: 'settled',
          remark: '应发 = 当天存款 × 1%；双方日存与历史累计均达标',
        },
        {
          bizDate: '2026-07-15',
          vip: 2,
          invHist: 2240000,
          invDaily: 90000,
          ieHist: 2180000,
          ieDaily: 45000,
          meets: false,
          eligible: 'ineligible',
          status: 'not_qualified',
          remark: '被邀请人当日日存未达每日最低存款',
        },
        {
          bizDate: '2026-07-14',
          vip: 2,
          invHist: 2150000,
          invDaily: 150000,
          ieHist: 2135000,
          ieDaily: 160000,
          meets: true,
          eligible: 'eligible',
          status: 'settled',
          remark: '应发 = 当天存款 × 1%；双方日存与历史累计均达标',
        },
        {
          bizDate: '2026-07-13',
          vip: 2,
          invHist: 2000000,
          invDaily: 140000,
          ieHist: 1975000,
          ieDaily: 155000,
          meets: true,
          eligible: 'eligible',
          status: 'capped',
          settledCap: 1200,
          remark: '应发 = 当天存款 × 1%；触达 VIP 日返利上限，已截断',
        },
        {
          bizDate: '2026-07-12',
          vip: 2,
          invHist: 1860000,
          invDaily: 130000,
          ieHist: 1820000,
          ieDaily: 142000,
          meets: true,
          eligible: 'eligible',
          status: 'settled',
          remark: '应发 = 当天存款 × 1%；双方日存与历史累计均达标',
        },
        {
          bizDate: '2026-07-11',
          vip: 1,
          invHist: 1730000,
          invDaily: 80000,
          ieHist: 1678000,
          ieDaily: 20000,
          meets: false,
          eligible: 'ineligible',
          status: 'not_qualified',
          remark: '邀请人当日日存未达每日最低存款',
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
          meets: true,
          eligible: 'eligible',
          status: 'settled',
          remark: '应发 = 当天存款 × 1%；双方日存与历史累计均达标',
        },
        {
          bizDate: '2026-07-16',
          vip: 1,
          invHist: 2400000,
          invDaily: 160000,
          ieHist: 830000,
          ieDaily: 110000,
          meets: true,
          eligible: 'eligible',
          status: 'pending',
          remark: '应发 = 当天存款 × 1%；待隔日 GMT+8 12:00 派发',
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
          meets: false,
          eligible: 'ineligible',
          status: 'not_qualified',
          remark: '被邀请人历史累计存款未达标',
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
          meets: true,
          eligible: 'eligible',
          status: 'settled',
          remark: '应发 = 当天存款 × 1%；双方日存与历史累计均达标',
        },
        {
          bizDate: '2026-07-15',
          vip: 1,
          invHist: 384000,
          invDaily: 28000,
          ieHist: 312000,
          ieDaily: 12000,
          meets: false,
          eligible: 'ineligible',
          status: 'not_qualified',
          remark: '被邀请人当日日存未达每日最低存款',
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
          meets: true,
          eligible: 'eligible',
          status: 'capped',
          settledCap: 900,
          remark: '应发 = 当天存款 × 1%；当日应发超过上限之和，已扣减超出',
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
          meets: false,
          eligible: 'cancelled',
          status: 'cancelled',
          remark: '邀请人已成为代理，取消返利资格',
        },
      ],
    },
  ]

  return seed.flatMap((group) =>
    group.days.map((d) => {
      const [y, m, day] = d.bizDate.split('-').map(Number)
      const next = new Date(y, m - 1, day + 1)
      const settleAt = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')} 12:00:00`
      const rebateRate = d.rebateRate ?? INVITE_REBATE_MOCK_RATE
      const canAward = d.meets && d.eligible === 'eligible'
      const rebateAmount = canAward ? calcInviteRebateAmount(d.ieDaily, rebateRate) : 0
      const settledAmount =
        d.status === 'capped' && d.settledCap != null
          ? d.settledCap
          : canAward
            ? rebateAmount
            : 0
      return {
        id: `${group.inviteeId}-${d.bizDate}`,
        inviteeId: group.inviteeId,
        bizDate: d.bizDate,
        currency: group.currency,
        vipSnapshot: d.vip,
        rebateRate,
        inviteeHistoryDeposit: d.ieHist,
        inviteeDailyDeposit: d.ieDaily,
        inviterHistoryDeposit: d.invHist,
        inviterDailyDeposit: d.invDaily,
        meetsThreshold: d.meets,
        eligibleStatus: d.eligible,
        rebateAmount,
        settledAmount,
        status: d.status,
        settleAt,
        remark: d.remark,
      }
    }),
  )
}

export const MOCK_INVITE_REBATE_INVITEE_DAILY: InviteRebateInviteeDailyRow[] =
  buildInviteeDailyMocks()

export function findInviteRebateInviter(id: string) {
  return MOCK_INVITE_REBATE_INVITERS.find((r) => r.id === id)
}

export function findInviteRebateInvitee(id: string) {
  return MOCK_INVITE_REBATE_INVITEES.find((r) => r.id === id)
}

export function inviteesByInviter(inviterId: string) {
  return MOCK_INVITE_REBATE_INVITEES.filter((r) => r.inviterId === inviterId)
}

export function inviteeDailyByInvitee(inviteeId: string) {
  return MOCK_INVITE_REBATE_INVITEE_DAILY.filter((r) => r.inviteeId === inviteeId).sort((a, b) =>
    b.bizDate.localeCompare(a.bizDate),
  )
}
