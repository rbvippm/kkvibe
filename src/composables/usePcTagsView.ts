import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findPcDocRoute, findPcMenuByRouteName } from '../config/pcMenu'

export type PcTag = {
  path: string
  routeName: string
  title: string
  affix?: boolean
}

const adminTags = ref<PcTag[]>([{ path: '/pc', routeName: 'pc', title: '首页', affix: true }])
const anchorTags = ref<PcTag[]>([{ path: '/pc-anchor', routeName: 'pca', title: '首页', affix: true }])

function isAnchorName(name: string) {
  return name === 'pca' || name.startsWith('pca-')
}

function isPcRoute(name: unknown): name is string {
  return typeof name === 'string' && (name === 'pc' || name.startsWith('pc-') || isAnchorName(name))
}

export function usePcTagsView() {
  const route = useRoute()
  const router = useRouter()

  const tagStore = computed(() => {
    const name = route.name
    if (typeof name === 'string' && isAnchorName(name)) return anchorTags
    return adminTags
  })

  const visitedTags = computed(() => tagStore.value.value)

  function addTag(routeName: string) {
    const menu = findPcMenuByRouteName(routeName)
    const doc = findPcDocRoute(routeName)
    const source = menu ?? doc
    if (!source) return

    const store = isAnchorName(routeName) ? anchorTags : adminTags
    if (store.value.some((tag) => tag.routeName === routeName)) return

    store.value.push({
      path: source.path,
      routeName: source.routeName,
      title: source.title,
      affix: menu?.affix,
    })
  }

  function closeTag(routeName: string, event?: MouseEvent) {
    event?.stopPropagation()
    const store = isAnchorName(routeName) ? anchorTags : adminTags
    const tag = store.value.find((item) => item.routeName === routeName)
    if (!tag || tag.affix) return

    const index = store.value.findIndex((item) => item.routeName === routeName)
    store.value.splice(index, 1)

    if (route.name !== routeName) return

    const fallback = store.value[index] ?? store.value[index - 1]
    router.push(fallback?.path ?? (isAnchorName(routeName) ? '/pc-anchor' : '/pc'))
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
