---
name: op-version-create
description: 按排期表在 OpenProject 中创建版本固定骨架与开发结构（不建测试子任务）。适用于 /op版本创建、建立op、创建OP版本、搭版本计划、OpenProject 建版本。
---

# op版本创建

## 角色

你按团队既定 OP 结构建版本：除开发外全部是固定项；开发只按排期表的实际端口展开。测试不在开发下建任务。

## 触发

- `/op版本创建`
- `建立op` / `创建OP版本` / `搭版本计划` / `按排期表建 OP`

## 输入（缺一就问，禁止猜版本号）

| 必需 | 说明 |
|---|---|
| 空项目 | 用户先在 OP **手动建空项目**，再给项目链接或 ID。你**不要** `POST /api/v3/projects` |
| 排期表 | Google Sheets；只读工作表 **`排期表`**（gid 以链接为准）。忽略 `IOS问题` / `安卓问题` / `H5` |
| 版本号 | 如 `v2.24.1`。项目已叫 `--vX.Y.Z …` 则沿用，不要改名 |

项目命名惯例（用户手建时用）：`--{版本号} {主题}`，例 `--v2.24.1 问题优化+投注记录`。

## 整体结构（对照 v2.24.1）

```
版本计划 (Phase)                    ← 根
├── PM (Phase)
│   ├── 文档原型 (Task)
│   ├── UI设计 (Task)
│   └── 上线资料准备 (Task)
├── 开发 (Phase)
│   └── {业务划分} (Phase)         ← 唯一可变：一行排期一个模块
│       └── {端口}-{业务划分} (Task)  ← 只建实际端口，禁止「测试-」
└── QA (Phase)
    ├── 测试用例 (Task)
    ├── DEV测试 (Task)
    ├── STG测试 (Task)
    └── PROD验证 (Task)

BUG目录 (Phase)                     ← 与版本计划同级根
├── DEV环境 (Phase)
├── STG环境 (Phase)
└── PROD环境 (Phase)
```

**禁止**：`发布` 阶段；开发下的测试任务；把问题表导入成 Bug；创建时改完成度。

类型：目录用 **Phase `typeId=3`**，叶子用 **Task `typeId=1`**。状态保持默认 `New`。优先级默认 P2。项目需已启用 Phase / Task / Bug；缺 Phase 时停下来让用户在项目设置里打开类型。

## 排期表怎么读

表头：`序号 | 涉及终端 | 业务划分 | 包含功能点 | 任务类型 | 投入人力 | DEV日期 | STG日期 | PROD日期`

- 有效行：有「业务划分」且「序号」为数字。
- 表底汇总（通常在 D 列）：`开发时间` / `DEV时间` / `STG时间` / `PROD时间`。
- 行内 STG/PROD 列**不**用来建任务日期。
- `包含功能点` 写入该模块 Phase 的描述，端侧 Task 描述留空。

### 实际端口（开发 Task 的唯一依据）

端口别名：`服务端|后端`→服务端；`H5|h5`→H5；`IOS|iOS|ios`→IOS；`安卓|Android`→安卓。

- `测试|QA`：**永远不**在开发下建 Task。
- `BI|BI后台`：**不**单独建端口；有服务端/H5 人力或日期则走这两端。
- `涉及终端` 的 `APP` 只表示范围，不直接建「APP-」任务。

判定：

1. 解析该行 `DEV日期` 里带端口前缀的行（`服务端：9.3 - 9.8`）。
2. **有任意一端是具体日期** → 只为这些端口建 Task（例：大文件人力有服务端，但 DEV 日期只有 H5/IOS/安卓 → **不建**服务端）。
3. **整段为空或全是 `x.x`** → 退回 `投入人力` 中除测试外的端口，日期留空。

创建顺序：服务端 → IOS → 安卓 → H5（有则建）。任务标题：`{端口}-{业务划分}`，如 `H5-投注记录`。

### 日期

- 具体：`9.3 - 9.4` / `9.3-9.4` / `9.9` / `9.12`。年份默认对话年份（当前排期为 2026），跨年时问用户。
- **`x.x` / `x.x-x.x`：该 Task 的 start/due 留空**，预览里标「待补」，不要套开发总窗口。
- 模块 Phase 的日期 = 子 Task 中已填日期的最小 start ~ 最大 due；子任务全空则模块也空。

固定项日期（表底汇总）：

| 工作包 | start | due |
|---|---|---|
| 版本计划 | 开发时间 start | PROD时间（单日则同一天） |
| 开发 | 开发时间 start | 开发时间 due |
| PM | 开发时间 start | PROD 当天 |
| 文档原型、UI设计 | 开发时间 start | 同一天 |
| 上线资料准备 | PROD 当天 | PROD 当天 |
| QA | 测试用例 start | PROD 当天 |
| DEV测试 | DEV时间 | DEV时间 |
| STG测试 | STG时间 | STG时间 |
| PROD验证 | PROD时间 | PROD时间 |
| 测试用例 | 开发 due 往前 2 个**工作日**（周一到周五，共 3 个工作日） | DEV测试 start 的前 1 个日历日 |
| BUG目录及三环境 | 不填日期 | 不填 |

测试用例若 start > due，或表底缺 DEV/开发时间：停下来问用户，不要硬填。

### 工时（完成列 / estimatedTime）

有 `start` + `due` 的**叶子 Task** 必须写入预估工时；Phase 父级、BUG 目录、无日期任务**不写**（父级由子项汇总）。

规则：

- 只计周一到周五，**周六、周日不计**（与 OP `ignoreNonWorkingDays=false` 一致，不额外扣法定假）。
- **1 个工作日 = 1H**，写入 ISO 时长 `PT{n}H`（例：`9.10–9.11` 周四到周五 → `PT2H`）。
- 区间全是休息日 → 工时为 0，不写 `1H`。
- 创建时 POST body 带 `estimatedTime`；已存在则 `PATCH`，必须带当前 `lockVersion`。未开工的同时写 `remainingTime` 等于预估；已有完成度的按比例改剩余工时，**不要改 `percentageDone`**。
- 日期变更后按新区间重算并覆盖预估，不要沿用旧工时。

## 人员

先查目标项目 `available_assignees`，再用花名匹配（大小写不敏感）：

| 排期花名 | OP 用户 | ID |
|---|---|---|
| ezreal | ezreal PM | 107 |
| leon | leon Golang | 34 |
| james | james-kk Golang | 35 |
| rain | rain H5 | 42 |
| owen | owen H5 | 44 |
| link | link IOS | 70 |
| kai | peter IOS | 29 |
| flow | flow IOS | 56 |
| bear | bear Android | 99 |
| negan | kylin Android | 51 |
| pual / paul | tt-kk Go-Payment | 41 |
| kaio | kaio QA | 97 |

更全的表见 [people.md](people.md)。**整词匹配**：`kai` ≠ `kaio`。表里没有、或一个花名能对上多人：先问用户，禁止猜。

指派：

- PM 三件套、版本计划、PM Phase → ezreal PM
- 模块 Phase → 该行服务端负责人；没有服务端则用第一个已建端口的人
- 端侧 Task → 该端口在 `投入人力` 里的人
- QA 四件套、QA Phase、BUG 目录三环境 → 排期里的测试负责人（能映射才指派，否则问）

## 执行流程

1. 读 `排期表` + 表底时间；`GET` 目标项目，确认 Phase/Task 可用。
2. **先发中文预览树**（模块、端口、日期、指派人、待补项），等用户说可以建。用户明确「直接建」可跳过等待。
3. 按层级创建（先根再子），记下 ID 再挂 parent。
4. Phase 必须用 `typeId=3`。`create_work_package` 写不出 Phase 时，改 `raw_api_call` `POST /api/v3/projects/{id}/work_packages`，body 里 `_links.type.href=/api/v3/types/3`、`parent`、`assignee`。叶子 Task 同时写 `estimatedTime`（见上节工时规则）。
5. 建完再拉一遍工作包，核对数量、父子、端口、日期、叶子工时（工作日小时数）；把待补日期/待指派人列给用户。
6. 回复项目链接。

预览示例：

```
项目：--v2.24.1 问题优化+投注记录 (#128)
固定项：版本计划 / PM×3 / QA×4 / BUG目录×3
开发模块：
- 大文件发送 → IOS、安卓、H5（不建服务端）
- 优化清单 → 服务端、IOS、安卓、H5
- 消息状态共用 → 四端，日期待补
待确认：无
```

## 工具

- 排期：`user-google-sheets` 的 `get_sheet_data`，`sheet=排期表`
- OP：`user-openproject`（`create_work_package` / `raw_api_call` / `list_work_packages`）
- 实例：`https://op-dev.890wei.com/`
