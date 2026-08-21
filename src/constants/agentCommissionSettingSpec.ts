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
  updatedAt: '2026-08-15',
  prdVersion: 'v1.3',
} as const

export const AGENT_COMMISSION_SETTING_BACKGROUND = [
  'BI 后台需按币种配置一级返佣代理的发放佣金门槛（当月总盈利、最低活跃人数）与代理佣金比例。',
  '返佣代理仅一层，不配置额外佣金，也不提供下级代理创建开关。',
] as const

export const AGENT_COMMISSION_SETTING_GOALS = [
  '按币种查询并维护当月佣金发放条件。',
  '支持编辑弹框内增删档位并提交保存；每个币种至少保留 1 条档位作为兜底。',
] as const

export const AGENT_COMMISSION_SETTING_FEATURE_LIST: AgentCommissionSettingFeatureRow[] = [
  {
    id: 1,
    module: '筛选',
    feature: '币种',
    pageLocation: '顶部筛选「币种」',
    prd: {
      functionalLogic: '按币种加载对应当月佣金档位配置，保证多币种独立维护。',
      interactiveBehavior:
        '选择币种后点「查询」加载该币种配置；点「重置」恢复默认币种 KKC 并重新展示。',
      visualPresentation: '标签「币种：」+ 下拉 +「查询」「重置」；旁侧「注1」。',
      dataRules: '枚举：KKC / KKV / USDT；默认 KKC；配置按币种隔离存储。',
      exceptions: '某币种无当月档位时表格展示「暂无数据」。',
      routing: '停留本页，不跳转。',
    },
  },
  {
    id: 2,
    module: '当月佣金',
    feature: '当月佣金设置列表',
    pageLocation: '「当月佣金设置」表格',
    prd: {
      functionalLogic:
        '按当前查询币种展示发放佣金的档位条件：当月总盈利、最低活跃人数、代理佣金比例；切换币种并查询后列表随之切换。当月总盈利即当月代理团队净输赢；活跃人数按会员充值与有效投注均达阈值统计。',
      interactiveBehavior:
        '只读列表；点「当月总盈利」「最低活跃人数」旁感叹号展开对应说明，再次点击或点空白处关闭；点右上「编辑」进入编辑弹框，维护的是当前币种配置。',
      visualPresentation:
        '标题为「{币种}-当月佣金设置」；三列表格，首两列表头「当月总盈利」「最低活跃人数」旁灰色感叹号；空态「暂无数据」；旁侧「注2」。',
      dataRules: '数据按币种隔离；盈利与活跃为非负整数口径；佣金为百分比，展示两位小数。',
      exceptions: '当前币种无档位时空态，不报错。',
      routing: '编辑打开弹框，关闭后停留本页。',
    },
  },
  {
    id: 3,
    module: '当月佣金',
    feature: '编辑当月佣金设置',
    pageLocation: '「编辑」弹框',
    prd: {
      functionalLogic: '维护当前币种当月佣金档位：可添加/删除行，填写当月总盈利、最低活跃人数、佣金后提交；每个币种至少保留 1 条作为兜底。',
      interactiveBehavior:
        '「添加」新增空行；勾选后「删除」移除；若勾选后将清空该币种全部档位则拦截并提示；点「当月总盈利」「最低活跃人数」旁感叹号展开对应说明；「提交」校验通过后写回列表；「取消」/遮罩关闭不保存。',
      visualPresentation: '弹框标题「编辑当月佣金设置」；币种纯文本回显当前查询币种；表头「当月总盈利」「最低活跃人数」旁灰色感叹号；添加描边蓝、删除危险色。',
      dataRules: '提交时盈利/活跃/佣金须为有效非负数；佣金建议 0–100；档位数量不限，但每个币种最终至少 1 条。',
      exceptions: '未勾选删除时报提示；勾选全部档位删除时报「每个币种至少保留 1 条档位作为兜底」；字段非法时底部提示且不关闭。',
      routing: '提交成功关闭弹框并刷新列表。',
    },
  },
]

export const AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO = {
  currencyFilter: 1,
  monthlyList: 2,
  monthlyEdit: 3,
} as const

export type AgentCommissionSettingAnnotContext = keyof typeof AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO

export const AGENT_COMMISSION_SETTING_CURRENCY_SPEC = [
  '按币种查询当月佣金配置，KKC / KKV / USDT 互相独立。',
  '「查询」加载所选币种；「重置」回到默认 KKC。',
] as const

export const AGENT_COMMISSION_SETTING_MONTHLY_LIST_SPEC = [
  '标题回显当前查询币种，如「KKC-当月佣金设置」；跟着币种展示当月总盈利、最低活跃人数与代理佣金(%)。',
  '「当月总盈利」即当月代理团队净输赢；点列表头感叹号展示公式：= 输赢 - VIP退水 - 场馆费 - VIP晋级礼金 - VIP额外奖金 - 活动金 - 充提手续费。',
  '「最低活跃人数」：会员同时满足充值金额达阈值且有效投注金额达阈值，计为 1 名活跃人数；点感叹号展示该说明。',
  '无档位时展示「暂无数据」；点「编辑」进入弹框维护该币种配置。',
] as const

export const AGENT_COMMISSION_SETTING_MONTHLY_EDIT_SPEC = [
  '弹框内可添加/删除档位行，填写当月总盈利、最低活跃人数与佣金后提交；两列表头感叹号与列表同一说明。',
  '每个币种至少保留 1 条档位作为兜底，勾选全部删除会被拦截；取消不保存。',
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
  monthlyList: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.monthlyList,
    title: '当月佣金设置',
    items: AGENT_COMMISSION_SETTING_MONTHLY_LIST_SPEC,
  },
  monthlyEdit: {
    no: AGENT_COMMISSION_SETTING_SPEC_ANNOT_NO.monthlyEdit,
    title: '编辑当月佣金',
    items: AGENT_COMMISSION_SETTING_MONTHLY_EDIT_SPEC,
  },
}
