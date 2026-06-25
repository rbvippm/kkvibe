export type MineMoreMenuItem = {
  key: string
  title: string
  desc?: string
  icon: string
  routeName: string
  query?: Record<string, string>
}

export type MineMoreMenuGroup = {
  key: string
  title: string
  items: MineMoreMenuItem[]
}

/** 个人中心 · 更多功能 */
export const MINE_MORE_MENU_GROUPS: MineMoreMenuGroup[] = [
  {
    key: 'demo',
    title: '演示模块',
    items: [
      {
        key: 'live',
        title: '语聊直播',
        desc: '语聊大厅、麦控与开播通知',
        icon: '📻',
        routeName: 'mobile-live',
      },
      {
        key: 'games',
        title: '游戏中心',
        desc: '游戏列表与入口演示',
        icon: '🎮',
        routeName: 'mobile-games',
      },
    ],
  },
  {
    key: 'agent',
    title: '代理中心',
    items: [
      {
        key: 'agent-home',
        title: '代理中心',
        desc: '概况、团队管理与盈亏数据',
        icon: '🤝',
        routeName: 'mobile-agent',
      },
      {
        key: 'agent-team',
        title: '团队管理',
        desc: '邀请码与下级团队列表',
        icon: '👥',
        routeName: 'mobile-agent',
        query: { tab: 'team' },
      },
      {
        key: 'agent-report',
        title: '我的报表',
        desc: '盈亏汇总与游戏分类明细',
        icon: '📊',
        routeName: 'mobile-agent-report',
      },
      {
        key: 'agent-settlement',
        title: '代理结算对账',
        desc: '上下分净额汇总与流水下钻',
        icon: '💰',
        routeName: 'mobile-agent-settlement',
      },
    ],
  },
  {
    key: 'wallet',
    title: '资产账单',
    items: [
      {
        key: 'billing-list',
        title: '账单列表',
        desc: '按类型与币种查看账变明细',
        icon: '🧾',
        routeName: 'mobile-billing-list',
      },
    ],
  },
  {
    key: 'xcoin',
    title: 'X币上下分',
    items: [
      {
        key: 'credit-member',
        title: '给会员上分',
        desc: '向会员 X 币钱包上分',
        icon: '👤',
        routeName: 'mobile-xcoin-credit-member',
      },
      {
        key: 'credit-agent',
        title: '给代理上分',
        desc: '支持非直属代理上分',
        icon: '🏢',
        routeName: 'mobile-xcoin-credit-agent',
      },
      {
        key: 'records',
        title: '上下分记录',
        desc: '查看来源代理与金额明细',
        icon: '📋',
        routeName: 'mobile-xcoin-records',
      },
    ],
  },
]
