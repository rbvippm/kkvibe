import type { MineMoreMenuGroup } from './mineMoreFunctions'

/** 代理中心 · 我的 · 更多功能 */
export const AGENT_MINE_MORE_MENU_GROUPS: MineMoreMenuGroup[] = [
  {
    key: 'settlement',
    title: '结算对账',
    items: [
      {
        key: 'agent-settlement',
        title: '代理结算对账',
        desc: '收支净额汇总与流水下钻',
        icon: '💰',
        routeName: 'mobile-agent-settlement',
      },
    ],
  },
]
