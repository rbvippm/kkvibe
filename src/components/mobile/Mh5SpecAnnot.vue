<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { MobilePrdSpec } from '../../constants/mobilePrdSpec'

const props = withDefaults(
  defineProps<{
    spec: MobilePrdSpec
    placement?: 'bottom' | 'top'
  }>(),
  { placement: 'bottom' },
)

const triggerLabel = computed(() => `注${props.spec.no}`)

const open = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

function updatePanelPosition() {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const gap = 8
  const viewportPadding = 16
  const panelWidth = Math.min(340, window.innerWidth - viewportPadding)
  let left = rect.left + rect.width / 2
  const half = panelWidth / 2
  left = Math.min(Math.max(left, half + viewportPadding / 2), window.innerWidth - half - viewportPadding / 2)

  const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding
  const spaceAbove = rect.top - gap - viewportPadding
  const useTop =
    props.placement === 'top' || (props.placement === 'bottom' && spaceBelow < 220 && spaceAbove > spaceBelow)
  const availableSpace = useTop ? spaceAbove : spaceBelow
  const maxHeight = Math.min(Math.max(availableSpace, 160), Math.floor(window.innerHeight * 0.72))

  if (useTop) {
    panelStyle.value = {
      left: `${left}px`,
      top: `${rect.top - gap}px`,
      transform: 'translate(-50%, -100%)',
      width: `${panelWidth}px`,
      maxHeight: `${maxHeight}px`,
    }
    return
  }

  panelStyle.value = {
    left: `${left}px`,
    top: `${rect.bottom + gap}px`,
    transform: 'translateX(-50%)',
    width: `${panelWidth}px`,
    maxHeight: `${maxHeight}px`,
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
  <span class="mh5-spec-annot" @click.stop>
    <button
      ref="triggerRef"
      type="button"
      class="mh5-spec-annot__trigger mh5-spec-annot__trigger--numbered"
      :aria-label="`【${spec.no}】${spec.title}，查看移动端需求说明`"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="togglePanel"
    >
      {{ triggerLabel }}
    </button>
    <Teleport to="body">
      <div v-if="open" class="mh5-spec-annot__mask" @click="closePanel" />
      <div
        v-show="open"
        class="mh5-spec-annot__panel mh5-spec-annot__panel--mobile-prd"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="mh5-spec-annot__panel-body">
          <div class="mh5-spec-annot__panel-head">
            <span class="mh5-spec-annot__panel-tag">移动端 PRD · #{{ spec.no }}</span>
            <strong class="mh5-spec-annot__panel-title">
              <span class="mh5-spec-annot__panel-no">【{{ spec.no }}】</span>{{ $t(spec.title) }}
            </strong>
          </div>

          <section
            v-for="section in spec.sections"
            :key="section.key"
            class="mh5-spec-annot__section"
          >
            <h4 class="mh5-spec-annot__section-title">{{ $t(section.label) }}</h4>
            <ul class="mh5-spec-annot__section-list">
              <li v-for="(line, index) in section.lines" :key="index">{{ line }}</li>
            </ul>
          </section>
        </div>
        <button type="button" class="mh5-spec-annot__panel-close" @click="closePanel">{{ $t('知道了') }}</button>
      </div>
    </Teleport>
  </span>
</template>
