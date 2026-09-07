<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

export type WfSearchSelectOption = {
  value: string
  label: string
}

const selected = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    options: readonly WfSearchSelectOption[]
    id?: string
    placeholder?: string
    emptyLabel?: string
    disabled?: boolean
    full?: boolean
    wide?: boolean
  }>(),
  {
    id: '',
    placeholder: '请选择',
    emptyLabel: '',
    disabled: false,
    full: false,
    wide: false,
  },
)

const open = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})
let outsideTimer = 0

const mergedOptions = computed(() => {
  if (!props.emptyLabel || props.options.some((item) => item.value === '')) {
    return [...props.options]
  }
  return [{ value: '', label: props.emptyLabel }, ...props.options]
})

const selectedLabel = computed(
  () => mergedOptions.value.find((item) => item.value === selected.value)?.label ?? '',
)

const displayValue = computed(() => (open.value ? keyword.value : selectedLabel.value))

const filteredOptions = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return mergedOptions.value
  return mergedOptions.value.filter(
    (item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query),
  )
})

function updatePanelPosition() {
  const el = rootRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const width = Math.max(rect.width, 160)
  const left = Math.min(rect.left, window.innerWidth - width - 8)
  panelStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(8, left)}px`,
    width: `${width}px`,
  }
}

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  activeIndex.value = Math.max(
    0,
    filteredOptions.value.findIndex((item) => item.value === selected.value),
  )
  nextTick(() => {
    updatePanelPosition()
    inputRef.value?.focus()
  })
}

function detachOutside() {
  window.clearTimeout(outsideTimer)
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  window.removeEventListener('resize', onReposition)
  window.removeEventListener('scroll', onReposition, true)
}

function closePanel() {
  if (!open.value) return
  open.value = false
  keyword.value = ''
  activeIndex.value = 0
  detachOutside()
}

function pick(option: WfSearchSelectOption) {
  selected.value = option.value
  closePanel()
}

function onInput(event: Event) {
  keyword.value = (event.target as HTMLInputElement).value
  activeIndex.value = 0
  if (!open.value) openPanel()
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (!open.value && (event.key === 'ArrowDown' || event.key === 'Enter')) {
    event.preventDefault()
    openPanel()
    return
  }
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const max = filteredOptions.value.length - 1
    if (max < 0) return
    activeIndex.value = Math.min(max, activeIndex.value + 1)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(0, activeIndex.value - 1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const option = filteredOptions.value[activeIndex.value]
    if (option) pick(option)
  }
}

function onDocPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return
  closePanel()
}

function onReposition() {
  if (!open.value) return
  updatePanelPosition()
}

watch(filteredOptions, (list) => {
  if (activeIndex.value >= list.length) activeIndex.value = Math.max(0, list.length - 1)
})

watch(open, (visible) => {
  detachOutside()
  if (!visible) return
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
  outsideTimer = window.setTimeout(() => {
    document.addEventListener('pointerdown', onDocPointerDown, true)
  }, 0)
})

onBeforeUnmount(() => {
  detachOutside()
})
</script>

<template>
  <div
    ref="rootRef"
    class="wf-search-select"
    :class="{
      'wf-search-select--full': full,
      'wf-search-select--wide': wide,
      'wf-search-select--open': open,
      'wf-search-select--disabled': disabled,
    }"
    @pointerdown.stop
  >
    <input
      :id="id || undefined"
      ref="inputRef"
      class="wf-input wf-search-select__input"
      :class="{
        'wf-input--select': !full && !wide,
        'wf-input--channel': wide,
        'wf-input--full': full,
      }"
      type="text"
      :disabled="disabled"
      :placeholder="open ? selectedLabel || placeholder : placeholder"
      :value="displayValue"
      role="combobox"
      autocomplete="off"
      :aria-expanded="open"
      aria-autocomplete="list"
      @pointerdown="openPanel"
      @focus="openPanel"
      @input="onInput"
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="wf-search-select__arrow"
      tabindex="-1"
      :disabled="disabled"
      aria-hidden="true"
      @click.stop="open ? closePanel() : openPanel()"
    >
      <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true">
        <path
          d="M1.2 1.6 6 6.4 10.8 1.6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>

  <Teleport to="body">
    <div
      v-if="open"
      ref="panelRef"
      class="wf-search-select__panel"
      :style="panelStyle"
      role="listbox"
    >
      <button
        v-for="(opt, index) in filteredOptions"
        :key="opt.value || `empty-${index}`"
        type="button"
        class="wf-search-select__option"
        :class="{
          'wf-search-select__option--active': index === activeIndex,
          'wf-search-select__option--selected': opt.value === selected,
        }"
        role="option"
        :aria-selected="opt.value === selected"
        @mousedown.prevent="pick(opt)"
      >
        {{ opt.label }}
      </button>
      <p v-if="!filteredOptions.length" class="wf-search-select__empty">暂无匹配项</p>
    </div>
  </Teleport>
</template>

<style scoped>
.wf-search-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: top;
}

.wf-search-select--full {
  display: flex;
  width: 100%;
  min-width: 0;
}

.wf-search-select--wide {
  min-width: 220px;
}

.wf-search-select__input {
  padding-right: 30px;
}

.wf-search-select--full .wf-search-select__input {
  width: 100%;
}

.wf-search-select__arrow {
  position: absolute;
  inset: 0 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--pc-text);
  cursor: pointer;
}

.wf-search-select__arrow svg {
  display: block;
}

.wf-search-select--open .wf-search-select__arrow {
  color: var(--pc-text);
}

.wf-search-select--open .wf-search-select__arrow svg {
  transform: rotate(180deg);
}

.wf-search-select--disabled .wf-search-select__arrow {
  color: #bfbfbf;
  cursor: not-allowed;
}
</style>

<style>
.wf-search-select__panel {
  position: fixed;
  z-index: 1050;
  max-height: 240px;
  overflow: auto;
  padding: 4px 0;
  background: #fff;
  border: 1px solid var(--pc-border);
  border-radius: var(--pc-radius);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.wf-search-select__option {
  display: block;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--pc-text);
  font-size: var(--pc-font-size);
  line-height: 22px;
  text-align: left;
  word-break: break-word;
  overflow-wrap: break-word;
  cursor: pointer;
}

.wf-search-select__option:hover,
.wf-search-select__option--active {
  background: var(--pc-primary-bg);
}

.wf-search-select__option--selected {
  color: var(--pc-primary);
}

.wf-search-select__empty {
  margin: 0;
  padding: 16px 12px;
  color: var(--pc-text-muted);
  font-size: 13px;
  text-align: center;
}
</style>
