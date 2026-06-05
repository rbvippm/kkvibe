/** 用户详情 · 调整提现流水要求（独立于账变模块） */
export const USER_TURNOVER_ADJUST_SPEC = {
  amount: [
    '支持小数点两位，并且为正数。',
    '与「方式」联动：选增加则累加流水要求，选减少则扣减流水要求。',
    '仅调整当前用户的提现流水要求，不与账变单据联动。',
  ],
  reason: [
    '必填，用于记录本次调整原因。',
    '最长 16 个字符。',
  ],
} as const

export type UserTurnoverAdjustSpecContext = keyof typeof USER_TURNOVER_ADJUST_SPEC
