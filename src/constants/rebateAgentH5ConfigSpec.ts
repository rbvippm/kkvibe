/** 推广返利 · 返佣代理 H5 配置 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type RebateAgentH5ConfigPrdDimension = PcPrdDimension
export type RebateAgentH5ConfigFeatureRow = PcPrdFeatureRow

export const REBATE_AGENT_H5_CONFIG_META = {
  title: '返佣代理H5配置',
  module: '推广返利',
  updatedAt: '2026-08-03',
  prdVersion: 'v1.0',
} as const

export const REBATE_AGENT_H5_CONFIG_BACKGROUND = [
  '返佣代理端以 H5 包热更新方式发布，运营需在后台维护版本包、兼容 App 版本与上下线状态。',
  '同一时期通常仅一份上线包对客户端生效；历史版本保留便于回滚与追溯。',
] as const

export const REBATE_AGENT_H5_CONFIG_GOALS = [
  '提供 H5 包版本列表，支持新增、编辑、删除与上下线。',
  '新增/编辑时可填写版本号、兼容 App 最小版本、更新描述，并上传 zip 安装包。',
] as const

export const REBATE_AGENT_H5_CONFIG_FEATURE_LIST: RebateAgentH5ConfigFeatureRow[] = [
  {
    id: 1,
    module: '列表操作',
    feature: '新增',
    pageLocation: '工具栏「+ 新增」',
    prd: {
      functionalLogic: '打开新增弹框，录入版本信息并上传 zip 包后写入列表。',
      interactiveBehavior:
        '点击「+ 新增」-> 打开标题为「新增」的弹框；确认成功后关闭弹框并刷新列表。',
      visualPresentation: '绿色描边「+ 新增」按钮；旁侧「注1」。',
      dataRules: '新增默认上线/下线为关（下线）；创建时间、更新时间写入当前时间。',
      exceptions: '校验失败时弹框不关闭，底部或字段旁提示。',
      routing: '停留本页，不跳转。',
    },
  },
  {
    id: 2,
    module: '列表展示',
    feature: '版本列表',
    pageLocation: '列表表格区域',
    prd: {
      functionalLogic:
        '展示全部 H5 配置版本；操作列提供编辑、删除；上线/下线列展示当前状态文案。',
      interactiveBehavior:
        '点击「编辑」打开编辑弹框回填；点击「删除」二次确认后移除该行。',
      visualPresentation:
        '列：编号 / 版本号 / 兼容APP最小版本号 / 更新描述 / 上线/下线 / 更新时间 / 创建时间 / 操作；旁侧「注2」。空字段展示「-」。',
      dataRules: '版本号列表不带 V 前缀；状态文案为「上线」或「下线」。',
      exceptions: '无数据 -> 表格空态「暂无 H5 配置数据」。',
      routing: '停留本页。',
    },
  },
  {
    id: 3,
    module: '弹框表单',
    feature: '新增/编辑',
    pageLocation: '新增/编辑弹框标题',
    prd: {
      functionalLogic:
        '配置版本号、兼容 App 最小版本、更新描述、zip 安装包与上下线开关，确认后保存。',
      interactiveBehavior:
        '必填项未填或未上传 zip -> 提示并阻止提交；点击上传仅接受 .zip（原型本地 Mock）；开关切换上线/下线。',
      visualPresentation:
        '标题「新增」或「编辑」旁「注3」；版本号与兼容版本带「V」前缀输入；兼容版本旁红色「!!! 注意事项」；底部居中「确认」。',
      dataRules:
        '版本号、兼容APP最小版本号、安装包必填；更新描述选填；编辑时可保留已上传文件。',
      exceptions: '非 zip 文件 -> 提示仅支持 zip；重复版本号（待接口确认）原型允许并存。',
      routing: '确认成功关闭弹框；点 × 关闭不保存。',
    },
  },
]

export const REBATE_AGENT_H5_CONFIG_SPEC_ANNOT_NO = {
  addButton: 1,
  list: 2,
  modal: 3,
} as const

export type RebateAgentH5ConfigAnnotContext = keyof typeof REBATE_AGENT_H5_CONFIG_SPEC_ANNOT_NO

export const REBATE_AGENT_H5_CONFIG_ADD_BUTTON_SPEC = [
  '点击打开「新增」弹框，录入版本并上传 zip 包。',
  '默认下线；确认后写入列表顶部。',
] as const

export const REBATE_AGENT_H5_CONFIG_LIST_SPEC = [
  '展示版本、兼容 App 最小版本、更新描述、上下线状态与时间。',
  '操作：编辑回填弹框；删除需二次确认。',
] as const

export const REBATE_AGENT_H5_CONFIG_MODAL_SPEC = [
  '版本号、兼容 App 最小版本、安装包（zip）必填；更新描述选填。',
  '开关控制上线/下线；兼容版本旁展示注意事项提示。',
] as const

export const REBATE_AGENT_H5_CONFIG_ANNOT_MAP: Record<
  RebateAgentH5ConfigAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  addButton: {
    no: REBATE_AGENT_H5_CONFIG_SPEC_ANNOT_NO.addButton,
    title: '新增',
    items: REBATE_AGENT_H5_CONFIG_ADD_BUTTON_SPEC,
  },
  list: {
    no: REBATE_AGENT_H5_CONFIG_SPEC_ANNOT_NO.list,
    title: '版本列表',
    items: REBATE_AGENT_H5_CONFIG_LIST_SPEC,
  },
  modal: {
    no: REBATE_AGENT_H5_CONFIG_SPEC_ANNOT_NO.modal,
    title: '新增/编辑',
    items: REBATE_AGENT_H5_CONFIG_MODAL_SPEC,
  },
}
