/** 定向邀请会员成为下级代理 · Mock */

import { ref } from 'vue'
import { addTeamDirectMember } from './agentTeam'

export type AgentInviteStatus = 'pending' | 'accepted' | 'rejected' | 'invalid' | 'expired'

export type AgentInviteValidationResult =
  | {
      ok: true
      member: {
        id: string
        account: string
        nickname: string
        avatar: string
      }
    }
  | {
      ok: false
      message: string
    }

export type AgentSentInviteRecord = {
  id: string
  memberAccount: string
  memberNickname?: string
  memberId?: string
  invitedAt: string
  status: AgentInviteStatus
}

export type MemberAgentInvite = {
  id: string
  agentName: string
  /** 代理金刚号（账号 ID，mid_ 前缀） */
  agentAccountId: string
  agentAvatar: string
  invitedAt: string
  remainHours: number
  status: AgentInviteStatus
  memberAccount?: string
  memberNickname?: string
  memberId?: string
}

export const MOCK_AGENT_SENT_INVITES: AgentSentInviteRecord[] = [
  {
    id: 'sent-1',
    memberAccount: 'ming88888',
    memberNickname: '明哥888',
    invitedAt: '2026-07-03 18:20',
    status: 'pending',
  },
  {
    id: 'sent-2',
    memberAccount: 'lin11121',
    memberNickname: '小林棋王',
    memberId: 'lin111',
    invitedAt: '2026-07-02 14:05',
    status: 'accepted',
  },
  {
    id: 'sent-3',
    memberAccount: 'ezhao009',
    memberNickname: 'ezhao009',
    invitedAt: '2026-07-01 10:12',
    status: 'expired',
  },
  {
    id: 'sent-4',
    memberAccount: 'wang9527',
    memberNickname: '棋王阿杰',
    invitedAt: '2026-06-30 09:30',
    status: 'invalid',
  },
]

export const MOCK_MEMBER_AGENT_INVITES: MemberAgentInvite[] = [
  {
    id: 'invite-1',
    agentName: '星钻合伙人',
    agentAccountId: 'mid_star_partner',
    agentAvatar: '星',
    invitedAt: '2026-07-03 18:20',
    remainHours: 71,
    status: 'pending',
  },
  {
    id: 'invite-2',
    agentName: '皇家会所运营',
    agentAccountId: 'mid_royal_ops',
    agentAvatar: '皇',
    invitedAt: '2026-07-03 16:45',
    remainHours: 69,
    status: 'pending',
  },
  {
    id: 'invite-3',
    agentName: '红黑电竞馆',
    agentAccountId: 'mid_redblack',
    agentAvatar: '竞',
    invitedAt: '2026-07-01 20:00',
    remainHours: 0,
    status: 'expired',
  },
]

export const CURRENT_AGENT_INVITE_PROFILE = {
  agentName: 'gg12345678',
  agentAccountId: 'mid_gg12345678',
  agentAvatar: 'G',
} as const

/** 代理端已发送邀请 · 原型共享状态 */
export const agentSentInvites = ref<AgentSentInviteRecord[]>([...MOCK_AGENT_SENT_INVITES])

/** 会员端收到的代理邀请 · 原型共享状态 */
export const memberAgentInvites = ref<MemberAgentInvite[]>(
  MOCK_MEMBER_AGENT_INVITES.map((item) => ({ ...item })),
)

/** 会员是否已加入代理团队 · 「我的」菜单入口切换依据 */
export const memberAgentMembershipJoined = ref(
  memberAgentInvites.value.some((item) => item.status === 'accepted'),
)

function formatInviteTime() {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function createAgentMemberInvite(member: {
  id: string
  account: string
  nickname: string
  avatar: string
}) {
  const inviteId = `sent-${Date.now()}`
  const invitedAt = formatInviteTime()

  agentSentInvites.value.unshift({
    id: inviteId,
    memberAccount: member.account,
    memberNickname: member.nickname,
    memberId: member.id,
    invitedAt,
    status: 'pending',
  })

  memberAgentInvites.value.unshift({
    id: inviteId,
    agentName: CURRENT_AGENT_INVITE_PROFILE.agentName,
    agentAccountId: CURRENT_AGENT_INVITE_PROFILE.agentAccountId,
    agentAvatar: CURRENT_AGENT_INVITE_PROFILE.agentAvatar,
    invitedAt,
    remainHours: 72,
    status: 'pending',
    memberAccount: member.account,
    memberNickname: member.nickname,
    memberId: member.id,
  })
}

/** @deprecated 请使用 createAgentMemberInvite */
export function appendAgentSentInvite(jingangNo: string) {
  const normalized = jingangNo.trim().toLowerCase()
  createAgentMemberInvite({
    id: normalized,
    account: jingangNo,
    nickname: resolveInviteMemberNickname(normalized, jingangNo),
    avatar: jingangNo.slice(0, 1).toUpperCase(),
  })
}

export function acceptMemberAgentInvite(inviteId: string) {
  const invite = memberAgentInvites.value.find((item) => item.id === inviteId)
  if (!invite || invite.status !== 'pending') return false

  memberAgentInvites.value = memberAgentInvites.value.map((item) => {
    if (item.id === inviteId) return { ...item, status: 'accepted' as const }
    if (item.status === 'pending') return { ...item, status: 'invalid' as const }
    return item
  })

  const sent = agentSentInvites.value.find((item) => item.id === inviteId)
  if (sent) {
    sent.status = 'accepted'
  }

  const memberId = invite.memberId ?? `m-${inviteId}`
  const nickname = invite.memberNickname ?? invite.memberAccount ?? '新邀请会员'

  addTeamDirectMember({
    id: memberId,
    nickname,
    kind: 'member',
    subordinateCount: 0,
    avatarEmoji: invite.memberNickname?.slice(0, 1) ?? invite.agentAvatar,
  })

  memberAgentMembershipJoined.value = true

  return true
}

function syncAcceptedInvitesToTeam() {
  agentSentInvites.value.forEach((sent) => {
    if (sent.status !== 'accepted') return
    addTeamDirectMember({
      id: sent.memberId ?? sent.id,
      nickname: sent.memberNickname ?? sent.memberAccount,
      kind: 'member',
      subordinateCount: 0,
    })
  })
}

syncAcceptedInvitesToTeam()

/** 占成代理 · 邀请三步 */
export const AGENT_INVITE_MEMBER_STEPS = [
  { key: 'invite', label: '邀请会员' },
  { key: 'ratio', label: '收益比例' },
  { key: 'success', label: '邀请成功' },
] as const

/** 返佣代理 · 邀请两步（无收益比例） */
export const AGENT_INVITE_MEMBER_REBATE_STEPS = [
  { key: 'invite', label: '邀请会员' },
  { key: 'success', label: '邀请成功' },
] as const

export const AGENT_INVITE_STATUS_LABEL: Record<AgentInviteStatus, string> = {
  pending: '待确认',
  accepted: '已同意',
  rejected: '已拒绝',
  invalid: '已失效',
  expired: '已过期',
}

export function agentInviteStatusClass(status: AgentInviteStatus) {
  return `agent-invite-status--${status}`
}

/** 验证通过时按金刚号映射 Mock 昵称 */
const MOCK_INVITE_MEMBER_NICKNAMES: Record<string, string> = {
  ming88888: '明哥888',
  lin11121: '小林棋王',
  ezhao009: 'ezhao009',
  wang9527: '棋王阿杰',
}

function resolveInviteMemberNickname(normalized: string, account: string) {
  return MOCK_INVITE_MEMBER_NICKNAMES[normalized] ?? `会员_${account.slice(-4)}`
}

export function inviteRecordDisplayNickname(
  record: Pick<AgentSentInviteRecord, 'memberAccount' | 'memberNickname'>,
) {
  if (record.memberNickname) return record.memberNickname
  const account = record.memberAccount
  return resolveInviteMemberNickname(account.trim().toLowerCase(), account)
}

export function validateInviteMember(account: string): AgentInviteValidationResult {
  const normalized = account.trim().toLowerCase()

  if (!normalized) {
    return { ok: false, message: '请输入对方金刚号' }
  }

  if (normalized === 'agent888' || normalized.includes('agent')) {
    return { ok: false, message: '该账号已是代理' }
  }

  if (normalized === 'lin111' || normalized.includes('bound')) {
    return { ok: false, message: '该账号已有上级' }
  }

  if (normalized.includes('full')) {
    return { ok: false, message: '该会员邀请箱已满' }
  }

  if (normalized.includes('channel')) {
    return { ok: false, message: '渠道不一致，请联系客服处理' }
  }

  if (normalized.length < 4) {
    return { ok: false, message: '金刚号不存在' }
  }

  return {
    ok: true,
    member: {
      id: normalized,
      account,
      nickname: resolveInviteMemberNickname(normalized, account),
      avatar: account.slice(0, 1).toUpperCase(),
    },
  }
}
