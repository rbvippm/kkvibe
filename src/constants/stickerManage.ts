/** 贴图包 / 贴图标签 · 类型与 Mock 数据 */

export type StickerPackStatus = 'online' | 'offline' | 'draft'

export type StickerTagStatus = 'enabled' | 'disabled'

/** 贴图包内单张贴图 */
export type StickerPackItem = {
  id: string
  fileName: string
  /** 原型占位：实际为图片 URL */
  preview: string
  /** 1～3 个 Emoji 或搜索词，逗号分隔 */
  emojiKeywords: string
}

export type StickerPackRow = {
  id: string
  name: string
  author: string
  trayIcon: string
  stickerCount: number
  status: StickerPackStatus
  sortWeight: number
  publishedAt: string | null
  creator: string
  createdAt: string
  updatedAt: string
  items: StickerPackItem[]
}

export type StickerTagRow = {
  id: string
  guideEmoji: string
  label: string
  searchKeywords: string[]
  sortOrder: number
  status: StickerTagStatus
}

export const STICKER_PACK_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'online', label: '已上架' },
  { value: 'offline', label: '已下架' },
  { value: 'draft', label: '草稿' },
] as const

export const STICKER_PACK_STATUS_LABEL: Record<StickerPackStatus, string> = {
  online: '已上架',
  offline: '已下架',
  draft: '草稿',
}

export const STICKER_TAG_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '禁用' },
] as const

export const STICKER_TAG_STATUS_LABEL: Record<StickerTagStatus, string> = {
  enabled: '启用',
  disabled: '禁用',
}

export const STICKER_PACK_MAX_ITEMS = 30

const cuppyItems: StickerPackItem[] = [
  { id: 'si_c1', fileName: 'cuppy_hi.png', preview: '👋', emojiKeywords: '👋,你好' },
  { id: 'si_c2', fileName: 'cuppy_coffee.png', preview: '☕', emojiKeywords: '☕,😋' },
  { id: 'si_c3', fileName: 'cuppy_love.png', preview: '🥰', emojiKeywords: '❤️,💕' },
  { id: 'si_c4', fileName: 'cuppy_laugh.png', preview: '😂', emojiKeywords: '😂,🤣' },
  { id: 'si_c5', fileName: 'cuppy_sleep.png', preview: '😴', emojiKeywords: '😴,🌙' },
  { id: 'si_c6', fileName: 'cuppy_angry.png', preview: '😤', emojiKeywords: '😤,💢' },
  { id: 'si_c7', fileName: 'cuppy_cry.png', preview: '😢', emojiKeywords: '😢,😭' },
  { id: 'si_c8', fileName: 'cuppy_ok.png', preview: '👌', emojiKeywords: '👌,OK' },
]

export const MOCK_STICKER_PACK_ROWS: StickerPackRow[] = [
  {
    id: 'pack_001',
    name: 'Cuppy',
    author: 'KK 官方',
    trayIcon: '🧁',
    stickerCount: cuppyItems.length,
    status: 'online',
    sortWeight: 100,
    publishedAt: '2025-05-08 10:00:00',
    creator: '运营-小林',
    createdAt: '2025-05-07 16:20:00',
    updatedAt: '2025-05-08 10:00:00',
    items: cuppyItems,
  },
  {
    id: 'pack_002',
    name: '节日限定',
    author: 'KK 官方',
    trayIcon: '🎄',
    stickerCount: 4,
    status: 'online',
    sortWeight: 80,
    publishedAt: '2025-12-20 09:00:00',
    creator: '运营-阿杰',
    createdAt: '2025-12-18 14:30:00',
    updatedAt: '2025-12-20 09:00:00',
    items: [
      { id: 'si_h1', fileName: 'xmas_tree.png', preview: '🎄', emojiKeywords: '🎄,圣诞' },
      { id: 'si_h2', fileName: 'xmas_gift.png', preview: '🎁', emojiKeywords: '🎁,礼物' },
      { id: 'si_h3', fileName: 'xmas_snow.png', preview: '⛄', emojiKeywords: '⛄,下雪' },
      { id: 'si_h4', fileName: 'xmas_party.png', preview: '🎉', emojiKeywords: '🎉,派对' },
    ],
  },
  {
    id: 'pack_003',
    name: '萌宠日常',
    author: '插画师 Amy',
    trayIcon: '🐱',
    stickerCount: 5,
    status: 'offline',
    sortWeight: 60,
    publishedAt: '2025-04-15 11:30:00',
    creator: '运营-小林',
    createdAt: '2025-04-10 09:00:00',
    updatedAt: '2025-06-01 18:00:00',
    items: [
      { id: 'si_p1', fileName: 'cat_hi.png', preview: '🐱', emojiKeywords: '🐱,喵' },
      { id: 'si_p2', fileName: 'dog_run.png', preview: '🐶', emojiKeywords: '🐶,汪' },
      { id: 'si_p3', fileName: 'rabbit_jump.png', preview: '🐰', emojiKeywords: '🐰' },
      { id: 'si_p4', fileName: 'panda_eat.png', preview: '🐼', emojiKeywords: '🐼' },
      { id: 'si_p5', fileName: 'fox_wink.png', preview: '🦊', emojiKeywords: '🦊' },
    ],
  },
  {
    id: 'pack_004',
    name: '职场加油',
    author: 'KK 官方',
    trayIcon: '💼',
    stickerCount: 3,
    status: 'draft',
    sortWeight: 40,
    publishedAt: null,
    creator: '运营-阿杰',
    createdAt: '2025-06-20 15:00:00',
    updatedAt: '2025-06-22 10:12:00',
    items: [
      { id: 'si_w1', fileName: 'work_go.png', preview: '💪', emojiKeywords: '💪,加油' },
      { id: 'si_w2', fileName: 'work_tea.png', preview: '🍵', emojiKeywords: '🍵,摸鱼' },
      { id: 'si_w3', fileName: 'work_done.png', preview: '✅', emojiKeywords: '✅,完成' },
    ],
  },
]

export const MOCK_STICKER_TAG_ROWS: StickerTagRow[] = [
  {
    id: 'tag_001',
    guideEmoji: '👋',
    label: '你好',
    searchKeywords: ['👋', '你好', 'hi', 'hello'],
    sortOrder: 100,
    status: 'enabled',
  },
  {
    id: 'tag_002',
    guideEmoji: '😂',
    label: '笑趴',
    searchKeywords: ['😂', '🤣', '哈哈', 'lol'],
    sortOrder: 90,
    status: 'enabled',
  },
  {
    id: 'tag_003',
    guideEmoji: '❤️',
    label: '大爱',
    searchKeywords: ['❤️', '💕', '爱', 'love'],
    sortOrder: 80,
    status: 'enabled',
  },
  {
    id: 'tag_004',
    guideEmoji: '😴',
    label: '晚安',
    searchKeywords: ['😴', '🌙', '晚安', 'sleep'],
    sortOrder: 70,
    status: 'enabled',
  },
  {
    id: 'tag_005',
    guideEmoji: '🔥',
    label: '热门',
    searchKeywords: ['🔥', '666', 'hot'],
    sortOrder: 60,
    status: 'disabled',
  },
]

export function formatStickerNow() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function parseEmojiKeywords(raw: string): string[] {
  return raw
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function validateEmojiKeywords(raw: string): string | null {
  const tokens = parseEmojiKeywords(raw)
  if (tokens.length < 1 || tokens.length > 3) {
    return '每张贴图需绑定 1～3 个 Emoji 或搜索词'
  }
  return null
}

export function stickerTagOptionLabel(tag: StickerTagRow): string {
  return `${tag.guideEmoji} ${tag.label}`
}

/** 根据已选标签 ID 生成贴图 Emoji 映射（取各标签引导 Emoji） */
export function keywordsFromTagIds(tagIds: string[], tags: StickerTagRow[]): string {
  return tagIds
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is StickerTagRow => Boolean(tag))
    .map((tag) => tag.guideEmoji)
    .join(',')
}

/** 从已有映射字符串反推标签 ID（编辑回显） */
export function inferTagIdsFromKeywords(raw: string, tags: StickerTagRow[]): string[] {
  const tokens = parseEmojiKeywords(raw)
  if (!tokens.length) return []

  const matched = tags.filter((tag) => {
    if (tokens.includes(tag.guideEmoji)) return true
    return tag.searchKeywords.some((kw) => tokens.includes(kw))
  })

  return matched.slice(0, 3).map((tag) => tag.id)
}

export function validateStickerTagIds(tagIds: string[]): string | null {
  if (tagIds.length < 1 || tagIds.length > 3) {
    return '每张贴图需选择 1～3 个贴图标签'
  }
  return null
}

export function cloneStickerPackRow(row: StickerPackRow): StickerPackRow {
  return {
    ...row,
    items: row.items.map((item) => ({ ...item })),
  }
}
