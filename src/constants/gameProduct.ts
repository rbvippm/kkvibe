/** 小程序管理 · 通用产品管理 · Mock（独立副本，不与直播产品配置共用） */

import { ref } from 'vue'
import { gameModuleDisplayName, gameModuleStore } from './gameModule'
import { ANCHOR_CHANNELS, findAnchorChannel } from './liveAnchorMetric'

export type GameProductLang = 'zh' | 'zhHant' | 'en' | 'vi' | 'th'
export type GameProductCurrency = 'kkc' | 'kkv' | 'usdt-tron'
export type GameProductOrientation = 'portrait' | 'landscape' | 'half'
export type GameProductI18nMap = Partial<Record<GameProductLang, string>>

export type GameProductRow = {
  id: string
  channelIds: string[]
  /** 同一产品可挂多个一级模块 */
  moduleIds: string[]
  miniProgram: string
  product: string
  currencies: GameProductCurrency[]
  languages: GameProductLang[]
  names: GameProductI18nMap
  orientation: GameProductOrientation
  iconUrl: string
  iconFileName: string
  suffix: string
  sort: number
  enabled: boolean
}

export const GAME_PRODUCT_CHANNEL_OPTIONS = ANCHOR_CHANNELS.map((item) => ({
  value: item.id,
  label: item.name,
}))

export const GAME_PRODUCT_MODULE_OPTIONS = [
  { value: 'stg-live', label: 'STG-真人' },
  { value: 'stg-cash', label: 'STG-现金游戏' },
  { value: 'stg-slot', label: 'STG-老虎机' },
  { value: 'legacy', label: '旧平台游戏' },
] as const

export const GAME_PRODUCT_MINI_PROGRAMS = [
  { value: 'ag-pa-live', label: 'AG(PA)真人 转账' },
  { value: 'mini-game', label: '迷你游戏' },
  { value: 'fun-bet', label: '趣投' },
  { value: 'bbin-slot', label: 'BBIN 老虎机' },
  { value: 'scratch', label: '刮刮乐' },
  { value: 'jdb-fish', label: 'JDB 捕鱼' },
] as const

export const GAME_PRODUCT_CATALOG: Record<string, { value: string; label: string }[]> = {
  'ag-pa-live': [],
  'mini-game': [
    { value: 'benz-bmw', label: '奔驰宝马' },
    { value: 'lucky-fruit', label: '水果机' },
    { value: 'golden-flower', label: '炸金花' },
  ],
  'fun-bet': [
    { value: 'chain-ship', label: '区块链星舰' },
    { value: 'crash', label: '飞行员' },
  ],
  'bbin-slot': [],
  scratch: [{ value: 'scratch-half', label: '刮刮乐半屏' }],
  'jdb-fish': [{ value: 'pilot', label: '飞行员' }],
}

export const GAME_PRODUCT_CURRENCY_OPTIONS: { value: GameProductCurrency; label: string }[] = [
  { value: 'kkc', label: 'KKC' },
  { value: 'kkv', label: 'KKV' },
  { value: 'usdt-tron', label: 'USDT-TRON' },
]

export const GAME_PRODUCT_LANG_OPTIONS: { value: GameProductLang; label: string; short: string }[] = [
  { value: 'zh', label: '简体中文', short: '中文' },
  { value: 'zhHant', label: '繁体中文', short: '繁中' },
  { value: 'en', label: '英文', short: '英文' },
  { value: 'vi', label: '越南语', short: '越南语' },
  { value: 'th', label: '泰语', short: '泰语' },
]

export const GAME_PRODUCT_ORIENTATION_OPTIONS: { value: GameProductOrientation; label: string }[] = [
  { value: 'portrait', label: '竖屏' },
  { value: 'landscape', label: '横屏' },
  { value: 'half', label: '半屏' },
]

/** 客户端当前共用默认 icon 的展示位；后续分场景展示时在此增项并配独立图 */
export const GAME_PRODUCT_ICON_SLOTS = [
  { value: 'group-chat-pip', label: '群聊悬浮窗' },
  { value: 'live-room-pip', label: '直播间悬浮窗' },
] as const

export function gameProductChannelLabel(id: string) {
  return findAnchorChannel(id)?.name ?? id
}

export function gameProductChannelLabels(ids: string[]) {
  return ids.map(gameProductChannelLabel)
}

export function gameProductModuleLabel(id: string) {
  if (!id) return '—'
  const row = gameModuleStore.value.find((item) => item.id === id)
  if (row) return gameModuleDisplayName(row)
  return GAME_PRODUCT_MODULE_OPTIONS.find((item) => item.value === id)?.label ?? id
}

export function gameProductModuleLabels(ids: string[]) {
  return ids.map(gameProductModuleLabel).filter((label) => label && label !== '—')
}

export function formatGameProductModules(ids: string[]) {
  const labels = gameProductModuleLabels(ids)
  return labels.length ? labels.join('、') : '—'
}

function sortGameModuleRows() {
  return gameModuleStore.value
    .slice()
    .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))
}

export function listAllGameModuleOptions() {
  return sortGameModuleRows().map((row) => ({
    value: row.id,
    label: gameModuleDisplayName(row),
  }))
}

export function listGameModuleTabs() {
  return sortGameModuleRows()
    .filter((row) => row.enabled)
    .map((row) => ({ value: row.id, label: gameModuleDisplayName(row) }))
}

export function defaultGamePickerModuleId() {
  return listGameModuleTabs()[0]?.value ?? ''
}

/** 主播授权游戏：每页条数与渠道授权一致 */
export const ANCHOR_GAME_PAGE_SIZE = 8

export type AnchorGameOption = {
  id: string
  name: string
  moduleIds: string[]
}

export function listAnchorGameOptions(): AnchorGameOption[] {
  return gameProductStore.value
    .slice()
    .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))
    .map((row) => ({
      id: row.id,
      name: gameProductDisplayName(row),
      moduleIds: [...row.moduleIds],
    }))
}

export function findAnchorGame(id: string) {
  return listAnchorGameOptions().find((item) => item.id === id) ?? null
}

export function anchorGameName(id: string) {
  return findAnchorGame(id)?.name ?? id
}

export function filterAnchorGames(keyword: string, moduleId = ''): AnchorGameOption[] {
  const query = keyword.trim()
  return listAnchorGameOptions().filter((item) => {
    if (moduleId && !item.moduleIds.includes(moduleId)) return false
    if (query && !item.name.includes(query) && !item.id.includes(query)) return false
    return true
  })
}

export function gameProductMiniProgramLabel(id: string) {
  return GAME_PRODUCT_MINI_PROGRAMS.find((item) => item.value === id)?.label ?? id
}

export function gameProductCatalogLabel(miniProgram: string, product: string) {
  if (!product) return '-'
  return GAME_PRODUCT_CATALOG[miniProgram]?.find((item) => item.value === product)?.label ?? product
}

export function gameProductCurrencyLabel(value: GameProductCurrency) {
  return GAME_PRODUCT_CURRENCY_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function gameProductLangLabel(value: GameProductLang) {
  return GAME_PRODUCT_LANG_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function gameProductLangShort(value: GameProductLang) {
  return GAME_PRODUCT_LANG_OPTIONS.find((item) => item.value === value)?.short ?? value
}

export function gameProductOrientationLabel(value: GameProductOrientation) {
  return GAME_PRODUCT_ORIENTATION_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function gameProductDisplayName(row: GameProductRow) {
  return (
    row.names.zh?.trim() ||
    row.names.zhHant?.trim() ||
    row.names.en?.trim() ||
    gameProductCatalogLabel(row.miniProgram, row.product)
  )
}

/** 模拟服务端生成产品 ID，以 P 开头且唯一 */
export function createGameProductId() {
  const nums = gameProductStore.value
    .map((row) => Number(/^P(\d+)$/.exec(row.id)?.[1]))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 10000) + 1
  return `P${next}`
}

export function createEmptyGameProductRow(sort = 1): GameProductRow {
  return {
    id: '',
    channelIds: [],
    moduleIds: [],
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

export function cloneGameProductRow(row: GameProductRow): GameProductRow {
  return {
    ...row,
    channelIds: [...row.channelIds],
    moduleIds: [...row.moduleIds],
    currencies: [...row.currencies],
    languages: [...row.languages],
    names: { ...row.names },
  }
}

export const gameProductStore = ref<GameProductRow[]>([
  {
    id: 'P10001',
    channelIds: ['self'],
    moduleIds: ['M10006'],
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
    id: 'P10002',
    channelIds: ['kk', 'self'],
    moduleIds: ['M10003'],
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
    id: 'P10003',
    channelIds: ['goodworld'],
    moduleIds: ['M10003'],
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
    id: 'P10004',
    channelIds: ['self'],
    moduleIds: ['M10001'],
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
    id: 'P10005',
    channelIds: ['sea', 'vn', 'th'],
    moduleIds: ['M10002'],
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
    id: 'P10006',
    channelIds: ['vn'],
    moduleIds: ['M10004'],
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
    id: 'P10007',
    channelIds: ['kk'],
    moduleIds: ['M10006'],
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
  {
    id: 'P10008',
    channelIds: ['self', 'kk'],
    moduleIds: ['M10001'],
    miniProgram: 'mini-game',
    product: 'lucky-fruit',
    currencies: ['kkc', 'kkv'],
    languages: ['zh', 'zhHant', 'en'],
    names: { zh: '水果机', zhHant: '水果機', en: 'Lucky Fruit' },
    orientation: 'half',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'P10009',
    channelIds: ['self'],
    moduleIds: ['M10001'],
    miniProgram: 'fun-bet',
    product: 'crash',
    currencies: ['kkc', 'usdt-tron'],
    languages: ['zh', 'en'],
    names: { zh: '飞行员', en: 'Crash' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'P10010',
    channelIds: ['self', 'sea'],
    moduleIds: ['M10001'],
    miniProgram: 'ag-pa-live',
    product: '',
    currencies: ['kkc'],
    languages: ['zh', 'th', 'vi'],
    names: { zh: '龙虎斗', th: 'เสือมังกร', vi: 'Rồng Hổ' },
    orientation: 'portrait',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'P10011',
    channelIds: ['self', 'kk', 'vn'],
    moduleIds: ['M10001'],
    miniProgram: 'ag-pa-live',
    product: '',
    currencies: ['kkc', 'kkv', 'usdt-tron'],
    languages: ['zh', 'en', 'vi'],
    names: { zh: '百家乐', en: 'Baccarat', vi: 'Baccarat' },
    orientation: 'landscape',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
  {
    id: 'P10012',
    channelIds: ['self'],
    moduleIds: ['M10001'],
    miniProgram: 'mini-game',
    product: 'golden-flower',
    currencies: ['kkc'],
    languages: ['zh', 'zhHant'],
    names: { zh: '炸金花', zhHant: '炸金花' },
    orientation: 'half',
    iconUrl: '',
    iconFileName: '',
    suffix: '',
    sort: 1,
    enabled: true,
  },
])
