/** 直播中控台 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type LiveBroadcastPrdDimension = PcPrdDimension
export type LiveBroadcastFeatureRow = PcPrdFeatureRow

export const LIVE_BROADCAST_META = {
  title: '直播中控台',
  module: '直播管理',
  updatedAt: '2026-07-04',
  prdVersion: 'v1.1',
} as const

/** 1. 需求背景 */
export const LIVE_BROADCAST_BACKGROUND = [
  '主播或运营需在直播过程中实时查看弹幕、发送官方提醒，并对违规弹幕用户快速处置。',
  '中控台需展示当前直播间上下文（名称、ID），并提供禁言列表快捷入口，便于查看当前生效禁言人数。',
  '禁言操作需支持房间禁言与全局禁言两种类型，主播端默认房间禁言；处置记录同步写入禁言列表供追溯。',
] as const

/** 2. 需求目标 */
export const LIVE_BROADCAST_GOALS = [
  '提供直播画面区、直播提醒发送与弹幕消息侧栏，支撑直播过程基础管控。',
  '弹幕支持点击/右键唤起操作菜单，对非系统消息执行禁言；已禁言用户在弹幕列表展示标识。',
  '禁言弹框支持选择禁言类型（默认房间禁言）、填写禁言原因，成功后写入禁言列表并提示运营查看。',
] as const

/** 3. 需求功能清单（与页面「注」标注对应，不含文档入口本身） */
export const LIVE_BROADCAST_FEATURE_LIST: LiveBroadcastFeatureRow[] = [
  {
    id: 1,
    module: '页面信息',
    feature: '当前直播间',
    pageLocation: '工具栏「当前直播间」',
    prd: {
      functionalLogic: '展示主播当前管控的直播间名称与 roomId，明确禁言、提醒等操作的生效范围。',
      interactiveBehavior: '进入页面后自动展示，无需用户操作；随路由/接口切换直播间时刷新展示（联调期）。',
      visualPresentation: '工具栏左侧文案「当前直播间：{名称}（{roomId}）」，名称加粗；旁侧「注1」标注。',
      dataRules: 'Mock 示例：EZ 的直播间（live_8829103）；roomId 与禁言记录 roomId、场次 sessionId 关联。',
      exceptions: '直播间信息加载失败时（联调期）展示占位或错误提示，禁用禁言/提醒操作。',
      routing: '停留中控台；无跳转。',
    },
  },
  {
    id: 2,
    module: '快捷入口',
    feature: '禁言列表',
    pageLocation: '工具栏「禁言列表（N）」',
    prd: {
      functionalLogic: '展示当前生效禁言人数，并提供跳转禁言列表页的快捷入口。',
      interactiveBehavior: '点击链接 -> 路由跳转至禁言列表页；禁言/解除后 mutedCount 即时更新括号内数字。',
      visualPresentation: '工具栏右侧蓝色链接「禁言列表（N）」；N 为 muted=true 的记录总数；旁侧「注2」标注。',
      dataRules: 'N 取自 muteRecords 中 muted=true 的条数，含房间禁言与全局禁言；与禁言列表页数据源一致。',
      exceptions: 'N=0 时仍展示链接，括号内为 0。',
      routing: '跳转 /pc/live-danmaku-mute-list；可从列表页 Tab 或侧栏返回中控台。',
    },
  },
  {
    id: 3,
    module: '直播画面',
    feature: '直播画面区',
    pageLocation: '主区域播放器',
    prd: {
      functionalLogic: '承载直播视频流展示区域，供主播/运营对照画面与弹幕内容（原型为占位）。',
      interactiveBehavior: '原型阶段无播放控制；联调期接入拉流后支持播放/暂停等（待接口确认）。',
      visualPresentation: '16:9 黑色背景区域，居中灰色占位文案「直播画面」；最小高度 280px；区域旁侧「注3」标注。',
      dataRules: '联调期以实际流地址与鉴权为准；原型不模拟卡顿/断流。',
      exceptions: '拉流失败时（联调期）展示错误态占位，不影响弹幕与禁言功能。',
      routing: '无跳转。',
    },
  },
  {
    id: 4,
    module: '直播提醒',
    feature: '发送直播提醒',
    pageLocation: '直播提醒输入区',
    prd: {
      functionalLogic: '将运营/主播编辑的官方提醒内容发送至当前直播间弹幕消息流，用于公告或引导。',
      interactiveBehavior:
        '输入内容后点击「发送」或回车 -> 清空输入框并在弹幕列表追加一条系统样式提醒；空内容不发送。',
      visualPresentation:
        '标签「直播提醒：」+ 输入框（placeholder「请输入提醒内容」）+ 主色「发送」按钮；下方红色说明文案；旁侧「注4」标注。',
      dataRules: '内容 maxlength=100；发送后以 username「直播提醒」、avatar「官」写入弹幕列表；trim 后非空才发送。',
      exceptions: '空内容或仅空格 -> 不发送、无提示（原型）；接口失败时（联调期）保留输入内容并提示。',
      routing: '发送后停留中控台，弹幕列表滚动展示新消息。',
    },
  },
  {
    id: 5,
    module: '弹幕消息',
    feature: '弹幕消息列表',
    pageLocation: '右侧「弹幕消息」面板',
    prd: {
      functionalLogic: '实时展示当前直播间弹幕流，含用户消息、进入直播间系统消息及直播提醒，供处置参考。',
      interactiveBehavior: '列表只读滚动浏览；点击或右键单条弹幕 -> 打开操作菜单（系统消息禁言入口禁用）。',
      visualPresentation:
        '侧栏标题「弹幕消息」+ 点赞/观看统计胶囊；列表项含头像、内容、时间；空态「暂无弹幕消息」；标题区旁侧「注5」标注。',
      dataRules:
        '进入直播间系统消息展示为「{用户名} 进入直播间」；普通消息为「{用户名}：{内容}」；统计每 2 分钟更新（文案提示，原型静态 Mock）。',
      exceptions: '无弹幕 -> 空态文案；超长内容换行展示不截断。',
      routing: '停留中控台；操作菜单与禁言弹框为页内浮层。',
    },
  },
  {
    id: 6,
    module: '弹幕消息',
    feature: '已禁言标识',
    pageLocation: '弹幕列表项',
    prd: {
      functionalLogic: '对已禁言用户（房间禁言或全局禁言生效）的弹幕项做视觉区分，避免重复处置。',
      interactiveBehavior: '禁言成功后列表项自动刷新样式与「已禁言」标签；解除禁言后标签消失（与禁言列表联动）。',
      visualPresentation: '整行 opacity 降低；内容下方红色小标签「已禁言」；列表区旁侧「注6」标注。',
      dataRules:
        'isUserMuted 判定：存在 muted=true 的全局禁言，或 muted=true 且 roomId 匹配的房间禁言；系统消息同样参与判定但不开放禁言入口。',
      exceptions: '同一用户仅房间禁言在其他直播间中控台不展示已禁言（全局禁言则任意直播间均展示）。',
      routing: '无跳转。',
    },
  },
  {
    id: 7,
    module: '弹幕操作',
    feature: '弹幕操作菜单',
    pageLocation: '弹幕右键/点击菜单',
    prd: {
      functionalLogic: '对单条弹幕提供快捷处置入口，当前仅保留「禁言」操作（已移除删除消息类操作）。',
      interactiveBehavior:
        '点击或右键弹幕 -> 在鼠标位置弹出菜单；点击页面其他区域或右键非弹幕区 -> 关闭菜单；系统消息「禁言」按钮禁用。',
      visualPresentation: '固定定位白底菜单，标题为用户名（系统消息带「系统」标签）；菜单项「禁言」；菜单标题旁侧「注7」标注。',
      dataRules: '仅非 isSystem 消息可点击「禁言」进入禁言弹框；菜单跟随 clientX/clientY 定位。',
      exceptions: '系统消息、直播提醒 -> 禁言按钮 disabled，hover 无高亮。',
      routing: '点击「禁言」-> 打开禁言用户弹框，关闭操作菜单。',
    },
  },
  {
    id: 8,
    module: '禁言弹框',
    feature: '禁言类型',
    pageLocation: '禁言用户弹框「禁言类型」',
    prd: {
      functionalLogic:
        '选择禁言作用范围：房间禁言仅限制当前直播间发言；全局禁言限制用户在所有直播间发言。',
      interactiveBehavior:
        '打开弹框时默认选中「房间禁言」；可切换为「全局禁言」；与禁言原因一并提交。',
      visualPresentation: '单选组：房间禁言 / 全局禁言；展示目标用户与触发弹幕摘要；类型区旁侧「注8」标注。',
      dataRules:
        '默认值：房间禁言；muteSource 记为「主播」（开播主播端发起）；muteType 写入禁言记录并与禁言列表同步。',
      exceptions: '联调期若主播无全局禁言权限，全局选项可隐藏或禁用（待权限配置确认）。',
      routing: '确认后关闭弹框，写入禁言列表；提示「已{类型}用户 xxx，可在禁言列表查看」。',
    },
  },
  {
    id: 9,
    module: '禁言弹框',
    feature: '禁言原因与确认',
    pageLocation: '禁言用户弹框「禁言原因」',
    prd: {
      functionalLogic: '记录禁言处置原因，关联触发弹幕内容与发送时间，形成可追溯审计信息。',
      interactiveBehavior:
        '禁言原因必填；点击「确定禁言」或回车 -> 校验通过后提交；原因为空 -> 展示「请输入禁言原因」；「取消」或遮罩 -> 关闭不保存。',
      visualPresentation: '必填标签「禁言原因」+ 输入框 maxlength=50；底部「取消」「确定禁言」；校验提示 wf-modal__hint；原因区旁侧「注9」标注。',
      dataRules:
        'reason trim 后非空；danmakuContent、danmakuSentAt 取自触发弹幕；成功后 actionHint 蓝色提示 3 秒后消失。',
      exceptions: '提交失败时（联调期）弹框不关闭并提示；重复禁言同用户同类型 -> 更新原记录 mutedAt 与原因。',
      routing: '成功后停留中控台；禁言列表 Tab 可查看新增/更新记录。',
    },
  },
]

/** 页面「注」标记编号 · 与 LIVE_BROADCAST_FEATURE_LIST.id 一一对应 */
export const LIVE_BROADCAST_SPEC_ANNOT_NO = {
  currentRoom: 1,
  muteListLink: 2,
  livePlayer: 3,
  liveReminder: 4,
  danmakuList: 5,
  mutedBadge: 6,
  danmakuActionMenu: 7,
  muteType: 8,
  muteReason: 9,
} as const

export type LiveBroadcastAnnotContext = keyof typeof LIVE_BROADCAST_SPEC_ANNOT_NO

export const LIVE_BROADCAST_CURRENT_ROOM_SPEC = [
  '展示当前管控的直播间名称与 roomId，禁言、直播提醒等操作均作用于该直播间。',
  '进入页面自动展示；联调期切换直播间时随接口刷新。',
] as const

export const LIVE_BROADCAST_MUTE_LIST_LINK_SPEC = [
  '括号内数字为当前生效禁言总数（含房间禁言与全局禁言），与禁言列表页数据同步。',
  '点击跳转禁言列表，可查看详情、解除或重新禁言。',
] as const

export const LIVE_BROADCAST_LIVE_PLAYER_SPEC = [
  '直播视频流展示区域，供对照画面与弹幕内容（原型为黑色占位）。',
  '联调期接入拉流后支持播放控制；原型阶段无播放交互。',
] as const

export const LIVE_BROADCAST_LIVE_REMINDER_SPEC = [
  '直播提醒会以「直播提醒」身份发送至当前直播间弹幕消息列表，用于官方公告或引导。',
  '内容最多 100 字，发送后输入框清空并在顶部提示「直播提醒已发送至弹幕区」。',
] as const

export const LIVE_BROADCAST_DANMAKU_LIST_SPEC = [
  '展示当前直播间弹幕流，含用户消息、进入直播间提示及直播提醒。',
  '点击或右键弹幕可打开操作菜单；列表支持滚动浏览，空态展示「暂无弹幕消息」。',
] as const

export const LIVE_BROADCAST_MUTED_BADGE_SPEC = [
  '对已禁言用户（房间禁言或全局禁言生效）的弹幕项展示红色「已禁言」标签，整行半透明。',
  '全局禁言在任意直播间均展示标识；仅房间禁言时在其他直播间中控台不展示。',
] as const

export const LIVE_BROADCAST_DANMAKU_ACTION_MENU_SPEC = [
  '对非系统弹幕提供「禁言」入口；系统消息（如进入直播间）禁言按钮禁用。',
  '已移除删除单条/当前直播间/全直播间消息等操作，仅保留禁言。',
] as const

export const LIVE_BROADCAST_MUTE_TYPE_SPEC = [
  '开播主播端禁言默认「房间禁言」，仅限制用户在当前直播间发言。',
  '「全局禁言」限制用户在所有直播间发言；两类记录独立管理，解除时需分别操作。',
  '禁言来源记为「主播」，记录同步至禁言列表。',
] as const

export const LIVE_BROADCAST_MUTE_REASON_SPEC = [
  '禁言原因为必填项，最多 50 字；提交时关联触发弹幕内容与发送时间。',
  '原因为空时展示「请输入禁言原因」，不提交；成功后提示可在禁言列表查看。',
] as const

export const LIVE_BROADCAST_ANNOT_MAP: Record<
  LiveBroadcastAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  currentRoom: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.currentRoom,
    title: '当前直播间',
    items: LIVE_BROADCAST_CURRENT_ROOM_SPEC,
  },
  muteListLink: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.muteListLink,
    title: '禁言列表入口',
    items: LIVE_BROADCAST_MUTE_LIST_LINK_SPEC,
  },
  livePlayer: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.livePlayer,
    title: '直播画面区',
    items: LIVE_BROADCAST_LIVE_PLAYER_SPEC,
  },
  liveReminder: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.liveReminder,
    title: '直播提醒',
    items: LIVE_BROADCAST_LIVE_REMINDER_SPEC,
  },
  danmakuList: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.danmakuList,
    title: '弹幕消息列表',
    items: LIVE_BROADCAST_DANMAKU_LIST_SPEC,
  },
  mutedBadge: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.mutedBadge,
    title: '已禁言标识',
    items: LIVE_BROADCAST_MUTED_BADGE_SPEC,
  },
  danmakuActionMenu: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.danmakuActionMenu,
    title: '弹幕操作菜单',
    items: LIVE_BROADCAST_DANMAKU_ACTION_MENU_SPEC,
  },
  muteType: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.muteType,
    title: '禁言类型',
    items: LIVE_BROADCAST_MUTE_TYPE_SPEC,
  },
  muteReason: {
    no: LIVE_BROADCAST_SPEC_ANNOT_NO.muteReason,
    title: '禁言原因',
    items: LIVE_BROADCAST_MUTE_REASON_SPEC,
  },
}
