import { articleRepository } from '../../repositories/article-repository';
import type { PublicArticleRecord } from '../../utils/public-articles';

export default defineEventHandler(async (): Promise<Omit<PublicArticleRecord, 'content'>[]> => (await articleRepository.list()).map((article) => ({
  id: article.id,
  slug: article.slug,
  articleTitle: article.articleTitle,
  articleContent: article.articleContent,
  articleCover: article.articleCover,
  createTime: article.createTime,
  // Keep the real edit date: cards, JSON-LD `dateModified` and the sitemap
  // should all agree on when a story last changed.
  updateTime: article.updateTime || article.createTime,
  category: article.category,
  tags: article.tags,
  // Author-written (or derived) summary travels with the list so cards show the
  // same sentence as the detail page and llms.txt instead of re-excerpting.
  summary: article.summary,
})))
