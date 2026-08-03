/** 推广返利 · 返佣代理 H5 配置 · Mock */

export type RebateAgentH5OnlineStatus = 'online' | 'offline'

export type RebateAgentH5ConfigRow = {
  id: string
  /** 版本号（不含 V 前缀） */
  version: string
  /** 兼容 APP 最小版本号；空则列表展示「-」 */
  minAppVersion: string
  /** 更新描述；空则列表展示「-」 */
  updateDesc: string
  status: RebateAgentH5OnlineStatus
  /** 已上传安装包文件名（原型 Mock） */
  packageFileName: string
  updatedAt: string
  createdAt: string
}

export function displayVersionOrDash(value: string) {
  const text = value.trim()
  return text || '-'
}

export function statusLabel(status: RebateAgentH5OnlineStatus) {
  return status === 'online' ? '上线' : '下线'
}

export function formatRebateH5Now() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function cloneRebateH5Row(row: RebateAgentH5ConfigRow): RebateAgentH5ConfigRow {
  return { ...row }
}

/** 列表 Mock：对齐截图口径（多为下线，兼容版本/描述为空） */
export const MOCK_REBATE_AGENT_H5_ROWS: RebateAgentH5ConfigRow[] = [
  {
    id: 'rah5-1',
    version: '2.8.0',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.8.0.zip',
    updatedAt: '2025-12-17 18:58:51',
    createdAt: '2025-12-17 18:58:51',
  },
  {
    id: 'rah5-2',
    version: '2.8',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.8.zip',
    updatedAt: '2025-12-17 18:58:36',
    createdAt: '2025-12-17 18:58:36',
  },
  {
    id: 'rah5-3',
    version: '280',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-280.zip',
    updatedAt: '2025-12-17 18:58:23',
    createdAt: '2025-12-17 18:58:23',
  },
  {
    id: 'rah5-4',
    version: '2.8.0',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.8.0-b.zip',
    updatedAt: '2025-12-17 18:58:01',
    createdAt: '2025-12-17 18:58:01',
  },
  {
    id: 'rah5-5',
    version: '2.8.0',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.8.0-c.zip',
    updatedAt: '2025-12-17 18:57:47',
    createdAt: '2025-12-17 18:57:47',
  },
  {
    id: 'rah5-6',
    version: '2.8.0',
    minAppVersion: '0.0.0',
    updateDesc: '返佣代理 H5 热更新包',
    status: 'online',
    packageFileName: 'rebate-agent-h5-online.zip',
    updatedAt: '2025-12-10 14:20:08',
    createdAt: '2025-12-10 14:20:08',
  },
  {
    id: 'rah5-7',
    version: '2.7.1',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.7.1.zip',
    updatedAt: '2025-11-28 11:03:22',
    createdAt: '2025-11-28 11:03:22',
  },
  {
    id: 'rah5-8',
    version: '2.7.0',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.7.0.zip',
    updatedAt: '2025-11-20 09:15:40',
    createdAt: '2025-11-20 09:15:40',
  },
  {
    id: 'rah5-9',
    version: '2.6.0',
    minAppVersion: '',
    updateDesc: '',
    status: 'offline',
    packageFileName: 'rebate-agent-h5-2.6.0.zip',
    updatedAt: '2025-11-01 16:40:11',
    createdAt: '2025-11-01 16:40:11',
  },
]
