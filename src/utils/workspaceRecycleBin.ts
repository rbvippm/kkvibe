import type { WorkspaceTreeNode } from '../constants/versionWorkspace/types'
import { findNode, findParentNodeId, insertNode, removeNode, walkTree } from './workspaceTreeUtils'

export const RECYCLE_BIN_ID = 'node-recycle-bin'
export const RECYCLE_BIN_TITLE = '回收站'

export function isRecycleBinNode(node: WorkspaceTreeNode): boolean {
  return node.id === RECYCLE_BIN_ID || node.title === RECYCLE_BIN_TITLE
}

export function findRecycleBin(nodes: WorkspaceTreeNode[]): WorkspaceTreeNode | null {
  for (const node of nodes) {
    if (isRecycleBinNode(node) && node.type === 'folder') return node
  }
  return null
}

/** 确保回收站存在且固定在版本树末尾 */
export function ensureRecycleBin(nodes: WorkspaceTreeNode[]): WorkspaceTreeNode {
  let bin = findRecycleBin(nodes)
  if (!bin) {
    bin = {
      id: RECYCLE_BIN_ID,
      type: 'folder',
      title: RECYCLE_BIN_TITLE,
      children: [],
    }
    nodes.push(bin)
    return bin
  }

  const index = nodes.findIndex((n) => n.id === bin!.id)
  if (index >= 0 && index !== nodes.length - 1) {
    nodes.splice(index, 1)
    nodes.push(bin)
  }
  if (!bin.children) bin.children = []
  return bin
}

export function isInsideRecycleBin(nodes: WorkspaceTreeNode[], nodeId: string): boolean {
  const bin = findRecycleBin(nodes)
  if (!bin || bin.id === nodeId) return false

  let current: string | null = nodeId
  while (current) {
    const parentId = findParentNodeId(nodes, current)
    if (parentId === bin.id) return true
    current = parentId
  }
  return false
}

export function collectForkIds(node: WorkspaceTreeNode): string[] {
  const ids: string[] = []
  walkTree([node], (n) => {
    if (n.type === 'page' && n.forkId) ids.push(n.forkId)
  })
  return ids
}

export function moveNodeToRecycleBin(nodes: WorkspaceTreeNode[], nodeId: string): WorkspaceTreeNode | null {
  const bin = ensureRecycleBin(nodes)
  const target = findNode(nodes, nodeId)
  if (!target || isRecycleBinNode(target)) return null
  if (isInsideRecycleBin(nodes, nodeId)) return null

  const removed = removeNode(nodes, nodeId)
  if (!removed) return null
  insertNode(nodes, bin.id, removed, bin.children!.length)
  ensureRecycleBin(nodes)
  return removed
}

export function purgeNodeFromRecycleBin(nodes: WorkspaceTreeNode[], nodeId: string): WorkspaceTreeNode | null {
  if (!isInsideRecycleBin(nodes, nodeId)) return null
  return removeNode(nodes, nodeId)
}
