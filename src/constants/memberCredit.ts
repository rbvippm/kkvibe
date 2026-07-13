/** 会员授信 · 产品退水 Mock */

export type MemberCreditProduct = {
  key: string
  name: string
  rebate: number
  maxRebate: number
}

export const DEFAULT_MEMBER_CREDIT_PRODUCTS: MemberCreditProduct[] = [
  { key: 'qutou', name: '趣投', rebate: 0, maxRebate: 0.1 },
  { key: 'marble', name: '弹珠', rebate: 0, maxRebate: 0.1 },
  { key: 'scratch', name: '刮刮乐', rebate: 0, maxRebate: 0.1 },
  { key: 'lottery', name: '彩票', rebate: 0, maxRebate: 0.1 },
  { key: 'live', name: '真人', rebate: 0, maxRebate: 0.1 },
  { key: 'sports', name: '体育', rebate: 0, maxRebate: 0.1 },
  { key: 'chess', name: '棋牌', rebate: 0, maxRebate: 0.1 },
  { key: 'fishing', name: '捕鱼', rebate: 0, maxRebate: 0.1 },
  { key: 'esports', name: '电竞', rebate: 0, maxRebate: 0.1 },
  { key: 'slots', name: '老虎机', rebate: 0, maxRebate: 0.1 },
  { key: 'cockfight', name: '斗鸡', rebate: 0, maxRebate: 0.1 },
]

export function formatMemberCreditPercent(value: number) {
  return `${value}%`
}

export const OTHER_MEMBER_CREDIT_STEPS = [
  { key: 'search', label: '查询会员' },
  { key: 'rebate', label: '设置退水' },
] as const
