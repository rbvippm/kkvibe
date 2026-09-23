/** 直播转发进会话：真实会话名单 + 聊天里的三态卡片 */

import { reactive } from 'vue'
import { chatConversationsState, syncConversationPreview } from './mobileChat'

export type LiveShareCardStatus = 'live' | 'preview' | 'ended'

export type LiveShareTarget = {
  id: string
  roomId: string
  name: string
  avatar: string
  isGroup: boolean
}

export type LiveShareCard = {
  status: LiveShareCardStatus
  hostName: string
  hostAvatar: string
  title: string
  cover: string
  heat: string
  scheduleText: string
  likeText: string
  followed: boolean
  reserved: boolean
  /** 点「进入」回到这场 */
  query: Record<string, string>
}

export type SentLiveShare = {
  id: string
  roomId: string
  time: string
  card: LiveShareCard
}

export const LIVE_SHARE_CARD_STATUSES: LiveShareCardStatus[] = ['live', 'preview', 'ended']

/** 已转发进聊天、尚未写进静态演示消息的卡片 */
export const sentLiveShares = reactive<SentLiveShare[]>([])

export function liveShareTargets(): LiveShareTarget[] {
  return chatConversationsState.map((item) => ({
    id: item.id,
    roomId: item.roomId,
    name: item.title,
    avatar: item.avatar,
    isGroup: item.filter === 'group' || item.filter === 'community',
  }))
}

export function liveShareMessagesForRoom(roomId: string) {
  return sentLiveShares
    .filter((item) => item.roomId === roomId)
    .map((item) => ({
      id: item.id,
      direction: 'sent' as const,
      time: item.time,
      read: true,
      layout: '1-square' as const,
      media: [],
      liveCard: item.card,
    }))
}

function nowTimeLabel() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/** 把当前这场按直播中 / 预告 / 直播结束三张卡片发进选中的会话 */
export function sendLiveRoomToChats(
  targets: LiveShareTarget[],
  source: Omit<LiveShareCard, 'status' | 'followed' | 'reserved'>,
) {
  const time = nowTimeLabel()
  targets.forEach((target, targetIndex) => {
    LIVE_SHARE_CARD_STATUSES.forEach((status, statusIndex) => {
      sentLiveShares.push({
        id: `live-share-${target.id}-${status}-${Date.now()}-${targetIndex}-${statusIndex}`,
        roomId: target.roomId,
        time,
        card: { ...source, status, followed: false, reserved: false },
      })
    })
    syncConversationPreview(target.id, `[直播] ${source.title}`)
  })
}
