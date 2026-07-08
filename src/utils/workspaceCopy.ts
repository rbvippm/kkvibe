import type { PageCatalogItem, WorkspacePageCopy } from '../constants/versionWorkspace/types'
import { resolvePageSource } from '../config/workspacePageSources'
import { createNodeId } from './workspaceTreeUtils'

export function createPageCopyFromCatalog(
  item: PageCatalogItem,
  versionLabel: string,
): WorkspacePageCopy {
  const copyId = `copy-${createNodeId('page')}`
  const source = resolvePageSource(item.routeName)
  return {
    copyId,
    sourceCatalogId: item.id,
    sourceRouteName: item.routeName,
    title: `${item.title}（副本）`,
    annotationRound: 1,
    sourceViewPath: source?.viewPath,
    sourceSpecPath: source?.specPath,
    sourceDocPath: source?.docPath,
    annotComponent: source?.annotComponent,
    changeSummary: `${versionLabel} 从页面库复制，待 Cursor 设计模式二次编辑后生成本轮标注。`,
    annotations: [],
    mockPatches: {},
    notes: '',
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}

export function buildRetainCopyPrompt(
  copy: WorkspacePageCopy,
  versionId: string,
  versionLabel: string,
  versionTitle: string,
): string {
  const targetDir = `src/views/workspace/copies/${versionId}`
  const viewFile = copy.sourceViewPath?.split('/').pop() ?? 'Page.vue'
  const viewName = viewFile.replace(/\.vue$/, '')
  const specFile = copy.sourceSpecPath?.split('/').pop()
  const targetView = `${targetDir}/${viewName}.copy.vue`
  const targetSpec = specFile ? `src/constants/versionWorkspace/copies/${versionId}/${specFile.replace(/\.ts$/, '.copy.ts')}` : ''

  const lines = [
    `# 保留页面副本 · 请让 Cursor 执行文件复制（勿改源文件）`,
    ``,
    `版本：${versionLabel} · ${versionTitle}`,
    `副本 ID：${copy.copyId}`,
    `副本名称：${copy.title}`,
    ``,
    `## 必须遵守`,
    `- **复制**源文件到新路径，不要直接修改下列源路径`,
    `- 副本路由仍通过工作台 forkId 预览，或后续注册独立路由`,
    `- 二次编辑完成后，同步更新 Spec 与 PRD 标注（注N）`,
    ``,
    `## 复制映射`,
    copy.sourceViewPath ? `1. 复制 \`${copy.sourceViewPath}\` → \`${targetView}\`` : '',
    copy.sourceSpecPath && targetSpec ? `2. 复制 \`${copy.sourceSpecPath}\` → \`${targetSpec}\`` : '',
    copy.sourceDocPath ? `3. （可选）复制文档页 \`${copy.sourceDocPath}\`` : '',
    ``,
    `## Cursor 设计模式任务`,
    `请基于副本文件进行 UI/交互调整，并输出本轮标注变更。`,
    ``,
    buildCursorEditPrompt(copy, versionLabel, versionTitle),
  ].filter(Boolean)
  return lines.join('\n')
}

export function buildCursorEditPrompt(copy: WorkspacePageCopy, versionLabel: string, versionTitle: string): string {
  const lines = [
    `# 版本页面副本 · Cursor 设计模式二次编辑`,
    ``,
    `版本：${versionLabel} · ${versionTitle}`,
    `副本：${copy.title}`,
    `标注轮次：第 ${copy.annotationRound} 轮`,
    `源页面路由：${copy.sourceRouteName}`,
    ``,
    `## 编辑目标`,
    `请在 Cursor 设计模式下修改下方页面副本。完成后同步更新 Spec 常量，并为本轮变更补充/调整 PRD 标注（注N）。`,
    `**不要直接改源页面**，应基于副本路径或在 Spec 中增加版本分支常量。`,
    ``,
    `## 源码入口`,
    copy.sourceViewPath ? `- 页面：\`${copy.sourceViewPath}\`` : '- 页面：（待登记）',
    copy.sourceSpecPath ? `- Spec：\`${copy.sourceSpecPath}\`` : '',
    copy.sourceDocPath ? `- 文档说明：\`${copy.sourceDocPath}\`` : '',
    copy.annotComponent ? `- 标注组件：${copy.annotComponent}` : '',
    ``,
    `## 本轮变更说明（请填写）`,
    copy.changeSummary ?? '（描述相对源页面的 UI / 交互 / 数据变更）',
    ``,
    `## 标注输出要求`,
    `1. 每个变更点对应一条注N（或修改已有注N 的 items[]）`,
    `2. 功能清单与页面标注编号保持一致`,
    `3. 完成后在工作台点击「完成本轮标注」导出片段合并仓库`,
  ].filter(Boolean)
  return lines.join('\n')
}

export function buildAnnotationExportSnippet(
  copy: WorkspacePageCopy,
  versionId: string,
  versionLabel: string,
): string {
  const payload = {
    versionId,
    versionLabel,
    copyId: copy.copyId,
    annotationRound: copy.annotationRound,
    title: copy.title,
    sourceRouteName: copy.sourceRouteName,
    changeSummary: copy.changeSummary,
    annotations: copy.annotations,
    exportedAt: new Date().toISOString(),
  }
  return `// 版本标注轮次导出 · 合并到 src/constants/versionWorkspace/copies/\n${JSON.stringify(payload, null, 2)}`
}

export function nextAnnotationRound(copy: WorkspacePageCopy): WorkspacePageCopy {
  return {
    ...copy,
    annotationRound: copy.annotationRound + 1,
    annotations: [],
    changeSummary: `第 ${copy.annotationRound + 1} 轮标注待补充`,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}

export function buildDraftSubmitPrompt(
  versionId: string,
  versionLabel: string,
  versionTitle: string,
  json: string,
): string {
  return [
    `# 版本工作台草稿 · 提交仓库`,
    ``,
    `版本：${versionLabel} · ${versionTitle}`,
    `版本 ID：${versionId}`,
    ``,
    `## 合并目标`,
    `1. 更新 \`src/constants/versionWorkspace/manifest.ts\` 中对应版本的 \`tree\``,
    `2. 将页面副本合并到 \`src/constants/versionWorkspace/forks/registry.ts\`（如有 forks）`,
    `3. 提交 git commit`,
    ``,
    `## 草稿 JSON`,
    '```json',
    json,
    '```',
  ].join('\n')
}

export function resolveCopyArtifactPaths(copy: WorkspacePageCopy, versionId: string): string[] {
  const paths: string[] = []
  const targetDir = `src/views/workspace/copies/${versionId}`
  const specDir = `src/constants/versionWorkspace/copies/${versionId}`

  if (copy.sourceViewPath) {
    const viewFile = copy.sourceViewPath.split('/').pop() ?? 'Page.vue'
    const viewName = viewFile.replace(/\.vue$/, '')
    paths.push(`${targetDir}/${viewName}.copy.vue`)
  }
  if (copy.sourceSpecPath) {
    const specFile = copy.sourceSpecPath.split('/').pop() ?? 'spec.ts'
    paths.push(`${specDir}/${specFile.replace(/\.ts$/, '.copy.ts')}`)
  }
  if (copy.sourceDocPath) {
    const docFile = copy.sourceDocPath.split('/').pop() ?? 'Doc.vue'
    const docName = docFile.replace(/\.vue$/, '')
    paths.push(`${targetDir}/${docName}.copy.vue`)
  }
  return paths
}

export function buildPermanentDeletePrompt(
  copies: WorkspacePageCopy[],
  versionId: string,
  versionLabel: string,
  versionTitle: string,
): string {
  const fileSet = new Set<string>()
  for (const copy of copies) {
    resolveCopyArtifactPaths(copy, versionId).forEach((p) => fileSet.add(p))
  }
  const files = [...fileSet]

  const lines = [
    `# 彻底删除页面副本 · 请让 Cursor 删除磁盘上的副本文件`,
    ``,
    `版本：${versionLabel} · ${versionTitle}`,
    `版本 ID：${versionId}`,
    ``,
    `## 必须遵守`,
    `- **删除下列副本文件**（若存在）；不要只清理浏览器 localStorage`,
    `- **不要删除**源页面与源 Spec 文件`,
    `- 删除后从 \`src/constants/versionWorkspace/forks/registry.ts\` 移除对应副本登记（如有）`,
    ``,
    `## 待删除副本`,
    ...copies.map(
      (c, i) =>
        `${i + 1}. ${c.title}（copyId: \`${c.copyId}\`，源路由: ${c.sourceRouteName}）`,
    ),
    ``,
    `## 待删除文件路径`,
    ...(files.length ? files.map((p, i) => `${i + 1}. \`${p}\``) : ['（无登记路径，请按 copyId 搜索清理）']),
    ``,
    `## 执行命令示例`,
    ...(files.length
      ? files.map((p) => `rm -f ${p}`)
      : ['# 请在工作区搜索 copyId 关联的 .copy.vue / .copy.ts 后删除']),
  ]
  return lines.join('\n')
}

export function normalizeCopy(raw: Partial<WorkspacePageCopy> & { forkId?: string }): WorkspacePageCopy {
  const copyId = raw.copyId ?? raw.forkId ?? ''
  return {
    copyId,
    sourceCatalogId: raw.sourceCatalogId ?? raw.sourceRouteName ?? '',
    sourceRouteName: raw.sourceRouteName ?? '',
    title: raw.title ?? '页面副本',
    annotationRound: raw.annotationRound ?? 1,
    sourceViewPath: raw.sourceViewPath,
    sourceSpecPath: raw.sourceSpecPath,
    sourceDocPath: raw.sourceDocPath,
    annotComponent: raw.annotComponent,
    changeSummary: raw.changeSummary ?? raw.notes,
    annotations: raw.annotations ?? [],
    mockPatches: raw.mockPatches ?? {},
    uiPatches: raw.uiPatches,
    notes: raw.notes,
    updatedAt: raw.updatedAt ?? new Date().toISOString().slice(0, 10),
  }
}
