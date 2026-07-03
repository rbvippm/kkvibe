<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { usePcPagePath } from '../../composables/usePcPagePath'
import { findPcDocRoute, getPcDocRouteName } from '../../config/pcMenu'

const props = defineProps<{
  /** 手动覆盖路径层级（默认从菜单配置读取） */
  segments?: string[]
  /** 手动覆盖文档路由名；传 null 可强制隐藏【文档说明】 */
  docRouteName?: string | null
}>()

const route = useRoute()
const menuSegments = usePcPagePath()

const segments = computed(() => {
  if (props.segments?.length) return props.segments
  return menuSegments.value ?? []
})

const resolvedDocRouteName = computed(() => {
  if (props.docRouteName === null) return undefined
  if (props.docRouteName) return props.docRouteName
  const name = route.name
  if (typeof name !== 'string') return undefined
  if (findPcDocRoute(name)) return undefined
  return getPcDocRouteName(name)
})
</script>

<template>
  <div v-if="segments.length" class="wf-page-path">
    <div class="wf-page-path__main">
      <span class="wf-page-path__label">路径：</span>
      <span class="wf-page-path__value">
        <template v-for="(segment, index) in segments" :key="`${segment}-${index}`">
          <span v-if="index > 0" class="wf-page-path__sep" aria-hidden="true">-</span>
          <span class="wf-page-path__segment">{{ segment }}</span>
        </template>
      </span>
    </div>
    <RouterLink
      v-if="resolvedDocRouteName"
      :to="{ name: resolvedDocRouteName }"
      class="wf-page-path__doc-link"
    >
      【文档说明】
    </RouterLink>
  </div>
</template>
