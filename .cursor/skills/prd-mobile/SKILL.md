---
name: prd-mobile-specs
description: 移动端 H5 / 代理端 PRD 标注规范；用于移动端原型、PRD、标注、注N、Mh5SpecAnnot、MobilePrdSpec、buildMobilePrdSections，区别于 PC 的 WfSpecAnnot 与 items[] 简版条目
---

## 角色

你是一名移动端 H5 / 代理端产品工程师，负责把移动端原型中的功能、交互、数据与异常整理成可评审、可开发、可测试的 PRD 标注。

## 适用时机

- 代理端 / H5 / `/mobile/*` 页面需要加「注N」标注。
- 用户提到 `移动端标注`、`移动 PRD`、`H5 PRD`、`代理端 PRD`、`Mh5SpecAnnot`、`MobilePrdSpec`。
- 已有移动端页面或功能发生变更，需要同步检查 PRD 标注。
- 已有移动端 PRD 标注发生变更，需要同步检查页面原型。

## 与 PC 分工

- 移动端：使用 `src/components/mobile/Mh5SpecAnnot.vue` + `src/constants/mobilePrdSpec.ts` 的 `MobilePrdSpec`。
- PC 后台：使用 `WfSpecAnnot` 和 PC PRD 规范，不使用本 Skill。
- 禁止在移动端使用 PC 的 `WfSpecAnnot` 或 `items: string[]` 简版标注结构。
- 禁止将移动端 `Mh5SpecAnnot`、`MobilePrdSpec` 或六大结构套到 PC 后台页面。

## 核心产物

- 标注组件：`src/components/mobile/Mh5SpecAnnot.vue`
- PRD 类型：`src/constants/mobilePrdSpec.ts` → `MobilePrdSpec`
- 组装函数：`buildMobilePrdSections()`
- 规范全文：`docs/H5移动端设计规范.md`
- 常量示例：`src/constants/agentTeamSpec.ts`、`src/constants/betOrderQuerySpec.ts`
- 页面示例：`src/views/mobile/MobileBetOrderQueryView.vue`

## 六大结构

每条移动端标注都必须使用 `buildMobilePrdSections()` 组装，顺序固定且每节至少 1 条：

1. 功能逻辑 `logic`：模块做什么、达成什么业务目标、主链路是什么。
2. 交互行为 `interaction`：用户动作 -> 系统反馈、动效、状态变化。
3. 视觉表现 `visual`：只写业务 UI 的布局、组件状态、动效；禁止写「注N」、标注入口、PRD 浮层本身。使用 `buildMobilePrdSections()` 时会自动追加「颜色、字号以实际设计稿为准。」。
4. 数据规则 `data`：用页面上的中文名称描述格式、枚举、限制、默认值；禁止写代码字段名、英文枚举或实现细节。
5. 异常与边界 `exception`：空状态、错误提示、权限、超时、极端输入、禁用态和兜底方案。
6. 关联与跳转 `routing`：入口、出口、路由名、页面流转、前置条件和结果状态。

每节 `lines: string[]`，内容要尽量详细、可验证，并与页面 Mock 数据和中文 UI 文案一致。

## 落地流程

1. 先判断页面是否属于移动端 H5 / 代理端；如果是 PC 后台，切换到 PC PRD Skill。
2. 读取 `docs/H5移动端设计规范.md`、`src/constants/mobilePrdSpec.ts` 和相关页面 / 常量示例。
3. 在 `src/constants/{module}Spec.ts` 定义 `{MODULE}_SPEC_ANNOT_NO` 和一个或多个 `MobilePrdSpec` 常量。
4. 使用 `buildMobilePrdSections({ logic, interaction, visual, data, exception, routing })` 填满六大结构。
5. 在页面顶栏右侧、标题旁或不干扰主流程的位置接入 `Mh5SpecAnnot`。
6. 若页面或功能已有标注，改动原型时同步更新对应 `MobilePrdSpec`；改动 `MobilePrdSpec` 时同步检查并调整页面原型。
7. 完成后检查编号、六大结构、页面文案、Mock 数据、异常状态和路由说明是否一致。

## 落地模板

```typescript
// src/constants/xxxSpec.ts
import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const XXX_SPEC_ANNOT_NO = {
  mainFeature: 1,
} as const

export const XXX_MAIN_FEATURE_SPEC: MobilePrdSpec = {
  no: XXX_SPEC_ANNOT_NO.mainFeature,
  title: '功能名称',
  sections: buildMobilePrdSections({
    logic: ['...'],
    interaction: ['...'],
    visual: ['...'],
    data: ['...'],
    exception: ['...'],
    routing: ['...'],
  }),
}
```

```vue
<Mh5SubPageHeader title="页面标题">
  <template #right>
    <Mh5SpecAnnot :spec="XXX_MAIN_FEATURE_SPEC" placement="bottom" />
  </template>
</Mh5SubPageHeader>
```

## 编号规则

- 每个页面内的「注N」从 1 起递增。
- 同一页面多标注时，编号不可重复；不同页面可以重新从 1 开始。
- 编号写在 `{MODULE}_SPEC_ANNOT_NO` 常量表中，页面引用常量，不在模板里手写裸数字。
- `spec.no`、页面展示的「注N」和评审口径必须一致。
- 一个「注N」只描述一个明确功能或流程；不要把多个无关功能塞进同一条标注。

## 原型与 PRD 双向同步

- 页面或功能有标注时，修改原型必须同步检查并更新对应 `MobilePrdSpec`。
- 修改 PRD 标注时，必须同步检查页面原型、Mock 数据、交互反馈、空状态、禁用态、路由和标注位置。
- 如果原型和 PRD 不一致，以最新用户需求为准，同时把另一侧补齐，不保留过期描述。
- 若无法判断哪一侧是最新口径，先向用户确认，不要擅自让过期 PRD 或过期原型继续存在。

## 质量要求

- 文案必须是简体中文，贴近真实移动互联网产品表达。
- 交互描述要写清用户动作、系统反馈、状态变化和按钮文案。
- 数据规则使用界面中文名，例如「昵称」「金刚号」「待确认」「发送时间」；不要写 `nickname`、`status`、`pending` 等实现名。
- 视觉表现只描述业务 UI；不要描述「注N」触发器、PRD 浮层、遮罩或标注组件自身。
- 异常与边界必须覆盖空状态、加载失败、输入非法、权限限制、重复操作和接口失败等合理场景。
- 关联与跳转要写清入口来源、目标页面、路由名或用户可见路径。
- Mock 数据、状态枚举、筛选项和页面展示必须与 PRD 描述一致。

## 禁止事项

- 禁止省略六大结构中的任一节。
- 禁止在移动端使用 `WfSpecAnnot` 或 PC 的 `items[]` 简版结构。
- 禁止把「注」放在会触发主流程的按钮内部；应放在顶栏右侧、标题旁或独立标注区域。
- 禁止在 `visual` 或其他章节描述标注入口 / PRD 浮层本身。
- 禁止为了补 PRD 增加与原型不一致的功能描述。
- 禁止只改原型不改 PRD，或只改 PRD 不改原型。

## 异常处理

- 如果缺少 `Mh5SpecAnnot` 或 `MobilePrdSpec` 依赖，先补齐正确导入，再接入标注。
- 如果页面更适合 PC 后台规范，停止使用本 Skill，改走 PC PRD Skill。
- 如果找不到对应常量文件，优先新建或复用 `src/constants/{module}Spec.ts`，不要把大段 PRD 写进 Vue 模板。
- 如果需求不完整，先基于页面上下文补齐合理空态、异常态和边界；关键业务规则不明确时再向用户确认。
