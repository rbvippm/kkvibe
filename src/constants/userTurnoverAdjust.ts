/** 用户详情 · 调整提现流水要求（独立于账变模块） */
export const REMAINING_WITHDRAW_TURNOVER_LABEL = '剩余提现流水要求'

export const USER_TURNOVER_ADJUST_SPEC = {
  remaining: [
    '展示用户当前仍需完成的提现流水要求数值。',
    '各持有币种均展示对应剩余要求，无要求时显示 0.00。',
    '含活动金-USDT-TRON、活动金-KKC、活动金-KKV 等活动金币种。',
    '可通过「调整提现流水」按币种增减，与账变模块独立。',
    '数值保留两位小数。',
  ],
  amount: [
    '支持小数点两位，并且为正数。',
    '与「方式」联动：选后台增加则累加流水要求，选后台减少则扣减流水要求。',
    '仅调整当前用户的提现流水要求，不与账变单据联动。',
  ],
  reason: [
    '必填，用于记录本次调整原因。',
    '最长 16 个字符。',
  ],
  entry: [
    '打开弹窗，选择币种后调整用户剩余提现流水要求。',
    '币种列表与虚拟货币资产表持有币种一致（含活动金币种），并填写方式、流水与调整理由。',
    '调整后同步更新列表「剩余提现流水要求」列，与账变模块独立。',
  ],
  record: [
    '剩余提现流水记录页展示全量业务流水，含充值、有效流水、提现清零等。',
    '后台手动调整为其中一种业务类型，写入独立记录号。',
  ],
} as const

export type UserTurnoverAdjustSpecContext = keyof typeof USER_TURNOVER_ADJUST_SPEC
