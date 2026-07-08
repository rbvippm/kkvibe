<script setup lang="ts">
import { computed, onErrorCaptured, provide, ref, shallowRef, watch } from 'vue'
import { routerKey, useRouter } from 'vue-router'
import {
  WORKSPACE_INLINE_PREVIEW_KEY,
  createPreviewRouterStub,
  type WorkspaceInlinePreviewContext,
} from '../../composables/workspacePreviewContext'
import {
  resolvePreviewTarget,
  type ResolvedPreviewRoute,
} from '../../utils/workspaceInlinePreview'

const props = defineProps<{
  path: string
  routeName?: string
  forkId?: string
  query?: Record<string, string>
}>()

const mainRouter = useRouter()
const ready = ref(false)
const loadError = ref('')
const preview = shallowRef<ResolvedPreviewRoute | null>(null)
const previewQuery = ref<Record<string, string | string[] | undefined>>({ workspacePreview: '1' })

const inlinePreviewContext: WorkspaceInlinePreviewContext = {
  active: true,
  query: computed(() => previewQuery.value),
}

provide(WORKSPACE_INLINE_PREVIEW_KEY, inlinePreviewContext)
provide(routerKey, createPreviewRouterStub(mainRouter))

function syncPreview() {
  ready.value = false
  loadError.value = ''

  const resolved = resolvePreviewTarget(mainRouter, {
    path: props.path,
    routeName: props.routeName,
    forkId: props.forkId,
    query: props.query,
  })

  preview.value = resolved
  previewQuery.value = (resolved?.route.query ?? { workspacePreview: '1' }) as Record<
    string,
    string | string[] | undefined
  >
  loadError.value = resolved ? '' : '无法解析预览路由'

  if (!resolved) return
  requestAnimationFrame(() => {
    ready.value = true
  })
}

watch(
  () => [props.path, props.routeName, props.forkId, JSON.stringify(props.query ?? {})] as const,
  syncPreview,
  { immediate: true },
)

onErrorCaptured((error) => {
  loadError.value = error instanceof Error ? error.message : '预览加载失败'
  return false
})

const useLayoutShell = computed(() => {
  const current = preview.value
  if (!current?.layoutComponent || !current.leafComponent) return false
  return current.layoutComponent !== current.leafComponent
})
</script>

<template>
  <div class="ws-preview__inline-host" data-workspace-inline-preview>
    <div v-if="loadError" class="ws-preview__loading">{{ loadError }}</div>
    <div v-else-if="!ready || !preview" class="ws-preview__loading">加载预览中…</div>
    <Suspense v-else>
      <component
        v-if="useLayoutShell && preview.layoutComponent"
        :is="preview.layoutComponent"
      >
        <component :is="preview.leafComponent" class="mh5-route-view" />
      </component>
      <component
        v-else-if="preview.leafComponent"
        :is="preview.leafComponent"
        class="mh5-route-view"
      />
      <template #fallback>
        <div class="ws-preview__loading">加载预览中…</div>
      </template>
    </Suspense>
  </div>
</template>
