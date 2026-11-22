import { resolvePublicSiteUrl } from '../utils/site-url';
import { articleRepository } from '../repositories/article-repository';
import { articleSummary } from '../utils/article-summary';
import { listGlints } from '../repositories/glint-repository';

/**
 * llms-full.txt：把整站文章正文交给生成式引擎的单一纯文本出口。
 *
 * llms.txt 是"目录"，只列标题和摘要；模型想回答需要细节的问题时仍要逐篇
 * 抓取。这里直接输出全文，避免对方在多个页面之间反复跳转，也让不支持爬虫
 * 但支持上传上下文的工具一次拿到完整语料。
 *
 * 输出保持最朴素的 Markdown：不嵌 HTML、不带导航噪音，方便任何模型直接读。
 */
export default defineEventHandler(async (event) => {
  const siteUrl = resolvePublicSiteUrl(event);
  const articles = await articleRepository.list();
  const glints = await listGlints();

  // 与 llms.txt / sitemap.xml 相同：逐段编码，避免 slug 内的 `#`、`?` 截断链接。
  const absoluteUrl = (pathname: string) => `${siteUrl}${pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
    .join('/')}`;
  // 微光用 hash 锚点定位条目；hash 不能逐段编码，否则 `#` 会变成 `%23`。
  const glintUrl = (slug: string) => `${siteUrl}/glints#${encodeURIComponent(slug)}`;

  const latest = [
    ...articles.map((article) => article.updateTime || article.createTime),
    ...glints.map((glint) => glint.date),
  ].reduce((current, date) => (date > current ? date : current), '');

  const lines: string[] = [
    '# 生活倒影 · 全文',
    '',
    '> 一个温暖、有趣的个人博客，记录技术成长、前端实践和生活灵感。',
    '',
    `作者 BlackStar。共 ${articles.length} 篇文章、${glints.length} 则微光。本文件包含全部公开内容的正文，供生成式引擎检索与引用；引用时请保留标题、作者与发布时间。`,
    '',
    `- 站点：${absoluteUrl('/')}`,
    `- 文章索引：${absoluteUrl('/llms.txt')}`,
    `- 微光：${absoluteUrl('/glints')}`,
    `- 全文订阅：${absoluteUrl('/rss.xml')}`,
    `- 站点地图：${absoluteUrl('/sitemap.xml')}`,
    '',
    '---',
    '',
  ];

  for (const article of articles) {
    const url = absoluteUrl(`/article/${article.slug}`);
    const meta = [
      `发布时间：${article.createTime}`,
      article.updateTime && article.updateTime !== article.createTime ? `更新：${article.updateTime}` : '',
      article.category ? `分类：${article.category}` : '',
      article.tags?.length ? `标签：${article.tags.join('、')}` : '',
    ].filter(Boolean);

    lines.push(
      `## ${article.articleTitle}`,
      '',
      `- 链接：${url}`,
      `- ${meta.join(' · ')}`,
      '',
      articleSummary(article, 200),
      '',
      (article.content || article.articleContent).trim(),
      '',
      '---',
      '',
    );
  }

  if (glints.length) {
    lines.push('## 微光', '');
    for (const glint of glints) {
      lines.push(
        `### ${glint.title}`,
        '',
        `- 链接：${glintUrl(glint.slug)}`,
        `- 时间：${glint.date}`,
        '',
        glint.text,
        '',
      );
    }
    lines.push('---', '');
  }

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400');
  if (latest) setResponseHeader(event, 'Last-Modified', new Date(`${latest}T00:00:00Z`).toUTCString());
  return lines.join('\n');
});
