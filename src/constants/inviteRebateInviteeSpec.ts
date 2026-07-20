/** 被邀请人详情 · PRD
 * 与页面「注1～注3」一一对应；不含【文档说明】入口。
 */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateInviteePrdDimension = PcPrdDimension
export type InviteRebateInviteeFeatureRow = PcPrdFeatureRow

export type InviteRebateInviteeAnnotContext =
  | 'parentScope'
  | 'meetsFilter'
  | 'dailyDetail'

export const INVITE_REBATE_INVITEE_META = {
  title: '被邀请人详情',
  module: '运营管理',
  updatedAt: '2026-07-20',
  prdVersion: 'v1.1',
} as const

/** 1. 需求背景 */
export const INVITE_REBATE_INVITEE_BACKGROUND = [
  '运营从「邀请活动列表」下钻后，需查看某邀请活动行（用户ID + 币种）下的被邀请人参与情况。',
  '结算要求昨天双方每日最低存款与历史累计存款均达标；任一方为代理则取消计奖；派发为隔天 GMT+8 12:00。',
  '应发返利 = 被邀请人当天存款金额 × 返利比例；实发可因 VIP 日上限截断而小于应发。',
] as const

/** 2. 需求目标 */
export const INVITE_REBATE_INVITEE_GOALS = [
  '作为邀请活动列表的二级页：进入时按邀请活动行（用户ID + 币种）过滤列表（注1）。',
  '支持按被邀请人ID、币种、是否达标筛选（注2）。',
  '详情为大弹框「被邀请人每日明细」：按业务日展示双方存款、返利比例、应发/实发与派发状态，并支持筛选（注3）。',
] as const

/** 页面「注N」编号登记（与 FEATURE_LIST.id、页面 WfSpecAnnot :no 一致） */
export const INVITE_REBATE_INVITEE_SPEC_ANNOT_NO = {
  parentScope: 1,
  meetsFilter: 2,
  dailyDetail: 3,
} as const

/** 3. 需求功能清单（与页面「注N」标注一一对应） */
export const INVITE_REBATE_INVITEE_FEATURE_LIST: InviteRebateInviteeFeatureRow[] = [
  {
    id: 1,
    module: '二级页入口',
    feature: '上级活动维度过滤',
    pageLocation: '筛选区「被邀请人ID」标签旁「注1」；路由 query',
    prd: {
      functionalLogic:
        '本页为邀请活动列表的二级页。进入时携带上级活动行参数，列表默认只展示该邀请人在该币种下的被邀请人；被邀请人摘要信息以外层列表为准，不再在弹框重复展示。',
      interactiveBehavior:
        '从邀请活动列表点击「被邀请人」进入 → query 带 inviterAccount、currency（及 inviterId）；本页按 account+currency 过滤。点击「← 返回邀请活动列表」回到一级页。',
      visualPresentation:
        '页顶返回链「← 返回邀请活动列表」；路径条「运营管理 - 邀请活动列表 - 被邀请人详情」；「被邀请人ID」标签旁「注1」。',
      dataRules:
        '优先匹配：inviterAccount + currency；兼容仅带 inviterId。筛选「被邀请人ID」对 account 做包含匹配（trim）。币种筛选项默认「全部」（在上级币种范围内再滤）。',
      exceptions: '无 query 时展示全量 Mock（原型兜底）；无匹配行 →「暂无被邀请人」。',
      routing:
        '入口：pc-invite-rebate-inviters → 本页 pc-invite-rebate-invitees；返回一级列表；文档说明 → pc-invite-rebate-invitees-doc。',
    },
  },
  {
    id: 2,
    module: '列表筛选',
    feature: '是否达标',
    pageLocation: '筛选区「是否达标」标签旁「注2」；列表「达标」列',
    prd: {
      functionalLogic:
        '按被邀请人当前门槛达标状态过滤列表，辅助运营快速定位已达标 / 未达标被邀请人。',
      interactiveBehavior:
        '选择「全部 / 已达标 / 未达标」后点「搜索」→ 按 meetsCondition 过滤；点「清除」→ 恢复默认筛选。可与被邀请人ID、币种组合。',
      visualPresentation:
        '标签「是否达标：」+ 下拉；旁侧「注2」。列表「达标」列展示已达标 / 未达标。',
      dataRules:
        '枚举：全部（空）| yes（已达标）| no（未达标）；对应字段 meetsCondition boolean。资格列另展示可计奖 / 未达标 / 已取消（eligibleStatus）。',
      exceptions: '组合筛选无结果 → 空态，保留条件；达标与资格语义不同，不以资格覆盖达标筛选。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 3,
    module: '详情弹框',
    feature: '被邀请人每日明细',
    pageLocation: '操作列表头旁「注3」；行内「详情」；大弹框「被邀请人每日明细」',
    prd: {
      functionalLogic:
        '大弹框按业务日展示该被邀请人的双方存款条件、返利比例、门槛达标、资格、应发/实发返利、派发状态、计划派发时间与备注。应发返利 = 被邀请人当天存款金额 × 返利比例；触达 VIP 日上限时实发可小于应发。',
      interactiveBehavior:
        '点击行内「详情」→ 打开大弹框；可按业务日起止、门槛达标、资格、派发状态搜索/清除；表格横向滚动；底部分页；点「关闭」或遮罩关闭。弹框内不重复展示被邀请人摘要（以外层列表为准）。',
      visualPresentation:
        '操作列表头旁「注3」；行内蓝色「详情」。弹框标题「被邀请人每日明细」，宽表样式（wf-table--invitee-daily），金额列右对齐，备注可换行；达标/资格用状态徽章。',
      dataRules:
        '明细维度：inviteeId + bizDate。列含业务日、VIP 快照、邀请人/被邀请人累计与日存、返利比例、门槛达标、资格、应发、实发、派发状态、计划派发时间（隔日 GMT+8 12:00）、备注。Mock 默认返利比例 1%；派发状态：待派发 / 已派发 / 触达上限 / 已取消 / 未达标。',
      exceptions:
        '结束日期早于开始日期 → 弹框内提示且不应用筛选；无明细 →「暂无每日明细」；实发 < 应发时状态为「触达上限」并在备注说明。',
      routing: '弹框无独立路由；关闭后停留本列表。',
    },
  },
]

/** 注1 · 浮层简版 */
export const INVITE_REBATE_INVITEE_PARENT_SCOPE_SPEC = [
  '本页为邀请活动列表二级页，进入时按上级活动行「用户ID + 币种」过滤。',
  '支持再按被邀请人ID、币种筛选；左上角返回邀请活动列表。',
  '被邀请人摘要以外层列表为准，详情弹框不再重复展示。',
] as const

/** 注2 · 浮层简版 */
export const INVITE_REBATE_INVITEE_MEETS_SPEC = [
  '按是否达标过滤：已达标 / 未达标。',
  '达标指双方日存与历史累计门槛状态（列表「达标」列）。',
  '可与被邀请人ID、币种组合筛选。',
] as const

/** 注3 · 浮层简版 */
export const INVITE_REBATE_INVITEE_DAILY_SPEC = [
  '点击「详情」打开大弹框，按业务日查看条件与返利明细。',
  '应发返利 = 被邀请人当天存款金额 × 返利比例；实发可因上限截断小于应发。',
  '支持业务日、达标、资格、派发状态筛选；派发时间为隔天 GMT+8 12:00。',
] as const

export const INVITE_REBATE_INVITEE_ANNOT_MAP: Record<
  InviteRebateInviteeAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  parentScope: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.parentScope,
    title: '上级活动维度过滤',
    items: INVITE_REBATE_INVITEE_PARENT_SCOPE_SPEC,
  },
  meetsFilter: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.meetsFilter,
    title: '是否达标筛选',
    items: INVITE_REBATE_INVITEE_MEETS_SPEC,
  },
  dailyDetail: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.dailyDetail,
    title: '被邀请人每日明细',
    items: INVITE_REBATE_INVITEE_DAILY_SPEC,
  },
}
