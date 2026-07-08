<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WorkspaceTreeNode } from '../../constants/versionWorkspace/types'
import { findNode, findParentNodeId } from '../../utils/workspaceTreeUtils'
import { RECYCLE_BIN_ID, isRecycleBinNode } from '../../utils/workspaceRecycleBin'

const TREE_MIME = 'application/x-workspace-tree'
const CATALOG_MIME = 'application/x-workspace-catalog'
const ROOT_DROP_ID = '__root__'

type DropPosition = 'before' | 'after' | 'inside'
type DropTarget = { nodeId: string; position: DropPosition }

const props = defineProps<{
  tree: WorkspaceTreeNode[]
  selectedId: string | null
  editable?: boolean
  createTargetTitle?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  rename: [id: string, title: string]
  delete: [id: string]
  purge: [id: string]
  move: [dragId: string, targetParentId: string | null, targetIndex: number]
  dropCatalog: [catalogId: string, parentId: string | null]
  addFolder: []
  addDoc: []
  openPageLibrary: []
}>()

const editingId = ref<string | null>(null)
const editingTitle = ref('')
const dropTarget = ref<DropTarget | null>(null)
const treeFilter = ref('')
const draggingId = ref<string | null>(null)

const dragEnabled = computed(() => props.editable !== false && !treeFilter.value.trim())

type FlatRow = { node: WorkspaceTreeNode; depth: number; parentId: string | null }

function flatten(nodes: WorkspaceTreeNode[], depth = 0, parentId: string | null = null): FlatRow[] {
  const rows: FlatRow[] = []
  for (const node of nodes) {
    rows.push({ node, depth, parentId })
    if (node.type === 'folder' && node.children?.length) {
      rows.push(...flatten(node.children, depth + 1, node.id))
    }
  }
  return rows
}

const flatRows = computed(() => {
  const kw = treeFilter.value.trim().toLowerCase()
  const all = flatten(props.tree)
  if (!kw) return all
  return all.filter((row) => row.node.title.toLowerCase().includes(kw))
})

function iconFor(node: WorkspaceTreeNode) {
  if (isRecycleBinNode(node)) return '🗑️'
  if (node.type === 'folder') return '📁'
  if (node.type === 'doc') return '📄'
  return '📱'
}

function isInRecycleBin(nodeId: string): boolean {
  let parentId = findParentNodeId(props.tree, nodeId)
  while (parentId) {
    if (parentId === RECYCLE_BIN_ID) return true
    parentId = findParentNodeId(props.tree, parentId)
  }
  return false
}

function canDragNode(node: WorkspaceTreeNode) {
  return props.editable !== false && dragEnabled.value && !isRecycleBinNode(node)
}

function startRename(node: WorkspaceTreeNode) {
  if (props.editable === false) return
  editingId.value = node.id
  editingTitle.value = node.title
}

function commitRename(node: WorkspaceTreeNode) {
  const title = editingTitle.value.trim()
  if (title && title !== node.title) emit('rename', node.id, title)
  editingId.value = null
}

function calcDropPosition(e: DragEvent, row: FlatRow): DropPosition {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const ratio = (e.clientY - rect.top) / Math.max(rect.height, 1)

  if (row.node.type === 'folder') {
    if (ratio < 0.28) return 'before'
    if (ratio > 0.72) return 'after'
    return 'inside'
  }
  return ratio < 0.5 ? 'before' : 'after'
}

function resolveMoveTarget(row: FlatRow, position: DropPosition) {
  if (position === 'inside' && row.node.type === 'folder') {
    return {
      targetParentId: row.node.id,
      targetIndex: row.node.children?.length ?? 0,
    }
  }

  const parentList = row.parentId ? findNode(props.tree, row.parentId)?.children : props.tree
  const index = parentList?.findIndex((n) => n.id === row.node.id) ?? -1
  if (index < 0) return null

  if (position === 'before') {
    return { targetParentId: row.parentId, targetIndex: index }
  }
  return { targetParentId: row.parentId, targetIndex: index + 1 }
}

function onDragStartTree(e: DragEvent, nodeId: string) {
  if (props.editable === false) {
    e.preventDefault()
    return
  }
  const node = findNode(props.tree, nodeId)
  if (!dragEnabled.value || editingId.value || (node && isRecycleBinNode(node))) {
    e.preventDefault()
    return
  }
  draggingId.value = nodeId
  e.dataTransfer?.setData(TREE_MIME, nodeId)
  e.dataTransfer!.effectAllowed = 'move'
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDragEnd() {
  draggingId.value = null
  dropTarget.value = null
}

function onDragOverRow(e: DragEvent, row: FlatRow) {
  if (props.editable === false) return
  e.preventDefault()
  e.stopPropagation()
  if (!draggingId.value || draggingId.value === row.node.id) return

  const isCatalog = e.dataTransfer?.types.includes(CATALOG_MIME)
  e.dataTransfer!.dropEffect = isCatalog ? 'copy' : 'move'
  dropTarget.value = { nodeId: row.node.id, position: calcDropPosition(e, row) }
}

function onDropRow(e: DragEvent, row: FlatRow) {
  if (props.editable === false) return
  e.preventDefault()
  e.stopPropagation()

  const catalogId = e.dataTransfer?.getData(CATALOG_MIME)
  const position = dropTarget.value?.nodeId === row.node.id ? dropTarget.value.position : calcDropPosition(e, row)
  dropTarget.value = null
  draggingId.value = null

  if (catalogId) {
    const parentId =
      position === 'inside' && row.node.type === 'folder'
        ? row.node.id
        : row.parentId
    const parentNode = parentId ? findNode(props.tree, parentId) : null
    if (parentNode && isRecycleBinNode(parentNode)) return
    emit('dropCatalog', catalogId, parentId)
    return
  }

  if (position === 'inside' && row.node.type === 'folder' && isRecycleBinNode(row.node)) return

  const dragId = e.dataTransfer?.getData(TREE_MIME)
  if (!dragId || dragId === row.node.id) return

  const target = resolveMoveTarget(row, position)
  if (!target) return
  emit('move', dragId, target.targetParentId, target.targetIndex)
}

function onDragLeaveRow(e: DragEvent, row: FlatRow) {
  const related = e.relatedTarget as Node | null
  if (related && (e.currentTarget as HTMLElement).contains(related)) return
  if (dropTarget.value?.nodeId === row.node.id) dropTarget.value = null
}

function onBodyDragOver(e: DragEvent) {
  if (props.editable === false) return
  if ((e.target as HTMLElement).closest('.ws-tree-item')) return
  e.preventDefault()
  if (!draggingId.value) return
  e.dataTransfer!.dropEffect = 'move'
  dropTarget.value = { nodeId: ROOT_DROP_ID, position: 'after' }
}

function onBodyDragLeave(e: DragEvent) {
  const related = e.relatedTarget as Node | null
  if (related && (e.currentTarget as HTMLElement).contains(related)) return
  if (dropTarget.value?.nodeId === ROOT_DROP_ID) dropTarget.value = null
}

function onBodyDrop(e: DragEvent) {
  if (props.editable === false) return
  if ((e.target as HTMLElement).closest('.ws-tree-item')) return
  e.preventDefault()
  dropTarget.value = null
  draggingId.value = null

  const catalogId = e.dataTransfer?.getData(CATALOG_MIME)
  if (catalogId) {
    emit('dropCatalog', catalogId, null)
    return
  }

  const dragId = e.dataTransfer?.getData(TREE_MIME)
  if (dragId) emit('move', dragId, null, props.tree.length)
}

function isDropTarget(row: FlatRow, position: DropPosition) {
  return dropTarget.value?.nodeId === row.node.id && dropTarget.value.position === position
}

function confirmDelete(node: WorkspaceTreeNode) {
  if (props.editable === false) return
  if (isRecycleBinNode(node)) return

  if (isInRecycleBin(node.id)) {
    const hint = node.type === 'page' ? '将删除副本文件与登记信息' : '将删除文件夹内所有副本文件'
    if (window.confirm(`彻底删除「${node.title}」？\n${hint}，不可恢复。`)) {
      emit('purge', node.id)
    }
    return
  }

  if (window.confirm(`将「${node.title}」移到回收站？\n可在回收站中彻底删除。`)) {
    emit('delete', node.id)
  }
}

function onSelect(id: string) {
  if (editingId.value) return
  emit('select', id)
}
</script>

<template>
  <div class="ws-tree" :class="{ 'ws-tree--dragging': draggingId, 'ws-tree--readonly': editable === false }">
    <div v-if="editable !== false" class="ws-tree__toolbar">
      <button type="button" class="ws-btn ws-btn--sm" @click="emit('addFolder')">新建文件夹</button>
      <button type="button" class="ws-btn ws-btn--sm" @click="emit('addDoc')">新建文档</button>
      <button type="button" class="ws-btn ws-btn--sm ws-tree__picker-btn" @click="emit('openPageLibrary')">
        页面库
      </button>
    </div>
    <p v-else class="ws-tree__readonly-hint">预览模式：点击节点浏览页面</p>
    <p v-if="createTargetTitle" class="ws-tree__create-hint">
      将添加到：{{ createTargetTitle }}
    </p>
    <input
      v-model="treeFilter"
      class="ws-tree__search"
      type="search"
      placeholder="搜索节点…"
      aria-label="搜索版本树"
    />
    <p v-if="!dragEnabled" class="ws-tree__filter-hint">搜索模式下暂不支持拖拽排序</p>
    <div
      class="ws-tree__body"
      :class="{ 'ws-tree__body--root-drop': dropTarget?.nodeId === ROOT_DROP_ID }"
      @dragover="onBodyDragOver"
      @dragleave="onBodyDragLeave"
      @drop="onBodyDrop"
    >
      <div
        v-for="row in flatRows"
        :key="row.node.id"
        class="ws-tree-item"
        :class="{
          'ws-tree-item--active': selectedId === row.node.id,
          'ws-tree-item--dragging': draggingId === row.node.id,
          'ws-tree-item--recycle-bin': isRecycleBinNode(row.node),
          'ws-tree-item--in-recycle': isInRecycleBin(row.node.id),
          'ws-tree-item--drop-before': isDropTarget(row, 'before'),
          'ws-tree-item--drop-after': isDropTarget(row, 'after'),
          'ws-tree-item--drop-inside': isDropTarget(row, 'inside'),
        }"
        :style="{ '--depth': row.depth }"
        @click="onSelect(row.node.id)"
        @dragover="onDragOverRow($event, row)"
        @drop="onDropRow($event, row)"
        @dragleave="onDragLeaveRow($event, row)"
      >
        <span
          v-if="editable !== false"
          class="ws-tree-item__handle"
          :class="{ 'ws-tree-item__handle--disabled': !canDragNode(row.node) }"
          :title="'拖拽排序'"
          aria-label="拖拽排序"
          :draggable="canDragNode(row.node) && editingId !== row.node.id"
          @dragstart="onDragStartTree($event, row.node.id)"
          @dragend="onDragEnd"
          @mousedown.stop
          @click.stop
        >⋮⋮</span>
        <span v-else class="ws-tree-item__handle ws-tree-item__handle--readonly" aria-hidden="true" />
        <span class="ws-tree-item__icon">{{ iconFor(row.node) }}</span>
        <input
          v-if="editingId === row.node.id && !isRecycleBinNode(row.node)"
          v-model="editingTitle"
          class="ws-tree-item__input"
          @click.stop
          @mousedown.stop
          @keydown.enter.prevent="commitRename(row.node)"
          @keydown.esc.prevent="editingId = null"
          @blur="commitRename(row.node)"
        />
        <span v-else class="ws-tree-item__label">{{ row.node.title }}</span>
        <div
          v-if="editable !== false && !isRecycleBinNode(row.node)"
          class="ws-tree-item__actions"
          @click.stop
          @mousedown.stop
        >
          <button
            v-if="!isInRecycleBin(row.node.id)"
            type="button"
            title="重命名"
            @click="startRename(row.node)"
          >
            ✎
          </button>
          <button
            v-if="isInRecycleBin(row.node.id)"
            type="button"
            class="ws-tree-item__purge"
            title="彻底删除"
            @click="confirmDelete(row.node)"
          >
            彻底删除
          </button>
          <button
            v-else
            type="button"
            title="移到回收站"
            @click="confirmDelete(row.node)"
          >
            ×
          </button>
        </div>
      </div>

      <div
        v-if="draggingId && dragEnabled"
        class="ws-tree__root-drop"
        :class="{ 'ws-tree__root-drop--active': dropTarget?.nodeId === ROOT_DROP_ID }"
      >
        拖到此处移至版本根目录
      </div>

      <p v-if="!flatRows.length" class="ws-tree__empty">
        <template v-if="editable === false">暂无节点</template>
        <template v-else>暂无节点<br />可新建文件夹，或点击「页面库」选择页面预览</template>
      </p>
    </div>
  </div>
</template>
