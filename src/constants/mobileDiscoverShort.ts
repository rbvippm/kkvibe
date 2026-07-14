/** 发现 · 短视频 Mock · Figma 3626:72214 */

const BASE = '/images/discover-short'

export const DISCOVER_SHORT_ASSETS = {
  cover: `${BASE}/cover.jpg`,
  avatar: `${BASE}/avatar.jpg`,
  like: `${BASE}/icon-like.svg`,
  star: `${BASE}/icon-star.svg`,
  comment: `${BASE}/icon-comment.svg`,
  translate: `${BASE}/icon-translate.svg`,
  more: `${BASE}/icon-more.svg`,
  menu: `${BASE}/icon-menu.svg`,
  search: `${BASE}/icon-search.svg`,
  back: `${BASE}/icon-back.svg`,
} as const

export type DiscoverShortVideo = {
  id: string
  userName: string
  avatar: string
  cover: string
  caption: string
  likes: string
  favorites: string
  comments: string
  followed?: boolean
}

export const MOCK_DISCOVER_SHORT_VIDEO: DiscoverShortVideo = {
  id: 'sv1',
  userName: '艾米丽',
  avatar: DISCOVER_SHORT_ASSETS.avatar,
  cover: DISCOVER_SHORT_ASSETS.cover,
  caption:
    '如你需要产生假的测试地址、正则验证规则或 UI 设计建议，我都可以帮你补上如你需要产生假的测试地址、正则验证规则或 UI 如你需要产生假的测试地址、正则验证规则或 UI 设计建议，我都可以帮你补上如你需要产生假的测试地址、正则验证规则或 UI ',
  likes: '201k',
  favorites: '9.9k',
  comments: '1.3k',
  followed: false,
}

export const DISCOVER_SHORT_ACTIONS = [
  { key: 'like', label: '201k', icon: DISCOVER_SHORT_ASSETS.like, ariaLabel: '点赞' },
  { key: 'star', label: '9.9k', icon: DISCOVER_SHORT_ASSETS.star, ariaLabel: '收藏' },
  { key: 'comment', label: '1.3k', icon: DISCOVER_SHORT_ASSETS.comment, ariaLabel: '评论' },
  { key: 'translate', label: '翻译', icon: DISCOVER_SHORT_ASSETS.translate, ariaLabel: '翻译' },
  { key: 'more', label: '更多', icon: DISCOVER_SHORT_ASSETS.more, ariaLabel: '更多' },
] as const
