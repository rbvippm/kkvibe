/** 隐私设置里除 App 锁定以外的开关。 */

import { reactive, watch } from 'vue'

const STORAGE_KEY = 'kkvibe.privacy-prefs'

type SavedPrivacyPrefs = {
  readReceipt: boolean
  unsearchable: boolean
  friendNoVerify: boolean
}

function readSaved(): SavedPrivacyPrefs {
  const empty: SavedPrivacyPrefs = {
    readReceipt: true,
    unsearchable: false,
    friendNoVerify: false,
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<SavedPrivacyPrefs>
    return {
      readReceipt: parsed.readReceipt !== false,
      unsearchable: Boolean(parsed.unsearchable),
      friendNoVerify: Boolean(parsed.friendNoVerify),
    }
  } catch {
    return empty
  }
}

export const privacyPrefs = reactive(readSaved())

watch(
  privacyPrefs,
  () => {
    try {
      const payload: SavedPrivacyPrefs = {
        readReceipt: privacyPrefs.readReceipt,
        unsearchable: privacyPrefs.unsearchable,
        friendNoVerify: privacyPrefs.friendNoVerify,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* 原型不阻断页面 */
    }
  },
  { deep: true },
)
