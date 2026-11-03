/** 贵宾厅管理 · 模块管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type VipHallModulePrdDimension = PcPrdDimension
export type VipHallModuleFeatureRow = PcPrdFeatureRow

export const VIP_HALL_MODULE_META = {
  title: '贵宾厅管理 · 模块管理',
  module: '贵宾厅管理',
  updatedAt: '2026-11-03',
  prdVersion: 'v1.5',
} as const

export const VIP_HALL_MODULE_BACKGROUND = [
  '尊享专区首页卡片（金刚体育、皇者彩票、真人、老虎机、赌厅服务）对应后台「模块」。模块维护卡片自身：授权渠道、类型（游戏 / 赌厅）、图片、多语名称与描述、投放范围。',
  '模块下挂的具体游戏 / 赌厅链接在「产品管理」中选择产品后配置，二者拆开避免一张表同时管卡片和跳转。',
  '渠道授权与「小程序管理 · 通用模块管理」一致：一个模块可授权多个渠道，列表点渠道数字即可改授权。',
] as const

export const VIP_HALL_MODULE_GOALS = [
  '提供模块列表，支持按渠道、语种、币种筛选，以及新增、查看详情、编辑、删除与启用/禁用。',
  '新增/编辑时授权渠道，并配置类型、移动端/PC 图片、支持币种语种、多语名称与描述、排序。',
  '模块可授权多个渠道，列表和表单都能打开「授权渠道」弹框。',
]

export const VIP_HALL_MODULE_FEATURE_LIST: VipHallModuleFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '筛选',
    pageLocation: '筛选工具栏',
    prd: {
      functionalLogic: '按渠道、语种、币种缩小模块范围，核对某个渠道下尊享专区将展示的卡片。',
      interactiveBehavior: '点「搜索」应用条件；点「清除」恢复全量。未点搜索不立刻过滤。',
      visualPresentation: '渠道可搜索下拉默认「全部」，语种、币种下拉默认「全部」，下一行「搜索」「清除」「+ 新增」。渠道标签旁「注1」。',
      dataRules:
        '渠道命中该模块已授权渠道之一；语种、币种命中行内已选项之一。空值表示不限。渠道目录与主播渠道一致。币种枚举为「信用额度-CNY」「信用额度-USD」。',
      exceptions: '无匹配时显示「暂无模块数据」，保留已选条件。',
      routing: '停留本页。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '新增',
    pageLocation: '工具栏「+ 新增」',
    prd: {
      functionalLogic: '打开新增弹框，录入模块卡片后写入列表。',
      interactiveBehavior: '点击「+ 新增」打开标题「新增」的弹框；确认成功后关闭并刷新列表。',
      visualPresentation: '绿色描边「+ 新增」。旁侧「注2」。',
      dataRules:
        '默认未授权渠道、类型游戏、币种信用额度-CNY、语种简体中文、启用、排序为当前最大 +1。模块 ID 保存时生成，格式 M 加数字，取本表现有最大号 +1，当前示例从 M10006 起。',
      exceptions: '校验失败弹框不关闭，底部提示。',
      routing: '停留本页。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '模块列表',
    pageLocation: '列表表格区域',
    prd: {
      functionalLogic: '展示模块 ID、已授权渠道数、类型、图片、中文名称、币种、语种、排序与状态。',
      interactiveBehavior:
        '渠道数字打开「授权渠道」，确定后立即写回该行，全局顶部提示「已更新『名称』的授权渠道」。状态开关即时启用/禁用；「查看详情」只读回填；「编辑」可改；「删除」二次确认。若模块下仍有产品，删除时提示先清理产品。',
      visualPresentation:
        '列：模块ID / 渠道（蓝色数字链）/ 类型 / 图片 / 中文名称 / 币种标签 / 语种标签 / 排序 / 状态开关 / 操作。模块ID 单行不换行。旁侧「注3」。',
      dataRules:
        '模块 ID 格式 M 加数字，例如 M10001，只要求在贵宾厅模块表内唯一，不要求全局唯一，可与「小程序管理 · 通用模块管理」的模块 ID 相同。产品通过模块 ID 关联本表。渠道列只显示已授权数量。中文名称取简体，无则繁体/英文；按排序升序。图片缺失展示「无图」。',
      exceptions: '无数据 -> 「暂无模块数据」。',
      routing: '停留本页。产品管理通过所属模块关联本列表。',
    },
  },
  {
    id: 4,
    module: '弹框表单',
    feature: '新增/编辑/详情',
    pageLocation: '弹框标题',
    prd: {
      functionalLogic:
        '配置授权渠道、类型（游戏 / 赌厅）、移动端/PC 图片、支持币种语种、已选语种名称与描述、排序与状态。详情态只读。',
      interactiveBehavior:
        '点「点击授权」打开授权渠道，确定后只回填本弹框，尚未写入列表。勾选语种后出现对应名称与描述；图片移动端与 PC 必填。保存后同步该模块下产品类型。详情仅「关闭」，不显示「点击授权」；新增/编辑「取消 / 确定」。',
      visualPresentation:
        '标题「新增 / 编辑 / 查看详情」旁「注4」。渠道放在表单最底部、排序下方：「点击授权」，已选时列出「已授权 N 个渠道：名称」，未选显示「尚未授权渠道」。上传区分移动端 / PC 两列；图片限制 jpg、png、webp，不限制大小。',
      dataRules: '至少 1 个渠道；类型、币种、语种、已选语种名称与描述、图片双端、排序（正整数）必填。币种枚举为信用额度-CNY、信用额度-USD。',
      exceptions:
        '按表单从上到下校验，渠道最后校验：缺渠道提示「请至少授权 1 个渠道」，授权后自动清掉该提示。缺其他必填或格式不符 -> 中文提示，不关闭。点 × / 取消不保存。',
      routing: '确定成功关闭弹框并刷新列表。',
    },
  },
  {
    id: 5,
    module: '渠道授权',
    feature: '授权渠道',
    pageLocation: '授权渠道弹框标题',
    prd: {
      functionalLogic: '给模块勾选可投放的渠道，逻辑与「小程序管理 · 通用模块管理」一致。列表里打开会直接改该行；新增/编辑弹框里打开只改当前表单草稿。',
      interactiveBehavior:
        '输入关键词后点「搜索」或回车过滤，并回到第 1 页。「全选」只作用于当前页：本页已全选时再点会取消本页，否则把本页并入已选。翻页不丢失其他页的勾选。点「确定」写回；点「取消」、× 或遮罩放弃本次勾选。从列表进入时确定后全局顶部提示「已更新『名称』的授权渠道」。',
      visualPresentation:
        '标题「授权渠道」旁「注5」。顶部灰色回显模块中文名称；新增且尚未填写名称时回显「新增模块」。工具栏为「渠道选择」输入框和「搜索」。勾选区左侧「全选」，右侧「已选：N」。渠道两列网格，底部分页。',
      dataRules:
        '渠道目录与主播渠道一致，按名称或渠道 ID 包含匹配。每页 8 条。「已选：N」统计全部已勾选，不限当前页。允许确定时一个都不选；若从新增/编辑进入，表单保存时仍会要求至少 1 个渠道。',
      exceptions: '搜索无结果时显示「暂无匹配渠道」，全选禁用，不展示分页。',
      routing: '确定后关闭本弹框。从列表进入则回到列表；从新增/编辑进入则回到原表单。',
    },
  },
]

export const VIP_HALL_MODULE_SPEC_ANNOT_NO = {
  filter: 1,
  addButton: 2,
  list: 3,
  modal: 4,
  channelAuth: 5,
} as const

export type VipHallModuleAnnotContext = keyof typeof VIP_HALL_MODULE_SPEC_ANNOT_NO

export const VIP_HALL_MODULE_ANNOT_MAP: Record<
  VipHallModuleAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filter: {
    no: 1,
    title: '筛选',
    items: ['按渠道、语种、币种筛选模块，渠道命中已授权渠道之一即可。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框，配置尊享专区模块卡片。', '默认未授权渠道、信用额度-CNY、简体中文、启用。保存后在本表内续号生成 M 开头的模块 ID。'],
  },
  list: {
    no: 3,
    title: '模块列表',
    items: [
      '展示模块 ID、渠道数、类型、图片、中文名称、币种、语种、排序与状态。模块 ID 只在本表内唯一。',
      '渠道数字可改授权；支持查看详情、编辑、删除与状态开关。',
    ],
  },
  modal: {
    no: 4,
    title: '新增/编辑/详情',
    items: [
      '必填：类型、币种、语种、名称、描述、双端图片、排序、至少 1 个渠道。',
      '渠道在最底部，「点击授权」只回填表单；类型决定产品页回显游戏或赌厅；详情只读。',
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
