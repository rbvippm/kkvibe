import { computed, onBeforeUnmount, onMounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import {
  formatLiveOnlineCount,
  getLiveOnlineConfig,
  nextLiveOnlineDelta,
  pickLiveHeaderAvatars,
} from '../constants/mobileLiveOnline'
import { appLocale } from '../i18n'

function nextTickMs() {
  return 1800 + Math.floor(Math.random() * 2800)
}

/**
 * 顶栏在线人数：后台基准 + 登录用户进出随机波动（游客不计）；头像取大赏前三，不足用系统头像补。
 * 不提供点击进列表。
 */
export function useLiveOnlinePresence(roomId: MaybeRefOrGetter<string>) {
  const count = ref(0)
  const avatars = ref<string[]>([])
  let timer: number | undefined

  function resetFromBackend() {
    const id = toValue(roomId)
    count.value = getLiveOnlineConfig(id).baseCount
    avatars.value = pickLiveHeaderAvatars(id)
  }

  function applyMove(kind: 'enter' | 'leave') {
    const id = toValue(roomId)
    const delta = nextLiveOnlineDelta(id, kind)
    if (kind === 'enter') {
      count.value += delta
      return
    }
    count.value = Math.max(0, count.value - delta)
  }

  function schedule() {
    timer = window.setTimeout(() => {
      applyMove(Math.random() < 0.58 ? 'enter' : 'leave')
      schedule()
    }, nextTickMs())
  }

  onMounted(() => {
    resetFromBackend()
    applyMove('enter')
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
      applyMove('enter')
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
