/** 贵宾厅管理 · 产品管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type VipHallProductPrdDimension = PcPrdDimension
export type VipHallProductFeatureRow = PcPrdFeatureRow

export const VIP_HALL_PRODUCT_META = {
  title: '贵宾厅管理 · 产品管理',
  module: '贵宾厅管理',
  updatedAt: '2026-11-16',
  prdVersion: 'v1.8',
} as const

export const VIP_HALL_PRODUCT_BACKGROUND = [
  '产品挂在模块下，决定尊享专区点「立即游戏」后进入哪款游戏或哪条赌厅链接。游戏类通过小程序 + 产品选择；赌厅类配置跳转地址。',
  '产品需单独上传移动端与 PC 端 icon，用于尊享专区产品入口展示。',
  '一个产品只归属一个渠道，且必须与所属模块同渠道，避免出现模块在 A 渠道、产品却投到 B 渠道的错配。',
] as const

export const VIP_HALL_PRODUCT_GOALS = [
  '提供产品列表，支持按渠道、小程序、所属模块、语种、币种筛选，以及新增、查看详情、编辑、删除与启用/禁用。',
  '新增/编辑时先选所属渠道、再选该渠道下的所属模块，类型由模块回显；游戏须选择小程序和产品；赌厅须填跳转地址。',
  '列表直接展示所属渠道名称。',
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
        '渠道与产品所属渠道精确匹配；语种、币种命中已选项之一；小程序、所属模块精确匹配。空值表示不限。币种枚举为「信用额度-CNY」「信用额度-USD」。小程序仅匹配游戏类产品；赌厅无小程序，选小程序时不出现。',
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
        '默认未选渠道、未选模块、信用额度-CNY、简体中文、启用、排序为当前最大 +1。产品 ID 保存时生成，格式 P 加数字，取本表现有最大号 +1，当前示例从 P10009 起。',
      exceptions: '所选渠道下无模块时，所属模块下拉提示「该渠道暂无模块，请先在模块管理中新增」。',
      routing: '停留本页。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '产品列表',
    pageLocation: '列表表格区域',
    prd: {
      functionalLogic: '展示产品 ID、所属渠道、所属模块、所选产品、类型、币种、语种、排序与状态。',
      interactiveBehavior:
        '状态开关即时生效，全局顶部提示「已启用 / 已禁用『名称』」；查看详情只读；编辑回填；删除二次确认。',
      visualPresentation:
        '列：产品ID / 所属渠道（渠道名称）/ 所属模块 / 产品 / 类型 / 币种 / 语种 / 排序 / 状态 / 操作。产品ID 单行不换行。旁侧「注3」。',
      dataRules:
        '产品 ID 格式 P 加数字，例如 P10001，只要求在贵宾厅产品表内唯一，不要求全局唯一，可与「小程序管理 · 通用产品管理」的产品 ID 相同。所属渠道列展示渠道中文名称。产品列优先展示已配置中文名称；无则回退目录名或跳转地址。类型取所属模块。按排序升序。',
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
        '所属渠道为可搜索下拉；未选渠道时所属模块置灰，提示「请先选择所属渠道」。所属模块只列该渠道下的模块；切换渠道后若原模块不属于新渠道，清空模块与类型字段。未选模块时不展示类型及游戏/赌厅字段。选模块后在所属模块下回显类型，并切换对应表单。切换模块会同步类型并清空不兼容字段。详情只读。成功后全局顶部提示「已新增 / 已保存产品『名称』」。',
      visualPresentation:
        '标题旁「注4」。「所属渠道」为表单第一项，占位「请选择所属渠道」，其下为「所属模块」。类型只读回显。游戏态展示小程序/产品下拉；赌厅跳转地址占位「请输入跳转地址」。',
      dataRules:
        '所属渠道单选必填；模块、币种、语种、已选语种名称与描述、icon 双端、排序必填。游戏须选小程序+产品；赌厅须填跳转地址。类型来自模块，不可手改。产品所属渠道须与所属模块一致；模块改渠道时，其下产品同步改到新渠道。',
      exceptions:
        '按表单从上到下校验：未选渠道提示「请选择所属渠道」，未选模块/产品、缺名称描述或 icon、赌厅无地址 -> 中文提示。点 × / 取消不保存。',
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
    items: ['按渠道、小程序、所属模块、语种、币种筛选，渠道与所属渠道精确匹配。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框，选择模块并配置产品。', '默认未选渠道、未选模块、信用额度-CNY、简体中文。保存后在本表内续号生成 P 开头的产品 ID。'],
  },
  list: {
    no: 3,
    title: '产品列表',
    items: [
      '展示产品 ID、所属渠道名称、所属模块、所选产品、类型、币种、语种、排序与状态。产品 ID 只在本表内唯一。',
      '支持查看详情、编辑、删除与状态开关。',
    ],
  },
  modal: {
    no: 4,
    title: '新增/编辑/详情',
    items: [
      '类型随所属模块回显，未选模块时隐藏。游戏选小程序+产品；赌厅填跳转地址；icon 双端必填。',
      '先选所属渠道（首项，单选必填），所属模块只列同渠道模块；换渠道会清空不匹配的模块。',
    ],
  },
}
