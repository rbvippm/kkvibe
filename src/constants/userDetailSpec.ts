/** 用户管理 · 用户详情 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type UserDetailPrdDimension = PcPrdDimension
export type UserDetailFeatureRow = PcPrdFeatureRow

export const USER_DETAIL_META = {
  title: '用户详情',
  module: '用户管理',
  updatedAt: '2026-07-15',
  prdVersion: 'v1.0',
} as const

export const USER_DETAIL_BACKGROUND = [
  '用户列表进入详情后，运营需查看该用户资金相关资产，其中信用代理体系要求单独展示信用额度账户。',
  '信用额度需区分代理侧与会员侧，并分别按 CNY / USD 展示可用与冻结额度，便于核对授信与上下分。',
] as const

export const USER_DETAIL_GOALS = [
  '在用户资产详情账户类型中提供「信用额度」Tab。',
  '信用额度列表展示四类币种：代理-信用额度-CNY、代理-信用额度-USD、会员-信用额度-CNY、会员-信用额度-USD。',
] as const

export const USER_DETAIL_FEATURE_LIST: UserDetailFeatureRow[] = [
  {
    id: 1,
    module: '用户资产详情',
    feature: '信用额度账户',
    pageLocation: '账户类型 Tab「信用额度」',
    prd: {
      functionalLogic:
        '信用额度账户用于展示当前用户在代理/会员维度下的 CNY、USD 信用额度余额，与虚拟货币账户、法币账户并列。',
      interactiveBehavior:
        '点击「信用额度」Tab -> 切换为信用额度资产表；隐藏钱包/银行子 Tab 与「调整提现流水」入口；再点「虚拟货币账户」或「法币账户」可切回对应账户。',
      visualPresentation:
        '账户类型第三项「信用额度」，选中态蓝色下划线；旁侧「注1」标注；表格列：持有币种、可交易数、冻结数、总资产；无钱包地址与提现流水列。',
      dataRules:
        '持有币种固定四类：代理-信用额度-CNY、代理-信用额度-USD、会员-信用额度-CNY、会员-信用额度-USD；金额保留小数展示；总资产=可交易+冻结。',
      exceptions: '四类币种均无数据时表格展示「暂无信用额度数据」；信用额度 Tab 下不提供调整提现流水。',
      routing: '停留用户详情页，不跳转；可从用户列表「查看详情」进入本页。',
    },
  },
]

export const USER_DETAIL_SPEC_ANNOT_NO = {
  creditTab: 1,
} as const

export const USER_DETAIL_CREDIT_TAB_SPEC = [
  '账户类型新增「信用额度」Tab，与虚拟货币、法币并列。',
  '币种固定四类：代理/会员 × 信用额度 × CNY/USD。',
  '该 Tab 下不展示调整提现流水与银行资产子 Tab。',
]
