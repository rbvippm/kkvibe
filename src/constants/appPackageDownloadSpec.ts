/** App 包下载配置 · PRD
 * 与页面「注1～注7」一一对应；不含【文档说明】入口。
 */

import type { PcPrdFeatureRow } from './pcPrdSpec'

export const APP_PACKAGE_DOWNLOAD_META = {
  title: 'App包下载配置',
  module: '配置管理',
  updatedAt: '2026-11-11',
  prdVersion: 'v1.1',
} as const

export const APP_PACKAGE_DOWNLOAD_BACKGROUND = [
  '平台同时维护 iOS、Android、Windows、Mac 上的超签包、纯聊包和上架包，推广、合规和发版需要各自独立的下载与更新地址。',
  '超签包走企业签或超级签，iOS 安装依赖 Plist；上架包分别指向 App Store、Google Play、国内应用商店、Microsoft Store 或 Mac App Store；纯聊包用于 IM 渠道，地址可以是 H5、APK、IPA，桌面端为 EXE / MSI / DMG / PKG。',
  '运营、财务和技术要在同一页更新链接、发布版本、停用包，并追溯历史地址。',
] as const

export const APP_PACKAGE_DOWNLOAD_GOALS = [
  '在配置管理中集中维护各终端、各分类 App 包的下载配置。',
  '同一应用名称、终端、包分类只保留一条当前配置；发布新版本覆盖当前行，旧版本进入历史。',
  'iOS 超签包单独维护 Plist；停用和修改下载链接需确认；可从历史版本回滚。',
  '本配置供 PC 与 H5 网页版跳转 App 下载，始终下载当前最新版本，不区分弱更新 / 强更新。',
] as const

export const APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO = {
  filter: 1,
  add: 2,
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
        '终端：全部 / iOS / Android / Windows / Mac。包分类：全部 / 超签包 / 纯聊包 / 上架包。状态：全部 / 启用 / 禁用。关键字匹配应用名称、版本号、下载链接、Plist 链接，不区分大小写。',
      exceptions: '组合条件无命中时保留已填条件，不关闭页面。',
      routing: '停留本列表，不跳转。',
    },
  },
  {
    id: 2,
    module: '列表操作',
    feature: '新增下载配置',
    pageLocation: '工具栏「新增下载配置」旁「注2」',
    prd: {
      functionalLogic: '为还没有配置的应用、终端、包分类新增一条下载配置；若该组合已存在，则改为发布新版本覆盖，不另起一行。',
      interactiveBehavior:
        '点击「新增下载配置」打开发布弹框。新组合校验通过后直接保存，全局顶部提示「已新增下载配置」。已存在时弹框提示当前版本，确认后覆盖并提示「已发布新版本」。',
      visualPresentation: '右上角品牌色「新增下载配置」，旁侧「注2」。',
      dataRules: '同一应用名称 + 终端 + 包分类只对应一行当前配置。新版本号必须高于该行当前版本。',
      exceptions: '校验失败留在弹框，底部 hint 说明原因，不写顶部提示。',
      routing: '保存后关闭弹框并刷新当前列表。',
    },
  },
  {
    id: 3,
    module: '发布弹框',
    feature: '配置表单',
    pageLocation: '弹框标题旁「注3」',
    prd: {
      functionalLogic:
        '维护包名称、终端（iOS / Android / Windows / Mac）、包分类、版本、下载链接、更新日志、启用状态和内部备注。不设更新模式：PC / H5 网页版跳转下载永远取当前最新版本，没有强更的说法。iOS 超签包额外维护 Plist，用于触发安装。',
      interactiveBehavior:
        '终端选 iOS 且包分类选超签包时，下载链接下方出现 Plist 输入框。编辑时若下载链接有变化，确认后才保存。版本升高时，旧版本写入历史。保存成功用全局顶部提示。',
      visualPresentation:
        '弹框标题「新增下载配置」或「编辑下载配置」，标题旁「注3」。必填项带红色星号。iOS 超签才展示 Plist。校验失败在弹框底部红色 hint。',
      dataRules:
        '应用名称必填，最多 100 字。版本号为 X.Y.Z，同一配置内当前版本与历史版本号唯一，不可与历史重复；编辑时修改下载链接须同时升级版本号。下载链接为 http(s)；iOS 超签另允许 itms-services。Plist 仅 iOS 超签必填，须以 .plist 结尾或以 itms-services:// 开头。iOS 上架须为 App Store 域名；Android 上架须为 Google Play、华为、应用宝或小米商店；Windows 上架须为 Microsoft Store；Mac 上架须为 Mac App Store（apps.apple.com）。纯聊包：iOS 不接受 APK，Android 不接受 IPA，Windows 不接受 APK / IPA / DMG / PKG，Mac 不接受 APK / IPA / EXE / MSI。超签包只能选 iOS。更新日志选填，作为下载页版本说明。备注最多 255 字。状态默认启用。',
      exceptions: 'Android、Windows、Mac 选择超签包时提示「超签包只适用于 iOS」且不可保存。版本号与历史重复提示「vX.Y.Z 已在历史版本中，版本号不能重复」；只改链接不升版本提示「修改下载链接须同时升级版本号，同一版本号只对应一个包」。版本号不递增、链接格式不对、Plist 缺失时不关闭弹框。',
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
      functionalLogic: '启用后客户端按该配置拉包；禁用后该包下线。同一应用、终端、包分类只保留一个启用中的当前配置。',
      interactiveBehavior:
        '关闭开关时弹出确认：「确定要停用此包吗？这可能导致正在下载的用户中断。」确认后禁用，顶部提示「已停用该包」。打开开关直接启用并提示「已启用该包」。若同键还有其他启用行，自动改为禁用。',
      visualPresentation: '状态列为开关。表头旁「注5」。确认框标题「停用下载配置」。',
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
      functionalLogic: '追溯该配置每次覆盖前的版本号、下载链接、Plist、更新日志、操作人和时间，并允许回滚到其中一条。',
      interactiveBehavior:
        '点击「查看历史」打开历史列表，顶部显示当前下载版本。点击「回滚至此版本」后确认，当前配置写入历史，选中记录成为当前启用版本：列表与弹框顶部的版本号、下载链接、更新日志均改为该历史版本，顶部提示「已回滚至 vX.Y.Z」。',
      visualPresentation: '有历史时为蓝色「查看历史」，无历史时灰色「暂无」。表头旁「注6」。历史弹框列出全部旧版本。',
      dataRules:
        '发布更高版本、编辑时升高版本或修改下载链接、以及回滚，都会把变更前快照写入历史。历史按时间倒序。原型用这份历史承担变更前/后链接的追溯，不另开操作日志页。',
      exceptions: '无历史时不可回滚。取消确认不改当前配置。',
      routing: '回滚后留在历史弹框，列表同步刷新。',
    },
  },
  {
    id: 7,
    module: '配置列表',
    feature: '编辑 / 删除',
    pageLocation: '表头「操作」旁「注7」',
    prd: {
      functionalLogic: '编辑修改当前配置；删除只用于从未发布过历史版本的配置。',
      interactiveBehavior:
        '「编辑」打开弹框并回填。保存成功顶部提示「保存成功」。无历史时「删除」可点，确认后移除并提示「已删除」。已有历史时删除不可点。',
      visualPresentation: '操作列为「编辑」和「删除」。删除在不可用时为灰色。表头旁「注7」。',
      dataRules: 'history 为空才允许删除。编辑沿用注3 的校验。',
      exceptions: '有历史版本时删除按钮禁用，悬停说明「已有历史版本，不可删除」。取消删除不移除数据。',
      routing: '编辑保存或删除后停留列表。',
    },
  },
]

export const APP_PACKAGE_DOWNLOAD_FILTER_SPEC = [
  '终端、包分类、状态可组合，点「搜索」后生效。',
  '应用搜索模糊匹配名称、版本号、下载链接和 Plist 链接。',
  '点「清除」恢复全部配置。',
] as const

export const APP_PACKAGE_DOWNLOAD_ADD_SPEC = [
  '新增一条应用、终端、包分类都还没有的配置。',
  '该组合已存在时，改为发布更高版本并覆盖当前行，不另起一行。',
  '旧版本写入历史。',
] as const

export const APP_PACKAGE_DOWNLOAD_FORM_SPEC = [
  'iOS 且超签包时才出现 Plist，须为 .plist 或 itms-services://。',
  '终端可选 iOS / Android / Windows / Mac；超签包只适用于 iOS。',
  '上架包按商店校验（Windows 为 Microsoft Store，Mac 为 Mac App Store）；纯聊包按终端限制安装包格式（桌面端为 EXE / MSI、DMG / PKG）。',
  '版本号为 X.Y.Z。修改下载链接或覆盖已有配置前需要确认。',
] as const

export const APP_PACKAGE_DOWNLOAD_LINK_SPEC = [
  '单元格折行展示完整下载链接。',
  '点击「复制」后顶部提示「已复制下载链接」。',
] as const

export const APP_PACKAGE_DOWNLOAD_STATUS_SPEC = [
  '停用前确认：确定要停用此包吗？这可能导致正在下载的用户中断。',
  '同一应用、终端、包分类只保留一个启用中的当前配置。',
] as const

export const APP_PACKAGE_DOWNLOAD_HISTORY_SPEC = [
  '查看该配置被覆盖前的版本和链接。',
  '回滚后，列表版本号取该历史版本号，原先的当前版本进入历史。',
  '版本号唯一：当前版本与历史不重复，发布 / 编辑不可复用历史版本号。',
] as const

export const APP_PACKAGE_DOWNLOAD_ROW_ACTIONS_SPEC = [
  '编辑回填当前配置，校验规则与新增相同。',
  '没有历史版本时才可删除。',
] as const

export const APP_PACKAGE_DOWNLOAD_ANNOT_MAP = {
  filter: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.filter,
    title: '组合查询',
    items: APP_PACKAGE_DOWNLOAD_FILTER_SPEC,
  },
  add: {
    no: APP_PACKAGE_DOWNLOAD_SPEC_ANNOT_NO.add,
    title: '新增下载配置',
    items: APP_PACKAGE_DOWNLOAD_ADD_SPEC,
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
    title: '编辑 / 删除',
    items: APP_PACKAGE_DOWNLOAD_ROW_ACTIONS_SPEC,
  },
} as const
