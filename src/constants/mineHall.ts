/** 旗舰厅 / 贵宾厅「我的」二级页回跳 */

export const MINE_HALL_FROM_VIP = 'vip-club'

export function isVipClubMineFrom(from: unknown) {
  return from === MINE_HALL_FROM_VIP
}

export function mineHomeRouteName(from?: unknown) {
  return isVipClubMineFrom(from) ? 'mobile-vip-club-mine' : 'mobile-mine'
}

export function mineHallQuery(isVipClub: boolean) {
  return isVipClub ? { from: MINE_HALL_FROM_VIP } : undefined
}

/** 二级页之间跳转时保留贵宾厅来源，避免返回落到旗舰厅「我的」 */
export function withMineHallFrom(from: unknown, extra: Record<string, string> = {}) {
  return isVipClubMineFrom(from) ? { ...extra, from: MINE_HALL_FROM_VIP } : extra
}
