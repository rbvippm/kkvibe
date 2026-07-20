/** 活动明细 · PRD */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateRecordPrdDimension = PcPrdDimension
export type InviteRebateRecordFeatureRow = PcPrdFeatureRow

export const INVITE_REBATE_RECORD_META = {
  title: '活动明细',
  module: '运营管理',
  updatedAt: '2026-07-18',
  prdVersion: 'v1.0',
} as const

export const INVITE_REBATE_RECORD_BACKGROUND = [
  '运营需核对每一笔邀请返利的计算与派发结果，包括 VIP 快照上限与截断原因。',
  '应发返利 = 被邀请人当天存款金额 × 返利比例；落库当日返利金额时同步落库当日返利上限；超出各被邀请人上限之和则扣减后再派发。',
] as const

export const INVITE_REBATE_RECORD_GOALS = [
  '提供返利流水明细列表，支持按业务日、邀请人、被邀请人、币种、状态筛选。',
  '明细展示 VIP 快照、日上限、应发、实发与备注（未达标/上限截断/代理取消等）。',
] as const

export const INVITE_REBATE_RECORD_SPEC_ANNOT_NO = {
  capSnapshot: 1,
} as const

export const INVITE_REBATE_RECORD_FEATURE_LIST: InviteRebateRecordFeatureRow[] = [
  {
    id: 1,
    module: '明细列表',
    feature: 'VIP 上限快照与派发状态',
    pageLocation: '筛选区旁「注1」；列表 VIP/日上限/实发列',
    prd: {
      functionalLogic:
        '每条明细对应「邀请人-被邀请人-业务日-币种」的返利结果。VIP 快照取返利计算日 23:59:59 被邀请人 VIP；日上限随快照落库；实发可为截断后金额。',
      interactiveBehavior: '筛选后搜索；状态含待派发/已派发/触达上限/已取消/未达标。',
      visualPresentation:
        '表格含流水号、业务日、派发时间、邀请人、被邀请人、币种、VIP 快照、日上限、应发、实发、状态、备注。',
      dataRules:
        'status=capped 时实发 < 应发；cancelled 常见于代理取消资格；not_qualified 为日存或历史累计未达标。',
      exceptions: '无匹配空态；备注需能解释非已派发原因。',
      routing: '二级页：仅从活动统计「明细」进入（可预填业务日+币种）；左上角「← 返回活动统计」回一级；文档说明 -> pc-invite-rebate-records-doc。',
    },
  },
]

export const INVITE_REBATE_RECORD_CAP_SPEC = [
  'VIP 快照取返利计算日 23:59:59 被邀请人等级，并落库当日日上限。',
  '若当日应发超过各被邀请人上限之和，扣减超出后再派发（状态「触达上限」）。',
  '未达标 / 代理取消等状态在备注中说明原因。',
] as const
