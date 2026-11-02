/** 用户管理 · 用户列表 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type UserListPrdDimension = PcPrdDimension
export type UserListFeatureRow = PcPrdFeatureRow

export const USER_LIST_META = {
  title: '用户列表',
  module: '用户管理',
  updatedAt: '2026-11-02',
  prdVersion: 'v1.3',
} as const

export const USER_LIST_BACKGROUND = [
  '运营需在后台统一检索与管理平台用户账号，覆盖状态启停、安全密码重置、安全封禁与删除等日常运维动作。',
  '列表需支持多维筛选（状态、性别、用户ID、邀请码、手机号、金刚号、openid、注册时间、来源、渠道、注册平台），并提供批量启停与导出能力。',
  '运营需按金刚 id、openid、现金 id、会员 id 等跨系统标识互查，便于客服与风控核对账号映射。',
] as const

export const USER_LIST_GOALS = [
  '提供用户列表，支持多条件筛选、分页浏览与批量启用/禁用。',
  '支持导出当前筛选结果（原型模拟导出提示）。',
  '点击「查询三方ID」打开查询弹框，按金刚 id / openid / 现金 id / 会员 id 等互查映射，无需勾选列表用户。',
  '行内管理提供禁用/启用、查看详情、重置密码、安全封禁、实名状态、重置安全密码、删除等操作入口。安全封禁入口对全部用户可点，含已删除。弹框不展示当前封禁快照，服务端 Redis 拿不到封禁状态、触发终端、封禁原因和封禁时间。只展示近20条封禁历程，有记录时列出最近 20 条，无记录时显示缺省文案。确认后解除当前封禁。',
] as const

/** 仅覆盖「安全封禁」弹框上的注1～注3，与页面标注一一对应 */
export const USER_LIST_SPEC_ANNOT_NO = {
  securityEntry: 1,
  securityRisk: 2,
  securityLift: 3,
} as const

export const USER_LIST_SECURITY_ENTRY_SPEC = [
  '原「解锁」和「解封登录锁定」合并为管理列一个入口「安全封禁」，弹框里只做一次解除。',
  '全部行可点，含已删除、当前无封禁记录。打开后不展示当前封禁快照，不跳转详情。',
  '点遮罩、关闭或取消只关弹框，不改封禁数据。',
] as const

export const USER_LIST_SECURITY_RISK_SPEC = [
  '近20条封禁历程固定表头，按时间从新到旧最多 20 条。',
  '列：序号、时间、终端、封禁原因。原因只有两种日志原文：登录过于频繁，触发限制阀值；请求滑块图形验证码频繁，触发限制阀值。',
  '没有记录时保留表头。解除后显示「暂无风险记录」；从未封禁显示「从未产生风险记录」。',
] as const

export const USER_LIST_SECURITY_LIFT_SPEC = [
  '弹框不展示封禁状态，服务端 Redis 拿不到当前是否封禁，「解除封禁」始终可点，不置灰。',
  '点击后清掉近20条封禁历程，账号锁定一并解开，弹框关闭。没有封禁记录时也按解除成功处理。',
  '成功用全局顶部提示：「已解除用户 {用户ID} 的安全封禁」。',
] as const

export const USER_LIST_ANNOT_MAP = {
  securityEntry: {
    no: USER_LIST_SPEC_ANNOT_NO.securityEntry,
    title: '安全封禁',
    items: USER_LIST_SECURITY_ENTRY_SPEC,
  },
  securityRisk: {
    no: USER_LIST_SPEC_ANNOT_NO.securityRisk,
    title: '近20条封禁历程',
    items: USER_LIST_SECURITY_RISK_SPEC,
  },
  securityLift: {
    no: USER_LIST_SPEC_ANNOT_NO.securityLift,
    title: '解除封禁',
    items: USER_LIST_SECURITY_LIFT_SPEC,
  },
} as const

export const USER_LIST_FEATURE_LIST: UserListFeatureRow[] = [
  {
    id: USER_LIST_SPEC_ANNOT_NO.securityEntry,
    module: '安全封禁',
    feature: '打开安全封禁',
    pageLocation: '安全封禁弹框标题',
    prd: {
      functionalLogic:
        '原「解锁」和「解封登录锁定」合并为管理列一个入口「安全封禁」。运营打开弹框查看近 20 条封禁历程，并只做一次解除。弹框不展示当前封禁快照，因为服务端 Redis 拿不到封禁状态、触发终端、封禁原因和封禁时间。',
      interactiveBehavior:
        '点击管理列文字链「安全封禁」打开弹框。已删除用户、当前无封禁记录的用户都可以打开。点击遮罩、标题栏关闭或底部「取消」只关闭弹框，不修改封禁数据，也不出现顶部提示。',
      visualPresentation:
        '弹框标题为「安全封禁」，右侧为关闭。标题旁为注1。弹框内只有近20条封禁历程，没有当前封禁信息。弹框宽 720px，整体最高为视口 70%，仅内容区滚动。列表入口为蓝色文字链，位于「重置密码」与实名状态之间，不出现禁用态。',
      dataRules:
        '弹框绑定当前行用户。原型按用户预置最多 20 条封禁历程；解除后历程清空。不在此弹框展示当前封禁状态、触发终端、封禁原因、封禁时间，也不展示用户ID、金刚号、区号、手机号、邮箱。',
      exceptions:
        '已删除用户仍可打开。接口失败时保持弹框不关闭，并在弹框内提示失败原因（原型未接接口）。列表筛选、翻页不自动关闭已打开的弹框。',
      routing: '停留在用户列表。不进入用户详情，不新开页。关闭后回到原列表滚动位置。',
    },
  },
  {
    id: USER_LIST_SPEC_ANNOT_NO.securityRisk,
    module: '安全封禁',
    feature: '近20条封禁历程',
    pageLocation: '安全封禁弹框 · 近20条封禁历程',
    prd: {
      functionalLogic:
        '近20条封禁历程给出该用户最近 20 条安全触发记录。当前封禁快照不在弹框展示，服务端 Redis 拿不到这些字段。',
      interactiveBehavior: '表格只读。记录超过一屏时在弹框内容区向下滚动，表头随内容区滚动。',
      visualPresentation:
        '标题「近20条封禁历程」，旁为注2。表头四列：序号、时间、终端、封禁原因。无记录时保留表头，表体一行居中灰色文案：已解除为「暂无风险记录」，从未封禁为「从未产生风险记录」。',
      dataRules:
        '最多 20 条，按时间从新到旧。序号从 1 开始。时间格式 YYYY-MM-DD HH:mm:ss。终端为 h5、pc、app 之一。每行封禁原因只写一条，只有两种日志原文：1. 登录过于频繁，触发限制阀值；2. 请求滑块图形验证码频繁，触发限制阀值。解除封禁后列表清空。',
      exceptions: '0 条时不隐藏表格，只显示缺省文案。超过 20 条时原型只保留最近 20 条，更早的不在本弹框展示。',
      routing: '不跳转风险详情，不提供单条操作。',
    },
  },
  {
    id: USER_LIST_SPEC_ANNOT_NO.securityLift,
    module: '安全封禁',
    feature: '解除封禁',
    pageLocation: '安全封禁弹框底部「解除封禁」',
    prd: {
      functionalLogic:
        '点击「解除封禁」即完成这一次解除，清掉近20条封禁历程，并解开账号锁定。弹框不展示封禁状态，服务端 Redis 也拿不到当前是否封禁，因此不按有无封禁决定按钮是否可点。',
      interactiveBehavior:
        '「解除封禁」始终可点。点击后立即关闭弹框，列表不刷新到其他页。成功后全局顶部提示「已解除用户 {用户ID} 的安全封禁」，约 3 秒消失。没有封禁记录时也按解除成功处理。取消、关闭、点遮罩都不解除。',
      visualPresentation:
        '底部右侧主按钮文案为「解除封禁」，左侧为「取消」。按钮始终为主色，不因无封禁记录置灰。按钮旁为注3。',
      dataRules:
        '无论当前有没有封禁记录，点击后都把当前封禁置空、近20条封禁历程清空、账号锁定解开，并关闭弹框。再次打开时，曾经有记录的显示「暂无风险记录」，从未封禁的显示「从未产生风险记录」。弹框仍不展示当前封禁快照。用户ID、账号状态、实名状态、删除状态不变。',
      exceptions:
        '重复点击在弹框关闭后不会再次解除。已删除用户、从未封禁用户也可以点解除。解除失败时不关弹框，并在弹框内提示原因（原型未接接口）。',
      routing: '关闭后仍停留在用户列表。不进入详情，不重新打开弹框。',
    },
  },
]
