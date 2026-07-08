import { computed } from 'vue'
import { isWorkspaceEditable } from '../utils/workspaceEditAccess'

/** 工作台是否处于可编辑模式（发布预览域名为只读） */
export function useWorkspaceEditAccess() {
  const canEdit = computed(() => isWorkspaceEditable())
  return { canEdit }
}
