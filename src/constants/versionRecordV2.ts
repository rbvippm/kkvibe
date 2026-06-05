/** v2.x.x 账变细化和流水调整 · 版本文档数据 */

export const VERSION_RECORD_V2_META = {
  version: 'v2.x.x',
  title: '账变细化和流水调整',
  updatedAt: '2026-06-05',
} as const

/** 1. 需求背景 */
export const VERSION_V2_BACKGROUND = ['这是需求背景'] as const

/** 2. 需求目标 */
export const VERSION_V2_GOALS = ['这是需求目标'] as const

export type VersionFeatureRow = {
  id: number
  module: string
  feature: string
  description: string
  route: string
}

export type VersionRevisionRow = {
  id: number
  version: string
  date: string
  content: string
  author: string
}

/** 3. 需求功能清单 */
export const VERSION_V2_FEATURE_LIST: VersionFeatureRow[] = []

export const VERSION_V2_DEFAULT_AUTHOR = 'EZ'

export const VERSION_V2_REVISIONS: VersionRevisionRow[] = []
