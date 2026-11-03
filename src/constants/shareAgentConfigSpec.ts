/** 占成代理配置（现金）· PRD 与功能清单（六大核心维度） */

import { SHARE_AGENT_CONFIG_SPEC_BUNDLE } from './agentConfigSpec'

export { PRD_DIMENSION_LABELS } from './agentConfigSpec'

export const SHARE_AGENT_CONFIG_META = SHARE_AGENT_CONFIG_SPEC_BUNDLE.meta
export const SHARE_AGENT_CONFIG_BACKGROUND = SHARE_AGENT_CONFIG_SPEC_BUNDLE.background
export const SHARE_AGENT_CONFIG_GOALS = SHARE_AGENT_CONFIG_SPEC_BUNDLE.goals
/** 与页面「注」标注一一对应，不含文档入口本身 */
export const SHARE_AGENT_CONFIG_FEATURE_LIST = SHARE_AGENT_CONFIG_SPEC_BUNDLE.featureList
/** 页面「注」标记编号 · 与 SHARE_AGENT_CONFIG_FEATURE_LIST.id 一一对应 */
export const SHARE_AGENT_SPEC_ANNOT_NO = SHARE_AGENT_CONFIG_SPEC_BUNDLE.annotNo
