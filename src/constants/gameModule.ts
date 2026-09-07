/** 小程序管理 · 通用模块管理 · Mock（独立副本，不与贵宾厅 / 直播产品共用） */

import { ref } from 'vue'
import { ANCHOR_CHANNELS, findAnchorChannel } from './liveAnchorMetric'

export type GameModuleLang = 'zh' | 'zhHant' | 'en' | 'th' | 'vi'
export type GameModuleCurrency = 'usdt-tron' | 'kkc' | 'kkv' | 'xcoin'
export type GameModuleI18nMap = Partial<Record<GameModuleLang, string>>

export type GameModuleRow = {
  id: string
  channelIds: string[]
  iconUrl: string
  iconFileName: string
  currencies: GameModuleCurrency[]
  languages: GameModuleLang[]
  names: GameModuleI18nMap
  sort: number
  enabled: boolean
}

export const GAME_MODULE_CHANNEL_OPTIONS = ANCHOR_CHANNELS.map((item) => ({
  value: item.id,
  label: item.name,
}))

export const GAME_MODULE_CURRENCY_OPTIONS: { value: GameModuleCurrency; label: string }[] = [
  { value: 'usdt-tron', label: 'USDT-TRON' },
  { value: 'kkc', label: 'KKC' },
  { value: 'kkv', label: 'KKV' },
  { value: 'xcoin', label: 'X币' },
]

export const GAME_MODULE_LANG_OPTIONS: { value: GameModuleLang; label: string }[] = [
  { value: 'zh', label: '简体中文' },
  { value: 'zhHant', label: '繁体中文' },
  { value: 'en', label: '英文' },
  { value: 'th', label: '泰语' },
  { value: 'vi', label: '越南语' },
]

export function gameModuleChannelLabel(id: string) {
  return findAnchorChannel(id)?.name ?? id
}

export function gameModuleChannelLabels(ids: string[]) {
  return ids.map(gameModuleChannelLabel)
}

export function gameModuleCurrencyLabel(value: GameModuleCurrency) {
  return GAME_MODULE_CURRENCY_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function gameModuleLangLabel(value: GameModuleLang) {
  return GAME_MODULE_LANG_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function gameModuleName(row: GameModuleRow, lang: GameModuleLang) {
  return row.names[lang]?.trim() || '—'
}

export function gameModuleDisplayName(row: GameModuleRow) {
  return (
    row.names.zh?.trim() ||
    row.names.zhHant?.trim() ||
    row.names.en?.trim() ||
    row.names.th?.trim() ||
    row.names.vi?.trim() ||
    '未命名模块'
  )
}

/** 模拟服务端生成模块 ID，以 M 开头且唯一 */
export function createGameModuleId() {
  const nums = gameModuleStore.value
    .map((row) => Number(/^M(\d+)$/.exec(row.id)?.[1]))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 10000) + 1
  return `M${next}`
}

export function createEmptyGameModule(sort = 0): GameModuleRow {
  return {
    id: '',
    channelIds: [],
    iconUrl: '',
    iconFileName: '',
    currencies: ['usdt-tron'],
    languages: ['zh'],
    names: { zh: '' },
    sort,
    enabled: false,
  }
}

export function cloneGameModule(row: GameModuleRow): GameModuleRow {
  return {
    ...row,
    channelIds: [...row.channelIds],
    currencies: [...row.currencies],
    languages: [...row.languages],
    names: { ...row.names },
  }
}

export const gameModuleStore = ref<GameModuleRow[]>([
  {
    id: 'M10001',
    channelIds: ['self'],
    iconUrl: '/images/lobby/game-niuniu.svg',
    iconFileName: 'game-niuniu.svg',
    currencies: ['usdt-tron', 'kkc', 'kkv'],
    languages: ['zh', 'zhHant', 'en', 'th', 'vi'],
    names: {
      zh: '热门',
      zhHant: '熱門',
      en: 'Hot',
      th: 'ยอดนิยม',
      vi: 'Nổi bật',
    },
    sort: 0,
    enabled: true,
  },
  {
    id: 'M10002',
    channelIds: ['self', 'kk'],
    iconUrl: '/images/lobby/game-kuai3.svg',
    iconFileName: 'game-kuai3.svg',
    currencies: ['usdt-tron', 'kkc'],
    languages: ['zh', 'zhHant', 'en', 'th', 'vi'],
    names: {
      zh: '刮刮乐',
      zhHant: '刮刮樂',
      en: 'Scratch',
      th: 'ขูดรางวัล',
      vi: 'Cào thưởng',
    },
    sort: 0,
    enabled: true,
  },
  {
    id: 'M10003',
    channelIds: ['self', 'goodworld', 'sea'],
    iconUrl: '/images/lobby/game-pk-2.svg',
    iconFileName: 'game-pk-2.svg',
    currencies: ['usdt-tron', 'kkc', 'kkv', 'xcoin'],
    languages: ['zh', 'zhHant', 'en', 'th', 'vi'],
    names: {
      zh: 'STG-趣投',
      zhHant: 'STG-趣投繁體',
      en: 'STG Fun Bet',
      th: 'STG เดิมพันสนุก',
      vi: 'STG Cá cược vui',
    },
    sort: 0,
    enabled: true,
  },
  {
    id: 'M10004',
    channelIds: ['self'],
    iconUrl: '/images/vip-club/game-lottery.png',
    iconFileName: 'game-lottery.png',
    currencies: ['kkc', 'kkv'],
    languages: ['zh', 'zhHant', 'en', 'th'],
    names: {
      zh: 'STG-捕鱼',
      zhHant: 'STG-捕魚',
      en: 'STG Fishing',
      th: 'STG ยิงปลา',
      vi: '',
    },
    sort: 0,
    enabled: true,
  },
  {
    id: 'M10005',
    channelIds: ['self', 'vn', 'th'],
    iconUrl: '/images/vip-club/sports/cats/soccer.png',
    iconFileName: 'soccer.png',
    currencies: ['usdt-tron', 'kkc'],
    languages: ['zh', 'en', 'th', 'vi'],
    names: {
      zh: 'STG-体育',
      zhHant: '',
      en: 'STG Sports',
      th: 'STG กีฬา',
      vi: 'STG Thể thao',
    },
    sort: 0,
    enabled: true,
  },
  {
    id: 'M10006',
    channelIds: ['self'],
    iconUrl: '/images/community/group-lottery.svg',
    iconFileName: 'group-lottery.svg',
    currencies: ['kkc', 'kkv', 'xcoin'],
    languages: ['zh', 'zhHant', 'en', 'th', 'vi'],
    names: {
      zh: 'STG-棋牌',
      zhHant: 'STG-棋牌',
      en: 'STG Cards',
      th: 'STG ไพ่',
      vi: 'STG Cờ bài',
    },
    sort: 0,
    enabled: true,
  },
])
