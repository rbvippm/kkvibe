import type { WorkspacePageCopy } from '../types'
import { normalizeCopy } from '../../../utils/workspaceCopy'

/** 仓库内页面副本种子（版本内独立副本，不修改源页面） */
export const WORKSPACE_COPY_REGISTRY: Record<string, WorkspacePageCopy> = {
  'fork-pc-share-agent-demo': normalizeCopy({
    copyId: 'fork-pc-share-agent-demo',
    sourceCatalogId: 'pc-share-agent-config',
    sourceRouteName: 'pc-share-agent-config',
    title: '占成代理配置（副本）',
    annotationRound: 1,
    sourceViewPath: 'src/views/pc/PcShareAgentConfigView.vue',
    sourceSpecPath: 'src/constants/shareAgentConfigSpec.ts',
    sourceDocPath: 'src/views/pc/PcShareAgentConfigDocView.vue',
    annotComponent: 'WfSpecAnnot',
    changeSummary: 'v2.14.0：筛选区新增授信代理维度，列表展示授信标识。',
    annotations: [
      {
        no: 1,
        title: '授信代理筛选',
        items: ['版本副本：在筛选区增加授信代理下拉，与源页注3联动但文案按本版本调整。'],
        changeType: 'modified',
        status: 'draft',
      },
    ],
    mockPatches: {
      rows: [{ id: 'ws-1', agentName: '【版本副本】华南代理', status: 'enabled', shareRatio: 12 }],
    },
    updatedAt: '2026-07-08',
  }),
  'fork-agent-bet-order-demo': normalizeCopy({
    copyId: 'fork-agent-bet-order-demo',
    sourceCatalogId: 'mobile-agent-bet-order',
    sourceRouteName: 'mobile-agent',
    title: '注单查询（副本）',
    annotationRound: 1,
    sourceViewPath: 'src/views/mobile/MobileBetOrderQueryView.vue',
    sourceSpecPath: 'src/constants/betOrderQuerySpec.ts',
    annotComponent: 'Mh5SpecAnnot',
    changeSummary: 'v2.14.0：注单查询页标题与顶部提示按版本调整。',
    annotations: [
      {
        no: 1,
        title: '页面标题',
        items: ['版本副本：标题后缀展示版本标识，便于评审区分源页与副本。'],
        changeType: 'modified',
        status: 'draft',
      },
    ],
    mockPatches: { overviewBanner: '【版本副本】注单查询模块' },
    uiPatches: { pageTitle: '注单查询 · 版本副本' },
    updatedAt: '2026-07-08',
  }),
}

/** @deprecated */
export const WORKSPACE_FORK_REGISTRY = WORKSPACE_COPY_REGISTRY
