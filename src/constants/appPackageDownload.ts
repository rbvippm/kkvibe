/** App 包下载配置 · 原型数据与校验 */

export type AppTerminal = 'ios' | 'android' | 'windows' | 'mac'
export type AppPackageCategory = 'super' | 'chat' | 'store'
export type AppPackageStatus = 'enabled' | 'disabled'

export type AppPackageHistory = {
  id: string
  versionNumber: string
  downloadUrl: string
  plistUrl: string
  updateLog: string
  operator: string
  updatedAt: string
}

export type AppPackageRow = {
  id: string
  appName: string
  terminal: AppTerminal
  category: AppPackageCategory
  versionNumber: string
  downloadUrl: string
  plistUrl: string
  updateLog: string
  status: AppPackageStatus
  remarks: string
  updatedAt: string
  operator: string
  history: AppPackageHistory[]
}

export type AppPackageForm = {
  appName: string
  terminal: AppTerminal
  category: AppPackageCategory
  versionNumber: string
  downloadUrl: string
  plistUrl: string
  updateLog: string
  status: AppPackageStatus
  remarks: string
}

export const CURRENT_APP_PACKAGE_OPERATOR = '运营-周宁'

export const APP_TERMINAL_LABEL: Record<AppTerminal, string> = {
  ios: 'iOS',
  android: 'Android',
  windows: 'Windows',
  mac: 'Mac',
}

export const APP_TERMINAL_OPTIONS: { value: AppTerminal; label: string }[] = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'windows', label: 'Windows' },
  { value: 'mac', label: 'Mac' },
]

export const APP_CATEGORY_LABEL: Record<AppPackageCategory, string> = {
  super: '超签包',
  chat: '纯聊包',
  store: '上架包',
}

export const APP_TERMINAL_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'windows', label: 'Windows' },
  { value: 'mac', label: 'Mac' },
] as const

export const APP_CATEGORY_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'super', label: '超签包' },
  { value: 'chat', label: '纯聊包' },
  { value: 'store', label: '上架包' },
] as const

export const APP_STATUS_FILTER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '禁用' },
] as const

const VERSION_RE = /^\d+\.\d+\.\d+$/
const HTTP_URL_RE = /^https?:\/\/\S+$/i
const ITMS_RE = /^itms-services:\/\/\S+$/i
const IOS_STORE_HOSTS = ['apps.apple.com', 'itunes.apple.com']
const ANDROID_STORE_HOSTS = ['play.google.com', 'appgallery.huawei.com', 'sj.qq.com', 'app.mi.com']
const WINDOWS_STORE_HOSTS = ['apps.microsoft.com', 'microsoft.com']
/** 纯聊包按终端拒收的安装包后缀 */
const CHAT_REJECT_EXTS: Record<AppTerminal, string[]> = {
  ios: ['.apk'],
  android: ['.ipa'],
  windows: ['.apk', '.ipa', '.dmg', '.pkg'],
  mac: ['.apk', '.ipa', '.exe', '.msi'],
}
const CHAT_ACCEPT_HINT: Record<AppTerminal, string> = {
  ios: 'IPA 或 H5',
  android: 'APK 或 H5',
  windows: 'EXE / MSI 或 H5',
  mac: 'DMG / PKG 或 H5',
}

export function formatAppPackageNow(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function appPackageIdentity(row: Pick<AppPackageRow, 'appName' | 'terminal' | 'category'>) {
  return `${row.appName.trim()}|${row.terminal}|${row.category}`
}

export function compareAppVersion(left: string, right: string) {
  const a = left.split('.').map((part) => Number(part))
  const b = right.split('.').map((part) => Number(part))
  for (let index = 0; index < 3; index += 1) {
    if (a[index] > b[index]) return 1
    if (a[index] < b[index]) return -1
  }
  return 0
}

export function showsPlistField(terminal: AppTerminal, category: AppPackageCategory) {
  return terminal === 'ios' && category === 'super'
}

function urlHost(url: string) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function hostIn(url: string, hosts: string[]) {
  const host = urlHost(url)
  return hosts.some((item) => host === item || host.endsWith(`.${item}`))
}

function pathEnds(url: string, ext: string) {
  try {
    return new URL(url).pathname.toLowerCase().endsWith(ext)
  } catch {
    return url.toLowerCase().split('?')[0].endsWith(ext)
  }
}

function isPlistUrl(url: string) {
  const value = url.trim()
  if (ITMS_RE.test(value)) return true
  return HTTP_URL_RE.test(value) && pathEnds(value, '.plist')
}

export function validateAppPackageForm(
  form: AppPackageForm,
  mode: 'create' | 'publish' | 'edit',
  currentVersion: string | null,
  /** 该配置历史里已用过的版本号：当前版本与历史版本号全局唯一 */
  historyVersions: string[] = [],
  linkChanged = false,
) {
  const appName = form.appName.trim()
  if (!appName) return '请输入应用/包名称'
  if (appName.length > 100) return '应用/包名称最多 100 个字'

  if (form.category === 'super' && form.terminal !== 'ios') {
    return '超签包只适用于 iOS'
  }

  const version = form.versionNumber.trim()
  if (!VERSION_RE.test(version)) return '版本号须为 X.Y.Z，例如 1.0.3'
  if (currentVersion && mode === 'publish' && compareAppVersion(version, currentVersion) <= 0) {
    return `版本号须高于当前 v${currentVersion}`
  }
  if (currentVersion && mode === 'edit' && compareAppVersion(version, currentVersion) < 0) {
    return `版本号须不低于当前 v${currentVersion}`
  }
  if (historyVersions.includes(version)) {
    return `v${version} 已在历史版本中，版本号不能重复`
  }
  if (mode === 'edit' && linkChanged && version === currentVersion) {
    return '修改下载链接须同时升级版本号，同一版本号只对应一个包'
  }

  const downloadUrl = form.downloadUrl.trim()
  if (!downloadUrl) return '请输入下载链接'
  const superLink = form.category === 'super' && (HTTP_URL_RE.test(downloadUrl) || ITMS_RE.test(downloadUrl))
  if (!superLink && !HTTP_URL_RE.test(downloadUrl)) {
    return '下载链接须以 http:// 或 https:// 开头'
  }

  if (form.category === 'store' && form.terminal === 'ios' && !hostIn(downloadUrl, IOS_STORE_HOSTS)) {
    return 'iOS 上架包请填写 App Store 链接'
  }
  if (form.category === 'store' && form.terminal === 'android' && !hostIn(downloadUrl, ANDROID_STORE_HOSTS)) {
    return 'Android 上架包请填写 Google Play 或华为、应用宝、小米商店链接'
  }
  if (form.category === 'store' && form.terminal === 'windows' && !hostIn(downloadUrl, WINDOWS_STORE_HOSTS)) {
    return 'Windows 上架包请填写 Microsoft Store 链接'
  }
  if (form.category === 'store' && form.terminal === 'mac' && !hostIn(downloadUrl, IOS_STORE_HOSTS)) {
    return 'Mac 上架包请填写 Mac App Store 链接'
  }
  if (form.category === 'chat' && CHAT_REJECT_EXTS[form.terminal].some((ext) => pathEnds(downloadUrl, ext))) {
    return `${APP_TERMINAL_LABEL[form.terminal]} 纯聊包请填写 ${CHAT_ACCEPT_HINT[form.terminal]} 地址`
  }

  if (showsPlistField(form.terminal, form.category)) {
    const plistUrl = form.plistUrl.trim()
    if (!plistUrl) return 'iOS 超签包请填写 Plist 链接'
    if (!isPlistUrl(plistUrl)) return 'Plist 链接须以 .plist 结尾，或以 itms-services:// 开头'
  }

  if (form.remarks.trim().length > 255) return '备注最多 255 个字'
  return ''
}

export function snapshotAppPackage(row: AppPackageRow): AppPackageHistory {
  return {
    id: `his_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    versionNumber: row.versionNumber,
    downloadUrl: row.downloadUrl,
    plistUrl: row.plistUrl,
    updateLog: row.updateLog,
    operator: row.operator,
    updatedAt: row.updatedAt,
  }
}

const MOCK_APP_PACKAGE_ROWS: AppPackageRow[] = [
  {
    id: 'pkg_chat_ios_super',
    appName: '金刚聊天',
    terminal: 'ios',
    category: 'super',
    versionNumber: '1.0.3',
    downloadUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.3/install.html',
    plistUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.3/manifest.plist',
    updateLog: '修复企业签掉签后无法安装的问题，请卸载后按新链接重装。',
    status: 'enabled',
    remarks: '企业签 1 号，旧地址已失效',
    updatedAt: '2026-10-28 21:01:12',
    operator: '运营-周宁',
    history: [
      {
        id: 'his_chat_ios_102',
        versionNumber: '1.0.2',
        downloadUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.2/install.html',
        plistUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.2/manifest.plist',
        updateLog: '优化启动速度。',
        operator: '技术-陈舟',
        updatedAt: '2026-09-18 11:20:06',
      },
      {
        id: 'his_chat_ios_101',
        versionNumber: '1.0.1',
        downloadUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.1/install.html',
        plistUrl: 'itms-services://?action=download-manifest&url=https://dl.kkvibe.com/ios/chat/super/1.0.1/manifest.plist',
        updateLog: '首个超签包。',
        operator: '技术-陈舟',
        updatedAt: '2026-08-02 09:12:40',
      },
    ],
  },
  {
    id: 'pkg_chat_android_chat',
    appName: '金刚聊天',
    terminal: 'android',
    category: 'chat',
    versionNumber: '2.4.0',
    downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.4.0.apk',
    plistUrl: '',
    updateLog: '纯聊渠道包，隐藏娱乐入口。',
    status: 'enabled',
    remarks: '推广渠道 A',
    updatedAt: '2026-10-26 16:40:18',
    operator: '运营-周宁',
    history: [
      {
        id: 'his_chat_android_230',
        versionNumber: '2.3.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.3.0.apk',
        plistUrl: '',
        updateLog: '修复消息重复。',
        operator: '运营-林夏',
        updatedAt: '2026-09-30 14:08:22',
      },
    ],
  },
  {
    id: 'pkg_sport_ios_store',
    appName: '金刚体育',
    terminal: 'ios',
    category: 'store',
    versionNumber: '3.2.1',
    downloadUrl: 'https://apps.apple.com/cn/app/id6471003210',
    plistUrl: '',
    updateLog: 'App Store 在架版本。',
    status: 'enabled',
    remarks: '',
    updatedAt: '2026-10-20 10:15:00',
    operator: '财务-何清',
    history: [],
  },
  {
    id: 'pkg_sport_android_store',
    appName: '金刚体育',
    terminal: 'android',
    category: 'store',
    versionNumber: '3.2.0',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.kkvibe.sport',
    plistUrl: '',
    updateLog: 'Google Play 版本，修复支付回调。',
    status: 'enabled',
    remarks: '国内渠道另有应用宝包，暂未启用',
    updatedAt: '2026-10-19 18:22:41',
    operator: '技术-陈舟',
    history: [
      {
        id: 'his_sport_android_310',
        versionNumber: '3.1.0',
        downloadUrl: 'https://sj.qq.com/appdetail/com.kkvibe.sport',
        plistUrl: '',
        updateLog: '应用宝上架包。',
        operator: '运营-林夏',
        updatedAt: '2026-08-11 09:00:12',
      },
    ],
  },
  {
    id: 'pkg_live_ios_chat',
    appName: '金刚直播',
    terminal: 'ios',
    category: 'chat',
    versionNumber: '1.8.6',
    downloadUrl: 'https://dl.kkvibe.com/ios/live/pure/jingang-live-1.8.6.ipa',
    plistUrl: '',
    updateLog: '直播纯聊包，当前渠道暂停投放。',
    status: 'disabled',
    remarks: '渠道暂停',
    updatedAt: '2026-10-12 13:33:09',
    operator: '运营-林夏',
    history: [],
  },
  {
    id: 'pkg_live_android_chat',
    appName: '金刚直播',
    terminal: 'android',
    category: 'chat',
    versionNumber: '1.8.5',
    downloadUrl: 'https://h5.kkvibe.com/download/live-chat',
    plistUrl: '',
    updateLog: 'H5 落地页分发 APK。',
    status: 'enabled',
    remarks: '',
    updatedAt: '2026-10-15 08:46:55',
    operator: '运营-周宁',
    history: [],
  },
  {
    id: 'pkg_lottery_android_store',
    appName: '金刚彩票',
    terminal: 'android',
    category: 'store',
    versionNumber: '1.1.0',
    downloadUrl: 'https://app.mi.com/details?id=com.kkvibe.lottery',
    plistUrl: '',
    updateLog: '小米商店包，审核中先禁用。',
    status: 'disabled',
    remarks: '待商店审核通过后再启用',
    updatedAt: '2026-10-08 19:05:27',
    operator: '财务-何清',
    history: [],
  },
  {
    id: 'pkg_chat_windows_chat',
    appName: '金刚聊天',
    terminal: 'windows',
    category: 'chat',
    versionNumber: '1.2.0',
    downloadUrl: 'https://dl.kkvibe.com/desktop/windows/jingang-chat-setup-1.2.0.exe',
    plistUrl: '',
    updateLog: '桌面端支持多开窗口与文件拖拽发送。',
    status: 'enabled',
    remarks: '官网下载页',
    updatedAt: '2026-11-05 15:20:33',
    operator: '技术-陈舟',
    history: [
      {
        id: 'his_chat_windows_110',
        versionNumber: '1.1.0',
        downloadUrl: 'https://dl.kkvibe.com/desktop/windows/jingang-chat-setup-1.1.0.exe',
        plistUrl: '',
        updateLog: '首个 Windows 桌面版。',
        operator: '技术-陈舟',
        updatedAt: '2026-09-22 10:05:41',
      },
    ],
  },
  {
    id: 'pkg_chat_mac_chat',
    appName: '金刚聊天',
    terminal: 'mac',
    category: 'chat',
    versionNumber: '1.2.0',
    downloadUrl: 'https://dl.kkvibe.com/desktop/mac/jingang-chat-1.2.0-universal.dmg',
    plistUrl: '',
    updateLog: '支持 Apple 芯片与 Intel 通用包。',
    status: 'enabled',
    remarks: '',
    updatedAt: '2026-11-05 15:22:10',
    operator: '技术-陈舟',
    history: [],
  },
  {
    id: 'pkg_chat_mac_store',
    appName: '金刚聊天',
    terminal: 'mac',
    category: 'store',
    versionNumber: '1.1.0',
    downloadUrl: 'https://apps.apple.com/cn/app/id6472001120?mt=12',
    plistUrl: '',
    updateLog: 'Mac App Store 审核中，先禁用。',
    status: 'disabled',
    remarks: '审核通过后启用',
    updatedAt: '2026-11-03 18:40:02',
    operator: '运营-林夏',
    history: [],
  },
]

export function cloneAppPackageRows() {
  return MOCK_APP_PACKAGE_ROWS.map((row) => ({
    ...row,
    history: row.history.map((item) => ({ ...item })),
  }))
}
