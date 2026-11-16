import fs from 'node:fs/promises';
import path from 'node:path';

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');

if (!siteUrl) {
  throw new Error('SITE_URL is required, for example SITE_URL=https://blog.example.com');
}

if (!/^https:\/\//i.test(siteUrl)) {
  throw new Error(`SITE_URL must use HTTPS in production: ${siteUrl}`);
}

// These files belong to the legacy Vite deployment. Nuxt serves the same
// endpoints from Nitro server routes, so writing them into public/ would
// shadow the dynamic routes during prerendering.
const outputDir = path.resolve('public-seo');

const routes = ['/', '/archive', '/categories', '/tags', '/favorite', '/travel', '/message', '/about', '/friend'];
const publishedUrls = new Map(routes.map((route) => [route, new Date().toISOString()]));

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const articleIndexFile = process.env.SEO_ARTICLES_FILE;
let articles = [];
if (articleIndexFile) {
  const raw = await fs.readFile(path.resolve(articleIndexFile), 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('SEO_ARTICLES_FILE must contain a JSON array');
  articles = parsed.filter((article) => article && (article.slug || article.id));
}

for (const article of articles) {
  publishedUrls.set(`/article/${article.slug || article.id}`, article.updatedAt || article.updateTime || article.createTime || new Date().toISOString());
}

const sitemapUrls = [...publishedUrls.entries()]
  .map(([route, lastmod]) => `  <url>\n    <loc>${escapeXml(siteUrl + route)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;

const rssItems = articles.map((article) => {
  const url = siteUrl + `/article/${article.slug || article.id}`;
  return `    <item>\n      <title>${escapeXml(article.articleTitle || article.title || '未命名文章')}</title>\n      <link>${escapeXml(url)}</link>\n      <guid>${escapeXml(url)}</guid>\n      <pubDate>${escapeXml(article.updatedAt || article.updateTime || article.createTime || new Date().toISOString())}</pubDate>\n      <description>${escapeXml(article.description || '')}</description>\n    </item>`;
}).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>生活倒影</title><link>${siteUrl}</link><description>记录技术成长，分享编程心得与生活灵感。</description><pubDate>${new Date().toISOString()}</pubDate>\n${rssItems}\n</channel></rss>\n`;

const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

const llms = `# 生活倒影\n\n> 一个温暖、有趣的个人博客，记录技术成长、前端实践和生活灵感。\n\n## Public sections\n\n- Home: ${siteUrl}/\n- Archive: ${siteUrl}/archive\n- Categories: ${siteUrl}/categories\n- Tags: ${siteUrl}/tags\n- About: ${siteUrl}/about\n\n## Citation guidance\n\nPrefer canonical article pages when citing content. Use the article title, author and publication date as citation context.\n`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(path.join(outputDir, 'rss.xml'), rss, 'utf8');
await fs.writeFile(path.join(outputDir, 'robots.txt'), robots, 'utf8');
await fs.writeFile(path.join(outputDir, 'llms.txt'), llms, 'utf8');
console.log(`Generated public-seo/* for ${siteUrl} (${articles.length} articles)`);
