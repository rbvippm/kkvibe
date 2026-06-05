/** 提现流水记录 · 业务类型 */
export const TURNOVER_EVENT_TYPES = [
  { value: 'recharge', label: '充值', change: 'increase' },
  { value: 'transfer_in', label: '转账-收款', change: 'increase' },
  { value: 'red_packet_receive', label: '领红包', change: 'increase' },
  { value: 'mine_comp_receive', label: '获取踩雷红包赔付金', change: 'increase' },
  { value: 'paid_dynamic_in', label: '付费动态-收款', change: 'increase' },
  { value: 'exchange_in', label: '币币兑换-入账', change: 'increase' },
  { value: 'c2c_in', label: 'C2C-收款', change: 'increase' },
  { value: 'transfer_out', label: '转账-出款', change: 'decrease' },
  { value: 'red_packet_send', label: '发红包', change: 'decrease' },
  { value: 'mine_comp_send', label: '发送踩雷红包赔付金', change: 'decrease' },
  { value: 'paid_dynamic_out', label: '付费动态-出款', change: 'decrease' },
  { value: 'exchange_out', label: '币币兑换-出账', change: 'decrease' },
  { value: 'c2c_out', label: 'C2C-出款', change: 'decrease' },
  { value: 'live_tip', label: '直播打赏', change: 'decrease' },
  { value: 'valid_turnover', label: '有效流水累计', change: 'effective' },
  { value: 'mine_commission', label: '踩雷红包佣金', change: 'unchanged' },
  { value: 'live_income', label: '直播收入到账', change: 'unchanged' },
  { value: 'bank_transfer_out', label: '从银行转出', change: 'unchanged' },
  { value: 'withdraw_success', label: '提现成功', change: 'reset' },
  { value: 'bank_transfer_in', label: '转入银行', change: 'reset' },
  { value: 'manual_adjust', label: '后台手动调整', change: 'manual' },
  { value: 'asset_below_min', label: '资产低于最小值清零', change: 'reset' },
] as const

export type TurnoverEventType = (typeof TURNOVER_EVENT_TYPES)[number]['value']
export type TurnoverChangeType = (typeof TURNOVER_EVENT_TYPES)[number]['change']

/** 列表筛选项 · 变动类型 */
export const RECORD_CHANGE_TYPE_OPTIONS = [
  { value: 'backend_increase', label: '后台增加' },
  { value: 'backend_decrease', label: '后台减少' },
  { value: 'system_increase', label: '系统增加' },
  { value: 'system_decrease', label: '系统减少' },
  { value: 'system_clear', label: '系统清零' },
] as const

export type RecordChangeType = (typeof RECORD_CHANGE_TYPE_OPTIONS)[number]['value']

export const RECORD_CHANGE_TYPE_LABEL: Record<RecordChangeType, string> = {
  backend_increase: '后台增加',
  backend_decrease: '后台减少',
  system_increase: '系统增加',
  system_decrease: '系统减少',
  system_clear: '系统清零',
}

/** 仅系统增加、系统减少关联业务流水号 */
export function recordChangeTypeHasRelatedFlowNo(type: RecordChangeType) {
  return type === 'system_increase' || type === 'system_decrease'
}

export const TURNOVER_CHANGE_TYPE_LABEL: Record<TurnoverChangeType, string> = {
  increase: '要求增加',
  decrease: '要求减少',
  effective: '有效流水累计',
  unchanged: '要求不变',
  reset: '要求清零',
  manual: '后台调整',
}

export const TURNOVER_RECORD_NOTICE = [
  '核心公式：剩余提现流水要求 = 提现流水要求 − 当前有效流水（不小于 0）。',
  '充值、收款类行为会增加提现流水要求，并通常将当前有效流水清零重新计算。',
  '有效流水累计仅增加当前/累计有效流水，不直接改动提现流水要求。',
  '提现成功、转入银行会将提现流水要求与剩余要求清零；资产低于后台最小值时亦可能清零。',
]

/** 列表字段需求说明（wf-spec-annot） */
export const WITHDRAW_TURNOVER_RECORD_SPEC = {
  remainingBefore: [
    '本笔变更发生前，用户在该币种下的剩余提现流水要求。',
  ],
  adjustAmount: [
    '本笔对剩余提现流水要求的变更数值。',
    '增加为正数，减少为负数；系统清零为扣减至 0 的差额。',
  ],
  remainingAfter: [
    '本笔变更后的剩余提现流水要求。',
    '满足：变更前 + 变更流水 = 变更后（不小于 0）。',
  ],
  relatedFlowNo: [
    '仅「系统增加」「系统减少」类记录关联业务流水号。',
    '如充值单号、转账单号等；后台调整与系统清零无关联流水号。',
  ],
  changeType: [
    '筛选项对应列表「变动类型」列，不选表示查询全部。',
    '可选：后台增加、后台减少、系统增加、系统减少、系统清零。',
    '后台增加/减少：运营人工调整剩余提现流水要求，无关联流水号。',
    '系统增加/减少：由充值、转账、提现等业务触发，有关联流水号。',
    '系统清零：当币种余额达到配置最小值时触发，将剩余要求清零。',
  ],
} as const

export type WithdrawTurnoverRecordSpecContext = keyof typeof WITHDRAW_TURNOVER_RECORD_SPEC

export function getTurnoverEventLabel(type: TurnoverEventType) {
  return TURNOVER_EVENT_TYPES.find((item) => item.value === type)?.label ?? type
}

export function getTurnoverChangeType(type: TurnoverEventType): TurnoverChangeType {
  return TURNOVER_EVENT_TYPES.find((item) => item.value === type)?.change ?? 'unchanged'
}
