# KK Vibe

Vue 3 + TypeScript + Vite 产品原型仓库。

## PC 后台规范

- 设计文档：[docs/PC后台设计规范.md](docs/PC后台设计规范.md)
- 共享样式：`src/styles/pc-wireframe.css`
- 标准样例：`/pc/live-commission` → `src/views/LiveCommissionConfigView.vue`
- Cursor 规则：`.cursor/rules/pc-admin-wireframe.mdc`（编辑 PC 相关文件时自动提示）

## H5 移动端规范

- 设计文档：[docs/H5移动端设计规范.md](docs/H5移动端设计规范.md)
- 共享样式：`src/styles/mobile-h5.css`
- 标准样例：壳页 `/mobile/live-start-notice`、直播 `/mobile/live`、全局通知 `LiveStartTopNotice.vue`
- Cursor 规则：`.cursor/rules/mobile-h5.mdc`

## 开发

```bash
npm install
npm run dev
```
