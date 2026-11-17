# 郑州新郑国际机场货运航班动态

一个纯中文的单页航班动态网站，数据来自郑州新郑国际机场货运站公开航班动态页面。支持全量同步、组合筛选、全局搜索、机型两级筛选、可配置列、分页、xlsx 导出，以及 30 分钟自动刷新和手动强制刷新。

- 公开站点：待 Qoder 后端配额可用并完成发布后，由平台分配公开链接
- 源码仓库：https://github.com/liwei3699/ZHCC_Cargo_Flight_Tracker_Web
- 数据源：https://www.zzcargo.com/airline/1

> **部署状态（2026-11-17）**：当前 Qoder 账户的 `backend_sites` 配额为 `0/0`，只能发布静态站点，无法启用 `database` 与 `functions`。前端、Edge Function、数据库迁移、测试和本地 643 条真实数据联调均已完成；Qoder Sites 线上发布待账户升级并启用后端后继续。没有发布缺少后端的残缺静态站点。

## 功能

- 全量同步源站当前所有分页（当前约 59 页、643 条，源站数据范围通常为当天至后两天）。
- 源站 6 项筛选：航班号、航班日期、进出港、代理、始发站、目的站。
- 全局关键字搜索：航班号、航司、机场、机号、机位、航线代码。
- 状态、国内/国际/地区/混合、日期快捷筛选。
- 机型两级筛选：大类（波音737、波音747、空客A320、中国商飞等）+ 小类（733、738、738M、320NEO 等）。
- 可配置列，默认 8 列，支持所有扩展字段；偏好保存在浏览器 localStorage。
- 默认按航班日期降序、同日按计划起飞时间升序；所有列头可点击排序。
- 每页 10/20/50/100 条，支持跳页。
- 当前筛选和排序结果全部导出为 xlsx，共 30 列；前 9 列与 `example.xlsx` 一致。
- 30 分钟自动刷新；手动刷新强制同步源站，30 秒全局冷却。
- 源站失败时保留最近一次成功快照并明确提示，不伪造数据。
- 桌面表格、移动端记录卡。

## 技术栈

- React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + shadcn/ui
- Qoder Sites Edge Function（Deno）
- Qoder Sites 数据库（Function 后端，单行 JSONB 快照）
- ExcelJS
- Vitest + Testing Library

## 目录

```text
.
├─ src/                 # 页面入口、App、全局样式
├─ components/          # 页面组件与已有的 shadcn/ui 组件
├─ hooks/               # use-flights、use-mobile
├─ lib/                 # 类型、筛选、排序、格式化、列目录、导出、API 客户端
├─ functions/           # Edge Function：index.ts、routes.mjs、lib/*
├─ dev/                 # 本地 Function、fake DB、裁剪夹具
├─ tests/               # 函数、纯逻辑、Hook、组件测试
├─ scripts/             # 构建检查、真实源站校验、夹具生成
├─ schema.sql           # 两张数据库表的迁移 SQL
├─ docs/superpowers/specs/  # 设计文档
└─ dist/                # 构建产物，不提交
```

## 本地开发

Node 需要 `^22.13.0 || >=24.0.0`。在工程目录执行：

```bash
npm install
npm test
npm run dev:api
npm run dev
```

仓库为精简源码，未提交 `package-lock.json`；首次 `npm install` 会生成锁文件。

`npm run dev:api` 在 `127.0.0.1:8000` 启动本地 Function，默认读取 `dev/fixtures/flights.sample.json` 的 40 条裁剪数据；手动刷新会访问真实源站并更新内存快照。`npm run dev` 启动 Vite，开发服务器会把 `/functions/v1/app` 代理到本地 Function。

构建：

```bash
npm run build
npm run preview
```

真实源站一次性校验（会抓取全部 59 页，不写入数据库）：

```bash
node scripts/verify-source.mjs
```

## Qoder Sites 发布

1. 构建 `dist/`，使用 `open_design_workbench` 注册站点设计入口（Airtable 风格，页面 `/`，能力 appearance/radius/spacing/typography/motion）。
2. 先用静态引导草稿 `prepare_site`（新建站点，不含 Function/数据库），保留返回的 Project/Site ID，不发布该引导草稿。
3. 调用 `ensure_backend` 启用 `database` 和 `functions`，`databaseAccessModel=function_backend`。
4. 通过 `get_database_schema` 获取 `schemaRef`，用 `schema.sql` 创建两张表；迁移 `accessPolicies=[]`，由 Function 后端持有访问策略。
5. 用同一 Project ID 准备完整版本：`webDirectory=dist`、`functionDirectory=functions`、`databaseAccess=read_write`、已验证的 `schemaRef`。
6. 调用 `publish_site` 并确认 `published=true`。发布预览不执行 Function，函数行为以公开站点为准。

`.qoder.site` 由 Sites 工具生成，不提交到仓库；不需要业务 Secret。

## 数据与缓存

- 航班列表接口：`POST https://www.zzcargo.com/flightDynamic/skipTo`，每页固定 11 条。
- 航司列表接口：`POST https://www.zzcargo.com/airline/airlineTwo`，当前 5 页、49 家。
- 同步并发 6，单页超时 15 秒、重试 2 次，总截止 25 秒。
- 快照 TTL 30 分钟；手动刷新 30 秒全局冷却；失败退避 2 分钟；同步租约 2 分钟。
- 航司库每天最多刷新一次；失败时回退上次映射或代码。
- 部分失败不写入半成品；源站失败时返回最近一次成功快照。

## xlsx 导出

- 导出当前筛选和排序后的全部行，不受分页限制。
- 列顺序：示例 9 列（航班信息、起飞机场、降落机场、计划起飞、实际起飞、计划降落、实际降落、航班日期、航班状态）+ 21 个扩展列，共 30 列。
- 时间/日期写为真正的 Excel 数值；缺失值留空；表头加粗、冻结首行、自动筛选。
- 文件名带北京时间戳；工作表名“航班动态”。
- 浏览器端使用 ExcelJS 动态加载生成，不经过服务端。

## 已知限制

- 源站航司库只覆盖 49 家，未收录的货航/外航（如 GI、O3、CV、5Y、CF、K4）显示航司代码，不猜测全称。
- 源站数据范围由源站决定，当前为当天至后两天；不做历史归档。
- 首屏首次全量同步约 6–12 秒；后续命中缓存。
- Qoder Edge 出口是否被源站 WAF/地域限制需要在发布后实测；若被拦截，保留缓存并报告，不伪造数据。
- 阿里云备用数据代理未纳入首版实现。
- 数据仅供参考，以机场/航司官方信息为准。

## 参考文件

工作区的 `download.devtools`、`web_ui.jpg`、`example.xlsx` 是本地参考材料，不进入 GitHub 仓库；完整源站快照也不提交。
