/** PC 占成代理配置（现金）/ 信用代理配置 · Mock 数据与类型 */

import type { AgentConfigLedger } from './agentConfigSpec'

export const AGENT_LEVEL_MAX = 10

export type AgentLevel = number

/** 信用额度记录页上下分对象数据源（含现金 / 信用两套账密） */
export type ShareAgentRow = {
  id: number
  username: string
  userId: string
  kingKongId: string
  agentLevel: AgentLevel
  isCreditAgent: boolean
  superiorAgent: string
  superiorAgentId: string
  cashAgentAccount: string
  cashAgentPassword: string
  creditAgentAccount: string
  creditAgentPassword: string
  xCoinBalance: string
  disabled: boolean
}

export const AGENT_LEVEL_OPTIONS = [
  { value: '', label: '请选择' },
  ...Array.from({ length: AGENT_LEVEL_MAX }, (_, index) => {
    const level = index + 1
    return { value: String(level), label: `${level}级代理` }
  }),
]

export function agentLevelLabel(level: AgentLevel) {
  return `${level}级代理`
}

export type PcShareAgentProduct = {
  key: string
  name: string
  share: number
  rebate: number
  maxShare: number
  maxRebate: number
}

/** PC 编辑代理弹框 · 产品占成/退水（与后台截图品类对齐） */
export const PC_SHARE_AGENT_PRODUCTS: PcShareAgentProduct[] = [
  { key: 'chess', name: '棋牌', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'fun', name: '趣投', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'esports', name: '电竞', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'fishing', name: '捕鱼', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'scratch', name: '刮刮乐', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'hot', name: '热门类', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'sports', name: '体育', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'live', name: '真人', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'lottery', name: '彩票', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'marble', name: '弹珠', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  { key: 'slots', name: '老虎机', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
  /** 仅占成配置；退水区不展示 */
  { key: 'otherCost', name: '其他成本', share: 0, rebate: 0, maxShare: 10, maxRebate: 5 },
]

export function isShareOnlyProduct(product: PcShareAgentProduct) {
  return product.key === 'otherCost'
}

export function cloneShareAgentProducts() {
  return PC_SHARE_AGENT_PRODUCTS.map((item) => ({ ...item }))
}

/** 游戏占成下方的 P2P 返利占成，区间规则与对应游戏占成相同 */
export type PcShareAgentP2pItem = {
  key: string
  name: string
  share: number
  maxShare: number
}

export const PC_SHARE_AGENT_P2P_ITEMS: PcShareAgentP2pItem[] = [
  { key: 'communityChess', name: '社区棋牌', share: 0, maxShare: 10 },
  { key: 'kingkongSports', name: '金刚体育', share: 0, maxShare: 10 },
]

export function cloneShareAgentP2pItems() {
  return PC_SHARE_AGENT_P2P_ITEMS.map((item) => ({ ...item }))
}

export type PcShareAgentRebateProduct = {
  key: string
  name: string
  rebate: number | ''
  /** 该产品退水上限 */
  maxRebate: number
}

/** 大类滑块固定 0～100，表示按各产品上限的百分比带出退水 */
export const REBATE_CATEGORY_PERCENT_MAX = 100

export type PcShareAgentRebateCategory = {
  key: string
  name: string
  /** 大类滑块，0～100 */
  rebate: number
  products: PcShareAgentRebateProduct[]
}

/** 按大类滑块百分比，把每个产品退水设为自身上限的对应比例，保留两位小数 */
export function applyCategoryRebate(category: PcShareAgentRebateCategory) {
  const percent = Number(category.rebate)
  if (!Number.isInteger(percent) || percent < 0 || percent > REBATE_CATEGORY_PERCENT_MAX) return
  category.products.forEach((product) => {
    const scaled = Math.round(product.maxRebate * percent) / 100
    product.rebate = Math.min(product.maxRebate, scaled)
  })
}

export function formatRebateRate(value: number) {
  return value.toFixed(2)
}

/** 退水大类及下属产品。大类是 0～100 滑块；产品上限是具体退水，如 0.15 表示 0.15% */
const PC_SHARE_AGENT_REBATE_CATEGORIES: PcShareAgentRebateCategory[] = [
  {
    key: 'chess',
    name: '棋牌',
    rebate: 0,
    products: [
      { key: 'im', name: 'IM棋牌', rebate: 0, maxRebate: 0.15 },
      { key: 'cdn', name: 'CDN棋牌', rebate: 0, maxRebate: 0.12 },
      { key: 'niuniu', name: '牛牛大战', rebate: 0, maxRebate: 0.08 },
    ],
  },
  {
    key: 'fun',
    name: '趣投',
    rebate: 0,
    products: [
      { key: 'crash', name: '爆点', rebate: 0, maxRebate: 0.2 },
      { key: 'mini', name: '小游戏', rebate: 0, maxRebate: 0.15 },
      { key: 'rocket', name: '火箭', rebate: 0, maxRebate: 0.18 },
    ],
  },
  {
    key: 'esports',
    name: '电竞',
    rebate: 0,
    products: [
      { key: 'im', name: 'IM电竞', rebate: 0, maxRebate: 0.25 },
      { key: 'tf', name: '雷火电竞', rebate: 0, maxRebate: 0.16 },
    ],
  },
  {
    key: 'fishing',
    name: '捕鱼',
    rebate: 0,
    products: [
      { key: 'master', name: '捕鱼达人', rebate: 0, maxRebate: 0.1 },
      { key: 'im', name: 'IM捕鱼', rebate: 0, maxRebate: 0.06 },
    ],
  },
  {
    key: 'scratch',
    name: '刮刮乐',
    rebate: 0,
    products: [
      { key: 'ggl', name: 'GGL刮乐', rebate: 0, maxRebate: 0.12 },
      { key: 'lucky', name: '幸运刮刮乐', rebate: 0, maxRebate: 0.08 },
    ],
  },
  {
    key: 'hot',
    name: '热门类',
    rebate: 0,
    products: [
      { key: 'slot', name: '热门电子', rebate: 0, maxRebate: 0.18 },
      { key: 'chess', name: '热门棋牌', rebate: 0, maxRebate: 0.09 },
    ],
  },
  {
    key: 'sports',
    name: '体育',
    rebate: 0,
    products: [
      { key: 'im', name: 'IM体育', rebate: 0, maxRebate: 0.22 },
      { key: 'saba', name: 'SABA体育', rebate: 0, maxRebate: 0.14 },
    ],
  },
  {
    key: 'live',
    name: '真人',
    rebate: 0,
    products: [
      { key: 'im', name: 'IM真人', rebate: 0, maxRebate: 0.3 },
      { key: 'pa', name: 'PA真人', rebate: 0, maxRebate: 0.11 },
    ],
  },
  {
    key: 'lottery',
    name: '彩票',
    rebate: 0,
    products: [
      { key: 'saba', name: 'SABA彩票', rebate: 0, maxRebate: 0.16 },
      { key: 'kuai3', name: '一分快三', rebate: 0, maxRebate: 0.05 },
    ],
  },
  {
    key: 'marble',
    name: '弹珠',
    rebate: 0,
    products: [
      { key: 'im', name: 'IM弹珠', rebate: 0, maxRebate: 0.09 },
      { key: 'magic', name: '魔幻弹珠', rebate: 0, maxRebate: 0.04 },
    ],
  },
  {
    key: 'slots',
    name: '老虎机',
    rebate: 0,
    products: [
      { key: 'pp', name: 'PP老虎机', rebate: 0, maxRebate: 0.28 },
      { key: 'pg', name: 'PG老虎机', rebate: 0, maxRebate: 0.19 },
    ],
  },
]

export function cloneShareAgentRebateCategories() {
  return PC_SHARE_AGENT_REBATE_CATEGORIES.map((category) => ({
    ...category,
    products: category.products.map((product) => ({ ...product })),
  }))
}

/** 编辑代理弹框 · 占成/退水比例输入正则（非负数字，最多两位小数） */
export const CREDIT_PERCENT_INPUT_REGEX = /^\d+(\.\d{1,2})?$/

/** 生成比例输入框 pattern（HTML 原生校验，区间由逻辑二次校验） */
export function creditPercentInputPattern() {
  return String(CREDIT_PERCENT_INPUT_REGEX).slice(1, -1)
}

function validateCreditPercentInRange(
  raw: string | number,
  max: number,
  fieldLabel: string,
  maxFieldLabel: string,
): string {
  const str = String(raw).trim()
  if (str === '') return `请输入${fieldLabel}`
  if (!CREDIT_PERCENT_INPUT_REGEX.test(str)) {
    return `格式不正确，区间为 0-${max}`
  }
  const value = Number(str)
  if (!Number.isFinite(value) || value < 0 || value > max) {
    return `区间为 0-${max}，x 为上级代理该${maxFieldLabel}最大值`
  }
  return ''
}

export function creditPercentRangeLabel(max: number) {
  return `0-${max}`
}

/** 校验占成比例：区间 0 ~ max（上级代理该游戏类型最大值） */
export function validateSharePercent(
  raw: string | number,
  max: number,
  fieldLabel = '占成比例',
): string {
  return validateCreditPercentInRange(raw, max, fieldLabel, '游戏类型')
}

/** 校验退水比例：区间 0 ~ max */
export function validateRebatePercent(
  raw: string | number,
  max: number,
  fieldLabel = '退水比例',
  maxFieldLabel = '品类',
): string {
  return validateCreditPercentInRange(raw, max, fieldLabel, maxFieldLabel)
}

export function validateCategoryRebate(category: PcShareAgentRebateCategory, fieldLabel = '退水') {
  const message = validateRebatePercent(
    category.rebate,
    REBATE_CATEGORY_PERCENT_MAX,
    `${category.name}${fieldLabel}`,
    '大类',
  )
  if (message.startsWith('区间为')) return '区间为 0-100%'
  return message
}

export function validateProductRebate(product: PcShareAgentRebateProduct, fieldLabel = '退水') {
  const message = validateRebatePercent(product.rebate, product.maxRebate, `${product.name}${fieldLabel}`, '产品')
  if (message.startsWith('区间为')) {
    return `区间为 0-${formatRebateRate(product.maxRebate)}%，为该产品退水上限`
  }
  return message
}

/** 是否已生成信用代理账密（信用额度记录页筛选上下分对象用） */
export function hasCreditAgentCredentials(
  row: Pick<ShareAgentRow, 'creditAgentAccount' | 'creditAgentPassword'>,
) {
  return Boolean(row.creditAgentAccount.trim() && row.creditAgentPassword.trim())
}

export function formatCreditField(value: string) {
  return value.trim() || '-'
}

export function shareAgentStatusLabel(disabled: boolean) {
  return disabled ? '禁用' : '启用'
}

export const MOCK_SHARE_AGENT_ROWS: ShareAgentRow[] = [
  {
    id: 1,
    username: '很多呵呵的',
    userId: '6992885475031612266',
    kingKongId: 'mid***flp',
    agentLevel: 1,
    isCreditAgent: false,
    superiorAgent: '平台',
    superiorAgentId: '0',
    cashAgentAccount: 'dvq0drvx',
    cashAgentPassword: 'gdp0t8a6',
    creditAgentAccount: '',
    creditAgentPassword: '',
    xCoinBalance: '-/10.00',
    disabled: false,
  },
  {
    id: 2,
    username: '南风知意',
    userId: '6992885475031612267',
    kingKongId: 'mid***k9a',
    agentLevel: 1,
    isCreditAgent: true,
    superiorAgent: '平台',
    superiorAgentId: '0',
    cashAgentAccount: 'axk2mnp1',
    cashAgentPassword: 'pqw8x3z5',
    creditAgentAccount: 'ens4f9no',
    creditAgentPassword: 'jxnul0uk',
    xCoinBalance: '5.00/10.00',
    disabled: false,
  },
  {
    id: 3,
    username: '星河漫游',
    userId: '6992885475031612268',
    kingKongId: 'mid***b2c',
    agentLevel: 2,
    isCreditAgent: true,
    superiorAgent: '很多呵呵的',
    superiorAgentId: '6992885475031612266',
    cashAgentAccount: 'bvn4hjkl',
    cashAgentPassword: 'rtm6y2w1',
    creditAgentAccount: 'sdo3n8j7',
    creditAgentPassword: 'b8e9lnma',
    xCoinBalance: '0.00/5.00',
    disabled: false,
  },
  {
    id: 4,
    username: '云端拾光',
    userId: '6992885475031612269',
    kingKongId: 'mid***d7e',
    agentLevel: 2,
    isCreditAgent: false,
    superiorAgent: '很多呵呵的',
    superiorAgentId: '6992885475031612266',
    cashAgentAccount: 'cwp9qrst',
    cashAgentPassword: 'uvx1n4m8',
    creditAgentAccount: '',
    creditAgentPassword: '',
    xCoinBalance: '-/5.00',
    disabled: false,
  },
  {
    id: 5,
    username: '青柠微甜',
    userId: '6992885475031612270',
    kingKongId: 'mid***f3g',
    agentLevel: 3,
    isCreditAgent: false,
    superiorAgent: '星河漫游',
    superiorAgentId: '6992885475031612268',
    cashAgentAccount: 'dxy5uvwx',
    cashAgentPassword: 'abc2d4e6',
    creditAgentAccount: '',
    creditAgentPassword: '',
    xCoinBalance: '-/2.00',
    disabled: false,
  },
  {
    id: 6,
    username: '暮色流年',
    userId: '6992885475031612271',
    kingKongId: 'mid***h5i',
    agentLevel: 2,
    isCreditAgent: true,
    superiorAgent: '南风知意',
    superiorAgentId: '6992885475031612267',
    cashAgentAccount: 'ezr7yzab',
    cashAgentPassword: 'fgh8j0k2',
    creditAgentAccount: 'c3bx4go5',
    creditAgentPassword: 'qojaijtu',
    xCoinBalance: '3.50/8.00',
    disabled: true,
  },
]

/** 占成代理配置（现金）/ 信用代理配置 · 列表行；两套身份独立，只带本体系账密 */
export type AgentConfigRow = {
  id: number
  username: string
  userId: string
  kingKongId: string
  agentLevel: AgentLevel
  superiorAgent: string
  superiorAgentId: string
  agentAccount: string
  agentPassword: string
  disabled: boolean
}

export const MOCK_CASH_AGENT_ROWS: AgentConfigRow[] = [
  {
    id: 1,
    username: '很多呵呵的',
    userId: '6992885475031612266',
    kingKongId: 'mid***flp',
    agentLevel: 1,
    superiorAgent: '平台',
    superiorAgentId: '0',
    agentAccount: 'dvq0drvx',
    agentPassword: 'gdp0t8a6',
    disabled: false,
  },
  {
    id: 2,
    username: '晨风知夏',
    userId: '6992885475031612272',
    kingKongId: 'mid***m4q',
    agentLevel: 1,
    superiorAgent: '平台',
    superiorAgentId: '0',
    agentAccount: 'hkt5wqe2',
    agentPassword: 'mvz7c1d9',
    disabled: false,
  },
  {
    id: 3,
    username: '云端拾光',
    userId: '6992885475031612269',
    kingKongId: 'mid***d7e',
    agentLevel: 2,
    superiorAgent: '很多呵呵的',
    superiorAgentId: '6992885475031612266',
    agentAccount: 'cwp9qrst',
    agentPassword: 'uvx1n4m8',
    disabled: false,
  },
  {
    id: 4,
    username: '青柠微甜',
    userId: '6992885475031612270',
    kingKongId: 'mid***f3g',
    agentLevel: 3,
    superiorAgent: '云端拾光',
    superiorAgentId: '6992885475031612269',
    agentAccount: 'dxy5uvwx',
    agentPassword: 'abc2d4e6',
    disabled: false,
  },
  {
    id: 5,
    username: '山海有约',
    userId: '6992885475031612275',
    kingKongId: 'mid***p8w',
    agentLevel: 2,
    superiorAgent: '晨风知夏',
    superiorAgentId: '6992885475031612272',
    agentAccount: '',
    agentPassword: '',
    disabled: true,
  },
]

export const MOCK_CREDIT_AGENT_ROWS: AgentConfigRow[] = [
  {
    id: 1,
    username: '南风知意',
    userId: '6992885475031612267',
    kingKongId: 'mid***k9a',
    agentLevel: 1,
    superiorAgent: '平台',
    superiorAgentId: '0',
    agentAccount: 'ens4f9no',
    agentPassword: 'jxnul0uk',
    disabled: false,
  },
  {
    id: 2,
    username: '北辰远航',
    userId: '6992885475031612273',
    kingKongId: 'mid***r2t',
    agentLevel: 1,
    superiorAgent: '平台',
    superiorAgentId: '0',
    agentAccount: 'kdw8r2m6',
    agentPassword: 'zpq4h7ta',
    disabled: true,
  },
  {
    id: 3,
    username: '星河漫游',
    userId: '6992885475031612268',
    kingKongId: 'mid***b2c',
    agentLevel: 2,
    superiorAgent: '南风知意',
    superiorAgentId: '6992885475031612267',
    agentAccount: 'sdo3n8j7',
    agentPassword: 'b8e9lnma',
    disabled: false,
  },
  {
    id: 4,
    username: '暮色流年',
    userId: '6992885475031612271',
    kingKongId: 'mid***h5i',
    agentLevel: 2,
    superiorAgent: '南风知意',
    superiorAgentId: '6992885475031612267',
    agentAccount: 'c3bx4go5',
    agentPassword: 'qojaijtu',
    disabled: false,
  },
  {
    id: 5,
    username: '繁星点点',
    userId: '6992885475031612274',
    kingKongId: 'mid***v6n',
    agentLevel: 3,
    superiorAgent: '星河漫游',
    superiorAgentId: '6992885475031612268',
    agentAccount: 'rmx6t2ye',
    agentPassword: 'hca9v5nk',
    disabled: false,
  },
]

export function getAgentConfigMockRows(ledger: AgentConfigLedger): AgentConfigRow[] {
  const source = ledger === 'credit' ? MOCK_CREDIT_AGENT_ROWS : MOCK_CASH_AGENT_ROWS
  return source.map((row) => ({ ...row }))
}

/** 新增一级代理 · 按用户ID精准查询的平台用户 Mock（尚未成为代理） */
export type AgentCandidateUser = Pick<AgentConfigRow, 'username' | 'userId' | 'kingKongId'>

export const MOCK_AGENT_CANDIDATE_USERS: AgentCandidateUser[] = [
  { username: '春日来信', userId: '6992885475031612301', kingKongId: 'mid***a1s' },
  { username: '夏夜晚风', userId: '6992885475031612302', kingKongId: 'mid***b2d' },
  { username: '秋水长天', userId: '6992885475031612303', kingKongId: 'mid***c3f' },
]

/** 新增成功后生成本体系登录账密（原型随机 8 位） */
export function generateAgentCredential() {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
