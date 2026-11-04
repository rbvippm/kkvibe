/** 财务管理 · 信用流水列表 · PRD 与功能清单（六大核心维度） */

import { PRD_DIMENSION_LABELS, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export const CREDIT_FLOW_LIST_META = {
  title: '信用流水列表',
  module: '财务管理',
  updatedAt: '2026-11-04',
  prdVersion: 'v1.0',
} as const

export const CREDIT_FLOW_LIST_BACKGROUND = [
  '信用额度账单与现金账单分开后，用户详情「信用资金明细」只能看单个用户；财务与客服需要跨用户、跨代理查询全平台信用钱包流水。',
  '信用钱包是「上级代理 → 币种钱包」多钱包结构（与贵宾厅一致），全平台查询时下拉无法穷举，需改为按 ID 精确输入。',
] as const

export const CREDIT_FLOW_LIST_GOALS = [
  '在「财务管理」下新增「信用流水列表」，复刻用户详情「信用资金明细」的列表与详情，数据范围为全平台用户。',
  '筛选改为输入框：用户ID、上级代理ID、钱包ID（精确匹配），其余交易类型、流水号、流水类型、流水生成时间与信用资金明细一致。',
] as const

export const CREDIT_FLOW_LIST_FEATURE_LIST: PcPrdFeatureRow[] = [
  {
    id: 1,
    module: '信用流水列表',
    feature: '全平台筛选（ID 输入）',
    pageLocation: '列表上方筛选区',
    prd: {
      functionalLogic:
        '按用户、上级代理、钱包三个 ID 定位全平台信用钱包流水，替代用户详情页里的「上级代理 / 钱包」下拉；交易类型、流水号、流水类型、流水生成时间与用户详情「信用资金明细」保持一致。',
      interactiveBehavior:
        '输入后点「搜索」生效，「重置」清空全部条件并恢复全量列表；输入框回车等同点「搜索」。交易类型为多选标签，再点取消。点「导出」后全局顶部提示「已导出当前 N 条信用流水」，无数据时提示「暂无数据可导出」。',
      visualPresentation:
        '筛选区第一行：用户ID、上级代理ID、钱包ID 三个输入框（占位「请输入用户ID」「请输入上级代理ID」「请输入钱包ID」）；第二行交易类型标签（系统 / 转账 / 投注 / 结算 / 上下分），选中蓝底；第三行流水号、流水类型、流水生成时间；底部「搜索」「重置」「导出」。旁侧「注1」。',
      dataRules:
        '用户ID、上级代理ID、钱包ID 精确匹配，自动去掉首尾空格，仅允许数字；上级代理ID 为代理金刚号（如 66880001）；钱包ID 9 位（如 880030001）。流水号模糊匹配。日期按流水生成时间（后台）的日期比较，包含起止当天。条件之间为「且」。',
      exceptions:
        'ID 输入非数字时在搜索按钮旁提示「ID 只能输入数字」且不生效；结束日期早于开始日期提示「结束日期不能早于开始日期」。无结果展示「暂无信用流水」。',
      routing: '入口：侧栏「财务管理 → 信用流水列表」（/pc/credit-flow-list）。',
    },
  },
  {
    id: 2,
    module: '信用流水列表',
    feature: '流水列表与详情',
    pageLocation: '列表表头',
    prd: {
      functionalLogic:
        '展示全平台用户的信用钱包流水，按流水生成时间倒序；与用户详情「信用资金明细」同源，多出用户昵称、用户ID 两列，「上分代理」名称列改为「上级代理ID」，便于跨用户核对。',
      interactiveBehavior:
        '点「用户ID」跳转该用户的用户详情（停在用户资金信息）；点「查看详情」打开「信用流水详情」弹框（用户信息、钱包信息、流水明细），点关闭或遮罩收起。',
      visualPresentation:
        '表格列：编号、流水号、用户昵称、用户ID（蓝色链接）、上级代理ID、钱包、钱包ID、流水类型、交易类型、交易说明、交易金额（收入绿 / 支出红）、交易前余额、交易后余额、流水生成时间、操作；底部「共 N 条」。表头旁「注2」。',
      dataRules:
        '钱包展示为「信用额度-币种-钱包名称」；金额保留 6 位小数。Mock 共 17 条，覆盖 4 个用户：小红呀呀呀呀呀（7831562076704421988，与用户详情同一批 9 条）、VIP888（EZ / 880010101）、li0428（代理 A / 880020105）、骄傲的鸭子（代理 B / 880030108），交易类型含系统、转账、投注、结算、上下分。',
      exceptions: '钱包或代理信息缺失时对应列显示「-」；列表为空展示「暂无信用流水」。',
      routing: '用户ID → pc-user-detail（?userId=）；详情为页内弹框，不跳转。',
    },
  },
]

export const CREDIT_FLOW_LIST_SPEC_ANNOT_NO = {
  filters: 1,
  table: 2,
} as const

export const CREDIT_FLOW_LIST_FILTER_SPEC = [
  '全平台查询，按用户ID、上级代理ID（代理金刚号）、钱包ID 精确输入，仅数字。',
  '交易类型、流水号、流水类型、流水生成时间与用户详情「信用资金明细」一致。',
  '回车或「搜索」生效，「重置」清空；导出走全局顶部提示。',
]

export const CREDIT_FLOW_LIST_TABLE_SPEC = [
  '按流水生成时间倒序，比信用资金明细多用户昵称、用户ID；上级代理只展示 ID（金刚号），名称在详情弹框查看。',
  '点用户ID 进入该用户详情；「查看详情」打开信用流水详情弹框。',
  '钱包展示为「信用额度-币种-钱包名称」。',
]
