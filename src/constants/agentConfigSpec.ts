/** 占成代理配置（现金）/ 信用代理配置 · 共用 PRD 构造（六大核心维度） */

import { PRD_DIMENSION_LABELS, type PcPrdFeatureRow } from './pcPrdSpec'

export { PRD_DIMENSION_LABELS }

export type AgentConfigLedger = 'cash' | 'credit'

export type AgentConfigAnnot = {
  no: number
  title: string
  items: readonly string[]
}

export type AgentConfigSpecBundle = {
  meta: { title: string; module: string; updatedAt: string; prdVersion: string }
  routeName: string
  background: readonly string[]
  goals: readonly string[]
  featureList: PcPrdFeatureRow[]
  annotNo: {
    filterAgentLevel: number
    credentials: number
    rowActions: number
    share: number
    p2p: number
    rebate: number
    create: number
  }
  annot: {
    filterAgentLevel: AgentConfigAnnot
    credentials: AgentConfigAnnot
    rowActions: AgentConfigAnnot
    share: AgentConfigAnnot
    p2p: AgentConfigAnnot
    rebate: AgentConfigAnnot
    create: AgentConfigAnnot
  }
}

const ANNOT_NO = {
  filterAgentLevel: 1,
  credentials: 2,
  rowActions: 3,
  share: 4,
  p2p: 5,
  rebate: 6,
  create: 7,
} as const

/** 区块标题：按页面所属体系固定为现金或信用 */
export function getAgentConfigLabels(ledger: AgentConfigLedger) {
  const prefix = ledger === 'credit' ? '信用' : '现金'
  return {
    prefix,
    pageTitle: ledger === 'credit' ? '信用代理配置' : '占成代理配置',
    agentName: ledger === 'credit' ? '信用代理' : '现金占成代理',
    account: `${prefix}代理账号`,
    password: `${prefix}代理密码`,
    credentials: `${prefix}代理账密`,
    share: `${prefix}游戏占成`,
    p2p: `${prefix}P2P返利占成`,
    rebate: `${prefix}游戏退水`,
  }
}

function buildAgentConfigSpec(ledger: AgentConfigLedger): AgentConfigSpecBundle {
  const L = getAgentConfigLabels(ledger)
  const other = ledger === 'credit' ? '占成代理配置（现金）' : '信用代理配置'

  const background = [
    `代理中心按现金 / 信用分包，底层身份已区分；后台对应拆为「占成代理配置（现金）」与「信用代理配置」两个独立页面，互不展示对方数据。`,
    `本页只维护${L.agentName}：${L.credentials}、${L.share}、${L.p2p}、${L.rebate}；${other}的账号与方案在对应页面维护。`,
    ledger === 'credit'
      ? '信用额度上下分不在本页处理，统一走「信用额度记录」页。'
      : '本页不涉及信用额度、信用账密与信用方案。',
    '占成、退水沿用「退水」口径，后台填写值为向下级返还的退水比例。',
  ]

  const goals = [
    `提供${L.agentName}列表查询（代理等级筛选）与启用 / 禁用状态管理。`,
    `支持按用户ID查询平台用户并新增为一级${L.agentName}，同时配置${L.prefix}方案并生成${L.credentials}。`,
    `编辑弹框维护单套${L.prefix}方案：${L.share}、${L.p2p}、${L.rebate}，页面内无现金 / 信用切换。`,
    '占成、P2P返利占成、退水均校验 0～x 区间（x 为上级最大值）。',
  ]

  const featureList: PcPrdFeatureRow[] = [
    {
      id: ANNOT_NO.filterAgentLevel,
      module: '列表筛选',
      feature: '代理等级',
      pageLocation: '筛选区「代理等级」',
      prd: {
        functionalLogic: `代理等级下拉：按代理层级过滤${L.agentName}列表，缩小运营检索范围。`,
        interactiveBehavior:
          '选择 1～10 级代理后点击「搜索」-> 列表仅展示对应等级；点击「清除」-> 用户ID、上级代理ID、代理等级全部重置并恢复全量展示。',
        visualPresentation: '标签「代理等级：」+ 下拉框，默认「请选择」；旁侧「注1」标注。',
        dataRules: '非必填；选项值 1～10 对应「N级代理」；空值表示不过滤等级。',
        exceptions: '无匹配数据 -> 表格展示「暂无数据」空状态，不报错。',
        routing: '筛选结果停留当前列表页，不跳转。',
      },
    },
    {
      id: ANNOT_NO.credentials,
      module: '列表展示',
      feature: `${L.credentials}与状态`,
      pageLocation: `列表列「${L.account}」「${L.password}」「状态」`,
      prd: {
        functionalLogic: `${L.account} / ${L.password}列：展示该代理在${L.prefix}代理中心的登录凭证；状态列展示启用 / 禁用。`,
        interactiveBehavior: '列表只读展示；通过操作列「禁用」/「启用」切换后即时刷新状态标签，并以全局顶部提示反馈。',
        visualPresentation: `表头「${L.account}」旁侧「注2」标注；账密为空显示「-」；状态为绿色「启用」或灰色「禁用」标签（wf-status-badge）。`,
        dataRules: `账密明文展示（后台场景）；本页只出现${L.prefix}账密列，不展示${ledger === 'credit' ? '现金' : '信用'}账密；状态字段 disabled：true=禁用，false=启用。`,
        exceptions: '账密为空 -> 统一显示「-」，不展示错误信息。',
        routing: '状态变更不离开列表；本期无跳转用户详情。',
      },
    },
    {
      id: ANNOT_NO.rowActions,
      module: '列表操作',
      feature: '编辑 / 禁用·启用',
      pageLocation: '操作列',
      prd: {
        functionalLogic: `编辑：打开「编辑代理」弹框维护${L.prefix}方案；禁用 / 启用：切换代理可用状态，控制${L.prefix}代理中心是否可正常登录使用。`,
        interactiveBehavior:
          '点击「编辑」-> 打开编辑弹框；点击「禁用」/「启用」-> 即时切换行内状态标签，全局顶部提示「已禁用该代理」/「已启用该代理」。',
        visualPresentation: '「编辑」为蓝色文字链；「禁用」为红色文字链，已禁用时文案变为「启用」；表头操作列旁侧「注3」标注；操作列仅这两项。',
        dataRules: '所有等级代理均可编辑；禁用状态 boolean 取反切换。',
        exceptions: '禁用代理仍可被搜索到，状态列展示「禁用」；接口失败应回滚状态并以全局顶部提示报错（联调期）。',
        routing: '编辑 -> 弹框内完成；禁用无跳转。',
      },
    },
    {
      id: ANNOT_NO.share,
      module: '编辑弹框',
      feature: L.share,
      pageLocation: `编辑代理弹框 ·「${L.share}」区`,
      prd: {
        functionalLogic: `「${L.share}」区按游戏品类设置代理占成比例；弹框顶部信息表只读展示用户名、用户ID、金刚号、${L.credentials}。`,
        interactiveBehavior: '输入占成数值 -> 实时校验；不合法时字段下标红错误文案，「保存」禁用；合法后点击「保存」关闭弹框并全局顶部提示「已保存代理配置」。',
        visualPresentation: `弹框标题「编辑代理」，max-height 70vh，仅 body 内滚动；区块标题「${L.share}」旁侧「注4」；品类网格 + 输入框「%」后缀 + 灰色「区间 0-x%」。`,
        dataRules:
          '正则 ^\\d+(\\.\\d{1,2})?$；区间 [0, maxShare]，maxShare 为上级该品类最大值；品类含棋牌、趣投、电竞、捕鱼、刮刮乐、热门类、体育、真人、彩票、弹珠、老虎机，另含「其他成本」（仅占成区展示）。',
        exceptions: '超区间 / 格式错误 / 为空 -> 字段下红色提示 + 「保存」禁用；点击遮罩 / × / 取消 -> 放弃修改并关闭。',
        routing: '随编辑弹框保存提交，无独立跳转。',
      },
    },
    {
      id: ANNOT_NO.p2p,
      module: '编辑弹框',
      feature: L.p2p,
      pageLocation: `编辑代理弹框 ·「${L.share}」区下方`,
      prd: {
        functionalLogic: `「${L.p2p}」紧挨在${L.share}下方，细项为社区棋牌、金刚体育；不进入游戏退水区。`,
        interactiveBehavior: '输入后实时校验；格式或区间不合法时字段下红色提示，「保存」禁用。',
        visualPresentation: `标题「${L.p2p}」，旁侧「注5」；品类网格与游戏占成相同：输入框 +「%」，下方灰色「区间 0-10%」。`,
        dataRules: '社区棋牌、金刚体育默认 0；非负数字，最多两位小数，区间 0～10（上级该品类最大值）。',
        exceptions: '超区间、格式错误或为空时字段下红色提示，「保存」禁用，弹框不关闭。',
        routing: '随编辑弹框保存提交；无独立页面。',
      },
    },
    {
      id: ANNOT_NO.rebate,
      module: '编辑弹框',
      feature: L.rebate,
      pageLocation: `编辑代理弹框 ·「${L.rebate}」区`,
      prd: {
        functionalLogic: `「${L.rebate}」按大类和产品两级设置向下级返还的退水。大类用 0～100 的滑块，按各产品自己的退水上限按比例带出；产品仍可单独改。`,
        interactiveBehavior:
          '拖动大类滑块后，该大类下每个产品退水改为「该产品上限 × 滑块百分比」，保留两位小数；之后改某个产品输入框只改这一条，不回写滑块。',
        visualPresentation: `标题「${L.rebate}」旁侧「注6」。每个大类一行：名称、0～100 滑块、当前百分比；下面是产品输入框与灰色区间文案（如「区间 0-0.15%」）；超限时字段下红色文案。`,
        dataRules:
          '大类滑块为 0～100 的整数；产品为非负数字，最多两位小数，区间是该产品自己的退水上限（如 IM棋牌 0～0.15%）。滑块 100 时产品取满上限。',
        exceptions: '产品为空、格式不对或超过上限时字段下红色提示，「保存」禁用，弹框不关闭。',
        routing: '随弹框保存提交；无独立页面。',
      },
    },
    {
      id: ANNOT_NO.create,
      module: '列表操作',
      feature: `新增一级${L.agentName}`,
      pageLocation: '工具栏「新增」按钮 · 新增代理弹框',
      prd: {
        functionalLogic: `后台直接把平台用户新增为一级${L.agentName}（上级为平台）：查询确认用户 → 配置${L.share} / ${L.p2p} / ${L.rebate} → 确定后生成${L.credentials}并写入列表。`,
        interactiveBehavior:
          '点击「新增」打开「新增代理」弹框；输入用户ID点「查询」（或回车）→ 命中后展示用户名、用户ID、金刚号，下方出现比例配置区；点「确定」校验通过后关闭弹框、列表顶部追加该代理，全局顶部提示「已新增一级代理，账密已生成」。重新输入用户ID会清空已查询结果，需再次查询。',
        visualPresentation: `「新增」为工具栏绿色新增按钮（wf-btn--add），位于「搜索」「清除」右侧，旁侧「注7」。弹框标题「新增代理」，顶部为用户ID输入框 + 蓝色「查询」；查询前不展示比例区，「确定」禁用；查询后信息表「${L.credentials}」列显示「提交后生成」。`,
        dataRules: `用户ID精准匹配、去首尾空格；新增后代理级别固定「1级代理」、上级代理「平台」、上级代理ID「0」、状态「启用」；${L.credentials}由系统生成（原型 8 位随机字符）。比例规则同注4～注6。`,
        exceptions:
          `用户ID为空 → 弹框底部 hint「请输入用户ID」；查无此人 → 「未查询到该用户，请核对用户ID」；该用户已在本页列表 → 「该用户已是${L.agentName}，无需重复新增」；比例不合法 → 字段标红、「确定」禁用。以上均不关闭弹框。`,
        routing: '确定 → 关闭弹框并停留列表（新代理排在首行）；取消 / × / 遮罩 → 放弃并关闭。',
      },
    },
  ]

  return {
    meta: { title: L.pageTitle, module: '推广返利', updatedAt: '2026-11-03', prdVersion: 'v2.0' },
    routeName: ledger === 'credit' ? 'pc-credit-agent-config' : 'pc-share-agent-config',
    background,
    goals,
    featureList,
    annotNo: { ...ANNOT_NO },
    annot: {
      filterAgentLevel: {
        no: ANNOT_NO.filterAgentLevel,
        title: '代理等级',
        items: ['按代理等级筛选，可选 1～10 级代理。', '不选时默认查询全部等级。'],
      },
      credentials: {
        no: ANNOT_NO.credentials,
        title: `${L.credentials}与状态`,
        items: [
          `只展示${L.prefix}代理中心的登录账号与密码，为空显示「-」。`,
          '状态列为绿色「启用」或灰色「禁用」，操作列切换后即时刷新。',
        ],
      },
      rowActions: {
        no: ANNOT_NO.rowActions,
        title: '编辑 / 禁用·启用',
        items: [
          `「编辑」打开弹框维护${L.prefix}方案；「禁用」/「启用」切换代理可用状态，并全局顶部提示。`,
          '所有等级均可编辑；禁用后代理仍保留在列表中。',
        ],
      },
      share: {
        no: ANNOT_NO.share,
        title: L.share,
        items: [
          '各游戏类型与「其他成本」占成区间均为 0 ~ x，x 为上级代理该品类最大值。',
          '须为非负数字，最多两位小数；超出区间或格式不符时标红，「保存」禁用。',
        ],
      },
      p2p: {
        no: ANNOT_NO.p2p,
        title: L.p2p,
        items: [
          `紧挨在${L.share}下方，细项为社区棋牌、金刚体育，区间 0～10%。`,
          '须为非负数字，最多两位小数；超出区间或格式不符时标红，「保存」禁用。',
        ],
      },
      rebate: {
        no: ANNOT_NO.rebate,
        title: L.rebate,
        items: [
          '退水按大类和产品设置。大类是 0～100 的滑块，产品是各自的具体退水。',
          '拖动滑块后，每个产品退水按自己的上限乘以这个百分比；滑到 100，产品取满上限。',
          '产品区间写成具体值，例如「区间 0-0.15%」，可再单独改，最多两位小数。',
        ],
      },
      create: {
        no: ANNOT_NO.create,
        title: `新增一级${L.agentName}`,
        items: [
          `输入用户ID精准查询，确认用户后配置${L.share}、${L.p2p}、${L.rebate}。`,
          `确定后新增为 1 级代理（上级为平台），生成${L.credentials}，并全局顶部提示。`,
          `用户ID为空、查无此人或已是${L.agentName}时，弹框底部提示且不关闭。`,
        ],
      },
    },
  }
}

export const SHARE_AGENT_CONFIG_SPEC_BUNDLE = buildAgentConfigSpec('cash')
export const CREDIT_AGENT_CONFIG_SPEC_BUNDLE = buildAgentConfigSpec('credit')

export function getAgentConfigSpec(ledger: AgentConfigLedger) {
  return ledger === 'credit' ? CREDIT_AGENT_CONFIG_SPEC_BUNDLE : SHARE_AGENT_CONFIG_SPEC_BUNDLE
}
