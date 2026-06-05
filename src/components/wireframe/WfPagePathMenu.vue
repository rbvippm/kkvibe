<script setup lang="ts">
import { usePcPagePath } from '../../composables/usePcPagePath'
import WfPagePath from './WfPagePath.vue'

const segments = usePcPagePath()
</script>

<template>
  <WfPagePath v-if="segments?.length" :segments="segments" />
</template>
