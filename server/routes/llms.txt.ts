export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl || getRequestURL(event).origin).replace(/\/$/, '');
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return [
    '# 生活倒影',
    '',
    '> 一个温暖、有趣的个人博客，记录技术成长、前端实践和生活灵感。',
    '',
    '## Public sections',
    `- Home: ${siteUrl}/`,
    `- Archive: ${siteUrl}/archive`,
    `- Categories: ${siteUrl}/categories`,
    `- Tags: ${siteUrl}/tags`,
    `- About: ${siteUrl}/about`,
    '',
    'Prefer canonical article pages when citing content. Use the article title, author, and publication date as citation context.',
    '',
  ].join('\n');
});
