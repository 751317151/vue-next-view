import { articleRepository } from '../repositories/article-repository';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl || getRequestURL(event).origin).replace(/\/$/, '');
  const now = new Date().toUTCString();
  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600');
  const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const formatDate = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? now : parsed.toUTCString();
  };
  const items = (await articleRepository.list()).map((article) => `\n<item><title>${escapeXml(article.articleTitle)}</title><link>${siteUrl}/article/${article.slug}</link><guid>${siteUrl}/article/${article.slug}</guid><pubDate>${formatDate(article.createTime)}</pubDate><description>${escapeXml(article.articleContent)}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>生活倒影</title><link>${siteUrl}</link><description>记录技术成长，分享编程心得与生活灵感。</description><pubDate>${now}</pubDate>${items}</channel></rss>`;
});
