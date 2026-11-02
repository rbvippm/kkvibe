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
  prdVersion: 'v1.2',
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
  '行内管理提供禁用/启用、查看详情、重置密码、安全封禁、实名状态、重置安全密码、删除等操作入口。安全封禁入口对全部用户可点，含已删除。弹框的当前封禁信息第一行为封禁状态：封禁中、未封禁。只有封禁中才展示最近一次触发终端、一条封禁原因和封禁时间。近20条封禁历程有记录时列出最近 20 条，无记录时显示缺省文案。确认后解除当前封禁。',
] as const

/** 仅覆盖「安全封禁」弹框上的注1～注4，与页面标注一一对应 */
export const USER_LIST_SPEC_ANNOT_NO = {
  securityEntry: 1,
  securityBanInfo: 2,
  securityRisk: 3,
  securityLift: 4,
} as const

export const USER_LIST_SECURITY_ENTRY_SPEC = [
  '管理列「安全封禁」对全部行可点，含已删除用户，不因无封禁记录而禁用。',
  '点击打开标题为「安全封禁」的弹框，不跳转详情。',
  '点遮罩、关闭或取消只关弹框，不改封禁数据。',
] as const

export const USER_LIST_SECURITY_BAN_INFO_SPEC = [
  '当前封禁信息第一行是封禁状态，只有两种：封禁中、未封禁。封禁中括号里的登录方式可以同时存在，最多四种：账号、密码、手机验证码、邮箱验证码。',
  '只有封禁中才继续展示触发终端、一条封禁原因、封禁时间。未封禁不展示这三行。',
  '封禁原因只有一条，取自两种规则：1. x内登录过于频繁，触发次数阀值y；2. x内请求滑块图形验证码频繁，触发次数阀值y。终端取 h5、pc、app 中的一个。',
] as const

export const USER_LIST_SECURITY_RISK_SPEC = [
  '近20条封禁历程固定表头，按时间从新到旧最多 20 条。',
  '列：序号、时间、终端、封禁原因。第 1 条与当前封禁信息是同一次。',
  '没有记录时保留表头。解除后显示「暂无风险记录」；从未封禁显示「从未产生风险记录」。',
] as const

export const USER_LIST_SECURITY_LIFT_SPEC = [
  '有当前封禁时，「解除封禁」可点；没有封禁时按钮禁用。',
  '确认后清掉当前封禁和近20条封禁历程，账号锁定一并解开，弹框关闭。',
  '成功用全局顶部提示：「已解除用户 {用户ID} 的安全封禁」。',
] as const

export const USER_LIST_ANNOT_MAP = {
  securityEntry: {
    no: USER_LIST_SPEC_ANNOT_NO.securityEntry,
    title: '安全封禁',
    items: USER_LIST_SECURITY_ENTRY_SPEC,
  },
  securityBanInfo: {
    no: USER_LIST_SPEC_ANNOT_NO.securityBanInfo,
    title: '当前封禁信息',
    items: USER_LIST_SECURITY_BAN_INFO_SPEC,
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
        '运营从用户列表管理列进入安全封禁，查看该用户最近一次登录安全封锁，并决定是否解除。入口合并原「解锁」与「解封登录锁定」，不再按登录方式选择解封范围。',
      interactiveBehavior:
        '点击管理列文字链「安全封禁」打开弹框。已删除用户、当前无封禁记录的用户都可以打开。点击遮罩、标题栏关闭或底部「取消」只关闭弹框，不修改封禁数据，也不出现顶部提示。',
      visualPresentation:
        '弹框标题为「安全封禁」，右侧为关闭。标题旁为注1。弹框宽 720px，整体最高为视口 70%，仅内容区滚动。列表入口为蓝色文字链，位于「重置密码」与实名状态之间，不出现禁用态。',
      dataRules:
        '弹框绑定当前行用户。原型按用户预置一条当前封禁及最多 20 条风险；解除后该用户的当前封禁为空。不在此弹框展示用户ID、金刚号、区号、手机号、邮箱。',
      exceptions:
        '已删除用户仍可打开。接口失败时保持弹框不关闭，并在弹框内提示失败原因（原型未接接口）。列表筛选、翻页不自动关闭已打开的弹框。',
      routing: '停留在用户列表。不进入用户详情，不新开页。关闭后回到原列表滚动位置。',
    },
  },
  {
    id: USER_LIST_SPEC_ANNOT_NO.securityBanInfo,
    module: '安全封禁',
    feature: '当前封禁信息',
    pageLocation: '安全封禁弹框 · 当前封禁信息',
    prd: {
      functionalLogic:
        '当前封禁信息先给出封禁状态，再在封禁中时呈现最后一次封锁，供运营判断这次是哪个终端、因为什么、什么时候被封。不汇总历史全部终端，也不把多次原因叠在一起。',
      interactiveBehavior: '本区域只读，无输入、无展开。封禁状态始终展示。触发终端、封禁原因、封禁时间只在封禁中出现。',
      visualPresentation:
        '标题「当前封禁信息」，旁为注2。第一行标签「封禁状态」。封禁中展示为「封禁中（登录方式）」，整段红色加粗。括号内用中文逗号并列，可以同时存在，最多四种：账号、密码、手机验证码、邮箱验证码。未封禁为灰色。封禁中时再展示三行：触发终端、封禁原因、封禁时间。标签灰色，内容换行展示，不截断。未封禁只有封禁状态这一行。原型第二条用户为未封禁，第一条为「封禁中（账号，密码，手机验证码，邮箱验证码）」。',
      dataRules:
        '封禁状态只有两种：当前有封禁展示为「封禁中（登录方式）」；当前没有封禁（含从未封禁和已解除）为「未封禁」。括号内取自账号、密码、手机验证码、邮箱验证码，可以同时命中，至少一种、最多四种，按这个顺序用中文逗号连接。超过四种时只保留前四种。触发终端枚举为 h5、pc、app，只在封禁中显示最近一次的一个值，例如 pc，不写成 h5/pc/app。封禁原因只有一条，取最近一次命中的规则，规则只有两种：1. x内登录过于频繁，触发次数阀值y；2. x内请求滑块图形验证码频繁，触发次数阀值y。x 为统计时间窗口，y 为触发次数阀值。原型示例把 x 填为 10分钟、y 填为 5。封禁时间格式为 YYYY-MM-DD HH:mm:ss，与该次风险记录时间相同。',
      exceptions:
        '未封禁时不展示终端、原因、时间，也不用「-」占位。超长原因在弹框内换行。',
      routing: '不跳转。数据与下方近20条封禁历程第 1 条为同一次记录。',
    },
  },
  {
    id: USER_LIST_SPEC_ANNOT_NO.securityRisk,
    module: '安全封禁',
    feature: '近20条封禁历程',
    pageLocation: '安全封禁弹框 · 近20条封禁历程',
    prd: {
      functionalLogic:
        '近20条封禁历程给出该用户最近 20 条安全触发记录，便于对照当前封禁信息是否为连续命中，而不是只看最后一次。',
      interactiveBehavior: '表格只读。记录超过一屏时在弹框内容区向下滚动，表头随内容区滚动。',
      visualPresentation:
        '标题「近20条封禁历程」，旁为注3。表头四列：序号、时间、终端、封禁原因。无记录时保留表头，表体一行居中灰色文案：已解除为「暂无风险记录」，从未封禁为「从未产生风险记录」。',
      dataRules:
        '最多 20 条，按时间从新到旧。序号从 1 开始。时间格式 YYYY-MM-DD HH:mm:ss。终端为 h5、pc、app 之一。每行封禁原因只写一条，规则与当前封禁信息相同：1. x内登录过于频繁，触发次数阀值y；2. x内请求滑块图形验证码频繁，触发次数阀值y。有当前封禁时，第 1 条的时间、终端、原因与当前封禁信息一致。解除封禁后列表清空。',
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
        '确认后解除该用户当前安全封禁，使其不再处于这次封锁；同时清掉本弹框中的近20条封禁历程。原型将账号锁定标记一并取消。',
      interactiveBehavior:
        '有当前封禁时点击「解除封禁」立即生效：关闭弹框，列表不刷新到其他页。成功后全局顶部提示「已解除用户 {用户ID} 的安全封禁」，约 3 秒消失。无当前封禁时按钮不可点，不出现提示。取消、关闭、点遮罩都不解除。',
      visualPresentation:
        '底部右侧主按钮文案为「解除封禁」，左侧为「取消」。可点时为主色按钮；无封禁时按钮置灰。按钮旁为注4。',
      dataRules:
        '解除后当前封禁置空，近20条封禁历程为空。再次打开时封禁状态为「未封禁」，不再展示触发终端、封禁原因、封禁时间；近20条封禁历程为「暂无风险记录」。用户ID、账号状态、实名状态、删除状态不变。',
      exceptions:
        '重复点击在弹框关闭后不会再次解除。已删除用户只要仍有当前封禁，也可以解除。解除失败时不关弹框，并在弹框内提示原因（原型未接接口）。',
      routing: '关闭后仍停留在用户列表。不进入详情，不重新打开弹框。',
    },
  },
]
