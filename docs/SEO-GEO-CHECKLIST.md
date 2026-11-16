# SEO / GEO release checklist

## Before deployment

- Set the final HTTPS origin in `NUXT_PUBLIC_SITE_URL` for Nuxt, or `VITE_SITE_URL` for the legacy Vite build.
- Generate crawler files before a Vite release:

  ```powershell
  $env:SITE_URL = "https://your-domain.example"
  npm run build:with-seo
  npm run validate:seo
  ```

- `npm run generate:seo` writes into `public-seo/`, and `scripts/copy-seo-to-dist.mjs` copies the files into `dist/`. Keep these files out of `public/`: Nuxt serves the same URLs from Nitro routes, and static copies would shadow them during prerendering.
- When an article index JSON is available, pass `SEO_ARTICLES_FILE=path/to/articles.json` so article URLs are included in the sitemap and RSS feed.
- For Nuxt, set the site URL before building so prerendered files never contain `localhost`:

  ```powershell
  $env:NUXT_PUBLIC_SITE_URL = "https://your-domain.example"
  npm run build:nuxt
  ```

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
