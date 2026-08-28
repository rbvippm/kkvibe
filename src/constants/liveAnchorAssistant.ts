/** PC 主播后台 · 直播助手 Mock */

export type AnchorCountryCode = {
  name: string
  value: string
  letter: string
}

/** 区号下拉：国名 + 区号，按拼音首字母分组（对齐金刚 PC 登录） */
export const ANCHOR_COUNTRY_CODES: AnchorCountryCode[] = [
  { name: '阿尔巴尼亚', value: '+355', letter: 'A' },
  { name: '阿尔及利亚', value: '+213', letter: 'A' },
  { name: '阿富汗', value: '+93', letter: 'A' },
  { name: '阿根廷', value: '+54', letter: 'A' },
  { name: '爱尔兰', value: '+353', letter: 'A' },
  { name: '埃及', value: '+20', letter: 'A' },
  { name: '埃塞俄比亚', value: '+251', letter: 'A' },
  { name: '澳大利亚', value: '+61', letter: 'A' },
  { name: '巴西', value: '+55', letter: 'B' },
  { name: '德国', value: '+49', letter: 'D' },
  { name: '俄罗斯', value: '+7', letter: 'E' },
  { name: '法国', value: '+33', letter: 'F' },
  { name: '菲律宾', value: '+63', letter: 'F' },
  { name: '韩国', value: '+82', letter: 'H' },
  { name: '加拿大', value: '+1', letter: 'J' },
  { name: '柬埔寨', value: '+855', letter: 'J' },
  { name: '老挝', value: '+856', letter: 'L' },
  { name: '马来西亚', value: '+60', letter: 'M' },
  { name: '美国', value: '+1', letter: 'M' },
  { name: '墨西哥', value: '+52', letter: 'M' },
  { name: '日本', value: '+81', letter: 'R' },
  { name: '瑞士', value: '+41', letter: 'R' },
  { name: '泰国', value: '+66', letter: 'T' },
  { name: '土耳其', value: '+90', letter: 'T' },
  { name: '新加坡', value: '+65', letter: 'X' },
  { name: '印度', value: '+91', letter: 'Y' },
  { name: '印度尼西亚', value: '+62', letter: 'Y' },
  { name: '英国', value: '+44', letter: 'Y' },
  { name: '意大利', value: '+39', letter: 'Y' },
  { name: '越南', value: '+84', letter: 'Y' },
  { name: '智利', value: '+56', letter: 'Z' },
  { name: '中国', value: '+86', letter: 'Z' },
  { name: '中国澳门', value: '+853', letter: 'Z' },
  { name: '中国台湾', value: '+886', letter: 'Z' },
  { name: '中国香港', value: '+852', letter: 'Z' },
]

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
  /** 对外展示的金刚号，供主播按号检索 */
  kingkongId: string
  nickname: string
  giftAmount: number
  online: boolean
  avatar: string
}

function assistantKingkongId(seq: number) {
  return String(86000000 + seq)
}

const ASSISTANT_AVATAR_POOL = [
  '/images/live-stream/avatar-1.jpg',
  '/images/live-stream/avatar-2.jpg',
  '/images/live-stream/avatar-3.jpg',
  '/images/live-stream/avatar-4.jpg',
  '/images/voice-room/avatar-a.jpg',
  '/images/voice-room/avatar-b.jpg',
  '/images/voice-room/avatar-c.jpg',
  '/images/voice-room/avatar-d.jpg',
  '/images/voice-room/avatar-e.jpg',
  '/images/live-stream/share/friend-1.png',
  '/images/live-stream/share/friend-2.png',
  '/images/live-stream/share/friend-3.png',
  '/images/live-stream/share/friend-4.png',
] as const

const ASSISTANT_HOST_AVATAR = '/images/live-stream/avatar-2.jpg'
const ASSISTANT_ADMIN_AVATAR = '/images/voice-room/avatar-e.jpg'

function hashAssistantAvatar(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  return ASSISTANT_AVATAR_POOL[hash % ASSISTANT_AVATAR_POOL.length]
}

export const ASSISTANT_GIFT_CURRENCY = 'KKC'

/** 在线列表按实际在线人数展示，每页 20 条 */
export const ONLINE_LIST_MOCK_COUNT = 268
export const ONLINE_LIST_PAGE_SIZE = 20

/** 本场点赞展示底数（未满 1 万显示整数） */
export const ASSISTANT_SESSION_LIKES = 2436

function formatScaledMetric(value: number) {
  if (value >= 10) return String(Math.round(value))
  return value.toFixed(1).replace(/\.0$/, '')
}

/**
 * 简体 / 繁体满 1 万显示「x.x万」；其他语言满 1000 显示「x.xk」。
 * 原型默认简体中文，多语言接入后再传 locale。
 */
export function formatAssistantMetric(value: number, locale = 'zh-CN') {
  const safe = Math.max(0, Math.round(value))
  const useWan = locale === 'zh-CN' || locale === 'zh-TW'
  if (useWan) {
    if (safe >= 10000) return `${formatScaledMetric(safe / 10000)}万`
    return String(safe)
  }
  if (safe >= 1000) return `${formatScaledMetric(safe / 1000)}k`
  return String(safe)
}

const RANK_HEAD: RankUser[] = [
  { id: 'u_aud_01', kingkongId: assistantKingkongId(1), nickname: '张敏', giftAmount: 3025, online: true, avatar: hashAssistantAvatar('u_aud_01') },
  { id: 'u_aud_02', kingkongId: assistantKingkongId(2), nickname: '王刚', giftAmount: 2115, online: true, avatar: hashAssistantAvatar('u_aud_02') },
  { id: 'u_aud_03', kingkongId: assistantKingkongId(3), nickname: '刘洋', giftAmount: 1869, online: true, avatar: hashAssistantAvatar('u_aud_03') },
  { id: 'u_aud_04', kingkongId: assistantKingkongId(4), nickname: '陈婷', giftAmount: 1600, online: true, avatar: hashAssistantAvatar('u_aud_04') },
  { id: 'u_aud_05', kingkongId: assistantKingkongId(5), nickname: '赵强', giftAmount: 1350, online: true, avatar: hashAssistantAvatar('u_aud_05') },
  { id: 'u_aud_06', kingkongId: assistantKingkongId(6), nickname: '张磊', giftAmount: 1150, online: true, avatar: hashAssistantAvatar('u_aud_06') },
  { id: 'u_aud_07', kingkongId: assistantKingkongId(7), nickname: '李娜', giftAmount: 900, online: true, avatar: hashAssistantAvatar('u_aud_07') },
  { id: 'u_aud_08', kingkongId: assistantKingkongId(8), nickname: '孙伟', giftAmount: 450, online: true, avatar: hashAssistantAvatar('u_aud_08') },
  { id: 'u_aud_09', kingkongId: assistantKingkongId(9), nickname: '周杰', giftAmount: 300, online: true, avatar: hashAssistantAvatar('u_aud_09') },
  { id: 'u_aud_10', kingkongId: assistantKingkongId(10), nickname: '李宇春', giftAmount: 250, online: true, avatar: hashAssistantAvatar('u_aud_10') },
]

const RANK_SURNAMES = ['林', '黄', '吴', '郑', '冯', '何', '高', '罗', '宋', '唐', '韩', '曹', '许', '邓', '萧']
const RANK_GIVENS = ['晓晓', '浩然', '雨桐', '子轩', '思琪', '俊杰', '婉清', '志远', '梦瑶', '天佑']

function buildRankUsers(): RankUser[] {
  const extra: RankUser[] = []
  for (let i = RANK_HEAD.length + 1; i <= ONLINE_LIST_MOCK_COUNT; i++) {
    extra.push({
      id: `u_aud_${String(i).padStart(3, '0')}`,
      kingkongId: assistantKingkongId(i),
      nickname: `${RANK_SURNAMES[i % RANK_SURNAMES.length]}${RANK_GIVENS[i % RANK_GIVENS.length]}${i}`,
      giftAmount: Math.max(0, 248 - i),
      online: true,
      avatar: hashAssistantAvatar(`u_aud_${String(i).padStart(3, '0')}`),
    })
  }
  return [...RANK_HEAD, ...extra]
}

/** 对齐移动端观众列表 Mock：贡献榜 + 在线观众，按实际人数展示 */
export const RANK_USERS: RankUser[] = buildRankUsers()

export function formatAssistantGiftAmount(value: number) {
  return value.toLocaleString('zh-CN')
}

export const GO_LIVE_GUIDE_LEAD =
  '开播说明仅供阅读。可先发直播预告让粉丝预约，也可不设时间直接开播。下列步骤帮助了解流程，不强制完成后才能操作。'

export const GO_LIVE_GUIDE_STEPS = [
  {
    title: '完成开播设置',
    desc: '点「开播设置」，选择直播分类与画面。语聊房保存后即可创建房间，无需推流。',
  },
  {
    title: '安排直播预告（可选）',
    desc: '点「预计开播」选择未来时间，主按钮变为「发布直播预告」；不设时间则直接开播。最多同时保留 5 场未开播预告，右上角「预告」可切换、编辑或删除。',
  },
  {
    title: '确认推流',
    desc: '视频 / 投屏需将推流地址填入 OBS「推流」设置，确认成功后再开播。语聊房跳过本步。',
  },
  {
    title: '开始直播',
    desc: '点主按钮开播。已关联预告会通知预约粉丝；也可在预告列表点「不使用预告，直接开播」，不消耗该场次。',
  },
] as const

export const GO_LIVE_GUIDE_TIPS = [
  '预告发布后会出现在社区直播列表，观众可预约。',
  '点「立即开播 (已关联预告)」会向预约粉丝推送开播通知。',
  '超时未播会标「已超时」，请及时开播或删除，避免占满 5 场名额。',
] as const

export const PUSH_STREAM = {
  server: 'rtmp://live-push.kkvibe.demo/live',
  key: 'stream_anchoruat01_8829103',
} as const

export const SHARE_LINK = 'https://m.kkvibe.demo/live/8829103'

export type LiveContentKind = 'none' | 'match' | 'game'

export const ASSISTANT_TOOLBOX = [{ key: 'games', label: '游戏中心' }] as const

export type AssistantChatKind = 'enter' | 'follow' | 'like' | 'liveGift' | 'chat' | 'voiceGift'

export type AssistantChatRole = 'user' | 'host' | 'superAdmin'

export type AssistantChatMsg = {
  id: string
  nickname: string
  userId: string
  kind: AssistantChatKind
  role?: AssistantChatRole
  text?: string
  target?: string
  targetUserId?: string
  giftName?: string
  giftCount?: number
}

export const ASSISTANT_SELF_ID = '3180664521199401'
export const ASSISTANT_SUPER_ADMIN_ID = 'sa_10001'

/** 同一用户在在线列表与弹幕中共用头像，方便主播核对合规 */
export function assistantAvatarOf(userId: string) {
  if (!userId) return ASSISTANT_AVATAR_POOL[0]
  if (userId === ASSISTANT_SELF_ID) return ASSISTANT_HOST_AVATAR
  if (userId === ASSISTANT_SUPER_ADMIN_ID) return ASSISTANT_ADMIN_AVATAR
  return hashAssistantAvatar(userId)
}

export function assistantChatRoleOf(msg: Pick<AssistantChatMsg, 'role' | 'userId'>): AssistantChatRole {
  if (msg.role === 'superAdmin' || msg.userId === ASSISTANT_SUPER_ADMIN_ID) return 'superAdmin'
  if (msg.role === 'host' || msg.userId === ASSISTANT_SELF_ID) return 'host'
  return 'user'
}

export function assistantChatRoleLabel(role: AssistantChatRole) {
  if (role === 'superAdmin') return '超管'
  if (role === 'host') return '主播'
  return null
}

export function isAssistantChatMuteDisabled(userId: string, role?: AssistantChatRole) {
  return assistantChatRoleOf({ userId, role }) !== 'user'
}

export function assistantChatKindLabel(kind: AssistantChatKind) {
  if (kind === 'enter') return '进场'
  if (kind === 'like') return '点赞'
  if (kind === 'follow') return '关注'
  if (kind === 'liveGift' || kind === 'voiceGift') return '礼物'
  return null
}

export type AssistantChatFilterKey = 'enter' | 'gift' | 'chat' | 'interact'

export const ASSISTANT_CHAT_FILTERS: {
  key: AssistantChatFilterKey
  label: string
  hint?: string
}[] = [
  { key: 'enter', label: '进场消息' },
  { key: 'gift', label: '礼物通知' },
  { key: 'chat', label: '用户发言' },
  { key: 'interact', label: '互动消息', hint: '用户点赞和关注' },
]

export function assistantChatFilterKey(kind: AssistantChatKind): AssistantChatFilterKey {
  if (kind === 'enter') return 'enter'
  if (kind === 'liveGift' || kind === 'voiceGift') return 'gift'
  if (kind === 'like' || kind === 'follow') return 'interact'
  return 'chat'
}

export const ASSISTANT_GIFT_ICON = '/images/live-stream/gift-icon.svg'

const ASSISTANT_GIFT_ICONS: Record<string, string> = {
  小心心: '/images/live-stream/gift-heart.svg',
  小星星: '/images/live-stream/gift-star.svg',
}

export function assistantGiftIconOf(giftName?: string) {
  if (giftName && ASSISTANT_GIFT_ICONS[giftName]) return ASSISTANT_GIFT_ICONS[giftName]
  return ASSISTANT_GIFT_ICON
}

export const MOCK_ASSISTANT_CHATS: AssistantChatMsg[] = [
  { id: 'c1', nickname: '夜色观星', userId: 'u10086', kind: 'enter' },
  { id: 'c2', nickname: '阿凯开播', userId: 'u10088', kind: 'follow' },
  { id: 'c3', nickname: '三1放', userId: 'u10089', kind: 'like' },
  { id: 'c4', nickname: '艾米粒', userId: 'u10090', kind: 'liveGift', giftName: '小心心', giftCount: 1 },
  { id: 'c5', nickname: '夜色观星', userId: 'u10086', kind: 'chat', text: '主播好，刚进来' },
  {
    id: 'c5b',
    nickname: '官方巡管',
    userId: ASSISTANT_SUPER_ADMIN_ID,
    role: 'superAdmin',
    kind: 'chat',
    text: '本场已开启官方巡查，请文明互动',
  },
  {
    id: 'c5c',
    nickname: '我',
    userId: ASSISTANT_SELF_ID,
    role: 'host',
    kind: 'chat',
    text: '欢迎新来的宝宝，扣1看奔驰宝马讲解',
  },
  { id: 'c6', nickname: '三1放', userId: 'u10089', kind: 'chat', text: '去打PK，我们给你刷礼物，让你火起来' },
  { id: 'c7', nickname: '阿凯开播', userId: 'u10088', kind: 'chat', text: '求讲解一波奔驰宝马' },
  {
    id: 'c8',
    nickname: '艾米粒',
    userId: 'u10090',
    kind: 'voiceGift',
    target: '小夜不困',
    targetUserId: 'u10087',
    giftName: '小星星',
    giftCount: 15,
  },
  {
    id: 'c9',
    nickname: '艾米力',
    userId: 'u10091',
    kind: 'voiceGift',
    target: '全部嘉宾',
    giftName: '小星星',
    giftCount: 15,
  },
]

export const ASSISTANT_CHAT_EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '😘',
  '😜',
  '🤔',
  '😅',
  '😭',
  '😤',
  '😱',
  '😴',
  '👍',
  '👎',
  '👏',
  '🙏',
  '💪',
  '🔥',
  '❤️',
  '💕',
  '🎉',
  '🎁',
  '🌹',
  '⭐',
  '✨',
  '💯',
  '👌',
  '🤝',
] as const

export function formatAssistantChatLine(msg: AssistantChatMsg) {
  if (msg.kind === 'enter') return `${msg.nickname}：进入直播间`
  if (msg.kind === 'follow') return `${msg.nickname}：关注了您～`
  if (msg.kind === 'like') return `${msg.nickname}：已为您点赞～`
  if (msg.kind === 'liveGift') return `${msg.nickname}：送出${msg.giftName} x${msg.giftCount}`
  if (msg.kind === 'voiceGift') return `${msg.nickname} 送给 ${msg.target} ${msg.giftName} x${msg.giftCount}`
  return `${msg.nickname}：${msg.text ?? ''}`
}
