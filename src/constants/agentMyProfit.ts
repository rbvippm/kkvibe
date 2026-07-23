/** 代理中心 · 我的盈亏（Figma 1433:17568） */

import { AGENT_GAME_PROFIT_FORMULA, AGENT_PROFIT_FORMULA } from './agentDetailProfit'

export { AGENT_GAME_PROFIT_FORMULA, AGENT_PROFIT_FORMULA }

export type AgentMyProfitTone = 'neutral' | 'positive' | 'negative'

export type AgentMyProfitProductRow = {
  key: string
  name: string
  amountText: string
  tone: AgentMyProfitTone
}

export type AgentMyProfitDetailRow = {
  label: string
  /** 副文案提示（可选） */
  labelHint?: string
  amountText: string
  tone: AgentMyProfitTone
  emphasize?: boolean
  /** 公式 tip 文案；有值时展示感叹号入口 */
  formulaTip?: string
}

export type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'

export const AGENT_MY_PROFIT_ASSETS = {
  backIcon: '/images/agent-my-profit/icon-back.svg',
  calendarIcon: '/images/agent-my-profit/icon-calendar.png',
  decoCoin: '/images/agent-my-profit/deco-coin.png',
} as const

export const AGENT_MY_PROFIT_PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastWeek', label: '上周' },
]

/** 顶部总盈亏（即代理盈亏；公式见 AGENT_PROFIT_FORMULA） */
export const AGENT_MY_PROFIT_TOTAL = {
  label: '总盈亏',
  valueText: '+ 123,019.99',
  tone: 'positive' as const,
}

/** 产品 / 成本盈亏列表（对齐设计稿斑马纹与正负色；捕鱼后接成本类型） */
export const AGENT_MY_PROFIT_PRODUCT_ROWS: AgentMyProfitProductRow[] = [
  { key: 'scratch', name: '刮刮乐', amountText: '+123,567.88', tone: 'positive' },
  { key: 'marble', name: '弹珠', amountText: '-23,567.88', tone: 'negative' },
  { key: 'chess', name: '棋牌', amountText: '+123,567.88', tone: 'positive' },
  { key: 'lottery', name: '彩票', amountText: '-23,567.88', tone: 'negative' },
  { key: 'qutou', name: '趣投', amountText: '+123,567.88', tone: 'positive' },
  { key: 'sports', name: '体育', amountText: '-23,567.88', tone: 'negative' },
  { key: 'live', name: '真人', amountText: '+123,567.88', tone: 'positive' },
  { key: 'slots', name: '老虎机', amountText: '-23,567.88', tone: 'negative' },
  { key: 'fishing', name: '捕鱼', amountText: '+123,567.88', tone: 'positive' },
  { key: 'vip_bonus', name: 'VIP晋级礼金', amountText: '-23,567.88', tone: 'negative' },
  { key: 'vip_extra', name: 'VIP额外奖金', amountText: '-12,345.67', tone: 'negative' },
  { key: 'activity', name: '活动金', amountText: '-123,567.88', tone: 'negative' },
]

export const AGENT_MY_PROFIT_SUMMARY_ROW: AgentMyProfitProductRow = {
  key: 'total',
  name: '总计',
  amountText: '+123,567.88',
  tone: 'positive',
}

export const AGENT_MY_PROFIT_FOOTNOTE =
  '数据每十分钟更新一次\n最多可查询近 6 个月的数据'

/** 游戏占成项盈亏明细（口径对齐场馆净输赢：含代理赚水，不含成本项） */
export const AGENT_MY_PROFIT_DETAIL_ROWS: AgentMyProfitDetailRow[] = [
  {
    label: '下注有效金额',
    amountText: '10000',
    tone: 'neutral',
  },
  { label: '输赢', amountText: '+500.00', tone: 'positive' },
  { label: '退水', amountText: '-100.00', tone: 'negative' },
  { label: 'VIP退水', amountText: '-50.00', tone: 'negative' },
  { label: '代理赚水', amountText: '-10.00', tone: 'negative' },
  {
    label: '净输赢',
    amountText: '+340.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: AGENT_GAME_PROFIT_FORMULA,
  },
]

/**
 * 总计盈亏明细：对齐代理盈亏七项
 * 代理盈亏 = 实占游戏输赢 − 实占退水 − 实占VIP退水 − 代理赚水 − 实占VIP晋级礼金 − 实占VIP额外奖金 − 实占活动金
 */
export const AGENT_MY_PROFIT_TOTAL_DETAIL_ROWS: AgentMyProfitDetailRow[] = [
  { label: '输赢', amountText: '+500.00', tone: 'positive' },
  { label: '退水', amountText: '-100.00', tone: 'negative' },
  { label: 'VIP退水', amountText: '-50.00', tone: 'negative' },
  { label: '代理赚水', amountText: '-10.00', tone: 'negative' },
  { label: 'VIP晋级礼金', amountText: '-20.00', tone: 'negative' },
  { label: 'VIP额外奖金', amountText: '-15.00', tone: 'negative' },
  { label: '活动金', amountText: '-30.00', tone: 'negative' },
  {
    label: '代理盈亏',
    amountText: '+275.00',
    tone: 'positive',
    emphasize: true,
    formulaTip: AGENT_PROFIT_FORMULA,
  },
]

/** 成本占成项暂无明细弹框 */
const AGENT_MY_PROFIT_NO_DETAIL_KEYS = new Set(['vip_bonus', 'vip_extra', 'activity'])

export function agentMyProfitHasDetail(rowKey: string): boolean {
  return !AGENT_MY_PROFIT_NO_DETAIL_KEYS.has(rowKey)
}

/** 游戏占成项用游戏明细；总计含成本两项 */
export function agentMyProfitDetailRows(rowKey: string): AgentMyProfitDetailRow[] {
  if (rowKey === 'total') return AGENT_MY_PROFIT_TOTAL_DETAIL_ROWS
  return AGENT_MY_PROFIT_DETAIL_ROWS
}

export function agentMyProfitDateRangeText(preset: RangePreset): string {
  const base = '2025-08-06'
  if (preset === 'today') return `${base}至${base}`
  if (preset === 'yesterday') return '2025-08-05至2025-08-05'
  if (preset === 'thisWeek') return '2025-08-04至2025-08-10'
  return '2025-07-28至2025-08-03'
}

export function agentMyProfitToneClass(tone: AgentMyProfitTone) {
  if (tone === 'positive') return 'mh5-agent-my-profit__amount--positive'
  if (tone === 'negative') return 'mh5-agent-my-profit__amount--negative'
  return ''
}
