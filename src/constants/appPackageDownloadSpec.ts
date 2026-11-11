/** App 包下载配置 · PRD
 * 与页面「注1～注7」一一对应；不含【文档说明】入口。
 */

import type { PcPrdFeatureRow } from './pcPrdSpec'

export const APP_PACKAGE_DOWNLOAD_META = {
  title: 'App包下载配置',
  module: '配置管理',
  updatedAt: '2026-11-11',
  prdVersion: 'v1.2',
} as const

export const APP_PACKAGE_DOWNLOAD_BACKGROUND = [
  '平台同时维护 iOS、Android、Windows、Mac 上的超签包、纯聊包和上架包，推广、合规和发版需要各自独立的下载与更新地址。',
  '超签包走企业签或超级签，iOS 可用安装页或 itms-services:// 地址触发安装；上架包分别指向 App Store、Google Play、国内应用商店、Microsoft Store 或 Mac App Store；纯聊包用于 IM 渠道，地址可以是 H5、APK、IPA，桌面端为 EXE / MSI / DMG / PKG。',
  '运营、财务和技术要在同一页更新链接、发布版本、停用包，并追溯历史地址。',
] as const

export const APP_PACKAGE_DOWNLOAD_GOALS = [
  '在配置管理中集中维护各终端、各分类 App 包的下载配置。',
  '列表按「终端 × 包分类」固定 9 个包位，每个包位只有一条当前配置；在行内新增版本覆盖当前，旧版本进入历史。',
  '每个包位只维护一个下载链接（iOS 超签包可直接填 itms-services:// 安装地址）；停用需确认；可从历史版本回滚。',
  '本配置供 PC 与 H5 网页版跳转 App 下载，始终下载当前最新版本，不区分弱更新 / 强更新。',
] as const

export const APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO = {
  filter: 1,
  slots: 2,
  form: 3,
  download: 4,
  status: 5,
  history: 6,
  rowActions: 7,
} as const

export const APP_PACKAGE_DOWNLOAD_FEATURE_LIST: PcPrdFeatureRow[] = [
  {
    id: 1,
    module: '列表筛选',
    feature: '组合查询',
    pageLocation: '筛选区「终端」旁「注1」',
    prd: {
      functionalLogic: '按终端、包分类、状态和关键字过滤当前下载配置，方便定位某一条线上包。',
      interactiveBehavior:
        '选择终端、包分类、状态，或输入应用名称、版本号、下载链接后点「搜索」生效。点「清除」恢复全部。关键字为模糊匹配。',
      visualPresentation: '筛选条依次为终端、包分类、状态、应用搜索；「终端」旁「注1」。无结果时表格空态「暂无符合条件的下载配置」。',
      dataRules:
        '终端：全部 / iOS / Android / Windows / Mac。包分类：全部 / 超签包 / 纯聊包 / 上架包。状态：全部 / 启用 / 禁用 / 未配置。关键字匹配应用名称、版本号、下载链接，不区分大小写。',
      exceptions: '组合条件无命中时保留已填条件，不关闭页面。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 2,
    module: '配置列表',
    feature: '固定包位',
    pageLocation: '表头「终端 / 包分类」旁「注2」',
    prd: {
      functionalLogic: '列表固定展示全部包位，不再从工具栏新增行；运营直接在对应包位上新增版本、编辑或删除，避免同一终端同一分类出现多条配置。',
      interactiveBehavior:
        '进入页面即展示 9 个包位。已配置的包位回显应用名称、版本号、下载链接、状态与更新人；未配置的包位显示「未配置」，可直接点操作列「新增」。',
      visualPresentation: '首列为终端标签 + 包分类标签，表头旁「注2」。未配置行浅灰底，其余列显示「—」。底部显示「共 N 条（已配置 M 条）」。',
      dataRules:
        '包位固定为：iOS 超签包、iOS 纯聊包、iOS 上架包、Android 纯聊包、Android 上架包、Windows 纯聊包、Windows 上架包、Mac 纯聊包、Mac 上架包。超签包只适用于 iOS，其他终端不设超签包位。包位的终端与包分类不可修改。',
      exceptions: '筛选无命中时表格空态「暂无符合条件的下载配置」。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 3,
    module: '发布弹框',
    feature: '配置表单',
    pageLocation: '弹框标题旁「注3」',
    prd: {
      functionalLogic:
        '新增时维护包名称、版本、下载链接、更新日志、启用状态和内部备注；编辑时只能改包名称、更新日志、状态、备注。终端与包分类由所在包位决定，只读展示。不设更新模式：PC / H5 网页版跳转下载永远取当前最新版本，没有强更的说法。下载链接只有一个，iOS 超签包不再单独维护 Plist 链接。',
      interactiveBehavior:
        '从行内「新增」打开时标题为「新增版本」，回填包名称与备注，版本号、链接、更新日志留空；已配置的包位确认后替换当前版本，旧版本写入历史，顶部提示「已新增 vX.Y.Z」。从「编辑」打开时回填全部字段，版本号、下载链接置灰不可改，只保存包名称、更新日志、状态、备注，不写历史，顶部提示「保存成功」；如需换包须走「新增」。iOS 超签包位的下载链接下方提示可填 itms-services:// 安装地址。',
      visualPresentation:
        '弹框标题「新增版本」或「编辑下载配置」，标题旁「注3」。顶部只读展示终端 + 包分类标签及「固定包位，不可修改」。版本号下方灰字说明替换与唯一规则；编辑时版本号、下载链接为灰底禁用输入框且不显示必填星号。必填项带红色星号。校验失败在弹框底部红色 hint。',
      dataRules:
        '应用名称必填，最多 100 字。版本号为 X.Y.Z，同一包位内当前版本与历史版本号唯一：新增时不能与当前、历史相同；编辑不可改版本号。下载链接只有一个，须为 http(s)；iOS 超签包另允许 itms-services:// 安装地址。iOS 上架须为 App Store 域名；Android 上架须为 Google Play、华为、应用宝或小米商店；Windows 上架须为 Microsoft Store；Mac 上架须为 Mac App Store（apps.apple.com）。纯聊包：iOS 不接受 APK，Android 不接受 IPA，Windows 不接受 APK / IPA / DMG / PKG，Mac 不接受 APK / IPA / EXE / MSI。更新日志选填，作为下载页版本说明。备注最多 255 字。状态默认启用。',
      exceptions: '新增时版本号与当前相同提示「vX.Y.Z 为当前版本，版本号不能重复」；与历史相同提示「vX.Y.Z 已在历史版本中，版本号不能重复」。链接格式不对提示「下载链接须以 http:// 或 https:// 开头（iOS 超签包另可用 itms-services://）」。校验失败不关闭弹框。',
      routing: '取消或关闭不保存。保存后回到列表。',
    },
  },
  {
    id: 4,
    module: '配置列表',
    feature: '下载链接复制',
    pageLocation: '表头「下载链接」旁「注4」',
    prd: {
      functionalLogic: '在列表里核对当前生效的下载地址，并复制给投放或技术同事。',
      interactiveBehavior: '点击「复制」写入剪贴板，全局顶部提示「已复制下载链接」。',
      visualPresentation: '单元格内完整折行展示链接，右侧文字链「复制」。表头旁「注4」。',
      dataRules: '复制内容为当前行 download_url 全文。',
      exceptions: '浏览器拒绝剪贴板时，顶部错误提示「复制失败，请手动选择链接」。',
      routing: '不跳转。',
    },
  },
  {
    id: 5,
    module: '配置列表',
    feature: '启用 / 禁用',
    pageLocation: '表头「状态」旁「注5」',
    prd: {
      functionalLogic: '启用后 PC / H5 网页版按该包位跳转下载；禁用后该包下线。关闭开关后才能删除该包位配置。',
      interactiveBehavior:
        '关闭开关时弹出确认：「确定要停用此包吗？这可能导致正在下载的用户中断。」确认后禁用，顶部提示「已停用该包」。打开开关直接启用并提示「已启用该包」。',
      visualPresentation: '状态列为开关；未配置包位显示「—」。表头旁「注5」。确认框标题「停用下载配置」。',
      dataRules: 'status=enabled 为启用，disabled 为禁用。操作人与更新时间改为当前账号和保存时间。',
      exceptions: '取消确认不改变开关。',
      routing: '不跳转，列表原地更新。',
    },
  },
  {
    id: 6,
    module: '配置列表',
    feature: '历史版本与回滚',
    pageLocation: '表头「历史版本」旁「注6」',
    prd: {
      functionalLogic: '追溯该配置每次覆盖前的版本号、下载链接、更新日志、操作人和时间，并允许回滚到其中一条。',
      interactiveBehavior:
        '点击「查看历史」打开历史列表，顶部显示当前下载版本（已删除的包位显示「未配置」）。弹框内可按版本号、更新日志模糊查询，点「搜索」或回车生效，「清除」恢复全部；列表每页 5 条，底部「共 N 条」+ 上一页 / 页码 / 下一页。点击「回滚至此版本」后确认，当前配置写入历史，选中记录成为当前启用版本：列表与弹框顶部的版本号、下载链接、更新日志均改为该历史版本，顶部提示「已回滚至 vX.Y.Z」。未配置包位回滚后恢复为已配置并启用。',
      visualPresentation: '有历史时为蓝色「查看历史」，无历史时灰色「暂无」。表头旁「注6」。历史弹框依次为当前下载版本、查询条（版本号、更新日志、搜索、清除）、历史表格、分页。',
      dataRules:
        '行内新增版本、删除、回滚会把变更前快照写入历史；编辑只改名称、更新日志、状态、备注，不写历史。历史按时间倒序。查询：版本号忽略前缀 v、包含匹配；更新日志包含匹配，不区分大小写；两项同时填写取交集。每页 5 条，每次查询回到第 1 页，打开弹框时清空查询条件。原型用这份历史承担变更前/后链接的追溯，不另开操作日志页。',
      exceptions: '无历史时表格空态「暂无历史版本」；查询无命中显示「暂无符合条件的历史版本」且不显示分页。取消确认不改当前配置。',
      routing: '回滚后留在历史弹框，列表同步刷新。',
    },
  },
  {
    id: 7,
    module: '配置列表',
    feature: '新增 / 编辑 / 删除',
    pageLocation: '表头「操作」旁「注7」',
    prd: {
      functionalLogic: '每个包位行内提供新增版本、编辑当前配置、删除当前配置三个操作，替代原工具栏「新增下载配置」。',
      interactiveBehavior:
        '「新增」打开「新增版本」弹框，保存后该行回显新版本。「编辑」打开弹框回填当前值，只能改包名称、更新日志、状态、备注，保存提示「保存成功」。「删除」仅在开关关闭时可点，确认后当前版本写入历史、该行恢复「未配置」，提示「已删除」。',
      visualPresentation: '操作列依次为「新增 | 编辑 | 删除」，删除为红色文字链，不可用时灰色。表头旁「注7」。',
      dataRules: '新增：版本号不能与当前、历史相同。编辑：版本号、下载链接不可改，只校验名称与备注长度。删除：须已配置且 status=disabled。',
      exceptions: '未配置包位「编辑」「删除」置灰，悬停「该包位未配置，请先新增」/「该包位未配置」。开关开启时删除置灰，悬停「请先关闭开关再删除」。取消确认不改数据。',
      routing: '新增、编辑、删除后停留列表。',
    },
  },
]

export const APP_PACKAGE_DOWNLOAD_FILTER_SPEC = [
  '终端、包分类、状态可组合，点「搜索」后生效。',
  '应用搜索模糊匹配名称、版本号和下载链接。',
  '点「清除」恢复全部配置。',
] as const

export const APP_PACKAGE_DOWNLOAD_SLOTS_SPEC = [
  '按「终端 × 包分类」固定 9 个包位，超签包只适用于 iOS。',
  '已配置包位回显当前版本、链接、状态；未配置显示「未配置」。',
  '不在工具栏新增，统一在行内操作列「新增」。',
] as const

export const APP_PACKAGE_DOWNLOAD_FORM_SPEC = [
  '只填一个下载链接；iOS 超签包可填安装页或 itms-services:// 地址。',
  '终端、包分类随包位固定，只读展示。',
  '上架包按商店校验（Windows 为 Microsoft Store，Mac 为 Mac App Store）；纯聊包按终端限制安装包格式（桌面端为 EXE / MSI、DMG / PKG）。',
  '版本号为 X.Y.Z；新增不能与当前、历史相同，替换当前版本前需要确认。',
  '编辑只能改包名称、更新日志、状态、备注；版本号、下载链接不可改。',
] as const

export const APP_PACKAGE_DOWNLOAD_LINK_SPEC = [
  '单元格折行展示完整下载链接。',
  '点击「复制」后顶部提示「已复制下载链接」。',
] as const

export const APP_PACKAGE_DOWNLOAD_STATUS_SPEC = [
  '停用前确认：确定要停用此包吗？这可能导致正在下载的用户中断。',
  '关闭开关后才可删除该包位配置。',
] as const

export const APP_PACKAGE_DOWNLOAD_HISTORY_SPEC = [
  '查看该配置被覆盖前的版本和链接。',
  '支持按版本号、更新日志模糊查询，每页 5 条分页。',
  '回滚后，列表版本号取该历史版本号，原先的当前版本进入历史。',
  '版本号唯一：当前版本与历史不重复，新增不可复用当前或历史版本号。',
  '删除后历史保留，可回滚恢复该包位。',
] as const

export const APP_PACKAGE_DOWNLOAD_ROW_ACTIONS_SPEC = [
  '新增：在该包位发布新版本，旧版本写入历史；版本号不能与当前、历史相同。',
  '编辑：只能改包名称、更新日志、状态、备注，版本号与链接不可改。',
  '删除：开关关闭后才可删除，当前版本写入历史，该行恢复未配置。',
] as const

export const APP_PACKAGE_DOWNLOAD_ANNOT_MAP = {
  filter: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.filter,
    title: '组合查询',
    items: APP_PACKAGE_DOWNLOAD_FILTER_SPEC,
  },
  slots: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.slots,
    title: '固定包位',
    items: APP_PACKAGE_DOWNLOAD_SLOTS_SPEC,
  },
  form: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.form,
    title: '配置表单',
    items: APP_PACKAGE_DOWNLOAD_FORM_SPEC,
  },
  download: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.download,
    title: '下载链接复制',
    items: APP_PACKAGE_DOWNLOAD_LINK_SPEC,
  },
  status: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.status,
    title: '启用 / 禁用',
    items: APP_PACKAGE_DOWNLOAD_STATUS_SPEC,
  },
  history: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.history,
    title: '历史版本与回滚',
    items: APP_PACKAGE_DOWNLOAD_HISTORY_SPEC,
  },
  rowActions: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.rowActions,
    title: '新增 / 编辑 / 删除',
    items: APP_PACKAGE_DOWNLOAD_ROW_ACTIONS_SPEC,
  },
} as const
