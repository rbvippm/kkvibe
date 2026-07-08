/** 版本管理工作台 · 数据类型 */

export type WorkspacePlatform = 'pc' | 'mobile' | 'agent'

export type WorkspaceNodeType = 'folder' | 'page' | 'doc'

export interface PageRef {
  platform: WorkspacePlatform
  routeName: string
  path: string
  query?: Record<string, string>
}

export interface WorkspaceTreeNode {
  id: string
  type: WorkspaceNodeType
  title: string
  children?: WorkspaceTreeNode[]
  pageRef?: PageRef
  /** 版本内页面副本 ID（与源路由解耦） */
  forkId?: string
  docContent?: string
}

export interface VersionWorkspace {
  id: string
  versionLabel: string
  title: string
  updatedAt: string
  tree: WorkspaceTreeNode[]
}

/** 版本内页面副本（从页面库复制，独立二次编辑与标注） */
export interface WorkspaceAnnotationItem {
  no: number
  title: string
  items: string[]
  changeType: 'new' | 'modified' | 'removed'
  status: 'draft' | 'synced'
}

export interface WorkspacePageCopy {
  copyId: string
  sourceCatalogId: string
  sourceRouteName: string
  title: string
  annotationRound: number
  sourceViewPath?: string
  sourceSpecPath?: string
  sourceDocPath?: string
  annotComponent?: 'WfSpecAnnot' | 'Mh5SpecAnnot'
  changeSummary?: string
  annotations: WorkspaceAnnotationItem[]
  mockPatches: Record<string, unknown>
  uiPatches?: Record<string, string>
  notes?: string
  updatedAt: string
}

/** @deprecated 使用 WorkspacePageCopy */
export type WorkspacePageFork = WorkspacePageCopy & { forkId: string }

export interface PageCatalogItem {
  id: string
  platform: WorkspacePlatform
  routeName: string
  path: string
  title: string
  group: string
  pagePath?: string[]
  query?: Record<string, string>
}

export interface WorkspaceDraftBundle {
  versionId: string
  tree: WorkspaceTreeNode[]
  forks: Record<string, WorkspacePageCopy>
  savedAt: string
  seedVersion?: number
}
