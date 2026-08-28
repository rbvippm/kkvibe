---
name: prd-pc-specs
description: 为 PC 后台原型生成 PRD 标注、功能清单与文档说明页。Use when working on /pc 管理后台、WfSpecAnnot、PRD、标注、注N、文档说明入口、功能清单或六大维度说明；不要用于移动端 H5。
---

# PC PRD 标注 Skill

## 角色

你是 PC 后台原型的产品工程师。先理解业务目标和页面上下文，再把模糊需求拆成可实现、可校验、研发可读的 PRD 标注与文档说明。

## 适用时机

- 用户提到 PC 后台、管理后台、`/pc/*`、PRD、标注、注N、功能清单、文档说明页。
- 页面使用 `src/components/wireframe/WfSpecAnnot.vue` 或需要接入【文档说明】入口。
- 需要新增或维护 `src/constants/{module}Spec.ts`、`PcPrdFeatureRow`、`docRouteName`、PC 文档子页。

## PC 与移动端边界

- PC 后台只使用 `WfSpecAnnot`。组件 props 为 `title: string`、`items: string[]`、可选 `no?: number`、`placement?: 'bottom' | 'top'`。
- PC 页面浮层标注文案是简版 `items[]`，用于解释当前控件或区域；完整 PRD 写入文档说明页。
- PC 文档页功能清单使用 `src/constants/pcPrdSpec.ts` 的 `PcPrdFeatureRow`，每条 `prd` 必须包含六大维度对象。
- 移动端 H5 / 代理端原型走 `.cursor/skills/prd-mobile/SKILL.md`，使用 `Mh5SpecAnnot` + `MobilePrdSpec` / `buildMobilePrdSections()`。禁止把移动端六节结构套进 PC 的 `items[]` 浮层，也禁止让移动端复用 PC 简版格式。

## 核心产物

1. 页面标注：在业务页面合适位置接入 `WfSpecAnnot`，并传入 `:no`、`title`、`items`。
2. PRD 常量：在 `src/constants/{module}Spec.ts` 维护背景、目标、功能清单、标注编号和浮层文案。
3. 文档说明页：创建或更新 `src/views/pc/Pc{Module}DocView.vue`，展示 PRD 概要与功能清单。
4. 文档入口：业务页通过路径条配置 `docRouteName` 展示【文档说明】入口；功能清单不包含「文档说明入口」这一条。

## 功能清单与标注一致（硬约束）

**功能清单 `FEATURE_LIST` 与页面「注N」标注必须一一对应，禁止多一条或少一条。**

| 对象 | 要求 |
|------|------|
| `FEATURE_LIST` 每条 | 必须在页面有对应 `WfSpecAnnot`，且 `:no === item.id` |
| 页面每个 `WfSpecAnnot` | 必须在 `FEATURE_LIST` 有同 `id` 条目，且在 `{MODULE}_SPEC_ANNOT_NO` 有登记 |
| `{MODULE}_SPEC_ANNOT_NO` | 每个 key 的 value 必须等于某条 `FEATURE_LIST.id`，且与页面 `:no` 一致 |
| `*_SPEC` / `*_ANNOT_MAP` 浮层文案 | 每个有标注的 key 与 `FEATURE_LIST` 条目、`WfSpecAnnot` 一一对应 |

**允许不在功能清单中的内容（不占编号）：**

- 【文档说明】路径条入口
- 纯布局/壳层（侧栏、Tags、路径条本身）
- 全局顶部提示（`showPcToast`，壳层即时反馈，不为它单独开「注N」）
- 无独立业务含义的占位（如分页占位、纯装饰文案）

**不允许：**

- 功能清单有条目但页面无「注N」（文档有、页面无）
- 页面有「注N」但功能清单无对应 `id`（页面有、文档无）
- `{MODULE}_SPEC_ANNOT_NO` 与 `FEATURE_LIST` / 页面 `:no` 数量或编号不一致

## 六大维度

每个 `PcPrdFeatureRow.prd` 必须完整覆盖以下字段，字段名与 `PcPrdDimension` 保持一致：

- `functionalLogic` 功能逻辑：说明模块或元素的核心作用、业务目标和系统处理。
- `interactiveBehavior` 交互行为：说明用户动作、系统反馈、状态变化、弹框/筛选/保存流程。保存成功等即时通知写「全局顶部提示」，弹框校验失败写「弹框底部 hint」。
- `visualPresentation` 视觉表现：说明页面位置、默认态、悬停态、禁用态、空态、错误态等可见表现。
- `dataRules` 数据规则：说明字段格式、必填、默认值、枚举、校验区间、展示条件和 Mock 口径。
- `exceptions` 异常与边界：说明空数据、无权限、接口失败、校验失败、不可操作、超长内容等处理。
- `routing` 关联与跳转：说明页面流向、弹框关闭、列表刷新、路由跳转或明确无跳转。

## 落地流程

1. 读取当前页面、业务常量、路由、菜单和 PC 规范，确认页面属于 PC 后台。
2. **先列有页面标注的业务功能点**（每个控件/区域一条），确定 `id`（从 1 起）、`module`、`feature`、`pageLocation`；再写入 `FEATURE_LIST`，保证与标注位一一对应。
3. 新增或更新 `src/constants/{module}Spec.ts`：维护 `META`、`BACKGROUND`、`GOALS`、`FEATURE_LIST`、`{MODULE}_SPEC_ANNOT_NO`、浮层 `*_SPEC` 与 `{MODULE}_ANNOT_MAP`（如有）。
4. 在页面接入 `WfSpecAnnot`（或封装组件），`:no` 与 `{MODULE}_SPEC_ANNOT_NO`、功能清单 `id` 一致。Tab 标注不得放进 `wf-tab` 按钮内部，应使用 `wf-tab-item` 包裹，标注置于按钮外侧。
5. 配置 `docRouteName` 与文档说明子路由；文档页使用 `pc-wireframe-page wf-doc-page`，复用 `PRD_DIMENSION_LABELS` 渲染六大维度。
6. **执行「功能清单 ↔ 标注」一致性检查**（见下节）；不通过则补齐或删减，直至双向一致。
7. 修改原型时同步更新 PRD、标注与功能清单；修改 PRD 时同步检查原型与标注编号。
8. 保存/删除/启用等成功反馈用 `showPcToast`；对应条目的 `interactiveBehavior` 写「全局顶部提示 + 文案」，不要写成工具栏 hint。

## 即时通知（全局顶部提示）

- 调用：`import { showPcToast } from '../../composables/usePcToast'`，`showPcToast(中文文案)`；失败用 `'error'`，中性用 `'info'`。
- 宿主：`PcAdminLayout` 已挂 `PcToastHost`，业务页只调函数，不要再造 toast。
- 弹框内校验失败、查询无结果：继续用弹框 `wf-modal__hint`，不关弹框、不用顶部提示。
- 不为 toast 单独加功能清单条目或「注N」。

## 标注编号规则

- `{MODULE}_SPEC_ANNOT_NO` 的 **每一个 value** 必须等于 `FEATURE_LIST` 中某条的 `id`，且该条必须在页面上有 `WfSpecAnnot`。
- `WfSpecAnnot` 必须传 `:no`；触发器显示「注1」「注2」，浮层标题带对应编号。
- 每页从 1 起独立编号；**禁止**「功能清单有 #5 但页面无注5」或「页面有注5 但清单无 #5」。
- 增删功能时：**同时**改 `FEATURE_LIST`、`SPEC_ANNOT_NO`、页面 `WfSpecAnnot`、浮层文案，并 **重跑一致性检查**。
- 不为追求 id 连续而单独重排历史编号，除非用户明确要求；重排时仍须保持清单与标注集合完全一致。

## 一致性检查（交付前必做）

完成或修改 PRD/标注后，**必须**逐项核对并修复差异：

```text
A. annotIds = {MODULE}_SPEC_ANNOT_NO 的全部 value（去重）
B. featureIds = FEATURE_LIST 的全部 id
C. pageNos = 业务页中所有 WfSpecAnnot 的 :no（含封装组件传入的 no）

检查：
1. A === B === C（集合相等，个数相同、编号相同）
2. FEATURE_LIST.length === Object.keys(SPEC_ANNOT_NO).length === 页面标注个数
3. 每条 FEATURE_LIST 的 pageLocation 与页面 WfSpecAnnot 挂载位置语义一致
4. 每条 FEATURE_LIST 的 feature 与对应 WfSpecAnnot title / 浮层 items 主题一致
5. 文档说明页功能索引表行数 === FEATURE_LIST.length
```

**不通过时的处理：**

- 清单多、标注少 → 补页面 `WfSpecAnnot` 或从清单删除该条（需确认是否真无 UI 锚点；无锚点则不应留在清单）。
- 标注多、清单少 → 补 `FEATURE_LIST` 六大维度条目，或移除多余标注。
- 编号不一致 → 以 `{MODULE}_SPEC_ANNOT_NO` 与 `FEATURE_LIST.id` 为源，统一页面 `:no`。

## 输出质量要求

- PRD 文案必须中文、具体、可验证，避免「优化体验」「支持配置」这类空泛表达。
- 功能清单只描述**已在页面标注**的业务功能；不把【文档说明】入口、无标注的筛选项/表格列写进清单。
- PC 页面遵循 `docs/PC后台设计规范.md`：`pc-wireframe-page`、`wf-*` 线框风、中文 Mock 数据、空态/错误态/禁用态可见。
- **即时通知**：保存成功、删除成功、启用/禁用等写「全局顶部提示」（`showPcToast`），不写工具栏 `wf-modal__hint` / `actionHint`。弹框内校验失败仍写弹框 `wf-modal__hint`。`interactiveBehavior` / `visualPresentation` 须写明用哪一种。
- 新页面参考 `src/constants/liveDanmakuMuteSpec.ts` + 对应 DocView；历史页若清单与标注不一致，改动时优先收敛到一致，而非继续沿用「清单多、标注少」旧模式。

## 异常处理

- 页面是移动端或使用 `Mh5SpecAnnot` → 改读 `prd-mobile`。
- 用户只要 PRD 文档不改代码 → 仍输出与**当前页面已有标注**一致的清单；若页面尚无标注，说明缺口，不虚构「注N」。
- 业务规则缺失 → 保守 Mock +「待接口确认」；不影响清单与标注条数对齐。
- 历史模块存在清单/标注不一致 → 本次改动范围内优先修复对齐，并在回复中列出曾不对齐的 id。

## 校验清单

- [ ] `FEATURE_LIST` 每条都有完整六大维度。
- [ ] **`FEATURE_LIST` 条数 = `{MODULE}_SPEC_ANNOT_NO` 条数 = 页面 `WfSpecAnnot` 个数。**
- [ ] **三个来源的 id 集合完全一致（无多无少）。**
- [ ] 每条清单 `pageLocation` 与页面标注挂载点一致。
- [ ] 有标注的业务页已配置 `docRouteName` 与文档说明子路由。
- [ ] 未把【文档说明】入口写进功能清单。
- [ ] 空态、异常、禁用态、校验失败等在对应条目的 `exceptions` 中有说明。
- [ ] 保存/删除等成功反馈写全局顶部提示，未把成功通知做成工具栏 hint。
- [ ] 未混用移动端 `Mh5SpecAnnot` / `MobilePrdSpec`。
