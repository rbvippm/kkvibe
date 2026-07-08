import type { ComputedRef, InjectionKey } from 'vue'
import { inject, computed } from 'vue'
import { useRoute, type LocationQuery } from 'vue-router'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

export interface WorkspaceInlinePreviewContext {
  active: boolean
  query: ComputedRef<Record<string, string | string[] | undefined>>
}

export const WORKSPACE_INLINE_PREVIEW_KEY: InjectionKey<WorkspaceInlinePreviewContext> = Symbol(
  'workspaceInlinePreview',
)

/** 内联预览注入路由的兜底对象 */
export const EMPTY_PREVIEW_ROUTE: RouteLocationNormalizedLoaded = {
  path: '/',
  fullPath: '/',
  hash: '',
  query: {},
  params: {},
  meta: {},
  matched: [],
  name: undefined,
  redirectedFrom: undefined,
}

/** 读取是否处于工作台内联预览，以及预览 query（forkId 等） */
export function useWorkspaceInlinePreview() {
  const inline = inject(WORKSPACE_INLINE_PREVIEW_KEY, null)
  const route = useRoute()

  const isInlinePreview = computed(() => inline?.active ?? false)

  const previewQuery = computed(() => {
    if (inline?.active) {
      return (inline.query?.value ?? { workspacePreview: '1' }) as LocationQuery
    }
    return route.query ?? {}
  })

  const isWorkspacePreview = computed(
    () => isInlinePreview.value || previewQuery.value?.workspacePreview === '1',
  )

  return {
    isInlinePreview,
    previewQuery,
    isWorkspacePreview,
  }
}

/** 拦截预览区内的路由跳转，避免离开版本编辑页 */
export function createPreviewRouterStub(mainRouter: Router): Router {
  const block = () => Promise.resolve()
  return new Proxy(mainRouter, {
    get(target, prop, receiver) {
      if (prop === 'push' || prop === 'replace' || prop === 'back' || prop === 'forward' || prop === 'go') {
        return block
      }
      return Reflect.get(target, prop, receiver)
    },
  }) as Router
}
