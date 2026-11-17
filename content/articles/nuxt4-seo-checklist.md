---
title: Nuxt 4 上线前，我给博客做的 SEO 检查清单
category: 前端架构
tags: [Nuxt, SEO, GEO]
date: 2024-05-20
updatedAt: 2024-06-11
---

纯客户端渲染的 SPA 对爬虫总是多一层不确定。把博客迁到 Nuxt 4 之后，我按这份清单逐项过了一遍，上线前心里就有底了。

## 初始 HTML 必须自证

禁用 JavaScript，打开任意文章页，HTML 里应该直接有：

1. 唯一的 `<h1>` 和正文
2. 正确的 canonical
3. `BlogPosting` 与 `BreadcrumbList` 结构化数据

## 爬虫文件的唯一来源

`robots.txt`、`sitemap.xml`、`rss.xml` 只能有一个权威来源。如果静态占位文件和 Nitro 路由同时存在，预渲染产物会覆盖动态路由——这是我在真实部署里踩过的坑。

## 搜索页不要预渲染

`/search?q=xxx` 这种依赖 query 的页面一旦被预渲染，所有用户拿到的都是空状态。给它显式配置 `prerender: false`，让运行时 SSR 接管。

```ts
// nuxt.config.ts
routeRules: {
  '/search': { prerender: false },
}
```

## 上线后还要做

- 提交 Sitemap 到 Google、Bing 和百度
- 确认 CDN 和 Service Worker 不会给爬虫发旧 HTML
- 允许 `OAI-SearchBot`，让它能抓到全文

> SEO 不是上线前的突击，而是内容架构的一部分。结构清晰的文章，无论给搜索引擎还是给 AI 引用，都更容易被理解。
