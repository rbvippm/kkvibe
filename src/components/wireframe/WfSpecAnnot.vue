<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    items: string[]
    /** 需求功能清单编号，显示为「注N」 */
    no?: number
    /** 相对触发器：表头/筛选多用 bottom，避免顶到上方搜索栏 */
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const triggerLabel = computed(() => (props.no != null ? `注${props.no}` : '注'))

const open = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
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

function togglePanel(event: MouseEvent) {
  event.stopPropagation()
  open.value = !open.value
}

function closePanel() {
  open.value = false
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return

  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return

  closePanel()
}

watch(open, async (visible) => {
  if (visible) {
    await nextTick()
    updatePanelPosition()
    bindPositionListeners()
    window.setTimeout(() => {
      document.addEventListener('pointerdown', onDocumentPointerDown, true)
    }, 0)
    return
  }

  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  unbindPositionListeners()
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  unbindPositionListeners()
})
</script>

<template>
  <span
    class="wf-spec-annot"
    :class="placement === 'top' ? 'wf-spec-annot--top' : 'wf-spec-annot--bottom'"
  >
    <button
      ref="triggerRef"
      type="button"
      class="wf-spec-annot__trigger"
      :class="{
        'wf-spec-annot__trigger--numbered': no != null,
        'wf-spec-annot__trigger--open': open,
      }"
      :aria-label="`${no != null ? `【${no}】` : ''}${title}，点击展开或收起需求说明`"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="togglePanel"
    >
      {{ triggerLabel }}
    </button>
    <Teleport to="body">
      <div
        ref="panelRef"
        v-show="open"
        class="wf-spec-annot__panel wf-spec-annot__panel--portal"
        :class="
          placement === 'top' ? 'wf-spec-annot__panel--portal-top' : 'wf-spec-annot__panel--portal-bottom'
        "
        :style="panelStyle"
        role="dialog"
        :aria-label="`${no != null ? `【${no}】` : ''}${title}需求说明`"
      >
        <span class="wf-spec-annot__panel-tag">
          需求说明<template v-if="no != null"> #{{ no }}</template>
        </span>
        <strong class="wf-spec-annot__panel-title">
          <span v-if="no != null" class="wf-spec-annot__panel-no">【{{ no }}】</span>{{ title }}
        </strong>
        <ul class="wf-spec-annot__panel-list">
          <li v-for="(line, index) in items" :key="index">{{ line }}</li>
        </ul>
      </div>
    </Teleport>
  </span>
</template>
