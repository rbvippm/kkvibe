import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findPcDocRoute, findPcMenuByRouteName } from '../config/pcMenu'

export type PcTag = {
  path: string
  routeName: string
  title: string
  affix?: boolean
}

const visitedTags = ref<PcTag[]>([
  { path: '/pc', routeName: 'pc', title: '首页', affix: true },
])

function isPcRoute(name: unknown): name is string {
  return typeof name === 'string' && (name === 'pc' || name.startsWith('pc-'))
}

export function usePcTagsView() {
  const route = useRoute()
  const router = useRouter()

  function addTag(routeName: string) {
    const menu = findPcMenuByRouteName(routeName)
    const doc = findPcDocRoute(routeName)
    const source = menu ?? doc
    if (!source) return

    if (visitedTags.value.some((tag) => tag.routeName === routeName)) return

    visitedTags.value.push({
      path: source.path,
      routeName: source.routeName,
      title: source.title,
      affix: menu?.affix,
    })
  }

  function closeTag(routeName: string, event?: MouseEvent) {
    event?.stopPropagation()

    const tag = visitedTags.value.find((item) => item.routeName === routeName)
    if (!tag || tag.affix) return

    const index = visitedTags.value.findIndex((item) => item.routeName === routeName)
    visitedTags.value.splice(index, 1)

    if (route.name !== routeName) return

    const fallback = visitedTags.value[index] ?? visitedTags.value[index - 1]
    router.push(fallback?.path ?? '/pc')
  }

  function activateTag(tag: PcTag) {
    if (route.path !== tag.path) {
      router.push(tag.path)
    }
  }

  watch(
    () => route.name,
    (name) => {
      if (isPcRoute(name)) addTag(name)
    },
    { immediate: true },
  )

  return {
    visitedTags,
    closeTag,
    activateTag,
  }
}
