import { computed, onBeforeUnmount, onMounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import {
  formatLiveOnlineCount,
  getLiveOnlineConfig,
  pickLiveHeaderAvatars,
  seedLiveOnlineVirtual,
  stepLiveOnlineVirtual,
  type LiveOnlineTickState,
} from '../constants/mobileLiveOnline'
import { appLocale } from '../i18n'

function nextTickMs() {
  return 1800 + Math.floor(Math.random() * 2800)
}

/**
 * 顶栏在线人数：后台基准 + 每分钟人数增加 / 人数减少持续起伏（不依赖真实进房）。
 * 头像取大赏前三，不足用系统头像补。不提供点击进列表。
 */
export function useLiveOnlinePresence(roomId: MaybeRefOrGetter<string>) {
  const count = ref(0)
  const avatars = ref<string[]>([])
  let timer: number | undefined
  let tickState: LiveOnlineTickState = seedLiveOnlineVirtual(toValue(roomId))
  let lastTickAt = 0

  function syncCount(id: string) {
    count.value = getLiveOnlineConfig(id).baseCount + tickState.virtual
    avatars.value = pickLiveHeaderAvatars(id)
  }

  function resetFromBackend() {
    const id = toValue(roomId)
    tickState = seedLiveOnlineVirtual(id)
    lastTickAt = Date.now()
    syncCount(id)
  }

  function applyTick() {
    const now = Date.now()
    const dtMs = lastTickAt ? now - lastTickAt : nextTickMs()
    lastTickAt = now
    const id = toValue(roomId)
    tickState = stepLiveOnlineVirtual(id, tickState, dtMs)
    syncCount(id)
  }

  function schedule() {
    timer = window.setTimeout(() => {
      applyTick()
      schedule()
    }, nextTickMs())
  }

  onMounted(() => {
    resetFromBackend()
    schedule()
  })

  onBeforeUnmount(() => {
    if (timer) window.clearTimeout(timer)
  })

  watch(
    () => toValue(roomId),
    () => {
      if (timer) window.clearTimeout(timer)
      resetFromBackend()
      schedule()
    },
  )

  const label = computed(() => formatLiveOnlineCount(count.value, appLocale.value))

  return {
    count,
    avatars,
    label,
  }
}
