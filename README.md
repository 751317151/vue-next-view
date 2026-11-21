# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
# BlackStar Blog · 生活倒影

一个温暖、有趣的个人博客。公开站点由 Nuxt 4 提供 SSR、SWR 和 Nitro Server Routes，
为读者、搜索引擎和生成式引擎交付同一份可抓取的 HTML。

## 常用命令

```bash
npm install

npm run dev        # Nuxt 开发服务器（公开站点）
npm run build      # Cloudflare Pages 生产构建，产物在 dist/
npm run preview    # 预览 Nuxt 产物
```

历史 Vite 单页应用仍保留在 `src/`，只用于兼容和对照，不再是默认入口：

```bash
npm run dev:vite
npm run build:vite
```

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

## Nuxt public content boundary

- `content/articles/`：真实的 Markdown 内容源。
- `server/repositories/`：生产数据访问边界，读取 content layer，仅在内容目录为空时回退到种子数据。
- `server/api/`：文章、分类、标签、搜索和健康检查接口。
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

