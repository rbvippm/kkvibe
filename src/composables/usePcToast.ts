import { readonly, ref } from 'vue'

export type PcToastType = 'success' | 'info' | 'error'

export type PcToastItem = {
  text: string
  type: PcToastType
}

const toast = ref<PcToastItem | null>(null)
let hideTimer = 0

/** PC 后台全局顶部提示：保存成功、删除成功等即时反馈 */
export function showPcToast(text: string, type: PcToastType = 'success', duration = 3000) {
  toast.value = { text, type }
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    if (toast.value?.text === text) toast.value = null
  }, duration)
}

export function usePcToast() {
  return {
    toast: readonly(toast),
    showPcToast,
  }
}
