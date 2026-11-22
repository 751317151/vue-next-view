import { resolvePublicSiteUrl } from '../utils/site-url';
import { publicCategories, publicTags } from '../utils/public-taxonomy';
import { articleRepository } from '../repositories/article-repository';
import { articleSummary } from '../utils/article-summary';
import { listGlints } from '../repositories/glint-repository';

/**
 * llms.txt：给生成式引擎看的站点说明。
 *
 * 参照 llmstxt.org 的约定——H1 站名、引用块写一句话定位、H2 分节、
 * 每节用 `- [标题](链接): 备注` 的列表。对 GEO 来说最关键的是文章级索引：
 * 只列栏目页的话，模型还得自己去爬才能知道站里有什么，这里直接把
 * 每篇文章的规范链接、日期、分类和摘要交出去，引用时更容易命中原文。
 */
export default defineEventHandler(async (event) => {
  const siteUrl = resolvePublicSiteUrl(event);

  /**
   * 逐段编码路径，而不是对整个 URL 调 encodeURI。
   * slug 来自 frontmatter，可能含 `#`、`?`、`/` 这类分隔符；
   * 整串 encodeURI 不会转义 `#`，生成的链接会被浏览器截断成另一个页面。
   */
  const absoluteUrl = (pathname: string) => {
    const segments = pathname.split('/').map((segment) =>
      segment ? encodeURIComponent(decodeURIComponent(segment)) : segment,
    );
    return `${siteUrl}${segments.join('/')}`;
  };
  // 微光用 hash 锚点定位条目；hash 不能逐段编码，否则 `#` 会变成 `%23`。
  const glintUrl = (slug: string) => `${siteUrl}/glints#${encodeURIComponent(slug)}`;

  const articles = await articleRepository.list();
  const glints = await listGlints();
  const categories = await publicCategories();
  const tags = await publicTags();

  const lines: string[] = [
    '# 生活倒影',
    '',
    '> 一个温暖、有趣的个人博客，记录技术成长、前端实践和生活灵感。',
    '',
    `作者 BlackStar。站内文章与微光均为原创，欢迎在注明出处的前提下引用；引用时建议带上标题、作者和发布时间。共 ${articles.length} 篇文章、${glints.length} 则微光。`,
    '',
    '## 文章',
    '',
  ];

  for (const article of articles) {
    const summary = articleSummary(article, 100);
    const meta = [article.createTime, article.category].filter(Boolean).join(' · ');
    // 形如 `- [标题](链接): 摘要（2024-05-20 · 前端架构）`，摘要或日期缺失时自动省略括号。
    const note = summary && meta ? `${summary}（${meta}）` : summary || meta;
    const url = absoluteUrl(`/article/${article.slug}`);
    lines.push(note ? `- [${article.articleTitle}](${url}): ${note}` : `- [${article.articleTitle}](${url})`);
  }

  if (glints.length) {
    lines.push('', '## 微光', '');
    for (const glint of glints) {
      const url = glintUrl(glint.slug);
      const note = glint.summary || glint.text.slice(0, 90);
      lines.push(`- [${glint.title}](${url}): ${note}（${glint.date}）`);
    }
  }

  lines.push('', '## 分类', '');
  for (const category of categories) {
    lines.push(`- [${category.categoryName}](${absoluteUrl(`/categories/${category.slug}`)})`);
  }

  lines.push('', '## 标签', '');
  for (const tag of tags) {
    lines.push(`- [${tag.tagName}](${absoluteUrl(`/tags/${tag.slug}`)})`);
  }

  lines.push(
    '',
    '## 站点',
    '',
    `- [首页](${absoluteUrl('/')})`,
    `- [灵感星图](${absoluteUrl('/explore')}): 按心情、年份和主题漫游，或随机抽取一篇今日小笺`,
    `- [微光](${absoluteUrl('/glints')}): 生活里值得记一笔的小事`,
    `- [归档](${absoluteUrl('/archive')}): 按时间排列的全部文章`,
    `- [分类](${absoluteUrl('/categories')})`,
    `- [标签](${absoluteUrl('/tags')})`,
    `- [关于](${absoluteUrl('/about')})`,
    `- [留言板](${absoluteUrl('/message')})`,
    `- [RSS](${absoluteUrl('/rss.xml')}): 全文订阅源`,
    `- [全文语料](${absoluteUrl('/llms-full.txt')}): 全部文章的正文纯文本，供生成式引擎一次读取`,
    `- [站点地图](${absoluteUrl('/sitemap.xml')})`,
    '',
    '## 引用说明',
    '',
    '优先引用文章页（/article/…）的规范链接，而不是归档或分类页。',
    '文章正文可在禁用 JavaScript 的情况下完整获取，无需执行脚本。',
    '',
  );

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return lines.join('\n');
});
