<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { filterCatalog, formatCatalogPath } from '../../config/pageCatalog'
import type { WorkspacePlatform } from '../../constants/versionWorkspace/types'

const props = defineProps<{
  open: boolean
  folderTitle?: string
}>()

const emit = defineEmits<{
  close: []
  pick: [catalogId: string]
}>()

const platformTab = ref<WorkspacePlatform | 'all'>('all')
const keyword = ref('')

const tabs: { key: WorkspacePlatform | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pc', label: 'PC' },
  { key: 'mobile', label: '移动' },
  { key: 'agent', label: '代理' },
]

const items = computed(() => filterCatalog(platformTab.value, keyword.value))

const subtitle = computed(() =>
  props.folderTitle ? `预览后保留到「${props.folderTitle}」` : '预览后保留到版本根目录',
)

watch(
  () => props.open,
  (visible) => {
    if (visible) {
      platformTab.value = 'all'
      keyword.value = ''
    }
  },
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function platformLabel(p: string) {
  if (p === 'pc') return 'PC'
  if (p === 'agent') return '代理'
  return '移动'
}

function pagePathText(item: { pagePath?: string[]; group: string }) {
  return item.pagePath?.length ? item.pagePath.join(' / ') : item.group
}

function pick(catalogId: string) {
  emit('pick', catalogId)
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ws-picker-mask" @click="onBackdropClick">
      <div class="ws-picker" role="dialog" aria-modal="true" aria-labelledby="ws-picker-title">
        <header class="ws-picker__head">
          <div>
            <h2 id="ws-picker-title" class="ws-picker__title">页面库</h2>
            <p class="ws-picker__subtitle">{{ subtitle }}</p>
          </div>
          <button type="button" class="ws-picker__close" aria-label="关闭" @click="emit('close')">
            ×
          </button>
        </header>

        <div class="ws-picker__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="ws-picker__tab"
            :class="{ 'ws-picker__tab--active': platformTab === tab.key }"
            @click="platformTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <input
          v-model="keyword"
          class="ws-picker__search"
          type="search"
          placeholder="搜索页面名称、路径、分组、路由名…"
          aria-label="搜索页面库"
        />

        <div class="ws-picker__result">
          共 {{ items.length }} 个页面，可按关键词搜索二级/三级页面
        </div>

        <div class="ws-picker__list">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="ws-picker__item"
            @click="pick(item.id)"
          >
            <span class="ws-picker__item-title">{{ item.title }}</span>
            <span class="ws-picker__item-meta">
              {{ platformLabel(item.platform) }} · {{ pagePathText(item) }}
            </span>
            <span class="ws-picker__item-path">
              {{ formatCatalogPath(item) }}
            </span>
          </button>
          <p v-if="!items.length" class="ws-picker__empty">无匹配页面</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
