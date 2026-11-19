import { resolvePublicSiteUrl } from '../utils/site-url';

/**
 * 爬虫策略。两类 bot 分开决策：
 *
 * - 搜索型（含 OAI-SearchBot）允许抓取，它们是 SEO/GEO 的可见性来源；
 * - 训练型（GPTBot）默认也允许——这个站是公开原创博客，希望内容能被引用，
 *   但要留下一条显式声明，将来想单独收紧时改这里一处即可，不必翻遍文档。
 *
 * `/api/` 与 `/admin/` 对搜索引擎没有价值，统一禁掉。
 */
export default defineEventHandler((event) => {
  const siteUrl = resolvePublicSiteUrl(event);
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
});
