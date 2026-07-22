/** 代理中心 · 我的占成比例（Figma 1433:25538） */

export type AgentMyShareRatioRow = {
  key: string
  name: string
  /** 占成比例展示文案，如 2.5% */
  shareText: string
}

/** 占成类型 · 对齐设计稿顺序与数值；末行为其他成本（原 VIP晋级礼金 / VIP额外奖金 / 活动金） */
export const AGENT_MY_SHARE_RATIO_ROWS: AgentMyShareRatioRow[] = [
  { key: 'scratch', name: '刮刮乐游戏', shareText: '2.5%' },
  { key: 'chess', name: '棋牌游戏', shareText: '1.8%' },
  { key: 'marble', name: '弹珠游戏', shareText: '1.5%' },
  { key: 'lottery', name: '彩票游戏', shareText: '1.3%' },
  { key: 'qutou', name: '趣投游戏', shareText: '1.1%' },
  { key: 'sports', name: '体育游戏', shareText: '0.9%' },
  { key: 'live', name: '真人游戏', shareText: '0.8%' },
  { key: 'slots', name: '老虎机游戏', shareText: '0.6%' },
  { key: 'fishing', name: '捕鱼游戏', shareText: '0.5%' },
  { key: 'other', name: '其他成本', shareText: '1.0%' },
]
