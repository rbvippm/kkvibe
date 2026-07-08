<script setup lang="ts">
import { computed } from 'vue'
import type { PageCatalogItem, WorkspaceTreeNode } from '../../constants/versionWorkspace/types'
import { formatCatalogPath, PAGE_CATALOG } from '../../config/pageCatalog'
import { findPcDocRoute, getPcDocRouteName, getPcPagePath } from '../../config/pcMenu'
import { parseRevisionTable, type RevisionTableRow } from '../../utils/parseRevisionTable'
import WfPagePath from '../wireframe/WfPagePath.vue'
import WorkspaceRevisionTable from './WorkspaceRevisionTable.vue'
import WorkspaceInlinePreview from './WorkspaceInlinePreview.vue'
import '../../styles/pc-wireframe.css'

const props = defineProps<{
  node: WorkspaceTreeNode | null
  pendingCatalogItem?: PageCatalogItem | null
  editable?: boolean
}>()

const emit = defineEmits<{
  openPageLibrary: []
  closePreview: []
  saveRevision: [rows: RevisionTableRow[]]
}>()

const isPendingPreview = computed(() => Boolean(props.pendingCatalogItem))
const isRetainedPage = computed(() => props.node?.type === 'page' && props.node.pageRef)
const isPage = computed(() => isPendingPreview.value || isRetainedPage.value)

/** 文件夹 / 文档节点不展示页面库；待保留预览与页面副本节点可打开 */
const showPageLibrary = computed(() => {
  if (props.editable === false) return false
  if (props.node?.type === 'folder' || props.node?.type === 'doc') return false
  return isPendingPreview.value || props.node?.type === 'page'
})

const canClosePreview = computed(() => isPage.value)
const isRevisionDoc = computed(
  () => props.node?.type === 'doc' && props.node.title === '修订记录',
)
const revisionRows = computed(() => {
  if (!isRevisionDoc.value || props.node?.type !== 'doc') return []
  return parseRevisionTable(props.node.docContent ?? '')
})

const platform = computed(() => {
  if (props.pendingCatalogItem) return props.pendingCatalogItem.platform
  return props.node?.pageRef?.platform ?? 'pc'
})
const isPc = computed(() => platform.value === 'pc')

const previewLabel = computed(() => {
  if (props.pendingCatalogItem) return `待保留 · ${props.pendingCatalogItem.title}`
  if (!props.node) return '未选择页面'
  if (props.node.type === 'doc') {
    if (props.node.title === '修订记录') return '修订记录'
    return `文档 · ${props.node.title}`
  }
  if (props.node.type === 'folder') return '文件夹 · 选择页面副本'
  return props.node.title
})

const previewPath = computed(() => {
  if (props.pendingCatalogItem) return formatCatalogPath(props.pendingCatalogItem)
  const pageRef = props.node?.type === 'page' ? props.node.pageRef : null
  if (!pageRef) return ''
  if (!pageRef.query) return pageRef.path
  const query = new URLSearchParams(pageRef.query)
  return `${pageRef.path}?${query.toString()}`
})

const previewTarget = computed(() => {
  if (props.pendingCatalogItem) {
    return {
      path: props.pendingCatalogItem.path,
      routeName: props.pendingCatalogItem.routeName,
      forkId: undefined as string | undefined,
      query: props.pendingCatalogItem.query,
    }
  }
  const node = props.node
  if (!node || node.type !== 'page' || !node.pageRef) return null
  return {
    path: node.pageRef.path,
    routeName: node.pageRef.routeName,
    forkId: node.forkId,
    query: node.pageRef.query,
  }
})

const previewKey = computed(() => {
  const target = previewTarget.value
  if (!target) return ''
  return `${target.routeName ?? target.path}:${target.forkId ?? ''}:${JSON.stringify(target.query ?? {})}`
})

const previewRouteName = computed(() => previewTarget.value?.routeName)

const pagePathSegments = computed(() => {
  if (props.pendingCatalogItem?.pagePath?.length) {
    return props.pendingCatalogItem.pagePath
  }
  const routeName = previewRouteName.value
  if (!routeName) return []
  const pcPath = getPcPagePath(routeName)
  if (pcPath?.length) return pcPath
  const catalog = PAGE_CATALOG.find((item) => item.routeName === routeName)
  return catalog?.pagePath ?? []
})

/** 显式传入，避免 WfPagePath 误读工作台路由 */
const resolvedDocRouteName = computed((): string | null => {
  const routeName = previewRouteName.value
  if (!routeName) return null
  if (findPcDocRoute(routeName)) return null
  return getPcDocRouteName(routeName) ?? null
})
</script>

<template>
  <div class="ws-preview">
    <div class="ws-preview__bar">
      <span>预览</span>
      <strong>{{ previewLabel }}</strong>
      <button
        v-if="canClosePreview"
        type="button"
        class="ws-preview__close"
        aria-label="关闭预览"
        title="关闭预览"
        @click="emit('closePreview')"
      >
        ×
      </button>
      <span v-if="previewPath" class="ws-preview__path">{{ previewPath }}</span>
      <button
        v-if="showPageLibrary"
        type="button"
        class="ws-btn ws-btn--sm ws-preview__picker-btn"
        @click="emit('openPageLibrary')"
      >
        页面库
      </button>
    </div>

    <div v-if="isPage && pagePathSegments.length" class="ws-preview__page-path">
      <WfPagePath
        :segments="pagePathSegments"
        :doc-route-name="resolvedDocRouteName"
      />
    </div>

    <div
      v-if="isPage && previewTarget"
      class="ws-preview__stage"
      :class="{ 'ws-preview__stage--pc': isPc }"
    >
      <div v-if="isPc" class="ws-preview__frame-wrap ws-preview__frame-wrap--pc">
        <WorkspaceInlinePreview
          :key="previewKey"
          :path="previewTarget.path"
          :route-name="previewTarget.routeName"
          :fork-id="previewTarget.forkId"
          :query="previewTarget.query"
        />
      </div>
      <div v-else class="ws-preview__device">
        <div class="ws-preview__device-screen">
          <WorkspaceInlinePreview
            :key="previewKey"
            :path="previewTarget.path"
            :route-name="previewTarget.routeName"
            :fork-id="previewTarget.forkId"
            :query="previewTarget.query"
          />
        </div>
      </div>
    </div>

    <div
      v-else-if="isRevisionDoc"
      class="ws-preview__stage ws-preview__stage--doc"
    >
      <WorkspaceRevisionTable
        :rows="revisionRows"
        :editable="editable !== false"
        @save="emit('saveRevision', $event)"
      />
    </div>

    <div v-else class="ws-preview__stage">
      <div class="ws-preview__empty">
        <template v-if="node?.type === 'folder'">
          已选中文件夹「{{ node.title }}」<br />
          <span v-if="editable !== false" class="ws-preview__empty-hint">
            点击左侧「页面库」选择源页面，确认后点击顶部「保留副本」
          </span>
          <span v-else class="ws-preview__empty-hint">预览模式：点击左侧树中的页面节点查看预览</span>
        </template>
        <template v-else-if="node?.type === 'doc'">
          文档「{{ node.title }}」暂无页面预览
        </template>
        <template v-else>
          <template v-if="editable !== false">从「页面库」选择页面预览，确认后点击顶部「保留副本」</template>
          <template v-else>请从左侧版本树选择页面节点进行预览</template>
        </template>
      </div>
    </div>
  </div>
</template>
