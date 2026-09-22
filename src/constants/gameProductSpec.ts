/** 小程序管理 · 通用产品管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type GameProductPrdDimension = PcPrdDimension
export type GameProductFeatureRow = PcPrdFeatureRow

export const GAME_PRODUCT_META = {
  title: '小程序管理 · 通用产品管理',
  module: '小程序管理',
  updatedAt: '2026-09-22',
  prdVersion: 'v1.0',
} as const

export const GAME_PRODUCT_BACKGROUND = [
  '通用产品是挂在通用模块下的具体游戏，例如 AG真人、奔驰宝马。一条产品有唯一产品 ID，可同时挂多个模块，并单独授权渠道。',
  '用户能否看到这款游戏，只看该产品授权了哪些渠道。主播授权游戏时按产品勾选，分类来自启用中的通用模块。',
] as const

export const GAME_PRODUCT_GOALS = [
  '按渠道、小程序、所属模块、语种、币种、横竖半屏筛选产品，并支持新增、编辑、删除与启用/禁用。',
  '产品可授权多个渠道、挂多个模块，并按小程序带出可选产品目录。',
] as const

export const GAME_PRODUCT_FEATURE_LIST: GameProductFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '筛选',
    pageLocation: '筛选工具栏',
    prd: {
      functionalLogic: '按渠道、小程序、所属模块、语种、币种、横/竖/半屏缩小产品范围。',
      interactiveBehavior: '点「搜索」后按当前条件过滤；点「清除」恢复全量。改条件后未点搜索，列表保持上次结果。',
      visualPresentation:
        '渠道可搜索下拉默认「全部」；小程序、语种、币种、横/竖/半屏默认「全部」；所属模块默认「请选择」。下一行「搜索」「清除」「新增」。渠道标签旁「注1」。',
      dataRules:
        '渠道命中已授权渠道之一；所属模块命中已挂模块之一；小程序、横竖半屏精确匹配；语种、币种命中已勾选项之一。空值表示不限。所属模块下拉只列启用中的通用模块。币种：KKC、KKV、USDT-TRON。语种：简体中文、繁体中文、英文、越南语、泰语。横竖半屏：竖屏、横屏、半屏。',
      exceptions: '无匹配时表格显示「暂无产品配置」，已选条件保留。',
      routing: '停留本页。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '新增',
    pageLocation: '工具栏「新增」',
    prd: {
      functionalLogic: '打开新增弹框，录入一款游戏产品。',
      interactiveBehavior: '点「新增」打开标题「新增」的弹框。校验通过后关闭弹框，列表插入新行，全局顶部提示「已新增产品『名称』」。',
      visualPresentation: '蓝色「新增」按钮旁「注2」。',
      dataRules:
        '默认勾选 KKC 与简体中文，横竖半屏为竖屏，状态开启，渠道和所属模块为空，名称为空。排序为当前最大排序 +1。产品 ID 保存时生成，格式 P 加递增数字，从现有最大号 +1，当前示例从 P 开头续号。',
      exceptions: '必填未过时弹框不关闭，底部 hint 提示原因。',
      routing: '停留本页。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '产品列表',
    pageLocation: '产品表格',
    prd: {
      functionalLogic: '展示产品 ID、已授权渠道数、所属模块、小程序、产品目录名、币种、语种、横竖半屏、排序和启用状态，并提供编辑、删除。',
      interactiveBehavior:
        '渠道数字打开「授权渠道」，确定后立即写回该行，全局顶部提示「已更新『名称』的授权渠道」。状态开关即时启用或禁用，全局顶部提示「已启用/已禁用『名称』」。点「编辑」打开编辑弹框。点「删除」弹出确认，确定后从列表移除，全局顶部提示「已删除『名称』」。',
      visualPresentation:
        '列：产品ID / 渠道（蓝色数字链）/ 所属模块 / 小程序 / 产品 / 币种标签 / 语种短标签 / 横/竖/半屏 / 排序 / 状态开关 / 操作（编辑 | 删除）。表格上方「注3」。底栏显示「共 N 条」。币种、语种为浅蓝标签。',
      dataRules:
        '按排序升序，排序相同再按产品 ID。所属模块用顿号拼接模块名。产品列取小程序目录名称，未选时显示「-」。语种短标签：中文、繁中、英文、越南语、泰语。展示名优先简体中文，其次繁体、英文，再退回产品目录名。',
      exceptions:
        '无数据时「暂无产品配置」。本期删除不检查该产品是否仍被主播授权。禁用只改本页开关，主播授权游戏仍按产品 ID 读取全部产品，不会因为禁用而消失。',
      routing: '停留本页。主播授权游戏按产品 ID 读取本列表；用户可见范围只看该产品的授权渠道。',
    },
  },
  {
    id: 4,
    module: '弹框表单',
    feature: '新增/编辑',
    pageLocation: '新增、编辑弹框标题',
    prd: {
      functionalLogic:
        '配置所属模块、支持币种与语种、各语种名称、小程序、横竖半屏、产品目录、后缀地址、排序、状态、授权渠道和 icon。',
      interactiveBehavior:
        '勾选语种后出现对应名称输入，取消勾选则隐藏。切换小程序会清空已选产品，产品下拉改为该小程序的目录；未选小程序时产品下拉禁用。点「点击授权」打开授权渠道，确定后只回填本弹框。点「保存」校验通过后关闭：新增插入列表并提示「已新增产品『名称』」，编辑覆盖原行并提示「已保存产品『名称』」。点「取消」、遮罩或 × 关闭且不保存。上传非图片时底部 hint「仅支持 jpg、png、webp」，不替换已有图。',
      visualPresentation:
        '标题「新增」或「编辑」旁「注4」。所属模块、币种、语种、小程序、排序、渠道带红色星号。渠道区显示「点击授权」；已选时列出「已授权 N 个渠道：名称」，未选显示「尚未授权渠道」。icon 为上传方块，右侧展示位置标签「群聊悬浮窗」「直播间悬浮窗」。底部「取消」「保存」。校验失败在弹框底部 hint。',
      dataRules:
        '至少 1 个渠道、1 个所属模块、1 个币种、1 个语种，且每个已选语种名称非空，小程序必选，排序为正整数。产品目录、后缀地址、icon 可空。所属模块勾选列出全部通用模块，含已禁用。目录示例：迷你游戏含奔驰宝马、水果机、炸金花；趣投含区块链星舰、飞行员；刮刮乐含刮刮乐半屏；JDB 捕鱼含飞行员；AG(PA)真人 转账、BBIN 老虎机暂无子产品。icon 接受 jpg、png、webp。',
      exceptions:
        '缺渠道「请至少授权 1 个渠道」；缺模块「请至少选择 1 个所属模块」；缺币种「请至少选择 1 个支持币种」；缺语种「请至少选择 1 个支持语种」；缺名称「请输入名称（语种）」；未选小程序「请选择小程序」；排序非法「排序须为正整数」。提示期间弹框不关闭。',
      routing: '保存成功关闭弹框并刷新列表。',
    },
  },
  {
    id: 5,
    module: '渠道授权',
    feature: '授权渠道',
    pageLocation: '授权渠道弹框标题',
    prd: {
      functionalLogic: '给产品勾选可投放的渠道。列表里打开会直接改该行；新增/编辑弹框里打开只改当前表单草稿。',
      interactiveBehavior:
        '输入关键词后点「搜索」或回车过滤，并回到第 1 页。「全选」只作用于当前页：本页已全选时再点会取消本页，否则把本页并入已选。翻页不丢失其他页的勾选。点「确定」写回；点「取消」、× 或遮罩放弃本次勾选。从列表进入时确定后全局顶部提示「已更新『名称』的授权渠道」。从表单进入且原先提示缺渠道时，确定后清掉该条 hint。',
      visualPresentation:
        '标题「授权渠道」旁「注5」。顶部灰色回显「产品名（产品ID）」；新增且尚未保存、还没有名称时回显「新增产品」。工具栏为「渠道选择」输入框和「搜索」。勾选区左侧「全选」，右侧「已选：N」。渠道两列网格，底部分页。',
      dataRules:
        '渠道目录与主播渠道一致，按名称或渠道 ID 包含匹配。每页 8 条。「已选：N」统计全部已勾选，不限当前页。允许确定时一个都不选；若从新增/编辑进入，保存时仍会要求至少 1 个渠道。',
      exceptions: '搜索无结果时显示「暂无匹配渠道」，全选禁用，不展示分页。',
      routing: '确定后关闭本弹框。从列表进入则回到列表；从新增/编辑进入则回到原表单。',
    },
  },
]

export const GAME_PRODUCT_SPEC_ANNOT_NO = {
  filter: 1,
  addButton: 2,
  list: 3,
  modal: 4,
  channelAuth: 5,
} as const

export type GameProductAnnotContext = keyof typeof GAME_PRODUCT_SPEC_ANNOT_NO

export const GAME_PRODUCT_ANNOT_MAP: Record<
  GameProductAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filter: {
    no: 1,
    title: '筛选',
    items: ['按渠道、小程序、所属模块、语种、币种、横竖半屏筛选。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框。默认 KKC、简体中文、竖屏、开启，排序为当前最大 +1。', '保存后生成 P 开头的产品 ID。'],
  },
  list: {
    no: 3,
    title: '产品列表',
    items: [
      '展示产品 ID、渠道数、所属模块、小程序、产品目录、币种、语种、横竖半屏、排序和状态。',
      '渠道数字可改授权；开关即时启用/禁用；支持编辑和删除。',
    ],
  },
  modal: {
    no: 4,
    title: '新增/编辑',
    items: [
      '必填：至少 1 个渠道、1 个所属模块、1 个币种、1 个语种及名称、小程序、正整数排序。',
      '切换小程序会清空产品。icon 仅支持 jpg、png、webp。',
    ],
  },
  channelAuth: {
    no: 5,
    title: '授权渠道',
    items: [
      '按渠道名称或 ID 搜索，每页 8 条。全选只作用于当前页。',
      '列表里确定立即保存；新增/编辑里确定只回填表单。',
    ],
  },
}
