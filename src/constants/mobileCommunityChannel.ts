/** 社区 · 频道设置（复刻发现页三杠） */

import { COMMUNITY_ASSETS } from './mobileCommunityAssets'
import { DISCOVER_CHANNEL_ASSETS } from './mobileDiscoverChannel'
import type { CommunityTab } from './mobileCommunity'

export type CommunityChannelId = CommunityTab

export type CommunityChannelItem = {
  id: CommunityChannelId
  label: string
  icon: string
  enabled: boolean
}

export const MOCK_COMMUNITY_CHANNELS: CommunityChannelItem[] = [
  { id: 'service', label: '服务', icon: COMMUNITY_ASSETS.groupService, enabled: true },
  { id: 'strategy', label: '策略', icon: COMMUNITY_ASSETS.groupFeedback, enabled: true },
  { id: 'news', label: '新闻', icon: COMMUNITY_ASSETS.groupBrand, enabled: true },
  { id: 'live', label: '直播', icon: DISCOVER_CHANNEL_ASSETS.live, enabled: true },
]
