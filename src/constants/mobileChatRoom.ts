import { CHAT_ROOM_ASSETS } from './mobileChatRoomAssets'

/** 「+」更多面板入口 · Figma 1290:17404 */
export const CHAT_ROOM_PLUS_ACTIONS = [
  { key: 'photo', label: '照片', icon: CHAT_ROOM_ASSETS.plusActions.photo },
  { key: 'camera', label: '相机', icon: CHAT_ROOM_ASSETS.plusActions.camera },
  { key: 'transfer', label: '转账', icon: CHAT_ROOM_ASSETS.plusActions.transfer },
  { key: 'location', label: '定位', icon: CHAT_ROOM_ASSETS.plusActions.location },
  { key: 'gift', label: '送礼', icon: CHAT_ROOM_ASSETS.plusActions.gift },
  { key: 'file', label: '文件', icon: CHAT_ROOM_ASSETS.plusActions.file },
  { key: 'contact', label: '联系人', icon: CHAT_ROOM_ASSETS.plusActions.contact },
  { key: 'favorite', label: '收藏', icon: CHAT_ROOM_ASSETS.plusActions.favorite },
] as const

/** 多图布局类型 · 对齐 Figma Caption */
export type ChatImageLayout =
  | '1-portrait'
  | '1-landscape'
  | '1-square'
  | '2-landscape'
  | '2-portrait'
  | '2-mixed'
  | '3-landscape-first'
  | '3-portrait-first'
  | '4-grid'
  | '5-plus'

export type ChatRoomKind = 'direct' | 'group'

export type ChatMediaItem = {
  src: string
  isVideo?: boolean
  duration?: string
}

export type ChatRoomMessage = {
  id: string
  direction: 'received' | 'sent'
  senderName?: string
  avatar?: string
  time: string
  read?: boolean
  layout: ChatImageLayout
  media: ChatMediaItem[]
  /** >4 张时末格 +N */
  extraCount?: number
  /** 布局演示标注（非用户配文） */
  caption?: string
  /** 用户配文 */
  text?: string
}

/** 按选中张数推断气泡布局 */
export function layoutForMediaCount(count: number): ChatImageLayout {
  if (count <= 1) return '1-square'
  if (count === 2) return '2-portrait'
  if (count === 3) return '3-landscape-first'
  if (count === 4) return '4-grid'
  return '5-plus'
}

export type ChatRoomDemo = {
  id: string
  kind: ChatRoomKind
  title: string
  avatar: string
  messages: ChatRoomMessage[]
}

const M = CHAT_ROOM_ASSETS.media

function pick(count: number, offset = 0): ChatMediaItem[] {
  return Array.from({ length: count }, (_, i) => ({
    src: M[(offset + i) % M.length],
    isVideo: i === 0 && count <= 3,
    duration: i === 0 && count <= 3 ? '0:04' : undefined,
  }))
}

/** 群聊演示：覆盖全部多图布局 */
export const CHAT_ROOM_GROUP_DEMO: ChatRoomDemo = {
  id: 'group-demo',
  kind: 'group',
  title: '群群群組',
  avatar: CHAT_ROOM_ASSETS.avatar,
  messages: [
    {
      id: 'm1',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '14:40',
      layout: '1-portrait',
      media: pick(1, 0),
      caption: '1 张 · 竖屏',
    },
    {
      id: 'm2',
      direction: 'sent',
      time: '14:40',
      read: true,
      layout: '1-portrait',
      media: [{ src: M[1] }],
    },
    {
      id: 'm3',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '14:41',
      layout: '1-landscape',
      media: pick(1, 2),
      caption: '1 张 · 横屏',
    },
    {
      id: 'm4',
      direction: 'sent',
      time: '14:41',
      read: true,
      layout: '1-square',
      media: [{ src: M[3] }],
      caption: '1 张 · 方图',
    },
    {
      id: 'm5',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '14:42',
      layout: '2-landscape',
      media: pick(2, 0),
      caption: '2 张 · 双横屏',
    },
    {
      id: 'm6',
      direction: 'sent',
      time: '14:42',
      read: true,
      layout: '2-portrait',
      media: [
        { src: M[2] },
        { src: M[4] },
      ],
      caption: '2 张 · 双竖屏',
    },
    {
      id: 'm7',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '14:43',
      layout: '2-mixed',
      media: [
        { src: M[1], isVideo: true, duration: '0:04' },
        { src: M[3] },
      ],
      caption: '2 张 · 一横一竖',
    },
    {
      id: 'm8',
      direction: 'sent',
      time: '14:43',
      read: true,
      layout: '3-landscape-first',
      media: pick(3, 1),
      caption: '3 张 · 首图横/方',
    },
    {
      id: 'm9',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '14:44',
      layout: '3-portrait-first',
      media: [
        { src: M[0] },
        { src: M[2] },
        { src: M[4] },
      ],
      caption: '3 张 · 首图竖',
    },
    {
      id: 'm10',
      direction: 'sent',
      time: '14:44',
      read: true,
      layout: '4-grid',
      media: pick(4, 0),
      caption: '4 张 · 宫格',
    },
    {
      id: 'm11',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '14:45',
      layout: '5-plus',
      media: pick(4, 1),
      extraCount: 2,
      caption: '5 张及以上 · 宫格 +N',
    },
    {
      id: 'm12',
      direction: 'sent',
      time: '14:45',
      read: true,
      layout: '5-plus',
      media: pick(4, 2),
      extraCount: 6,
    },
  ],
}

/** 单聊演示 */
export const CHAT_ROOM_DIRECT_DEMO: ChatRoomDemo = {
  id: 'direct-demo',
  kind: 'direct',
  title: '林晓晴',
  avatar: CHAT_ROOM_ASSETS.avatar,
  messages: CHAT_ROOM_GROUP_DEMO.messages.map((m) => ({
    ...m,
    senderName: undefined,
    avatar: undefined,
  })),
}

/** 单聊演示 · 会话列表「h5图文入口」（业务同单聊，仅标题不同） */
export const CHAT_ROOM_H5_ARTICLE_DEMO: ChatRoomDemo = {
  id: 'h5-article-demo',
  kind: 'direct',
  title: 'h5图文入口',
  avatar: '/images/chat/avatar-h5-article.svg',
  messages: CHAT_ROOM_GROUP_DEMO.messages.map((m) => ({
    ...m,
    senderName: undefined,
    avatar: undefined,
  })),
}

export const CHAT_ROOM_MENU_ACTIONS = [
  { key: 'reply', label: '回复', icon: CHAT_ROOM_ASSETS.reply, danger: false },
  { key: 'copy', label: '复制', icon: CHAT_ROOM_ASSETS.copy, danger: false },
  { key: 'forward', label: '转发', icon: CHAT_ROOM_ASSETS.forward, danger: false },
  { key: 'star', label: '收藏', icon: CHAT_ROOM_ASSETS.star, danger: false },
  { key: 'delete', label: '删除', icon: CHAT_ROOM_ASSETS.trash, danger: true },
  { key: 'multi', label: '多选', icon: CHAT_ROOM_ASSETS.multi, danger: false },
  { key: 'pin', label: '置顶', icon: CHAT_ROOM_ASSETS.pin, danger: false },
] as const

export const CHAT_ROOM_REACTIONS = ['👍', '❤️', '😄', '😭', '🎉'] as const

export function getChatRoomDemo(id?: string): ChatRoomDemo {
  if (id === CHAT_ROOM_DIRECT_DEMO.id) return CHAT_ROOM_DIRECT_DEMO
  if (id === CHAT_ROOM_H5_ARTICLE_DEMO.id) return CHAT_ROOM_H5_ARTICLE_DEMO
  return CHAT_ROOM_GROUP_DEMO
}
