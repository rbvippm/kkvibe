import type { VersionWorkspace, WorkspaceTreeNode } from './types'

/** 版本默认树：修订记录 + 移动端 + BI后台 */
function createDefaultVersionTree(
  ids: { revision: string; mobile: string; bi: string },
  revisionDocContent: string,
): WorkspaceTreeNode[] {
  return [
    {
      id: ids.revision,
      type: 'doc',
      title: '修订记录',
      docContent: revisionDocContent,
    },
    {
      id: ids.mobile,
      type: 'folder',
      title: '移动端',
      children: [],
    },
    {
      id: ids.bi,
      type: 'folder',
      title: 'BI后台',
      children: [],
    },
    {
      id: 'node-recycle-bin',
      type: 'folder',
      title: '回收站',
      children: [],
    },
  ]
}

const REVISION_V214 = `| 版本号 | 修订内容描述 | 时间 | 创建人/更新人 |
|--------|--------------|------|---------------|
| v1.0 | 增加【直播半屏游戏】 | 2026-03-11 | EZ |
| v1.1 | 1、【BI后台】直播管理-分类配置增加：分类icon，背景色，颜色的配置；2、【开放平台】小程序管理增加：游戏icon；3、答复评审时的疑问，更新PRD | 2026-03-16 | EZ |
| v1.2 | 【用户端】直播观看页增加半屏游戏入口与加载占位 | 2026-03-20 | EZ |
| v1.3 | 【主播端】开播控制台支持半屏游戏开关与默认展示配置 | 2026-03-25 | EZ |
| v1.4 | 【BI后台】直播管理增加半屏游戏产品列表与分类关联初版 | 2026-03-28 | EZ |
| v1.5 | 【开放平台】小程序管理增加横竖半屏配置项与预览示意 | 2026-04-02 | EZ |
| v1.6 | 【用户端】半屏游戏与语聊房连麦场景交互调整 | 2026-04-08 | EZ |
| v1.7 | 评审反馈：统一半屏游戏 icon 规格与分类展示规则 | 2026-04-12 | EZ |
| v1.8 | 1、开放平台-小程序管理横竖半屏移动到小程序下面的产品配置里，老数据默认竖屏填充；2、BI后台-小程序管理去掉横竖半屏；3、BI后台-直播管理增加产品配置，复刻新首页大厅-产品配置，考虑新首页大厅又要调整，把业务独立开 | 2026-04-15 | EZ |`

const REVISION_V220 = `| 版本号 | 修订内容描述 | 时间 | 创建人/更新人 |
|--------|--------------|------|---------------|
| v1.0 | 新建版本：世界大战语聊房&商用测试 | 2026-07-01 | EZ |
| v1.1 | 补充版本管理工作台原型与页面库流程 | 2026-07-08 | EZ |`

/** 种子结构版本；调整默认树后递增，使旧本地草稿失效 */
export const WORKSPACE_DRAFT_SEED_VERSION = 3

export const VERSION_WORKSPACES: VersionWorkspace[] = [
  {
    id: 'v2-14-0-live-halfgame',
    versionLabel: 'v2.14.0',
    title: '直播优化/半屏游戏',
    updatedAt: '2026-07-08',
    tree: createDefaultVersionTree(
      { revision: 'node-revision', mobile: 'node-mobile', bi: 'node-bi' },
      REVISION_V214,
    ),
  },
  {
    id: 'v2-20-0-voice-room',
    versionLabel: 'v2.20.0',
    title: '世界大战语聊房&商用测试',
    updatedAt: '2026-07-08',
    tree: createDefaultVersionTree(
      { revision: 'v220-revision', mobile: 'v220-mobile', bi: 'v220-bi' },
      REVISION_V220,
    ),
  },
]

export function findVersionWorkspace(versionId: string): VersionWorkspace | undefined {
  return VERSION_WORKSPACES.find((v) => v.id === versionId)
}
