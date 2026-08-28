/** 直播间 · 在线人数（后台按主播配置基准 + 进出波动） */

import type { AppLocale } from '../i18n/locale'
import { LIVE_STREAM_ASSETS } from './mobileLiveStream'

/** 后台可改：登录用户进入 / 退出时的人数波动区间（游客不计入） */
export type LiveOnlineDeltaRange = readonly [number, number]

export type LiveOnlineHostConfig = {
  /** 房间 / 主播标识 */
  roomId: string
  /** 后台可改的基准在线人数 */
  baseCount: number
  /** 登录用户进入时增加的随机区间；游客进出不触发 */
  enterDelta: LiveOnlineDeltaRange
  /** 有人退出时减少的随机区间 */
  leaveDelta: LiveOnlineDeltaRange
}

/** 本场大赏贡献排行 */
export type LiveRewardRankUser = {
  id: string
  name: string
  avatar: string
  /** 贡献值，越大越靠前 */
  score: number
}

const AV = LIVE_STREAM_ASSETS.avatars
const FRIEND = [
  '/images/live-stream/share/friend-1.png',
  '/images/live-stream/share/friend-2.png',
  '/images/live-stream/share/friend-3.png',
  '/images/live-stream/share/friend-4.png',
] as const
const SYS_EXTRA = [
  '/images/voice-room/avatar-a.jpg',
  '/images/voice-room/avatar-b.jpg',
  '/images/voice-room/avatar-c.jpg',
  '/images/voice-room/avatar-d.jpg',
  '/images/voice-room/avatar-e.jpg',
] as const

/** 凑不满 3 个头像时随机抽取的系统头像池 */
export const LIVE_SYSTEM_AVATARS: string[] = [...AV, ...FRIEND, ...SYS_EXTRA]

export const DEFAULT_LIVE_ONLINE_CONFIG: Omit<LiveOnlineHostConfig, 'roomId'> = {
  baseCount: 1200,
  enterDelta: [1, 6],
  leaveDelta: [1, 4],
}

/** 模拟后台：每个主播一条可改配置 */
export const MOCK_LIVE_ONLINE_CONFIG: LiveOnlineHostConfig[] = [
  { roomId: 'ls-demo', baseCount: 12000, enterDelta: [3, 12], leaveDelta: [2, 8] },
  { roomId: 'ls-land-game', baseCount: 68000, enterDelta: [8, 28], leaveDelta: [5, 18] },
  { roomId: 'ls-land-esport', baseCount: 153000, enterDelta: [12, 40], leaveDelta: [8, 24] },
  { roomId: 'ls-land-outdoor', baseCount: 21000, enterDelta: [4, 16], leaveDelta: [3, 10] },
  { roomId: 'ls-land-music', baseCount: 28400, enterDelta: [5, 18], leaveDelta: [3, 12] },
  { roomId: 'd2', baseCount: 860, enterDelta: [1, 5], leaveDelta: [1, 3] },
  { roomId: 'd4', baseCount: 420, enterDelta: [1, 4], leaveDelta: [1, 3] },
  { roomId: 'voice-demo', baseCount: 430, enterDelta: [1, 5], leaveDelta: [1, 3] },
  { roomId: 'sch_20260827_88392', baseCount: 1580, enterDelta: [2, 8], leaveDelta: [1, 5] },
  { roomId: 'sch_20260828_11021', baseCount: 420, enterDelta: [1, 5], leaveDelta: [1, 3] },
]

/** 大赏排名 · 不足 3 人时顶栏用系统头像补齐 */
export const MOCK_LIVE_REWARD_RANK: Record<string, LiveRewardRankUser[]> = {
  'ls-demo': [
    { id: 'rk1', name: '艾米酱', avatar: AV[0], score: 9800 },
    { id: 'rk2', name: '别过来呀', avatar: AV[1], score: 6200 },
    { id: 'rk3', name: '春日暖阳', avatar: AV[2], score: 3100 },
  ],
  'ls-land-game': [
    { id: 'rk-g1', name: '战神小鹿', avatar: AV[2], score: 18600 },
    { id: 'rk-g2', name: '阿狸开黑', avatar: AV[3], score: 12400 },
    { id: 'rk-g3', name: '峡谷冲分', avatar: AV[1], score: 8700 },
  ],
  'ls-land-esport': [
    { id: 'rk-e1', name: '解说粉', avatar: AV[0], score: 22000 },
    { id: 'rk-e2', name: '新服先锋', avatar: AV[3], score: 15100 },
  ],
  'ls-land-outdoor': [
    { id: 'rk-o1', name: '芒果粉', avatar: AV[1], score: 5400 },
  ],
  'ls-land-music': [
    { id: 'rk-m1', name: '可可糖', avatar: AV[2], score: 9100 },
    { id: 'rk-m2', name: '夜听电台', avatar: AV[1], score: 4400 },
    { id: 'rk-m3', name: '情绪旅客', avatar: AV[3], score: 2100 },
  ],
  d2: [
    { id: 'rk-d2a', name: '民谣老友', avatar: AV[3], score: 2600 },
    { id: 'rk-d2b', name: '点歌小鹿', avatar: FRIEND[0], score: 1800 },
  ],
  d4: [{ id: 'rk-d4a', name: '树洞常客', avatar: AV[1], score: 900 }],
  'voice-demo': [
    { id: 'rk-v1', name: '麦序常客', avatar: SYS_EXTRA[1], score: 1800 },
    { id: 'rk-v2', name: '点歌达人', avatar: SYS_EXTRA[2], score: 1200 },
    { id: 'rk-v3', name: '夜听电台', avatar: SYS_EXTRA[3], score: 640 },
  ],
  sch_20260828_11021: [
    { id: 'rk-sch-v1', name: '水友一号', avatar: SYS_EXTRA[0], score: 900 },
    { id: 'rk-sch-v2', name: '解说粉', avatar: SYS_EXTRA[4], score: 520 },
  ],
}

export function getLiveOnlineConfig(roomId: string): LiveOnlineHostConfig {
  const found = MOCK_LIVE_ONLINE_CONFIG.find((item) => item.roomId === roomId)
  if (found) return found
  return { roomId, ...DEFAULT_LIVE_ONLINE_CONFIG }
}

export function getLiveRewardRank(roomId: string): LiveRewardRankUser[] {
  const list = MOCK_LIVE_REWARD_RANK[roomId] ?? []
  return [...list].sort((a, b) => b.score - a.score)
}

function formatScaled(value: number): string {
  if (value >= 10) return String(Math.round(value))
  return value.toFixed(1).replace(/\.0$/, '')
}

/** 简体 / 繁体万分制（w）；英 / 泰 / 越千分制（k） */
export function formatLiveOnlineCount(count: number, locale: AppLocale): string {
  const safe = Math.max(0, Math.floor(count))
  const useWan = locale === 'zh-CN' || locale === 'zh-TW'
  if (useWan) {
    if (safe >= 10000) return `${formatScaled(safe / 10000)}w`
    return String(safe)
  }
  if (safe >= 1000) return `${formatScaled(safe / 1000)}k`
  return String(safe)
}

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/** 大赏前三优先；凑不齐 3 个则从系统头像池随机补 */
export function pickLiveHeaderAvatars(roomId: string): string[] {
  const ranked = getLiveRewardRank(roomId)
    .map((item) => item.avatar)
    .filter(Boolean)
  const used = new Set(ranked)
  const picked = ranked.slice(0, 3)
  const pool = LIVE_SYSTEM_AVATARS.filter((src) => !used.has(src))
  while (picked.length < 3 && pool.length) {
    const idx = randInt(0, pool.length - 1)
    const next = pool.splice(idx, 1)[0]
    if (!next) break
    picked.push(next)
    used.add(next)
  }
  return picked.slice(0, 3)
}

export function nextLiveOnlineDelta(roomId: string, kind: 'enter' | 'leave'): number {
  const config = getLiveOnlineConfig(roomId)
  const [min, max] = kind === 'enter' ? config.enterDelta : config.leaveDelta
  return randInt(min, max)
}
