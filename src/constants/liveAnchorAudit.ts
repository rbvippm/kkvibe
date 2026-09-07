/** 直播管理 · 主播审核列表 · Mock */

import { ref } from 'vue'
import { ANCHOR_CHANNELS, formatGiftShare } from './liveAnchorMetric'

export type AnchorAuditStatus = 'pending' | 'approved' | 'rejected'

export type AnchorAuditRow = {
  id: number
  applicantName: string
  applicantId: string
  appliedAt: string
  realName: string
  idNumber: string
  auditStatus: AnchorAuditStatus
  auditorName: string
  auditorId: string
  auditedAt: string
  rejectReason: string
  auditRemark: string
  /** 审核通过时选定的授权渠道 */
  channelIds: string[]
  /** 审核通过时设定的礼物分成比例，未设置或已拒绝为 null */
  giftSharePercent: number | null
}

export const ANCHOR_AUDIT_STATUS_OPTIONS = [
  { value: '' as const, label: '请选择' },
  { value: 'pending' as const, label: '待审核' },
  { value: 'approved' as const, label: '审核通过' },
  { value: 'rejected' as const, label: '审核拒绝' },
]

export const ANCHOR_AUDIT_RESULT_OPTIONS = [
  { value: 'approved' as const, label: '审核通过' },
  { value: 'rejected' as const, label: '审核拒绝' },
]

/** 原型当前登录审核员 */
export const CURRENT_ANCHOR_AUDITOR = {
  id: '88',
  name: '运营审核员',
} as const

export function anchorAuditStatusLabel(status: AnchorAuditStatus) {
  const map: Record<AnchorAuditStatus, string> = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝',
  }
  return map[status]
}

export function formatAuditDash(value: string) {
  return value.trim() ? value : '-'
}

export function formatAuditChannel(channelIds: string[]) {
  return String(channelIds.length)
}

export function formatAuditGiftShare(percent: number | null | undefined) {
  if (percent === null || percent === undefined || !Number.isFinite(percent)) return '-'
  return formatGiftShare(percent)
}

export { ANCHOR_CHANNELS }

export const liveAnchorAuditStore = ref<AnchorAuditRow[]>([
  {
    id: 1,
    applicantName: '我们',
    applicantId: '1352896854710287059',
    appliedAt: '2026-07-28 01:21:45',
    realName: '林晓舟',
    idNumber: '110101199203158816',
    auditStatus: 'approved',
    auditorName: '测试',
    auditorId: '66',
    auditedAt: '2026-07-28 02:05:12',
    rejectReason: '',
    auditRemark: 'ok',
    channelIds: ['self', 'kk'],
    giftSharePercent: 10,
  },
  {
    id: 2,
    applicantName: 'joker787',
    applicantId: '1352896854710287060',
    appliedAt: '2026-07-27 18:40:09',
    realName: '周启明',
    idNumber: '310104199511022315',
    auditStatus: 'approved',
    auditorName: '~Ezreal',
    auditorId: '78',
    auditedAt: '2026-07-27 19:12:33',
    rejectReason: '',
    auditRemark: 'ok',
    channelIds: ['kk'],
    giftSharePercent: 1.23,
  },
  {
    id: 3,
    applicantName: 'kaio1012',
    applicantId: '2822656153752982497',
    appliedAt: '2026-05-19 17:27:04',
    realName: 'exec',
    idNumber: '481815155',
    auditStatus: 'pending',
    auditorName: '',
    auditorId: '',
    auditedAt: '',
    rejectReason: '',
    auditRemark: '',
    channelIds: [],
    giftSharePercent: null,
  },
  {
    id: 4,
    applicantName: '小夜不困',
    applicantId: '3180664521199420701',
    appliedAt: '2026-08-12 21:08:16',
    realName: '陈思晚',
    idNumber: '440106199804067228',
    auditStatus: 'pending',
    auditorName: '',
    auditorId: '',
    auditedAt: '',
    rejectReason: '',
    auditRemark: '',
    channelIds: [],
    giftSharePercent: null,
  },
  {
    id: 5,
    applicantName: '星河主播',
    applicantId: '3180664521199420702',
    appliedAt: '2026-08-10 14:22:50',
    realName: '赵星河',
    idNumber: '330102199612114019',
    auditStatus: 'approved',
    auditorName: '测试',
    auditorId: '66',
    auditedAt: '2026-08-10 15:01:08',
    rejectReason: '',
    auditRemark: '',
    channelIds: ['goodworld', 'sea'],
    giftSharePercent: 15,
  },
  {
    id: 6,
    applicantName: '夜雨听风',
    applicantId: '3180664521199420703',
    appliedAt: '2026-08-08 11:05:33',
    realName: '吴听风',
    idNumber: '510104199307219016',
    auditStatus: 'rejected',
    auditorName: '运营审核员',
    auditorId: '88',
    auditedAt: '2026-08-08 11:40:19',
    rejectReason: '身份信息与证件不一致',
    auditRemark: '请补充清晰证件照后重提',
    channelIds: [],
    giftSharePercent: null,
  },
  {
    id: 7,
    applicantName: '清酒微醺',
    applicantId: '3180664521199420704',
    appliedAt: '2026-08-03 20:16:44',
    realName: '苏清酒',
    idNumber: '320102199809156617',
    auditStatus: 'approved',
    auditorName: '~Ezreal',
    auditorId: '78',
    auditedAt: '2026-08-03 21:02:27',
    rejectReason: '',
    auditRemark: 'ok',
    channelIds: ['sea'],
    giftSharePercent: 8,
  },
  {
    id: 8,
    applicantName: '晚风陪聊',
    applicantId: '3180664521199420705',
    appliedAt: '2026-07-30 09:48:02',
    realName: '何晚风',
    idNumber: '420106199501083312',
    auditStatus: 'rejected',
    auditorName: '测试',
    auditorId: '66',
    auditedAt: '2026-07-30 10:15:41',
    rejectReason: '资料不完整，缺少正面证件',
    auditRemark: '',
    channelIds: [],
    giftSharePercent: null,
  },
])
