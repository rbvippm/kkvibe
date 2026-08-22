/** 代理端底部「筛选时间」共用日期口径 */

export const MH5_DATE_RANGE_TODAY = '2026-06-24'
export const MH5_DATE_RANGE_MAX_MONTHS = 6

export type DatePart = 'year' | 'month' | 'day'

export function parseYmd(value: string) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!matched) return null
  return { y: Number(matched[1]), m: Number(matched[2]), d: Number(matched[3]) }
}

export function formatYmd(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function padDatePart(n: number) {
  return String(n).padStart(2, '0')
}

export function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate()
}

export function addMonthsYmd(value: string, delta: number) {
  const parsed = parseYmd(value)
  if (!parsed) return value
  const cursor = new Date(parsed.y, parsed.m - 1 + delta, 1)
  const y = cursor.getFullYear()
  const m = cursor.getMonth() + 1
  return formatYmd(y, m, Math.min(parsed.d, daysInMonth(y, m)))
}

export function addDaysYmd(value: string, delta: number) {
  const parsed = parseYmd(value)
  if (!parsed) return value
  const cursor = new Date(parsed.y, parsed.m - 1, parsed.d + delta)
  return formatYmd(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate())
}

/** 周一=0 … 周日=6 */
export function weekdayMonday0(value: string) {
  const parsed = parseYmd(value)
  if (!parsed) return 0
  const day = new Date(parsed.y, parsed.m - 1, parsed.d).getDay()
  return day === 0 ? 6 : day - 1
}

export function clampYmd(value: string, min: string, max: string) {
  if (value < min) return min
  if (value > max) return max
  return value
}

/** 「筛选时间」弹层内六格快捷 */
export type DateRangeSheetPreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'

export const DATE_RANGE_SHEET_PRESETS: { key: DateRangeSheetPreset; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastWeek', label: '上周' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
]

export function dateRangeSheetPresetRange(
  preset: DateRangeSheetPreset,
  today: string = MH5_DATE_RANGE_TODAY,
): { start: string; end: string } {
  if (preset === 'today') return { start: today, end: today }
  if (preset === 'yesterday') {
    const ymd = addDaysYmd(today, -1)
    return { start: ymd, end: ymd }
  }
  if (preset === 'thisWeek') {
    return { start: addDaysYmd(today, -weekdayMonday0(today)), end: today }
  }
  if (preset === 'lastWeek') {
    const thisMonday = addDaysYmd(today, -weekdayMonday0(today))
    return { start: addDaysYmd(thisMonday, -7), end: addDaysYmd(thisMonday, -1) }
  }
  const parsed = parseYmd(today)
  if (!parsed) return { start: today, end: today }
  if (preset === 'thisMonth') {
    return { start: formatYmd(parsed.y, parsed.m, 1), end: today }
  }
  const last = parsed.m === 1 ? { y: parsed.y - 1, m: 12 } : { y: parsed.y, m: parsed.m - 1 }
  return {
    start: formatYmd(last.y, last.m, 1),
    end: formatYmd(last.y, last.m, daysInMonth(last.y, last.m)),
  }
}

export function matchDateRangeSheetPreset(
  start: string,
  end: string,
  today: string = MH5_DATE_RANGE_TODAY,
): DateRangeSheetPreset | null {
  for (const item of DATE_RANGE_SHEET_PRESETS) {
    const range = dateRangeSheetPresetRange(item.key, today)
    if (range.start === start && range.end === end) return item.key
  }
  return null
}

export function diffDaysYmd(start: string, end: string) {
  const a = parseYmd(start)
  const b = parseYmd(end)
  if (!a || !b) return 0
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)
  return Math.round(ms / 86400000)
}

export function formatDateRangeText(start: string, end: string) {
  if (!start || !end) return '请选择日期'
  return `${start}至${end}`
}

export function creditSettleRangeScale(start: string, end: string) {
  const days = Math.abs(diffDaysYmd(start, end)) + 1
  if (days <= 1) return 1
  if (days <= 7) return 0.92
  return 0.78
}

export function shiftYmd(value: string, part: DatePart, delta: number) {
  const parsed = parseYmd(value)
  if (!parsed) return value
  let { y, m, d } = parsed
  if (part === 'year') y += delta
  if (part === 'month') {
    m += delta
    while (m < 1) {
      m += 12
      y -= 1
    }
    while (m > 12) {
      m -= 12
      y += 1
    }
  }
  if (part === 'day') d += delta
  if (part !== 'day') {
    d = Math.min(d, daysInMonth(y, m))
  } else if (d < 1) {
    m -= 1
    if (m < 1) {
      m = 12
      y -= 1
    }
    d = daysInMonth(y, m)
  } else if (d > daysInMonth(y, m)) {
    d = 1
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return formatYmd(y, m, d)
}
