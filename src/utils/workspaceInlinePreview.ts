import { defineAsyncComponent, type Component } from 'vue'
import type { RouteRecordNormalized, Router, RouteLocationNormalizedLoaded } from 'vue-router'

export interface PreviewRouteTarget {
  path: string
  routeName?: string
  forkId?: string
  query?: Record<string, string>
}

export interface ResolvedPreviewRoute {
  route: RouteLocationNormalizedLoaded
  layoutComponent: Component | null
  leafComponent: Component | null
  isPc: boolean
}

const componentCache = new WeakMap<object, Component>()

function normalizeRouteComponent(loader: unknown): Component | null {
  if (!loader) return null
  if (typeof loader !== 'function' && typeof loader !== 'object') return null

  const key = loader as object
  const cached = componentCache.get(key)
  if (cached) return cached

  const normalized =
    typeof loader === 'function'
      ? defineAsyncComponent({
          loader: loader as () => Promise<Component>,
          timeout: 15000,
        })
      : (loader as Component)

  componentCache.set(key, normalized)
  return normalized
}

function pickLayoutAndLeaf(matched: RouteRecordNormalized[]) {
  const withComponent = matched.filter((record) => record.components?.default)
  if (!withComponent.length) {
    return { layoutRecord: null, leafRecord: null }
  }
  return {
    layoutRecord: withComponent[0]!,
    leafRecord: withComponent[withComponent.length - 1]!,
  }
}

/** 解析预览路径为布局 + 叶子页面组件（同文档内联渲染，供设计模式选区） */
export function resolvePreviewTarget(
  router: Router,
  target: PreviewRouteTarget,
): ResolvedPreviewRoute | null {
  const query: Record<string, string> = {
    workspacePreview: '1',
    ...target.query,
  }
  if (target.forkId) query.forkId = target.forkId

  const location = target.routeName
    ? { name: target.routeName, query }
    : { path: target.path, query }

  const resolved = router.resolve(location)
  if (
    !resolved.matched.length ||
    resolved.name === 'workspace-editor' ||
    resolved.name === 'workspace-hub' ||
    resolved.name === 'home'
  ) {
    return null
  }

  const { layoutRecord, leafRecord } = pickLayoutAndLeaf(resolved.matched)
  const layoutComponent = normalizeRouteComponent(layoutRecord?.components?.default)
  const leafComponent = normalizeRouteComponent(leafRecord?.components?.default)

  if (!layoutComponent && !leafComponent) return null

  return {
    route: resolved as RouteLocationNormalizedLoaded,
    layoutComponent,
    leafComponent,
    isPc: resolved.path.startsWith('/pc'),
  }
}
