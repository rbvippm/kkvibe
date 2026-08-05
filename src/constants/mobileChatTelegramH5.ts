/** Telegram Web H5 · 图文发送流程 Mock（系统相册 / 相机交互演示） */

import { CHAT_GALLERY_ITEMS, type GalleryMediaItem } from './mobileChatGallery'

export const TG_H5_ROOM_ID = 'h5-article-demo'

export type TgH5AttachAction = {
  key: string
  label: string
  icon: 'photo' | 'file' | 'poll' | 'check' | 'date' | 'article'
}

/** 回形针附件菜单（对齐 Telegram Web） */
export const TG_H5_ATTACH_ACTIONS: TgH5AttachAction[] = [
  { key: 'photo_video', label: '照片或视频', icon: 'photo' },
  { key: 'file', label: '文件', icon: 'file' },
  { key: 'poll', label: '投票', icon: 'poll' },
  { key: 'checklist', label: '清单', icon: 'check' },
  { key: 'date', label: '日期', icon: 'date' },
  { key: 'article', label: '文章', icon: 'article' },
]

/** 浏览器系统来源菜单（Safari 选文件层） */
export const TG_H5_SYSTEM_SOURCES = [
  { key: 'library', label: '照片图库' },
  { key: 'camera', label: '拍照' },
  { key: 'files', label: '选择文件' },
] as const

export type TgH5SystemSource = (typeof TG_H5_SYSTEM_SOURCES)[number]['key']

/** 发送预览 · 更多菜单（仅保留添加 / 高清） */
export const TG_H5_SEND_MORE_ACTIONS = [
  { key: 'add', label: '+ 添加' },
  { key: 'hd', label: '高清' },
] as const

/** 系统相册网格复用会话图库 Mock */
export function tgH5PickerItems(): GalleryMediaItem[] {
  return CHAT_GALLERY_ITEMS
}

/** 含视频时用「文件」文案（对齐 Telegram）；纯图片用「照片」 */
export function tgH5SendTitle(count: number, hasVideo = false) {
  if (count <= 0) return hasVideo ? '发送文件' : '发送照片'
  if (hasVideo) {
    return count === 1 ? '发送文件' : `发送 ${count} 个文件`
  }
  if (count === 1) return '发送照片'
  return `发送 ${count} 张照片`
}

/** 相机快门后写入的演示照片 */
export function tgH5CameraCaptureItem(index = 0): GalleryMediaItem {
  const pool = CHAT_GALLERY_ITEMS.filter((item) => item.type === 'image')
  const base = pool[index % Math.max(pool.length, 1)] ?? CHAT_GALLERY_ITEMS[0]!
  return {
    ...base,
    id: `cam-${Date.now()}-${index}`,
    albumId: 'camera',
  }
}
