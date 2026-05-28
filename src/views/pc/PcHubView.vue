<script setup lang="ts">
import { RouterLink } from 'vue-router'
import '../../styles/pc-admin-layout.css'

const quickLinks = [
  {
    to: '/pc/account-change-manage',
    icon: '💳',
    title: '账变管理',
    desc: '发起账变、风控/财务审核状态、账变方式与流水。',
  },
  {
    to: '/pc/account-change-record',
    icon: '📋',
    title: '账变记录',
    desc: '账单号维度查询，账变成功记录与重新账变。',
  },
  {
    to: '/pc/account-change-audit',
    icon: '✅',
    title: '账变审核',
    desc: '审核列表、账变方式/流水/账变金额，查看详情。',
  },
  {
    to: '/pc/live-commission',
    icon: '💰',
    title: '直播佣金配置',
    desc: 'Tab + 表格 + 弹框，PC 线框规范标准页。',
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
