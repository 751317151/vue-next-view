import { resolvePublicSiteUrl } from '../utils/site-url';
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
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
});
