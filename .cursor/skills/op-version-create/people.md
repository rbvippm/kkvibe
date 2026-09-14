# OP 人员花名对照

创建前用目标项目可指派列表核对 ID，表只是默认。对不上就问，不要猜。`GET /api/v3/users` 若 403，改查 `/api/v3/principals`。

## 已确认（v2.24.1 / v2.27.0 用过）

| 排期常见写法 | OpenProject 显示名 | userId |
|---|---|---|
| ezreal / EZ | ezreal PM | 107 |
| leon / Leon | leon Golang | 34 |
| james / James | james-kk Golang | 35 |
| rain / Rain | rain H5 | 42 |
| owen / Owen | owen H5 | 44 |
| link / Link | link IOS | 70 |
| kai / Kai | peter IOS | 29 |
| bear / Bear | bear Android | 99 |
| flow / Flow | flow IOS | 56 |
| negan / Negan | kylin Android | 51 |
| pual / Pual / paul / Paul | tt-kk Go-Payment | 41 |
| kaio / Kaio | kaio QA | 97 |
| ruby / Ruby | ruby QA | 13 |
| eva / Eva | eva Golang | 60 |
| zustand / Zustand | zustand H5 | 57 |
| byran / Byran | byran Golang | 83 |

`kai` 与 `kaio` 必须整词区分，不要互相误伤。

**Ruby**：建版本时默认进项目，角色 **Project admin（`/api/v3/roles/3`）**；QA / BUG 目录及全部子项受理人一律指派给她。

## 项目里可能出现、禁止自动对花名

这些账号在可指派列表或历史版本里出现过，排期花名未确认时必须问用户：

| OpenProject 显示名 | userId | 备注 |
|---|---|---|
| claude H5 | 45 | 出现在 v2.24.0 |
