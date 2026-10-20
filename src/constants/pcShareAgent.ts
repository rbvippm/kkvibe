/** PC 占成代理配置 · Mock 数据与类型 */

import {
  SHARE_AGENT_FILTER_AGENT_LEVEL_SPEC,
  SHARE_AGENT_FILTER_CREDIT_AGENT_SPEC,
  SHARE_AGENT_SPEC_ANNOT_NO,
} from './shareAgentConfigSpec'

export const AGENT_LEVEL_MAX = 10

export type AgentLevel = number

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

export const CREDIT_AGENT_FILTER_OPTIONS = [
  { value: '', label: '请选择' },
  { value: 'yes', label: '是' },
  { value: 'no', label: '否' },
] as const

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

/** PC 授信弹框 · 产品占成/退水（与后台截图品类对齐） */
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

/** 授信弹框 · 占成/退水比例输入正则（非负数字，最多两位小数） */
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

/** 授信弹框 · 占成/退水区块标题（按模式与 Tab 区分） */
export const SHARE_AGENT_CASH_SHARE_LABEL = '现金游戏占成'
export const SHARE_AGENT_CASH_P2P_LABEL = '现金P2P返利占成'
export const SHARE_AGENT_CASH_REBATE_LABEL = '现金游戏退水'
export const SHARE_AGENT_CREDIT_SHARE_LABEL = '信用游戏占成'
export const SHARE_AGENT_CREDIT_P2P_LABEL = '信用P2P返利占成'
export const SHARE_AGENT_CREDIT_REBATE_LABEL = '信用游戏退水'

export type CreditModalMode = 'grant' | 'edit'
export type CreditAccountTab = 'cash' | 'credit'

export function getShareSectionLabel(mode: CreditModalMode, tab: CreditAccountTab) {
  if (mode === 'grant') return SHARE_AGENT_CREDIT_SHARE_LABEL
  return tab === 'cash' ? SHARE_AGENT_CASH_SHARE_LABEL : SHARE_AGENT_CREDIT_SHARE_LABEL
}

export function getRebateSectionLabel(mode: CreditModalMode, tab: CreditAccountTab) {
  if (mode === 'grant') return SHARE_AGENT_CREDIT_REBATE_LABEL
  return tab === 'cash' ? SHARE_AGENT_CASH_REBATE_LABEL : SHARE_AGENT_CREDIT_REBATE_LABEL
}

export function getP2pSectionLabel(mode: CreditModalMode, tab: CreditAccountTab) {
  if (mode === 'grant') return SHARE_AGENT_CREDIT_P2P_LABEL
  return tab === 'cash' ? SHARE_AGENT_CASH_P2P_LABEL : SHARE_AGENT_CREDIT_P2P_LABEL
}

/** 授信弹框 · 占成比例区块标题（兼容旧标注组件） */
export const SHARE_AGENT_SHARE_LABEL = '占成比例'

export { SHARE_AGENT_SHARE_SPEC, SHARE_AGENT_P2P_SPEC } from './shareAgentConfigSpec'

/** 校验占成比例：区间 0 ~ max（上级代理该游戏类型最大值） */
export function validateSharePercent(
  raw: string | number,
  max: number,
  fieldLabel = '占成比例',
): string {
  return validateCreditPercentInRange(raw, max, fieldLabel, '游戏类型')
}

/** 授信弹框 · 设置退水区块标题（兼容旧标注组件） */
export const SHARE_AGENT_REBATE_LABEL = '设置退水'

export { SHARE_AGENT_REBATE_SPEC } from './shareAgentConfigSpec'

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

/** 授信弹框 · 信用 Tab 标题 */
export const SHARE_AGENT_CREDIT_TAB_LABEL = '信用'

export { SHARE_AGENT_CREDIT_TAB_SPEC } from './shareAgentConfigSpec'

/** 列表操作 · 授信按钮标注 */
export const SHARE_AGENT_GRANT_ACTION_LABEL = '授信'

export { SHARE_AGENT_GRANT_FLOW_SPEC } from './shareAgentConfigSpec'

export const SHARE_AGENT_GRANT_FLOW_LABEL = '授信流程'

export { SHARE_AGENT_GRANT_ACTION_SPEC } from './shareAgentConfigSpec'

/** 列表 · 信用代理标识标注 */
export const SHARE_AGENT_CREDIT_BADGE_LABEL = '信用代理标识'

export { SHARE_AGENT_CREDIT_CREDENTIALS_SPEC } from './shareAgentConfigSpec'

export const SHARE_AGENT_CREDIT_CREDENTIALS_LABEL = '信用代理账密与状态'

export { SHARE_AGENT_CREDIT_BADGE_SPEC } from './shareAgentConfigSpec'

export type ShareAgentFilterAnnotContext = 'agentLevel' | 'creditAgent'

/** 列表筛选 · 代理等级标注 */
export const SHARE_AGENT_FILTER_AGENT_LEVEL_LABEL = '代理等级'

export { SHARE_AGENT_FILTER_AGENT_LEVEL_SPEC } from './shareAgentConfigSpec'

/** 列表筛选 · 信用代理标注 */
export const SHARE_AGENT_FILTER_CREDIT_AGENT_LABEL = '信用代理'

export { SHARE_AGENT_FILTER_CREDIT_AGENT_SPEC } from './shareAgentConfigSpec'

export { SHARE_AGENT_ROW_ACTIONS_SPEC } from './shareAgentConfigSpec'

export const SHARE_AGENT_ROW_ACTIONS_LABEL = '编辑 / 禁用·启用'

export { SHARE_AGENT_SPEC_ANNOT_NO } from './shareAgentConfigSpec'

export const SHARE_AGENT_FILTER_ANNOT_MAP = {
  agentLevel: {
    no: SHARE_AGENT_SPEC_ANNOT_NO.filterAgentLevel,
    title: SHARE_AGENT_FILTER_AGENT_LEVEL_LABEL,
    items: SHARE_AGENT_FILTER_AGENT_LEVEL_SPEC,
  },
  creditAgent: {
    no: SHARE_AGENT_SPEC_ANNOT_NO.filterCreditAgent,
    title: SHARE_AGENT_FILTER_CREDIT_AGENT_LABEL,
    items: SHARE_AGENT_FILTER_CREDIT_AGENT_SPEC,
  },
} as const

/** 是否已生成信用代理账密（可展示信用 Tab） */
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
