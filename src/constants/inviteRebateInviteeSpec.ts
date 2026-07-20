/** 被邀请人详情 · PRD */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateInviteePrdDimension = PcPrdDimension
export type InviteRebateInviteeFeatureRow = PcPrdFeatureRow

export const INVITE_REBATE_INVITEE_META = {
  title: '被邀请人详情',
  module: '运营管理',
  updatedAt: '2026-07-18',
  prdVersion: 'v1.0',
} as const

export const INVITE_REBATE_INVITEE_BACKGROUND = [
  '运营需查看某邀请人下的被邀请人达标情况、VIP、存款与已贡献返利。',
  '结算要求昨天双方每日最低存款与历史累计存款均达标；任一方为代理则取消计奖。',
] as const

export const INVITE_REBATE_INVITEE_GOALS = [
  '作为邀请人列表的二级页：进入时按邀请人过滤；支持按被邀请人、币种、是否达标筛选。',
  '点击行查看被邀请人详情摘要；左上角返回邀请人列表。',
] as const

/** 页面暂无「注N」标注，功能清单为空（与页面标注集合一致） */
export const INVITE_REBATE_INVITEE_SPEC_ANNOT_NO = {} as const

export const INVITE_REBATE_INVITEE_FEATURE_LIST: InviteRebateInviteeFeatureRow[] = []
