export type MineSettingsTrailing =
  | { type: 'phone'; value: string }
  | { type: 'wallet-unset' }
  | { type: 'none' }

export type MineSettingsItem = {
  key: string
  title: string
  trailing?: MineSettingsTrailing
}

export type MineSettingsGroup = {
  key: string
  items: MineSettingsItem[]
}

/** 个人中心 · 设置 */
export const MINE_SETTINGS_GROUPS: MineSettingsGroup[] = [
  {
    key: 'account',
    items: [
      {
        key: 'account-security',
        title: '账号与安全',
        trailing: { type: 'phone', value: '+60 172288435' },
      },
      {
        key: 'wallet-password',
        title: '钱包安全密码',
        trailing: { type: 'wallet-unset' },
      },
    ],
  },
  {
    key: 'general',
    items: [
      { key: 'language', title: '语言设置' },
      { key: 'chat', title: '聊天设置' },
      { key: 'privacy', title: '隐私设置' },
      { key: 'notification', title: '通知' },
      { key: 'storage', title: '数据与储存' },
      { key: 'devices', title: '设备' },
    ],
  },
  {
    key: 'help',
    items: [{ key: 'help-feedback', title: '帮助与反馈' }],
  },
]
