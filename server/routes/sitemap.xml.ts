import { publicCategories, publicTags } from '../utils/public-taxonomy';
import { articleRepository } from '../repositories/article-repository';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl || getRequestURL(event).origin).replace(/\/$/, '');
  const routes = ['/', '/archive', '/categories', '/tags', '/about', '/friend'];
  const now = new Date().toISOString();
  const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const articleRoutes = (await articleRepository.list()).map((article) => ({ route: `/article/${article.slug}`, lastmod: article.createTime }));
  const categoryRoutes = publicCategories().map((category) => ({ route: `/categories/${category.slug}`, lastmod: now }));
  const tagRoutes = publicTags().map((tag) => ({ route: `/tags/${tag.slug}`, lastmod: now }));
  const body = [...routes.map((route) => ({ route, lastmod: now })), ...articleRoutes, ...categoryRoutes, ...tagRoutes]
    .map(({ route, lastmod }) => `  <url><loc>${escapeXml(siteUrl + route)}</loc><lastmod>${escapeXml(lastmod)}</lastmod></url>`)
    .join('');
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600');
  setResponseHeader(event, 'Last-Modified', new Date(now).toUTCString());
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
});
