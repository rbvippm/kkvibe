/** 代理中心 · 我的占成 / 退水（概况弹框） */

export type AgentMyShareRatioProduct = {
  key: string
  name: string
  rebate: number
  maxRebate: number
}

export type AgentMyShareRatioCategory = {
  key: string
  name: string
  share: number
  maxShare: number
  products: AgentMyShareRatioProduct[]
}

/** 其他成本与占成同级，没有下属退水 */
export const AGENT_MY_SHARE_OTHER_COST = {
  name: '其他成本',
  share: 1,
  maxShare: 10,
}

/**
 * 占成在大类，退水在小类。
 * 占成沿用概况弹框原数值；小类退水对齐收益比例查看页。
 */
export const AGENT_MY_SHARE_RATIO_CATEGORIES: AgentMyShareRatioCategory[] = [
  {
    key: 'scratch',
    name: '刮刮乐游戏',
    share: 2.5,
    maxShare: 3,
    products: [
      { key: 'ggl', name: 'GGL刮乐', rebate: 0.18, maxRebate: 0.25 },
      { key: 'lucky', name: '幸运刮刮乐', rebate: 0.1, maxRebate: 0.16 },
    ],
  },
  {
    key: 'chess',
    name: '棋牌游戏',
    share: 1.8,
    maxShare: 2,
    products: [
      { key: 'im', name: 'IM棋牌', rebate: 0.24, maxRebate: 0.3 },
      { key: 'cdn', name: 'CDN棋牌', rebate: 0.16, maxRebate: 0.21 },
      { key: 'niuniu', name: '牛牛大战', rebate: 0.1, maxRebate: 0.16 },
    ],
  },
  {
    key: 'marble',
    name: '弹珠游戏',
    share: 1.5,
    maxShare: 2,
    products: [
      { key: 'im', name: 'IM弹珠', rebate: 0.2, maxRebate: 0.28 },
      { key: 'magic', name: '魔幻弹珠', rebate: 0.15, maxRebate: 0.18 },
    ],
  },
  {
    key: 'lottery',
    name: '彩票游戏',
    share: 1.3,
    maxShare: 2,
    products: [
      { key: 'saba', name: 'SABA彩票', rebate: 0.25, maxRebate: 0.3 },
      { key: 'kuai3', name: '一分快三', rebate: 0.16, maxRebate: 0.2 },
    ],
  },
  {
    key: 'qutou',
    name: '趣投游戏',
    share: 1.1,
    maxShare: 1.5,
    products: [
      { key: 'crash', name: '爆点', rebate: 0.22, maxRebate: 0.3 },
      { key: 'mini', name: '小游戏', rebate: 0.12, maxRebate: 0.15 },
      { key: 'rocket', name: '火箭', rebate: 0.18, maxRebate: 0.22 },
    ],
  },
  {
    key: 'sports',
    name: '体育游戏',
    share: 0.9,
    maxShare: 1.5,
    products: [
      { key: 'im', name: 'IM体育', rebate: 0.18, maxRebate: 0.24 },
      { key: 'saba', name: 'SABA体育', rebate: 0.15, maxRebate: 0.19 },
    ],
  },
  {
    key: 'live',
    name: '真人游戏',
    share: 0.8,
    maxShare: 1.5,
    products: [
      { key: 'im', name: 'IM真人', rebate: 0.2, maxRebate: 0.27 },
      { key: 'pa', name: 'PA真人', rebate: 0.12, maxRebate: 0.17 },
    ],
  },
  {
    key: 'slots',
    name: '老虎机游戏',
    share: 0.6,
    maxShare: 1,
    products: [
      { key: 'pp', name: 'PP老虎机', rebate: 0.18, maxRebate: 0.23 },
      { key: 'pg', name: 'PG老虎机', rebate: 0.12, maxRebate: 0.18 },
    ],
  },
  {
    key: 'fishing',
    name: '捕鱼游戏',
    share: 0.5,
    maxShare: 1,
    products: [
      { key: 'master', name: '捕鱼达人', rebate: 0.2, maxRebate: 0.26 },
      { key: 'im', name: 'IM捕鱼', rebate: 0.12, maxRebate: 0.15 },
    ],
  },
]

/** 各大类占成与其他成本都为 0 时，弹框只展示小类退水 */
export function isAgentMyShareAllZero(
  categories: AgentMyShareRatioCategory[] = AGENT_MY_SHARE_RATIO_CATEGORIES,
  otherCost = AGENT_MY_SHARE_OTHER_COST.share,
) {
  return otherCost === 0 && categories.every((category) => category.share === 0)
}
