import { articleRepository } from '../repositories/article-repository';
import type { PublicArticleRecord } from '../utils/public-articles';

/**
 * 把查询拆成词：中文没有空格，整串匹配会把“Vue 组合式”这种输入漏掉；
 * 多词之间用 AND，既能缩小范围，又不会像 OR 那样把无关文章带进来。
 */
const tokenize = (value: string) => value
  .toLowerCase()
  .split(/\s+/)
  .map((token) => token.trim())
  .filter(Boolean);

export default defineEventHandler(async (event) => {
  const raw = String(getQuery(event).q || '').trim();
  const tokens = tokenize(raw);
  if (!tokens.length) return [];
  const phrase = raw.toLowerCase();

  return (await articleRepository.list())
    .map((article: PublicArticleRecord) => {
      const title = article.articleTitle.toLowerCase();
      const tags = (article.tags || []).join(' ').toLowerCase();
      const category = (article.category || '').toLowerCase();
      const summary = (article.summary || '').toLowerCase();
      const content = article.articleContent.toLowerCase();
      const haystack = [title, tags, category, summary, content].join(' ');

      // 每个词都必须命中，否则不算结果。
      if (!tokens.every((token) => haystack.includes(token))) return null;

      // 标题命中权重最高；标题里的整串命中再加一层，让“Nuxt 4”排在
      // 只是正文里顺带提一句的文章前面。标签和分类次之，正文兜底。
      let score = 0;
      if (title.includes(phrase)) score += 120;
      for (const token of tokens) {
        if (title.includes(token)) score += 40;
        if (tags.includes(token)) score += 25;
        if (category.includes(token)) score += 20;
        if (summary.includes(token)) score += 15;
        if (content.includes(token)) score += 5;
      }

      return { article, score };
    })
    .filter((entry): entry is { article: PublicArticleRecord; score: number } => entry !== null)
    // 同分时按发布时间从新到旧，结果顺序稳定、可解释。
    .sort((left, right) => right.score - left.score
      || (right.article.updateTime || right.article.createTime).localeCompare(left.article.updateTime || left.article.createTime))
    .map(({ article }) => {
      return {
        id: article.id,
        slug: article.slug,
        articleTitle: article.articleTitle,
        articleContent: article.articleContent,
        category: article.category,
        createTime: article.createTime,
      };
    })
    .slice(0, 40);
});
