import { computed, ref } from 'vue'
import {
  MOCK_COMMUNITY_CHANNELS,
  VIP_CLUB_HIDDEN_COMMUNITY_CHANNELS,
  type CommunityChannelId,
  type CommunityChannelItem,
} from '../constants/mobileCommunityChannel'

const STORAGE_KEY = 'mh5-community-channels'

const VALID_IDS = new Set(MOCK_COMMUNITY_CHANNELS.map((item) => item.id))

function cloneDefault(): CommunityChannelItem[] {
  return MOCK_COMMUNITY_CHANNELS.map((item) => ({ ...item }))
}

function readStoredChannels(): CommunityChannelItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneDefault()
    const parsed = JSON.parse(raw) as CommunityChannelItem[]
    if (!Array.isArray(parsed) || !parsed.length) return cloneDefault()

    const defaults = new Map(MOCK_COMMUNITY_CHANNELS.map((item) => [item.id, item]))
    const next: CommunityChannelItem[] = []
    for (const item of parsed) {
      if (!VALID_IDS.has(item.id)) continue
      const base = defaults.get(item.id)
      if (!base) continue
      next.push({
        ...base,
        enabled: Boolean(item.enabled),
      })
      defaults.delete(item.id)
    }
    for (const left of defaults.values()) next.push({ ...left })
    return next.length ? next : cloneDefault()
  } catch {
    return cloneDefault()
  }
}

const channels = ref<CommunityChannelItem[]>(readStoredChannels())

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(channels.value))
  } catch {
    /* ignore */
  }
}

/** isVipClub 为真时隐藏贵宾厅不提供的频道；排序只调整可见项，隐藏项保持原位 */
export function useCommunityChannels(isVipClub: () => boolean = () => false) {
  const isHidden = (id: CommunityChannelId) =>
    isVipClub() && VIP_CLUB_HIDDEN_COMMUNITY_CHANNELS.has(id)

  const shownChannels = computed(() => channels.value.filter((item) => !isHidden(item.id)))

  const visibleTabs = computed(() =>
    shownChannels.value
      .filter((item) => item.enabled)
      .map((item) => ({
        key: item.id,
        label: item.label,
      })),
  )

  function setChannelOrder(next: CommunityChannelItem[]) {
    const queue = next.map((item) => ({ ...item }))
    channels.value = channels.value.map((item) => (isHidden(item.id) ? item : queue.shift() ?? item))
    persist()
  }

  function toggleChannel(id: CommunityChannelId) {
    const item = channels.value.find((c) => c.id === id)
    if (!item) return
    item.enabled = !item.enabled
    persist()
  }

  return {
    channels: shownChannels,
    visibleTabs,
    setChannelOrder,
    toggleChannel,
  }
}
