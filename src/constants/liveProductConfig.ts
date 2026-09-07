/** 直播管理 · 产品配置 · Mock */

import { ref } from 'vue'
import { ANCHOR_CHANNELS, findAnchorChannel } from './liveAnchorMetric'

export type LiveProductLang = 'zh' | 'zhHant' | 'en' | 'vi' | 'th'
export type LiveProductCurrency = 'kkc' | 'kkv' | 'usdt-tron'
export type LiveProductOrientation = 'portrait' | 'landscape' | 'half'
export type LiveProductI18nMap = Partial<Record<LiveProductLang, string>>

export type LiveProductRow = {
  id: string
  channel: string
  moduleId: string
  miniProgram: string
  product: string
  currencies: LiveProductCurrency[]
  languages: LiveProductLang[]
  names: LiveProductI18nMap
  orientation: LiveProductOrientation
  iconUrl: string
  iconFileName: string
  suffix: string
  sort: number
  enabled: boolean
}

export const LIVE_PRODUCT_CHANNEL_OPTIONS = ANCHOR_CHANNELS.map((item) => ({
  value: item.id,
  label: item.name,
}))

export const LIVE_PRODUCT_MODULE_OPTIONS = [
  { value: 'stg-live', label: 'STG-真人' },
  { value: 'stg-cash', label: 'STG-现金游戏' },
  { value: 'stg-slot', label: 'STG-老虎机' },
  { value: 'legacy', label: '旧平台游戏' },
] as const

export const LIVE_PRODUCT_MINI_PROGRAMS = [
  { value: 'ag-pa-live', label: 'AG(PA)真人 转账' },
  { value: 'mini-game', label: '迷你游戏' },
  { value: 'fun-bet', label: '趣投' },
  { value: 'bbin-slot', label: 'BBIN 老虎机' },
  { value: 'scratch', label: '刮刮乐' },
  { value: 'jdb-fish', label: 'JDB 捕鱼' },
] as const

export const LIVE_PRODUCT_CATALOG: Record<string, { value: string; label: string }[]> = {
  'ag-pa-live': [],
  'mini-game': [
    { value: 'benz-bmw', label: '奔驰宝马' },
    { value: 'lucky-fruit', label: '水果机' },
  ],
  'fun-bet': [
    { value: 'chain-ship', label: '区块链星舰' },
    { value: 'crash', label: '飞行员' },
  ],
  'bbin-slot': [],
  scratch: [{ value: 'scratch-half', label: '刮刮乐半屏' }],
  'jdb-fish': [{ value: 'pilot', label: '飞行员' }],
}

export const LIVE_PRODUCT_CURRENCY_OPTIONS: { value: LiveProductCurrency; label: string }[] = [
  { value: 'kkc', label: 'KKC' },
  { value: 'kkv', label: 'KKV' },
  { value: 'usdt-tron', label: 'USDT-TRON' },
]

export const LIVE_PRODUCT_LANG_OPTIONS: { value: LiveProductLang; label: string; short: string }[] = [
  { value: 'zh', label: '简体中文', short: '中文' },
  { value: 'zhHant', label: '繁体中文', short: '繁中' },
  { value: 'en', label: '英文', short: '英文' },
  { value: 'vi', label: '越南语', short: '越南语' },
  { value: 'th', label: '泰语', short: '泰语' },
]

export const LIVE_PRODUCT_ORIENTATION_OPTIONS: { value: LiveProductOrientation; label: string }[] = [
  { value: 'portrait', label: '竖屏' },
  { value: 'landscape', label: '横屏' },
  { value: 'half', label: '半屏' },
]

export function liveProductChannelLabel(id: string) {
  return findAnchorChannel(id)?.name ?? id
}

export function liveProductModuleLabel(id: string) {
  return LIVE_PRODUCT_MODULE_OPTIONS.find((item) => item.value === id)?.label ?? id
}

export function liveProductMiniProgramLabel(id: string) {
  return LIVE_PRODUCT_MINI_PROGRAMS.find((item) => item.value === id)?.label ?? id
}

export function liveProductCatalogLabel(miniProgram: string, product: string) {
  if (!product) return '-'
  return LIVE_PRODUCT_CATALOG[miniProgram]?.find((item) => item.value === product)?.label ?? product
}

export function liveProductCurrencyLabel(value: LiveProductCurrency) {
  return LIVE_PRODUCT_CURRENCY_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function liveProductLangLabel(value: LiveProductLang) {
  return LIVE_PRODUCT_LANG_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function liveProductLangShort(value: LiveProductLang) {
  return LIVE_PRODUCT_LANG_OPTIONS.find((item) => item.value === value)?.short ?? value
}

export function liveProductOrientationLabel(value: LiveProductOrientation) {
  return LIVE_PRODUCT_ORIENTATION_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function liveProductDisplayName(row: LiveProductRow) {
  return row.names.zh?.trim() || row.names.zhHant?.trim() || row.names.en?.trim() || liveProductCatalogLabel(row.miniProgram, row.product)
}

function nextId() {
  return `lpc-${Date.now()}`
}

export function createEmptyProductRow(sort = 1): LiveProductRow {
  return {
    id: nextId(),
    channel: '',
    moduleId: '',
    miniProgram: '',
    product: '',
    currencies: ['kkc'],
    languages: ['zh'],
    names: { zh: '' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort,
    enabled: true,
  }
}

export function cloneProductRow(row: LiveProductRow): LiveProductRow {
  return {
    ...row,
    currencies: [...row.currencies],
    languages: [...row.languages],
    names: { ...row.names },
  }
}

export const liveProductStore = ref<LiveProductRow[]>([
  {
    id: 'lpc-1',
    channel: 'self',
    moduleId: 'stg-live',
    miniProgram: 'ag-pa-live',
    product: '',
    currencies: ['kkc'],
    languages: ['zh'],
    names: { zh: 'AG真人' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'lpc-2',
    channel: 'kk',
    moduleId: 'stg-cash',
    miniProgram: 'mini-game',
    product: 'benz-bmw',
    currencies: ['kkc'],
    languages: ['zh'],
    names: { zh: '奔驰宝马' },
    orientation: 'half',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'lpc-3',
    channel: 'goodworld',
    moduleId: 'stg-cash',
    miniProgram: 'fun-bet',
    product: 'chain-ship',
    currencies: ['kkc'],
    languages: ['zh'],
    names: { zh: '区块链星舰' },
    orientation: 'half',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'lpc-4',
    channel: 'self',
    moduleId: 'stg-slot',
    miniProgram: 'bbin-slot',
    product: '',
    currencies: ['kkc'],
    languages: ['zh'],
    names: { zh: 'BBIN老虎机' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'lpc-5',
    channel: 'sea',
    moduleId: 'legacy',
    miniProgram: 'scratch',
    product: 'scratch-half',
    currencies: ['kkc'],
    languages: ['zh'],
    names: { zh: '刮刮乐半屏' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'lpc-6',
    channel: 'vn',
    moduleId: 'stg-cash',
    miniProgram: 'jdb-fish',
    product: 'pilot',
    currencies: ['kkc'],
    languages: ['en'],
    names: { en: 'Pilot' },
    orientation: 'landscape',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'lpc-7',
    channel: 'kk',
    moduleId: 'stg-live',
    miniProgram: 'ag-pa-live',
    product: '',
    currencies: ['kkc', 'usdt-tron'],
    languages: ['zh', 'en'],
    names: { zh: 'AG真人·KK', en: 'AG Live' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '/live/ag',
    sort: 2,
    enabled: false,
  },
])
