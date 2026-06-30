import { CHAT_ASSETS } from './mobileChatAssets'

export type ChatFilter = 'all' | 'direct' | 'group' | 'community'

export type ChatConversation = {
  id: string
  title: string
  preview: string
  time: string
  unread: number
  highlighted: boolean
  avatar: string
  filter: ChatFilter
}

export const CHAT_FILTERS: { key: ChatFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'direct', label: '私信' },
  { key: 'group', label: '群组' },
  { key: 'community', label: '社群' },
]

export const CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c1',
    title: '2026世界杯赛事预测群',
    preview: '世界杯精准大师置顶了一条消息',
    time: '21:07',
    unread: 172,
    highlighted: false,
    avatar: CHAT_ASSETS.avatarWorldCup,
    filter: 'group',
  },
  {
    id: 'c2',
    title: '弹珠世界大战',
    preview: '骄傲的鸭子已加入群组',
    time: '21:02',
    unread: 273,
    highlighted: false,
    avatar: CHAT_ASSETS.avatarMarbleWar,
    filter: 'group',
  },
  {
    id: 'c3',
    title: '牛牛大战',
    preview: '骄傲的鸭子已加入群组',
    time: '21:02',
    unread: 62,
    highlighted: true,
    avatar: CHAT_ASSETS.avatarNiuniu,
    filter: 'group',
  },
  {
    id: 'c4',
    title: '魔幻弹珠',
    preview: 'li0428已加入群组',
    time: '08:42',
    unread: 77,
    highlighted: true,
    avatar: CHAT_ASSETS.avatarMagicMarble,
    filter: 'group',
  },
  {
    id: 'c5',
    title: '品牌宣传部',
    preview: '肖虎已加入群组',
    time: '昨天',
    unread: 26,
    highlighted: true,
    avatar: CHAT_ASSETS.avatarBrand,
    filter: 'community',
  },
]

export function conversationsForFilter(filter: ChatFilter): ChatConversation[] {
  if (filter === 'all') return CHAT_CONVERSATIONS
  return CHAT_CONVERSATIONS.filter((c) => c.filter === filter)
}
