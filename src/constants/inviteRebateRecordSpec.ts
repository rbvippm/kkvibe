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
  updatedAt: '2026-07-22',
  prdVersion: 'v1.3',
} as const

export const INVITE_REBATE_RECORD_BACKGROUND = [
  '运营需核对每一笔邀请返利的生成、解锁与领取结果，包括 VIP 上限截断与未领原因。',
  '预估奖金 = 被邀请人 T 日充值 × 业务日返利比例，再按 VIP 日上限封顶。',
  '领取开放：T+1 12:00（GMT+7）；须次日解锁三条件达标；超领取有效期未领作废。',
] as const

export const INVITE_REBATE_RECORD_GOALS = [
  '提供返利流水明细列表，支持按业务日、邀请人、被邀请人、币种、状态筛选。',
  '明细展示 VIP 快照、日上限、预估、已领、领取开放/过期时间与备注。',
] as const

export const INVITE_REBATE_RECORD_SPEC_ANNOT_NO = {
  capSnapshot: 1,
} as const

export const INVITE_REBATE_RECORD_FEATURE_LIST: InviteRebateRecordFeatureRow[] = [
  {
    id: 1,
    module: '明细列表',
    feature: 'VIP 上限快照与领取状态',
    pageLocation: '筛选区旁「注1」；列表 VIP/日上限/已领列',
    prd: {
      functionalLogic:
        '每条明细对应「邀请人-被邀请人-业务日-币种」。VIP 快照与日上限按既有配置口径落库；已领可为封顶后金额。状态：待解锁 / 可领取 / 已领取 / 已过期 / 已取消。',
      interactiveBehavior: '筛选后搜索；状态含待解锁/可领取/已领取/已过期/已取消。',
      visualPresentation:
        '表格含流水号、业务日、领取开放时间、过期时间、邀请人、被邀请人、币种、VIP 快照、日上限、预估、已领、状态、备注。',
      dataRules:
        '仅 claimed 有 flowNo；cancelled 为代理取消；locked 为解锁条件未齐；expired 为超期未领。',
      exceptions: '无匹配空态；备注解释非已领取原因。',
      routing: '二级页：从活动统计「明细」进入；← 返回活动统计；文档说明 -> pc-invite-rebate-records-doc。',
    },
  },
]

export const INVITE_REBATE_RECORD_CAP_SPEC = [
  'VIP 快照与日上限按既有配置口径落库（结构不动）。',
  '预估超过 VIP 日上限时，落库/领取金额按上限封顶。',
  '待解锁 / 已过期 / 代理取消等在备注中说明原因。',
] as const
