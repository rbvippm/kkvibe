/** 贴图包管理 · PRD
 * 与页面「注1～注6」一一对应；不含【文档说明】入口。
 */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type StickerPackManagePrdDimension = PcPrdDimension
export type StickerPackManageFeatureRow = PcPrdFeatureRow

export type StickerPackManageAnnotContext =
  | 'statusFilter'
  | 'addPack'
  | 'rowActions'
  | 'modalFooter'
  | 'nameI18n'
  | 'contentManage'

export const STICKER_PACK_MANAGE_META = {
  title: '贴图包管理',
  module: '配置管理',
  updatedAt: '2026-07-24',
  prdVersion: 'v1.0',
} as const

/** 1. 需求背景 */
export const STICKER_PACK_MANAGE_BACKGROUND = [
  'App 贴图能力需按「整包」管理资源（如 Cuppy 系列），运营需在后台维护包名多语言、托盘图标、作者、排序与包内贴图。',
  '每张贴图的 Emoji 搜索映射来自「贴图标签管理」中的启用标签，单张可选 1～3 个；单包最多 30 张。',
  '贴图包需支持草稿、已上架、已下架三态；上架后编辑应直接保存并保持上架，下架/删除走列表操作。',
] as const

/** 2. 需求目标 */
export const STICKER_PACK_MANAGE_GOALS = [
  '提供贴图包列表，支持按名称、状态、操作人、发布时间筛选；支持新增、编辑、上架/下架、删除。',
  '新增/编辑弹框维护基础信息与包内贴图；已上架编辑底部仅「取消 / 保存」，其余为「取消 / 保存为草稿 / 立即上架」。',
  '上架前校验每张贴图已选贴图标签；标签数据与贴图标签管理联动。',
] as const

/** 页面「注N」编号登记 */
export const STICKER_PACK_MANAGE_SPEC_ANNOT_NO = {
  statusFilter: 1,
  addPack: 2,
  rowActions: 3,
  modalFooter: 4,
  nameI18n: 5,
  contentManage: 6,
} as const

/** 3. 需求功能清单 */
export const STICKER_PACK_MANAGE_FEATURE_LIST: StickerPackManageFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '状态',
    pageLocation: '筛选区「状态」标签旁「注1」',
    prd: {
      functionalLogic:
        '按贴图包生命周期状态过滤列表：已上架（对用户可见）、已下架（曾上架后下线）、草稿（未正式上架）。',
      interactiveBehavior:
        '选择「全部状态 / 已上架 / 已下架 / 草稿」后点「搜索」→ 按 status 精确过滤；点「清除」→ 恢复全部状态。可与名称、操作人、发布时间组合。',
      visualPresentation:
        '标签「状态：」+ 下拉；旁侧「注1」。列表「状态」列以色签展示已上架 / 已下架 / 草稿。',
      dataRules:
        '枚举：online=已上架 | offline=已下架 | draft=草稿；默认「全部状态」。',
      exceptions: '组合筛选无结果 → 空态「暂无贴图包数据」，保留已填条件。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '新增贴图包',
    pageLocation: '工具栏「新增贴图包」旁「注2」',
    prd: {
      functionalLogic: '打开新增弹框，录入整包基础信息与贴图内容后保存为草稿或立即上架。',
      interactiveBehavior:
        '点击「新增贴图包」→ 打开弹框，标题「新增贴图包」；底部为「取消 / 保存为草稿 / 立即上架」。保存成功关闭弹框并刷新列表。',
      visualPresentation: '工具栏右侧主色加号按钮「新增贴图包」；旁侧「注2」。',
      dataRules:
        '新增行写入当前操作人、创建/更新时间；立即上架时写入上架时间；保存为草稿时上架时间为空。',
      exceptions: '校验失败（缺名称/作者/图标/贴图等）→ 弹框内错误提示，不关闭。',
      routing: '弹框层，关闭后回列表；无独立路由。',
    },
  },
  {
    id: 3,
    module: '列表操作',
    feature: '编辑 / 上架下架 / 删除',
    pageLocation: '列表「操作」表头旁「注3」',
    prd: {
      functionalLogic:
        '行内操作：编辑打开弹框改内容；已上架可下架、已下架可上架；仅草稿或已下架可删除。草稿无上架/下架按钮。',
      interactiveBehavior:
        '编辑 → 打开编辑弹框并回填。上架/下架 → 切换 status 并刷新更新时间（上架时若无上架时间则写入）。删除 → 二次确认后移除行。',
      visualPresentation:
        '操作列表头旁「注3」；行内文字链「编辑 | 上架/下架 | 删除」（按状态显隐）；删除为危险色。',
      dataRules:
        'draft：仅编辑+删除。online：编辑+下架。offline：编辑+上架+删除。删除不可恢复（原型）。',
      exceptions: '非草稿/已下架点删除 → 提示「仅草稿或已下架状态的贴图包可删除」。',
      routing: '编辑为弹框；上架/下架/删除停留列表。',
    },
  },
  {
    id: 4,
    module: '编辑弹框',
    feature: '底部保存按钮（按状态）',
    pageLocation: '新增/编辑弹框底部按钮区旁「注4」',
    prd: {
      functionalLogic:
        '按进入弹框时的包状态区分底部主操作：已上架编辑仅保存并保持上架；新建/草稿/已下架可保存为草稿或立即上架。下架仍走列表行操作，不在弹框内降级为草稿。',
      interactiveBehavior:
        '已上架编辑：取消 / 保存（status 保持 online）。其余：取消 / 保存为草稿 / 立即上架。立即上架与保存（上架态）均按上架校验（每张贴图须有标签）。',
      visualPresentation:
        '弹框底部右侧按钮组；旁侧「注4」。已上架时主按钮文案为「保存」，否则主按钮为「立即上架」。',
      dataRules:
        '保存为草稿 → status=draft；立即上架/已上架保存 → status=online 且补齐 publishedAt（若为空）。',
      exceptions: '校验失败 → 提示在弹框顶部，不关闭。取消或点遮罩/× → 不保存关闭。',
      routing: '关闭弹框回列表；无跳转。',
    },
  },
  {
    id: 5,
    module: '编辑弹框',
    feature: '贴图包名称多语言',
    pageLocation: '弹框「基础信息」贴图包名称旁「注5」',
    prd: {
      functionalLogic:
        '包名按中文 / 英文 / 泰文 / 繁体 / 越南文五语种分别维护，列表展示名与中文同步。',
      interactiveBehavior: '五语种均为必填输入；实时显示字数 x/50；超长不可继续输入（maxlength=50）。',
      visualPresentation:
        '「贴图包名称」必填标题旁「注5」；下方五行标签+输入+字数提示。',
      dataRules: '每语种 trim 后非空、长度 ≤ 50；列表 name 取中文。',
      exceptions: '某一语种为空或超长 → 保存拦截并提示对应语种。',
      routing: '无跳转。',
    },
  },
  {
    id: 6,
    module: '编辑弹框',
    feature: '内容管理与 Emoji 映射',
    pageLocation: '弹框「内容管理」标题旁「注6」',
    prd: {
      functionalLogic:
        '维护包内贴图：批量上传/模拟添加、移除；每张从「贴图标签管理」启用标签中多选 1～3 个作为 Emoji 映射。单包最多 30 张。上架前每张须至少选 1 个标签。',
      interactiveBehavior:
        '拖拽或选择文件 /「模拟添加 3 张」增加贴图；超出上限忽略多余并提示。点「Emoji 映射」下拉勾选标签（最多 3）；「移除」删除该张。无启用标签时提示先去贴图标签管理配置。',
      visualPresentation:
        '「内容管理」标题旁「注6」与「已上传 n/30 张」；上传区+贴图行（预览、文件名、标签选择、映射芯片、移除）。',
      dataRules:
        'STICKER_PACK_MAX_ITEMS=30；标签仅 enabled；单张 1～3 个；保存草稿可不选标签，立即上架/已上架保存必须每张有标签。',
      exceptions:
        '0 张贴图 → 不可保存。已满 30 张再传 → 提示上限。无启用标签 → 下拉空态文案。',
      routing: '标签数据来自贴图标签管理同源；本弹框不跳转标签页（文案指引）。',
    },
  },
]

/** 注1 · 浮层简版 */
export const STICKER_PACK_MANAGE_STATUS_FILTER_SPEC = [
  '状态：已上架 / 已下架 / 草稿。',
  '可与贴图包名称、操作人、发布时间组合筛选。',
  '列表状态列以色签展示当前生命周期。',
] as const

/** 注2 · 浮层简版 */
export const STICKER_PACK_MANAGE_ADD_SPEC = [
  '点击打开「新增贴图包」弹框。',
  '底部：取消 / 保存为草稿 / 立即上架。',
  '立即上架前须为每张贴图选择贴图标签。',
] as const

/** 注3 · 浮层简版 */
export const STICKER_PACK_MANAGE_ROW_ACTIONS_SPEC = [
  '编辑：打开弹框回填整包信息。',
  '已上架可下架，已下架可上架；草稿无上下架按钮。',
  '仅草稿或已下架可删除，删除前二次确认。',
] as const

/** 注4 · 浮层简版 */
export const STICKER_PACK_MANAGE_MODAL_FOOTER_SPEC = [
  '已上架编辑：取消 / 保存（保持上架）。',
  '新建、草稿、已下架：取消 / 保存为草稿 / 立即上架。',
  '下架请用列表行操作，勿在弹框内「保存为草稿」降级。',
] as const

/** 注5 · 浮层简版 */
export const STICKER_PACK_MANAGE_NAME_I18N_SPEC = [
  '中文 / 英文 / 泰文 / 繁体 / 越南文均必填。',
  '每语种最多 50 个字符；列表展示名取中文。',
  '任一语种为空则不可保存。',
] as const

/** 注6 · 浮层简版 */
export const STICKER_PACK_MANAGE_CONTENT_SPEC = [
  '单包最多 30 张；支持拖拽/选文件/模拟添加。',
  '每张从贴图标签多选 1～3 个作为 Emoji 映射。',
  '立即上架或已上架保存时，每张须至少选 1 个标签。',
] as const

export const STICKER_PACK_MANAGE_ANNOT_MAP: Record<
  StickerPackManageAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  statusFilter: {
    no: STICKER_PACK_MANAGE_SPEC_ANNOT_NO.statusFilter,
    title: '状态筛选',
    items: STICKER_PACK_MANAGE_STATUS_FILTER_SPEC,
  },
  addPack: {
    no: STICKER_PACK_MANAGE_SPEC_ANNOT_NO.addPack,
    title: '新增贴图包',
    items: STICKER_PACK_MANAGE_ADD_SPEC,
  },
  rowActions: {
    no: STICKER_PACK_MANAGE_SPEC_ANNOT_NO.rowActions,
    title: '列表操作',
    items: STICKER_PACK_MANAGE_ROW_ACTIONS_SPEC,
  },
  modalFooter: {
    no: STICKER_PACK_MANAGE_SPEC_ANNOT_NO.modalFooter,
    title: '弹框底部按钮',
    items: STICKER_PACK_MANAGE_MODAL_FOOTER_SPEC,
  },
  nameI18n: {
    no: STICKER_PACK_MANAGE_SPEC_ANNOT_NO.nameI18n,
    title: '贴图包名称多语言',
    items: STICKER_PACK_MANAGE_NAME_I18N_SPEC,
  },
  contentManage: {
    no: STICKER_PACK_MANAGE_SPEC_ANNOT_NO.contentManage,
    title: '内容管理与 Emoji 映射',
    items: STICKER_PACK_MANAGE_CONTENT_SPEC,
  },
}
