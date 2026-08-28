<script setup lang="ts">
import { usePcToast } from '../../composables/usePcToast'

const { toast } = usePcToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="pc-toast">
      <div
        v-if="toast"
        class="pc-toast"
        :class="`pc-toast--${toast.type}`"
        role="status"
      >
        <span class="pc-toast__icon" aria-hidden="true">
          {{ toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓' }}
        </span>
        <span>{{ toast.text }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
