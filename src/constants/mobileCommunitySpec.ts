/** 贵宾厅社区 · 移动端 PRD 标注（频道 Tab 旁） */

import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const VIP_CLUB_COMMUNITY_SPEC: MobilePrdSpec = {
  title: '贵宾厅社区展示规则',
  sections: buildMobilePrdSections({
    logic: [
      '直播模块隐藏：贵宾厅社区不提供「直播」频道，顶部 Tab 只有服务 / 策略 / 新闻，频道设置里也不列直播；旗舰厅社区仍保留直播频道。',
      '社群按信用额度开关展示：后台每个社群有「信用额度」开关，只有打开的社群才在贵宾厅社区展示；关闭的社群只在旗舰厅社区出现。服务 / 策略 / 新闻三个频道都按此规则过滤。',
    ],
    interaction: [
      '进入贵宾厅社区默认落在第一个可见频道；若上次停留在直播频道，自动回到第一个可见频道。',
      '切换服务 / 策略 / 新闻时，列表只出现开了信用额度开关的社群；点「加入」/「已加入」行为与旗舰厅一致。',
      '后台关闭某社群的信用额度开关后，贵宾厅社区下次进入不再展示该社群；重新打开后恢复展示。',
    ],
    visual: [
      '贵宾厅社区页面样式与旗舰厅一致（浅色），仅少了直播 Tab，以及未开信用额度开关的社群行。服务频道顶部 Banner 保留。',
    ],
    data: [
      '信用额度开关：打开 / 关闭，默认关闭；后台按社群配置。',
      'Mock 打开的社群：服务频道「品牌宣传部」「金刚官方服务群」「联盟彩票介绍」；策略频道「创业策略分享」；新闻频道「弹珠世界大战赛季开启」。其余社群为关闭，只在旗舰厅展示。',
    ],
    exception: [
      '某频道下没有打开信用额度开关的社群时，展示空态「暂无社群」，频道 Tab 仍保留。',
      '频道设置里关掉全部频道时，展示「暂无频道，请在频道设置中开启」。',
      '社群配置加载失败时沿用上次结果，不展示未开开关的社群，避免旗舰厅社群漏进贵宾厅。',
    ],
    routing: [
      '入口：贵宾会底栏「社区」→ mobile-vip-club-community（/mobile/vip-club/community）。',
      '右上角三横线 → 频道设置 mobile-community-channel（?from=vip-club-community），不列直播频道，返回回到贵宾厅社区。',
      '旗舰厅社区为 mobile-community（/mobile/community），展示全部社群与直播频道，不受信用额度开关影响。',
    ],
  }),
}
