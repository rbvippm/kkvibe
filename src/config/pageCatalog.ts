import { flattenPcMenuLeaves, pcDocRoutes } from './pcMenu'
import type { PageCatalogItem, WorkspacePlatform } from '../constants/versionWorkspace/types'

function withPath(path: string, query?: Record<string, string>): string {
  if (!query) return path
  const params = new URLSearchParams(query)
  return `${path}?${params.toString()}`
}

/** 移动端 H5 路由目录（非 agent 路径，覆盖一级/二级/三级页面） */
const MOBILE_H5_CATALOG: PageCatalogItem[] = [
  { id: 'mobile-home', platform: 'mobile', routeName: 'mobile-home', path: '/mobile/home', title: '大厅', group: '一级 Tab', pagePath: ['移动端', '大厅'] },
  { id: 'mobile-vip-club', platform: 'mobile', routeName: 'mobile-vip-club', path: '/mobile/vip-club', title: '贵宾会', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会'] },
  { id: 'mobile-vip-club-community', platform: 'mobile', routeName: 'mobile-vip-club-community', path: '/mobile/vip-club/community', title: '贵宾会·社区', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会', '社区'] },
  { id: 'mobile-vip-club-chat', platform: 'mobile', routeName: 'mobile-vip-club-chat', path: '/mobile/vip-club/chat', title: '贵宾会·会话', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会', '会话'] },
  { id: 'mobile-vip-club-mine', platform: 'mobile', routeName: 'mobile-vip-club-mine', path: '/mobile/vip-club/mine', title: '贵宾会·我的', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会', '我的'] },
  { id: 'mobile-vip-club-lottery', platform: 'mobile', routeName: 'mobile-vip-club-lottery', path: '/mobile/vip-club/lottery', title: '皇者彩票', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会', '皇者彩票'] },
  { id: 'mobile-vip-club-sports', platform: 'mobile', routeName: 'mobile-vip-club-play', path: '/mobile/vip-club/play/sports', title: '金刚体育', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会', '金刚体育'] },
  { id: 'mobile-vip-club-hall', platform: 'mobile', routeName: 'mobile-vip-club-hall', path: '/mobile/vip-club/hall/macau', title: '贵宾厅占位', group: '大厅', pagePath: ['移动端', '大厅', '贵宾会', '贵宾厅'] },
  { id: 'mobile-community', platform: 'mobile', routeName: 'mobile-community', path: '/mobile/community', title: '社区', group: '一级 Tab', pagePath: ['移动端', '社区'] },
  { id: 'mobile-chat', platform: 'mobile', routeName: 'mobile-chat', path: '/mobile/chat', title: '会话', group: '一级 Tab', pagePath: ['移动端', '会话'] },
  { id: 'mobile-chat-room', platform: 'mobile', routeName: 'mobile-chat-room', path: '/mobile/chat/room/group-demo', title: '聊天详情·多图', group: '会话', pagePath: ['移动端', '会话', '聊天详情'] },
  { id: 'mobile-chat-h5-article', platform: 'mobile', routeName: 'mobile-chat-room', path: '/mobile/chat/room/h5-article-demo', title: 'h5图文入口', group: '会话', pagePath: ['移动端', '会话', 'h5图文入口'] },
  { id: 'mobile-mine', platform: 'mobile', routeName: 'mobile-mine', path: '/mobile/mine', title: '我的', group: '一级 Tab', pagePath: ['移动端', '我的'] },
  { id: 'mobile-live', platform: 'mobile', routeName: 'mobile-live', path: '/mobile/live', title: '直播', group: '直播', pagePath: ['移动端', '直播'] },
  { id: 'mobile-live-room', platform: 'mobile', routeName: 'mobile-live-room', path: '/mobile/live/room', title: '语聊房', group: '直播', pagePath: ['移动端', '直播', '语聊房'] },
  { id: 'mobile-games', platform: 'mobile', routeName: 'mobile-games', path: '/mobile/games', title: '游戏', group: '游戏', pagePath: ['移动端', '游戏'] },
  { id: 'mobile-mine-settings', platform: 'mobile', routeName: 'mobile-mine-settings', path: '/mobile/mine/settings', title: '设置', group: '我的', pagePath: ['移动端', '我的', '设置'] },
  { id: 'mobile-mine-language', platform: 'mobile', routeName: 'mobile-mine-language', path: '/mobile/mine/settings/language', title: '语言设置', group: '我的', pagePath: ['移动端', '我的', '设置', '语言设置'] },
  { id: 'mobile-mine-more', platform: 'mobile', routeName: 'mobile-mine-more', path: '/mobile/mine/more', title: '更多功能', group: '我的', pagePath: ['移动端', '我的', '更多功能'] },
  { id: 'mobile-agent-invites', platform: 'mobile', routeName: 'mobile-agent-invites', path: '/mobile/mine/agent-invites', title: '代理邀请', group: '我的', pagePath: ['移动端', '我的', '代理邀请'] },
  { id: 'mobile-invite-friends', platform: 'mobile', routeName: 'mobile-invite-friends', path: '/mobile/mine/invite', title: '邀请好友', group: '我的', pagePath: ['移动端', '我的', '邀请好友'] },
  { id: 'mobile-invite-records', platform: 'mobile', routeName: 'mobile-invite-records', path: '/mobile/mine/invite/records', title: '邀请好友记录', group: '我的', pagePath: ['移动端', '我的', '邀请好友', '邀请好友记录'] },
  { id: 'mobile-invite-rebate', platform: 'mobile', routeName: 'mobile-invite-rebate', path: '/mobile/mine/invite/rebate', title: '邀请返利', group: '我的', pagePath: ['移动端', '我的', '邀请好友', '邀请返利'] },
  { id: 'mobile-invite-rebate-detail', platform: 'mobile', routeName: 'mobile-invite-rebate-detail', path: '/mobile/mine/invite/records/:id', title: '返利明细', group: '我的', pagePath: ['移动端', '我的', '邀请好友', '邀请好友记录', '返利明细'] },
  { id: 'mobile-billing-list', platform: 'mobile', routeName: 'mobile-billing-list', path: '/mobile/mine/billing', title: '账单记录', group: '我的', pagePath: ['移动端', '我的', '账单记录'] },
  { id: 'mobile-bet-records', platform: 'mobile', routeName: 'mobile-bet-records', path: '/mobile/mine/bet-orders', title: '投注记录', group: '我的', pagePath: ['移动端', '我的', '投注记录'] },
  { id: 'mobile-agent-settle', platform: 'mobile', routeName: 'mobile-agent-settle', path: '/mobile/mine/agent-settle', title: '代理交收', group: '我的', pagePath: ['移动端', '我的', '代理交收'] },
  { id: 'mobile-agent-settle-detail', platform: 'mobile', routeName: 'mobile-agent-settle-detail', path: '/mobile/mine/agent-settle/detail', title: '代理结算明细', group: '我的', pagePath: ['移动端', '我的', '代理交收', '代理结算明细'] },
  { id: 'mobile-billing-stats', platform: 'mobile', routeName: 'mobile-billing-stats', path: '/mobile/mine/billing/stats', title: '账单统计', group: '我的', pagePath: ['移动端', '我的', '账单', '账单统计'] },
  { id: 'mobile-asset-detail', platform: 'mobile', routeName: 'mobile-asset-detail', path: '/mobile/mine/assets', title: '资产明细', group: '我的', pagePath: ['移动端', '我的', '资产明细'] },
  { id: 'mobile-wallet-transfer', platform: 'mobile', routeName: 'mobile-wallet-transfer', path: '/mobile/mine/wallet-transfer', title: '充值/提现/兑换', group: '我的', pagePath: ['移动端', '我的', '充值提现兑换'] },
  { id: 'mobile-payout-methods', platform: 'mobile', routeName: 'mobile-payout-methods', path: '/mobile/mine/payout-methods', title: '收款方式', group: '我的', pagePath: ['移动端', '我的', '收款方式'] },
  { id: 'mobile-billing-search', platform: 'mobile', routeName: 'mobile-billing-search', path: '/mobile/mine/billing/search', title: '搜索账单', group: '我的', pagePath: ['移动端', '我的', '账单', '搜索账单'] },
  { id: 'mobile-billing-detail', platform: 'mobile', routeName: 'mobile-billing-detail', path: '/mobile/mine/billing/demo', title: '账单详情', group: '我的', pagePath: ['移动端', '我的', '账单', '账单详情'] },
  { id: 'mobile-vip', platform: 'mobile', routeName: 'mobile-vip', path: '/mobile/vip', title: 'VIP', group: '用户', pagePath: ['移动端', '用户', 'VIP'] },
  { id: 'mobile-user-home', platform: 'mobile', routeName: 'mobile-user-home', path: '/mobile/user', title: '个人主页', group: '用户', pagePath: ['移动端', '用户', '个人主页'] },
]

/** 代理端 H5 路由目录（含 Tab 页、二级页、三级流程页） */
const AGENT_H5_CATALOG: PageCatalogItem[] = [
  {
    id: 'agent-field-definitions',
    platform: 'agent',
    routeName: 'agent-field-definitions',
    path: '/docs/agent-field-definitions',
    title: '字段定义',
    group: '文档',
    pagePath: ['代理端', '占成代理', '字段定义'],
  },
  {
    id: 'agent-rebate-field-definitions',
    platform: 'agent',
    routeName: 'agent-rebate-field-definitions',
    path: '/docs/agent-rebate-field-definitions',
    title: '字段定义',
    group: '文档',
    pagePath: ['代理端', '返佣代理', '字段定义'],
  },
  { id: 'mobile-agent', platform: 'agent', routeName: 'mobile-agent', path: '/mobile/agent', title: '代理中心', group: '概况', pagePath: ['代理端', '代理中心'] },
  { id: 'mobile-agent-overview', platform: 'agent', routeName: 'mobile-agent', path: '/mobile/agent', title: '概况', group: '概况', query: { tab: 'overview' }, pagePath: ['代理端', '代理中心', '概况'] },
  { id: 'mobile-agent-team', platform: 'agent', routeName: 'mobile-agent', path: '/mobile/agent', title: '团队管理', group: '团队', query: { tab: 'team' }, pagePath: ['代理端', '代理中心', '团队管理'] },
  { id: 'mobile-agent-bet-order', platform: 'agent', routeName: 'mobile-agent', path: '/mobile/agent', title: '注单查询', group: '注单', query: { tab: 'bet-order' }, pagePath: ['代理端', '代理中心', '注单查询'] },
  { id: 'mobile-agent-report', platform: 'agent', routeName: 'mobile-agent', path: '/mobile/agent', title: '我的报表', group: '报表', query: { tab: 'report' }, pagePath: ['代理端', '代理中心', '我的报表'] },
  { id: 'mobile-agent-me', platform: 'agent', routeName: 'mobile-agent', path: '/mobile/agent', title: '我的', group: '我的', query: { tab: 'me' }, pagePath: ['代理端', '代理中心', '我的'] },
  { id: 'mobile-agent-mine-more', platform: 'agent', routeName: 'mobile-agent-mine-more', path: '/mobile/agent/mine/more', title: '更多功能', group: '我的', pagePath: ['代理端', '我的', '更多功能'] },
  { id: 'mobile-agent-detail', platform: 'agent', routeName: 'mobile-agent-detail', path: '/mobile/agent/detail', title: '代理详情', group: '团队', pagePath: ['代理端', '团队', '代理详情'] },
  { id: 'mobile-member-detail', platform: 'agent', routeName: 'mobile-member-detail', path: '/mobile/agent/member/detail', title: '会员详情', group: '团队', pagePath: ['代理端', '团队', '会员详情'] },
  { id: 'mobile-agent-credit', platform: 'agent', routeName: 'mobile-agent-credit', path: '/mobile/agent/credit', title: '代理授信', group: '授信', pagePath: ['代理端', '授信', '代理授信'] },
  { id: 'mobile-agent-create-account', platform: 'agent', routeName: 'mobile-agent-create-account', path: '/mobile/agent/create-account', title: '创建代理账户', group: '团队', pagePath: ['代理端', '团队', '创建代理账户'] },
  { id: 'mobile-agent-create-member', platform: 'agent', routeName: 'mobile-agent-create-member', path: '/mobile/agent/create-member', title: '创建会员账户', group: '团队', pagePath: ['代理端', '团队', '创建会员账户'] },
  { id: 'mobile-member-credit', platform: 'agent', routeName: 'mobile-member-credit', path: '/mobile/agent/member/credit', title: '会员授信', group: '授信', pagePath: ['代理端', '授信', '会员授信'] },
  { id: 'mobile-agent-invite-member', platform: 'agent', routeName: 'mobile-agent-invite-member', path: '/mobile/agent/invite-member', title: '邀请会员为下级代理', group: '邀请', pagePath: ['代理端', '邀请', '邀请会员为下级代理'] },
  { id: 'mobile-agent-invite-records', platform: 'agent', routeName: 'mobile-agent-invite-records', path: '/mobile/agent/invite-records', title: '我的邀请记录', group: '邀请', pagePath: ['代理端', '邀请', '我的邀请记录'] },
  { id: 'mobile-agent-my-profit', platform: 'agent', routeName: 'mobile-agent-my-profit', path: '/mobile/agent/my-profit', title: '我的盈亏', group: '概况', pagePath: ['代理端', '代理中心', '我的盈亏'] },
  { id: 'mobile-agent-my-share-ratio', platform: 'agent', routeName: 'mobile-agent-my-share-ratio', path: '/mobile/agent/my-share-ratio', title: '占成比例', group: '概况', pagePath: ['代理端', '代理中心', '占成比例'] },
  { id: 'mobile-agent-profit-ratio', platform: 'agent', routeName: 'mobile-agent-profit-ratio', path: '/mobile/agent/profit-ratio', title: '代理收益比例', group: '收益比例', pagePath: ['代理端', '收益比例', '代理收益比例'] },
  { id: 'mobile-agent-profit-ratio-edit', platform: 'agent', routeName: 'mobile-agent-profit-ratio-edit', path: '/mobile/agent/profit-ratio/edit', title: '设置比例', group: '收益比例', pagePath: ['代理端', '收益比例', '设置比例'] },
  { id: 'mobile-member-rebate-ratio', platform: 'agent', routeName: 'mobile-member-rebate-ratio', path: '/mobile/agent/member/rebate-ratio', title: '会员退水比例', group: '收益比例', pagePath: ['代理端', '收益比例', '会员退水比例'] },
  { id: 'mobile-member-rebate-ratio-edit', platform: 'agent', routeName: 'mobile-member-rebate-ratio-edit', path: '/mobile/agent/member/rebate-ratio/edit', title: '设置会员退水', group: '收益比例', pagePath: ['代理端', '收益比例', '设置会员退水'] },
  { id: 'mobile-agent-settlement', platform: 'agent', routeName: 'mobile-agent-settlement', path: '/mobile/agent/settlement', title: '代理结算对账', group: '结算', pagePath: ['代理端', '结算', '代理结算对账'] },
  { id: 'mobile-agent-settlement-detail', platform: 'agent', routeName: 'mobile-agent-settlement-detail', path: '/mobile/agent/settlement/detail', title: '流水明细', group: '结算', pagePath: ['代理端', '结算', '流水明细'] },
  { id: 'mobile-xcoin-report', platform: 'agent', routeName: 'mobile-xcoin-report', path: '/mobile/agent/xcoin/report', title: 'X币报表', group: '报表', pagePath: ['代理端', '报表', 'X币报表'] },
  { id: 'mobile-xcoin-records', platform: 'agent', routeName: 'mobile-xcoin-records', path: '/mobile/agent/xcoin/records', title: '信用额度记录', group: '信用额度', pagePath: ['代理端', '信用额度', '信用额度记录'] },
  { id: 'mobile-xcoin-credit-member', platform: 'agent', routeName: 'mobile-xcoin-credit-member', path: '/mobile/agent/xcoin/credit/member', title: '给会员上分', group: '信用额度', pagePath: ['代理端', '信用额度', '给会员上分'] },
  { id: 'mobile-xcoin-credit-agent', platform: 'agent', routeName: 'mobile-xcoin-credit-agent', path: '/mobile/agent/xcoin/credit/agent', title: '给代理上分', group: '信用额度', pagePath: ['代理端', '信用额度', '给代理上分'] },
  { id: 'mobile-xcoin-select-member', platform: 'agent', routeName: 'mobile-xcoin-select-member', path: '/mobile/agent/xcoin/select/member', title: '选择信用会员', group: '信用额度', pagePath: ['代理端', '信用额度', '选择信用会员'] },
  { id: 'mobile-xcoin-select-agent', platform: 'agent', routeName: 'mobile-xcoin-select-agent', path: '/mobile/agent/xcoin/select/agent', title: '选择信用代理', group: '信用额度', pagePath: ['代理端', '信用额度', '选择信用代理'] },
]

function buildPcCatalog(): PageCatalogItem[] {
  const leaves = flattenPcMenuLeaves()
  const fromMenu: PageCatalogItem[] = leaves.map((item) => ({
    id: item.routeName,
    platform: 'pc' as WorkspacePlatform,
    routeName: item.routeName,
    path: item.path,
    title: item.title,
    group: item.pagePath?.[0] ?? 'PC 后台',
    pagePath: item.pagePath ?? ['PC 后台', item.title],
  }))
  const fromDocs: PageCatalogItem[] = pcDocRoutes.map((item) => ({
    id: item.routeName,
    platform: 'pc',
    routeName: item.routeName,
    path: item.path,
    title: item.title,
    group: '文档说明',
    pagePath: item.pagePath,
  }))
  return [...fromMenu, ...fromDocs]
}

export const PAGE_CATALOG: PageCatalogItem[] = [
  ...buildPcCatalog(),
  ...MOBILE_H5_CATALOG,
  ...AGENT_H5_CATALOG,
]

export function findCatalogItem(id: string): PageCatalogItem | undefined {
  return PAGE_CATALOG.find((item) => item.id === id)
}

export function filterCatalog(platform: WorkspacePlatform | 'all', keyword: string): PageCatalogItem[] {
  const kw = keyword.trim().toLowerCase()
  return PAGE_CATALOG.filter((item) => {
    if (platform !== 'all' && item.platform !== platform) return false
    if (!kw) return true
    const platformText = item.platform === 'pc' ? 'pc 后台' : item.platform === 'agent' ? '代理端' : '移动端'
    const pathText = withPath(item.path, item.query)
    const pagePathText = item.pagePath?.join(' ') ?? ''
    return (
      item.title.toLowerCase().includes(kw) ||
      item.group.toLowerCase().includes(kw) ||
      item.routeName.toLowerCase().includes(kw) ||
      pathText.toLowerCase().includes(kw) ||
      pagePathText.toLowerCase().includes(kw) ||
      platformText.toLowerCase().includes(kw)
    )
  })
}

export function formatCatalogPath(item: PageCatalogItem): string {
  return withPath(item.path, item.query)
}
