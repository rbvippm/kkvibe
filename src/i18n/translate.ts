import { appLocale } from './locale'
import en from './locales/en.json'
import th from './locales/th.json'
import vi from './locales/vi.json'
import zhTW from './locales/zh-TW.json'

type Dict = Record<string, string>

const DICTS: Record<string, Dict> = {
  en: en as Dict,
  th: th as Dict,
  vi: vi as Dict,
  'zh-TW': zhTW as Dict,
}

export function t(source: string, vars?: Record<string, string | number>): string {
  if (!source) return source
  const loc = appLocale.value
  let out = source
  if (loc !== 'zh-CN') {
    out = DICTS[loc]?.[source] ?? source
  }
  if (vars) {
    out = out.replace(/\{(\w+)\}/g, (_, key: string) =>
      vars[key] === undefined || vars[key] === null ? '' : String(vars[key]),
    )
  }
  return out
}
