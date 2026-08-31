import { CHAT_GALLERY_ITEMS, type GalleryMediaItem } from './mobileChatGallery'
import { CHAT_ROOM_ASSETS } from './mobileChatRoomAssets'

/** WhatsApp 文档 / 文件入口发送上限 */
export const CHAT_FILE_MAX_BYTES = 2 * 1024 * 1024 * 1024
/** 「照片」入口视频上限 */
export const CHAT_PHOTO_VIDEO_MAX_BYTES = 200 * 1024 * 1024
const PREPARE_BYTES = 20 * 1024 * 1024

export const CHAT_FILE_DOC_LIMIT_ALERT = '此文档太大，文档发送上限为 2 GB。'
export const CHAT_FILE_VIDEO_LIMIT_ALERT = '此视频太大，无法发送。最大为 2 GB。'
export const CHAT_PHOTO_VIDEO_LIMIT_ALERT =
  '视频超过 200MB 上限。建议改用「文件」方式发送，最高支持 2GB 且不损失画质。'

export type ChatFileKind = 'pdf' | 'image' | 'video' | 'doc' | 'sheet' | 'zip' | 'other'

export type ChatFileLocation = 'icloud' | 'iphone' | 'drive'

export type ChatFileAttachment = {
  id: string
  name: string
  ext: string
  kind: ChatFileKind
  sizeLabel: string
  sizeBytes: number
  dateLabel: string
  location: ChatFileLocation
  thumb?: string
  duration?: string
  needsPrepare?: boolean
}

export type ChatFileSendPayload = {
  files: ChatFileAttachment[]
  caption: string
}

export const CHAT_FILE_SOURCE_ACTIONS = [
  { key: 'files', label: '从文件中选择', icon: 'file' },
  { key: 'gallery', label: '选择照片或视频', icon: 'gallery' },
] as const

export const CHAT_FILE_PICKER_TABS = [
  { key: 'recents', label: '最近项目' },
  { key: 'shared', label: '共享' },
  { key: 'browse', label: '浏览' },
] as const

export type ChatFilePickerTab = (typeof CHAT_FILE_PICKER_TABS)[number]['key']

export const CHAT_FILE_BROWSE_LOCATIONS: { key: ChatFileLocation; label: string; hint: string }[] = [
  { key: 'icloud', label: 'iCloud 云盘', hint: '最近同步的文档' },
  { key: 'iphone', label: '我的 iPhone', hint: '本机文件' },
  { key: 'drive', label: 'Google Drive', hint: '云端硬盘' },
]

export const CHAT_FILE_LOCATION_LABEL: Record<ChatFileLocation, string> = {
  icloud: 'iCloud 云盘',
  iphone: '我的 iPhone',
  drive: 'Google Drive',
}

const M = CHAT_ROOM_ASSETS.media

/** 系统文件选择器 Mock · 含超限与需转码的大视频 */
export const CHAT_FILE_MOCK_ITEMS: ChatFileAttachment[] = [
  {
    id: 'f-screenshot',
    name: '截屏 2026-08-24.png',
    ext: 'PNG',
    kind: 'image',
    sizeLabel: '1.6 MB',
    sizeBytes: 1_677_721,
    dateLabel: '24/08/26',
    location: 'icloud',
    thumb: M[3],
  },
  {
    id: 'f-pdf',
    name: 'pdf 测试.pdf',
    ext: 'PDF',
    kind: 'pdf',
    sizeLabel: '328 KB',
    sizeBytes: 335_872,
    dateLabel: '24/07/26',
    location: 'iphone',
  },
  {
    id: 'f-img',
    name: 'IMG_0740.PNG',
    ext: 'PNG',
    kind: 'image',
    sizeLabel: '1.6 MB',
    sizeBytes: 1_677_721,
    dateLabel: '27/08/26',
    location: 'iphone',
    thumb: M[1],
  },
  {
    id: 'f-brief',
    name: '产品方案.docx',
    ext: 'DOCX',
    kind: 'doc',
    sizeLabel: '2.4 MB',
    sizeBytes: 2_516_582,
    dateLabel: '12/08/26',
    location: 'icloud',
  },
  {
    id: 'f-sheet',
    name: '结算报表.xlsx',
    ext: 'XLSX',
    kind: 'sheet',
    sizeLabel: '864 KB',
    sizeBytes: 884_736,
    dateLabel: '08/08/26',
    location: 'drive',
  },
  {
    id: 'f-zip',
    name: '备份资料.zip',
    ext: 'ZIP',
    kind: 'zip',
    sizeLabel: '48.2 MB',
    sizeBytes: 50_541_363,
    dateLabel: '01/06/26',
    location: 'iphone',
    needsPrepare: true,
  },
  {
    id: 'f-video',
    name: '欧冠集锦.mp4',
    ext: 'MP4',
    kind: 'video',
    sizeLabel: '186 MB',
    sizeBytes: 195_035_136,
    dateLabel: '20/08/26',
    location: 'icloud',
    thumb: M[0],
    duration: '2:18',
    needsPrepare: true,
  },
  {
    id: 'f-oversize',
    name: '超大影片.mov',
    ext: 'MOV',
    kind: 'video',
    sizeLabel: '2.4 GB',
    sizeBytes: 2_576_980_992,
    dateLabel: '03/08/26',
    location: 'icloud',
    thumb: M[2],
    needsPrepare: true,
  },
]

export const CHAT_FILE_CAPTION_EMOJIS = [
  '😀',
  '😂',
  '😍',
  '🥳',
  '👍',
  '🙏',
  '❤️',
  '🔥',
  '🎉',
  '😭',
  '😮',
  '🤔',
  '👏',
  '💯',
  '✨',
  '🤝',
] as const

export function chatFileLocationLabel(location: ChatFileLocation) {
  return CHAT_FILE_LOCATION_LABEL[location]
}

export function chatFileStem(name: string) {
  return name.replace(/\.[^.]+$/, '')
}

export function chatFileKindLabel(kind: ChatFileKind) {
  switch (kind) {
    case 'pdf':
      return 'PDF 文档'
    case 'image':
      return '图像'
    case 'video':
      return '视频'
    case 'doc':
      return '文稿'
    case 'sheet':
      return '表格'
    case 'zip':
      return '数据'
    default:
      return '数据'
  }
}

export function isChatFileOversize(file: ChatFileAttachment) {
  return file.sizeBytes > CHAT_FILE_MAX_BYTES
}

/** H5 关闭系统文件弹层后才能读到体积，过滤超限项时的回显 */
export function chatFileH5FilteredHint(n: number) {
  return `已过滤 ${n} 个超过 2GB 的文件`
}

export function galleryItemSizeBytes(item: GalleryMediaItem) {
  if (typeof item.sizeBytes === 'number') return item.sizeBytes
  return item.type === 'video' ? 13_421_772 : 1_677_721
}

export function isPhotoEntryVideoOversize(item: GalleryMediaItem) {
  return item.type === 'video' && galleryItemSizeBytes(item) > CHAT_PHOTO_VIDEO_MAX_BYTES
}

export function isFileEntryItemOversize(item: GalleryMediaItem) {
  return galleryItemSizeBytes(item) > CHAT_FILE_MAX_BYTES
}

export function chatFileNeedsPrepare(file: ChatFileAttachment) {
  return Boolean(file.needsPrepare) || file.kind === 'video' || file.sizeBytes >= PREPARE_BYTES
}

export function filterChatFiles(query: string, location?: ChatFileLocation | null) {
  const q = query.trim().toLowerCase()
  return CHAT_FILE_MOCK_ITEMS.filter((file) => {
    if (location && file.location !== location) return false
    if (!q) return true
    return (
      file.name.toLowerCase().includes(q) ||
      file.ext.toLowerCase().includes(q) ||
      chatFileLocationLabel(file.location).toLowerCase().includes(q)
    )
  })
}

export type ChatFileDownloadStatus = 'pending' | 'downloading' | 'done' | 'failed' | 'blocked'

export function chatFileNeedsManualDownload(file: ChatFileAttachment) {
  return file.sizeBytes >= PREPARE_BYTES && file.sizeBytes <= CHAT_FILE_MAX_BYTES
}

export function fileUploadProgressText(progress: number, sizeLabel: string) {
  const remain = Math.max(0, Math.ceil((100 - Math.min(100, Math.max(0, progress))) / 28))
  return `${Math.round(progress)}% (还剩${remain}秒) · ${sizeLabel}`
}

export function fileSendFailMeta(file: ChatFileAttachment) {
  return `发送失败 · ${file.sizeLabel}`
}

export function fileReceiveMeta(
  file: ChatFileAttachment,
  status?: ChatFileDownloadStatus,
  progress = 0,
) {
  if (status === 'downloading') return fileUploadProgressText(progress, file.sizeLabel)
  if (status === 'failed') return '下载失败，点击重试'
  if (status === 'blocked' || isChatFileOversize(file)) return `${file.sizeLabel} · 超过上限，无法下载`
  if (status === 'pending') return `${file.sizeLabel} · 点击下载`
  return fileSettledMeta(file)
}

export function fileSettledMeta(file: ChatFileAttachment) {
  return `${file.sizeLabel} · ${file.ext.toLowerCase()}`
}

export function galleryItemToChatFile(item: GalleryMediaItem, index: number): ChatFileAttachment {
  const isVideo = item.type === 'video'
  const ext = isVideo ? 'MP4' : item.src.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PNG'
  const sizeLabel = item.sizeLabel ?? (isVideo ? '12.8 MB' : '1.6 MB')
  return {
    id: `gal-file-${item.id}-${index}`,
    name: isVideo ? `VID_${String(740 + index).padStart(4, '0')}.${ext}` : `IMG_${String(740 + index).padStart(4, '0')}.${ext}`,
    ext,
    kind: isVideo ? 'video' : 'image',
    sizeLabel,
    sizeBytes: galleryItemSizeBytes(item),
    dateLabel: '29/08/26',
    location: 'iphone',
    thumb: item.src,
    duration: item.duration,
    needsPrepare: isVideo,
  }
}

export function createScannedDocument(): ChatFileAttachment {
  const now = new Date()
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return {
    id: `scan-${now.getTime()}`,
    name: `扫描件 ${stamp}.pdf`,
    ext: 'PDF',
    kind: 'pdf',
    sizeLabel: '1.2 MB',
    sizeBytes: 1_258_291,
    dateLabel: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(2)}`,
    location: 'iphone',
    thumb: CHAT_GALLERY_ITEMS[3]?.src,
    needsPrepare: true,
  }
}

export const CHAT_FILE_PREVIEW_LINES = Array.from({ length: 40 }, (_, index) => String(index + 1))

export function chatFileKindTone(kind: ChatFileKind) {
  switch (kind) {
    case 'pdf':
      return '#e53935'
    case 'image':
      return '#5b6b8c'
    case 'video':
      return '#7b5ea7'
    case 'doc':
      return '#2b6cb0'
    case 'sheet':
      return '#2f855a'
    case 'zip':
      return '#a67c52'
    default:
      return '#747474'
  }
}
