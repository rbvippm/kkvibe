import { computed, ref } from 'vue'
import { findVersionWorkspace, VERSION_WORKSPACES, WORKSPACE_DRAFT_SEED_VERSION } from '../constants/versionWorkspace/manifest'
import { WORKSPACE_COPY_REGISTRY } from '../constants/versionWorkspace/forks/registry'
import type {
  PageCatalogItem,
  VersionWorkspace,
  WorkspaceDraftBundle,
  WorkspacePageCopy,
  WorkspaceTreeNode,
} from '../constants/versionWorkspace/types'
import {
  buildAnnotationExportSnippet,
  buildCursorEditPrompt,
  buildPermanentDeletePrompt,
  createPageCopyFromCatalog,
  nextAnnotationRound,
  normalizeCopy,
} from '../utils/workspaceCopy'
import { ensureRecycleBin } from '../utils/workspaceRecycleBin'
import { loadWorkspaceDraft, saveWorkspaceDraft } from '../utils/workspaceDraft'
import { isWorkspaceEditable } from '../utils/workspaceEditAccess'
import { cloneTree } from '../utils/workspaceTreeUtils'
import { getDraftStorageKey } from '../utils/workspacePreview'

function mergeCopy(registry: WorkspacePageCopy | undefined, override: WorkspacePageCopy | undefined, copyId: string): WorkspacePageCopy | null {
  if (!registry && !override) return null
  return normalizeCopy({
    ...(registry ?? { copyId, sourceCatalogId: '', sourceRouteName: '', title: '页面副本', mockPatches: {}, updatedAt: '' }),
    ...override,
    copyId,
    mockPatches: { ...(registry?.mockPatches ?? {}), ...(override?.mockPatches ?? {}) },
    uiPatches: { ...(registry?.uiPatches ?? {}), ...(override?.uiPatches ?? {}) },
    annotations: override?.annotations?.length ? override.annotations : (registry?.annotations ?? []),
  })
}

export function useWorkspaceEditor(versionId: string) {
  const baseWorkspace = findVersionWorkspace(versionId)
  if (!baseWorkspace) throw new Error(`未找到版本：${versionId}`)
  const base = baseWorkspace

  const draft = isWorkspaceEditable() ? loadWorkspaceDraft(versionId) : null
  const tree = ref<WorkspaceTreeNode[]>(cloneTree(draft?.tree ?? base.tree))
  ensureRecycleBin(tree.value)
  const copyOverrides = ref<Record<string, WorkspacePageCopy>>({})
  if (draft?.forks) {
    for (const [id, raw] of Object.entries(draft.forks)) {
      copyOverrides.value[id] = normalizeCopy({ ...raw, copyId: raw.copyId ?? id })
    }
  }
  const dirty = ref(false)
  const selectedNodeId = ref<string | null>(null)

  const meta = computed(() => ({
    ...base,
    tree: tree.value,
  }))

  function markDirty() {
    if (!isWorkspaceEditable()) return
    dirty.value = true
    saveWorkspaceDraft({
      versionId,
      tree: cloneTree(tree.value),
      forks: { ...copyOverrides.value },
      savedAt: new Date().toISOString(),
    })
  }

  function getCopy(copyId: string | undefined): WorkspacePageCopy | null {
    if (!copyId) return null
    return mergeCopy(WORKSPACE_COPY_REGISTRY[copyId], copyOverrides.value[copyId], copyId)
  }

  /** @deprecated 兼容旧名 */
  const getFork = getCopy

  function registerPageCopy(item: PageCatalogItem): WorkspacePageCopy {
    if (!isWorkspaceEditable()) {
      throw new Error('预览环境不可保留副本')
    }
    const copy = createPageCopyFromCatalog(item, base.versionLabel)
    copyOverrides.value[copy.copyId] = copy
    markDirty()
    return copy
  }

  function updateCopy(copyId: string, patch: Partial<WorkspacePageCopy>) {
    if (!isWorkspaceEditable()) return
    const current = getCopy(copyId)
    if (!current) return
    copyOverrides.value[copyId] = normalizeCopy({ ...current, ...patch, copyId })
    markDirty()
  }

  function completeAnnotationRound(copyId: string) {
    if (!isWorkspaceEditable()) return
    const current = getCopy(copyId)
    if (!current) return
    copyOverrides.value[copyId] = nextAnnotationRound(current)
    markDirty()
  }

  function getCursorPrompt(copyId: string): string {
    const copy = getCopy(copyId)
    if (!copy) return ''
    return buildCursorEditPrompt(copy, base.versionLabel, base.title)
  }

  function exportCopyAnnotations(copyId: string): string {
    const copy = getCopy(copyId)
    if (!copy) return ''
    return buildAnnotationExportSnippet(copy, versionId, base.versionLabel)
  }

  function resetCopy(copyId: string) {
    if (!isWorkspaceEditable()) return
    delete copyOverrides.value[copyId]
    markDirty()
  }

  /** 彻底删除：清理副本元数据，并生成删除磁盘副本文件的 Cursor 指引 */
  function permanentDeleteCopies(copyIds: string[]): string {
    if (!isWorkspaceEditable()) {
      return '预览环境不可彻底删除副本'
    }
    const copies: WorkspacePageCopy[] = []
    for (const copyId of copyIds) {
      const copy = getCopy(copyId)
      if (copy) copies.push(copy)
      delete copyOverrides.value[copyId]
    }
    if (copyIds.length) markDirty()
    if (!copies.length) {
      return [
        '# 彻底删除',
        '',
        '未找到副本元数据，请在工作区搜索 copyId 并手动删除 .copy.vue / .copy.ts 文件。',
        copyIds.length ? `copyIds: ${copyIds.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
    return buildPermanentDeletePrompt(copies, versionId, base.versionLabel, base.title)
  }

  function resetToRepo() {
    if (!isWorkspaceEditable()) return
    tree.value = cloneTree(base.tree)
    copyOverrides.value = {}
    dirty.value = false
    localStorage.removeItem(getDraftStorageKey(versionId))
  }

  function exportBundle(): WorkspaceDraftBundle {
    return {
      versionId,
      tree: cloneTree(tree.value),
      forks: { ...copyOverrides.value },
      savedAt: new Date().toISOString(),
      seedVersion: WORKSPACE_DRAFT_SEED_VERSION,
    }
  }

  function exportAsJson(): string {
    return JSON.stringify(exportBundle(), null, 2)
  }

  function exportAsTsSnippet(): string {
    const bundle = exportBundle()
    return `// 合并到 manifest.ts 与 copies/registry.ts\n${JSON.stringify(bundle, null, 2)}`
  }

  return {
    meta,
    tree,
    copyOverrides,
    forkOverrides: copyOverrides,
    dirty,
    selectedNodeId,
    markDirty,
    getCopy,
    getFork,
    registerPageCopy,
    updateCopy,
    updateFork: updateCopy,
    completeAnnotationRound,
    getCursorPrompt,
    exportCopyAnnotations,
    resetCopy,
    resetFork:     resetCopy,
    permanentDeleteCopies,
    resetToRepo,
    exportBundle,
    exportAsJson,
    exportAsTsSnippet,
  }
}

export function listVersionWorkspaces(): VersionWorkspace[] {
  return VERSION_WORKSPACES
}
