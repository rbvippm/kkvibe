/** 直播管理 · 主播审核列表 · 审核勾选渠道 · PRD 与功能清单 */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type LiveAnchorAuditPrdDimension = PcPrdDimension
export type LiveAnchorAuditFeatureRow = PcPrdFeatureRow

export const LIVE_ANCHOR_AUDIT_META = {
  title: '直播管理 · 主播审核列表（审核勾选渠道）',
  module: '直播管理',
  updatedAt: '2026-09-07',
  prdVersion: 'v1.2',
} as const

export const LIVE_ANCHOR_AUDIT_BACKGROUND = [
  '主播审核列表的筛选、列表、查看与通过 / 拒绝是现有能力，本需求不重写。',
  '增量是：审核通过时必须勾选该主播可出镜的授权渠道，渠道枚举与主播列表一致，避免通过后没有渠道可出镜。',
  '渠道明细后续到主播列表修改；已审详情只展示已选数量，不展示渠道名称。',
] as const

export const LIVE_ANCHOR_AUDIT_GOALS = [
  '待审核点「审核」后，选「审核通过」必须至少勾选 1 个授权渠道才能提交。',
  '渠道选择对齐主播列表：关键词搜索、勾选、全选当前页、分页。',
  '选「审核拒绝」时渠道选择禁用并清空，不要求勾选渠道。',
]

export const LIVE_ANCHOR_AUDIT_FEATURE_LIST: LiveAnchorAuditFeatureRow[] = [
  {
    id: 1,
    module: '审核增量',
    feature: '审核勾选渠道',
    pageLocation: '操作列「审核」及审核弹框「渠道选择」',
    prd: {
      functionalLogic:
        '审核通过时为该主播写入可出镜的授权渠道。渠道不是产品字段，只在审核通过时采集，供主播出镜范围使用。',
      interactiveBehavior:
        '待审核行点「审核」打开弹框。选「审核通过」后可搜索、勾选、全选当前页、翻页；至少勾 1 个渠道才能提交。选「审核拒绝」后渠道选择禁用并清空已选。点「审核」校验通过后写入 channelIds，全局顶部提示成功并关框。校验失败停在弹框，底部 hint 提示。',
      visualPresentation:
        '审核弹框「渠道选择」：关键词输入 + 搜索、全选、已选计数、每页 8 条勾选、上一页 / 页码 / 下一页。通过时标签带必填星号；拒绝时整块禁用。操作列旁「注1」。',
      dataRules:
        '渠道枚举与主播列表 ANCHOR_CHANNELS 一致，每页 8 条。通过：至少选 1 个，写入 channelIds。拒绝：channelIds 置空。已审详情授权渠道只展示数量，不展示名称。',
      exceptions:
        '通过未选渠道 ->「请选择授权渠道」。搜索无匹配 ->「暂无匹配渠道」。拒绝时不可勾选。已审核记录不可再次提交。',
      routing: '提交成功关闭弹框并刷新当前行，不跳转主播列表；渠道明细到主播列表修改。',
    },
  },
]

export const LIVE_ANCHOR_AUDIT_SPEC_ANNOT_NO = {
  channel: 1,
} as const

export type LiveAnchorAuditAnnotContext = keyof typeof LIVE_ANCHOR_AUDIT_SPEC_ANNOT_NO

export const LIVE_ANCHOR_AUDIT_ANNOT_MAP: Record<
  LiveAnchorAuditAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  channel: {
    no: 1,
    title: '审核勾选渠道',
    items: [
      '审核通过必须至少勾选 1 个授权渠道。',
      '拒绝时渠道禁用并清空；明细到主播列表改。',
    ],
  },
}
