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
  prdVersion: 'v1.0',
} as const

/** 1. 需求背景 */
export const LIVE_DANMAKU_MUTE_BACKGROUND = [
  '直播场景需对违规弹幕用户执行禁言，运营与主播可在不同入口发起操作，后台需统一留存禁言记录供追溯与解除。',
  '禁言需区分作用范围：房间禁言仅限制当前直播间发言，全局禁言限制用户在所有直播间发言；两类记录需分别管理。',
  '主播在直播中控台对弹幕右键禁言时，默认执行房间禁言；运营在禁言列表可查看全量记录并按来源、类型筛选处理。',
] as const

/** 2. 需求目标 */
export const LIVE_DANMAKU_MUTE_GOALS = [
  '提供禁言记录列表，支持按用户 ID、用户名、禁言来源、禁言类型、状态筛选。',
  '列表展示禁言编号、来源、类型、时间、操作人、原因与当前状态，支持查看详情与解除/重新禁言。',
  '详情弹窗展示禁言基础信息与关联弹幕、直播场次上下文，便于运营复核处置依据。',
] as const

/** 3. 需求功能清单（与页面「注」标注对应，不含文档入口本身） */
export const LIVE_DANMAKU_MUTE_FEATURE_LIST: LiveDanmakuMuteFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '用户 ID',
    pageLocation: '筛选区「用户ID」',
    prd: {
      functionalLogic: '按用户 ID 模糊匹配禁言记录，辅助运营定位指定用户的禁言历史。',
      interactiveBehavior:
        '输入用户 ID 片段后点击「搜索」-> 列表仅展示 userId 包含输入内容的行；点击「清除」-> 清空条件并恢复全量（原型为前端即时过滤）。',
      visualPresentation: '标签「用户ID：」+ 文本输入框，占位符「请输入用户ID」。',
      dataRules: '非必填；匹配规则为包含关系（trim 后）；空值表示不过滤用户 ID。',
      exceptions: '无匹配记录 -> 表格展示「暂无禁言记录」空态，不报错。',
      routing: '筛选结果停留当前列表页，不跳转。',
    },
  },
  {
    id: 2,
    module: '列表筛选',
    feature: '用户名',
    pageLocation: '筛选区「用户名」',
    prd: {
      functionalLogic: '按用户名模糊匹配禁言记录，便于运营通过昵称检索。',
      interactiveBehavior:
        '输入用户名片段后搜索 -> 列表仅展示 username 包含输入内容的行；清除后恢复全量。',
      visualPresentation: '标签「用户名：」+ 文本输入框，占位符「请输入用户名」。',
      dataRules: '非必填；匹配规则为包含关系（trim 后）；空值表示不过滤用户名。',
      exceptions: '组合筛选无交集 -> 空列表 +「暂无禁言记录」。',
      routing: '停留列表页。',
    },
  },
  {
    id: 3,
    module: '列表筛选',
    feature: '禁言来源',
    pageLocation: '筛选区「禁言来源」',
    prd: {
      functionalLogic: '区分禁言操作发起方：主播在直播中控台发起，运营在后台列表发起或处理。',
      interactiveBehavior:
        '选择「主播」或「运营」并搜索 -> 仅展示对应 muteSource 的记录；选「全部」-> 不过滤来源。',
      visualPresentation: '标签「禁言来源：」+ 下拉（全部 / 主播 / 运营）；旁侧「注」标注。',
      dataRules: '枚举值：主播 | 运营；默认「全部」；与记录字段 muteSource 一致。',
      exceptions: '来源与类型组合筛选无结果 -> 空列表，保留已选条件不清空。',
      routing: '停留列表页；可从直播中控台禁言后通过顶部 Tab 或侧栏进入本列表查看新增记录。',
    },
  },
  {
    id: 4,
    module: '列表筛选',
    feature: '禁言类型',
    pageLocation: '筛选区「禁言类型」',
    prd: {
      functionalLogic:
        '区分禁言作用范围：房间禁言仅限制用户在对应直播间发言；全局禁言限制用户在所有直播间发言。',
      interactiveBehavior:
        '选择「房间禁言」或「全局禁言」并搜索 -> 仅展示对应 muteType 的记录；选「全部」-> 展示两类记录。',
      visualPresentation: '标签「禁言类型：」+ 下拉（全部 / 房间禁言 / 全局禁言）；旁侧「注」标注。',
      dataRules:
        '枚举值：房间禁言 | 全局禁言；与记录 muteType 一致。主播端中控台禁言默认房间禁言；全局禁言通常由运营发起（联调期以权限配置为准）。',
      exceptions: '同一用户可同时存在房间禁言与全局禁言两条有效记录 -> 列表分别展示，解除时按各自类型独立处理。',
      routing: '停留列表页；与直播中控台禁言弹窗所选类型联动写入同一份 Mock 数据源。',
    },
  },
  {
    id: 5,
    module: '列表筛选',
    feature: '禁言状态',
    pageLocation: '筛选区「状态」',
    prd: {
      functionalLogic: '按当前禁言是否生效过滤记录，区分「禁言中」与「已解除」历史。',
      interactiveBehavior:
        '选择「禁言中」-> 仅 muted=true；选择「已解除」-> 仅 muted=false；「全部」-> 不过滤状态。',
      visualPresentation: '标签「状态：」+ 下拉（全部 / 禁言中 / 已解除）。',
      dataRules: 'muted=true 展示「禁言中」（红色）；muted=false 展示「已解除」（灰色）；解除后写入 unmutedAt 时间。',
      exceptions: '已解除记录仍保留在列表供审计，不会物理删除。',
      routing: '停留列表页。',
    },
  },
  {
    id: 6,
    module: '列表筛选',
    feature: '搜索与清除',
    pageLocation: '筛选区操作按钮',
    prd: {
      functionalLogic: '触发筛选或重置全部筛选条件，刷新列表展示结果。',
      interactiveBehavior:
        '点击「搜索」-> 按当前筛选条件过滤列表（原型为前端 computed 即时过滤）；点击「清除」-> 重置五项筛选为空并展示全量记录。',
      visualPresentation: '主色按钮「搜索」+ 危险色按钮「清除」，位于筛选区下方工具栏左侧。',
      dataRules: '清除后五项筛选恢复默认空值；分页信息「共 N 条」随 filteredRows 数量更新。',
      exceptions: '接口失败时（联调期）保留筛选条件并提示，列表不清空已有数据。',
      routing: '停留列表页。',
    },
  },
  {
    id: 7,
    module: '列表展示',
    feature: '禁言记录列表',
    pageLocation: '列表表格',
    prd: {
      functionalLogic:
        '汇总展示禁言编号、用户信息、来源、类型、时间、操作人、原因与状态，供运营浏览与处置。',
      interactiveBehavior: '进入页面或筛选后自动渲染；无额外点击；表格支持横向滚动（列较多时）。',
      visualPresentation:
        '标准 wf-table：含编号、禁言编号、用户ID、用户名、禁言来源、禁言类型、禁言时间、操作人、禁言原因、状态、操作列；状态「禁言中」红色、「已解除」灰色；表格区旁侧「注」标注。',
      dataRules:
        '禁言编号格式 MU + 时间戳（Mock）；时间格式 yyyy-MM-dd HH:mm:ss；禁言类型列展示「房间禁言」或「全局禁言」。',
      exceptions: 'filteredRows 为空 -> 单行 colspan 展示「暂无禁言记录」。',
      routing: '列表只读展示；操作列可打开详情或执行解除/禁言。',
    },
  },
  {
    id: 8,
    module: '列表操作',
    feature: '禁言详情',
    pageLocation: '操作列「禁言详情」',
    prd: {
      functionalLogic: '查看单条禁言记录的完整信息与关联弹幕、直播场次上下文，供运营复核。',
      interactiveBehavior: '点击「禁言详情」-> 打开详情弹框；点击遮罩或「关闭」-> 关闭弹框。',
      visualPresentation: '操作列蓝色链接「禁言详情」；弹框标题「禁言详情」，宽版 wf-modal--detail-wide；旁侧「注」标注。',
      dataRules:
        '展示禁言编号、用户、来源、类型、时间、操作人、原因、状态、解除时间；关联弹幕区展示弹幕内容、发送时间、主播、场次 ID、处理结果。',
      exceptions: '关联弹幕或场次字段为空 -> 展示「—」或 Mock 占位，不阻断弹框打开。',
      routing: '弹框内无跳转；用户 ID、主播 ID 以链接样式展示（原型暂不跳转用户详情，联调期可接）。',
    },
  },
  {
    id: 9,
    module: '列表操作',
    feature: '解除/重新禁言',
    pageLocation: '操作列「解除」/「禁言」',
    prd: {
      functionalLogic:
        '对单条记录执行解除或重新生效；解除时按原禁言类型精确匹配记录，避免误解除其他类型。',
      interactiveBehavior:
        '禁言中 -> 展示红色链接「解除」，点击后立即解除并刷新状态为「已解除」；已解除 -> 展示蓝色链接「禁言」，点击后按原记录的 muteSource、muteType 重新禁言。',
      visualPresentation: '与「禁言详情」以竖线分隔；解除为红色 hover，重新禁言为蓝色 hover；旁侧「注」标注。',
      dataRules:
        '解除调用 unmuteUser(userId, { roomId, muteType })；重新禁言沿用原 reason、danmakuContent；全局禁言解除不影响同用户房间禁言记录。',
      exceptions: '接口失败时（联调期）状态不变并提示；无二次确认弹框（原型阶段）。',
      routing: '操作后停留列表页，行状态即时刷新；中控台弹幕区 isUserMuted 与全局/房间禁言状态联动。',
    },
  },
  {
    id: 10,
    module: '详情弹窗',
    feature: '禁言详情与关联弹幕',
    pageLocation: '禁言详情弹框',
    prd: {
      functionalLogic: '分两块展示：禁言处置信息与触发禁言的弹幕及直播上下文，形成完整审计链路。',
      interactiveBehavior: '弹框打开后只读浏览；底部仅「关闭」按钮；不支持在弹框内直接解除（需回列表操作列）。',
      visualPresentation:
        '两节 wf-detail-panel：「禁言详情」「关联弹幕」；禁言中状态值红色强调；弹幕内容可跨列展示。',
      dataRules:
        '处理结果：muted=true 为「已执行禁言」，false 为「已解除禁言」；解除时间为「—」表示仍在禁言中。',
      exceptions: '超长弹幕内容在单元格内换行展示，不截断（原型）；联调期可按产品要求加展开。',
      routing: '关闭弹框回到列表，不刷新筛选条件。',
    },
  },
]

/**
 * 页面「注」标记编号 · 与 LIVE_DANMAKU_MUTE_FEATURE_LIST.id 对齐
 * 无页面标注的功能（如 #1、#2、#5、#6、#10）不在此列出
 */
export const LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO = {
  filterMuteSource: 3,
  filterMuteType: 4,
  tableRecord: 7,
  detailAction: 8,
  toggleMute: 9,
} as const

export type LiveDanmakuMuteAnnotContext = keyof typeof LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO

/** 页面标注文案 · 供 WfSpecAnnot 组件引用 */
export const LIVE_DANMAKU_MUTE_FILTER_MUTE_SOURCE_SPEC = [
  '禁言来源区分操作发起方：「主播」为直播中控台弹幕右键禁言；「运营」为后台禁言列表发起或处理。',
  '筛选为精确匹配，选「全部」时不过滤来源。',
] as const

export const LIVE_DANMAKU_MUTE_FILTER_MUTE_TYPE_SPEC = [
  '禁言类型区分作用范围：「房间禁言」仅限制用户在对应直播间发言；「全局禁言」限制用户在所有直播间发言。',
  '主播在直播中控台禁言时默认选中「房间禁言」；运营可在中控台或列表侧处理全局禁言。',
  '同一用户可同时存在房间禁言与全局禁言两条记录，解除时需按各自类型分别操作。',
] as const

export const LIVE_DANMAKU_MUTE_TABLE_RECORD_SPEC = [
  '列表展示全量禁言记录，含禁言类型列；「禁言中」红色、「已解除」灰色。',
  '数据与直播中控台禁言操作、解除操作共用同一份 Mock 数据源，新增禁言即时出现在列表顶部。',
] as const

export const LIVE_DANMAKU_MUTE_DETAIL_ACTION_SPEC = [
  '点击打开禁言详情弹框，展示禁言编号、来源、类型、操作人、原因、状态及关联弹幕与直播场次信息。',
  '弹框内只读，解除禁言需返回列表操作列执行。',
] as const

export const LIVE_DANMAKU_MUTE_TOGGLE_MUTE_SPEC = [
  '「解除」：按该条记录的禁言类型（房间/全局）精确解除，更新状态为「已解除」并写入解除时间。',
  '「禁言」：对已解除记录按原来源与类型重新生效，沿用原禁言原因与关联弹幕信息。',
  '全局禁言解除后，用户在其他直播间仍可能因房间禁言记录而受限，反之亦然。',
] as const

export const LIVE_DANMAKU_MUTE_ANNOT_MAP: Record<
  LiveDanmakuMuteAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
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
  toggleMute: {
    no: LIVE_DANMAKU_MUTE_SPEC_ANNOT_NO.toggleMute,
    title: '解除/重新禁言',
    items: LIVE_DANMAKU_MUTE_TOGGLE_MUTE_SPEC,
  },
}
