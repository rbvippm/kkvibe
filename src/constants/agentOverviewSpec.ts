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
      '占成代理可选现金币种与信用额度分币种：KKC、KKV、USDT-TRON、信用额度-CNY、信用额度-USD。',
      '返佣代理不具备信用额度能力，币种列表仅展示现金币种：KKC、KKV、USDT-TRON；不出现「信用额度-CNY」「信用额度-USD」。',
    ],
    interaction: [
      '点概况顶栏币种胶囊 → 底部弹出「选择币种」Sheet。',
      '点某一币种 → 选中并关闭 Sheet，顶栏币种与余额随之刷新。',
      '点关闭按钮或遮罩 → 关闭 Sheet，不改变当前币种。',
      '身份为返佣时，列表不展示信用额度项；若进入返佣前曾选中信用额度币种，自动回退为 KKC。',
    ],
    visual: [
      '底部白底圆角 Sheet：标题「选择币种」+ 右侧关闭；标题旁「注3」。',
      '纵向币种卡片列表：左侧色圆图标 + 币种名；当前选中项橙色描边 + 右侧橙色勾选。',
      '返佣身份下仅三张现金币种卡；占成身份下五张（含两张信用额度）。',
    ],
    data: [
      '现金币种枚举：KKC、KKV、USDT-TRON。',
      '信用额度枚举（仅占成）：信用额度-CNY、信用额度-USD。',
      '返佣代理币种集合 = 现金币种；与占成授信/信用额度体系无关。',
      '原型默认选中 KKC；余额 Mock 随币种切换。',
    ],
    exception: [
      '返佣代理不得展示或选中信用额度币种。',
      '从占成切到返佣且当前为信用额度币种时，强制回退 KKC，避免顶栏与列表不一致。',
      '无可用币种时不打开空列表（原型始终有现金三项）。',
    ],
    routing: [
      '承载于代理中心概况页（mobile-agent · 概况 Tab）页内 Sheet，不跳转路由。',
      '关闭后仍停留概况；币种选择写入全局代理币种态，影响概况余额等展示。',
    ],
  }),
}
