<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  title: string
  error?: string
}>()

const emit = defineEmits<{
  submit: [pin: string]
}>()

const pin = ref('')

watch(
  () => props.error,
  (value) => {
    if (value) pin.value = ''
  },
)

function press(digit: string) {
  if (pin.value.length >= 6) return
  pin.value += digit
  if (pin.value.length === 6) emit('submit', pin.value)
}

function backspace() {
  pin.value = pin.value.slice(0, -1)
}
</script>

<template>
  <div class="mh5-pin" :class="{ 'is-error': Boolean(error) }">
    <p class="mh5-pin__title">{{ $t(title) }}</p>
    <p class="mh5-pin__error">{{ error ? $t(error) : ' ' }}</p>
    <div class="mh5-pin__slots" aria-hidden="true">
      <span v-for="index in 6" :key="index" :class="{ 'is-on': pin.length >= index }" />
    </div>
    <div class="mh5-pin__pad">
      <button v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" :key="digit" type="button" @click="press(digit)">
        {{ digit }}
      </button>
      <span class="mh5-pin__gap" />
      <button type="button" @click="press('0')">0</button>
      <button type="button" class="mh5-pin__delete" :aria-label="$t('删除')" @click="backspace">
        <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
          <path
            d="M8 1h15a2 2 0 012 2v14a2 2 0 01-2 2H8l-7-9 7-9z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path d="M12 6l7 8M19 6l-7 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>
