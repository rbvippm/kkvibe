/** 推广返利 · 返佣金设置 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type AgentCommissionSettingPrdDimension = PcPrdDimension
export type AgentCommissionSettingFeatureRow = PcPrdFeatureRow

export const AGENT_COMMISSION_SETTING_META = {
  title: '返佣金设置',
  module: '推广返利',
  updatedAt: '2026-07-29',
  prdVersion: 'v1.0',
} as const

export const AGENT_COMMISSION_SETTING_BACKGROUND = [
  'BI 后台需按币种配置代理返佣比例，并约定发放佣金的门槛条件（当月团队游戏输赢、最低活跃会员要求）。',
  '多级代理可配置额外佣金比例；同时需提供「下级创建」开关，控制代理端是否允许继续创建下级。',
  '关闭下级创建后，代理中心-返佣代理不可创建下级，但历史层级数据保留，不影响已有结算口径。',
] as const

export const AGENT_COMMISSION_SETTING_GOALS = [
  '按币种查询并维护当月佣金发放条件与多级额外佣金。',
  '支持编辑弹框内增删档位/级别并提交保存。',
  '提供下级创建开关：开启时代理中心-返佣代理可创建下级；关闭时不可创建且历史层级数据保留。',
] as const

export const AGENT_COMMISSION_SETTING_FEATURE_LIST: AgentCommissionSettingFeatureRow[] = [
  {
    id: 1,
    module: '筛选',
    feature: '币种',
    pageLocation: '顶部筛选「币种」',
    prd: {
      functionalLogic: '按币种加载对应佣金条件与额外佣金配置，保证多币种独立维护。',
      interactiveBehavior:
        '选择币种后点「查询」加载该币种配置；点「重置」恢复默认币种 KKC 并重新展示。',
      visualPresentation: '标签「币种：」+ 下拉 +「查询」「重置」；旁侧「注1」。',
      dataRules: '枚举：KKC / KKV / USDT；默认 KKC；配置按币种隔离存储。',
      exceptions: '某币种无当月档位时左侧表格展示「暂无数据」；额外佣金可为空。',
      routing: '停留本页，不跳转。',
    },
  },
  {
    id: 2,
    module: '全局开关',
    feature: '下级创建开关',
    pageLocation: '筛选下方开关条',
    prd: {
      functionalLogic:
        '控制代理中心返佣代理是否可创建下级：开启可创建；关闭不可创建，历史层级数据保留。',
      interactiveBehavior: '切换开关即时生效（原型本地态）；下方说明随开/关状态切换。',
      visualPresentation: '开关行展示「已开启/已关闭」；说明文案独占下一行；旁侧「注2」。',
      dataRules: '布尔值，默认开启；与币种配置独立（全局）。',
      exceptions: '关闭不影响本页已有佣金配置的编辑与查看；历史层级数据保留。',
      routing: '影响代理中心-返佣代理创建入口；本页无路由跳转。',
    },
  },
  {
    id: 3,
    module: '当月佣金',
    feature: '当月佣金设置列表',
    pageLocation: '左侧「当月佣金设置」表格',
    prd: {
      functionalLogic: '按当前查询币种展示发放佣金的档位条件：当月团队游戏输赢、最低活跃会员、代理佣金比例；切换币种并查询后列表随之切换。',
      interactiveBehavior: '只读列表；点右上「编辑」进入编辑弹框，维护的是当前币种配置。',
      visualPresentation: '标题为「{币种}-当月佣金设置」；三列表格；空态「暂无数据」；旁侧「注3」。',
      dataRules: '数据按币种隔离；盈利与活跃为非负整数口径；佣金为百分比，展示两位小数。',
      exceptions: '当前币种无档位时空态，不报错。',
      routing: '编辑打开弹框，关闭后停留本页。',
    },
  },
  {
    id: 4,
    module: '额外佣金',
    feature: '额外佣金设置列表',
    pageLocation: '右侧「额外佣金设置」表格',
    prd: {
      functionalLogic: '按当前查询币种展示各级下级代理的额外佣金比例；切换币种并查询后列表随之切换。',
      interactiveBehavior: '只读列表；点右上「编辑」进入编辑弹框，维护的是当前币种配置。',
      visualPresentation: '标题为「{币种}-额外佣金设置」；代理级别标签 + 额外佣金(%)；旁侧「注4」。',
      dataRules: '数据按币种隔离；级别文案为「下N级代理」；最多 2 级；比例展示两位小数。',
      exceptions: '当前币种无级别时空态「暂无数据」。',
      routing: '编辑打开弹框，关闭后停留本页。',
    },
  },
  {
    id: 5,
    module: '当月佣金',
    feature: '编辑当月佣金设置',
    pageLocation: '左侧「编辑」弹框',
    prd: {
      functionalLogic: '维护当前币种当月佣金档位：可添加/删除行，填写当月团队游戏输赢、活跃、佣金后提交。',
      interactiveBehavior:
        '「添加」新增空行；勾选后「删除」移除；「提交」校验通过后写回列表；「取消」/遮罩关闭不保存。',
      visualPresentation: '弹框标题「编辑当月佣金设置」；币种纯文本回显当前查询币种；添加描边蓝、删除危险色。',
      dataRules: '提交时盈利/活跃/佣金须为有效非负数；佣金建议 0–100；最多 10 档；至少可保存 0 行（清空）。',
      exceptions: '已满 10 档时添加提示；未勾选删除时报提示；字段非法时底部提示且不关闭。',
      routing: '提交成功关闭弹框并刷新左侧列表。',
    },
  },
  {
    id: 6,
    module: '额外佣金',
    feature: '编辑额外佣金设置',
    pageLocation: '右侧「编辑」弹框',
    prd: {
      functionalLogic: '维护当前币种多级额外佣金；可添加下级级别或删除已选行后提交。',
      interactiveBehavior:
        '「添加」追加下一级；勾选「删除」移除；「提交」写回；「取消」不保存。',
      visualPresentation: '弹框标题「编辑额外佣金设置」；币种纯文本回显当前查询币种；级别只读文案 + 比例输入。',
      dataRules: '最多 2 级；额外佣金为非负百分比。',
      exceptions: '已满 2 级时添加提示；未勾选删除时报提示。',
      routing: '提交成功关闭弹框并刷新右侧列表。',
    },
  },
]

export const AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO = {
  currencyFilter: 1,
  subordinateCreate: 2,
  monthlyList: 3,
  extraList: 4,
  monthlyEdit: 5,
  extraEdit: 6,
} as const

export type AgentCommissionSettingAnnotContext = keyof typeof AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO

export const AGENT_COMMISSION_SETTING_CURRENCY_SPEC = [
  '按币种查询佣金配置，KKC / KKV / USDT 互相独立。',
  '「查询」加载所选币种；「重置」回到默认 KKC。',
] as const

export const AGENT_COMMISSION_SETTING_SUBORDINATE_SPEC = [
  '开启：代理中心-返佣代理可创建下级代理。',
  '关闭：代理中心-返佣代理不可创建下级代理，历史层级数据保留。',
] as const

export const AGENT_COMMISSION_SETTING_MONTHLY_LIST_SPEC = [
  '标题回显当前查询币种，如「KKC-当月佣金设置」；跟着币种展示当月团队游戏输赢、活跃要求与代理佣金(%)。',
  '无档位时展示「暂无数据」；点「编辑」进入弹框维护该币种配置。',
] as const

export const AGENT_COMMISSION_SETTING_EXTRA_LIST_SPEC = [
  '标题回显当前查询币种，如「KKC-额外佣金设置」；跟着币种展示各级额外佣金比例。',
  '只读展示，维护请点「编辑」该币种配置。',
] as const

export const AGENT_COMMISSION_SETTING_MONTHLY_EDIT_SPEC = [
  '弹框内可添加/删除档位行，填写当月团队游戏输赢、活跃与佣金后提交。',
  '币种纯文本回显当前查询币种；最多 10 档；取消不保存。',
] as const

export const AGENT_COMMISSION_SETTING_EXTRA_EDIT_SPEC = [
  '弹框内可添加下级级别或删除已选行，调整额外佣金后提交。',
  '币种纯文本回显当前查询币种；最多 2 级；取消不保存。',
] as const

export const AGENT_COMMISSION_SETTING_ANNOT_MAP: Record<
  AgentCommissionSettingAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  currencyFilter: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.currencyFilter,
    title: '币种',
    items: AGENT_COMMISSION_SETTING_CURRENCY_SPEC,
  },
  subordinateCreate: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.subordinateCreate,
    title: '下级创建开关',
    items: AGENT_COMMISSION_SETTING_SUBORDINATE_SPEC,
  },
  monthlyList: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.monthlyList,
    title: '当月佣金设置',
    items: AGENT_COMMISSION_SETTING_MONTHLY_LIST_SPEC,
  },
  extraList: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.extraList,
    title: '额外佣金设置',
    items: AGENT_COMMISSION_SETTING_EXTRA_LIST_SPEC,
  },
  monthlyEdit: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.monthlyEdit,
    title: '编辑当月佣金',
    items: AGENT_COMMISSION_SETTING_MONTHLY_EDIT_SPEC,
  },
  extraEdit: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.extraEdit,
    title: '编辑额外佣金',
    items: AGENT_COMMISSION_SETTING_EXTRA_EDIT_SPEC,
  },
}
