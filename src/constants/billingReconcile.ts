/**
 * 账单管理 · 平台对账 / 渠道对账 · 现金与信用两本账的字段口径与 Mock
 * 原 X币 对应现在的「信用额度-CNY」；信用账本只统计会员投注、中奖、返利（会员退水 + 代理退水）、盈亏。
 */

export type ReconcileLedger = 'cash' | 'credit'

export const RECONCILE_LEDGER_TABS: { value: ReconcileLedger; label: string }[] = [
  { value: 'cash', label: '现金' },
  { value: 'credit', label: '信用' },
]

export const RECONCILE_CURRENCIES: Record<ReconcileLedger, string[]> = {
  cash: ['KKC', 'KKV', 'USDT'],
  credit: ['信用额度-CNY', '信用额度-USDT'],
}

export function parseReconcileLedger(value: unknown): ReconcileLedger {
  return value === 'credit' ? 'credit' : 'cash'
}

export const RECONCILE_TIMEZONES = ['(UTC+08:00) 北京', '(UTC+00:00) UTC'] as const

export const RECONCILE_MINI_PROGRAMS = ['皇者体育', '开元棋牌'] as const
export const RECONCILE_DEVELOPERS = ['皇者科技', '开元游戏'] as const

/** 原型「今天」，统计时间默认取当天 */
export const RECONCILE_TODAY = '2026-11-09'

export type ReconcileMetricKey =
  | 'buy'
  | 'payFee'
  | 'sell'
  | 'consume'
  | 'settle'
  | 'changeAdd'
  | 'changeSub'
  | 'rebate'
  | 'memberRebate'
  | 'agentRebate'
  | 'c2cRebate'
  | 'activityGift'
  | 'activityFund'
  | 'mineFee'
  | 'profit'
  | 'firstDepositAmount'

/** 人数类统计（不按金额求和） */
export type ReconcileCountKey = 'buyers' | 'consumers' | 'firstDepositUsers' | 'registered' | 'online'

export type ReconcileStatKey = ReconcileMetricKey | ReconcileCountKey

export type ReconcileField<K extends string = ReconcileStatKey> = { key: K; label: string }

type Metrics = Record<ReconcileMetricKey, number>

export type ReconcileUser = {
  nickname: string
  userId: string
  channelNo: number
  miniProgram: string
  developer: string
}

export type ReconcileChannel = { no: number; name: string; userCount: number }

export const RECONCILE_CHANNELS: ReconcileChannel[] = [
  { no: 1, name: '平台自营', userCount: 1280 },
  { no: 23, name: '金福', userCount: 1 },
  { no: 24, name: '测试注册', userCount: 11 },
  { no: 25, name: '880', userCount: 0 },
  { no: 26, name: '好世界', userCount: 142 },
  { no: 27, name: '新增渠道', userCount: 25 },
  { no: 29, name: 'kaio001', userCount: 4 },
]

export function reconcileChannelName(no: number) {
  return RECONCILE_CHANNELS.find((c) => c.no === no)?.name ?? '-'
}

const USERS: ReconcileUser[] = [
  { nickname: '小红呀呀呀呀呀', userId: '7831562076704421988', channelNo: 1, miniProgram: '', developer: '' },
  { nickname: 'VIP888', userId: '7831562076704421995', channelNo: 26, miniProgram: '皇者体育', developer: '皇者科技' },
  { nickname: 'li0428', userId: '7831562076704421996', channelNo: 26, miniProgram: '开元棋牌', developer: '开元游戏' },
  { nickname: '骄傲的鸭子', userId: '7831562076704421997', channelNo: 23, miniProgram: '皇者体育', developer: '皇者科技' },
  { nickname: '阿杰', userId: '7831562076704422001', channelNo: 27, miniProgram: '', developer: '' },
  { nickname: 'kaio测试01', userId: '7831562076704422002', channelNo: 29, miniProgram: '开元棋牌', developer: '开元游戏' },
]

export type ReconcileDailyRow = Metrics & {
  ledger: ReconcileLedger
  currency: string
  date: string
  user: ReconcileUser
  isFirstDeposit: boolean
  isRegistered: boolean
}

const DATES = ['2026-11-09', '2026-11-08', '2026-11-07', '2026-10-28'] as const
const DAY_FACTOR = [1, 0.8, 1.3, 0.6]

const CURRENCY_FACTOR: Record<string, number> = {
  KKC: 1,
  KKV: 2.6,
  USDT: 0.14,
  '信用额度-CNY': 1,
  '信用额度-USDT': 0.14,
}

/** 每个用户的日投注基数（现金 / 信用），0 表示该账本无流水 */
const CASH_BASE = [1200, 3600, 860, 420, 2000, 300]
const CREDIT_BASE = [0, 5000, 3000, 1500, 800, 0]
/** 信用会员中奖率：>1 代表会员赢钱、平台亏 */
const CREDIT_WIN_RATIO = [0, 0.9, 1.08, 0.94, 0.97, 0]

const round = (v: number, d = 6) => Number(v.toFixed(d))

function emptyMetrics(): Metrics {
  return {
    buy: 0,
    payFee: 0,
    sell: 0,
    consume: 0,
    settle: 0,
    changeAdd: 0,
    changeSub: 0,
    rebate: 0,
    memberRebate: 0,
    agentRebate: 0,
    c2cRebate: 0,
    activityGift: 0,
    activityFund: 0,
    mineFee: 0,
    profit: 0,
    firstDepositAmount: 0,
  }
}

function cashMetrics(b: number, day: number): Metrics {
  const m = emptyMetrics()
  m.buy = round(b * 1.2, 2)
  m.payFee = round(m.buy * 0.001)
  m.sell = round(b * 0.3, 2)
  m.consume = b
  m.settle = round(b * 0.92)
  m.changeAdd = day === 0 ? round(b * 0.05, 2) : 0
  m.changeSub = round(b * 0.01, 2)
  m.rebate = round(b * 0.008)
  m.c2cRebate = round(b * 0.0005)
  m.activityGift = day === 1 ? 20 : 0
  m.activityFund = day === 0 ? 10 : 0
  m.mineFee = round(b * 0.002)
  m.profit = round(
    m.consume - m.settle - m.rebate - m.c2cRebate - m.activityGift - m.activityFund + m.mineFee + m.payFee,
  )
  return m
}

/** 信用：平台返利 = 信用会员退水（1%）+ 信用代理退水（一级 0.5% + 二级 0.5%）；平台盈亏 = 投注 − 中奖 − 返利 */
function creditMetrics(b: number, winRatio: number): Metrics {
  const m = emptyMetrics()
  m.consume = b
  m.settle = round(b * winRatio)
  m.memberRebate = round(b * 0.01)
  m.agentRebate = round(b * 0.01)
  m.rebate = round(m.memberRebate + m.agentRebate)
  m.profit = round(m.consume - m.settle - m.rebate)
  return m
}

function buildRows(): ReconcileDailyRow[] {
  const rows: ReconcileDailyRow[] = []
  for (const ledger of ['cash', 'credit'] as const) {
    for (const currency of RECONCILE_CURRENCIES[ledger]) {
      const cf = CURRENCY_FACTOR[currency] ?? 1
      USERS.forEach((user, ui) => {
        const base = (ledger === 'cash' ? CASH_BASE : CREDIT_BASE)[ui]!
        if (!base) return
        DATES.forEach((date, di) => {
          const b = round(base * DAY_FACTOR[di]! * cf, 2)
          const metrics = ledger === 'cash' ? cashMetrics(b, di) : creditMetrics(b, CREDIT_WIN_RATIO[ui]!)
          const isFirstDeposit = ledger === 'cash' && di === 3 && ui >= 4
          if (isFirstDeposit) metrics.firstDepositAmount = metrics.buy
          rows.push({
            ...metrics,
            ledger,
            currency,
            date,
            user,
            isFirstDeposit,
            isRegistered: ledger === 'cash' && di === 0 && ui === 4,
          })
        })
      })
    }
  }
  return rows
}

export const MOCK_RECONCILE_ROWS = buildRows()

const METRIC_KEYS = Object.keys(emptyMetrics()) as ReconcileMetricKey[]

export type ReconcileTotals = Record<ReconcileStatKey, number>

/** 在线总人数为实时值，不随筛选变化 */
const ONLINE_USERS = 21

export function sumReconcileRows(rows: ReconcileDailyRow[]): ReconcileTotals {
  const totals = { ...emptyMetrics(), buyers: 0, consumers: 0, firstDepositUsers: 0, registered: 0, online: 0 }
  const buyers = new Set<string>()
  const consumers = new Set<string>()
  for (const row of rows) {
    for (const key of METRIC_KEYS) totals[key] += row[key]
    if (row.buy > 0) buyers.add(row.user.userId)
    if (row.consume > 0) consumers.add(row.user.userId)
    if (row.isFirstDeposit) totals.firstDepositUsers += 1
    if (row.isRegistered) totals.registered += 1
  }
  for (const key of METRIC_KEYS) totals[key] = round(totals[key])
  totals.buyers = buyers.size
  totals.consumers = consumers.size
  totals.online = ONLINE_USERS
  return totals
}

export type ReconcileUserRow = ReconcileTotals & { user: ReconcileUser }

/** 按用户汇总（列表行） */
export function groupReconcileByUser(rows: ReconcileDailyRow[]): ReconcileUserRow[] {
  const map = new Map<string, ReconcileDailyRow[]>()
  for (const row of rows) {
    const list = map.get(row.user.userId) ?? []
    list.push(row)
    map.set(row.user.userId, list)
  }
  return [...map.values()].map((list) => ({ ...sumReconcileRows(list), user: list[0]!.user }))
}

export function reconcileRowsOf(ledger: ReconcileLedger, currency: string) {
  return MOCK_RECONCILE_ROWS.filter((row) => row.ledger === ledger && row.currency === currency)
}

export function formatReconcileValue(key: ReconcileStatKey, value: number) {
  if (key === 'firstDepositAmount') return value.toFixed(2)
  return String(round(value))
}

/** 用户持有币种总额：按账本跨币种展示，不随币种下拉切换；信用为会员信用钱包余额（原「用户持有 X币总额」） */
export const PLATFORM_HOLDINGS: Record<ReconcileLedger, { label: string; value: string }[]> = {
  cash: [
    { label: '用户持有USDT-TRON总额', value: '1030274.008597' },
    { label: '用户持有USDT-SOL总额', value: '57.193571' },
    { label: '用户持有KKC总额', value: '348733141.931178' },
    { label: '用户持有KKV总额', value: '1024846151.136649' },
  ],
  credit: [
    { label: '用户持有信用额度-CNY总额', value: '4179.127525' },
    { label: '用户持有信用额度-USDT总额', value: '586.42' },
  ],
}

/* ---------------- 平台对账 字段口径 ---------------- */

export const PLATFORM_SUMMARY_FIELDS: Record<ReconcileLedger, ReconcileField<ReconcileMetricKey>[]> = {
  cash: [
    { key: 'buy', label: '币种充值总量' },
    { key: 'payFee', label: '支付手续费总额' },
    { key: 'sell', label: '币种提现总量' },
    { key: 'consume', label: '币种投注总额' },
    { key: 'settle', label: '用户结算总额' },
    { key: 'changeAdd', label: '账变增加总额' },
    { key: 'changeSub', label: '账变减少总额' },
    { key: 'rebate', label: '平台返利总额' },
    { key: 'c2cRebate', label: 'C2C返利总额' },
    { key: 'activityGift', label: '活动赠送总额' },
    { key: 'mineFee', label: '踩雷手续费' },
    { key: 'profit', label: '平台总盈亏' },
    { key: 'activityFund', label: '活动金赠送总数量' },
  ],
  credit: [
    { key: 'consume', label: '币种投注总额' },
    { key: 'settle', label: '用户中奖总额' },
    { key: 'rebate', label: '平台返利总额' },
    { key: 'profit', label: '平台总盈亏' },
  ],
}

export const PLATFORM_DATA_STATS: Record<ReconcileLedger, ReconcileField[]> = {
  cash: [
    { key: 'buy', label: '币种充值量' },
    { key: 'payFee', label: '支付手续费' },
    { key: 'sell', label: '币种提现量' },
    { key: 'consume', label: '币种投注量' },
    { key: 'settle', label: '用户结算量' },
    { key: 'changeAdd', label: '账变增加额' },
    { key: 'changeSub', label: '账变减少额' },
    { key: 'rebate', label: '平台返利额' },
    { key: 'c2cRebate', label: 'C2C返利额' },
    { key: 'activityGift', label: '活动赠送额' },
    { key: 'mineFee', label: '踩雷手续费' },
    { key: 'profit', label: '平台盈亏额' },
    { key: 'activityFund', label: '活动金赠送总数量' },
    { key: 'buyers', label: '买币人数' },
    { key: 'consumers', label: '投注人数' },
    { key: 'firstDepositUsers', label: '首充人数（新用户）' },
    { key: 'firstDepositAmount', label: '首充金额（新用户）' },
    { key: 'registered', label: '注册人数' },
    { key: 'online', label: '在线总人数' },
  ],
  credit: [
    { key: 'consumers', label: '投注人数' },
    { key: 'consume', label: '币种投注量' },
    { key: 'rebate', label: '平台返利额度' },
    { key: 'profit', label: '平台盈亏额' },
  ],
}

/* ---------------- 渠道对账 / 用户明细 字段口径 ---------------- */

/** 用户明细表与渠道列表共用的金额列 */
export const RECONCILE_AMOUNT_COLUMNS: Record<ReconcileLedger, ReconcileField<ReconcileMetricKey>[]> = {
  cash: [
    { key: 'buy', label: '购买数量' },
    { key: 'payFee', label: '支付手续费' },
    { key: 'sell', label: '出售数量' },
    { key: 'consume', label: '消费数量' },
    { key: 'settle', label: '结算数量' },
    { key: 'changeAdd', label: '账变增加数量' },
    { key: 'changeSub', label: '账变减少数量' },
    { key: 'rebate', label: '平台返利数量' },
    { key: 'c2cRebate', label: '平台C2C交易返利数量' },
    { key: 'activityGift', label: '活动赠送数量' },
    { key: 'activityFund', label: '活动金赠送数量' },
    { key: 'mineFee', label: '踩雷手续费' },
    { key: 'profit', label: '平台盈亏数' },
  ],
  credit: [
    { key: 'consume', label: '消费数量' },
    { key: 'settle', label: '中奖数量' },
    { key: 'rebate', label: '平台返利数量' },
    { key: 'profit', label: '平台盈亏数' },
  ],
}

/** 渠道对账详情（弹框顶部汇总），渠道 / 用户数量另行展示 */
export const CHANNEL_DETAIL_FIELDS: Record<ReconcileLedger, ReconcileField<ReconcileMetricKey>[]> = {
  cash: RECONCILE_AMOUNT_COLUMNS.cash.map((f) => (f.key === 'profit' ? { ...f, label: '平台总盈亏数' } : f)),
  credit: RECONCILE_AMOUNT_COLUMNS.credit.map((f) => (f.key === 'profit' ? { ...f, label: '平台总盈亏数' } : f)),
}

/** 渠道内用户持有币种总数量（Mock，按渠道编号；未列出的渠道为 0），各渠道之和 = 平台用户持有总额 */
export const CHANNEL_HOLDINGS: Record<ReconcileLedger, { labels: string[]; values: Record<number, string[]> }> = {
  cash: {
    labels: ['用户USDT-TRON总数量', '用户USDT-SOL总数量', '用户KKC总数量', '用户KKV总数量'],
    values: {
      1: ['86320.55', '12.5', '2481200.3366', '5320880.12'],
      26: ['4120.8', '0', '91502.775', '233600'],
      29: ['0', '0', '1840.0325', '0'],
    },
  },
  credit: {
    labels: ['用户信用额度-CNY总数量', '用户信用额度-USDT总数量'],
    values: {
      26: ['3120.5', '420.8'],
      23: ['1058.627525', '165.62'],
    },
  },
}

export const CHANNEL_DATA_STATS: Record<ReconcileLedger, ReconcileField[]> = {
  cash: [
    ...RECONCILE_AMOUNT_COLUMNS.cash.filter((f) => f.key !== 'profit' && f.key !== 'activityFund'),
    { key: 'activityFund', label: '活动金赠送总数量' },
    { key: 'profit', label: '平台盈亏数' },
    { key: 'buyers', label: '买币人数' },
    { key: 'consumers', label: '消费人数' },
    { key: 'firstDepositUsers', label: '首充人数' },
    { key: 'firstDepositAmount', label: '首充金额' },
    { key: 'registered', label: '注册人数' },
  ],
  credit: [
    { key: 'consumers', label: '消费人数' },
    ...RECONCILE_AMOUNT_COLUMNS.credit,
  ],
}
