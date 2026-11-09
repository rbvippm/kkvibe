/** 账单管理 · 渠道对账 · PRD 与功能清单（六大核心维度） */

import { PRD_DIMENSION_LABELS, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export const CHANNEL_RECONCILE_META = {
  title: '渠道对账（现金 / 信用）',
  module: '账单管理',
  updatedAt: '2026-11-09',
  prdVersion: 'v1.0',
} as const

export const CHANNEL_RECONCILE_BACKGROUND = [
  '渠道对账与平台对账同样用一个币种下拉混放现金币种与 X币；信用额度拆为独立账本后，渠道维度也需要分开看现金与信用。',
  'X币对应现在的「信用额度-CNY」，并新增「信用额度-USDT」。',
] as const

export const CHANNEL_RECONCILE_GOALS = [
  '页面顶部新增「现金」「信用」两个 Tab：现金币种 KKC、KKV、USDT；信用币种 信用额度-CNY、信用额度-USDT。',
  '现金 Tab 保留原渠道对账字段，去掉 X币相关（用户 X币总数量、平台上分 / 下分 X总额）。',
  '信用 Tab 只保留：消费数量【会员】、中奖数量【会员】、平台返利数量【会员 + 代理】、平台盈亏数【会员】；渠道详情同口径，另展示用户信用额度-CNY / USDT 总数量。',
] as const

export const CHANNEL_RECONCILE_FEATURE_LIST: PcPrdFeatureRow[] = [
  {
    id: 1,
    module: '渠道对账',
    feature: '现金 / 信用 Tab',
    pageLocation: '页面顶部 Tab',
    prd: {
      functionalLogic: '按账本拆分渠道对账，现金与信用字段各自删减，数据互不混合。',
      interactiveBehavior: '默认「现金」。点 Tab 切换，当前 Tab 写入地址栏（?tab=cash / ?tab=credit），刷新后保持；各 Tab 的筛选条件独立。',
      visualPresentation: 'Tab 顺序：现金、信用；选中深色底白字。信用 Tab 右侧「注1」。',
      dataRules: 'tab 只认 cash / credit，其他值按「现金」处理。',
      exceptions: '某账本无数据时只影响该 Tab。',
      routing: '入口：侧栏「账单管理 → 渠道对账」（/pc/channel-reconcile）。',
    },
  },
  {
    id: 2,
    module: '渠道对账',
    feature: '列表筛选',
    pageLocation: '列表上方筛选区',
    prd: {
      functionalLogic: '按所属渠道、币种、时区筛选渠道列表；币种选项随 Tab 变化。',
      interactiveBehavior: '点「搜索」生效；「清除」恢复默认（全部渠道、该 Tab 第一个币种、北京时区）；「导出」导出当前渠道列表，全局顶部提示「已导出 {币种} 渠道对账 N 条」，无数据提示「暂无数据可导出」。',
      visualPresentation: '第一行：所属渠道（默认「全部」）、币种；第二行：时区、「搜索」「清除」「导出」。所属渠道旁「注2」。',
      dataRules: '现金币种：KKC（默认）、KKV、USDT；信用币种：信用额度-CNY（默认，原 X币）、信用额度-USDT。',
      exceptions: '所选渠道无数据时该行数值为 0。',
      routing: '页内筛选，不跳转。',
    },
  },
  {
    id: 3,
    module: '渠道对账',
    feature: '渠道对账列表',
    pageLocation: '列表表头',
    prd: {
      functionalLogic: '按渠道展示所选币种的累计对账数据，渠道编号倒序。',
      interactiveBehavior: '点「查看详情」打开该渠道的「渠道对账」弹框。',
      visualPresentation:
        '现金列：编号、渠道编号、渠道、用户数量、购买数量、支付手续费、出售数量、消费数量、结算数量、账变增加 / 减少数量、平台返利数量、平台C2C交易返利数量、活动赠送数量、活动金赠送数量、踩雷手续费、平台盈亏数、操作。信用列：编号、渠道编号、渠道、用户数量、消费数量、中奖数量、平台返利数量、平台盈亏数、操作。平台盈亏数正绿负红。表头旁「注3」。',
      dataRules: '信用：平台返利数量 = 信用会员退水 + 信用代理退水；平台盈亏数 = 消费数量 − 中奖数量 − 平台返利数量。用户数量为渠道注册用户数，不随币种变化。',
      exceptions: '无渠道时显示「暂无数据」。',
      routing: '查看详情为页内弹框。',
    },
  },
  {
    id: 4,
    module: '渠道对账',
    feature: '渠道对账详情',
    pageLocation: '「渠道对账」弹框标题旁',
    prd: {
      functionalLogic: '弹框上半部分为该渠道所选币种的累计汇总，下半部分「渠道对账数据」按日 / 月统计该渠道用户明细。字段与当前 Tab 一致。',
      interactiveBehavior: '日统计 / 月统计切换后统计时间改为日期 / 月份并恢复默认；筛选：用户ID、小程序、开发者、统计时间、时区，「搜索」「清除」「导出」。点遮罩或「关闭」收起。',
      visualPresentation:
        '现金汇总：渠道、用户数量及列表全部金额列，外加用户 USDT-TRON / USDT-SOL / KKC / KKV 总数量（去掉用户 X币总数量、平台上分 / 下分 X总额）。信用汇总：渠道、用户数量、消费数量、中奖数量、平台返利数量、平台总盈亏数、用户信用额度-CNY 总数量、用户信用额度-USDT 总数量。统计卡片信用为：消费人数、消费数量、中奖数量、平台返利数量、平台盈亏数。标题旁「注4」。',
      dataRules: '统计时间默认当天 / 当月；用户ID 精确、仅数字。用户持有币种总数量为该渠道用户当前余额，不随币种切换；各渠道之和 = 平台对账「用户持有…总额」。',
      exceptions: '用户ID 非数字提示「用户ID 只能输入数字」；结束早于开始提示「结束时间不能早于开始时间」；无数据卡片为 0、表格「暂无数据」。',
      routing: '用户ID → pc-user-detail（?userId=）。',
    },
  },
]

export const CHANNEL_RECONCILE_SPEC_ANNOT_NO = {
  tabs: 1,
  filters: 2,
  table: 3,
  detail: 4,
} as const

export const CHANNEL_RECONCILE_TABS_SPEC = [
  '现金：KKC / KKV / USDT；信用：信用额度-CNY（原 X币）/ 信用额度-USDT。',
  '当前 Tab 写入地址栏；各 Tab 筛选独立。',
]

export const CHANNEL_RECONCILE_FILTER_SPEC = ['所属渠道、币种、时区；搜索生效、清除恢复默认。', '导出走全局顶部提示。']

export const CHANNEL_RECONCILE_TABLE_SPEC = [
  '现金：原渠道对账列（无 X币相关）。',
  '信用：消费数量【会员】、中奖数量【会员】、平台返利数量【会员 + 代理】、平台盈亏数【会员】。',
  '信用平台盈亏 = 消费 − 中奖 − 返利。',
]

export const CHANNEL_RECONCILE_DETAIL_SPEC = [
  '上：渠道累计汇总；下：日 / 月统计的用户明细。',
  '字段与当前 Tab 一致，现金去掉用户 X币总数量、平台上分 / 下分 X总额。',
  '含该渠道用户持有币种总数量：现金 USDT-TRON / USDT-SOL / KKC / KKV，信用 信用额度-CNY / USDT。',
]
