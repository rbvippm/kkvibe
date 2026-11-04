/**
 * 会员交收统一 Mock：贵宾厅代理结算各钱包、信用代理中心会员（会员盈亏 / 对账结算）共用，
 * 两种币种同一组数值，保证各页口径一致
 */
export const MEMBER_SETTLE_MOCK = {
  creditUp: 10000,
  creditDown: 0,
  validBet: 30000,
  /** 会员视角游戏输赢（不含退水），赢为正 */
  memberWinLose: 5000,
  /** 总退水金额 = 有效投注 × 会员退水 1% */
  rebate: 300,
} as const

/**
 * 贵宾厅会员 EZ（金刚号 EZ888888）在代理「小红来了EZ1」下的两个钱包：
 * EZ Wallet（CNY）总输赢 −5000，Cross（USD）按统一 Mock。
 * 信用代理中心里 EZ 是 2级代理 EZ1 的直属会员，会员盈亏 / 对账结算都取这里。
 */
export const VIP_MEMBER_EZ = {
  id: 'ca1-m1',
  nickname: 'EZ',
  kingkongId: 'EZ888888',
  winLose: {
    CNY: -5000,
    USD: MEMBER_SETTLE_MOCK.memberWinLose,
  },
} as const
