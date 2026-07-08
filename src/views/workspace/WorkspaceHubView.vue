<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { listVersionWorkspaces } from '../../composables/useWorkspaceEditor'
import { useWorkspaceEditAccess } from '../../composables/useWorkspaceEditAccess'
import { purgeStaleWorkspaceDrafts } from '../../utils/workspaceDraft'
import '../../styles/workspace.css'

const versions = listVersionWorkspaces()
const { canEdit } = useWorkspaceEditAccess()

onMounted(() => {
  if (canEdit.value) purgeStaleWorkspaceDrafts()
})
</script>

<template>
  <div class="ws-shell" :data-ws-mode="canEdit ? 'edit' : 'preview'">
    <div v-if="!canEdit" class="ws-shell__readonly-banner" role="status">
      团队预览模式：仅可浏览版本内容，编辑请在本机 localhost 打开
    </div>
    <header class="ws-shell__header">
      <RouterLink to="/" class="ws-shell__back">← 返回首页</RouterLink>
      <span class="ws-shell__title">版本管理工作台</span>
    </header>

    <main class="ws-hub">
      <h1 class="ws-hub__title">版本列表</h1>
      <p class="ws-hub__desc">
        <template v-if="canEdit">
          按版本组织文件夹与页面。从页面库预览源页面，确认后点击「保留副本」即可加入版本树，不影响原页面。
        </template>
        <template v-else>
          浏览各版本文件夹与页面副本预览。结构以仓库 manifest 为准，团队预览环境不可编辑。
        </template>
      </p>

      <div class="ws-hub__grid">
        <RouterLink
          v-for="ver in versions"
          :key="ver.id"
          :to="`/workspace/${ver.id}`"
          class="ws-hub-card"
        >
          <div class="ws-hub-card__ver">{{ ver.versionLabel }}</div>
          <div class="ws-hub-card__title">{{ ver.title }}</div>
          <div class="ws-hub-card__date">更新于 {{ ver.updatedAt }}</div>
        </RouterLink>
      </div>
    </main>
  </div>
</template>
