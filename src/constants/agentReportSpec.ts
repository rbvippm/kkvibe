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
      '返佣代理「我的报表」下方场馆明细即「游戏统计」口径：展示本人各品类 / 场馆游戏净输赢；不含 VIP晋级礼金、VIP额外奖金、活动金；页内不展示实占数据汇总卡。',
      '明细固定为下注有效金额、输赢、VIP退水、场馆费，不展示退水/代理赚水行。',
      '公式 tip 统一为「游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】 + 【-场馆费】」。',
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
      '明细为下注有效金额、输赢、VIP退水、场馆费；无退水/代理赚水或实占前缀文案。',
    ],
    data: [
      '各代理层级统一展示下注有效金额、输赢、VIP退水、场馆费。',
      '金额千分位 + 两位小数；下注有效金额中性黑色；盈亏类正绿负粉。',
      '代理层级不影响游戏统计字段与公式口径。',
    ],
    exception: [
      '返佣身份须固定使用四项明细与统一公式，不随代理层级增减字段。',
      '一级「全部」无场馆 pill；分品类下始终含二级「全部」；无 Mock 场馆时明细按 0.00 / +0.00 兜底。',
      '本标注仅返佣身份展示；占成游戏报表明细标题对齐代理详情，带「（实占）」后缀（如「全部（实占）」）；公式为「实占游戏输赢 − 实占退水 − 实占VIP退水 − 代理赚水 − 场馆费」，明细须含场馆费。',
    ],
    routing: [
      '承载于代理中心「我的报表」→ 页内 Tab「游戏」（AgentReportPage，返佣身份）。',
      '页内一级 Tab：返佣为「佣金 / 游戏」，占成为「盈亏 / 游戏」；本注仅描述游戏报表内容。',
      '概况「预计佣金」进入报表时默认落在「佣金」Tab；底栏进报表可带 reportTab=game/finance。',
      '本页品类筛选与公式 tip 为页内交互，不跳转路由。',
    ],
  }),
}

/** @deprecated 请用 AGENT_REPORT_GAME_STATS_SPEC */
export const AGENT_REPORT_CURRENCY_SUMMARY_SPEC = AGENT_REPORT_GAME_STATS_SPEC
