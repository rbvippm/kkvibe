<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    items: string[]
    /** 相对触发器：表头/筛选多用 bottom，避免顶到上方搜索栏 */
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const open = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

function updatePanelPosition() {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const gap = 8
  const panelWidth = 320
  let left = rect.left + rect.width / 2
  const minLeft = panelWidth / 2 + 8
  const maxLeft = window.innerWidth - panelWidth / 2 - 8
  left = Math.min(Math.max(left, minLeft), maxLeft)

  if (props.placement === 'top') {
    panelStyle.value = {
      left: `${left}px`,
      top: `${rect.top - gap}px`,
      transform: 'translate(-50%, -100%)',
    }
    return
  }

  panelStyle.value = {
    left: `${left}px`,
    top: `${rect.bottom + gap}px`,
    transform: 'translateX(-50%)',
  }
}

function bindPositionListeners() {
  window.addEventListener('scroll', updatePanelPosition, true)
  window.addEventListener('resize', updatePanelPosition)
}

function unbindPositionListeners() {
  window.removeEventListener('scroll', updatePanelPosition, true)
  window.removeEventListener('resize', updatePanelPosition)
}

function showPanel() {
  open.value = true
}

function hidePanel() {
  open.value = false
}

watch(open, async (visible) => {
  if (visible) {
    await nextTick()
    updatePanelPosition()
    bindPositionListeners()
    return
  }
  unbindPositionListeners()
})

onUnmounted(() => {
  unbindPositionListeners()
})
</script>

<template>
  <span
    class="wf-spec-annot"
    :class="placement === 'top' ? 'wf-spec-annot--top' : 'wf-spec-annot--bottom'"
    @mouseenter="showPanel"
    @mouseleave="hidePanel"
    @focusin="showPanel"
    @focusout="hidePanel"
  >
    <button
      ref="triggerRef"
      type="button"
      class="wf-spec-annot__trigger"
      :aria-label="`${title}，查看需求说明`"
      aria-haspopup="true"
      :aria-expanded="open"
    >
      注
    </button>
    <Teleport to="body">
      <div
        v-show="open"
        class="wf-spec-annot__panel wf-spec-annot__panel--portal"
        :class="
          placement === 'top' ? 'wf-spec-annot__panel--portal-top' : 'wf-spec-annot__panel--portal-bottom'
        "
        :style="panelStyle"
        role="tooltip"
      >
        <span class="wf-spec-annot__panel-tag">需求说明</span>
        <strong class="wf-spec-annot__panel-title">{{ title }}</strong>
        <ul class="wf-spec-annot__panel-list">
          <li v-for="(line, index) in items" :key="index">{{ line }}</li>
        </ul>
      </div>
    </Teleport>
  </span>
</template>
