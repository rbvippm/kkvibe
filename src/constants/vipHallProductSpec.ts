/** 贵宾厅管理 · 产品管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type VipHallProductPrdDimension = PcPrdDimension
export type VipHallProductFeatureRow = PcPrdFeatureRow

export const VIP_HALL_PRODUCT_META = {
  title: '贵宾厅管理 · 产品管理',
  module: '贵宾厅管理',
  updatedAt: '2026-08-24',
  prdVersion: 'v1.6',
} as const

export const VIP_HALL_PRODUCT_BACKGROUND = [
  '产品挂在模块下，决定尊享专区点「立即游戏」后进入哪款游戏或哪条赌厅链接。游戏类通过小程序 + 产品选择；赌厅类配置跳转地址。',
  '产品需单独上传移动端与 PC 端 icon，用于尊享专区产品入口展示。',
] as const

export const VIP_HALL_PRODUCT_GOALS = [
  '提供产品列表，支持按渠道、小程序、所属模块、语种、币种筛选，以及新增、查看详情、编辑、删除与启用/禁用。',
  '新增/编辑时先选所属模块，类型由模块回显；游戏须选择小程序和产品；赌厅须填跳转地址。',
]

export const VIP_HALL_PRODUCT_FEATURE_LIST: VipHallProductFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '筛选',
    pageLocation: '筛选工具栏',
    prd: {
      functionalLogic: '按所属渠道、小程序、所属模块、语种、币种缩小产品范围。',
      interactiveBehavior: '点「搜索」应用；点「清除」恢复全量。未点搜索不立刻过滤。',
      visualPresentation: '五个下拉 +「搜索」「清除」「+ 新增」。旁侧「注1」。',
      dataRules: '默认全部。币种枚举为「信用额度-CNY」「信用额度-USD」。小程序仅匹配游戏类产品；赌厅无小程序，选小程序时不出现。',
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
      dataRules: '默认渠道平台自营、未选模块、信用额度-CNY、简体中文、启用、排序为当前最大 +1。',
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
      functionalLogic: '展示产品所属渠道、模块、所选产品、类型、币种、语种、排序与状态。',
      interactiveBehavior: '状态开关即时生效；查看详情只读；编辑回填；删除二次确认。',
      visualPresentation:
        '列：序号 / 所属渠道 / 所属模块 / 产品 / 类型 / 币种 / 语种 / 排序 / 状态 / 操作。旁侧「注3」。',
      dataRules: '产品列优先展示已配置中文名称；无则回退目录名或跳转地址。类型取所属模块。按排序升序。',
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
        '配置所属渠道、所属模块、币种语种、已选语种名称与描述。类型由模块回显：游戏选小程序与产品、后缀选填；赌厅填跳转地址。icon 双端必填。',
      interactiveBehavior:
        '未选模块时不展示类型及游戏/赌厅字段。选模块后在所属模块下回显类型，并切换对应表单。切换模块会同步类型并清空不兼容字段。详情只读。',
      visualPresentation:
        '标题旁「注4」。类型只读回显。游戏态展示小程序/产品下拉；赌厅跳转地址占位「请输入跳转地址」。',
      dataRules:
        '渠道、模块、币种、语种、已选语种名称与描述、icon 双端、排序必填。游戏须选小程序+产品；赌厅须填跳转地址。类型来自模块，不可手改。',
      exceptions: '未选模块/产品、缺名称描述或 icon、赌厅无地址 -> 中文提示。点 × / 取消不保存。',
      routing: '确定成功关闭并刷新列表。',
    },
  },
]

export const VIP_HALL_PRODUCT_SPEC_ANNOT_NO = {
  filter: 1,
  addButton: 2,
  list: 3,
  modal: 4,
} as const

export type VipHallProductAnnotContext = keyof typeof VIP_HALL_PRODUCT_SPEC_ANNOT_NO

export const VIP_HALL_PRODUCT_ANNOT_MAP: Record<
  VipHallProductAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filter: {
    no: 1,
    title: '筛选',
    items: ['按渠道、小程序、所属模块、语种、币种筛选。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框，选择模块并配置产品。', '默认游戏、平台自营、信用额度-CNY、简体中文。'],
  },
  list: {
    no: 3,
    title: '产品列表',
    items: ['展示所属模块、所选产品、类型、币种、语种、排序与状态。', '支持查看详情、编辑、删除与状态开关。'],
  },
  modal: {
    no: 4,
    title: '新增/编辑/详情',
    items: ['类型随所属模块回显，未选模块时隐藏。', '游戏选小程序+产品；赌厅填跳转地址；icon 双端必填。'],
  },
}
