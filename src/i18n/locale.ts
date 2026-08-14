import { computed, ref } from 'vue'

export const APP_LOCALES = ['zh-CN', 'zh-TW', 'vi', 'th', 'en'] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'kkvibe.locale'

export const APP_LOCALE_OPTIONS: { id: AppLocale; nativeName: string }[] = [
  { id: 'zh-CN', nativeName: '简体中文' },
  { id: 'zh-TW', nativeName: '繁體中文' },
  { id: 'vi', nativeName: 'Tiếng Việt' },
  { id: 'th', nativeName: 'ภาษาไทย' },
  { id: 'en', nativeName: 'English' },
]

function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value)
}

function readStoredLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (raw && isAppLocale(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'zh-CN'
}

export const appLocale = ref<AppLocale>(readStoredLocale())

export const appLocaleMeta = computed(
  () => APP_LOCALE_OPTIONS.find((item) => item.id === appLocale.value) ?? APP_LOCALE_OPTIONS[0],
)

export function numberLocale(locale: AppLocale = appLocale.value) {
  if (locale === 'vi') return 'vi-VN'
  if (locale === 'th') return 'th-TH'
  if (locale === 'en') return 'en-US'
  return 'zh-CN'
}

export function setAppLocale(next: AppLocale) {
  appLocale.value = next
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next
  }
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = appLocale.value
}
