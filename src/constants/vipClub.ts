/** 大厅 · 贵宾会 Mock 与静态资源 */

export const VIP_CLUB_ASSETS = {
  entry: '/images/vip-club/entry.png',
  logo: '/images/vip-club/kk-logo.png',
  logoMark: '/images/vip-club/logo-mark.png',
  chair: '/images/vip-club/official-chair.png',
  heroArt: '/images/vip-club/hero-art.png',
  arrowRight: '/images/vip-club/icon-arrow-right.svg',
  currency: '/images/vip-club/icon-currency.svg',
  currencyUsd: '/images/vip-club/icon-currency-usd.svg',
  chevronDown: '/images/vip-club/icon-chevron-down.svg',
  history: '/images/vip-club/icon-mine-bet.png',
  close: '/images/vip-club/vendors/close.svg',
  collapseTab: '/images/vip-club/icon-collapse-tab.svg',
  menu: '/images/vip-club/icon-menu.svg',
} as const

export function vipClubCreditCurrencyIcon(id: string) {
  return id === 'usd' ? VIP_CLUB_ASSETS.currencyUsd : VIP_CLUB_ASSETS.currency
}

export const VIP_CLUB_LOTTERY_ASSETS = {
  logo: '/images/vip-club/lottery/logo.svg',
  usdt: '/images/vip-club/lottery/usdt.svg',
  banner: '/images/vip-club/lottery/banner-raw.png',
  marquee: '/images/vip-club/lottery/marquee.png',
  unionIcon: '/images/vip-club/lottery/icon-union.svg',
} as const

export const VIP_CLUB_SPORTS_ASSETS = {
  logo: '/images/vip-club/sports/logo.png',
  menu: '/images/vip-club/sports/menu.svg',
  refresh: '/images/vip-club/sports/refresh.svg',
  matchCard: '/images/vip-club/sports/match-card.png',
  iconSort: '/images/vip-club/sports/icon-sort.svg',
  iconFilter: '/images/vip-club/sports/icon-filter.svg',
  iconCollapse: '/images/vip-club/sports/icon-collapse.svg',
  navHome: '/images/vip-club/sports/nav-home.svg',
  navOrder: '/images/vip-club/sports/nav-order.svg',
  navUnsettle: '/images/vip-club/sports/nav-unsettle.svg',
  navSettled: '/images/vip-club/sports/nav-settled.svg',
  navResult: '/images/vip-club/sports/nav-result.svg',
} as const

export const VIP_CLUB_HALL_ASSETS = {
  sofa: '/images/vip-club/hall/icon-sofa.png',
  bell: '/images/vip-club/hall/icon-bell.png',
  crown: '/images/vip-club/hall/icon-crown.png',
  vipGroup: '/images/vip-club/hall/vip-group-btn.png',
  back: '/images/vip-club/hall/icon-back.svg',
  age: '/images/vip-club/hall/icon-18.svg',
  wynn: '/images/vip-club/hall/wynn-logo.svg',
} as const

export type VipClubGameKey = 'sports' | 'lottery' | 'live' | 'slot' | 'hall'
export type VipClubGameAction = 'sports' | 'lottery' | 'vendor' | 'hall'
export type VipClubVendorKind = 'live' | 'slot'

export const VIP_CLUB_GAMES: {
  key: VipClubGameKey
  title: string
  desc: string
  cover: string
  action: VipClubGameAction
}[] = [
  {
    key: 'sports',
    title: '金刚体育',
    desc: '热血开赛，胜负由你主宰',
    cover: '/images/vip-club/game-sports.png',
    action: 'sports',
  },
  {
    key: 'lottery',
    title: '皇者彩票',
    desc: '每期开奖，皆是好运降临',
    cover: '/images/vip-club/game-lottery.png',
    action: 'lottery',
  },
  {
    key: 'live',
    title: '真人',
    desc: '零距离博弈现场',
    cover: '/images/vip-club/game-live.png',
    action: 'vendor',
  },
  {
    key: 'slot',
    title: '老虎机',
    desc: '极速爆分',
    cover: '/images/vip-club/game-slot.png',
    action: 'vendor',
  },
  {
    key: 'hall',
    title: '赌厅服务',
    desc: '尊贵礼遇，非凡体验',
    cover: '/images/vip-club/game-hall.png',
    action: 'hall',
  },
]

export type VipClubLotteryGame = {
  id: string
  title: string
  desc: string
  cover: string
  comingSoon?: boolean
}

export const VIP_CLUB_LOTTERY_GAMES: VipClubLotteryGame[] = [
  { id: 'racing', title: '联盟赛车', desc: '75秒1期', cover: '/images/vip-club/lottery/card-racing.png' },
  { id: 'boat', title: '联盟飞艇', desc: '75秒1期', cover: '/images/vip-club/lottery/card-boat.png' },
  { id: 'ssc', title: '联盟时时彩', desc: '75秒1期', cover: '/images/vip-club/lottery/card-ssc.png' },
  { id: '11x5', title: '联盟十一选五', desc: '75秒1期', cover: '/images/vip-club/lottery/card-11x5.png' },
  { id: 'happy10', title: '联盟快乐十分', desc: '75秒1期', cover: '/images/vip-club/lottery/card-happy10.png' },
  { id: 'k3', title: '联盟快三', desc: '75秒1期', cover: '/images/vip-club/lottery/card-k3.png' },
  { id: 'mark6', title: '联盟六合彩', desc: '5分钟1期', cover: '/images/vip-club/lottery/card-mark6.png' },
  { id: 'soon', title: '敬请期待', desc: '', cover: '/images/vip-club/lottery/card-soon.png', comingSoon: true },
]

export type VipClubVendor = {
  id: string
  logo: string
  title: string
  desc: string
}

export const VIP_CLUB_LIVE_VENDORS: VipClubVendor[] = [
  { id: 'db-live', logo: '/images/vip-club/vendors/db-logo.png', title: 'DB 真人', desc: '尊贵礼遇，非凡体验' },
  { id: 'pa-live', logo: '/images/vip-club/vendors/pa-logo.png', title: 'PA 真人', desc: '尊贵礼遇，非凡体验' },
  { id: 'huali-live', logo: '/images/vip-club/vendors/huali-logo.png', title: '华丽高真人', desc: '尊贵礼遇，非凡体验' },
]

export const VIP_CLUB_SLOT_VENDORS: VipClubVendor[] = [
  { id: 'pp', logo: '/images/vip-club/vendors/pp-logo.png', title: 'PP 老虎机', desc: '极速爆分，转速狂飙' },
  { id: 'pg', logo: '/images/vip-club/vendors/pg-logo.png', title: 'PG 老虎机', desc: '极速爆分，转速狂飙' },
]

export const VIP_CLUB_SPORTS_TABS = [
  { id: 'inplay', label: '滚球', count: 233 },
  { id: 'today', label: '今日', count: 233 },
  { id: 'early', label: '早盘', count: 233 },
  { id: 'parlay', label: '串关', count: 133 },
  { id: 'follow', label: '关注', count: 66 },
] as const

export const VIP_CLUB_SPORTS_NAV = [
  { id: 'home', label: '首页', icon: VIP_CLUB_SPORTS_ASSETS.navHome, badge: 0 },
  { id: 'order', label: '订单', icon: VIP_CLUB_SPORTS_ASSETS.navOrder, badge: 0 },
  { id: 'unsettle', label: '未结算', icon: VIP_CLUB_SPORTS_ASSETS.navUnsettle, badge: 6 },
  { id: 'settled', label: '已结算', icon: VIP_CLUB_SPORTS_ASSETS.navSettled, badge: 6 },
  { id: 'result', label: '赛果', icon: VIP_CLUB_SPORTS_ASSETS.navResult, badge: 0 },
] as const

export const VIP_CLUB_SPORTS_CATS = [
  { id: 'soccer', label: '足球', count: 425, icon: '/images/vip-club/sports/cats/soccer.png' },
  { id: 'basketball', label: '篮球', count: 425, icon: '/images/vip-club/sports/cats/basketball.png' },
  { id: 'tennis', label: '网球', count: 425, icon: '/images/vip-club/sports/cats/tennis.png' },
  { id: 'volleyball', label: '排球', count: 425, icon: '/images/vip-club/sports/cats/volleyball.png' },
  { id: 'pingpong', label: '乒乓球', count: 425, icon: '/images/vip-club/sports/cats/pingpong.png' },
  { id: 'badminton', label: '羽毛球', count: 425, icon: '/images/vip-club/sports/cats/badminton.png' },
  { id: 'snooker', label: '斯诺克', count: 425, icon: '/images/vip-club/sports/cats/snooker.png' },
  { id: 'icehockey', label: '冰球', count: 425, icon: '/images/vip-club/sports/cats/icehockey.png' },
  { id: 'baseball', label: '棒球', count: 425, icon: '/images/vip-club/sports/cats/baseball.png' },
  { id: 'american', label: '美式足球', count: 425, icon: '/images/vip-club/sports/cats/american.png' },
  { id: 'virtual-soccer', label: '虚拟足球', count: 425, icon: '/images/vip-club/sports/cats/soccer.png' },
  { id: 'virtual-basketball', label: '虚拟篮球', count: 425, icon: '/images/vip-club/sports/cats/basketball.png' },
] as const

export function getVipClubVendors(kind: VipClubVendorKind) {
  return kind === 'live' ? VIP_CLUB_LIVE_VENDORS : VIP_CLUB_SLOT_VENDORS
}

export function getVipClubLotteryGame(id: string | undefined) {
  return VIP_CLUB_LOTTERY_GAMES.find((item) => item.id === id) ?? null
}

export function getVipClubVendor(kind: string, id: string | undefined) {
  if (kind !== 'live' && kind !== 'slot') return null
  return getVipClubVendors(kind).find((item) => item.id === id) ?? null
}

export type VipClubHallId = 'macau' | 'singapore' | 'vietnam' | 'malaysia' | 'philippines'

export type VipClubHallFeature = {
  icon: 'sofa' | 'bell' | 'crown'
  label: string
}

export type VipClubHall = {
  id: VipClubHallId
  pickerTitle: string
  pickerDesc: string
  pageTitle: string
  heroTitle: string
  brandName: string
  flag: string
  hero: string
  hotel?: string
  cover?: string
  features: VipClubHallFeature[]
}

export const VIP_CLUB_HALLS: VipClubHall[] = [
  {
    id: 'macau',
    pickerTitle: '澳门赌厅',
    pickerDesc: '尊贵礼遇，非凡体验',
    pageTitle: '澳门贵宾厅介绍',
    heroTitle: '澳门贵宾厅服务',
    brandName: '永利澳门',
    flag: '/images/vip-club/flag-macau.png',
    hero: '/images/vip-club/hall/macau-hero.png',
    hotel: '/images/vip-club/hall/macau-hotel.png',
    cover: '/images/vip-club/game-hall.png',
    features: [
      { icon: 'sofa', label: '私密包厢' },
      { icon: 'bell', label: '专属礼宾' },
      { icon: 'crown', label: '高端娱乐体验' },
      { icon: 'sofa', label: '酒店接送' },
      { icon: 'crown', label: '贵宾礼遇' },
    ],
  },
  {
    id: 'singapore',
    pickerTitle: '新加坡赌厅',
    pickerDesc: '尊贵礼遇，非凡体验',
    pageTitle: '新加坡贵宾厅介绍',
    heroTitle: '贵宾尊享服务',
    brandName: '滨海湾金沙',
    flag: '/images/vip-club/flag-singapore.png',
    hero: '/images/vip-club/hall/singapore-hero.png',
    features: [
      { icon: 'bell', label: '国际礼宾' },
      { icon: 'sofa', label: '综合度假' },
      { icon: 'crown', label: '高端娱乐体验' },
      { icon: 'sofa', label: '多元游戏' },
      { icon: 'crown', label: '会员权益' },
    ],
  },
  {
    id: 'vietnam',
    pickerTitle: '越南贵宾厅',
    pickerDesc: '尊贵礼遇，非凡体验',
    pageTitle: '越南贵宾厅介绍',
    heroTitle: '贵宾专属体验',
    brandName: 'King Kong',
    flag: '/images/vip-club/flag-vietnam.png',
    hero: '/images/vip-club/hall/vietnam-hero.png',
    features: [
      { icon: 'sofa', label: '私密包厢' },
      { icon: 'sofa', label: '综合度假' },
      { icon: 'crown', label: '高端娱乐体验' },
      { icon: 'bell', label: '安全秩序' },
      { icon: 'crown', label: '酒吧夜生活' },
    ],
  },
  {
    id: 'malaysia',
    pickerTitle: '马来西亚赌厅',
    pickerDesc: '尊贵礼遇，非凡体验',
    pageTitle: '马来西亚贵宾厅介绍',
    heroTitle: '臻享贵宾之旅',
    brandName: '云顶高原',
    flag: '/images/vip-club/flag-malaysia.png',
    hero: '/images/vip-club/hall/malaysia-hero.png',
    features: [
      { icon: 'crown', label: '云顶高原' },
      { icon: 'sofa', label: '综合度假' },
      { icon: 'crown', label: '高端娱乐体验' },
      { icon: 'sofa', label: '滨艺休闲' },
      { icon: 'crown', label: '会员权益' },
    ],
  },
  {
    id: 'philippines',
    pickerTitle: '菲律宾赌厅',
    pickerDesc: '尊贵礼遇，非凡体验',
    pageTitle: '菲律宾贵宾厅介绍',
    heroTitle: '贵宾非凡体验',
    brandName: 'King Kong',
    flag: '/images/vip-club/flag-philippines.png',
    hero: '/images/vip-club/hall/philippines-hero.png',
    features: [
      { icon: 'sofa', label: '私密包厢' },
      { icon: 'sofa', label: '综合度假' },
      { icon: 'crown', label: '高端娱乐体验' },
      { icon: 'bell', label: '安全秩序' },
      { icon: 'crown', label: '酒吧夜生活' },
    ],
  },
]

export function getVipClubHall(id: string | undefined) {
  return VIP_CLUB_HALLS.find((item) => item.id === id) ?? null
}
