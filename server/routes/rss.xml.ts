import { resolvePublicSiteUrl } from '../utils/site-url';
import { articleRepository } from '../repositories/article-repository';
import { articleSummary } from '../utils/article-summary';

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** XML text nodes and attributes cannot carry a literal `]]>`, so split it. */
const cdata = (value: string) => `<![CDATA[${value.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

/** `YYYY-MM-DD` -> RFC 822 at UTC midnight, so every build produces the same feed. */
const rfc822 = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toUTCString() : parsed.toUTCString();
};

export default defineEventHandler(async (event) => {
  const siteUrl = resolvePublicSiteUrl(event);
  const articles = await articleRepository.list();
  const latest = articles.reduce(
    (current, article) => (article.updateTime || article.createTime) > current ? (article.updateTime || article.createTime) : current,
    '',
  );
  // A feed's channel date should describe the newest story, not the moment the
  // build happened; a rebuild without new content must not look like news.
  const channelDate = rfc822(latest || '2024-01-01');

  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600');

  // Feed readers expect percent-encoded URLs. encodeURI leaves `#`/`?` intact,
  // so encode each path segment to keep every slug addressable.
  const articleUrl = (slug: string) => `${siteUrl}/article/${slug
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

  const items = articles.map((article) => {
    const url = escapeXml(articleUrl(article.slug));
    const description = escapeXml(articleSummary(article, 220));
    const contentHtml = article.contentHtml || '';
    const categories = (article.tags || [])
      .map((tag) => `<category>${escapeXml(tag)}</category>`)
      .join('');
    return [
      '<item>',
      `<title>${escapeXml(article.articleTitle)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${rfc822(article.createTime)}</pubDate>`,
      `<description>${description}</description>`,
      `<content:encoded>${cdata(contentHtml)}</content:encoded>`,
      categories,
      `<dc:creator>BlackStar</dc:creator>`,
      '</item>',
    ].join('');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    '<title>生活倒影</title>',
    `<link>${escapeXml(siteUrl)}</link>`,
    `<atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    '<description>记录技术成长，分享编程心得与生活灵感。</description>',
    '<language>zh-CN</language>',
    `<pubDate>${channelDate}</pubDate>`,
    `<lastBuildDate>${channelDate}</lastBuildDate>`,
    items,
    '</channel>',
    '</rss>',
  ].join('\n');
});
