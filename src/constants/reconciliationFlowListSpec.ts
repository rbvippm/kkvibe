/** 账单管理 · 对账流水列表 · PRD 与功能清单（六大核心维度） */

import { PRD_DIMENSION_LABELS, type PcPrdFeatureRow } from './pcPrdSpec'
import { CREDIT_FLOW_LIST_FEATURE_LIST } from './creditFlowListSpec'

export { PRD_DIMENSION_LABELS }

export const RECONCILIATION_FLOW_LIST_META = {
  title: '对账流水列表',
  module: '账单管理',
  updatedAt: '2026-11-07',
  prdVersion: 'v1.0',
} as const

export const RECONCILIATION_FLOW_LIST_BACKGROUND = [
  '现金账单与信用额度账单已分开记账，但财务对账时需要在一个入口里分别核对两本账：现金只在用户详情「现金资金明细」按单个用户查看，信用分散在「财务管理 → 信用流水列表」。',
  '对账以全平台为范围，需跨用户按 ID、币种、交易类型、时间段筛选后导出。',
] as const

export const RECONCILIATION_FLOW_LIST_GOALS = [
  '新增一级菜单「账单管理」，下设「对账流水列表」页，用两个 Tab 区分账本：第一个「现金」，第二个「信用」。',
  '「现金」Tab 复刻用户详情「现金资金明细」的筛选、列表与详情，数据范围扩大为全平台用户，多出用户昵称、用户ID。',
  '「信用」Tab 与「财务管理 → 信用流水列表」同一套筛选、列表与详情，原页面保留。',
] as const

const creditFilterPrd = CREDIT_FLOW_LIST_FEATURE_LIST[0]!.prd
const creditTablePrd = CREDIT_FLOW_LIST_FEATURE_LIST[1]!.prd

export const RECONCILIATION_FLOW_LIST_FEATURE_LIST: PcPrdFeatureRow[] = [
  {
    id: 1,
    module: '对账流水列表',
    feature: '现金 / 信用 Tab 切换',
    pageLocation: '页面顶部 Tab',
    prd: {
      functionalLogic: '同一页面按账本拆成两个 Tab：「现金」查全平台现金钱包流水，「信用」查全平台信用钱包流水；两本账数据互不混合。',
      interactiveBehavior:
        '默认停在「现金」。点 Tab 切换内容，当前 Tab 写入地址栏（?tab=cash / ?tab=credit），刷新或分享链接后仍停在同一 Tab。各 Tab 的筛选条件独立保存，切换回来不清空。',
      visualPresentation: 'Tab 顺序固定：现金、信用；选中项深色底白字。Tab 右侧「注1」。',
      dataRules: 'tab 参数只认 cash / credit，其他值或缺省按「现金」处理。',
      exceptions: '某个 Tab 无数据时只影响该 Tab 的空状态，不影响另一个 Tab。',
      routing: '入口：侧栏「账单管理 → 对账流水列表」（/pc/reconciliation-flow-list）；信用 Tab：/pc/reconciliation-flow-list?tab=credit。',
    },
  },
  {
    id: 2,
    module: '现金',
    feature: '全平台现金流水筛选',
    pageLocation: '「现金」Tab 筛选区',
    prd: {
      functionalLogic:
        '在用户详情「现金资金明细」的筛选项基础上增加「用户ID」，用于跨用户定位；交易币种、交易类型、交易单号、流水号、流水类型、流水生成时间与现金资金明细一致。',
      interactiveBehavior:
        '输入后点「搜索」生效，回车等同「搜索」；「重置」清空全部条件。交易类型为多选标签，再点取消。点「导出」后全局顶部提示「已导出当前 N 条现金流水」，无数据时提示「暂无数据可导出」。',
      visualPresentation:
        '第一行：用户ID、交易币种（下拉，默认「全部」）；第二行交易类型标签；第三行交易单号、流水号、流水类型、流水生成时间；底部「搜索」「重置」「导出」。用户ID 旁「注2」。',
      dataRules:
        '用户ID 精确匹配、仅数字、去首尾空格；交易单号、流水号模糊匹配；交易币种取现金钱包币种（USDT-TRON、USDT-SOL、KKC、BNB、BTC、ETH、TRX、SOL、KKV）；日期按流水生成时间（后台）比较，包含起止当天；条件之间为「且」。',
      exceptions:
        '用户ID 非数字时在按钮旁提示「用户ID 只能输入数字」且不生效；结束日期早于开始日期提示「结束日期不能早于开始日期」。无结果展示「暂无现金流水」。',
      routing: '页内筛选，不跳转。',
    },
  },
  {
    id: 3,
    module: '现金',
    feature: '现金流水列表与详情',
    pageLocation: '「现金」Tab 列表表头',
    prd: {
      functionalLogic: '展示全平台用户的现金钱包流水，按流水生成时间倒序；与用户详情「现金资金明细」同源，多出用户昵称、用户ID 两列。',
      interactiveBehavior:
        '点「用户ID」进入该用户的用户详情；点「查看详情」打开「对账流水详情」弹框（用户信息、流水明细），点关闭或遮罩收起。',
      visualPresentation:
        '表格列：编号、流水号、用户昵称、用户ID（蓝色链接）、交易中心交易单号、发起方用户昵称、发起方用户ID、流水类型、交易币种、交易类型、交易金额（收入绿 / 支出红）、手续费、商户手续费、交易前余额、交易后余额、流水生成时间、小程序、开发者、操作；底部「共 N 条」。表头旁「注3」。',
      dataRules:
        '金额保留 6 位小数；无交易单号显示「0」，无小程序 / 开发者显示「-」。Mock 共 11 条：小红呀呀呀呀呀（与用户详情现金资金明细同一批 4 条）、VIP888、li0428、骄傲的鸭子，交易类型含收款、兑换、红包、活动金、转账-链上交易等。',
      exceptions: '接收方缺失时详情显示「-」；列表为空展示「暂无现金流水」。',
      routing: '用户ID → pc-user-detail（?userId=）；详情为页内弹框，不跳转。',
    },
  },
  {
    id: 4,
    module: '信用',
    feature: '全平台信用流水筛选（ID 输入）',
    pageLocation: '「信用」Tab 筛选区',
    prd: {
      ...creditFilterPrd,
      visualPresentation: creditFilterPrd.visualPresentation.replace('旁侧「注1」', '用户ID 旁「注4」'),
      routing: '与「财务管理 → 信用流水列表」同一套筛选；本页入口见注1。',
    },
  },
  {
    id: 5,
    module: '信用',
    feature: '信用流水列表与详情',
    pageLocation: '「信用」Tab 列表表头',
    prd: {
      ...creditTablePrd,
      visualPresentation: creditTablePrd.visualPresentation.replace('表头旁「注2」', '表头旁「注5」'),
    },
  },
]

export const RECONCILIATION_FLOW_LIST_SPEC_ANNOT_NO = {
  tabs: 1,
  cashFilters: 2,
  cashTable: 3,
  creditFilters: 4,
  creditTable: 5,
} as const

export const RECONCILIATION_FLOW_LIST_TABS_SPEC = [
  'Tab 顺序：现金、信用；默认「现金」。',
  '当前 Tab 写入地址栏 ?tab=cash / credit，刷新后保持；各 Tab 筛选条件独立。',
]

export const CASH_FLOW_LIST_FILTER_SPEC = [
  '全平台查询，比用户详情「现金资金明细」多「用户ID」（精确、仅数字）。',
  '交易币种、交易类型、交易单号、流水号、流水类型、流水生成时间与现金资金明细一致。',
  '回车或「搜索」生效，「重置」清空；导出走全局顶部提示。',
]

export const CASH_FLOW_LIST_TABLE_SPEC = [
  '按流水生成时间倒序，比现金资金明细多用户昵称、用户ID。',
  '点用户ID 进入该用户详情；「查看详情」打开对账流水详情弹框。',
  '金额 6 位小数，收入绿 / 支出红。',
]
