/** 推广返利 · 返佣代理配置 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type RebateAgentConfigPrdDimension = PcPrdDimension
export type RebateAgentConfigFeatureRow = PcPrdFeatureRow

export const REBATE_AGENT_CONFIG_META = {
  title: '返佣代理配置',
  module: '推广返利',
  updatedAt: '2026-07-31',
  prdVersion: 'v1.2',
} as const

export const REBATE_AGENT_CONFIG_BACKGROUND = [
  '返佣代理仅一层（一级），后台按一级返佣代理筛选与新增，不发展下级代理。',
  '一级返佣代理不再配置赚取退水；新增时仅绑定用户并生成代理后台账密。',
] as const

export const REBATE_AGENT_CONFIG_GOALS = [
  '列表默认展示一级返佣代理，可按用户 ID 搜索。',
  '新增时固定为一级代理，无需选择赚取退水或上级。',
] as const

export const REBATE_AGENT_CONFIG_FEATURE_LIST: RebateAgentConfigFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '代理级别',
    pageLocation: '筛选区「代理级别」',
    prd: {
      functionalLogic: '返佣代理仅一级；筛选区固定展示「1级代理」，列表仅含一级数据。',
      interactiveBehavior:
        '代理级别下拉仅「1级代理」可选；配合用户ID搜索后点「搜索」过滤；点「清除」重置条件。',
      visualPresentation: '标签「代理级别：」+ 下拉（仅 1级代理）；旁侧「注1」。无上级代理ID、无赚取退水列。',
      dataRules: '枚举仅一级：1级代理；与列表 agentLevel=1 匹配。',
      exceptions: '无匹配记录 -> 表格空态「暂无返佣代理数据」。',
      routing: '停留列表页，不跳转。',
    },
  },
  {
    id: 2,
    module: '新增代理',
    feature: '新增返佣代理',
    pageLocation: '「+ 新增」弹框标题',
    prd: {
      functionalLogic:
        '搜索并选择用户后新增为一级返佣代理；无级别切换、无上级代理、无赚取退水配置。',
      interactiveBehavior:
        '输入用户ID搜索 -> 表格选择用户 -> 确认写入列表。取消/关闭不保存。',
      visualPresentation:
        '弹框标题「新增返佣代理」旁「注2」；代理级别只读「1级代理」；不展示赚取退水。',
      dataRules: '固定一级；无上级（展示为「-」）；自动生成代理后台账密。',
      exceptions:
        '未选用户 -> 底部提示；用户已是返佣代理 -> 提示勿重复。',
      routing: '确认成功关闭弹框并刷新列表；不跳转路由。',
    },
  },
]

export const REBATE_AGENT_CONFIG_SPEC_ANNOT_NO = {
  filterAgentLevel: 1,
  addModal: 2,
} as const

export type RebateAgentConfigAnnotContext = keyof typeof REBATE_AGENT_CONFIG_SPEC_ANNOT_NO

export const REBATE_AGENT_CONFIG_FILTER_AGENT_LEVEL_SPEC = [
  '返佣代理仅一级；筛选固定为「1级代理」，列表不展示二/三级。',
  '配合用户ID「搜索」「清除」生效；列表无赚取退水列。',
] as const

export const REBATE_AGENT_CONFIG_ADD_MODAL_SPEC = [
  '搜索用户并选择后新增一级返佣代理。',
  '级别固定一级；不配置赚取退水；无上级代理选择。',
] as const

export const REBATE_AGENT_CONFIG_ANNOT_MAP: Record<
  RebateAgentConfigAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filterAgentLevel: {
    no: REBATE_AGENT_CONFIG_SPEC_ANNOT_NO.filterAgentLevel,
    title: '代理级别',
    items: REBATE_AGENT_CONFIG_FILTER_AGENT_LEVEL_SPEC,
  },
  addModal: {
    no: REBATE_AGENT_CONFIG_SPEC_ANNOT_NO.addModal,
    title: '新增返佣代理',
    items: REBATE_AGENT_CONFIG_ADD_MODAL_SPEC,
  },
}
