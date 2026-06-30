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
]
