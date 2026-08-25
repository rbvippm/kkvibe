export type ReportRangePreset = 'today' | 'yesterday' | 'thisMonth' | 'lastMonth'

export type ReportCategoryKey = 'all' | 'chess' | 'esports' | 'fishing' | 'slots' | 'sports'

export type ReportVendorKey = 'all' | 'boya' | 'db' | 'cq9' | 'hacksaw'

export type ReportValueTone = 'neutral' | 'positive' | 'negative'

export type ReportDetailRow = {
  key: string
  label: string
  value: string
  tone: ReportValueTone
}

/** 基础报表明细按占成口径生成，页面可按身份过滤并重算 */
export type ReportDetail = {
  netProfit: string
  netProfitTone: ReportValueTone
  rows: ReportDetailRow[]
}

export const AGENT_REPORT_FILTER_ASSETS = {
  calendar: '/images/agent-report/icon-calendar.svg',
  dropdown: '/images/agent-report/icon-dropdown.svg',
  close: '/images/agent-report/icon-close.svg',
} as const

export const REPORT_RANGE_PRESETS: { key: ReportRangePreset; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
]

/** 概况 / 代理详情 / 会员详情：今日、昨天、本月、上月 */
export type MonthRangePreset = 'today' | 'yesterday' | 'thisMonth' | 'lastMonth'

export const MONTH_RANGE_PRESETS: { key: MonthRangePreset; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨天' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
]

export const REPORT_CATEGORY_TABS: { key: ReportCategoryKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'chess', label: '棋牌' },
  { key: 'esports', label: '电竞' },
  { key: 'fishing', label: '捕鱼' },
  { key: 'slots', label: '老虎机' },
  { key: 'sports', label: '体育' },
]

export const REPORT_VENDOR_PILLS: { key: ReportVendorKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'boya', label: '博雅-扑克' },
  { key: 'db', label: 'DB - 电竞' },
  { key: 'cq9', label: 'CQ9 - 捕鱼' },
  { key: 'hacksaw', label: 'HACKS...' },
]

export const REPORT_SUMMARY_CARDS_CREDIT = [
  { key: 'net', label: '上下分净额', value: '1,280.00' },
  { key: 'creditUp', label: '会员上分总额', value: '3,560.00' },
  { key: 'creditDown', label: '会员下分总额', value: '2,280.00' },
] as const

export const REPORT_SUMMARY_CARDS_CASH = [
  { key: 'fee', label: '充提手续费', value: '86.00' },
  { key: 'deposit', label: '团队充值总额', value: '12,800.00' },
  { key: 'withdraw', label: '团队提款总额', value: '6,420.00' },
] as const

export function getReportSummaryCards(isCreditCurrency: boolean) {
  return isCreditCurrency ? REPORT_SUMMARY_CARDS_CREDIT : REPORT_SUMMARY_CARDS_CASH
}

function formatReportValue(n: number, signed = true) {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (!signed) return abs
  if (n > 0) return `+${abs}`
  if (n < 0) return `-${abs}`
  return '0.00'
}

function reportValueTone(n: number): ReportValueTone {
  if (n > 0) return 'positive'
  if (n < 0) return 'negative'
  return 'neutral'
}

/** 成本项展示服务端正数（无正负号），粉色表示支出 */
function formatCostReportValue(n: number): { value: string; tone: ReportValueTone } {
  const abs = Math.abs(n)
  return {
    value: formatReportValue(abs, false),
    tone: abs > 0 ? 'negative' : 'neutral',
  }
}

function buildDetail(
  validBet: string,
  win: number,
  rebate: number,
  vipRebate: number,
  commission: number,
  /** 传入时计入游戏净输赢并展示「场馆费」行（占成 / 返佣均支持） */
  venueFee?: number,
  /** 占成游戏净输赢不再扣代理赚水，默认不展示该行 */
  includeRebateEarn = false,
): ReportDetail {
  const venue = venueFee ?? 0
  const earn = includeRebateEarn ? commission : 0
  const net = win - rebate - vipRebate - earn - venue
  const rows: ReportDetailRow[] = [
    { key: 'validBet', label: '下注有效金额', value: validBet, tone: 'neutral' },
    { key: 'winLose', label: '输赢', value: formatReportValue(win), tone: reportValueTone(win) },
    { key: 'rebate', label: '退水', ...formatCostReportValue(rebate) },
    { key: 'vipRebate', label: 'VIP退水', ...formatCostReportValue(vipRebate) },
  ]
  if (includeRebateEarn) {
    rows.push({
      key: 'commission',
      label: '代理赚水',
      ...formatCostReportValue(commission),
    })
  }
  if (venueFee !== undefined) {
    rows.push({
      key: 'venueFee',
      label: '场馆费',
      ...formatCostReportValue(venue),
    })
  }

  return {
    netProfit: formatReportValue(net),
    netProfitTone: reportValueTone(net),
    rows,
  }
}

/** 一级「全部」合计：游戏净输赢 = 12350 − 1280 − 150 − 80 = 10840（占成含场馆费，不含代理赚水） */
const OVERALL_DETAIL = buildDetail('86,420.00', 12350, 1280, 150, 860, 80)

/** 品类二级「全部」 */
const CATEGORY_ALL_DETAIL: Record<Exclude<ReportCategoryKey, 'all'>, ReportDetail> = {
  sports: buildDetail('42,800.00', 9860, 980, 120, 340, 40), // 8720
  chess: buildDetail('18,640.00', 3200, 280, 45, 95, 20), // 2855
  esports: buildDetail('9,820.00', 1560, 160, 28, 52, 12), // 1360
  fishing: buildDetail('6,450.00', -820, 90, 15, 35, 8), // -933
  slots: buildDetail('11,200.00', 2140, 210, 38, 72, 15), // 1877
}

/** 具体场馆：游戏净输赢 = 500 − 100 − 50 − 20 = 330 */
const VENDOR_DETAIL = buildDetail('1,000.00', 500, 100, 50, 10, 20)

/** @deprecated 请使用 getReportDetail */
export const REPORT_DETAIL_ROWS = OVERALL_DETAIL.rows

export function getReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
  _includeCommission = false,
): ReportDetail {
  return category === 'all'
    ? OVERALL_DETAIL
    : vendor === 'all'
      ? CATEGORY_ALL_DETAIL[category]
      : VENDOR_DETAIL
}

/**
 * 代理详情 · 游戏数据（返佣）
 * - 始终无「退水」行（rebate 入参为 0）
 * - 无代理赚水；含场馆费
 */
const DETAIL_NUMS = {
  overall: { validBet: '52,180.00', win: 8640, vip: 96, venueFee: 80 },
  sports: { validBet: '24,600.00', win: 5120, vip: 68, venueFee: 40 },
  chess: { validBet: '11,280.00', win: 1860, vip: 28, venueFee: 20 },
  esports: { validBet: '6,420.00', win: 980, vip: 16, venueFee: 12 },
  fishing: { validBet: '3,860.00', win: -460, vip: 10, venueFee: 8 },
  slots: { validBet: '7,020.00', win: 1340, vip: 24, venueFee: 15 },
  vendor: { validBet: '680.00', win: 320, vip: 18, venueFee: 6 },
} as const

/** 代理详情页返佣「游戏数据」明细 */
export function getAgentDetailReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
): ReportDetail {
  const nums =
    category === 'all'
      ? DETAIL_NUMS.overall
      : vendor === 'all'
        ? DETAIL_NUMS[category]
        : DETAIL_NUMS.vendor
  return buildDetail(nums.validBet, nums.win, 0, nums.vip, 0, nums.venueFee)
}

/**
 * 我的报表 · 返佣游戏统计（含场馆费，无退水/代理赚水）
 */
const REPORT_REBATE_NUMS = {
  overall: { validBet: '86,420.00', win: 12350, vip: 150, venueFee: 80 },
  sports: { validBet: '42,800.00', win: 9860, vip: 120, venueFee: 40 },
  chess: { validBet: '18,640.00', win: 3200, vip: 45, venueFee: 20 },
  esports: { validBet: '9,820.00', win: 1560, vip: 28, venueFee: 12 },
  fishing: { validBet: '6,450.00', win: -820, vip: 15, venueFee: 8 },
  slots: { validBet: '11,200.00', win: 2140, vip: 38, venueFee: 15 },
  vendor: { validBet: '1,000.00', win: 500, vip: 50, venueFee: 10 },
} as const

export function getRebateReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
): ReportDetail {
  const nums =
    category === 'all'
      ? REPORT_REBATE_NUMS.overall
      : vendor === 'all'
        ? REPORT_REBATE_NUMS[category]
        : REPORT_REBATE_NUMS.vendor
  const detail = buildDetail(nums.validBet, nums.win, 0, nums.vip, 0, nums.venueFee)
  return {
    ...detail,
    rows: detail.rows.filter((row) => row.key !== 'rebate' && row.key !== 'commission'),
  }
}

/**
 * 会员详情 · 游戏统计（返佣 · 会员视角）
 * - 无会员退水 / 代理赚水 / 场馆费
 * - VIP 退水对会员为正：游戏净输赢 = 游戏输赢 + VIP退水
 */
const MEMBER_DETAIL_NUMS = {
  overall: { validBet: '68,240.00', win: 9860, vip: 120 },
  sports: { validBet: '32,100.00', win: 5680, vip: 72 },
  chess: { validBet: '14,860.00', win: 2140, vip: 32 },
  esports: { validBet: '8,120.00', win: 1120, vip: 18 },
  fishing: { validBet: '4,580.00', win: -380, vip: 12 },
  slots: { validBet: '9,580.00', win: 1680, vip: 28 },
  vendor: { validBet: '820.00', win: 260, vip: 14 },
} as const

function buildMemberRebateGameDetail(
  validBet: string,
  win: number,
  vipRebate: number,
): ReportDetail {
  const net = win + vipRebate
  return {
    netProfit: formatReportValue(net),
    netProfitTone: reportValueTone(net),
    rows: [
      { key: 'validBet', label: '下注有效金额', value: validBet, tone: 'neutral' },
      { key: 'winLose', label: '输赢', value: formatReportValue(win), tone: reportValueTone(win) },
      {
        key: 'vipRebate',
        label: 'VIP退水',
        value: formatReportValue(vipRebate),
        tone: reportValueTone(vipRebate),
      },
    ],
  }
}

export function getMemberDetailReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
): ReportDetail {
  const nums =
    category === 'all'
      ? MEMBER_DETAIL_NUMS.overall
      : vendor === 'all'
        ? MEMBER_DETAIL_NUMS[category]
        : MEMBER_DETAIL_NUMS.vendor
  return buildMemberRebateGameDetail(nums.validBet, nums.win, nums.vip)
}

export function reportDetailValueClass(tone: ReportValueTone) {
  if (tone === 'positive') return 'mh5-agent-report-detail__row-value--positive'
  if (tone === 'negative') return 'mh5-agent-report-detail__row-value--negative'
  return ''
}

export function reportNetProfitClass(tone: ReportValueTone) {
  if (tone === 'negative') return 'mh5-agent-report-detail__profit-total--negative'
  return 'mh5-agent-report-detail__profit-total--positive'
}

export function reportPresetRange(preset: ReportRangePreset): { start: string; end: string } {
  return monthPresetRange(preset)
}

export function reportDateRangeText(preset: ReportRangePreset): string {
  const range = reportPresetRange(preset)
  return `${range.start}至${range.end}`
}

export function monthPresetRange(preset: MonthRangePreset): { start: string; end: string } {
  if (preset === 'yesterday') return { start: '2026-06-23', end: '2026-06-23' }
  if (preset === 'thisMonth') return { start: '2026-06-01', end: '2026-06-24' }
  if (preset === 'lastMonth') return { start: '2026-05-01', end: '2026-05-31' }
  return { start: '2026-06-24', end: '2026-06-24' }
}

export function reportCategoryTitle(category: ReportCategoryKey, vendor: ReportVendorKey): string {
  if (category === 'all' && vendor === 'all') return '全部'
  const cat = REPORT_CATEGORY_TABS.find((t) => t.key === category)?.label ?? '全部'
  const ven = REPORT_VENDOR_PILLS.find((p) => p.key === vendor)?.label ?? ''
  if (vendor !== 'all') return ven
  return cat
}
