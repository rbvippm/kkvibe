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
  updatedAt: '2026-08-18',
  prdVersion: 'v1.4',
} as const

export const CREDIT_LIMIT_TRANSFER_BACKGROUND = [
  '信用代理体系上线后，运营需在后台查询信用额度上下分流水，核对代理给会员/下级代理的额度变动。',
  '本期新增「代理退水」上下分方式：由系统向代理上分信用额度，固定备注「系统代理退水」，且不产生关联记录。',
  '上下分弹框改为按会员ID精准搜索已授信一级代理；赚取退水已在占成代理配置中完成，弹框不再设置。',
  '信用额度流水需区分信用币种（CNY / USD），支持按币种筛选与列表展示。',
] as const

export const CREDIT_LIMIT_TRANSFER_GOALS = [
  '在上下分方式中支持筛选与展示「代理退水」。',
  '代理退水记录固定为：发起对象=系统、上下分对象=代理、备注=系统代理退水、无关联记录。',
  '上下分弹框支持会员ID精准检索一级代理信用代理，并去掉赚取退水表单项。',
  '支持按当前筛选结果汇总上分、下分、上下分差与退水。',
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
  {
    id: 3,
    module: '列表筛选/展示',
    feature: '信用币种',
    pageLocation: '筛选区「信用币种」、列表「信用币种」列、关联记录弹框「信用币种」列',
    prd: {
      functionalLogic:
        '信用币种用于区分信用额度流水所属结算币种，支持按币种过滤并在列表、关联记录中对照金额阅读。',
      interactiveBehavior:
        '筛选选择 CNY 或 USD 后点「搜索」-> 仅展示对应币种记录；选择「全部」不过滤；点「重置」恢复全部；打开关联记录时原始/对侧行同步展示币种。',
      visualPresentation:
        '筛选下拉默认「全部」，选项 CNY / USD；旁侧「注3」标注；列表与关联记录弹框（原始记录、关联记录）均在「金额」右侧展示「信用币种」列，只读文案 CNY 或 USD。',
      dataRules: '枚举仅 CNY、USD；非必填；每条流水有且仅有一个信用币种；关联记录与原始记录币种一致。',
      exceptions: '选中币种无数据 -> 表格「暂无数据」；非法币种值不出现在下拉中。',
      routing: '停留列表页，不跳转；关联记录弹框内无独立币种筛选。',
    },
  },
  {
    id: 4,
    module: '列表汇总',
    feature: '筛选汇总',
    pageLocation: '搜索工具栏左侧「币种 / 上分 / 下分 / 上下分差 / 退水」',
    prd: {
      functionalLogic:
        '按当前已生效筛选结果，再按汇总币种（CNY / USD）汇总成功流水：上分、下分、上下分差（上分−下分）、退水（代理退水）。',
      interactiveBehavior:
        '切换汇总币种立即刷新四项数值，无需点搜索；点「搜索」后随 filteredRows 刷新；点「重置」恢复列表筛选，汇总币种保持当前选择。',
      visualPresentation:
        '位于「搜索 / 重置 / 信用额度上下分」左侧浅蓝底；最左为币种下拉（CNY / USD，默认 CNY），后接四项横排；上下分差带正负号与红绿色；旁侧「注4」。',
      dataRules:
        '仅统计 status=成功且 currency=汇总币种；上分=上分金额绝对值之和；下分=下分绝对值之和；退水=代理退水绝对值之和；上下分差=上分−下分。失败单不计入。',
      exceptions: '该币种无匹配成功单时四项均为 0.00。',
      routing: '停留列表页，无跳转。',
    },
  },
]

export const CREDIT_LIMIT_TRANSFER_SPEC_ANNOT_NO = {
  transferMode: 1,
  transferModal: 2,
  currency: 3,
  summary: 4,
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

export const CREDIT_LIMIT_TRANSFER_CURRENCY_SPEC = [
  '信用币种枚举：CNY、USD。',
  '筛选支持全部 / CNY / USD；列表与关联记录弹框「金额」旁均展示币种列。',
  '关联记录与原始记录币种保持一致。',
]

export const CREDIT_LIMIT_TRANSFER_SUMMARY_SPEC = [
  '最左侧币种下拉仅 CNY / USD，默认 CNY；四项按该币种即时汇总。',
  '在当前筛选结果上再按币种统计成功流水：上分、下分、上下分差、退水。',
  '上下分差 = 上分 − 下分；退水仅统计「代理退水」；失败单不计入。',
]
