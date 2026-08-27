/** PC 主播后台 · 直播助手 Mock */

export const ANCHOR_LOGIN_SLIDES = [
  { title: '主播', desc: '开播、互动与房间经营，一站完成。' },
  { title: '代理', desc: '团队与佣金协同，服务主播成长。' },
  { title: '公会', desc: '公会运营与主播管理入口。' },
] as const

export const ANCHOR_COUNTRY_CODES = [
  { label: '中国 +86', value: '+86' },
  { label: '香港 +852', value: '+852' },
  { label: '澳门 +853', value: '+853' },
  { label: '台湾 +886', value: '+886' },
  { label: '新加坡 +65', value: '+65' },
  { label: '马来西亚 +60', value: '+60' },
  { label: '泰国 +66', value: '+66' },
  { label: '越南 +84', value: '+84' },
  { label: '日本 +81', value: '+81' },
  { label: '韩国 +82', value: '+82' },
  { label: '美国 +1', value: '+1' },
] as const

export const ANCHOR_TITLE_LANGS = [
  { key: 'cn', label: '简体中文' },
  { key: 'tw', label: '繁體中文' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本' },
  { key: 'ko', label: '한국인' },
  { key: 'es', label: 'español' },
  { key: 'pt', label: 'Português' },
  { key: 'th', label: 'ไทย' },
  { key: 'vn', label: 'Tiếng Việt' },
  { key: 'hi', label: 'हिंदी' },
] as const

export const LIVE_CATEGORIES = ['足球', '篮球', '高清', '赛集', '写真', '游戏', '棒球', '活动', '综合'] as const
export const LIVE_TAGS = ['真人', '电竞', '电子', '棋牌', '老虎机'] as const

export const PLAY_RESOLUTIONS = [
  { label: '828x1792 (iphone xr)', w: 828, h: 1792 },
  { label: '1125x2436 (iphone xs)', w: 1125, h: 2436 },
  { label: '1284x2778 (iphone 12pro max)', w: 1284, h: 2778 },
  { label: '1290x2796 (iphone 14pro max)', w: 1290, h: 2796 },
  { label: '720x1280 (Oppo A57)', w: 720, h: 1280 },
  { label: '1080x1920 (Samsung Galaxy S5)', w: 1080, h: 1920 },
  { label: '1440x2560 (Samsung Galaxy Note 5)', w: 1440, h: 2560 },
  { label: '自定义', w: 720, h: 1280 },
] as const

export type RankUser = {
  id: string
  nickname: string
  giftAmount: number
  online: boolean
}

export const RANK_USERS: RankUser[] = [
  { id: 'u10086', nickname: '夜色观星', giftAmount: 880, online: true },
  { id: 'u10087', nickname: '小夜不困', giftAmount: 420, online: true },
  { id: 'u10088', nickname: '阿凯开播', giftAmount: 80, online: false },
]

export const GO_LIVE_GUIDE_STEPS = [
  '请先点击「开播设置」，选择您的直播类型。',
  '获取推流地址后，使用 OBS 确定推流成功。',
  '再点击「开始直播」。',
] as const

export const PUSH_STREAM = {
  server: 'rtmp://live-push.kkvibe.demo/live',
  key: 'stream_anchoruat01_8829103',
} as const

export const SHARE_LINK = 'https://m.kkvibe.demo/live/8829103'

export type LiveContentKind = 'none' | 'match' | 'game'
