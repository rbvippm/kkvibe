/** 小程序管理 · 通用模块管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type GameModulePrdDimension = PcPrdDimension
export type GameModuleFeatureRow = PcPrdFeatureRow

export const GAME_MODULE_META = {
  title: '小程序管理 · 通用模块管理',
  module: '小程序管理',
  updatedAt: '2026-09-22',
  prdVersion: 'v1.0',
} as const

export const GAME_MODULE_BACKGROUND = [
  '通用模块是小程序游戏目录的分类，例如热门、刮刮乐、STG-趣投。模块只管分类本身：授权渠道、支持币种与语种、多语名称、排序和启用状态。',
  '模块下挂的具体游戏在「通用产品管理」里配置。主播授权游戏时，分类也只读取这里启用中的模块。',
] as const

export const GAME_MODULE_GOALS = [
  '按渠道、币种、语种筛选模块，并支持新增、修改、删除与启用/禁用。',
  '模块可授权多个渠道；启用后才会出现在产品分类和主播授权游戏的分类里。',
] as const

export const GAME_MODULE_FEATURE_LIST: GameModuleFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '筛选',
    pageLocation: '筛选工具栏',
    prd: {
      functionalLogic: '按渠道、币种、语种缩小模块范围，核对某个渠道或币种下会露出哪些分类。',
      interactiveBehavior: '点「搜索」后按当前条件过滤；点「清除」恢复全量。改下拉后未点搜索，列表保持上次结果。',
      visualPresentation: '渠道可搜索下拉默认「全部」，币种默认「请选择币种」，语种默认「请选择语种」，右侧「搜索」「清除」「新增」。渠道标签旁「注1」。',
      dataRules:
        '渠道命中该模块已授权渠道之一；币种、语种命中该模块已勾选项之一。空值表示不限。币种枚举：USDT-TRON、KKC、KKV、X币。语种枚举：简体中文、繁体中文、英文、泰语、越南语。',
      exceptions: '无匹配时表格显示「暂无模块」，已选条件保留。',
      routing: '停留本页。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '新增',
    pageLocation: '工具栏「新增」',
    prd: {
      functionalLogic: '打开新增弹框，录入一个新的游戏分类。',
      interactiveBehavior: '点「新增」打开标题「新增」的弹框。校验通过后关闭弹框，列表插入新行，全局顶部提示「已新增模块『名称』」。',
      visualPresentation: '蓝色「新增」按钮旁「注2」。',
      dataRules:
        '默认勾选 USDT-TRON 与简体中文，状态关闭，排序 0，渠道为空，简体中文名称为空。模块 ID 保存时生成，格式 M 加递增数字，从现有最大号 +1，当前示例从 M10007 起。',
      exceptions: '必填未过时弹框不关闭，底部 hint 提示原因。',
      routing: '停留本页。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '模块列表',
    pageLocation: '模块表格',
    prd: {
      functionalLogic: '展示模块 ID、已授权渠道数、简体中文名、支持币种、支持语种、排序和启用状态，并提供修改、删除。',
      interactiveBehavior:
        '渠道数字打开「授权渠道」，确定后立即写回该行，全局顶部提示「已更新『名称』的授权渠道」。状态开关即时启用或禁用，全局顶部提示「已启用/已禁用『名称』」。点「修改」打开编辑弹框。点「删除」弹出确认，确定后从列表移除，全局顶部提示「已删除『名称』」。',
      visualPresentation:
        '列：模块ID / 渠道（蓝色数字链）/ 简体中文 / 支持币种 / 支持语种 / 排序 / 状态开关 / 操作（修改 | 删除）。表格上方「注3」。底栏显示「共 N 条」。',
      dataRules:
        '按排序升序，排序相同再按模块 ID。简体中文取 names.zh，空则显示「—」。币种、语种用顿号拼接。渠道列只显示数量。',
      exceptions: '无数据时「暂无模块」。本期删除不检查该模块下是否仍有产品。',
      routing: '停留本页。启用中的模块会进入通用产品分类和主播授权游戏的模块分类；禁用后这两处不再列出。',
    },
  },
  {
    id: 4,
    module: '弹框表单',
    feature: '新增/修改',
    pageLocation: '新增、修改弹框标题',
    prd: {
      functionalLogic: '配置支持币种、支持语种、已选语种的名称、排序、状态和授权渠道。',
      interactiveBehavior:
        '勾选语种后出现对应名称输入，取消勾选则隐藏该输入。点「点击授权」打开授权渠道，确定后回填本弹框，尚未写入列表。点「确定」校验通过后关闭：新增插入列表并提示「已新增模块『名称』」，修改覆盖原行并提示「已保存模块『名称』」。点遮罩或 × 关闭且不保存。',
      visualPresentation:
        '标题「新增」或「修改」旁「注4」。必填项带红色星号。渠道区显示「点击授权」；已选时列出「已授权 N 个渠道：名称」，未选显示「尚未授权渠道」。底部仅「确定」。校验失败在弹框底部 hint。',
      dataRules:
        '至少 1 个币种、1 个语种、每个已选语种的名称非空、至少 1 个渠道。排序为不小于 0 的整数。展示名优先简体中文，其次繁体、英文、泰语、越南语，都空则为「未命名模块」。',
      exceptions:
        '缺渠道提示「请至少授权 1 个渠道」；缺币种「请至少选择 1 个支持币种」；缺语种「请至少选择 1 个支持语种」；缺名称「请输入{语种}」；排序非法「排序须为不小于 0 的整数」。提示期间弹框不关闭。',
      routing: '确定成功关闭弹框并刷新列表。',
    },
  },
  {
    id: 5,
    module: '渠道授权',
    feature: '授权渠道',
    pageLocation: '授权渠道弹框标题',
    prd: {
      functionalLogic: '给模块勾选可投放的渠道。列表里打开会直接改该行；新增/修改弹框里打开只改当前表单草稿。',
      interactiveBehavior:
        '输入关键词后点「搜索」或回车过滤，并回到第 1 页。「全选」只作用于当前页：本页已全选时再点会取消本页，否则把本页并入已选。翻页不丢失其他页的勾选。点「确定」写回；点「取消」、× 或遮罩放弃本次勾选。从列表进入时确定后全局顶部提示「已更新『名称』的授权渠道」。',
      visualPresentation:
        '标题「授权渠道」旁「注5」。顶部灰色回显「模块名（模块ID）」；新增且尚未保存时只回显名称。工具栏为「渠道选择」输入框和「搜索」。勾选区左侧「全选」，右侧「已选：N」。渠道两列网格，底部分页。',
      dataRules:
        '渠道目录与主播渠道一致，按名称或渠道 ID 包含匹配。每页 8 条。「已选：N」统计全部已勾选，不限当前页。允许确定时一个都不选；若从新增/修改进入，表单保存时仍会要求至少 1 个渠道。',
      exceptions: '搜索无结果时显示「暂无匹配渠道」，全选禁用，不展示分页。',
      routing: '确定后关闭本弹框。从列表进入则回到列表；从新增/修改进入则回到原表单。',
    },
  },
]

export const GAME_MODULE_SPEC_ANNOT_NO = {
  filter: 1,
  addButton: 2,
  list: 3,
  modal: 4,
  channelAuth: 5,
} as const

export type GameModuleAnnotContext = keyof typeof GAME_MODULE_SPEC_ANNOT_NO

export const GAME_MODULE_ANNOT_MAP: Record<
  GameModuleAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filter: {
    no: 1,
    title: '筛选',
    items: ['按渠道、币种、语种筛选模块。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框。默认 USDT-TRON、简体中文、关闭状态、排序 0。', '保存后生成 M 开头的模块 ID。'],
  },
  list: {
    no: 3,
    title: '模块列表',
    items: [
      '展示模块 ID、渠道数、简体中文、币种、语种、排序和状态。',
      '渠道数字可改授权；开关即时启用/禁用；支持修改和删除。',
    ],
  },
  modal: {
    no: 4,
    title: '新增/修改',
    items: [
      '必填：至少 1 个币种、1 个语种、已选语种名称、排序、至少 1 个渠道。',
      '勾选语种后才出现对应名称。校验失败在弹框底部提示。',
    ],
  },
  channelAuth: {
    no: 5,
    title: '授权渠道',
    items: [
      '按渠道名称或 ID 搜索，每页 8 条。全选只作用于当前页。',
      '列表里确定立即保存；新增/修改里确定只回填表单。',
    ],
  },
}
