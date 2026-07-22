/** 邀请列表 · PRD
 * 与页面「注1～注4」一一对应；不含【文档说明】入口。
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
  | 'inviteeCount'
  | 'rebateByCurrency'
  | 'inviteeDrill'
  | 'identityFilter'
  | 'dailyStats'

export const INVITE_REBATE_INVITER_META = {
  title: '邀请列表',
  module: '运营管理',
  updatedAt: '2026-07-22',
  prdVersion: 'v1.12',
} as const

/** 1. 需求背景 */
export const INVITE_REBATE_INVITER_BACKGROUND = [
  '邀请好友充值返利活动上线后，运营需按「人」查看邀请人侧参与情况、下级规模与分币种累计返利。',
  '计入规则：仅统计成功邀请过其他用户并完成注册的邀请人，列表中下级人数一定大于 0；无成功邀请注册者不入列表。',
  '列表维度为用户ID（一人一行）；展示金刚号；不展示资格字段。',
  '累计返利按 KKC / KKV / USDT 分列展示，不做跨币种折算；计入状态为可领取+已领取+已过期+已取消（不含待解锁）；业务日门槛与币种明细下沉到被邀请人每日明细。',
] as const

/** 2. 需求目标 */
export const INVITE_REBATE_INVITER_GOALS = [
  '提供邀请列表，仅展示下级人数 > 0 的邀请人；支持按用户ID、金刚号、身份筛选（注4）。',
  '列表展示下级人数（成功邀请并注册人数，注1）以及累计返利(KKC/KKV/USDT)（注2；可领取+已领取+已过期+已取消）。',
  '操作「被邀请人」进入二级页，按当前邀请人过滤被邀请人；币种与每日门槛明细在二级页弹框查看（注3）。',
  '操作「日返利统计」进入该邀请人的日汇总页：业务日 + 三币种返利/领取/已过期/待领取/已取消，返利金额口径同注2（注5）。',
] as const

/** 页面「注N」编号登记（与 FEATURE_LIST.id、页面 WfSpecAnnot :no 一致） */
export const INVITE_REBATE_INVITER_SPEC_ANNOT_NO = {
  inviteeCount: 1,
  rebateByCurrency: 2,
  inviteeDrill: 3,
  identityFilter: 4,
  dailyStats: 5,
} as const

/** 3. 需求功能清单（与页面「注N」标注一一对应） */
export const INVITE_REBATE_INVITER_FEATURE_LIST: InviteRebateInviterFeatureRow[] = [
  {
    id: 1,
    module: '列表字段',
    feature: '下级人数',
    pageLocation: '列表「下级人数」表头旁「注1」',
    prd: {
      functionalLogic:
        '下级人数 = 该邀请人成功邀请并完成注册的用户数。邀请列表计入规则：至少成功邀请 1 人注册才入列表，故本列取值一定 > 0。',
      interactiveBehavior: '只读展示；无交互（原型）。',
      visualPresentation:
        '表头「下级人数」旁「注1」；单元格展示非负整数。',
      dataRules:
        '字段 inviteeCount，整数且 ≥ 1；统计口径为成功邀请并注册，不含仅分享未注册。',
      exceptions: 'inviteeCount=0 的用户不出现在本列表，故无「0」行。',
      routing: '无跳转；查看具体被邀请人见注3。',
    },
  },
  {
    id: 2,
    module: '列表字段',
    feature: '累计返利分币种',
    pageLocation: '列表「累计返利(KKC)」表头旁「注2」；「累计返利(KKV)」「累计返利(USDT)」列',
    prd: {
      functionalLogic:
        '累计返利按活动币种分列展示该邀请人已获返利：KKC、KKV、USDT 各自独立统计，不做跨币种折算或加总列。计入领取状态为：可领取（claimable）+ 已领取（claimed）+ 已过期（expired）+ 已取消（cancelled）；不含待解锁（locked）。',
      interactiveBehavior: '只读展示；无排序交互（原型）。',
      visualPresentation:
        '三列金额右对齐展示（千分位 + 两位小数）；表头「累计返利(KKC)」旁「注2」。无该币种返利时展示 0.00。',
      dataRules:
        '字段：rebateKKC / rebateKKV / rebateUSDT，数值 ≥ 0。口径：对应币种下状态 ∈ {可领取, 已领取, 已过期, 已取消} 的返利金额合计；返利金额 = 业务日被邀请人存款 × 业务日返利比例（落库汇总）。',
      exceptions: '三币种均为 0 → 仍展示 0.00，不隐藏列。',
      routing: '无跳转。',
    },
  },
  {
    id: 3,
    module: '列表操作',
    feature: '被邀请人',
    pageLocation: '操作列表头旁「注3」；行内「被邀请人」',
    prd: {
      functionalLogic:
        '从当前邀请人进入被邀请人二级页，查看其名下被邀请人（人维度），并可进一步打开每日明细（含币种、T日/次日存款、领取状态与返利计算）。',
      interactiveBehavior:
        '点击行内「被邀请人」→ 跳转被邀请人详情页，query 携带 inviterId、inviterAccount；二级页按邀请人过滤。左上角「← 返回邀请列表」回到本页。',
      visualPresentation:
        '操作列表头旁「注3」；行内蓝色文字链「被邀请人」；与「日返利统计」以「|」分隔。',
      dataRules:
        '跳转参数：inviterId（活动行 id）、inviterAccount（用户ID）。二级页被邀请人列表为人维度；每日明细含币种列与筛选。',
      exceptions: '无被邀请人 → 二级页表格空态「暂无被邀请人」；每日明细无数据 →「暂无每日明细」。',
      routing:
        '本页 → pc-invite-rebate-invitees（二级，侧栏不单独展示）；文档说明 → pc-invite-rebate-inviters-doc。',
    },
  },
  {
    id: 4,
    module: '列表筛选',
    feature: '身份',
    pageLocation: '筛选区「身份」标签旁「注4」；列表「身份」列',
    prd: {
      functionalLogic:
        '按邀请人当前身份过滤列表。普通会员：可正常参与邀请返利相关展示与下钻；代理：已成为代理的邀请人，仍可因曾成功邀请注册而出现在列表，但不参与计奖（计奖资格在每日明细按业务日判定）。',
      interactiveBehavior:
        '选择「全部 / 普通会员 / 代理」后点「搜索」→ 按 identity 精确过滤；点「清除」→ 身份恢复「全部」。可与用户ID、金刚号组合筛选。',
      visualPresentation:
        '标签「身份：」+ 下拉；旁侧「注4」。列表「身份」列展示普通会员 / 代理。',
      dataRules:
        '枚举：member=普通会员 | agent=代理；默认「全部」。与列表字段 identity 一致。',
      exceptions: '组合筛选无结果 → 空态，保留已填条件。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 5,
    module: '列表操作',
    feature: '日返利统计',
    pageLocation: '操作列表头旁「注5」；行内「日返利统计」',
    prd: {
      functionalLogic:
        '从当前邀请人进入日返利统计二级页，按邀请人汇总各业务日返利/领取/已过期/待领取（KKC / KKV / USDT 分列），不下钻单笔明细。返利金额口径与注2一致。',
      interactiveBehavior:
        '点击行内「日返利统计」→ 跳转日返利统计页，query 携带 inviterId、inviterAccount；二级页仅展示该邀请人数据。左上角「← 返回邀请列表」回到本页。',
      visualPresentation:
        '操作列表头旁「注5」；行内蓝色文字链「日返利统计」；与「被邀请人」以「|」分隔。',
      dataRules:
        '跳转参数：inviterId、inviterAccount。返利金额 = 可领取+已领取+已过期+已取消；领取/已过期/待领取/已取消按状态拆分；三币种不换算。',
      exceptions: '该邀请人无日汇总 → 二级页空态「暂无统计数据」。',
      routing:
        '本页 → pc-invite-rebate-stats（二级，侧栏不单独展示）；文档说明 → pc-invite-rebate-stats-doc。',
    },
  },
]

/** 注1 · 浮层简版 */
export const INVITE_REBATE_INVITER_INVITEE_COUNT_SPEC = [
  '下级人数 = 成功邀请并完成注册的用户数。',
  '仅当下级人数 > 0 时计入邀请列表。',
  '不含仅分享未注册的用户。',
] as const

/** 注2 · 浮层简版 */
export const INVITE_REBATE_INVITER_REBATE_SPEC = [
  '累计返利按 KKC / KKV / USDT 分列展示，不做跨币种折算。',
  '各列为该邀请人在对应币种下的已获返利汇总。',
  '计入状态：可领取 + 已领取 + 已过期 + 已取消；不含待解锁。',
  '无该币种返利时展示 0.00。',
] as const

/** 注3 · 浮层简版 */
export const INVITE_REBATE_INVITER_INVITEE_SPEC = [
  '点击「被邀请人」进入二级页，按当前邀请人（用户ID）过滤。',
  '二级页被邀请人列表为人维度；币种与每日门槛/返利在「详情」弹框查看。',
  '单笔预估 = 业务日被邀请人存款 × 业务日返利比例；列表累计返利口径见注2。',
] as const

/** 注4 · 浮层简版 */
export const INVITE_REBATE_INVITER_IDENTITY_SPEC = [
  '身份：普通会员 / 代理。',
  '可与用户ID、金刚号组合筛选。',
  '已成为代理的邀请人仍可因曾成功邀请注册出现在列表；计奖资格在每日明细判定。',
] as const

/** 注5 · 浮层简版 */
export const INVITE_REBATE_INVITER_DAILY_STATS_SPEC = [
  '点击「日返利统计」进入该邀请人的日汇总页。',
  '展示业务日期与三币种返利、领取、已过期、待领取、已取消金额，不下钻明细。',
  '返利金额口径同注2：可领取 + 已领取 + 已过期 + 已取消；不含待解锁。',
  '侧栏无独立菜单，仅从邀请列表行操作进入。',
] as const

export const INVITE_REBATE_INVITER_ANNOT_MAP: Record<
  InviteRebateInviterAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  inviteeCount: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.inviteeCount,
    title: '下级人数',
    items: INVITE_REBATE_INVITER_INVITEE_COUNT_SPEC,
  },
  rebateByCurrency: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.rebateByCurrency,
    title: '累计返利分币种',
    items: INVITE_REBATE_INVITER_REBATE_SPEC,
  },
  inviteeDrill: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.inviteeDrill,
    title: '被邀请人下钻',
    items: INVITE_REBATE_INVITER_INVITEE_SPEC,
  },
  identityFilter: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.identityFilter,
    title: '身份筛选',
    items: INVITE_REBATE_INVITER_IDENTITY_SPEC,
  },
  dailyStats: {
    no: INVITE_REBATE_INVITER_SPEC_ANNOT_NO.dailyStats,
    title: '日返利统计',
    items: INVITE_REBATE_INVITER_DAILY_STATS_SPEC,
  },
}
