/** 代理交收账期「今天」，本月 = 2026-08-01 至 2026-08-23 */
export const AGENT_SETTLE_TODAY = '2026-08-23'

/** 代理交收 · 双钱包独立结算 Mock */

export type AgentSettleCurrency = 'CNY' | 'USD'
export type AgentSettleCurrencyFilter = '' | AgentSettleCurrency
export type AgentSettleStatus = 'pay' | 'receive' | 'cleared'
export type AgentSettleTransferType = 'up' | 'down'

export type AgentSettleWallet = {
  currency: AgentSettleCurrency
  /** 钱包备注，对齐贵宾厅「我的」信用额度弹层展示名 */
  remark: string
  /** 对应贵宾厅信用账户，跳转账单 / 投注时作为默认钱包 */
  creditWalletId?: string
  creditUp: number
  creditDown: number
  validBet: number
  memberWinLose: number
  transferCount: number
  betCount: number
}

export type AgentSettleAgent = {
  id: string
  name: string
  wallets: AgentSettleWallet[]
}

export type AgentSettleTransfer = {
  id: string
  agentId: string
  currency: AgentSettleCurrency
  type: AgentSettleTransferType
  amount: number
  at: string
}

export type AgentSettleBet = {
  id: string
  agentId: string
  currency: AgentSettleCurrency
  gameName: string
  memberNickname: string
  validBet: number
  winLose: number | null
  at: string
  status: '已结算' | '未结算'
}

export const AGENT_SETTLE_CREDIT_OPTIONS: {
  value: AgentSettleCurrencyFilter
  label: string
  icon: string
}[] = [
  { value: '', label: '全部', icon: '/images/vip-club/icon-credit-all.svg' },
  { value: 'CNY', label: 'CNY', icon: '/images/vip-club/icon-currency.svg' },
  { value: 'USD', label: 'USD', icon: '/images/vip-club/icon-currency-usd.svg' },
]

export const MOCK_AGENT_SETTLE_AGENTS: AgentSettleAgent[] = [
  {
    id: 'ez1',
    name: '小红来了EZ1',
    wallets: [
      {
        currency: 'CNY',
        remark: 'EZ Wallet',
        creditWalletId: 'credit-ez-cny-1',
        creditUp: 12800,
        creditDown: 5200,
        validBet: 68500,
        memberWinLose: -7600,
        transferCount: 12,
        betCount: 158,
      },
      {
        currency: 'USD',
        remark: 'Cross',
        creditWalletId: 'credit-ez-usd-1',
        creditUp: 200,
        creditDown: 700,
        validBet: 4200,
        memberWinLose: 500,
        transferCount: 4,
        betCount: 36,
      },
    ],
  },
  {
    id: 'star',
    name: '星辰代理',
    wallets: [
      {
        currency: 'CNY',
        remark: '星辰额度',
        creditUp: 4500,
        creditDown: 6800,
        validBet: 24600,
        memberWinLose: 2300,
        transferCount: 8,
        betCount: 72,
      },
    ],
  },
  {
    id: 'lucky',
    name: '好运连连',
    wallets: [
      {
        currency: 'CNY',
        remark: '一直赢钱',
        creditWalletId: 'credit-b-cny-1',
        creditUp: 3200,
        creditDown: 3100,
        validBet: 18900,
        memberWinLose: -100,
        transferCount: 6,
        betCount: 54,
      },
      {
        currency: 'USD',
        remark: 'Lucky',
        creditUp: 1000,
        creditDown: 1900,
        validBet: 8600,
        memberWinLose: 900,
        transferCount: 5,
        betCount: 41,
      },
    ],
  },
  {
    id: 'breeze',
    name: '清风代理',
    wallets: [
      {
        currency: 'CNY',
        remark: 'account1',
        creditWalletId: 'credit-a-cny-1',
        creditUp: 1200,
        creditDown: 1200,
        validBet: 6400,
        memberWinLose: 0,
        transferCount: 4,
        betCount: 18,
      },
    ],
  },
]

export const MOCK_AGENT_SETTLE_TRANSFERS: AgentSettleTransfer[] = [
  { id: 'ST-EZ1-01', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 2000, at: '2026-08-23 10:12:08' },
  { id: 'ST-EZ1-02', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 1800, at: '2026-08-23 16:40:21' },
  { id: 'ST-EZ1-03', agentId: 'ez1', currency: 'CNY', type: 'down', amount: 2000, at: '2026-08-22 21:08:44' },
  { id: 'ST-EZ1-04', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 1600, at: '2026-08-21 11:26:03' },
  { id: 'ST-EZ1-05', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 1500, at: '2026-08-20 19:15:50' },
  { id: 'ST-EZ1-06', agentId: 'ez1', currency: 'CNY', type: 'down', amount: 1500, at: '2026-08-19 14:02:17' },
  { id: 'ST-EZ1-07', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 1400, at: '2026-08-18 09:33:41' },
  { id: 'ST-EZ1-08', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 1300, at: '2026-08-16 18:47:29' },
  { id: 'ST-EZ1-09', agentId: 'ez1', currency: 'CNY', type: 'down', amount: 1000, at: '2026-08-14 22:11:06' },
  { id: 'ST-EZ1-10', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 1200, at: '2026-08-12 13:54:38' },
  { id: 'ST-EZ1-11', agentId: 'ez1', currency: 'CNY', type: 'up', amount: 2000, at: '2026-08-08 17:20:15' },
  { id: 'ST-EZ1-12', agentId: 'ez1', currency: 'CNY', type: 'down', amount: 700, at: '2026-08-03 08:41:52' },
  { id: 'ST-EZ1-13', agentId: 'ez1', currency: 'USD', type: 'up', amount: 200, at: '2026-08-22 12:06:11' },
  { id: 'ST-EZ1-14', agentId: 'ez1', currency: 'USD', type: 'down', amount: 400, at: '2026-08-18 20:31:47' },
  { id: 'ST-EZ1-15', agentId: 'ez1', currency: 'USD', type: 'down', amount: 200, at: '2026-08-11 15:18:03' },
  { id: 'ST-EZ1-16', agentId: 'ez1', currency: 'USD', type: 'down', amount: 100, at: '2026-08-05 09:27:40' },
  { id: 'ST-STAR-01', agentId: 'star', currency: 'CNY', type: 'up', amount: 2500, at: '2026-08-23 11:08:22' },
  { id: 'ST-STAR-02', agentId: 'star', currency: 'CNY', type: 'down', amount: 3000, at: '2026-08-20 16:44:09' },
  { id: 'ST-STAR-03', agentId: 'star', currency: 'CNY', type: 'up', amount: 2000, at: '2026-08-17 10:19:55' },
  { id: 'ST-STAR-04', agentId: 'star', currency: 'CNY', type: 'down', amount: 1800, at: '2026-08-14 21:36:18' },
  { id: 'ST-STAR-05', agentId: 'star', currency: 'CNY', type: 'down', amount: 2000, at: '2026-08-10 13:02:47' },
  { id: 'ST-STAR-06', agentId: 'star', currency: 'CNY', type: 'down', amount: 1000, at: '2026-08-07 19:51:30' },
  { id: 'ST-LUCKY-01', agentId: 'lucky', currency: 'CNY', type: 'up', amount: 1800, at: '2026-08-23 09:14:26' },
  { id: 'ST-LUCKY-02', agentId: 'lucky', currency: 'CNY', type: 'up', amount: 1400, at: '2026-08-19 15:40:08' },
  { id: 'ST-LUCKY-03', agentId: 'lucky', currency: 'CNY', type: 'down', amount: 1600, at: '2026-08-15 18:22:51' },
  { id: 'ST-LUCKY-04', agentId: 'lucky', currency: 'CNY', type: 'down', amount: 1500, at: '2026-08-09 12:07:33' },
  { id: 'ST-LUCKY-05', agentId: 'lucky', currency: 'USD', type: 'up', amount: 1000, at: '2026-08-21 14:55:12' },
  { id: 'ST-LUCKY-06', agentId: 'lucky', currency: 'USD', type: 'down', amount: 900, at: '2026-08-16 20:08:44' },
  { id: 'ST-LUCKY-07', agentId: 'lucky', currency: 'USD', type: 'down', amount: 1000, at: '2026-08-06 11:29:17' },
  { id: 'ST-BREEZE-01', agentId: 'breeze', currency: 'CNY', type: 'up', amount: 600, at: '2026-08-20 10:11:08' },
  { id: 'ST-BREEZE-02', agentId: 'breeze', currency: 'CNY', type: 'down', amount: 600, at: '2026-08-18 17:43:29' },
  { id: 'ST-BREEZE-03', agentId: 'breeze', currency: 'CNY', type: 'up', amount: 600, at: '2026-08-10 09:26:51' },
  { id: 'ST-BREEZE-04', agentId: 'breeze', currency: 'CNY', type: 'down', amount: 600, at: '2026-08-04 21:18:06' },
]

export const MOCK_AGENT_SETTLE_BETS: AgentSettleBet[] = [
  { id: 'BT-EZ1-01', agentId: 'ez1', currency: 'CNY', gameName: '真人百家乐', memberNickname: '夜未央', validBet: 2800, winLose: -860, at: '2026-08-23 13:22:10', status: '已结算' },
  { id: 'BT-EZ1-02', agentId: 'ez1', currency: 'CNY', gameName: '极速时时彩', memberNickname: '阿凯', validBet: 1600, winLose: 420, at: '2026-08-23 20:08:41', status: '已结算' },
  { id: 'BT-EZ1-03', agentId: 'ez1', currency: 'CNY', gameName: '老虎机-财富金树', memberNickname: '小鱼干', validBet: 980, winLose: -980, at: '2026-08-22 18:41:07', status: '已结算' },
  { id: 'BT-EZ1-04', agentId: 'ez1', currency: 'CNY', gameName: '体育滚球', memberNickname: '老张', validBet: 3200, winLose: -640, at: '2026-08-21 23:16:33', status: '已结算' },
  { id: 'BT-EZ1-05', agentId: 'ez1', currency: 'CNY', gameName: '棋牌斗地主', memberNickname: '晴天', validBet: 760, winLose: 210, at: '2026-08-20 15:02:54', status: '已结算' },
  { id: 'BT-EZ1-06', agentId: 'ez1', currency: 'CNY', gameName: '捕鱼达人', memberNickname: '夜未央', validBet: 540, winLose: null, at: '2026-08-23 16:48:19', status: '未结算' },
  { id: 'BT-EZ1-07', agentId: 'ez1', currency: 'USD', gameName: '真人轮盘', memberNickname: 'Leo', validBet: 180, winLose: 90, at: '2026-08-22 11:37:28', status: '已结算' },
  { id: 'BT-EZ1-08', agentId: 'ez1', currency: 'USD', gameName: '电竞·CS', memberNickname: 'Kite', validBet: 260, winLose: -120, at: '2026-08-18 22:09:14', status: '已结算' },
  { id: 'BT-STAR-01', agentId: 'star', currency: 'CNY', gameName: '体育早盘', memberNickname: '星河', validBet: 2100, winLose: 680, at: '2026-08-23 09:51:02', status: '已结算' },
  { id: 'BT-STAR-02', agentId: 'star', currency: 'CNY', gameName: '真人龙虎', memberNickname: '阿珍', validBet: 1400, winLose: 220, at: '2026-08-19 19:27:45', status: '已结算' },
  { id: 'BT-LUCKY-01', agentId: 'lucky', currency: 'CNY', gameName: '刮刮乐', memberNickname: '连连', validBet: 360, winLose: -80, at: '2026-08-21 12:14:36', status: '已结算' },
  { id: 'BT-LUCKY-02', agentId: 'lucky', currency: 'USD', gameName: '老虎机-财富转盘', memberNickname: 'Lucky', validBet: 420, winLose: 180, at: '2026-08-16 16:03:21', status: '已结算' },
  { id: 'BT-BREEZE-01', agentId: 'breeze', currency: 'CNY', gameName: '彩票快3', memberNickname: '清风', validBet: 280, winLose: 0, at: '2026-08-18 10:46:08', status: '已结算' },
]

export function roundSettleAmount(value: number) {
  return Math.round(value * 100) / 100
}

export function settleWalletNet(wallet: AgentSettleWallet) {
  return roundSettleAmount(wallet.creditUp - wallet.creditDown)
}

export function settleWalletStatus(wallet: AgentSettleWallet): AgentSettleStatus {
  const net = settleWalletNet(wallet)
  if (Math.abs(net) < 0.005) return 'cleared'
  return net > 0 ? 'pay' : 'receive'
}

export function settleWalletAbs(wallet: AgentSettleWallet) {
  return Math.abs(settleWalletNet(wallet))
}

export function formatSettleNumber(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function settleCurrencySymbol(currency: AgentSettleCurrency) {
  return currency === 'USD' ? '$' : '¥'
}

export function settleWalletIcon(currency: AgentSettleCurrency) {
  return AGENT_SETTLE_CREDIT_OPTIONS.find((item) => item.value === currency)?.icon
    ?? '/images/vip-club/icon-currency.svg'
}

export function settleWalletCreditCode(currency: AgentSettleCurrency) {
  return currency === 'USD' ? 'usd' : 'cny'
}

export function formatSettleMoney(value: number, currency: AgentSettleCurrency) {
  return `${settleCurrencySymbol(currency)}${formatSettleNumber(value)}`
}

export function formatSettleSignedMoney(value: number, currency: AgentSettleCurrency) {
  if (value === 0) return formatSettleMoney(0, currency)
  const sign = value > 0 ? '' : '-'
  return `${sign}${formatSettleMoney(Math.abs(value), currency)}`
}

export function settleStatusLabel(status: AgentSettleStatus) {
  if (status === 'pay') return '需支付'
  if (status === 'receive') return '待收取'
  return '已结清'
}

export function settleStatusTagText(wallet: AgentSettleWallet) {
  const status = settleWalletStatus(wallet)
  if (status === 'cleared') return '已结清'
  const verb = status === 'pay' ? '需支付' : '待收取'
  return `${verb} ${formatSettleMoney(settleWalletAbs(wallet), wallet.currency)}`
}

export function findAgentSettle(id: string) {
  return MOCK_AGENT_SETTLE_AGENTS.find((item) => item.id === id)
}

export function agentSettleWallets(
  agent: AgentSettleAgent,
  currency: AgentSettleCurrencyFilter,
) {
  if (!currency) return agent.wallets
  return agent.wallets.filter((wallet) => wallet.currency === currency)
}

export function filterAgentSettleList(
  agents: AgentSettleAgent[],
  currency: AgentSettleCurrencyFilter,
  agentId: string,
) {
  return agents.filter((agent) => {
    if (agentId && agent.id !== agentId) return false
    return agentSettleWallets(agent, currency).length > 0
  })
}

export function summarizeAgentSettle(
  agents: AgentSettleAgent[],
  currency: AgentSettleCurrencyFilter,
) {
  const pay = { CNY: 0, USD: 0 }
  const receive = { CNY: 0, USD: 0 }
  const creditUp = { CNY: 0, USD: 0 }
  const creditDown = { CNY: 0, USD: 0 }

  for (const agent of agents) {
    for (const wallet of agentSettleWallets(agent, currency)) {
      creditUp[wallet.currency] += wallet.creditUp
      creditDown[wallet.currency] += wallet.creditDown
      const status = settleWalletStatus(wallet)
      const abs = settleWalletAbs(wallet)
      if (status === 'pay') pay[wallet.currency] += abs
      if (status === 'receive') receive[wallet.currency] += abs
    }
  }

  return { pay, receive, creditUp, creditDown }
}

export function listAgentSettleTransfers(agentId: string, currency: AgentSettleCurrency) {
  return MOCK_AGENT_SETTLE_TRANSFERS.filter(
    (item) => item.agentId === agentId && item.currency === currency,
  )
}

export function listAgentSettleBets(agentId: string, currency: AgentSettleCurrency) {
  return MOCK_AGENT_SETTLE_BETS.filter(
    (item) => item.agentId === agentId && item.currency === currency,
  )
}
