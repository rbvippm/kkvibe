import { CHAT_ROOM_ASSETS } from './mobileChatRoomAssets'

export type GalleryMediaType = 'image' | 'video'

export type GalleryMediaItem = {
  id: string
  src: string
  type: GalleryMediaType
  duration?: string
  sizeLabel?: string
  albumId: string
}

export type GalleryAlbum = {
  id: string
  name: string
  cover: string
  count: number
}

const M = CHAT_ROOM_ASSETS.media

/** Mock 相册列表 */
export const CHAT_GALLERY_ALBUMS: GalleryAlbum[] = [
  { id: 'recents', name: '最近项目', cover: M[0], count: 12 },
  { id: 'favorites', name: '个人收藏', cover: M[1], count: 4 },
  { id: 'camera', name: '相机胶卷', cover: M[2], count: 8 },
  { id: 'screenshots', name: '截屏', cover: M[3], count: 3 },
]

/** Mock 图库（复用会话页媒体资源做演示） */
export const CHAT_GALLERY_ITEMS: GalleryMediaItem[] = [
  { id: 'g1', src: M[0], type: 'image', albumId: 'recents' },
  { id: 'g2', src: M[1], type: 'image', albumId: 'recents' },
  { id: 'g3', src: M[2], type: 'video', duration: '0:04', sizeLabel: '983 KB', albumId: 'recents' },
  { id: 'g4', src: M[3], type: 'image', albumId: 'recents' },
  { id: 'g5', src: M[4], type: 'image', albumId: 'recents' },
  { id: 'g6', src: M[1], type: 'image', albumId: 'recents' },
  { id: 'g7', src: M[2], type: 'image', albumId: 'camera' },
  { id: 'g8', src: M[0], type: 'image', albumId: 'camera' },
  { id: 'g9', src: M[4], type: 'video', duration: '0:12', sizeLabel: '2.1 MB', albumId: 'camera' },
  { id: 'g10', src: M[3], type: 'image', albumId: 'favorites' },
  { id: 'g11', src: M[1], type: 'image', albumId: 'favorites' },
  { id: 'g12', src: M[2], type: 'image', albumId: 'screenshots' },
]

export type ChatMediaSendPayload = {
  items: GalleryMediaItem[]
  caption: string
  hd: boolean
}

export function galleryItemsForAlbum(albumId: string): GalleryMediaItem[] {
  if (albumId === 'recents') return CHAT_GALLERY_ITEMS
  return CHAT_GALLERY_ITEMS.filter((item) => item.albumId === albumId)
}
