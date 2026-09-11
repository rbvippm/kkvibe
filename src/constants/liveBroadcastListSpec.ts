/** 直播管理 · 直播列表 · PRD 与功能清单（仅已标注功能） */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type LiveBroadcastListPrdDimension = PcPrdDimension
export type LiveBroadcastListFeatureRow = PcPrdFeatureRow

export const LIVE_BROADCAST_LIST_META = {
  title: '直播管理 · 直播列表',
  module: '直播管理',
  updatedAt: '2026-09-11',
  prdVersion: 'v1.4',
} as const

export const LIVE_BROADCAST_LIST_BACKGROUND = [
  '运营需要按场次查看当前房间是正在直播还是直播预告，并核对人数、预约、热度、点赞的展示值是否与主播列表配置对得上。',
  '展示值拆成基准、叠加量、总数：基准读自主播列表该主播的生效配置。人数的展示人数 = 基准 + 虚拟 + 实际，实际再拆成会员和游客（包含游客）；预约、热度、点赞仍用实际。',
  '本页只做列表核对与进房，不在本页改基准配置。',
] as const

export const LIVE_BROADCAST_LIST_GOALS = [
  '筛选和列表都能区分「正在直播」「直播预告」。',
  '人数列展示总数 / 基准 / 虚拟 / 会员 / 游客；预约、热度、点赞仍展示总数 / 基准 / 实际。口径与主播列表生效配置对齐。',
]

export const LIVE_BROADCAST_LIST_FEATURE_LIST: LiveBroadcastListFeatureRow[] = [
  {
    id: 1,
    module: '直播状态',
    feature: '直播状态',
    pageLocation: '筛选区「直播状态」及列表「直播状态」列',
    prd: {
      functionalLogic:
        '区分当前场次是正在直播还是直播预告。筛选用于缩小列表，列表列只读回显该场次状态。',
      interactiveBehavior:
        '筛选下拉默认「全部」。选「正在直播」或「直播预告」后点「搜索」按状态精确过滤；点「清除」恢复「全部」并展示全量。未点搜索不立刻过滤。列表与卡片均展示中文状态。',
      visualPresentation:
        '筛选：标签「直播状态」+ 下拉（全部 / 正在直播 / 直播预告），旁侧「注1」。列表「直播状态」列展示「正在直播」或「直播预告」；卡片写在模式 · 分类后。',
      dataRules:
        '枚举 live=正在直播、preview=直播预告。默认全部。与行字段 status 精确匹配。原型 14 条中 8 条正在直播、6 条直播预告。',
      exceptions: '无匹配 -> 表格「暂无数据」，保留已选条件。状态字段缺失（联调期）按正在直播兜底并待接口确认。',
      routing: '停留本页。点「进入直播间」进直播中控台，不改变本页状态筛选。',
    },
  },
  {
    id: 2,
    module: '展示指标',
    feature: '人数',
    pageLocation: '列表「人数」列',
    prd: {
      functionalLogic:
        '展示该场次的展示人数。基准读自主播列表该主播生效的基准人数；虚拟为每分钟人数增加 / 人数减少算出的虚拟人数；实际拆成会员和游客（包含游客）。总数 = 基准 + 虚拟 + 会员 + 游客。',
      interactiveBehavior: '只读。列表式、卡片式同一口径。不在本页改基准或高阶规则。',
      visualPresentation:
        '表头「人数」旁「注2」。单元格五行：总数 / 基准 / 虚拟 / 会员 / 游客，数字千分位。卡片在「人数」下同样五行。',
      dataRules:
        '非负整数。能对上主播列表的主播（如小夜不困）基准与主播列表生效基准人数一致，原型 280。虚拟 156、会员 118、游客 72，总数 626。直播预告场次仍展示当前预热人数，不为空。',
      exceptions: '对不上主播列表时基准待接口确认，原型仍给出 Mock 数。虚拟、会员或游客为 0 时仍展示 0，不隐藏该行。',
      routing: '不跳转主播列表；改基准到主播列表「配置指标」或「全局配置」。',
    },
  },
  {
    id: 3,
    module: '展示指标',
    feature: '预约',
    pageLocation: '列表「预约」列',
    prd: {
      functionalLogic:
        '展示该场次的展示预约数。基准读自主播列表生效的基础预约；实际为登录用户点击/取消预约叠加后的展示预约；总数 = 基准 + 实际。',
      interactiveBehavior: '只读。列表式、卡片式同一口径。',
      visualPresentation:
        '表头「预约」旁「注3」。单元格三行：总数 / 基准 / 实际。卡片在「预约」下同样三行。',
      dataRules:
        '非负整数。小夜不困原型基准 60、实际 78、总数 138，与主播列表基础预约对齐。游客点预约会跳转登录页，不会产生预约增减。',
      exceptions: '取消预约后实际可低于基准，总数仍按基准+实际计算，下限不在本页截断。无匹配筛选结果走空态。',
      routing: '不跳转；预约规则在主播列表高阶设置。',
    },
  },
  {
    id: 4,
    module: '展示指标',
    feature: '热度',
    pageLocation: '列表「热度」列',
    prd: {
      functionalLogic:
        '展示该场次的展示热度。基准读自主播列表生效的基础热度；实际为按人数/弹幕/礼物/点赞加权叠加后的展示热度增量；总数 = 基准 + 实际。',
      interactiveBehavior: '只读。列表式、卡片式同一口径。本页不提供热度试算。',
      visualPresentation:
        '表头「热度」旁「注4」。单元格三行：总数 / 基准 / 实际，数字千分位。卡片在「热度」下同样三行。',
      dataRules:
        '非负整数。小夜不困原型基准 1,200、实际 12,860、总数 14,060，基准与主播列表基础热度对齐。公式与主播列表一致：展示热度 = 基础热度 + 展示人数×人数系数 + 弹幕条数×弹幕系数 + 礼物金额×礼物系数 + 本场点赞×点赞系数。',
      exceptions: '系数全为 0 时实际可为 0，总数等于基准。接口失败（联调期）保留上次展示值。',
      routing: '不跳转；热度系数在主播列表全局/主播高阶设置。',
    },
  },
  {
    id: 5,
    module: '展示指标',
    feature: '点赞',
    pageLocation: '列表「点赞」列',
    prd: {
      functionalLogic:
        '展示该场次的本场点赞。基准读自主播列表生效的本场点赞底数；实际为登录用户每次点赞按范围叠加后的展示点赞；总数 = 基准 + 实际。',
      interactiveBehavior: '只读。列表式、卡片式同一口径。',
      visualPresentation:
        '表头「点赞」旁「注5」。单元格三行：总数 / 基准 / 实际。卡片在「点赞」下同样三行。',
      dataRules:
        '非负整数。小夜不困原型基准 180、实际 412、总数 592，基准与主播列表本场点赞对齐。游客点赞会跳转登录页，不会叠加本场点赞。',
      exceptions: '未开播的预告场次仍展示当前点赞 Mock，不为空。超长数字单元格内换行，不用省略号。',
      routing: '不跳转；点赞增减范围在主播列表高阶设置。',
    },
  },
]

export const LIVE_BROADCAST_LIST_SPEC_ANNOT_NO = {
  liveStatus: 1,
  people: 2,
  appointment: 3,
  heat: 4,
  like: 5,
} as const

export type LiveBroadcastListAnnotContext = keyof typeof LIVE_BROADCAST_LIST_SPEC_ANNOT_NO

export const LIVE_BROADCAST_LIST_ANNOT_MAP: Record<
  LiveBroadcastListAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  liveStatus: {
    no: 1,
    title: '直播状态',
    items: [
      '筛选全部 / 正在直播 / 直播预告，点「搜索」生效，「清除」恢复全量。',
      '列表与卡片只读展示对应中文状态。',
    ],
  },
  people: {
    no: 2,
    title: '人数',
    items: [
      '五行：总数 / 基准 / 虚拟 / 会员 / 游客，总数 = 基准 + 虚拟 + 会员 + 游客。',
      '展示人数 = 基准 + 虚拟 + 实际（包含游客）；实际再拆会员和游客。',
    ],
  },
  appointment: {
    no: 3,
    title: '预约',
    items: ['三行：总数 / 基准 / 实际，总数 = 基准 + 实际。', '基准读主播列表基础预约，实际为预约/取消叠加后的展示预约。'],
  },
  heat: {
    no: 4,
    title: '热度',
    items: ['三行：总数 / 基准 / 实际，总数 = 基准 + 实际。', '基准读主播列表基础热度，实际按人数/弹幕/礼物/点赞加权。'],
  },
  like: {
    no: 5,
    title: '点赞',
    items: ['三行：总数 / 基准 / 实际，总数 = 基准 + 实际。', '基准读主播列表本场点赞底数，实际为登录用户点赞叠加值。'],
  },
}
