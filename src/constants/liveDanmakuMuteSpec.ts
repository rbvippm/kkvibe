/** 直播弹幕禁言 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type LiveDanmakuMutePrdDimension = PcPrdDimension
export type LiveDanmakuMuteFeatureRow = PcPrdFeatureRow

export const LIVE_DANMAKU_MUTE_META = {
  title: '禁言列表',
  module: '直播管理',
  updatedAt: '2026-07-04',
  prdVersion: 'v1.2',
} as const

/** 1. 需求背景 */
export const LIVE_DANMAKU_MUTE_BACKGROUND = [
  '直播场景需对违规弹幕用户执行禁言，运营与主播可在不同入口发起操作，后台需统一留存禁言记录供追溯与解除。',
  '禁言需区分作用范围：房间禁言仅限制当前直播间发言，全局禁言限制用户在所有直播间发言；两类记录需分别管理。',
  '主播在直播中控台对弹幕右键禁言时，默认执行房间禁言；运营在禁言列表可查看全量记录并按来源、类型筛选处理。',
] as const

/** 2. 需求目标 */
export const LIVE_DANMAKU_MUTE_GOALS = [
  '提供禁言记录列表，支持按用户 ID、禁言来源、禁言类型、状态筛选。',
  '列表展示禁言编号、来源、类型、时间、操作人、原因与当前状态；操作列提供禁言详情、编辑、解除限制三个入口。',
  '详情弹窗只读展示禁言与关联弹幕；编辑弹窗可改类型与原因；解除限制仅在禁言中展示，并需二次确认。',
] as const

/** 3. 需求功能清单（与页面「注N」标注一一对应，不含文档入口） */
export const LIVE_DANMAKU_MUTE_FEATURE_LIST: LiveDanmakuMuteFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '用户 ID',
    pageLocation: '筛选区「用户ID」',
    prd: {
      functionalLogic: '按用户 ID 精准匹配禁言记录，辅助运营定位指定用户的禁言历史。',
      interactiveBehavior:
        '输入完整用户 ID 后点击「搜索」-> 列表仅展示 userId 完全一致的行；点击「清除」-> 清空条件并恢复全量（原型为前端即时过滤）。',
      visualPresentation: '标签「用户ID：」+ 文本输入框，占位符「请输入完整用户ID」；旁侧「注1」标注。',
      dataRules: '非必填；匹配规则为精准相等（trim 后）；空值表示不过滤用户 ID。',
      exceptions: '无匹配记录 -> 表格展示「暂无禁言记录」空态，不报错。',
      routing: '筛选结果停留当前列表页，不跳转。',
    },
  },
  {
    id: 2,
    module: '列表筛选',
    feature: '禁言来源',
    pageLocation: '筛选区「禁言来源」',
    prd: {
      functionalLogic: '区分禁言操作发起方：「主播」为开播主播端发起的禁言；「运营」为后台禁言列表发起或处理。',
      interactiveBehavior:
        '选择「主播」或「运营」并搜索 -> 仅展示对应 muteSource 的记录；选「全部」-> 不过滤来源。',
      visualPresentation: '标签「禁言来源：」+ 下拉（全部 / 主播 / 运营）；旁侧「注2」标注。',
      dataRules: '枚举值：主播 | 运营；默认「全部」；与记录字段 muteSource 一致。',
      exceptions: '来源与类型组合筛选无结果 -> 空列表，保留已选条件不清空。',
      routing: '停留列表页；可从直播中控台禁言后通过顶部 Tab 或侧栏进入本列表查看新增记录。',
    },
  },
  {
    id: 3,
    module: '列表筛选',
    feature: '禁言类型',
    pageLocation: '筛选区「禁言类型」',
    prd: {
      functionalLogic:
        '区分禁言作用范围：房间禁言仅限制用户在对应直播间发言；全局禁言限制用户在所有直播间发言。',
      interactiveBehavior:
        '选择「房间禁言」或「全局禁言」并搜索 -> 仅展示对应 muteType 的记录；选「全部」-> 展示两类记录。',
      visualPresentation: '标签「禁言类型：」+ 下拉（全部 / 房间禁言 / 全局禁言）；旁侧「注3」标注。',
      dataRules:
        '枚举值：房间禁言 | 全局禁言；与记录 muteType 一致。开播主播端禁言默认房间禁言；全局禁言通常由运营发起（联调期以权限配置为准）。',
      exceptions: '同一用户可同时存在房间禁言与全局禁言两条有效记录 -> 列表分别展示，解除时按各自类型独立处理。',
      routing: '停留列表页；与开播主播端禁言所选类型联动写入同一份 Mock 数据源。',
    },
  },
  {
    id: 4,
    module: '列表筛选',
    feature: '禁言状态',
    pageLocation: '筛选区「状态」',
    prd: {
      functionalLogic: '按当前禁言是否生效过滤记录，区分「禁言中」与「已解除」历史。',
      interactiveBehavior:
        '选择「禁言中」-> 仅 muted=true；选择「已解除」-> 仅 muted=false；「全部」-> 不过滤状态。',
      visualPresentation: '标签「状态：」+ 下拉（全部 / 禁言中 / 已解除）；旁侧「注4」标注。',
      dataRules: 'muted=true 展示「禁言中」（红色）；muted=false 展示「已解除」（灰色）；解除后写入 unmutedAt 时间。',
      exceptions: '已解除记录仍保留在列表供审计，不会物理删除。',
      routing: '停留列表页。',
    },
  },
  {
    id: 5,
    module: '列表筛选',
    feature: '搜索与清除',
    pageLocation: '筛选区「搜索」「清除」按钮',
    prd: {
      functionalLogic: '触发筛选或重置全部筛选条件，刷新列表展示结果。',
      interactiveBehavior:
        '点击「搜索」-> 按当前筛选条件过滤列表（原型为前端 computed 即时过滤）；点击「清除」-> 重置四项筛选为空并展示全量记录。',
      visualPresentation: '主色按钮「搜索」+ 危险色按钮「清除」，位于筛选区下方工具栏左侧；旁侧「注5」标注。',
      dataRules: '清除后四项筛选恢复默认空值；分页信息「共 N 条」随 filteredRows 数量更新。',
      exceptions: '接口失败时（联调期）保留筛选条件并提示，列表不清空已有数据。',
      routing: '停留列表页。',
    },
  },
  {
    id: 6,
    module: '列表展示',
    feature: '禁言记录列表',
    pageLocation: '列表表格区域',
    prd: {
      functionalLogic:
        '汇总展示禁言编号、用户信息、来源、类型、时间、操作人、原因与状态，供运营浏览与处置。',
      interactiveBehavior: '进入页面或筛选后自动渲染；单元格内容过长时换行展示，不截断省略。',
      visualPresentation:
        '标准 wf-table：含编号、禁言编号、用户ID、用户名、禁言来源、禁言类型、禁言时间、操作人、禁言原因、状态、操作列；状态「禁言中」红色、「已解除」灰色；表格区「注6」标注。',
      dataRules:
        '禁言编号格式 MU + 时间戳（Mock）；时间格式 yyyy-MM-dd HH:mm:ss；单元格使用 word-break: break-word 换行。',
      exceptions: 'filteredRows 为空 -> 单行 colspan 展示「暂无禁言记录」。',
      routing: '列表只读展示；操作列含禁言详情、编辑、解除限制。',
    },
  },
  {
    id: 7,
    module: '列表操作',
    feature: '禁言详情',
    pageLocation: '操作列「禁言详情」',
    prd: {
      functionalLogic: '查看单条禁言记录的完整信息与关联弹幕、直播场次上下文，供运营复核。',
      interactiveBehavior: '点击「禁言详情」-> 打开只读详情弹框；点击「关闭」或遮罩 -> 关闭弹框。',
      visualPresentation: '操作列蓝色链接「禁言详情」，任意状态均展示；表头操作列「注7」标注；宽版只读弹框含禁言详情与关联弹幕。',
      dataRules:
        '展示禁言编号、用户、来源、类型、时间、操作人、原因、状态、解除时间；关联弹幕区展示弹幕内容、发送时间、主播、场次 ID、处理结果。',
      exceptions: '关联字段为空 -> 展示 Mock 占位，不阻断弹框打开。',
      routing: '弹框内无跳转；与「编辑」「解除限制」操作独立。',
    },
  },
  {
    id: 8,
    module: '列表操作',
    feature: '编辑禁言',
    pageLocation: '操作列「编辑」',
    prd: {
      functionalLogic: '编辑禁言类型与禁言原因，对已解除记录重新禁言或对禁言中记录切换类型/更新原因。',
      interactiveBehavior:
        '任意状态均可点击「编辑」-> 打开编辑弹框；可切换禁言类型、修改原因后「保存」；类型变更且原记录禁言中时先解除原类型再写入新类型。',
      visualPresentation: '操作列蓝色链接「编辑」，任意状态均展示；表头操作列「注8」标注；弹框含类型单选与原因输入。',
      dataRules: '原因必填；muteSource 记为「运营」；保存后关闭弹框并刷新列表行。',
      exceptions: '原因为空时不提交并提示「请输入禁言原因」。',
      routing: '保存后停留列表页；与中控台 isUserMuted 联动。',
    },
  },
  {
    id: 9,
    module: '列表操作',
    feature: '解除限制',
    pageLocation: '操作列「解除限制」',
    prd: {
      functionalLogic: '对禁言中记录执行解除，恢复用户发言权限。',
      interactiveBehavior: '仅禁言中展示「解除限制」链接；点击后弹出二次确认弹框，展示用户名、用户ID与禁言类型；点「确定解除」后按该条 muteType 解除，「取消」/遮罩/关闭则不变更。',
      visualPresentation: '操作列红色链接「解除限制」，与「禁言详情」「编辑」以竖线分隔；已解除状态不展示；确认弹框标题「确认解除限制」，主按钮为危险色「确定解除」；表头操作列「注9」标注。',
      dataRules: '确认后调用 unmuteUser(userId, { roomId, muteType })；解除后状态变为「已解除」并写入解除时间。',
      exceptions: '弹框打开时记录已被解除则关闭弹框且列表刷新后无此入口；接口失败时（联调期）状态不变并提示。',
      routing: '确认成功后关闭弹框并停留列表页，行状态即时刷新。',
    },
  },
]

/** 页面「注」标记编号 · 与 LIVE_DANMAKU_MUTE_FEATURE_LIST.id 一一对应 */
export const LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO = {
  filterUserId: 1,
  filterMuteSource: 2,
  filterMuteType: 3,
  filterStatus: 4,
  searchReset: 5,
  tableRecord: 6,
  detailAction: 7,
  editAction: 8,
  unmuteAction: 9,
} as const

export type LiveDanmakuMuteAnnotContext = keyof typeof LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO

export const LIVE_DANMAKU_MUTE_FILTER_USER_ID_SPEC = [
  '按用户 ID 精准筛选禁言记录，须输入完整 ID 后配合「搜索」生效。',
  '留空表示不过滤用户 ID；与「清除」联动重置。',
] as const

export const LIVE_DANMAKU_MUTE_FILTER_MUTE_SOURCE_SPEC = [
  '禁言来源区分操作发起方：「主播」为开播主播端发起的禁言；「运营」为后台禁言列表发起或处理。',
  '筛选为精确匹配，选「全部」时不过滤来源。',
] as const

export const LIVE_DANMAKU_MUTE_FILTER_MUTE_TYPE_SPEC = [
  '禁言类型区分作用范围：「房间禁言」仅限制用户在对应直播间发言；「全局禁言」限制用户在所有直播间发言。',
  '主播在开播主播端禁言时默认选中「房间禁言」；运营可在列表编辑弹框处理全局禁言。',
  '同一用户可同时存在房间禁言与全局禁言两条记录，解除时需按各自类型分别操作。',
] as const

export const LIVE_DANMAKU_MUTE_FILTER_STATUS_SPEC = [
  '按禁言是否生效筛选：「禁言中」或「已解除」。',
  '选「全部」时展示两种状态的记录。',
] as const

export const LIVE_DANMAKU_MUTE_SEARCH_RESET_SPEC = [
  '「搜索」按当前筛选条件过滤列表（原型为前端即时过滤）。',
  '「清除」重置全部筛选项并恢复展示全量记录。',
] as const

export const LIVE_DANMAKU_MUTE_TABLE_RECORD_SPEC = [
  '列表展示全量禁言记录，含禁言类型列；「禁言中」红色、「已解除」灰色。',
  '单元格内容过长时换行展示，不使用省略号截断。',
  '数据与直播中控台共用同一份 Mock 数据源。',
] as const

export const LIVE_DANMAKU_MUTE_DETAIL_ACTION_SPEC = [
  '点击「禁言详情」打开只读弹框，展示禁言信息与关联弹幕、直播场次上下文。',
  '任意状态均可查看，与编辑、解除限制相互独立。',
] as const

export const LIVE_DANMAKU_MUTE_EDIT_ACTION_SPEC = [
  '任意状态均可点击「编辑」，在弹框内修改禁言类型（房间/全局）与禁言原因。',
  '保存时对已解除记录重新禁言；对禁言中记录可切换类型或更新原因。',
  '解除限制请使用操作列「解除限制」，不在编辑弹框内操作。',
] as const

export const LIVE_DANMAKU_MUTE_UNMUTE_ACTION_SPEC = [
  '仅「禁言中」状态展示「解除限制」链接；点击后弹出二次确认，展示用户与禁言类型。',
  '确认「确定解除」后解除该条对应类型禁言并写入解除时间；取消则不变更。',
  '已解除状态不展示此入口。',
] as const

export const LIVE_DANMAKU_MUTE_ANNOT_MAP: Record<
  LiveDanmakuMuteAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  filterUserId: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.filterUserId,
    title: '用户 ID',
    items: LIVE_DANMAKU_MUTE_FILTER_USER_ID_SPEC,
  },
  filterMuteSource: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.filterMuteSource,
    title: '禁言来源',
    items: LIVE_DANMAKU_MUTE_FILTER_MUTE_SOURCE_SPEC,
  },
  filterMuteType: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.filterMuteType,
    title: '禁言类型',
    items: LIVE_DANMAKU_MUTE_FILTER_MUTE_TYPE_SPEC,
  },
  filterStatus: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.filterStatus,
    title: '禁言状态',
    items: LIVE_DANMAKU_MUTE_FILTER_STATUS_SPEC,
  },
  searchReset: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.searchReset,
    title: '搜索与清除',
    items: LIVE_DANMAKU_MUTE_SEARCH_RESET_SPEC,
  },
  tableRecord: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.tableRecord,
    title: '禁言记录列表',
    items: LIVE_DANMAKU_MUTE_TABLE_RECORD_SPEC,
  },
  detailAction: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.detailAction,
    title: '禁言详情',
    items: LIVE_DANMAKU_MUTE_DETAIL_ACTION_SPEC,
  },
  editAction: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.editAction,
    title: '编辑禁言',
    items: LIVE_DANMAKU_MUTE_EDIT_ACTION_SPEC,
  },
  unmuteAction: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.unmuteAction,
    title: '解除限制',
    items: LIVE_DANMAKU_MUTE_UNMUTE_ACTION_SPEC,
  },
}
