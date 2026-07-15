/** 用户管理 · 用户列表 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type UserListPrdDimension = PcPrdDimension
export type UserListFeatureRow = PcPrdFeatureRow

export const USER_LIST_META = {
  title: '用户列表',
  module: '用户管理',
  updatedAt: '2026-07-15',
  prdVersion: 'v1.0',
} as const

export const USER_LIST_BACKGROUND = [
  '运营需在后台统一检索与管理平台用户账号，覆盖状态启停、安全密码重置、锁定解锁与删除等日常运维动作。',
  '列表需支持多维筛选（状态、性别、用户ID、邀请码、手机号、金刚号、注册时间、来源、渠道、注册平台），并提供批量启停与导出能力。',
  '部分用户存在三方登录绑定，运营需能按选中用户查询三方 ID，便于客服与风控核对。',
] as const

export const USER_LIST_GOALS = [
  '提供用户列表，支持多条件筛选、分页浏览与批量启用/禁用。',
  '支持导出当前筛选结果（原型模拟导出提示）。',
  '支持查询已选用户的三方 ID。',
  '行内管理提供禁用/启用、查看详情、重置密码、解锁、实名状态、重置安全密码、删除等操作入口。',
] as const

/** 功能清单与页面标注暂为空，后续按需补充 */
export const USER_LIST_FEATURE_LIST: UserListFeatureRow[] = []

export const USER_LIST_SPEC_ANNOT_NO = {} as const
