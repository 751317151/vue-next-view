# BlackStar Blog · 生活倒影

一个温暖、有趣的个人博客。公开站点由 Nuxt 4 提供 SSR、SWR 和 Nitro Server Routes，
为读者、搜索引擎和生成式引擎交付同一份可抓取的 HTML。

## 常用命令

```bash
npm install

npm run dev        # Nuxt 开发服务器（公开站点）
npm run build      # Cloudflare Pages 自动分流构建，产物在 dist/
npm run build:cf   # 明确构建 Nuxt 主站
npm run build:vite # 明确构建旧版 Vite SPA
npm run preview    # 预览 Nuxt 产物
```

历史 Vite 单页应用仍保留在 `src/`，只用于兼容和对照：

```bash
npm run dev:vite
npm run build:vite
```

### 两个 Pages 项目的构建分流

仓库同时连接两个 Cloudflare Pages 项目。二者都会执行 `npm run build`，因此
`scripts/pages-build.mjs` 会根据 Pages 自动注入的 `CF_PAGES_URL` 判断部署目标：

| Pages 项目 | 构建命令 | 产物 |
| --- | --- | --- |
| `vue-next-view` | `npm run build:cf` | Nuxt 4 + Nitro，输出到 `dist/` |
| `vue-next-view-spa` | `npm run build:vite` | 旧版 Vite SPA，输出到 `dist/` |

本地直接运行 `npm run build` 时默认构建 Nuxt。若要在控制台显式指定，可设置
`PAGES_TARGET=nuxt` 或 `PAGES_TARGET=spa`；它优先于自动判断。用
`node scripts/pages-build.mjs --dry-run` 可以只查看将执行的目标，不启动构建。

## 内容源

文章直接写在 `content/articles/*.md`，`nuxt.config.ts` 通过 Nitro serverAssets
把它们打包进构建，因此开发和生产读取的是同一份 Markdown，不再依赖 Mock 数据。
frontmatter 约定：

```yaml
---
title: 文章标题               # 必填
date: 2024-05-20             # 必填，YYYY-MM-DD
updatedAt: 2024-06-11        # 选填，不能早于 date
category: 前端架构
tags: [Nuxt, SEO]
slug: nuxt4-seo-checklist    # 选填；缺省用文件名
id: 1                        # 选填；保留旧数字链接时使用
draft: true                  # 选填；草稿不会进入列表、RSS、sitemap 或 llms.txt
summary: 一句话摘要
---
```

缺少标题或日期、日期格式错误、slug / id 重复都会让构建直接失败，而不是让一篇
坏文章悄悄以“今天”的日期上线。

比文章更轻的日常记录写在 `content/glints/*.md`，同样由 Nitro serverAssets
打包，会出现在首页、`/glints`、RSS、sitemap 和 llms.txt 里：

```yaml
---
title: 傍晚沿着河边慢慢走       # 必填，同时用来生成锚点 slug
summary: 一句话摘要             # 选填，列表和订阅源优先使用
date: 2026-11-18               # 必填，YYYY-MM-DD
emoji: 🌇                       # 选填，默认 ✦
---
```

正文必填；日期晚于今天的微光不会提前公开。每条微光都有独立永久链接
`/glints/<slug>`；旧的 `/glints#slug` 仍可直接定位并展开对应的一条。微光列表默认以「拾光年历」
按月浏览，也可切换回完整的纸带清单。

`/about` 的「创作年轮」同样不是手工维护的统计图：它直接从文章与微光的真实
日期计算每月更新量、分类数和字数，`ProfilePage` 结构化数据也带同一组数字。
新增内容、改日期或补一则微光后，年轮会跟着一起生长。

`/desk` 的空书桌不是一句占位提示，而是三步可操作的新手引导：翻开一篇、
收进一颗星、夹下一句话。三步与三个抽屉一一对应，有任一真实记录后自动隐藏。

`/friend` 是一本带书脊和姓名封印的「友人帐」：每条友链占一页，悬停时页码会
翻到那一页；右侧的友链名片可一键复制，方便对方直接把本站加进自己的友人帐。

`/archive` 是统一的长文与微光时光档案：两类内容按日期交错，可按类型筛选、
按年份速跳；页面上的 `ItemList` 也同时指向文章和微光的永久链接。

首页三图手势从指针“进入点”起算：从屏幕外直接落在左侧或右侧时先保持中间图，
只有进入后真实横向移动才逐步揭开侧图；中间图同步轻移，移出后回到中景。

## Nuxt public content boundary

- `content/articles/`：真实的 Markdown 内容源。
- `content/glints/`：微光短记录，和文章共用内容校验与构建失败策略。
- `server/repositories/`：生产数据访问边界，读取 content layer，仅在内容目录为空时回退到种子数据。
- `server/api/`：文章、微光、分类、标签、搜索和健康检查接口。
- `server/routes/`：robots、Sitemap、RSS、llms.txt。
- `src/seo/metadata.ts`：框架无关的文章 SEO 和 JSON-LD 契约。
- `nuxt/pages/`：SSR 页面和内部链接结构。

## Before switching production to Nuxt

```bash
npm run release:check
```

The public origin comes from the committed `.env`, so no shell variable is
needed. `release:check` validates the scaffold, the environment files and the
types, builds with the Cloudflare preset, then checks the crawler files that
build produced. A Nuxt production build refuses to run without a public origin,
so canonical URLs and `og:url` can never quietly point at `localhost`.

Then inspect the public pages by hand: initial HTML, canonical, JSON-LD,
sitemap, RSS, robots, a JavaScript-disabled visit, and Lighthouse scores.

## Cloudflare Pages deployment

The repository pins the runtime with `.node-version` (22.23.4), `engines.node`
(>=22.12.0) and `wrangler.toml` (`NODE_VERSION = "24.15.0"`). Set
`NODE_VERSION` in the Pages project environment variables to match
`wrangler.toml` so the build image cannot fall back to an unsupported Node.

### Option A: SSR pages (recommended)

Runs the Nuxt server on Cloudflare's edge runtime, so `?q=` search, SWR article pages and the API routes work for real:

- Build command: `npm run build:cf`
- Output directory: `dist`
- Required variable: `NUXT_PUBLIC_SITE_URL=https://your-domain.example`

The Nitro `cloudflare_pages` preset emits `dist/_worker.js` plus `dist/_routes.json`; prerendered pages (home, archive, crawler files) are served statically and everything else is handled by the worker. `wrangler.toml` at the repo root pins `nodejs_compat`.

The origin is read from the committed `.env`. Nuxt loads that file while
building — on your machine and on Pages alike — so no dashboard variable is
needed, and anything set in the Cloudflare dashboard or the shell still wins.

`wrangler.toml [vars]` is kept in sync, but note it is a **runtime** binding for
Functions and does not satisfy the build-time check on its own.

### Shared message board (optional D1 database)

The default configuration leaves the D1 binding commented out. The site can be
deployed without a database, and the message board stores messages only in each
visitor's browser. To enable messages shared by all visitors:

1. Log in to Cloudflare and create the database:

   ```bash
   npx wrangler login
   npx wrangler d1 create blackstar-messages
   ```

   If the database already exists, run `npx wrangler d1 list` to find its UUID
   instead of creating another one.

2. Uncomment the four-line `[[d1_databases]]` block in `wrangler.toml`. Keep
   `binding = "MESSAGE_DB"`, set `database_name` to the database's actual name,
   and replace `<D1_DATABASE_UUID>` with the real database UUID. An active binding
   with an empty or placeholder `database_id` causes Function publishing to fail
   with `Invalid database UUID`, even if the build and asset upload succeed.
   The Wrangler file is the source of truth for Pages bindings; configure the
   database there when deploying this repository.

3. Initialize the remote database tables (use the actual name if it differs):

   ```bash
   npx wrangler d1 execute blackstar-messages --remote --file server/database/schema.sql
   ```

   For local development, use `--local` instead of `--remote`.

4. Redeploy the Pages project, then request `/api/messages`. A working database
   returns `shared: true`; `shared: false` means the message board is using its
   local fallback because the binding is missing or the database query failed.

### Environment file convention

`.env`, `.env.development` and `.env.production` are committed, so treat their
contents as public. Only `.env` is loaded by `nuxt build`; `.env.production` is
read by Vite, not Nuxt, so a value placed there alone will fail on CI while
looking correct in the repository.

Put real credentials in a `*.local` file (gitignored) or in the Cloudflare
dashboard. `npm run validate:env` runs inside the release gate and fails if a
credential-shaped value appears in a committed file.

### Option B: static pages

Legacy Vite app without SSR:

- Build command: `npm run build:with-seo`
- Output directory: `dist`

This generates the crawler files from `SITE_URL`, copies them into `dist`, and
validates the copy.

### One build owns dist

Both paths publish to `dist/`, and each clears the other's output. Never deploy
a directory left behind by two consecutive builds of different targets.

