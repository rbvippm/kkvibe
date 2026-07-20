/** 邀请活动列表 · PRD
 * 与页面「注1～注3」一一对应；不含【文档说明】入口。
 */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateInviterPrdDimension = PcPrdDimension
export type InviteRebateInviterFeatureRow = PcPrdFeatureRow

export type InviteRebateInviterAnnotContext =
  | 'listDimension'
  | 'eligibleFilter'
  | 'inviteeDrill'

export const INVITE_REBATE_INVITER_META = {
  title: '邀请活动列表',
  module: '运营管理',
  updatedAt: '2026-07-20',
  prdVersion: 'v1.2',
} as const

/** 1. 需求背景 */
export const INVITE_REBATE_INVITER_BACKGROUND = [
  '邀请好友充值返利活动上线后，运营需查看邀请人侧参与情况、门槛存款、下级规模、累计返利与计奖资格。',
  '列表维度为「用户ID + 币种」：同一用户多币种各占一行；资格规则与活动中心一致——仅普通会员可计奖，成为代理后取消返利资格。',
  '应发返利口径与活动中心一致：应发 = 被邀请人当天存款金额 × 对应 VIP 档位返利比例；本列表「累计返利」为该用户在该币种下已贡献/已获返利汇总（原型 Mock）。',
] as const

/** 2. 需求目标 */
export const INVITE_REBATE_INVITER_GOALS = [
  '提供邀请活动列表，支持按用户ID、币种、身份、资格筛选（注1 / 注2）。',
  '列表按用户ID + 币种分行展示历史累计存款、昨日日存、下级人数、达标人数、累计返利与资格。',
  '操作「被邀请人」进入二级页，按当前活动行（用户ID + 币种）过滤被邀请人及每日明细（注3）。',
] as const

/** 页面「注N」编号登记（与 FEATURE_LIST.id、页面 WfSpecAnnot :no 一致） */
export const INVITE_REBATE_INVITER_SPEC_ANNOT_NO = {
  listDimension: 1,
  eligibleFilter: 2,
  inviteeDrill: 3,
} as const

/** 3. 需求功能清单（与页面「注N」标注一一对应） */
export const INVITE_REBATE_INVITER_FEATURE_LIST: InviteRebateInviterFeatureRow[] = [
  {
    id: 1,
    module: '列表维度',
    feature: '用户ID + 币种',
    pageLocation: '筛选区「用户ID」标签旁「注1」；列表「用户ID」「币种」列',
    prd: {
      functionalLogic:
        '邀请活动以「用户ID + 币种」为唯一业务行：同一邀请人账号在不同币种下各展示一行，分别统计该币种下的存款门槛、下级人数、达标人数与累计返利。',
      interactiveBehavior:
        '「用户ID」输入后搜索 → 按 account 包含匹配；「币种」下拉（全部 / KKC / KKV / USDT）与搜索联动过滤；「清除」恢复默认筛选。同一用户多币种在列表中分多行展示。',
      visualPresentation:
        '筛选区标签「用户ID：」旁「注1」；列表列含昵称、用户ID、币种等。空态文案「暂无活动数据」。',
      dataRules:
        '维度键：account（用户ID）+ currency。筛选：用户ID 非必填，trim 后对 account 做包含匹配；币种默认「全部」。Mock 含同一用户多币种示例（如阿凯 KKV / KKC）。金额按币种原生展示，不做跨币种折算。',
      exceptions: '筛选无结果 → 表格空态，保留已填条件；用户ID 输入空格仅 trim 后参与匹配。',
      routing: '停留本列表；下钻被邀请人见注3。',
    },
  },
  {
    id: 2,
    module: '列表筛选',
    feature: '资格',
    pageLocation: '筛选区「资格」标签旁「注2」；列表「资格」列',
    prd: {
      functionalLogic:
        '按计奖资格过滤邀请活动行。可计奖：双方均为普通会员且门槛达标；未达标：存款门槛未满足；已取消：任一方成为代理等导致取消返利资格。',
      interactiveBehavior:
        '选择「全部 / 可计奖 / 未达标 / 已取消」后点「搜索」→ 按 eligibleStatus 精确过滤；点「清除」→ 资格恢复「全部」。可与用户ID、币种、身份组合筛选。',
      visualPresentation:
        '标签「资格：」+ 下拉；旁侧「注2」。列表「资格」列展示可计奖 / 未达标 / 已取消。',
      dataRules:
        '枚举：eligible | ineligible | cancelled；默认「全部」。与列表字段 eligibleStatus、身份字段 identity（member / agent）语义对齐；代理行常见「已取消」。',
      exceptions: '组合筛选无结果 → 空态；资格与身份组合时不以前端二次推断覆盖后台落库状态（以列表字段为准）。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 3,
    module: '列表操作',
    feature: '被邀请人',
    pageLocation: '操作列表头旁「注3」；行内「被邀请人」',
    prd: {
      functionalLogic:
        '从当前邀请活动行进入被邀请人二级页，查看该用户在该币种下的被邀请人列表，并可进一步打开每日条件与返利明细（应发 = 当天存款 × 返利比例）。',
      interactiveBehavior:
        '点击行内「被邀请人」→ 跳转被邀请人详情页，query 携带 inviterId、inviterAccount、currency；二级页按用户ID + 币种过滤。左上角「← 返回邀请活动列表」回到本页。',
      visualPresentation:
        '操作列表头旁「注3」；行内蓝色文字链「被邀请人」。',
      dataRules:
        '跳转参数：inviterId（活动行 id）、inviterAccount（用户ID）、currency（币种）。二级页优先按 account+currency 匹配被邀请人；每日明细展示返利比例、应发/实发等。',
      exceptions: '无被邀请人 → 二级页表格空态「暂无被邀请人」；每日明细无数据 →「暂无每日明细」。',
      routing:
        '本页 → pc-invite-rebate-invitees（二级，侧栏不单独展示）；文档说明 → pc-invite-rebate-inviters-doc。',
    },
  },
]

/** 注1 · 浮层简版 */
export const INVITE_REBATE_INVITER_DIMENSION_SPEC = [
  '列表维度为「用户ID + 币种」：同一用户多币种各占一行。',
  '支持按用户ID、币种筛选；金额按币种独立统计，不做跨币种折算。',
  '与活动中心邀请返利配置的币种口径一致。',
] as const

/** 注2 · 浮层简版 */
export const INVITE_REBATE_INVITER_ELIGIBLE_SPEC = [
  '资格：可计奖 / 未达标 / 已取消。',
  '仅普通会员可计奖；成为代理后取消返利资格。',
  '可与用户ID、币种、身份组合筛选。',
] as const

/** 注3 · 浮层简版 */
export const INVITE_REBATE_INVITER_INVITEE_SPEC = [
  '点击「被邀请人」进入二级页，按当前行用户ID + 币种过滤。',
  '二级页可查看被邀请人列表及每日条件与返利明细。',
  '应发返利 = 被邀请人当天存款金额 × 返利比例。',
] as const

export const INVITE_REBATE_INVITER_ANNOT_MAP: Record<
  InviteRebateInviterAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  listDimension: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.listDimension,
    title: '列表维度 · 用户ID + 币种',
    items: INVITE_REBATE_INVITER_DIMENSION_SPEC,
  },
  eligibleFilter: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.eligibleFilter,
    title: '资格筛选',
    items: INVITE_REBATE_INVITER_ELIGIBLE_SPEC,
  },
  inviteeDrill: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.inviteeDrill,
    title: '被邀请人下钻',
    items: INVITE_REBATE_INVITER_INVITEE_SPEC,
  },
}
