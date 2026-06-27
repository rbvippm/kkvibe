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
import PcAvInteractionModesResearchView from '../views/pc/PcAvInteractionModesResearchView.vue'
import PcStickerPackManageView from '../views/pc/PcStickerPackManageView.vue'
import PcStickerTagManageView from '../views/pc/PcStickerTagManageView.vue'

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
      redirect: '/mobile/home',
      meta: { title: '移动端' },
      children: [
        {
          path: 'home',
          name: 'mobile-home',
          component: () => import('../views/mobile/MobileTabPlaceholderView.vue'),
          meta: {
            title: '首页',
            placeholderTitle: '首页',
            placeholderDesc: '推荐动态、快捷入口等内容将在此展示。',
            placeholderEmoji: '🏠',
          },
        },
        {
          path: 'community',
          name: 'mobile-community',
          component: () => import('../views/mobile/MobileTabPlaceholderView.vue'),
          meta: {
            title: '社区',
            placeholderTitle: '社区',
            placeholderDesc: '圈子、话题与互动内容将在此展示。',
            placeholderEmoji: '🌐',
          },
        },
        {
          path: 'chat',
          name: 'mobile-chat',
          component: () => import('../views/mobile/MobileTabPlaceholderView.vue'),
          meta: {
            title: '会话',
            placeholderTitle: '会话',
            placeholderDesc: '私信与群聊消息将在此展示。',
            placeholderEmoji: '💬',
          },
        },
        {
          path: 'live',
          name: 'mobile-live',
          component: MobileLiveSectionView,
          meta: { title: '直播', hideTabBar: true },
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
          path: 'agent/member/detail',
          name: 'mobile-member-detail',
          component: () => import('../views/mobile/MobileMemberDetailView.vue'),
          meta: { title: '会员详情', hideTabBar: true },
        },
        {
          path: 'agent/detail',
          name: 'mobile-agent-detail',
          component: () => import('../views/mobile/MobileAgentDetailView.vue'),
          meta: { title: '代理详情', hideTabBar: true },
        },
        {
          path: 'agent/xcoin/records',
          name: 'mobile-xcoin-records',
          component: () => import('../views/mobile/MobileXCoinRecordsView.vue'),
          meta: { title: '上下分记录', hideTabBar: true },
        },
        {
          path: 'agent/report',
          name: 'mobile-agent-report',
          component: () => import('../views/mobile/MobileAgentReportView.vue'),
          meta: { title: '我的报表', hideTabBar: true },
        },
        {
          path: 'agent/xcoin/report',
          name: 'mobile-xcoin-report',
          component: () => import('../views/mobile/MobileXCoinReportView.vue'),
          meta: { title: 'X币报表', hideTabBar: true },
        },
        {
          path: 'agent/settlement',
          name: 'mobile-agent-settlement',
          component: () => import('../views/mobile/MobileAgentSettlementDashboardView.vue'),
          meta: { title: '代理结算对账', hideTabBar: true },
        },
        {
          path: 'agent/settlement/detail',
          name: 'mobile-agent-settlement-detail',
          component: () => import('../views/mobile/MobileAgentSettlementDetailView.vue'),
          meta: { title: '流水明细', hideTabBar: true },
        },
        {
          path: 'agent/xcoin/credit/member',
          name: 'mobile-xcoin-credit-member',
          component: () => import('../views/mobile/MobileXCoinCreditView.vue'),
          meta: { title: '给会员上分', hideTabBar: true, xcoinMode: 'member' },
        },
        {
          path: 'agent/xcoin/credit/agent',
          name: 'mobile-xcoin-credit-agent',
          component: () => import('../views/mobile/MobileXCoinCreditView.vue'),
          meta: { title: '给代理上分', hideTabBar: true, xcoinMode: 'agent' },
        },
        {
          path: 'agent/xcoin/select/member',
          name: 'mobile-xcoin-select-member',
          component: () => import('../views/mobile/MobileXCoinSelectView.vue'),
          meta: { title: '选择会员', hideTabBar: true, xcoinMode: 'member' },
        },
        {
          path: 'agent/xcoin/select/agent',
          name: 'mobile-xcoin-select-agent',
          component: () => import('../views/mobile/MobileXCoinSelectView.vue'),
          meta: { title: '选择代理', hideTabBar: true, xcoinMode: 'agent' },
        },
        {
          path: 'games',
          name: 'mobile-games',
          component: MobileGamesView,
          meta: { title: '游戏', hideTabBar: true },
        },
        {
          path: 'mine',
          name: 'mobile-mine',
          component: MobileMineView,
          meta: { title: '我的' },
        },
        {
          path: 'mine/more',
          name: 'mobile-mine-more',
          component: () => import('../views/mobile/MobileMoreFunctionsView.vue'),
          meta: { title: '更多功能', hideTabBar: true },
        },
        {
          path: 'mine/billing',
          name: 'mobile-billing-list',
          component: () => import('../views/mobile/MobileBillingListView.vue'),
          meta: { title: '账单', hideTabBar: true },
        },
        {
          path: 'mine/billing/search',
          name: 'mobile-billing-search',
          component: () => import('../views/mobile/MobileBillingSearchView.vue'),
          meta: { title: '搜索账单', hideTabBar: true },
        },
        {
          path: 'mine/billing/:id',
          name: 'mobile-billing-detail',
          component: () => import('../views/mobile/MobileBillingDetailView.vue'),
          meta: { title: '账单详情', hideTabBar: true },
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
          path: 'av-interaction-modes',
          name: 'pc-av-interaction-modes',
          component: PcAvInteractionModesResearchView,
          meta: { title: '音视频三种模式调研' },
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
        {
          path: 'sticker-manage',
          redirect: { name: 'pc-sticker-pack-manage' },
        },
        {
          path: 'sticker-pack-manage',
          name: 'pc-sticker-pack-manage',
          component: PcStickerPackManageView,
          meta: { title: '贴图包管理' },
        },
        {
          path: 'sticker-tag-manage',
          name: 'pc-sticker-tag-manage',
          component: PcStickerTagManageView,
          meta: { title: '贴图标签管理' },
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
