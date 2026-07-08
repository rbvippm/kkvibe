import type { WorkspaceTreeNode } from '../constants/versionWorkspace/types'

export function createNodeId(prefix = 'node'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function cloneTree(nodes: WorkspaceTreeNode[]): WorkspaceTreeNode[] {
  return JSON.parse(JSON.stringify(nodes)) as WorkspaceTreeNode[]
}

type TreeLocation = {
  parent: WorkspaceTreeNode[] | null
  index: number
  node: WorkspaceTreeNode
}

export function findNodeLocation(
  nodes: WorkspaceTreeNode[],
  id: string,
  parent: WorkspaceTreeNode[] | null = null,
): TreeLocation | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (node.id === id) return { parent, index: i, node }
    if (node.children?.length) {
      const found = findNodeLocation(node.children, id, node.children)
      if (found) return found
    }
  }
  return null
}

export function findNode(nodes: WorkspaceTreeNode[], id: string): WorkspaceTreeNode | null {
  return findNodeLocation(nodes, id)?.node ?? null
}

export function removeNode(nodes: WorkspaceTreeNode[], id: string): WorkspaceTreeNode | null {
  const loc = findNodeLocation(nodes, id)
  if (!loc) return null
  const list = loc.parent ?? nodes
  const [removed] = list.splice(loc.index, 1)
  return removed ?? null
}

export function insertNode(
  nodes: WorkspaceTreeNode[],
  targetParentId: string | null,
  node: WorkspaceTreeNode,
  index?: number,
): boolean {
  if (!targetParentId) {
    const at = index ?? nodes.length
    nodes.splice(at, 0, node)
    return true
  }
  const parent = findNode(nodes, targetParentId)
  if (!parent || parent.type !== 'folder') return false
  if (!parent.children) parent.children = []
  const at = index ?? parent.children.length
  parent.children.splice(at, 0, node)
  return true
}

export function moveNode(
  nodes: WorkspaceTreeNode[],
  dragId: string,
  targetParentId: string | null,
  targetIndex: number,
): boolean {
  const srcLoc = findNodeLocation(nodes, dragId)
  if (!srcLoc) return false

  const dragNode = srcLoc.node
  if (dragNode.id === targetParentId) return false
  if (targetParentId && isDescendant(dragNode, targetParentId)) return false

  if (targetParentId) {
    const parent = findNode(nodes, targetParentId)
    if (!parent || parent.type !== 'folder') return false
  }

  const targetList = targetParentId ? findNode(nodes, targetParentId)?.children : nodes
  const srcList = srcLoc.parent ?? nodes
  const sameList = srcList === targetList

  let insertIndex = Math.max(0, targetIndex)
  if (sameList && srcLoc.index < insertIndex) {
    insertIndex -= 1
  }

  const list = srcLoc.parent ?? nodes
  list.splice(srcLoc.index, 1)

  return insertNode(nodes, targetParentId, dragNode, insertIndex)
}

function isDescendant(node: WorkspaceTreeNode, targetId: string): boolean {
  if (!node.children?.length) return false
  for (const child of node.children) {
    if (child.id === targetId) return true
    if (isDescendant(child, targetId)) return true
  }
  return false
}

export function findParentNodeId(
  nodes: WorkspaceTreeNode[],
  targetId: string,
  parentId: string | null = null,
): string | null {
  for (const node of nodes) {
    if (node.id === targetId) return parentId
    if (node.children?.length) {
      const hit = findParentNodeId(node.children, targetId, node.id)
      if (hit !== null) return hit
    }
  }
  return null
}

export function walkTree(nodes: WorkspaceTreeNode[], visit: (node: WorkspaceTreeNode, depth: number) => void, depth = 0) {
  for (const node of nodes) {
    visit(node, depth)
    if (node.children?.length) walkTree(node.children, visit, depth + 1)
  }
}
