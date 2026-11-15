import fs from 'node:fs/promises';
import path from 'node:path';

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');

if (!siteUrl) {
  throw new Error('SITE_URL is required, for example SITE_URL=https://blog.example.com');
}

if (!/^https:\/\//i.test(siteUrl)) {
  throw new Error(`SITE_URL must use HTTPS in production: ${siteUrl}`);
}

const routes = ['/', '/archive', '/categories', '/tags', '/favorite', '/travel', '/message', '/about', '/friend'];
const now = new Date().toISOString();
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

const articleRoutes = articles.map((article) => ({
  route: `/article/${article.slug || article.id}`,
  lastmod: article.updatedAt || article.updateTime || article.createTime || now,
}));
const urls = [...routes.map((route) => ({ route, lastmod: now })), ...articleRoutes]
  .map(({ route, lastmod }) => `  <url>\n    <loc>${escapeXml(siteUrl + route)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const rssItems = articles.map((article) => `    <item>\n      <title>${escapeXml(article.articleTitle || article.title || '未命名文章')}</title>\n      <link>${escapeXml(siteUrl + `/article/${article.slug || article.id}`)}</link>\n      <guid>${escapeXml(siteUrl + `/article/${article.slug || article.id}`)}</guid>\n      <pubDate>${escapeXml(article.updatedAt || article.updateTime || article.createTime || now)}</pubDate>\n      <description>${escapeXml(article.description || '')}</description>\n    </item>`).join('\n');
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>生活倒影</title><link>${siteUrl}</link><description>记录技术成长，分享编程心得与生活灵感。</description><pubDate>${now}</pubDate>\n${rssItems}\n</channel></rss>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

await fs.mkdir(path.resolve('public'), { recursive: true });
await fs.writeFile(path.resolve('public/sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(path.resolve('public/rss.xml'), rss, 'utf8');
await fs.writeFile(path.resolve('public/robots.txt'), robots, 'utf8');
console.log(`Generated sitemap.xml, rss.xml, and robots.txt for ${siteUrl} (${articles.length} articles)`);
