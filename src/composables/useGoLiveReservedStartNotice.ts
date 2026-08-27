import { watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  GO_LIVE_HOST_NAME,
  goLiveScheduleStore,
  isGoLiveScheduleReserved,
} from '../constants/goLive'
import { useLiveStartNotice } from './useLiveStartNotice'

const notifiedLiveIds = new Set<string>()

function seedAlreadyLive() {
  for (const item of goLiveScheduleStore.items) {
    if (item.status === 'live') notifiedLiveIds.add(item.id)
  }
}

/** 预约场次开播后弹出全局顶部通知，不强制进房 */
export function useGoLiveReservedStartNotice() {
  const route = useRoute()
  const { push } = useLiveStartNotice()
  seedAlreadyLive()

  watch(
    () =>
      [
        goLiveScheduleStore.items.map((item) => `${item.id}:${item.status}`).join('|'),
        goLiveScheduleStore.reservedIds.join('|'),
        String(route.name || ''),
        String(route.query.id || ''),
      ].join('::'),
    () => {
      for (const item of goLiveScheduleStore.items) {
        if (item.status !== 'live' || notifiedLiveIds.has(item.id)) continue
        const roomId = String(route.query.id || '')
        const onThisPreview = route.name === 'mobile-live-preview' && roomId === item.id
        const alreadyInThisRoom =
          (route.name === 'mobile-live-stream' || route.name === 'mobile-voice-room') &&
          roomId === item.id
        if (route.name === 'mobile-go-live' || onThisPreview || alreadyInThisRoom) {
          notifiedLiveIds.add(item.id)
          continue
        }
        if (!isGoLiveScheduleReserved(item.id)) continue
        notifiedLiveIds.add(item.id)
        push({
          id: `golive-live-${item.id}`,
          kind: 'live_start',
          hostId: 'go-live-host',
          hostName: GO_LIVE_HOST_NAME,
          hostAvatar: GO_LIVE_HOST_NAME.slice(-1),
          roomId: item.id,
          roomTitle: item.title,
          cover: item.cover,
          heat: String(item.subscriberCount),
          voiceRoom: item.mode === 'voice',
          from: 'community',
        })
      }
    },
  )
}
