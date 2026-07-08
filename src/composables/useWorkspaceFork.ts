import type { Ref } from 'vue'
import { computed } from 'vue'
import { WORKSPACE_COPY_REGISTRY, WORKSPACE_FORK_REGISTRY } from '../constants/versionWorkspace/forks/registry'
import type { WorkspaceDraftBundle, WorkspacePageCopy } from '../constants/versionWorkspace/types'
import { patchMockData } from '../utils/patchMock'
import { normalizeCopy } from '../utils/workspaceCopy'
import { isDraftBundleValid } from '../utils/workspaceDraft'
import { useWorkspaceInlinePreview } from './workspacePreviewContext'

function loadCopyDraft(copyId: string): WorkspacePageCopy | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('kkvibe-workspace-draft:')) continue
      const bundle = JSON.parse(localStorage.getItem(key) ?? '{}') as WorkspaceDraftBundle
      if (!isDraftBundleValid(bundle)) continue
      if (bundle.forks?.[copyId]) return normalizeCopy(bundle.forks[copyId]!)
    }
  } catch {
    /* ignore */
  }
  return null
}

function resolveCopy(copyId: string | undefined): WorkspacePageCopy | null {
  if (!copyId) return null
  const base = WORKSPACE_COPY_REGISTRY[copyId] ?? WORKSPACE_FORK_REGISTRY[copyId]
  const draft = loadCopyDraft(copyId)
  if (!base && !draft) return null
  return normalizeCopy({
    ...(base ?? { copyId, sourceCatalogId: '', sourceRouteName: '', title: '', mockPatches: {}, updatedAt: '' }),
    ...draft,
    copyId,
    mockPatches: { ...(base?.mockPatches ?? {}), ...(draft?.mockPatches ?? {}) },
    uiPatches: { ...(base?.uiPatches ?? {}), ...(draft?.uiPatches ?? {}) },
  })
}

/** 页面内读取 Fork 覆盖（URL 带 forkId 时生效） */
export function useWorkspaceFork() {
  const { previewQuery, isWorkspacePreview } = useWorkspaceInlinePreview()

  const forkId = computed(() => {
    const raw = previewQuery.value.forkId
    return typeof raw === 'string' ? raw : undefined
  })
  const fork = computed(() => resolveCopy(forkId.value))

  function patchMock<T extends Record<string, unknown>>(base: T): T {
    const f = fork.value
    if (!f?.mockPatches || !Object.keys(f.mockPatches).length) return base
    return patchMockData(base, f.mockPatches)
  }

  function uiText(key: string, fallback: string): string {
    return fork.value?.uiPatches?.[key] ?? fallback
  }

  return {
    forkId,
    fork,
    isWorkspacePreview,
    patchMock,
    uiText,
  }
}

export function useWorkspaceForkPanel(
  getCopyFn: (id: string) => WorkspacePageCopy | null,
  updateCopyFn: (id: string, patch: Partial<WorkspacePageCopy>) => void,
  copyId: Ref<string | undefined>,
) {
  const copy = computed(() => (copyId.value ? getCopyFn(copyId.value) : null))
  return { copy, updateCopy: updateCopyFn }
}
