/** 贵宾厅管理 · 模块管理 · PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type VipHallModulePrdDimension = PcPrdDimension
export type VipHallModuleFeatureRow = PcPrdFeatureRow

export const VIP_HALL_MODULE_META = {
  title: '贵宾厅管理 · 模块管理',
  module: '贵宾厅管理',
  updatedAt: '2026-11-16',
  prdVersion: 'v1.6',
} as const

export const VIP_HALL_MODULE_BACKGROUND = [
  '尊享专区首页卡片（金刚体育、皇者彩票、真人、老虎机、赌厅服务）对应后台「模块」。模块维护卡片自身：所属渠道、类型（游戏 / 赌厅）、图片、多语名称与描述、投放范围。',
  '模块下挂的具体游戏 / 赌厅链接在「产品管理」中选择产品后配置，二者拆开避免一张表同时管卡片和跳转。',
  '一个模块只归属一个渠道，在新增/编辑弹框里下拉选择；同一张卡片要在多个渠道展示时，按渠道分别建模块。',
] as const

export const VIP_HALL_MODULE_GOALS = [
  '提供模块列表，支持按渠道、语种、币种筛选，以及新增、查看详情、编辑、删除与启用/禁用。',
  '新增/编辑时选择所属渠道，并配置类型、移动端/PC 图片、支持币种语种、多语名称与描述、排序。',
  '列表直接展示所属渠道名称，便于核对每个渠道下的卡片。',
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
        '渠道与模块所属渠道精确匹配；语种、币种命中行内已选项之一。空值表示不限。渠道目录与主播渠道一致。币种枚举为「信用额度-CNY」「信用额度-USD」。',
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
        '默认未选渠道、类型游戏、币种信用额度-CNY、语种简体中文、启用、排序为当前最大 +1。模块 ID 保存时生成，格式 M 加数字，取本表现有最大号 +1，当前示例从 M10006 起。',
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
      functionalLogic: '展示模块 ID、所属渠道、类型、图片、中文名称、币种、语种、排序与状态。',
      interactiveBehavior:
        '状态开关即时启用/禁用，全局顶部提示「已启用 / 已禁用『名称』」；「查看详情」只读回填；「编辑」可改；「删除」二次确认。若模块下仍有产品，删除时提示先清理产品。',
      visualPresentation:
        '列：模块ID / 所属渠道（渠道名称）/ 类型 / 图片 / 中文名称 / 币种标签 / 语种标签 / 排序 / 状态开关 / 操作。模块ID 单行不换行。旁侧「注3」。',
      dataRules:
        '模块 ID 格式 M 加数字，例如 M10001，只要求在贵宾厅模块表内唯一，不要求全局唯一，可与「小程序管理 · 通用模块管理」的模块 ID 相同。产品通过模块 ID 关联本表。所属渠道列展示渠道中文名称，如「平台自营」「好世界」。中文名称取简体，无则繁体/英文；按排序升序。图片缺失展示「无图」。',
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
        '配置所属渠道、类型（游戏 / 赌厅）、移动端/PC 图片、支持币种语种、已选语种名称与描述、排序与状态。详情态只读。',
      interactiveBehavior:
        '所属渠道为可搜索下拉，输入渠道名称或 ID 过滤。勾选语种后出现对应名称与描述；图片移动端与 PC 必填。保存后同步该模块下产品的类型与所属渠道。详情仅「关闭」，所属渠道置灰只读；新增/编辑「取消 / 确定」。成功后全局顶部提示「已新增 / 已保存『名称』」。',
      visualPresentation:
        '标题「新增 / 编辑 / 查看详情」旁「注4」。「所属渠道」为表单第一项，占位「请选择所属渠道」。上传区分移动端 / PC 两列；图片限制 jpg、png、webp，不限制大小。',
      dataRules: '所属渠道单选必填，渠道目录与主播渠道一致；类型、币种、语种、已选语种名称与描述、图片双端、排序（正整数）必填。币种枚举为信用额度-CNY、信用额度-USD。',
      exceptions:
        '按表单从上到下校验：未选渠道提示「请选择所属渠道」。缺其他必填或格式不符 -> 中文提示，不关闭。点 × / 取消不保存。',
      routing: '确定成功关闭弹框并刷新列表。',
    },
  },
]

export const VIP_HALL_MODULE_SPEC_ANNOT_NO = {
  filter: 1,
  addButton: 2,
  list: 3,
  modal: 4,
} as const

export type VipHallModuleAnnotContext = keyof typeof VIP_HALL_MODULE_SPEC_ANNOT_NO

export const VIP_HALL_MODULE_ANNOT_MAP: Record<
  VipHallModuleAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filter: {
    no: 1,
    title: '筛选',
    items: ['按渠道、语种、币种筛选模块，渠道与所属渠道精确匹配。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  addButton: {
    no: 2,
    title: '新增',
    items: ['打开「新增」弹框，配置尊享专区模块卡片。', '默认未选渠道、信用额度-CNY、简体中文、启用。保存后在本表内续号生成 M 开头的模块 ID。'],
  },
  list: {
    no: 3,
    title: '模块列表',
    items: [
      '展示模块 ID、所属渠道名称、类型、图片、中文名称、币种、语种、排序与状态。模块 ID 只在本表内唯一。',
      '支持查看详情、编辑、删除与状态开关。',
    ],
  },
  modal: {
    no: 4,
    title: '新增/编辑/详情',
    items: [
      '必填：所属渠道（首项，单选）、类型、币种、语种、名称、描述、双端图片、排序。',
      '类型决定产品页回显游戏或赌厅；保存后同步该模块下产品的类型与所属渠道；详情只读。',
    ],
  },
}
