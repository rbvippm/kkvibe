<script setup lang="ts">
import { computed } from 'vue'
import {
  getAgentCurrencyIconLayers,
  getAgentCurrencyUnitIcon,
} from '../../constants/agentCurrencyIcons'

const props = withDefaults(
  defineProps<{
    code: string
    size?: number
  }>(),
  { size: 28 },
)

const layers = computed(() => getAgentCurrencyIconLayers(props.code))
const unitIcon = computed(() => getAgentCurrencyUnitIcon(props.code))
const boxStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.48)}px`,
}))
</script>

<template>
  <span
    v-if="layers"
    class="mh5-currency-icon"
    :style="boxStyle"
    aria-hidden="true"
  >
    <span
      v-for="(layer, index) in layers"
      :key="`${props.code}-${index}`"
      class="mh5-currency-icon__layer"
      :style="{ inset: layer.inset }"
    >
      <img :src="layer.src" alt="" :width="props.size" :height="props.size" />
    </span>
  </span>
  <span
    v-else-if="unitIcon"
    class="mh5-currency-icon mh5-currency-icon--unit"
    :style="{ ...boxStyle, background: unitIcon.color }"
    aria-hidden="true"
  >
    {{ unitIcon.unit }}
  </span>
</template>
