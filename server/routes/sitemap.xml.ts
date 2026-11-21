import { resolvePublicSiteUrl } from '../utils/site-url';
import { publicCategories, publicTags } from '../utils/public-taxonomy';
import { articleRepository } from '../repositories/article-repository';

export default defineEventHandler(async (event) => {
  const siteUrl = resolvePublicSiteUrl(event);
  // `/desk` 内容来自读者本机、且是空态落地页，没有可索引的公共内容；
  // 放进 sitemap 只会让爬虫抓到一张空书桌，所以刻意不列。
  const routes = ['/', '/explore', '/archive', '/categories', '/tags', '/about', '/friend', '/message'];
  const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // encodeURI leaves `#` and `?` untouched, so a slug like `note#1` would be
  // truncated into a different page. Encode each path segment instead.
  const absoluteUrl = (route: string) => `${siteUrl}${route
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
    .join('/')}`;
  const articles = await articleRepository.list();
  const dates = articles
    .map((article) => article.updateTime || article.createTime)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort();
  // Aggregation pages change only when their newest member changes, so deriving
  // their lastmod from content keeps the sitemap deterministic between builds.
  const newest = dates.at(-1) || '2024-01-01';
  const articleRoutes = articles.map((article) => ({
    route: `/article/${article.slug}`,
    lastmod: article.updateTime || article.createTime,
  }));
  const categoryRoutes = (await publicCategories()).map((category) => ({ route: `/categories/${category.slug}`, lastmod: newest }));
  const tagRoutes = (await publicTags()).map((tag) => ({ route: `/tags/${tag.slug}`, lastmod: newest }));
  const body = [...routes.map((route) => ({ route, lastmod: newest })), ...articleRoutes, ...categoryRoutes, ...tagRoutes]
    .map(({ route, lastmod }) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc><lastmod>${escapeXml(lastmod)}</lastmod></url>`)
    .join('');
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600');
  setResponseHeader(event, 'Last-Modified', new Date(`${newest}T00:00:00Z`).toUTCString());
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
});
