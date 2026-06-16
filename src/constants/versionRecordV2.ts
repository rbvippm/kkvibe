/** v2.x.x 账变细化和流水调整 · 版本文档数据 */

export const VERSION_RECORD_V2_META = {
  version: 'v2.x.x',
  title: '账变细化和流水调整',
  updatedAt: '2026-06-16',
} as const

/** 1. 需求背景 */
export const VERSION_V2_BACKGROUND = [
  '由于目前的账变方式没有区分计入充值和不计入充值，导致运营要处理一些场景不适用。',
  '计入充值场景：适用充值掉单、钱包地址更换、充到老地址等需纳入充值统计的补账。',
  '不计入充值场景：适用玩家提现没到账、游戏派奖错误等需调账但不影响充值统计的情况。',
  '活动金钱包和主钱包：余额独立，流水公用，对账统计按类型分开。',
] as const

/** 2. 需求目标 */
export const VERSION_V2_GOALS = [
  '对此背景我们把账变方式以及最近版本增加的提现流水要求一起纳入该版本处理。',
] as const

export type VersionFeatureRow = {
  id: number
  module: string
  feature: string
  description: string
  relatedPages: string[]
}

export type VersionRevisionRow = {
  id: number
  version: string
  date: string
  content: string
  author: string
}

const ACCOUNT_CHANGE_PAGES = [
  '账变管理-账变管理',
  '账变管理-账变记录',
  '风控审核-账变审核',
  '财务管理-账变审核',
]

/** 3. 需求功能清单 */
export const VERSION_V2_FEATURE_LIST: VersionFeatureRow[] = [
  {
    id: 1,
    module: '账变-账变方式',
    feature: '账变方式',
    description: [
      '筛选项对应列表「账变方式」列，不选表示查询全部。',
      '可选：充值加币、充值减币、人工加分、人工减分。',
      '充值加币、充值减币：计入充值数据统计。',
      '人工加分、人工减分：不计入充值数据统计。',
    ].join('\n'),
    relatedPages: [...ACCOUNT_CHANGE_PAGES],
  },
  {
    id: 2,
    module: '账变-币种类型',
    feature: '币种类型',
    description: [
      '筛选项对应列表「币种类型」列，不选表示查询全部。',
      '普通虚拟货币：USDT(TRON)、KKC、KKV，各币种独立账变与流水。',
      '主币与活动金成对：USDT(TRON) ↔ 活动金-USDT-TRON、KKC ↔ 活动金-KKC、KKV ↔ 活动金-KKV，余额分开、流水共用。',
      '仅支持虚拟货币与活动金币种，不含法币。',
    ].join('\n'),
    relatedPages: [...ACCOUNT_CHANGE_PAGES],
  },
  {
    id: 3,
    module: '发起账变',
    feature: '账变方式和币种类型变更，新增提现流水输入',
    description: '新增后在账变记录增加一条详细账变记录。',
    relatedPages: [...ACCOUNT_CHANGE_PAGES],
  },
  {
    id: 4,
    module: '后台-对账',
    feature: '账变增加金额 / 账变减少金额',
    description: [
      '1. 将原有的账变增加金额 → 账变人工加分',
      '2. 将原有的账变减少金额 → 账变人工减分',
      '3. 充值加币和充值减币不需要增加，因为已经计算入充值里',
    ].join('\n'),
    relatedPages: [
      'BI后台-账单管理-平台对账',
      'BI后台-账单管理-渠道对账',
      '渠道后台-账单管理-渠道对账详情',
    ],
  },
  {
    id: 5,
    module: '用户详情-币种提现流水要求',
    feature: '调整提现流水',
    description: [
      '打开弹窗，按币种调整用户剩余提现流水要求，需选择方式、填写流水与调整理由。',
      '可选币种与虚拟货币资产表一致（含活动金币种），不含 CNY/USD 法币。',
      '以下主币与活动金成对：余额各自独立记账，剩余提现流水要求共用。',
      '· USDT-TRON ↔ 活动金-USDT-TRON',
      '· KKC ↔ 活动金-KKC',
      '· KKV ↔ 活动金-KKV',
      '调整成对币种任一侧时，主币与活动金在列表中同步更新。',
      '与账变模块独立，不产生账变单据。',
    ].join('\n'),
    relatedPages: ['用户管理-用户列表-用户详情', '财务管理-提现流水变更记录'],
  },
  {
    id: 6,
    module: '财务管理-提现流水变更记录',
    feature: '提现流水变更记录',
    description: [
      '筛选项对应列表「变动类型」列，不选表示查询全部。',
      '可选：后台增加、后台减少、系统增加、系统减少、系统清零。',
      '后台增加/减少：运营人工调整剩余提现流水要求，无关联流水号。',
      '系统增加/减少：由充值、转账、提现等业务触发，有关联流水号。',
      '系统清零：当币种余额达到配置最小值时触发，将剩余要求清零。',
    ].join('\n'),
    relatedPages: ['用户管理-用户列表-用户详情', '财务管理-提现流水变更记录'],
  },
]

/** 需求功能清单编号 · 对应各页「注」标记（与 VERSION_V2_FEATURE_LIST.id 对齐） */
export const VERSION_V2_SPEC_ANNOT_NO = {
  accountChangeMethod: 1,
  accountChangeCurrency: 2,
  accountChangeTurnover: 3,
  userTurnoverAdjust: 5,
  withdrawTurnoverRecord: 6,
} as const

export const VERSION_V2_DEFAULT_AUTHOR = 'EZ'

export const VERSION_V2_REVISIONS: VersionRevisionRow[] = [
  {
    id: 1,
    version: 'v1.0',
    date: '6.5',
    content:
      '1. 账变方式细化（可分类加币、减币、加分、减分，并均可流水输入）；2. 针对币币兑换做的流水，增加用户钱包流水明细、剩余提现流水以及申请减流水的入口。',
    author: VERSION_V2_DEFAULT_AUTHOR,
  },
  {
    id: 2,
    version: 'v1.1',
    date: '6.16',
    content:
      '1. 发起账变：账变方式为充值加币、充值减币时，账变币种不可选活动金（活动金-USDT-TRON、活动金-KKC、活动金-KKV）；2. 发起账变：搜索用户结果表格新增活动金-USDT-TRON、活动金-KKC、活动金-KKV 三列余额展示。',
    author: VERSION_V2_DEFAULT_AUTHOR,
  },
]
