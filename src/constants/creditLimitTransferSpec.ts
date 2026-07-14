/** 信用额度上下分记录 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type CreditLimitTransferPrdDimension = PcPrdDimension
export type CreditLimitTransferFeatureRow = PcPrdFeatureRow

export const CREDIT_LIMIT_TRANSFER_META = {
  title: '信用额度上下分记录',
  module: '推广返利',
  updatedAt: '2026-07-13',
  prdVersion: 'v1.0',
} as const

export const CREDIT_LIMIT_TRANSFER_BACKGROUND = [
  '信用代理体系上线后，运营需在后台查询信用额度上下分流水，核对代理给会员/下级代理的额度变动。',
  '一级总代可由后台发起信用额度上下分；一笔上下分会生成原始记录与对侧关联记录，便于审计。',
  '列表需支持多维筛选，并提供上下分操作入口与关联记录查看。',
] as const

export const CREDIT_LIMIT_TRANSFER_GOALS = [
  '提供信用额度上下分记录查询（用户、发起方、对象、方式、时间、状态、流水号）。',
  '支持后台对一级总代发起信用额度上下分，校验金额与必填项。',
  '支持查看原始记录与对侧关联记录，辅助账务核对。',
] as const

export const CREDIT_LIMIT_TRANSFER_FEATURE_LIST: CreditLimitTransferFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '多维筛选',
    pageLocation: '筛选区',
    prd: {
      functionalLogic: '按用户ID、发起对象、发起人/ID、上下分对象/方式、发起时间、状态、流水号过滤记录。',
      interactiveBehavior: '填写条件后点「搜索」应用；点「重置」清空条件并恢复全量列表。',
      visualPresentation: '三列筛选栅格；下拉默认「全部」；时间区间为开始-结束日期。',
      dataRules: '均为非必填；文本类模糊匹配；时间按发生日闭区间；状态枚举：成功/失败。',
      exceptions: '无匹配 -> 表格「暂无数据」；结束早于开始 -> 提示修正时间。',
      routing: '停留当前列表页。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '信用额度上下分入口',
    pageLocation: '工具栏「信用额度上下分」',
    prd: {
      functionalLogic: '打开上下分弹框，对一级总代进行信用额度上分或下分。',
      interactiveBehavior: '点击绿色按钮 -> 打开弹框；取消/关闭不落库。',
      visualPresentation: '搜索/重置旁绿色主按钮「信用额度上下分」；旁侧注2。',
      dataRules: '仅后台运营可操作（原型不鉴权）；对象限定一级总代。',
      exceptions: '无权限时隐藏按钮（联调期）；弹框打开失败 -> Toast。',
      routing: '打开弹框，不跳转路由。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '金额与状态',
    pageLocation: '列表「金额」「状态」列',
    prd: {
      functionalLogic: '金额区分加减方向；状态标识本笔是否成功。',
      interactiveBehavior: '只读展示；失败行可查看备注原因。',
      visualPresentation: '金额两位小数带正负号；正绿负红；状态为描边标签。',
      dataRules: '金额单位为信用额度；状态：成功/失败。',
      exceptions: '备注为空显示「-」。',
      routing: '无跳转。',
    },
  },
  {
    id: 4,
    module: '列表操作',
    feature: '关联记录',
    pageLocation: '操作列「关联记录」',
    prd: {
      functionalLogic: '展示本笔原始记录与对侧关联流水，核对借贷平衡。',
      interactiveBehavior: '点击「关联记录」-> 打开弹框；点确定/取消/关闭退出。',
      visualPresentation: '操作列文字链；弹框含「原始记录」「关联记录」两段表格。',
      dataRules: '关联侧金额与原始金额互为相反数；系统发起人展示 System。',
      exceptions: '找不到关联流水 -> 关联表「暂无数据」并提示。',
      routing: '弹框内查看，不跳转。',
    },
  },
  {
    id: 5,
    module: '上下分弹框',
    feature: '总代检索与表单',
    pageLocation: '信用额度上下分弹框',
    prd: {
      functionalLogic: '按总代关键字检索一级代理，填写赚取退水、上下分方式、金额、备注后提交。',
      interactiveBehavior:
        '输入关键字点搜索 -> 表格展示结果；点「选择」锁定对象；校验通过点确定 -> 写入列表并关闭。',
      visualPresentation:
        '顶栏搜索；表格含用户名/ID/金刚号/现金账密/信用账密/信用额度余额；表单四项必填；备注 0/16 计数。',
      dataRules:
        '金额 > 0 且最多两位小数；备注 ≤16 字；下分不可超过信用额度余额；赚取退水：是/否。',
      exceptions: '未选总代/缺必填/超额 -> 表单下方红色提示；无搜索结果 -> 表格空态。',
      routing: '成功后关闭弹框并刷新列表置顶新记录。',
    },
  },
]

export const CREDIT_LIMIT_TRANSFER_SPEC_ANNOT_NO = {
  filter: 1,
  transferEntry: 2,
  amountStatus: 3,
  relatedRecord: 4,
  transferModal: 5,
} as const

export const CREDIT_LIMIT_TRANSFER_FILTER_SPEC = [
  '支持用户ID、发起对象、发起人/ID、上下分对象/方式、发起时间、状态、流水号组合筛选。',
  '搜索应用条件；重置恢复默认「全部」与空输入。',
  '时间区间按发起日过滤；无匹配展示空表。',
]

export const CREDIT_LIMIT_TRANSFER_ENTRY_SPEC = [
  '绿色按钮「信用额度上下分」打开弹框。',
  '用于后台对一级总代上下分信用额度。',
  '取消不落库。',
]

export const CREDIT_LIMIT_TRANSFER_AMOUNT_STATUS_SPEC = [
  '金额带正负号，正绿负红，保留两位小数。',
  '状态：成功（绿描边）/ 失败（红描边）。',
  '备注为空显示「-」。',
]

export const CREDIT_LIMIT_TRANSFER_RELATED_SPEC = [
  '打开关联记录弹框，分「原始记录」「关联记录」两段。',
  '关联侧金额与原始金额相反，便于核对。',
  '发起人系统侧展示 System。',
]

export const CREDIT_LIMIT_TRANSFER_MODAL_SPEC = [
  '先搜索并选择一级总代，再填表单提交。',
  '必填：赚取退水、上下分方式、金额、备注（≤16字）。',
  '下分不可超过信用额度余额；成功后写入列表。',
]
