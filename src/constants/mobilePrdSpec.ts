/** 移动端 PRD 标注 · 类型与六大结构常量（区别于 PC 的 WfSpecAnnot 简版条目） */

export type MobilePrdSectionKey =
  | 'logic'
  | 'interaction'
  | 'visual'
  | 'data'
  | 'exception'
  | 'routing'

export type MobilePrdSpecSection = {
  key: MobilePrdSectionKey
  label: string
  lines: string[]
}

export type MobilePrdSpec = {
  /** 页面内独立编号，从 1 起 */
  no: number
  /** 功能/页面名称 */
  title: string
  /** 六大结构正文，顺序固定 */
  sections: MobilePrdSpecSection[]
}

export const MOBILE_PRD_SECTION_META: Record<
  MobilePrdSectionKey,
  { label: string; hint: string }
> = {
  logic: {
    label: '功能逻辑',
    hint: '模块做什么、达成什么业务目标',
  },
  interaction: {
    label: '交互行为',
    hint: '用户动作与系统即时反馈',
  },
  visual: {
    label: '视觉表现',
    hint: '业务页面布局、颜色、组件状态与动效；勿写「注N」标注入口或 PRD 浮层本身；颜色与字号以实际设计稿为准（见 MOBILE_PRD_VISUAL_DESIGN_DRAFT_NOTE）',
  },
  data: {
    label: '数据规则',
    hint: '用界面文案描述（如昵称、金刚号、待确认），禁止写代码字段名或英文枚举值',
  },
  exception: {
    label: '异常与边界',
    hint: '错误场景与兜底提示',
  },
  routing: {
    label: '关联与跳转',
    hint: '页面流转与前置/后置状态',
  },
}

export const MOBILE_PRD_SECTION_ORDER: MobilePrdSectionKey[] = [
  'logic',
  'interaction',
  'visual',
  'data',
  'exception',
  'routing',
]

/** 六大结构展示序号：一、二、三…；细项 1. 2. 3. 由 Mh5SpecAnnot 按行号渲染 */
export const MOBILE_PRD_SECTION_ORDINALS = ['一', '二', '三', '四', '五', '六'] as const

/** 视觉表现节末尾统一追加：颜色、字号以设计稿为准 */
export const MOBILE_PRD_VISUAL_DESIGN_DRAFT_NOTE =
  '颜色、字号以实际设计稿为准。'

/** 按固定顺序组装 sections；视觉表现节自动追加设计稿说明 */
export function buildMobilePrdSections(
  content: Record<MobilePrdSectionKey, string[]>,
): MobilePrdSpecSection[] {
  return MOBILE_PRD_SECTION_ORDER.map((key) => {
    const lines = [...content[key]]
    if (
      key === 'visual' &&
      lines.length > 0 &&
      !lines.some((line) => line.includes(MOBILE_PRD_VISUAL_DESIGN_DRAFT_NOTE))
    ) {
      lines.push(MOBILE_PRD_VISUAL_DESIGN_DRAFT_NOTE)
    }
    return {
      key,
      label: MOBILE_PRD_SECTION_META[key].label,
      lines,
    }
  })
}
