/**
 * Algorithm A 标准用例校验：node scripts/check-credit-settle.ts
 * 退水逐级整笔传递、赚差价（平台付 2%、1级赚 0.5%、2级赚 0.5%、会员拿 1%）
 * 每级留下本级净盈亏（含赚水）：应付上级 = 应收下级 − 实占净盈亏
 */
import {
  computeCreditSettlement,
  computeMemberSettlement,
  CREDIT_SETTLE_STANDARD_CASE,
  CreditSettleAssertionError,
} from '../src/constants/creditSettleEngine.ts'

const result = computeCreditSettlement(CREDIT_SETTLE_STANDARD_CASE)

const expectations: [string, number, number][] = [
  ['平台 净盈亏', result.nodes[0]!.net, 1300],
  ['1级 净盈亏', result.nodes[1]!.net, 2050],
  ['2级 净盈亏', result.nodes[2]!.net, 1550],
  ['会员 净盈亏', result.member.net, -4900],
  ['平台 应收下级', result.nodes[0]!.receivable, 1300],
  ['1级 应收下级', result.nodes[1]!.receivable, 3350],
  ['2级 应收会员', result.nodes[2]!.receivable, 4900],
  ['平台 应付上级', result.nodes[0]!.payable, 0],
  ['1级 应付上级', result.nodes[1]!.payable, 1300],
  ['2级 应付上级', result.nodes[2]!.payable, 3350],
  ['1级 占成毛利', result.nodes[1]!.shareProfit, 2000],
  ['平台 退水收支', result.nodes[0]!.rebateNet, -200],
  ['1级 收上级退水', result.nodes[1]!.rebateIn, 200],
  ['1级 付下级退水', result.nodes[1]!.rebateOut, 150],
  ['2级 退水收支', result.nodes[2]!.rebateNet, 50],
  ['会员层交收', computeMemberSettlement({ validBet: 10000, memberWinLose: -5000, rebatePercent: 1 }).payable, 4900],
]

let failed = 0
for (const [label, actual, expected] of expectations) {
  const ok = Math.abs(actual - expected) < 1e-9
  if (!ok) failed += 1
  console.log(`${ok ? '✓' : '✗'} ${label}: ${actual}（期望 ${expected}）`)
}

let guarded = false
try {
  computeCreditSettlement({
    ...CREDIT_SETTLE_STANDARD_CASE,
    nodes: CREDIT_SETTLE_STANDARD_CASE.nodes.map((node, i) => (i === 0 ? { ...node, ptPercent: 20 } : node)),
  })
} catch (error) {
  guarded = error instanceof CreditSettleAssertionError
}
console.log(`${guarded ? '✓' : '✗'} ΣPT ≠ 100% 时拒绝结算`)
if (!guarded) failed += 1

const deep = computeCreditSettlement({
  validBet: '12345.67',
  memberWinLose: '3210.09',
  nodes: [
    { id: 'p', name: '平台', ptPercent: 15, rebatePercent: 2.2 },
    { id: 'a1', name: '1级', ptPercent: 25, rebatePercent: 1.9 },
    { id: 'a2', name: '2级', ptPercent: 20, rebatePercent: 1.6 },
    { id: 'a3', name: '3级', ptPercent: 25, rebatePercent: 1.2 },
    { id: 'a4', name: '4级', ptPercent: 15, rebatePercent: 0.7 },
  ],
})
console.log(`✓ 五级链路 + 会员赢钱 守恒通过，平台净盈亏 ${deep.nodes[0]!.net}`)

const fixedRebate = computeCreditSettlement({
  validBet: 30000,
  memberWinLose: 5000,
  memberRebate: 400,
  nodes: [
    { id: 'p', name: '平台', ptPercent: 30, rebatePercent: 2 },
    { id: 'me', name: '我', ptPercent: 70, rebatePercent: 1 },
  ],
})
const fixedChecks: [string, number, number][] = [
  ['固定退水 会员退水', fixedRebate.member.rebate, 400],
  ['固定退水 会员净盈亏', fixedRebate.member.net, 5400],
  ['固定退水 直属代理付会员退水', fixedRebate.nodes[1]!.rebateOut, 400],
  ['固定退水 直属代理收平台退水', fixedRebate.nodes[1]!.rebateIn, 600],
  ['固定退水 直属代理应收会员', fixedRebate.nodes[1]!.receivable, -5400],
]
for (const [label, actual, expected] of fixedChecks) {
  const ok = Math.abs(actual - expected) < 1e-9
  if (!ok) failed += 1
  console.log(`${ok ? '✓' : '✗'} ${label}: ${actual}（期望 ${expected}）`)
}

if (failed) {
  console.error(`\n${failed} 项校验失败`)
  process.exit(1)
}
console.log('\n全部校验通过')
