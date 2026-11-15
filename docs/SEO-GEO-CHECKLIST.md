# SEO / GEO release checklist

## Before deployment

- Set `VITE_SITE_URL` to the final HTTPS origin.
- Run `SITE_URL=https://example.com npm run generate:seo`.
- When an article index JSON is available, add `SEO_ARTICLES_FILE=path/to/articles.json` so article URLs are included.
- For the current Vite deployment, use `SITE_URL=https://example.com npm run build:with-seo` so the static discovery files are generated before bundling.
- Run `npm run validate:seo` after generation; it rejects placeholder files and non-HTTPS Sitemap/RSS URLs.

PowerShell example:

```powershell
$env:SITE_URL = "https://example.com"
npm run build:with-seo
npm run validate:seo
```
- Replace the generated static sitemap entries with article URLs when the real API is available.
- Confirm every public route has a stable title, description, canonical URL, and one visible H1.
- Confirm article pages include `BlogPosting` and `BreadcrumbList` JSON-LD.
- Confirm private pages use `noindex` and are excluded from the sitemap.

## After deployment

- Submit `/sitemap.xml` to Google Search Console and Bing Webmaster Tools.
- Verify `/robots.txt`, `/sitemap.xml`, `/rss.xml`, and `/llms.txt` return 200.
- Test an article with JavaScript disabled and inspect the initial HTML response.
- Validate JSON-LD with Google's Rich Results Test.
- Use Bing Webmaster Tools and IndexNow after publishing or updating an article.
- Check that the CDN and Service Worker do not serve stale HTML to crawlers.

## GEO content quality

- Put a direct answer or summary near the beginning of each article.
- Use descriptive H2/H3 headings and short paragraphs.
- Include versions, dates, authorship, examples, and source links for technical content.
- Keep canonical URLs stable and link related articles together.
- Treat comments as community content and keep editorial claims in the main article body.
