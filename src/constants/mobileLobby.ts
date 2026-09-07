import { LOBBY_ASSETS } from './mobileLobbyAssets'

export type LobbyMode = 'social' | 'traditional'
export type LobbySocialCategory = 'hot' | 'live' | 'community' | 'card'
export type LobbyTraditionalCategory = 'hot' | 'sports' | 'casino' | 'lottery'
export type LobbyCategory = LobbySocialCategory | LobbyTraditionalCategory
export type GameTagType = 'group' | 'live' | 'pk'

export type LobbyGamePlay = {
  kind: 'sports' | 'live' | 'slot' | 'lottery'
  id?: string
}

export type LobbyGame = {
  id: string
  title: string
  cover: string
  brand?: string
  tag?: { label: string; type: GameTagType }
  play?: LobbyGamePlay
  featured?: boolean
  favorited?: boolean
}

export const LOBBY_ANNOUNCEMENT =
  '首存优惠 / 每日签到 / PG 奖上加奖 / 分享好友 同赚彩金! / 反馈有礼 / 首存优惠 / 每日签到'

export const LOBBY_MODES: { key: LobbyMode; label: string; icon: string }[] = [
  { key: 'social', label: '社交模式', icon: LOBBY_ASSETS.modeSocial },
  { key: 'traditional', label: '传统模式', icon: LOBBY_ASSETS.modeTraditional },
]

export const LOBBY_CATEGORIES: {
  key: LobbySocialCategory
  label: string
  icon: string
}[] = [
  { key: 'hot', label: '热门', icon: LOBBY_ASSETS.catHot },
  { key: 'live', label: '直播间', icon: LOBBY_ASSETS.catLive },
  { key: 'community', label: '社群', icon: LOBBY_ASSETS.catCommunity },
  { key: 'card', label: '牌局', icon: LOBBY_ASSETS.catCard },
]

export const LOBBY_TRADITIONAL_CATEGORIES: {
  key: LobbyTraditionalCategory
  label: string
  icon: string
}[] = [
  { key: 'hot', label: '热门', icon: LOBBY_ASSETS.catHot },
  { key: 'sports', label: '体育', icon: LOBBY_ASSETS.catSports },
  { key: 'casino', label: '真人', icon: LOBBY_ASSETS.catCasino },
  { key: 'lottery', label: '彩票', icon: LOBBY_ASSETS.catLottery },
]

export const LOBBY_CATEGORY_EMPTY: Record<LobbySocialCategory, { emoji: string; title: string; desc: string }> = {
  hot: { emoji: '🔥', title: '暂无热门内容', desc: '精彩游戏即将上线，敬请期待。' },
  live: { emoji: '📺', title: '暂无游戏直播', desc: '当前没有进行中的游戏直播。' },
  community: { emoji: '👥', title: '暂无游戏群聊', desc: '还没有可加入的游戏社群。' },
  card: { emoji: '🃏', title: '暂无牌局', desc: '牌局房间筹备中，稍后再来看看。' },
}

export const LOBBY_TRADITIONAL_EMPTY: Record<
  LobbyTraditionalCategory,
  { emoji: string; title: string; desc: string }
> = {
  hot: { emoji: '🎮', title: '暂无热门游戏', desc: '热门场馆即将上线，敬请期待。' },
  sports: { emoji: '⚽', title: '暂无体育场馆', desc: '体育赛事筹备中，稍后再来看看。' },
  casino: { emoji: '🃏', title: '暂无真人游戏', desc: '真人场馆维护中，稍后再来看看。' },
  lottery: { emoji: '🎰', title: '暂无彩票玩法', desc: '彩票玩法即将上线，敬请期待。' },
}

export function categoriesForMode(mode: LobbyMode) {
  return mode === 'traditional' ? LOBBY_TRADITIONAL_CATEGORIES : LOBBY_CATEGORIES
}

export function gamesForCategory(category: LobbyCategory, mode: LobbyMode = 'social'): LobbyGame[] {
  if (mode === 'traditional') {
    if (category === 'hot') return LOBBY_TRADITIONAL_GAMES.filter((g) => g.featured)
    if (category === 'sports') return LOBBY_TRADITIONAL_GAMES.filter((g) => g.play?.kind === 'sports')
    if (category === 'casino') return LOBBY_TRADITIONAL_GAMES.filter((g) => g.play?.kind === 'live')
    if (category === 'lottery') return LOBBY_TRADITIONAL_GAMES.filter((g) => g.play?.kind === 'lottery')
    return []
  }
  if (category === 'hot') return LOBBY_GAMES
  if (category === 'live') return LOBBY_GAMES.filter((g) => g.tag?.type === 'live')
  if (category === 'community') return LOBBY_GAMES.filter((g) => g.tag?.type === 'group')
  return []
}

export function emptyForCategory(category: LobbyCategory, mode: LobbyMode) {
  if (mode === 'traditional') {
    return LOBBY_TRADITIONAL_EMPTY[category as LobbyTraditionalCategory] ?? LOBBY_TRADITIONAL_EMPTY.hot
  }
  return LOBBY_CATEGORY_EMPTY[category as LobbySocialCategory] ?? LOBBY_CATEGORY_EMPTY.hot
}

export const LOBBY_FEATURED_BANNER = {
  title: '弹珠世界大战',
  status: '正火热进行中',
  subtitle: '世界大战=玩家PK玩家',
  year: '2026',
}

export const LOBBY_GAMES: LobbyGame[] = [
  {
    id: 'g1',
    title: '弹珠世界大战',
    cover: '/images/lobby/game-marble-war.svg',
    tag: { label: '游戏群聊', type: 'group' },
  },
  {
    id: 'g2',
    title: '牛牛大战',
    cover: '/images/lobby/game-niuniu.svg',
    tag: { label: '游戏群聊', type: 'group' },
  },
  {
    id: 'g3',
    title: '一分快三',
    cover: '/images/lobby/game-kuai3.svg',
    tag: { label: '游戏直播', type: 'live' },
  },
  {
    id: 'g4',
    title: '魔幻弹珠',
    cover: '/images/lobby/game-magic-marble.svg',
    tag: { label: '游戏群聊', type: 'group' },
  },
  {
    id: 'g5',
    title: '龙虎斗 PK',
    cover: '/images/lobby/game-pk-1.svg',
    tag: { label: '游戏PK', type: 'pk' },
  },
  {
    id: 'g6',
    title: '百家乐 PK',
    cover: '/images/lobby/game-pk-2.svg',
    tag: { label: '游戏PK', type: 'pk' },
  },
]

export const LOBBY_TRADITIONAL_GAMES: LobbyGame[] = [
  {
    id: 't-kk-sports',
    title: '金刚P2P体育',
    cover: '/images/vip-club/game-sports.png',
    brand: LOBBY_ASSETS.logoMark,
    play: { kind: 'sports' },
    featured: true,
  },
  {
    id: 't-im-sports',
    title: 'IM 体育',
    cover: '/images/lobby/game-im-sports.svg',
    brand: '/images/vip-club/sports/logo.png',
    play: { kind: 'sports' },
    featured: true,
  },
  {
    id: 't-ag-live',
    title: 'CHOICE(AG)真人',
    cover: '/images/vip-club/game-live.png',
    brand: '/images/vip-club/vendors/huali-logo.png',
    play: { kind: 'live', id: 'huali-live' },
    featured: true,
  },
  {
    id: 't-evo-live',
    title: 'EVO 真人',
    cover: '/images/vip-club/game-live.png',
    brand: '/images/vip-club/vendors/db-logo.png',
    play: { kind: 'live', id: 'db-live' },
    featured: true,
  },
  {
    id: 't-mahjong',
    title: '麻将胡了',
    cover: '/images/vip-club/game-slot.png',
    brand: '/images/vip-club/vendors/pg-logo.png',
    play: { kind: 'slot', id: 'pg' },
    featured: true,
  },
  {
    id: 't-mahjong-2',
    title: '麻将胡了2',
    cover: '/images/vip-club/game-slot.png',
    brand: '/images/vip-club/vendors/pp-logo.png',
    play: { kind: 'slot', id: 'pp' },
    featured: true,
  },
  {
    id: 't-db-live',
    title: 'DB 真人',
    cover: '/images/vip-club/game-live.png',
    brand: '/images/vip-club/vendors/db-logo.png',
    play: { kind: 'live', id: 'db-live' },
  },
  {
    id: 't-pa-live',
    title: 'PA 真人',
    cover: '/images/vip-club/game-live.png',
    brand: '/images/vip-club/vendors/pa-logo.png',
    play: { kind: 'live', id: 'pa-live' },
  },
  {
    id: 't-lottery',
    title: '皇者彩票',
    cover: '/images/vip-club/game-lottery.png',
    brand: '/images/vip-club/lottery/logo.svg',
    play: { kind: 'lottery', id: 'ssc' },
  },
]

export const LOBBY_WALLET = {
  currency: 'KKC',
  balance: '50,000.00',
}

export type LobbyCurrencyId = 'kkc' | 'kkv' | 'usdt' | 'cny' | 'usd'

export type LobbyCurrencyOption = {
  id: LobbyCurrencyId
  name: string
  symbol: string
  color: string
  balance: number
  /** 信用额度币种，仅限特定游戏使用 */
  isCredit?: boolean
}

export const LOBBY_CURRENCY_OPTIONS: LobbyCurrencyOption[] = [
  { id: 'kkc', name: 'KKC', symbol: 'K', color: '#22c55e', balance: 50000 },
  { id: 'kkv', name: 'KKV', symbol: 'V', color: '#ec4899', balance: 12880.5 },
  { id: 'usdt', name: 'USDT', symbol: '₮', color: '#26a17b', balance: 8652.3 },
  { id: 'cny', name: 'CNY', symbol: '¥', color: '#ff7a2b', balance: 50000, isCredit: true },
  { id: 'usd', name: 'USD', symbol: '$', color: '#3b82f6', balance: 1280.5, isCredit: true },
]

export const LOBBY_CASH_CURRENCY_OPTIONS = LOBBY_CURRENCY_OPTIONS.filter((item) => !item.isCredit)

export const LOBBY_CREDIT_CURRENCY_OPTIONS = LOBBY_CURRENCY_OPTIONS.filter((item) => item.isCredit)

export function formatLobbyCurrencyBalance(amount: number) {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const LOBBY_HALL_SWITCH_HINT_KEY = 'kkvibe.hint.vipHallSwitch'

/** 会员是否持有可用信用额度（CNY / USD） */
export function memberHasCreditLimit() {
  return LOBBY_CURRENCY_OPTIONS.some((item) => item.isCredit && item.balance > 0)
}

export function hasSeenLobbyHallSwitchHint() {
  try {
    return localStorage.getItem(LOBBY_HALL_SWITCH_HINT_KEY) === '1'
  } catch {
    return false
  }
}

export function markLobbyHallSwitchHintSeen() {
  try {
    localStorage.setItem(LOBBY_HALL_SWITCH_HINT_KEY, '1')
  } catch {
    /* ignore */
  }
}
