/** 页面库条目 → 源码路径（供 Cursor 设计模式二次编辑） */
export interface WorkspacePageSource {
  viewPath: string
  specPath?: string
  docPath?: string
  annotComponent: 'WfSpecAnnot' | 'Mh5SpecAnnot'
}

const SOURCE_BY_ROUTE: Record<string, WorkspacePageSource> = {
  'pc-share-agent-config': {
    viewPath: 'src/views/pc/PcShareAgentConfigView.vue',
    specPath: 'src/constants/shareAgentConfigSpec.ts',
    docPath: 'src/views/pc/PcShareAgentConfigDocView.vue',
    annotComponent: 'WfSpecAnnot',
  },
  'pc-credit-limit-transfer': {
    viewPath: 'src/views/pc/PcCreditLimitTransferView.vue',
    specPath: 'src/constants/creditLimitTransferSpec.ts',
    docPath: 'src/views/pc/PcCreditLimitTransferDocView.vue',
    annotComponent: 'WfSpecAnnot',
  },
  'pc-live-broadcast': {
    viewPath: 'src/views/pc/PcLiveBroadcastManageView.vue',
    specPath: 'src/constants/liveBroadcastSpec.ts',
    annotComponent: 'WfSpecAnnot',
  },
  'mobile-agent': {
    viewPath: 'src/views/AgentView.vue',
    specPath: 'src/constants/betOrderQuerySpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-live': {
    viewPath: 'src/views/mobile/MobileLiveSectionView.vue',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-community': {
    viewPath: 'src/components/mobile/MobileCommunityPage.vue',
    specPath: 'src/constants/goLiveSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-vip-club-community': {
    viewPath: 'src/components/mobile/MobileCommunityPage.vue',
    specPath: 'src/constants/goLiveSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-go-live': {
    viewPath: 'src/views/mobile/MobileGoLiveView.vue',
    specPath: 'src/constants/goLiveSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-live-preview': {
    viewPath: 'src/views/mobile/MobileLivePreviewView.vue',
    specPath: 'src/constants/liveRoomMetricsSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-live-stream': {
    viewPath: 'src/views/mobile/MobileLiveStreamRoomView.vue',
    specPath: 'src/constants/liveRoomMetricsSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-voice-room': {
    viewPath: 'src/views/mobile/MobileVoiceChatRoomView.vue',
    specPath: 'src/constants/liveRoomMetricsSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-home': {
    viewPath: 'src/views/mobile/MobileLobbyView.vue',
    annotComponent: 'Mh5SpecAnnot',
  },
  'mobile-chat-room': {
    viewPath: 'src/components/mobile/MobileChatRoomPage.vue',
    specPath: 'src/constants/mobileChatMediaPickerSpec.ts',
    annotComponent: 'Mh5SpecAnnot',
  },
}

export function resolvePageSource(routeName: string): WorkspacePageSource | null {
  return SOURCE_BY_ROUTE[routeName] ?? null
}
