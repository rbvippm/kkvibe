import { computed, ref } from 'vue'
import {
  MOCK_DISCOVER_CHANNELS,
  type DiscoverChannelId,
  type DiscoverChannelItem,
} from '../constants/mobileDiscoverChannel'
import type { DiscoverMainTab } from '../constants/mobileDiscover'

const STORAGE_KEY = 'mh5-discover-channels'

const VALID_IDS = new Set(MOCK_DISCOVER_CHANNELS.map((item) => item.id))

function cloneDefault(): DiscoverChannelItem[] {
  return MOCK_DISCOVER_CHANNELS.map((item) => ({ ...item }))
}

function readStoredChannels(): DiscoverChannelItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneDefault()
    const parsed = JSON.parse(raw) as DiscoverChannelItem[]
    if (!Array.isArray(parsed) || !parsed.length) return cloneDefault()

    const defaults = new Map(MOCK_DISCOVER_CHANNELS.map((item) => [item.id, item]))
    const next: DiscoverChannelItem[] = []
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

const channels = ref<DiscoverChannelItem[]>(readStoredChannels())

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(channels.value))
  } catch {
    /* ignore */
  }
}

export function useDiscoverChannels() {
  const visibleTabs = computed(() =>
    channels.value
      .filter((item) => item.enabled)
      .map((item) => ({
        key: item.id as DiscoverMainTab,
        label: item.label,
      })),
  )

  function setChannelOrder(next: DiscoverChannelItem[]) {
    channels.value = next.map((item) => ({ ...item }))
    persist()
  }

  function toggleChannel(id: DiscoverChannelId) {
    const item = channels.value.find((c) => c.id === id)
    if (!item) return
    item.enabled = !item.enabled
    persist()
  }

  return {
    channels,
    visibleTabs,
    setChannelOrder,
    toggleChannel,
  }
}
