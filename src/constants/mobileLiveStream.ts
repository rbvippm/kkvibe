/** 发现页 · 视频直播间 Mock（竖屏 Figma 1494:53973 / 横屏对标抖音） */

export type LiveStreamOrientation = 'portrait' | 'landscape'
/** 开播画面比例：原始=铺满不可切横屏；16:9/4:3=信箱展示且可切横屏全屏 */
export type LiveStreamVideoRatio = 'original' | '16:9' | '4:3'

export const LIVE_STREAM_ASSETS = {
  stage: '/images/live-stream/stage.png',
  giftIcon: '/images/live-stream/gift-icon.svg',
  giftThumb: '/images/live-stream/gift-thumb.svg',
  emoji: '/images/live-stream/icon-emoji.svg',
  more: '/images/live-stream/icon-more.svg',
  share: '/images/live-stream/share/icon-share.svg',
  close: '/images/live-stream/icon-close.svg',
  fire: '/images/live-stream/icon-fire.svg',
  shareSheet: {
    close: '/images/live-stream/share/icon-close.svg',
    forward: '/images/live-stream/share/icon-forward.svg',
    copy: '/images/live-stream/share/icon-copy.svg',
    clear: '/images/live-stream/share/icon-clear.svg',
    mute: '/images/live-stream/share/icon-mute.svg',
    muteOff: '/images/live-stream/share/icon-mute-off.svg',
    add: '/images/live-stream/share/icon-add.svg',
  },
  /** 横屏舞台封面复用发现页横图素材 */
  landscapeStages: [
    '/images/discover/cover-1.jpg',
    '/images/discover/cover-3.jpg',
    '/images/discover/cover-5.jpg',
    '/images/discover/cover-2.jpg',
    '/images/discover/cover-6.jpg',
  ] as const,
  avatars: [
    '/images/live-stream/avatar-1.jpg',
    '/images/live-stream/avatar-2.jpg',
    '/images/live-stream/avatar-3.jpg',
    '/images/live-stream/avatar-4.jpg',
  ] as const,
} as const

/** 直播间 · 分享/更多功能（Figma 52:20566 结构；去掉保存相册/收藏，增加复制链接/清屏/禁音） */
export type LiveShareFriend = {
  id: string
  name: string
  avatar: string
}

export type LiveShareActionKey = 'forward' | 'copy' | 'clear' | 'mute'

export type LiveShareAction = {
  key: LiveShareActionKey
  label: string
  icon: string
}

export const MOCK_LIVE_SHARE_FRIENDS: LiveShareFriend[] = [
  { id: 'sf1', name: '阿瓦', avatar: '/images/live-stream/share/friend-1.png' },
  { id: 'sf2', name: '阿杰', avatar: '/images/live-stream/share/friend-2.png' },
  { id: 'sf3', name: '无兄弟不足球', avatar: '/images/live-stream/share/friend-3.png' },
  { id: 'sf4', name: '小贝', avatar: '/images/live-stream/share/friend-4.png' },
]

/** 转发 · 选择会话 Mock */
export type LiveForwardSession = {
  id: string
  name: string
  avatar: string
  /** 群聊展示人数角标 */
  isGroup?: boolean
}

export const MOCK_LIVE_FORWARD_SESSIONS: LiveForwardSession[] = [
  {
    id: 'fs1',
    name: '无兄弟，不足球！',
    avatar: '/images/live-stream/share/friend-3.png',
    isGroup: true,
  },
  {
    id: 'fs2',
    name: '巅峰PK',
    avatar: '/images/live-stream/share/friend-1.png',
    isGroup: true,
  },
  {
    id: 'fs3',
    name: '疯狂世界杯',
    avatar: '/images/live-stream/share/friend-2.png',
    isGroup: true,
  },
  {
    id: 'fs4',
    name: 'Jimmy',
    avatar: '/images/live-stream/avatar-2.jpg',
  },
  {
    id: 'fs5',
    name: '阿杰',
    avatar: '/images/live-stream/share/friend-2.png',
  },
  {
    id: 'fs6',
    name: '小贝的粉丝群',
    avatar: '/images/live-stream/share/friend-4.png',
    isGroup: true,
  },
]

export const LIVE_SHARE_ACTIONS: LiveShareAction[] = [
  { key: 'forward', label: '转发', icon: LIVE_STREAM_ASSETS.shareSheet.forward },
  { key: 'copy', label: '复制链接', icon: LIVE_STREAM_ASSETS.shareSheet.copy },
  { key: 'clear', label: '清屏', icon: LIVE_STREAM_ASSETS.shareSheet.clear },
  { key: 'mute', label: '禁音', icon: LIVE_STREAM_ASSETS.shareSheet.mute },
]

export type LiveStreamGiftToast = {
  id: string
  user: string
  action: string
  count: string
  avatar: string
}

export type LiveStreamChatMsg =
  | { id: string; type: 'system'; text: string }
  | { id: string; type: 'enter'; user: string; text?: string }
  | { id: string; type: 'chat'; user: string; text: string }
  | { id: string; type: 'gift'; user: string; gift: string }

export type LiveStreamQuality = 'sd' | 'hd' | 'uhd'

export type LiveStreamRoom = {
  id: string
  hostName: string
  likeText: string
  heat: string
  viewerCount: string
  stage: string
  avatar: string
  followed: boolean
  topViewers: string[]
  gifts: LiveStreamGiftToast[]
  messages: LiveStreamChatMsg[]
  /** 默认开播方向（观众端观看态） */
  orientation: LiveStreamOrientation
  /** 画面比例（对齐开播设置：原始 / 16:9 / 4:3） */
  videoRatio: LiveStreamVideoRatio
  /** 场景标签：用于横屏角标 */
  sceneLabel?: string
  /** 默认清晰度 */
  quality?: LiveStreamQuality
  /** 标题（横屏顶栏展示） */
  roomTitle?: string
}

export const LIVE_STREAM_QUALITY_LABEL: Record<LiveStreamQuality, string> = {
  sd: '标清',
  hd: '高清',
  uhd: '蓝光',
}

export const MOCK_LIVE_STREAM_ROOM: LiveStreamRoom = {
  id: 'ls-demo',
  hostName: '主播昵称',
  likeText: '2.4万本场点赞',
  heat: '32.6W',
  viewerCount: '1.2w',
  stage: LIVE_STREAM_ASSETS.stage,
  avatar: LIVE_STREAM_ASSETS.avatars[0],
  followed: false,
  orientation: 'portrait',
  videoRatio: 'original',
  topViewers: [
    LIVE_STREAM_ASSETS.avatars[2],
    LIVE_STREAM_ASSETS.avatars[0],
    LIVE_STREAM_ASSETS.avatars[3],
  ],
  gifts: [
    {
      id: 'g1',
      user: '艾米酱',
      action: '送小心心',
      count: 'x15',
      avatar: LIVE_STREAM_ASSETS.avatars[0],
    },
    {
      id: 'g2',
      user: '别过来呀',
      action: '送跑车',
      count: 'x1',
      avatar: LIVE_STREAM_ASSETS.avatars[1],
    },
  ],
  messages: [
    {
      id: 'm0',
      type: 'system',
      text: '这里是进入直播间后，欢迎语，系统设置的，可以设置单个，可以设置多个',
    },
    { id: 'm1', type: 'enter', user: '春日暖阳', text: '给你点一个赞！' },
    {
      id: 'm2',
      type: 'chat',
      user: 'KK仔',
      text: '天津来的的主播今天素颜好美啊！！！',
    },
    { id: 'm3', type: 'gift', user: 'jerry酱', gift: '小心心 *15' },
    { id: 'm4', type: 'chat', user: '李小白', text: '主播今天素颜好美啊' },
    { id: 'm5', type: 'chat', user: '陈晨', text: '主播今天素颜好美啊' },
    {
      id: 'm6',
      type: 'chat',
      user: 'KK仔',
      text: '天津来的的主播今天素颜好美啊！！！',
    },
  ],
}

/** 可切横屏的直播间 Mock · 开播比例 16:9/4:3，竖屏信箱展示，横屏全屏仍保持比例 */
export const MOCK_LANDSCAPE_LIVE_ROOMS: LiveStreamRoom[] = [
  {
    id: 'ls-land-game',
    hostName: '小鹿开黑',
    roomTitle: '峡谷冲分局 · 缺辅助速来',
    likeText: '8.6万本场点赞',
    heat: '18.2W',
    viewerCount: '6.8w',
    stage: LIVE_STREAM_ASSETS.landscapeStages[0],
    avatar: LIVE_STREAM_ASSETS.avatars[0],
    followed: false,
    orientation: 'portrait',
    videoRatio: '16:9',
    sceneLabel: '游戏',
    quality: 'hd',
    topViewers: [
      LIVE_STREAM_ASSETS.avatars[1],
      LIVE_STREAM_ASSETS.avatars[2],
      LIVE_STREAM_ASSETS.avatars[3],
    ],
    gifts: [
      {
        id: 'lg1',
        user: '战神小鹿',
        action: '送火箭',
        count: 'x3',
        avatar: LIVE_STREAM_ASSETS.avatars[2],
      },
      {
        id: 'lg2',
        user: '阿狸开黑',
        action: '送小心心',
        count: 'x99',
        avatar: LIVE_STREAM_ASSETS.avatars[3],
      },
    ],
    messages: [
      {
        id: 'lm0',
        type: 'system',
        text: '横屏模式更适合观看对局画面，可随时切回竖屏',
      },
      { id: 'lm1', type: 'enter', user: '野王带飞', text: '来了来了，带飞！' },
      { id: 'lm2', type: 'chat', user: '中单法王', text: '这波团灭太稳了' },
      { id: 'lm3', type: 'gift', user: '粉色炮弹', gift: '火箭 *3' },
      { id: 'lm4', type: 'chat', user: '辅助稳住', text: '下路小心被抓，缩一波' },
      { id: 'lm5', type: 'chat', user: '打野哥', text: '主播视野好强，预判到位' },
      { id: 'lm6', type: 'chat', user: '观众甲', text: '横屏看团战清晰多了' },
    ],
  },
  {
    id: 'ls-land-esport',
    hostName: '阿哲解说',
    roomTitle: '春季赛决赛观战 · 实时解说',
    likeText: '12.1万本场点赞',
    heat: '42.0W',
    viewerCount: '15.3w',
    stage: LIVE_STREAM_ASSETS.landscapeStages[1],
    avatar: LIVE_STREAM_ASSETS.avatars[1],
    followed: false,
    orientation: 'portrait',
    videoRatio: '16:9',
    sceneLabel: '电竞',
    quality: 'uhd',
    topViewers: [
      LIVE_STREAM_ASSETS.avatars[0],
      LIVE_STREAM_ASSETS.avatars[3],
      LIVE_STREAM_ASSETS.avatars[2],
    ],
    gifts: [
      {
        id: 'le1',
        user: '粉色炮弹',
        action: '送应援灯牌',
        count: 'x20',
        avatar: LIVE_STREAM_ASSETS.avatars[0],
      },
      {
        id: 'le2',
        user: '蓝方冲鸭',
        action: '送嘉年华',
        count: 'x1',
        avatar: LIVE_STREAM_ASSETS.avatars[1],
      },
    ],
    messages: [
      { id: 'em0', type: 'system', text: '本场支持蓝光清晰度，流量消耗较大请注意' },
      { id: 'em1', type: 'enter', user: 'Lucky星', text: '决赛夜冲！' },
      { id: 'em2', type: 'chat', user: '解说老王', text: '这波龙坑视野交换值不值？' },
      { id: 'em3', type: 'chat', user: '粉色炮弹', text: '红方打野节奏太快了' },
      { id: 'em4', type: 'gift', user: '铁粉一号', gift: '应援灯牌 *20' },
      { id: 'em5', type: 'chat', user: '新人报到', text: '横屏看小地图舒服' },
      { id: 'em6', type: 'chat', user: '老铁666', text: '解说太准了，提前喊到击杀' },
    ],
  },
  {
    id: 'ls-land-outdoor',
    hostName: '路途少年',
    roomTitle: '川西自驾跟拍 · 晚霞延时',
    likeText: '3.2万本场点赞',
    heat: '5.6W',
    viewerCount: '2.1w',
    stage: LIVE_STREAM_ASSETS.landscapeStages[2],
    avatar: LIVE_STREAM_ASSETS.avatars[2],
    followed: false,
    orientation: 'portrait',
    videoRatio: '16:9',
    sceneLabel: '户外',
    quality: 'hd',
    topViewers: [
      LIVE_STREAM_ASSETS.avatars[3],
      LIVE_STREAM_ASSETS.avatars[0],
      LIVE_STREAM_ASSETS.avatars[1],
    ],
    gifts: [
      {
        id: 'lo1',
        user: '旅行日记',
        action: '送热气球',
        count: 'x2',
        avatar: LIVE_STREAM_ASSETS.avatars[3],
      },
      {
        id: 'lo2',
        user: '云端漫步',
        action: '送小心心',
        count: 'x66',
        avatar: LIVE_STREAM_ASSETS.avatars[0],
      },
    ],
    messages: [
      { id: 'om0', type: 'system', text: '户外直播信号可能波动，卡顿时请切换标清' },
      { id: 'om1', type: 'enter', user: '摄影师阿凯', text: '景色绝了' },
      { id: 'om2', type: 'chat', user: '驴友小夏', text: '这是不是折多山那边？' },
      { id: 'om3', type: 'chat', user: '画风绝了', text: '横屏构图好适合风景' },
      { id: 'om4', type: 'gift', user: '晚风吹', gift: '热气球 *2' },
      { id: 'om5', type: 'chat', user: '路过打卡', text: '求导航点，下次想去' },
      { id: 'om6', type: 'chat', user: '风景党', text: '晚霞要出来了，稳住别抖' },
    ],
  },
  {
    id: 'ls-land-music',
    hostName: '海盐乐队',
    roomTitle: 'LiveHouse 专场 · 不插电夜',
    likeText: '5.4万本场点赞',
    heat: '9.9W',
    viewerCount: '3.7w',
    stage: LIVE_STREAM_ASSETS.landscapeStages[3],
    avatar: LIVE_STREAM_ASSETS.avatars[3],
    followed: false,
    orientation: 'portrait',
    videoRatio: '4:3',
    sceneLabel: '演出',
    quality: 'uhd',
    topViewers: [
      LIVE_STREAM_ASSETS.avatars[1],
      LIVE_STREAM_ASSETS.avatars[0],
      LIVE_STREAM_ASSETS.avatars[2],
    ],
    gifts: [
      {
        id: 'lm1',
        user: '粉色炮弹',
        action: '送麦克风',
        count: 'x8',
        avatar: LIVE_STREAM_ASSETS.avatars[1],
      },
      {
        id: 'lm2',
        user: '安安安',
        action: '送应援棒',
        count: 'x50',
        avatar: LIVE_STREAM_ASSETS.avatars[2],
      },
    ],
    messages: [
      { id: 'mm0', type: 'system', text: '演出直播建议开启蓝光，享受现场空间感' },
      { id: 'mm1', type: 'enter', user: '乐迷小周', text: '第一排视角绝了' },
      { id: 'mm2', type: 'chat', user: '鼓手阿木', text: '这把吉他音色好干净' },
      { id: 'mm3', type: 'chat', user: '主唱粉', text: '下一首能不能点《成都》' },
      { id: 'mm4', type: 'gift', user: '铁粉一号', gift: '应援棒 *50' },
      { id: 'mm5', type: 'chat', user: '灯光师', text: '横屏看舞台灯光层次更清楚' },
      { id: 'mm6', type: 'chat', user: '麦克风侠', text: '和声太稳了，起鸡皮疙瘩' },
    ],
  },
  {
    id: 'ls-land-sport',
    hostName: '球场夜未眠',
    roomTitle: '欧冠焦点战 · 双语解说',
    likeText: '21.0万本场点赞',
    heat: '56.8W',
    viewerCount: '28.4w',
    stage: LIVE_STREAM_ASSETS.landscapeStages[4],
    avatar: LIVE_STREAM_ASSETS.avatars[0],
    followed: false,
    orientation: 'portrait',
    videoRatio: '16:9',
    sceneLabel: '体育',
    quality: 'hd',
    topViewers: [
      LIVE_STREAM_ASSETS.avatars[2],
      LIVE_STREAM_ASSETS.avatars[1],
      LIVE_STREAM_ASSETS.avatars[3],
    ],
    gifts: [
      {
        id: 'ls1',
        user: '球迷老张',
        action: '送足球',
        count: 'x11',
        avatar: LIVE_STREAM_ASSETS.avatars[2],
      },
      {
        id: 'ls2',
        user: '夜猫看球',
        action: '送奖杯',
        count: 'x1',
        avatar: LIVE_STREAM_ASSETS.avatars[3],
      },
    ],
    messages: [
      { id: 'sm0', type: 'system', text: '体育赛事推荐横屏观看，弹幕可关闭以免挡画面' },
      { id: 'sm1', type: 'enter', user: '中单法王', text: '开球了开球了' },
      { id: 'sm2', type: 'chat', user: '边锋冲刺', text: '这脚传中质量太高' },
      { id: 'sm3', type: 'chat', user: '门神本神', text: '守门员扑救神了！！' },
      { id: 'sm4', type: 'gift', user: '主唱粉', gift: '奖杯 *1' },
      { id: 'sm5', type: 'chat', user: '解说老王', text: '横屏看战术板区域更清楚' },
      { id: 'sm6', type: 'chat', user: '粉色炮弹', text: '加时赛要来了，稳住心态' },
    ],
  },
]

export function getLiveStreamRoomById(id: string): LiveStreamRoom | undefined {
  if (id === MOCK_LIVE_STREAM_ROOM.id) return MOCK_LIVE_STREAM_ROOM
  return MOCK_LANDSCAPE_LIVE_ROOMS.find((room) => room.id === id)
}

export function buildLiveStreamRoom(partial?: Partial<LiveStreamRoom>): LiveStreamRoom {
  const fromId = partial?.id ? getLiveStreamRoomById(partial.id) : undefined
  const base = fromId || MOCK_LIVE_STREAM_ROOM
  return {
    ...base,
    ...partial,
    id: partial?.id || base.id,
    orientation: partial?.orientation || base.orientation,
    videoRatio: partial?.videoRatio || base.videoRatio,
    gifts: partial?.gifts || base.gifts,
    messages: partial?.messages || base.messages,
    topViewers: partial?.topViewers || base.topViewers,
  }
}
