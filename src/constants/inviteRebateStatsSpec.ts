/** 活动统计 · PRD */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateStatsPrdDimension = PcPrdDimension
export type InviteRebateStatsFeatureRow = PcPrdFeatureRow

export const INVITE_REBATE_STATS_META = {
  title: '活动统计',
  module: '运营管理',
  updatedAt: '2026-07-22',
  prdVersion: 'v1.3',
} as const

export const INVITE_REBATE_STATS_BACKGROUND = [
  '运营需按业务日与币种查看邀请返利的参与规模与领取规模。',
  '统计口径对齐次日解锁：T+1 12:00（GMT+7）起可手动领取，区分预估与已领。',
] as const

export const INVITE_REBATE_STATS_GOALS = [
  '按业务日、币种筛选活动汇总。',
  '展示达标邀请人、被邀请人数、达标被邀请人、充值合计、预估返利、已领返利与领取开放时间。',
] as const

export const INVITE_REBATE_STATS_SPEC_ANNOT_NO = {
  settleCycle: 1,
} as const

export const INVITE_REBATE_STATS_FEATURE_LIST: InviteRebateStatsFeatureRow[] = [
  {
    id: 1,
    module: '统计列表',
    feature: '领取周期汇总',
    pageLocation: '筛选区旁「注1」；列表预估/已领列',
    prd: {
      functionalLogic:
        '按返利计算日（业务日）+ 币种聚合。预估按 T 日充值 × 比例（封顶前口径汇总）；已领为手动领取成功合计；领取开放时间为业务日 T+1 的 GMT+7 12:00。',
      interactiveBehavior: '选择业务日起止与币种后搜索；重置恢复默认近 7 日（原型即时过滤）。',
      visualPresentation:
        '顶部摘要按币种展示达标邀请人、达标被邀请人、预估、已领；表格按业务日+币种分行。',
      dataRules:
        'bizDate 为返利计算日；claimOpenAt 为领取开放时间。人数与金额均按币种独立汇总。',
      exceptions: '无数据空态；已领可小于预估（未领/过期/封顶）。',
      routing: '操作「明细」进入活动明细；文档说明 -> pc-invite-rebate-stats-doc。',
    },
  },
]

export const INVITE_REBATE_STATS_SETTLE_SPEC = [
  '按业务日 + 币种汇总邀请/达标/充值/返利。',
  'T+1 12:00（GMT+7）起可手动领取；列表展示领取开放时间。',
  '预估与已领分列：已领为领取成功合计。',
] as const
