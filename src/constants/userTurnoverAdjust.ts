/** 用户详情 · 调整提现流水要求（独立于账变模块） */
export const REMAINING_WITHDRAW_TURNOVER_LABEL = '剩余提现流水要求'

export const USER_TURNOVER_ADJUST_SPEC = {
  remaining: [
    '展示用户当前仍需完成的提现流水要求数值。',
    '各持有币种均展示对应剩余要求，无要求时显示 0.00。',
    'USDT-TRON 与活动金-USDT-TRON、KKC 与活动金-KKC、KKV 与活动金-KKV 成对共用流水（余额分开、流水共用）。',
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
    '打开弹窗，按币种调整用户剩余提现流水要求，需选择方式、填写流水与调整理由。',
    '可选币种与虚拟货币资产表一致（含活动金币种），不含 CNY/USD 法币。',
    '以下主币与活动金成对：余额各自独立记账，剩余提现流水要求共用。',
    '· USDT-TRON ↔ 活动金-USDT-TRON',
    '· KKC ↔ 活动金-KKC',
    '· KKV ↔ 活动金-KKV',
    '调整成对币种任一侧时，主币与活动金在列表中同步更新。',
    '与账变模块独立，不产生账变单据。',
  ],
  record: [
    '提现流水变更记录页展示全量业务流水，含充值、有效流水、提现清零等。',
    '后台手动调整为其中一种业务类型，写入独立记录号。',
  ],
} as const

export type UserTurnoverAdjustSpecContext = keyof typeof USER_TURNOVER_ADJUST_SPEC
