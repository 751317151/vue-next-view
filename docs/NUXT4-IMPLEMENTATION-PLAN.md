# Nuxt 4 implementation plan

The Nuxt application is being migrated in parallel with the current Vite app. Nuxt uses `nuxt/` as its source directory and the official root `public/` directory. During the transition, Nitro server routes are the canonical source for `/robots.txt`, `/sitemap.xml`, `/rss.xml`, and `/llms.txt`; the existing Vite static files remain only for the current deployment.

Set both `VITE_SITE_URL` and `NUXT_PUBLIC_SITE_URL` to the same HTTPS origin during the transition so canonical URLs are identical in both applications.

## Current slices

- Public shell and animated brand layout.
- SSR homepage, archive, category, tag, search, and article routes.
- Nitro APIs for articles, categories, tags, search, and health checks.
- Server routes for robots, sitemap, RSS, and llms.txt.
- Shared SEO metadata and JSON-LD generation.
- Numeric article ID compatibility redirects to slug URLs.

## Next slices

1. Replace `server/utils/public-articles.ts` and `server/utils/public-taxonomy.ts` with the production data client.
2. Add authentication and comments as client-interactive islands.
3. Add real article Markdown rendering with an explicit HTML sanitization policy.
4. Run `npm run validate:nuxt`, `npm run build:nuxt`, `npm run typecheck`, Lighthouse, and JavaScript-disabled crawl checks before switching the default deployment.

## Dependency note

The Nuxt dependency is declared in `package.json` as part of the parallel scaffold. Run `npm install` once before using the Nuxt scripts so the lockfile reflects the new dependency; keep the existing Vite scripts as the current production entry until the Nuxt build gate passes.
