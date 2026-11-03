/** 贵宾厅管理 · 产品管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type VipHallProductPrdDimension = PcPrdDimension
export type VipHallProductFeatureRow = PcPrdFeatureRow

export const VIP_HALL_PRODUCT_META = {
  title: '贵宾厅管理 · 产品管理',
  module: '贵宾厅管理',
  updatedAt: '2026-11-03',
  prdVersion: 'v1.7',
} as const

export const VIP_HALL_PRODUCT_BACKGROUND = [
  '产品挂在模块下，决定尊享专区点「立即游戏」后进入哪款游戏或哪条赌厅链接。游戏类通过小程序 + 产品选择；赌厅类配置跳转地址。',
  '产品需单独上传移动端与 PC 端 icon，用于尊享专区产品入口展示。',
  '渠道授权与「小程序管理 · 通用产品管理」一致：一个产品可授权多个渠道，用户能否看到该产品只看产品自己的授权渠道。',
] as const

export const VIP_HALL_PRODUCT_GOALS = [
  '提供产品列表，支持按渠道、小程序、所属模块、语种、币种筛选，以及新增、查看详情、编辑、删除与启用/禁用。',
  '新增/编辑时先授权渠道、选所属模块，类型由模块回显；游戏须选择小程序和产品；赌厅须填跳转地址。',
  '产品可授权多个渠道，列表和表单都能打开「授权渠道」弹框。',
]

export const VIP_HALL_PRODUCT_FEATURE_LIST: VipHallProductFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '筛选',
    pageLocation: '筛选工具栏',
    prd: {
      functionalLogic: '按渠道、小程序、所属模块、语种、币种缩小产品范围。',
      interactiveBehavior: '点「搜索」应用；点「清除」恢复全量。未点搜索不立刻过滤。',
      visualPresentation: '渠道可搜索下拉 + 四个下拉，默认「全部」，下一行「搜索」「清除」「+ 新增」。渠道标签旁「注1」。',
      dataRules:
        '渠道命中该产品已授权渠道之一；语种、币种命中已选项之一；小程序、所属模块精确匹配。空值表示不限。币种枚举为「信用额度-CNY」「信用额度-USD」。小程序仅匹配游戏类产品；赌厅无小程序，选小程序时不出现。',
      exceptions: '无匹配 -> 「暂无产品数据」。',
      routing: '停留本页。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '新增',
    pageLocation: '工具栏「+ 新增」',
    prd: {
      functionalLogic: '打开新增弹框，选择模块与产品后写入列表。',
      interactiveBehavior: '点击「+ 新增」打开「新增」弹框；确认成功后关闭并刷新。',
      visualPresentation: '绿色描边「+ 新增」。旁侧「注2」。',
      dataRules:
        '默认未授权渠道、未选模块、信用额度-CNY、简体中文、启用、排序为当前最大 +1。产品 ID 保存时生成，格式 P 加数字，取本表现有最大号 +1，当前示例从 P10009 起。',
      exceptions: '无可用模块时仍可打开弹框，提交时提示先建模块。',
      routing: '停留本页。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '产品列表',
    pageLocation: '列表表格区域',
    prd: {
      functionalLogic: '展示产品 ID、已授权渠道数、所属模块、所选产品、类型、币种、语种、排序与状态。',
      interactiveBehavior:
        '渠道数字打开「授权渠道」，确定后立即写回该行，全局顶部提示「已更新『名称』的授权渠道」。状态开关即时生效；查看详情只读；编辑回填；删除二次确认。',
      visualPresentation:
        '列：产品ID / 渠道（蓝色数字链）/ 所属模块 / 产品 / 类型 / 币种 / 语种 / 排序 / 状态 / 操作。产品ID 单行不换行。旁侧「注3」。',
      dataRules:
        '产品 ID 格式 P 加数字，例如 P10001，只要求在贵宾厅产品表内唯一，不要求全局唯一，可与「小程序管理 · 通用产品管理」的产品 ID 相同。渠道列只显示已授权数量。产品列优先展示已配置中文名称；无则回退目录名或跳转地址。类型取所属模块。按排序升序。',
      exceptions: '无数据 -> 「暂无产品数据」。模块已删则所属模块展示「-」。',
      routing: '停留本页。所属模块来自模块管理。',
    },
  },
  {
    id: 4,
    module: '弹框表单',
    feature: '新增/编辑/详情',
    pageLocation: '弹框标题',
    prd: {
      functionalLogic:
        '配置授权渠道、所属模块、币种语种、已选语种名称与描述。类型由模块回显：游戏选小程序与产品、后缀选填；赌厅填跳转地址。icon 双端必填。',
      interactiveBehavior:
        '点「点击授权」打开授权渠道，确定后只回填本弹框，尚未写入列表。未选模块时不展示类型及游戏/赌厅字段。选模块后在所属模块下回显类型，并切换对应表单。切换模块会同步类型并清空不兼容字段。详情只读，不显示「点击授权」。',
      visualPresentation:
        '标题旁「注4」。渠道放在表单最底部、排序下方：「点击授权」，已选时列出「已授权 N 个渠道：名称」，未选显示「尚未授权渠道」。类型只读回显。游戏态展示小程序/产品下拉；赌厅跳转地址占位「请输入跳转地址」。',
      dataRules:
        '至少 1 个渠道；模块、币种、语种、已选语种名称与描述、icon 双端、排序必填。游戏须选小程序+产品；赌厅须填跳转地址。类型来自模块，不可手改。产品授权渠道独立配置，不要求与所属模块的渠道一致。',
      exceptions:
        '按表单从上到下校验，渠道最后校验：缺渠道提示「请至少授权 1 个渠道」，授权后自动清掉该提示。未选模块/产品、缺名称描述或 icon、赌厅无地址 -> 中文提示。点 × / 取消不保存。',
      routing: '确定成功关闭并刷新列表。',
    },
  },
  {
    id: 5,
    module: '渠道授权',
    feature: '授权渠道',
    pageLocation: '授权渠道弹框标题',
    prd: {
      functionalLogic: '给产品勾选可投放的渠道，逻辑与「小程序管理 · 通用产品管理」一致。列表里打开会直接改该行；新增/编辑弹框里打开只改当前表单草稿。',
      interactiveBehavior:
        '输入关键词后点「搜索」或回车过滤，并回到第 1 页。「全选」只作用于当前页：本页已全选时再点会取消本页，否则把本页并入已选。翻页不丢失其他页的勾选。点「确定」写回；点「取消」、× 或遮罩放弃本次勾选。从列表进入时确定后全局顶部提示「已更新『名称』的授权渠道」。',
      visualPresentation:
        '标题「授权渠道」旁「注5」。顶部灰色回显产品名称；新增且尚未填写名称、未选产品时回显「新增产品」。工具栏为「渠道选择」输入框和「搜索」。勾选区左侧「全选」，右侧「已选：N」。渠道两列网格，底部分页。',
      dataRules:
        '渠道目录与主播渠道一致，按名称或渠道 ID 包含匹配。每页 8 条。「已选：N」统计全部已勾选，不限当前页。允许确定时一个都不选；若从新增/编辑进入，保存时仍会要求至少 1 个渠道。',
      exceptions: '搜索无结果时显示「暂无匹配渠道」，全选禁用，不展示分页。',
      routing: '确定后关闭本弹框。从列表进入则回到列表；从新增/编辑进入则回到原表单。',
    },
  },
]

export const VIP_HALL_PRODUCT_SPEC_ANNOT_NO = {
  filter: 1,
  addButton: 2,
  list: 3,
  modal: 4,
  channelAuth: 5,
} as const

export type VipHallProductAnnotContext = keyof typeof VIP_HALL_PRODUCT_SPEC_ANNOT_NO

export const VIP_HALL_PRODUCT_ANNOT_MAP: Record<
  VipHallProductAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filter: {
    no: 1,
    title: '筛选',
    items: ['按渠道、小程序、所属模块、语种、币种筛选，渠道命中已授权渠道之一即可。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框，选择模块并配置产品。', '默认未授权渠道、游戏、信用额度-CNY、简体中文。保存后在本表内续号生成 P 开头的产品 ID。'],
  },
  list: {
    no: 3,
    title: '产品列表',
    items: [
      '展示产品 ID、渠道数、所属模块、所选产品、类型、币种、语种、排序与状态。产品 ID 只在本表内唯一。',
      '渠道数字可改授权；支持查看详情、编辑、删除与状态开关。',
    ],
  },
  modal: {
    no: 4,
    title: '新增/编辑/详情',
    items: [
      '类型随所属模块回显，未选模块时隐藏。游戏选小程序+产品；赌厅填跳转地址；icon 双端必填。',
      '渠道在最底部，必填至少 1 个，「点击授权」只回填表单。',
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
