import { computed, ref } from 'vue'
import { showPcToast } from './usePcToast'
import { VOICE_ROOM_ASSETS } from '../constants/mobileVoiceRoom'

export type AssistantVoiceSeat =
  | {
      id: string
      index: number
      kind: 'user'
      userId: string
      name: string
      avatar: string
      badge?: 'host' | 'admin' | 'god'
      mic: 'speaking' | 'on' | 'mute'
      followed: boolean
    }
  | {
      id: string
      index: number
      kind: 'empty' | 'locked'
      seatMuted?: boolean
    }

function createAssistantVoiceSeats(): AssistantVoiceSeat[] {
  return [
    {
      id: 'avs1',
      index: 1,
      kind: 'user',
      userId: 'host_self',
      name: '我',
      avatar: VOICE_ROOM_ASSETS.avatars[1],
      badge: 'host',
      mic: 'speaking',
      followed: false,
    },
    {
      id: 'avs2',
      index: 2,
      kind: 'user',
      userId: 'u_voice_02',
      name: '夜色观星',
      avatar: VOICE_ROOM_ASSETS.avatars[2],
      mic: 'mute',
      followed: false,
    },
    {
      id: 'avs3',
      index: 3,
      kind: 'user',
      userId: 'u_voice_03',
      name: '阿凯开播',
      avatar: VOICE_ROOM_ASSETS.avatars[0],
      badge: 'god',
      mic: 'speaking',
      followed: true,
    },
    {
      id: 'avs4',
      index: 4,
      kind: 'user',
      userId: 'u_voice_04',
      name: '好运气常在',
      avatar: VOICE_ROOM_ASSETS.avatars[3],
      badge: 'admin',
      mic: 'on',
      followed: false,
    },
    {
      id: 'avs5',
      index: 5,
      kind: 'user',
      userId: 'u_voice_05',
      name: '艾米粒',
      avatar: VOICE_ROOM_ASSETS.avatars[4],
      badge: 'admin',
      mic: 'speaking',
      followed: false,
    },
    { id: 'avs6', index: 6, kind: 'empty', seatMuted: true },
    { id: 'avs7', index: 7, kind: 'locked' },
    { id: 'avs8', index: 8, kind: 'empty' },
  ]
}

export function useAssistantVoiceRoom() {
  const seats = ref<AssistantVoiceSeat[]>(createAssistantVoiceSeats())
  const selectedSeatId = ref<string | null>(null)
  const allMuted = ref(false)

  const selectedSeat = computed(
    () => seats.value.find((seat) => seat.id === selectedSeatId.value) ?? null,
  )

  const selectedUser = computed(() => {
    const seat = selectedSeat.value
    return seat?.kind === 'user' ? seat : null
  })

  const sheetOpen = computed(() => Boolean(selectedSeat.value))

  function closeSeatSheet() {
    selectedSeatId.value = null
  }

  function openSeat(seat: AssistantVoiceSeat) {
    if (seat.kind === 'user' && seat.badge === 'host') {
      showPcToast('主播固定 1 号麦，不可操作自己')
      return
    }
    selectedSeatId.value = seat.id
  }

  function patchSeat(id: string, next: AssistantVoiceSeat) {
    seats.value = seats.value.map((seat) => (seat.id === id ? next : seat))
  }

  function toggleFollow() {
    const seat = selectedSeat.value
    if (!seat || seat.kind !== 'user') return
    const followed = !seat.followed
    patchSeat(seat.id, { ...seat, followed })
    showPcToast(followed ? `已关注 ${seat.name}` : `已取消关注 ${seat.name}`)
  }

  function toggleAdmin() {
    const seat = selectedSeat.value
    if (!seat || seat.kind !== 'user' || seat.badge === 'host') return
    const nextBadge = seat.badge === 'admin' ? undefined : 'admin'
    patchSeat(seat.id, { ...seat, badge: nextBadge })
    showPcToast(nextBadge ? `已将 ${seat.name} 设为房管` : `已取消 ${seat.name} 的房管`)
  }

  function kickOffMic() {
    const seat = selectedSeat.value
    if (!seat || seat.kind !== 'user') return
    patchSeat(seat.id, { id: seat.id, index: seat.index, kind: 'empty' })
    showPcToast(`已将 ${seat.name} 踢下麦`)
    closeSeatSheet()
  }

  function toggleSeatMute() {
    const seat = selectedSeat.value
    if (!seat) return
    if (seat.kind === 'user') {
      const muted = seat.mic === 'mute'
      patchSeat(seat.id, { ...seat, mic: muted ? 'on' : 'mute' })
      showPcToast(muted ? `已为 ${seat.name} 开麦` : `已禁麦 ${seat.name}`)
      return
    }
    patchSeat(seat.id, { ...seat, seatMuted: !seat.seatMuted })
    showPcToast(seat.seatMuted ? `已解除 ${seat.index} 号麦禁麦` : `已禁麦 ${seat.index} 号麦`)
  }

  function muteAllGuests() {
    allMuted.value = true
    seats.value = seats.value.map((seat) => {
      if (seat.kind === 'user' && seat.badge !== 'host') return { ...seat, mic: 'mute' as const }
      if (seat.kind !== 'user') return { ...seat, seatMuted: true }
      return seat
    })
    showPcToast('全部嘉宾已禁麦')
  }

  function unmuteAllGuests() {
    allMuted.value = false
    seats.value = seats.value.map((seat) => {
      if (seat.kind === 'user' && seat.badge !== 'host') return { ...seat, mic: 'on' as const }
      if (seat.kind !== 'user') return { ...seat, seatMuted: false }
      return seat
    })
    showPcToast('全部嘉宾已开麦')
  }

  function closeMicSeat() {
    const seat = selectedSeat.value
    if (!seat) return
    const name = seat.kind === 'user' ? seat.name : `${seat.index} 号麦`
    patchSeat(seat.id, { id: seat.id, index: seat.index, kind: 'locked', seatMuted: seat.kind !== 'user' ? seat.seatMuted : false })
    showPcToast(seat.kind === 'user' ? `已将 ${name} 踢下麦并关闭麦位` : `已关闭 ${name}`)
    closeSeatSheet()
  }

  function openMicSeat() {
    const seat = selectedSeat.value
    if (!seat || seat.kind !== 'locked') return
    patchSeat(seat.id, { id: seat.id, index: seat.index, kind: 'empty', seatMuted: seat.seatMuted })
    showPcToast(`已打开 ${seat.index} 号麦`)
    closeSeatSheet()
  }

  return {
    VOICE_ROOM_ASSETS,
    seats,
    allMuted,
    selectedSeat,
    selectedUser,
    sheetOpen,
    openSeat,
    closeSeatSheet,
    toggleFollow,
    toggleAdmin,
    kickOffMic,
    toggleSeatMute,
    muteAllGuests,
    unmuteAllGuests,
    closeMicSeat,
    openMicSeat,
  }
}
