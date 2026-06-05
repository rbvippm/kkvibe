import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPcPagePath } from '../config/pcMenu'

/** 从菜单配置读取当前页的「路径：A-B-C」层级 */
export function usePcPagePath() {
  const route = useRoute()

  return computed(() => {
    const name = route.name
    if (typeof name !== 'string') return undefined
    return getPcPagePath(name)
  })
}
