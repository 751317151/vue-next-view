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
npm run validate:nuxt
npm run typecheck
npm run build:nuxt


## Cloudflare Pages deployment

The repository pins the runtime with `.node-version` (22.23.4) and `engines.node` (>=22.12.0), matching Nuxt 4 and Vite 8. In the Cloudflare Pages project settings also set the environment variable `NODE_VERSION` to `22.23.4` so the build image cannot fall back to Node 18.

- Legacy Vite app (default deploy): build command `npm run build:with-seo`, output directory `dist`. Run `npm run generate:seo` with `SITE_URL` first so `dist` contains robots.txt, sitemap.xml, rss.xml and llms.txt.
- Nuxt app: build command `npm run build:nuxt` with `NUXT_PUBLIC_SITE_URL` set, output directory `.output/public` for static hosting; use a Node runtime (Cloudflare Workers) for SSR APIs and SWR routes.

# Vite release gate after setting SITE_URL and generating SEO files
npm run release:check
```

然后检查公开页面的初始 HTML、canonical、JSON-LD、Sitemap、RSS、robots、JavaScript 禁用访问和 Lighthouse 指标。
