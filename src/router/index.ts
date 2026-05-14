import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MobileHubView from '../views/mobile/MobileHubView.vue'
import PcHubView from '../views/pc/PcHubView.vue'
import LiveRoomView from '../views/LiveRoomView.vue'
import AgentView from '../views/AgentView.vue'
import MicControlStatesView from '../views/MicControlStatesView.vue'
import VoiceRoomAppJoinMicView from '../views/VoiceRoomAppJoinMicView.vue'
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
      name: 'mobile',
      component: MobileHubView,
      meta: { title: '移动端' },
    },
    {
      path: '/mobile/live',
      name: 'mobile-live',
      component: LiveRoomView,
      meta: { title: '直播' },
    },
    {
      path: '/mobile/agent',
      name: 'mobile-agent',
      component: AgentView,
      meta: { title: '代理' },
    },
    {
      path: '/mobile/mic',
      name: 'mobile-mic',
      component: MicControlStatesView,
      meta: { title: '麦控状态' },
    },
    {
      path: '/mobile/app-join-mic',
      name: 'mobile-app-join-mic',
      component: VoiceRoomAppJoinMicView,
      meta: { title: 'APP 专享上麦' },
    },
    {
      path: '/pc',
      name: 'pc',
      component: PcHubView,
      meta: { title: 'PC 后台' },
    },
    {
      path: '/pc/reward',
      name: 'pc-reward',
      component: VoiceRoomRewardAdminView,
      meta: { title: '语聊打赏后台' },
    },
    {
      path: '/pc/mic-threshold',
      name: 'pc-mic-threshold',
      component: VoiceRoomMicThresholdView,
      meta: { title: '语音房上麦门槛' },
    },
    {
      path: '/pc/live-commission',
      name: 'pc-live-commission',
      component: LiveCommissionConfigView,
      meta: { title: '直播佣金配置' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  document.title = t ? `${t} · KK Vibe` : 'KK Vibe'
})
