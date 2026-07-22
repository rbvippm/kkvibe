/** 运营管理 · 活动中心 · Mock 与枚举 */

export type ActivityChannel = 'all' | 'test1' | 'channel_b' | 'platform'

export type ActivityType =
  | 'register_bonus'
  | 'invite_bonus'
  | 'recharge_bonus'
  | 'display'
  | 'invite_recharge_rebate_vip'

export type ActivityStatus = 'enabled' | 'disabled' | 'ended'

export type ActivityJumpType = 'internal' | 'external' | 'none'

export type ActivityCurrency = 'KKC' | 'KKV' | 'USDT'

/** 币种默认手机区号（不含 +，与下拉枚举 code 一致） */
export const CURRENCY_DEFAULT_PHONE_PREFIX: Record<ActivityCurrency, string> = {
  KKC: '86',
  KKV: '84',
  USDT: '1',
}

export type PhoneDialCodeOption = {
  code: string
  name: string
}

/** 区号可搜索下拉枚举（展示：code-国家） */
export const PHONE_DIAL_CODE_OPTIONS: PhoneDialCodeOption[] = [
  { code: '1', name: '加拿大' },
  { code: '1', name: '美国' },
  { code: '7', name: '俄罗斯' },
  { code: '33', name: '法国' },
  { code: '39', name: '意大利' },
  { code: '41', name: '瑞士' },
  { code: '44', name: '英国' },
  { code: '49', name: '德国' },
  { code: '52', name: '墨西哥' },
  { code: '55', name: '巴西' },
  { code: '56', name: '智利' },
  { code: '60', name: '马来西亚' },
  { code: '61', name: '澳大利亚' },
  { code: '62', name: '印度尼西亚' },
  { code: '63', name: '菲律宾' },
  { code: '65', name: '新加坡' },
  { code: '66', name: '泰国' },
  { code: '81', name: '日本' },
  { code: '82', name: '韩国' },
  { code: '84', name: '越南' },
  { code: '86', name: '中国' },
  { code: '90', name: '土耳其' },
  { code: '91', name: '印度' },
  { code: '852', name: '中国香港' },
  { code: '853', name: '中国澳门' },
  { code: '855', name: '柬埔寨' },
  { code: '856', name: '老挝' },
  { code: '880', name: '孟加拉国' },
  { code: '886', name: '中国台湾' },
  { code: '236', name: '中非共和国' },
  { code: '237', name: '喀麦隆' },
  { code: '242', name: '刚果' },
  { code: '682', name: '库克群岛' },
]

export function formatPhoneDialLabel(opt: Pick<PhoneDialCodeOption, 'code' | 'name'>) {
  return `${opt.code}-${opt.name}`
}

export function findPhoneDialOption(code: string) {
  return PHONE_DIAL_CODE_OPTIONS.find((o) => o.code === code)
}

export function phoneDialDisplay(code: string) {
  const hit = findPhoneDialOption(code)
  return hit ? formatPhoneDialLabel(hit) : code ? `+${code}` : ''
}

/** 区号枚举去重（同 code 只保留首条，供复选） */
export function uniquePhoneDialOptions() {
  const seen = new Set<string>()
  return PHONE_DIAL_CODE_OPTIONS.filter((o) => {
    if (seen.has(o.code)) return false
    seen.add(o.code)
    return true
  })
}

export function formatPhonePrefixesLabel(codes: string[]) {
  if (!codes.length) return ''
  return codes.map((code) => phoneDialDisplay(code)).join('、')
}

export type VipCapMode = 'single' | 'range' | 'and_above'

export type VipDailyCapRow = {
  id: string
  /** 单个 / 区间 / 及以上 */
  mode: VipCapMode
  /** VIP 起始等级（含） */
  vipFrom: number
  /** VIP 结束等级（含）；单级时等于 vipFrom；及以上时忽略 */
  vipTo: number
  /** 每日返利最高上限（单位随所属币种） */
  dailyCap: number
}

/** 单个币种下的活动规则条件（门槛、赠送、VIP 日上限等） */
export type ActivityCurrencyConfig = {
  currency: ActivityCurrency
  /** 邀请人须绑定手机号（解锁条件 C） */
  inviterRequirePhoneBound: boolean
  /** 允许的手机区号（复选，不含 +）；须绑手机号时至少选 1 个 */
  phonePrefixes: string[]
  /** 次日解锁门槛-邀请人：邀请人 T+1 日最低存款（本币种） */
  inviterRechargeDayMinDeposit: number
  /**
   * 业务日返利比例（%）
   * 预估奖金 = 被邀请人 T 日充值 × 比例，再按 VIP 日上限封顶
   */
  rebateRate: number
  /**
   * 提现流水倍数（整数，≥0）
   * 领取后按「奖金金额 × 倍数」增加提现流水；0 表示无流水限制
   */
  rebateWithdrawTurnoverMultiple: number
  /**
   * 奖励领取有效期（天，整数 ≥0）
   * 自 T+1 日起算；0 表示 T+1 当晚 24:00（即 T+2 00:00）过期
   * expireAt = startOfDay(T+1) + (X===0 ? 1 : X) × 1day
   */
  claimValidityDays: number
  /**
   * T日返利触发门槛-被邀请人（本币种）
   * 仅蓄力/进度展示；被邀请人 T 日充值 > 0 即生成待解锁记录，未达门槛也生成
   */
  inviteeBizDayMinDeposit: number
  /** 次日解锁门槛-被邀请人：被邀请人 T+1 日最低存款（本币种） */
  inviteeRechargeDayMinDeposit: number
  /** 被邀请人 VIP 对应 · 邀请人日返利上限阶梯（本币种） */
  vipDailyCaps: VipDailyCapRow[]
  rules: ActivityRuleRow[]
}

export const VIP_LEVEL_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type VipLevelValue = (typeof VIP_LEVEL_OPTIONS)[number]

export const VIP_CAP_MODE_OPTIONS = [
  { value: 'single' as const, label: '单个' },
  { value: 'range' as const, label: '区间' },
  { value: 'and_above' as const, label: '及以上' },
]

export function formatVipCapLabel(row: Pick<VipDailyCapRow, 'mode' | 'vipFrom' | 'vipTo'>) {
  if (row.mode === 'single') return `VIP ${row.vipFrom}`
  if (row.mode === 'and_above') return `VIP ${row.vipFrom} 及以上`
  return `VIP ${row.vipFrom} 至 VIP ${row.vipTo}`
}

/** 按币种给默认金额量级（原型演示用） */
function currencyAmountScale(currency: ActivityCurrency) {
  if (currency === 'USDT') return 0.00005
  if (currency === 'KKV') return 1
  return 1
}

export function createDefaultVipDailyCaps(currency: ActivityCurrency = 'KKC'): VipDailyCapRow[] {
  const s = currencyAmountScale(currency)
  const round = (n: number) => (currency === 'USDT' ? Math.round(n * 100) / 100 : Math.round(n))
  return [
    {
      id: `${currency}-vip-0-5`,
      mode: 'range',
      vipFrom: 0,
      vipTo: 5,
      dailyCap: round(6880000 * s),
    },
    {
      id: `${currency}-vip-6`,
      mode: 'single',
      vipFrom: 6,
      vipTo: 6,
      dailyCap: round(9888000 * s),
    },
    {
      id: `${currency}-vip-7`,
      mode: 'single',
      vipFrom: 7,
      vipTo: 7,
      dailyCap: round(12888000 * s),
    },
    {
      id: `${currency}-vip-8`,
      mode: 'single',
      vipFrom: 8,
      vipTo: 8,
      dailyCap: round(16888000 * s),
    },
    {
      id: `${currency}-vip-9`,
      mode: 'and_above',
      vipFrom: 9,
      vipTo: 9,
      dailyCap: round(58880000 * s),
    },
  ]
}

export function createEmptyVipDailyCap(currency: ActivityCurrency = 'KKC'): VipDailyCapRow {
  return {
    id: `${currency}-vip-${Date.now()}`,
    mode: 'single',
    vipFrom: 0,
    vipTo: 0,
    dailyCap: 0,
  }
}

export type ActivityRuleRow = {
  id: string
  startAt: string
  endAt: string
  giftAmount: number
  turnoverMultiple: number
}

export function createDefaultCurrencyConfig(
  currency: ActivityCurrency,
  timeRange?: { startAt: string; endAt: string },
): ActivityCurrencyConfig {
  const s = currencyAmountScale(currency)
  const round = (n: number) => (currency === 'USDT' ? Math.round(n * 100) / 100 : Math.round(n))
  const startAt = timeRange?.startAt ?? '2026-07-01T00:00'
  const endAt = timeRange?.endAt ?? '2026-12-31T23:59'
  return {
    currency,
    inviterRequirePhoneBound: true,
    phonePrefixes: [CURRENCY_DEFAULT_PHONE_PREFIX[currency]],
    inviterRechargeDayMinDeposit: round(200000 * s),
    rebateRate: 1,
    rebateWithdrawTurnoverMultiple: 1,
    claimValidityDays: 1,
    inviteeBizDayMinDeposit: round(1000000 * s),
    inviteeRechargeDayMinDeposit: round(500000 * s),
    vipDailyCaps: createDefaultVipDailyCaps(currency),
    rules: [
      {
        id: `${currency}-rule-${Date.now()}`,
        startAt,
        endAt,
        giftAmount: currency === 'USDT' ? 10 : 100,
        turnoverMultiple: 1,
      },
    ],
  }
}

export type ActivityCenterRow = {
  id: string
  activityId: number
  title: string
  subtitle: string
  type: ActivityType
  channels: string[]
  currencies: ActivityCurrency[]
  /** 各币种独立金额条件；与 currencies 一一对应 */
  currencyConfigs: ActivityCurrencyConfig[]
  startAt: string
  endAt: string
  memberCreatedStart: string
  memberCreatedEnd: string
  status: ActivityStatus
  showInList: boolean
  jumpType: ActivityJumpType
  appJumpUrl: string
  h5JumpUrl: string
  sort: number
  coverUrl: string
  gameCategories: string[]
}

export const ACTIVITY_CHANNEL_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'test1', label: '测试1' },
  { value: 'channel_b', label: '渠道B' },
  { value: 'platform', label: '平台自营' },
] as const

export const ACTIVITY_CHANNEL_FORM_OPTIONS = [
  { value: 'test1', label: '测试1' },
  { value: 'channel_b', label: '渠道B' },
  { value: 'platform', label: '平台自营' },
] as const

export const ACTIVITY_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'register_bonus', label: '注册送' },
  { value: 'invite_bonus', label: '邀请送' },
  { value: 'recharge_bonus', label: '充值送' },
  { value: 'display', label: '展示活动' },
  {
    value: 'invite_recharge_rebate_vip',
    label: '邀请返利',
  },
] as const

export const ACTIVITY_TYPE_FORM_OPTIONS = ACTIVITY_TYPE_OPTIONS.filter((o) => o.value !== '')

export const ACTIVITY_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '禁用' },
  { value: 'ended', label: '已结束' },
] as const

export const ACTIVITY_CURRENCY_OPTIONS: ActivityCurrency[] = ['KKC', 'KKV', 'USDT']

export const ACTIVITY_GAME_CATEGORIES = [
  '王者荣耀',
  'IM体育',
  'PG老虎机',
  'AG真人',
  '开元棋牌',
  'CQ9电子',
  'FB体育',
]

export function activityTypeLabel(type: ActivityType) {
  return ACTIVITY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

export function activityStatusLabel(status: ActivityStatus) {
  return ACTIVITY_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

export function channelLabel(value: string) {
  return ACTIVITY_CHANNEL_FORM_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function isInviteRechargeRebateVip(type: ActivityType) {
  return type === 'invite_recharge_rebate_vip'
}

export function getCurrencyConfig(
  row: Pick<ActivityCenterRow, 'currencyConfigs'>,
  currency: ActivityCurrency,
) {
  return row.currencyConfigs.find((c) => c.currency === currency)
}

/** 勾选/取消币种时，同步维护 currencyConfigs */
export function syncCurrencyConfigs(
  row: ActivityCenterRow,
  nextCurrencies: ActivityCurrency[],
): ActivityCurrencyConfig[] {
  const prevMap = new Map(row.currencyConfigs.map((c) => [c.currency, c]))
  return nextCurrencies.map(
    (currency) =>
      prevMap.get(currency) ??
      createDefaultCurrencyConfig(currency, { startAt: row.startAt, endAt: row.endAt }),
  )
}

export function createEmptyActivityForm(partial?: Partial<ActivityCenterRow>): ActivityCenterRow {
  const currencies: ActivityCurrency[] = partial?.currencies ?? ['KKC']
  const base: ActivityCenterRow = {
    id: '',
    activityId: 0,
    title: '',
    subtitle: '',
    type: 'register_bonus',
    channels: ['test1'],
    currencies,
    currencyConfigs: currencies.map((c) => createDefaultCurrencyConfig(c)),
    startAt: '2026-07-01T00:00',
    endAt: '2026-12-31T23:59',
    memberCreatedStart: '',
    memberCreatedEnd: '',
    status: 'disabled',
    showInList: true,
    jumpType: 'internal',
    appJumpUrl: '',
    h5JumpUrl: '',
    sort: 1,
    coverUrl: '',
    gameCategories: ['IM体育'],
    ...partial,
  }
  if (partial?.currencies && !partial.currencyConfigs) {
    base.currencyConfigs = partial.currencies.map((c) =>
      createDefaultCurrencyConfig(c, { startAt: base.startAt, endAt: base.endAt }),
    )
  }
  return base
}

export function cloneActivityRow(row: ActivityCenterRow): ActivityCenterRow {
  return {
    ...row,
    channels: [...row.channels],
    currencies: [...row.currencies],
    gameCategories: [...row.gameCategories],
    currencyConfigs: row.currencyConfigs.map((c) => ({
      ...c,
      phonePrefixes: [...(c.phonePrefixes ?? [])],
      vipDailyCaps: c.vipDailyCaps.map((r) => ({ ...r })),
      rules: c.rules.map((r) => ({ ...r })),
    })),
  }
}

export function formatAmount(value: number) {
  return value.toLocaleString('zh-CN')
}

/** @deprecated 使用 formatAmount */
export const formatVnd = formatAmount

export const MOCK_ACTIVITY_CENTER_ROWS: ActivityCenterRow[] = [
  {
    id: 'a1',
    activityId: 87,
    title: '新用户注册礼',
    subtitle: '完成注册即送',
    type: 'register_bonus',
    channels: ['test1', 'channel_b'],
    currencies: ['KKC'],
    currencyConfigs: [
      {
        ...createDefaultCurrencyConfig('KKC', {
          startAt: '2026-05-22T00:00',
          endAt: '2026-12-31T23:59',
        }),
        rules: [
          {
            id: 'r1',
            startAt: '2026-05-22T00:00',
            endAt: '2026-12-31T23:59',
            giftAmount: 100,
            turnoverMultiple: 1,
          },
        ],
      },
    ],
    startAt: '2026-05-22T00:00',
    endAt: '2026-12-31T23:59',
    memberCreatedStart: '2026-01-01T00:00',
    memberCreatedEnd: '2026-12-31T23:59',
    status: 'enabled',
    showInList: true,
    jumpType: 'internal',
    appJumpUrl: '/activity/register',
    h5JumpUrl: '/h5/activity/register',
    sort: 1,
    coverUrl: '',
    gameCategories: ['IM体育', 'PG老虎机'],
  },
  {
    id: 'a2',
    activityId: 75,
    title: '夏季充值加赠',
    subtitle: '充值满额加赠',
    type: 'recharge_bonus',
    channels: ['platform'],
    currencies: ['KKC', 'USDT'],
    currencyConfigs: [
      {
        ...createDefaultCurrencyConfig('KKC', {
          startAt: '2026-06-01T00:00',
          endAt: '2026-07-11T00:00',
        }),
        rules: [
          {
            id: 'r2-kkc',
            startAt: '2026-06-01T00:00',
            endAt: '2026-07-11T00:00',
            giftAmount: 50,
            turnoverMultiple: 3,
          },
        ],
      },
      {
        ...createDefaultCurrencyConfig('USDT', {
          startAt: '2026-06-01T00:00',
          endAt: '2026-07-11T00:00',
        }),
        rules: [
          {
            id: 'r2-usdt',
            startAt: '2026-06-01T00:00',
            endAt: '2026-07-11T00:00',
            giftAmount: 5,
            turnoverMultiple: 3,
          },
        ],
      },
    ],
    startAt: '2026-06-01T00:00',
    endAt: '2026-07-11T00:00',
    memberCreatedStart: '',
    memberCreatedEnd: '',
    status: 'ended',
    showInList: false,
    jumpType: 'none',
    appJumpUrl: '',
    h5JumpUrl: '',
    sort: 2,
    coverUrl: '',
    gameCategories: ['AG真人'],
  },
  {
    id: 'a3',
    activityId: 101,
    title: '邀请好友充值返利',
    subtitle: '次日解锁 · 限时领取',
    type: 'invite_recharge_rebate_vip',
    channels: ['test1', 'platform'],
    currencies: ['KKC', 'KKV'],
    currencyConfigs: [
      createDefaultCurrencyConfig('KKC', {
        startAt: '2026-07-01T00:00',
        endAt: '2026-12-31T23:59',
      }),
      createDefaultCurrencyConfig('KKV', {
        startAt: '2026-07-01T00:00',
        endAt: '2026-12-31T23:59',
      }),
    ].map((c) => ({ ...c, rules: [] })),
    startAt: '2026-07-01T00:00',
    endAt: '2026-12-31T23:59',
    memberCreatedStart: '2026-01-01T00:00',
    memberCreatedEnd: '2026-12-31T23:59',
    status: 'enabled',
    showInList: true,
    jumpType: 'internal',
    appJumpUrl: '/activity/invite-rebate',
    h5JumpUrl: '/h5/activity/invite-rebate',
    sort: 3,
    coverUrl: '',
    gameCategories: ['IM体育', 'FB体育'],
  },
]
