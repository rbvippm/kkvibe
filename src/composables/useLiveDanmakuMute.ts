import { computed, ref } from 'vue'

export type MuteSource = '主播' | '运营'

export type MuteType = '房间禁言' | '全局禁言'

/** 弹幕发送方身份：主播 / 超管消息不可禁言（交互同系统消息） */
export type DanmakuSenderRole = 'user' | 'host' | 'superAdmin'

export type DanmakuMessage = {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  sentAt: string
  isSystem?: boolean
  /** 缺省按普通用户；主播也可由 userId === 当前房主判定 */
  senderRole?: DanmakuSenderRole
}

export type MuteRecord = {
  id: string
  recordNo: string
  userId: string
  username: string
  roomId: string
  hostName: string
  hostId: string
  sessionId: string
  muteSource: MuteSource
  muteType: MuteType
  mutedAt: string
  unmutedAt: string
  operator: string
  operatorId: string
  muted: boolean
  reason: string
  danmakuContent: string
  danmakuSentAt: string
}

const CURRENT_ROOM = {
  id: 'live_8829103',
  name: 'EZ 的直播间',
  hostName: 'EZ',
  hostId: '3180664521199401',
  sessionId: 'sess_live_20260609_8829103',
}

/** 是否禁止对该弹幕发起禁言（系统 / 主播 / 超管） */
export function isDanmakuMuteDisabled(message: DanmakuMessage, hostId = CURRENT_ROOM.hostId) {
  if (message.isSystem) return true
  if (message.senderRole === 'host' || message.senderRole === 'superAdmin') return true
  if (message.userId === hostId) return true
  return false
}

/** 操作菜单身份标签：系统 / 主播 / 超管；普通用户无标签 */
export function danmakuSenderRoleLabel(message: DanmakuMessage, hostId = CURRENT_ROOM.hostId) {
  if (message.isSystem) return '系统'
  if (message.senderRole === 'superAdmin') return '超管'
  if (message.senderRole === 'host' || message.userId === hostId) return '主播'
  return null
}

const danmakuMessages = ref<DanmakuMessage[]>([
  {
    id: 'dm1',
    userId: '3180664521199401',
    username: 'EZ',
    avatar: 'E',
    content: '进入直播间',
    sentAt: '2026/6/9 16:57:14',
    isSystem: true,
  },
  {
    id: 'dm2',
    userId: '3180664521199401',
    username: 'EZ',
    avatar: 'E',
    content: '1',
    sentAt: '2026/6/9 16:57:20',
    senderRole: 'host',
  },
  {
    id: 'dm3',
    userId: '3180664521199401',
    username: 'EZ',
    avatar: 'E',
    content: '2',
    sentAt: '2026/6/9 16:57:22',
    senderRole: 'host',
  },
  {
    id: 'dm4',
    userId: '3180664521199401',
    username: 'EZ',
    avatar: 'E',
    content: '3',
    sentAt: '2026/6/9 16:57:25',
    senderRole: 'host',
  },
  {
    id: 'dm5',
    userId: '3180664521199402',
    username: '小旋风',
    avatar: '小',
    content: '主播加油！',
    sentAt: '2026/6/9 16:58:01',
  },
  {
    id: 'dm6',
    userId: '3180664521199403',
    username: 'dx01',
    avatar: 'D',
    content: '666',
    sentAt: '2026/6/9 16:58:15',
  },
  {
    id: 'dm7',
    userId: '9000000000000001',
    username: '超管小王',
    avatar: '超',
    content: '请文明发言，违规将被禁言',
    sentAt: '2026/6/9 16:58:40',
    senderRole: 'superAdmin',
  },
])

const muteRecords = ref<MuteRecord[]>([
  {
    id: 'mute1',
    recordNo: 'MU20260608142001',
    userId: '3180664521199404',
    username: 'spam_user',
    roomId: CURRENT_ROOM.id,
    hostName: CURRENT_ROOM.hostName,
    hostId: CURRENT_ROOM.hostId,
    sessionId: CURRENT_ROOM.sessionId,
    muteSource: '运营',
    muteType: '房间禁言',
    mutedAt: '2026-06-08 14:20:00',
    unmutedAt: '—',
    operator: 'admin_ruby',
    operatorId: '76',
    muted: true,
    reason: '弹幕刷屏',
    danmakuContent: '加微信领福利！！！',
    danmakuSentAt: '2026-06-08 14:19:42',
  },
  {
    id: 'mute2',
    recordNo: 'MU20260607103002',
    userId: '3180664521199405',
    username: '广告哥',
    roomId: CURRENT_ROOM.id,
    hostName: CURRENT_ROOM.hostName,
    hostId: CURRENT_ROOM.hostId,
    sessionId: 'sess_live_20260607_8829103',
    muteSource: '主播',
    muteType: '房间禁言',
    mutedAt: '2026-06-07 10:30:12',
    unmutedAt: '2026-06-07 11:05:00',
    operator: 'EZ',
    operatorId: CURRENT_ROOM.hostId,
    muted: false,
    reason: '公屏发广告',
    danmakuContent: '点击链接领取红包',
    danmakuSentAt: '2026-06-07 10:29:58',
  },
  {
    id: 'mute3',
    recordNo: 'MU20260606153003',
    userId: '3180664521199406',
    username: '违规用户',
    roomId: CURRENT_ROOM.id,
    hostName: CURRENT_ROOM.hostName,
    hostId: CURRENT_ROOM.hostId,
    sessionId: 'sess_live_20260606_8829103',
    muteSource: '运营',
    muteType: '全局禁言',
    mutedAt: '2026-06-06 15:30:00',
    unmutedAt: '—',
    operator: 'admin_ruby',
    operatorId: '76',
    muted: true,
    reason: '多次跨直播间违规',
    danmakuContent: '辱骂主播',
    danmakuSentAt: '2026-06-06 15:29:10',
  },
])

function formatNow() {
  const now = new Date()
  return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function formatDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function createRecordNo() {
  return `MU${Date.now()}`
}

function buildLiveContext() {
  return {
    roomId: CURRENT_ROOM.id,
    hostName: CURRENT_ROOM.hostName,
    hostId: CURRENT_ROOM.hostId,
    sessionId: CURRENT_ROOM.sessionId,
  }
}

export function useLiveDanmakuMute() {
  const liveStats = ref({ likes: 0, viewers: 0 })

  function deleteDanmaku(messageId: string) {
    danmakuMessages.value = danmakuMessages.value.filter((item) => item.id !== messageId)
  }

  /** 删除该用户在当前直播间的弹幕 */
  function deleteUserDanmakuCurrentRoom(userId: string) {
    const count = danmakuMessages.value.filter((item) => item.userId === userId).length
    danmakuMessages.value = danmakuMessages.value.filter((item) => item.userId !== userId)
    return count
  }

  /** 模拟其他直播间该用户弹幕数（原型演示「全直播间」与「当前直播间」差异） */
  const mockOtherRoomDanmakuCount: Record<string, number> = {
    '3180664521199401': 2,
    '3180664521199402': 1,
    '3180664521199403': 1,
  }

  function countUserDanmakuCurrentRoom(userId: string) {
    return danmakuMessages.value.filter((item) => item.userId === userId).length
  }

  function countUserDanmakuAllRooms(userId: string) {
    return countUserDanmakuCurrentRoom(userId) + (mockOtherRoomDanmakuCount[userId] ?? 0)
  }

  /** 删除该用户在所有直播间的弹幕 */
  function deleteUserDanmakuAllRooms(userId: string) {
    const currentCount = deleteUserDanmakuCurrentRoom(userId)
    const otherCount = mockOtherRoomDanmakuCount[userId] ?? 0
    if (otherCount > 0) mockOtherRoomDanmakuCount[userId] = 0
    return currentCount + otherCount
  }

  function findMuteRecord(userId: string, muteType: MuteType, roomId = CURRENT_ROOM.id) {
    return muteRecords.value.find((item) => {
      if (item.userId !== userId || item.muteType !== muteType) return false
      if (muteType === '全局禁言') return true
      return item.roomId === roomId
    })
  }

  function muteUser(payload: {
    userId: string
    username: string
    muteSource?: MuteSource
    muteType?: MuteType
    reason?: string
    danmakuContent?: string
    danmakuSentAt?: string
  }) {
    const live = buildLiveContext()
    const muteType = payload.muteType ?? '房间禁言'
    const existing = findMuteRecord(payload.userId, muteType, live.roomId)
    if (existing) {
      existing.muted = true
      existing.mutedAt = formatDateTime()
      existing.unmutedAt = '—'
      existing.reason = payload.reason ?? '弹幕违规'
      existing.muteSource = payload.muteSource ?? '运营'
      existing.muteType = muteType
      if (payload.danmakuContent) existing.danmakuContent = payload.danmakuContent
      if (payload.danmakuSentAt) existing.danmakuSentAt = payload.danmakuSentAt
      return existing
    }
    const record: MuteRecord = {
      id: `mute_${Date.now()}`,
      recordNo: createRecordNo(),
      userId: payload.userId,
      username: payload.username,
      ...live,
      muteSource: payload.muteSource ?? '运营',
      muteType,
      mutedAt: formatDateTime(),
      unmutedAt: '—',
      operator: '当前管理员',
      operatorId: '94',
      muted: true,
      reason: payload.reason ?? '弹幕违规',
      danmakuContent: payload.danmakuContent ?? '—',
      danmakuSentAt: payload.danmakuSentAt ?? '—',
    }
    muteRecords.value.unshift(record)
    return record
  }

  function unmuteUser(userId: string, options?: { roomId?: string; muteType?: MuteType }) {
    const roomId = options?.roomId ?? CURRENT_ROOM.id
    const muteType = options?.muteType ?? '房间禁言'
    const record = findMuteRecord(userId, muteType, roomId)
    if (record) {
      record.muted = false
      record.unmutedAt = formatDateTime()
    }
  }

  function isUserMuted(userId: string, roomId = CURRENT_ROOM.id) {
    return muteRecords.value.some(
      (item) =>
        item.userId === userId &&
        item.muted &&
        (item.muteType === '全局禁言' || (item.muteType === '房间禁言' && item.roomId === roomId)),
    )
  }

  function sendLiveReminder(content: string) {
    if (!content.trim()) return
    danmakuMessages.value.push({
      id: `dm_${Date.now()}`,
      userId: 'system_admin',
      username: '直播提醒',
      avatar: '官',
      content: content.trim(),
      sentAt: formatNow(),
      isSystem: true,
    })
  }

  return {
    currentRoom: CURRENT_ROOM,
    liveStats,
    danmakuMessages,
    muteRecords,
    mutedCount: computed(() => muteRecords.value.filter((item) => item.muted).length),
    deleteDanmaku,
    deleteUserDanmakuCurrentRoom,
    deleteUserDanmakuAllRooms,
    countUserDanmakuCurrentRoom,
    countUserDanmakuAllRooms,
    muteUser,
    unmuteUser,
    isUserMuted,
    sendLiveReminder,
  }
}
