import type { PageRef } from '../constants/versionWorkspace/types'

/** 生成工作台 iframe 预览地址 */
export function buildWorkspacePreviewUrl(pageRef: PageRef, forkId?: string): string {
  const params = new URLSearchParams()
  params.set('workspacePreview', '1')
  if (forkId) params.set('forkId', forkId)
  if (pageRef.query) {
    for (const [k, v] of Object.entries(pageRef.query)) {
      params.set(k, v)
    }
  }
  const qs = params.toString()
  return `${pageRef.path}${qs ? `?${qs}` : ''}`
}

export const WORKSPACE_DRAFT_PREFIX = 'kkvibe-workspace-draft:'

export function getDraftStorageKey(versionId: string): string {
  return `${WORKSPACE_DRAFT_PREFIX}${versionId}`
}
