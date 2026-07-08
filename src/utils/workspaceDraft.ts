import { WORKSPACE_DRAFT_SEED_VERSION } from '../constants/versionWorkspace/manifest'
import type { WorkspaceDraftBundle, WorkspaceTreeNode } from '../constants/versionWorkspace/types'
import { WORKSPACE_DRAFT_PREFIX, getDraftStorageKey } from './workspacePreview'

/** 已从默认树移除的历史顶层目录 */
const DEPRECATED_ROOT_TITLES = new Set(['开放平台', '功能BUG&优化', '需求概要'])

export function hasDeprecatedRootStructure(tree: WorkspaceTreeNode[]): boolean {
  return tree.some((node) => DEPRECATED_ROOT_TITLES.has(node.title))
}

export function isDraftBundleValid(
  draft: WorkspaceDraftBundle | null | undefined,
  seedVersion = WORKSPACE_DRAFT_SEED_VERSION,
): draft is WorkspaceDraftBundle {
  if (!draft || typeof draft !== 'object') return false
  if (draft.seedVersion !== seedVersion) return false
  if (!Array.isArray(draft.tree) || !draft.tree.length) return false
  if (hasDeprecatedRootStructure(draft.tree)) return false
  return true
}

/** 清理过期或结构不合法的本地草稿 */
export function purgeStaleWorkspaceDrafts(seedVersion = WORKSPACE_DRAFT_SEED_VERSION): number {
  if (typeof localStorage === 'undefined') return 0

  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(WORKSPACE_DRAFT_PREFIX)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) {
        keysToRemove.push(key)
        continue
      }
      const draft = JSON.parse(raw) as WorkspaceDraftBundle
      if (!isDraftBundleValid(draft, seedVersion)) {
        keysToRemove.push(key)
      }
    } catch {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
  return keysToRemove.length
}

export function loadWorkspaceDraft(
  versionId: string,
  seedVersion = WORKSPACE_DRAFT_SEED_VERSION,
): WorkspaceDraftBundle | null {
  purgeStaleWorkspaceDrafts(seedVersion)

  try {
    const raw = localStorage.getItem(getDraftStorageKey(versionId))
    if (!raw) return null
    const draft = JSON.parse(raw) as WorkspaceDraftBundle
    if (!isDraftBundleValid(draft, seedVersion)) {
      localStorage.removeItem(getDraftStorageKey(versionId))
      return null
    }
    return draft
  } catch {
    localStorage.removeItem(getDraftStorageKey(versionId))
    return null
  }
}

export function saveWorkspaceDraft(bundle: WorkspaceDraftBundle) {
  localStorage.setItem(
    getDraftStorageKey(bundle.versionId),
    JSON.stringify({ ...bundle, seedVersion: WORKSPACE_DRAFT_SEED_VERSION }),
  )
}
