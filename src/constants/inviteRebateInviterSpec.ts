/** 邀请人列表 · PRD */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateInviterPrdDimension = PcPrdDimension
export type InviteRebateInviterFeatureRow = PcPrdFeatureRow

export const INVITE_REBATE_INVITER_META = {
  title: '邀请人列表',
  module: '运营管理',
  updatedAt: '2026-07-18',
  prdVersion: 'v1.0',
} as const

export const INVITE_REBATE_INVITER_BACKGROUND = [
  '邀请好友充值返利活动上线后，运营需按邀请人维度查看参与情况、资格状态与累计返利。',
  '资格规则：仅普通会员可计奖；成为代理后取消返利资格；金额与派发按活动币种区分。',
] as const

export const INVITE_REBATE_INVITER_GOALS = [
  '提供邀请人列表，支持按邀请人ID、币种、身份、资格筛选。',
  '列表展示门槛相关存款、下级人数、累计返利，并跳转被邀请人详情。',
] as const

/** 页面暂无「注N」标注，功能清单为空（与页面标注集合一致） */
export const INVITE_REBATE_INVITER_SPEC_ANNOT_NO = {} as const

export const INVITE_REBATE_INVITER_FEATURE_LIST: InviteRebateInviterFeatureRow[] = []
