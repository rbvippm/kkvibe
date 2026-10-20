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
  updatedAt: '2026-10-20',
  prdVersion: 'v1.4',
} as const

export const REBATE_AGENT_CONFIG_BACKGROUND = [
  '返佣代理仅一层（一级），后台按用户 ID 筛选列表，不发展下级代理。',
  '一级返佣代理不再配置赚取退水；新增和编辑时在弹框最底部配置彩票退水，交互与占成代理退水一致。',
] as const

export const REBATE_AGENT_CONFIG_GOALS = [
  '列表展示一级返佣代理，可按用户 ID 搜索，并可编辑已有代理的彩票退水。',
  '新增时固定为一级代理，无需选择级别或上级；彩票退水按占成代理规则填写。',
] as const

export const REBATE_AGENT_CONFIG_FEATURE_LIST: RebateAgentConfigFeatureRow[] = [
  {
    id: 1,
    module: '新增代理',
    feature: '新增返佣代理',
    pageLocation: '「+ 新增」弹框标题',
    prd: {
      functionalLogic:
        '搜索并选择用户后新增为一级返佣代理；无级别切换、无上级代理、无赚取退水。弹框最底部配置彩票退水，规则与占成代理退水一致。',
      interactiveBehavior:
        '输入用户ID搜索 -> 表格选择用户 -> 拖动彩票滑块或填写产品退水 -> 确认写入列表。校验失败留在弹框底部提示。取消/关闭不保存。确认成功后全局顶部提示「已新增返佣代理」。',
      visualPresentation:
        '弹框标题「新增返佣代理」旁「注1」；代理级别只读「1级代理」；最底部橙色区块「彩票退水」，内为彩票滑块与 SABA彩票、一分快三输入框。不展示赚取退水。',
      dataRules:
        '固定一级；无上级（展示为「-」）；自动生成代理后台账密。彩票滑块 0～100 的整数，拖动后按各产品上限的对应比例写入退水（保留两位小数）。SABA彩票上限 0.16%，一分快三上限 0.05%。产品可单独改，不超过自身上限，最多两位小数。默认滑块 0%，产品退水 0。',
      exceptions:
        '未选用户 -> 底部提示；用户已是返佣代理 -> 提示勿重复。产品退水为空、格式不符或超出上限 -> 字段下红色提示，底部提示具体区间，不关闭弹框。',
      routing: '确认成功关闭弹框并刷新列表；不跳转路由。',
    },
  },
  {
    id: 2,
    module: '编辑代理',
    feature: '编辑彩票退水',
    pageLocation: '列表操作「编辑」弹框标题',
    prd: {
      functionalLogic:
        '编辑已有一级返佣代理的彩票退水。用户、级别、后台账密不可改。退水规则与新增、占成代理退水一致。',
      interactiveBehavior:
        '列表点「编辑」-> 弹框回填当前彩票退水 -> 修改滑块或产品退水 ->「保存」。校验失败留在弹框。取消/关闭不保存。保存成功后全局顶部提示「已保存」。',
      visualPresentation:
        '弹框标题「编辑返佣代理」旁「注2」。只读展示用户名、用户ID、金刚号、代理级别；最底部与新增相同的「彩票退水」区块。',
      dataRules:
        '回填该代理已保存的彩票滑块和产品退水。滑块 0～100；SABA彩票 0～0.16%，一分快三 0～0.05%；最多两位小数。',
      exceptions:
        '产品退水为空、格式不符或超出上限 -> 字段下红色提示，底部提示具体区间，不关闭弹框、不写入列表。',
      routing: '保存成功关闭弹框，列表仍停留当前筛选结果；不跳转路由。再次编辑看到刚保存的退水。',
    },
  },
]

export const REBATE_AGENT_CONFIG_SPEC_ANNOT_NO = {
  addModal: 1,
  editModal: 2,
} as const

export type RebateAgentConfigAnnotContext = keyof typeof REBATE_AGENT_CONFIG_SPEC_ANNOT_NO

export const REBATE_AGENT_CONFIG_ADD_MODAL_SPEC = [
  '搜索用户并选择后新增一级返佣代理。',
  '级别固定一级；不配置赚取退水；无上级代理选择。',
  '最底部配置彩票退水：滑块 0-100%，拖动后按产品上限带出；SABA彩票 0-0.16%，一分快三 0-0.05%，可单独改。',
] as const

export const REBATE_AGENT_CONFIG_EDIT_MODAL_SPEC = [
  '只编辑该代理的彩票退水，用户与级别只读。',
  '退水规则与新增、占成代理一致：滑块按上限带出，产品可单独改且不超过上限。',
] as const

export const REBATE_AGENT_CONFIG_ANNOT_MAP: Record<
  RebateAgentConfigAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  addModal: {
    no: REBATE_AGENT_CONFIG_SPEC_ANNOT_NO.addModal,
    title: '新增返佣代理',
    items: REBATE_AGENT_CONFIG_ADD_MODAL_SPEC,
  },
  editModal: {
    no: REBATE_AGENT_CONFIG_SPEC_ANNOT_NO.editModal,
    title: '编辑返佣代理',
    items: REBATE_AGENT_CONFIG_EDIT_MODAL_SPEC,
  },
}
