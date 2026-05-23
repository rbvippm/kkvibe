import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MobileAppLayout from '../layouts/MobileAppLayout.vue'
import MobileLiveSectionView from '../views/mobile/MobileLiveSectionView.vue'
import MobileGamesView from '../views/mobile/MobileGamesView.vue'
import MobileMineView from '../views/mobile/MobileMineView.vue'
import PcAdminLayout from '../layouts/PcAdminLayout.vue'
import PcHubView from '../views/pc/PcHubView.vue'
import LiveRoomView from '../views/LiveRoomView.vue'
import AgentView from '../views/AgentView.vue'
import VoiceRoomRewardAdminView from '../views/VoiceRoomRewardAdminView.vue'
import VoiceRoomMicThresholdView from '../views/VoiceRoomMicThresholdView.vue'
import LiveCommissionConfigView from '../views/LiveCommissionConfigView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'KK Vibe' },
    },
    {
      path: '/mobile',
      component: MobileAppLayout,
      redirect: '/mobile/live',
      meta: { title: '移动端' },
      children: [
        {
          path: 'live',
          name: 'mobile-live',
          component: MobileLiveSectionView,
          meta: { title: '直播' },
        },
        {
          path: 'live/room',
          name: 'mobile-live-room',
          component: LiveRoomView,
          meta: { title: '语聊房', hideTabBar: true },
        },
        {
          path: 'agent',
          name: 'mobile-agent',
          component: AgentView,
          meta: { title: '代理' },
        },
        {
          path: 'games',
          name: 'mobile-games',
          component: MobileGamesView,
          meta: { title: '游戏' },
        },
        {
          path: 'mine',
          name: 'mobile-mine',
          component: MobileMineView,
          meta: { title: '我的' },
        },
      ],
    },
    {
      path: '/pc',
      component: PcAdminLayout,
      meta: { title: 'PC 后台' },
      children: [
        {
          path: '',
          name: 'pc',
          component: PcHubView,
          meta: { title: '首页' },
        },
        {
          path: 'reward',
          name: 'pc-reward',
          component: VoiceRoomRewardAdminView,
          meta: { title: '语聊打赏后台' },
        },
        {
          path: 'mic-threshold',
          name: 'pc-mic-threshold',
          component: VoiceRoomMicThresholdView,
          meta: { title: '语音房上麦门槛' },
        },
        {
          path: 'live-commission',
          name: 'pc-live-commission',
          component: LiveCommissionConfigView,
          meta: { title: '直播佣金配置' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  document.title = t ? `${t} · KK Vibe` : 'KK Vibe'
})
