/** 代理结算对账 · 文案（支持多语言扩展） */

export type SettlementLocale = 'zh-CN' | 'en-US'

export const SETTLEMENT_LOCALE = 'zh-CN' satisfies SettlementLocale

const messages = {
  'zh-CN': {
    pageTitle: '代理结算对账',
    detailTitleSuffix: '流水明细',
    agentFallback: '代理',
    totalNet: '总净额',
    netHint: '正数为代理欠款 · 负数需线下支付给代理',
    periodNet: '期间净额',
    totalUp: '累计上分',
    totalDown: '累计下分',
    periodNetShort: '本期净额',
    viewDetail: '查看流水明细',
    monthAll: '全部',
    month202606: '2026年6月',
    month202605: '2026年5月',
    month202604: '2026年4月',
    agentAll: '全部代理',
    pickMonth: '选择月份',
    pickAgent: '选择代理',
    emptyAgents: '暂无代理结算数据',
    emptyRecords: '该时段暂无流水记录',
    txAction: '操作',
    txUp: '上分',
    txDown: '下分',
    txId: '订单号',
    copy: '复制',
    copied: '已复制',
    currency: 'X币',
    menuTitle: '代理结算对账',
    menuDesc: '上下分净额汇总与流水下钻',
  },
  'en-US': {
    pageTitle: 'Agent Settlement',
    detailTitleSuffix: 'Transactions',
    agentFallback: 'Agent',
    totalNet: 'Total Net',
    netHint: 'Positive: agent owes you · Negative: pay agent offline',
    periodNet: 'Period Net',
    totalUp: 'Total Credit In',
    totalDown: 'Total Credit Out',
    periodNetShort: 'Net Amount',
    viewDetail: 'View Transactions',
    monthAll: 'All',
    month202606: 'Jun 2026',
    month202605: 'May 2026',
    month202604: 'Apr 2026',
    agentAll: 'All Agents',
    pickMonth: 'Select Month',
    pickAgent: 'Select Agent',
    emptyAgents: 'No settlement data',
    emptyRecords: 'No transactions in this period',
    txAction: 'Type',
    txUp: 'Credit In',
    txDown: 'Credit Out',
    txId: 'Order No.',
    copy: 'Copy',
    copied: 'Copied',
    currency: 'X Coin',
    menuTitle: 'Agent Settlement',
    menuDesc: 'Net summary and transaction drill-down',
  },
} as const

export type SettlementMessageKey = keyof (typeof messages)['zh-CN']

export function settlementT(
  key: SettlementMessageKey,
  locale: SettlementLocale = SETTLEMENT_LOCALE,
) {
  return messages[locale][key]
}

export function settlementMonthLabel(
  value: string,
  locale: SettlementLocale = SETTLEMENT_LOCALE,
) {
  if (!value) return settlementT('monthAll', locale)
  const map: Record<string, SettlementMessageKey> = {
    '2026-06': 'month202606',
    '2026-05': 'month202605',
    '2026-04': 'month202604',
  }
  const key = map[value]
  return key ? settlementT(key, locale) : value
}
