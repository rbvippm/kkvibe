/** 发现 · 频道设置 Mock · Figma 3626:72247 */

const BASE = '/images/discover-channel'

export const DISCOVER_CHANNEL_ASSETS = {
  rearrange: `${BASE}/icon-rearrange.svg`,
  feed: `${BASE}/icon-feed.svg`,
  live: `${BASE}/icon-live.svg`,
  reels: `${BASE}/icon-reels.svg`,
  cinema: `${BASE}/icon-cinema.svg`,
} as const

/** id 与发现页 Tab key 对齐 */
export type DiscoverChannelId = 'feed' | 'short' | 'movie'

export type DiscoverChannelItem = {
  id: DiscoverChannelId
  label: string
  icon: string
  enabled: boolean
}

export const MOCK_DISCOVER_CHANNELS: DiscoverChannelItem[] = [
  { id: 'feed', label: '动态', icon: DISCOVER_CHANNEL_ASSETS.feed, enabled: true },
  { id: 'short', label: '短视频', icon: DISCOVER_CHANNEL_ASSETS.reels, enabled: true },
  { id: 'movie', label: '电影', icon: DISCOVER_CHANNEL_ASSETS.cinema, enabled: true },
]
