/** 发现 · 动态信息流 Mock · Figma 3626:72183 */

export type DiscoverFeedMediaType = 'none' | 'video' | 'images'

export type DiscoverFeedPost = {
  id: string
  userName: string
  avatar: string
  time: string
  /** 纯文案；话题用 #话题x 写法，渲染时高亮 */
  content: string
  /** 文案中需高亮的话题片段（含 #） */
  topics?: string[]
  mediaType: DiscoverFeedMediaType
  /** 视频封面 */
  videoCover?: string
  videoDuration?: string
  /** 图片列表（横向滑动） */
  images?: string[]
  /** 提到了… */
  mention?: string
  likes: string
  favorites: string
  comments: string
}

const BASE = '/images/discover-feed'

export const DISCOVER_FEED_ASSETS = {
  avatar: `${BASE}/avatar.jpg`,
  videoCover: `${BASE}/video-cover.jpg`,
  img1: `${BASE}/img-1.jpg`,
  img2: `${BASE}/img-2.jpg`,
  more: `${BASE}/icon-more.svg`,
  like: `${BASE}/icon-like.svg`,
  heart: `${BASE}/icon-heart.svg`,
  comment: `${BASE}/icon-comment.svg`,
  pause: `${BASE}/icon-pause.svg`,
  mute: `${BASE}/icon-mute.svg`,
  fullscreen: `${BASE}/icon-fullscreen.svg`,
  controlBarBg: `${BASE}/control-bar-bg.png`,
} as const

export const MOCK_DISCOVER_FEED_POSTS: DiscoverFeedPost[] = [
  {
    id: 'f1',
    userName: '艾米丽',
    avatar: DISCOVER_FEED_ASSETS.avatar,
    time: '13:30',
    content: '无论面临多大的困难#话题1 #话题2，只要保持积极的心态和坚定的信念，我们总能找到解决问题的方法。每一次挑战都是成长的契机，让我们更加坚强。',
    topics: ['#话题1 #话题2'],
    mediaType: 'none',
    likes: '201k',
    favorites: '9.9k',
    comments: '1.3k',
  },
  {
    id: 'f2',
    userName: '艾米丽',
    avatar: DISCOVER_FEED_ASSETS.avatar,
    time: '13:30',
    content: '文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案',
    mediaType: 'video',
    videoCover: DISCOVER_FEED_ASSETS.videoCover,
    videoDuration: '03:31',
    mention: '提到了: 张三、李四、王五、XXX、XXX、XXX、XXX、XXX、XXX、',
    likes: '201k',
    favorites: '9.9k',
    comments: '1.3k',
  },
  {
    id: 'f3',
    userName: '艾米丽',
    avatar: DISCOVER_FEED_ASSETS.avatar,
    time: '13:30',
    content: '文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案',
    mediaType: 'images',
    images: [DISCOVER_FEED_ASSETS.img1, DISCOVER_FEED_ASSETS.img2],
    likes: '201k',
    favorites: '9.9k',
    comments: '1.3k',
  },
]

/** 将文案按话题拆成片段，便于高亮渲染 */
export function splitFeedContent(
  content: string,
  topics: string[] = [],
): { text: string; topic: boolean }[] {
  if (!topics.length) return [{ text: content, topic: false }]

  const escaped = topics
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'g')
  const parts = content.split(re).filter(Boolean)

  return parts.map((text) => ({
    text,
    topic: topics.includes(text),
  }))
}
