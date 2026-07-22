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
  updatedAt: '2026-07-22',
  prdVersion: 'v1.12',
} as const

/** 1. 需求背景 */
export const ACTIVITY_CENTER_BACKGROUND = [
  '运营需在后台统一配置与管理各类营销活动，并按渠道、类型、时间与状态筛选活动列表。',
  '「邀请返利」采用次日双向充值解锁与限时手动领取：被邀请人 T 日有充值即生成待解锁奖金；T+1 日双方次日门槛达标且邀请人已绑手机后，于 T+1 12:00（GMT+7）起可手动领取；超领取有效期未领作废。',
  '移动端展示约束：邀请人无任何代理身份时才展示返利相关数据；已通过「我的 → 代理邀请」加入代理团队则隐藏累计返利、返利金额、明细入口。',
] as const

/** 2. 需求目标 */
export const ACTIVITY_CENTER_GOALS = [
  '列表筛选可按「邀请返利」过滤活动，快速定位该类配置（注1）。',
  '编辑/详情弹窗按币种配置：T日返利触发门槛-被邀请人、次日解锁门槛（被邀请人/邀请人）、绑定手机号、业务日返利比例、提现流水倍数、奖励领取有效期、VIP 日上限阶梯（注2）。',
  '明确生成 / 解锁 / 领取：T 日充值 > 0 即落库待解锁；解锁须三条件同时满足；T+1 12:00 起手动领取；expireAt = startOfDay(T+1)+(X===0?1:X)×1day；预估奖金 = min(T日充值×比例, VIP日上限)；修改配置仅影响新生成记录。',
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
        '按活动类型过滤活动列表。类型枚举含「邀请返利」，用于筛选该类活动，并与新增/编辑表单、列表「活动类型」列共用文案。',
      interactiveBehavior:
        '下拉选择「全部」→ 不过滤类型；选择「邀请返利」后点「搜索」→ 仅展示 type=invite_recharge_rebate_vip 的行；点「重置」→ 类型恢复「全部」。',
      visualPresentation:
        '标签「活动类型：」+ 下拉（全部 / 注册送 / 邀请送 / 充值送 / 展示活动 / 邀请返利）；标签旁「注1」。',
      dataRules:
        '枚举：register_bonus | invite_bonus | recharge_bonus | display | invite_recharge_rebate_vip；默认「全部」（空字符串）。展示文案「邀请返利」。Mock 含启用态示例活动「邀请好友充值返利」。',
      exceptions:
        '所选类型无匹配 → 表格空态，保留筛选条件不报错。',
      routing:
        '停留活动中心列表；点击行「编辑 / 查看详情」进入弹窗后可选中该类型并配置规则（见注2）。',
    },
  },
  {
    id: 2,
    module: '编辑活动',
    feature: '邀请返利配置',
    pageLocation: '编辑/详情弹窗标题旁「注2」；活动类型为「邀请返利」时展示规则区',
    prd: {
      functionalLogic:
        '当活动类型为「邀请返利」时，弹窗展示专属规则区。配置项：T日返利触发门槛-被邀请人（蓄力展示，未达也生成记录）、次日解锁门槛-被邀请人、次日解锁门槛-邀请人、绑定手机号、业务日返利比例、提现流水倍数、奖励领取有效期（天）。VIP 日上限阶梯保持既有结构。仅双方均为普通会员时计奖，任一方成为代理则取消资格。流程：T 日生成待解锁 → T+1 三条件解锁 → T+1 12:00（GMT+7）起手动领取 → 超有效期作废。预估奖金 = min(被邀请人 T 日充值 × 比例, VIP 日上限)。修改配置仅影响新生成记录。',
      interactiveBehavior:
        '选择该活动类型 → 展开规则区；勾选币种后生成对应配置，多币种 Tab 切换。字段旁展示运营提示。VIP 阶梯表可新增/删除行。点击「保存」执行校验，失败在弹窗内提示；成功关闭弹窗并刷新列表。详情态只读，摘要区说明生成 / 解锁 / 领取口径。',
      visualPresentation:
        '弹窗标题旁「注2」。规则区顶部说明资格与次日解锁领取流程。解锁与领取条件按三块分区：邀请人（绑定手机号、次日解锁门槛）、被邀请人（T日返利触发门槛、次日解锁门槛）、领取与发放（业务日返利比例、提现流水倍数、奖励领取有效期）；其下为被邀请人 VIP 对应 · 邀请人日返利上限表。金额输入后缀展示当前配置币种；字段下方灰色提示文案单行展示。',
      dataRules:
        '①按币种独立配置。②T日返利触发门槛-被邀请人 ≥0：仅展示用，充值>0 即生成待解锁。③次日解锁门槛（邀请人/被邀请人）≥0。④绑定手机号为「是」时区号至少 1 个。⑤业务日返利比例 0～100%。⑥提现流水倍数整数 ≥0（0=无流水）。⑦奖励领取有效期整数 0～30；expireAt = startOfDay(T+1)+(X===0?1:X)×1day。⑧VIP 阶梯至少 1 行，结构不变。⑨Mock 默认比例 1%、流水 1、有效期 1 天。',
      exceptions:
        '未勾选币种 / 须绑手机却未选区号 / VIP 阶梯为空 / 金额为负 / 比例不在 0～100 / 流水或有效期非法 / VIP 区间不合法 → 中文校验提示，不关闭弹窗。任一方为代理 → 不计奖、不展示移动端返利数据。',
      routing:
        '保存成功关闭弹窗并更新列表；无独立子路由。运营侧从「邀请列表」查看每日明细（待解锁/可领取/已领取/已过期）；移动端支持手动领取。',
    },
  },
]

/** 注1 · 浮层简版 */
export const ACTIVITY_CENTER_TYPE_FILTER_SPEC = [
  '活动类型筛选新增「邀请返利」。',
  '可选「全部」或具体类型过滤列表；该类型对应次日解锁 + 限时领取规则配置。',
  '与表单「活动类型」、列表「活动类型」列枚举一致。',
] as const

/** 注2 · 浮层简版 · 邀请返利配置清单 */
export const ACTIVITY_CENTER_INVITE_REBATE_CONFIG_SPEC = [
  'T日返利触发门槛-被邀请人：蓄力展示线；未达也生成待解锁记录。',
  '次日解锁门槛-被邀请人 / 次日解锁门槛-邀请人：T+1 日双方须同时达标。',
  '绑定手机号：解锁条件；选「是」时须复选至少一个区号。',
  '奖励领取有效期：自 T+1 日起算；0 表示次日当晚失效；X=0 与 X=1 均在 T+2 00:00 作废。',
  '提现流水倍数：0 表示领取后无流水限制。',
  '领取开放：T+1 日 12:00（GMT+7）；须三条件齐且未过期，邀请人手动领取。',
  'VIP 阶梯：每日返利最高上限（结构不变）；预估 = min(T日充值×比例, 上限)。',
  '仅双方均为普通会员时计奖；任一方成为代理则取消返利资格。修改配置仅影响新生成记录。',
] as const

/** 标注映射（供页面 / 文档复用） */
export const ACTIVITY_CENTER_ANNOT_MAP: Record<
  ActivityCenterAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  activityTypeFilter: {
    no: ACTIVITY_CENTER_SPEC_ANNOT_NO.activityTypeFilter,
    title: '活动类型 · 邀请返利',
    items: ACTIVITY_CENTER_TYPE_FILTER_SPEC,
  },
  inviteRebateConfig: {
    no: ACTIVITY_CENTER_SPEC_ANNOT_NO.inviteRebateConfig,
    title: '邀请返利 · 配置清单',
    items: ACTIVITY_CENTER_INVITE_REBATE_CONFIG_SPEC,
  },
}
