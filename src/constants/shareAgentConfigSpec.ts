/** 占成代理配置 · PRD 与功能清单（六大核心维度） */

import {
  PRD_DIMENSION_LABELS,
  type PcPrdDimension,
  type PcPrdFeatureRow,
} from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type ShareAgentPrdDimension = PcPrdDimension
export type ShareAgentFeatureRow = PcPrdFeatureRow

export const SHARE_AGENT_CONFIG_META = {
  title: '占成代理配置',
  module: '推广返利',
  updatedAt: '2026-07-03',
  prdVersion: 'v1.1',
} as const

/** 1. 需求背景 */
export const SHARE_AGENT_CONFIG_BACKGROUND = [
  '推广返利模块需支持占成代理的查询、授信与方案配置，区分现金代理与信用代理两套账密及占成/退水规则。',
  '一级代理需从原「x币上下分」调整为「授信」流程，完成信用方案新增后展示信用标识与信用账密。',
  '占成、退水由旧「赚水」口径调整为「退水」口径，后台填写值为向下级返还的退水比例。',
] as const

/** 2. 需求目标 */
export const SHARE_AGENT_CONFIG_GOALS = [
  '提供占成代理列表查询（含代理等级、是否信用代理筛选）与状态管理。',
  '支持一级代理授信（仅新增信用方案）及已授信代理编辑（现金/信用 Tab 分别配置）。',
  '授信/编辑弹框支持多品类占成、退水配置，并校验 0～x 区间（x 为上级最大值）。',
  '现金游戏占成、信用游戏占成下方分别配置现金P2P返利占成、信用P2P返利占成（社区棋牌、金刚体育），区间与对应游戏占成一致。',
] as const

/** 3. 需求功能清单（与页面「注」标注对应，不含文档入口本身） */
export const SHARE_AGENT_CONFIG_FEATURE_LIST: ShareAgentFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '代理等级',
    pageLocation: '筛选区「代理等级」',
    prd: {
      functionalLogic: '代理等级下拉：按代理层级过滤列表数据，缩小运营检索范围。',
      interactiveBehavior:
        '选择 1～10 级代理后点击「搜索」-> 列表仅展示对应等级；点击「清除」-> 重置为「请选择」并恢复全量展示。',
      visualPresentation:
        '标签「代理等级：」+ 下拉框，默认「请选择」；旁侧「注1」标注。',
      dataRules: '非必填；选项值 1～10 对应「N级代理」；空值表示不过滤等级。',
      exceptions: '无匹配数据 -> 表格展示「暂无数据」空状态，不报错。',
      routing: '筛选结果停留当前列表页，不跳转。',
    },
  },
  {
    id: 2,
    module: '列表筛选',
    feature: '信用代理',
    pageLocation: '筛选区「信用代理」',
    prd: {
      functionalLogic: '信用代理下拉：区分已授信与未授信代理，辅助运营定位信用体系用户。',
      interactiveBehavior:
        '选择「是」并搜索 -> 仅展示 isCreditAgent=true 且信用账密已存在的行；选择「否」-> 仅未授信；清除后恢复全量。',
      visualPresentation: '标签「信用代理：」+ 三态下拉（请选择 / 是 / 否）；旁侧「注2」标注。',
      dataRules: '「是」判定：已完成授信且 creditAgentAccount、creditAgentPassword 均非空；「否」：未授信。',
      exceptions: '组合筛选（等级+信用）无交集 -> 空列表 +「暂无数据」。',
      routing: '停留列表页。',
    },
  },
  {
    id: 3,
    module: '列表展示',
    feature: '信用代理标识',
    pageLocation: '列表列「代理级别」',
    prd: {
      functionalLogic: '「信」标识：标识该代理已纳入信用代理体系，与信用账密列数据联动展示。',
      interactiveBehavior: '列表加载后自动渲染；无需用户操作；鼠标悬停标识显示 title「信用代理」。',
      visualPresentation:
        '「N级代理」文字后紧跟蓝色圆角小标签「信」（wf-credit-badge）；未授信不展示标识；表头「代理级别」旁侧「注3」标注。',
      dataRules: '展示条件：isCreditAgent=true 且信用账号、密码均非空；与列表信用账密列一致。',
      exceptions: '仅授信未完成或账密缺失 -> 不展示「信」，避免误导。',
      routing: '无跳转；点击标识不触发弹框（仅辅助识别）。',
    },
  },
  {
    id: 4,
    module: '列表展示',
    feature: '信用代理账密与状态',
    pageLocation: '列表表格',
    prd: {
      functionalLogic:
        '信用代理账号/密码列：展示信用体系登录凭证；状态列：展示代理启用/禁用运营状态。',
      interactiveBehavior: '列表只读展示；禁用/启用通过操作列切换后即时刷新状态标签。',
      visualPresentation:
        '未授信账密显示「-」；状态为绿色「启用」或灰色「禁用」标签（wf-status-badge）；信用账密列与状态列表头区旁侧「注4」标注。',
      dataRules: '账密明文展示（后台场景）；状态字段 disabled：true=禁用，false=启用。',
      exceptions: '账密为空 -> 统一显示「-」，不占位错误信息。',
      routing: '状态变更不离开列表；后续可扩展跳转用户详情（本期无）。',
    },
  },
  {
    id: 5,
    module: '列表操作',
    feature: '授信',
    pageLocation: '操作列「授信」按钮',
    prd: {
      functionalLogic:
        '授信按钮：替代原「x币上下分」，对一级未授信代理发起信用方案配置与账密生成。',
      interactiveBehavior:
        '点击「授信」-> 打开「代理授信」弹框；仅 agentLevel=1 且 isCreditAgent=false 时可见该按钮。',
      visualPresentation:
        '主色描边按钮「授信」（wf-btn--credit）；旁侧「注5」标注；与「编辑」「禁用」以竖线分隔。',
      dataRules: '展示条件：一级代理 + 未授信；已授信或非一级不渲染按钮。',
      exceptions: '不满足授信条件 -> 不展示入口，防止误操作；接口失败时保留弹框数据并提示（联调期）。',
      routing: '授信成功 -> 关闭弹框，列表行更新 isCreditAgent、信用账密及「信」标识。',
    },
  },
  {
    id: 6,
    module: '授信弹框',
    feature: '授信流程',
    pageLocation: '代理授信弹框',
    prd: {
      functionalLogic:
        '代理授信弹框：收集一级代理信用游戏占成、信用P2P返利占成和信用游戏退水方案，提交后生成信用账密（与现金一致）。',
      interactiveBehavior:
        '打开弹框 -> 顶部信息表只读展示；直接显示「信用游戏占成」「信用P2P返利占成」「信用游戏退水」配置区（无 Tab）；点击「确认授信」校验通过后提交并关闭。',
      visualPresentation:
        '标题「代理授信」；弹框 max-height 70vh，仅 body 内滚动；标题旁侧「注6」标注；顶部信息表不含「X币余额」列；底部「取消」「确认授信」。',
      dataRules:
        '占成/退水根据数据源的品类数量必填有效数值；信用账密提交后 = 现金账密；原信息表「X币余额」已去除——授信与上分流程区分开，本弹框只做授信，X 币上下分走独立流程。',
      exceptions:
        '校验未通过 -> 字段标红 + 底部提示「请修正比例后再提交」，主按钮禁用；点击遮罩/×/取消 -> 放弃修改并关闭。',
      routing: '确认授信成功 -> 关闭弹框，刷新列表对应行；失败保留表单。',
    },
  },
  {
    id: 7,
    module: '授信弹框',
    feature: '编辑流程与 Tab',
    pageLocation: '编辑代理弹框 · Tab 区',
    prd: {
      functionalLogic:
        '编辑弹框：维护已存在代理的现金/信用两套占成退水方案；Tab 切换不同账密类型配置。',
      interactiveBehavior:
        '点击「编辑」-> 打开「编辑代理」弹框；已授信且账密存在 -> 展示「现金」「信用」Tab，默认激活「信用」；未授信 -> 仅现金配置区。',
      visualPresentation:
        'Tab 条「现金 | 信用」；「信用」Tab 按钮外侧附「注7」标注；切换 Tab 切换下方占成/退水表单内容。',
      dataRules: '信用 Tab 展示条件：isCreditAgent=true 且信用账密非空；各 Tab 独立维护产品数组。',
      exceptions: '未授信代理编辑 -> 不展示 Tab，等同仅编辑现金方案。',
      routing: '保存成功 -> 关闭弹框；取消/关闭 -> 不保存。',
    },
  },
  {
    id: 8,
    module: '授信弹框',
    feature: '占成比例',
    pageLocation: '弹框 · 占成配置区',
    prd: {
      functionalLogic:
        '占成配置区：按游戏品类设置代理占成比例，授信时为「信用游戏占成」，编辑时区分「现金游戏占成」「信用游戏占成」。',
      interactiveBehavior:
        '输入占成数值 -> 实时校验；失焦/提交时标红错误文案；合法时清除错误。',
      visualPresentation:
        '品类网格布局；每行输入框 +「%」后缀；下方灰色区间提示「区间 0~x%」；占成区标题旁侧「注8」标注；错误红色文案。',
      dataRules:
        '正则 ^\\d+(\\.\\d{1,2})?$；区间 [0, maxShare]，maxShare 为上级该品类最大值；品类含棋牌、趣投、电竞、捕鱼、刮刮乐、热门类、体育、真人、彩票、弹珠、老虎机，另含「其他成本」（规则同游戏品类，仅占成区展示）。',
      exceptions: '超区间/格式错误 -> 字段下红色提示 + 提交按钮禁用；空值视为校验失败。',
      routing: '配置数据随授信/编辑接口一并提交，无独立跳转。',
    },
  },
  {
    id: 9,
    module: '授信弹框',
    feature: '退水（赚水→退水）',
    pageLocation: '弹框 · 退水配置区',
    prd: {
      functionalLogic:
        '退水配置区按大类和产品两级设置向下级返还的退水。大类用 0～100 的滑块，按各产品自己的退水上限按比例带出；产品仍可单独改。授信为「信用游戏退水」，编辑区分「现金游戏退水」「信用游戏退水」。',
      interactiveBehavior:
        '拖动大类滑块后，该大类下每个产品退水改为「该产品上限 × 滑块百分比」，保留两位小数。之后改某个产品输入框，只改这一条，不再回写滑块。点击「注9」可看滑块和产品区间。',
      visualPresentation:
        '标题「现金游戏退水」或「信用游戏退水」，标题旁「注9」。每个大类一行：名称、0～100 滑块、当前百分比。下面是产品输入框，下方灰色文案是该产品的具体区间，如「区间 0-0.15%」。超限时字段下红色文案。',
      dataRules:
        '大类滑块为 0～100 的整数。产品为非负数字，最多两位小数，区间是该产品自己的退水上限，如 IM棋牌 0～0.15%、CDN棋牌 0～0.12%。滑块 100 时产品取满上限；滑块 50 时 IM棋牌为 0.08%、CDN棋牌为 0.06%。',
      exceptions:
        '产品为空、格式不对或超过自己的上限时，字段下红色提示，保存按钮禁用，弹框不关闭。滑块只能停在 0～100。',
      routing: '随弹框保存提交；无独立页面。',
    },
  },
  {
    id: 10,
    module: '列表操作',
    feature: '编辑 / 禁用·启用',
    pageLocation: '操作列',
    prd: {
      functionalLogic:
        '编辑：打开编辑弹框维护方案；禁用/启用：切换代理可用状态，控制下游是否可正常使用。',
      interactiveBehavior:
        '点击「编辑」-> 编辑弹框；点击「禁用」/「启用」-> 即时切换行内状态标签（原型本地切换）。',
      visualPresentation: '「编辑」为蓝色文字链；「禁用」为红色文字链，已禁用时文案变为「启用」；表头操作列旁侧「注10」标注。',
      dataRules: '所有等级代理均可编辑；禁用状态 boolean 取反切换。',
      exceptions: '禁用代理仍可被搜索到，状态列展示「禁用」；接口失败应回滚状态（联调期）。',
      routing: '编辑 -> 弹框内完成；禁用无跳转。',
    },
  },
  {
    id: 11,
    module: '授信弹框',
    feature: 'P2P返利占成',
    pageLocation: '弹框 · 占成区下方',
    prd: {
      functionalLogic:
        '现金游戏占成下方为「现金P2P返利占成」，信用游戏占成和授信下方为「信用P2P返利占成」。细项为社区棋牌、金刚体育。现金与信用各存一套，不进入游戏退水区。',
      interactiveBehavior:
        '编辑现金 Tab、信用 Tab，以及授信弹框都会展示，标题随当前方案切换。切换现金/信用时带出各自已填的比例。输入后实时校验；格式或区间不合法时字段下红色提示，保存按钮禁用。',
      visualPresentation:
        '现金方案标题「现金P2P返利占成」，信用方案和授信标题「信用P2P返利占成」，标题旁「注11」，紧挨在当前游戏占成下面。品类网格与游戏占成相同：输入框 +「%」，下方灰色「区间 0-10%」。',
      dataRules:
        '社区棋牌、金刚体育默认 0。现金、信用各自独立。校验与对应游戏占成一致：非负数字，最多两位小数，区间 0～10（上级该品类最大值）。',
      exceptions: '超区间、格式错误或为空时字段下红色提示，保存按钮禁用，弹框不关闭。',
      routing: '随编辑弹框保存提交；无独立页面。',
    },
  },
]

/** 页面「注」标记编号 · 与 SHARE_AGENT_CONFIG_FEATURE_LIST.id 一一对应 */
export const SHARE_AGENT_SPEC_ANNOT_NO = {
  filterAgentLevel: 1,
  filterCreditAgent: 2,
  creditBadge: 3,
  creditCredentials: 4,
  grantAction: 5,
  grantFlow: 6,
  creditTab: 7,
  share: 8,
  rebate: 9,
  rowActions: 10,
  p2p: 11,
} as const

/** 页面标注文案 · 供 WfSpecAnnot 组件引用 */
export const SHARE_AGENT_SHARE_SPEC = [
  '区块标题由「比例」调整为「占成比例」；授信时为「信用游戏占成」，编辑时区分「现金游戏占成」「信用游戏占成」。',
  '各游戏类型与「其他成本」占成比例校验区间均为 0 ~ x，x 为上级代理该品类的 maxShare 最大值。',
  '输入须匹配非负数字，最多两位小数；超出区间或格式不符时标红提示。「其他成本」仅出现在占成区，退水区不展示。',
] as const

export const SHARE_AGENT_P2P_SPEC = [
  '现金方案标题为「现金P2P返利占成」，信用方案和授信标题为「信用P2P返利占成」。现金与信用各存一套。',
  '细项为社区棋牌、金刚体育。输入、百分号和区间提示与当前游戏占成一致，区间 0～10%。',
  '须为非负数字，最多两位小数；超出区间或格式不符时标红，保存按钮禁用。',
] as const

export const SHARE_AGENT_REBATE_SPEC = [
  '退水按大类和产品设置。大类是 0～100 的滑块，产品是各自的具体退水。',
  '拖动滑块后，每个产品退水按自己的上限乘以这个百分比。滑到 100，产品取满上限。',
  '产品区间写成具体值，例如「区间 0-0.15%」。可以再单独改，最多两位小数。',
] as const

export const SHARE_AGENT_CREDIT_TAB_SPEC = [
  '授信：仅新增信用方案，不展示 Tab，直接配置「信用游戏占成 / 信用P2P返利占成 / 信用游戏退水」；完成后列表代理级别展示「信」标识。',
  '授信成功后，信用代理账密与现金代理账密一致，并在信息表中展示相同账号与密码。',
  '编辑：已授信代理打开弹框时展示「现金 / 信用」Tab，分别配置现金游戏占成、现金P2P返利占成、现金游戏退水，以及信用游戏占成、信用P2P返利占成、信用游戏退水。',
] as const

export const SHARE_AGENT_GRANT_ACTION_SPEC = [
  '一级代理操作列调整：原「x币上下分」入口改为「授信」。',
  '后台仅支持对一级代理执行授信操作。',
  '非一级代理或已授信代理不展示「授信」入口。',
  '一级代理首次授信完成后，代理级别旁展示「信」标识，并生成信用代理账密。',
] as const

export const SHARE_AGENT_CREDIT_BADGE_SPEC = [
  '若该代理已是信用代理（已完成授信且信用 ID / 信用代理账密已存在），在代理级别文字旁展示蓝色「信」标识。',
  '未授信代理仅显示「N级代理」，不展示「信」。',
  '标识与列表「信用代理账号」「信用代理密码」列数据一致：有账密则有「信」。',
] as const

export const SHARE_AGENT_FILTER_AGENT_LEVEL_SPEC = [
  '查询条件新增：按代理等级筛选，可选 1～10 级代理。',
  '不选时默认查询全部等级。',
] as const

export const SHARE_AGENT_FILTER_CREDIT_AGENT_SPEC = [
  '查询条件新增：按是否信用代理筛选。',
  '「是」：已完成授信且信用代理账密已存在；「否」：未授信代理。',
] as const

export const SHARE_AGENT_CREDIT_CREDENTIALS_SPEC = [
  '信用代理账号/密码列展示授信后的登录凭证，未授信统一显示「-」。',
  '状态列展示绿色「启用」或灰色「禁用」，通过操作列切换后即时刷新。',
] as const

export const SHARE_AGENT_GRANT_FLOW_SPEC = [
  '一级未授信代理点击「授信」打开本弹框，直接配置信用游戏占成、信用P2P返利占成和信用游戏退水（无 Tab）。',
  '顶部信息表只读展示：用户名、用户ID、金刚号、现金代理账密、信用代理账密；确认授信后生成信用账密并与现金账密一致。',
  '原「X币余额」已从表中去除：授信与上分流程已拆分，本弹框仅完成授信配置，不再展示或处理 X 币余额/上下分。',
] as const

export const SHARE_AGENT_ROW_ACTIONS_SPEC = [
  '「编辑」打开编辑弹框维护现金/信用方案；「禁用」/「启用」切换代理可用状态。',
  '所有等级均可编辑；禁用后状态列仍展示「禁用」，代理记录保留在列表中。',
] as const
