/** 发现页 · 语聊房房间 Mock（Figma 515:63984） */

export const VOICE_ROOM_ASSETS = {
  bg: '/images/voice-room/bg.png',
  plus: '/images/voice-room/icon-plus.svg',
  chair: '/images/voice-room/icon-chair.svg',
  lock: '/images/voice-room/icon-lock.svg',
  mic: '/images/voice-room/icon-mic.svg',
  mute: '/images/voice-room/icon-mute.svg',
  wave: '/images/voice-room/icon-wave.svg',
  gameFloat: '/images/voice-room/game-float.png',
  gameCenter: '/images/voice-room/game-center.png',
  gameBar: '/images/voice-room/icon-game.svg',
  gameIcon: '/images/voice-room/game-icon.png',
  sheetClose: '/images/voice-room/icon-sheet-close.svg',
  liveTag: '/images/voice-room/icon-live-tag.svg',
  floatClose: '/images/voice-room/float-close.svg',
  close: '/images/live-stream/icon-close.svg',
  emoji: '/images/live-stream/icon-emoji.svg',
  gift: '/images/live-stream/gift-icon.svg',
  more: '/images/live-stream/icon-more.svg',
  giftThumb: '/images/live-stream/gift-thumb.svg',
  avatars: [
    '/images/voice-room/avatar-a.jpg',
    '/images/voice-room/avatar-b.jpg',
    '/images/voice-room/avatar-c.jpg',
    '/images/voice-room/avatar-d.jpg',
    '/images/voice-room/avatar-e.jpg',
  ] as const,
} as const

export type VoiceMicSeat =
  | {
      id: string
      kind: 'user'
      name: string
      avatar: string
      badge?: 'host' | 'admin' | 'god'
      mic: 'speaking' | 'on' | 'mute'
    }
  | { id: string; kind: 'empty'; micIndex: number }
  | { id: string; kind: 'locked' }

export type VoiceRoomMsg =
  | { id: string; type: 'win'; user: string; amount: string }
  | { id: string; type: 'system'; text: string; action?: string }
  | { id: string; type: 'chat'; user: string; text: string; tag?: string }
  | { id: string; type: 'gift'; user: string; gift: string }

export const MOCK_VOICE_MIC_SEATS: VoiceMicSeat[] = [
  {
    id: 'm1',
    kind: 'user',
    name: '好运常来常...',
    avatar: VOICE_ROOM_ASSETS.avatars[1],
    badge: 'host',
    mic: 'speaking',
  },
  {
    id: 'm2',
    kind: 'user',
    name: '用户名称',
    avatar: VOICE_ROOM_ASSETS.avatars[2],
    mic: 'mute',
  },
  {
    id: 'm3',
    kind: 'user',
    name: '主播名称',
    avatar: VOICE_ROOM_ASSETS.avatars[0],
    mic: 'speaking',
  },
  {
    id: 'm4',
    kind: 'user',
    name: '好asdk',
    avatar: VOICE_ROOM_ASSETS.avatars[3],
    badge: 'admin',
    mic: 'on',
  },
  {
    id: 'm5',
    kind: 'user',
    name: 'DAJLKS...',
    avatar: VOICE_ROOM_ASSETS.avatars[1],
    badge: 'admin',
    mic: 'speaking',
  },
  { id: 'm6', kind: 'empty', micIndex: 6 },
  { id: 'm7', kind: 'locked' },
  { id: 'm8', kind: 'empty', micIndex: 7 },
]

export const MOCK_VOICE_GIFTS = [
  {
    id: 'vg1',
    user: '艾米酱',
    action: '送小心心',
    count: 'x15',
    avatar: VOICE_ROOM_ASSETS.avatars[3],
  },
  {
    id: 'vg2',
    user: '别过来呀',
    action: '送跑车',
    count: 'x1',
    avatar: VOICE_ROOM_ASSETS.avatars[4],
  },
]

export const MOCK_VOICE_MESSAGES: VoiceRoomMsg[] = [
  { id: 'vm1', type: 'win', user: '春日暖阳', amount: '100KKC' },
  {
    id: 'vm2',
    type: 'system',
    text: '系统开奖提醒：本期结果已公布，可一键跟投',
    action: '跟投',
  },
  { id: 'vm3', type: 'chat', user: 'KK仔', text: '声音好听，继续唱！', tag: 'VIP' },
  { id: 'vm4', type: 'gift', user: 'jerry酱', gift: '小心心 *15' },
  { id: 'vm5', type: 'chat', user: '李小白', text: '求点民谣《成都》' },
]

/** 语聊房 · 游戏中心（Figma 1729:19179） */
export type VoiceGameTab = 'hot' | 'fun' | 'marble' | 'scratch'

export const VOICE_GAME_TABS: { key: VoiceGameTab; label: string }[] = [
  { key: 'hot', label: '热门' },
  { key: 'fun', label: '趣投' },
  { key: 'marble', label: '弹珠' },
  { key: 'scratch', label: '刮刮乐' },
]

export type VoiceGameItem = {
  id: string
  name: string
  icon: string
  live?: boolean
  tabs: VoiceGameTab[]
}

export const MOCK_VOICE_GAMES: VoiceGameItem[] = [
  {
    id: 'g1',
    name: '奔驰宝马',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    live: true,
    tabs: ['hot', 'fun'],
  },
  {
    id: 'g2',
    name: '幸运飞艇',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'fun'],
  },
  {
    id: 'g3',
    name: '游戏名称游戏名称游戏名称游戏名称游戏名称游戏名称',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'marble'],
  },
  {
    id: 'g4',
    name: '游戏名称游戏名称',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'scratch'],
  },
  {
    id: 'g5',
    name: '欢乐弹珠',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'marble'],
  },
  {
    id: 'g6',
    name: '刮刮乐达人',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'scratch'],
  },
  {
    id: 'g7',
    name: '趣味竞猜',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'fun'],
  },
  {
    id: 'g8',
    name: '金牌弹珠',
    icon: VOICE_ROOM_ASSETS.gameIcon,
    tabs: ['hot', 'marble'],
  },
]

export function filterVoiceGames(tab: VoiceGameTab): VoiceGameItem[] {
  return MOCK_VOICE_GAMES.filter((game) => game.tabs.includes(tab))
}
