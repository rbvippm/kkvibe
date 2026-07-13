/** 代理端 · 我的报表 · 移动端 PRD 标注 */

import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const AGENT_REPORT_SPEC_ANNOT_NO = {
  currencySummary: 9,
} as const

/** 注9 · 报表币种切换影响顶部统计模块 */
export const AGENT_REPORT_CURRENCY_SUMMARY_SPEC: MobilePrdSpec = {
  no: AGENT_REPORT_SPEC_ANNOT_NO.currencySummary,
  title: '报表币种与顶部统计',
  sections: buildMobilePrdSections({
    logic: [
      '右上角币种切换仅影响顶部统计模块口径：信用额度与现金币种展示不同指标文案，互不混用。',
    ],
    interaction: [
      '切换为「信用额度-CNY / 信用额度-USD」→ 顶部统计展示上下分净额、会员上分总额、会员下分总额。',
      '切换为现金币种（KKC / KKV / USDT）→ 顶部统计展示充值后续费、会员充值总额、会员提款总额。',
    ],
    visual: [
      '顶部三张统计卡片横排；标签随币种类型即时切换，金额数值按对应口径展示。',
    ],
    data: [
      '信用额度：「信用额度-CNY」「信用额度-USD」→ 上下分净额 / 会员上分总额 / 会员下分总额。',
      '现金币种：KKC / KKV / USDT → 充值后续费 / 会员充值总额 / 会员提款总额。',
    ],
    exception: [
      '无法识别的币种按现金口径展示统计标签。',
    ],
    routing: [
      '作用于「我的报表」页内顶部统计模块，无额外跳转。',
    ],
  }),
}
