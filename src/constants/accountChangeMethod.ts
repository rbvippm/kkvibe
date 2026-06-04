/** 账变方式枚举 */
export const ACCOUNT_CHANGE_METHODS = ['充值加分', '充值减分', '加币', '减币'] as const

export type AccountChangeMethod = (typeof ACCOUNT_CHANGE_METHODS)[number]

export const RECHARGE_DATA_METHODS: AccountChangeMethod[] = ['充值加分', '充值减分']

export function countsRechargeData(method: AccountChangeMethod) {
  return RECHARGE_DATA_METHODS.includes(method)
}

export function isSubtractMethod(method: AccountChangeMethod) {
  return method === '充值减分' || method === '减币'
}

/** 按场景拆分的「账变方式」需求说明（用于 wf-spec-annot） */
export const ACCOUNT_CHANGE_METHOD_SPEC = {
  filter: [
    '筛选项对应列表「账变方式」列，不选表示查询全部。',
    '可选：充值加分、充值减分、加币、减币。',
    '充值加分、充值减分：计入充值数据统计。',
    '加币、减币：不计入充值数据统计。',
  ],
  table: [
    '展示每笔账变的操作类型，与筛选、发起时枚举一致。',
    '充值加分、充值减分：计入充值数据统计。',
    '加币、减币：不计入充值数据统计。',
  ],
  form: [
    '发起账变时必选，提交后写入列表「账变方式」列。',
    '充值加分、充值减分：计入充值数据统计；减分/减币类方式金额为负向入账。',
    '加币、减币：不计入充值数据统计。',
    '选择后下方灰色提示会说明当前方式是否计入充值数据。',
  ],
} as const

export type AccountChangeMethodSpecContext = keyof typeof ACCOUNT_CHANGE_METHOD_SPEC
