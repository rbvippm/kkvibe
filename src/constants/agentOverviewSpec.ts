/** 代理端 · 概况 · 移动端 PRD 标注 */

import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const AGENT_OVERVIEW_SPEC_ANNOT_NO = {
  /** 选择币种 Sheet：返佣无信用额度 */
  currencySheet: 3,
} as const

/** 注3 · 概况选择币种（返佣无信用额度） */
export const AGENT_OVERVIEW_CURRENCY_SHEET_SPEC: MobilePrdSpec = {
  no: AGENT_OVERVIEW_SPEC_ANNOT_NO.currencySheet,
  title: '选择币种（返佣无信用额度）',
  sections: buildMobilePrdSections({
    logic: [
      '概况页顶栏币种入口打开「选择币种」底部 Sheet，用于切换钱包余额与统计口径所用币种。',
      '现金 / 信用代理中心分包：现金占成代理仅可选 KKC、KKV、USDT-TRON；信用占成代理仅可选信用额度-CNY、信用额度-USD。',
      '返佣代理不具备信用额度能力，币种列表仅展示现金币种：KKC、KKV、USDT-TRON；不出现「信用额度-CNY」「信用额度-USD」。',
    ],
    interaction: [
      '点概况顶栏币种胶囊 → 底部弹出「选择币种」Sheet。',
      '点某一币种 → 选中并关闭 Sheet，顶栏币种与余额随之刷新。',
      '点关闭按钮或遮罩 → 关闭 Sheet，不改变当前币种。',
      '身份为返佣时，列表不展示信用额度项；若进入返佣前曾选中信用额度币种，自动回退为 KKC。',
    ],
    visual: [
      '底部白底圆角 Sheet：居中标题「选择币种」，标题旁「注3」；与报表/详情共用同一套选择层，无独立关闭按钮。',
      '纵向列表：左侧 28 图标 + 币种名；KKC / KKV / USDT 用切图，信用额度-CNY / 信用额度-USD 用 ¥ / $ 圆形单位图标。',
      '当前选中项文字橙色加粗，其余深灰；概况顶栏胶囊同步回显同一图标与文案（USDT 展示为 USDT，不写 USDT-TRON）。',
      '返佣与现金占成仅三项现金币种；信用占成仅两项信用额度。',
    ],
    data: [
      '现金币种枚举：KKC、KKV、USDT（概况内部可映射 USDT-TRON 余额）。',
      '信用额度枚举（仅信用代理中心）：信用额度-CNY、信用额度-USD。',
      '返佣代理币种集合 = 现金币种；与占成授信/信用额度体系无关。',
      '币种写入代理端全局态：概况切换后，报表、代理详情、会员详情等默认同一币种。',
      '原型默认选中 KKC；余额 Mock 随币种切换。',
    ],
    exception: [
      '返佣代理不得展示或选中信用额度币种。',
      '进入现金中心 / 返佣且当前为信用额度币种时强制回退 KKC；进入信用中心且当前为现金币种时自动切到信用额度-CNY。',
      '无可用币种时不打开空列表（原型始终有现金三项）。',
    ],
    routing: [
      '承载于代理中心概况页（mobile-agent · 概况 Tab）页内 Sheet，不跳转路由。',
      '关闭后仍停留概况；币种选择写入全局代理币种态，概况余额、报表筛选、详情「币种切换」同步回显。',
    ],
  }),
}
