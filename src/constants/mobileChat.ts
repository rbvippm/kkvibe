import { reactive } from 'vue'
import { CHAT_ASSETS } from './mobileChatAssets'

export type ChatFilter = 'all' | 'direct' | 'group' | 'community'

/** 会话列表末条预览 · 媒体图标 */
export type ChatPreviewMediaIcon = 'photo' | 'video'

/** WhatsApp 风格末条摘要 */
export type ChatPreviewLine = {
  /** 是否本人发出 */
  fromSelf: boolean
  /** 发送态勾选（本人消息） */
  delivery?: 'sent' | 'read'
  /** 图文/媒体消息图标；纯文本不展示 */
  mediaIcon?: ChatPreviewMediaIcon
  /** 配文或媒体摘要文案 */
  text: string
}

export type ChatConversation = {
  id: string
  /** 对应聊天详情 room id */
  roomId: string
  title: string
  previewLine: ChatPreviewLine
  time: string
  unread: number
  highlighted: boolean
  pinned?: boolean
  avatar: string
  filter: ChatFilter
}

export const CHAT_FILTERS: { key: ChatFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'direct', label: '私信' },
  { key: 'group', label: '群组' },
  { key: 'community', label: '社群' },
]

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c-h5-article',
    roomId: 'h5-article-demo',
    title: 'h5图文入口',
    previewLine: {
      fromSelf: true,
      delivery: 'sent',
      mediaIcon: 'photo',
      text: '照片',
    },
    time: '13:32',
    unread: 0,
    highlighted: false,
    pinned: true,
    avatar: CHAT_ASSETS.avatarH5Article,
    filter: 'direct',
  },
  {
    id: 'c0',
    roomId: 'direct-demo',
    title: '林晓晴',
    previewLine: {
      fromSelf: true,
      delivery: 'sent',
      mediaIcon: 'video',
      text: '视频',
    },
    time: '13:31',
    unread: 0,
    highlighted: false,
    pinned: true,
    avatar: CHAT_ASSETS.avatarDirect,
    filter: 'direct',
  },
  {
    id: 'c1',
    roomId: 'group-demo',
    title: '2026世界杯赛事预测群',
    previewLine: { fromSelf: false, text: '世界杯精准大师置顶了一条消息' },
    time: '21:07',
    unread: 172,
    highlighted: false,
    avatar: CHAT_ASSETS.avatarWorldCup,
    filter: 'group',
  },
  {
    id: 'c2',
    roomId: 'group-demo',
    title: '弹珠世界大战',
    previewLine: { fromSelf: false, text: '骄傲的鸭子已加入群组' },
    time: '21:02',
    unread: 273,
    highlighted: false,
    avatar: CHAT_ASSETS.avatarMarbleWar,
    filter: 'group',
  },
  {
    id: 'c3',
    roomId: 'group-demo',
    title: '牛牛大战',
    previewLine: { fromSelf: false, text: '骄傲的鸭子已加入群组' },
    time: '21:02',
    unread: 62,
    highlighted: true,
    avatar: CHAT_ASSETS.avatarNiuniu,
    filter: 'group',
  },
  {
    id: 'c4',
    roomId: 'group-demo',
    title: '魔幻弹珠',
    previewLine: { fromSelf: false, text: 'li0428已加入群组' },
    time: '08:42',
    unread: 77,
    highlighted: true,
    avatar: CHAT_ASSETS.avatarMagicMarble,
    filter: 'group',
  },
  {
    id: 'c5',
    roomId: 'group-demo',
    title: '品牌宣传部',
    previewLine: { fromSelf: false, text: '肖虎已加入群组' },
    time: '昨天',
    unread: 26,
    highlighted: true,
    avatar: CHAT_ASSETS.avatarBrand,
    filter: 'community',
  },
]

/** 可写会话列表状态（发送图文后更新末条预览） */
export const chatConversationsState = reactive(
  INITIAL_CONVERSATIONS.map((item) => ({
    ...item,
    previewLine: { ...item.previewLine },
  })),
)

export function conversationsForFilter(filter: ChatFilter): ChatConversation[] {
  if (filter === 'all') return chatConversationsState
  return chatConversationsState.filter((c) => c.filter === filter)
}

export type MediaPreviewItem = { type: 'image' | 'video' }

/**
 * WhatsApp 风格会话列表末条：媒体图标 + 文案
 * - 有配文：文案=配文；无配文：纯视频「视频」，否则「照片」
 * - 图标：纯视频用摄像机；含图片（含混选）用照片
 * - 数量等细则对齐 WhatsApp 客户端，原型先不展开
 */
export function buildMediaListPreview(
  items: MediaPreviewItem[],
  caption: string,
): Pick<ChatPreviewLine, 'mediaIcon' | 'text'> {
  const hasVideo = items.some((item) => item.type === 'video')
  const hasImage = items.some((item) => item.type === 'image')
  const captionText = caption.trim()
  const onlyVideo = hasVideo && !hasImage
  const mediaIcon: ChatPreviewMediaIcon = onlyVideo ? 'video' : 'photo'

  if (captionText) {
    return { mediaIcon, text: captionText }
  }
  return { mediaIcon, text: onlyVideo ? '视频' : '照片' }
}

function nowTimeLabel() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/** 聊天详情发送媒体后，同步会话列表末条与时间，并置顶该会话（置顶会话保持在置顶区最前） */
export function syncConversationAfterMediaSend(
  roomId: string,
  items: MediaPreviewItem[],
  caption: string,
) {
  const index = chatConversationsState.findIndex((c) => c.roomId === roomId)
  if (index < 0) return

  const target = chatConversationsState[index]!
  const media = buildMediaListPreview(items, caption)
  target.previewLine = {
    fromSelf: true,
    delivery: 'sent',
    mediaIcon: media.mediaIcon,
    text: media.text,
  }
  target.time = nowTimeLabel()
  target.unread = 0
  target.highlighted = false

  chatConversationsState.splice(index, 1)
  if (target.pinned) {
    chatConversationsState.unshift(target)
    return
  }
  const firstUnpinned = chatConversationsState.findIndex((c) => !c.pinned)
  if (firstUnpinned < 0) chatConversationsState.push(target)
  else chatConversationsState.splice(firstUnpinned, 0, target)
}
