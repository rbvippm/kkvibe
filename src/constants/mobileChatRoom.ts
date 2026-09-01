import {
  CHAT_FILE_MOCK_ITEMS,
  type ChatFileAttachment,
  type ChatFileDownloadStatus,
} from './mobileChatFileSend'
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

/** 本人媒体气泡发送态：上传中 / 失败 / 已送达 */
export type ChatMediaSendStatus = 'sending' | 'failed' | 'sent'

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
  sendStatus?: ChatMediaSendStatus
  /** 上传进度 0–100，仅 sending */
  uploadProgress?: number
  /** WhatsApp 风格原始文件气泡 */
  file?: ChatFileAttachment
  /** 对方文件 / 多图下载态：待下 / 下载中 / 已完成 / 失败 / 超限不可下 */
  downloadStatus?: ChatFileDownloadStatus
  /** 下载进度 0–100，仅 downloading */
  downloadProgress?: number
}

/** 气泡内媒体总张数（含宫格溢出的 +N） */
export function chatMediaItemCount(msg: ChatRoomMessage) {
  return msg.media.length + (msg.extraCount ?? 0)
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
    {
      id: 'm-upload',
      direction: 'sent',
      time: '22:01',
      read: false,
      layout: '5-plus',
      media: pick(4, 0),
      extraCount: 3,
      text: 'ok',
      sendStatus: 'sending',
      uploadProgress: 25,
      caption: '多图 · 上传中',
    },
    {
      id: 'm-fail',
      direction: 'sent',
      time: '22:03',
      read: false,
      layout: '5-plus',
      media: pick(4, 1),
      extraCount: 2,
      sendStatus: 'failed',
      caption: '多图 · 发送失败',
    },
    {
      id: 'm-dlfail',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '22:05',
      layout: '5-plus',
      media: pick(4, 3),
      extraCount: 2,
      downloadStatus: 'failed',
      caption: '多图 · 下载失败',
    },
    {
      id: 'm-file',
      direction: 'sent',
      time: '17:25',
      read: true,
      layout: '1-square',
      media: [],
      text: 'ok',
      sendStatus: 'sent',
      file: CHAT_FILE_MOCK_ITEMS[2],
    },
    {
      id: 'm-file-fail',
      direction: 'sent',
      time: '17:28',
      read: false,
      layout: '1-square',
      media: [],
      text: '请看这表',
      sendStatus: 'failed',
      file: CHAT_FILE_MOCK_ITEMS[4],
    },
    {
      id: 'm-file-recv',
      direction: 'received',
      senderName: '刘世豪5122',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '17:30',
      layout: '1-square',
      media: [],
      text: '方案在这里',
      downloadStatus: 'done',
      file: CHAT_FILE_MOCK_ITEMS[1],
    },
    {
      id: 'm-file-recv-large',
      direction: 'received',
      senderName: '骄傲的鸭子',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '17:31',
      layout: '1-square',
      media: [],
      downloadStatus: 'pending',
      file: CHAT_FILE_MOCK_ITEMS[5],
    },
    {
      id: 'm-file-recv-dlfail',
      direction: 'received',
      senderName: '肖虎',
      avatar: CHAT_ROOM_ASSETS.avatar,
      time: '17:32',
      layout: '1-square',
      media: [],
      text: '集锦有点大',
      downloadStatus: 'failed',
      file: CHAT_FILE_MOCK_ITEMS[6],
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

const UNREAD_HISTORY_TEXTS = [
  '在吗',
  '好的',
  '收到',
  '稍等一下',
  '晚上见',
  '这波稳了',
  '看回放',
  '发我一下',
  '没问题',
  '先这样',
]

const UNREAD_FILL_TEXTS = [
  '刚看到消息',
  '这局可以冲',
  '比分出来了',
  '晚上有空吗',
  '发张图我看看',
  '群里有人问',
  '我这边没问题',
  '等下同步',
]

const UNREAD_SENDERS = ['刘世豪5122', '骄傲的鸭子', '肖虎']

function makeHistoryMessage(
  id: string,
  text: string,
  index: number,
  kind: ChatRoomKind,
  time: string,
): ChatRoomMessage {
  const received = index % 3 !== 0
  return {
    id,
    direction: received ? 'received' : 'sent',
    senderName: received && kind === 'group' ? UNREAD_SENDERS[index % UNREAD_SENDERS.length] : undefined,
    avatar: received && kind === 'group' ? CHAT_ROOM_ASSETS.avatar : undefined,
    time,
    read: !received,
    layout: '1-square',
    media: [],
    text,
  }
}

/**
 * 未读较多时在现有演示气泡前垫历史，保证入房停在底部后「第一条未读」仍在视口上方。
 * 角标用真实未读数；气泡只生成够滚动的条数，避免铺 100 张图。
 */
export function attachChatUnreadHistory(
  base: ChatRoomMessage[],
  kind: ChatRoomKind,
  unreadCount: number,
): { messages: ChatRoomMessage[]; firstUnreadId: string | null } {
  if (unreadCount <= 0) {
    return { messages: base, firstUnreadId: null }
  }

  const readHistory = Array.from({ length: 16 }, (_, index) =>
    makeHistoryMessage(
      `hist-read-${index}`,
      UNREAD_HISTORY_TEXTS[index % UNREAD_HISTORY_TEXTS.length]!,
      index,
      kind,
      '昨天 21:08',
    ),
  )
  const unreadFill = Array.from({ length: 28 }, (_, index) =>
    makeHistoryMessage(
      `hist-unread-${index}`,
      UNREAD_FILL_TEXTS[index % UNREAD_FILL_TEXTS.length]!,
      index + 1,
      kind,
      '今天 09:16',
    ),
  )
  const firstUnreadId = unreadFill[0]?.id ?? base[0]?.id ?? null
  return {
    messages: [...readHistory, ...unreadFill, ...base],
    firstUnreadId,
  }
}

export function formatUnreadJumpLabel(count: number) {
  if (count <= 0) return ''
  const n = count > 999 ? '999+' : String(count)
  return `${n}条未读`
}

export function getChatRoomDemo(id?: string): ChatRoomDemo {
  if (id === CHAT_ROOM_DIRECT_DEMO.id) return CHAT_ROOM_DIRECT_DEMO
  if (id === CHAT_ROOM_H5_ARTICLE_DEMO.id) return CHAT_ROOM_H5_ARTICLE_DEMO
  return CHAT_ROOM_GROUP_DEMO
}
