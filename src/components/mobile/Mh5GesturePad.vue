<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  title: string
  error?: string
}>()

const emit = defineEmits<{
  submit: [pattern: string]
}>()

const active = ref<number[]>([])
const drawing = ref(false)

const dots = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const linePoints = computed(() =>
  active.value
    .map((index) => {
      const col = index % 3
      const row = Math.floor(index / 3)
      return `${50 + col * 100},${50 + row * 100}`
    })
    .join(' '),
)

watch(
  () => props.error,
  (value) => {
    if (value) active.value = []
  },
)

function hitIndex(board: HTMLElement, clientX: number, clientY: number) {
  const rect = board.getBoundingClientRect()
  const cell = rect.width / 3
  const x = clientX - rect.left
  const y = clientY - rect.top
  const col = Math.floor(x / cell)
  const row = Math.floor(y / cell)
  if (col < 0 || col > 2 || row < 0 || row > 2) return -1
  const dx = x - (col * cell + cell / 2)
  const dy = y - (row * cell + cell / 2)
  if (Math.hypot(dx, dy) > cell * 0.36) return -1
  return row * 3 + col
}

function midpoint(from: number, to: number) {
  const fromRow = Math.floor(from / 3)
  const fromCol = from % 3
  const toRow = Math.floor(to / 3)
  const toCol = to % 3
  if ((fromRow + toRow) % 2 !== 0 || (fromCol + toCol) % 2 !== 0) return -1
  return ((fromRow + toRow) / 2) * 3 + (fromCol + toCol) / 2
}

function addDot(index: number) {
  if (index < 0 || active.value.includes(index)) return
  const last = active.value[active.value.length - 1]
  if (last !== undefined) {
    const middle = midpoint(last, index)
    if (middle >= 0 && !active.value.includes(middle)) active.value.push(middle)
  }
  active.value.push(index)
}

function onDown(event: PointerEvent) {
  const board = event.currentTarget as HTMLElement
  board.setPointerCapture(event.pointerId)
  drawing.value = true
  active.value = []
  addDot(hitIndex(board, event.clientX, event.clientY))
}

function onMove(event: PointerEvent) {
  if (!drawing.value) return
  addDot(hitIndex(event.currentTarget as HTMLElement, event.clientX, event.clientY))
}

function onUp() {
  if (!drawing.value) return
  drawing.value = false
  if (!active.value.length) return
  emit('submit', active.value.join('-'))
}
</script>

<template>
  <div class="mh5-gesture">
    <p class="mh5-gesture__title">{{ $t(title) }}</p>
    <p class="mh5-gesture__error" :class="{ 'is-on': Boolean(error) }">
      {{ error ? $t(error) : $t('至少连接 4 个点') }}
    </p>
    <div
      class="mh5-gesture__board"
      @pointerdown.prevent="onDown"
      @pointermove.prevent="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <polyline v-if="active.length > 1" :points="linePoints" />
        <circle
          v-for="index in dots"
          :key="index"
          :cx="50 + (index % 3) * 100"
          :cy="50 + Math.floor(index / 3) * 100"
          r="10"
          :class="{ 'is-on': active.includes(index) }"
        />
      </svg>
    </div>
  </div>
</template>
