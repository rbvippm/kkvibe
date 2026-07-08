import type { Ref } from 'vue'
import type { PageCatalogItem } from '../constants/versionWorkspace/types'
import { createNodeId, findNode, moveNode } from '../utils/workspaceTreeUtils'
import {
  collectForkIds,
  isRecycleBinNode,
  moveNodeToRecycleBin,
  purgeNodeFromRecycleBin,
} from '../utils/workspaceRecycleBin'
import type { WorkspaceTreeNode } from '../constants/versionWorkspace/types'
import { isWorkspaceEditable } from '../utils/workspaceEditAccess'

export function useWorkspaceTreeOps(tree: Ref<WorkspaceTreeNode[]>, onChange?: () => void) {
  function notify() {
    if (!isWorkspaceEditable()) return
    onChange?.()
  }

  function addFolder(parentId: string | null, title = '新建文件夹') {
    if (!isWorkspaceEditable()) return null
    const node: WorkspaceTreeNode = {
      id: createNodeId('folder'),
      type: 'folder',
      title,
      children: [],
    }
    if (parentId) {
      const parent = findNode(tree.value, parentId)
      if (parent?.type === 'folder') {
        if (!parent.children) parent.children = []
        parent.children.push(node)
        notify()
        return node
      }
    }
    tree.value.push(node)
    notify()
    return node
  }

  function addDoc(parentId: string | null, title = '新建文档') {
    if (!isWorkspaceEditable()) return null
    const node: WorkspaceTreeNode = {
      id: createNodeId('doc'),
      type: 'doc',
      title,
      docContent: '',
    }
    if (parentId) {
      const parent = findNode(tree.value, parentId)
      if (parent?.type === 'folder') {
        if (!parent.children) parent.children = []
        parent.children.push(node)
        notify()
        return node
      }
    }
    tree.value.push(node)
    notify()
    return node
  }

  function addPageFromCatalog(parentId: string | null, item: PageCatalogItem, copyId: string, title: string) {
    if (!isWorkspaceEditable()) return null
    const node: WorkspaceTreeNode = {
      id: createNodeId('page'),
      type: 'page',
      title,
      forkId: copyId,
      pageRef: {
        platform: item.platform,
        routeName: item.routeName,
        path: item.path,
        query: item.query,
      },
    }
    if (parentId) {
      const parent = findInTree(tree.value, parentId)
      if (parent?.type === 'folder') {
        if (!parent.children) parent.children = []
        parent.children.push(node)
      }
    } else {
      tree.value.push(node)
    }
    notify()
    return { node, copyId }
  }

  function renameNode(id: string, title: string) {
    if (!isWorkspaceEditable()) return
    const node = findInTree(tree.value, id)
    if (!node) return
    node.title = title.trim() || node.title
    notify()
  }

  function updateDocContent(id: string, content: string) {
    if (!isWorkspaceEditable()) return
    const node = findInTree(tree.value, id)
    if (!node || node.type !== 'doc') return
    node.docContent = content
    notify()
  }

  function moveToRecycleBin(id: string) {
    if (!isWorkspaceEditable()) return null
    const removed = moveNodeToRecycleBin(tree.value, id)
    if (removed) notify()
    return removed
  }

  function purgeFromRecycleBin(id: string) {
    if (!isWorkspaceEditable()) return null
    const node = findInTree(tree.value, id)
    if (!node) return null
    const forkIds = collectForkIds(node)
    const removed = purgeNodeFromRecycleBin(tree.value, id)
    if (removed) notify()
    return { removed, forkIds }
  }

  /** @deprecated 使用 moveToRecycleBin */
  function deleteNode(id: string) {
    return moveToRecycleBin(id)
  }

  function handleMove(dragId: string, targetParentId: string | null, targetIndex: number) {
    if (!isWorkspaceEditable()) return false
    const dragNode = findInTree(tree.value, dragId)
    if (dragNode && isRecycleBinNode(dragNode)) return false
    if (targetParentId) {
      const targetParent = findInTree(tree.value, targetParentId)
      if (targetParent && isRecycleBinNode(targetParent)) return false
    }
    const ok = moveNode(tree.value, dragId, targetParentId, targetIndex)
    if (ok) notify()
    return ok
  }

  return {
    addFolder,
    addDoc,
    addPageFromCatalog,
    renameNode,
    updateDocContent,
    moveToRecycleBin,
    purgeFromRecycleBin,
    deleteNode,
    handleMove,
  }
}

function findInTree(nodes: WorkspaceTreeNode[], id: string): WorkspaceTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}
