import { ref } from 'vue'

/** 原型里用来对照 APP / H5 差异，不是用户账号设置 */
export type PrototypeClient = 'app' | 'h5'

export const PROTOTYPE_CLIENT_OPTIONS: { id: PrototypeClient; label: string }[] = [
  { id: 'app', label: 'APP' },
  { id: 'h5', label: 'H5' },
]

const STORAGE_KEY = 'kkvibe.prototype-client'

function readStoredClient(): PrototypeClient {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'h5') return 'h5'
  } catch {
    /* ignore */
  }
  return 'app'
}

export const prototypeClient = ref<PrototypeClient>(readStoredClient())

export function setPrototypeClient(next: PrototypeClient) {
  prototypeClient.value = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
}
