/** PC 后台 · 文档说明页 PRD 通用类型与维度标签 */

/** PRD 六大核心维度（与 .cursor/skills/prd 一致） */
export const PRD_DIMENSION_LABELS = {
  functionalLogic: '功能逻辑',
  interactiveBehavior: '交互行为',
  visualPresentation: '视觉表现',
  dataRules: '数据规则',
  exceptions: '异常与边界',
  routing: '关联与跳转',
} as const

export type PcPrdDimensionKey = keyof typeof PRD_DIMENSION_LABELS

export type PcPrdDimension = Record<PcPrdDimensionKey, string>

export type PcPrdMeta = {
  title: string
  module: string
  updatedAt: string
  prdVersion: string
}

export type PcPrdFeatureRow = {
  id: number
  module: string
  feature: string
  pageLocation: string
  prd: PcPrdDimension
}

/** 六大维度说明文案（文档页头部展示） */
export const PRD_DIMENSION_HINT =
  '功能清单按六大核心维度输出：功能逻辑、交互行为、视觉表现、数据规则、异常与边界、关联与跳转。'
