/** 群聊 / 社群资料与成员（点聊天顶栏更多进入） */

import { reactive } from 'vue'
import { appLocale } from '../i18n/locale'
import { CHAT_ASSETS } from './mobileChatAssets'

export type CommunityMemberRole = 'owner' | 'admin' | 'member'

export type CommunityVerify = '无需验证' | '需要管理员审核' | '回答问题'

export type CommunityMember = {
  id: string
  name: string
  role: CommunityMemberRole
  avatar: string
  /** 当前在线。在线时昵称下显示「在线」，不再展示最后上线时间 */
  online?: boolean
  /** 最后上线时间。仅社群、且查看者是群主或管理员时展示 */
  lastSeen: number
}

/** 当前用户在社群里的身份。演示默认群主，因此能看到最后上线；普通成员看不到 */
export const communityViewerRole = reactive<{ role: CommunityMemberRole }>({ role: 'owner' })

export type CommunityProfile = {
  name: string
  intro: string
  nickname: string
  verify: CommunityVerify
  muted: boolean
  privateLocked: boolean
}

export const COMMUNITY_VERIFY_OPTIONS: CommunityVerify[] = ['无需验证', '需要管理员审核', '回答问题']

export const COMMUNITY_INVITE_CONTACTS = [
  { id: 'lin', name: '林晓晴', avatar: CHAT_ASSETS.avatarDirect },
  { id: 'h5', name: 'h5图文入口', avatar: CHAT_ASSETS.avatarH5Article },
  { id: 'brand', name: '品牌宣传部', avatar: CHAT_ASSETS.avatarBrand },
] as const

const profiles = reactive<Record<string, CommunityProfile>>({})

export function communityProfileFor(roomId: string, fallbackName: string) {
  const key = roomId || 'group-demo'
  if (!profiles[key]) {
    profiles[key] = {
      name: fallbackName || '群群群組',
      intro: '这一次，历史由你改写！',
      nickname: '',
      verify: '无需验证',
      muted: false,
      privateLocked: false,
    }
  }
  return profiles[key]
}

function atLocal(dayOffset: number, hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date.getTime()
}

/** 本周内、且不是今天/昨天的一个时刻；周一、周二没有这种日子时退回更早的日期 */
function sameWeekEarlier(hour: number, minute: number) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const mondayOffset = now.getDay() === 0 ? 6 : now.getDay() - 1
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - mondayOffset)
  for (let days = 2; days <= 6; days += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - days)
    date.setHours(hour, minute, 0, 0)
    if (date.getTime() >= weekStart.getTime()) return date.getTime()
  }
  return new Date(2025, 10, 4, hour, minute, 0).getTime()
}

export const communityMembers = reactive<CommunityMember[]>([
  { id: 'owner', name: '飞流直下三千尺', role: 'owner', avatar: '/images/live-stream/avatar-1.jpg', lastSeen: atLocal(0, 20, 33) },
  { id: 'admin-1', name: '又是美好的一天', role: 'admin', avatar: '/images/live-stream/avatar-2.jpg', lastSeen: atLocal(-1, 23, 50) },
  { id: 'admin-2', name: 'kaio001', role: 'admin', avatar: '/images/live-stream/avatar-3.jpg', lastSeen: sameWeekEarlier(16, 45) },
  { id: 'admin-3', name: '来看1231231', role: 'admin', avatar: '/images/live-stream/avatar-4.jpg', lastSeen: new Date(2025, 10, 4, 9, 20).getTime() },
  { id: 'm-feature', name: 'feature41', role: 'member', avatar: '', online: true, lastSeen: Date.now() },
  { id: 'm-ji', name: '鸡米', role: 'member', avatar: '', lastSeen: atLocal(0, 8, 15) },
  { id: 'm-hb', name: 'hbgbg', role: 'member', avatar: '', lastSeen: new Date(2026, 8, 1, 11, 0).getTime() },
  { id: 'm-kaio', name: 'kaio003', role: 'member', avatar: '', lastSeen: sameWeekEarlier(9, 20) },
  { id: 'm-feng', name: '疯疯癫癫', role: 'member', avatar: '/images/chat-room/avatar.png', lastSeen: atLocal(-1, 14, 10) },
])

const WEEKDAY_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

/** 在线优先展示「在线」，否则按最后上线时间换算 */
export function formatCommunityPresence(member: CommunityMember) {
  if (member.online) return appLocale.value === 'en' ? 'online' : '在线'
  return formatCommunityLastSeen(member.lastSeen)
}

/**
 * 社群成员最后上线。
 * at 是服务端时间戳。今天、昨天、本周和日期都按查看者本机本地时区计算，不用 UTC，也不用服务器时区。
 * 本周以本地周一 0 点为界，跨周不用星期。
 */
export function formatCommunityLastSeen(at: number, now = new Date()) {
  const time = new Date(at)
  if (Number.isNaN(time.getTime())) return ''
  const hm = `${pad2(time.getHours())}:${pad2(time.getMinutes())}`
  const todayStart = startOfDay(now)
  const dayStart = startOfDay(time)
  const dayGap = Math.round((todayStart - dayStart) / 86400000)
  const english = appLocale.value === 'en'

  if (dayGap === 0) return english ? `last seen today at ${hm}` : `最后上线于 今天 ${hm}`
  if (dayGap === 1) return english ? `last seen yesterday at ${hm}` : `最后上线于 昨天 ${hm}`

  const mondayOffset = now.getDay() === 0 ? 6 : now.getDay() - 1
  const weekStart = todayStart - mondayOffset * 86400000
  if (dayGap >= 2 && dayGap <= 6 && dayStart >= weekStart) {
    if (english) return `last seen ${WEEKDAY_EN[time.getDay()]} at ${hm}`
    return `最后上线于 ${WEEKDAY_ZH[time.getDay()]} ${hm}`
  }

  if (english) return `last seen ${MONTH_EN[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`
  return `最后上线于 ${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日`
}

export function canViewCommunityLastSeen() {
  return communityViewerRole.role === 'owner' || communityViewerRole.role === 'admin'
}

export function communityRoleLabel(role: CommunityMemberRole) {
  if (role === 'owner') return '群主'
  if (role === 'admin') return '管理员'
  return ''
}
