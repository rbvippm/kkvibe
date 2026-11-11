/** App 包下载配置 · 原型数据与校验 */

export type AppTerminal = 'ios' | 'android' | 'windows' | 'mac'
export type AppPackageCategory = 'super' | 'chat' | 'store'
export type AppPackageStatus = 'enabled' | 'disabled'

export type AppPackageHistory = {
  id: string
  versionNumber: string
  downloadUrl: string
  updateLog: string
  operator: string
  updatedAt: string
}

export type AppPackageRow = {
  id: string
  /** 固定包位是否已有当前配置；未配置时仅可新增 */
  configured: boolean
  appName: string
  terminal: AppTerminal
  category: AppPackageCategory
  versionNumber: string
  downloadUrl: string
  updateLog: string
  status: AppPackageStatus
  remarks: string
  updatedAt: string
  operator: string
  history: AppPackageHistory[]
}

export type AppPackageForm = {
  appName: string
  versionNumber: string
  downloadUrl: string
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
  { value: 'unconfigured', label: '未配置' },
] as const

/** 固定包位：终端 × 包分类，超签包只适用于 iOS */
export const APP_PACKAGE_SLOTS: { terminal: AppTerminal; category: AppPackageCategory }[] = [
  { terminal: 'ios', category: 'super' },
  { terminal: 'ios', category: 'chat' },
  { terminal: 'ios', category: 'store' },
  { terminal: 'android', category: 'chat' },
  { terminal: 'android', category: 'store' },
  { terminal: 'windows', category: 'chat' },
  { terminal: 'windows', category: 'store' },
  { terminal: 'mac', category: 'chat' },
  { terminal: 'mac', category: 'store' },
]

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

export function validateAppPackageForm(
  form: AppPackageForm,
  slot: { terminal: AppTerminal; category: AppPackageCategory },
  mode: 'add' | 'edit',
  currentVersion: string | null,
  /** 该包位历史里已用过的版本号：当前版本与历史版本号唯一 */
  historyVersions: string[] = [],
) {
  const { terminal, category } = slot
  const appName = form.appName.trim()
  if (!appName) return '请输入应用/包名称'
  if (appName.length > 100) return '应用/包名称最多 100 个字'
  if (form.remarks.trim().length > 255) return '备注最多 255 个字'
  /** 编辑只改名称、更新日志、状态、备注，版本与链接沿用当前值 */
  if (mode === 'edit') return ''

  const version = form.versionNumber.trim()
  if (!VERSION_RE.test(version)) return '版本号须为 X.Y.Z，例如 1.0.3'
  if (mode === 'add' && currentVersion === version) {
    return `v${version} 为当前版本，版本号不能重复`
  }
  if (historyVersions.includes(version)) {
    return `v${version} 已在历史版本中，版本号不能重复`
  }

  const downloadUrl = form.downloadUrl.trim()
  if (!downloadUrl) return '请输入下载链接'
  const superLink = category === 'super' && (HTTP_URL_RE.test(downloadUrl) || ITMS_RE.test(downloadUrl))
  if (!superLink && !HTTP_URL_RE.test(downloadUrl)) {
    return '下载链接须以 http:// 或 https:// 开头（iOS 超签包另可用 itms-services://）'
  }

  if (category === 'store' && terminal === 'ios' && !hostIn(downloadUrl, IOS_STORE_HOSTS)) {
    return 'iOS 上架包请填写 App Store 链接'
  }
  if (category === 'store' && terminal === 'android' && !hostIn(downloadUrl, ANDROID_STORE_HOSTS)) {
    return 'Android 上架包请填写 Google Play 或华为、应用宝、小米商店链接'
  }
  if (category === 'store' && terminal === 'windows' && !hostIn(downloadUrl, WINDOWS_STORE_HOSTS)) {
    return 'Windows 上架包请填写 Microsoft Store 链接'
  }
  if (category === 'store' && terminal === 'mac' && !hostIn(downloadUrl, IOS_STORE_HOSTS)) {
    return 'Mac 上架包请填写 Mac App Store 链接'
  }
  if (category === 'chat' && CHAT_REJECT_EXTS[terminal].some((ext) => pathEnds(downloadUrl, ext))) {
    return `${APP_TERMINAL_LABEL[terminal]} 纯聊包请填写 ${CHAT_ACCEPT_HINT[terminal]} 地址`
  }

  return ''
}

export function snapshotAppPackage(row: AppPackageRow): AppPackageHistory {
  return {
    id: `his_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    versionNumber: row.versionNumber,
    downloadUrl: row.downloadUrl,
    updateLog: row.updateLog,
    operator: row.operator,
    updatedAt: row.updatedAt,
  }
}

/** 未配置的固定包位 */
export function resetAppPackageSlot(row: AppPackageRow) {
  row.configured = false
  row.versionNumber = ''
  row.downloadUrl = ''
  row.updateLog = ''
  row.status = 'disabled'
}

type ConfiguredMock = Omit<AppPackageRow, 'id' | 'configured' | 'terminal' | 'category'>

const MOCK_CONFIGURED: Partial<Record<string, ConfiguredMock>> = {
  'ios|super': {
    appName: '金刚聊天',
    versionNumber: '1.0.3',
    downloadUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.3/install.html',
    updateLog: '修复企业签掉签后无法安装的问题，请卸载后按新链接重装。',
    status: 'enabled',
    remarks: '企业签 1 号，旧地址已失效',
    updatedAt: '2026-10-28 21:01:12',
    operator: '运营-周宁',
    history: [
      {
        id: 'his_ios_super_102',
        versionNumber: '1.0.2',
        downloadUrl: 'https://dl.kkvibe.com/ios/chat/super/1.0.2/install.html',
        updateLog: '优化启动速度。',
        operator: '技术-陈舟',
        updatedAt: '2026-09-18 11:20:06',
      },
      {
        id: 'his_ios_super_101',
        versionNumber: '1.0.1',
        downloadUrl: 'itms-services://?action=download-manifest&url=https://dl.kkvibe.com/ios/chat/super/1.0.1/manifest.plist',
        updateLog: '首个超签包。',
        operator: '技术-陈舟',
        updatedAt: '2026-08-02 09:12:40',
      },
    ],
  },
  'ios|store': {
    appName: '金刚聊天',
    versionNumber: '3.2.1',
    downloadUrl: 'https://apps.apple.com/cn/app/id6471003210',
    updateLog: 'App Store 在架版本。',
    status: 'enabled',
    remarks: '',
    updatedAt: '2026-10-20 10:15:00',
    operator: '财务-何清',
    history: [],
  },
  'android|chat': {
    appName: '金刚聊天',
    versionNumber: '2.4.0',
    downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.4.0.apk',
    updateLog: '纯聊渠道包，隐藏娱乐入口。',
    status: 'enabled',
    remarks: '推广渠道 A',
    updatedAt: '2026-10-26 16:40:18',
    operator: '运营-周宁',
    history: [
      {
        id: 'his_android_chat_230',
        versionNumber: '2.3.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.3.0.apk',
        updateLog: '修复消息重复。',
        operator: '运营-林夏',
        updatedAt: '2026-09-30 14:08:22',
      },
      {
        id: 'his_android_chat_221',
        versionNumber: '2.2.1',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.2.1.apk',
        updateLog: '修复部分机型推送收不到。',
        operator: '运营-周宁',
        updatedAt: '2026-09-12 10:30:45',
      },
      {
        id: 'his_android_chat_220',
        versionNumber: '2.2.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.2.0.apk',
        updateLog: '新增语音消息转文字。',
        operator: '技术-陈舟',
        updatedAt: '2026-08-28 17:02:11',
      },
      {
        id: 'his_android_chat_210',
        versionNumber: '2.1.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.1.0.apk',
        updateLog: '优化弱网下消息发送。',
        operator: '技术-陈舟',
        updatedAt: '2026-08-05 09:48:30',
      },
      {
        id: 'his_android_chat_202',
        versionNumber: '2.0.2',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.0.2.apk',
        updateLog: '修复群聊图片加载失败。',
        operator: '运营-林夏',
        updatedAt: '2026-07-21 20:15:06',
      },
      {
        id: 'his_android_chat_200',
        versionNumber: '2.0.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-2.0.0.apk',
        updateLog: '纯聊包 2.0 改版，全新会话列表。',
        operator: '技术-陈舟',
        updatedAt: '2026-07-01 11:00:00',
      },
      {
        id: 'his_android_chat_190',
        versionNumber: '1.9.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-1.9.0.apk',
        updateLog: '新增表情包商店。',
        operator: '运营-周宁',
        updatedAt: '2026-06-10 15:36:27',
      },
      {
        id: 'his_android_chat_180',
        versionNumber: '1.8.0',
        downloadUrl: 'https://dl.kkvibe.com/android/chat/pure/jingang-chat-1.8.0.apk',
        updateLog: '首个纯聊渠道包。',
        operator: '技术-陈舟',
        updatedAt: '2026-05-18 14:20:09',
      },
    ],
  },
  'android|store': {
    appName: '金刚聊天',
    versionNumber: '3.2.0',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.kkvibe.chat',
    updateLog: 'Google Play 版本，修复支付回调。',
    status: 'enabled',
    remarks: '国内渠道另有应用宝包，暂未启用',
    updatedAt: '2026-10-19 18:22:41',
    operator: '技术-陈舟',
    history: [
      {
        id: 'his_android_store_310',
        versionNumber: '3.1.0',
        downloadUrl: 'https://sj.qq.com/appdetail/com.kkvibe.chat',
        updateLog: '应用宝上架包。',
        operator: '运营-林夏',
        updatedAt: '2026-08-11 09:00:12',
      },
    ],
  },
  'windows|chat': {
    appName: '金刚聊天',
    versionNumber: '1.2.0',
    downloadUrl: 'https://dl.kkvibe.com/desktop/windows/jingang-chat-setup-1.2.0.exe',
    updateLog: '桌面端支持多开窗口与文件拖拽发送。',
    status: 'enabled',
    remarks: '官网下载页',
    updatedAt: '2026-11-05 15:20:33',
    operator: '技术-陈舟',
    history: [
      {
        id: 'his_windows_chat_110',
        versionNumber: '1.1.0',
        downloadUrl: 'https://dl.kkvibe.com/desktop/windows/jingang-chat-setup-1.1.0.exe',
        updateLog: '首个 Windows 桌面版。',
        operator: '技术-陈舟',
        updatedAt: '2026-09-22 10:05:41',
      },
    ],
  },
  'mac|chat': {
    appName: '金刚聊天',
    versionNumber: '1.2.0',
    downloadUrl: 'https://dl.kkvibe.com/desktop/mac/jingang-chat-1.2.0-universal.dmg',
    updateLog: '支持 Apple 芯片与 Intel 通用包。',
    status: 'enabled',
    remarks: '',
    updatedAt: '2026-11-05 15:22:10',
    operator: '技术-陈舟',
    history: [],
  },
  'mac|store': {
    appName: '金刚聊天',
    versionNumber: '1.1.0',
    downloadUrl: 'https://apps.apple.com/cn/app/id6472001120?mt=12',
    updateLog: 'Mac App Store 审核中，先禁用。',
    status: 'disabled',
    remarks: '审核通过后启用',
    updatedAt: '2026-11-03 18:40:02',
    operator: '运营-林夏',
    history: [],
  },
}

export function cloneAppPackageRows(): AppPackageRow[] {
  return APP_PACKAGE_SLOTS.map(({ terminal, category }) => {
    const mock = MOCK_CONFIGURED[`${terminal}|${category}`]
    const base = { id: `pkg_${terminal}_${category}`, terminal, category }
    if (mock) {
      return { ...base, ...mock, configured: true, history: mock.history.map((item) => ({ ...item })) }
    }
    return {
      ...base,
      configured: false,
      appName: '',
      versionNumber: '',
      downloadUrl: '',
      updateLog: '',
      status: 'disabled',
      remarks: '',
      updatedAt: '',
      operator: '',
      history: [],
    }
  })
}
