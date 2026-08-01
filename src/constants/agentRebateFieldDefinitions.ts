/** 返佣代理 · 字段定义（与返佣代理原型 UI 双向对齐） */

export type AgentRebateFieldDefRow = {
  no: number | string
  name: string
  biz: string
  dimension: string
  method: string
  handler: string
}

export type AgentRebateFieldDefModule = {
  id: string
  title: string
  rows: AgentRebateFieldDefRow[]
}

export const AGENT_REBATE_FIELD_DEF_META = {
  title: '字段定义',
  subtitle: '返佣代理',
  columns: ['序号', '字段名', '业务口径', '统计维度', '统计方式', '处理方'] as const,
}

export const AGENT_REBATE_FIELD_DEF_MODULES: AgentRebateFieldDefModule[] = [
  {
    id: 'direct',
    title: '模块：【代理中心：我的直属】',
    rows: [
      {
        no: 1,
        name: '新增会员',
        biz: '我的直属会员在某个日期段新增数量',
        dimension: '汇总：我的直属会员+日期',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 2,
        name: '活跃人数',
        biz: '我的直属会员在某个日期段在线过',
        dimension: '汇总：我的直属会员+日期',
        method: '实时',
        handler: '金刚',
      },
      {
        no: 3,
        name: '充值总额',
        biz: '我的直属会员在某个日期段的某个币种充值总金额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '实时',
        handler: '金刚',
      },
      {
        no: 4,
        name: '取款总额',
        biz: '我的直属会员在某个日期段的某个币种取款总金额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '实时',
        handler: '金刚',
      },
      {
        no: 5,
        name: '有效投注',
        biz: '我的直属会员在某个日期段的某个币种有效投注总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 6,
        name: '优惠活动',
        biz: '我的直属会员在某个日期段的某个币种参加活动的获利总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 7,
        name: 'VIP退水',
        biz: '我的直属会员在某个日期段的某个币种VIP退水总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 8,
        name: 'VIP晋级礼金',
        biz: '我的直属会员在某个日期段的某个币种VIP晋级礼金总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 9,
        name: 'VIP额外奖金',
        biz: '我的直属会员在某个日期段的某个币种VIP额外奖金总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 10,
        name: '充提手续费',
        biz: '我的直属会员在某个日期段的某个币种充提手续费总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 11,
        name: '游戏输赢',
        biz: '我的直属会员在某个日期段的某个币种游戏输赢总额',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 12,
        name: '游戏净输赢',
        biz: '游戏净输赢 = 【游戏输赢】 + 【-VIP退水】 + 【-场馆费】（返佣无投注退水、无代理赚水）',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 13,
        name: '净输赢',
        biz: '净输赢 = 【游戏输赢】 + 【-VIP退水】 + 【-场馆费】 + 【-VIP晋级礼金】 + 【-VIP额外奖金】 + 【-活动金】 + 【-充提手续费】',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
    ],
  },
  {
    id: 'report-game',
    title: '模块：【我的报表-游戏】',
    rows: [
      {
        no: 14,
        name: '充提手续费',
        biz: '返佣团队管理仅直属会员：统计该代理账号直属会员充提手续费总额；汇总卡文案沿用「团队」口径',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 15,
        name: '团队充值总额',
        biz: '该代理账号直属会员充值总额（返佣无下级代理树；展示名与占成侧「团队充值总额」对齐）',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '实时',
        handler: '金刚',
      },
      {
        no: 16,
        name: '团队提款总额',
        biz: '该代理账号直属会员提款总额（返佣无下级代理树；展示名与占成侧「团队提款总额」对齐）',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '实时',
        handler: '金刚',
      },
      {
        no: 17,
        name: '游戏净输赢',
        biz: '游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】 + 【-场馆费】；标题不加「（实占）」；明细无退水、无代理赚水',
        dimension: '汇总：我的直属会员+日期+币种',
        method: '10分钟',
        handler: '现金',
      },
    ],
  },
  {
    id: 'report-commission',
    title: '模块：【我的报表-佣金】',
    rows: [
      {
        no: 18,
        name: '佣金比例',
        biz: '当前币种适用的返佣佣金比例；概况外露当前档，详情弹框展示后台全部当月档位',
        dimension: '币种 + 月份',
        method: '实时',
        handler: '金刚',
      },
      {
        no: 19,
        name: '预计佣金',
        biz: '待派发月份展示的预计应付佣金（账单月口径）',
        dimension: '代理账号 + 月份 + 币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 20,
        name: '负佣金累计',
        biz: '历史负佣金累计；待派发月用于冲减当月佣金后得到总佣金',
        dimension: '代理账号 + 币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 21,
        name: '游戏净输赢',
        biz: '游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】 + 【-场馆费】；分区合计后参与净输赢计算',
        dimension: '代理账号 + 月份 + 币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 22,
        name: '其他成本',
        biz: '其他成本 = 【-VIP晋级礼金】 + 【-VIP额外奖金】 + 【-活动金】 + 【-充提手续费】',
        dimension: '代理账号 + 月份 + 币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 23,
        name: '净输赢',
        biz: '净输赢 = 游戏净输赢 - 其他成本；当月佣金 = max(净输赢, 0) × 佣金比例',
        dimension: '代理账号 + 月份 + 币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 24,
        name: '总佣金',
        biz: '总佣金 = 当月佣金 - 负佣金累计（待派发月）；已派发月按账单展示总佣金',
        dimension: '代理账号 + 月份 + 币种',
        method: '10分钟',
        handler: '现金',
      },
    ],
  },
  {
    id: 'member-detail',
    title: '模块【会员详情】',
    rows: [
      {
        no: 25,
        name: '游戏净输赢',
        biz: '游戏净输赢 = 【游戏输赢】 + 【-VIP退水】 + 【-场馆费】（返佣无会员退水、无代理赚水；游戏统计明细同此口径）',
        dimension: '会员+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 26,
        name: '其他奖励',
        biz: '其他奖励 = VIP晋级礼金 + VIP额外奖金 + 活动金（产品口径；返佣原型当前隐藏「会员盈亏」Tab）',
        dimension: '会员+币种',
        method: '10分钟',
        handler: '现金',
      },
      {
        no: 27,
        name: '会员盈亏',
        biz: '会员盈亏 = 游戏净输赢 + 其他奖励（产品口径；返佣原型当前隐藏「会员盈亏」Tab，不强制露出）',
        dimension: '会员+币种',
        method: '10分钟',
        handler: '现金',
      },
    ],
  },
  {
    id: 'mine',
    title: '模块【我的】',
    rows: [
      {
        no: 28,
        name: '我的佣金',
        biz: '代理「我的」页佣金卡：按币种展示 KKC / KKV / USDT 总佣金（无信用额度币种）',
        dimension: '代理账号 + 币种',
        method: '10分钟',
        handler: '现金',
      },
    ],
  },
]

export const AGENT_REBATE_FIELD_DEF_FORMULAS = [
  '游戏净输赢 = 【团队游戏输赢】 + 【-团队VIP退水】 + 【-场馆费】（无投注退水、无代理赚水；不加「实占」）',
  '佣金 = （【输赢】 + 【-VIP退水】 + 【-VIP晋级礼金】 + 【-VIP额外奖金】 + 【-活动金】 + 【-充提手续费】） × 佣金比例',
  '总佣金 = 当月佣金 - 负佣金累计（待派发月）；净输赢 = 游戏净输赢 - 其他成本',
  '会员盈亏 = 游戏净输赢 + 其他奖励；游戏净输赢 = 【游戏输赢】 + 【-VIP退水】 + 【-场馆费】（原型隐藏会员盈亏 Tab）',
  '现金更新时间：10分钟左右',
]
