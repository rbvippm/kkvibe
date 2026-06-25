export type ReportRangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

export type ReportCategoryKey = 'all' | 'chess' | 'esports' | 'fishing' | 'slots' | 'sports'

export type ReportVendorKey = 'all' | 'boya' | 'db' | 'cq9' | 'hacksaw'

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

export const REPORT_SUMMARY_CARDS = [
  { key: 'net', label: '上下分净额', value: '0.00' },
  { key: 'creditUp', label: '会员上分总额', value: '0.00' },
  { key: 'creditDown', label: '会员下分总额', value: '0.00' },
] as const

export const REPORT_DETAIL_ROWS = [
  { key: 'validBet', label: '下注有效金额（不参与计算）', value: '0.00' },
  { key: 'winLose', label: '输赢', value: '0.00' },
  { key: 'rebate', label: '退水', value: '0.00' },
  { key: 'vipRebate', label: 'VIP退水', value: '0.00' },
  { key: 'commission', label: '赚水', value: '0.00' },
  { key: 'vipBonus', label: 'VIP晋级礼金', value: '0.00' },
  { key: 'activity', label: '活动金', value: '0.00' },
] as const

export function reportDateRangeText(preset: ReportRangePreset): string {
  const base = '2026-06-24'
  if (preset === 'today') return `${base}至${base}`
  if (preset === 'yesterday') return '2026-06-23至2026-06-23'
  if (preset === 'thisWeek') return '2026-06-22至2026-06-24'
  return '2026-06-15至2026-06-21'
}

export function reportCategoryTitle(category: ReportCategoryKey, vendor: ReportVendorKey): string {
  if (category === 'all' && vendor === 'all') return '全部（实占）'
  const cat = REPORT_CATEGORY_TABS.find((t) => t.key === category)?.label ?? '全部'
  const ven = REPORT_VENDOR_PILLS.find((p) => p.key === vendor)?.label ?? ''
  if (vendor !== 'all') return `${ven}（实占）`
  return `${cat}（实占）`
}
