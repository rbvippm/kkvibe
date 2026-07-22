/** PC 后台侧栏菜单与面包屑配置 */

export type PcMenuItem = {
  key: string
  title: string
  path?: string
  routeName?: string
  icon?: string
  /** 标签页固定，不可关闭 */
  affix?: boolean
  /** 页面顶栏「路径：A-B-C」各层级（仅 v2 等业务页配置） */
  pagePath?: string[]
  /** 关联「文档说明」页路由名（路径条展示【文档说明】入口） */
  docRouteName?: string
  children?: PcMenuItem[]
}

export type PcDocRoute = {
  path: string
  routeName: string
  title: string
  pagePath: string[]
}

/** 不在侧栏展示、仅由路径条【文档说明】进入的页面 */
export const pcDocRoutes: PcDocRoute[] = [
  {
    path: '/pc/share-agent-config/doc',
    routeName: 'pc-share-agent-config-doc',
    title: '文档说明',
    pagePath: ['推广返利', '占成代理配置', '文档说明'],
  },
  {
    path: '/pc/credit-limit-transfer/doc',
    routeName: 'pc-credit-limit-transfer-doc',
    title: '文档说明',
    pagePath: ['推广返利', '信用额度记录', '文档说明'],
  },
  {
    path: '/pc/live-danmaku-mute-list/doc',
    routeName: 'pc-live-danmaku-mute-list-doc',
    title: '文档说明',
    pagePath: ['管理后台', '直播管理', '禁言列表', '文档说明'],
  },
  {
    path: '/pc/live-broadcast/doc',
    routeName: 'pc-live-broadcast-doc',
    title: '文档说明',
    pagePath: ['管理后台', '直播管理', '直播中控台', '文档说明'],
  },
  {
    path: '/pc/user-list/doc',
    routeName: 'pc-user-list-doc',
    title: '文档说明',
    pagePath: ['用户管理', '用户列表', '文档说明'],
  },
  {
    path: '/pc/user-list/detail/doc',
    routeName: 'pc-user-detail-doc',
    title: '文档说明',
    pagePath: ['用户管理', '用户列表', '用户详情', '文档说明'],
  },
  {
    path: '/pc/activity-center/doc',
    routeName: 'pc-activity-center-doc',
    title: '文档说明',
    pagePath: ['运营管理', '活动中心', '文档说明'],
  },
  {
    path: '/pc/invite-rebate-inviters/doc',
    routeName: 'pc-invite-rebate-inviters-doc',
    title: '文档说明',
    pagePath: ['运营管理', '邀请列表', '文档说明'],
  },
  {
    path: '/pc/invite-rebate-invitees/doc',
    routeName: 'pc-invite-rebate-invitees-doc',
    title: '文档说明',
    pagePath: ['运营管理', '邀请列表', '被邀请人详情', '文档说明'],
  },
  {
    path: '/pc/invite-rebate-stats/doc',
    routeName: 'pc-invite-rebate-stats-doc',
    title: '文档说明',
    pagePath: ['运营管理', '活动统计', '文档说明'],
  },
  {
    path: '/pc/invite-rebate-records/doc',
    routeName: 'pc-invite-rebate-records-doc',
    title: '文档说明',
    pagePath: ['运营管理', '活动统计', '活动明细', '文档说明'],
  },
]

/** v2.x.x 账变细化和流水调整 · 子菜单（单一数据源） */
export const pcMenuV2Children: PcMenuItem[] = [
  {
    key: 'version-record-v2-intro',
    title: '需求简介',
    path: '/pc/version-record/v2-account-turnover/intro',
    routeName: 'pc-version-record-v2-intro',
  },
  {
    key: 'user-manage',
    title: '用户详情',
    path: '/pc/user-manage',
    routeName: 'pc-user-manage',
    icon: '👤',
    pagePath: ['用户管理', '用户列表', '用户资产详情'],
  },
  {
    key: 'account-change-manage',
    title: '账变管理',
    path: '/pc/account-change-manage',
    routeName: 'pc-account-change-manage',
    icon: '💳',
    pagePath: ['账变管理', '账变管理'],
  },
  {
    key: 'account-change-record',
    title: '账变记录',
    path: '/pc/account-change-record',
    routeName: 'pc-account-change-record',
    pagePath: ['账变管理', '账变记录'],
  },
  {
    key: 'account-change-audit',
    title: '账变审核',
    path: '/pc/account-change-audit',
    routeName: 'pc-account-change-audit',
    icon: '🧾',
    pagePath: ['风控审核', '账变审核'],
  },
  {
    key: 'turnover-audit',
    title: '账变审核',
    path: '/pc/turnover-audit',
    routeName: 'pc-turnover-audit',
    icon: '🧾',
    pagePath: ['财务管理', '账变审核'],
  },
  {
    key: 'withdraw-turnover-record',
    title: '提现流水变更记录',
    path: '/pc/withdraw-turnover-record',
    routeName: 'pc-withdraw-turnover-record',
    icon: '💰',
    pagePath: ['财务管理', '提现流水变更记录'],
  },
  {
    key: 'reconciliation-related',
    title: '对账相关',
    path: '/pc/reconciliation-related',
    routeName: 'pc-reconciliation-related',
    icon: '📊',
    pagePath: ['后台', '对账', '对账相关'],
  },
]

export const pcMenuTree: PcMenuItem[] = [
  {
    key: 'home',
    title: '首页',
    path: '/pc',
    routeName: 'pc',
    icon: '🏠',
    affix: true,
  },
  {
    key: 'version-record-v2',
    title: 'v2.x.x 账变细化和流水调整',
    icon: '📋',
    children: pcMenuV2Children,
  },
  {
    key: 'user',
    title: '用户管理',
    icon: '👤',
    children: [
      {
        key: 'user-list',
        title: '用户列表',
        path: '/pc/user-list',
        routeName: 'pc-user-list',
        pagePath: ['用户管理', '用户列表'],
        docRouteName: 'pc-user-list-doc',
      },
    ],
  },
  {
    key: 'ops',
    title: '运营管理',
    icon: '🎯',
    children: [
      {
        key: 'activity-center',
        title: '活动中心',
        path: '/pc/activity-center',
        routeName: 'pc-activity-center',
        pagePath: ['运营管理', '活动中心'],
        docRouteName: 'pc-activity-center-doc',
      },
      {
        key: 'invite-rebate-inviters',
        title: '邀请列表',
        path: '/pc/invite-rebate-inviters',
        routeName: 'pc-invite-rebate-inviters',
        pagePath: ['运营管理', '邀请列表'],
        docRouteName: 'pc-invite-rebate-inviters-doc',
      },
    ],
  },
  {
    key: 'live',
    title: '直播管理',
    icon: '📺',
    children: [
      {
        key: 'live-broadcast',
        title: '直播中控台',
        path: '/pc/live-broadcast',
        routeName: 'pc-live-broadcast',
        pagePath: ['管理后台', '直播管理', '直播中控台'],
        docRouteName: 'pc-live-broadcast-doc',
      },
      {
        key: 'live-danmaku-mute-list',
        title: '禁言列表',
        path: '/pc/live-danmaku-mute-list',
        routeName: 'pc-live-danmaku-mute-list',
        pagePath: ['管理后台', '直播管理', '禁言列表'],
        docRouteName: 'pc-live-danmaku-mute-list-doc',
      },
      {
        key: 'live-commission',
        title: '直播佣金配置',
        path: '/pc/live-commission',
        routeName: 'pc-live-commission',
      },
      {
        key: 'live-super-group-manage',
        title: '超级群管理',
        path: '/pc/live-super-group-manage',
        routeName: 'pc-live-super-group-manage',
        pagePath: ['群组管理', '超级群列表'],
      },
    ],
  },
  {
    key: 'product-research',
    title: '产品调研',
    icon: '📑',
    children: [
      {
        key: 'av-interaction-modes',
        title: '音视频三种模式',
        path: '/pc/av-interaction-modes',
        routeName: 'pc-av-interaction-modes',
        pagePath: ['产品调研', '音视频三种模式'],
      },
    ],
  },
  {
    key: 'config',
    title: '配置管理',
    icon: '⚙️',
    children: [
      {
        key: 'sticker-pack-manage',
        title: '贴图包管理',
        path: '/pc/sticker-pack-manage',
        routeName: 'pc-sticker-pack-manage',
        pagePath: ['管理后台', '配置管理', '贴图包管理'],
      },
      {
        key: 'sticker-tag-manage',
        title: '贴图标签管理',
        path: '/pc/sticker-tag-manage',
        routeName: 'pc-sticker-tag-manage',
        pagePath: ['管理后台', '配置管理', '贴图标签管理'],
      },
    ],
  },
  {
    key: 'promotion-rebate',
    title: '推广返利',
    icon: '💰',
    children: [
      {
        key: 'share-agent-config',
        title: '占成代理配置',
        path: '/pc/share-agent-config',
        routeName: 'pc-share-agent-config',
        pagePath: ['推广返利', '占成代理配置'],
        docRouteName: 'pc-share-agent-config-doc',
      },
      {
        key: 'credit-limit-transfer',
        title: '信用额度记录',
        path: '/pc/credit-limit-transfer',
        routeName: 'pc-credit-limit-transfer',
        pagePath: ['推广返利', '信用额度记录'],
        docRouteName: 'pc-credit-limit-transfer-doc',
      },
    ],
  },
  {
    key: 'voice',
    title: '语聊管理',
    icon: '🎙',
    children: [
      {
        key: 'reward',
        title: '语聊打赏后台',
        path: '/pc/reward',
        routeName: 'pc-reward',
      },
      {
        key: 'mic-threshold',
        title: '语音房上麦门槛',
        path: '/pc/mic-threshold',
        routeName: 'pc-mic-threshold',
      },
      {
        key: 'voice-role-permissions',
        title: '角色权限与麦控',
        path: '/pc/voice-role-permissions',
        routeName: 'pc-voice-role-permissions',
        pagePath: ['管理后台', '语聊管理', '角色权限与麦控'],
      },
    ],
  },
]

export type PcMenuLeaf = PcMenuItem & { path: string; routeName: string }

/** 扁平化所有可路由菜单项 */
export function flattenPcMenuLeaves(items: PcMenuItem[] = pcMenuTree): PcMenuLeaf[] {
  const leaves: PcMenuLeaf[] = []
  for (const item of items) {
    if (item.path && item.routeName) {
      leaves.push(item as PcMenuLeaf)
    }
    if (item.children?.length) {
      leaves.push(...flattenPcMenuLeaves(item.children))
    }
  }
  return leaves
}

export function findPcDocRoute(routeName: string): PcDocRoute | undefined {
  return pcDocRoutes.find((item) => item.routeName === routeName)
}

export function findPcMenuByRouteName(routeName: string): PcMenuLeaf | undefined {
  return flattenPcMenuLeaves().find((item) => item.routeName === routeName)
}

/** 当前业务页关联的文档说明路由名 */
export function getPcDocRouteName(routeName: string): string | undefined {
  return findPcMenuByRouteName(routeName)?.docRouteName
}

/** 页面顶栏路径条（来自 menu.pagePath 或 doc 配置） */
export function getPcPagePath(routeName: string): string[] | undefined {
  return findPcMenuByRouteName(routeName)?.pagePath ?? findPcDocRoute(routeName)?.pagePath
}

export type BreadcrumbItem = {
  title: string
  path?: string
}

/** 根据路由名生成面包屑路径 */
export function getPcBreadcrumb(routeName: string): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ title: '首页', path: '/pc' }]

  if (routeName === 'pc') return trail

  function walk(items: PcMenuItem[], ancestors: PcMenuItem[]): boolean {
    for (const item of items) {
      if (item.routeName === routeName) {
        for (const ancestor of ancestors) {
          if (ancestor.key !== 'home') {
            trail.push({ title: ancestor.title })
          }
        }
        trail.push({ title: item.title, path: item.path })
        return true
      }
      if (item.children?.length && walk(item.children, [...ancestors, item])) {
        return true
      }
    }
    return false
  }

  walk(pcMenuTree, [])
  return trail
}
