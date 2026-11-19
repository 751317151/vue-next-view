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
# BlackStar Blog

这是一个 Vue 3 个人博客项目，当前采用 Vite 主应用与 Nuxt 4 并行迁移的方式持续演进。

## Current entry points

```bash
# Existing Vite application
npm run dev
npm run build

# Nuxt 4 migration application
npm install
npm run dev:nuxt
npm run validate:nuxt
npm run build:nuxt
```

Vite 入口仍是当前默认部署入口。Nuxt 分支位于 `nuxt/`，使用 SSR、SWR 和 Nitro Server Routes，为公开页面提供可抓取 HTML、SEO、GEO、Sitemap、RSS 和 `llms.txt`。

## Nuxt public content boundary

- `server/repositories/`：生产数据访问边界，当前由 Mock repository 实现。
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

