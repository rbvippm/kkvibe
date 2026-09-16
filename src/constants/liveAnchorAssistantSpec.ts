/** 主播控制台 PRD：页面暂无「注N」，功能清单留空，待后续逐条梳理 */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type LiveAnchorAssistantPrdDimension = PcPrdDimension
export type LiveAnchorAssistantFeatureRow = PcPrdFeatureRow

export const LIVE_ANCHOR_ASSISTANT_META = {
  title: '主播控制台',
  module: '主播后台',
  updatedAt: '2026-09-16',
  prdVersion: 'v1.5',
} as const

export const LIVE_ANCHOR_ASSISTANT_BACKGROUND = [
  '主播控制台用于 PC + OBS 开播与语聊房控场。标注将按功能逐条补齐，当前原型先不挂「注N」。',
]

export const LIVE_ANCHOR_ASSISTANT_GOALS = [
  '先把交互原型跑通，再按功能点逐条补 PRD 标注与功能清单。',
]

export const LIVE_ANCHOR_ASSISTANT_FEATURE_LIST: LiveAnchorAssistantFeatureRow[] = []

export const LIVE_ANCHOR_ASSISTANT_SPEC_ANNOT_NO = {} as const

export type LiveAnchorAssistantAnnotContext = keyof typeof LIVE_ANCHOR_ASSISTANT_SPEC_ANNOT_NO

export const LIVE_ANCHOR_ASSISTANT_ANNOT_MAP: Record<
  LiveAnchorAssistantAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {}
