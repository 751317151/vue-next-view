# Nuxt 4 migration blueprint

This project can keep Vue as its UI layer while moving the delivery model from a client-only Vite SPA to Nuxt 4. The migration should preserve the current visual system and route semantics, then improve the server-rendered HTML that search engines and AI crawlers consume.

## Target shape

- `pages/index.vue`: home and article feed
- `pages/article/[slug].vue`: server-rendered article detail; keep `/article/:id` as a compatibility redirect during migration
- `pages/categories/index.vue` and `pages/categories/[id].vue`
- `pages/tags/index.vue` and `pages/tags/[id].vue`
- `pages/archive.vue`, `pages/about.vue`, `pages/friend.vue`, `pages/message.vue`
- `components/client/`: Live2D, canvas, mouse effects, image preview, and other browser-only features
- `server/api/`: article, comment, search, stats, and authentication endpoints
- `server/routes/sitemap.xml.ts`: generated sitemap with canonical article URLs
- `server/routes/robots.txt.ts`: environment-aware robots policy

## Rendering policy

| Route type | Rendering | Reason |
| --- | --- | --- |
| Home, archive, categories, tags | SSG or cached SSR | Stable public content and fast discovery |
| Article detail | SSR or ISR | Full article HTML must exist in the initial response |
| Comments, likes, search suggestions | Client requests | Interactive and frequently changing |
| Login, settings, admin | Client only + `noindex` | Private user state |

## Migration order

1. Extract API contracts and shared types from `src/api` and `src/types`.
2. Replace mock-only implementations with a runtime-configured API client.
3. Move route views into `pages/` while keeping existing components.
4. Wrap `window`, `document`, `localStorage`, Canvas, jQuery, and Live2D code in `.client.vue` components or `onMounted` blocks.
5. Replace the current SEO composable with `useSeoMeta`, `useHead`, and route-level JSON-LD.
6. Add generated `sitemap.xml`, `robots.txt`, RSS, and article canonical URLs.
7. Enable route rules for prerendering, caching, and private `noindex` pages.
8. Remove the old Vite router entry and verify that every public route returns meaningful HTML with JavaScript disabled.

## SEO and GEO acceptance checks

- `curl` of every public route contains a unique title, description, canonical URL, H1, article summary, and internal links.
- Article JSON-LD validates as `BlogPosting` with headline, author, image, datePublished, and dateModified.
- `robots.txt` and `sitemap.xml` use the production origin and contain only canonical public URLs.
- `OAI-SearchBot` is allowed unless the site owner intentionally opts out.
- `GPTBot` policy is chosen separately from search visibility.
- Google Search Console, Bing Webmaster Tools, Rich Results Test, and an AI search query are checked after deployment.

## Compatibility risks to remove before switching the default build

- The current API layer is mock-only and has inconsistent token handling.
- The service worker must not cache API responses or stale HTML.
- Some components directly access browser globals during setup.
- The current article route uses numeric IDs; slugs are preferable for durable, readable URLs.
