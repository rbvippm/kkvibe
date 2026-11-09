/** 账单管理 · 平台对账 · PRD 与功能清单（六大核心维度） */

import { PRD_DIMENSION_LABELS, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export const PLATFORM_RECONCILE_META = {
  title: '平台对账（现金 / 信用）',
  module: '账单管理',
  updatedAt: '2026-11-09',
  prdVersion: 'v1.0',
} as const

export const PLATFORM_RECONCILE_BACKGROUND = [
  '原平台对账用一个「币种」下拉同时承载现金币种与 X币，X币（信用额度）只有投注、中奖、返利、盈亏有意义，其余充值、提现、C2C、活动等字段长期为 0，容易误读。',
  '信用额度已拆为独立账本，X币对应现在的「信用额度-CNY」，并新增「信用额度-USDT」，需要和现金账分开对账。',
] as const

export const PLATFORM_RECONCILE_GOALS = [
  '页面顶部新增「现金」「信用」两个 Tab：现金币种为 KKC、KKV、USDT；信用币种为 信用额度-CNY、信用额度-USDT。',
  '现金 Tab 保留原平台对账全部统计，去掉 X币相关字段（用户持有 X币总额、平台上分 X总额、平台下分 X总额）。',
  '信用 Tab 只保留与信用会员相关的字段：平台对账 4 项（币种投注总额、用户中奖总额、平台返利总额、平台总盈亏）+ 用户持有信用额度-CNY / 信用额度-USDT 总额，平台对账数据 4 项（投注人数、币种投注量、平台返利额度、平台盈亏额）。',
] as const

export const PLATFORM_RECONCILE_FEATURE_LIST: PcPrdFeatureRow[] = [
  {
    id: 1,
    module: '平台对账',
    feature: '现金 / 信用 Tab',
    pageLocation: '页面顶部 Tab',
    prd: {
      functionalLogic: '按账本拆分平台对账：「现金」看现金钱包（KKC、KKV、USDT），「信用」看信用额度钱包（信用额度-CNY、信用额度-USDT）。两本账统计口径不同，字段各自删减。',
      interactiveBehavior: '默认「现金」。点 Tab 切换，当前 Tab 写入地址栏（?tab=cash / ?tab=credit），刷新后保持；两个 Tab 的币种选择各自记住，切回来不重置。',
      visualPresentation: 'Tab 顺序：现金、信用；选中深色底白字。信用 Tab 右侧「注1」。',
      dataRules: 'tab 只认 cash / credit，其他值按「现金」处理。',
      exceptions: '某账本无数据时只影响该 Tab，统计显示 0、列表显示「暂无数据」。',
      routing: '入口：侧栏「账单管理 → 平台对账」（/pc/platform-reconcile）。',
    },
  },
  {
    id: 2,
    module: '平台对账',
    feature: '币种切换',
    pageLocation: '顶部「币种」下拉',
    prd: {
      functionalLogic: '币种决定下方「平台对账」与「平台对账数据」全部数值；下拉选项随 Tab 变化。',
      interactiveBehavior: '选择后立即刷新两块统计，不需点搜索；「平台对账数据」已填的筛选条件保留。',
      visualPresentation: '现金选项：KKC（默认）、KKV、USDT；信用选项：信用额度-CNY（默认）、信用额度-USDT。下拉旁「注2」。',
      dataRules: '信用额度-CNY 即原 X币；USDT 现金币种按 USDT-TRON + USDT-SOL 合并统计（待接口确认）。',
      exceptions: '币种无流水时全部数值为 0。',
      routing: '页内刷新，不跳转。',
    },
  },
  {
    id: 3,
    module: '平台对账',
    feature: '平台对账（全量汇总）',
    pageLocation: '「平台对账」标题旁',
    prd: {
      functionalLogic:
        '展示所选币种自上线以来的平台汇总。现金：币种充值总量、支付手续费总额、币种提现总量、币种投注总额、用户结算总额、账变增加 / 减少总额、平台返利总额、C2C返利总额、活动赠送总额、踩雷手续费、平台总盈亏、活动金赠送总数量，以及用户持有 USDT-TRON / USDT-SOL / KKC / KKV 总额。信用：币种投注总额【会员】、用户中奖总额【会员】、平台返利总额【会员 + 代理】、平台总盈亏【会员】，以及用户持有信用额度-CNY / 信用额度-USDT 总额（原「用户持有 X币总额」）。',
      interactiveBehavior: '只读，不受「平台对账数据」筛选影响；「用户持有…总额」为该账本全部币种的当前余额，不随币种下拉切换。',
      visualPresentation: '三列键值表格（字段名灰底）；平台总盈亏为正绿、负红。信用「平台返利总额」下方小字拆分「信用会员退水 / 信用代理退水」。标题旁「注3」。',
      dataRules:
        '信用：平台返利 = 信用会员退水 + 信用代理退水（本期退水：平台 0、一级代理 0.5%、二级代理 0.5%、会员 1%）；平台总盈亏 = 币种投注总额 − 用户中奖总额 − 平台返利总额。现金去掉 X币相关：用户持有 X币总额、平台上分 X总额、平台下分 X总额。数值最多 6 位小数。',
      exceptions: '无数据显示 0；接口失败时整块显示「数据加载失败，请刷新重试」（待接口确认）。',
      routing: '无跳转。',
    },
  },
  {
    id: 4,
    module: '平台对账数据',
    feature: '按条件统计（筛选）',
    pageLocation: '「平台对账数据」筛选区',
    prd: {
      functionalLogic: '按用户、所属渠道、小程序、开发者、统计时间、时区统计所选币种的区间数据，两个 Tab 筛选项一致。',
      interactiveBehavior: '点「搜索」或回车生效；「重置」恢复默认（统计时间为当天、时区北京）；「导出」导出当前用户明细，全局顶部提示「已导出 {币种} 对账数据 N 条」，无数据提示「暂无数据可导出」。',
      visualPresentation: '第一行：用户ID、所属渠道、小程序、开发者；第二行：统计时间（起止日期）、时区；底部「搜索」「重置」「导出」。用户ID 旁「注4」。',
      dataRules: '用户ID 精确匹配、仅数字；统计时间默认当天，含起止日；时区影响日切口径（Mock 不变）；条件之间为「且」。',
      exceptions: '用户ID 非数字提示「用户ID 只能输入数字」；结束早于开始提示「结束时间不能早于开始时间」；均不生效。',
      routing: '页内筛选，不跳转。',
    },
  },
  {
    id: 5,
    module: '平台对账数据',
    feature: '区间统计与用户明细',
    pageLocation: '统计卡片右侧',
    prd: {
      functionalLogic:
        '统计卡片汇总筛选结果，下方按用户列出明细。现金卡片：币种充值量、支付手续费、币种提现量、币种投注量、用户结算量、账变增加 / 减少额、平台返利额、C2C返利额、活动赠送额、踩雷手续费、平台盈亏额、活动金赠送总数量、买币人数、投注人数、首充人数 / 金额（新用户）、注册人数、在线总人数。信用卡片：投注人数【会员】、币种投注量【会员】、平台返利额度【会员 + 代理】、平台盈亏额【会员】。',
      interactiveBehavior: '点「用户ID」进入该用户详情。',
      visualPresentation:
        '灰底卡片「字段：数值」；表格列现金：编号、用户名、用户ID、所属渠道、购买数量、支付手续费、出售数量、消费数量、结算数量、账变增加 / 减少数量、平台返利数量、平台C2C交易返利数量、活动赠送数量、活动金赠送数量、踩雷手续费、平台盈亏数；信用：编号、用户名、用户ID、所属渠道、消费数量、中奖数量、平台返利数量、平台盈亏数。卡片右上「注5」。',
      dataRules: '投注人数 = 区间内有投注的去重用户数；在线总人数为实时值，不随筛选变化；信用平台返利额度 = 信用会员退水 + 信用代理退水；Mock 覆盖 6 个用户、4 个日期（11-09 / 11-08 / 11-07 / 10-28）。',
      exceptions: '筛选无结果：卡片显示 0，表格「暂无数据」。',
      routing: '用户ID → pc-user-detail（?userId=）。',
    },
  },
]

export const PLATFORM_RECONCILE_SPEC_ANNOT_NO = {
  tabs: 1,
  currency: 2,
  summary: 3,
  dataFilters: 4,
  dataStats: 5,
} as const

export const PLATFORM_RECONCILE_TABS_SPEC = [
  '现金：KKC / KKV / USDT；信用：信用额度-CNY（原 X币）/ 信用额度-USDT。',
  '当前 Tab 写入地址栏，两个 Tab 的币种各自记住。',
]

export const PLATFORM_RECONCILE_CURRENCY_SPEC = ['选项随 Tab 变化，切换后上下两块统计立即刷新。', '信用额度-CNY 即原 X币。']

export const PLATFORM_RECONCILE_SUMMARY_SPEC = [
  '全量汇总，不受下方筛选影响。',
  '现金：去掉用户持有 X币总额、平台上分 / 下分 X总额。',
  '信用：投注总额【会员】、中奖总额【会员】、返利总额【会员 + 代理】、总盈亏【会员】+ 用户持有信用额度-CNY / USDT 总额。',
  '用户持有币种总额为当前余额，不随币种下拉切换。',
  '信用平台返利 = 信用会员退水 + 信用代理退水；总盈亏 = 投注 − 中奖 − 返利。',
]

export const PLATFORM_RECONCILE_FILTER_SPEC = [
  '用户ID 精确、仅数字；统计时间默认当天。',
  '搜索 / 回车生效；重置恢复默认；导出走全局顶部提示。',
]

export const PLATFORM_RECONCILE_STATS_SPEC = [
  '卡片汇总筛选结果；下方按用户列出明细。',
  '信用：投注人数、币种投注量、平台返利额度、平台盈亏额。',
  '在线总人数为实时值（仅现金展示）。',
]
