/** 活动中心 · PRD 与功能清单（六大核心维度） */

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
  updatedAt: '2026-07-18',
  prdVersion: 'v1.2',
} as const

/** 1. 需求背景 */
export const ACTIVITY_CENTER_BACKGROUND = [
  '运营需在后台统一配置与管理各类营销活动，并按渠道、类型、时间与状态筛选活动列表。',
  '本次新增活动类型「邀请好友充值返利（VIP阶梯自动版）」：按「区号 ↔ 币种」绑定邀请人核算币种；被邀请人充值可跨币种，按实时汇率折算到邀请人绑定币种后核算门槛与返利，并与移动端邀请明细对齐。',
  '移动端展示约束：邀请人无任何代理身份时才展示返利相关数据；已通过「我的 → 代理邀请」加入代理团队则隐藏满足条件、累计返利、返利金额、明细入口与汇总条绑定币种胶囊（满足条件对应返利活动被邀请人门槛）。',
] as const

/** 2. 需求目标 */
export const ACTIVITY_CENTER_GOALS = [
  '列表筛选可按「邀请好友充值返利（VIP阶梯自动版）」过滤活动，快速定位该类配置。',
  '编辑/详情弹窗配置邀请人/被邀请人条件与 VIP 日返利上限；明确金额口径：邀请人侧按区号对应币种，被邀请人侧按充值币种×实时汇率折算为邀请人绑定币种。',
  '与会员代理身份联动：有代理身份的邀请人在移动端不展示该活动返利数据，避免与代理收益口径混淆。',
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
        '按活动类型过滤活动列表。本次在类型枚举中新增「邀请好友充值返利（VIP阶梯自动版）」，用于筛选该类活动，并与新增/编辑表单、列表「活动类型」列共用文案。',
      interactiveBehavior:
        '下拉选择「全部」-> 不过滤类型；选择「邀请好友充值返利（VIP阶梯自动版）」后点「搜索」-> 仅展示 type=invite_recharge_rebate_vip 的行；点「重置」-> 类型恢复「全部」。',
      visualPresentation:
        '标签「活动类型：」+ 下拉（全部 / 注册送 / 邀请送 / 充值送 / 展示活动 / 邀请好友充值返利（VIP阶梯自动版））；旁侧「注1」。下拉宽度需容纳完整长文案。',
      dataRules:
        '枚举：register_bonus | invite_bonus | recharge_bonus | display | invite_recharge_rebate_vip；默认「全部」（空字符串）。Mock 含启用态示例活动「邀请好友充值返利」。',
      exceptions: '所选类型无匹配 -> 表格空态，保留筛选条件不报错；类型文案过长时由加宽下拉展示全称，不截断关键词。',
      routing: '停留活动中心列表；点击行「编辑 / 查看详情」进入弹窗后可选中该类型并配置规则（见注2）。',
    },
  },
  {
    id: 2,
    module: '编辑活动',
    feature: '邀请好友充值返利配置',
    pageLocation: '编辑/详情弹窗标题旁「注2」；活动类型为邀请好友充值返利时展示规则区',
    prd: {
      functionalLogic:
        '当活动类型为「邀请好友充值返利（VIP阶梯自动版）」时，弹窗展示专属规则区：邀请人条件、被邀请人条件、VIP 日返利上限。返利仅发给邀请人。金额口径：邀请人侧所有门槛/上限/到账金额均以「区号对应币种」（邀请人绑定条件达成币种）计算；被邀请人充值金额以充值币种按实时汇率折算为该绑定币种后再比对门槛、计算返利与日上限截断。',
      interactiveBehavior:
        '选择该活动类型 -> 展开规则区；勾选币种后生成对应配置，多币种 Tab 切换。可新增/删除 VIP 阶梯行。点击「保存」执行校验，失败在弹窗内提示；成功关闭弹窗并刷新列表。详情态只读，摘要区说明币种换算口径。',
      visualPresentation:
        '弹窗标题旁「注2」。规则区标题与参与说明中写明币种换算口径。分组：邀请人条件、被邀请人条件、VIP 日返利上限表。金额输入后缀展示当前配置币种（即区号绑定币种）。',
      dataRules:
        '①区号 ↔ 币种绑定（默认 KKC↔86、KKV↔84、USDT↔1）；邀请人最低存款、日返利上限、派发返利均以该绑定币种计量。②被邀请人充值可为任意支持币种；实际充值 = 充值金额 × 充值当时实时汇率，结果折算为邀请人绑定币种后再校验历史累计门槛、按首充/复充比例计奖、按 VIP 档位截断日上限。③配置清单其余项：绑手机号、流水倍数、门槛、比例、VIP 阶梯（至少 1 行，VIP0～9）。',
      exceptions:
        '未勾选币种 / VIP 阶梯为空 / 区号非法 / 金额或比例为负 / VIP 区间不合法 -> 中文校验提示，不关闭弹窗。汇率缺失或为 0（联调期）-> 该笔暂不计奖并记异常日志（待接口确认）。',
      routing:
        '保存成功关闭弹窗并更新列表；无独立子路由。移动端返利明细展示「充值金额(充值币种) × 汇率 = 实际充值(邀请人绑定币种/法币)」与本口径一致。',
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
  '活动类型为「邀请好友充值返利（VIP阶梯自动版）」时展示专属规则配置区。',
  '邀请人金额口径：最低存款、日返利上限、到账返利等均以「区号对应币种」（绑定条件达成币种）计算。',
  '被邀请人金额口径：充值金额按充值币种 × 实时汇率，折算为邀请人绑定币种后再比对门槛、计奖与截断日上限。',
  '配置项：邀请人（绑手机号/区号/最低存款/流水倍数）；被邀请人（历史门槛/首充·复充比例）；VIP 日上限阶梯（至少 1 行）。',
  '多币种按 Tab 配置；未勾选币种或校验失败时弹窗内提示，不关闭。',
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
