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
  children?: PcMenuItem[]
}

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
    key: 'live',
    title: '直播管理',
    icon: '📺',
    children: [
      {
        key: 'live-commission',
        title: '直播佣金配置',
        path: '/pc/live-commission',
        routeName: 'pc-live-commission',
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

export function findPcMenuByRouteName(routeName: string): PcMenuLeaf | undefined {
  return flattenPcMenuLeaves().find((item) => item.routeName === routeName)
}

/** 页面顶栏路径条（来自 menu.pagePath） */
export function getPcPagePath(routeName: string): string[] | undefined {
  return findPcMenuByRouteName(routeName)?.pagePath
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
