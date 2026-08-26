import { COMMUNITY_ASSETS } from './mobileCommunityAssets'

export type CommunityTab = 'service' | 'strategy' | 'news' | 'live'

export type CommunityGroup = {
  id: string
  title: string
  desc?: string
  icon: string
  memberCount: number
  joined: boolean
}

export const COMMUNITY_TABS: { key: CommunityTab; label: string }[] = [
  { key: 'service', label: '服务' },
  { key: 'strategy', label: '策略' },
  { key: 'news', label: '新闻' },
  { key: 'live', label: '直播' },
]

export const COMMUNITY_BANNER = {
  title: '强大生态 创业自由',
  cta: '创业从这里开始',
  image: COMMUNITY_ASSETS.banner,
}

export const COMMUNITY_SERVICE_GROUPS: CommunityGroup[] = [
  {
    id: 'brand',
    title: '品牌宣传部',
    desc: '推广宣传素材，会不断更新，助您轻松推广',
    icon: COMMUNITY_ASSETS.groupBrand,
    memberCount: 201,
    joined: true,
  },
  {
    id: 'official',
    title: '金刚官方服务群',
    desc: '官方客服服务群，欢迎集中讨论与反馈',
    icon: COMMUNITY_ASSETS.groupService,
    memberCount: 1211,
    joined: false,
  },
  {
    id: 'feedback',
    title: '用户体验反馈群',
    desc: '官方用户体验反馈，欢迎您提供宝贵意见',
    icon: COMMUNITY_ASSETS.groupFeedback,
    memberCount: 337,
    joined: false,
  },
  {
    id: 'complaint',
    title: '用户投诉群',
    desc: '接纳任何投诉，我们会竭尽为您服务',
    icon: COMMUNITY_ASSETS.groupComplaint,
    memberCount: 263,
    joined: false,
  },
  {
    id: 'lottery',
    title: '联盟彩票介绍',
    desc: '了解联盟彩票玩法与规则说明',
    icon: COMMUNITY_ASSETS.groupLottery,
    memberCount: 40,
    joined: false,
  },
  {
    id: 'marble',
    title: '弹珠玩法介绍',
    desc: '弹珠世界大战玩法指南与技巧分享',
    icon: COMMUNITY_ASSETS.groupMarble,
    memberCount: 218,
    joined: false,
  },
]

export const COMMUNITY_STRATEGY_GROUPS: CommunityGroup[] = [
  {
    id: 's1',
    title: '创业策略分享',
    desc: '资深代理分享拓客与团队管理经验',
    icon: COMMUNITY_ASSETS.groupService,
    memberCount: 156,
    joined: false,
  },
  {
    id: 's2',
    title: '收益优化指南',
    desc: '数据分析与收益提升实用策略',
    icon: COMMUNITY_ASSETS.groupFeedback,
    memberCount: 89,
    joined: true,
  },
]

export const COMMUNITY_NEWS_ITEMS: CommunityGroup[] = [
  {
    id: 'n1',
    title: '平台公告：首存优惠活动上线',
    desc: '2025-08-06 · 活动资讯',
    icon: COMMUNITY_ASSETS.groupBrand,
    memberCount: 0,
    joined: false,
  },
  {
    id: 'n2',
    title: '弹珠世界大战赛季开启',
    desc: '2025-08-05 · 赛事新闻',
    icon: COMMUNITY_ASSETS.groupMarble,
    memberCount: 0,
    joined: false,
  },
]

export function groupsForTab(tab: CommunityTab): CommunityGroup[] {
  if (tab === 'live') return []
  if (tab === 'strategy') return COMMUNITY_STRATEGY_GROUPS
  if (tab === 'news') return COMMUNITY_NEWS_ITEMS
  return COMMUNITY_SERVICE_GROUPS
}
