<script setup lang="ts">
import { AGENT_OVERVIEW_ASSETS } from '../../constants/agentOverviewAssets'

defineProps<{
  label: string
  value: string
  deep?: boolean
}>()
</script>

<template>
  <div class="agent-home__mask-group" data-name="Mask group">
    <div class="agent-home__stat-card">
      <img
        class="agent-home__stat-card-deco"
        :src="AGENT_OVERVIEW_ASSETS.statDeco"
        alt=""
        aria-hidden="true"
      />
      <div class="agent-home__stat-card-label">
        <p>{{ label }}</p>
      </div>
      <div class="agent-home__stat-card-value" :class="{ 'agent-home__stat-card-value--deep': deep }">
        <p>{{ value }}</p>
      </div>
    </div>
  </div>
</template>
