<script setup lang="ts">
import { AGENT_OVERVIEW_ASSETS } from '../../constants/agentOverviewAssets'

defineProps<{
  label: string
  value: string
  hint?: string
  deep?: boolean
  clickable?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="agent-home__mask-group" data-name="Mask group">
    <component
      :is="clickable ? 'button' : 'div'"
      class="agent-home__stat-card"
      :class="{ 'agent-home__stat-card--clickable': clickable }"
      :type="clickable ? 'button' : undefined"
      :aria-label="clickable ? `${label} ${value}，${hint || ''}` : undefined"
      @click="clickable ? emit('click') : undefined"
    >
      <img
        class="agent-home__stat-card-deco"
        :src="AGENT_OVERVIEW_ASSETS.statDeco"
        alt=""
        aria-hidden="true"
      />
      <div class="agent-home__stat-card-label">
        <p>{{ label }}</p>
        <span v-if="hint" class="agent-home__stat-card-hint">{{ hint }}</span>
      </div>
      <div class="agent-home__stat-card-value" :class="{ 'agent-home__stat-card-value--deep': deep }">
        <p>{{ value }}</p>
      </div>
    </component>
  </div>
</template>
