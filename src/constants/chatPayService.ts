import { reactive } from 'vue'
import type { ChatConversation } from './mobileChat'
import type { ChatRoomDemo, ChatRoomMessage } from './mobileChatRoom'

export const PAY_SERVICE_ROOM_ID = 'pay-service-group'
export const PAY_SERVICE_TITLE = '充提专属服务群'
export const PAY_SERVICE_AVATAR = '/images/chat/avatar-pay-service.svg'
const PAY_STAFF_AVATAR = '/images/chat/avatar-pay-staff.svg'

export type PayServiceStaff = {
  name: string
  kingkongId: string
  avatar: string
}

/** 充提专员：两个金刚号由后台配置，新用户注册时自动拉入专属服务群（原型写死） */
export const PAY_SERVICE_STAFF: PayServiceStaff[] = [
  { name: '充提专员·小金', kingkongId: 'kf88880001', avatar: PAY_STAFF_AVATAR },
  { name: '充提专员·阿乐', kingkongId: 'kf88880002', avatar: PAY_STAFF_AVATAR },
]

const [STAFF_A, STAFF_B] = PAY_SERVICE_STAFF as [PayServiceStaff, PayServiceStaff]

export const PAY_SERVICE_WELCOME = '您好，欢迎来到金刚！'

function staffMessage(id: string, staff: PayServiceStaff, text: string, time: string): ChatRoomMessage {
  return {
    id,
    direction: 'received',
    senderName: staff.name,
    senderTag: '官方',
    avatar: staff.avatar,
    time,
    layout: '1-square',
    media: [],
    text,
  }
}

function noticeMessage(id: string, notice: string): ChatRoomMessage {
  return { id, direction: 'received', time: '', layout: '1-square', media: [], notice }
}

export const PAY_SERVICE_ROOM: ChatRoomDemo = {
  id: PAY_SERVICE_ROOM_ID,
  kind: 'group',
  title: PAY_SERVICE_TITLE,
  avatar: PAY_SERVICE_AVATAR,
  official: true,
  dateHint: '今天 10:20',
  messages: [
    noticeMessage('pay-n1', '系统已为你开通充提专属服务群，充值、提现问题可在群内直接反馈'),
    noticeMessage('pay-n2', `${STAFF_A.name}、${STAFF_B.name} 已加入群组`),
    staffMessage(
      'pay-m1',
      STAFF_A,
      `${PAY_SERVICE_WELCOME}我是你的充提专属客服小金。充值未到账、提现进度、收款方式等资金问题，直接在群里发给我们就行，7×24 小时在线。`,
      '10:20',
    ),
    staffMessage(
      'pay-m2',
      STAFF_B,
      '温馨提示：官方客服只在本群和你沟通，不会私聊索要密码、验证码，也不会让你转账到个人账户。请认准「官方」标识。',
      '10:20',
    ),
  ],
}

export type PayServiceQuickQuestion = {
  question: string
  staff: PayServiceStaff
  answer: string
}

/** 群内快捷问题：点击即以我的身份发出，专员自动回复（原型 Mock） */
export const PAY_SERVICE_QUICK_QUESTIONS: PayServiceQuickQuestion[] = [
  {
    question: '充值未到账',
    staff: STAFF_A,
    answer: '收到～请把充值金额、付款截图和充值订单号发在群里，我核实后 5 分钟内给你处理。',
  },
  {
    question: '提现多久到账',
    staff: STAFF_B,
    answer: '提现审核通过后一般 10～30 分钟到账，高峰期可能稍有延迟，可在「我的 - 账单记录」查看进度。',
  },
  {
    question: '怎么充值',
    staff: STAFF_A,
    answer: '在「我的 - 钱包」点「充值」，支持链上充值和三方渠道买币。第一次充值有不清楚的地方，随时在群里问我。',
  },
  {
    question: '修改收款方式',
    staff: STAFF_B,
    answer: '在「我的 - 收款方式」可以新增或修改，修改后请核对姓名和账号是否一致，避免提现失败。',
  },
]

export const PAY_SERVICE_DEFAULT_REPLY = {
  staff: STAFF_A,
  answer: '收到，正在为你核实，请稍候～如果是充值未到账，请补充付款截图和充值订单号。',
}

export const PAY_SERVICE_CONVERSATION: ChatConversation = {
  id: 'c-pay-service',
  roomId: PAY_SERVICE_ROOM_ID,
  title: PAY_SERVICE_TITLE,
  previewLine: { fromSelf: false, text: `${STAFF_B.name}：温馨提示：官方客服只在本群和你沟通…` },
  time: '10:20',
  unread: 2,
  highlighted: true,
  pinned: true,
  official: true,
  avatar: PAY_SERVICE_AVATAR,
  filter: 'group',
}

/**
 * 会话页隐藏 Mock：消息页顶部 5 秒内连点 3 次，在「演示会话」与「新用户首次注册」之间切换。
 * 新用户只看到充提专属服务群，并弹出一次首次提示。
 */
export const chatNewUserMock = reactive({
  enabled: false,
  guideSeen: false,
  conversation: { ...PAY_SERVICE_CONVERSATION, previewLine: { ...PAY_SERVICE_CONVERSATION.previewLine } },
})

export function toggleChatNewUserMock() {
  chatNewUserMock.enabled = !chatNewUserMock.enabled
  chatNewUserMock.guideSeen = false
  chatNewUserMock.conversation = {
    ...PAY_SERVICE_CONVERSATION,
    previewLine: { ...PAY_SERVICE_CONVERSATION.previewLine },
  }
  return chatNewUserMock.enabled
}

export function markPayServiceRead() {
  chatNewUserMock.conversation.unread = 0
  chatNewUserMock.conversation.highlighted = false
  chatNewUserMock.guideSeen = true
}

export function syncPayServicePreview(text: string, fromSelf: boolean, time: string) {
  chatNewUserMock.conversation.previewLine = fromSelf
    ? { fromSelf: true, delivery: 'sent', text }
    : { fromSelf: false, text }
  chatNewUserMock.conversation.time = time
}
