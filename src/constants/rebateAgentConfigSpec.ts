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
  updatedAt: '2026-07-29',
  prdVersion: 'v1.0',
} as const

export const REBATE_AGENT_CONFIG_BACKGROUND = [
  '返佣代理按层级管理团队，后台需支持按代理级别筛选与新增不同级别代理。',
  '代理级别共三级：1 级可配置赚取退水；2 / 3 级需指定上级代理，不配置赚取退水。',
] as const

export const REBATE_AGENT_CONFIG_GOALS = [
  '列表支持按代理级别（全部 / 1 级 / 2 级 / 3 级）筛选。',
  '新增时按级别展示差异化表单项：仅 1 级设置赚取退水，2 / 3 级选择上级。',
] as const

export const REBATE_AGENT_CONFIG_FEATURE_LIST: RebateAgentConfigFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '代理级别',
    pageLocation: '筛选区「代理级别」',
    prd: {
      functionalLogic: '按代理级别过滤返佣代理列表，支持查看全部或指定一级 / 二级 / 三级代理。',
      interactiveBehavior:
        '选择级别后点「搜索」过滤；选「全部」不过滤级别；点「清除」重置为全部。',
      visualPresentation: '标签「代理级别：」+ 下拉（全部 / 1级代理 / 2级代理 / 3级代理）；旁侧「注1」。',
      dataRules: '枚举共三级：1级代理 / 2级代理 / 3级代理；默认「全部」；与列表 agentLevel 精确匹配。',
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
        '搜索并选择用户后新增为返佣代理；按代理级别差异配置：仅 1 级设置赚取退水，2 / 3 级必选上级代理且不展示赚取退水。',
      interactiveBehavior:
        '输入用户ID搜索 -> 表格选择用户 -> 选代理级别；1 级选赚取退水，2 / 3 级选上级代理 -> 确认写入列表。取消/关闭不保存。',
      visualPresentation:
        '弹框标题「新增返佣代理」旁「注2」；表单项随级别切换显隐；无上级候选时提示先新增上级。',
      dataRules:
        '级别共三级；2 级上级须为启用中的 1 级代理，3 级上级须为启用中的 2 级代理；非 1 级赚取退水记为「-」。',
      exceptions:
        '未选用户/未选赚水或上级 -> 底部提示；用户已是返佣代理 -> 提示勿重复；无可用上级 -> 提示先新增上级。',
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
  '代理级别共三级：1级代理 / 2级代理 / 3级代理，可按级别筛选列表。',
  '选「全部」不过滤；配合「搜索」「清除」生效。',
] as const

export const REBATE_AGENT_CONFIG_ADD_MODAL_SPEC = [
  '搜索用户并选择后新增返佣代理；级别共三级。',
  '仅 1 级展示并必填「赚取退水」；2 / 3 级改选「上级代理」，不展示赚取退水入口。',
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
