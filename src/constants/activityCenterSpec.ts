/** 活动中心 · PRD 与功能清单（六大核心维度）
 * 与页面「注1」「注2」一一对应；不含【文档说明】入口。
 */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type ActivityCenterPrdDimension = PcPrdDimension
export type ActivityCenterFeatureRow = PcPrdFeatureRow

export type ActivityCenterAnnotContext = 'activityTypeFilter' | 'inviteRebateConfig'

export const ACTIVITY_CENTER_META = {
  title: '活动中心',
  module: '运营管理',
  updatedAt: '2026-07-21',
  prdVersion: 'v1.5',
} as const

/** 1. 需求背景 */
export const ACTIVITY_CENTER_BACKGROUND = [
  '运营需在后台统一配置与管理各类营销活动，并按渠道、类型、时间与状态筛选活动列表。',
  '「邀请好友充值返利（VIP阶梯自动版）」按币种配置邀请人/被邀请人门槛、邀请人返利比例与 VIP 日上限阶梯，并向邀请人按币种派发返利；仅双方均为普通会员时计奖，成为代理则取消资格。',
  '移动端展示约束：邀请人无任何代理身份时才展示返利相关数据；已通过「我的 → 代理邀请」加入代理团队则隐藏满足条件、累计返利、返利金额、明细入口与汇总条绑定币种胶囊。',
] as const

/** 2. 需求目标 */
export const ACTIVITY_CENTER_GOALS = [
  '列表筛选可按「邀请好友充值返利（VIP阶梯自动版）」过滤活动，快速定位该类配置（注1）。',
  '编辑/详情弹窗按币种配置：邀请人（历史累计存款 / 每日最低存款 / 绑定手机号 / 返利比例）、被邀请人（历史累计存款 / 每日最低存款）、VIP 日返利上限阶梯（注2）。',
  '明确计算、结算与上限：应发返利 = 被邀请人当天存款金额 × 邀请人返利比例；隔天 GMT+8 12:00 派发昨天返利（昨天双方每日最低存款与历史累计存款均须达标）；上限按计算日 23:59:59 被邀请人 VIP 快照，落库金额同步落库上限，超出各上限之和则扣减后派发。',
] as const

/** 页面「注N」编号登记（与 FEATURE_LIST.id、页面 WfSpecAnnot :no 一致） */
export const ACTIVITY_CENTER_SPEC_ANNOT_NO = {
  activityTypeFilter: 1,
  inviteRebateConfig: 2,
} as const

/** 3. 需求功能清单（与页面「注N」标注一一对应，不含文档入口） */
export const ACTIVITY_CENTER_FEATURE_LIST: ActivityCenterFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '活动类型',
    pageLocation: '筛选区「活动类型」标签旁「注1」',
    prd: {
      functionalLogic:
        '按活动类型过滤活动列表。类型枚举含「邀请好友充值返利（VIP阶梯自动版）」，用于筛选该类活动，并与新增/编辑表单、列表「活动类型」列共用文案。',
      interactiveBehavior:
        '下拉选择「全部」→ 不过滤类型；选择「邀请好友充值返利（VIP阶梯自动版）」后点「搜索」→ 仅展示 type=invite_recharge_rebate_vip 的行；点「重置」→ 类型恢复「全部」。',
      visualPresentation:
        '标签「活动类型：」+ 下拉（全部 / 注册送 / 邀请送 / 充值送 / 展示活动 / 邀请好友充值返利（VIP阶梯自动版））；标签旁「注1」。下拉宽度需容纳完整长文案。',
      dataRules:
        '枚举：register_bonus | invite_bonus | recharge_bonus | display | invite_recharge_rebate_vip；默认「全部」（空字符串）。Mock 含启用态示例活动「邀请好友充值返利」。',
      exceptions:
        '所选类型无匹配 → 表格空态，保留筛选条件不报错；类型文案过长时由加宽下拉展示全称，不截断关键词。',
      routing:
        '停留活动中心列表；点击行「编辑 / 查看详情」进入弹窗后可选中该类型并配置规则（见注2）。',
    },
  },
  {
    id: 2,
    module: '编辑活动',
    feature: '邀请好友充值返利配置',
    pageLocation: '编辑/详情弹窗标题旁「注2」；活动类型为邀请好友充值返利时展示规则区',
    prd: {
      functionalLogic:
        '当活动类型为「邀请好友充值返利（VIP阶梯自动版）」时，弹窗展示专属规则区。邀请人条件：历史累计存款、每日最低存款、绑定手机号、返利比例。被邀请人条件：历史累计存款、每日最低存款。活动条件按币种区分金额，并按币种向邀请人返利。仅双方均为普通会员时计算返利，任一方成为代理则取消返利资格。结算：隔天业务时区 GMT+8 12:00 派发昨天返利，且昨天双方每日最低存款均须达标，并且历史累计存款也要达标。应发返利 = 被邀请人当天存款金额 × 邀请人返利比例。返利上限取返利计算日 23:59:59 被邀请人 VIP 等级；落库当日返利金额时同步落库当日上限；若当日应发合计超过各被邀请人上限之和，扣减超出后再派发。',
      interactiveBehavior:
        '选择该活动类型 → 展开规则区；勾选币种后生成对应配置，多币种 Tab 切换。邀请人条件内配置返利比例；VIP 阶梯表可新增/删除行，每行设置方式（单个/区间/及以上）、VIP 等级、每日返利最高上限。点击「保存」执行校验，失败在弹窗内提示；成功关闭弹窗并刷新列表。详情态只读，摘要区说明资格、结算、计算与上限口径。',
      visualPresentation:
        '弹窗标题旁「注2」。规则区顶部说明资格 / 结算 / 计算 / 上限规则。分组：邀请人条件（含返利比例 %）、被邀请人条件、被邀请人 VIP 对应 · 邀请人日返利上限表（列：设置方式、VIP 等级、每日返利最高上限、操作）。金额输入后缀展示当前配置币种。',
      dataRules:
        '①按币种独立配置金额门槛、返利比例与 VIP 日上限，返利按该币种派发。②邀请人：绑定手机号（是/否）；为「是」时区号可多选且至少 1 个；历史累计存款、每日最低存款、返利比例（0～100%）。③被邀请人：历史累计存款、每日最低存款。④VIP 阶梯至少 1 行（VIP0～9），每行配置每日返利最高上限；应发返利 = 被邀请人当天存款金额 × 邀请人返利比例。⑤结算日校验「昨天」双方每日最低存款，且双方历史累计存款也须达标。⑥上限快照时点：返利计算日 23:59:59 被邀请人 VIP；派发时当日应发 ≤ 各被邀请人当日上限之和。⑦Mock 默认返利比例 1%。',
      exceptions:
        '未勾选币种 / 须绑手机却未选区号 / VIP 阶梯为空 / 金额为负 / 返利比例不在 0～100 / VIP 区间不合法 → 中文校验提示，不关闭弹窗。任一方为代理 → 不计奖、不展示移动端返利数据。',
      routing:
        '保存成功关闭弹窗并更新列表；无独立子路由。运营侧可从「邀请活动列表」查看用户ID+币种参与与每日明细；移动端返利展示与「双方均为会员、非代理」资格及代理邀请状态联动。',
    },
  },
]

/** 注1 · 浮层简版 */
export const ACTIVITY_CENTER_TYPE_FILTER_SPEC = [
  '活动类型筛选新增「邀请好友充值返利（VIP阶梯自动版）」。',
  '可选「全部」或具体类型过滤列表；该类型对应邀请好友充值返利（VIP 阶梯）规则配置。',
  '与表单「活动类型」、列表「活动类型」列枚举一致。',
] as const

/** 注2 · 浮层简版 · 邀请好友充值返利配置清单 */
export const ACTIVITY_CENTER_INVITE_REBATE_CONFIG_SPEC = [
  '邀请人条件：历史累计存款、每日最低存款、绑定手机号、返利比例；选「是」时须复选至少一个区号。',
  '被邀请人条件：历史累计存款、每日最低存款。',
  '按币种配置金额条件与返利比例，并按币种向邀请人返利；多币种用 Tab 分别配置。',
  'VIP 阶梯：每行配置每日返利最高上限（按被邀请人 VIP）。',
  '仅双方均为普通会员时计奖；任一方成为代理则取消返利资格。',
  '结算：隔天 GMT+8 12:00 派发昨天返利，且昨天双方每日最低存款均达标，并且历史累计存款也要达标。',
  '计算：应发返利 = 被邀请人当天存款金额 × 邀请人返利比例。',
  '上限：按计算日 23:59:59 被邀请人 VIP；落库金额同步落库上限；超出各上限之和则扣减后派发。',
] as const

/** 标注映射（供页面 / 文档复用） */
export const ACTIVITY_CENTER_ANNOT_MAP: Record<
  ActivityCenterAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  activityTypeFilter: {
    no: ACTIVITY_CENTER_SPEC_ANNOT_NO.activityTypeFilter,
    title: '活动类型 · 邀请好友充值返利',
    items: ACTIVITY_CENTER_TYPE_FILTER_SPEC,
  },
  inviteRebateConfig: {
    no: ACTIVITY_CENTER_SPEC_ANNOT_NO.inviteRebateConfig,
    title: '邀请好友充值返利 · 配置清单',
    items: ACTIVITY_CENTER_INVITE_REBATE_CONFIG_SPEC,
  },
}
