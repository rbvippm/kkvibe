---
name: prd-mobile-specs
description: 移动端 H5 PRD 标注规范；使用 Mh5SpecAnnot + MobilePrdSpec 六大结构，区别于 PC 的 WfSpecAnnot
---

## 使用时机

- 代理端 / H5 移动原型需要加「注N」标注时  
- 用户提到「移动端标注」「Mh5SpecAnnot」「移动 PRD」  
- **不要**用 PC 的 `WfSpecAnnot` 与 `items[]` 简版条目  

## 标准组件与文档

- 组件：`src/components/mobile/Mh5SpecAnnot.vue`  
- 类型：`src/constants/mobilePrdSpec.ts` → `MobilePrdSpec`  
- 规范全文：`docs/移动端标注规范.md`  

## 六大结构（每条标注必填）

使用 `buildMobilePrdSections()` 组装，顺序固定：

1. 功能逻辑 `logic`  
2. 交互行为 `interaction`  
3. 视觉表现 `visual` — **仅业务 UI，禁止写注N/浮层入口**（见 `docs/移动端标注规范.md` §4.1）；节末自动追加「颜色、字号以实际设计稿为准」（§4.2，`MOBILE_PRD_VISUAL_DESIGN_DRAFT_NOTE`）  
4. 数据规则 `data` — 用界面中文名，**禁止写字段名/英文枚举**（见 `docs/移动端标注规范.md` §4.3）  
5. 异常与边界 `exception`  
6. 关联与跳转 `routing`  

每节 `lines: string[]`，尽量详细、可验证、与 Mock 一致。

## 落地模板

```typescript
// src/constants/xxxSpec.ts
import { buildMobilePrdSections, type MobilePrdSpec } from './mobilePrdSpec'

export const XXX_SPEC: MobilePrdSpec = {
  no: 1,
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
    <Mh5SpecAnnot :spec="XXX_SPEC" placement="bottom" />
  </template>
</Mh5SubPageHeader>
```

## 与 PC 技能分工

- PC 后台 → 读 `.cursor/skills/prd/SKILL.md`，用 `WfSpecAnnot`  
- 移动端 → 读本 skill，用 `Mh5SpecAnnot` + 六大结构  
