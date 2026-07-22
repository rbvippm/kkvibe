/** 被邀请人详情 · PRD
 * 与页面「注1～注8」一一对应；不含【文档说明】入口。
 */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type InviteRebateInviteePrdDimension = PcPrdDimension
export type InviteRebateInviteeFeatureRow = PcPrdFeatureRow

export type InviteRebateInviteeAnnotContext =
  | 'rebateByCurrency'
  | 'dailyDetail'
  | 'bizDateFilter'
  | 'currencyFilter'
  | 'inviterEligibleFilter'
  | 'inviteeEligibleFilter'
  | 'settleStatusFilter'
  | 'remarkReasons'

export const INVITE_REBATE_INVITEE_META = {
  title: '被邀请人详情',
  module: '运营管理',
  updatedAt: '2026-07-22',
  prdVersion: 'v1.12',
} as const

/** 1. 需求背景 */
export const INVITE_REBATE_INVITEE_BACKGROUND = [
  '运营从「邀请列表」下钻后，需查看某邀请人名下的被邀请人参与情况（人维度）。',
  '列表结构对齐邀请列表（无「下级人数」）：昵称、用户ID、金刚号、身份、VIP、分币种累计返利、操作。',
  '币种、业务日[T]/复充日[T+1]存款与计奖门槛下沉到「被邀请人每日明细」。',
  '次日解锁：T+1 须双方次日门槛达标且邀请人已绑手机；任一方为代理则取消。T+1 12:00（GMT+7）起可手动领取，超有效期作废。',
  '预估奖金 = 被邀请人 T 日充值 × 业务日返利比例，再按 VIP 日上限封顶。',
] as const

/** 2. 需求目标 */
export const INVITE_REBATE_INVITEE_GOALS = [
  '作为邀请列表的二级页：进入时按邀请人（用户ID）过滤被邀请人列表；支持再按用户ID、金刚号、身份、VIP 筛选。',
  '列表为人维度：展示昵称、用户ID、金刚号、身份、VIP（枚举 VIP0～VIP10）、累计返利(KKC/KKV/USDT)（注1）；无下级人数、无资格列。',
  '详情为大弹框「被邀请人每日明细」（注2）；弹框内可按业务日、币种、邀请人资格、被邀请人资格、领取状态筛选（注3～注7）；备注按领取状态承载待解锁 / 已过期 / 已取消原因（注8；PC 用邀请人/被邀请人视角）。',
] as const

/** 页面「注N」编号登记（与 FEATURE_LIST.id、页面 WfSpecAnnot :no 一致） */
export const INVITE_REBATE_INVITEE_SPEC_ANNOT_NO = {
  rebateByCurrency: 1,
  dailyDetail: 2,
  bizDateFilter: 3,
  currencyFilter: 4,
  inviterEligibleFilter: 5,
  inviteeEligibleFilter: 6,
  settleStatusFilter: 7,
  remarkReasons: 8,
} as const

/** 3. 需求功能清单（与页面「注N」标注一一对应） */
export const INVITE_REBATE_INVITEE_FEATURE_LIST: InviteRebateInviteeFeatureRow[] = [
  {
    id: 1,
    module: '列表字段',
    feature: '累计返利分币种',
    pageLocation: '列表「累计返利(KKC)」表头旁「注1」；「累计返利(KKV)」「累计返利(USDT)」列',
    prd: {
      functionalLogic:
        '累计返利按活动币种分列展示该被邀请人对邀请人已贡献返利：KKC、KKV、USDT 各自独立统计，不做跨币种折算。列表结构对齐邀请列表，但不含「下级人数」。',
      interactiveBehavior: '只读展示；无排序交互（原型）。',
      visualPresentation:
        '三列金额右对齐展示（千分位 + 两位小数）；表头「累计返利(KKC)」旁「注1」。无该币种返利时展示 0.00。',
      dataRules:
        '字段：rebateKKC / rebateKKV / rebateUSDT，数值 ≥ 0。口径：返利金额 = 业务日被邀请人存款 × 业务日返利比例（落库汇总）。',
      exceptions: '三币种均为 0 → 仍展示 0.00，不隐藏列。',
      routing: '无跳转。',
    },
  },
  {
    id: 2,
    module: '详情弹框',
    feature: '被邀请人每日明细',
    pageLocation: '操作列表头旁「注2」；行内「详情」；大弹框「被邀请人每日明细」',
    prd: {
      functionalLogic:
        '大弹框按「被邀请人 + 币种 + 业务日」展示邀请人次日存款、被邀请人 T 日/次日存款、返利比例、双方资格、应发/实发、领取状态、流水号、领取开放时间与备注。无「邀请人T日存款」（新规则无邀请人 T 日门槛）。双方资格各自独立；仅双方均为可计奖时计奖。返利金额 = 被邀请人 T 日存款 × 业务日返利比例；触达 VIP 日上限时实发可小于应发。',
      interactiveBehavior:
        '点击行内「详情」→ 打开大弹框；表格横向滚动；底部分页；点「关闭」或遮罩关闭。弹框内筛选见注3～注7；备注原因见注8。',
      visualPresentation:
        '操作列表头旁「注2」；行内蓝色「详情」。弹框标题「被邀请人每日明细」，宽表样式；金额列右对齐；双方资格用状态徽章。',
      dataRules:
        '明细维度：inviteeId + currency + bizDate。列含邀请人次日存款、被邀请人 T 日/次日存款、返利比例、双方资格、预估、已领、领取状态、流水号、领取开放/过期时间、备注。不含邀请人 T 日存款。仅已领取有流水号；备注写待解锁/已取消/已过期原因。',
      exceptions:
        '无明细 →「暂无每日明细」。任一方资格非可计奖 → 应发/实发为 0。',
      routing: '弹框无独立路由；关闭后停留本列表。',
    },
  },
  {
    id: 3,
    module: '详情弹框筛选',
    feature: '业务日',
    pageLocation: '每日明细弹框筛选区「业务日」标签旁「注3」',
    prd: {
      functionalLogic:
        '按返利计算业务日区间过滤每日明细，便于运营核对某段日期的计奖与派发情况。',
      interactiveBehavior:
        '选择起止日期后点「搜索」→ 仅保留 bizDate 落在闭区间内的行；点「清除」→ 恢复默认业务日起止。可与币种、资格、领取状态组合。',
      visualPresentation:
        '标签「业务日：」+ 起止 date 控件，中间「-」分隔；旁侧「注3」。',
      dataRules:
        '字段：startDate / endDate，格式 YYYY-MM-DD；默认 Mock 区间 2026-07-10～2026-07-18。比较按字符串日期序（与 Mock 格式一致）。',
      exceptions: '结束日期早于开始日期 → 弹框内中文提示且不应用本次筛选；区间内无数据 →「暂无每日明细」。',
      routing: '停留弹框内，不跳转。',
    },
  },
  {
    id: 4,
    module: '详情弹框筛选',
    feature: '币种',
    pageLocation: '每日明细弹框筛选区「币种」标签旁「注4」；表列「币种」',
    prd: {
      functionalLogic:
        '币种维度落在每日明细：同一被邀请人可有多币种业务日行，按币种独立统计存款门槛与返利，不做跨币种折算。',
      interactiveBehavior:
        '选择「全部 / KKC / KKV / USDT」后点「搜索」→ 按 currency 精确过滤；点「清除」→ 恢复「全部」。可与业务日、资格、领取状态组合。',
      visualPresentation:
        '标签「币种：」+ 下拉；旁侧「注4」。表列「币种」展示该行活动币种。',
      dataRules:
        '枚举：KKC | KKV | USDT；默认「全部」。明细行键含 currency；金额按该币种原生展示。',
      exceptions: '组合筛选无结果 →「暂无每日明细」。',
      routing: '停留弹框内，不跳转。',
    },
  },
  {
    id: 5,
    module: '详情弹框筛选',
    feature: '邀请人资格',
    pageLocation: '每日明细弹框筛选区「邀请人资格」标签旁「注5」；表列「邀请人资格」',
    prd: {
      functionalLogic:
        '按业务日+币种维度过滤邀请人解锁侧资格。可计奖：普通会员且次日门槛达标；未达标：仍为会员但门槛未达；已取消：已成为代理。',
      interactiveBehavior:
        '选择「全部 / 可计奖 / 未达标 / 已取消」后点「搜索」→ 按 inviterEligibleStatus 精确过滤；点「清除」→ 恢复「全部」。',
      visualPresentation:
        '标签「邀请人资格：」+ 下拉；旁侧「注5」。表列「邀请人资格」用状态徽章展示。',
      dataRules:
        '枚举：eligible | ineligible | cancelled；默认「全部」。作用域为邀请人、业务日+币种维度。',
      exceptions: '组合筛选无结果 → 空态；不以被邀请人资格覆盖本筛选项。',
      routing: '停留弹框内，不跳转。',
    },
  },
  {
    id: 6,
    module: '详情弹框筛选',
    feature: '被邀请人资格',
    pageLocation: '每日明细弹框筛选区「被邀请人资格」标签旁「注6」；表列「被邀请人资格」',
    prd: {
      functionalLogic:
        '按业务日+币种维度过滤被邀请人解锁侧资格。可计奖：普通会员且次日门槛达标；未达标：仍为会员但门槛未达；已取消：已成为代理。解锁须双方均可计奖。',
      interactiveBehavior:
        '选择「全部 / 可计奖 / 未达标 / 已取消」后点「搜索」→ 按 inviteeEligibleStatus 精确过滤；点「清除」→ 恢复「全部」。',
      visualPresentation:
        '标签「被邀请人资格：」+ 下拉；旁侧「注6」。表列「被邀请人资格」用状态徽章展示。',
      dataRules:
        '枚举：eligible | ineligible | cancelled；默认「全部」。与邀请人资格分列独立筛选，互不覆盖。',
      exceptions: '组合筛选无结果 → 空态；邀请人可计奖而被邀请人待解锁时该日不计奖。',
      routing: '停留弹框内，不跳转。',
    },
  },
  {
    id: 7,
    module: '详情弹框筛选',
    feature: '领取状态',
    pageLocation: '每日明细弹框筛选区「领取状态」标签旁「注7」；表列「领取状态」「流水号」',
    prd: {
      functionalLogic:
        '按领取状态过滤明细。待解锁：已生成预估，解锁三条件未齐或未到 T+1 12:00。可领取：三条件满足且已到开放时刻、未过期，可手动领。已领取：领取成功，有流水号。已过期：超过 expireAt 未领。已取消：代理取消资格。',
      interactiveBehavior:
        '选择「全部 / 待解锁 / 可领取 / 已领取 / 已过期 / 已取消」后点「搜索」→ 按 status 精确过滤；点「清除」→ 恢复「全部」。',
      visualPresentation:
        '标签「领取状态：」+ 下拉；旁侧「注7」。表列「领取状态」；仅已领取展示流水号，其余为「-」。另展示领取开放时间与过期时间。',
      dataRules:
        '枚举：locked | claimable | claimed | expired | cancelled。仅 claimed 有 flowNo。claimOpenAt = T+1 12:00；expireAt = startOfDay(T+1)+(X===0?1:X)×1day。',
      exceptions:
        '组合筛选无结果 → 空态。备注按领取状态承载待解锁 / 已过期 / 已取消原因（注8）。',
      routing: '停留弹框内，不跳转。',
    },
  },
  {
    id: 8,
    module: '详情弹框',
    feature: '备注原因',
    pageLocation: '每日明细表头「备注」旁「注8」；表列「备注」',
    prd: {
      functionalLogic:
        '备注按领取状态记录原因，方便运营排查。PC 用「邀请人 / 被邀请人」视角；移动端用「您 / 好友」视角，语义对齐、文案不混用。可领取 / 已领取备注为空。',
      interactiveBehavior: '只读展示；无交互。',
      visualPresentation:
        '表头「备注」旁「注8」。有原因时展示短文案，无原因时展示「-」。',
      dataRules:
        '按领取状态划分：①待解锁原因枚举见浮层；多条件未满足时只记主因一条，优先级：未到次日 12:00 → 邀请人未绑定手机号 → 被邀请人次日门槛 → 邀请人次日门槛 → 被邀请人当日触发门槛；②已过期 →「已超过领取有效期，奖金已失效」；③已取消 →「邀请人已成为代理…」/「被邀请人已成为代理…」，且优先于待解锁。可领取、已领取备注为空。不拼接多条原因。',
      exceptions: '不得把公式说明、上限截断文案写入备注。',
      routing: '无跳转。',
    },
  },
]

/** 注1 · 浮层简版 */
export const INVITE_REBATE_INVITEE_REBATE_SPEC = [
  '累计返利按 KKC / KKV / USDT 分列展示，不做跨币种折算。',
  '各列为该被邀请人对邀请人在对应币种下的已贡献返利汇总。',
  '列表对齐邀请列表结构，但不含「下级人数」；无该币种返利时展示 0.00。',
] as const

/** 注2 · 浮层简版 */
export const INVITE_REBATE_INVITEE_DAILY_SPEC = [
  '点击「详情」打开大弹框，按「币种 + 业务日」查看次日解锁相关存款与返利明细（邀请人仅展示次日存款）。',
  '资格分列：邀请人资格 / 被邀请人资格；解锁须双方次日门槛达标。',
  '仅已领取有流水号；备注按领取状态写待解锁 / 已过期 / 已取消原因（注8；PC 视角为邀请人/被邀请人）。',
  '领取开放：T+1 12:00（GMT+7）；展示过期时间。',
] as const

/** 注3 · 浮层简版 */
export const INVITE_REBATE_INVITEE_BIZ_DATE_SPEC = [
  '按业务日（返利计算日）起止区间过滤每日明细。',
  '结束日期不得早于开始日期，否则提示且不应用筛选。',
  '可与币种、邀请人资格、被邀请人资格、领取状态组合。',
] as const

/** 注4 · 浮层简版 */
export const INVITE_REBATE_INVITEE_CURRENCY_SPEC = [
  '币种维度落在每日明细：同一被邀请人可有多币种业务日行。',
  '按币种独立统计存款门槛与返利，不做跨币种折算。',
  '可与业务日、双方资格、领取状态组合筛选。',
] as const

/** 注5 · 浮层简版 */
export const INVITE_REBATE_INVITEE_INVITER_ELIGIBLE_SPEC = [
  '可计奖：邀请人为普通会员，且次日解锁门槛达标（含绑手机要求时已绑定）。',
  '未达标：仍为会员，但次日门槛未达。',
  '已取消：邀请人已成为代理（或按规则取消资格）。',
  '按业务日+币种维度筛选；与「被邀请人资格」分列独立。',
] as const

/** 注6 · 浮层简版 */
export const INVITE_REBATE_INVITEE_INVITEE_ELIGIBLE_SPEC = [
  '可计奖：被邀请人为普通会员，且次日解锁门槛达标。',
  '未达标：仍为会员，但次日门槛未达。',
  '已取消：被邀请人已成为代理（或按规则取消资格）。',
  '解锁须双方资格均可计奖，且已到 T+1 12:00。',
] as const

/** 注7 · 浮层简版 */
export const INVITE_REBATE_INVITEE_SETTLE_STATUS_SPEC = [
  '待解锁：已生成预估奖金，解锁条件未齐或未到 T+1 12:00（GMT+7）。',
  '可领取：三条件满足且已到开放时刻、未过期；邀请人可手动领取。',
  '已领取：领取成功，生成账单并关联流水号。',
  '已过期：超过领取有效期未领，奖金作废。',
  '已取消：任一方成为代理等，取消资格；原因见备注。',
] as const

/** 注8 · 浮层简版 · 备注原因枚举（PC：邀请人 / 被邀请人视角） */
export const INVITE_REBATE_INVITEE_REMARK_SPEC = [
  '备注按领取状态填写原因；可领取 / 已领取备注为空。PC 后台用「邀请人 / 被邀请人」表述，不用「您 / 好友」。',
  '待解锁可选原因：被邀请人当日存款未达触发门槛，暂不可领取；被邀请人次日存款未达解锁门槛，暂不可领取；邀请人次日存款未达解锁门槛，暂不可领取；邀请人未绑定手机号，暂不可领取；未到次日 12:00（GMT+7），暂不可领取。',
  '多条件同时未满足时只记主因一条，按优先级取第一条：①未到次日 12:00（GMT+7）→②邀请人未绑定手机号→③被邀请人次日存款未达解锁门槛→④邀请人次日存款未达解锁门槛→⑤被邀请人当日存款未达触发门槛。不拼接多条原因。',
  '已过期：已超过领取有效期，奖金已失效。',
  '已取消：邀请人已成为代理，返利资格已取消；被邀请人已成为代理，返利资格已取消。已取消优先于待解锁原因。',
  '一行只记主因一条短文案；与移动端原因语义对应（移动端为「您 / 好友」视角）。',
] as const

export const INVITE_REBATE_INVITEE_ANNOT_MAP: Record<
  InviteRebateInviteeAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  rebateByCurrency: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.rebateByCurrency,
    title: '累计返利分币种',
    items: INVITE_REBATE_INVITEE_REBATE_SPEC,
  },
  dailyDetail: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.dailyDetail,
    title: '被邀请人每日明细',
    items: INVITE_REBATE_INVITEE_DAILY_SPEC,
  },
  bizDateFilter: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.bizDateFilter,
    title: '业务日筛选',
    items: INVITE_REBATE_INVITEE_BIZ_DATE_SPEC,
  },
  currencyFilter: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.currencyFilter,
    title: '币种筛选',
    items: INVITE_REBATE_INVITEE_CURRENCY_SPEC,
  },
  inviterEligibleFilter: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.inviterEligibleFilter,
    title: '邀请人资格筛选',
    items: INVITE_REBATE_INVITEE_INVITER_ELIGIBLE_SPEC,
  },
  inviteeEligibleFilter: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.inviteeEligibleFilter,
    title: '被邀请人资格筛选',
    items: INVITE_REBATE_INVITEE_INVITEE_ELIGIBLE_SPEC,
  },
  settleStatusFilter: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.settleStatusFilter,
    title: '领取状态筛选',
    items: INVITE_REBATE_INVITEE_SETTLE_STATUS_SPEC,
  },
  remarkReasons: {
    no: INVITE_REBATE_INVITEE_SPEC_ANNOT_NO.remarkReasons,
    title: '备注原因',
    items: INVITE_REBATE_INVITEE_REMARK_SPEC,
  },
}
