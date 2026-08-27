<script setup lang="ts">
import { RouterLink } from 'vue-router'
import '../../styles/pc-admin-layout.css'

const quickLinks = [
  {
    to: '/pc/av-interaction-modes',
    icon: '📑',
    title: '音视频三种模式调研',
    desc: '链接分享、好友通话、直播连麦对比；KK Vibe 定位与 API 建议。',
  },
  {
    to: '/pc/version-record/v2-account-turnover/intro',
    icon: '📋',
    title: 'v2.x.x 账变细化和流水调整',
    desc: '版本记录：需求概要与修订记录文档。',
  },
  {
    to: '/pc/account-change-manage',
    icon: '💳',
    title: '账变管理',
    desc: '发起账变、风控/财务审核状态、账变方式与提现流水。',
  },
  {
    to: '/pc/account-change-record',
    icon: '📋',
    title: '账变记录',
    desc: '账单号维度查询，账变成功记录与重新账变。',
  },
  {
    to: '/pc/account-change-audit',
    icon: '🧾',
    title: '账变审核',
    desc: '审核列表、账变方式/提现流水/账变金额，查看详情。',
  },
  {
    to: '/pc/turnover-audit',
    icon: '🧾',
    title: '账变审核',
    desc: '与账变管理下账变审核相同界面，供风控角色独立入口。',
  },
  {
    to: '/pc/user-manage',
    icon: '👤',
    title: '用户详情',
    desc: '用户资产详情，虚拟货币/法币账户与钱包、银行资产查询。',
  },
  {
    to: '/pc/withdraw-turnover-record',
    icon: '💰',
    title: '提现流水变更记录',
    desc: '提现流水要求全链路记录，含充值/有效流水/提现清零等业务类型。',
  },
  {
    to: '/pc/live-broadcast',
    icon: '📺',
    title: '直播中控台',
    desc: '直播画面、弹幕消息管理，支持禁言与删除弹幕。',
  },
  {
    to: '/pc/live-anchor-list',
    icon: '📋',
    title: '主播列表',
    desc: '全局与按主播配置基准人数、预约、热度、本场点赞及高阶增减规则。',
  },
  {
    to: '/pc/live-danmaku-mute-list',
    icon: '🚫',
    title: '禁言列表',
    desc: '直播间弹幕禁言记录，支持查询与解除禁言。',
  },
  {
    to: '/pc/live-commission',
    icon: '💰',
    title: '直播佣金配置',
    desc: 'Tab + 表格 + 弹框，PC 线框规范标准页。',
  },
  {
    to: '/pc/live-super-group-manage',
    icon: '👥',
    title: '超级群管理',
    desc: '超级群列表查询、筛选与导出，支持查看群详情。',
  },
  {
    to: '/pc/reward',
    icon: '🎁',
    title: '语聊打赏后台',
    desc: '打赏列表与结算列表，支持筛选与表格布局。',
  },
  {
    to: '/pc/mic-threshold',
    icon: '🎚',
    title: '语音房上麦门槛',
    desc: '胜率优先上麦开关；分币种充值门槛与总资产规则。',
  },
  {
    to: '/pc/sticker-pack-manage',
    icon: '📦',
    title: '贴图包管理',
    desc: '整套贴图资源（Cuppy 等），含托盘图标、批量上传与 Emoji 映射。',
  },
  {
    to: '/pc/sticker-tag-manage',
    icon: '🏷',
    title: '贴图标签管理',
    desc: 'App 顶部快捷筛选项，配置引导 Emoji 与关联搜索词。',
  },
]
</script>

<template>
  <div class="pc-dashboard">
    <h1 class="pc-dashboard__title">工作台</h1>
    <p class="pc-dashboard__desc">从左侧菜单或下方快捷入口进入各管理模块。</p>

    <div class="pc-dashboard__grid">
      <RouterLink
        v-for="item in quickLinks"
        :key="item.to"
        :to="item.to"
        class="pc-dashboard__card"
      >
        <span class="pc-dashboard__card-icon">{{ item.icon }}</span>
        <h2 class="pc-dashboard__card-title">{{ item.title }}</h2>
        <p class="pc-dashboard__card-desc">{{ item.desc }}</p>
      </RouterLink>
    </div>
  </div>
</template>
