import { LOBBY_ASSETS } from './mobileLobbyAssets'

export type LobbyMode = 'social' | 'traditional'
export type LobbyCategory = 'hot' | 'live' | 'community' | 'card'
export type GameTagType = 'group' | 'live' | 'pk'

export type LobbyGame = {
  id: string
  title: string
  cover: string
  tag: { label: string; type: GameTagType }
  favorited?: boolean
}

export const LOBBY_ANNOUNCEMENT =
  '首存优惠 / 每日签到 / PG 奖上加奖 / 分享好友 同赚彩金! / 反馈有礼 / 首存优惠 / 每日签到'

export const LOBBY_MODES: { key: LobbyMode; label: string; icon: string }[] = [
  { key: 'social', label: '社交模式', icon: LOBBY_ASSETS.modeSocial },
  { key: 'traditional', label: '传统模式', icon: LOBBY_ASSETS.modeTraditional },
]

export const LOBBY_CATEGORIES: {
  key: LobbyCategory
  label: string
  icon: string
}[] = [
  { key: 'hot', label: '热门', icon: LOBBY_ASSETS.catHot },
  { key: 'live', label: '直播间', icon: LOBBY_ASSETS.catLive },
  { key: 'community', label: '社群', icon: LOBBY_ASSETS.catCommunity },
  { key: 'card', label: '牌局', icon: LOBBY_ASSETS.catCard },
]

export const LOBBY_CATEGORY_EMPTY: Record<LobbyCategory, { emoji: string; title: string; desc: string }> = {
  hot: { emoji: '🔥', title: '暂无热门内容', desc: '精彩游戏即将上线，敬请期待。' },
  live: { emoji: '📺', title: '暂无游戏直播', desc: '当前没有进行中的游戏直播。' },
  community: { emoji: '👥', title: '暂无游戏群聊', desc: '还没有可加入的游戏社群。' },
  card: { emoji: '🃏', title: '暂无牌局', desc: '牌局房间筹备中，稍后再来看看。' },
}

export function gamesForCategory(category: LobbyCategory): LobbyGame[] {
  if (category === 'hot') return LOBBY_GAMES
  if (category === 'live') return LOBBY_GAMES.filter((g) => g.tag.type === 'live')
  if (category === 'community') return LOBBY_GAMES.filter((g) => g.tag.type === 'group')
  return []
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

export const LOBBY_WALLET = {
  currency: 'KKC',
  balance: '0.00',
}
