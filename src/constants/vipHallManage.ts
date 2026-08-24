/** 贵宾厅管理 · 模块 / 产品 · 公共 Mock */

import { ref } from 'vue'

export type VipHallLang = 'zh' | 'zhHant' | 'en' | 'vi' | 'th'
export type VipHallCurrency = 'credit-cny' | 'credit-usd'
export type VipHallProductType = 'game' | 'hall'
export type VipHallI18nMap = Partial<Record<VipHallLang, string>>

export type VipHallAssetPair = {
  mobileUrl: string
  mobileFileName: string
  pcUrl: string
  pcFileName: string
}

export type VipHallModuleRow = {
  id: string
  channel: string
  type: VipHallProductType
  names: VipHallI18nMap
  descriptions: VipHallI18nMap
  icon: VipHallAssetPair
  currencies: VipHallCurrency[]
  languages: VipHallLang[]
  sort: number
  enabled: boolean
}

export type VipHallProductRow = {
  id: string
  channel: string
  moduleId: string
  type: VipHallProductType
  names: VipHallI18nMap
  descriptions: VipHallI18nMap
  currencies: VipHallCurrency[]
  languages: VipHallLang[]
  miniProgram: string
  product: string
  suffix: string
  jumpUrl: string
  image: VipHallAssetPair
  listImage: VipHallAssetPair
  sort: number
  enabled: boolean
}

export const VIP_HALL_CHANNEL_OPTIONS = [{ value: 'self', label: '平台自营' }] as const

export const VIP_HALL_LANG_OPTIONS: { value: VipHallLang; label: string }[] = [
  { value: 'zh', label: '简体中文' },
  { value: 'zhHant', label: '繁体中文' },
  { value: 'en', label: '英文' },
  { value: 'vi', label: '越南语' },
  { value: 'th', label: '泰语' },
]

export const VIP_HALL_CURRENCY_OPTIONS: { value: VipHallCurrency; label: string }[] = [
  { value: 'credit-cny', label: '信用额度-CNY' },
  { value: 'credit-usd', label: '信用额度-USD' },
]

export const VIP_HALL_PRODUCT_TYPE_OPTIONS: { value: VipHallProductType; label: string }[] = [
  { value: 'game', label: '游戏' },
  { value: 'hall', label: '赌厅' },
]

export const VIP_HALL_FILTER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '禁用' },
] as const

export const VIP_HALL_MINI_PROGRAMS: { value: string; label: string }[] = [
  { value: 'sports', label: '金刚体育' },
  { value: 'lottery', label: '皇者彩票' },
  { value: 'live', label: '真人娱乐' },
  { value: 'slot', label: '老虎机' },
]

export type VipHallCatalogItem = {
  value: string
  label: string
  imageMobile: string
  imagePc: string
}

export const VIP_HALL_PRODUCT_CATALOG: Record<string, VipHallCatalogItem[]> = {
  sports: [
    {
      value: 'sports-board',
      label: '赛事盘口',
      imageMobile: '/images/vip-club/game-sports.png',
      imagePc: '/images/vip-club/game-sports.png',
    },
  ],
  lottery: [
    { value: 'racing', label: '联盟赛车', imageMobile: '/images/vip-club/lottery/card-racing.png', imagePc: '/images/vip-club/lottery/card-racing.png' },
    { value: 'boat', label: '联盟飞艇', imageMobile: '/images/vip-club/lottery/card-boat.png', imagePc: '/images/vip-club/lottery/card-boat.png' },
    { value: 'ssc', label: '联盟时时彩', imageMobile: '/images/vip-club/lottery/card-ssc.png', imagePc: '/images/vip-club/lottery/card-ssc.png' },
    { value: '11x5', label: '联盟十一选五', imageMobile: '/images/vip-club/lottery/card-11x5.png', imagePc: '/images/vip-club/lottery/card-11x5.png' },
    { value: 'happy10', label: '联盟快乐十分', imageMobile: '/images/vip-club/lottery/card-happy10.png', imagePc: '/images/vip-club/lottery/card-happy10.png' },
    { value: 'k3', label: '联盟快三', imageMobile: '/images/vip-club/lottery/card-k3.png', imagePc: '/images/vip-club/lottery/card-k3.png' },
    { value: 'mark6', label: '联盟六合彩', imageMobile: '/images/vip-club/lottery/card-mark6.png', imagePc: '/images/vip-club/lottery/card-mark6.png' },
  ],
  live: [
    { value: 'db-live', label: 'DB 真人', imageMobile: '/images/vip-club/vendors/db-logo.png', imagePc: '/images/vip-club/vendors/db-logo.png' },
    { value: 'pa-live', label: 'PA 真人', imageMobile: '/images/vip-club/vendors/pa-logo.png', imagePc: '/images/vip-club/vendors/pa-logo.png' },
    { value: 'huali-live', label: '华丽高真人', imageMobile: '/images/vip-club/vendors/huali-logo.png', imagePc: '/images/vip-club/vendors/huali-logo.png' },
  ],
  slot: [
    { value: 'pp', label: 'PP 老虎机', imageMobile: '/images/vip-club/vendors/pp-logo.png', imagePc: '/images/vip-club/vendors/pp-logo.png' },
    { value: 'pg', label: 'PG 老虎机', imageMobile: '/images/vip-club/vendors/pg-logo.png', imagePc: '/images/vip-club/vendors/pg-logo.png' },
  ],
}

export function emptyAssetPair(): VipHallAssetPair {
  return { mobileUrl: '', mobileFileName: '', pcUrl: '', pcFileName: '' }
}

export function cloneAssetPair(asset: VipHallAssetPair): VipHallAssetPair {
  return { ...asset }
}

export function vipHallLangLabel(lang: VipHallLang) {
  return VIP_HALL_LANG_OPTIONS.find((item) => item.value === lang)?.label ?? lang
}

export function vipHallChannelLabel(channel: string) {
  return VIP_HALL_CHANNEL_OPTIONS.find((item) => item.value === channel)?.label ?? channel
}

export function vipHallCurrencyLabel(currency: VipHallCurrency) {
  return VIP_HALL_CURRENCY_OPTIONS.find((item) => item.value === currency)?.label ?? currency
}

export function vipHallProductTypeLabel(type: VipHallProductType) {
  return VIP_HALL_PRODUCT_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type
}

export function vipHallMiniProgramLabel(value: string) {
  return VIP_HALL_MINI_PROGRAMS.find((item) => item.value === value)?.label ?? value
}

export function findCatalogItem(miniProgram: string, product: string) {
  return VIP_HALL_PRODUCT_CATALOG[miniProgram]?.find((item) => item.value === product) ?? null
}

export function vipHallCatalogProductLabel(miniProgram: string, product: string) {
  return findCatalogItem(miniProgram, product)?.label ?? product
}

export function displayZhName(names: VipHallI18nMap) {
  return names.zh?.trim() || names.zhHant?.trim() || names.en?.trim() || '-'
}

function cloneI18nMap(map: VipHallI18nMap): VipHallI18nMap {
  return { ...map }
}

export function cloneModuleRow(row: VipHallModuleRow): VipHallModuleRow {
  return {
    ...row,
    names: cloneI18nMap(row.names),
    descriptions: cloneI18nMap(row.descriptions),
    currencies: [...row.currencies],
    languages: [...row.languages],
    icon: cloneAssetPair(row.icon),
  }
}

export function cloneProductRow(row: VipHallProductRow): VipHallProductRow {
  return {
    ...row,
    names: cloneI18nMap(row.names),
    descriptions: cloneI18nMap(row.descriptions),
    currencies: [...row.currencies],
    languages: [...row.languages],
    image: cloneAssetPair(row.image),
    listImage: cloneAssetPair(row.listImage),
  }
}

export function createEmptyModuleRow(sort = 1): VipHallModuleRow {
  return {
    id: `vhm_${Date.now()}`,
    channel: 'self',
    type: 'game',
    names: {},
    descriptions: {},
    icon: emptyAssetPair(),
    currencies: ['credit-cny'],
    languages: ['zh'],
    sort,
    enabled: true,
  }
}

export function createEmptyProductRow(sort = 1, moduleId = ''): VipHallProductRow {
  return {
    id: `vhp_${Date.now()}`,
    channel: 'self',
    moduleId,
    type: 'game',
    names: {},
    descriptions: {},
    currencies: ['credit-cny'],
    languages: ['zh'],
    miniProgram: '',
    product: '',
    suffix: '',
    jumpUrl: '',
    image: emptyAssetPair(),
    listImage: emptyAssetPair(),
    sort,
    enabled: true,
  }
}

function assetFrom(url: string, fileName: string): VipHallAssetPair {
  return { mobileUrl: url, mobileFileName: fileName, pcUrl: url, pcFileName: fileName }
}

export const MOCK_VIP_HALL_MODULES: VipHallModuleRow[] = [
  {
    id: 'vhm-sports',
    channel: 'self',
    type: 'game',
    names: { zh: '金刚体育', zhHant: '金剛體育', en: 'King Kong Sports' },
    descriptions: { zh: '顶级赛事盘口', zhHant: '頂級賽事盤口', en: 'Top sports markets' },
    icon: assetFrom('/images/vip-club/game-sports.png', 'game-sports.png'),
    currencies: ['credit-cny', 'credit-usd'],
    languages: ['zh', 'zhHant', 'en'],
    sort: 1,
    enabled: true,
  },
  {
    id: 'vhm-lottery',
    channel: 'self',
    type: 'game',
    names: { zh: '皇者彩票', zhHant: '皇者彩票' },
    descriptions: { zh: '热门彩种精选', zhHant: '熱門彩種精選' },
    icon: assetFrom('/images/vip-club/game-lottery.png', 'game-lottery.png'),
    currencies: ['credit-cny'],
    languages: ['zh', 'zhHant'],
    sort: 2,
    enabled: true,
  },
  {
    id: 'vhm-live',
    channel: 'self',
    type: 'game',
    names: { zh: '真人', zhHant: '真人', en: 'Live Casino' },
    descriptions: { zh: '真人荷官桌台', zhHant: '真人荷官桌台', en: 'Live dealer tables' },
    icon: assetFrom('/images/vip-club/game-live.png', 'game-live.png'),
    currencies: ['credit-cny', 'credit-usd'],
    languages: ['zh', 'zhHant', 'en'],
    sort: 3,
    enabled: true,
  },
  {
    id: 'vhm-slot',
    channel: 'self',
    type: 'game',
    names: { zh: '老虎机', zhHant: '老虎機' },
    descriptions: { zh: '热门电子游艺', zhHant: '熱門電子遊藝' },
    icon: assetFrom('/images/vip-club/game-slot.png', 'game-slot.png'),
    currencies: ['credit-usd'],
    languages: ['zh', 'zhHant'],
    sort: 4,
    enabled: true,
  },
  {
    id: 'vhm-hall',
    channel: 'self',
    type: 'hall',
    names: { zh: '赌厅服务', zhHant: '賭廳服務', en: 'Casino Service' },
    descriptions: { zh: '线下赌厅预约', zhHant: '線下賭廳預約', en: 'Offline casino booking' },
    icon: assetFrom('/images/vip-club/game-hall.png', 'game-hall.png'),
    currencies: ['credit-cny', 'credit-usd'],
    languages: ['zh', 'zhHant', 'en'],
    sort: 5,
    enabled: true,
  },
]

export function moduleNameById(modules: VipHallModuleRow[], id: string) {
  const row = modules.find((item) => item.id === id)
  return row ? displayZhName(row.names) : '-'
}

export function moduleTypeById(modules: VipHallModuleRow[], id: string): VipHallProductType | '' {
  return modules.find((item) => item.id === id)?.type ?? ''
}

export function applyProductTypeFromModule(row: VipHallProductRow, type: VipHallProductType | '') {
  if (!type) {
    row.type = 'game'
    return
  }
  if (row.type === type) return
  row.type = type
  if (type === 'hall') {
    row.miniProgram = ''
    row.product = ''
    row.suffix = ''
  } else {
    row.jumpUrl = ''
  }
}

export const MOCK_VIP_HALL_PRODUCTS: VipHallProductRow[] = [
  {
    id: 'vhp-sports',
    channel: 'self',
    moduleId: 'vhm-sports',
    type: 'game',
    names: { zh: '赛事盘口', zhHant: '賽事盤口', en: 'Sports Board' },
    descriptions: { zh: '即时赔率与滚球盘', zhHant: '即時賠率與滾球盤', en: 'Live odds and in-play markets' },
    currencies: ['credit-cny', 'credit-usd'],
    languages: ['zh', 'zhHant', 'en'],
    miniProgram: 'sports',
    product: 'sports-board',
    suffix: '/vip-club/play/sports',
    jumpUrl: '',
    image: assetFrom('/images/vip-club/game-sports.png', 'game-sports.png'),
    listImage: assetFrom('/images/vip-club/game-sports.png', 'game-sports.png'),
    sort: 1,
    enabled: true,
  },
  {
    id: 'vhp-racing',
    channel: 'self',
    moduleId: 'vhm-lottery',
    type: 'game',
    names: { zh: '联盟赛车', zhHant: '聯盟賽車' },
    descriptions: { zh: '高频竞速彩种', zhHant: '高頻競速彩種' },
    currencies: ['credit-cny'],
    languages: ['zh', 'zhHant'],
    miniProgram: 'lottery',
    product: 'racing',
    suffix: '/vip-club/play/lottery/racing',
    jumpUrl: '',
    image: assetFrom('/images/vip-club/lottery/card-racing.png', 'card-racing.png'),
    listImage: assetFrom('/images/vip-club/game-lottery.png', 'game-lottery.png'),
    sort: 1,
    enabled: true,
  },
  {
    id: 'vhp-boat',
    channel: 'self',
    moduleId: 'vhm-lottery',
    type: 'game',
    names: { zh: '联盟飞艇', zhHant: '聯盟飛艇' },
    descriptions: { zh: '飞艇开奖玩法', zhHant: '飛艇開獎玩法' },
    currencies: ['credit-cny'],
    languages: ['zh', 'zhHant'],
    miniProgram: 'lottery',
    product: 'boat',
    suffix: '/vip-club/play/lottery/boat',
    jumpUrl: '',
    image: assetFrom('/images/vip-club/lottery/card-boat.png', 'card-boat.png'),
    listImage: assetFrom('/images/vip-club/game-lottery.png', 'game-lottery.png'),
    sort: 2,
    enabled: true,
  },
  {
    id: 'vhp-ssc',
    channel: 'self',
    moduleId: 'vhm-lottery',
    type: 'game',
    names: { zh: '联盟时时彩' },
    descriptions: { zh: '经典数字彩玩法' },
    currencies: ['credit-cny'],
    languages: ['zh'],
    miniProgram: 'lottery',
    product: 'ssc',
    suffix: '/vip-club/play/lottery/ssc',
    jumpUrl: '',
    image: assetFrom('/images/vip-club/lottery/card-ssc.png', 'card-ssc.png'),
    listImage: assetFrom('/images/vip-club/game-lottery.png', 'game-lottery.png'),
    sort: 3,
    enabled: true,
  },
  {
    id: 'vhp-db',
    channel: 'self',
    moduleId: 'vhm-live',
    type: 'game',
    names: { zh: 'DB 真人', zhHant: 'DB 真人' },
    descriptions: { zh: 'DB 真人荷官桌', zhHant: 'DB 真人荷官桌' },
    currencies: ['credit-cny', 'credit-usd'],
    languages: ['zh', 'zhHant'],
    miniProgram: 'live',
    product: 'db-live',
    suffix: '/vip-club/play/live/db-live',
    jumpUrl: '',
    image: assetFrom('/images/vip-club/vendors/db-logo.png', 'db-logo.png'),
    listImage: assetFrom('/images/vip-club/game-live.png', 'game-live.png'),
    sort: 1,
    enabled: true,
  },
  {
    id: 'vhp-pp',
    channel: 'self',
    moduleId: 'vhm-slot',
    type: 'game',
    names: { zh: 'PP 老虎机', zhHant: 'PP 老虎機' },
    descriptions: { zh: '热门电子老虎机', zhHant: '熱門電子老虎機' },
    currencies: ['credit-usd'],
    languages: ['zh', 'zhHant'],
    miniProgram: 'slot',
    product: 'pp',
    suffix: '/vip-club/play/slot/pp',
    jumpUrl: '',
    image: assetFrom('/images/vip-club/vendors/pp-logo.png', 'pp-logo.png'),
    listImage: assetFrom('/images/vip-club/game-slot.png', 'game-slot.png'),
    sort: 1,
    enabled: true,
  },
  {
    id: 'vhp-macau',
    channel: 'self',
    moduleId: 'vhm-hall',
    type: 'hall',
    names: { zh: '澳门赌厅', zhHant: '澳門賭廳', en: 'Macau Casino' },
    descriptions: { zh: '澳门线下赌厅预约', zhHant: '澳門線下賭廳預約', en: 'Macau casino booking' },
    currencies: ['credit-cny', 'credit-usd'],
    languages: ['zh', 'zhHant', 'en'],
    miniProgram: '',
    product: '',
    suffix: '',
    jumpUrl: '/vip-club/hall/macau',
    image: assetFrom('/images/vip-club/flag-macau.png', 'flag-macau.png'),
    listImage: assetFrom('/images/vip-club/game-hall.png', 'game-hall.png'),
    sort: 1,
    enabled: true,
  },
  {
    id: 'vhp-singapore',
    channel: 'self',
    moduleId: 'vhm-hall',
    type: 'hall',
    names: { zh: '新加坡赌厅', zhHant: '新加坡賭廳' },
    descriptions: { zh: '新加坡线下赌厅预约', zhHant: '新加坡線下賭廳預約' },
    currencies: ['credit-usd'],
    languages: ['zh', 'zhHant'],
    miniProgram: '',
    product: '',
    suffix: '',
    jumpUrl: '/vip-club/hall/singapore',
    image: assetFrom('/images/vip-club/flag-singapore.png', 'flag-singapore.png'),
    listImage: assetFrom('/images/vip-club/game-hall.png', 'game-hall.png'),
    sort: 2,
    enabled: true,
  },
]

export function productDisplayName(row: VipHallProductRow) {
  const customName = displayZhName(row.names)
  if (customName !== '-') return customName
  if (row.type === 'hall') return row.jumpUrl || '赌厅链接'
  return vipHallCatalogProductLabel(row.miniProgram, row.product) || '-'
}

export const vipHallModuleStore = ref(MOCK_VIP_HALL_MODULES.map(cloneModuleRow))
export const vipHallProductStore = ref(MOCK_VIP_HALL_PRODUCTS.map(cloneProductRow))
