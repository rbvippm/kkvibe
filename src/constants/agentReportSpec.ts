/** 代理端 · 我的报表 · 移动端 PRD 标注 */

import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const AGENT_REPORT_SPEC_ANNOT_NO = {
  /** 返佣 · 场馆游戏净输赢 / 游戏统计口径 */
  gameStats: 7,
} as const

/** 注7 · 我的报表 · 游戏统计（仅返佣） */
export const AGENT_REPORT_GAME_STATS_SPEC: MobilePrdSpec = {
  no: AGENT_REPORT_SPEC_ANNOT_NO.gameStats,
  title: '游戏统计',
  sections: buildMobilePrdSections({
    logic: [
      '返佣代理「我的报表」下方场馆明细即「游戏统计」口径：展示本人各品类 / 场馆游戏净输赢；不含 VIP晋级礼金、VIP额外奖金、活动金；页内不再展示「赚水 / 实占数据」汇总卡。',
      '明细不展示「退水」行；细项为下注有效金额、输赢、VIP退水；代理赚水仅一级代理可见并参与结算。',
      '公式 tip：一级「游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】 + 【-代理赚水】」；非一级「游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】」。',
      '品类结构与代理详情「游戏数据」、会员「游戏统计」（返佣）对齐：一级全部 / 棋牌 / 电竞 / 捕鱼 / 老虎机 / 体育；分品类下二级场馆 pill。',
    ],
    interaction: [
      '进入页面默认一级「全部」，展示合计明细且不展示二级场馆 pill。',
      '切换到棋牌 / 电竞等具体品类后展示二级场馆 pill（含「全部」，默认选中「全部」）；切回一级「全部」时二级隐藏并将场馆重置为全部。',
      '点击明细「游戏净输赢」左侧感叹号 → 浮层展示当前代理层级对应公式；再次点击或点页面其他区域关闭。',
    ],
    visual: [
      '品类区：一级横向 Tab（全部 / 棋牌 / 电竞 / 捕鱼 / 老虎机 / 体育）；非「全部」时其下展示二级场馆 pill（首项「全部」）。',
      '白底明细卡：标题行感叹号 +「游戏净输赢」+ 正绿负粉金额；明细行左灰标签右对齐金额。',
      '明细为下注有效金额、输赢、VIP退水；一级另含代理赚水（取负）；无退水行、无实占前缀文案。',
    ],
    data: [
      '一级代理：下注有效金额、输赢、VIP退水、代理赚水；非一级：无代理赚水行。',
      '金额千分位 + 两位小数；下注有效金额中性黑色；盈亏类正绿负粉。',
      '代理层级以当前登录返佣代理为准；原型默认一级（可见代理赚水），切非一级 Mock 时隐藏该行。',
    ],
    exception: [
      '非一级代理：不得展示「代理赚水」行，亦不得在游戏净输赢公式 tip 中出现代理赚水项。',
      '一级「全部」无场馆 pill；分品类下始终含二级「全部」；无 Mock 场馆时明细按 0.00 / +0.00 兜底。',
      '本标注仅返佣身份展示；占成报表口径另册，不在本注描述。',
    ],
    routing: [
      '承载于代理中心「我的报表」Tab（AgentReportPage，返佣身份）。',
      '佣金汇总改在概况「我的佣金」查看，不在本页游戏统计区展示。',
      '本页品类筛选与公式 tip 为页内交互，不跳转路由。',
    ],
  }),
}

/** @deprecated 请用 AGENT_REPORT_GAME_STATS_SPEC */
export const AGENT_REPORT_CURRENCY_SUMMARY_SPEC = AGENT_REPORT_GAME_STATS_SPEC
