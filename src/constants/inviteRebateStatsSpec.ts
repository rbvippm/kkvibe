/** 日返利统计 · PRD（邀请人维度二级页） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateStatsPrdDimension = PcPrdDimension
export type InviteRebateStatsFeatureRow = PcPrdFeatureRow

export const INVITE_REBATE_STATS_META = {
  title: '日返利统计',
  module: '运营管理',
  updatedAt: '2026-07-22',
  prdVersion: 'v1.9',
} as const

export const INVITE_REBATE_STATS_BACKGROUND = [
  '运营需按「邀请人」查看其在各业务日的返利、已领取、已过期、待领取与已取消规模，便于核对单人贡献。',
  '口径对齐次日解锁与手动领取：返利金额口径含可领取+已领取+已过期+已取消；各状态金额按列拆分；KKC / KKV / USDT 分列、不跨币种换算。',
] as const

export const INVITE_REBATE_STATS_GOALS = [
  '从邀请列表行操作进入，按当前邀请人过滤日汇总。',
  '按业务日期起止筛选；表格一行一个业务日，展示三币种返利、领取、已过期、待领取、已取消金额；本页不下钻明细。',
] as const

export const INVITE_REBATE_STATS_SPEC_ANNOT_NO = {
  dailyRebate: 1,
} as const

export const INVITE_REBATE_STATS_FEATURE_LIST: InviteRebateStatsFeatureRow[] = [
  {
    id: 1,
    module: '统计列表',
    feature: '邀请人日返利状态金额汇总',
    pageLocation: '筛选区「业务日期」旁「注1」；列表三币种返利/领取/已过期/待领取/已取消金额列',
    prd: {
      functionalLogic:
        '按当前邀请人 + 返利计算日（业务日）聚合。一行对应一个业务日；KKC / KKV / USDT 分列展示当日返利、已领取、已过期、待领取（可领取）、已取消合计，不做跨币种加总或折算。同币种近似：返利 ≈ 领取 + 待领取 + 已过期 + 已取消。',
      interactiveBehavior:
        '选择业务日起止后点「搜索」过滤；「清除」恢复默认区间；支持分页。本页无行操作、不下钻活动明细。左上角「← 返回邀请列表」回到邀请列表。',
      visualPresentation:
        '筛选区仅业务日期；表格列：业务日期 / 三币种返利金额 / 三币种领取金额 / 三币种已过期金额 / 三币种待领取金额 / 三币种已取消金额。',
      dataRules:
        '返利金额 = 可领取+已领取+已过期+已取消；领取金额 = claimed；已过期金额 = expired；待领取金额 = claimable；已取消金额 = cancelled；无数据展示 0.00；金额千分位保留两位小数。入口 query：inviterId、inviterAccount。',
      exceptions:
        '无匹配业务日 → 空态「暂无统计数据」；结束日期早于开始日期 → 提示且不应用筛选；未带 inviterId 直达 → 提示从邀请列表进入。',
      routing:
        '入口：邀请列表操作「日返利统计」→ pc-invite-rebate-stats（二级，侧栏不单独展示）；文档说明 → pc-invite-rebate-stats-doc。不下钻活动明细。',
    },
  },
]

export const INVITE_REBATE_STATS_SETTLE_SPEC = [
  '按当前邀请人 × 业务日汇总，一行一日。',
  '返利金额 = 可领取 + 已领取 + 已过期 + 已取消；不含待解锁（与邀请列表注2一致）。',
  '表格分列展示三币种返利、领取、已过期、待领取、已取消金额，原生金额不跨币种换算。',
  '待领取=可领取；同币种近似：返利 ≈ 领取 + 待领取 + 已过期 + 已取消。',
] as const
