/** PC 后台侧栏菜单与面包屑配置 */

export type PcMenuItem = {
  key: string
  title: string
  path?: string
  routeName?: string
  icon?: string
  /** 标签页固定，不可关闭 */
  affix?: boolean
  children?: PcMenuItem[]
}

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
    key: 'account-change',
    title: '账变管理',
    icon: '💳',
    children: [
      {
        key: 'account-change-manage',
        title: '账变管理',
        path: '/pc/account-change-manage',
        routeName: 'pc-account-change-manage',
      },
      {
        key: 'account-change-record',
        title: '账变记录',
        path: '/pc/account-change-record',
        routeName: 'pc-account-change-record',
      },
      {
        key: 'account-change-audit',
        title: '账变审核',
        path: '/pc/account-change-audit',
        routeName: 'pc-account-change-audit',
        icon: '🧾',
      },
    ],
  },
  {
    key: 'risk-audit',
    title: '风控审核',
    icon: '🛡',
    children: [
      {
        key: 'turnover-audit',
        title: '账变审核',
        path: '/pc/turnover-audit',
        routeName: 'pc-turnover-audit',
        icon: '🧾',
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
