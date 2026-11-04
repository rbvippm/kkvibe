/**
 * 皇冠正统信用盘（Credit Mode）占成与层级退水结算引擎 · Algorithm A
 *
 * - 上分 / 下分（额度调拨）不参与交收，只认会员真实输赢 W_M 与有效投注 V
 * - nodes[0] = 平台，nodes[k] = 会员直属代理；ΣPT = 1
 * - 退水逐级整笔传递、赚差价：节点 i 收上级退水 = V × R_{i−1}，付下级退水 = V × R_i，
 *   赚水 = V × (R_{i−1} − R_i)；平台只付不收，全部退水成本落在平台
 * - 代理赚水由平台按天发放，不参与交收；会员退水在交收时由直属代理扣给会员（应收会员 = G − C_M）
 * - 交收只认本期游戏净输赢：应付上级 = 应收下级 − 实占游戏净输赢 P_i
 * - 全程定点小数（BigInt，放大 10^8），禁止浮点直接累加
 */

const SCALE_DIGITS = 8
const SCALE = 10n ** BigInt(SCALE_DIGITS)
const HUNDRED = 100n * SCALE

type Dec = bigint

export class CreditSettleAssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreditSettleAssertionError'
  }
}

/** number 先按 12 位小数定格，避免 0.1 + 0.2 之类的二进制尾差进入定点运算 */
function toDec(input: number | string): Dec {
  const raw = typeof input === 'number' ? input.toFixed(12) : input.trim()
  const match = /^([+-])?(\d*)(?:\.(\d*))?$/.exec(raw)
  if (!match || (!match[2] && !match[3])) throw new CreditSettleAssertionError(`非法数值：${input}`)
  const sign = match[1] === '-' ? -1n : 1n
  const intPart = BigInt(match[2] || '0')
  const fracRaw = match[3] ?? ''
  const frac = fracRaw.slice(0, SCALE_DIGITS).padEnd(SCALE_DIGITS, '0')
  let value = intPart * SCALE + BigInt(frac)
  /** 超出精度的位数按四舍五入进位 */
  if (fracRaw.length > SCALE_DIGITS && Number(fracRaw[SCALE_DIGITS]) >= 5) value += 1n
  return sign * value
}

function divRound(a: Dec, b: Dec): Dec {
  const negative = (a < 0n) !== (b < 0n)
  const absA = a < 0n ? -a : a
  const absB = b < 0n ? -b : b
  const q = (absA * 2n + absB) / (absB * 2n)
  return negative ? -q : q
}

function mul(a: Dec, b: Dec): Dec {
  return divRound(a * b, SCALE)
}

function percent(input: number | string): Dec {
  return divRound(toDec(input) * SCALE, HUNDRED)
}

function toNumber(value: Dec) {
  return Number(value) / Number(SCALE)
}

/** 断言容差：1e-6，覆盖多次乘法后的末位舍入 */
const EPSILON = 100n

function assertZero(value: Dec, message: string) {
  const abs = value < 0n ? -value : value
  if (abs > EPSILON) throw new CreditSettleAssertionError(`${message}（偏差 ${toNumber(value)}）`)
}

export type CreditSettleNodeInput = {
  id: string
  name: string
  /** 占成比例（%），30 表示 30% */
  ptPercent: number | string
  /** 本节点给直属下级（下级代理或会员）的退水率（%），1.5 表示 1.5% */
  rebatePercent: number | string
}

export type CreditSettleInput = {
  /** 会员有效投注 V */
  validBet: number | string
  /** 会员游戏输赢 W_M（会员视角，赢为正、输为负，不含退水） */
  memberWinLose: number | string
  /**
   * 会员退水金额 C_M（可选）。传入时以金额为准，直属代理付会员退水 = C_M，
   * 直属代理退水率按 C_M ÷ V 反算展示；不传则按 V × R_k 计算
   */
  memberRebate?: number | string
  /** 下注时快照的占成 / 退水链路：nodes[0] = 平台 … nodes[k] = 直属代理 */
  nodes: CreditSettleNodeInput[]
}

export type CreditSettleNodeResult = {
  id: string
  name: string
  /** 层级：0 = 平台 */
  level: number
  /** 以下比例均为小数，0.3 表示 30% */
  pt: number
  ptUp: number
  ptDown: number
  /** 上级给我的退水率 R_{i−1}，平台为 0 */
  rebateInRate: number
  /** 我给下级的退水率 R_i */
  rebateOutRate: number
  /** 占成毛利 P_i = G × PT_i */
  shareProfit: number
  /** 收上级退水 C_in,i = V × R_{i−1}（平台为 0） */
  rebateIn: number
  /** 付下级退水 C_out,i = V × R_i */
  rebateOut: number
  /** 退水收支 C_i = C_in,i − C_out,i */
  rebateNet: number
  /** 本级净盈亏 Net_i = P_i + C_i */
  net: number
  /** 应收下级 S_{i←i+1}；直属代理即应收会员 S_{k←M} */
  receivable: number
  /** 应付上级 Pay_{i→i−1} = S_{i←i+1} − P_i（赚水按天发放，不参与交收）；平台恒为 0 */
  payable: number
}

export type CreditSettleResult = {
  validBet: number
  memberWinLose: number
  /** 盘口毛利 G = −W_M */
  grossProfit: number
  member: {
    rebateRate: number
    /** 会员退水 C_M = V × R_k */
    rebate: number
    /** 会员净盈亏 Net_M = −G + C_M */
    net: number
    /** 会员应付直属代理 S_{k←M} = G − C_M（负数为代理应付会员） */
    payable: number
  }
  nodes: CreditSettleNodeResult[]
}

export function computeCreditSettlement(input: CreditSettleInput): CreditSettleResult {
  const { nodes } = input
  if (nodes.length < 2) throw new CreditSettleAssertionError('结算链路至少包含平台与直属代理两级')

  const V = toDec(input.validBet)
  if (V < 0n) throw new CreditSettleAssertionError('有效投注不能为负数')
  const W = toDec(input.memberWinLose)
  const G = -W
  const pts = nodes.map((node) => percent(node.ptPercent))
  const rates = nodes.map((node) => percent(node.rebatePercent))

  pts.forEach((pt, i) => {
    if (pt < 0n || pt > SCALE) throw new CreditSettleAssertionError(`${nodes[i]!.name} 占成须在 0%～100%`)
  })
  rates.forEach((rate, i) => {
    if (rate < 0n || rate > SCALE) throw new CreditSettleAssertionError(`${nodes[i]!.name} 退水率须在 0%～100%`)
  })
  assertZero(pts.reduce((sum, pt) => sum + pt, 0n) - SCALE, '占成守恒失败：ΣPT 必须等于 100%')

  const k = nodes.length - 1
  const fixedRebate = input.memberRebate === undefined ? null : toDec(input.memberRebate)
  if (fixedRebate !== null) {
    if (fixedRebate < 0n) throw new CreditSettleAssertionError('会员退水不能为负数')
    rates[k] = V > 0n ? divRound(fixedRebate * SCALE, V) : 0n
  }
  const memberRebate = fixedRebate ?? mul(V, rates[k]!)
  const memberNet = -G + memberRebate

  let ptUp = 0n
  const raw = nodes.map((node, i) => {
    const pt = pts[i]!
    const ptDown = ptUp + pt
    const rateIn = i === 0 ? 0n : rates[i - 1]!
    const rateOut = rates[i]!
    const shareProfit = mul(G, pt)
    const rebateIn = i === 0 ? 0n : mul(V, rateIn)
    const rebateOut = i === k && fixedRebate !== null ? fixedRebate : mul(V, rateOut)
    const row = {
      node,
      level: i,
      pt,
      ptUp,
      ptDown,
      rateIn,
      rateOut,
      shareProfit,
      rebateIn,
      rebateOut,
      rebateNet: rebateIn - rebateOut,
      net: shareProfit + rebateIn - rebateOut,
      receivable: 0n,
      payable: 0n,
    }
    ptUp = ptDown
    return row
  })

  /** 交收链路自下而上：S_{k←M} = G − V×R_k，Pay_{i→i−1} = S_{i←i+1} − P_i */
  let downstream = G - memberRebate
  for (let i = k; i >= 0; i -= 1) {
    const row = raw[i]!
    row.receivable = downstream
    row.payable = i === 0 ? 0n : downstream - row.shareProfit
    downstream = row.payable
  }

  assertZero(raw.reduce((sum, row) => sum + row.shareProfit, 0n) - G, '毛利守恒失败：ΣP_i ≠ G')
  assertZero(raw.reduce((sum, row) => sum + row.rebateNet, 0n) + memberRebate, '退水守恒失败：ΣC_i + C_M ≠ 0')
  assertZero(raw.reduce((sum, row) => sum + row.net, 0n) + memberNet, '零和守恒失败：ΣNet_i + Net_M ≠ 0')
  /** 平台作为链路顶端：交收应收 − 按天发放给各级代理的赚水 = 平台净盈亏 */
  const dailyRebatePaid = raw.slice(1).reduce((sum, row) => sum + row.rebateNet, 0n)
  assertZero(raw[0]!.receivable - dailyRebatePaid - raw[0]!.net, '链路闭合失败：平台应收 − 代理赚水 ≠ 平台净盈亏')

  return {
    validBet: toNumber(V),
    memberWinLose: toNumber(W),
    grossProfit: toNumber(G),
    member: {
      rebateRate: toNumber(rates[k]!),
      rebate: toNumber(memberRebate),
      net: toNumber(memberNet),
      payable: toNumber(G - memberRebate),
    },
    nodes: raw.map((row) => ({
      id: row.node.id,
      name: row.node.name,
      level: row.level,
      pt: toNumber(row.pt),
      ptUp: toNumber(row.ptUp),
      ptDown: toNumber(row.ptDown),
      rebateInRate: toNumber(row.rateIn),
      rebateOutRate: toNumber(row.rateOut),
      shareProfit: toNumber(row.shareProfit),
      rebateIn: toNumber(row.rebateIn),
      rebateOut: toNumber(row.rebateOut),
      rebateNet: toNumber(row.rebateNet),
      net: toNumber(row.net),
      receivable: toNumber(row.receivable),
      payable: toNumber(row.payable),
    })),
  }
}

/** 会员层交收（会员视角只需直属代理退水）：S_{k←M} = G − C_M，C_M 传金额或按 V × R_k */
export function computeMemberSettlement(
  input: {
    validBet: number | string
    memberWinLose: number | string
  } & ({ rebatePercent: number | string } | { rebate: number | string }),
) {
  const V = toDec(input.validBet)
  const G = -toDec(input.memberWinLose)
  const rebate = 'rebate' in input ? toDec(input.rebate) : mul(V, percent(input.rebatePercent))
  return {
    grossProfit: toNumber(G),
    rebate: toNumber(rebate),
    payable: toNumber(G - rebate),
    /** 会员净盈亏 Net_M = W_M + C_M；负数会员交收给代理，正数代理支付给会员 */
    net: toNumber(rebate - G),
  }
}

/** 多条下注链路按定点小数汇总同一字段，避免展示层浮点累加误差 */
export function sumSettleAmounts(values: number[]) {
  return toNumber(values.reduce((sum, value) => sum + toDec(value), 0n))
}

/** 规范第 5 节标准测试用例，供校验脚本与 PRD 示例复用 */
export const CREDIT_SETTLE_STANDARD_CASE: CreditSettleInput = {
  validBet: 10000,
  memberWinLose: -5000,
  nodes: [
    { id: 'platform', name: '平台', ptPercent: 30, rebatePercent: 2 },
    { id: 'agent-1', name: '1级代理', ptPercent: 40, rebatePercent: 1.5 },
    { id: 'agent-2', name: '2级代理', ptPercent: 30, rebatePercent: 1 },
  ],
}
