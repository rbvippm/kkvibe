import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MobileAppLayout from '../layouts/MobileAppLayout.vue'
import MobileLiveSectionView from '../views/mobile/MobileLiveSectionView.vue'
import MobileGamesView from '../views/mobile/MobileGamesView.vue'
import MobileMineView from '../views/mobile/MobileMineView.vue'
import MobileUserHomeView from '../views/mobile/MobileUserHomeView.vue'
import MobileVipDetailView from '../views/mobile/MobileVipDetailView.vue'
import PcAdminLayout from '../layouts/PcAdminLayout.vue'
import PcHubView from '../views/pc/PcHubView.vue'
import LiveRoomView from '../views/LiveRoomView.vue'
import AgentView from '../views/AgentView.vue'
import VoiceRoomRewardAdminView from '../views/VoiceRoomRewardAdminView.vue'
import VoiceRoomMicThresholdView from '../views/VoiceRoomMicThresholdView.vue'
import LiveCommissionConfigView from '../views/LiveCommissionConfigView.vue'
import PcLiveBroadcastManageView from '../views/pc/PcLiveBroadcastManageView.vue'
import PcLiveDanmakuMuteListView from '../views/pc/PcLiveDanmakuMuteListView.vue'
import PcSuperGroupManageView from '../views/pc/PcSuperGroupManageView.vue'
import PcAccountChangeManageView from '../views/pc/PcAccountChangeManageView.vue'
import PcAccountChangeRecordView from '../views/pc/PcAccountChangeRecordView.vue'
import PcAccountChangeAuditView from '../views/pc/PcAccountChangeAuditView.vue'
import PcTurnoverAuditView from '../views/pc/PcTurnoverAuditView.vue'
import PcUserManageView from '../views/pc/PcUserManageView.vue'
import PcWithdrawTurnoverRecordView from '../views/pc/PcWithdrawTurnoverRecordView.vue'
import PcVersionRecordV2View from '../views/pc/PcVersionRecordV2View.vue'
import PcReconciliationRelatedView from '../views/pc/PcReconciliationRelatedView.vue'
import PcVoiceRoomRolePermissionsView from '../views/pc/PcVoiceRoomRolePermissionsView.vue'

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
        {
          path: 'user',
          name: 'mobile-user-home',
          component: MobileUserHomeView,
          meta: { title: '个人主页', hideTabBar: true },
        },
        {
          path: 'vip',
          name: 'mobile-vip',
          component: MobileVipDetailView,
          meta: { title: 'VIP', hideTabBar: true },
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
          path: 'version-record/v2-account-turnover',
          redirect: { name: 'pc-version-record-v2-intro' },
        },
        {
          path: 'version-record/v2-account-turnover/intro',
          name: 'pc-version-record-v2-intro',
          component: PcVersionRecordV2View,
          meta: { title: '需求简介' },
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
          path: 'voice-role-permissions',
          name: 'pc-voice-role-permissions',
          component: PcVoiceRoomRolePermissionsView,
          meta: { title: '角色权限与麦控' },
        },
        {
          path: 'live-broadcast',
          name: 'pc-live-broadcast',
          component: PcLiveBroadcastManageView,
          meta: { title: '直播中控台' },
        },
        {
          path: 'live-danmaku-mute-list',
          name: 'pc-live-danmaku-mute-list',
          component: PcLiveDanmakuMuteListView,
          meta: { title: '禁言列表' },
        },
        {
          path: 'live-commission',
          name: 'pc-live-commission',
          component: LiveCommissionConfigView,
          meta: { title: '直播佣金配置' },
        },
        {
          path: 'live-super-group-manage',
          name: 'pc-live-super-group-manage',
          component: PcSuperGroupManageView,
          meta: { title: '超级群管理' },
        },
        {
          path: 'user-manage',
          name: 'pc-user-manage',
          component: PcUserManageView,
          meta: { title: '用户详情' },
        },
        {
          path: 'account-change-manage',
          name: 'pc-account-change-manage',
          component: PcAccountChangeManageView,
          meta: { title: '账变管理' },
        },
        {
          path: 'account-change-record',
          name: 'pc-account-change-record',
          component: PcAccountChangeRecordView,
          meta: { title: '账变记录' },
        },
        {
          path: 'account-change-audit',
          name: 'pc-account-change-audit',
          component: PcAccountChangeAuditView,
          meta: { title: '账变审核' },
        },
        {
          path: 'turnover-audit',
          name: 'pc-turnover-audit',
          component: PcTurnoverAuditView,
          meta: { title: '账变审核' },
        },
        {
          path: 'withdraw-turnover-record',
          name: 'pc-withdraw-turnover-record',
          component: PcWithdrawTurnoverRecordView,
          meta: { title: '提现流水变更记录' },
        },
        {
          path: 'reconciliation-related',
          name: 'pc-reconciliation-related',
          component: PcReconciliationRelatedView,
          meta: { title: '对账相关' },
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
