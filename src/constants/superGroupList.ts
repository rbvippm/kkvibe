/** 超级群管理列表。赌厅产品的「超级群ID」下拉只读这份数据。 */

export type SuperGroupListItem = {
  groupId: string
  name: string
}

export const SUPER_GROUP_LIST: SuperGroupListItem[] = [
  { groupId: '2662058052844112809', name: 'You' },
  { groupId: '2825734960101539870', name: "I'll" },
  { groupId: '2823314448703320074', name: 'H5测试' },
  { groupId: '3485197927430602751', name: '889' },
  { groupId: '3198821044556677889', name: '直播粉丝群' },
  { groupId: '3198821044556677890', name: '活动通知群' },
]

export function superGroupById(groupId: string) {
  return SUPER_GROUP_LIST.find((item) => item.groupId === groupId)
}

/** 下拉展示「超级群名称（超级群ID）」，便于按名称或 ID 过滤 */
export const SUPER_GROUP_SELECT_OPTIONS = SUPER_GROUP_LIST.map((item) => ({
  value: item.groupId,
  label: `${item.name}（${item.groupId}）`,
}))
