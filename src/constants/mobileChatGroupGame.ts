import { VOICE_ROOM_ASSETS } from './mobileVoiceRoom'

/** 社群会话 · 置顶游戏 / 右下角悬浮入口（语聊房 Figma 1729:19413 / 1729:19414） */

export const CHAT_GROUP_GAME_ASSETS = {
  linkIcon: '/images/chat-room/group-game/float-link.png',
  playFloat: '/images/chat-room/group-game/float-game.png',
  gameIcon: VOICE_ROOM_ASSETS.gameCenter,
  close: VOICE_ROOM_ASSETS.floatClose,
  gamePlay: '/images/chat-room/group-game/game-play.jpg',
  expand: '/images/chat-room/group-game/icon-expand.svg',
  playClose: '/images/chat-room/group-game/icon-play-close.svg',
  webLogo: '/images/chat-room/group-game/float-link.png',
  msgBubble: '/images/chat-room/group-game/icon-msg-bubble.png',
  menuHandle: '/images/vip-club/icon-collapse-tab.svg',
} as const

export type ChatGamePlayMode = 'sheet' | 'full' | 'pip' | 'dock'

export const CHAT_GAME_PIP = {
  width: 130,
  height: 282,
  margin: 10,
  defaultTop: 100,
  defaultRight: 20,
  collapseDy: 88,
  expandDy: -96,
  clickSlop: 8,
  homeDismissMs: 420,
} as const

/** 返回主页收起后的底部悬浮条 */
export const CHAT_GAME_DOCK = {
  height: 48,
  inset: 0,
  slot: 48,
  elapsed: '00:04',
  duration: '00:14',
  progress: 0.28,
} as const

export type ChatGroupPinnedGame = {
  id: string
  intro: string
  category: string
  gameName: string
}

export const CHAT_GROUP_PINNED_GAMES: ChatGroupPinnedGame[] = [
  {
    id: 'pin-bmw',
    intro: '群简介群简介群简介群简介群简介群简介',
    category: '迷你游戏',
    gameName: '奔驰宝马',
  },
  {
    id: 'pin-boat',
    intro: '今晚飞艇连开，群友都在跟',
    category: '迷你游戏',
    gameName: '幸运飞艇',
  },
  {
    id: 'pin-niu',
    intro: '经典牛牛，上庄下庄随到随玩',
    category: '棋牌',
    gameName: '欢乐牛牛',
  },
  {
    id: 'pin-marble',
    intro: '弹珠大战，看谁先清台',
    category: '迷你游戏',
    gameName: '欢乐弹珠',
  },
]

export const CHAT_GROUP_PINNED_GAME = CHAT_GROUP_PINNED_GAMES[0]

export const CHAT_GROUP_WEBVIEW = {
  host: 'www.google.com',
} as const

export type ChatGroupFloatKind = 'link' | 'play' | 'game'

export type ChatGroupFloatItem = {
  id: ChatGroupFloatKind
  kind: ChatGroupFloatKind
  label: string
  caption: string
}

export const CHAT_GROUP_FLOATS: ChatGroupFloatItem[] = [
  { id: 'link', kind: 'link', label: '站长推荐', caption: '站长推荐' },
  { id: 'game', kind: 'game', label: '游戏中心', caption: '游戏中心' },
]

export type ChatGameMenuActionId = 'home' | 'recharge' | 'activity' | 'service'

export type ChatGameMenuAction = {
  id: ChatGameMenuActionId
  label: string
  icon: string
}

export type ChatGameMenuCategory = {
  id: string
  label: string
  icon: string
}

const strokeIcon = (d: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`

export const CHAT_GAME_MENU_ACTIONS: ChatGameMenuAction[] = [
  {
    id: 'home',
    label: '返回主页',
    icon: strokeIcon('<path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.4Z"/>'),
  },
  {
    id: 'recharge',
    label: '充值',
    icon: strokeIcon(
      '<path d="M8.2 9.2c0-2.1 1.7-3.6 3.8-3.6s3.8 1.5 3.8 3.6"/><ellipse cx="12" cy="14.6" rx="6.2" ry="4.6"/><path d="M10.6 14.2h2.8M12 12.8v2.8"/><path d="M9.4 8.2h5.2"/>',
    ),
  },
  {
    id: 'activity',
    label: '活动中心',
    icon: strokeIcon(
      '<path d="M8 8.4h8l1.6 3H6.4L8 8.4Z"/><path d="M6.4 11.4h11.2v8.2a1.4 1.4 0 0 1-1.4 1.4H7.8a1.4 1.4 0 0 1-1.4-1.4v-8.2Z"/><path d="M12 11.4v9.6"/><path d="M9.2 5.6 8 8.4M14.8 5.6 16 8.4"/>',
    ),
  },
  {
    id: 'service',
    label: '专属客服',
    icon: strokeIcon(
      '<path d="M7.2 12a4.8 4.8 0 0 1 9.6 0"/><rect x="4.8" y="11.4" width="3.2" height="5.4" rx="1.4"/><rect x="16" y="11.4" width="3.2" height="5.4" rx="1.4"/><path d="M8 17.4v.8A3.2 3.2 0 0 0 11.2 21h1.6"/>',
    ),
  },
]

export const CHAT_GAME_MENU_CATEGORIES: ChatGameMenuCategory[] = [
  { id: 'sports', label: '体育', icon: strokeIcon('<circle cx="12" cy="12" r="7.6"/><path d="M12 4.4v15.2M4.4 12h15.2M6.4 7.2c2.2 1.8 3.6 4.8 5.6 4.8s3.4-3 5.6-4.8M6.4 16.8c2.2-1.8 3.6-4.8 5.6-4.8s3.4 3 5.6 4.8"/>') },
  { id: 'live', label: '真人', icon: strokeIcon('<rect x="4.6" y="6.2" width="9" height="12.2" rx="1.2" transform="rotate(-12 9.1 12.3)"/><rect x="10.2" y="6.6" width="9" height="12.2" rx="1.2"/><path d="M13.2 10.4h4.2M13.2 13.4h3"/>') },
  { id: 'lottery', label: '彩票', icon: strokeIcon('<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="2.4"/><path d="M12 4.4v2.4M12 17.2v2.4M4.4 12h2.4M17.2 12h2.4M6.8 6.8l1.6 1.6M15.6 15.6l1.6 1.6M17.2 6.8l-1.6 1.6M8.4 15.6l-1.6 1.6"/>') },
  { id: 'slots', label: '电子', icon: strokeIcon('<rect x="5.4" y="4.6" width="13.2" height="15.6" rx="2"/><path d="M8.2 8.4h7.6M8.2 12h7.6M8.2 15.6h4.6"/><circle cx="16.2" cy="15.6" r=".8" fill="currentColor" stroke="none"/>') },
  { id: 'fun', label: '趣投', icon: strokeIcon('<path d="M6.4 16.8 11.2 5.4l2.2 4.2 4.2-1.4-3.4 8.6"/><path d="M11.2 5.4 9.6 9.2l3.8.4"/><path d="M7.6 18.6h8.8"/>') },
  { id: 'marble', label: '弹珠', icon: strokeIcon('<path d="M8.4 16.8 12 5.6l3.6 11.2"/><path d="M9.4 13.6h5.2"/><path d="M7.4 18.4h9.2l-1.4-2.4H8.8L7.4 18.4Z"/>') },
  { id: 'scratch', label: '刮刮乐', icon: strokeIcon('<rect x="5" y="6" width="14" height="12.4" rx="1.6"/><path d="M8 9.6 10.2 12 8 14.4M13.2 10.4h3.4M13.2 13.6h2.4"/>') },
  { id: 'fish', label: '捕鱼', icon: strokeIcon('<path d="M4.6 12s3.2-5.4 8.2-5.4 6.6 2.2 6.6 5.4-1.6 5.4-6.6 5.4S4.6 12 4.6 12Z"/><circle cx="9.2" cy="11" r=".9" fill="currentColor" stroke="none"/><path d="M19.6 12h-2.4M18.4 9.6l1.6-1.4M18.4 14.4l1.6 1.4"/>') },
  { id: 'card', label: '棋牌', icon: strokeIcon('<rect x="4.8" y="8.4" width="6.8" height="6.8" rx="1"/><circle cx="16.2" cy="9.4" r="2.4"/><circle cx="16.8" cy="15.2" r="2.8"/>') },
  { id: 'esport', label: '电竞', icon: strokeIcon('<path d="M5.2 13.2h3.2l1.2-2.2h5.2l1.2 2.2H18.8a1.6 1.6 0 0 1 1.6 1.6v1.4a2 2 0 0 1-2 2h-2.2l-1.2 2.2H9.8L8.6 18.2H6.4a2 2 0 0 1-2-2v-1.4a1.6 1.6 0 0 1 1.6-1.6Z"/><path d="M9.2 15.2h.01M14.8 15.2h.01"/>') },
]
