import { createRouter, createWebHistory } from 'vue-router'
import {
  getStoredAgentIdentity,
  setStoredAgentIdentity,
} from '../constants/agentIdentity'
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
      path: '/docs/agent-field-definitions',
      name: 'agent-field-definitions',
      component: () => import('../views/AgentFieldDefinitionsView.vue'),
      meta: { title: '占成代理 · 字段定义' },
    },
    {
      path: '/docs/agent-rebate-field-definitions',
      name: 'agent-rebate-field-definitions',
      component: () => import('../views/AgentRebateFieldDefinitionsView.vue'),
      meta: { title: '返佣代理 · 字段定义' },
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
          component: () => import('../views/mobile/MobileLobbyView.vue'),
          meta: { title: '大厅' },
        },
        {
          path: 'vip-club',
          name: 'mobile-vip-club',
          component: () => import('../views/mobile/MobileVipClubView.vue'),
          meta: { title: '贵宾会' },
        },
        {
          path: 'vip-club/community',
          name: 'mobile-vip-club-community',
          component: () => import('../views/mobile/MobileCommunityView.vue'),
          meta: { title: '社区' },
        },
        {
          path: 'vip-club/chat',
          name: 'mobile-vip-club-chat',
          component: () => import('../views/mobile/MobileChatView.vue'),
          meta: { title: '会话' },
        },
        {
          path: 'vip-club/mine',
          name: 'mobile-vip-club-mine',
          component: MobileMineView,
          meta: { title: '我的' },
        },
        {
          path: 'vip-club/lottery',
          name: 'mobile-vip-club-lottery',
          component: () => import('../views/mobile/MobileVipClubLotteryView.vue'),
          meta: { title: '皇者彩票', hideTabBar: true },
        },
        {
          path: 'vip-club/play/:kind/:id?',
          name: 'mobile-vip-club-play',
          component: () => import('../views/mobile/MobileVipClubPlayView.vue'),
          meta: { title: '进入游戏', hideTabBar: true },
        },
        {
          path: 'vip-club/hall/:hallId',
          name: 'mobile-vip-club-hall',
          component: () => import('../views/mobile/MobileVipClubHallView.vue'),
          meta: { title: '贵宾厅', hideTabBar: true },
        },
        {
          path: 'vip-club/:hallId',
          redirect: (to) => `/mobile/vip-club/hall/${String(to.params.hallId)}`,
        },
        {
          path: 'community',
          name: 'mobile-community',
          component: () => import('../views/mobile/MobileCommunityView.vue'),
          meta: { title: '社区' },
        },
        {
          path: 'community/channel',
          name: 'mobile-community-channel',
          component: () => import('../views/mobile/MobileDiscoverChannelView.vue'),
          meta: { title: '频道设置', hideTabBar: true },
        },
        {
          path: 'chat',
          name: 'mobile-chat',
          component: () => import('../views/mobile/MobileChatView.vue'),
          meta: { title: '会话' },
        },
        {
          path: 'chat/room/:id?',
          name: 'mobile-chat-room',
          component: () => import('../views/mobile/MobileChatRoomView.vue'),
          meta: { title: '聊天', hideTabBar: true },
        },
        {
          path: 'discover',
          name: 'mobile-discover',
          component: () => import('../views/mobile/MobileDiscoverView.vue'),
          meta: { title: '发现', hideTabBar: true },
        },
        {
          path: 'discover/channel',
          name: 'mobile-discover-channel',
          component: () => import('../views/mobile/MobileDiscoverChannelView.vue'),
          meta: { title: '频道设置', hideTabBar: true },
        },
        {
          path: 'live/stream',
          name: 'mobile-live-stream',
          component: () => import('../views/mobile/MobileLiveStreamRoomView.vue'),
          meta: { title: '直播间', hideTabBar: true },
        },
        {
          path: 'live/preview',
          name: 'mobile-live-preview',
          component: () => import('../views/mobile/MobileLivePreviewView.vue'),
          meta: { title: '直播预告', hideTabBar: true },
        },
        {
          path: 'live/voice-room',
          name: 'mobile-voice-room',
          component: () => import('../views/mobile/MobileVoiceChatRoomView.vue'),
          meta: { title: '语聊房', hideTabBar: true },
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
          path: 'agent/mine/more',
          name: 'mobile-agent-mine-more',
          component: () => import('../views/mobile/MobileAgentMoreFunctionsView.vue'),
          meta: { title: '更多功能', hideTabBar: true },
        },
        {
          path: 'agent-portal',
          redirect: { name: 'mobile-agent' },
        },
        {
          path: 'agent',
          name: 'mobile-agent',
          component: AgentView,
          meta: { title: '代理中心', hideTabBar: true },
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
          path: 'agent/credit',
          name: 'mobile-agent-credit',
          component: () => import('../views/mobile/MobileAgentCreditView.vue'),
          meta: { title: '代理授信', hideTabBar: true },
        },
        {
          path: 'agent/create-account',
          name: 'mobile-agent-create-account',
          component: () => import('../views/mobile/MobileAgentCreditView.vue'),
          meta: { title: '创建代理账户', hideTabBar: true, agentCreditMode: 'create' },
        },
        {
          path: 'agent/create-member',
          name: 'mobile-agent-create-member',
          component: () => import('../views/mobile/MobileAgentCreateMemberView.vue'),
          meta: { title: '创建会员账户', hideTabBar: true },
        },
        {
          path: 'agent/invite-member',
          name: 'mobile-agent-invite-member',
          component: () => import('../views/mobile/MobileAgentInviteMemberView.vue'),
          meta: { title: '邀请会员为下级代理', hideTabBar: true },
        },
        {
          path: 'agent/invite-records',
          name: 'mobile-agent-invite-records',
          component: () => import('../views/mobile/MobileAgentInviteRecordsView.vue'),
          meta: { title: '我的邀请记录', hideTabBar: true },
        },
        {
          path: 'agent/my-profit',
          name: 'mobile-agent-my-profit',
          component: () => import('../views/mobile/MobileAgentMyProfitView.vue'),
          meta: { title: '我的盈亏', hideTabBar: true },
        },
        {
          path: 'agent/my-share-ratio',
          name: 'mobile-agent-my-share-ratio',
          component: () => import('../views/mobile/MobileAgentMyShareRatioView.vue'),
          meta: { title: '占成比例', hideTabBar: true },
        },
        {
          path: 'agent/profit-ratio',
          name: 'mobile-agent-profit-ratio',
          component: () => import('../views/mobile/MobileAgentProfitRatioView.vue'),
          meta: { title: '代理收益比例', hideTabBar: true },
        },
        {
          path: 'agent/profit-ratio/edit',
          name: 'mobile-agent-profit-ratio-edit',
          component: () => import('../views/mobile/MobileAgentProfitRatioEditView.vue'),
          meta: { title: '设置比例', hideTabBar: true },
        },
        {
          path: 'agent/member/rebate-ratio',
          name: 'mobile-member-rebate-ratio',
          component: () => import('../views/mobile/MobileMemberRebateRatioView.vue'),
          meta: { title: '会员退水比例', hideTabBar: true },
        },
        {
          path: 'agent/member/rebate-ratio/edit',
          name: 'mobile-member-rebate-ratio-edit',
          component: () => import('../views/mobile/MobileMemberRebateRatioEditView.vue'),
          meta: { title: '设置会员退水', hideTabBar: true },
        },
        {
          path: 'agent/member/credit',
          name: 'mobile-member-credit',
          component: () => import('../views/mobile/MobileMemberCreditView.vue'),
          meta: { title: '会员授信', hideTabBar: true },
        },
        {
          path: 'agent/xcoin/records',
          name: 'mobile-xcoin-records',
          component: () => import('../views/mobile/MobileXCoinRecordsView.vue'),
          meta: { title: '信用额度记录', hideTabBar: true },
        },
        {
          path: 'agent/report',
          redirect: { name: 'mobile-agent', query: { tab: 'report' } },
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
          meta: { title: '选择信用会员', hideTabBar: true, xcoinMode: 'member' },
        },
        {
          path: 'agent/xcoin/select/agent',
          name: 'mobile-xcoin-select-agent',
          component: () => import('../views/mobile/MobileXCoinSelectView.vue'),
          meta: { title: '选择信用代理', hideTabBar: true, xcoinMode: 'agent' },
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
          path: 'mine/settings',
          name: 'mobile-mine-settings',
          component: () => import('../views/mobile/MobileSettingsView.vue'),
          meta: { title: '设置', hideTabBar: true },
        },
        {
          path: 'mine/settings/language',
          name: 'mobile-mine-language',
          component: () => import('../views/mobile/MobileLanguageSettingsView.vue'),
          meta: { title: '语言设置', hideTabBar: true },
        },
        {
          path: 'mine/more',
          name: 'mobile-mine-more',
          component: () => import('../views/mobile/MobileMoreFunctionsView.vue'),
          meta: { title: '更多功能', hideTabBar: true },
        },
        {
          path: 'mine/agent-invites',
          name: 'mobile-agent-invites',
          component: () => import('../views/mobile/MobileAgentInvitesView.vue'),
          meta: { title: '代理邀请', hideTabBar: true },
        },
        {
          path: 'mine/invite',
          name: 'mobile-invite-friends',
          component: () => import('../views/mobile/MobileInviteFriendsView.vue'),
          meta: { title: '邀请', hideTabBar: true },
        },
        {
          path: 'mine/invite/records',
          name: 'mobile-invite-records',
          component: () => import('../views/mobile/MobileInviteFriendsRecordsView.vue'),
          meta: { title: '邀请好友记录', hideTabBar: true },
        },
        {
          path: 'mine/invite/rebate',
          name: 'mobile-invite-rebate',
          component: () => import('../views/mobile/MobileInviteRebateListView.vue'),
          meta: { title: '邀请返利', hideTabBar: true },
        },
        {
          path: 'mine/invite/records/:id',
          name: 'mobile-invite-rebate-detail',
          component: () => import('../views/mobile/MobileInviteRebateDetailView.vue'),
          meta: { title: '返利明细', hideTabBar: true },
        },
        {
          path: 'mine/bet-orders',
          name: 'mobile-bet-records',
          component: () => import('../views/mobile/MobileBetOrderQueryView.vue'),
          props: { title: '投注记录', hideSpec: true },
          meta: { title: '投注记录', hideTabBar: true },
        },
        {
          path: 'mine/billing',
          name: 'mobile-billing-list',
          component: () => import('../views/mobile/MobileBillingListView.vue'),
          meta: { title: '账单记录', hideTabBar: true },
        },
        {
          path: 'mine/agent-settle',
          name: 'mobile-agent-settle',
          component: () => import('../views/mobile/MobileAgentSettleView.vue'),
          meta: { title: '代理交收', hideTabBar: true },
        },
        {
          path: 'mine/agent-settle/detail',
          name: 'mobile-agent-settle-detail',
          component: () => import('../views/mobile/MobileAgentSettleDetailView.vue'),
          meta: { title: '代理结算明细', hideTabBar: true },
        },
        {
          path: 'mine/assets',
          name: 'mobile-asset-detail',
          component: () => import('../views/mobile/MobileAssetDetailView.vue'),
          meta: { title: '资产明细', hideTabBar: true },
        },
        {
          path: 'mine/wallet-transfer',
          name: 'mobile-wallet-transfer',
          component: () => import('../views/mobile/MobileWalletTransferView.vue'),
          meta: { title: '充值', hideTabBar: true },
        },
        {
          path: 'mine/wallet-transfer/share',
          name: 'mobile-wallet-deposit-share',
          component: () => import('../views/mobile/MobileWalletDepositShareView.vue'),
          meta: { title: '分享', hideTabBar: true },
        },
        {
          path: 'mine/payout-methods',
          name: 'mobile-payout-methods',
          component: () => import('../views/mobile/MobilePayoutMethodsView.vue'),
          meta: { title: '收款方式', hideTabBar: true },
        },
        {
          path: 'mine/billing/search',
          name: 'mobile-billing-search',
          component: () => import('../views/mobile/MobileBillingSearchView.vue'),
          meta: { title: '搜索账单', hideTabBar: true },
        },
        {
          path: 'mine/billing/stats',
          name: 'mobile-billing-stats',
          component: () => import('../views/mobile/MobileBillingStatsView.vue'),
          meta: { title: '账单统计', hideTabBar: true },
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
          path: 'live-broadcast/doc',
          name: 'pc-live-broadcast-doc',
          component: () => import('../views/pc/PcLiveBroadcastDocView.vue'),
          meta: { title: '直播中控台-文档说明' },
        },
        {
          path: 'live-danmaku-mute-list',
          name: 'pc-live-danmaku-mute-list',
          component: PcLiveDanmakuMuteListView,
          meta: { title: '禁言列表' },
        },
        {
          path: 'live-danmaku-mute-list/doc',
          name: 'pc-live-danmaku-mute-list-doc',
          component: () => import('../views/pc/PcLiveDanmakuMuteListDocView.vue'),
          meta: { title: '禁言列表-文档说明' },
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
          path: 'activity-center',
          name: 'pc-activity-center',
          component: () => import('../views/pc/PcActivityCenterView.vue'),
          meta: { title: '活动中心' },
        },
        {
          path: 'activity-center/doc',
          name: 'pc-activity-center-doc',
          component: () => import('../views/pc/PcActivityCenterDocView.vue'),
          meta: { title: '活动中心-文档说明' },
        },
        {
          path: 'invite-rebate-inviters',
          name: 'pc-invite-rebate-inviters',
          component: () => import('../views/pc/PcInviteRebateInviterView.vue'),
          meta: { title: '邀请列表' },
        },
        {
          path: 'invite-rebate-inviters/doc',
          name: 'pc-invite-rebate-inviters-doc',
          component: () => import('../views/pc/PcInviteRebateInviterDocView.vue'),
          meta: { title: '邀请列表-文档说明' },
        },
        {
          path: 'invite-rebate-invitees',
          name: 'pc-invite-rebate-invitees',
          component: () => import('../views/pc/PcInviteRebateInviteeView.vue'),
          meta: { title: '被邀请人详情' },
        },
        {
          path: 'invite-rebate-invitees/doc',
          name: 'pc-invite-rebate-invitees-doc',
          component: () => import('../views/pc/PcInviteRebateInviteeDocView.vue'),
          meta: { title: '被邀请人详情-文档说明' },
        },
        {
          path: 'invite-rebate-stats',
          name: 'pc-invite-rebate-stats',
          component: () => import('../views/pc/PcInviteRebateStatsView.vue'),
          meta: { title: '日返利统计' },
        },
        {
          path: 'invite-rebate-stats/doc',
          name: 'pc-invite-rebate-stats-doc',
          component: () => import('../views/pc/PcInviteRebateStatsDocView.vue'),
          meta: { title: '日返利统计-文档说明' },
        },
        {
          path: 'invite-rebate-records',
          name: 'pc-invite-rebate-records',
          component: () => import('../views/pc/PcInviteRebateRecordView.vue'),
          meta: { title: '活动明细' },
        },
        {
          path: 'invite-rebate-records/doc',
          name: 'pc-invite-rebate-records-doc',
          component: () => import('../views/pc/PcInviteRebateRecordDocView.vue'),
          meta: { title: '活动明细-文档说明' },
        },
        {
          path: 'user-list',
          name: 'pc-user-list',
          component: () => import('../views/pc/PcUserListView.vue'),
          meta: { title: '用户列表' },
        },
        {
          path: 'user-list/doc',
          name: 'pc-user-list-doc',
          component: () => import('../views/pc/PcUserListDocView.vue'),
          meta: { title: '用户列表-文档说明' },
        },
        {
          path: 'user-list/detail',
          name: 'pc-user-detail',
          component: () => import('../views/pc/PcUserDetailView.vue'),
          meta: { title: '用户详情' },
        },
        {
          path: 'user-list/detail/doc',
          name: 'pc-user-detail-doc',
          component: () => import('../views/pc/PcUserDetailDocView.vue'),
          meta: { title: '用户详情-文档说明' },
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
          path: 'sticker-pack-manage/doc',
          name: 'pc-sticker-pack-manage-doc',
          component: () => import('../views/pc/PcStickerPackManageDocView.vue'),
          meta: { title: '贴图包管理-文档说明' },
        },
        {
          path: 'sticker-tag-manage',
          name: 'pc-sticker-tag-manage',
          component: PcStickerTagManageView,
          meta: { title: '贴图标签管理' },
        },
        {
          path: 'share-agent-config',
          name: 'pc-share-agent-config',
          component: () => import('../views/pc/PcShareAgentConfigView.vue'),
          meta: { title: '占成代理配置' },
        },
        {
          path: 'share-agent-config/doc',
          name: 'pc-share-agent-config-doc',
          component: () => import('../views/pc/PcShareAgentConfigDocView.vue'),
          meta: { title: '占成代理配置-文档说明' },
        },
        {
          path: 'rebate-agent-config',
          name: 'pc-rebate-agent-config',
          component: () => import('../views/pc/PcRebateAgentConfigView.vue'),
          meta: { title: '返佣代理配置' },
        },
        {
          path: 'rebate-agent-config/doc',
          name: 'pc-rebate-agent-config-doc',
          component: () => import('../views/pc/PcRebateAgentConfigDocView.vue'),
          meta: { title: '返佣代理配置-文档说明' },
        },
        {
          path: 'agent-commission-setting',
          name: 'pc-agent-commission-setting',
          component: () => import('../views/pc/PcAgentCommissionSettingView.vue'),
          meta: { title: '返佣金设置' },
        },
        {
          path: 'agent-commission-setting/doc',
          name: 'pc-agent-commission-setting-doc',
          component: () => import('../views/pc/PcAgentCommissionSettingDocView.vue'),
          meta: { title: '返佣金设置-文档说明' },
        },
        {
          path: 'rebate-agent-h5-config',
          name: 'pc-rebate-agent-h5-config',
          component: () => import('../views/pc/PcRebateAgentH5ConfigView.vue'),
          meta: { title: '返佣代理H5配置' },
        },
        {
          path: 'rebate-agent-h5-config/doc',
          name: 'pc-rebate-agent-h5-config-doc',
          component: () => import('../views/pc/PcRebateAgentH5ConfigDocView.vue'),
          meta: { title: '返佣代理H5配置-文档说明' },
        },
        {
          path: 'credit-limit-transfer',
          name: 'pc-credit-limit-transfer',
          component: () => import('../views/pc/PcCreditLimitTransferView.vue'),
          meta: { title: '信用额度记录' },
        },
        {
          path: 'credit-limit-transfer/doc',
          name: 'pc-credit-limit-transfer-doc',
          component: () => import('../views/pc/PcCreditLimitTransferDocView.vue'),
          meta: { title: '信用额度记录-文档说明' },
        },
        {
          path: 'vip-hall-home-config',
          redirect: { name: 'pc-vip-hall-module' },
        },
        {
          path: 'vip-hall-module',
          name: 'pc-vip-hall-module',
          component: () => import('../views/pc/PcVipHallModuleView.vue'),
          meta: { title: '模块管理' },
        },
        {
          path: 'vip-hall-module/doc',
          name: 'pc-vip-hall-module-doc',
          component: () => import('../views/pc/PcVipHallModuleDocView.vue'),
          meta: { title: '模块管理-文档说明' },
        },
        {
          path: 'vip-hall-product',
          name: 'pc-vip-hall-product',
          component: () => import('../views/pc/PcVipHallProductView.vue'),
          meta: { title: '产品管理' },
        },
        {
          path: 'vip-hall-product/doc',
          name: 'pc-vip-hall-product-doc',
          component: () => import('../views/pc/PcVipHallProductDocView.vue'),
          meta: { title: '产品管理-文档说明' },
        },
      ],
    },
    {
      path: '/workspace',
      name: 'workspace-hub',
      component: () => import('../views/workspace/WorkspaceHubView.vue'),
      meta: { title: '版本管理' },
    },
    {
      path: '/workspace/:versionId',
      name: 'workspace-editor',
      component: () => import('../views/workspace/WorkspaceEditorView.vue'),
      meta: { title: '版本编辑' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (!to.path.startsWith('/mobile/agent')) return true

  const raw = to.query.agentType
  if (raw === 'share' || raw === 'rebate') {
    setStoredAgentIdentity(raw)
    return true
  }

  return {
    path: to.path,
    query: { ...to.query, agentType: getStoredAgentIdentity() },
    hash: to.hash,
    replace: true,
  }
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  document.title = t ? `${t} · KK Vibe` : 'KK Vibe'
})
