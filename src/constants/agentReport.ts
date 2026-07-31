export type ReportRangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

export type ReportCategoryKey = 'all' | 'chess' | 'esports' | 'fishing' | 'slots' | 'sports'

export type ReportVendorKey = 'all' | 'boya' | 'db' | 'cq9' | 'hacksaw'

export type ReportValueTone = 'neutral' | 'positive' | 'negative'

export type ReportDetailRow = {
  key: string
  label: string
  value: string
  tone: ReportValueTone
}

/** 游戏净输赢 = 输赢 − 退水 − VIP退水 − 代理赚水（对齐游戏净输赢公式） */
export type ReportDetail = {
  netProfit: string
  netProfitTone: ReportValueTone
  rows: ReportDetailRow[]
}

export const REPORT_RANGE_PRESETS: { key: ReportRangePreset; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastWeek', label: '上周' },
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
  { key: 'fee', label: '充值后续费', value: '86.00' },
  { key: 'deposit', label: '会员充值总额', value: '12,800.00' },
  { key: 'withdraw', label: '会员提款总额', value: '6,420.00' },
] as const

export function getReportSummaryCards(isCreditCurrency: boolean) {
  return isCreditCurrency ? REPORT_SUMMARY_CARDS_CREDIT : REPORT_SUMMARY_CARDS_CASH
}

function buildDetail(
  validBet: string,
  win: number,
  rebate: number,
  vipRebate: number,
  commission: number,
): ReportDetail {
  const net = win - rebate - vipRebate - commission
  const fmt = (n: number, signed = true) => {
    const abs = Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    if (!signed) return abs
    if (n > 0) return `+${abs}`
    if (n < 0) return `-${abs}`
    return '0.00'
  }
  const tone = (n: number): ReportValueTone => {
    if (n > 0) return 'positive'
    if (n < 0) return 'negative'
    return 'neutral'
  }

  return {
    netProfit: fmt(net),
    netProfitTone: tone(net),
    rows: [
      { key: 'validBet', label: '下注有效金额', value: validBet, tone: 'neutral' },
      { key: 'winLose', label: '输赢', value: fmt(win), tone: tone(win) },
      { key: 'rebate', label: '退水', value: fmt(-rebate), tone: tone(-rebate) },
      { key: 'vipRebate', label: 'VIP退水', value: fmt(-vipRebate), tone: tone(-vipRebate) },
      {
        key: 'commission',
        label: '代理赚水',
        value: fmt(-commission),
        tone: tone(-commission),
      },
    ],
  }
}

/** 一级「全部」合计：游戏净输赢 = 12350 − 1280 − 150 − 860 = 10060 */
const OVERALL_DETAIL = buildDetail('86,420.00', 12350, 1280, 150, 860)

/** 品类二级「全部」 */
const CATEGORY_ALL_DETAIL: Record<Exclude<ReportCategoryKey, 'all'>, ReportDetail> = {
  sports: buildDetail('42,800.00', 9860, 980, 120, 340), // 8420
  chess: buildDetail('18,640.00', 3200, 280, 45, 95), // 2780
  esports: buildDetail('9,820.00', 1560, 160, 28, 52), // 1320
  fishing: buildDetail('6,450.00', -820, 90, 15, 35), // -960
  slots: buildDetail('11,200.00', 2140, 210, 38, 72), // 1820
}

/** 具体场馆：游戏净输赢 = 500 − 100 − 50 − 10 = 340 */
const VENDOR_DETAIL = buildDetail('1,000.00', 500, 100, 50, 10)

/** @deprecated 请使用 getReportDetail */
export const REPORT_DETAIL_ROWS = OVERALL_DETAIL.rows

export function getReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
): ReportDetail {
  if (category === 'all') return OVERALL_DETAIL
  if (vendor === 'all') return CATEGORY_ALL_DETAIL[category]
  return VENDOR_DETAIL
}

/** 代理详情 · 游戏数据（返佣）：结构同「我的报表」，Mock 为下级代理口径（数字不同） */
const DETAIL_OVERALL = buildDetail('52,180.00', 8640, 720, 96, 420)
const DETAIL_CATEGORY_ALL: Record<Exclude<ReportCategoryKey, 'all'>, ReportDetail> = {
  sports: buildDetail('24,600.00', 5120, 480, 68, 210),
  chess: buildDetail('11,280.00', 1860, 160, 28, 72),
  esports: buildDetail('6,420.00', 980, 95, 16, 38),
  fishing: buildDetail('3,860.00', -460, 52, 10, 22),
  slots: buildDetail('7,020.00', 1340, 128, 24, 48),
}
const DETAIL_VENDOR = buildDetail('680.00', 320, 48, 18, 12)

/** 代理详情页返佣「游戏数据」明细 */
export function getAgentDetailReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
): ReportDetail {
  if (category === 'all') return DETAIL_OVERALL
  if (vendor === 'all') return DETAIL_CATEGORY_ALL[category]
  return DETAIL_VENDOR
}

/** 会员详情 · 游戏统计（返佣）：无退水/赚水行，净输赢仅扣 VIP退水 */
const MEMBER_DETAIL_OVERALL = buildDetail('68,240.00', 9860, 0, 120, 0)
const MEMBER_DETAIL_CATEGORY_ALL: Record<Exclude<ReportCategoryKey, 'all'>, ReportDetail> = {
  sports: buildDetail('32,100.00', 5680, 0, 72, 0),
  chess: buildDetail('14,860.00', 2140, 0, 32, 0),
  esports: buildDetail('8,120.00', 1120, 0, 18, 0),
  fishing: buildDetail('4,580.00', -380, 0, 12, 0),
  slots: buildDetail('9,580.00', 1680, 0, 28, 0),
}
const MEMBER_DETAIL_VENDOR = buildDetail('820.00', 260, 0, 14, 0)

export function getMemberDetailReportDetail(
  category: ReportCategoryKey,
  vendor: ReportVendorKey,
): ReportDetail {
  if (category === 'all') return MEMBER_DETAIL_OVERALL
  if (vendor === 'all') return MEMBER_DETAIL_CATEGORY_ALL[category]
  return MEMBER_DETAIL_VENDOR
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

export function reportDateRangeText(preset: ReportRangePreset): string {
  const base = '2026-06-24'
  if (preset === 'today') return `${base}至${base}`
  if (preset === 'yesterday') return '2026-06-23至2026-06-23'
  if (preset === 'thisWeek') return '2026-06-22至2026-06-24'
  return '2026-06-15至2026-06-21'
}

export function reportCategoryTitle(category: ReportCategoryKey, vendor: ReportVendorKey): string {
  if (category === 'all' && vendor === 'all') return '全部'
  const cat = REPORT_CATEGORY_TABS.find((t) => t.key === category)?.label ?? '全部'
  const ven = REPORT_VENDOR_PILLS.find((p) => p.key === vendor)?.label ?? ''
  if (vendor !== 'all') return ven
  return cat
}
