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
  updatedAt: '2026-07-18',
  prdVersion: 'v1.0',
} as const

export const INVITE_REBATE_STATS_BACKGROUND = [
  '运营需按业务日与币种查看邀请好友充值返利活动的参与规模与派发规模。',
  '统计口径对齐结算周期：隔天 GMT+8 12:00 派发昨天返利，并区分应发与截断后实发。',
] as const

export const INVITE_REBATE_STATS_GOALS = [
  '按业务日、币种筛选活动汇总。',
  '展示达标邀请人、被邀请人数、达标被邀请人、充值合计、应发返利、实发返利与计划派发时间。',
] as const

export const INVITE_REBATE_STATS_SPEC_ANNOT_NO = {
  settleCycle: 1,
} as const

export const INVITE_REBATE_STATS_FEATURE_LIST: InviteRebateStatsFeatureRow[] = [
  {
    id: 1,
    module: '统计列表',
    feature: '结算周期汇总',
    pageLocation: '筛选区旁「注1」；列表应发/实发列',
    prd: {
      functionalLogic:
        '按返利计算日（业务日）+ 币种聚合活动数据。应发为截断前合计，实发为按 VIP 日上限扣减超出后的派发合计；计划派发时间为隔天 GMT+8 12:00。',
      interactiveBehavior: '选择业务日起止与币种后搜索；重置恢复默认近 7 日（原型即时过滤）。',
      visualPresentation:
        '顶部摘要按币种展示达标邀请人、达标被邀请人、应发、实发（维度为用户+币种，不做跨币种加总）；表格按业务日+币种分行。',
      dataRules:
        'bizDate 为返利计算日；settleAt 为计划派发时间。人数与金额均按币种独立汇总，不做跨币种折算。',
      exceptions: '无数据空态；实发可小于应发（上限截断）。',
      routing: '操作「明细」进入二级页活动明细（预填业务日+币种；侧栏不单独展示活动明细）；文档说明 -> pc-invite-rebate-stats-doc。',
    },
  },
]

export const INVITE_REBATE_STATS_SETTLE_SPEC = [
  '按业务日 + 币种汇总邀请/达标/充值/返利。',
  '隔天 GMT+8 12:00 派发昨天返利；列表展示计划派发时间。',
  '应发与实发分列：实发已扣减超过各被邀请人上限之和的部分。',
] as const
