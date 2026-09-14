---
name: op-version-create
description: 按排期表在 OpenProject 搭版本固定骨架与开发模块。QA 必建四件套+表底排期；BUG 必按 DEV→STG→PROD；QA/BUG 默认指派 ruby QA（管理员）。适用于 /op版本创建、建立op、创建OP版本、搭版本计划、补 QA/BUG 骨架。
---

# op版本创建

## 角色

按团队既定 OP 结构建版本。**除开发外全部是固定项**，缺了就要补，不要只建空目录。开发只按排期表的实际端口展开。**测试永远不在开发下建任务**，一律走 QA 目录。

## 触发

- `/op版本创建`、`建立op`、`创建OP版本`、`搭版本计划`、`按排期表建 OP`
- 用户要**补 QA / 补 BUG 顺序 / 同步骨架**时：对照本节结构查漏，缺什么补什么

## 输入（缺一就问，禁止猜版本号）

| 必需 | 说明 |
|---|---|
| 空项目（或已有项目） | 用户先在 OP **手动建项目**，给链接或 ID。**禁止** `POST /api/v3/projects` |
| 排期表 | Google Sheets；只读工作表 **`排期表`**（gid 以链接为准）。忽略 `IOS问题` / `安卓问题` / `H5` |
| 版本号 | 如 `v2.27.0`。项目已叫 `--vX.Y.Z …` 则沿用，不要改名 |

项目命名惯例：`--{版本号} {主题}`。

## 整体结构（固定，不可省略）

```
版本计划 (Phase)                    ← 根
├── PM (Phase)
│   ├── 文档原型 (Task)
│   ├── UI设计 (Task)
│   └── 上线资料准备 (Task)
├── 开发 (Phase)
│   └── {业务划分} (Phase)         ← 同一「业务划分」多行合成一个模块
│       └── {端口}-{业务划分} (Task)  ← 只建实际端口，禁止「测试-」
└── QA (Phase)                     ← 必须有子任务，禁止只留空目录
    ├── 测试用例 (Task)
    ├── DEV测试 (Task)
    ├── STG测试 (Task)
    └── PROD验证 (Task)

BUG目录 (Phase)                     ← 与版本计划同级根；子项顺序强制如下
├── DEV环境 (Phase)
├── STG环境 (Phase)
└── PROD环境 (Phase)
```

**禁止**：`发布` 阶段；开发下的测试任务；把问题表导入成 Bug；创建时改 `percentageDone`。

类型：目录用 **Phase `typeId=3`**，叶子用 **Task `typeId=1`**。状态默认 `New`，优先级默认 P2。项目需已启用 Phase / Task / Bug；缺 Phase 时停下来让用户打开类型。

### 创建顺序（强制，同父级必须串行）

OP 树/列表按**创建先后**排子项；同父并发 POST 会 **409**（父级 `lockVersion`）。同一 parent 下**一个建完再下一个**。

1. 邀请本版本要指派的人（见人员）
2. `版本计划` → `BUG目录`
3. 版本计划下：`PM` → `开发` → `QA`
4. PM 下：`文档原型` → `UI设计` → `上线资料准备`
5. 开发下：模块按排期表**首次出现**的业务划分顺序
6. 模块下端口：`服务端` → `IOS` → `安卓` → `H5`（有则建）
7. QA 下：**测试用例 → DEV测试 → STG测试 → PROD验证**（四件套必建，即使用户说过「测试不建任务」——那只表示不在开发下建）
8. BUG 下：**DEV环境 → STG环境 → PROD环境**

BUG / QA 子项顺序错了：**删错位的空 Phase/Task 再按顺序重建**，不要只改标题。`DELETE` 成功常返回空 body（当成功，不要当失败）。

## 排期表怎么读

表头：`序号 | 涉及终端 | 业务划分 | 包含功能点 | 任务类型 | 投入人力 | DEV日期 | STG日期 | PROD日期`

- 有效行：有「业务划分」且「序号」为数字。
- **同一「业务划分」多行 = 一个模块 Phase**。各行功能点合并写入该 Phase 描述（去重、保留备注）。端口 Task 按端去重，标题仍是 `{端口}-{业务划分}`。
- 同一端口多段 DEV 日期：`start`/`due` 取最小～最大，工时按**该闭区间内工作日**（不是两段并集以外的洞，而是 min～max 之间所有工作日）。
- 表底汇总（通常 D 列）：`开发时间` / `DEV时间` / `STG时间` / `PROD时间`（`PROD：10.14` 也算）。
- 行内 STG/PROD 列**不**用来建开发任务日期。
- 端侧 Task 描述留空。

### 实际端口（开发 Task 的唯一依据）

别名：`服务端|后端`→服务端；`H5|h5`→H5；`IOS|iOS|ios`→IOS；`安卓|Android`→安卓。

- `测试|QA`：**永远不**在开发下建 Task；测试排期走 QA 四件套。
- `BI|BI后台`：**不**单独建端口；有服务端/H5 人力或日期则走这两端。
- `涉及终端` 的 `APP` 只表示范围，不建「APP-」任务。

判定：

1. 解析该行 `DEV日期` 里带端口前缀的行（`服务端：9.3 - 9.8`）。
2. **有任意一端是具体日期** → 只为这些端口建 Task（人力有服务端但 DEV 日期没有 → **不建**服务端）。
3. **整段为空或全是 `x.x`** → 退回 `投入人力` 中除测试外的端口，日期留空。

### 日期

- 具体：`9.3 - 9.4` / `9.3-9.4` / `9.9`。年份默认**当前对话年份**，跨年问用户。
- **`x.x` / `x.x-x.x`：该 Task start/due 留空**，预览标「待补」，不要套开发总窗口。
- 模块 Phase 日期 = 子 Task 已填日期的最小 start ~ 最大 due；子任务全空则模块也空。
- 父 Phase 会被子项自动收缩日期：建完后如与下表不符，用当前 `lockVersion` `PATCH` 拉回。

固定项日期（表底汇总）：

| 工作包 | start | due |
|---|---|---|
| 版本计划 | 开发时间 start | PROD 当天 |
| 开发 | 开发时间 start | 开发时间 due |
| PM | 开发时间 start | PROD 当天 |
| 文档原型、UI设计 | 开发时间 start | 同一天 |
| 上线资料准备 | PROD 当天 | PROD 当天 |
| QA | 测试用例 start | PROD 当天 |
| 测试用例 | 开发 due **往前 2 个工作日**（含开发 due 共 3 个工作日） | DEV测试 start 的**前 1 个日历日** |
| DEV测试 | DEV时间 start | DEV时间 due |
| STG测试 | STG时间 start | STG时间 due |
| PROD验证 | PROD 当天 | PROD 当天 |
| BUG目录及三环境 | 不填 | 不填 |

测试用例若 start > due，或表底缺开发/DEV 时间：停下来问，不要硬填。

### 工时（完成列 / estimatedTime）

有 `start` + `due` 的**叶子 Task** 必须写预估工时；Phase、BUG 目录、无日期任务**不写**。

- 只计周一到周五，**周六、周日不计**（`ignoreNonWorkingDays=false`，不额外扣法定假）。
- **1 个工作日 = 1H**，ISO：`PT{n}H`（`9.10–9.11` 周四到周五 → `PT2H`）。
- 区间全是休息日 → 工时 0，不写 `1H`。
- 创建时 POST 带 `estimatedTime`；已存在则 `PATCH`，必须带当前 `lockVersion`。未开工写 `remainingTime` = 预估；已有完成度按比例改剩余，**不要改 `percentageDone`**。
- 日期变更后按新区间重算覆盖，不要沿用旧工时。

## 人员

1. 读 [people.md](people.md) 默认表。
2. 用目标项目可指派列表核对。`GET /api/v3/users` 若 **403**，改 `GET /api/v3/principals?filters=[{"name":{"operator":"~","values":["花名"]}}]`。
3. 表里没有、或一个花名对上多人：先问，禁止猜。`kai` ≠ `kaio`（整词）。

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
| eva | eva Golang | 60 |
| byran | byran Golang | 83 |
| zustand | zustand H5 | 57 |
| bear | bear Android | 99 |
| negan | kylin Android | 51 |
| pual / paul | tt-kk Go-Payment | 41 |
| kaio | kaio QA | 97 |
| ruby | ruby QA | 13 |

### 先邀请再指派

未进项目的人无法指派。对每个将要 `assignee` 的用户：

`POST /api/v3/memberships`

```json
{
  "_links": {
    "project": { "href": "/api/v3/projects/{项目ID}" },
    "principal": { "href": "/api/v3/users/{userId}" },
    "roles": [{ "href": "/api/v3/roles/4" }]
  }
}
```

默认角色 **Member（id=4）**。**Ruby 固定用 Project admin（id=3）**，不要降成 Member。已是成员则跳过（Ruby 若已是 Member，PATCH membership 升为 Project admin）。ezreal 一般已是 Project admin，不必再邀。

指派：

| 工作包 | 指派 |
|---|---|
| 版本计划、PM、PM 三件套、开发 Phase | ezreal PM |
| 模块 Phase | 该模块服务端负责人；无服务端则用第一个已建端口的人 |
| 端侧 Task | 该端口在 `投入人力` 里的人 |
| QA Phase、QA 四件套、BUG目录、BUG 三环境 | **一律 ruby QA（id=13）**。排期测试是 `xxx` / 空 / 别人：仍指派 Ruby，不要空着、不要猜 kaio |

## 执行流程

1. 读 `排期表` + 表底时间；`GET` 项目，确认 Phase/Task；拉已有工作包看缺什么。
2. **先发中文预览树**（模块合并结果、端口、日期、工时、指派人、待补项），等用户说可以建。用户写「直接建 / 请同步 / 按这个补」可跳过等待。
3. 先邀请 → 再按「创建顺序」建或补。Phase 必须 `typeId=3`；`create_work_package` 写不出 Phase 时用 `raw_api_call` `POST /api/v3/projects/{id}/work_packages`。
4. `list_work_packages` **必须带项目 filter**，不要拉全站。核对：数量、父子、端口、**QA 四件套**、**BUG 三环境顺序**、日期、叶子工时。
5. 把待补日期 / 待指派人列给用户，回复项目链接。

预览示例：

```
项目：--v2.27.0 直播预告&人气热度配置 (#134)
固定项：版本计划 / PM×3 / QA×4（测试用例·DEV·STG·PROD）/ BUG：DEV→STG→PROD
开发模块（同名已合并）：
- 直播预告 → 服务端、IOS、安卓、H5
- 人气热度 → 服务端、IOS、安卓、H5
QA/BUG 受理人：ruby QA（Project admin）
```

## 工具

- 排期：`user-google-sheets` `get_sheet_data`，`sheet=排期表`
- OP：`user-openproject`（`raw_api_call` / `create_work_package` / `list_work_packages`）
- 实例：`https://op-dev.890wei.com/`
