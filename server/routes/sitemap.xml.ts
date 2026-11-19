import { resolvePublicSiteUrl } from '../utils/site-url';
import { publicCategories, publicTags } from '../utils/public-taxonomy';
import { articleRepository } from '../repositories/article-repository';

export default defineEventHandler(async (event) => {
  const siteUrl = resolvePublicSiteUrl(event);
  const routes = ['/', '/archive', '/categories', '/tags', '/about', '/friend', '/message'];
  const now = new Date().toISOString();
  const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // encodeURI leaves `#` and `?` untouched, so a slug like `note#1` would be
  // truncated into a different page. Encode each path segment instead.
  const absoluteUrl = (route: string) => `${siteUrl}${route
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
    .join('/')}`;
  const articleRoutes = (await articleRepository.list()).map((article) => ({ route: `/article/${article.slug}`, lastmod: article.createTime }));
  const categoryRoutes = (await publicCategories()).map((category) => ({ route: `/categories/${category.slug}`, lastmod: now }));
  const tagRoutes = (await publicTags()).map((tag) => ({ route: `/tags/${tag.slug}`, lastmod: now }));
  const body = [...routes.map((route) => ({ route, lastmod: now })), ...articleRoutes, ...categoryRoutes, ...tagRoutes]
    .map(({ route, lastmod }) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc><lastmod>${escapeXml(lastmod)}</lastmod></url>`)
    .join('');
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600');
  setResponseHeader(event, 'Last-Modified', new Date(now).toUTCString());
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
});
