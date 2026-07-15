/** 信用额度记录 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type CreditLimitTransferPrdDimension = PcPrdDimension
export type CreditLimitTransferFeatureRow = PcPrdFeatureRow

export const CREDIT_LIMIT_TRANSFER_META = {
  title: '信用额度记录',
  module: '推广返利',
  updatedAt: '2026-07-15',
  prdVersion: 'v1.2',
} as const

export const CREDIT_LIMIT_TRANSFER_BACKGROUND = [
  '信用代理体系上线后，运营需在后台查询信用额度上下分流水，核对代理给会员/下级代理的额度变动。',
  '本期新增「代理退水」上下分方式：由系统向代理上分信用额度，固定备注「系统代理退水」，且不产生关联记录。',
  '上下分弹框改为按会员ID精准搜索已授信一级代理；赚取退水已在占成代理配置中完成，弹框不再设置。',
] as const

export const CREDIT_LIMIT_TRANSFER_GOALS = [
  '在上下分方式中支持筛选与展示「代理退水」。',
  '代理退水记录固定为：发起对象=系统、上下分对象=代理、备注=系统代理退水、无关联记录。',
  '上下分弹框支持会员ID精准检索一级代理信用代理，并去掉赚取退水表单项。',
] as const

export const CREDIT_LIMIT_TRANSFER_FEATURE_LIST: CreditLimitTransferFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选/展示',
    feature: '上下分方式 · 代理退水',
    pageLocation: '筛选区「上下分方式」与列表「上下分方式」列',
    prd: {
      functionalLogic:
        '上下分方式新增枚举「代理退水」。该方式表示系统向代理发放退水信用额度，金额方向等同上分。',
      interactiveBehavior:
        '筛选选择「代理退水」并搜索 -> 仅展示 transferMode=代理退水 的记录；列表「上下分方式」列展示「代理退水」；操作列不提供「关联记录」。',
      visualPresentation:
        '筛选下拉选项：全部 / 上分 / 下分 / 代理退水；旁侧「注1」标注；列表方式列文案「代理退水」；操作列显示「-」。',
      dataRules:
        '代理退水固定规则：发起对象=系统（发起人 System / 发起人ID 0）；上下分方式=代理退水（业务上等同上分）；上下分对象=代理；备注=系统代理退水；relatedFlowNo 为空，无关联记录。',
      exceptions: '代理退水行不可打开关联记录；备注不可为空，固定为「系统代理退水」。',
      routing: '停留列表页，无弹框跳转。',
    },
  },
  {
    id: 2,
    module: '上下分弹框',
    feature: '会员ID精准搜索与去掉赚取退水',
    pageLocation: '信用额度上下分弹框',
    prd: {
      functionalLogic:
        '弹框按会员ID精准搜索可选对象，且仅命中占成代理配置中已授信的一级代理信用代理；赚取退水已在占成代理配置完成，本弹框不再配置。',
      interactiveBehavior:
        '输入完整会员ID点「搜索」-> 精确匹配 userId 展示结果；点「选择」锁定对象后填写上下分方式/金额/备注提交。无匹配 -> 表格空态。',
      visualPresentation:
        '搜索框占位「请输入会员ID（精准搜索）」；表单仅保留上下分方式、金额、备注；标题旁「注2」标注。',
      dataRules:
        '搜索为会员ID全等匹配；候选数据源=占成代理配置中 agentLevel=1 且已授信（具备信用账密）的代理；不校验赚取退水。',
      exceptions: '未输入ID直接搜索 -> 空表提示；ID不存在或未授信一级代理 ->「暂无数据」。',
      routing: '提交成功关闭弹框并刷新列表；不跳转路由。',
    },
  },
]

export const CREDIT_LIMIT_TRANSFER_SPEC_ANNOT_NO = {
  transferMode: 1,
  transferModal: 2,
} as const

export const CREDIT_LIMIT_TRANSFER_MODE_SPEC = [
  '上下分方式新增「代理退水」。',
  '代理退水：发起对象=系统，上下分对象=代理，备注=系统代理退水。',
  '代理退水无关联记录，操作列不展示「关联记录」。',
]

export const CREDIT_LIMIT_TRANSFER_MODAL_SPEC = [
  '按会员ID精准搜索已授信的一级代理信用代理（数据来自占成代理配置）。',
  '弹框已去掉「赚取退水」，该配置在占成代理配置页完成。',
  '表单仅填上下分方式、金额、备注后提交。',
]
