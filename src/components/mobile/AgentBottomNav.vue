<script setup lang="ts">
import { AGENT_OVERVIEW_ASSETS } from '../../constants/agentOverviewAssets'

type AgentTab = 'overview' | 'team' | 'bet-order' | 'report' | 'me'

defineProps<{
  activeTab: AgentTab
}>()

const emit = defineEmits<{
  switch: [tab: AgentTab]
}>()

const tabs: { key: AgentTab; label: string; icon: string; activeIcon?: string }[] = [
  { key: 'overview', label: '概况', icon: AGENT_OVERVIEW_ASSETS.navOverviewActive, activeIcon: AGENT_OVERVIEW_ASSETS.navOverviewActive },
  { key: 'team', label: '团队管理', icon: AGENT_OVERVIEW_ASSETS.navTeam },
  { key: 'bet-order', label: '注单查询', icon: AGENT_OVERVIEW_ASSETS.navBetOrder, activeIcon: AGENT_OVERVIEW_ASSETS.navBetOrderActive },
  { key: 'report', label: '我的报表', icon: AGENT_OVERVIEW_ASSETS.navReport },
  { key: 'me', label: '我的', icon: AGENT_OVERVIEW_ASSETS.navMe },
]
</script>

<template>
  <nav class="agent-bottom-nav safe-pb" data-name="NvgBar">
    <div class="agent-bottom-nav__inner agent-bottom-nav__inner--five" data-name="菜单栏图标">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="agent-bottom-nav__item"
        :class="{ 'agent-bottom-nav__item--active': activeTab === tab.key }"
        @click="emit('switch', tab.key)"
      >
        <span class="agent-bottom-nav__icon-wrap">
          <img
            :src="activeTab === tab.key && tab.activeIcon ? tab.activeIcon : tab.icon"
            :alt="tab.label"
            class="agent-bottom-nav__icon"
            width="24"
            height="24"
          />
        </span>
        <span class="agent-bottom-nav__label">{{ tab.label }}</span>
      </button>
    </div>
    <div class="agent-bottom-nav__indicator" data-name="状态栏/指示条" aria-hidden="true">
      <span class="agent-bottom-nav__indicator-line" />
    </div>
  </nav>
</template>
