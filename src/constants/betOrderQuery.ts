/** 代理端 · 注单查询 */

export type BetOrderStatus =
  | 'unsettled'
  | 'settled'
  | 'cancelled'
  | 'resettled'
  | 'cashout'
  | 'partial_settled'

export type BetWinLoseFilter = '' | 'win' | 'lose' | 'draw'

export type BetTimePreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export type BetGameCurrency = '' | 'KKC' | 'KKV' | 'USDT' | '信用额度-CNY' | '信用额度-USD'

export type BetOrderRecord = {
  id: string
  /** 游戏订单编号 */
  gameOrderNo: string
  /** 交易编号 */
  transactionId: string
  /** 第三方游戏编号 */
  thirdPartyGameId: string
  /** 会员账号（登录名） */
  memberAccount: string
  /** 账号 ID */
  memberAccountId?: string
  /** 金刚号 */
  memberKingkongId?: string
  /** 会员昵称 */
  memberNickname?: string
  /** 代理备注 */
  memberRemark?: string
  currency: string
  productName: string
  /** 游戏名称（与游戏分类联动） */
  gameName: string
  gameCategory: string
  periodNo: string
  betContent: string
  betAmount: number
  actualDeduct: number
  validBet: number
  winLose: number | null
  status: BetOrderStatus
  betAt: string
  gameSettledAt: string | null
  platformSettledAt: string | null
  /** 代理分红 mock */
  dividendAmount: number | null
}

export const BET_ORDER_PAGE_SIZE = 20

export const BET_ORDER_MAX_RANGE_DAYS = 30

export const BET_TIME_PRESETS: { key: BetTimePreset; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

export const BET_ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'unsettled', label: '未结算' },
  { value: 'settled', label: '已结算' },
  { value: 'cancelled', label: '已取消' },
  { value: 'resettled', label: '重新结算' },
  { value: 'cashout', label: '兑现' },
  { value: 'partial_settled', label: '部分结算' },
] as const

export const BET_ORDER_WINLOSE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'win', label: '赢' },
  { value: 'lose', label: '输' },
  { value: 'draw', label: '和' },
] as const

export const BET_ORDER_CURRENCY_OPTIONS = [
  { value: 'KKC', label: 'KKC' },
  { value: 'KKV', label: 'KKV' },
  { value: 'USDT', label: 'USDT' },
  { value: '信用额度-CNY', label: '信用额度-CNY' },
  { value: '信用额度-USD', label: '信用额度-USD' },
] as const

export const BET_ORDER_CURRENCY_LABEL: Record<Exclude<BetGameCurrency, ''>, string> = {
  KKC: 'KKC',
  KKV: 'KKV',
  USDT: 'USDT',
  '信用额度-CNY': '信用额度-CNY',
  '信用额度-USD': '信用额度-USD',
}

export function formatBetOrderCurrency(currency: string) {
  return BET_ORDER_CURRENCY_LABEL[currency as Exclude<BetGameCurrency, ''>] ?? currency
}

/** 会员展示：备注 → 昵称 → 金刚号（无则回退账号） */
export function formatBetOrderMemberLabel(
  row: Pick<
    BetOrderRecord,
    'memberAccount' | 'memberKingkongId' | 'memberNickname' | 'memberRemark'
  >,
) {
  const remark = row.memberRemark?.trim()
  if (remark) return remark
  const nickname = row.memberNickname?.trim()
  if (nickname) return nickname
  const kingkongId = row.memberKingkongId?.trim()
  if (kingkongId) return kingkongId
  return row.memberAccount
}

export function formatBetOrderMemberKingkongId(
  row: Pick<BetOrderRecord, 'memberAccount' | 'memberKingkongId'>,
) {
  const kingkongId = row.memberKingkongId?.trim()
  if (kingkongId) return kingkongId
  return row.memberAccount
}

/** 下级会员搜索：备注 / 昵称 / 账号 / 账号 ID / 金刚号 */
export function getBetOrderMemberSearchHaystack(
  row: Pick<
    BetOrderRecord,
    | 'memberRemark'
    | 'memberNickname'
    | 'memberAccount'
    | 'memberAccountId'
    | 'memberKingkongId'
  >,
) {
  return [
    row.memberRemark,
    row.memberNickname,
    row.memberAccount,
    row.memberAccountId,
    row.memberKingkongId,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const BET_ORDER_CATEGORY_OPTIONS = [
  { value: '', label: '全部产品' },
  { value: 'lottery', label: '彩票' },
  { value: 'sports', label: '体育' },
  { value: 'live', label: '真人' },
  { value: 'slots', label: '电子' },
  { value: 'chess', label: '棋牌' },
] as const

export type BetGameCategory = (typeof BET_ORDER_CATEGORY_OPTIONS)[number]['value']

/** 游戏分类 → 游戏名称（二级联动） */
export const BET_ORDER_GAME_NAME_OPTIONS: Record<
  Exclude<BetGameCategory, ''>,
  readonly { value: string; label: string }[]
> = {
  lottery: [
    { value: '', label: '全部名称' },
    { value: 'hz-lottery', label: '皇者-彩票' },
    { value: 'pc28', label: '联盟PC28' },
    { value: 'cqssc', label: '重庆时时彩' },
  ],
  sports: [
    { value: '', label: '全部名称' },
    { value: 'hz-sports', label: '皇者-体育' },
    { value: 'saba', label: 'SABA - 体育' },
    { value: 'bti', label: 'BTI - 体育' },
  ],
  live: [
    { value: '', label: '全部名称' },
    { value: 'hz-live', label: '皇者-真人' },
    { value: 'ag', label: 'AG - 真人' },
    { value: 'evolution', label: 'EVOLUTION' },
  ],
  slots: [
    { value: '', label: '全部名称' },
    { value: 'hz-slots', label: '皇者-电子' },
    { value: 'pg', label: 'PG - 电子' },
    { value: 'cq9-slots', label: 'CQ9 - 电子' },
  ],
  chess: [
    { value: '', label: '全部名称' },
    { value: 'bole', label: 'BOLE - 棋牌' },
    { value: 'boya', label: 'BOYA - 棋牌' },
    { value: 'cq9', label: 'CQ9 - 棋牌' },
    { value: 'db', label: 'DB - 棋牌' },
    { value: 'kaiyuan', label: 'KAIYUAN GAMING - 棋牌' },
    { value: 'jgpj', label: '金刚牌局' },
    { value: 'kingmidas', label: 'KINGMIDAS' },
    { value: 'leg', label: 'LEG - 棋牌' },
  ],
}

export function getBetOrderGameNameOptions(category: string) {
  if (!category || category === '') return []
  return BET_ORDER_GAME_NAME_OPTIONS[category as Exclude<BetGameCategory, ''>] ?? []
}

export function getBetOrderGameNameLabel(category: string, gameName: string) {
  if (!category || !gameName) return ''
  return getBetOrderGameNameOptions(category).find((item) => item.value === gameName)?.label ?? ''
}

export function getBetOrderCategoryLabel(category: string) {
  return BET_ORDER_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category
}

export const BET_ORDER_STATUS_LABEL: Record<BetOrderStatus, string> = {
  unsettled: '未结算',
  settled: '已结算',
  cancelled: '已取消',
  resettled: '重新结算',
  cashout: '兑现',
  partial_settled: '部分结算',
}

/** 已有输赢结果、可参与输赢筛选的状态 */
export const BET_ORDER_SETTLED_LIKE_STATUSES: BetOrderStatus[] = [
  'settled',
  'resettled',
  'cashout',
  'partial_settled',
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** 生成相对今天的 Mock 时间，保证「今天/昨天」Tab 有数据 */
function mockBetAt(daysAgo: number, hour: number, minute: number, second = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, second, 0)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

const BET_ORDER_MEMBER_PROFILES: Record<
  string,
  {
    memberNickname?: string
    memberRemark?: string
    memberAccountId?: string
    memberKingkongId?: string
  }
> = {
  lin111: {
    memberNickname: '林哥',
    memberAccountId: 'mid_lin111',
    memberKingkongId: '11223344',
  },
  openapi31axy8: {
    memberRemark: '体育大户',
    memberNickname: 'openapi31',
    memberAccountId: 'mid_openapi31',
    memberKingkongId: '66880031',
  },
  fafa8888888: {
    memberRemark: 'VIP客户',
    memberAccountId: 'mid_fafa888',
    memberKingkongId: '88888888',
  },
  '小红来了EZ1': {
    memberNickname: '小红',
    memberAccountId: 'mid_ez1',
    memberKingkongId: '88661234',
  },
  mid_eyv4menuoax: {
    memberNickname: '中间层代理',
    memberAccountId: 'mid_eyv4menuoax',
    memberKingkongId: '88661202',
  },
  '华南合伙人会员': {
    memberRemark: '华南合伙人',
    memberAccountId: 'mid_hn_partner',
    memberKingkongId: '77550099',
  },
}

function enrichBetOrderMemberFields(row: BetOrderRecord): BetOrderRecord {
  const profile = BET_ORDER_MEMBER_PROFILES[row.memberAccount]
  if (!profile) return row
  return {
    ...row,
    memberAccountId: row.memberAccountId ?? profile.memberAccountId,
    memberKingkongId: row.memberKingkongId ?? profile.memberKingkongId,
    memberNickname: row.memberNickname ?? profile.memberNickname,
    memberRemark: row.memberRemark ?? profile.memberRemark,
  }
}

const MOCK_BET_ORDER_RECORDS_RAW: BetOrderRecord[] = [
  {
    id: 'bo1',
    gameOrderNo: '0034-20260630014645001',
    transactionId: 'e505a033f8c24a1b9d2e6c7a1b3d4e5f',
    thirdPartyGameId: '882910334521',
    memberAccount: 'lin111',
    memberNickname: '林哥',
    currency: 'KKC',
    productName: '皇者-彩票',
    gameName: 'hz-lottery',
    gameCategory: 'lottery',
    periodNo: '23770454',
    betContent: '联盟PC28 两面 大@2.158',
    betAmount: 500,
    actualDeduct: 500,
    validBet: 500,
    winLose: -496.5,
    status: 'settled',
    betAt: mockBetAt(0, 9, 45, 9),
    gameSettledAt: mockBetAt(0, 9, 46, 25),
    platformSettledAt: mockBetAt(0, 9, 46, 45),
    dividendAmount: 12.5,
  },
  {
    id: 'bo2',
    gameOrderNo: '0034-20260630014645002',
    transactionId: 'a102b203c304d405e506f607a708b809',
    thirdPartyGameId: '882910334522',
    memberAccount: 'lin111',
    memberNickname: '林哥',
    currency: 'KKC',
    productName: '皇者-彩票',
    gameName: 'hz-lottery',
    gameCategory: 'lottery',
    periodNo: '23770455',
    betContent: '联盟PC28 两面 小@2.158',
    betAmount: 500,
    actualDeduct: 500,
    validBet: 500,
    winLose: 116.5,
    status: 'settled',
    betAt: mockBetAt(0, 9, 46, 45),
    gameSettledAt: mockBetAt(0, 9, 47, 10),
    platformSettledAt: mockBetAt(0, 9, 47, 28),
    dividendAmount: 8.2,
  },
  {
    id: 'bo3',
    gameOrderNo: '0034-20260630021012003',
    transactionId: 'c203d304e405f506a607b708c809d910',
    thirdPartyGameId: '882910334523',
    memberAccount: 'openapi31axy8',
    memberRemark: '体育大户',
    memberNickname: 'openapi31',
    currency: 'KKV',
    productName: '皇者-体育',
    gameName: 'hz-sports',
    gameCategory: 'sports',
    periodNo: '英超240601',
    betContent: '曼联 vs 切尔西 主胜@1.92',
    betAmount: 200,
    actualDeduct: 200,
    validBet: 200,
    winLose: null,
    status: 'unsettled',
    betAt: mockBetAt(0, 21, 1, 12),
    gameSettledAt: null,
    platformSettledAt: null,
    dividendAmount: null,
  },
  {
    id: 'bo4',
    gameOrderNo: '0034-20260629183022004',
    transactionId: 'd304e405f506a607b708c809d910e021',
    thirdPartyGameId: '882910334524',
    memberAccount: '小红来了EZ1',
    memberNickname: '小红',
    currency: 'USDT',
    productName: '皇者-真人',
    gameName: 'hz-live',
    gameCategory: 'live',
    periodNo: '—',
    betContent: '百家乐 A厅 庄@1.95',
    betAmount: 1000,
    actualDeduct: 1000,
    validBet: 1000,
    winLose: 950,
    status: 'settled',
    betAt: mockBetAt(1, 18, 30, 22),
    gameSettledAt: mockBetAt(1, 18, 31, 5),
    platformSettledAt: mockBetAt(1, 18, 31, 18),
    dividendAmount: 25,
  },
  {
    id: 'bo5',
    gameOrderNo: '0034-20260629120000005',
    transactionId: 'e405f506a607b708c809d910e021f132',
    thirdPartyGameId: '882910334525',
    memberAccount: 'fafa8888888',
    memberRemark: 'VIP客户',
    currency: '信用额度-CNY',
    productName: '皇者-电子',
    gameName: 'hz-slots',
    gameCategory: 'slots',
    periodNo: '—',
    betContent: '财神到 旋转x50',
    betAmount: 300,
    actualDeduct: 300,
    validBet: 0,
    winLose: 0,
    status: 'cancelled',
    betAt: mockBetAt(1, 12, 0, 0),
    gameSettledAt: null,
    platformSettledAt: null,
    dividendAmount: 0,
  },
  {
    id: 'bo6',
    gameOrderNo: '0034-20260628142208006',
    transactionId: 'f506a607b708c809d910e021f132a243',
    thirdPartyGameId: '882910334526',
    memberAccount: 'mid_eyv4menuoax',
    memberNickname: '中间层代理',
    currency: 'USDT',
    productName: '皇者-体育',
    gameName: 'hz-sports',
    gameCategory: 'sports',
    periodNo: 'NBA240628',
    betContent: '湖人 vs 勇士 大分 218.5@1.88',
    betAmount: 800,
    actualDeduct: 800,
    validBet: 800,
    winLose: -800,
    status: 'settled',
    betAt: mockBetAt(2, 14, 22, 8),
    gameSettledAt: mockBetAt(1, 11, 30, 0),
    platformSettledAt: mockBetAt(1, 11, 30, 22),
    dividendAmount: 16,
  },
  {
    id: 'bo7',
    gameOrderNo: '0034-20260627101530007',
    transactionId: 'a607b708c809d910e021f132a243b354',
    thirdPartyGameId: '882910334527',
    memberAccount: 'lin111',
    memberNickname: '林哥',
    currency: 'USDT',
    productName: '重庆时时彩',
    gameName: 'cqssc',
    gameCategory: 'lottery',
    periodNo: '23770120',
    betContent: '重庆时时彩 定位胆 5@9.8',
    betAmount: 50,
    actualDeduct: 50,
    validBet: 50,
    winLose: 440,
    status: 'settled',
    betAt: mockBetAt(0, 10, 15, 30),
    gameSettledAt: mockBetAt(0, 10, 20, 0),
    platformSettledAt: mockBetAt(0, 10, 20, 15),
    dividendAmount: 5.5,
  },
  {
    id: 'bo8',
    gameOrderNo: '0034-20260627153000008',
    transactionId: 'b708c809d910e021f132a243b354c465',
    thirdPartyGameId: '882910334528',
    memberAccount: '华南合伙人会员',
    memberRemark: '华南合伙人',
    currency: 'USDT',
    productName: '联盟PC28',
    gameName: 'pc28',
    gameCategory: 'lottery',
    periodNo: '23770125',
    betContent: '联盟PC28 单双 双@2.0',
    betAmount: 120,
    actualDeduct: 120,
    validBet: 120,
    winLose: null,
    status: 'unsettled',
    betAt: mockBetAt(0, 15, 30, 0),
    gameSettledAt: null,
    platformSettledAt: null,
    dividendAmount: null,
  },
  {
    id: 'bo9',
    gameOrderNo: '0034-20260630110000009',
    transactionId: 'c809d910e021f132a243b354c465d576',
    thirdPartyGameId: '882910334529',
    memberAccount: 'lin111',
    memberNickname: '林哥',
    currency: 'USDT',
    productName: '皇者-体育',
    gameName: 'hz-sports',
    gameCategory: 'sports',
    periodNo: '欧冠240630',
    betContent: '皇马 vs 巴萨 让球 -0.5@1.85',
    betAmount: 600,
    actualDeduct: 600,
    validBet: 600,
    winLose: 510,
    status: 'resettled',
    betAt: mockBetAt(0, 11, 0, 0),
    gameSettledAt: mockBetAt(0, 23, 15, 0),
    platformSettledAt: mockBetAt(1, 9, 30, 0),
    dividendAmount: 12,
  },
  {
    id: 'bo10',
    gameOrderNo: '0034-20260630140000010',
    transactionId: 'd910e021f132a243b354c465d576e687',
    thirdPartyGameId: '882910334530',
    memberAccount: 'openapi31axy8',
    memberRemark: '体育大户',
    memberNickname: 'openapi31',
    currency: 'KKV',
    productName: '皇者-体育',
    gameName: 'hz-sports',
    gameCategory: 'sports',
    periodNo: 'NBA240630',
    betContent: '凯尔特人 vs 热火 大分 215.5@1.90',
    betAmount: 400,
    actualDeduct: 400,
    validBet: 400,
    winLose: 156,
    status: 'cashout',
    betAt: mockBetAt(0, 14, 0, 0),
    gameSettledAt: mockBetAt(0, 16, 20, 0),
    platformSettledAt: mockBetAt(0, 16, 22, 0),
    dividendAmount: 8,
  },
  {
    id: 'bo11',
    gameOrderNo: '0034-20260630160000011',
    transactionId: 'e021f132a243b354c465d576e687f798',
    thirdPartyGameId: '882910334531',
    memberAccount: 'fafa8888888',
    memberRemark: 'VIP客户',
    currency: 'USDT',
    productName: '皇者-体育',
    gameName: 'hz-sports',
    gameCategory: 'sports',
    periodNo: '英超串关',
    betContent: '2串1 曼联胜+利物浦胜@3.25',
    betAmount: 200,
    actualDeduct: 200,
    validBet: 100,
    winLose: 65,
    status: 'partial_settled',
    betAt: mockBetAt(0, 16, 0, 0),
    gameSettledAt: mockBetAt(0, 18, 45, 0),
    platformSettledAt: mockBetAt(0, 18, 50, 0),
    dividendAmount: 2.5,
  },
  {
    id: 'bo12',
    gameOrderNo: '0034-20260630180000012',
    transactionId: 'f132a243b354c465d576e687f809a910',
    thirdPartyGameId: '882910334532',
    memberAccount: 'lin111',
    memberNickname: '林哥',
    currency: 'USDT',
    productName: 'BOLE - 棋牌',
    gameName: 'bole',
    gameCategory: 'chess',
    periodNo: '—',
    betContent: '斗地主 初级场 入场@10',
    betAmount: 100,
    actualDeduct: 100,
    validBet: 100,
    winLose: 85,
    status: 'settled',
    betAt: mockBetAt(0, 18, 0, 0),
    gameSettledAt: mockBetAt(0, 18, 25, 0),
    platformSettledAt: mockBetAt(0, 18, 28, 0),
    dividendAmount: 4,
  },
  {
    id: 'bo13',
    gameOrderNo: '0034-20260630190000013',
    transactionId: 'a243b354c465d576e687f809a910b021',
    thirdPartyGameId: '882910334533',
    memberAccount: 'openapi31axy8',
    memberRemark: '体育大户',
    memberNickname: 'openapi31',
    currency: 'USDT',
    productName: 'CQ9 - 棋牌',
    gameName: 'cq9',
    gameCategory: 'chess',
    periodNo: '—',
    betContent: '炸金花 高级场',
    betAmount: 250,
    actualDeduct: 250,
    validBet: 250,
    winLose: -250,
    status: 'settled',
    betAt: mockBetAt(0, 19, 10, 0),
    gameSettledAt: mockBetAt(0, 19, 35, 0),
    platformSettledAt: mockBetAt(0, 19, 38, 0),
    dividendAmount: 6,
  },
  ...Array.from({ length: 11 }, (_, i) => {
    const idx = i + 14
    const dayAgo = i % 5
    const hour = 8 + (i % 12)
    const win = i % 3 === 0 ? 88 : i % 3 === 1 ? -120 : 0
    const betAt = mockBetAt(dayAgo, hour, i % 60, 0)
    const categories = ['lottery', 'sports', 'live', 'chess'] as const
    const gameCategory = categories[i % categories.length]
    const gameNames = {
      lottery: 'hz-lottery',
      sports: 'hz-sports',
      live: 'hz-live',
      chess: (['bole', 'boya', 'cq9', 'db', 'kaiyuan'] as const)[i % 5],
    }
    const productNames = {
      lottery: '皇者-彩票',
      sports: '皇者-体育',
      live: '皇者-真人',
      chess: getBetOrderGameNameLabel('chess', gameNames.chess),
    }
    const memberAccount = ['lin111', 'openapi31axy8', 'fafa8888888'][i % 3]
    return {
      id: `bo${idx}`,
      gameOrderNo: `0034-20260612000${String(idx).padStart(3, '0')}`,
      transactionId: `mock${idx}tx${'a'.repeat(28)}`.slice(0, 32),
      thirdPartyGameId: `88291033${4500 + idx}`,
      memberAccount,
      ...BET_ORDER_MEMBER_PROFILES[memberAccount],
      currency: (['USDT', 'KKC', 'KKV', '信用额度-CNY', '信用额度-USD'] as const)[i % 5],
      productName: productNames[gameCategory],
      gameName: gameNames[gameCategory],
      gameCategory,
      periodNo: i % 3 === 0 ? `23770${100 + idx}` : '—',
      betContent: `模拟注单内容 ${idx} @1.${90 + (i % 9)}`,
      betAmount: 100 + i * 20,
      actualDeduct: 100 + i * 20,
      validBet: 100 + i * 20,
      winLose: win,
      status: 'settled' as const,
      betAt,
      gameSettledAt: mockBetAt(dayAgo, hour, (i + 2) % 60, 0),
      platformSettledAt: mockBetAt(dayAgo, hour, (i + 3) % 60, 0),
      dividendAmount: 3 + (i % 5),
    }
  }),
]

export const MOCK_BET_ORDER_RECORDS = MOCK_BET_ORDER_RECORDS_RAW.map(enrichBetOrderMemberFields)

export type BetOrderCurrencyFilter = Exclude<BetGameCurrency, ''>

export type BetOrderFilter = {
  keyword: string
  timePreset: BetTimePreset
  customStart: string
  customEnd: string
  status: '' | BetOrderStatus
  category: string
  gameName: string
  gameCurrency: BetOrderCurrencyFilter
  winLose: BetWinLoseFilter
}

function parseDateTime(value: string) {
  return new Date(value.replace(/-/g, '/'))
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getBetOrderDateRange(filter: Pick<BetOrderFilter, 'timePreset' | 'customStart' | 'customEnd'>) {
  const now = new Date()
  const today = startOfDay(now)

  if (filter.timePreset === 'today') {
    return { start: today, end: endOfDay(now) }
  }
  if (filter.timePreset === 'yesterday') {
    const y = new Date(today)
    y.setDate(y.getDate() - 1)
    return { start: y, end: endOfDay(y) }
  }
  if (filter.timePreset === 'week') {
    const start = new Date(today)
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
    return { start, end: endOfDay(now) }
  }
  if (filter.timePreset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start, end: endOfDay(now) }
  }

  const start = filter.customStart ? startOfDay(new Date(filter.customStart)) : today
  const end = filter.customEnd ? endOfDay(new Date(filter.customEnd)) : endOfDay(now)
  return { start, end }
}

export function validateBetOrderDateRange(filter: Pick<BetOrderFilter, 'timePreset' | 'customStart' | 'customEnd'>) {
  if (filter.timePreset !== 'custom') return null
  if (!filter.customStart || !filter.customEnd) return '请选择自定义起止日期'
  const { start, end } = getBetOrderDateRange(filter)
  if (start > end) return '开始日期不能晚于结束日期'
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > BET_ORDER_MAX_RANGE_DAYS) {
    return `移动端仅支持查询近 ${BET_ORDER_MAX_RANGE_DAYS} 天数据，更多数据请前往 PC 端导出`
  }
  return null
}

export function filterBetOrders(
  rows: BetOrderRecord[],
  filter: Omit<BetOrderFilter, 'gameCurrency'> & { gameCurrency: BetGameCurrency },
) {
  const keyword = filter.keyword.trim().toLowerCase()
  const { start, end } = getBetOrderDateRange(filter)

  return rows.filter((row) => {
    const betTime = parseDateTime(row.betAt)
    if (betTime < start || betTime > end) return false
    if (filter.status && row.status !== filter.status) return false
    if (filter.category && row.gameCategory !== filter.category) return false
    if (filter.gameName && row.gameName !== filter.gameName) return false
    if (filter.gameCurrency && row.currency !== filter.gameCurrency) return false
    if (filter.winLose) {
      if (!BET_ORDER_SETTLED_LIKE_STATUSES.includes(row.status) || row.winLose === null) return false
      if (filter.winLose === 'win' && row.winLose <= 0) return false
      if (filter.winLose === 'lose' && row.winLose >= 0) return false
      if (filter.winLose === 'draw' && row.winLose !== 0) return false
    }
    if (!keyword) return true
    const haystack = [getBetOrderMemberSearchHaystack(row), row.gameOrderNo]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(keyword)
  })
}

/** 汇总区统计：忽略游戏币种筛选，按各币种分别汇总 */
export function filterBetOrdersForSummary(rows: BetOrderRecord[], filter: BetOrderFilter) {
  return filterBetOrders(rows, { ...filter, gameCurrency: '' })
}

export type BetOrderSummary = {
  count: number
  betAmount: number
  validBet: number
  winLose: number
}

export function summarizeBetOrders(rows: BetOrderRecord[]): BetOrderSummary {
  return rows.reduce(
    (acc, row) => {
      acc.count += 1
      acc.betAmount += row.betAmount
      acc.validBet += row.validBet
      if (row.winLose !== null) acc.winLose += row.winLose
      return acc
    },
    { count: 0, betAmount: 0, validBet: 0, winLose: 0 },
  )
}

/** 汇总轮播顺序：KKC → KKV → USDT → 信用额度-CNY → 信用额度-USD */
export const BET_ORDER_SUMMARY_CURRENCIES: Exclude<BetGameCurrency, ''>[] = [
  'KKC',
  'KKV',
  'USDT',
  '信用额度-CNY',
  '信用额度-USD',
]

export type BetOrderCurrencySummary = BetOrderSummary & {
  currency: Exclude<BetGameCurrency, ''>
  label: string
}

export function summarizeBetOrdersByCurrency(
  rows: BetOrderRecord[],
  currencies: Exclude<BetGameCurrency, ''>[] = BET_ORDER_SUMMARY_CURRENCIES,
): BetOrderCurrencySummary[] {
  return currencies.map((currency) => ({
    currency,
    label: BET_ORDER_CURRENCY_LABEL[currency],
    ...summarizeBetOrders(rows.filter((row) => row.currency === currency)),
  }))
}

export function betOrderStatusClass(status: BetOrderStatus) {
  if (status === 'settled') return 'mh5-bet-order__status--settled'
  if (status === 'cancelled') return 'mh5-bet-order__status--cancelled'
  if (status === 'resettled') return 'mh5-bet-order__status--resettled'
  if (status === 'cashout') return 'mh5-bet-order__status--cashout'
  if (status === 'partial_settled') return 'mh5-bet-order__status--partial'
  return 'mh5-bet-order__status--unsettled'
}

/** 亚洲习惯：红赢绿输 */
export function formatBetWinLose(row: Pick<BetOrderRecord, 'status' | 'winLose'>) {
  if (row.status === 'cancelled') return '已取消'
  if (row.status === 'unsettled' || row.winLose === null) return '待结算'
  if (row.winLose > 0) return `+${row.winLose.toFixed(2)}`
  if (row.winLose < 0) return row.winLose.toFixed(2)
  return '0.00'
}

export function betWinLoseClass(row: Pick<BetOrderRecord, 'status' | 'winLose'>) {
  if (row.status === 'cancelled') return 'mh5-bet-order__amount--cancelled'
  if (row.status === 'unsettled' || row.winLose === null) return 'mh5-bet-order__amount--pending'
  if (row.winLose > 0) return 'mh5-bet-order__amount--win'
  if (row.winLose < 0) return 'mh5-bet-order__amount--lose'
  return 'mh5-bet-order__amount--flat'
}

export function truncateBetText(text: string, max = 28) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

export function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
