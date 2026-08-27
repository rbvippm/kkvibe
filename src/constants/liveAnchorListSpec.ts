/** 直播管理 · 主播列表 · 展示指标 PRD */

import { PRD_DIMENSION_LABELS, type PcPrdDimension, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type LiveAnchorListPrdDimension = PcPrdDimension
export type LiveAnchorListFeatureRow = PcPrdFeatureRow

export const LIVE_ANCHOR_LIST_META = {
  title: '直播管理 · 主播列表',
  module: '直播管理',
  updatedAt: '2026-08-27',
  prdVersion: 'v1.2',
} as const

export const LIVE_ANCHOR_LIST_BACKGROUND = [
  '直播间展示人数、预约人数、本场点赞、热度需要可运营调控：既要有全站统一底数，也要允许头部主播单独抬高或压低。',
  '真实进出房、预约、弹幕、礼物、点赞会继续发生；后台配置决定每次事件叠加或扣减的展示增量，而不是改写已有主播资料、分成或封禁能力。',
  '本场点赞只认已登录用户的点赞，游客点赞不改展示值，也不进入热度的点赞项。',
  '本页只做展示指标配置，不承接已有「主播管理」的直播状态、封禁、礼物分成、粉丝数、标签、详情与编辑。',
] as const

export const LIVE_ANCHOR_LIST_GOALS = [
  '提供全局入口，统一配置基准人数、基础预约、基础热度、本场点赞，以及人数 / 预约 / 点赞 / 热度的高阶规则。',
  '弹框提供低 / 中 / 高三套系统档（约几十 / 几百 / 几千人）和自定义；默认自定义，选档后可再改数字。',
  '主播列表只展示指标相关字段：主播、主播 ID、配置来源、四项生效基准；操作仅「配置指标」。',
  '每个主播可跟随全局，或自定义基准与高阶规则；未自定义的主播实时读取全局配置。',
]

export const LIVE_ANCHOR_LIST_FEATURE_LIST: LiveAnchorListFeatureRow[] = [
  {
    id: 1,
    module: '全局配置',
    feature: '全局基准配置',
    pageLocation: '工具栏「全局配置」及弹框基准四项',
    prd: {
      functionalLogic:
        '维护全站默认的基准人数、基础预约、基础热度、本场点赞。未自定义的主播开播时直接读取这四项作为展示底数。',
      interactiveBehavior:
        '点「全局配置」打开弹框；改完点「确定」写入全局并关闭；点「取消」或 × 不保存。保存后列表里「跟随全局」的四列立即回显新值。',
      visualPresentation:
        '工具栏主色按钮「全局配置」，旁侧「注1」。弹框标题「全局基准配置」；四项数字输入，标签带 *。',
      dataRules: '四项必填，非负整数。原型默认基准人数 100、基础预约 20、基础热度 500、本场点赞 50。',
      exceptions: '空值、负数或小数 -> 底部中文提示，弹框不关闭。无权限时按钮禁用并提示「暂无配置权限」（联调期）。',
      routing: '停留本页，不跳转已有主播管理。',
    },
  },
  {
    id: 2,
    module: '全局配置',
    feature: '全局高阶设置',
    pageLocation: '全局配置弹框「高阶设置」',
    prd: {
      functionalLogic:
        '定义全站默认的展示增量：人数按进出房随机加减，预约按点击/取消随机加减，本场点赞仅在登录用户点赞时随机增加，热度按人数、弹幕、礼物金额、本场点赞加权。人数与预约的游客默认证入；点赞永不计入游客。',
      interactiveBehavior:
        '在全局弹框下半区改范围与系数；与基准四项一起保存。试算区改示例人数/弹幕/礼物/本场点赞后即时算出展示热度。',
      visualPresentation:
        '四个分组：人数增减、预约增减、本场点赞、热度综合。人数/预约为两行范围 +「计入游客」；点赞仅一行「用户点赞增加」范围，文案写明游客不触发。热度四条系数 + 公式 + 试算。旁侧「注2」。',
      dataRules:
        '范围均为非负整数且最大 ≥ 最小。系数非负、最多两位小数。人数：每人进入 +[min,max]、退出 −[min,max]。预约：点击预约 +[min,max]、取消预约 −[min,max]。本场点赞：仅登录用户每次点赞 +[min,max]，游客点赞、取消点赞均不改值。热度：展示热度 = 基础热度 + 展示人数×人数系数 + 弹幕条数×弹幕系数 + 礼物金额×礼物系数 + 本场点赞×点赞系数。展示人数/预约/本场点赞下限为 0。原型默认进入 3~8、退出 2~6、预约 2~5、取消 1~4、用户点赞 1~3，系数 2 / 1.5 / 0.8 / 0.3，人数/预约游客默认勾选。',
      exceptions: '最大小于最小、系数为负或超过两位小数 -> 中文提示，不保存。系数全为 0 时热度等于基础热度，允许保存。游客点赞不报错、不改本场点赞与热度点赞项。',
      routing: '确定成功关闭弹框；跟随全局的主播下次进出房/预约/用户点赞/互动按新规则计算。',
    },
  },
  {
    id: 3,
    module: '列表筛选',
    feature: '筛选',
    pageLocation: '筛选工具栏',
    prd: {
      functionalLogic: '按主播 ID、主播昵称、配置来源缩小要核对的主播范围。',
      interactiveBehavior: '点「搜索」应用条件；点「清除」恢复全量。未点搜索不立刻过滤。',
      visualPresentation:
        '主播ID / 主播昵称输入 + 配置来源下拉（全部 / 跟随全局 / 自定义）+「搜索」「清除」。旁侧「注3」。',
      dataRules: '主播 ID 精确匹配（trim）；昵称包含匹配；来源与行字段精确匹配。默认全部。',
      exceptions: '无匹配 -> 「暂无主播数据」，保留已选条件。',
      routing: '停留本页。',
    },
  },
  {
    id: 4,
    module: '列表展示',
    feature: '主播列表',
    pageLocation: '列表表格区域',
    prd: {
      functionalLogic:
        '展示主播及其生效的基准人数、基础预约、基础热度、本场点赞。跟随全局的行读当前全局值，自定义的行读该主播自己的值。',
      interactiveBehavior: '仅提供「配置指标」进入该主播配置。不提供查看详情、封禁、主播编辑。',
      visualPresentation:
        '列：序号 / 主播 / 主播ID / 配置来源 / 基准人数 / 基础预约 / 基础热度 / 本场点赞 / 操作。来源「跟随全局」灰色、「自定义」蓝色。旁侧「注4」。',
      dataRules:
        '只展示指标配置字段。不展示直播间ID、场次ID、礼物分成、粉丝数、标签、直播状态、封禁状态。生效值 = 来源为自定义且已存自定义稿 ? 自定义 : 全局。',
      exceptions: '无数据 -> 「暂无主播数据」。全局刚改完，跟随全局行四列同步变，自定义行不变。',
      routing: '停留本页；与已有主播管理无跳转。',
    },
  },
  {
    id: 5,
    module: '列表操作',
    feature: '配置指标',
    pageLocation: '操作列「配置指标」',
    prd: {
      functionalLogic: '打开该主播的指标配置弹框，选择跟随全局或自定义。',
      interactiveBehavior: '点「配置指标」打开标题「配置指标 · 昵称」的弹框；保存成功关闭并刷新该行。',
      visualPresentation: '操作列蓝色文字链「配置指标」。表头旁「注5」。',
      dataRules: '每行都可点，不因直播或封禁状态禁用。',
      exceptions: '主播标识失效 -> 提示「未找到该主播」，不打开弹框。',
      routing: '弹框内完成，无二级页。',
    },
  },
  {
    id: 6,
    module: '主播配置',
    feature: '配置来源与基准',
    pageLocation: '主播配置弹框上半区',
    prd: {
      functionalLogic:
        '决定该主播读全局还是用自己的底数。跟随全局时四项只读回显全局；自定义时可改四项，保存后不再跟随全局变更。',
      interactiveBehavior:
        '单选「跟随全局 / 自定义」。切到自定义时把当前生效配置（含高阶）复制进表单供改。切回跟随全局时表单回显全局并只读。确定时写入来源；选跟随全局则清空自定义稿。',
      visualPresentation:
        '配置来源两个单选；其下基准人数 / 基础预约 / 基础热度 / 本场点赞。跟随全局时输入框禁用，下方提示「保存后实时读取全局配置」。旁侧「注6」。',
      dataRules: '自定义时四项必填、非负整数。跟随全局不校验四项（以全局为准）。',
      exceptions: '自定义缺填或非法 -> 中文提示，不关闭。取消不改列表。',
      routing: '确定成功关闭弹框并刷新该行四列与来源。',
    },
  },
  {
    id: 7,
    module: '主播配置',
    feature: '主播高阶设置',
    pageLocation: '主播配置弹框「高阶设置」',
    prd: {
      functionalLogic:
        '自定义主播覆盖人数进出、预约点击/取消的随机范围（含是否计入游客）、本场点赞的用户点赞随机增量，以及热度四因子系数。跟随全局时只读回显全局高阶，避免误改全站。',
      interactiveBehavior:
        '自定义时可改范围、游客勾选、用户点赞范围、四条系数和试算样例；跟随全局时整区禁用。与来源、基准一起保存。',
      visualPresentation: '结构与全局高阶一致：人数增减 / 预约增减 / 本场点赞 / 热度综合 + 公式 + 试算。旁侧「注7」。',
      dataRules:
        '校验同全局高阶。人数与预约可勾选计入游客；本场点赞无游客勾选，仅登录用户点赞 +[min,max]。热度公式中的点赞取本场点赞。原型「小夜不困」自定义进入 5~12、点赞 2~5；「阿凯开播」自定义且人数/预约不计入游客、点赞 1~1。',
      exceptions: '自定义时范围或系数非法 -> 中文提示。跟随全局只读，不单独报高阶错。',
      routing: '随「确定」一并保存；无独立跳转。',
    },
  },
  {
    id: 8,
    module: '弹框表单',
    feature: '档位预设',
    pageLocation: '配置弹框「档位」',
    prd: {
      functionalLogic:
        '用三套系统档快速铺底，避免运营从空白数字硬填。低约几十人、中约几百人、高约几千人；自定义保留当前稿或自行改。',
      interactiveBehavior:
        '默认「自定义」。点低 / 中 / 高立刻回填该档基准与高阶，试算样例同步换成该档量级。再改任一数字或点「自定义」，档位变为自定义，数字不回滚。跟随全局时档位只读回显全局档。',
      visualPresentation:
        '基准值上方一行单选：低 / 中 / 高 / 自定义，旁侧「注8」。辅助说明「低约几十人、中约几百人、高约几千人」。',
      dataRules:
        '低：基准人数 38、预约 7、热度 160、点赞 12；进入 1~3。中：260 / 46 / 980 / 72；进入 4~9。高：2800 / 420 / 8600 / 760；进入 16~42。高阶范围与系数随档放大，避免几十人房间进出一次加几十。默认打开为自定义，沿用当前已存稿。',
      exceptions: '跟随全局不可改档。选档后未点确定即取消，不写入。',
      routing: '与基准、高阶一并保存；无跳转。',
    },
  },
]

export const LIVE_ANCHOR_LIST_SPEC_ANNOT_NO = {
  globalBase: 1,
  globalAdvanced: 2,
  filter: 3,
  list: 4,
  configAction: 5,
  sourceAndBase: 6,
  anchorAdvanced: 7,
  preset: 8,
} as const

export type LiveAnchorListAnnotContext = keyof typeof LIVE_ANCHOR_LIST_SPEC_ANNOT_NO

export const LIVE_ANCHOR_LIST_ANNOT_MAP: Record<
  LiveAnchorListAnnotContext,
  { no: number; title: string; items: readonly string[] }
> = {
  globalBase: {
    no: 1,
    title: '全局基准配置',
    items: ['配置全站默认基准人数、基础预约、基础热度、本场点赞。', '未自定义的主播实时读取这四项。'],
  },
  globalAdvanced: {
    no: 2,
    title: '全局高阶设置',
    items: [
      '人数进出、预约点击/取消按范围随机加减，默认证入游客。',
      '本场点赞只由登录用户点赞触发；热度按人数/弹幕/礼物/本场点赞加权。',
    ],
  },
  filter: {
    no: 3,
    title: '筛选',
    items: ['按主播 ID、昵称、配置来源筛选。', '点「搜索」生效，点「清除」恢复全量。'],
  },
  list: {
    no: 4,
    title: '主播列表',
    items: ['只展示主播、ID、来源和四项生效基准（含本场点赞）。', '不展示分成、粉丝、标签、直播/封禁状态。'],
  },
  configAction: {
    no: 5,
    title: '配置指标',
    items: ['打开该主播的指标配置。', '不提供详情、封禁、主播编辑。'],
  },
  sourceAndBase: {
    no: 6,
    title: '配置来源与基准',
    items: ['跟随全局则只读回显全局四项。', '自定义后该主播不再跟随全局变更。'],
  },
  anchorAdvanced: {
    no: 7,
    title: '主播高阶设置',
    items: ['自定义可改人数/预约/本场点赞规则与热度系数。', '本场点赞仅登录用户触发；跟随全局时只读。'],
  },
  preset: {
    no: 8,
    title: '档位预设',
    items: ['低约几十人、中约几百人、高约几千人，选档回填基准与高阶。', '默认自定义；改过数字即视为自定义。'],
  },
}
