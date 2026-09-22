/** 群组管理 · 超级群管理 · PRD（本次只覆盖编辑里的置顶游戏、悬浮游戏） */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type SuperGroupPrdDimension = PcPrdDimension
export type SuperGroupFeatureRow = PcPrdFeatureRow

export const SUPER_GROUP_META = {
  title: '群组管理 · 超级群管理',
  module: '群组管理',
  updatedAt: '2026-09-22',
  prdVersion: 'v1.0',
} as const

export const SUPER_GROUP_BACKGROUND = [
  '超级群列表的查询、重置、导出、查看详情，以及编辑里的「悬浮链接」，都是已上线能力。本次在编辑弹框上迭代，只补充「置顶游戏」和「悬浮游戏」。',
  '置顶游戏挂在群会话顶部，每款游戏配一条群置顶简介，原文展示、不按语种拆分。悬浮游戏是群内悬浮入口，只选游戏，不填简介。',
  '可选游戏来自通用产品管理的全部产品（含已禁用）。模块分类只列启用中的通用模块。',
] as const

export const SUPER_GROUP_GOALS = [
  '编辑超级群时，可为该群勾选置顶游戏，并为每个已选游戏填写群置顶简介。',
  '编辑超级群时，可为该群勾选悬浮游戏，选择规则与置顶游戏相同，不要求简介。',
] as const

const GAME_PICKER_RULES =
  '游戏目录为通用产品的全部产品，含已禁用；名称用产品展示名，按产品 ID 勾选。同一产品挂多个模块时，在各模块里是同一条勾选。模块页签只列启用中的通用模块，默认停在第一个。关键词按产品名称或产品 ID 包含匹配；为空表示不限。点「搜索」或回车后才过滤，改字未搜索则保持上次结果。每页 8 条。「全部选择」作用于当前关键词下所有模块的匹配产品：已全选时再点会取消这些匹配项，未全选（含半选）时把匹配项并入已选。「{模块名}全选」作用于当前模块、当前关键词下的全部产品，含其他页。「已选：N」统计本页签全部已勾选，不限当前模块和当前页。切换模块或关键词回到第 1 页。切换配置页签会清空关键词。'

export const SUPER_GROUP_FEATURE_LIST: SuperGroupFeatureRow[] = [
  {
    id: 1,
    module: '编辑超级群',
    feature: '置顶游戏',
    pageLocation: '编辑弹框 · 置顶游戏页签',
    prd: {
      functionalLogic:
        '为当前超级群勾选要置顶的游戏，并为每个已选游戏填写一条群置顶简介。简介原文展示，不按语种拆分。',
      interactiveBehavior:
        '勾选配置项「置顶游戏」后出现本页签，并自动切到该页签；取消勾选则隐藏页签。页签内用关键词搜索，再按模块勾选产品。每勾选一个产品，下方增加一行简介；取消勾选会立刻去掉该行，已填文字不保留，再次勾选需重填。点「确定」时，若该项已勾选：未选游戏则弹框底部 hint「置顶游戏：请至少选择 1 个游戏」，某条简介为空则 hint「置顶游戏：请填写「游戏名」的群置顶简介」，并切到本页签，弹框不关闭。校验通过后写回该群并关闭，全局顶部提示「保存成功」。点「取消」、遮罩或 × 关闭且不保存。',
      visualPresentation:
        '页签「置顶游戏」按钮外侧「注1」。页签内为「游戏选择」输入框和「搜索」，下方是游戏选择器：全部选择、已选数量、模块页签、当前模块全选、产品两列、分页。简介区标题「群置顶简介」，每个已选产品一行，标签为产品名并带红色星号，占位「请输入群置顶简介，原文展示」。未选产品时显示「勾选产品后填写对应群置顶简介」。',
      dataRules: `简介按产品 ID 存原文，必填，无字数上限，不区分语言。${GAME_PICKER_RULES}取消勾选配置项后不再校验，已选游戏和简介仍留在草稿里，确定后一并写回；再次勾选能看到上次内容。`,
      exceptions:
        '无启用模块时模块区显示「暂无启用模块」。搜索无产品时显示「暂无匹配游戏」，全部选择与模块全选禁用，不展示分页。两个游戏配置都不勾选时，确定仍保存并提示「保存成功」。本期保存只留在本页该群的编辑数据里，不联动群会话展示。',
      routing: '确定后关闭编辑弹框，回到超级群列表。取消、遮罩或 × 同样回到列表，不写回。',
    },
  },
  {
    id: 2,
    module: '编辑超级群',
    feature: '悬浮游戏',
    pageLocation: '编辑弹框 · 悬浮游戏页签',
    prd: {
      functionalLogic: '为当前超级群勾选悬浮入口要展示的游戏。只选游戏，不填写简介。',
      interactiveBehavior:
        '勾选配置项「悬浮游戏」后出现本页签，并自动切到该页签；取消勾选则隐藏页签。搜索、模块切换、全部选择、模块全选、分页与置顶游戏相同，勾选结果互不影响。点「确定」时，若该项已勾选且未选游戏，弹框底部 hint「悬浮游戏：请至少选择 1 个游戏」，并切到本页签，弹框不关闭。校验通过后写回该群并关闭，全局顶部提示「保存成功」。点「取消」、遮罩或 × 关闭且不保存。',
      visualPresentation:
        '页签「悬浮游戏」按钮外侧「注2」。页签内只有「游戏选择」、搜索和游戏选择器，没有群置顶简介。',
      dataRules: `不保存简介。${GAME_PICKER_RULES}取消勾选配置项后不再校验，已选游戏仍留在草稿里，确定后一并写回；再次勾选能看到上次内容。`,
      exceptions:
        '无启用模块时模块区显示「暂无启用模块」。搜索无产品时显示「暂无匹配游戏」，全部选择与模块全选禁用，不展示分页。本期保存只留在本页该群的编辑数据里，不联动群会话展示。',
      routing: '确定后关闭编辑弹框，回到超级群列表。取消、遮罩或 × 同样回到列表，不写回。',
    },
  },
]

export const SUPER_GROUP_SPEC_ANNOT_NO = {
  pinnedGame: 1,
  floatingGame: 2,
} as const

export type SuperGroupAnnotContext = keyof typeof SUPER_GROUP_SPEC_ANNOT_NO

export const SUPER_GROUP_ANNOT_MAP: Record<
  SuperGroupAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  pinnedGame: {
    no: 1,
    title: '置顶游戏',
    items: [
      '勾选后出现本页签。从通用产品里勾选游戏，并为每个已选游戏填写群置顶简介。',
      '至少选 1 个游戏，简介必填。确定后全局顶部提示「保存成功」。',
    ],
  },
  floatingGame: {
    no: 2,
    title: '悬浮游戏',
    items: [
      '勾选后出现本页签。从通用产品里勾选游戏，不需要简介。',
      '至少选 1 个游戏。搜索、模块和全选规则与置顶游戏相同。',
    ],
  },
}
