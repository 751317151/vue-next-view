# SEO / GEO release checklist

## Before deployment

- Set the final HTTPS origin in `NUXT_PUBLIC_SITE_URL` for Nuxt, or `VITE_SITE_URL` for the legacy Vite build. A Nuxt production build now **refuses to run** without it, because a silent build would bake `http://localhost` into every canonical and `og:url`. Set `NUXT_ALLOW_LOCAL_ORIGIN=1` only for a throwaway local build.
- Run the whole gate in one command. It checks the scaffold and types, builds with the Cloudflare preset, then validates the crawler files it actually produced:

  ```powershell
  $env:NUXT_PUBLIC_SITE_URL = "https://your-domain.example"
  npm run release:check
  ```

- `npm run validate:seo` inspects `dist/`, the directory both build paths publish to. It fails on a local origin, a non-HTTPS `<loc>`, a placeholder feed, or an unencoded CJK URL, so it can only pass when the artifact a crawler receives is correct.
- For a Vite release use `npm run build:with-seo`; it generates into the gitignored `public-seo/`, copies it into `dist/`, and validates the copy. Keep these files out of `public/`: Nuxt serves the same URLs from Nitro routes, and static copies would shadow them during prerendering.
- When an article index JSON is available, pass `SEO_ARTICLES_FILE=path/to/articles.json` so article URLs are included in the sitemap and RSS feed.
- Only one build may own `dist/` at a time. `build` (Vite) and `build:cf`/`build:nuxt` (Nuxt) both write there and each clears the other's output, so never deploy the directory left behind by two consecutive builds.
- Category and tag URLs are derived from their display name, not their position in the article list, so publishing a new category never renumbers the existing ones. Numeric legacy URLs 301 to the canonical slug.

- Confirm every public route has a stable title, description, canonical URL and one visible H1.
- Confirm article pages include `BlogPosting` and `BreadcrumbList` JSON-LD; the site shell adds `WebSite` and `Person`.
- Confirm private pages use `noindex` and are excluded from the sitemap.

## After deployment

- Submit `/sitemap.xml` to Google Search Console, Bing Webmaster Tools and Baidu where relevant.
- Verify `/robots.txt`, `/sitemap.xml`, `/rss.xml` and `/llms.txt` return 200 with absolute HTTPS URLs.
- Test an article with JavaScript disabled and inspect the initial HTML response.
- Validate JSON-LD with Google's Rich Results Test.
- Use Bing Webmaster Tools, IndexNow and Baidu link submission after publishing or updating an article.
- Check that the CDN and Service Worker do not serve stale HTML to crawlers.
- Allow `OAI-SearchBot` through the CDN/WAF; decide separately whether `GPTBot` may crawl for training.

## GEO content quality

- Put a direct answer or summary near the beginning of each article.
- Use descriptive H2/H3 headings, short paragraphs, definitions, examples and comparison tables.
- Include versions, dates, authorship and source links for technical content.
- Keep canonical URLs stable and link related articles together.
- Treat comments as community content and keep editorial claims in the main article body.
- `llms.txt` is a convenience file, not a ranking requirement: crawlable, structured HTML remains the foundation.
