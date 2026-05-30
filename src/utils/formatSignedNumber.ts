/** 带正负号的数值展示（≥0 显示 +） */
export function formatSignedNumber(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value}`
}

/** 正负金额/流水颜色：绿增红减 */
export function signedNumberClass(value: number) {
  return value >= 0 ? 'wf-amount--positive' : 'wf-amount--negative'
}
