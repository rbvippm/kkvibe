<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import WorkspaceTreePanel from '../../components/workspace/WorkspaceTreePanel.vue'
import WorkspacePagePickerModal from '../../components/workspace/WorkspacePagePickerModal.vue'
import WorkspacePreviewPanel from '../../components/workspace/WorkspacePreviewPanel.vue'
import { useWorkspaceEditor } from '../../composables/useWorkspaceEditor'
import { useWorkspaceEditAccess } from '../../composables/useWorkspaceEditAccess'
import { useWorkspaceTreeOps } from '../../composables/useWorkspaceTree'
import { findCatalogItem } from '../../config/pageCatalog'
import type { PageCatalogItem } from '../../constants/versionWorkspace/types'
import { findNode, findParentNodeId } from '../../utils/workspaceTreeUtils'
import {
  isInsideRecycleBin,
  isRecycleBinNode,
} from '../../utils/workspaceRecycleBin'
import { buildRetainCopyPrompt } from '../../utils/workspaceCopy'
import {
  serializeRevisionTable,
  type RevisionTableRow,
} from '../../utils/parseRevisionTable'
import { WORKSPACE_DRAFT_SEED_VERSION } from '../../constants/versionWorkspace/manifest'

const props = defineProps<{
  versionId: string
}>()

const editor = useWorkspaceEditor(props.versionId)
const { canEdit } = useWorkspaceEditAccess()
const { meta, tree, selectedNodeId, markDirty, registerPageCopy, permanentDeleteCopies } = editor

const treeOps = useWorkspaceTreeOps(tree, markDirty)
const pickerOpen = ref(false)
const pendingCatalogItem = ref<PageCatalogItem | null>(null)
const retainTargetParentId = ref<string | null>(null)
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const selectedNode = computed(() =>
  selectedNodeId.value ? findNode(tree.value, selectedNodeId.value) : null,
)

/** 记住最近一次在树中选中的目标目录，避免预览页面临时清空选中后新建落到根目录 */
const lastCreateParentId = ref<string | null>(null)

function resolveCreateParentId(nodeId: string | null): string | null {
  if (!nodeId) return lastCreateParentId.value
  const node = findNode(tree.value, nodeId)
  if (!node) return lastCreateParentId.value
  if (isRecycleBinNode(node) || isInsideRecycleBin(tree.value, nodeId)) {
    return lastCreateParentId.value
  }
  if (node.type === 'folder') return node.id
  return findParentNodeId(tree.value, nodeId)
}

const createParentId = computed(() => resolveCreateParentId(selectedNodeId.value))

const createTargetTitle = computed(() => {
  const parentId = createParentId.value
  if (!parentId) return '版本根目录'
  return findNode(tree.value, parentId)?.title ?? '文件夹'
})

const catalogTargetFolderTitle = computed(() => {
  const parentId = retainTargetParentId.value ?? createParentId.value
  if (!parentId) return '版本根目录'
  return findNode(tree.value, parentId)?.title ?? '文件夹'
})

const canRetain = computed(() => canEdit.value && Boolean(pendingCatalogItem.value))

const retainButtonTitle = computed(() => {
  if (!canEdit.value) return '预览环境仅支持浏览，不可保留副本'
  if (canRetain.value) {
    return `将「${pendingCatalogItem.value!.title}」保留到「${catalogTargetFolderTitle.value}」`
  }
  return '请先从页面库选择页面预览'
})

function showToast(message: string) {
  toastMessage.value = message
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2800)
}

function selectNode(id: string) {
  selectedNodeId.value = id
  pendingCatalogItem.value = null
  lastCreateParentId.value = resolveCreateParentId(id)
}

function onAddFolder() {
  if (!canEdit.value) return
  const parentId = createParentId.value
  const node = treeOps.addFolder(parentId)
  if (!node) return
  selectedNodeId.value = node.id
  lastCreateParentId.value = node.id
  pendingCatalogItem.value = null
}

function onAddDoc() {
  if (!canEdit.value) return
  const parentId = createParentId.value
  const node = treeOps.addDoc(parentId)
  if (!node) return
  selectedNodeId.value = node.id
  pendingCatalogItem.value = null
}

function closePreview() {
  if (pendingCatalogItem.value) {
    pendingCatalogItem.value = null
    retainTargetParentId.value = null
    selectedNodeId.value = lastCreateParentId.value
    return
  }
  if (selectedNode.value?.type === 'page') {
    selectedNodeId.value = lastCreateParentId.value
  }
}

function openPageLibrary() {
  if (!canEdit.value) return
  retainTargetParentId.value = createParentId.value
  pickerOpen.value = true
}

function previewCatalogItem(item: PageCatalogItem) {
  if (!canEdit.value) return
  pendingCatalogItem.value = item
  if (retainTargetParentId.value === null) {
    retainTargetParentId.value = createParentId.value
  }
  selectedNodeId.value = null
}

function onPickCatalog(catalogId: string) {
  if (!canEdit.value) return
  const item = findCatalogItem(catalogId)
  if (!item) return
  previewCatalogItem(item)
  pickerOpen.value = false
  showToast(`已加载「${item.title}」预览，确认后点击顶部「保留副本」`)
}

function onDropCatalog(catalogId: string, parentId: string | null) {
  if (!canEdit.value) return
  retainTargetParentId.value = parentId
  const item = findCatalogItem(catalogId)
  if (!item) return
  previewCatalogItem(item)
  showToast(`已加载「${item.title}」源页面预览`)
}

function onDeleteNode(id: string) {
  if (!canEdit.value) return
  const removed = treeOps.moveToRecycleBin(id)
  if (!removed) return
  if (selectedNodeId.value === id) selectedNodeId.value = null
  showToast(`已移到回收站：${removed.title}`)
}

async function onPurgeNode(id: string) {
  if (!canEdit.value) return
  const result = treeOps.purgeFromRecycleBin(id)
  if (!result?.removed) return
  if (selectedNodeId.value === id) selectedNodeId.value = null
  const prompt = permanentDeleteCopies(result.forkIds)
  try {
    await navigator.clipboard.writeText(prompt)
    showToast(`已彻底删除「${result.removed.title}」，删文件指引已写入剪贴板`)
  } catch {
    showToast(`已彻底删除「${result.removed.title}」`)
  }
}

async function onSaveRevision(rows: RevisionTableRow[]) {
  if (!canEdit.value) return
  const node = selectedNode.value
  if (!node || node.type !== 'doc' || node.title !== '修订记录') return
  const markdown = serializeRevisionTable(rows)
  treeOps.updateDocContent(node.id, markdown)
  showToast('修订记录已保存到本地草稿')
}

async function onRetainCopy() {
  if (!canEdit.value) return
  const item = pendingCatalogItem.value
  if (!item) return
  const parentId = retainTargetParentId.value ?? createParentId.value
  const folderTitle = catalogTargetFolderTitle.value
  let copy
  try {
    copy = registerPageCopy(item)
  } catch {
    showToast('预览环境不可保留副本')
    return
  }
  const result = treeOps.addPageFromCatalog(parentId, item, copy.copyId, copy.title)
  if (!result) return
  const { node } = result
  const prompt = buildRetainCopyPrompt(copy, props.versionId, meta.value.versionLabel, meta.value.title)
  pendingCatalogItem.value = null
  retainTargetParentId.value = null
  selectedNodeId.value = node.id
  lastCreateParentId.value = parentId
  try {
    await navigator.clipboard.writeText(prompt)
    showToast(`已保留到「${folderTitle}」，复制指引已写入剪贴板`)
  } catch {
    showToast(`已保留到「${folderTitle}」`)
  }
}
</script>

<template>
  <div
    class="ws-shell"
    :class="{ 'ws-shell--readonly': !canEdit }"
    :data-ws-seed="WORKSPACE_DRAFT_SEED_VERSION"
    :data-ws-mode="canEdit ? 'edit' : 'preview'"
  >
    <div v-if="!canEdit" class="ws-shell__readonly-banner" role="status">
      团队预览模式：仅可浏览版本树与页面，编辑请在本机 localhost 打开
    </div>
    <header class="ws-shell__header">
      <RouterLink to="/workspace" class="ws-shell__back">← 版本列表</RouterLink>
      <span class="ws-shell__title">{{ meta.versionLabel }} · {{ meta.title }}</span>
      <span class="ws-shell__meta">更新 {{ meta.updatedAt }}</span>
      <div class="ws-shell__actions">
        <button
          v-if="canEdit"
          type="button"
          class="ws-btn ws-btn--primary"
          :disabled="!canRetain"
          :title="retainButtonTitle"
          @click="onRetainCopy"
        >
          保留副本
        </button>
      </div>
    </header>

    <div class="ws-editor">
      <aside class="ws-editor__left">
        <WorkspaceTreePanel
          :tree="tree"
          :selected-id="selectedNodeId"
          :editable="canEdit"
          :create-target-title="canEdit ? createTargetTitle : undefined"
          @select="selectNode"
          @rename="treeOps.renameNode"
          @delete="onDeleteNode"
          @purge="onPurgeNode"
          @move="treeOps.handleMove"
          @drop-catalog="onDropCatalog"
          @add-folder="onAddFolder"
          @add-doc="onAddDoc"
          @open-page-library="openPageLibrary"
        />
      </aside>

      <section class="ws-editor__preview">
        <WorkspacePreviewPanel
          :node="selectedNode"
          :pending-catalog-item="pendingCatalogItem"
          :editable="canEdit"
          @open-page-library="openPageLibrary"
          @close-preview="closePreview"
          @save-revision="onSaveRevision"
        />
      </section>
    </div>

    <WorkspacePagePickerModal
      :open="pickerOpen"
      :folder-title="catalogTargetFolderTitle === '版本根目录' ? undefined : catalogTargetFolderTitle"
      @close="pickerOpen = false"
      @pick="onPickCatalog"
    />

    <div class="ws-toast" :class="{ 'ws-toast--show': toastVisible }" role="status">
      {{ toastMessage }}
    </div>
  </div>
</template>
