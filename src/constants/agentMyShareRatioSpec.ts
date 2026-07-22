/** 代理端 · 我的占成比例 · 移动端 PRD 标注（Figma 1433:25538） */

import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const AGENT_MY_SHARE_RATIO_SPEC_ANNOT_NO = {
  myShareRatio: 1,
} as const

export const AGENT_MY_SHARE_RATIO_SPEC: MobilePrdSpec = {
  no: AGENT_MY_SHARE_RATIO_SPEC_ANNOT_NO.myShareRatio,
  title: '我的占成比例',
  sections: buildMobilePrdSections({
    logic: [
      '代理在概况页点击「占成比例」后，以居中弹框查看本人各占成类型比例（只读），用于了解当前分成配置。',
      '弹框一张表：占成类型 / 占成比例；原 VIP晋级礼金、VIP额外奖金与活动金合并为「其他成本」置于表末；不提供编辑；确认后关闭弹框留在概况。',
    ],
    interaction: [
      '入口：代理中心概况 → 账号卡「占成比例」。',
      '弹出后背景概况页半透明遮罩 + 模糊；点击「确定」或遮罩关闭弹框。',
    ],
    visual: [
      '遮罩：黑色 25% 透明 + 模糊，盖住概况页。',
      '居中白底圆角卡：内嵌一张圆角表格，表头浅橙渐变；列「占成类型 / 占成比例」。',
      '表体白底行，浅灰分隔线；类型左对齐，比例右对齐；内容区可纵向滚动。',
      '卡片底部橙色渐变「确定」按钮（圆角）。',
    ],
    data: [
      '占成类型顺序与数值以产品配置为准；原型 Mock：刮刮乐 2.5%、棋牌 1.8%、弹珠 1.5%、彩票 1.3%、趣投 1.1%、体育 0.9%、真人 0.8%、老虎机 0.6%、捕鱼 0.5%、其他成本 1.0%。',
      '「其他成本」合并原 VIP晋级礼金、VIP额外奖金与活动金，共用同一占成比例。',
      '占成比例展示为带百分号的小数文案。',
    ],
    exception: [
      '无配置数据时表格展示空态「暂无占成比例」；原型阶段始终有 Mock 行。',
      '重复点击「确定」仅关闭弹框，不跳转。',
    ],
    routing: [
      '交互承载于 mobile-agent 概况页弹框（Figma 1433:25289）。',
      '目录路由 mobile-agent-my-share-ratio 进入后重定向概况并自动打开弹框。',
      '「确定」/ 遮罩关闭 → 仍停留在概况页。',
    ],
  }),
}
