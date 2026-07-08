<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WorkspaceEditorContent from './WorkspaceEditorContent.vue'
import '../../styles/workspace.css'

const route = useRoute()
const versionId = computed(() => route.params.versionId as string)
</script>

<template>
  <WorkspaceEditorContent v-if="versionId" :key="versionId" :version-id="versionId" />
</template>
